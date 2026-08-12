# Cross Future AI Summit 2026

Site for the Cross Future AI Summit — a one-day event in Montréal on
AI data center power and energy resilience, hosted by Cross Future Hub
(non-profit). Ships with two complete design variations:

- **`/` — Design A, "Technical Broadsheet"**: Inter Tight + IBM Plex Mono,
  `#4B47F5` accent, FIG. 01 electrical single-line diagram.
- **`/nexus` — Design B, "Nexus"**: recreation of the
  cross-future-nexus.base44.app reference — Space Grotesk + Inter +
  JetBrains Mono, `#3D57FF` accent on `#FBFBF9`, thin extra-long broadsheet
  with horizontal snap agenda, faculty pillars, interviews, countdown
  footer — plus photo-forward innovations (portrait reveals, interview
  thumbnails, and the § 06 Archives photo wall the reference never renders).

Next.js 15 (App Router) · React 19 · TypeScript · plain CSS. No database, no
CMS, no API keys. Node 20+.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Architecture: one content door

```
content/seed.json   ← all content lives here
lib/content.ts      ← the ONLY file allowed to import seed.json
components/*        ← read data via props, typed by lib/content.ts
app/page.tsx        ← calls getSummitContent(), passes slices down
```

`getSummitContent()` is async on purpose. To swap in a CMS later, reimplement
that single function (switch on `CONTENT_SOURCE` from `.env`) and return the
same `SummitContent` shape. Nothing else changes.

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

"Technical Broadsheet": paper white, Inter Tight display, IBM Plex Mono
labels, one electric blue `#4B47F5`. Tokens live in `app/globals.css` in two
tiers — primitives (`--c-blue-500`) then semantics (`--text-accent`).
Components use only semantic tokens; retheme by remapping semantics.

Square corners, hairline borders, no shadows. Blue is load-bearing only
(section numbers, primary buttons, active states, the conductor pulse).

Accessibility: skip link, visible focus rings, semantic landmarks, real alt
text, Event JSON-LD in the layout, `prefers-reduced-motion` stops the FIG. 01
conductor animation.

## Forms

The registration form validates client-side and then states plainly that it
is not connected — nothing is sent or stored. Wire it to a backend or point
people at `registrationUrl` when registration opens.
