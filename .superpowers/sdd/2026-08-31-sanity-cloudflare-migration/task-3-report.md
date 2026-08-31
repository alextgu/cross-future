# Task 3 report — publish revalidation and draft preview

## Status

Complete. Added signed Sanity webhook revalidation for cache tags and paths,
an opt-in draft-mode enable route protected by a server-held preview/read token,
and cache settings for the published shell and dynamic interview pages. Metadata
fetches remain published and Stega-free; Sanity Live is not a dependency.

## Commit

- `feat: revalidate Sanity content on publish`

## Verification

- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm test -- tests/sanity-webhook.test.ts tests/metadata.test.ts` — PASS (6/6)
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm test` — PASS (31 files, 92 tests)
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm run typecheck` — blocked by pre-existing Studio diagnostics in `studio/sanity.config.ts` and `studio/schemaTypes/schema.test.ts`; application route code typechecks.
- `PATH=/Users/agu/.nvm/versions/node/v22.23.2/bin:$PATH npm run build` — blocked by the same pre-existing Studio schema type error.

## Concerns

- The webhook expects Sanity to send explicit `tags`/`paths` (or their singular/route aliases); it does not query Sanity during invalidation, so CDN reads remain deferred until the next published request.
- Draft preview uses `SANITY_PREVIEW_SECRET` when set, falling back to the server-only `SANITY_API_READ_TOKEN`; no token is exposed to client bundles.
