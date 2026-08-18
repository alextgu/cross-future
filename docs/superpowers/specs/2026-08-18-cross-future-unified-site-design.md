# Cross Future Unified Site Design

Date: 2026-08-18
Status: Approved for implementation planning

## 1. Objective

Consolidate the three existing Cross Future site concepts into one final public
experience. The Assembly concept supplies the layout: a responsive tiled-card
system with media mosaics, oversized editorial typography, and a sticky event
rail. The first pass is intentionally grayscale so layout, hierarchy,
typography, interaction, and accessibility can be judged independently from
brand colour.

The result must also include a small but genuine local backend. Event content,
registration submissions, and contact inquiries persist locally through a
typed data layer that can later be replaced by company-provided PostgreSQL and
service integrations without changing page components or form UX.

UI quality is the priority. Backend work must remain quiet, reliable, and
strictly limited to what supports the mockup and its later transfer.

## 2. Goals

- Make the Assembly experience the only public design and serve it from `/`.
- Preserve the reference layout's large card mosaic, constant gutters, rounded
  surfaces, media-forward storytelling, and sticky agenda/ticket rail.
- Replace all active palette choices with a complete grayscale token system.
- Keep typography, responsive behavior, motion, and accessibility production
  quality even while media and content remain mock data.
- Selectively reuse strong behavior from Nexus and Technical Broadsheet where
  it improves the Assembly experience without introducing another visual
  language.
- Preserve legacy components in the repository as reference material rather
  than deleting them.
- Persist content and form submissions in a local SQLite/libSQL database with
  migrations and deterministic seeds.
- Keep UI components independent of the database driver and future external
  services.
- Finish with a verified local `main` branch. Do not push or publish without a
  separate explicit request.

## 3. Non-goals

- Final brand colours or a palette decision.
- Authentication, permissions, or an administrator dashboard.
- Email delivery, CRM synchronization, ticketing-provider integration, or
  payment processing.
- A paid or company-managed cloud database.
- Rewriting every component solely to remove the existing `Asm` prefix.
- Deleting the older Nexus or Technical Broadsheet component implementations.
- Publishing, deploying, or pushing changes to a remote repository.

## 4. Public Information Architecture

The Assembly routes become the canonical public routes:

| Current route | Canonical route |
| --- | --- |
| `/assembly` | `/` |
| `/assembly/about` | `/about` |
| `/assembly/speakers` | `/speakers` |
| `/assembly/agenda` | `/agenda` |
| `/assembly/media` | `/media` |
| `/assembly/partners` | `/partners` |
| `/assembly/register` | `/register` |
| `/assembly/contact` | `/contact` |

The old Assembly paths redirect permanently to the corresponding canonical
paths. `/nexus` redirects to `/`. Legacy routes do not appear in navigation,
sitemaps, or canonical metadata.

The root layout owns the final fonts, metadata defaults, skip link, Event
JSON-LD, navigation, and footer. Every canonical page renders through one
shared shell so gutters, rail behavior, landmarks, and footer placement cannot
drift.

## 5. Unified Visual System

### 5.1 Layout vocabulary

The active system keeps the Assembly vocabulary:

- A 10px page and inter-card gutter.
- Rounded cards with clipped media and no drop shadows.
- Three composition primitives: stack, row, and split.
- Large display cards paired with smaller media or action cards.
- A sticky right rail on inner pages for the agenda teaser and ticket card.
- Full-width home composition because its hero already contains those two
  actions.

At desktop widths, the full mosaic and sticky rail render side by side. At
tablet widths, the rail becomes part of the document flow. At mobile widths,
all compositions become an intentional single-column card stack with preserved
reading order and comfortable touch targets.

### 5.2 Grayscale tokens

The first implementation defines grayscale primitives from white through near
black. Semantic tokens assign those values to:

- Page ground
- Plain, mist, tint, deep, accent, and outline card tones
- Primary, secondary, tertiary, and inverse text
- Hairlines and strong borders
- Focus rings
- Media duotone shadow and highlight
- Disabled, pending, success, and error states

Components reference only semantic tokens. No active component may contain a
literal colour. The later brand pass will remap primitives and role hues while
leaving component rules unchanged.

### 5.3 Typography

- Barlow Semi Condensed: oversized display headings.
- Barlow: body copy, controls, and supporting text.
- IBM Plex Mono: eyebrows, metadata, session times, chips, and technical
  labels.

Type scale, line length, and spacing remain responsive. The display face keeps
the reference's condensed event-poster character without introducing another
unrelated family.

### 5.4 Reused behavior

The following behavior will be brought into the active Assembly family and
restyled entirely with the unified tokens:

- Nexus expandable horizontal agenda: scroll-snap session cards with keyboard
  controls and expandable details.
- Nexus countdown: event countdown integrated into the global footer below the
  event details, without becoming the page's primary focus.
- Technical Broadsheet infrastructure diagram: a data-driven grayscale card
  on the About page, linking summit tracks to the utility-to-rack story.

These are behavior and information-pattern transfers, not parallel design
systems. Existing Assembly components remain authoritative for card surfaces,
type, spacing, buttons, focus, and responsive behavior.

### 5.5 Motion and media

Motion is limited to section reveals, purposeful card/media transitions, the
countdown, and explicit agenda interaction. Every motion feature must honor
`prefers-reduced-motion`; no content may depend on animation to become
available.

`AsmMedia` remains the single active door for photographs and clips. It owns
aspect reservation, focal position, placeholder labels, lazy loading, poster
behavior, and the grayscale media treatment. Placeholder and final assets must
occupy identical layout slots.

## 6. Component Boundaries

The current `components/assembly` family remains active to avoid a broad rename
with no user-visible benefit. Its components may be refined or extended but
remain props-driven.

