import { expect, it } from "vitest";
import { POST as postContact } from "../app/api/contact/route";
import { POST as postRegistration } from "../app/api/registrations/route";
import seedAssembly from "../content/seed-assembly.json";
import { createDatabase } from "../db/client";
import { migrateDatabase } from "../db/migrate";
import { contactInquiries, registrations } from "../db/schema";
import type { SummitContent } from "../lib/content";
import { createSqliteSubmissionRepository } from "../lib/repositories/sqlite-submission-repository";
import type { SubmissionRepository } from "../lib/repositories/submission-repository";
import {
  createContactPost,
  createRegistrationPost,
} from "../lib/submissions/http-handlers";
import { seedDatabase } from "../scripts/db-seed";

it("returns field errors for malformed registration JSON", async () => {
  const response = await postRegistration(
    new Request("http://localhost/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bad" }),
    })
  );
  const body = await response.json();
  expect(response.status).toBe(400);
  expect(body.ok).toBe(false);
  expect(body.fieldErrors.email).toBeDefined();
});

it("rejects unexpected contact fields without echoing submitted data", async () => {
  const response = await postContact(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        edition: "2026-assembly",
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        inquiry: "General information",
        message: "Hello",
        unexpected: "private",
      }),
    })
  );
  const text = await response.text();
  expect(response.status).toBe(400);
  expect(text).not.toContain("private");
});

it("returns 201 only after a valid registration is persisted", async () => {
  const { db, client } = createDatabase(":memory:");
  await migrateDatabase(db);
  await seedDatabase(db, seedAssembly as unknown as SummitContent);
  const post = createRegistrationPost(createSqliteSubmissionRepository(db));

  const response = await post(
    new Request("http://localhost/api/registrations", {
      method: "POST",
      body: JSON.stringify({
        edition: seedAssembly.editions[0].slug,
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ADA@example.com",
        organization: "Analytical Engines",
        closest: "Research",
        access: "",
      }),
    })
  );

  expect(response.status).toBe(201);
  expect(await response.json()).toMatchObject({ ok: true, id: expect.any(Number) });
  expect(await db.select().from(registrations)).toMatchObject([
    { email: "ada@example.com", editionSlug: seedAssembly.editions[0].slug },
  ]);
  client.close();
});

it("returns 201 only after a valid contact inquiry is persisted", async () => {
  const { db, client } = createDatabase(":memory:");
  await migrateDatabase(db);
  await seedDatabase(db, seedAssembly as unknown as SummitContent);
  const post = createContactPost(createSqliteSubmissionRepository(db));

  const response = await post(
    new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        edition: seedAssembly.editions[0].slug,
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.com",
        inquiry: "General information",
        message: "Please send the programme.",
      }),
    })
  );

  expect(response.status).toBe(201);
  expect(await db.select().from(contactInquiries)).toHaveLength(1);
  client.close();
});

it("returns a safe 500 response when persistence fails", async () => {
  const failingRepository: SubmissionRepository = {
    createRegistration: async () => {
      throw new Error("database secret");
    },
    createContactInquiry: async () => {
      throw new Error("database secret");
    },
  };
  const response = await createRegistrationPost(failingRepository)(
    new Request("http://localhost/api/registrations", {
      method: "POST",
      body: JSON.stringify({
        edition: seedAssembly.editions[0].slug,
        firstName: "Safe",
        lastName: "Error",
        email: "safe@example.com",
        organization: "",
        closest: "Research",
        access: "",
      }),
    })
  );

  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain("database secret");
});
