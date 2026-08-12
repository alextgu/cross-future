# COMPONENTS.md — architecture & component reference

Read this before touching the codebase. It exists so nobody has to re-derive
the architecture from the source every time.

`README.md` covers *how to run and extend* the site. This file covers *what
already exists and where it lives*.

---

## 1. The one rule

```
content/seed*.json   ← all content
lib/content.ts       ← the ONLY module allowed to import a seed file
components/*         ← receive data as props, typed by lib/content.ts
app/*/page.tsx       ← call getSummitContent(variant), pass slices down
```

Verify at any time:

```bash
grep -rn "seed.*\.json" app components   # must return nothing
```

A component that imports a seed file is a bug, not a shortcut. Server
components fetch via the adapter in `page.tsx` / `layout.tsx` and hand
plain typed objects downward.

---

## 2. Directory map

```
app/
  globals.css              Design A tokens + all Design A component CSS
  layout.tsx               <html>, fonts, Event JSON-LD, skip link, column rules
  page.tsx                 Design A — "Technical Broadsheet"
  nexus/
    layout.tsx             Design B fonts + <div class="nexus"> scope wrapper
    nexus.css              Design B tokens + all Design B component CSS
    page.tsx               Design B — "Nexus"

components/
  *.tsx                    Design A components (unprefixed)
  nexus/Nexus*.tsx         Design B components (Nexus prefix, nx- CSS prefix)

content/
  seed.json                Design A content
  seed-nexus.json          Design B content

lib/
  content.ts               Types + adapter + derived views
  sections.ts              Design A section numbering (shared by nav/marks/footer)

public/
  headshots/               Design A speaker portraits (SVG placeholders)
  partners/                Partner logos (SVG placeholders)
  documents/               Recognition documents (SVG placeholders)
  nexus/portraits/         Design B speaker portraits (SVG placeholders)
  nexus/archive/           Design B archive photo wall (SVG placeholders)
```

Each design variation is **fully self-contained**: its own route folder, its
own CSS file, its own font imports, its own component folder, its own seed.
Changing one design cannot break another. That isolation is deliberate —
keep it.

---

## 3. `lib/content.ts` — the adapter

### Entry point

```ts
getSummitContent(variant?: "default" | "nexus"): Promise<SummitContent>
```

Async on purpose: swapping in a CMS means reimplementing this one function
(switch on `process.env.CONTENT_SOURCE`) and returning the same shape.
Nothing else in the codebase moves.

### Core types

| Type | Purpose | Notes |
| --- | --- | --- |
| `Edition` | One row per year | `isCurrent: true` picks what renders. Optional fields (`editionNumber`, `format`, `heroFigure`, `heroStatement`, `socialLinks`, `coordinates`, `contactEmail`) are used by variants only. |
| `Organization` | Normalized org records | Appearances reference org **slugs**, so a rename is a one-field edit. |
| `Person` | One row per human, ever | `verified` gates outbound links. `headshot.focalPoint` for art direction. |
| `Appearance` | Joins person → edition | Carries that year's `roleTitle`, `category`, `billing` order, `featured`, optional `thesis`. A returning speaker = 1 person row + N appearance rows. |
| `Track` | The curriculum | `chainStage` pins each track to a node in the Design A hero diagram. |
| `Session` | Schedule row | `status: "confirmed"` is what makes it render. Optional variant fields: `code`, `categoryLabel`, `speakerLabel`, `description`, `outcomes`. |
| `Partner` | Logo wall | |
| `SummitDocument` | Recognition cards | |
| `ManifestoBlock` | Design B manifesto copy + pillars | Optional on `SummitContent`. |
| `Interview` | Design B interview cards | Optional. |
| `ArchiveItem` | Design B photo wall | Optional. |

**New content shapes go on `SummitContent` as optional fields** so existing
seeds stay valid without edits.

### Derived views (pure functions — no side effects, no fetching)

| Function | Returns | Behaviour worth knowing |
| --- | --- | --- |
| `getCurrentEdition(content)` | `Edition` | Throws if no edition has `isCurrent: true`. Fail loud. |
| `getFaculty(content, editionSlug)` | `FacultyMember[]` | Joins person + appearance + orgs, sorted by `billing`. Throws on an appearance pointing at an unknown person. |
| `getConfirmedSessions(content, editionSlug)` | `Session[]` | Filters `status === "confirmed"`, sorts by `startsAt`. |
| `getHostOrganization(content)` | `Organization \| null` | Looks up the `cross-future-hub` slug. |
| `pickLink(person)` *(private)* | `PersonLink \| null` | Returns a link **only** when `person.verified === true` and a link exists, priority `website > linkedin > scholar > twitter`. Never guess a URL. |

### Three derived behaviours — do not hardcode around them

1. **Agenda empty state.** Zero confirmed sessions renders the *designed*
   empty state, not a blank div. Add one confirmed session and a real
   schedule appears. No code change.
2. **Speaker links.** Unverified people render as plain text even if a link
   exists in the data.
3. **Curriculum ↔ diagram.** Both render from `tracks[]`. Adding a track
   updates the ruled rows *and* pins its code to the Design A diagram node
   for its `chainStage`.

---

## 4. Design A — "Technical Broadsheet" (`/`)

Paper white, Inter Tight display, IBM Plex Mono labels, one electric blue
`#4B47F5`. Square corners, hairline borders, no shadows. Blue is
load-bearing only: section numbers, primary buttons, active states, the
conductor pulse.

