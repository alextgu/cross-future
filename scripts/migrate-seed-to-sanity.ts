import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const sourceNames = ["default", "nexus", "assembly"] as const;
const documentTypes = [
  "edition", "person", "organization", "appearance", "track", "session",
  "partner", "summitDocument", "interview",
] as const;
const importOrder = [
  "edition", "person", "organization", "track", "appearance", "session",
  "partner", "summitDocument", "interview",
] as const;

type SourceName = (typeof sourceNames)[number];
export type DocumentType = (typeof documentTypes)[number];
type RawRow = Record<string, any>;
type SeedFile = Partial<Record<string, RawRow[]>>;

export type SeedSources = Record<SourceName, SeedFile>;

type Reference = {
  field: string;
  type: DocumentType;
  migrationKey: string;
  many?: boolean;
};

type Media = {
  field: string;
  sourceUrl: string;
  alt: string;
  caption?: string;
  credit?: string;
  aspect?: string;
  focalPoint?: { x: number; y: number };
};

export type NormalizedDocument = {
  type: DocumentType;
  migrationKey: string;
  payload: Record<string, any>;
  references: Reference[];
  media: Media[];
};

export type MigrationClient = {
  fetch<T>(query: string, params?: Record<string, string>): Promise<T>;
  assets: {
    upload(kind: "image", source: Buffer, options?: { filename?: string }): Promise<{ _id: string }>;
  };
  create(document: Record<string, unknown>): Promise<{ _id: string }>;
  patch(id: string): { set(document: Record<string, unknown>): { commit(): Promise<{ _id: string }> } };
};

export type MigrationResult = {
  counts: Partial<Record<DocumentType, number>>;
  imageCount: number;
  validationErrors: string[];
  created: number;
  updated: number;
};

export type MigrationOptions = {
  sources?: SeedSources;
  client?: MigrationClient;
  dryRun?: boolean;
  only?: DocumentType;
  readImage?: (sourceUrl: string) => Promise<Buffer>;
};

