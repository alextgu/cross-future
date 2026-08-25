# Event-First Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Cross Future primary navigation from mixed homepage anchors into a scalable event-first set of real pages, including a new Program page and safe legacy redirects.

**Architecture:** `lib/assembly-nav.ts` becomes the single route table for the logo, explicit Home link, Speakers & Interviews, Program, and Past Events. `AsmNav` renders that table identically on desktop and mobile with route-based active state. Existing content adapters and components power the new `/program` page and the already-created `/speakers` archive; legacy URLs redirect to canonical destinations.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Vitest, Testing Library, existing Assembly component system

**Spec:** `docs/superpowers/specs/2026-08-25-event-first-site-architecture-design.md`

## Global Constraints

- Work only on branch `codex/event-first-pages`; do not switch to or modify `main` during implementation.
- Keep About content on `/`; do not create an `/about` page.
- Both the Cross Future logo and an explicit Home label link to `/`.
- Primary internal navbar destinations are `/`, `/speakers`, `/program`, and `/past-events`.
- Register continues to open `https://www.eventgo.ai/event/1000909471805` directly.
- `/interviews/[slug]` remains canonical for individual recordings.
- Reuse existing content adapters and Assembly components; add no dependencies or speculative CMS records.
- Preserve existing dirty-worktree changes that are unrelated to this plan.
- Use the bundled Node runtime by prefixing commands with `PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH`.
- Stop the exact localhost process before `next build`, then restart the development server on port 3000.

---

## File structure

- Modify `lib/assembly-nav.ts`: canonical route constants, route table, active-route helper.
- Modify `components/assembly/AsmNav.tsx`: render route-only desktop and mobile navigation; remove section observation.
- Create `app/program/page.tsx`: canonical expandable Program page using current edition, focus, and agenda data.
- Modify `app/page.tsx`: keep About on Home and link the Program preview to `/program`.
- Modify `app/speakers/page.tsx`: expose stable speaker and interview section anchors.
- Modify `next.config.ts`: canonical redirects without intercepting real pages.
- Modify `tests/assembly-nav.test.ts`: route-table contract.
- Modify `tests/assembly-nav-component.test.tsx`: desktop route order and hrefs.
- Create `tests/program-page.test.tsx`: Program page content contract.
- Modify `tests/homepage-opening.test.tsx`: homepage links to permanent detail pages.
- Modify `tests/speakers-page.test.tsx`: stable section landmarks and interview anchor.
- Modify `tests/redirects.test.ts`: legacy-to-canonical redirect contract.

---

### Task 1: Make the navbar route-first

**Files:**
- Modify: `lib/assembly-nav.ts`
- Modify: `components/assembly/AsmNav.tsx`
- Modify: `tests/assembly-nav.test.ts`
- Modify: `tests/assembly-nav-component.test.tsx`

**Interfaces:**
- Produces: `ASSEMBLY_HOME_ROUTE`, `ASSEMBLY_SPEAKERS_ROUTE`, `ASSEMBLY_PROGRAM_ROUTE`, `ASSEMBLY_PAST_EVENTS_ROUTE`, and `ASSEMBLY_PRIMARY_NAV: AssemblyRoute[]`.
- Preserves: `ASSEMBLY_REGISTER`, `ASSEMBLY_REGISTER_LABEL`, `ASSEMBLY_ANCHORS`, `sectionHref`, and `isCurrentRoute` for legacy consumers.

- [ ] **Step 1: Verify the feature branch**

Run:

```bash
git branch --show-current
```

Expected: `codex/event-first-pages`. If it differs, stop rather than moving dirty changes between branches.

- [ ] **Step 2: Write the failing route-table test**

Replace the primary navigation expectations in `tests/assembly-nav.test.ts` with literal route values:

```ts
expect(ASSEMBLY_PRIMARY_NAV).toEqual([
  { label: "Home", href: "/" },
  { label: "Speakers & Interviews", href: "/speakers" },
  { label: "Program", href: "/program" },
  { label: "Past Events", href: "/past-events" },
]);
expect(ASSEMBLY_PRIMARY_NAV.every(({ href }) => !href.includes("#"))).toBe(true);
```

Update `tests/assembly-nav-component.test.tsx` to use a mutable pathname mock and require exact desktop labels and hrefs:

