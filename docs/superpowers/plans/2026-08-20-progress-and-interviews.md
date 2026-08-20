# Progress and Interviews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a progress-focused festival history, canonical interview library and detail routes, and a non-obstructive CEO Review panel without changing the existing navbar structure.

**Architecture:** Extend the existing `SummitContent` contract and repository boundary so past festivals and interviews remain authoritative data rather than page-local copy. The homepage and Past Events page share pure completed-edition selectors; interview pages read the same interview records used by homepage cards. Review controls write CSS variables and root data attributes so every Assembly component inherits the chosen presentation without component-level branching.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, plain CSS, Zod, Drizzle ORM, libSQL/SQLite, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-20-progress-and-interviews-design.md`

## Global Constraints

- Preserve the navbar labels, order, anchors, Past Events route, and Register action exactly.
- Keep `/` focused on the current edition and exclude the upcoming 2026 edition from completed-festival views.
- Do not invent dates, outcomes, or interview-to-edition relationships.
- Keep `getSummitContent()` as the only content door used by layouts and pages.
- Keep unknown interview years nullable and show those records only in the global interview library.
- Add no CMS, authentication, admin dashboard, video hosting, or newsletter delivery.
- Preserve existing submission rows during content seeding and database migration.
- Keep review controls enabled for this mockup, compact by default, persistent, keyboard accessible, and clear of primary actions.
- Publish privately when supported; require explicit approval if the resolved deployment is shared or public.

---

## File Structure

### New files

- `lib/review-settings.ts` — typed review-control constants, guards, defaults, and storage keys.
- `components/assembly/AsmProgress.tsx` — homepage progress chapter using completed `PastEdition` records.
- `components/assembly/AsmInterviewLibrary.tsx` — progressive-enhancement filters over the complete interview list.
- `app/interviews/page.tsx` — interview library route and metadata.
- `app/interviews/[slug]/page.tsx` — permanent interview detail route and route-specific metadata.
- `tests/progress-content.test.ts` — completed-edition and interview selector contracts.
- `tests/progress-components.test.tsx` — progress, archive, and interview empty-state rendering.
- `tests/review-settings.test.ts` — review-control range, guard, and boot-contract verification.
- `drizzle/0002_*.sql` and `drizzle/meta/0002_snapshot.json` — generated migration and snapshot, with the SQL inspected for row preservation.

### Existing files with focused changes

- `lib/content.ts` — add interview/past-edition fields and pure selectors.
- `lib/content-schema.ts` — validate the new fields and unique interview slugs.
- `content/seed-assembly.json` — generated slugs, topic arrays, and supplied progress highlights.
- `scripts/build-seed-assembly.mjs` — authoritative generation of those fields.
- `db/schema.ts` — persist interview slug, optional edition year, and topics.
- `scripts/db-seed.ts` — seed the extended interview row without touching submissions.
- `lib/repositories/sqlite-content-repository.ts` — reconstruct extended interviews.
- `tests/content-schema.test.ts` — reject duplicate slugs and malformed progress highlights.
- `tests/content-repository.test.ts` — prove seed/database parity for the new fields.
- `tests/migration-integrity.test.ts` — prove legacy interviews survive migration.
- `app/page.tsx` — insert progress after Program and before Supporters.
- `app/past-events/page.tsx` — pass completed editions and use progress-oriented copy.
- `components/assembly/AsmPastEventsMockup.tsx` — render only completed records and supplied highlights.
- `components/assembly/AsmInterviews.tsx` — link cards to canonical interview routes.
- `components/assembly/AsmFacultyGrid.tsx` — expose a review-only collection-depth hook.
- `next.config.ts` — redirect legacy archive/media routes to `/interviews`.
- `tests/redirects.test.ts` — lock the new redirect destinations.
- `tests/metadata.test.ts` — cover `/interviews` metadata.
- `components/assembly/AsmThemeLab.tsx` — turn the developer bar into the compact Review panel.
- `app/layout.tsx` — apply stored review settings before first paint.
- `app/assembly/assembly.css` — progress, interview, density, radius, and collection-depth styles.
- `app/assembly/themes.css` — Review panel layout and responsive behavior.
- `tests/theme-tokens.test.ts` — preserve token discipline across the new CSS.
- `README.md` — document the new routes, content relationships, and review controls.

---

### Task 1: Extend Content Contracts and Pure Selectors

**Files:**
- Modify: `lib/content.ts`
- Modify: `lib/content-schema.ts`
- Modify: `scripts/build-seed-assembly.mjs`
- Modify: `content/seed-assembly.json`
- Create: `tests/progress-content.test.ts`
- Modify: `tests/content-schema.test.ts`

**Interfaces:**
- Produces: `Interview.slug: string`, `Interview.editionYear?: number`, `Interview.topics?: string[]`.
- Produces: `PastEdition.highlights: string[]`.
- Produces: `getCompletedPastEditions(content: SummitContent): PastEdition[]`.
- Produces: `getInterviewCardBySlug(content: SummitContent, faculty: FacultyMember[], slug: string): InterviewCard | null`.
- Produces: `getInterviewCardsForEditionYear(content: SummitContent, faculty: FacultyMember[], year: number): InterviewCard[]`.
- Produces: `getInterviewYears(content: SummitContent): number[]`.

- [ ] **Step 1: Write failing selector tests**

```ts
import { describe, expect, it } from "vitest";
import seedAssembly from "../content/seed-assembly.json";
import {
  getCompletedPastEditions,
  getCurrentEdition,
  getFaculty,
  getInterviewCardBySlug,
  getInterviewCardsForEditionYear,
  getInterviewYears,
  type SummitContent,
} from "../lib/content";

