import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type {
  AppearanceCategory,
  AssemblyContent,
  ChainStage,
  EditionStatus,
  MediaAsset,
  PersonLink,
  SessionStatus,
  SummitContent,
  Venue,
} from "../lib/content";

export type SubmissionStatus = "new" | "reviewed" | "archived";

export const editions = sqliteTable("editions", {
  slug: text("slug").primaryKey(),
  year: integer("year").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  thesis: text("thesis").notNull(),
  theme: text("theme").notNull(),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  timezone: text("timezone").notNull(),
  venue: text("venue", { mode: "json" }).$type<Venue>().notNull(),
  registrationUrl: text("registration_url").notNull(),
  status: text("status").$type<EditionStatus>().notNull(),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull(),
  seo: text("seo", { mode: "json" })
    .$type<{ title: string; description: string }>()
    .notNull(),
  optional: text("optional", { mode: "json" }).$type<Record<string, unknown>>(),
});

export const organizations = sqliteTable("organizations", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  country: text("country").notNull(),
});

export const people = sqliteTable("people", {
  slug: text("slug").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  headshot: text("headshot", { mode: "json" })
    .$type<{ sourceUrl: string; alt: string; focalPoint: { x: number; y: number } }>()
    .notNull(),
  links: text("links", { mode: "json" }).$type<PersonLink[]>().notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull(),
  bio: text("bio").notNull(),
});

export const appearances = sqliteTable(
  "appearances",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    personSlug: text("person_slug")
      .notNull()
      .references(() => people.slug),
    editionSlug: text("edition_slug")
      .notNull()
      .references(() => editions.slug),
    organizations: text("organizations", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    roleTitle: text("role_title").notNull(),
    category: text("category").$type<AppearanceCategory>().notNull(),
    billing: integer("billing").notNull(),
    featured: integer("featured", { mode: "boolean" }).notNull(),
    thesis: text("thesis"),
  },
  (table) => [
    index("appearances_person_idx").on(table.personSlug),
    index("appearances_edition_idx").on(table.editionSlug),
    index("appearances_billing_idx").on(table.billing),
  ]
);

export const tracks = sqliteTable("tracks", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  chainStage: text("chain_stage").$type<ChainStage>().notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    editionSlug: text("edition_slug")
      .notNull()
      .references(() => editions.slug),
    trackCode: text("track_code")
      .notNull()
      .references(() => tracks.code),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
    room: text("room"),
    speakers: text("speakers", { mode: "json" }).$type<string[]>().notNull(),
    status: text("status").$type<SessionStatus>().notNull(),
    code: text("code"),
    categoryLabel: text("category_label"),
    speakerLabel: text("speaker_label"),
    description: text("description"),
    outcomes: text("outcomes", { mode: "json" }).$type<string[]>(),
  },
  (table) => [
    index("sessions_edition_idx").on(table.editionSlug),
    index("sessions_starts_idx").on(table.startsAt),
  ]
);

export const partners = sqliteTable("partners", {
  slug: text("slug").primaryKey(),
  name: text("name"),
  logo: text("logo", { mode: "json" })
    .$type<{ sourceUrl: string; alt: string }>()
    .notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  image: text("image", { mode: "json" })
    .$type<{ sourceUrl: string; alt: string }>()
    .notNull(),
  issuer: text("issuer").notNull(),
});

export const interviews = sqliteTable("interviews", {
  code: text("code").primaryKey(),
  title: text("title").notNull(),
  personSlug: text("person_slug")
    .notNull()
    .references(() => people.slug),
  durationMin: integer("duration_min").notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull(),
  pullQuote: text("pull_quote"),
  image: text("image", { mode: "json" }).$type<MediaAsset>(),
  url: text("url"),
});

export const siteContent = sqliteTable("site_content", {
  editionSlug: text("edition_slug")
    .primaryKey()
    .references(() => editions.slug),
  assembly: text("assembly", { mode: "json" }).$type<AssemblyContent>().notNull(),
  sourceDocument: text("source_document", { mode: "json" })
    .$type<SummitContent>()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const registrations = sqliteTable(
  "registrations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    editionSlug: text("edition_slug").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    organization: text("organization").notNull().default(""),
    closest: text("closest").notNull(),
    access: text("access").notNull().default(""),
    status: text("status").$type<SubmissionStatus>().notNull().default("new"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("registrations_edition_idx").on(table.editionSlug),
    index("registrations_email_idx").on(table.email),
    index("registrations_created_idx").on(table.createdAt),
  ]
);

export const contactInquiries = sqliteTable(
  "contact_inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    editionSlug: text("edition_slug").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    inquiry: text("inquiry").notNull(),
    message: text("message").notNull(),
    status: text("status").$type<SubmissionStatus>().notNull().default("new"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("contact_edition_idx").on(table.editionSlug),
    index("contact_email_idx").on(table.email),
    index("contact_created_idx").on(table.createdAt),
  ]
);
