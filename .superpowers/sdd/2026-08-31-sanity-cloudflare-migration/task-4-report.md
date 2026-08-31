# Task 4 report — single-area Cloudflare Stream upload

## Status

Complete. Added authenticated Stream direct-upload session creation, completion
status polling, scoped server-held credentials, idempotent retries, and a
Sanity custom object input that writes the Stream UID plus non-secret metadata
into the draft.

## Commit

`feat: upload videos to Stream from Sanity` (current Task 4 commit)

## Delivered

- `POST /api/video-upload` validates authenticated Studio requests, video MIME
  types, filename/size bounds, and Cloudflare configuration; direct-upload
  credentials never leave the server.
- `POST /api/video-upload/complete` maps Stream responses to explicit
  `queued`, `processing`, `ready`, and `failed` states and exposes safe media
  metadata only.
- Duplicate upload and completion retries are idempotent in the process-local
  session store.
- `CloudflareVideoInput` provides file selection, transfer progress, retry and
  status UI, Stream UID display, and poster/alt/caption editing while retaining
  Sanity's native object input.
- `cloudflareVideo` is wired to the custom input and schema tests cover the
  registration.

## Verification

- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm test -- tests/video-upload.test.ts studio/components/CloudflareVideoInput.test.tsx` — PASS (2 files, 11 tests)
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm --prefix studio test` — PASS (1 file, 6 tests)
- `SANITY_STUDIO_PROJECT_ID=test-project SANITY_STUDIO_DATASET=production PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm --prefix studio run build` — PASS
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm test` — PASS (33 files, 108 tests)
- `git diff --check` — PASS

## Concerns

- Upload sessions and idempotency records are process-local memory. A
  multi-instance deployment should move this small state machine to a durable
  KV/Durable Object when cross-instance retries must be guaranteed.
- Studio authentication is intentionally fail-closed and accepts a bearer (or
  equivalent Studio token header) matched against a server-only
  `SANITY_STUDIO_UPLOAD_SECRET`/upload token variable.
- Repository-wide `npm run typecheck` retains the pre-existing Studio readonly
  schema diagnostics in `studio/sanity.config.ts` and
  `studio/schemaTypes/schema.test.ts`; focused and full Vitest suites pass.

## Review fix round 1

- The input now accepts a configurable API origin and session bearer token,
  uploads direct to Stream as multipart `file` FormData, and enforces the
  200 MB basic-upload ceiling.
- Completion uses bounded exponential polling (five attempts), AbortController
  cancellation, and per-poll idempotency keys.
- Functional value refs prevent an in-flight completion from overwriting
  poster/alt/caption edits.
- Session state exposes a Cloudflare KV-compatible binding seam and refuses
  process-local state in production; local tests retain the deterministic
  in-memory fallback.

Fix-round verification:

- Focused upload/input tests — PASS (2 files, 14 tests)

## Review fix round 2

- The registered Sanity input now receives its configured API origin and
  dedicated Studio upload bearer (`SANITY_STUDIO_VIDEO_UPLOAD_API_ORIGIN` /
  `SANITY_STUDIO_UPLOAD_TOKEN`). The Cloudflare Stream API token remains
  server-only; the route accepts either configured Studio credential while
  remaining fail-closed when none is set.
- Direct Stream transfer and exponential polling backoff are both tied to the
  active AbortController. Unmounts and file replacement invalidate the upload
  generation, preventing stale completion or error state from mutating the
  replacement draft.
- `wrangler.jsonc` declares the `VIDEO_UPLOAD_KV` namespace binding, and the
  state adapter resolves that binding from the OpenNext Cloudflare runtime
  context (while retaining the local in-memory test seam). Replace the
  documented namespace ID placeholder with the provisioned production KV ID.

Fix-round-2 verification:

- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm test -- tests/video-upload.test.ts studio/components/CloudflareVideoInput.test.tsx` — PASS (2 files, 17 tests)
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm --prefix studio test` — PASS (1 file, 6 tests)
- `SANITY_STUDIO_PROJECT_ID=test-project SANITY_STUDIO_DATASET=production PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm --prefix studio run build` — PASS
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm test` — PASS (33 files, 113 tests)
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npx wrangler deploy --dry-run --outdir /tmp/cross-future-open-next-dry-run` — PASS (reports `VIDEO_UPLOAD_KV` binding)
- `npm run typecheck` — existing unrelated readonly schema diagnostics only
- Commit: `83cd12e fix: harden Stream upload runtime wiring`

## Review fix round 3

- Both upload endpoints now expose strict CORS preflight (`OPTIONS`) and
  response headers only for the configured Studio origin
  (`SANITY_STUDIO_ORIGIN`, with explicit compatibility aliases). Other origins
  receive `403` and no allow-origin header.
- Upload effects restore their mounted state during setup, so React StrictMode
  effect replay does not permanently invalidate a newly mounted input.
- `wrangler.jsonc` retains the all-zero KV namespace ID as an explicit
  unprovisioned placeholder; production upload remains intentionally blocked
  with `503` until the owner provisions a real namespace and replaces that ID.

Fix-round-3 verification:

- Focused upload/input tests — PASS (2 files, 21 tests)
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm --prefix studio test` — PASS (1 file, 6 tests)
- `SANITY_STUDIO_PROJECT_ID=test-project SANITY_STUDIO_DATASET=production PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm --prefix studio run build` — PASS
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm test` — PASS (33 files, 118 tests)
- `npm run typecheck` — existing unrelated readonly schema diagnostics only
