# Cross Future — Block Library

Version 0.1 · 2026-08-18 · layout round, pre-colour
Scope decision: **single event, versioned yearly.** `/` is always the current
edition. Past editions are data, not new code.

---

## 0. The one architectural change

Today every page hardcodes its own section sequence in TSX. `app/page.tsx` is a
25-block wall of JSX; `/about` repeats 9 of those blocks with different props;
`derivedStats` is duplicated verbatim across two files; partner tiers, faculty
group copy, register status copy and the venue street address are all stranded
inside page components.

That is the thing that does not scale. Adding a section next year is a code
change, a review and a deploy.

**The move: a page is an ordered list of blocks, and that list lives in content.**

```ts
// lib/blocks.ts
export type Tone = "plain" | "mist" | "tint" | "deep" | "accent";
export type Size = "d0" | "d1" | "d2" | "d3";

export interface BlockInstance<K extends BlockKind = BlockKind> {
  id: string;            // stable anchor: "focus", "faculty" — used for #links
  kind: K;               // "SectionHead" | "Focus" | "PersonGrid" | ...
  tone?: Tone;
  size?: Size;
  columns?: number;
  /** Where the block gets its data. */
  source:
    | { from: "content"; path: string }        // "assembly.focusAreas"
    | { from: "query";   name: DerivedView; args?: Record<string, unknown> }
    | { from: "inline";  value: unknown };     // one-off copy, still in content
  /** Rendered only when this evaluates true. Keeps empty states honest. */
  when?: { path: string; op: "nonEmpty" | "empty" | "eq"; value?: unknown };
}

export interface PageDefinition {
  route: string;
  intro: string;          // key into pageIntros
  rail: boolean;
  blocks: BlockInstance[];
}
```

One `<BlockRenderer>` maps `kind` → component. Pages become four lines. The
registry is the contract; the content file is the composition.

What this buys, concretely:

| Today | After |
| --- | --- |
| New section = edit TSX, review, deploy | New section = one object in the page definition |
| Reorder home = rewrite 25 lines | Reorder home = move an array item |
| `/about` drifts from `/assembly/about` | One definition, one render path |
| A/B a hero = branch in JSX | A/B a hero = swap one `kind` |
| Adding edition 2027 = re-cut pages | Add an edition row; page defs are edition-agnostic |
| No CMS path | The page definition *is* the CMS schema |

Rules that keep it from turning into a soup:

1. A block never fetches. It receives typed props. `source` is resolved once,
   server-side, by the renderer.
2. A block never contains another block's layout. Nesting is expressed by the
   layout primitives (L5 Row, L6 Split), not by blocks importing blocks.
3. Every block accepts `tone` and renders correctly in all five. No block
   hardcodes a colour, ever — Tier-1 tokens only.
4. Every block has a defined empty state. `when` decides whether it renders at
   all; the empty state covers "renders, but has nothing yet."
5. A block's `id` is its anchor. Nav and in-page links target `id`, so a link
   cannot point at a section that does not exist.

---

## 1. Layout primitives (L)

Not blocks. The frame every block sits in. These are already right in the repo —
keep them.

| ID | Name | Behaviour |
| --- | --- | --- |
| L1 | **Shell** | `max-width 1560` · `padding 10` · grid `minmax(0,1fr) 312px` · `gap 10`. `.is-full` drops the rail column. |
| L2 | **Main** | Vertical grid, `gap 10`. Every block is one child. Constant gutter is the whole visual signature. |
| L3 | **Rail** | Sticky at `top 82px`. ≤1180px → static, 2-up. ≤720px → 1-up. Holds R1 + R2 only. |
| L4 | **Card** | `radius 22` (`18` ≤720px) · hairline border · **no shadow** · clipped media. Five tones. |
| L5 | **Row** | `repeat(n, 1fr)`, collapses n→2→1. |
| L6 | **Split** | Two uneven columns (typically 7/5 or 8/4), collapses to stack. |
| L7 | **Bleed** | Media fills a card edge-to-edge under content, with optional scrim. |

**Tone ladder** — the only hierarchy device, since colour is off:

```
plain   #ffffff   default card, long reading
mist    #fafafa   grouped/secondary card
tint    #f4f4f4   section grouping, quiet band
deep    #262626   inverted, high-emphasis, closing moments
accent  #111111   CTA and ticket only — load-bearing, use sparingly
```

Rhythm rule: never two `deep` blocks adjacent, never more than one `accent` per
page fold. A page reads `plain → mist → plain → tint → deep → accent`.

---

## 2. Chrome (C)

