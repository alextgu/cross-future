import type { Database } from "../../db/client";
import { createDatabase } from "../../db/client";
import { and, eq } from "drizzle-orm";
import { contactInquiries, editions, registrations } from "../../db/schema";
import {
  UnknownEditionError,
  type SubmissionRepository,
} from "./submission-repository";

export function createSqliteSubmissionRepository(
  db: Database
): SubmissionRepository {
  async function assertCurrentEdition(editionSlug: string) {
    const [edition] = await db
      .select({ slug: editions.slug })
      .from(editions)
      .where(
        and(eq(editions.slug, editionSlug), eq(editions.isCurrent, true))
      )
      .limit(1);
    if (!edition) throw new UnknownEditionError();
  }

  return {
    async createRegistration(input) {
      await assertCurrentEdition(input.edition);
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
      await assertCurrentEdition(input.edition);
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
