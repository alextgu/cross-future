# Cross Future: Sanity + Cloudflare Migration Design

## Status

Approved in conversation for implementation planning. This document describes
the target architecture and the migration boundary; implementation begins only
after this specification is reviewed.

## Goal

Move `cross-future.com` from Wix to the existing Next.js application hosted on
Cloudflare, while giving non-code editors one place to manage all public
content and media.

The editor-facing product is Sanity Studio. Cloudflare is the runtime and media
delivery layer, not a second editorial dashboard.

## Decisions

- Sanity is the source of truth for editorial content and normal images.
- A standalone Sanity Studio lives in `studio/` in this repository. It is not
  embedded in the Next.js app.
- The existing Next.js pages and components remain the public presentation
  layer. They continue to consume the typed `SummitContent` shape through the
  content door.
- Cloudflare Stream stores and delivers the large video files. Editors upload
  videos from a custom Sanity Studio input and never need the Cloudflare
  dashboard for routine media work.
- Cloudflare D1 stores registrations and contact submissions. This is
  infrastructure, not a second editor workflow.
- Sanity authentication and roles are the canonical editor access control.
  Cloudflare Access is not placed in front of Studio, avoiding a second login
  surface. It may protect future operational-only endpoints.
- Layout, styling, route structure, and component behavior remain code-owned.
  Editors change structured content and media only.
- Wix is not part of the target runtime. The existing seed content remains only
  as a temporary technical fallback until the Sanity migration is verified;
  deleting Wix data or DNS is a separately authorized cutover action.

## Target architecture

```text
Editor
  -> Sanity Studio (single editing area)
       |-- Sanity Content Lake: text, people, editions, schedule, partners,
       |   interviews, image assets, and video metadata
       |-- custom video input -> Cloudflare Stream direct upload
       `-- publish webhook -> Next.js revalidation

Public visitor
  -> cross-future.com on Cloudflare
       |-- Next.js/OpenNext pages
       |-- Sanity content repository -> SummitContent
       |-- Cloudflare Stream playback for videos
       `-- D1-backed form endpoints for registrations/contact
```

## Content model

Sanity document types map to the current domain model instead of storing one
opaque JSON document:

- `edition`
- `person`
- `organization`
- `appearance` (person + edition + organization references)
- `track`
- `session`
- `partner`
- `document`
- `interview`
- `pastEdition`
- `siteSettings` and `homePage` singletons for presentation-specific content

Relationships use Sanity references. Sanity generates ordinary document IDs;
only explicitly structured singletons use fixed IDs. Each migrated document
also carries a non-authoritative `migrationKey` used to make imports
idempotent without creating deterministic Sanity IDs.

The existing `SummitContent` and `AssemblyContent` TypeScript shapes remain the
frontend contract. A `SanityContentRepository` resolves references and maps
documents into that shape, then runs the existing Zod schemas before returning
content to a page.

The existing JSON seeds remain fixtures and rollback input during the migration.
Components must continue to avoid importing seed files directly.

## Media and video workflow

Images use Sanity image assets and retain alt text, focal point, caption, and
credit fields.

Videos use a Sanity `cloudflareVideo` object with:

- Cloudflare Stream video UID
- processing status
- poster/thumbnail URL when available
- duration when available
- alt text, caption, credit, and aspect ratio
- optional transcript/caption references

The custom Studio input requests a short-lived direct-upload session from a
Cloudflare endpoint, uploads the file directly to Stream, polls processing
status, and stores the resulting UID and metadata in the Sanity draft. The
Stream API credential remains server-side as a Cloudflare secret. A failed or
interrupted upload is visible as an error state and can be retried without
creating duplicate content records.

The 18 existing MP4 files are imported in a separate idempotent migration step.
The largest files are never committed to Git or bundled into the Next.js
deployment.

## Publishing and preview

