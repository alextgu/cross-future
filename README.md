# Cross Future AI Summit 2026

Site for the Cross Future AI Summit — a one-day event in Montréal on AI data
center power and energy resilience, hosted by Cross Future Hub. The canonical
site uses the Assembly tiled-card system at `/`, with pages at `/about`,
`/speakers`, `/agenda`, `/media`, `/partners`, `/register`, and `/contact`.

The previous design explorations remain in the repository as references:

- **Design A, "Technical Broadsheet"**: Inter Tight + IBM Plex Mono,
  `#4B47F5` accent, FIG. 01 electrical single-line diagram.
- **`/nexus` — Design B, "Nexus"**: preserved source; the route redirects to
  `/`. Originally a recreation of the
  cross-future-nexus.base44.app reference — Space Grotesk + Inter +
  JetBrains Mono, `#3D57FF` accent on `#FBFBF9`, thin extra-long broadsheet
  with horizontal snap agenda, faculty pillars, interviews, countdown
  footer — plus photo-forward innovations (portrait reveals, interview
  thumbnails, and the § 06 Archives photo wall the reference never renders).
- **`/` — Design C, "Assembly"**: the canonical tiled card system with a sticky
  ticket rail, taking its structure from the IT/CONF reference and its type
  family (Barlow) from the live cross-future.com. Eight routes — home, about,
  speakers, agenda, media, partners, register, contact — plus an in-design
  404. Built media-forward: 30+ image slots and a video hero, all routed
  through one `AsmMedia` component. Approved in greyscale, then coloured by a
  Tier-1 token swap — see **Design system** below.

Next.js 15 (App Router) · React 19 · TypeScript · plain CSS · Drizzle ORM ·
local libSQL/SQLite · Zod. No paid services or API keys. Node 20+.