function isRecord(value: unknown): value is RawRow {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function meaningful(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.values(value).some(meaningful);
  return true;
}

function mergeValues(lower: unknown, higher: unknown): unknown {
  if (!meaningful(higher)) return lower;
  if (!isRecord(lower) || !isRecord(higher)) return higher;
  const merged: RawRow = { ...lower };
  for (const key of new Set([...Object.keys(lower), ...Object.keys(higher)])) {
    merged[key] = mergeValues(lower[key], higher[key]);
  }
  return merged;
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "seed";
}

function sourceSlug(row: RawRow, type: DocumentType, suffix = ""): string {
  const slug = typeof row.slug === "string" && row.slug
    ? slugify(row.slug)
    : type === "session"
      ? slugify(`${row.code ?? "session"}-${row.title ?? ""}`)
      : type === "interview"
        ? slugify(`${row.person ?? "interview"}-${row.code ?? row.title ?? ""}`)
        : slugify(String(row.code ?? row.title ?? row.name ?? row.label ?? "seed"));
  return `${slug}${suffix}`;
}

function migrationKeyFor(type: DocumentType, row: RawRow): string {
  if (type === "appearance") return `appearance:${slugify(`${row.edition}-${row.person}-${row.roleTitle}`)}`;
  if (type === "summitDocument") return `summit-document:${slugify(`${row.type}-${row.title}`)}`;
  if (type === "session") return `session:${slugify(String(row.code ?? row.slug ?? row.title ?? "session"))}`;
  return `${type}:${sourceSlug(row, type)}`;
}

function asSlug(value: string): { _type: "slug"; current: string } {
  return { _type: "slug", current: value };
}

function fields(row: RawRow, names: string[]): RawRow {
  return Object.fromEntries(names.filter((name) => row[name] !== undefined && row[name] !== null && row[name] !== "").map((name) => [name, row[name]]));
}

function media(field: string, value: unknown): Media[] {
  if (!isRecord(value) || typeof value.sourceUrl !== "string" || !value.sourceUrl) return [];
  return [{
    field,
    sourceUrl: value.sourceUrl,
    alt: typeof value.alt === "string" ? value.alt : "",
    ...(typeof value.caption === "string" && value.caption ? { caption: value.caption } : {}),
    ...(typeof value.credit === "string" && value.credit ? { credit: value.credit } : {}),
    ...(typeof value.aspect === "string" && value.aspect ? { aspect: value.aspect } : {}),
    ...(isRecord(value.focalPoint) && typeof value.focalPoint.x === "number" && typeof value.focalPoint.y === "number"
      ? { focalPoint: { x: value.focalPoint.x, y: value.focalPoint.y } }
      : {}),
  }];
}

function normalized(type: DocumentType, row: RawRow, migrationKey = migrationKeyFor(type, row)): NormalizedDocument {
  const base = { _type: type, migrationKey };
  const sessionSuffix = type === "session" ? migrationKey.slice(migrationKeyFor(type, row).length) : "";
  switch (type) {
    case "edition":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["year", "name", "tagline", "thesis", "theme", "startsAt", "endsAt", "timezone", "venue", "registrationUrl", "status", "isCurrent", "seo", "editionNumber", "format", "coordinates", "contactEmail", "socialLinks", "heroFigure", "heroStatement"]), slug: asSlug(sourceSlug(row, type)) }, references: [], media: [] };
    case "person":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["firstName", "lastName", "links", "verified", "bio"]), slug: asSlug(sourceSlug(row, type)) }, references: [], media: media("headshot", row.headshot) };
    case "organization":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["name", "shortName", "type", "url", "country"]), slug: asSlug(sourceSlug(row, type)) }, references: [], media: [] };
    case "appearance":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["roleTitle", "category", "billing", "featured", "thesis"]) }, references: [
        { field: "person", type: "person", migrationKey: `person:${slugify(row.person)}` },
        { field: "edition", type: "edition", migrationKey: `edition:${slugify(row.edition)}` },
        { field: "organizations", type: "organization", migrationKey: "", many: true },
      ], media: [] };
    case "track":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["code", "name", "description", "chainStage"]) }, references: [], media: [] };
    case "session":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["title", "startsAt", "endsAt", "room", "status", "code", "categoryLabel", "speakerLabel", "description", "outcomes"]), slug: asSlug(sourceSlug(row, type, sessionSuffix)) }, references: [
        { field: "edition", type: "edition", migrationKey: `edition:${slugify(row.edition)}` },
        { field: "track", type: "track", migrationKey: `track:${slugify(row.track)}` },
        { field: "speakers", type: "person", migrationKey: "", many: true },
      ], media: [] };
    case "partner":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["name", "url", "type"]), slug: asSlug(sourceSlug(row, type)) }, references: [], media: media("logo", row.logo) };
    case "summitDocument":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["title", "type", "issuer"]) }, references: [], media: media("image", row.image) };
    case "interview":
      return { type, migrationKey, payload: { ...base, ...fields(row, ["code", "title", "durationMin", "featured", "editionYear", "topics", "pullQuote", "video", "url"]), slug: asSlug(sourceSlug(row, type)) }, references: [
        { field: "person", type: "person", migrationKey: `person:${slugify(row.person)}` },
      ], media: media("image", row.image) };
  }
}

function collectionFor(type: DocumentType): string {
  if (type === "person") return "people";
  return type === "summitDocument" ? "documents" : `${type}s`;
}

function mergedRows(sources: SeedSources): Map<DocumentType, Map<string, RawRow>> {
  const result = new Map<DocumentType, Map<string, RawRow>>();
  const sessionKeyBySourceIdentity = new Map<string, string>();
  const sessionBaseKeys = new Set(sourceNames.flatMap((source) =>
    (sources[source].sessions ?? []).map((row) => migrationKeyFor("session", row)),
  ));
  for (const source of sourceNames) {
    for (const type of documentTypes) {
      const rows = sources[source][collectionFor(type)] ?? [];
      const records = result.get(type) ?? new Map<string, RawRow>();
      for (const [index, row] of rows.entries()) {
        const baseKey = migrationKeyFor(type, row);
        let key = baseKey;
        if (type === "session") {
          const sourceIdentity = String(row.code ?? row.slug ?? row.title ?? "session");
          const knownKey = sessionKeyBySourceIdentity.get(sourceIdentity);
          if (knownKey) key = knownKey;
          else {
            if (records.has(baseKey)) {
              const suffix = `${source}-${index + 1}`;
              key = `${baseKey}-${suffix}`;
              let sequence = 2;
              while (records.has(key) || sessionBaseKeys.has(key)) {
                key = `${baseKey}-${suffix}-${sequence}`;
                sequence += 1;
              }
            }
            sessionKeyBySourceIdentity.set(sourceIdentity, key);
          }
        }
        records.set(key, mergeValues(records.get(key) ?? {}, row) as RawRow);
      }
      result.set(type, records);
    }
  }
  return result;
}