1. An editor changes a draft in Sanity Studio.
2. The editor previews the draft using Sanity Presentation/Visual Editing.
3. Sanity publishes the document only after schema validation succeeds.
4. A signed Sanity webhook calls a Next.js revalidation route.
5. The route revalidates affected content tags/paths.
6. The public Cloudflare site renders the newly published content.

The public site uses Sanity's typed fetch client with signed webhook-triggered
tag/path revalidation as the deployment baseline. Sanity Live/Visual Editing is
added only after it passes the OpenNext/Cloudflare runtime check; it is an
editor-preview enhancement, not a second content path, and does not change the
editor workflow or content model.

Metadata queries disable Stega/visual-editing markers. Logic fields are cleaned
before comparisons so draft overlays cannot alter routing, theme, or status
behavior.

## Submissions

The current registration and contact contracts remain unchanged at the public
API boundary. Production adapters write to D1 through the existing repository
interfaces. Local SQLite remains the development adapter.

Submission data is intentionally not modeled as editorial Sanity documents in
the first migration: it contains personal information and has different
retention and access requirements. If the team later needs an inbox inside
Studio, that will be a separate, explicitly scoped read-only integration.

## Authentication and permissions

- Sanity roles control who can edit, publish, and manage Studio content.
- The public website has no editor login.
- Stream upload credentials are server-only Cloudflare secrets.
- The upload endpoint accepts only short-lived, scoped upload sessions and
  validates origin/session claims; it never accepts a long-lived Stream token
  from the browser.
- D1 submission access is server-side only.

## Migration sequence

### Expand

1. Add standalone Studio and schemas alongside the existing Next.js app.
2. Add Sanity client, typed queries, and the repository adapter behind
   `CONTENT_SOURCE=sanity`.
3. Add Cloudflare Stream upload infrastructure and video input.
4. Add the D1 production adapter while retaining the local SQLite adapter.

### Migrate

1. Import the current seed data into Sanity using `migrationKey` upserts.
2. Import image assets and map their Sanity references.
3. Upload the 18 MP4 files to Stream and attach their UIDs to the relevant
   Sanity records.
4. Compare representative pages and all content counts between seed output and
   Sanity output.

### Verify

- Run schema, repository, route, and existing component tests.
- Run a production OpenNext build.
- Verify draft preview, publish, revalidation, video playback, form writes,
  and mobile/desktop routes on a temporary Cloudflare URL.
- Confirm DNS/registrar control for `cross-future.com` before cutover.

### Cut over

1. Deploy the verified site to Cloudflare.
2. Point the domain DNS to the Cloudflare deployment only after approval.
3. Monitor the new site and forms.
4. Keep the seed adapter available for a short rollback window.

### Contract

After the new site is stable and rollback is no longer needed, remove the seed
production path and any unused Wix references in a separate change. Do not
delete Wix data or change registrar settings implicitly.

## Rollback

- Before DNS cutover: switch `CONTENT_SOURCE` back to the seed/database adapter
  and redeploy.
- After DNS cutover: restore the prior DNS records only with explicit owner
  approval.
- Failed Sanity imports are retried by `migrationKey`; partial uploads are
  marked and retried without duplicating published records.
- Existing D1 and local SQLite submission adapters remain intact during the
  transition.

## Testing gates

- Sanity schema validation rejects incomplete records and invalid references.
- Repository mapping tests prove Sanity documents produce the same
  `SummitContent` invariants as the seed fixture.
- Upload tests cover success, processing, retry, duplicate prevention, and
  failure states without exposing credentials.
- Webhook tests reject invalid signatures and revalidate the expected tags.
- Existing form-contract, content-schema, redirect, metadata, and component
  tests remain green.
- Build and deployment verification happen before DNS changes.

## Explicit non-goals

- No arbitrary page builder or drag-and-drop layout editor.
- No second custom admin dashboard.
- No direct browser access to Cloudflare API credentials.
- No video files committed to Git.
- No automatic deletion of Wix content or DNS records.
