import { expect, it } from "vitest";
import seedAssembly from "../content/seed-assembly.json";
import type { SummitContent } from "../lib/content";
import { createDatabase } from "../db/client";
import { migrateDatabase } from "../db/migrate";
import { people, siteContent } from "../db/schema";
import { eq } from "drizzle-orm";
import { seedDatabase } from "../scripts/db-seed";
import { createSqliteContentRepository } from "../lib/repositories/sqlite-content-repository";

it("reconstructs the Assembly domain shape", async () => {
  const { db, client } = createDatabase(":memory:");
  await migrateDatabase(db);
  await seedDatabase(db, seedAssembly as unknown as SummitContent);

  const content = await createSqliteContentRepository(db).getSummitContent();
  expect(content.editions).toEqual(seedAssembly.editions);
  expect(content.people).toHaveLength(seedAssembly.people.length);
  expect(content.assembly?.heroLines).toEqual(seedAssembly.assembly.heroLines);

  await db
    .update(people)
    .set({ firstName: "Database" })
    .where(eq(people.slug, seedAssembly.people[0].slug));
  const updated = await createSqliteContentRepository(db).getSummitContent();
  expect(
    updated.people.find((person) => person.slug === seedAssembly.people[0].slug)
      ?.firstName
  ).toBe("Database");

  client.close();
});

it("rejects malformed presentation JSON at the repository boundary", async () => {
  const { db, client } = createDatabase(":memory:");
  await migrateDatabase(db);
  await seedDatabase(db, seedAssembly as unknown as SummitContent);
  await db
    .update(siteContent)
    .set({ assembly: {} as never })
    .where(eq(siteContent.editionSlug, seedAssembly.editions[0].slug));

  await expect(
    createSqliteContentRepository(db).getSummitContent()
  ).rejects.toThrow("Database presentation content is invalid");

  client.close();
});
