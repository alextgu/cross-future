import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { SummitContent } from "../lib/content";
import seedAssembly from "../content/seed-assembly.json";
import { createDatabase, type Database } from "../db/client";
import { migrateDatabase } from "../db/migrate";
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
} from "../db/schema";

export async function seedDatabase(db: Database, source: SummitContent) {
  const content = source;
  const current = content.editions.find((edition) => edition.isCurrent);

  if (!current || !content.assembly) {
    throw new Error("Assembly seed requires a current edition and presentation content.");
  }
  const assembly = content.assembly;

  await db.transaction(async (tx) => {
    await tx.delete(siteContent);
    await tx.delete(sessions);
    await tx.delete(appearances);
    await tx.delete(interviews);
    await tx.delete(documents);
    await tx.delete(partners);
    await tx.delete(tracks);
    await tx.delete(people);
    await tx.delete(organizations);
    await tx.delete(editions);

    await tx.insert(editions).values(
      content.editions.map((edition) => {
        const {
          slug,
          year,
          name,
          tagline,
          thesis,
          theme,
          startsAt,
          endsAt,
          timezone,
          venue,
          registrationUrl,
          status,
          isCurrent,
          seo,
          ...optional
        } = edition;
        return {
          slug,
          year,
          name,
          tagline,
          thesis,
          theme,
          startsAt,
          endsAt,
          timezone,
          venue,
          registrationUrl,
          status,
          isCurrent,
          seo,
          optional,
        };
      })
    );

    if (content.organizations.length) {
      await tx.insert(organizations).values(content.organizations);
    }
    if (content.people.length) {
      await tx.insert(people).values(content.people);
    }
    if (content.tracks.length) {
      await tx.insert(tracks).values(content.tracks);
    }
    if (content.appearances.length) {
      await tx.insert(appearances).values(
        content.appearances.map(({ person, edition, ...appearance }) => ({
          ...appearance,
          personSlug: person,
          editionSlug: edition,
        }))
      );
    }
    if (content.sessions.length) {
      await tx.insert(sessions).values(
        content.sessions.map(({ edition, track, ...session }) => ({
          ...session,
          editionSlug: edition,
          trackCode: track,
        }))
      );
    }
    if (content.partners.length) {
      await tx.insert(partners).values(content.partners);
    }
    if (content.documents.length) {
      await tx.insert(documents).values(content.documents);
    }
    if (content.interviews?.length) {
      await tx.insert(interviews).values(
        content.interviews.map(({ person, ...interview }) => ({
          ...interview,
          personSlug: person,
        }))
      );
    }

    await tx.insert(siteContent).values({
      editionSlug: current.slug,
      assembly,
      sourceDocument: content,
      updatedAt: new Date(),
    });
  });
}

async function run() {
  await mkdir("data", { recursive: true });
  const { db, client } = createDatabase();
  try {
    await migrateDatabase(db);
    await seedDatabase(db, seedAssembly as unknown as SummitContent);
    console.log(
      `seeded ${seedAssembly.editions.length} edition · ${seedAssembly.people.length} people · ${seedAssembly.sessions.length} sessions`
    );
  } finally {
    client.close();
  }
}

const isDirectRun = process.argv[1]
  ? fileURLToPath(import.meta.url) === process.argv[1]
  : false;

if (isDirectRun) {
  run().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
