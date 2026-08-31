# Sanity + Cloudflare Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Cross Future site from seed/Wix-era content to a Cloudflare-hosted Next.js site whose only editorial interface is a standalone Sanity Studio with integrated video uploads.

**Architecture:** Sanity is the source of truth for structured editorial content and images. The existing Next.js/OpenNext frontend keeps its typed `SummitContent` contract through a Sanity repository adapter. Cloudflare Stream stores videos, D1 stores private form submissions, and Sanity Studio provides the single editor-facing workflow.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Zod, Sanity Studio/App SDK, `next-sanity` typed queries, Cloudflare OpenNext, Cloudflare Stream, Cloudflare D1, Drizzle, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-31-cross-future-sanity-cloudflare-design.md`

## Global Constraints

- Sanity is the only editor-facing area; do not create a second `/admin` dashboard.
- Keep layout, styling, route structure, and component behavior code-owned.
- Keep the `SummitContent` and `AssemblyContent` TypeScript shapes as the frontend contract.
- Keep content access behind `getSummitContent()` and repository interfaces.
- Use Sanity references for relationships and Sanity-generated IDs for ordinary documents.
- Use explicit IDs only for Studio-structured singletons.
- Keep large videos out of Git and the Next.js deployment bundle.
- Keep Stream/API credentials server-side as Cloudflare secrets.
- Preserve the seed/database adapter until Sanity output, forms, and deployment pass verification.
- Do not change registrar/DNS records or delete Wix data in this plan.
- Every task ends with its focused test command and a commit.

## File Map

### New files

- `studio/package.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`: standalone Studio app configuration.
- `studio/schemaTypes/*.ts`: Sanity document and object schemas.
- `studio/structure.ts`: editor navigation and singleton structure.
- `studio/components/CloudflareVideoInput.tsx`: direct-upload video field.
- `studio/components/CloudflareVideoInput.test.tsx`: video input behavior tests.
- `lib/sanity/client.ts`, `lib/sanity/queries.ts`, `lib/sanity/types.ts`: frontend client, typed GROQ queries, and mapped result types.
- `lib/repositories/sanity-content-repository.ts`: Sanity-to-`SummitContent` adapter.
- `lib/repositories/d1-submission-repository.ts`: production D1 submission adapter.
- `app/api/video-upload/route.ts`: short-lived Stream upload-session endpoint.
- `app/api/video-upload/complete/route.ts`: processing-status completion endpoint.
- `app/api/revalidate/sanity/route.ts`: signed Sanity webhook revalidation endpoint.
- `scripts/migrate-seed-to-sanity.ts`: idempotent seed import using `migrationKey`.
- `scripts/migrate-videos-to-stream.ts`: idempotent local MP4 upload and Sanity reference import.
- `tests/sanity-content-repository.test.ts`, `tests/sanity-webhook.test.ts`, `tests/d1-submission-repository.test.ts`, `tests/video-upload.test.ts`: focused verification.

### Modified files

- `lib/content.ts`: add `CONTENT_SOURCE=sanity` dispatch while preserving seed/database modes.
- `lib/content-schema.ts`: add/extend validated Stream video metadata while preserving existing media invariants.
- `app/api/contact/route.ts`, `app/api/registrations/route.ts`: choose the D1 adapter in Cloudflare production and SQLite locally.
- `db/schema.ts`, `drizzle/*`: add only the D1-compatible submission migrations required by current production tables.
- `wrangler.jsonc`, `.openai/hosting.json`: add the logical D1 binding and supported runtime capability declarations.
- `package.json`, `package-lock.json`: add Sanity client/Studio and narrowly scoped upload dependencies plus scripts.
- `.env.example`, `README.md`: document local Sanity, Stream, D1, Studio, migration, and preview commands without secrets.

## Task 1: Establish the Sanity workspace and schemas

**Files:**
- Create: `studio/package.json`
- Create: `studio/sanity.config.ts`
- Create: `studio/sanity.cli.ts`
- Create: `studio/schemaTypes/index.ts`
- Create: `studio/schemaTypes/objects/mediaAsset.ts`
- Create: `studio/schemaTypes/objects/cloudflareVideo.ts`
- Create: `studio/schemaTypes/documents/edition.ts`
- Create: `studio/schemaTypes/documents/person.ts`
- Create: `studio/schemaTypes/documents/organization.ts`
- Create: `studio/schemaTypes/documents/appearance.ts`
- Create: `studio/schemaTypes/documents/track.ts`
- Create: `studio/schemaTypes/documents/session.ts`
- Create: `studio/schemaTypes/documents/partner.ts`
- Create: `studio/schemaTypes/documents/summitDocument.ts`
- Create: `studio/schemaTypes/documents/interview.ts`
- Create: `studio/schemaTypes/documents/pastEdition.ts`
- Create: `studio/schemaTypes/documents/siteSettings.ts`
- Create: `studio/schemaTypes/documents/homePage.ts`
- Create: `studio/structure.ts`
- Test: `studio/schemaTypes/schema.test.ts`

**Interfaces:**
- Produces Sanity types matching the approved content model and a standalone Studio that can be run independently from Next.js.
- `cloudflareVideo` fields are `streamUid`, `status`, `posterUrl`, `durationSeconds`, `alt`, `caption`, `credit`, and `aspect`.
- Ordinary relationships are `reference` fields; `siteSettings` and `homePage` are explicit singletons.

- [ ] **Step 1: Write failing schema tests asserting required fields, enum values, references, and singleton IDs.**
- [ ] **Step 2: Run `npm --prefix studio test` and verify the schema tests fail before the Studio exists.**
- [ ] **Step 3: Scaffold the standalone Studio with the existing Sanity project ID and `production` dataset supplied through environment variables.**
- [ ] **Step 4: Define schemas with `defineType`/`defineField`; use Sanity-generated IDs for ordinary documents and strict validation for slugs, dates, status, and Stream UIDs.**
- [ ] **Step 5: Add a Studio structure with the sections Home, Current Event, Speakers, Program, Partners, Interviews, Media, and Past Events.**
- [ ] **Step 6: Run `npm --prefix studio test` and `npm --prefix studio build`; expected: PASS.**
- [ ] **Step 7: Commit with `git add studio && git commit -m "feat: add standalone Sanity Studio schemas"`.**

## Task 2: Add typed Sanity fetching and the content repository

**Files:**
- Create: `lib/sanity/client.ts`
- Create: `lib/sanity/queries.ts`
- Create: `lib/sanity/types.ts`
- Create: `lib/repositories/sanity-content-repository.ts`
- Modify: `lib/content.ts`
- Modify: `lib/content-schema.ts`
- Test: `tests/sanity-content-repository.test.ts`

**Interfaces:**
- `createSanityContentRepository(client): ContentRepository` returns `Promise<SummitContent>`.
- `getSanityContent()` fetches the current edition plus referenced collections and maps Stream records to `MediaAsset`.
- `getSummitContent("assembly")` selects Sanity when `CONTENT_SOURCE=sanity`; seed and database modes remain unchanged.

- [ ] **Step 1: Add fixture documents in `tests/fixtures/sanity-content.ts` representing one edition, one person, one appearance, one partner, one interview, and one Stream video.**
- [ ] **Step 2: Write failing tests for reference resolution, source ordering, unknown-reference handling, Zod validation, and the `CONTENT_SOURCE` switch.**
- [ ] **Step 3: Run `npm test -- tests/sanity-content-repository.test.ts`; expected: FAIL because the client and adapter do not exist.**
- [ ] **Step 4: Implement `lib/sanity/client.ts` with a server client using `SANITY_PROJECT_ID`, `SANITY_DATASET`, and `SANITY_API_READ_TOKEN`; keep tokens out of browser bundles.**
- [ ] **Step 5: Implement typed GROQ queries in `lib/sanity/queries.ts`; project only fields consumed by `SummitContent`, include `_id` for keys, and disable Stega for metadata/static parameter queries.**
- [ ] **Step 6: Implement the repository mapper; resolve references into the existing arrays, convert `cloudflareVideo` to `MediaAsset`, preserve explicit ordering fields, and call `summitContentSchema.safeParse` plus `assemblyContentSchema.safeParse` before returning.**
- [ ] **Step 7: Add the `sanity` branch in `getSummitContent()` without changing component imports or derived view functions.**
- [ ] **Step 8: Run `npm test -- tests/sanity-content-repository.test.ts tests/content-schema.test.ts`; expected: PASS.**
- [ ] **Step 9: Commit with `git add lib/sanity lib/repositories/sanity-content-repository.ts lib/content.ts lib/content-schema.ts tests && git commit -m "feat: read summit content from Sanity"`.

## Task 3: Add publish revalidation and draft preview

**Files:**
- Create: `app/api/revalidate/sanity/route.ts`
- Create: `app/api/draft-mode/enable/route.ts`
- Modify: `app/layout.tsx`
- Modify: `app/interviews/[slug]/page.tsx`
- Modify: `next.config.ts`
- Test: `tests/sanity-webhook.test.ts`

**Interfaces:**
- `POST /api/revalidate/sanity` accepts a signed Sanity webhook body and returns `{ revalidated: string[] }`.
- Invalid signatures return HTTP 401; missing route/tag payloads return HTTP 400.
- Draft preview is opt-in and does not affect published visitors.

- [ ] **Step 1: Write failing tests for invalid signature, missing payload, tag revalidation, and published-vs-draft metadata behavior.**
- [ ] **Step 2: Run `npm test -- tests/sanity-webhook.test.ts`; expected: FAIL.**
- [ ] **Step 3: Implement signed webhook parsing with `SANITY_REVALIDATE_SECRET`, delay CDN reads until Sanity has published, and call `revalidateTag`/`revalidatePath` for the returned paths.**
- [ ] **Step 4: Implement the draft-mode enable route with a server-only Sanity token and keep Stega disabled for metadata.**
- [ ] **Step 5: Keep signed webhook plus tag/path revalidation as the production invalidation path; do not make Sanity Live a production dependency.**
- [ ] **Step 6: Run `npm test -- tests/sanity-webhook.test.ts tests/metadata.test.ts` and `npm run build`; expected: PASS.**
- [ ] **Step 7: Commit with `git add app/api/revalidate app/api/draft-mode app/layout.tsx app/interviews/[slug]/page.tsx next.config.ts tests && git commit -m "feat: revalidate Sanity content on publish"`.**

## Task 4: Implement the single-area video upload workflow

**Files:**
- Create: `studio/components/CloudflareVideoInput.tsx`
- Create: `studio/components/CloudflareVideoInput.test.tsx`
- Create: `app/api/video-upload/route.ts`
- Create: `app/api/video-upload/complete/route.ts`
- Create: `tests/video-upload.test.ts`
- Modify: `studio/schemaTypes/objects/cloudflareVideo.ts`
- Modify: `studio/schemaTypes/index.ts`

**Interfaces:**
- `POST /api/video-upload` accepts filename, size, and MIME type from an authenticated Studio request and returns a short-lived Stream direct-upload URL plus an upload ID.
- `POST /api/video-upload/complete` accepts the upload ID and returns Stream processing status and metadata.
- The Studio input writes only the resulting Stream UID and non-secret metadata to the Sanity draft.

- [ ] **Step 1: Write failing route tests for authorization, MIME/size validation, missing Stream configuration, successful session creation, completion polling, and duplicate retry behavior.**
- [ ] **Step 2: Run `npm test -- tests/video-upload.test.ts`; expected: FAIL.**
- [ ] **Step 3: Implement the server route using server-only `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN`; issue a short-lived, scoped Stream direct-upload session and never return the long-lived token.**
- [ ] **Step 4: Implement completion polling with an idempotency key and explicit states `queued`, `processing`, `ready`, and `failed`.**
- [ ] **Step 5: Implement the Sanity input with a file chooser, upload progress, retry action, status display, poster/alt/caption fields, and a reference to the stored Stream UID.**
- [ ] **Step 6: Wire the input to the `cloudflareVideo` object and preserve native Sanity draft/publish behavior.**
- [ ] **Step 7: Run `npm test -- tests/video-upload.test.ts studio/components/CloudflareVideoInput.test.tsx`; expected: PASS.**
- [ ] **Step 8: Commit with `git add studio/components app/api/video-upload tests/video-upload.test.ts && git commit -m "feat: upload videos to Stream from Sanity"`.

## Task 5: Make submissions production-safe on D1

**Files:**
- Create: `lib/repositories/d1-submission-repository.ts`
- Create: `tests/d1-submission-repository.test.ts`
- Modify: `app/api/contact/route.ts`
- Modify: `app/api/registrations/route.ts`
- Modify: `db/schema.ts` only if the current schema needs a D1-compatible migration
- Create: `drizzle/0003_d1_submissions.sql` only when schema changes are required
- Modify: `wrangler.jsonc`
- Modify: `.openai/hosting.json`

**Interfaces:**
- `createD1SubmissionRepository(db: D1Database): SubmissionRepository` implements the existing registration/contact repository contract.
- Public request/response shapes and Zod validation remain unchanged.

- [ ] **Step 1: Write failing adapter tests for committed registration/contact rows, uniqueness/index behavior, and rejection of invalid input.**
- [ ] **Step 2: Run `npm test -- tests/d1-submission-repository.test.ts`; expected: FAIL.**
- [ ] **Step 3: Inspect the current Drizzle schema and generate only the migration required for the existing submission tables; do not add speculative indexes.**
- [ ] **Step 4: Implement a small D1 adapter using one prepared statement per SQL statement and batch only when multiple statements are required.**
- [ ] **Step 5: Select D1 in production through the runtime binding and keep SQLite for local development/tests.**
- [ ] **Step 6: Add the logical D1 binding to `.openai/hosting.json` and `wrangler.jsonc` using the Sites-supported binding shape; leave R2 unset because Stream is the selected video store.**
- [ ] **Step 7: Run `npm test -- tests/d1-submission-repository.test.ts tests/form-contract.test.ts tests/api-routes.test.ts`; expected: PASS.**
- [ ] **Step 8: Commit with `git add lib/repositories/d1-submission-repository.ts app/api db/schema.ts drizzle wrangler.jsonc .openai/hosting.json tests && git commit -m "feat: use D1 for production submissions"`.

## Task 6: Import seed content into Sanity idempotently

**Files:**
- Create: `scripts/migrate-seed-to-sanity.ts`
- Create: `scripts/migrate-seed-to-sanity.test.ts`
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- `npm run sanity:migrate:seed -- --dry-run` reports counts without mutating Sanity.
- `npm run sanity:migrate:seed` upserts documents by `migrationKey`, creates references using returned Sanity IDs, and is safe to retry.
- The script never deletes documents and never creates deterministic Sanity `_id` values.

- [ ] **Step 1: Write failing tests for counts, `migrationKey` upsert behavior, reference creation, missing optional fields, and dry-run no-write behavior.**
- [ ] **Step 2: Run `npm test -- scripts/migrate-seed-to-sanity.test.ts`; expected: FAIL.**
- [ ] **Step 3: Implement source readers for `content/seed-assembly.json` and the shared seed collections; normalize each source row into a Sanity document payload with a stable `migrationKey`.**
- [ ] **Step 4: Implement an idempotent transaction/upsert sequence that records the returned Sanity IDs in memory for reference fields.**
- [ ] **Step 5: Add `--dry-run` and `--only` filters for a document type, logging counts and validation errors without logging private values.**
- [ ] **Step 6: Add `sanity:migrate:seed` to `package.json` and document required environment variables and order in `README.md`.**
- [ ] **Step 7: Run the focused tests and a dry run against the local seed; expected: PASS with stable counts.**
- [ ] **Step 8: Commit with `git add scripts/migrate-seed-to-sanity.ts scripts/migrate-seed-to-sanity.test.ts package.json package-lock.json README.md && git commit -m "feat: import seed content into Sanity"`.

## Task 7: Import the 18 existing videos and wire media references

**Files:**
- Create: `scripts/migrate-videos-to-stream.ts`
- Create: `scripts/migrate-videos-to-stream.test.ts`
- Modify: `package.json`
- Modify: `README.md`
- Do not add: video binaries to Git or `public/`

**Interfaces:**
- `npm run sanity:migrate:videos -- --dry-run` lists the 18 source files, byte totals, and target records without uploading.
- `npm run sanity:migrate:videos` uploads each file directly to Stream, persists a `migrationKey`/UID checkpoint, and safely resumes after interruption.

- [ ] **Step 1: Write failing tests for deterministic file discovery, byte totals, resume checkpoints, duplicate prevention, and failed-upload retry.**
- [ ] **Step 2: Run `npm test -- scripts/migrate-videos-to-stream.test.ts`; expected: FAIL.**
- [ ] **Step 3: Implement file discovery from `/Users/agu/Downloads/cross_future` for local migration only and from `public/assembly/video`/`public/summit/video` for repository fixtures; never copy binaries into Git.**
- [ ] **Step 4: Implement resumable direct upload through the same Stream session endpoint used by Studio and persist checkpoints in a local migration state file outside Git.**
- [ ] **Step 5: Map each uploaded UID to its Sanity interview/media record and write only after Stream returns a stable UID.**
- [ ] **Step 6: Run a dry run, verify all 18 files and approximately 7.4 GB are accounted for, then perform the authorized upload.**
- [ ] **Step 7: Run focused tests and verify every resulting Sanity video record has a non-empty UID and status.**
- [ ] **Step 8: Commit only the script, tests, and documentation with `git add scripts/migrate-videos-to-stream.ts scripts/migrate-videos-to-stream.test.ts package.json README.md && git commit -m "feat: add resumable video migration to Stream"`.

## Task 8: Switch the public site to Sanity and validate the migration

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `lib/content.ts` to select Sanity for the production content source while retaining rollback modes
- Create: `tests/sanity-parity.test.ts`

**Interfaces:**
- `CONTENT_SOURCE=sanity` renders the public site from Sanity.
- Seed and database modes remain available for rollback and local fixtures.

- [ ] **Step 1: Write parity tests comparing current seed-derived invariants with Sanity-derived invariants: current edition, faculty counts/order, partner groups, interview slugs, past-edition filtering, and media kinds.**
- [ ] **Step 2: Run `npm test -- tests/sanity-parity.test.ts`; expected: FAIL until migrated Sanity fixtures are loaded.**
- [ ] **Step 3: Add documented environment names for Sanity project/dataset/read token, webhook secret, Stream account/token, and D1 binding; keep `.env.local` values private.**
- [ ] **Step 4: Set `CONTENT_SOURCE=sanity` in a non-production preview environment and run `npm run build`.**
- [ ] **Step 5: Run the full suite `npm test`, `npm run typecheck`, and `npm run build`; expected: PASS.**
- [ ] **Step 6: Verify public routes, interview detail pages, form submissions, draft preview, publish/revalidation, and Stream playback on the temporary Cloudflare URL.**
- [ ] **Step 7: Commit with `git add .env.example README.md lib/content.ts tests/sanity-parity.test.ts && git commit -m "feat: make Sanity the production content source"`.

## Task 9: Publish through Sites and prepare domain cutover

**Files:**
- Modify: `.openai/hosting.json` only for validated logical bindings/capabilities
- Modify: `wrangler.jsonc` only for validated production bindings
- Create: `docs/operations/cloudflare-cutover.md`

**Interfaces:**
- The existing Sites project ID is reused; no second Site is created.
- The deployable artifact is built from the exact validated source commit.
- The cutover document lists the owner actions required for registrar/DNS access and rollback.

- [ ] **Step 1: Run the successful production build and package the build output with the Sites hosting helper.**
- [ ] **Step 2: Inspect the existing Site access policy, then save one version from the exact source commit and deploy owner-only/private by default; ask for approval before any shared or public deployment.**
- [ ] **Step 3: Poll deployment status until success or a concrete failure; do not change DNS on failure.**
- [ ] **Step 4: Verify the deployed temporary URL and confirm the Sanity Studio URL/CORS origins are configured.**
- [ ] **Step 5: Write `docs/operations/cloudflare-cutover.md` with the owner-only DNS steps: add the domain to Cloudflare, update registrar nameservers/records, verify HTTPS, monitor forms/media, and restore prior DNS on rollback.**
- [ ] **Step 6: Stop before registrar changes or Wix deletion; those actions require explicit owner approval.**
- [ ] **Step 7: Commit the cutover runbook with `git add docs/operations/cloudflare-cutover.md .openai/hosting.json wrangler.jsonc && git commit -m "docs: add Cloudflare cutover runbook"`.

## Verification Checklist

- [ ] Sanity Studio runs independently and presents one editor workflow.
- [ ] Sanity schema validation rejects incomplete or invalid references.
- [ ] Sanity repository output passes the existing Zod schemas.
- [ ] Editors can upload, retry, and publish Stream videos from Studio.
- [ ] Stream credentials never appear in browser bundles or logs.
- [ ] Publish webhook rejects invalid signatures and revalidates expected pages.
- [ ] D1 form writes pass existing public API contracts.
- [ ] The current seed adapter still provides a rollback path.
- [ ] All existing tests, typecheck, and production build pass.
- [ ] Temporary Cloudflare deployment renders representative routes and playback.
- [ ] Domain cutover remains a separate owner-approved action.
