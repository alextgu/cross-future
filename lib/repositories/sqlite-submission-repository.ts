import type { Database } from "../../db/client";
import { createDatabase } from "../../db/client";
import { contactInquiries, registrations } from "../../db/schema";
import type { SubmissionRepository } from "./submission-repository";

export function createSqliteSubmissionRepository(
  db: Database
): SubmissionRepository {
  return {
    async createRegistration(input) {
      const [row] = await db
        .insert(registrations)
        .values({
          editionSlug: input.edition,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          organization: input.organization,
          closest: input.closest,
          access: input.access,
          status: "new",
          createdAt: new Date(),
        })
        .returning({ id: registrations.id });
      return row;
    },

    async createContactInquiry(input) {
      const [row] = await db
        .insert(contactInquiries)
        .values({
          editionSlug: input.edition,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          inquiry: input.inquiry,
          message: input.message,
          status: "new",
          createdAt: new Date(),
        })
        .returning({ id: contactInquiries.id });
      return row;
    },
  };
}

let runtimeRepository: SubmissionRepository | undefined;

export function getSqliteSubmissionRepository() {
  if (!runtimeRepository) {
    runtimeRepository = createSqliteSubmissionRepository(createDatabase().db);
  }
  return runtimeRepository;
}