The `components/nexus` family and the original unprefixed components remain in
the repository as reference-only code. Canonical pages must not import a legacy
page composition. Reused behavior should be adapted into the active Assembly
family so the final site has one component vocabulary and one token system.

Shared responsibilities remain centralized:

- `AsmShell`: canonical page shell and optional rail.
- `AsmNav` and `AsmFooter`: global navigation and footer.
- `AsmSectionHead`: section rhythm and heading structure.
- `AsmButton`: links and buttons.
- `AsmMedia`: all active image/video presentation.
- `AsmForm`: field rendering, client-side feedback, and submission states.
- Content adapter and repositories: all content/data access.

## 7. Data Architecture

### 7.1 Single content door

`getSummitContent()` remains the only content entry point used by layouts and
pages. It delegates to a repository and returns the existing typed
`SummitContent` shape. Components receive plain typed props and never import
seed documents, database clients, or ORM schemas.

This preserves the current derived-view functions for faculty, sessions,
partners, interviews, dates, and other display-ready projections.

### 7.2 Local database

Drizzle manages a local SQLite/libSQL database. The repository includes:

- A committed schema.
- Generated and committed migrations.
- A deterministic seed command.
- A local database file excluded from Git.
- Environment-based connection configuration with a safe example file.

Core event entities use relational tables:

- Editions
- Organizations
- People
- Appearances
- Tracks
- Sessions
- Partners
- Documents
- Interviews

Presentation-heavy Assembly data uses a typed `site_content` document record
keyed by site/edition and validated before it reaches the UI. This record holds
hero copy, fact cards, marquee items, rail configuration, story chapters,
focus areas, feature cards, voices, FAQs, journal entries, past editions,
letters, galleries, contact configuration, footer media, and per-page intros.
Keeping this material together avoids dozens of tables whose only purpose
would be preserving a designed card order.

Media records retain their kind, source, poster, alt text, aspect ratio, focal
point, caption, credit, and placeholder status.

### 7.3 Submissions

Two dedicated tables store user input:

- `registrations`: edition, first name, last name, email, organization, work
  area, accessibility notes, creation time, and submission status.
- `contact_inquiries`: edition, name, email, organization, inquiry type,
  message, creation time, and submission status.

No email is sent and no CRM is called in this phase. A successful response
means the record was committed locally.

### 7.4 Repository boundary and future transfer

The UI talks to domain repositories, not Drizzle directly. Repositories cover
content reads and submission creation. The initial adapter uses SQLite/libSQL.
A future PostgreSQL adapter can implement the same contracts and return the
same domain shapes.

Drizzle supports both database families, but schemas and migrations are
dialect-specific. The production transition therefore includes a deliberate
PostgreSQL schema/migration set and a one-time content/submission transfer,
while page components, validation contracts, and form UX remain unchanged.

## 8. Form Data Flow

1. A visitor enters registration or contact data.
2. Client validation catches missing required fields and malformed email
   addresses, focuses the first invalid field, and preserves all values.
3. The form posts structured data to a dedicated route handler.
4. The server validates the payload again and rejects unexpected fields.
5. The route handler calls the corresponding submission repository.
6. The repository commits the record and returns its generated identifier.
7. The UI enters a truthful stored-success state.

The visible state model is `idle`, `submitting`, `success`, or `error`.
Submission disables repeat activation while pending. Server validation maps
back to individual fields. Infrastructure errors preserve entered values and
show a retryable message; they never display success.

## 9. Failure Behavior

- Missing or invalid core content fails loudly during server rendering rather
  than producing partially empty cards.
- Optional media uses its reserved placeholder slot and meaningful fallback
  copy.
- Database initialization errors include an actionable local setup command.
- Failed form submissions retain values and clearly state that nothing was
  stored.
- Redirects preserve equivalent route destinations where one exists.
- The technical diagram and countdown degrade to static accessible content
  when scripts or motion are unavailable.

## 10. Verification

### 10.1 UI verification

- Inspect canonical pages at desktop, tablet, and mobile widths.
- Confirm mosaic proportions, gutters, sticky-to-flow rail transition, mobile
  reading order, and absence of horizontal overflow.
- Verify grayscale-only active styles and the semantic-token rule.
- Check keyboard navigation, focus visibility, skip link, headings,
  landmarks, form labels, status announcements, and meaningful alternative
  text.
- Verify reduced-motion behavior for reveals, video, scrolling, and countdown.

### 10.2 Application verification

- Run the production build and TypeScript checks.
- Verify every canonical route, redirect, metadata title, canonical URL, and
  Event JSON-LD output.
- Test empty, proposed, and confirmed agenda states.
- Test local database creation, migration, repeatable seeding, and content
  reads.
- Test valid/invalid registration and contact submissions, persistence,
  pending states, duplicate activation protection, and database failures.
- Enforce that active components do not import seed files, database clients,
  ORM schemas, or legacy page compositions.

## 11. Delivery Order

### Checkpoint 1: UI consolidation

- Promote Assembly routes to canonical paths.
- Add legacy redirects.
- Establish grayscale tokens and remove active literal colours.
- Verify responsive shell, mosaic, rail, type, motion, and accessibility.
- Adapt the selected agenda, countdown, and infrastructure-diagram behavior.
- Update documentation to describe one public design.

### Checkpoint 2: Local backend

- Add database packages, configuration, schema, migrations, and seed process.
- Implement repositories while preserving `SummitContent` and derived views.
- Add submission route handlers and server validation.
- Connect registration and contact forms with complete visible states.
- Add database and form verification.

After both checkpoints pass, integrate the verified work into the local
`main` branch. Remote push and deployment remain separate user-authorized
actions.
