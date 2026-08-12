/**
 * Content adapter. This is the ONLY module allowed to import content/seed.json.
 * Every component reads through getSummitContent(); to swap in a CMS, reimplement
 * that one function (switch on process.env.CONTENT_SOURCE) and nothing else moves.
 */
import seed from "@/content/seed.json";
import seedNexus from "@/content/seed-nexus.json";
import seedAssembly from "@/content/seed-assembly.json";

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
  /* Optional fields used by the "nexus" variant */
  editionNumber?: number;
  format?: string;
  coordinates?: { lat: number; lng: number };
  contactEmail?: string;
  socialLinks?: { label: string; url: string }[];
  heroFigure?: { imageUrl: string; alt: string; label: string };
  heroStatement?: string;
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
  /** Edition-specific one-line thesis (nexus variant, faculty pillar hover). */
  thesis?: string;
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
  /* Optional fields used by the "nexus" variant */
  code?: string; // S.01…
  categoryLabel?: string; // OPENING, KEYNOTE…
  speakerLabel?: string; // display name when speakers[] is empty or joined
  description?: string;
  outcomes?: string[];
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

export interface ManifestoBlock {
  sectionLabel: string;
  sublabel: string;
  thesisPrefix: string;
  thesisAccent: string;
  thesisSuffix: string;
  paragraphs: string[];
  pillars: { num: string; title: string; text: string }[];
}

export interface Interview {
  code: string;
  title: string;
  person: string; // person slug
  durationMin: number;
  featured: boolean;
  pullQuote?: string;
  image?: { sourceUrl: string; alt: string };
  url?: string;
}

export interface ArchiveItem {
  edition: string; // display label, e.g. "ED.01"
  caption: string;
  image: { sourceUrl: string; alt: string };
}

/* ---------- Media (used by the "assembly" variant) ----------
 *
 * One shape for every picture and every clip on the site. The design has a
 * lot of media slots by intent, so the slot is described in the content —
 * never guessed by the component. `aspect` reserves the space before the
 * asset loads, so swapping a placeholder for real media never reflows.
 */

export type MediaKind = "image" | "video";

export interface MediaAsset {
  kind: MediaKind;
  /** Image URL, or video URL when kind === "video". Local or remote. */
  src: string;
  /** Still shown before a video plays. Required in practice for kind "video". */
  poster?: string;
  alt: string;
  /** CSS aspect-ratio, e.g. "16 / 9". Defaults per slot in the component. */
  aspect?: string;
  /** object-position, 0–100 on each axis. Defaults to dead centre. */
  focalPoint?: { x: number; y: number };
  caption?: string;
  credit?: string;
  /** True while the asset is a stand-in, so placeholders are auditable. */
  placeholder?: boolean;
}

export interface FactCard {
  label: string;
  lines: string[];
}

export interface FocusArea {
  code: string;
  title: string;
  text: string;
  media?: MediaAsset;
}

export interface StatItem {
  value: string;
  label: string;
}

export type FeatureGlyph = "chip" | "grid" | "bolt" | "node" | "wave" | "cross";

export interface FeatureItem {
  glyph: FeatureGlyph;
  title: string;
  text: string;
}

