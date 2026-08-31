import type {
  Appearance,
  Edition,
  Interview,
  MediaAsset,
  Organization,
  Partner,
  Person,
  Session,
  SummitContent,
  SummitDocument,
  Track,
} from "../content";
import { assemblyContentSchema, summitContentSchema } from "../content-schema";
import {
  SANITY_CONTENT_QUERY,
  SANITY_FETCH_OPTIONS,
} from "../sanity/queries";
import type {
  SanityAppearance,
  SanityCloudflareVideo,
  SanityContentDocument,
  SanityDocument,
  SanityEdition,
  SanityInterview,
  SanityMediaAsset,
  SanityOrganization,
  SanityPartner,
  SanityPerson,
  SanityRefValue,
  SanitySession,
  SanityTrack,
} from "../sanity/types";
import type { ContentRepository } from "./content-repository";

export interface SanityClientLike {
  fetch<T>(query: string, params?: Record<string, unknown>, options?: Record<string, unknown>): Promise<T>;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

function slugOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  const object = asRecord(value);
  if (!object) return null;
  if (typeof object.current === "string") return object.current;
  if (typeof object.slug === "string") return object.slug;
  const nested = asRecord(object.slug);
  return typeof nested?.current === "string" ? nested.current : null;
}

function referenceKey(value: SanityRefValue | undefined): string | null {
  if (typeof value === "string") return value;
  const object = asRecord(value);
  if (!object) return null;
  return slugOf(object) ?? (typeof object._ref === "string" ? object._ref : null);
}

function idMap<T extends { _id?: string; slug?: string | { current?: string } }>(rows: T[]) {
  const map = new Map<string, string>();
  for (const row of rows) {
    const slug = slugOf(row.slug);
    if (slug) {
      if (row._id) map.set(row._id, slug);
      map.set(slug, slug);
    }
  }
  return map;
}

function resolve(value: SanityRefValue | undefined, ids: Map<string, string>): string | null {
  const key = referenceKey(value);
  return key ? ids.get(key) ?? null : null;
}

function optional(target: MediaAsset, key: keyof MediaAsset, value: unknown): void {
  if (value !== undefined && value !== null) {
    (target as unknown as Record<string, unknown>)[key] = value;
  }
}

function mapVideo(video: SanityCloudflareVideo): MediaAsset | undefined {
  const uid = video.streamUid;
  if (!uid) return undefined;
  if (!/^[A-Za-z0-9_-]{8,}$/.test(uid)) {
    throw new Error(`Sanity content has an invalid Stream UID: ${uid}`);
  }
  const result: MediaAsset = {
    kind: "video",
    src: `https://videodelivery.net/${uid}/manifest/video.m3u8`,
    alt: video.alt ?? "",
  };
  optional(result, "poster", video.posterUrl);
  optional(result, "caption", video.caption);
  optional(result, "credit", video.credit);
  optional(result, "aspect", video.aspect);
  return result;
}

export function mapSanityMediaAsset(raw: SanityMediaAsset | null | undefined): MediaAsset | undefined {
  if (!raw) return undefined;
  const nestedVideo = raw.video ?? raw.cloudflareVideo;
  if (nestedVideo || raw.streamUid) return mapVideo(nestedVideo ?? raw);
  if (raw.kind && raw.src) return { ...raw, kind: raw.kind, src: raw.src, alt: raw.alt ?? "" } as MediaAsset;
  const image = raw.image ?? raw;
  const imageRecord = asRecord(image);
  const src = raw.src ?? (typeof imageRecord?.src === "string" ? imageRecord.src : undefined) ??
    (typeof asRecord(imageRecord?.asset)?.url === "string" ? asRecord(imageRecord?.asset)?.url as string : undefined);
  if (!src) return undefined;
  const result: MediaAsset = {
    kind: "image",
    src,
    alt: raw.alt ?? (typeof imageRecord?.alt === "string" ? imageRecord.alt : ""),
  };
  optional(result, "caption", raw.caption ?? (typeof imageRecord?.caption === "string" ? imageRecord.caption : undefined));
  optional(result, "credit", raw.credit ?? (typeof imageRecord?.credit === "string" ? imageRecord.credit : undefined));
  optional(result, "aspect", raw.aspect);
  const focal = raw.focalPoint ?? (asRecord(imageRecord?.focalPoint) as { x?: number; y?: number } | null) ?? (asRecord(imageRecord?.hotspot) as { x?: number; y?: number } | null);
  if (typeof focal?.x === "number" && typeof focal?.y === "number") result.focalPoint = focal as { x: number; y: number };
  if (raw.placeholder !== undefined) result.placeholder = raw.placeholder;
  return result;
}

