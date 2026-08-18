# Local Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a no-cost local database for event content, registrations, and contact inquiries while preserving the existing typed UI boundary and making a later PostgreSQL transfer isolated from page components.

**Architecture:** Drizzle connects to a local libSQL/SQLite file. Relational core entities and a typed presentation document reconstruct the existing `SummitContent` domain object through a repository. Route handlers validate form payloads with Zod and call submission repositories; client forms expose truthful pending, success, field-error, and infrastructure-error states.

**Tech Stack:** Next.js 15 Route Handlers, React 19, TypeScript 5.7, Drizzle ORM/Kit, `@libsql/client`, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-18-cross-future-unified-site-design.md`

## Global Constraints

- UI components receive typed props and never import database clients, Drizzle schemas, or seed JSON.
- `getSummitContent("assembly")` remains the only active content door.
- A successful form state means a submission was committed to the configured database.
- No authentication, admin dashboard, email, CRM, payment, paid service, deployment, or remote push.
- The local database file is ignored; schema, migrations, seed source, and setup commands are committed.
- Production PostgreSQL support is a future adapter/migration, not a second active database path in this mockup.

---

### Task 1: Add database configuration and relational schema

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `.env.example`
- Create: `drizzle.config.ts`
- Create: `db/schema.ts`
- Create: `tests/db-schema.test.ts`

**Interfaces:**
- Produces: Drizzle tables `editions`, `organizations`, `people`, `appearances`, `tracks`, `sessions`, `partners`, `documents`, `interviews`, `siteContent`, `registrations`, and `contactInquiries`.

- [ ] **Step 1: Install runtime and development packages**

Run:

```bash
npm install drizzle-orm @libsql/client zod
npm install -D drizzle-kit
```

Add scripts:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "tsx scripts/db-migrate.ts",
  "db:seed": "tsx scripts/db-seed.ts",
  "db:setup": "npm run db:migrate && npm run db:seed"
}
```

Install `tsx` as a development dependency because migration and seed scripts are TypeScript.

- [ ] **Step 2: Write the failing schema contract**

```ts
import { expect, it } from "vitest";
import * as schema from "@/db/schema";

it("exports the complete mock-backend schema", () => {
  expect(Object.keys(schema).sort()).toEqual([
    "appearances", "contactInquiries", "documents", "editions", "interviews",
    "organizations", "partners", "people", "registrations", "sessions",
    "siteContent", "tracks",
  ]);
});
```

- [ ] **Step 3: Run the test**

Run: `npm test -- tests/db-schema.test.ts`
Expected: FAIL because `db/schema.ts` does not exist.

- [ ] **Step 4: Define the schema**

Use `sqliteTable`, text primary keys for domain slugs, integer timestamps in milliseconds, integer booleans, and JSON serialized into text columns with Drizzle `$type<...>()`. Use generated integer primary keys for appearances and submissions. Add foreign keys and indexes for edition, person, email, creation time, and submission status.

Required submission status type:

```ts
export type SubmissionStatus = "new" | "reviewed" | "archived";
```

`siteContent` is keyed by edition slug and stores the validated `AssemblyContent` JSON payload. Venue, SEO, headshot, links, media, organizations-on-appearance, speakers, outcomes, and other nested values use typed JSON text columns.

- [ ] **Step 5: Configure local storage**

Set `.env.example` to:

```dotenv
DATABASE_URL=file:./data/cross-future.db
CONTENT_SOURCE=database
```

