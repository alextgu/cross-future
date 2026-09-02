import { createReadStream } from "node:fs";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { Upload } from "tus-js-client";

export const LOCAL_VIDEO_DIRECTORY = "/Users/agu/Downloads/cross_future";
export const TUS_CHUNK_SIZE = 52_428_800;

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultCheckpointPath = path.join(LOCAL_VIDEO_DIRECTORY, ".cross-future-stream-migration.json");

const fixedVideoTargets: Record<string, { code: string; person: string }> = {
  "01_SHORT_YangWang_Horizontal.mp4": { code: "IV.17", person: "Yang Wang" },
  "02_SHORT_ChrisSmith_AMD_Horizontal.mp4": { code: "IV.10", person: "Chris Smith" },
  "02_SHORT_MariaParysz_Horizontal.mp4": { code: "IV.13", person: "Maria Parysz" },
  "02_SHORT_NicoleTroster_Horizontal.mp4": { code: "IV.14", person: "Nicole Troster" },
  "02_SHORT_PuiSaiLau_Horizontal.mp4": { code: "IV.16", person: "Pui Sai Lau" },
  "03_SHORT_RasoulYousef_Horizontal.mp4": { code: "IV.18", person: "Rasoul Yousef" },
  "04_SHORT_JamesElder_Horizontal.mp4": { code: "IV.11", person: "James Elder" },
  "04_SHORT_JosephTurcotte_Horizontal.mp4": { code: "IV.15", person: "Joseph Turcotte" },
  "05_SHORT_MiryamLazarte_Horizontal.mp4": { code: "IV.12", person: "Miryam Lazarte" },
};

export type VideoSource = {
  fileName: string;
  filePath: string;
  bytes: number;
  mtimeMs: number;
  migrationKey: string;
};

export type VideoTarget = {
  source: VideoSource;
  target?: string;
  person?: string;
};

type CheckpointEntry = {
  source: Pick<VideoSource, "fileName" | "filePath" | "bytes" | "mtimeMs">;
  target: string;
  status: "uploading" | "uploaded" | "failed" | "completed";
  attempts: number;
  tusUploadUrl?: string;
  streamUid?: string;
  sanityId?: string;
  sanityPatched?: boolean;
  error?: string;
};

type Checkpoint = { version: 1; entries: Record<string, CheckpointEntry> };

export type SanityVideoClient = {
  fetch<T>(query: string, params?: Record<string, string>): Promise<T>;
  patch(id: string): { set(value: Record<string, unknown>): { commit(): Promise<unknown> } };
};

export type StreamUploader = (
  source: VideoSource,
  checkpoint: Pick<CheckpointEntry, "tusUploadUrl" | "streamUid">,
  persist: (update: Pick<CheckpointEntry, "tusUploadUrl" | "streamUid">) => Promise<void>,
) => Promise<string>;

export type VideoMigrationResult = {
  dryRun: boolean;
  files: Array<{ fileName: string; bytes: number; target?: string }>;
  totalBytes: number;
  unresolved: string[];
  uploaded: number;
  patched: number;
};

export type VideoMigrationOptions = {
  videos?: VideoSource[];
  sourceDirectory?: string;
  externalMappings?: Record<string, string>;
  checkpointPath?: string;
  dryRun?: boolean;
  upload?: StreamUploader;
  client?: SanityVideoClient;
};

export type TusCredentials = { accountId: string; apiToken: string };

function normalize(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function migrationKeyFor(fileName: string): string {
  return `video:${normalize(path.parse(fileName).name)}`;
}

function sourceIdentity(source: VideoSource): CheckpointEntry["source"] {
  return { fileName: source.fileName, filePath: source.filePath, bytes: source.bytes, mtimeMs: source.mtimeMs };
}

function sameSource(entry: CheckpointEntry, source: VideoSource): boolean {
  const identity = entry.source;
  return identity.fileName === source.fileName
    && identity.filePath === source.filePath
    && identity.bytes === source.bytes
    && identity.mtimeMs === source.mtimeMs;
}

export async function discoverVideoSources(directory = LOCAL_VIDEO_DIRECTORY): Promise<VideoSource[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const videos = await Promise.all(entries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".mp4")
    .map(async (entry) => {
      const filePath = path.join(directory, entry.name);
      const metadata = await stat(filePath);
      return { fileName: entry.name, filePath, bytes: metadata.size, mtimeMs: metadata.mtimeMs, migrationKey: migrationKeyFor(entry.name) };
    }));
  return videos.sort((left, right) => left.fileName.localeCompare(right.fileName));
}

