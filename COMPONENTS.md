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
  assembly/
    layout.tsx             Design C fonts + <div class="assembly"> wrapper,
                           nav and footer (shared by every assembly route)
    assembly.css           Design C tokens + all Design C component CSS
    page.tsx               Design C home
    about|speakers|agenda|media|partners|register|contact/page.tsx
    not-found.tsx          404 inside the Assembly shell
    [...slug]/page.tsx     Catch-all → notFound(), so bad URLs stay in-design

components/
  *.tsx                    Design A components (unprefixed)
  nexus/Nexus*.tsx         Design B components (Nexus prefix, nx- CSS prefix)
  assembly/Asm*.tsx        Design C components (Asm prefix, asm- CSS prefix)

content/
  seed.json                Design A content
  seed-nexus.json          Design B content
  seed-assembly.json       Design C content — GENERATED, see scripts/

lib/
  content.ts               Types + adapter + derived views
  sections.ts              Design A section numbering (shared by nav/marks/footer)
  assembly-nav.ts          Design C route table (nav, drawer, footer, 404)

scripts/
  build-seed-assembly.mjs        Emits content/seed-assembly.json
  build-assembly-placeholders.mjs Emits every file under public/assembly/

public/
  headshots/               Design A speaker portraits (SVG placeholders)
  partners/                Partner logos (SVG placeholders)
  documents/               Recognition documents (SVG placeholders)
  nexus/portraits/         Design B speaker portraits (SVG placeholders)
  nexus/archive/           Design B archive photo wall (SVG placeholders)
  assembly/                Design C media — 103 SVGs + 1 mp4, all PLACEHOLDER
                           (see public/assembly/README.md)
```

Each design variation is **fully self-contained**: its own route folder, its
own CSS file, its own font imports, its own component folder, its own seed.
Changing one design cannot break another. That isolation is deliberate —
keep it.

---

## 3. `lib/content.ts` — the adapter

### Entry point

```ts
getSummitContent(variant?: "default" | "nexus" | "assembly"): Promise<SummitContent>
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
| `MediaAsset` | **Every** image and clip in Design C | `kind` is `"image"` or `"video"`; carries its own `aspect`, `focalPoint`, optional `caption`/`credit`, and `placeholder: true` while it is a stand-in. |
| `AssemblyContent` | Design C's presentational blocks | Namespaced under `content.assembly` rather than a dozen loose optional fields. Holds hero, facts, marquee, rail, story, focus areas, features, stats, voices, FAQ, journal, past editions, letters, gallery, contact, footer band and per-page intros. |

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
| `getAssembly(content)` | `AssemblyContent` | Throws if the block is missing. Fail loud beats a page of empty sections. |
| `getProposedSessions(...)` | `Session[]` | `status === "proposed"`, sorted. Feeds the agenda's provisional block — never a substitute for the empty state. |
| `getFacultyByCategory(faculty)` | grouped | Research → Industry → Ecosystem, empty groups dropped. |
| `getInterviewCards(content, faculty)` | `InterviewCard[]` | Joins an interview to its person and org line; unknown slugs give `person: null` rather than throwing, since interview guests need not have an appearance. |
| `getPartnersByType(content)` | grouped | First-seen order preserved. |
| `formatEditionDate` / `formatEditionHours` / `formatSessionTime` / `sessionDurationMin` | `string` \| `number` | One source of truth for time formatting, always in the edition's own timezone. |

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

## 6. Design C — "Assembly" (`/assembly`)

Barlow Semi Condensed + Barlow + IBM Plex Mono. Barlow is the family the live
Cross Future site already uses; the semi-condensed cut carries the oversized
uppercase display of the IT/CONF reference without adding a second voice.

Structure: a **tiled card system**. Every block is a rounded card floating on
the page ground at a constant 10px gutter, beside a **sticky right rail**
holding the agenda teaser and a ticket stub. Below 1180px the rail unsticks
into two cards; below 720px everything is one column.

CSS: `app/assembly/assembly.css`, every rule scoped under `.assembly`. Class
prefix `asm-`.

### Colour

**Tier 1 of the token block is greyscale on purpose.** The hierarchy is built
to work on value, weight and scale alone. Tier 2 names the job each colour
does — `--asm-h-deep` (heaviest surface), `--asm-h-tint` (secondary card),
`--asm-h-mist` (pale section header), `--asm-h-accent` (display type and
primary buttons), `--asm-h-accent-ink`.

To apply a palette, edit those five primitives and nothing else. Do not reach
past Tier 2 from a component.

### Card vocabulary

| Class | Role |
| --- | --- |
| `.asm-card` | The atom: radius, overflow clip, `position: relative`. |
| `.t-plain` `.t-mist` `.t-tint` `.t-deep` `.t-accent` `.t-outline` | Tone. Descendant rules key off `.t-deep` / `.t-accent` to flip eyebrow, lede, meta and focus-ring to the inverse ink — so a card only has to declare its tone. |
| `.asm-stack` `.asm-row` `.asm-split` | The only three layout primitives. `--cols` / `--cols-md` set the row's column count inline. |
| `.is-padded` `.is-padded-tight` | Padding, kept off the base so media can bleed. |

### Components

