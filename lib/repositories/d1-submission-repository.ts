import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  contactInquirySchema,
  registrationSchema,
} from "../submissions/validation";
import type {
  ContactInquiryInput,
  RegistrationInput,
} from "../submissions/contracts";
import {
  UnknownEditionError,
  type SubmissionRepository,
} from "./submission-repository";

/** The subset of the Workers D1 API used by the submission adapter. */
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(columnName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success?: boolean;
  meta?: {
    last_row_id?: number | bigint | string;
    changes?: number;
  };
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export const SUBMISSIONS_D1_BINDING = "SUBMISSIONS_DB";

export class InvalidSubmissionError extends Error {
  constructor() {
    super("The submission data is invalid.");
    this.name = "InvalidSubmissionError";
  }
}

function parseInput<T>(schema: { safeParse(value: unknown): { success: true; data: T } | { success: false } }, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new InvalidSubmissionError();
  return parsed.data;
}

function insertedId(result: D1Result): number {
  const value = Number(result.meta?.last_row_id);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error("D1 did not return an inserted submission id.");
  }
  return value;
}

export function createD1SubmissionRepository(db: D1Database): SubmissionRepository {
  async function assertCurrentEdition(editionSlug: string) {
    const row = await db
      .prepare(
        "SELECT slug FROM editions WHERE slug = ? AND is_current = 1 LIMIT 1"
      )
      .bind(editionSlug)
      .first<{ slug: string }>();
    if (!row) throw new UnknownEditionError();
  }

  return {
    async createRegistration(input: RegistrationInput) {
      const valid = parseInput(registrationSchema, input);
      await assertCurrentEdition(valid.edition);
      const result = await db
        .prepare(
          "INSERT INTO registrations (edition_slug, first_name, last_name, email, organization, closest, access, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          valid.edition,
          valid.firstName,
          valid.lastName,
          valid.email,
          valid.organization,
          valid.closest,
          valid.access,
          "new",
          Date.now()
        )
        .run();
      return { id: insertedId(result) };
    },

    async createContactInquiry(input: ContactInquiryInput) {
      const valid = parseInput(contactInquirySchema, input);
      await assertCurrentEdition(valid.edition);
      const result = await db
        .prepare(
          "INSERT INTO contact_inquiries (edition_slug, first_name, last_name, email, inquiry, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          valid.edition,
          valid.firstName,
          valid.lastName,
          valid.email,
          valid.inquiry,
          valid.message,
          "new",
          Date.now()
        )
        .run();
      return { id: insertedId(result) };
    },
  };
}

function isD1Database(value: unknown): value is D1Database {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as { prepare?: unknown }).prepare === "function"
  );
}

/**
 * Resolve the request-scoped Cloudflare binding only in production. Next's
 * Node runtime and Vitest intentionally return null so they keep using SQLite.
 */
export function getD1SubmissionDatabase(): D1Database | null {
  if (process.env.NODE_ENV !== "production") return null;

  try {
    const globalValue = (globalThis as Record<string, unknown>)[
      SUBMISSIONS_D1_BINDING
    ];
    if (isD1Database(globalValue)) return globalValue;

    const context = getCloudflareContext();
    const value = (context.env as Record<string, unknown>)[
      SUBMISSIONS_D1_BINDING
    ];
    return isD1Database(value) ? value : null;
  } catch {
    return null;
  }
}
