import { expect, it } from "vitest";
import seedAssembly from "../content/seed-assembly.json";
import type { SummitContent } from "../lib/content";
import { createDatabase } from "../db/client";
import { migrateDatabase } from "../db/migrate";
import { editions, registrations, siteContent } from "../db/schema";
import { seedDatabase } from "../scripts/db-seed";

it("migrates and seeds event content without creating submissions", async () => {
  const { db, client } = createDatabase(":memory:");
  await migrateDatabase(db);
  await seedDatabase(db, seedAssembly as unknown as SummitContent);

  expect(await db.select().from(editions)).toHaveLength(1);
  expect(await db.select().from(siteContent)).toHaveLength(1);
  expect(await db.select().from(registrations)).toHaveLength(0);

  client.close();
});
