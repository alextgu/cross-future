/** Stable cache tags shared by the fetcher and publish revalidation route. */
export const SANITY_CONTENT_TAG = "sanity:content";
export const SANITY_TAG = SANITY_CONTENT_TAG;

export function getSanityDocumentTag(type: string, id?: string): string {
  return id ? `sanity:${type}:${id}` : `sanity:${type}`;
}

export function getSanityContentTags(documentIds: string[] = []): string[] {
  return [
    SANITY_CONTENT_TAG,
    ...documentIds.filter(Boolean).map((id) => getSanityDocumentTag("document", id)),
  ];
}

const mediaProjection = `{
  image { "src": asset->url, alt, caption, credit,
    "focalPoint": select(defined(hotspot) => {"x": hotspot.x * 100, "y": hotspot.y * 100})
  },
  aspect
}`;

/**
 * One explicit projection keeps the browser contract independent of Sanity's
 * document shape. References are projected to slugs before reaching the
 * repository, and `_id` remains available for cache tags and diagnostics.
 */
export const SANITY_CONTENT_QUERY = `{
  "editions": *[_type == "edition"] | order(year asc) {
    _id, migrationKey, "slug": slug.current, year, name, tagline, thesis,
    theme, startsAt, endsAt, timezone, venue, registrationUrl, status,
    isCurrent, seo, editionNumber, format, coordinates, contactEmail,
    socialLinks, heroFigure, heroStatement
  },
  "organizations": *[_type == "organization"] | order(_createdAt asc) {
    _id, migrationKey, name, shortName, "slug": slug.current, type, url, country
  },
  "people": *[_type == "person"] | order(_createdAt asc) {
    _id, migrationKey, firstName, lastName, "slug": slug.current,
    "headshot": ${mediaProjection}, links, verified, bio
  },
  "appearances": *[_type == "appearance"] | order(billing asc) {
    _id, migrationKey, "person": person->slug.current,
    "edition": edition->slug.current,
    "organizations": organizations[]->slug.current,
    roleTitle, category, billing, featured, thesis
  },
  "tracks": *[_type == "track"] | order(code asc) {
    _id, migrationKey, code, name, description, chainStage
  },
  "sessions": *[_type == "session"] | order(startsAt asc) {
    _id, migrationKey, title, "edition": edition->slug.current,
    "track": track->code, startsAt, endsAt, room,
    "speakers": speakers[]->slug.current, status, code, categoryLabel,
    speakerLabel, description, outcomes
  },
  "partners": *[_type == "partner"] | order(_createdAt asc) {
    _id, migrationKey, name, "slug": slug.current, "logo": ${mediaProjection}, url, type
  },
  "documents": *[_type == "summitDocument"] | order(_createdAt asc) {
    _id, migrationKey, title, type, "image": ${mediaProjection}, issuer
  },
  "interviews": *[_type == "interview"] | order(code asc) {
    _id, migrationKey, code, "slug": slug.current, title,
    "person": person, durationMin, featured, editionYear,
    topics, pullQuote, image${mediaProjection}, video, url
  }
}`;

export const sanityContentQuery = SANITY_CONTENT_QUERY;

/** Metadata and static-parameter reads must never contain Stega strings. */
export const SANITY_FETCH_OPTIONS = {
  stega: false,
  next: { tags: [SANITY_CONTENT_TAG] },
} as const;
