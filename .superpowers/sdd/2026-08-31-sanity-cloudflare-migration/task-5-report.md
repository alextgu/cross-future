# Task 5 report — production submissions on D1

## Status

Complete. Added a server-only D1 submission adapter for registrations and
contact inquiries while retaining the existing request/response contracts and
Zod validation. API routes select `SUBMISSIONS_DB` only when a production
Cloudflare runtime binding is available; local development and tests continue
to use SQLite.

The existing `registrations` and `contact_inquiries` schema already matches the
required D1 tables and indexes, so no Drizzle schema change or `0003` migration
was added. The Sites metadata declares the logical D1 binding and leaves R2
unset because Stream remains the video store. No Cloudflare resources or DNS
records were provisioned or changed.

## Verification

- `npm test -- tests/d1-submission-repository.test.ts` — PASS (6 tests)
- `npm test -- tests/d1-submission-repository.test.ts tests/form-contract.test.ts tests/api-routes.test.ts` — PASS (3 files, 12 tests)
- `npm test` — PASS (34 files, 124 tests)
- `npx wrangler deploy --dry-run --outdir /tmp/cross-future-d1-dry-run` — PASS; reports `env.SUBMISSIONS_DB (cross-future-submissions)` as D1 and retains the existing `VIDEO_UPLOAD_KV`/`ASSETS` bindings.
- `npm run typecheck` — still reports the two pre-existing Studio diagnostics in `studio/sanity.config.ts` and `studio/schemaTypes/schema.test.ts`; no diagnostics originate from the D1 adapter or API routes.

## Commit

- `feat: use D1 for production submissions`

## Concerns

- `wrangler.jsonc` intentionally omits a `database_id`; the logical binding is
  validated for deployment wiring, but an owner must attach/provision the real
  D1 database and apply the checked-in migrations before production writes can
  succeed.
- If a production runtime is started without `SUBMISSIONS_DB`, both routes fail
  closed with HTTP 503 rather than attempting a local filesystem write.
