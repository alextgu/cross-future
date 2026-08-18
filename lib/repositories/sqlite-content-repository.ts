import { eq } from "drizzle-orm";
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
} from "../content";
import {
  assemblyContentSchema,
  summitContentSchema,
} from "../content-schema";
import type { ContentRepository } from "./content-repository";

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

      const parsedSource = summitContentSchema.safeParse(
        record.sourceDocument as unknown
      );
      const parsedAssembly = assemblyContentSchema.safeParse(
        record.assembly as unknown
      );
      if (!parsedSource.success || !parsedAssembly.success) {
        throw new Error(
          "Database presentation content is invalid. Re-run `npm run db:setup`."
        );
      }
      const source = parsedSource.data;

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
          thesis: appearance.thesis ?? undefined,
        })
      ) as Appearance[];
      const sessionContent = sessionRows.map(
        ({ id: _id, editionSlug, trackCode, ...session }) => ({
          ...session,
          edition: editionSlug,
          track: trackCode,
          code: session.code ?? undefined,
          categoryLabel: session.categoryLabel ?? undefined,
          speakerLabel: session.speakerLabel ?? undefined,
          description: session.description ?? undefined,
          outcomes: session.outcomes ?? undefined,
        })
      ) as Session[];
      const documentContent = documentRows.map(({ id: _id, ...document }) => document);
      const interviewContent = interviewRows.map(
        ({ personSlug, ...interview }) => ({
          ...interview,
          person: personSlug,
          pullQuote: interview.pullQuote ?? undefined,
          image: interview.image ?? undefined,
          url: interview.url ?? undefined,
        })
      ) as Interview[];

      return summitContentSchema.parse({
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
        assembly: parsedAssembly.data,
      });
    },
  };
}
