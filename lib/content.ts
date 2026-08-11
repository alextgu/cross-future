/**
 * Content adapter. This is the ONLY module allowed to import content/seed.json.
 * Every component reads through getSummitContent(); to swap in a CMS, reimplement
 * that one function (switch on process.env.CONTENT_SOURCE) and nothing else moves.
 */
import seed from "@/content/seed.json";

/* ---------- Types ---------- */

export type EditionStatus =
  | "draft"
  | "announced"
  | "registration-open"
  | "registration-closed"
  | "archived";

export interface Venue {
  name: string;
  city: string;
  region: string;
  country: string;
}

export interface Edition {
  slug: string;
  year: number;
  name: string;
  tagline: string;
  thesis: string;
  theme: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  venue: Venue;
  registrationUrl: string;
  status: EditionStatus;
  isCurrent: boolean;
  seo: { title: string; description: string };
}

export interface Organization {
  name: string;
  shortName: string;
  slug: string;
  type: string;
  url: string;
  country: string;
}

export interface PersonLink {
  type: string;
  url: string;
}

export interface Person {
  firstName: string;
  lastName: string;
  slug: string;
  headshot: {
    sourceUrl: string;
    alt: string;
    focalPoint: { x: number; y: number };
  };
  links: PersonLink[];
  verified: boolean;
  bio: string;
}

export type AppearanceCategory = "research" | "industry" | "ecosystem";

export interface Appearance {
  person: string;
  edition: string;
  organizations: string[];
  roleTitle: string;
  category: AppearanceCategory;
  billing: number;
  featured: boolean;
}

export type ChainStage = "grid-interface" | "network" | "facility" | "scale";

export interface Track {
  code: string;
  name: string;
  description: string;
  chainStage: ChainStage;
}

export type SessionStatus = "proposed" | "confirmed" | "cancelled";

export interface Session {
  title: string;
  edition: string;
  track: string; // track code
  startsAt: string;
  endsAt: string;
  room: string | null;
  speakers: string[]; // person slugs
  status: SessionStatus;
}

export interface Partner {
  name: string | null;
  slug: string;
  logo: { sourceUrl: string; alt: string };
  url: string;
  type: string;
}

export interface SummitDocument {
  title: string;
  type: string;
  image: { sourceUrl: string; alt: string };
  issuer: string;
}

export interface SummitContent {
  editions: Edition[];
  organizations: Organization[];
  people: Person[];
  appearances: Appearance[];
  tracks: Track[];
  sessions: Session[];
  partners: Partner[];
  documents: SummitDocument[];
}

/* ---------- The adapter ---------- */

/**
 * Async so a CMS-backed implementation is a drop-in replacement.
 * CONTENT_SOURCE=local reads the seed file; any other value should be
 * handled by the future implementation.
 */
export async function getSummitContent(): Promise<SummitContent> {
  return seed as SummitContent;
}

/* ---------- Derived views (pure functions over SummitContent) ---------- */

export function getCurrentEdition(content: SummitContent): Edition {
  const current = content.editions.find((e) => e.isCurrent);
  if (!current) throw new Error("seed.json: no edition has isCurrent=true");
  return current;
}

/** A person joined with their appearance for one edition. */
export interface FacultyMember {
  person: Person;
  roleTitle: string;
  category: AppearanceCategory;
  billing: number;
  featured: boolean;
  organizations: Organization[];
  /** Non-null only when person.verified and a link exists. Never guess a URL. */
  safeLink: PersonLink | null;
}

const LINK_PRIORITY = ["website", "linkedin", "scholar", "twitter"];

function pickLink(person: Person): PersonLink | null {
  if (!person.verified || person.links.length === 0) return null;
  const sorted = [...person.links].sort(
    (a, b) =>
      (LINK_PRIORITY.indexOf(a.type) + 1 || 99) -
      (LINK_PRIORITY.indexOf(b.type) + 1 || 99)
  );
  return sorted[0];
}

export function getFaculty(
  content: SummitContent,
  editionSlug: string
): FacultyMember[] {
  const orgBySlug = new Map(content.organizations.map((o) => [o.slug, o]));
  const personBySlug = new Map(content.people.map((p) => [p.slug, p]));

  return content.appearances
    .filter((a) => a.edition === editionSlug)
    .map((a) => {
      const person = personBySlug.get(a.person);
      if (!person) throw new Error(`seed.json: appearance references unknown person "${a.person}"`);
      return {
        person,
        roleTitle: a.roleTitle,
        category: a.category,
        billing: a.billing,
        featured: a.featured,
        organizations: a.organizations
          .map((slug) => orgBySlug.get(slug))
          .filter((o): o is Organization => Boolean(o)),
        safeLink: pickLink(person),
      };
    })
    .sort((a, b) => a.billing - b.billing);
}

export function getConfirmedSessions(
  content: SummitContent,
  editionSlug: string
): Session[] {
  return content.sessions
    .filter((s) => s.edition === editionSlug && s.status === "confirmed")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getHostOrganization(content: SummitContent): Organization | null {
  return content.organizations.find((o) => o.slug === "cross-future-hub") ?? null;
}