```ts
expect(labels).toEqual([
  "Cross Future",
  "Home",
  "Speakers & Interviews",
  "Program",
  "Past Events",
  "Register",
]);
expect(
  within(nav).getByRole("link", { name: "Home" }).getAttribute("href")
).toBe("/");
expect(
  within(nav).getByRole("link", { name: "Program" }).getAttribute("href")
).toBe("/program");
```

Add one test that sets `pathname = "/program"` and verifies only the Program
link receives `aria-current="page"`. Add one drawer test that opens
`asm-drawer`, verifies Home, Speakers & Interviews, Program, and Past Events in
the same order as desktop, then sends Escape and verifies the drawer closes.

- [ ] **Step 3: Run the navigation tests and verify RED**

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/assembly-nav.test.ts tests/assembly-nav-component.test.tsx
```

Expected: FAIL because Home is not an explicit text item, Program still points to a homepage section, and Past Events is outside the primary route table.

- [ ] **Step 4: Implement the canonical route table**

In `lib/assembly-nav.ts`, define and export the page routes:

```ts
export const ASSEMBLY_HOME_ROUTE: AssemblyRoute = {
  label: "Home",
  href: "/",
};

export const ASSEMBLY_SPEAKERS_ROUTE: AssemblyRoute = {
  label: "Speakers & Interviews",
  href: "/speakers",
};

export const ASSEMBLY_PROGRAM_ROUTE: AssemblyRoute = {
  label: "Program",
  href: "/program",
};

export const ASSEMBLY_PAST_EVENTS_ROUTE: AssemblyRoute = {
  label: "Past Events",
  href: "/past-events",
};

export const ASSEMBLY_PRIMARY_NAV: AssemblyRoute[] = [
  ASSEMBLY_HOME_ROUTE,
  ASSEMBLY_SPEAKERS_ROUTE,
  ASSEMBLY_PROGRAM_ROUTE,
  ASSEMBLY_PAST_EVENTS_ROUTE,
];

export const ASSEMBLY_SITE_ROUTES: AssemblyRoute[] = ASSEMBLY_PRIMARY_NAV;
```

Keep `ASSEMBLY_ANCHORS`, `ASSEMBLY_SECTIONS`, and `sectionHref` as compatibility
exports for already-published homepage anchors. The navbar must consume only
`ASSEMBLY_PRIMARY_NAV`; retaining section metadata must not reintroduce it into
the primary route model.

- [ ] **Step 5: Render route-only navigation**

In `components/assembly/AsmNav.tsx`:

1. Remove `ASSEMBLY_SECTIONS`, `sectionHref`, `useEffect`, and `active` imports/state.
2. Keep `usePathname` and mobile `open` state.
3. Map `ASSEMBLY_PRIMARY_NAV` directly in both desktop and drawer markup:

```tsx
{ASSEMBLY_PRIMARY_NAV.map((route) => (
  <Link
    key={route.href}
    href={route.href}
    aria-current={isCurrentRoute(route.href, pathname) ? "page" : undefined}
    onClick={drawer ? () => setOpen(false) : undefined}
  >
    {route.label}
  </Link>
))}
```

Do not introduce a `drawer` variable into shared JSX if it makes event handlers ambiguous; two small explicit maps are acceptable. Keep the logo link before the explicit Home link and keep Register after all internal routes.

- [ ] **Step 6: Run the navigation tests and verify GREEN**

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/assembly-nav.test.ts tests/assembly-nav-component.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add lib/assembly-nav.ts components/assembly/AsmNav.tsx tests/assembly-nav.test.ts tests/assembly-nav-component.test.tsx
git commit -m "feat: make primary navigation route-first"
```

---

### Task 2: Add the canonical Program page

**Files:**
- Create: `app/program/page.tsx`
- Create: `tests/program-page.test.tsx`

**Interfaces:**
- Consumes: `ASSEMBLY_PROGRAM_ROUTE.href === "/program"` from Task 1.
- Consumes: `getSummitContent("assembly")`, `getCurrentEdition`, `getAssembly`, `getConfirmedSessions`, and `getProposedSessions`.
- Produces: a static `/program` route with one `h1`, focus content, agenda state, and registration action.

- [ ] **Step 1: Write the failing Program page test**

Create `tests/program-page.test.tsx` with a runtime import so the missing route produces a controlled assertion failure:

```tsx
// @vitest-environment jsdom

import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

afterEach(cleanup);

it("publishes the current event program on its own route", async () => {
  const modulePath = "../app/program/page";
  let pageModule: { default: () => Promise<ReactNode> } | null = null;

  try {
    pageModule = await import(/* @vite-ignore */ modulePath);
  } catch {
    pageModule = null;
  }

  expect(pageModule).not.toBeNull();
  if (!pageModule) return;

  render(await pageModule.default());
  expect(
    screen.getByRole("heading", { level: 1, name: "Program" })
  ).toBeTruthy();
  expect(screen.getByText(/program updates coming soon/i)).toBeTruthy();
  expect(screen.getByRole("link", { name: /register|get updates/i })).toBeTruthy();
});
```

- [ ] **Step 2: Run the Program test and verify RED**

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/program-page.test.tsx
```

Expected: FAIL at `expect(pageModule).not.toBeNull()` because `/app/program/page.tsx` does not exist.

- [ ] **Step 3: Implement `/program` from existing content**

Create `app/program/page.tsx`:

```tsx
import type { Metadata } from "next";
import {
  getAssembly,
  getConfirmedSessions,
  getCurrentEdition,
  getProposedSessions,
  getSummitContent,
} from "@/lib/content";
import AsmAgenda from "@/components/assembly/AsmAgenda";
import AsmFocus from "@/components/assembly/AsmFocus";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmSection from "@/components/assembly/AsmSection";
import AsmShell from "@/components/assembly/AsmShell";

export const metadata: Metadata = {
  title: "Program",
  description: "Themes, sessions and schedule for the upcoming Cross Future AI event.",
  alternates: { canonical: "/program" },
};

export default async function ProgramPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);
  const confirmed = getConfirmedSessions(content, edition.slug);
  const proposed = getProposedSessions(content, edition.slug);

  return (
    <AsmShell>
      <AsmPageHero
        intro={{
          eyebrow: "Upcoming event",
          title: "Program",
          lede: "The research questions, industry challenges and conversations shaping the next Cross Future gathering.",
        }}
      />
      <AsmSection label="Program focus areas">
        <AsmFocus areas={assembly.focusAreas} hero={assembly.focusMedia} />
      </AsmSection>
      <AsmSection label="Event schedule">
        <AsmAgenda
          edition={edition}
          confirmed={confirmed}
          proposed={proposed}
          tracks={content.tracks}
          variant="status"
        />
      </AsmSection>
    </AsmShell>
  );
}
```

- [ ] **Step 4: Refactor the test to a static import and verify GREEN**

Replace the runtime import block with:

```tsx
import ProgramPage from "../app/program/page";

render(await ProgramPage());
```

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/program-page.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add app/program/page.tsx tests/program-page.test.tsx
git commit -m "feat: add expandable program page"
```

---

### Task 3: Connect Home and the combined archive to permanent pages

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/speakers/page.tsx`
- Modify: `tests/homepage-opening.test.tsx`
- Modify: `tests/speakers-page.test.tsx`

**Interfaces:**
- Consumes: `/speakers` and `/program` from Tasks 1–2.
- Produces: homepage detail links and stable `/speakers#speakers` and `/speakers#interviews` anchors.

- [ ] **Step 1: Write failing homepage and archive assertions**

In `tests/homepage-opening.test.tsx`, retain the existing speaker CTA assertion and add:

```ts
expect(
  screen.getByRole("link", { name: "View full program" }).getAttribute("href")
).toBe("/program");
```

In `tests/speakers-page.test.tsx`, assert stable section landmarks:

```ts
const speakerRegion = screen.getByRole("region", { name: "Previous Speakers" });
const interviewRegion = screen.getByRole("region", { name: "Recorded Interviews" });
expect(speakerRegion.getAttribute("id")).toBe("speakers");
expect(interviewRegion.getAttribute("id")).toBe("interviews");
```

- [ ] **Step 2: Run both tests and verify RED**

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/homepage-opening.test.tsx tests/speakers-page.test.tsx
```

Expected: FAIL because the Home Program block has no `/program` CTA and the archive sections have no stable IDs.

- [ ] **Step 3: Add the homepage Program action**

In `app/page.tsx`, update the Program section heading to own the detail action:

```tsx
<AsmSectionHead
  section="focus"
  title="Program"
  tone="plain"
  action={{ label: "View full program", href: "/program" }}
