/** Types for the explicitly projected fields returned by the Content Lake. */
export interface SanityReference {
  _ref?: string;
  slug?: string | { current?: string };
  current?: string;
}

export type SanityRefValue = string | SanityReference;

export interface SanityCloudflareVideo {
  streamUid?: string;
  status?: "queued" | "processing" | "ready" | "failed";
  posterUrl?: string;
  durationSeconds?: number;
  alt?: string;
  caption?: string;
  credit?: string;
  aspect?: string;
}

export interface SanityMediaAsset extends SanityCloudflareVideo {
  kind?: "image" | "video";
  src?: string;
  poster?: string;
  placeholder?: boolean;
  focalPoint?: { x: number; y: number };
  image?: {
    src?: string;
    alt?: string;
    caption?: string;
    credit?: string;
    asset?: { url?: string };
    hotspot?: { x?: number; y?: number };
  };
  video?: SanityCloudflareVideo;
  cloudflareVideo?: SanityCloudflareVideo;
}

export interface SanityEdition {
  _id?: string;
  migrationKey?: string;
  slug?: string | { current?: string };
  [key: string]: unknown;
}

export interface SanityPerson {
  _id?: string;
  migrationKey?: string;
  firstName?: string;
  lastName?: string;
  slug?: string | { current?: string };
  headshot?: SanityMediaAsset;
  links?: { type?: string; url?: string }[];
  verified?: boolean;
  bio?: string;
}

export interface SanityOrganization {
  _id?: string;
  migrationKey?: string;
  name?: string | null;
  shortName?: string;
  slug?: string | { current?: string };
  type?: string;
  url?: string;
  country?: string;
}

export interface SanityAppearance {
  _id?: string;
  migrationKey?: string;
  person?: SanityRefValue;
  edition?: SanityRefValue;
  organizations?: SanityRefValue[];
  roleTitle?: string;
  category?: string;
  billing?: number;
  featured?: boolean;
  thesis?: string;
}

export interface SanitySession {
  _id?: string;
  migrationKey?: string;
  title?: string;
  edition?: SanityRefValue;
  track?: SanityRefValue;
  startsAt?: string;
  endsAt?: string;
  room?: string | null;
  speakers?: SanityRefValue[];
  status?: string;
  code?: string;
  categoryLabel?: string;
  speakerLabel?: string;
  description?: string;
  outcomes?: string[];
}

export interface SanityInterview {
  _id?: string;
  migrationKey?: string;
  code?: string;
  slug?: string | { current?: string };
  title?: string;
  person?: SanityRefValue;
  durationMin?: number;
  featured?: boolean;
  editionYear?: number;
  topics?: string[];
  pullQuote?: string;
  image?: SanityMediaAsset;
  video?: SanityCloudflareVideo;
  url?: string;
}

export interface SanityPartner {
  _id?: string;
  migrationKey?: string;
  name?: string | null;
  slug?: string | { current?: string };
  logo?: SanityMediaAsset;
  url?: string;
  type?: string;
}

export interface SanityTrack {
  _id?: string;
  migrationKey?: string;
  code?: string;
  name?: string;
  description?: string;
  chainStage?: string;
}

export interface SanityDocument {
  _id?: string;
  migrationKey?: string;
  title?: string;
  type?: string;
  image?: SanityMediaAsset;
  issuer?: string;
}

export interface SanityContentDocument {
  editions?: SanityEdition[];
  organizations?: SanityOrganization[];
  people?: SanityPerson[];
  appearances?: SanityAppearance[];
  tracks?: SanityTrack[];
  sessions?: SanitySession[];
  partners?: SanityPartner[];
  documents?: SanityDocument[];
  interviews?: SanityInterview[];
  assembly?: Record<string, unknown>;
}