CSS: `app/globals.css`. Tokens in two tiers — primitives (`--c-blue-500`)
then semantics (`--text-accent`). **Components use only semantic tokens**;
retheming means remapping the semantic tier, nothing else.

| Component | Props | Role |
| --- | --- | --- |
| `Nav` | — | Section nav from `lib/sections.ts` `SECTIONS`. |
| `Hero` | `edition`, `host`, `facultyCount`, `tracks` | Kicker, title, tagline, fact grid, CTAs, renders `FigureOne`. |
| `FigureOne` | `tracks` | The FIG. 01 electrical single-line diagram. `STAGE_TO_NODE` maps `ChainStage` → diagram node. Animated conductor pulse, disabled under `prefers-reduced-motion`. |
| `Manifesto` | `edition` | § 01 thesis block. |
| `Curriculum` | `tracks` | § 02 ruled track rows. |
| `Faculty` | `faculty` | § 03 speaker rows; links only when `safeLink` is non-null. |
| `Agenda` | `edition`, `confirmedSessions`, `tracks` | § 04 schedule **or** the designed empty state. |
| `Recognition` | `documents` | Recognition document cards. |
| `Partners` | `partners` | Logo wall. |
| `Registration` | `edition` | Client-side-validated form that states plainly it is not wired to a backend. |
| `Footer` | `edition`, `host` | Colophon. |

`lib/sections.ts` exports `SECTIONS` and `sectionNum(id)` — nav, section
marks and footer all read from it, so numbering cannot drift.

---

## 5. Design B — "Nexus" (`/nexus`)

Space Grotesk + Inter + JetBrains Mono, `#3D57FF` on `#FBFBF9`. A thin,
extra-long broadsheet: horizontal snap agenda, faculty pillars, interview
cards, countdown footer, plus a photo-forward archive wall.

CSS: `app/nexus/nexus.css`, all rules scoped under `.nexus` (the wrapper
`<div>` in `app/nexus/layout.tsx`). Class prefix `nx-`. Design B CSS cannot
leak into Design A and vice versa.

| Component | Props | Role |
| --- | --- | --- |
| `NexusNav` | `year` | `"use client"`. `IntersectionObserver` sets `aria-current` on the active section. Sections listed in the exported `NEXUS_SECTIONS`. |
| `NexusHero` | `edition`, `host` | Stacked line-reveal title, fact list, `heroFigure` image, statement + CTA. |
| `NexusManifesto` | `manifesto` | § 01 — thesis with an accented middle clause, paragraphs, four numbered pillars. |
| `NexusAgenda` | `edition`, `sessions` | § 02 — horizontal scroll-snap rail; same empty-state rule as Design A. |
| `NexusFaculty` | `faculty`, `theses` | § 03 — pillar columns, portrait reveal on hover, per-edition `thesis` line. |
| `NexusInterviews` | `interviews`, `peopleBySlug`, `orgLineBySlug` | § 04 — interview cards with thumbnails and pull quotes. |
| `NexusRegister` | `edition`, `benefits` | § 05 — form + benefit list. |
| `NexusArchives` | `items` | § 06 — archive photo wall. |
| `NexusCountdown` | *(see file)* | Client-side countdown used in the footer. |
| `NexusFooter` | `edition`, `hostName`, `bandImage` | Countdown, social links, image band. |
| `Reveal` | `children`, `as?`, `className?` | `"use client"` scroll-reveal wrapper. Adds `.is-visible` on intersect; adds it immediately under `prefers-reduced-motion`. Reuse this rather than writing another observer. |

Imagery: hero / interview / footer images are **remote URLs** in
`seed-nexus.json`. Portraits and the archive wall are local placeholder SVGs
under `public/nexus/`, marked PLACEHOLDER.

---

## 6. Conventions

- **Server components by default.** `"use client"` only where an observer,
  timer or form state genuinely requires it — currently `NexusNav`,
  `NexusCountdown`, `Reveal`, and the two registration forms.
- **Plain CSS, no framework.** One stylesheet per design. No CSS-in-JS, no
  utility classes, no Tailwind.
- **Class prefixes are the isolation boundary.** Design A unprefixed,
  Design B `nx-`. A new design gets its own prefix.
- **Two-tier tokens.** Primitives name the value (`--c-blue-500`), semantics
  name the job (`--text-accent`). Components reference semantics only.
- **Accessibility is not a pass at the end.** Skip link, visible focus
  rings, semantic landmarks, real alt text, Event JSON-LD in the root
  layout, and `prefers-reduced-motion` honoured by every animation.
- **Never guess an outbound URL.** See `pickLink`.
- **Fail loud on bad data.** The adapter throws rather than rendering a
  half-empty page.

---

## 7. Adding a design variation — the checklist

1. `content/seed-<name>.json` — its own content document.
2. `lib/content.ts` — extend the `ContentVariant` union and the switch in
   `getSummitContent()`. Add any new shapes as **optional** fields on
   `SummitContent`.
3. `app/<name>/layout.tsx` — its own font imports and a scope wrapper
   `<div className="<name>">`; import its own CSS.
4. `app/<name>/<name>.css` — tokens (two tiers) + all component CSS, every
   rule scoped under the wrapper class.
5. `components/<name>/*.tsx` — prefixed components, props-only.
6. `app/<name>/page.tsx` — call `getSummitContent("<name>")` and pass slices.
7. Update this file.

Components still never import seed files. Only the adapter does.