| ID | Name | Notes |
| --- | --- | --- |
| C1 | **Nav** | Wordmark + mark, 5 primary routes, "More" dropdown, RSVP button, burger → full drawer. Reads `ROUTES` — a page cannot exist unreachable. |
| C2 | **Footer** | Band media, 4 columns (Come join us / Pages / Contact / Host), **B06 Countdown**, **B34 Newsletter**, colophon. |
| C3 | **SkipLink** | → `#main`. |
| C4 | **EditionBadge** | *NEW.* "Edition 03 · 2026" chip in nav. On archived edition pages it becomes a switcher and a "you are viewing a past edition" bar. This is what makes yearly versioning cheap. |
| C5 | **Breadcrumb** | *NEW.* Required the moment detail routes exist (`/speakers/[slug]`, `/media/[slug]`, `/editions/[year]`). Mono, hairline, one line. |

---

## 3. Section blocks (B)

Status key: **✓ exists** · **↑ extend** · **NEW**

### 3.1 Openers

| ID | Block | Status | Contract | Empty state |
| --- | --- | --- | --- | --- |
| B01 | **HomeHero** | ✓ `AsmHero` | Mosaic: oversized display card with bled video + two stacked tiles (feature, ticket). Only on `/`. | Poster still if video absent. |
| B02 | **PageHero** | ✓ `AsmPageHero` | `{eyebrow, title, lede, media?}` + optional `aside` slot for chips. Every inner page. | Renders without media; no empty aside rail. |
| B03 | **SectionHead** | ✓ `AsmSectionHead` | `{eyebrow, title, lede?, action?, tone, size, id}`. The rhythm keeper — every content block is preceded by one. | `lede` and `action` both optional. |

`B03` is the highest-leverage block in the system. It is the only thing giving
the long home page structure. Do not let blocks grow their own headings.

### 3.2 Orientation

| ID | Block | Status | Contract | Empty state |
| --- | --- | --- | --- | --- |
| B04 | **Facts** | ✓ `AsmFacts` | 3–4 `dl` cells (When / Where / For who) + optional accent CTA cell as the 4th. | — |
| B05 | **Marquee** | ✓ `AsmMarquee` | Looping vocabulary strip, duplicate list `aria-hidden`. Pauses under reduced motion. | — |
| B06 | **Countdown** | ✓ `AsmCountdown` | `targetIso`. D/H/M/S. | Past the date → swaps to "Edition 03 concluded · see the archive" and links `/editions/2026`. **This is the block that makes the site not go stale — the old site is still advertising a July date in August.** |
| B07 | **Stats** | ↑ split out | Oversized numerals + labels. Currently welded inside `AsmEssentials` and duplicated as `derivedStats` in two pages. Make it a block; derive counts from content, never hardcode. | Hide any stat whose count is 0. |

### 3.3 Narrative

| ID | Block | Status | Contract | Empty state |
| --- | --- | --- | --- | --- |
| B08 | **Story** | ✓ `AsmStory` | Numbered chapters, alternating text card / media card. | — |
| B09 | **Voices** | ✓ `AsmVoices` | Sourced pull-quotes `{quote, name, role, person?, media?}`. | — |
| B10 | **Prose** | **NEW** | Constrained-measure long-form body (60–72ch), h2/h3/ul/blockquote/table. | — |
| B11 | **Thesis** | ↑ | Single oversized statement, `deep`. Today it's `SectionHead` with a long lede — make it explicit. | — |

