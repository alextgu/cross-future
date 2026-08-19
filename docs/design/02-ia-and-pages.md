# Cross Future — Information Architecture & Page Compositions

Version 0.1 · 2026-08-18 · companion to `01-block-library.md`
Model: **single event, versioned yearly.** `/` is always the current edition.

---

## 1. Gap analysis — old site vs. current wireframe

### 1.1 Old site content, and where it lands

| Old cross-future.com | Verbatim / count | New home | Verdict |
| --- | --- | --- | --- |
| Hero: "Cross Future AI Summit 2026" / "Shaping Future of AI, Innovating for Tomorrow" | stock photo named `VR Art Exhibition.jpeg` | B01 HomeHero | **Rethink.** Real video/photography. The stock asset is the single biggest credibility leak on the live site. |
| CTA "Click To Join Us July 24th in Montreal" | → eventgo.ai | B01 + R2 + C1 | **Keep**, but date must come from data, not copy. |
| Non-profit intro paragraph | ~120 words, 6 typos | B02 / B11 Thesis | **Keep, rewrite.** `thelandscape`, `systemicchallenges`, `supply reltabity`, `dispatchStrengthening`, `Al` vs `AI`, no terminal period. |
| "Interview" video wall | 18 cards, 1 duplicate (James Elder ×2) | B22/B23 → **B24 detail** | **Rethink.** Wix widget exposes no titles and no URLs. Becomes a real media library. |
| "MAIN   STAGE   HIGHLIGHTS" | 47 speakers | B18 grid → **B19 profiles** + **B20 toolbar** | **Rethink.** Flat carousel → structured, filterable, linkable. |
| "Key Areas of Focus and Topics" | 4 cards, 2 typos (`desity`, `storge`) | B12 Focus | **Keep.** Already 1:1 in the repo as T1–T4. |
| "Agenda" → "AGENDA   IS COMING SOON" | placeholder | B14 Agenda | **Keep, upgrade.** Repo's provisional state is strictly better. |
| "Congratulatory letter" | 2 scanned images | B28 Letters | **Keep.** Needs transcribed excerpts — text is currently pixels only. |
| "OUR PARTNERS" | ~24 logos, **zero alt text**, no tiers | B26 + **B27 tiers** | **Rethink.** Names exist only inside the images. |
| "Become Our Partner" | a heading with no link | B27 → `/partners#become` | **Fix.** Currently a dead end. |
| Contact form | First/Last/Email/Message + newsletter checkbox | B33 + B34 | **Keep.** |
| Footer "BE IN THE KNOW" | email + consent + Join | **B35 Newsletter** | **Missing from repo — build it.** |
| Footer "Quick Links" | Speakers, Partners (both → bare domain) | C2 | **Fix.** Real anchors. |
| `/privacy-policy`, `/terms` | **Lorem Ipsum**, Wix default `<title>…| Site</title>` | **B10 Prose** | **Missing from repo — build it.** |
| Nav "More" dropdown | contents unretrievable | C1 | Already modelled as About + Media. |
| Social links | **none exist** | C2 | Optional; repo seed has 2 placeholder socials. |

### 1.2 Repo innovations the old site never had — keep all of them

Rail (R1/R2 sticky ticket) · Story chapters · Voices · FAQ · Journal ·
Infrastructure single-line diagram · Marquee · Gallery · Past editions ·
Countdown · Essentials/Stats · honest form states · `pickLink` safety rule ·
`AsmMedia` as a single door · the greyscale token gate.

### 1.3 Net feature gaps

| Gap | Severity | Block |
| --- | --- | --- |
| No speaker detail route for 47 people | **High** | B19, B20 |
| No interview playback or detail route | **High** | B24 |
| No newsletter capture anywhere (live site has two) | **High** | B35 |
| No legal pages at all | **High** | B10 |
| No archived-edition route — "versioned yearly" has no surface | **High** | B30, C4 |
| Partner wall has no tier axis, no alt text discipline | Medium | B26, B27 |
| Journal cards link nowhere | Medium | B10 |
| Wordmark is a labelled PLACEHOLDER in nav on every page | Medium | A4 |
| Page sequences hardcoded in TSX; copy stranded in components | **High** | §0 of block library |
| `/assembly/*` + `/nexus` still compiled but unreachable; `app/assembly/about` has already drifted | Medium | delete or freeze |
| `public/assembly/**` is a stale byte-different duplicate of `public/summit/**` | Low | delete |