function mapEdition(raw: SanityEdition): Edition {
  return {
    slug: slugOf(raw.slug),
    year: raw.year,
    name: raw.name,
    tagline: raw.tagline,
    thesis: raw.thesis,
    theme: raw.theme,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
    timezone: raw.timezone,
    venue: raw.venue,
    registrationUrl: raw.registrationUrl,
    status: raw.status,
    isCurrent: raw.isCurrent,
    seo: raw.seo,
    editionNumber: raw.editionNumber,
    format: raw.format,
    coordinates: raw.coordinates,
    contactEmail: raw.contactEmail,
    socialLinks: raw.socialLinks,
    heroFigure: raw.heroFigure,
    heroStatement: raw.heroStatement,
  } as unknown as Edition;
}

function mapPerson(raw: SanityPerson): Person {
  const headshot = mapSanityMediaAsset(raw.headshot);
  return {
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    slug: slugOf(raw.slug) ?? "",
    headshot: {
      sourceUrl: headshot?.src ?? "",
      alt: headshot?.alt ?? "",
      focalPoint: headshot?.focalPoint ?? { x: 50, y: 50 },
      ...(headshot?.placeholder !== undefined ? { placeholder: headshot.placeholder } : {}),
    },
    links: (raw.links ?? []).map(({ type = "", url = "" }) => ({ type, url })),
    verified: raw.verified ?? false,
    bio: raw.bio ?? "",
  };
}

function mapAppearance(
  raw: SanityAppearance,
  people: Map<string, string>,
  editions: Map<string, string>,
  organizations: Map<string, string>,
): Appearance | null {
  const person = resolve(raw.person, people);
  const edition = resolve(raw.edition, editions);
  if (!person || !edition) return null;
  return {
    person,
    edition,
    organizations: (raw.organizations ?? [])
      .map((ref) => resolve(ref, organizations))
      .filter((key): key is string => Boolean(key)),
    roleTitle: raw.roleTitle ?? "",
    category: raw.category as Appearance["category"],
    billing: raw.billing ?? 0,
    featured: raw.featured ?? false,
    ...(raw.thesis !== undefined ? { thesis: raw.thesis } : {}),
  };
}

function mapSession(raw: SanitySession, people: Map<string, string>, editions: Map<string, string>, tracks: Map<string, string>): Session | null {
  const edition = resolve(raw.edition, editions);
  const track = resolve(raw.track, tracks);
  if (!edition || !track) return null;
  return {
    title: raw.title ?? "",
    edition,
    track,
    startsAt: raw.startsAt ?? "",
    endsAt: raw.endsAt ?? "",
    room: raw.room ?? null,
    speakers: (raw.speakers ?? []).map((ref) => resolve(ref, people)).filter((key): key is string => Boolean(key)),
    status: raw.status as Session["status"],
    ...(raw.code !== undefined ? { code: raw.code } : {}),
    ...(raw.categoryLabel !== undefined ? { categoryLabel: raw.categoryLabel } : {}),
    ...(raw.speakerLabel !== undefined ? { speakerLabel: raw.speakerLabel } : {}),
    ...(raw.description !== undefined ? { description: raw.description } : {}),
    ...(raw.outcomes !== undefined ? { outcomes: raw.outcomes } : {}),
  };
}

function mapInterview(raw: SanityInterview, people: Map<string, string>): Interview | null {
  const person = resolve(raw.person, people);
  if (!person) return null;
  const image = mapSanityMediaAsset(raw.image);
  const video = mapSanityMediaAsset(raw.video);
  return {
    code: raw.code ?? "",
    slug: slugOf(raw.slug) ?? "",
    title: raw.title ?? "",
    person,
    durationMin: raw.durationMin ?? 0,
    featured: raw.featured ?? false,
    ...(raw.editionYear !== undefined ? { editionYear: raw.editionYear } : {}),
    ...(raw.topics !== undefined ? { topics: raw.topics } : {}),
    ...(raw.pullQuote !== undefined ? { pullQuote: raw.pullQuote } : {}),
    ...(image ? { image: { sourceUrl: image.src, alt: image.alt, ...(image.placeholder !== undefined ? { placeholder: image.placeholder } : {}) } } : {}),
    ...(video ? { video } : {}),
    ...(raw.url !== undefined ? { url: raw.url } : {}),
  } as Interview;
}