/>
```

Keep the existing concise `AsmAgenda` status block as the homepage preview. Do not duplicate the full `AsmFocus` collection on Home.

- [ ] **Step 4: Add stable archive section IDs**

In `app/speakers/page.tsx`:

```tsx
<AsmSection id="speakers" label="Previous Speakers">
  ...
</AsmSection>

<AsmSection id="interviews" label="Recorded Interviews">
  ...
</AsmSection>
```

- [ ] **Step 5: Run both tests and verify GREEN**

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/homepage-opening.test.tsx tests/speakers-page.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add app/page.tsx app/speakers/page.tsx tests/homepage-opening.test.tsx tests/speakers-page.test.tsx
git commit -m "feat: connect event previews to archive pages"
```

---

### Task 4: Migrate legacy URLs without intercepting canonical pages

**Files:**
- Modify: `next.config.ts`
- Modify: `tests/redirects.test.ts`

**Interfaces:**
- Consumes: canonical `/speakers` and `/program` routes.
- Produces: permanent legacy redirects while leaving `/`, `/speakers`, `/program`, and `/past-events` unredirected.

- [ ] **Step 1: Write the failing redirect contract**

Update `tests/redirects.test.ts` so the literal redirect list includes:

```ts
{ source: "/about", destination: "/#about", permanent: true },
{ source: "/agenda", destination: "/program", permanent: true },
{ source: "/interviews", destination: "/speakers#interviews", permanent: true },
{ source: "/archive", destination: "/speakers#interviews", permanent: true },
{ source: "/media", destination: "/speakers#interviews", permanent: true },
{ source: "/assembly/speakers", destination: "/speakers", permanent: true },
{ source: "/assembly/agenda", destination: "/program", permanent: true },
{ source: "/assembly/media", destination: "/speakers#interviews", permanent: true },
```

Add a canonical-route guard:

```ts
expect(
  legacyRedirects.some(({ source }) =>
    ["/", "/speakers", "/program", "/past-events"].includes(source)
  )
).toBe(false);
```

- [ ] **Step 2: Run the redirect tests and verify RED**

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/redirects.test.ts
```

Expected: FAIL because `/agenda`, `/interviews`, and Assembly legacy destinations do not yet match the canonical page map.

- [ ] **Step 3: Update `legacyRedirects`**

In `next.config.ts`, change only the relevant redirect destinations to match the literal contract. Do not add redirects whose `source` is `/speakers` or `/program`.

- [ ] **Step 4: Run redirect tests and verify GREEN**

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/redirects.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 4**

```bash
git add next.config.ts tests/redirects.test.ts
git commit -m "fix: route legacy event URLs to canonical pages"
```

---

### Task 5: Verify the complete event-first journey

**Files:**
- Modify only if a verification failure identifies a task-scoped defect.

**Interfaces:**
- Consumes: all route, navbar, page, and redirect work from Tasks 1–4.
- Produces: verified local event-first navigation on branch `codex/event-first-pages`.

- [ ] **Step 1: Run the full automated suite**

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run typecheck
git diff --check
```

Expected: zero failing tests, TypeScript exit 0, and no whitespace errors.

- [ ] **Step 2: Stop the exact localhost server before building**

Resolve the listener:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Stop only the explicit PID shown by that command. Do not use a broad process pattern.

- [ ] **Step 3: Run the production build**

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run build
```

Expected: build exit 0 with `/`, `/speakers`, `/program`, and `/past-events` in the route table.

- [ ] **Step 4: Restart localhost and verify canonical responses**

Start `npm run dev` in a retained terminal session, wait for `Ready`, then run:

```bash
curl -sS -o /dev/null -w 'home:%{http_code}\n' http://localhost:3000/
curl -sS -o /dev/null -w 'speakers:%{http_code}\n' http://localhost:3000/speakers
curl -sS -o /dev/null -w 'program:%{http_code}\n' http://localhost:3000/program
curl -sS -o /dev/null -w 'past:%{http_code}\n' http://localhost:3000/past-events
```

Expected: four `200` responses.

- [ ] **Step 5: Verify legacy redirects**

```bash
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3000/agenda
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3000/interviews
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3000/assembly/speakers
```

Expected: permanent redirects to `/program`, `/speakers#interviews`, and `/speakers` respectively.

- [ ] **Step 6: Review branch scope**

```bash
git branch --show-current
git status --short
git log --oneline --decorate -6
```

Expected: current branch `codex/event-first-pages`; no unrelated files newly modified by this plan; task commits visible above the design commit.