---

## 2. Route map

```
/                          current edition home            no rail
/about                     org + thesis + programme        rail
/speakers                  47, grouped + filterable        rail
/speakers/[slug]           NEW  person profile             rail
/agenda                    provisional → published         rail
/media                     interviews + gallery + journal  rail
/media/[slug]              NEW  interview detail           rail
/journal/[slug]            NEW  field note                 rail
/partners                  wall + tiers + become           rail
/register                  benefits + form                 rail
/contact                   details + form + getting there  rail
/editions                  NEW  archive index              rail
/editions/[year]           NEW  frozen past edition        rail
/privacy                   NEW  prose                      no rail
/terms                     NEW  prose                      no rail
404                        in-shell                        rail
```

Nav bar: Home · Speakers · Agenda · Partners · Contact — **matches the live
site exactly.** More: About · Media · Archive. Persistent: RSVP button.

`ROUTES` stays the single source for nav, drawer, footer and 404 — extend it
with the new routes and a `primary` flag, and add `/register` to it (it is
currently special-cased in three places and consequently missing from the 404
page list).

---

## 3. Page compositions

Notation: `id · Block · tone`. Every content block is preceded by a B03
SectionHead unless marked. `⌁` = new block.

### `/` — home · **no rail** (hero carries R1+R2 as tiles)

```
01  B01 HomeHero              deep     video bleed + 2 tiles
02  B04 Facts                 plain    When / Where / For who + accent CTA cell
03  B05 Marquee               tint
04  B03 → B23 InterviewGrid   plain    8 of 18 · action → /media
05  B03 → B18 PersonGrid      mist     8 of 47 · action → /speakers
06  B03 → B12 Focus           plain    4 areas + hero split   ← old "Key Areas"
07  B03 → B14 Agenda          tint     provisional strip · action → /agenda
08  B03 → B08 Story           plain    3 chapters
09  B07 Stats                 deep     47 speakers / 04 tracks / 18 interviews / 24 partners
10  B03 → B26 PartnerWall     plain    2 of 5 tiers · action → /partners
11  B03 → B09 Voices          mist
12  B03 → B28 Letters         tint     ← old "Congratulatory letter"
13  B03 → B29 PastEditions    plain    action → /editions
14  B03 → B36 FAQ             mist     6 of 12
15  B32 CTA                   accent   Register / See the agenda
16  B34 Contact               deep
```

Cut from today's home: Essentials (folds into B07), Journal (moves to `/media`),
the second Focus pass, and three of the SectionHeads. **25 blocks → 16.** The
current home is longer than the live site's entire page.

### `/speakers` — the flagship change

```
01  B02 PageHero      mist    aside: 47 confirmed · 22 research · 07 industry · 03 ecosystem
02  B20 Toolbar ⌁     plain   search + facets: category · organization · edition
03  B03 SectionHead   mist    "From the lab"      → B18 PersonGrid  4-up  (22)
04  B03 SectionHead   plain   "From the floor"    → B18 PersonGrid  4-up  (07)
05  B03 SectionHead   mist    "From the ecosystem"→ B18 PersonGrid  4-up  (03)
06  B10 Prose ⌁       deep    "A note on links" — the pickLink rule, explained
07  B32 CTA           accent  Speak at the next edition
```

### `/speakers/[slug]` ⌁ — new

```
01  C5 Breadcrumb ⌁   Speakers / Name
02  B19 PersonProfile plain   L6 split: portrait 5 | name·role·org·verified links 7
03  B10 Prose ⌁       plain   bio
04  B03 → B15         mist    their sessions            when: sessions nonEmpty
05  B03 → B22         plain   their interview           when: interview exists
06  B03 → B29         tint    other editions            when: appearances > 1
07  B03 → B18         mist    others from same org / category   4-up
08  B32 CTA           accent  → /register
```

### `/agenda`

