import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  createD1SubmissionRepository,
  getD1SubmissionDatabase,
  type D1Database,
  type D1PreparedStatement,
} from "../lib/repositories/d1-submission-repository";
import { POST as postRegistration } from "../app/api/registrations/route";
import { createDatabase } from "../db/client";
import { migrateDatabase } from "../db/migrate";

type Row = Record<string, unknown>;

class FakeD1 implements D1Database {
  readonly statements: string[] = [];
  readonly registrations: Row[] = [];
  readonly contacts: Row[] = [];
  private nextId = 1;
  private readonly currentEditions = new Set(["2026-assembly"]);

  prepare(sql: string): D1PreparedStatement {
    this.statements.push(sql);
    let values: unknown[] = [];
    return {
      bind: (...bound) => {
        values = bound;
        return this.prepareBound(sql, values);
      },
      first: async () => null,
      run: async () => ({ meta: { last_row_id: 0 } }),
    };
  }

  private prepareBound(sql: string, values: unknown[]): D1PreparedStatement {
    return {
      bind: (...bound) => this.prepareBound(sql, bound),
      first: async <T>() => {
        if (sql.includes("FROM editions")) {
          const edition = String(values[0]);
          return (this.currentEditions.has(edition) ? { slug: edition } : null) as T | null;
        }
        return null;
      },
      run: async () => {
        const id = this.nextId++;
        if (sql.includes("INSERT INTO registrations")) {
          this.registrations.push({
            id,
            edition_slug: values[0],
            first_name: values[1],
            last_name: values[2],
            email: values[3],
            organization: values[4],
            closest: values[5],
            access: values[6],
            status: values[7],
            created_at: values[8],
          });
        }
        if (sql.includes("INSERT INTO contact_inquiries")) {
          this.contacts.push({
            id,
            edition_slug: values[0],
            first_name: values[1],
            last_name: values[2],
            email: values[3],
            inquiry: values[4],
            message: values[5],
            status: values[6],
            created_at: values[7],
          });
        }
        return { meta: { last_row_id: id } };
      },
    };
  }

  async batch() {
    return [];
  }
}

const registration = {
  edition: "2026-assembly",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  organization: "Analytical Engine Lab",
  closest: "Research" as const,
  access: "Captioning",
};

const contact = {
  edition: "2026-assembly",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
  inquiry: "General information" as const,
  message: "Please send the programme.",
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  delete (globalThis as Record<string, unknown>).SUBMISSIONS_DB;
});

it("commits registration and contact rows with the existing submission columns", async () => {
  vi.setSystemTime(new Date("2026-08-31T12:00:00.000Z"));
  const db = new FakeD1();
  const repository = createD1SubmissionRepository(db);

  await expect(repository.createRegistration(registration)).resolves.toEqual({ id: 1 });
  await expect(repository.createContactInquiry(contact)).resolves.toEqual({ id: 2 });

  expect(db.registrations[0]).toMatchObject({
    edition_slug: "2026-assembly",
    first_name: "Ada",
    email: "ada@example.com",
    status: "new",
    created_at: new Date("2026-08-31T12:00:00.000Z").getTime(),
  });
  expect(db.contacts[0]).toMatchObject({
    edition_slug: "2026-assembly",
    first_name: "Grace",
    email: "grace@example.com",
    status: "new",
  });
  expect(db.statements).toHaveLength(4);
});

it("migrates non-unique email indexes that accept repeat submissions", async () => {
  const { client, db } = createDatabase(":memory:");

  try {
    await migrateDatabase(db);
    await client.execute({
      sql: `INSERT INTO editions
        (slug, year, name, tagline, thesis, theme, starts_at, ends_at, timezone, venue, registration_url, status, is_current, seo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "2026-assembly",
        2026,
        "Assembly",
        "Future conference",
        "Building the future",
        "Future",
        "2026-08-31T09:00:00.000Z",
        "2026-08-31T17:00:00.000Z",
        "UTC",
        "{}",
        "https://example.com/register",
        "published",
        1,
        "{}",
      ],
    });

    await client.execute({
      sql: `INSERT INTO registrations
        (edition_slug, first_name, last_name, email, organization, closest, access, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "2026-assembly",
        "Ada",
        "Lovelace",
        "ada@example.com",
        "Analytical Engine Lab",
        "Research",
        "",
        "new",
        1,
        "2026-assembly",
        "Grace",
        "Hopper",
        "ada@example.com",
        "Compiler Lab",
        "Research",
        "",
        "new",
        2,
      ],
    });
    await client.execute({
      sql: `INSERT INTO contact_inquiries
        (edition_slug, first_name, last_name, email, inquiry, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "2026-assembly",
        "Ada",
        "Lovelace",
        "ada@example.com",
        "General information",
        "Please send the programme.",
        "new",
        1,
        "2026-assembly",
        "Grace",
        "Hopper",
        "ada@example.com",
        "General information",
        "Please send the programme.",
        "new",
        2,
      ],
    });

    const registrationIndexes = await client.execute("PRAGMA index_list('registrations')");
    const contactIndexes = await client.execute("PRAGMA index_list('contact_inquiries')");
    const registrationCount = await client.execute(
      "SELECT COUNT(*) AS count FROM registrations WHERE email = 'ada@example.com'"
    );
    const contactCount = await client.execute(
      "SELECT COUNT(*) AS count FROM contact_inquiries WHERE email = 'ada@example.com'"
    );

    expect(registrationIndexes.rows).toContainEqual(
      expect.objectContaining({ name: "registrations_email_idx", unique: 0 })
    );
    expect(contactIndexes.rows).toContainEqual(
      expect.objectContaining({ name: "contact_email_idx", unique: 0 })
    );
    expect(registrationCount.rows).toEqual([{ count: 2 }]);
    expect(contactCount.rows).toEqual([{ count: 2 }]);
  } finally {
    client.close();
  }
});

it("rejects an edition that is not current before inserting", async () => {
  const db = new FakeD1();
  const repository = createD1SubmissionRepository(db);

  await expect(
    repository.createRegistration({ ...registration, edition: "not-a-real-edition" })
  ).rejects.toThrow(/edition/i);
  expect(db.registrations).toHaveLength(0);
});

it("rejects invalid input even when the adapter is called directly", async () => {
  const repository = createD1SubmissionRepository(new FakeD1());

  await expect(
    repository.createRegistration({ ...registration, email: "not-an-email" } as never)
  ).rejects.toThrow(/invalid/i);
  await expect(
    repository.createContactInquiry({ ...contact, message: "" } as never)
  ).rejects.toThrow(/invalid/i);
});

it("resolves the D1 binding only for a production runtime", async () => {
  const db = new FakeD1();
  (globalThis as Record<string, unknown>).SUBMISSIONS_DB = db;

  vi.stubEnv("NODE_ENV", "test");
  expect(getD1SubmissionDatabase()).toBeNull();

  vi.stubEnv("NODE_ENV", "production");
  expect(getD1SubmissionDatabase()).toBe(db);
});

it("fails closed in production when the D1 binding is unavailable", async () => {
  vi.stubEnv("NODE_ENV", "production");

  const response = await postRegistration(
    new Request("http://localhost/api/registrations", {
      method: "POST",
      body: JSON.stringify(registration),
    })
  );

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    ok: false,
    message: "Submission storage is not configured.",
  });
});