function validationErrors(documents: NormalizedDocument[], rows: Map<DocumentType, Map<string, RawRow>>): string[] {
  const errors: string[] = [];
  const known = new Set(documents.map((document) => document.migrationKey));
  for (const document of documents) {
    const row = rows.get(document.type)?.get(document.migrationKey) ?? {};
    for (const reference of document.references) {
      const keys = reference.many
        ? (reference.field === "organizations" ? row.organizations ?? [] : row.speakers ?? []).map((value: string) => `${reference.type}:${slugify(value)}`)
        : [reference.migrationKey];
      for (const key of keys) if (!known.has(key)) errors.push(`${document.type}:${reference.field}:missing-reference`);
    }
    for (const entry of document.media) if (!entry.alt) errors.push(`${document.type}:${entry.field}:missing-alt`);
  }
  return errors;
}

export function normalizeSeedContent(sources: SeedSources): { documents: NormalizedDocument[]; validationErrors: string[] } {
  const rows = mergedRows(sources);
  const documents = documentTypes.flatMap((type) => [...(rows.get(type) ?? new Map<string, RawRow>())]
    .map(([migrationKey, row]) => normalized(type, row, migrationKey)));
  return { documents, validationErrors: validationErrors(documents, rows) };
}

export async function readSeedSources(): Promise<SeedSources> {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const files: Record<SourceName, string> = {
    default: "content/seed.json",
    nexus: "content/seed-nexus.json",
    assembly: "content/seed-assembly.json",
  };
  const entries = await Promise.all(sourceNames.map(async (source) => [source, JSON.parse(await readFile(path.join(root, files[source]), "utf8"))] as const));
  return Object.fromEntries(entries) as SeedSources;
}

async function defaultReadImage(sourceUrl: string): Promise<Buffer> {
  if (/^https?:\/\//.test(sourceUrl)) {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`Image source unavailable (${response.status})`);
    return Buffer.from(await response.arrayBuffer());
  }
  if (!sourceUrl.startsWith("/")) throw new Error("Image source must be local or HTTPS");
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const file = path.resolve(root, "public", `.${sourceUrl}`);
  if (!file.startsWith(path.resolve(root, "public") + path.sep)) throw new Error("Image source is outside public/");
  return readFile(file);
}

function asMediaAsset(entry: Media, assetId: string): Record<string, unknown> {
  const focal = entry.focalPoint;
  const toFraction = (value: number) => value > 1 ? value / 100 : value;
  return {
    _type: "mediaAsset",
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      alt: entry.alt,
      ...(entry.caption ? { caption: entry.caption } : {}),
      ...(entry.credit ? { credit: entry.credit } : {}),
      ...(focal ? { hotspot: { x: toFraction(focal.x), y: toFraction(focal.y) } } : {}),
    },
    ...(entry.aspect ? { aspect: entry.aspect } : {}),
  };
}

function countDocuments(documents: NormalizedDocument[]): Partial<Record<DocumentType, number>> {
  return documents.reduce<Partial<Record<DocumentType, number>>>((counts, document) => {
    counts[document.type] = (counts[document.type] ?? 0) + 1;
    return counts;
  }, {});
}

async function findOrCreate(client: MigrationClient, document: Record<string, unknown>): Promise<{ id: string; created: boolean }> {
  const existing = await client.fetch<{ _id?: string } | null>(
    '*[_type == $type && migrationKey == $migrationKey][0]{_id}',
    { type: String(document._type), migrationKey: String(document.migrationKey) },
  );
  if (existing?._id) return { id: (await client.patch(existing._id).set(document).commit())._id, created: false };
  return { id: (await client.create(document))._id, created: true };
}

async function resolveReferenceId(client: MigrationClient, ids: Map<string, string>, migrationKey: string): Promise<string> {
  const cached = ids.get(migrationKey);
  if (cached) return cached;
  const separator = migrationKey.indexOf(":");
  const type = migrationKey.slice(0, separator);
  const existing = await client.fetch<{ _id?: string } | null>(
    '*[_type == $type && migrationKey == $migrationKey][0]{_id}',
    { type, migrationKey },
  );
  if (!existing?._id) throw new Error(`Missing referenced Sanity document for ${type}`);
  ids.set(migrationKey, existing._id);
  return existing._id;
}