```
01  B02 PageHero  02  B04 Facts (no CTA cell)  03  B14 Agenda + B16 TrackList
04  B03 → B36 FAQ (agenda-tagged)   05  B32 CTA "Registrants get it first"
```

### `/media`

```
01  B02 PageHero      aside: 18 interviews · 4 h 12 m · 8 photographs
02  B20 Toolbar ⌁     search + facets: topic · speaker · edition
03  B03 → B23  3-up   Featured (5)
04  B03 → B23  4-up   Full archive (13)
05  B03 → B25 Gallery
06  B03 → B31 Journal      → /journal/[slug]
07  B03 → B29 PastEditions
08  B32 CTA
```

### `/media/[slug]` ⌁ — new

```
01 C5 Breadcrumb  02 B24 InterviewDetail (player, 16:9, deep)
03 B10 Prose (transcript)  04 B03 → B19-lite (the speaker)  05 B03 → B23 related  06 B32 CTA
```

### `/partners`

```
01 B02 PageHero (aside: counts per tier)   02 B03 → B26 PartnerWall  5-up, tiered
03 B03 → B28 Letters                        04 B03 → B27 PartnerTiers ⌁  id=become
05 B32 CTA "Become our partner"
```

### `/register`

```
01 B02 PageHero (aside: status · date · hours)
02 L6 Split — mist: benefits + official page link | deep: B33 Form (6 fields)
03 B21 MediaFrame 21:9    04 B03 → B36 FAQ (all)    05 B34 Newsletter ⌁
```

### `/contact`

```
01 B02 PageHero  02 B04 Facts (Email / Venue / Date / Host)  03 B34 Contact
04 L6 Split — map media | "Getting there"   ← move the street address into edition data
05 B03 → B36 FAQ  06 B10 Prose "Elsewhere"
```

### `/about`

```
01 B02 PageHero  02 L5 Row of 3 pillars  03 B11 Thesis (deep)  04 B03 → B08 Story
05 B05 Marquee  06 B03 → B13 Infrastructure  07 B03 → B12 Focus (no hero)
08 B09 Voices  09 B07 Stats  10 B03 → B28 Letters  11 B03 → B29 PastEditions  12 B32 CTA
```

### `/editions` and `/editions/[year]` ⌁ — new

```
/editions          01 B02 PageHero  02 B29 PastEditions (all)  03 B07 Stats (cumulative)  04 B32 CTA
/editions/[year]   00 C4 EditionBadge bar "You are viewing Edition 02 · 2025 → current"
                   01 C5 Breadcrumb  02 B02 PageHero (that year)  03 B04 Facts
                   04 B14 Agenda (as it ran, published)  05 B18 PersonGrid (that year)
                   06 B23 InterviewGrid  07 B26 PartnerWall  08 B25 Gallery  09 B32 CTA → current
```

Every block above already exists. **A whole archived year costs one route file.**

### `/privacy`, `/terms` ⌁ — new

```
01 B02 PageHero  02 B10 Prose (no rail, constrained measure)  03 B03 → B34 Contact link
```

---

## 4. Content model changes

Additive only. Nothing in `SummitContent` breaks.

```ts
// 1 — pages become data
pages: PageDefinition[]                 // route → intro key, rail flag, blocks[]

// 2 — people gain a detail surface
people[].bio?: string
people[].pronouns?: string
people[].socials?: { label: string; url: string }[]
appearances[].sessionSlugs?: string[]
appearances[].interviewSlug?: string

// 3 — interviews become real media
interviews[].slug: string               // exists
interviews[].url?: string               // ALL 18 currently empty
interviews[].transcript?: string
interviews[].topics?: string[]          // powers B20 facets
interviews[].personSlug: string         // cross-link to B19

// 4 — partners gain a tier axis
partners[].tier: "host"|"lead"|"supporting"|"community"|"media"
partners[].alt: string                  // REQUIRED — old site had zero
partners[].url: string                  // 10 of 13 currently empty

// 5 — letters become readable
documents[].excerpt: string             // REQUIRED — text is pixels today
documents[].issuerRole?: string

// 6 — editions become self-describing
editions[].isArchived: boolean
editions[].summary?: string
editions[].heroMedia?: MediaAsset
editions[].venueAddress?: string        // move "1041 Rue de Bleury" out of JSX

// 7 — new tables
subscribers: { id, email, consentAt, source, status }
legal_pages: { slug, title, body, updatedAt }
```