| Component | Props | Role |
| --- | --- | --- |
| `AsmMedia` | `media`, `duotone?`, `scrim?`, `bleed?`, `square?`, `aspect?`, `priority?` | **The single door for every image and clip.** Owns the aspect box, focal point, duotone flattening, lazy loading and the placeholder marker. Delegates `kind: "video"` to `AsmVideo`. Do not write a bare `<img>` in this design — the reason one component owns all of it is that a placeholder and the real asset must occupy identical space. |
| `AsmVideo` | *(internal)* | `"use client"`. Muted, looped, `playsInline`, autoplay. Under `prefers-reduced-motion` it pauses, holds the poster and shows an explicit play control — CSS cannot stop autoplay, so this has to be JS. |
| `AsmReveal` | `children`, `as?`, `className?`, `delay?` | `"use client"` scroll reveal. Applies `.is-visible` immediately under reduced motion so content is never gated behind an animation that will not run. Reuse rather than writing another observer. |
| `AsmNav` | `year` | `"use client"`. Sticky pill nav; mobile drawer closes on route change and Escape; `aria-current` from `isCurrentRoute`'s longest-prefix match. |
| `AsmShell` | `children`, `rail` | Two-column body + `<main id="main">`. Every route renders through it. |
| `AsmRail` | `rail` | The sticky feature card + ticket stub (real dashed perforation with notch cut-outs). |
| `AsmFooter` | `edition`, `host`, `assembly` | Image band, four columns, colophon. Rendered once in the layout. |
| `AsmSectionHead` | `eyebrow`, `title`, `lede?`, `action?`, `tone?`, `size?`, `id?` | Opens every section. Sections never write their own header markup — the page's rhythm comes from this being identical everywhere. |
| `AsmButton` | `href?`, `tone?`, `block?`, `arrow?`, `type?` | Pill in three tones. Routes internal hrefs through `next/link` and adds `rel="noreferrer"` to external ones automatically. |
| `AsmGlyph` / `AsmMark` | `glyph` | Six flat geometric marks (`chip` `grid` `bolt` `node` `wave` `cross`) used as card punctuation. `AsmMark` is the wordmark — **PLACEHOLDER** until the real logo lands. |
| `AsmMarquee` | `items`, `tone?` | Scrolling strip; the list renders twice for a seamless loop, the duplicate `aria-hidden`. |
| `AsmHero` | `edition`, `assembly` | Video-backed hero with display type on top. |
| `AsmFacts` | `facts` | When / where / for who. |
| `AsmPersonCard` / `AsmFacultyGrid` | `member` / `members`, `columns?` | Portrait + name plate. Links a name **only** when `safeLink` is non-null. |
| `AsmStory` | `chapters` | Numbered chapters, text/media alternation driven by index so a fourth chapter keeps the rhythm. |
| `AsmFocus` | `areas`, `hero?` | The four tracks, each carrying its track code. |
| `AsmEssentials` | `eyebrow`, `title`, `features`, `stats` | Features strip + oversized statistics inside one tinted card. Stats are **passed in derived**, never hardcoded. |
| `AsmInterviews` | `cards`, `columns?` | Interview cards; becomes a link only when the interview has a `url`. |
| `AsmVoices` | `voices` | Sourced pull quotes. |
| `AsmPartners` | `groups`, `columns?` | Logo wall grouped by type. Bypasses `AsmMedia` deliberately: duotone is right for photography and wrong for a mark. |
| `AsmLetters` | `letters` | Letters shown as documents — no duotone, no crop. |
| `AsmJournal` / `AsmPastEditions` / `AsmGallery` | | Field notes, edition archive, CSS-columns masonry photo wall. |
| `AsmFaq` | `items` | Native `<details>`. Keyboard-operable and find-in-page-able with no client component. |
| `AsmForm` | `fields`, `submitLabel`, `successNote`, `tone?` | `"use client"`. One engine behind registration and contact. Validates, focuses the first invalid field, then states plainly that nothing was sent. |
| `AsmContact` | `contact`, `edition` | Shared contact block. |
| `AsmCta` | `title`, `text`, `primary`, `secondary?`, `media?` | Closing call to action. |
| `AsmPageHero` | `intro`, `aside?` | Inner-page hero from `assembly.pageIntros[route]`. |

### Generated files — do not hand-edit

`content/seed-assembly.json` and everything under `public/assembly/` are build
artefacts:

```bash
npm run seed:assembly          # → content/seed-assembly.json
npm run placeholders:assembly  # → public/assembly/**
npm run generate:assembly      # both, in order
```

Edit the script, re-run, commit both. Placeholder composition is deterministic
from the file path, so regenerating produces byte-identical files.

### Two behaviours specific to this design

1. **Agenda states.** Zero confirmed sessions renders the designed "not yet
   published" header plus the proposed rows chipped `PROVISIONAL`. Flip one
   session to `confirmed` and header, chip and row set all switch. No code
   change.
2. **404 routing.** `app/assembly/not-found.tsx` alone only catches
   `notFound()` calls. `app/assembly/[...slug]/page.tsx` is what makes an
   unmatched URL render the in-design 404 instead of the app-wide default.

---

## 7. Conventions

- **Server components by default.** `"use client"` only where an observer,
  timer or form state genuinely requires it — currently `NexusNav`,
  `NexusCountdown`, `Reveal`, `AsmNav`, `AsmVideo`, `AsmReveal`, `AsmForm`
  and the two registration forms.
- **Plain CSS, no framework.** One stylesheet per design. No CSS-in-JS, no
  utility classes, no Tailwind.
- **Class prefixes are the isolation boundary.** Design A unprefixed,
  Design B `nx-`, Design C `asm-`. A new design gets its own prefix.
- **Two-tier tokens.** Primitives name the value (`--c-blue-500`), semantics
  name the job (`--text-accent`). Components reference semantics only.
- **Accessibility is not a pass at the end.** Skip link, visible focus
  rings, semantic landmarks, real alt text, Event JSON-LD in the root
  layout, and `prefers-reduced-motion` honoured by every animation.
- **Never guess an outbound URL.** See `pickLink`.
- **Fail loud on bad data.** The adapter throws rather than rendering a
  half-empty page.

---

## 8. Adding a design variation — the checklist

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