function mapAssembly(raw: Record<string, unknown>): Record<string, unknown> {
  const assembly = structuredClone(raw) as Record<string, unknown>;
  const mapOne = (value: unknown) => mapSanityMediaAsset(value as SanityMediaAsset | undefined);
  for (const key of ["heroMedia", "focusMedia", "footerBand"]) {
    if (key in assembly) assembly[key] = mapOne(assembly[key]);
  }
  if (asRecord(assembly.rail)) {
    const rail = assembly.rail as Record<string, unknown>;
    for (const key of ["feature", "ticket"]) if (asRecord(rail[key])) (rail[key] as Record<string, unknown>).media = mapOne((rail[key] as Record<string, unknown>).media);
  }
  for (const key of ["story", "focusAreas", "voices", "journal", "pastEditions"]) {
    if (Array.isArray(assembly[key])) for (const item of assembly[key] as Record<string, unknown>[]) if (item.media) item.media = mapOne(item.media);
  }
  if (Array.isArray(assembly.letters)) for (const item of assembly.letters as Record<string, unknown>[]) {
    if (item.crest) item.crest = mapOne(item.crest);
    if (item.document) item.document = mapOne(item.document);
  }
  if (Array.isArray(assembly.gallery)) assembly.gallery = (assembly.gallery as unknown[]).map(mapOne);
  if (asRecord(assembly.pageIntros)) for (const intro of Object.values(assembly.pageIntros as Record<string, unknown>)) if (asRecord(intro) && (intro as Record<string, unknown>).media) (intro as Record<string, unknown>).media = mapOne((intro as Record<string, unknown>).media);
  return assembly;
}

export function createSanityContentRepository(client: SanityClientLike): ContentRepository {
  return {
    async getSummitContent() {
      const raw = await client.fetch<SanityContentDocument>(SANITY_CONTENT_QUERY, {}, SANITY_FETCH_OPTIONS);
      const source = raw ?? {};
      const editions = (source.editions ?? []).map(mapEdition);
      const organizations = (source.organizations ?? []).map((row) => ({
        name: row.name,
        shortName: row.shortName,
        slug: slugOf(row.slug),
        type: row.type,
        url: row.url,
        country: row.country,
      } as unknown as Organization));
      const people = (source.people ?? []).map(mapPerson);
      const tracks = (source.tracks ?? []).map((row) => ({
        code: row.code,
        name: row.name,
        description: row.description,
        chainStage: row.chainStage,
      } as unknown as Track));
      const editionIds = idMap(source.editions ?? []);
      const personIds = idMap(source.people ?? []);
      const organizationIds = idMap(source.organizations ?? []);
      const trackIds = new Map((source.tracks ?? []).flatMap((row) => row.code ? [[row._id ?? row.code, row.code], [row.code, row.code]] as [string, string][] : []));
      const appearanceRows = (source.appearances ?? []).map((row) => mapAppearance(row, personIds, editionIds, organizationIds)).filter((row): row is Appearance => Boolean(row));
      const sessionRows = (source.sessions ?? []).map((row) => mapSession(row, personIds, editionIds, trackIds)).filter((row): row is Session => Boolean(row));
      const interviews = (source.interviews ?? []).map((row) => mapInterview(row, personIds)).filter((row): row is Interview => Boolean(row));
      const partners = (source.partners ?? []).map((row) => {
        const logo = mapSanityMediaAsset(row.logo);
        return {
          name: row.name,
          slug: slugOf(row.slug),
          logo: logo ? { sourceUrl: logo.src, alt: logo.alt } : undefined,
          url: row.url,
          type: row.type,
        } as unknown as Partner;
      });
      const documents = (source.documents ?? []).map((row) => {
        const image = mapSanityMediaAsset(row.image);
        return {
          title: row.title,
          type: row.type,
          image: image ? { sourceUrl: image.src, alt: image.alt } : undefined,
          issuer: row.issuer,
        } as unknown as SummitDocument;
      });
      const mapped: SummitContent = {
        editions,
        organizations,
        people,
        appearances: appearanceRows.map((row) => ({ ...row, organizations: row.organizations.filter((slug) => organizations.some((org) => org.slug === slug)) })),
        tracks,
        sessions: sessionRows,
        partners,
        documents,
        ...(interviews.length ? { interviews } : {}),
        ...(source.assembly ? { assembly: mapAssembly(source.assembly) as unknown as SummitContent["assembly"] } : {}),
      };
      const parsed = summitContentSchema.safeParse(mapped);
      const parsedAssembly = mapped.assembly ? assemblyContentSchema.safeParse(mapped.assembly) : null;
      if (!parsed.success || (parsedAssembly && !parsedAssembly.success)) {
        const issue = !parsed.success
          ? parsed.error.issues[0]?.message
          : parsedAssembly && !parsedAssembly.success
            ? parsedAssembly.error.issues[0]?.message
            : "unknown schema error";
        throw new Error(`Sanity content is invalid: ${issue}`);
      }
      return parsed.data;
    },
  };
}

export async function getSanityContent(client?: SanityClientLike): Promise<SummitContent> {
  const resolvedClient = client ?? (await import("../sanity/client")).createSanityClient();
  return createSanityContentRepository(resolvedClient).getSummitContent();
}

export type { SanityContentDocument };