/** These checked-in files are fixtures, not migration inputs. */
export async function discoverRepositoryVideoFixtures(root = repositoryRoot): Promise<VideoSource[]> {
  const directories = [path.join(root, "public/assembly/video"), path.join(root, "public/summit/video")];
  const fixtures = await Promise.all(directories.map((directory) => discoverVideoSources(directory)));
  return fixtures.flat().sort((left, right) => left.filePath.localeCompare(right.filePath));
}

export function mapVideoTargets(videos: VideoSource[], externalMappings: Record<string, string> = {}): VideoTarget[] {
  return videos.map((source) => {
    const fixed = fixedVideoTargets[source.fileName];
    const hasOverride = Object.hasOwn(externalMappings, source.fileName) || Object.hasOwn(externalMappings, source.migrationKey);
    const override = externalMappings[source.fileName] ?? externalMappings[source.migrationKey];
    if (fixed) {
      if (hasOverride) throw new Error(`External mapping cannot override fixed target for ${source.fileName}`);
      return { source, target: fixed.code, person: fixed.person };
    }
    return override ? { source, target: override } : { source };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function validCheckpointEntry(value: unknown): value is CheckpointEntry {
  if (!isRecord(value) || !isRecord(value.source)) return false;
  const source = value.source;
  if (!hasOnlyKeys(value, ["source", "target", "status", "attempts", "tusUploadUrl", "streamUid", "sanityId", "sanityPatched", "error"])
    || !hasOnlyKeys(source, ["fileName", "filePath", "bytes", "mtimeMs"])
    || !isNonEmptyString(source.fileName) || !isNonEmptyString(source.filePath)
    || typeof source.bytes !== "number" || !Number.isSafeInteger(source.bytes) || source.bytes <= 0
    || typeof source.mtimeMs !== "number" || !Number.isFinite(source.mtimeMs) || source.mtimeMs < 0
    || !isNonEmptyString(value.target)
    || !["uploading", "uploaded", "failed", "completed"].includes(String(value.status))
    || typeof value.attempts !== "number" || !Number.isSafeInteger(value.attempts) || value.attempts < 0) return false;
  if (value.tusUploadUrl !== undefined && !isNonEmptyString(value.tusUploadUrl)) return false;
  if (value.streamUid !== undefined && !isNonEmptyString(value.streamUid)) return false;
  if (value.sanityId !== undefined && !isNonEmptyString(value.sanityId)) return false;
  if (value.sanityPatched !== undefined && typeof value.sanityPatched !== "boolean") return false;
  if (value.error !== undefined && typeof value.error !== "string") return false;
  if (value.tusUploadUrl && !value.streamUid) return false;
  if (value.sanityPatched && !value.streamUid) return false;
  if (value.status === "uploaded" && !value.streamUid) return false;
  if (value.status === "completed" && (!value.streamUid || value.sanityPatched !== true)) return false;
  return true;
}

async function readCheckpoint(checkpointPath: string): Promise<Checkpoint> {
  let raw: string;
  try {
    raw = await readFile(checkpointPath, "utf8");
  } catch (error: any) {
    if (error?.code === "ENOENT") return { version: 1, entries: {} };
    throw error;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.entries)
      || !Object.entries(parsed.entries).every(([key, entry]) => isNonEmptyString(key) && validCheckpointEntry(entry))) {
      throw new Error("invalid checkpoint shape");
    }
    return { version: 1, entries: parsed.entries as Record<string, CheckpointEntry> };
  } catch (error) {
    throw new Error(`Migration checkpoint is corrupt at ${checkpointPath}: ${error instanceof Error ? error.message : "invalid JSON"}`);
  }
}

async function writeCheckpoint(checkpointPath: string, checkpoint: Checkpoint): Promise<void> {
  await mkdir(path.dirname(checkpointPath), { recursive: true });
  const temporary = `${checkpointPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(checkpoint, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temporary, checkpointPath);
}

function entryFor(target: VideoTarget): CheckpointEntry {
  if (!target.target) throw new Error("Cannot checkpoint an unresolved video target");
  return { source: sourceIdentity(target.source), target: target.target, status: "failed", attempts: 0 };
}

function altFor(target: VideoTarget): string {
  return target.person ? `Recorded interview: ${target.person}` : `Video: ${target.source.fileName}`;
}

async function resolveSanityId(client: SanityVideoClient, target: string): Promise<string> {
  const documents = await client.fetch<Array<{ _id?: string }>>(
    '*[_type == "interview" && (migrationKey == $target || code == $target)]{_id}',
    { target },
  );
  if (!Array.isArray(documents) || documents.length !== 1 || !documents[0]?._id) {
    throw new Error(`Expected exactly one Sanity interview for target ${target}`);
  }
  return documents[0]._id;
}

function checkpointOutsideRepository(checkpointPath: string): void {
  const resolved = path.resolve(checkpointPath);
  if (resolved === repositoryRoot || resolved.startsWith(`${repositoryRoot}${path.sep}`)) {
    throw new Error("Migration checkpoint must be outside the repository");
  }
}

export async function migrateVideos(options: VideoMigrationOptions = {}): Promise<VideoMigrationResult> {
  const videos = options.videos ?? await discoverVideoSources(options.sourceDirectory);
  const targets = mapVideoTargets(videos, options.externalMappings);
  const unresolved = targets.filter((target) => !target.target).map((target) => target.source.fileName);
  const result: VideoMigrationResult = {
    dryRun: Boolean(options.dryRun),
    files: targets.map((target) => ({ fileName: target.source.fileName, bytes: target.source.bytes, ...(target.target ? { target: target.target } : {}) })),
    totalBytes: videos.reduce((total, source) => total + source.bytes, 0),
    unresolved,
    uploaded: 0,
    patched: 0,
  };
  if (options.dryRun) return result;
  if (unresolved.length) throw new Error(`Unresolved video targets: ${unresolved.join(", ")}`);
  const duplicateTargets = targets
    .map((target) => target.target!)
    .filter((target, index, all) => all.indexOf(target) !== index)
    .filter((target, index, all) => all.indexOf(target) === index);
  if (duplicateTargets.length) throw new Error(`Duplicate video targets: ${duplicateTargets.join(", ")}`);
  if (!options.client || !options.upload) throw new Error("A Sanity client and Stream uploader are required for a live migration");

  const checkpointPath = options.checkpointPath ?? defaultCheckpointPath;
  checkpointOutsideRepository(checkpointPath);
  const checkpoint = await readCheckpoint(checkpointPath);
  const save = () => writeCheckpoint(checkpointPath, checkpoint);
  const entries = new Map<VideoTarget, CheckpointEntry>();

  for (const target of targets) {
    const existing = checkpoint.entries[target.source.migrationKey];
    if (existing && !sameSource(existing, target.source)) {
      throw new Error(`Checkpoint source identity changed for ${target.source.migrationKey}; reconcile or reset the local checkpoint explicitly`);
    }
    if (existing && existing.target !== target.target) {
      throw new Error(`Checkpoint target changed for ${target.source.migrationKey}; reconcile or reset the local checkpoint explicitly`);
    }
    const entry = existing ?? entryFor(target);
    checkpoint.entries[target.source.migrationKey] = entry;
    entries.set(target, entry);
  }

  // Resolve every target before uploading any bytes, so an invalid external map cannot orphan media in Stream.
  for (const target of targets) {
    const entry = entries.get(target)!;
    if (entry.status === "completed" && entry.streamUid && entry.sanityPatched) continue;
    entry.sanityId ??= await resolveSanityId(options.client, entry.target);
  }
  await save();

  for (const target of targets) {
    const entry = entries.get(target)!;
    if (entry.status === "completed" && entry.streamUid && entry.sanityPatched) continue;
    try {
      if (!entry.streamUid) {
        entry.status = "uploading";
        entry.attempts += 1;
        entry.error = undefined;
        await save();
        const streamUid = await options.upload(target.source, entry, async (update) => {
          Object.assign(entry, update);
          await save();
        });
        if (!streamUid) throw new Error("Stream upload completed without a stable UID");
        entry.streamUid = streamUid;
        entry.status = "uploaded";
        await save();
        result.uploaded += 1;
      }
      if (!entry.sanityId) throw new Error(`No resolved Sanity ID for target ${entry.target}`);
      await options.client.patch(entry.sanityId).set({
        video: { _type: "cloudflareVideo", streamUid: entry.streamUid, status: "processing", alt: altFor(target) },
      }).commit();
      entry.sanityPatched = true;
      entry.status = "completed";
      entry.error = undefined;
      await save();
      result.patched += 1;
    } catch (error) {
      entry.status = "failed";
      entry.error = error instanceof Error ? error.message : "Stream migration failed";
      await save();
      throw error;
    }
  }
  return result;
}

export function createTusUploader(credentials: TusCredentials, options: { endpoint?: string } = {}): StreamUploader {
  const endpoint = options.endpoint ?? `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(credentials.accountId)}/stream?direct_user=true`;
  return async (source, checkpoint, persist) => new Promise<string>((resolve, reject) => {
    let streamUid = checkpoint.streamUid;
    const recordCreation = async (request: { getMethod(): string; getURL(): string }, response: { getHeader(name: string): string | undefined }) => {
      if (request.getMethod() !== "POST") return;
      const location = response.getHeader("Location");
      const candidate = response.getHeader("stream-media-id") ?? response.getHeader("Stream-Media-Id");
      if (!location) return;
      if (!isNonEmptyString(candidate)) throw new Error("Stream creation did not return the required stream-media-id header");
      const tusUploadUrl = new URL(location, request.getURL()).toString();
      await persist({ tusUploadUrl, streamUid: candidate });
      streamUid = candidate;
    };
    const upload = new Upload(createReadStream(source.filePath), {
      ...(checkpoint.tusUploadUrl ? { uploadUrl: checkpoint.tusUploadUrl } : { endpoint }),
      uploadSize: source.bytes,
      chunkSize: TUS_CHUNK_SIZE,
      retryDelays: [0, 1_000, 3_000, 10_000],
      onShouldRetry: (error) => !error.causingError?.message.includes("stream-media-id"),
      headers: { Authorization: `Bearer ${credentials.apiToken}` },
      metadata: { filename: source.fileName, filetype: "video/mp4" },
      storeFingerprintForResuming: false,
      removeFingerprintOnSuccess: true,
      onAfterResponse: async (request, response) => recordCreation(request, response),
      onSuccess: () => streamUid ? resolve(streamUid) : reject(new Error("Stream did not return the required stream-media-id header")),
      onError: reject,
    });
    upload.start();
  });
}

export function parseVideoMigrationArgs(args: string[]): { dryRun: boolean; mappingPath?: string; checkpointPath?: string } {
  const valueFor = (flag: string) => {
    const equals = args.find((arg) => arg.startsWith(`${flag}=`));
    if (equals) return equals.slice(flag.length + 1);
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const mappingPath = valueFor("--mapping");
  const checkpointPath = valueFor("--checkpoint");
  if (args.includes("--mapping") && !mappingPath) throw new Error("--mapping requires a JSON file path");
  if (args.includes("--checkpoint") && !checkpointPath) throw new Error("--checkpoint requires a file path");
  return { dryRun: args.includes("--dry-run"), ...(mappingPath ? { mappingPath } : {}), ...(checkpointPath ? { checkpointPath } : {}) };
}

export async function readExternalMappings(mappingPath?: string): Promise<Record<string, string>> {
  if (!mappingPath) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(mappingPath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read external video mapping: ${error instanceof Error ? error.message : "invalid JSON"}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.entries(parsed).some(([key, value]) => !key || typeof value !== "string" || !value.trim())) {
    throw new Error("External video mapping must be a JSON object of source filename or migration key to interview code or migration key");
  }
  return Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, value.trim()]));
}

async function main(): Promise<void> {
  const args = parseVideoMigrationArgs(process.argv.slice(2));
  const externalMappings = await readExternalMappings(args.mappingPath);
  if (args.dryRun) {
    const result = await migrateVideos({ dryRun: true, externalMappings });
    console.log(JSON.stringify(result));
    return;
  }
  const preflight = await migrateVideos({ dryRun: true, externalMappings });
  if (preflight.unresolved.length) throw new Error(`Unresolved video targets: ${preflight.unresolved.join(", ")}`);
  const targetValues = preflight.files.flatMap((file) => file.target ? [file.target] : []);
  const duplicateTargets = targetValues.filter((target, index) => targetValues.indexOf(target) !== index)
    .filter((target, index, all) => all.indexOf(target) === index);
  if (duplicateTargets.length) throw new Error(`Duplicate video targets: ${duplicateTargets.join(", ")}`);
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!accountId || !apiToken || !projectId || !dataset || !token) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_STREAM_API_TOKEN, SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_WRITE_TOKEN are required for live migration");
  }
  const client = createClient({ projectId, dataset, token, apiVersion: "2025-01-01", useCdn: false }) as unknown as SanityVideoClient;
  const result = await migrateVideos({ externalMappings, checkpointPath: args.checkpointPath, client, upload: createTusUploader({ accountId, apiToken }) });
  console.log(JSON.stringify(result));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Video migration failed");
    process.exitCode = 1;
  });
}
