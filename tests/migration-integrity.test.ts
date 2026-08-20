import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterEach, expect, it } from "vitest";
import { createDatabase } from "../db/client";
import { migrateDatabase } from "../db/migrate";

const temporaryFolders: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryFolders.splice(0).map((folder) =>
      rm(folder, { recursive: true, force: true })
    )
  );
});

it("fails the FK migration before copying a legacy orphan submission", async () => {
  const partialFolder = await mkdtemp(path.join(tmpdir(), "cross-future-migration-"));
  temporaryFolders.push(partialFolder);
  await mkdir(path.join(partialFolder, "meta"));

  const journal = JSON.parse(
    await readFile(path.resolve("drizzle/meta/_journal.json"), "utf8")
  ) as { entries: unknown[]; [key: string]: unknown };
  await writeFile(
    path.join(partialFolder, "meta/_journal.json"),
    JSON.stringify({ ...journal, entries: journal.entries.slice(0, 1) })
  );
  await writeFile(
    path.join(partialFolder, "0000_perfect_talon.sql"),
    await readFile(path.resolve("drizzle/0000_perfect_talon.sql"), "utf8")
  );

  const { db, client } = createDatabase(":memory:");
  await migrate(db, { migrationsFolder: partialFolder });
  await client.execute({
    sql: `INSERT INTO registrations
      (edition_slug, first_name, last_name, email, organization, closest, access, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "missing-edition",
      "Legacy",
      "Orphan",
      "legacy@example.com",
      "",
      "Research",
      "",
      "new",
      Date.now(),
    ],
  });

  await expect(migrateDatabase(db)).rejects.toThrow();
  const rows = await client.execute(
    "SELECT edition_slug FROM registrations ORDER BY id"
  );
  expect(rows.rows[0]?.edition_slug).toBe("missing-edition");

  client.close();
});

it("preserves a legacy interview while adding its stable slug", async () => {
  const partialFolder = await mkdtemp(path.join(tmpdir(), "cross-future-migration-"));
  temporaryFolders.push(partialFolder);
  await mkdir(path.join(partialFolder, "meta"));

  const journal = JSON.parse(
    await readFile(path.resolve("drizzle/meta/_journal.json"), "utf8")
  ) as { entries: unknown[]; [key: string]: unknown };
  await writeFile(
    path.join(partialFolder, "meta/_journal.json"),
    JSON.stringify({ ...journal, entries: journal.entries.slice(0, 1) })
  );
  await writeFile(
    path.join(partialFolder, "0000_perfect_talon.sql"),
    await readFile(path.resolve("drizzle/0000_perfect_talon.sql"), "utf8")
  );

  const { db, client } = createDatabase(":memory:");
  await migrate(db, { migrationsFolder: partialFolder });
  await client.execute({
    sql: `INSERT INTO people
      (slug, first_name, last_name, headshot, links, verified, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "legacy-person",
      "Legacy",
      "Person",
      JSON.stringify({
        sourceUrl: "/legacy.svg",
        alt: "Legacy portrait",
        focalPoint: { x: 50, y: 50 },
      }),
      JSON.stringify([]),
      0,
      "Legacy biography",
    ],
  });
  await client.execute({
    sql: `INSERT INTO interviews
      (code, title, person_slug, duration_min, featured, pull_quote, image, url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "IV.99",
      "Legacy recording",
      "legacy-person",
      9,
      0,
      null,
      null,
      null,
    ],
  });

  const interviewMigration = (await readdir(path.resolve("drizzle"))).find(
    (filename) => /^0002_.*\.sql$/.test(filename)
  );
  expect(interviewMigration).toBeDefined();
  await writeFile(
    path.join(partialFolder, "meta/_journal.json"),
    JSON.stringify({
      ...journal,
      entries: [journal.entries[0], journal.entries[2]],
    })
  );
  await writeFile(
    path.join(partialFolder, interviewMigration!),
    await readFile(path.resolve("drizzle", interviewMigration!), "utf8")
  );
  await migrate(db, { migrationsFolder: partialFolder });
  const rows = await client.execute(
    "SELECT code, slug, edition_year, topics FROM interviews WHERE code = 'IV.99'"
  );
  expect(rows.rows).toEqual([
    {
      code: "IV.99",
      slug: "legacy-person-iv-99",
      edition_year: null,
      topics: null,
    },
  ]);

  client.close();
});