**Copy to un-strand from components** (each currently hardcoded in a page file):
`TIERS` → `partners.tiers` · `GROUP_COPY` → `pageIntros.speakers.groups` ·
`STATUS_COPY` → `editions[].statusCopy` · venue address → `editions[].venueAddress` ·
"A note on links" → `pages` inline block · `/media` "Five conversations" → derived count.

---

## 5. Responsive contract

| Width | Shell | Rail | Grids | Notes |
| --- | --- | --- | --- | --- |
| ≥1440 | 1560 max, 2-col | sticky 312 | 4-up / 5-up | Full mosaic. |
| 1181–1439 | fluid, 2-col | sticky 312 | 4-up | |
| 721–1180 | 1-col | **static, 2-up below main** | 3-up → 2-up | Rail joins the flow. |
| ≤720 | 1-col, gap 8, radius 18 | 1-up | 1-up stack | Reading order preserved; no horizontal overflow except B14/B15 and B05, which are intentional scroll-snap. |

Toolbar (B20) collapses to a search field + a horizontally scrolling chip row.
B19's split becomes portrait-over-text.

---

## 6. Build order

**Round 1 — layout, greyscale, no new data** (this round)
1. Block registry + `BlockRenderer` + `PageDefinition`; port `/` and `/about`.
2. B10 Prose, A2 Chip, B07 Stats split out.
3. Trim home 25 → 16 blocks.
4. Delete `app/assembly/*`, `app/nexus`, `components/nexus`, legacy
   `components/*.tsx`, `public/assembly/**`, `content/seed.json`,
   `content/seed-nexus.json`. They are unreachable and already drifting.

**Round 2 — the people + media payoff**
5. B19 PersonProfile + `/speakers/[slug]`, C5 Breadcrumb.
6. B20 Toolbar on `/speakers` and `/media`.
7. B24 InterviewDetail + `/media/[slug]`; `/journal/[slug]`.

**Round 3 — versioning + conversion**
8. B30 EditionDetail, `/editions`, C4 EditionBadge.
9. B35 Newsletter + `/api/subscribe`; `/privacy`, `/terms`.
10. B26 tiers + B27 PartnerTiers.

**Round 4 — brand**
11. Real wordmark (A4). Tier-1 colour swap. Flip the greyscale test to a
    no-literal-colours test. Replace the 36 `placeholder: true` assets.

---

## 7. Content you will need to supply

Not blocking layout — every one has a designed placeholder slot.

1. **Partner names + logos + URLs + tiers** (~24). Names exist only as pixels
   in the current logo files; there is no alt text anywhere on the live site.
2. **Letter transcripts** (2) — issuing official, office, body text.
3. **Interview video URLs + titles** (18). The Wix video channel exposes neither.
4. **Speaker bios + verified profile links** (47). 35 people currently sit at
   `verified: false` with empty `links`, so no name on the site is clickable.
   One live-site link is wrong (Shaun VanWeelden → `oliver-s-xin` on LinkedIn).
5. **Confirmed sessions.** 9 proposed, 0 confirmed — the agenda stays
   provisional until the first `confirmed` row exists.
6. **Event facts from EventGo**: date, start/end time, timezone, venue name,
   street address, ticket types, prices. The listing is a client-side SPA with
   no JSON-LD, so none of it is machine-readable.
7. **Real hero footage** to replace the stock `VR Art Exhibition` asset.
8. **The wordmark.**
9. **Privacy + terms copy.** Both live pages are Lorem Ipsum.
10. **Edition data for 2024 and 2025** if `/editions` is to be real rather than
    three summary cards.

Also worth deciding: the live site still advertises **July 24th** and is
future-tense as of today, 2026-08-18. The repo's seed says **2026-10-08,
Hotel Monville, Montréal**. Those disagree. B06 Countdown's post-date state is
the structural fix, but the correct date needs confirming.