const content = seedAssembly as unknown as SummitContent;
const current = getCurrentEdition(content);
const faculty = getFaculty(content, current.slug);

describe("progress content", () => {
  it("excludes the current edition from completed festivals", () => {
    expect(getCompletedPastEditions(content).map((item) => item.year)).toEqual([
      2025,
      2024,
    ]);
  });

  it("resolves interviews by a stable unique slug", () => {
    const first = content.interviews?.[0];
    expect(first).toBeDefined();
    expect(getInterviewCardBySlug(content, faculty, first!.slug)?.interview.code)
      .toBe(first!.code);
  });

  it("does not invent edition filters for unmapped interviews", () => {
    expect(getInterviewYears(content)).toEqual([]);
    expect(getInterviewCardsForEditionYear(content, faculty, 2025)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests and verify the missing contracts fail**

Run: `npm test -- tests/progress-content.test.ts tests/content-schema.test.ts`

Expected: FAIL because `slug`, `highlights`, and the selectors do not exist.

- [ ] **Step 3: Add the domain fields and selectors**

Add these fields to `Interview` and `PastEdition` in `lib/content.ts`:

```ts
export interface Interview {
  code: string;
  slug: string;
  title: string;
  person: string;
  durationMin: number;
  featured: boolean;
  editionYear?: number;
  topics?: string[];
  pullQuote?: string;
  image?: { sourceUrl: string; alt: string; placeholder?: boolean };
  url?: string;
}

export interface PastEdition {
  label: string;
  year: number;
  city: string;
  headline: string;
  stats: StatItem[];
  highlights: string[];
  media: MediaAsset;
}
```

Add pure selectors after the existing Assembly derived views:

```ts
export function getCompletedPastEditions(content: SummitContent): PastEdition[] {
  const current = getCurrentEdition(content);
  return [...getAssembly(content).pastEditions]
    .filter((edition) => edition.year < current.year)
    .sort((left, right) => right.year - left.year);
}

export function getInterviewCardBySlug(
  content: SummitContent,
  faculty: FacultyMember[],
  slug: string
): InterviewCard | null {
  return getInterviewCards(content, faculty).find(
    ({ interview }) => interview.slug === slug
  ) ?? null;
}

export function getInterviewYears(content: SummitContent): number[] {
  return [...new Set(
    (content.interviews ?? [])
      .map((interview) => interview.editionYear)
      .filter((year): year is number => year !== undefined)
  )].sort((left, right) => right - left);
}

export function getInterviewCardsForEditionYear(
  content: SummitContent,
  faculty: FacultyMember[],
  year: number
): InterviewCard[] {
  return getInterviewCards(content, faculty).filter(
    ({ interview }) => interview.editionYear === year
  );
}
```

- [ ] **Step 4: Extend Zod validation and reject duplicate slugs**

Update `interviewSchema` and `pastEditions` in `lib/content-schema.ts`:

```ts
const interviewSchema = z.object({
  code: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string(),
  person: z.string(),
  durationMin: z.number(),
  featured: z.boolean(),
  editionYear: z.number().int().optional(),
  topics: z.array(z.string()).optional(),
  pullQuote: z.string().optional(),
  image: z.object({
    sourceUrl: z.string(),
    alt: z.string(),
    placeholder: z.boolean().optional(),
  }).strict().optional(),
  url: z.string().optional(),
}).strict();
```

Attach a `superRefine` to `summitContentSchema` that adds a custom issue at
`["interviews", index, "slug"]` when two interview records share a slug.
Extend the PastEdition schema with `highlights: z.array(z.string())`.

- [ ] **Step 5: Make the generator authoritative and regenerate the seed**

In `scripts/build-seed-assembly.mjs`, add verified progress highlights to the
2024 and 2025 records and an empty array to 2026. Generate interview slugs from
person plus code so repeated interviewees stay unique:

```js
const code = `IV.${String(i + 1).padStart(2, "0")}`;
return {
  code,
  slug: `${person}-${code.toLowerCase().replace(".", "-")}`,
  title,
  person,
  durationMin,
  featured,
  topics: [],
  ...(pullQuote ? { pullQuote } : {}),
  image: { /* keep the existing generated image contract */ },
};
```

Use only facts already present in the seed for highlights:

```js
highlights: [
  "The first Cross Future convening brought academia and industry into one room.",
],
```

and:

```js
highlights: [
  "Formal recognition from the Province of Ontario and the City of Toronto.",
],
```

Run: `npm run seed:assembly`

Expected: `content/seed-assembly.json` contains a unique slug and empty topics
array for every interview, plus highlights for every past-edition record.

- [ ] **Step 6: Add duplicate-slug and malformed-highlight schema tests**

Extend `tests/content-schema.test.ts` with cloned malformed documents. Assert a
duplicate interview slug and a non-string highlight both fail validation at
their exact paths.

- [ ] **Step 7: Run the content tests**

Run: `npm test -- tests/progress-content.test.ts tests/content-schema.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the content contract**

```bash
git add lib/content.ts lib/content-schema.ts scripts/build-seed-assembly.mjs content/seed-assembly.json tests/progress-content.test.ts tests/content-schema.test.ts
git commit -m "feat: model festival progress and interviews"
```

---

### Task 2: Persist Interview Metadata Without Losing Rows

**Files:**
- Modify: `db/schema.ts`
- Modify: `scripts/db-seed.ts`
- Modify: `lib/repositories/sqlite-content-repository.ts`
- Modify: `tests/content-repository.test.ts`
- Modify: `tests/migration-integrity.test.ts`
- Create: `drizzle/0002_*.sql`
- Create: `drizzle/meta/0002_snapshot.json`
- Modify: `drizzle/meta/_journal.json`

**Interfaces:**
- Consumes: Task 1 `Interview.slug`, `editionYear`, and `topics` fields.
- Produces: Drizzle `interviews.slug`, `interviews.editionYear`, and `interviews.topics` columns.
- Preserves: Existing interview codes, people foreign keys, and all submission tables.

- [ ] **Step 1: Write failing repository parity and migration tests**

Add to `tests/content-repository.test.ts`:

```ts
expect(content.interviews?.map(({ slug, editionYear, topics }) => ({
  slug,
  editionYear,
  topics,
}))).toEqual(seedAssembly.interviews.map(({ slug, editionYear, topics }) => ({
  slug,
  editionYear,
  topics,
})));
```

Add a migration test that applies migrations through `0001`, inserts a legacy
interview row, runs the full migrator, and asserts its generated slug is
`legacy-person-iv-99` and its nullable metadata remains null.

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `npm test -- tests/content-repository.test.ts tests/migration-integrity.test.ts`

Expected: FAIL because the database columns and migration do not exist.

- [ ] **Step 3: Extend the Drizzle schema**

Update `db/schema.ts`:

```ts
export const interviews = sqliteTable("interviews", {
  code: text("code").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  personSlug: text("person_slug").notNull().references(() => people.slug),
  durationMin: integer("duration_min").notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull(),
  editionYear: integer("edition_year"),
  topics: text("topics", { mode: "json" }).$type<string[]>(),
  pullQuote: text("pull_quote"),
  image: text("image", { mode: "json" }).$type<{
    sourceUrl: string;
    alt: string;
    placeholder?: boolean;
  }>(),
  url: text("url"),
});
```

- [ ] **Step 4: Generate and inspect the migration**

Run: `npm run db:generate`

Inspect the generated `0002` SQL. If its table-copy statement does not populate
the new non-null `slug` column for legacy rows, replace that copied expression
with this deterministic value:

```sql
person_slug || '-' || lower(replace(code, '.', '-'))
```

The copy statement must preserve every existing column and leave
`edition_year` and `topics` null for legacy rows. Do not drop or rebuild
`registrations` or `contact_inquiries`.

- [ ] **Step 5: Seed and reconstruct the extended fields**

Keep the existing `person`/`personSlug` mapping in `scripts/db-seed.ts`; the
remaining interview object carries `slug`, `editionYear`, and `topics` into the
insert automatically. In `sqlite-content-repository.ts`, keep those fields in
the reconstructed interview and normalize nullable database values to
`undefined`:

```ts
editionYear: interview.editionYear ?? undefined,
topics: interview.topics ?? undefined,
```

- [ ] **Step 6: Run migration, repository, and seed tests**

Run: `npm test -- tests/content-repository.test.ts tests/migration-integrity.test.ts tests/db-seed.test.ts tests/submissions.test.ts`

Expected: PASS, including preservation of submission rows across reseeding.

- [ ] **Step 7: Commit the persistence change**

```bash
git add db/schema.ts scripts/db-seed.ts lib/repositories/sqlite-content-repository.ts tests/content-repository.test.ts tests/migration-integrity.test.ts drizzle
git commit -m "feat: persist interview metadata"
```

---

### Task 3: Add the Homepage Progress Chapter and Improve Past Events

**Files:**
- Create: `components/assembly/AsmProgress.tsx`
- Modify: `components/assembly/AsmPastEventsMockup.tsx`
- Modify: `app/page.tsx`
- Modify: `app/past-events/page.tsx`
- Modify: `app/assembly/assembly.css`
- Create: `tests/progress-components.test.tsx`
- Modify: `tests/assembly-nav.test.ts`

**Interfaces:**
- Consumes: `getCompletedPastEditions(content): PastEdition[]` from Task 1.
- Produces: `AsmProgress({ editions }: { editions: PastEdition[] })`.
- Preserves: `ASSEMBLY_SECTIONS`, `ASSEMBLY_SITE_ROUTES`, and every navbar label/href.

- [ ] **Step 1: Write failing component and navbar-preservation tests**

Test `AsmProgress` with 2025/2024 fixtures and assert it renders both years,
their supplied highlights, and exactly one `/past-events` link. Test an empty
array returns no progress region. Extend `tests/assembly-nav.test.ts` to retain
the exact current five sections and separate Past Events route.

- [ ] **Step 2: Run the tests and verify the component is missing**

Run: `npm test -- tests/progress-components.test.tsx tests/assembly-nav.test.ts`

Expected: FAIL because `AsmProgress` does not exist.

- [ ] **Step 3: Implement `AsmProgress`**

Have `AsmProgress` own one top-level `AsmSection` with the heading “Built
edition by edition,” a short progress statement, one card per completed
edition, supplied stats/highlights, and one `AsmButton` to `/past-events`.
Return `null` when `editions.length === 0`. Use `AsmMedia` for every edition
image and existing `asm-card`, `asm-row`, `asm-meta`, `asm-d2`, and `asm-body`
primitives.

- [ ] **Step 4: Insert progress without adding a navbar anchor**

In `app/page.tsx`, compute:

```ts
const completedEditions = getCompletedPastEditions(content);
```

Insert the component after the Program `AsmSection` and before the existing
`recognition` section:

```tsx
<AsmProgress editions={completedEditions} />
```

Do not add `progress` to `ASSEMBLY_SECTIONS` or change `AsmNav`.

- [ ] **Step 5: Make Past Events consume the same completed view**

In `app/past-events/page.tsx`, replace the raw `assembly.pastEditions` prop with
`getCompletedPastEditions(content)`. Change the intro copy to frame the page as
progress across completed festivals. In `AsmPastEventsMockup`, render supplied
highlights and omit interview/gallery slots that have no authoritative data.

- [ ] **Step 6: Add focused progress/archive styles**

Add CSS classes for the progress introduction, edition cards, highlights, and
stats using only existing semantic tokens. Use the existing `--asm-radius`,
`--asm-pad`, and responsive row primitives; add no literal color outside the
Tier-1 token declarations.

- [ ] **Step 7: Run component, navigation, and token tests**

Run: `npm test -- tests/progress-components.test.tsx tests/assembly-nav.test.ts tests/theme-tokens.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the progress surfaces**

```bash
git add components/assembly/AsmProgress.tsx components/assembly/AsmPastEventsMockup.tsx app/page.tsx app/past-events/page.tsx app/assembly/assembly.css tests/progress-components.test.tsx tests/assembly-nav.test.ts
git commit -m "feat: tell the festival progress story"
```

---

### Task 4: Build the Canonical Interview Library and Detail Routes

**Files:**
- Create: `components/assembly/AsmInterviewLibrary.tsx`
- Create: `app/interviews/page.tsx`
- Create: `app/interviews/[slug]/page.tsx`
- Modify: `components/assembly/AsmInterviews.tsx`
- Modify: `components/assembly/AsmPastEventsMockup.tsx`
- Modify: `app/past-events/page.tsx`
- Modify: `scripts/build-seed-assembly.mjs`
- Modify: `content/seed-assembly.json`
- Modify: `next.config.ts`
- Modify: `tests/redirects.test.ts`
- Modify: `tests/metadata.test.ts`
- Modify: `app/assembly/assembly.css`

**Interfaces:**
- Consumes: `InterviewCard[]`, `getInterviewYears`, and `getInterviewCardBySlug`.
- Consumes: `getInterviewCardsForEditionYear` for edition cross-linking.
- Produces: `/interviews` and `/interviews/[slug]` routes.
- Produces: `AsmInterviewLibrary({ cards, years })` with an all-records default.
- Preserves: Navbar route table and visible labels.

- [ ] **Step 1: Write failing redirect and metadata expectations**

Change redirect expectations so `/archive`, `/media`, and `/assembly/media`
resolve to `/interviews`. Add `app/interviews/page.tsx` with canonical
`/interviews` to the static metadata file matrix.

- [ ] **Step 2: Run focused tests and verify the routes are absent**

Run: `npm test -- tests/redirects.test.ts tests/metadata.test.ts`

Expected: FAIL because redirects and route files still point at Past Events.

- [ ] **Step 3: Implement the interview library**

Create a client component that starts with `year: "all"`, renders filter
buttons only for values in `years`, and filters only records with an explicit
matching `editionYear`. Reuse `AsmInterviews` in grid mode for the result and
show the existing `AsmEmpty` when a filter has no matches.

- [ ] **Step 4: Implement `/interviews`**

Load Assembly content, current edition, faculty, cards, and interview years.
Render an `AsmShell`, progress-oriented `AsmSectionHead`, and
`AsmInterviewLibrary`. Export:

```ts
export const metadata: Metadata = {
  title: "Recorded Interviews",
  description: "Recorded conversations from across Cross Future festival editions.",
  alternates: { canonical: "/interviews" },
};
```

- [ ] **Step 5: Implement `/interviews/[slug]`**

Export `generateStaticParams` from the interview slugs and `generateMetadata`
from the resolved card. The page calls `notFound()` for an unknown slug. Render
the still through `AsmMedia`, speaker and organization lines, duration, pull
quote, known edition year, and either an external “Watch recording” button or
a polished “Recording coming” card. Add an “All interviews” return link.

- [ ] **Step 6: Make every interview card canonical**

In `AsmInterviews`, wrap each card in a Next `Link` to
`/interviews/${interview.slug}` regardless of whether an external recording URL
exists. The detail page owns the external handoff. Keep the article heading and
image alternative text unchanged.

- [ ] **Step 7: Point the hero and legacy paths at the library**

In the authoritative seed generator, set `assembly.rail.feature.ctaHref` to
`/interviews`, regenerate `content/seed-assembly.json`, and update the three
legacy redirects in `next.config.ts`.

- [ ] **Step 8: Cross-link explicitly mapped interviews from Past Events**

In `app/past-events/page.tsx`, build a record for the completed years using
`getInterviewCardsForEditionYear(content, faculty, edition.year)` and pass it to
`AsmPastEventsMockup`. Extend that component with:

```ts
interviewsByYear: Record<number, InterviewCard[]>;
```

For the selected year, render `AsmInterviews` only when the mapped array is
non-empty. Unknown/unmapped interviews remain absent from the edition panel and
available in `/interviews`.

- [ ] **Step 9: Style filters and detail layout**

Add Assembly-token-only CSS for a wrapping filter row, selected filter state,
detail split, recording status card, and mobile stack. Do not add an interview
link to the primary navbar.

- [ ] **Step 10: Run route, metadata, content, and build-time type tests**

Run: `npm test -- tests/redirects.test.ts tests/metadata.test.ts tests/progress-content.test.ts tests/theme-tokens.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 11: Commit the interview surfaces**

```bash
git add components/assembly/AsmInterviewLibrary.tsx components/assembly/AsmInterviews.tsx components/assembly/AsmPastEventsMockup.tsx app/interviews app/past-events/page.tsx scripts/build-seed-assembly.mjs content/seed-assembly.json next.config.ts tests/redirects.test.ts tests/metadata.test.ts app/assembly/assembly.css
git commit -m "feat: add the interview library"
```

---

### Task 5: Replace the Developer Bar with the CEO Review Panel

**Files:**
- Create: `lib/review-settings.ts`
- Modify: `components/assembly/AsmThemeLab.tsx`
- Modify: `components/assembly/AsmFacultyGrid.tsx`
- Modify: `components/assembly/AsmInterviews.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/assembly/assembly.css`
- Modify: `app/assembly/themes.css`
- Create: `tests/review-settings.test.ts`
- Modify: `tests/theme-tokens.test.ts`

**Interfaces:**
- Produces: `ReviewDensity = "compact" | "balanced" | "airy"`.
- Produces: `ReviewCollectionDepth = "curated" | "full"`.
- Produces: radius range `8..28`, default `22`.
- Produces root attributes `data-review-density` and `data-review-collection`.
- Produces root CSS variable `--asm-radius`.

- [ ] **Step 1: Write failing setting-contract tests**

Create tests that assert the exact defaults, guards, storage keys, and radius
clamping behavior:

```ts
expect(clampReviewRadius(4)).toBe(8);
expect(clampReviewRadius(31)).toBe(28);
expect(isReviewDensity("balanced")).toBe(true);
expect(isReviewDensity("wide")).toBe(false);
expect(isReviewCollectionDepth("curated")).toBe(true);
```

- [ ] **Step 2: Run the tests and verify the settings module is missing**

Run: `npm test -- tests/review-settings.test.ts`

Expected: FAIL because `lib/review-settings.ts` does not exist.

- [ ] **Step 3: Implement typed review settings**

Export exact storage keys, allowed values, defaults, guards, and:

```ts
export function clampReviewRadius(value: number): number {
  return Math.min(REVIEW_RADIUS_MAX, Math.max(REVIEW_RADIUS_MIN, value));
}
```

Use `balanced`, `curated`, and `22` as the recommended reset defaults.

- [ ] **Step 4: Extend the first-paint boot script**

In `app/layout.tsx`, read the stored density, collection depth, and radius in
the existing guarded inline script. Validate each value against serialized
allowed lists before applying `data-review-density`,
`data-review-collection`, and `--asm-radius`. On any storage error, apply the
recommended defaults alongside the existing theme/tint fallback.

- [ ] **Step 5: Rebuild `AsmThemeLab` as a compact Review panel**

Start with `open = false`. Replace “Dev · scheme” with “CEO review” and
“Preview controls.” Keep theme and tint, then add:

- Radius range input, 8–28, step 1.
- Three density buttons.
- Curated/full collection buttons.
- Reset button restoring theme `hub`, tint `1`, radius `22`, density
  `balanced`, and collection `curated`.

Every change updates React state, the root element, and localStorage. The closed
button reads “Review · {current.label}”.

- [ ] **Step 6: Expose collection-depth hooks only on homepage rails**

Add `data-review-collection="speakers"` to the strip/rail root rendered by
`AsmFacultyGrid` and `data-review-collection="interviews"` to interview rail
mode. Do not add either attribute to interview grid/library mode.

- [ ] **Step 7: Implement inherited density, radius, and curated-depth CSS**

Define root defaults and attribute overrides for section distance and internal
gaps. Under `data-review-collection="curated"`, hide speaker rail items after
16 and interview rail items after 8; full mode shows every item. Ensure hidden
items are removed with `display: none` so they are not focusable. Keep existing
mobile radii derived from `--asm-radius` rather than resetting to a hardcoded
value.

- [ ] **Step 8: Make the panel non-obstructive**

Replace the full-width bottom toolbar with a bottom-right drawer capped at
`min(420px, calc(100vw - 20px))` and a viewport-safe maximum height. The closed
control remains a small pill. At 390px width, the open panel must stay within
the viewport and its close/reset controls must remain visible without covering
the entire primary CTA card.

- [ ] **Step 9: Run review and theme tests**

Run: `npm test -- tests/review-settings.test.ts tests/theme-tokens.test.ts tests/empty-and-loading-states.test.tsx`

Expected: PASS.

- [ ] **Step 10: Commit the Review panel**

```bash
git add lib/review-settings.ts components/assembly/AsmThemeLab.tsx components/assembly/AsmFacultyGrid.tsx components/assembly/AsmInterviews.tsx app/layout.tsx app/assembly/assembly.css app/assembly/themes.css tests/review-settings.test.ts tests/theme-tokens.test.ts
git commit -m "feat: add CEO review controls"
```

---

### Task 6: Validate the Complete Story and Update Documentation

**Files:**
- Modify: `README.md`
- Modify when a verification failure proves necessary: only files from Tasks 1–5.

**Interfaces:**
- Consumes: All prior tasks.
- Produces: A validated production build and documented content workflow.

- [ ] **Step 1: Update README route and content documentation**

Document `/interviews`, `/interviews/[slug]`, the completed-festival selector,
optional interview edition mapping, progress highlights, and all Review panel
controls. State that unknown interview years remain ungrouped and the navbar is
unchanged.

- [ ] **Step 2: Run the full automated suite**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 3: Run static verification**

Run: `npm run typecheck && git diff --check`

Expected: both commands exit 0.

- [ ] **Step 4: Verify database setup and health**

Run: `npm run db:setup && npm run db:health`

Expected: migrations and deterministic seed complete; health prints row counts
without exposing submission contents.

- [ ] **Step 5: Build the production application**

Run: `npm run build`

Expected: production build exits 0 and includes `/`, `/past-events`,
`/interviews`, and `/interviews/[slug]`.

- [ ] **Step 6: Perform rendered browser verification**

Start the existing development server and inspect:

- Desktop `/`: progress appears after Program and before Supporters.
- Desktop `/past-events`: only 2025 and 2024 are selectable.
- Desktop `/interviews`: all 18 interviews are present; no edition filter is
  invented when no record is mapped.
- A representative interview detail: supplied still/copy plus recording-coming
  state.
- Mobile 390×844: navbar structure remains intact, no horizontal overflow, and
  the Review panel does not obscure the primary registration action.
- Review controls: theme, tint, radius, density, curated/full, reset, persistence,
  and compact reopening all work.

Read console errors and correct only blocking or task-related failures.

- [ ] **Step 7: Commit documentation and any verified corrections**

If verification required source corrections, stage each corrected path
explicitly after checking `git status --short`; never use a repository-wide
add. Then commit the task-owned files:

```bash
git add README.md
git commit -m "docs: explain progress and interview content"
```

---

### Task 7: Publish the CEO Review Site

**Files:**
- Create or modify only as required by the selected hosting contract:
  `.openai/hosting.json` and deployment build configuration.

**Interfaces:**
- Consumes: The successful production build from Task 6.
- Produces: A deployed review URL using the exact validated source.

- [ ] **Step 1: Load the Sites hosting contract and determine access level**

Use the installed Sites hosting workflow. Reuse an existing project identifier
when present; otherwise create one once and persist only the project identifier
plus any logical storage bindings in `.openai/hosting.json`.

- [ ] **Step 2: Prepare the established Next.js project for the hosting target**

Preserve the existing Next.js architecture and package manager. Add only the
Cloudflare-compatible build adapter or staging metadata required by the hosting
contract. Do not replace the application with a starter or alter the content
model.

- [ ] **Step 3: Re-run the deployment build if hosting preparation changes source**

Run: `npm run build`

Expected: exit 0 after all hosting-specific source changes.

- [ ] **Step 4: Save and deploy one validated version**

Package the exact build, save one version, prefer private deployment, and poll
until the deployment succeeds or fails. If only shared/public deployment is
available, stop for explicit access-level approval before publishing.

- [ ] **Step 5: Open and hand off the deployed review URL**

Open the successful deployment in the existing Site tab and return the exact
URL with a concise description of the progress story, interview library, and
Review controls.