export async function migrateSeedContent(options: MigrationOptions = {}): Promise<MigrationResult> {
  const source = options.sources ?? await readSeedSources();
  const normalized = normalizeSeedContent(source);
  const documents = options.only ? normalized.documents.filter((document) => document.type === options.only) : normalized.documents;
  const scopedValidationErrors = options.only
    ? normalized.validationErrors.filter((error) => error.startsWith(`${options.only}:`))
    : normalized.validationErrors;
  const imageSources = [...new Set(documents.flatMap((document) => document.media.map((entry) => entry.sourceUrl)))];
  const counts = countDocuments(documents);
  if (options.dryRun) return { counts, imageCount: imageSources.length, validationErrors: scopedValidationErrors, created: 0, updated: 0 };
  if (!options.client) throw new Error("A Sanity migration client is required for writes");
  if (scopedValidationErrors.length) throw new Error(`Seed validation failed: ${scopedValidationErrors.join(", ")}`);

  const readImage = options.readImage ?? defaultReadImage;
  const assetIds = new Map<string, string>();
  for (const sourceUrl of imageSources) {
    const asset = await options.client.assets.upload("image", await readImage(sourceUrl), { filename: path.basename(new URL(sourceUrl, "https://seed.local").pathname) });
    assetIds.set(sourceUrl, asset._id);
  }

  const ids = new Map<string, string>();
  const rows = mergedRows(source);
  let created = 0;
  let updated = 0;
  for (const type of importOrder) {
    for (const document of documents.filter((candidate) => candidate.type === type)) {
      const sourceRow: RawRow = rows.get(type)?.get(document.migrationKey) ?? {};
      const payload: Record<string, unknown> = { ...document.payload };
      for (const reference of document.references) {
        const keys: string[] = reference.many
          ? (reference.field === "organizations" ? sourceRow.organizations ?? [] : sourceRow.speakers ?? []).map((value: string) => `${reference.type}:${slugify(value)}`)
          : [reference.migrationKey];
        const refs = (await Promise.all(keys.map((key) => resolveReferenceId(options.client!, ids, key))))
          .map((id) => ({ _type: "reference", _ref: id }));
        payload[reference.field] = reference.many ? refs : refs[0];
      }
      for (const entry of document.media) payload[entry.field] = asMediaAsset(entry, assetIds.get(entry.sourceUrl)!);
      const result = await findOrCreate(options.client, payload);
      ids.set(document.migrationKey, result.id);
      if (result.created) created += 1;
      else updated += 1;
    }
  }
  return { counts, imageCount: imageSources.length, validationErrors: [], created, updated };
}

export function parseMigrationArgs(args: string[]): { dryRun: boolean; only?: DocumentType } {
  const dryRun = args.includes("--dry-run");
  const onlyIndex = args.indexOf("--only");
  const onlyValue = args.find((arg) => arg.startsWith("--only="))?.slice("--only=".length)
    ?? (onlyIndex >= 0 ? args[onlyIndex + 1] : undefined);
  if (onlyValue && !documentTypes.includes(onlyValue as DocumentType)) throw new Error(`--only must be one of: ${documentTypes.join(", ")}`);
  return { dryRun, ...(onlyValue ? { only: onlyValue as DocumentType } : {}) };
}

async function main(): Promise<void> {
  const args = parseMigrationArgs(process.argv.slice(2));
  if (args.dryRun) {
    const result = await migrateSeedContent(args);
    console.log(JSON.stringify({ dryRun: true, counts: result.counts, imageCount: result.imageCount, validationErrors: result.validationErrors.length }));
    return;
  }
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset || !token) throw new Error("SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_WRITE_TOKEN are required for writes");
  const client = createClient({ projectId, dataset, token, apiVersion: "2025-01-01", useCdn: false }) as unknown as MigrationClient;
  const result = await migrateSeedContent({ ...args, client });
  console.log(JSON.stringify({ dryRun: false, counts: result.counts, imageCount: result.imageCount, created: result.created, updated: result.updated }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Seed migration failed");
    process.exitCode = 1;
  });
}