export interface StoryChapter {
  num: string;
  title: string;
  text: string;
  glyph: FeatureGlyph;
  media: MediaAsset;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface VoiceItem {
  quote: string;
  name: string;
  role: string;
  /** Person slug when the speaker is in people[]; used to reuse their portrait. */
  person?: string;
  media?: MediaAsset;
}

export interface JournalPost {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  readMin: number;
  media: MediaAsset;
}

export interface PastEdition {
  label: string;
  year: number;
  city: string;
  headline: string;
  stats: StatItem[];
  media: MediaAsset;
}

export interface LetterItem {
  title: string;
  issuer: string;
  date: string;
  excerpt: string;
  crest?: MediaAsset;
  document: MediaAsset;
}

/**
 * The right-hand sticky rail: a media card that links onward, then a ticket
 * stub. Both live in content so the rail can differ per page without a code
 * change.
 */
export interface RailContent {
  feature: { title: string; ctaLabel: string; ctaHref: string; media: MediaAsset };
  ticket: {
    title: string;
    text: string;
    ctaLabel: string;
    ctaHref: string;
    media: MediaAsset;
    stub: { label: string; value: string }[];
  };
}

export interface AssemblyPageIntro {
  eyebrow: string;
  title: string;
  lede: string;
  media?: MediaAsset;
}

/**
 * Presentational content specific to the "assembly" variant, namespaced so
 * it cannot collide with another variant's fields. The core collections
 * (editions, people, appearances, tracks, sessions, partners, documents)
 * stay in the shared shape and feed the shared derived views.
 */
export interface AssemblyContent {
  heroMedia: MediaAsset;
  heroKicker: string;
  heroLines: string[];
  facts: FactCard[];
  marquee: string[];
  rail: RailContent;
  story: StoryChapter[];
  focusAreas: FocusArea[];
  focusMedia?: MediaAsset;
  features: FeatureItem[];
  stats: StatItem[];
  voices: VoiceItem[];
  faq: FaqItem[];
  journal: JournalPost[];
  pastEditions: PastEdition[];
  letters: LetterItem[];
  gallery: MediaAsset[];
  registerBenefits: string[];
  contact: {
    email: string;
    note: string;
    inquiryTypes: string[];
    social: { label: string; url: string }[];
  };
  footerBand: MediaAsset;
  /** Per-page hero intros, keyed by route segment ("about", "speakers", …). */
  pageIntros: Record<string, AssemblyPageIntro>;
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
  /* Optional collections used by the "nexus" variant */
  manifesto?: ManifestoBlock;
  interviews?: Interview[];
  registerBenefits?: string[];
  archives?: ArchiveItem[];
  footerImage?: { sourceUrl: string; alt: string };
  /* Optional block used by the "assembly" variant */
  assembly?: AssemblyContent;
}

/* ---------- The adapter ---------- */

export type ContentVariant = "default" | "nexus" | "assembly";

/**
 * Async so a CMS-backed implementation is a drop-in replacement.
 * CONTENT_SOURCE=local reads the seed files; any other value should be
 * handled by the future implementation. Each design variation is just a
 * different document set behind the same shape.
 */
export async function getSummitContent(
  variant: ContentVariant = "default"
): Promise<SummitContent> {
  switch (variant) {
    case "nexus":
      return seedNexus as SummitContent;
    case "assembly":
      return seedAssembly as unknown as SummitContent;
    default:
      return seed as SummitContent;
  }
}

/**
 * Assembly's presentational block, with a loud failure rather than a page of
 * empty sections. Every assembly route calls this once.
 */
export function getAssembly(content: SummitContent): AssemblyContent {
  if (!content.assembly) {
    throw new Error(
      'seed-assembly.json: missing the "assembly" block required by the assembly variant'
    );
  }
  return content.assembly;
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

/**
 * Sessions that are on the plan but not yet announced. Used by the agenda's
 * "shape of the day" block, which sits alongside — never instead of — the
 * designed empty state.
 */
export function getProposedSessions(
  content: SummitContent,
  editionSlug: string
): Session[] {
  return content.sessions
    .filter((s) => s.edition === editionSlug && s.status === "proposed")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getHostOrganization(content: SummitContent): Organization | null {
  return content.organizations.find((o) => o.slug === "cross-future-hub") ?? null;
}

/* ---------- Derived views for the "assembly" variant ---------- */

export const CATEGORY_LABEL: Record<AppearanceCategory, string> = {
  research: "Research",
  industry: "Industry",
  ecosystem: "Ecosystem",
};

/** Faculty bucketed by category, in the fixed display order, empties dropped. */
export function getFacultyByCategory(
  faculty: FacultyMember[]
): { category: AppearanceCategory; label: string; members: FacultyMember[] }[] {
  const order: AppearanceCategory[] = ["research", "industry", "ecosystem"];
  return order
    .map((category) => ({
      category,
      label: CATEGORY_LABEL[category],
      members: faculty.filter((m) => m.category === category),
    }))
    .filter((group) => group.members.length > 0);
}

/** An interview joined with the person it features. Unknown slugs are dropped. */
export interface InterviewCard {
  interview: Interview;
  person: Person | null;
  orgLine: string;
}

export function getInterviewCards(
  content: SummitContent,
  faculty: FacultyMember[]
): InterviewCard[] {
  const personBySlug = new Map(content.people.map((p) => [p.slug, p]));
  const orgLineBySlug = new Map(
    faculty.map((m) => [
      m.person.slug,
      m.organizations.length > 0
        ? m.organizations.map((o) => o.shortName).join(" / ")
        : m.roleTitle,
    ])
  );
  return (content.interviews ?? []).map((interview) => ({
    interview,
    person: personBySlug.get(interview.person) ?? null,
    orgLine: orgLineBySlug.get(interview.person) ?? "",
  }));
}

/** Partners grouped by their `type`, preserving first-seen order. */
export function getPartnersByType(
  content: SummitContent
): { type: string; partners: Partner[] }[] {
  const groups = new Map<string, Partner[]>();
  for (const partner of content.partners) {
    const list = groups.get(partner.type) ?? [];
    list.push(partner);
    groups.set(partner.type, list);
  }
  return [...groups].map(([type, partners]) => ({ type, partners }));
}

/* ---------- Formatting (single source of truth for dates) ---------- */

export function formatEditionDate(
  edition: Edition,
  options: Intl.DateTimeFormatOptions = { dateStyle: "long" }
): string {
  return new Intl.DateTimeFormat("en-CA", {
    ...options,
    timeZone: edition.timezone,
  }).format(new Date(edition.startsAt));
}

/** "08:30 – 17:30" for the edition's own day. */
export function formatEditionHours(edition: Edition): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: edition.timezone,
  });
  return `${fmt.format(new Date(edition.startsAt))} – ${fmt.format(
    new Date(edition.endsAt)
  )}`;
}

export function formatSessionTime(session: Session, timezone: string): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
  return `${fmt.format(new Date(session.startsAt))} – ${fmt.format(
    new Date(session.endsAt)
  )}`;
}

export function sessionDurationMin(session: Session): number {
  return Math.round(
    (new Date(session.endsAt).getTime() - new Date(session.startsAt).getTime()) /
      60000
  );
}