Ignore `/data/*.db`, `/data/*.db-*`, and `/drizzle/meta/_journal.json` only if Drizzle regenerates that journal; do not ignore SQL migrations.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- tests/db-schema.test.ts && npm run typecheck`
Expected: PASS.

```bash
git add package.json package-lock.json .gitignore .env.example drizzle.config.ts db/schema.ts tests/db-schema.test.ts
git commit -m "feat: define local database schema"
```

### Task 2: Add database client, migrations, and deterministic seed

**Files:**
- Create: `db/client.ts`
- Create: `db/migrate.ts`
- Create: `scripts/db-migrate.ts`
- Create: `scripts/db-seed.ts`
- Create: `drizzle/*`
- Create: `tests/db-seed.test.ts`

**Interfaces:**
- Produces: `createDatabase(url?: string)`, `migrateDatabase(db)`, and `seedDatabase(db, content): Promise<void>`.

- [ ] **Step 1: Write the failing in-memory seed test**

```ts
import { afterEach, expect, it } from "vitest";
import seedAssembly from "@/content/seed-assembly.json";
import { createDatabase } from "@/db/client";
import { migrateDatabase } from "@/db/migrate";
import { seedDatabase } from "@/scripts/db-seed";
import { editions, registrations, siteContent } from "@/db/schema";

it("migrates and seeds event content without creating submissions", async () => {
  const { db, client } = createDatabase(":memory:");
  await migrateDatabase(db);
  await seedDatabase(db, seedAssembly);
  expect(await db.select().from(editions)).toHaveLength(1);
  expect(await db.select().from(siteContent)).toHaveLength(1);
  expect(await db.select().from(registrations)).toHaveLength(0);
  client.close();
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- tests/db-seed.test.ts`
Expected: FAIL because database helpers do not exist.

- [ ] **Step 3: Implement the client and migrations**

`createDatabase` normalizes `:memory:` to the libSQL URL accepted by `@libsql/client`, returns both client and typed Drizzle instance, and defaults to `process.env.DATABASE_URL ?? "file:./data/cross-future.db"`. `migrateDatabase` runs committed migrations using the libSQL migrator.

- [ ] **Step 4: Implement deterministic seeding**

Export `seedDatabase` from `scripts/db-seed.ts` without executing on import. In one transaction, delete and reinsert only content tables in foreign-key-safe order. Never delete registration or contact rows. Map the complete Assembly seed into relational core rows and one `siteContent` document.

Add a direct-execution guard that creates the data directory, migrates, seeds, closes the client, and reports row counts.

- [ ] **Step 5: Generate the migration and run the test**

Run: `npm run db:generate && npm test -- tests/db-seed.test.ts`
Expected: PASS.

- [ ] **Step 6: Verify repeatability and commit**

Run: `npm run db:setup && npm run db:setup && npm run typecheck`
Expected: both setup runs succeed and retain no duplicate content rows.

```bash
git add db scripts drizzle package.json package-lock.json tests/db-seed.test.ts
git commit -m "feat: add repeatable local database setup"
```

### Task 3: Implement the content repository behind `getSummitContent`

**Files:**
- Create: `lib/repositories/content-repository.ts`
- Create: `lib/repositories/sqlite-content-repository.ts`
- Modify: `lib/content.ts`
- Create: `tests/content-repository.test.ts`

**Interfaces:**
- Produces: `ContentRepository { getSummitContent(): Promise<SummitContent> }`, `createSqliteContentRepository(db)`, and environment-selected delegation from `getSummitContent`.

- [ ] **Step 1: Write the failing repository equivalence test**

```ts
import { expect, it } from "vitest";
import seedAssembly from "@/content/seed-assembly.json";
import { createDatabase } from "@/db/client";
import { migrateDatabase } from "@/db/migrate";
import { seedDatabase } from "@/scripts/db-seed";
import { createSqliteContentRepository } from "@/lib/repositories/sqlite-content-repository";

it("reconstructs the Assembly domain shape", async () => {
  const { db, client } = createDatabase(":memory:");
  await migrateDatabase(db);
  await seedDatabase(db, seedAssembly);
  const content = await createSqliteContentRepository(db).getSummitContent();
  expect(content.editions).toEqual(seedAssembly.editions);
  expect(content.people).toHaveLength(seedAssembly.people.length);
  expect(content.assembly?.heroLines).toEqual(seedAssembly.assembly.heroLines);
  client.close();
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- tests/content-repository.test.ts`
Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Define and implement the repository**

The SQLite repository selects all content tables, sorts rows into the stable seed order (`billing`, session start, and insertion order where present), parses typed JSON columns, and returns the existing `SummitContent` shape. It throws actionable errors if no current edition or no site-content document exists.

- [ ] **Step 4: Delegate from the content adapter**

Keep seed imports private to `lib/content.ts` as a fallback for `CONTENT_SOURCE=seed`. For `CONTENT_SOURCE=database`, load the singleton database repository. Default to `seed` during production builds unless `CONTENT_SOURCE` is explicitly configured, so a fresh clone can still build before local database setup. Active local development uses `.env.local` with `CONTENT_SOURCE=database` after `npm run db:setup`.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/content-repository.test.ts && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add lib/content.ts lib/repositories tests/content-repository.test.ts
git commit -m "feat: read site content through repository"
```

### Task 4: Add validated submission repositories and route handlers

**Files:**
- Create: `lib/submissions/contracts.ts`
- Create: `lib/submissions/validation.ts`
- Create: `lib/repositories/submission-repository.ts`
- Create: `lib/repositories/sqlite-submission-repository.ts`
- Create: `app/api/registrations/route.ts`
- Create: `app/api/contact/route.ts`
- Create: `tests/submissions.test.ts`

**Interfaces:**
- Produces: `RegistrationInput`, `ContactInquiryInput`, Zod schemas, `SubmissionRepository`, and two JSON POST endpoints.

- [ ] **Step 1: Write failing validation and persistence tests**

```ts
import { expect, it } from "vitest";
import { registrationSchema } from "@/lib/submissions/validation";

it("rejects malformed registration email", () => {
  const result = registrationSchema.safeParse({
    edition: "2026", firstName: "A", lastName: "B", email: "bad",
    organization: "", closest: "Research", access: "",
  });
  expect(result.success).toBe(false);
});
```

Add an in-memory repository test that inserts one valid registration and one valid contact inquiry, then selects both rows and verifies normalized trimmed values and status `new`.

- [ ] **Step 2: Run the tests**

Run: `npm test -- tests/submissions.test.ts`
Expected: FAIL because contracts and repositories do not exist.

- [ ] **Step 3: Implement validation and repositories**

Use strict Zod objects so unexpected keys fail. Trim strings, require names/message, validate email, cap free-text lengths, and restrict inquiry/work-area values to the choices rendered by the current content. Repositories insert timestamps and return `{ id: number }` only after commit.

- [ ] **Step 4: Implement route handlers**

Both handlers parse JSON, return `400` with `{ ok: false, fieldErrors }` for validation failures, `201` with `{ ok: true, id }` for committed records, and `500` with `{ ok: false, message: "We could not store that submission. Please try again." }` for infrastructure failures. Do not return stack traces or submitted data.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/submissions.test.ts && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add lib/submissions lib/repositories app/api tests/submissions.test.ts
git commit -m "feat: add persistent submission endpoints"
```

### Task 5: Connect forms with truthful asynchronous states

**Files:**
- Modify: `components/assembly/AsmForm.tsx`
- Modify: `components/assembly/AsmContact.tsx`
- Modify: `app/register/page.tsx`
- Modify: `app/assembly/assembly.css`
- Create: `tests/form-contract.test.ts`

**Interfaces:**
- Consumes: `/api/registrations` and `/api/contact` JSON contracts.
- Produces: reusable `<AsmForm endpoint edition fields submitLabel successNote tone>` with `idle | submitting | success | error` states.

- [ ] **Step 1: Write a failing static contract test**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("active forms declare real submission endpoints", () => {
  const register = readFileSync("app/register/page.tsx", "utf8");
  const contact = readFileSync("components/assembly/AsmContact.tsx", "utf8");
  expect(register).toContain('endpoint="/api/registrations"');
  expect(contact).toContain('endpoint="/api/contact"');
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- tests/form-contract.test.ts`
Expected: FAIL because forms are browser-only.

- [ ] **Step 3: Implement asynchronous submission**

Extend `AsmForm` with `endpoint` and `edition`. Preserve current client validation, serialize all field values plus edition, POST JSON, map server field errors back to fields, disable the submit button while pending, and set `aria-busy`. Only reset the form after a `201` response. On error, retain values and show the server's safe retry message.

- [ ] **Step 4: Update truthful copy and styling**

Registration success states that the place request was stored locally and that confirmation is not yet an issued ticket. Contact success states that the inquiry was stored locally and no email was sent. Add semantic pending/success/error note styles without literal colours.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/form-contract.test.ts && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add components/assembly/AsmForm.tsx components/assembly/AsmContact.tsx app/register/page.tsx app/assembly/assembly.css tests/form-contract.test.ts
git commit -m "feat: connect forms to local persistence"
```

### Task 6: Verify the complete local backend and update documentation

**Files:**
- Modify: `db/client.ts`
- Modify: `db/migrate.ts`
- Modify: `lib/repositories/sqlite-content-repository.ts`
- Modify: `lib/repositories/sqlite-submission-repository.ts`
- Modify: `app/api/registrations/route.ts`
- Modify: `app/api/contact/route.ts`
- Modify: `components/assembly/AsmForm.tsx`
- Create: `scripts/db-health.ts`
- Modify: `README.md`
- Modify: `COMPONENTS.md`

**Interfaces:**
- Produces: repeatable local setup, verified content reads, stored form submissions, and transfer documentation.

- [ ] **Step 1: Set up the local database**

Run `npm run db:setup` and confirm the configured database contains the seeded content. The seed command must preserve any existing submissions and the database file must remain ignored.

- [ ] **Step 2: Run the site in database mode**

Set local environment values from `.env.example`, start `npm run dev`, and open `/`, `/register`, and `/contact`. Confirm pages render identically to seed mode.

- [ ] **Step 3: Submit both forms end to end**

Create `scripts/db-health.ts` to select and print only table counts for editions, site content, registrations, and contact inquiries. Submit one valid registration and one valid contact inquiry, confirm pending and success states in the browser, then run `npx tsx scripts/db-health.ts` and verify both submission counts increased by exactly one without printing submitted values.

- [ ] **Step 4: Exercise failures**

Submit invalid email and missing required values and confirm field errors. Restart the local server once with `DATABASE_URL=http://127.0.0.1:1` and `CONTENT_SOURCE=seed`, submit a valid contact form, and confirm the browser preserves values and shows the retry message rather than success. Restore the normal local environment immediately afterward.

- [ ] **Step 5: Document setup and transfer**

Document `npm run db:setup`, environment variables, database location, migration/seed commands, table responsibilities, truthful form behavior, and the future PostgreSQL adapter/migration boundary. State explicitly that a serverless deployment needs a persistent remote database connection.

- [ ] **Step 6: Run the complete gate and commit**

Run: `npm test && npm run typecheck && npm run build && npm run db:setup`
Expected: all tests, build, migration, and seed commands pass.

```bash
git add db drizzle scripts lib app components tests README.md COMPONENTS.md package.json package-lock.json .gitignore .env.example drizzle.config.ts
git commit -m "feat: finish transferable mock backend"
```