Architecture, the full component inventory and the rules that hold it
together live in **[COMPONENTS.md](./COMPONENTS.md)** — read that first.

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev       # http://localhost:3000
npm run db:health # row counts only; never prints submissions
npm run build
```

## Architecture: one content door

```
content/seed-assembly.json       ← deterministic source document
db/schema.ts + drizzle/          ← portable schema and migrations
scripts/db-seed.ts               ← repeatable import; preserves submissions
lib/content.ts                   ← the only content door
lib/repositories/*               ← adapters behind typed interfaces
app/api/*                        ← validated form endpoints
components/*                     ← receive data via typed props
```

`getSummitContent()` is async on purpose. `CONTENT_SOURCE=seed` reads the
committed document; `CONTENT_SOURCE=database` reads the seeded local database.
To move to a CMS or PostgreSQL later, replace the repository adapter and return
the same `SummitContent` shape. Page components do not change.

## Local backend and production transfer

`npm run db:setup` applies the SQL migrations and deterministically refreshes
event content. It never deletes registration or contact submissions. The local
database lives at `data/cross-future.db` and is ignored by Git.

The relational tables cover editions, organizations, people, appearances,
tracks, sessions, partners, documents, interviews, presentation content,
registrations, and contact inquiries. Both form endpoints validate strict JSON
with Zod and report success only after the row is committed.

For production, keep the page and form contracts, then implement the same
repository interfaces against the company database. A serverless deployment
must use a persistent remote database connection; the local SQLite file is a
mock/development store, not deployable shared storage.

**Rule: if a component imports `content/seed.json`, the change is wrong.**
Check with:

```bash
grep -rn "seed.json" app components   # must return nothing
```

## Content model

- **editions** — one row per year. `isCurrent: true` picks what the site renders.
- **people** — one row per human, ever. `verified` gates outbound links.
- **appearances** — joins a person to an edition with that year's `roleTitle`,
  `category` (research | industry | ecosystem), `billing` order and `featured`
  flag. A returning speaker = one person row + one appearance per edition.
- **organizations** — normalized; appearances reference org slugs, so renaming
  a university is a one-field edit.
- **tracks** — the curriculum. `chainStage` (grid-interface | network |
  facility | scale) pins each track to a node in the FIG. 01 hero diagram
  (`components/FigureOne.tsx`), so curriculum and diagram cannot drift.
- **sessions** — currently empty. See derived behaviours below.
- **partners**, **documents** — logo wall and recognition cards.

## Derived behaviours (do not hardcode around them)

1. **Agenda** — zero sessions with `status: "confirmed"` renders the designed
   empty state ("not yet published" chip, registrants-first note, CTA, track
   list). Add one confirmed session to `sessions[]` and a real schedule
   renders instead. No code change needed.
2. **Speaker links** — a person's name links out only when
   `verified === true` **and** they have at least one link (see `pickLink` in
   `lib/content.ts`). Unverified people render as plain text even if a link
   exists in the data. Never link somewhere possibly wrong.
3. **Curriculum ↔ diagram** — both render from `tracks[]`. Adding a track
   updates the ruled rows and pins its code to the diagram node for its
   `chainStage`.

## How to add a variation

### A new edition (e.g. 2027)

1. Add an edition object to `editions[]` with a unique `slug` ("2027"),
   dates, venue, status and SEO fields.
2. Flip `isCurrent`: `false` on 2026, `true` on 2027.
3. Add `appearances[]` rows pointing at the new edition slug — reuse existing
   person rows for returning speakers, with their new `roleTitle`.

### A new speaker

1. Add a row to `people[]` (slug, headshot, bio, `verified: false` until you
   have confirmed their canonical link).
2. Drop the headshot in `public/headshots/` (or use a remote URL once a CMS
   provides one).
3. Add an `appearances[]` row joining them to the current edition.
4. When verified, set `verified: true` and add their link — the site links
   them automatically.

### A new track

Add a row to `tracks[]` with the next `code` (T5…) and a `chainStage`. The
curriculum row appears and the diagram pins the code under the matching node.
New chain stage? Extend the `ChainStage` union in `lib/content.ts` and the
`STAGE_TO_NODE` map in `components/FigureOne.tsx` — the compiler will point
at the map if you forget.

### A new design variation

Design B is the template: give the variation its own content file
(`content/seed-<name>.json`), extend `ContentVariant` and the switch in
`getSummitContent()` in `lib/content.ts`, then add `app/<name>/` (layout with
its own fonts + scoped CSS, page) and `components/<name>/`. New content
shapes go into `SummitContent` as optional fields so existing seeds stay
valid. Components still never import seed files — only the adapter does.

Design B's imagery: the three hero/interview/footer images are remote URLs
in `seed-nexus.json` (swap for your own hosting); portraits and the archive
wall are local placeholder SVGs under `public/nexus/` marked PLACEHOLDER.

### Publishing the schedule

Append session objects to `sessions[]`:

```json
{
  "title": "Interconnection queues are the new supply chain",
  "edition": "2026",
  "track": "T1",
  "startsAt": "2026-10-08T09:30:00-04:00",
  "endsAt": "2026-10-08T10:15:00-04:00",
  "room": "Salle 210",
  "speakers": ["amara-okafor"],
  "status": "confirmed"
}
```

The empty state disappears as soon as the first `confirmed` session exists.

## Design system

"Assembly": a tiled card system — every block is a rounded card on a common
ground with a constant gutter, plus a sticky rail carrying the agenda teaser
and the ticket stub. Type is Barlow Semi Condensed (display), Barlow (body),
IBM Plex Mono (labels).

Tokens live in `app/assembly/assembly.css` in two tiers. **Tier 1** names the
value (`--asm-n-500`, `--asm-c-blue`); **Tier 2** names the job
(`--asm-card-deep`, `--asm-ink-2`). Components use Tier 2 only, so retheming
is a Tier-1 edit and nothing else. Two Tier-1 values are deliberately outside
the ramp — `--asm-c-white` (ink over photography) and `--asm-c-black` (the
scrim) — because neither may invert when the scheme does.

Hierarchy is carried by the five card tones: `plain → mist → tint → deep →
accent`. Never two deep cards adjacent; at most one accent per fold.

### Colour schemes

`app/assembly/themes.css` holds the alternatives, each one a restatement of
Tier 1 and nothing else:

| id | what it is |
| --- | --- |
| `hub` | default — the real mark's blue, `#215f9a` |
| `hub-soft` | lighter hub blues — soft deep card `#1e568a`, accent `#3d84c0` |
| `midnight` | the ramp inverted — a dark scheme with no dark-mode code |
| `mono` | the greyscale study the layout was approved in |

The scheme is one attribute — `data-theme` on `<html>` — set before first
paint by the boot script in `app/layout.tsx` and stored in `localStorage`.

**Theme lab.** `components/assembly/AsmThemeLab.tsx` renders the on-screen
switcher (bottom bar) used in review sessions; the choice survives navigation
and reload. Turn it off for a deploy with `NEXT_PUBLIC_THEME_LAB=off`.

`tests/theme-tokens.test.ts` enforces the discipline: a literal colour outside
a Tier-1 token fails the suite, and every scheme must restate the full ramp.

### Brand assets

`public/brand/` holds the real Cross Future Hub artwork taken from the live
site and trimmed to its alpha bounds: `cross-future-mark.png` (nav) and
`cross-future-lockup.png` (footer). Both are single-colour artwork on
transparency, drawn through `AsmLogo` as a CSS mask filled with `currentColor`
— so one file is accent blue on the white nav, white on the deep footer card,
and follows every scheme without a second asset. `app/icon.png` and
`app/apple-icon.png` are the same mark.

Accessibility: skip link, visible focus rings, semantic landmarks, real alt
text, Event JSON-LD in the layout, and `prefers-reduced-motion` stops reveals
and the marquee.

## Forms

Registration posts to `/api/registrations`; contact posts to `/api/contact`.
The UI preserves field values on failure, focuses the first invalid input, and
shows pending, stored, and retry states. A stored registration is explicitly a
place request, not an issued ticket; a stored contact inquiry does not claim an
email was sent.
