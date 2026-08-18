import { eq } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "../../db/client";
import {
  appearances,
  documents,
  editions,
  interviews,
  organizations,
  partners,
  people,
  sessions,
  siteContent,
  tracks,
} from "../../db/schema";
import type {
  Appearance,
  Edition,
  Interview,
  Session,
  SummitContent,
} from "../content";
import type { ContentRepository } from "./content-repository";

const assemblySchema = z
  .object({
    heroLines: z.array(z.string()).min(1),
    facts: z.array(z.unknown()),
    rail: z.object({}).passthrough(),
    contact: z.object({ email: z.string().email() }).passthrough(),
    pageIntros: z.record(z.string(), z.unknown()),
  })
  .passthrough();

const sourceDocumentSchema = z
  .object({
    editions: z.array(z.object({ slug: z.string(), isCurrent: z.boolean() })),
    organizations: z.array(z.object({ slug: z.string() })),
    people: z.array(z.object({ slug: z.string() })),
    appearances: z.array(z.object({ person: z.string() })),
    tracks: z.array(z.object({ code: z.string() })),
    sessions: z.array(z.object({ title: z.string() })),
    partners: z.array(z.object({ slug: z.string() })),
    documents: z.array(z.object({ title: z.string() })),
    interviews: z.array(z.object({ code: z.string() })).optional(),
    assembly: assemblySchema,
  })
  .passthrough();

function inSourceOrder<T>(
  rows: T[],
  sourceKeys: string[],
  getKey: (row: T) => string
) {
  const rank = new Map(sourceKeys.map((key, index) => [key, index]));
  return rows.toSorted((left, right) => {
    const leftKey = getKey(left);
    const rightKey = getKey(right);
    return (
      (rank.get(leftKey) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(rightKey) ?? Number.MAX_SAFE_INTEGER) ||
      leftKey.localeCompare(rightKey)
    );
  });
}

export function createSqliteContentRepository(db: Database): ContentRepository {
  return {
    async getSummitContent() {
      const editionRows = await db.select().from(editions);
      const current = editionRows.find((edition) => edition.isCurrent);
      if (!current) {
        throw new Error("Database content has no current edition.");
      }

      const [record] = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.editionSlug, current.slug))
        .limit(1);
      if (!record) {
        throw new Error(
          "No site content is available. Run `npm run db:setup` before using database content."
        );
      }

      const parsedSource = sourceDocumentSchema.safeParse(
        record.sourceDocument as unknown
      );
      const parsedAssembly = assemblySchema.safeParse(record.assembly as unknown);
      if (!parsedSource.success || !parsedAssembly.success) {
        throw new Error(
          "Database presentation content is invalid. Re-run `npm run db:setup`."
        );
      }
      const source = parsedSource.data as unknown as SummitContent;

      const [
        organizationRows,
        peopleRows,
        appearanceRows,
        trackRows,
        sessionRows,
        partnerRows,
        documentRows,
        interviewRows,
      ] = await Promise.all([
        db.select().from(organizations),
        db.select().from(people),
        db.select().from(appearances),
        db.select().from(tracks),
        db.select().from(sessions),
        db.select().from(partners),
        db.select().from(documents),
        db.select().from(interviews),
      ]);

      const editionContent = editionRows.map(({ optional, ...edition }) => ({
        ...(optional ?? {}),
        ...edition,
      })) as Edition[];
      const appearanceContent = appearanceRows.map(
        ({ id: _id, personSlug, editionSlug, ...appearance }) => ({
          ...appearance,
          person: personSlug,
          edition: editionSlug,
        })
      ) as Appearance[];
      const sessionContent = sessionRows.map(
        ({ id: _id, editionSlug, trackCode, ...session }) => ({
          ...session,
          edition: editionSlug,
          track: trackCode,
        })
      ) as Session[];
      const documentContent = documentRows.map(({ id: _id, ...document }) => document);
      const interviewContent = interviewRows.map(
        ({ personSlug, ...interview }) => ({
          ...interview,
          person: personSlug,
        })
      ) as Interview[];

      return {
        ...source,
        editions: inSourceOrder(
          editionContent,
          source.editions.map((edition) => edition.slug),
          (edition) => edition.slug
        ),
        organizations: inSourceOrder(
          organizationRows,
          source.organizations.map((organization) => organization.slug),
          (organization) => organization.slug
        ),
        people: inSourceOrder(
          peopleRows,
          source.people.map((person) => person.slug),
          (person) => person.slug
        ),
        appearances: inSourceOrder(
          appearanceContent,
          source.appearances.map((appearance) => appearance.person),
          (appearance) => appearance.person
        ),
        tracks: inSourceOrder(
          trackRows,
          source.tracks.map((track) => track.code),
          (track) => track.code
        ),
        sessions: inSourceOrder(
          sessionContent,
          source.sessions.map((session) => session.code ?? session.title),
          (session) => session.code ?? session.title
        ),
        partners: inSourceOrder(
          partnerRows,
          source.partners.map((partner) => partner.slug),
          (partner) => partner.slug
        ),
        documents: inSourceOrder(
          documentContent,
          source.documents.map((document) => document.title),
          (document) => document.title
        ),
        interviews: inSourceOrder(
          interviewContent,
          (source.interviews ?? []).map((interview) => interview.code),
          (interview) => interview.code
        ),
        assembly: parsedAssembly.data as unknown as SummitContent["assembly"],
      };
    },
  };
}
