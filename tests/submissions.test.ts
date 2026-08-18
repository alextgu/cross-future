import { expect, it } from "vitest";
import { createDatabase } from "../db/client";
import { migrateDatabase } from "../db/migrate";
import { contactInquiries, registrations } from "../db/schema";
import { createSqliteSubmissionRepository } from "../lib/repositories/sqlite-submission-repository";
import {
  contactInquirySchema,
  registrationSchema,
} from "../lib/submissions/validation";

it("rejects a malformed registration email", () => {
  const result = registrationSchema.safeParse({
    edition: "2026-assembly",
    firstName: "A",
    lastName: "B",
    email: "bad",
    organization: "",
    closest: "Research",
    access: "",
  });
  expect(result.success).toBe(false);
});

it("persists normalized registration and contact submissions", async () => {
  const { db, client } = createDatabase(":memory:");
  await migrateDatabase(db);
  const repository = createSqliteSubmissionRepository(db);

  const registration = registrationSchema.parse({
    edition: "2026-assembly",
    firstName: " Ada ",
    lastName: " Lovelace ",
    email: " ADA@example.com ",
    organization: " Analytical Engine Lab ",
    closest: "Research",
    access: " Captioning ",
  });
  const contact = contactInquirySchema.parse({
    edition: "2026-assembly",
    firstName: " Grace ",
    lastName: " Hopper ",
    email: " GRACE@example.com ",
    inquiry: "General information",
    message: " Please send the schedule. ",
  });

  await repository.createRegistration(registration);
  await repository.createContactInquiry(contact);

  expect(await db.select().from(registrations)).toMatchObject([
    { firstName: "Ada", email: "ada@example.com", status: "new" },
  ]);
  expect(await db.select().from(contactInquiries)).toMatchObject([
    { firstName: "Grace", email: "grace@example.com", status: "new" },
  ]);
  client.close();
});