**B10 Prose is a hard requirement, not a nicety.** There are three routes with
nowhere to put text right now: `/privacy`, `/terms`, and journal post detail.
The live site's legal pages are Lorem Ipsum under a Wix default `<title>Privacy
Policy | Site</title>`. That ships as-is unless Prose exists.

### 3.4 Programme

| ID | Block | Status | Contract | Empty state |
| --- | --- | --- | --- | --- |
| B12 | **Focus** | ✓ `AsmFocus` | 4-up topic cards with track-code chips + optional hero split. Maps 1:1 to the old site's "Key Areas of Focus". | — |
| B13 | **Infrastructure** | ✓ `AsmInfrastructure` | SVG single-line diagram, grid→substation→switchgear→UPS/BESS→PDU→rack, track codes pinned to nodes. Data-driven from `tracks[]`. | Static accessible list without JS. |
| B14 | **Agenda** | ✓ `AsmAgenda` | Three states: `published` (confirmed sessions) / `provisional` (proposed only — **current state, 9 proposed / 0 confirmed**) / `empty`. | Already designed. Best-in-repo empty state; the old site just says "AGENDA IS COMING SOON". |
| B15 | **SessionCard** | ✓ inside strip | Scroll-snap card, expandable, keyboard paging. | Shows duration + room when speakers TBA. |
| B16 | **TrackList** | ↑ | Track codes + names, links to filtered agenda. Currently a sub-part of B14. | — |

### 3.5 People — *the biggest gap*

| ID | Block | Status | Contract | Empty state |
| --- | --- | --- | --- | --- |
| B17 | **PersonCard** | ✓ `AsmPersonCard` | Portrait + solid name plate. Links out only when `verified && links.length` (`pickLink`). Keep this rule — the old site links Shaun VanWeelden to a stranger's LinkedIn. | Plain text name. |
| B18 | **PersonGrid** | ✓ `AsmFacultyGrid` | n-up grid, category grouped, staggered reveal. | — |
| B19 | **PersonProfile** | **NEW** | `/speakers/[slug]`. Portrait, role, org, bio, verified links, their sessions, their interview, other editions they appeared in. | Bio absent → role + org + affiliation only. |
| B20 | **Toolbar** | **NEW** | Search field + facet chips (category, organization, edition) + result count. Client-side over a server-rendered list, so it degrades to the full list without JS. | "No speakers match" + reset. |

**Why B19 + B20 are required by the answer "keep all 47 speakers."** 47 people
in one flat grid is a wall. There is no way to link to a person, no way for a
speaker to share their own page, no place for a bio, and no way to express that
a returning speaker is the *same person* across 2024/2025/2026 — which the data
model already encodes via `people` + `appearances` and the UI currently throws
away. Every speaker page is also an SEO surface the old site never had.

### 3.6 Media

| ID | Block | Status | Contract | Empty state |
| --- | --- | --- | --- | --- |
| B21 | **MediaFrame** | ✓ `AsmMedia` | The single door: aspect reservation, focal point, duotone, scrim, bleed, lazy, placeholder marker. Delegates video. **Keep this as the only door.** | Dashed placeholder box with label. |
| B22 | **InterviewCard** | ✓ `AsmInterviews` | Still, `code · duration`, title, name, org, pull quote. Card links only when `url` exists. | Static article, no link — current state for all 18. |
| B23 | **InterviewGrid** | ✓ | n-up, featured vs archive. | — |
| B24 | **InterviewDetail** | **NEW** | `/media/[slug]`. Player, speaker cross-link → B19, transcript (Prose), related interviews. | Poster + "recording coming" state. |
| B25 | **Gallery** | ✓ `AsmGallery` | CSS-columns masonry. | — |

### 3.7 Ecosystem

| ID | Block | Status | Contract | Empty state |
| --- | --- | --- | --- | --- |
| B26 | **PartnerWall** | ↑ `AsmPartners` | Logos grouped. **Extend `type` (academic/ecosystem/industry/community) with `tier` (host/lead/supporting/community/media).** Bypasses duotone by design. Every logo needs `alt` + `url`. | Name as text when no logo. |
| B27 | **PartnerTiers** | **NEW** | What partners get / what we ask, per tier. Currently a hardcoded `TIERS` const inside `app/partners/page.tsx`. | — |
| B28 | **Letters** | ✓ `AsmLetters` | Crest, issuer, date, excerpt, full document at 17:22, duotone off. | Document image without transcript still renders; excerpt is the a11y path. |

Note on B28: the two letters are `AI and Technology Summit-eScroll.jpg` and
`Message from the Mayor.jpg`. Their text exists only as pixels. The `excerpt`
field is what makes them readable and indexable — treat it as required, not
optional.

### 3.8 Archive — *the versioning surface*

| ID | Block | Status | Contract |
| --- | --- | --- | --- |
| B29 | **PastEditions** | ✓ `AsmPastEditions` | Edition cards: label chip, year, city, headline, stat `dl`, "This year" chip. Now links to B30. |
| B30 | **EditionDetail** | **NEW** | `/editions/[year]`. A frozen past edition: its hero, its speakers, its agenda as it ran, its interviews, its partners, its gallery. Renders from the same blocks with `edition` scoped. |
| B31 | **Journal** | ✓ `AsmJournal` | Field-note cards, 3:2 media, date, read time, excerpt. Needs `/journal/[slug]` + B10. |

**B30 is the entire answer to "versioned yearly."** Because blocks are
edition-scoped data reads, an archived edition costs one route and zero new
components. `/` renders `isCurrent`; `/editions/2025` renders the same block
list against the 2025 edition slug. Rolling to 2027 = add an edition row, flip
`isCurrent`, and last year's site freezes itself.

### 3.9 Conversion

| ID | Block | Status | Contract | Empty state |
| --- | --- | --- | --- | --- |
| B32 | **CTA** | ✓ `AsmCta` | Accent card: title, text, primary + secondary buttons, optional bled media. One per page, at the end. | — |
| B33 | **Form** | ✓ `AsmForm` | The field engine. `{name,label,type,required,half,options}`, submit-time validation, focus first invalid, preserves values on failure, honest status line. | idle / submitting / success / error. |
| B34 | **Contact** | ✓ `AsmContact` | Copy + email + socials + Form. | — |
| B35 | **Newsletter** | **NEW** | Email + consent → `/api/subscribe`. Footer variant (inline) and section variant (card). | Double opt-in language; never claim a send that did not happen. |
| B36 | **FAQ** | ✓ `AsmFaq` | Native `<details>/<summary>`, no JS. Filterable by tag so `/agenda` shows agenda questions. | — |
| R1 | **RailFeature** | ✓ | Bled media + title + ghost button. | — |
| R2 | **RailTicket** | ✓ | 16:10 media, perforation divider, `dl` stub rows, block inverse CTA. The best object in the system. | — |

**B35 Newsletter is a straight regression if omitted.** The live site captures
email in two places (footer "BE IN THE KNOW" + a consent checkbox on the contact
form). The repo captures it in zero.

---

## 4. Atoms (A)

| ID | Name | Status | Notes |
| --- | --- | --- | --- |
| A1 | Button | ✓ | 3 tones: accent / ghost / inverse. Internal → `Link`, external → `<a rel="noreferrer">`. |
| A2 | Chip | ↑ | Mono, hairline pill. Used by Toolbar, PageHero aside, tracks, tiers. Currently ad-hoc per page — promote it. |
| A3 | Glyph | ✓ | 6-entry flat SVG map. |
| A4 | Wordmark | ⚠️ | **`AsmMark()` is labelled PLACEHOLDER and renders in the nav on every page.** Real logo is a blocker for any visual review. |
| A5 | Reveal | ✓ | IntersectionObserver, once, immediate under reduced motion. |
| A6 | FieldRow | ✓ | Inside Form. Half/full width. |
| A7 | Perforation | ✓ | The ticket tear line. |
| A8 | Duotone | ✓ | Media treatment, strength `0.8`. Off for logos and documents. |

---

## 5. Token contract

Two tiers, already correct in `app/assembly/assembly.css`. Components touch
Tier 2 only; `tests/grayscale-css.test.ts` asserts every hex has `R===G===B`.

Recolouring the whole site is a Tier-1 edit:

```css
--asm-h-accent:      /* brand */    --asm-c-blue:  /* brand */
--asm-h-accent-ink:  /* on-brand */ --asm-c-sky:   /* brand tint */
```

Keep the greyscale gate passing until layout is signed off. When brand colour
lands, flip the test from "must be grey" to "must be a token, never a literal".

**Metrics** (unchanged, they are the signature): gap `10` · radius `22/18` ·
rail `312` · max `1560` · nav `62` · stick `82`.

**Type**: Barlow Semi Condensed (display) · Barlow (body) · IBM Plex Mono
(eyebrows, metadata, times, chips, codes). Scale `d0` `clamp(3.4rem,11.4vw,10.5rem)`
→ `d4`.

---

## 6. Block inventory summary

| Category | Exists | Extend | New | Total |
| --- | --- | --- | --- | --- |
| Layout (L) | 7 | 0 | 0 | 7 |
| Chrome (C) | 3 | 0 | 2 | 5 |
| Blocks (B) | 24 | 5 | 9 | 38 |
| Atoms (A) | 7 | 1 | 0 | 8 |
| | **41** | **6** | **11** | **58** |

**The nine new blocks**, in build order:

1. **B10 Prose** — unblocks legal, journal detail, bios, transcripts.
2. **B19 PersonProfile** — the 47-speaker payoff.
3. **B20 Toolbar** — makes 47 speakers and 18 interviews navigable.
4. **B24 InterviewDetail** — the media library the Wix video wall never was.
5. **B30 EditionDetail** — yearly versioning for free.
6. **B35 Newsletter** — closes a live-site regression.
7. **B27 PartnerTiers** — pulls hardcoded copy out of the page.
8. **C5 Breadcrumb** — required once detail routes exist.
9. **C4 EditionBadge** — the "you are viewing 2025" affordance.

Plus **B07 Stats** split out of Essentials, and **B26 PartnerWall** extended
with a `tier` axis.
