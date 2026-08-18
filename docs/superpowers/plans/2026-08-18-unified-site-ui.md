# Unified Site UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the Assembly concept to the canonical Cross Future website, convert it to a polished grayscale system, and integrate the best agenda, countdown, and technical-diagram behavior from the legacy concepts.

**Architecture:** The existing Assembly component family remains the active UI layer. Canonical App Router pages live at the root, legacy URLs redirect, and the root layout owns the Assembly shell, fonts, metadata, nav, and footer. Visual verification runs repeatedly against the local Next.js server at desktop and mobile sizes.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.7, plain CSS, Vitest, Codex in-app browser.

**Spec:** `docs/superpowers/specs/2026-08-18-cross-future-unified-site-design.md`

## Global Constraints

- The active UI is grayscale only; active components reference semantic tokens rather than literal colours.
- Barlow Semi Condensed is the display face, Barlow is the body face, and IBM Plex Mono is the metadata face.
- The 10px card gutter, rounded mosaic, full-width home, and sticky inner-page rail remain authoritative.
- `components/assembly` is the active component family; legacy components remain in the repository as reference-only code.
- Every animation honors `prefers-reduced-motion` and no content depends on animation.
- Canonical pages and active components do not import seed files, database modules, ORM schemas, or legacy page compositions.
- Do not push, publish, or deploy.

---

### Task 1: Establish UI contract tests and canonical navigation

**Files:**
- Modify: `package.json`
- Modify: `lib/assembly-nav.ts`
- Create: `tests/assembly-nav.test.ts`

**Interfaces:**
- Produces: `ASSEMBLY_BASE = ""`, canonical `ASSEMBLY_ROUTES`, `ASSEMBLY_REGISTER = "/register"`, and `isCurrentRoute(href, pathname): boolean`.

- [ ] **Step 1: Add the test runner and scripts**

Add `vitest` as a development dependency and these scripts:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Run: `npm install -D vitest`

- [ ] **Step 2: Write the failing canonical-route tests**

```ts
import { describe, expect, it } from "vitest";
import {
  ASSEMBLY_BASE,
  ASSEMBLY_REGISTER,
  ASSEMBLY_ROUTES,
  isCurrentRoute,
} from "@/lib/assembly-nav";

describe("canonical navigation", () => {
  it("uses root-level public routes", () => {
    expect(ASSEMBLY_BASE).toBe("");
    expect(ASSEMBLY_REGISTER).toBe("/register");
    expect(ASSEMBLY_ROUTES.map((route) => route.href)).toEqual([
      "/", "/about", "/speakers", "/agenda", "/media", "/partners", "/contact",
    ]);
  });

  it("matches home exactly and inner routes by longest prefix", () => {
    expect(isCurrentRoute("/", "/")).toBe(true);
    expect(isCurrentRoute("/", "/agenda")).toBe(false);
    expect(isCurrentRoute("/speakers", "/speakers/person")).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test and verify the old `/assembly` base fails**

Run: `npm test -- tests/assembly-nav.test.ts`
Expected: FAIL because `ASSEMBLY_BASE` is `/assembly`.

- [ ] **Step 4: Implement canonical route constants**

Use literal canonical hrefs and special-case `/` in `isCurrentRoute`:

```ts
export const ASSEMBLY_BASE = "";
export const ASSEMBLY_REGISTER = "/register";

export function isCurrentRoute(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
```

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- tests/assembly-nav.test.ts && npm run typecheck`
Expected: PASS.

```bash
git add package.json package-lock.json lib/assembly-nav.ts tests/assembly-nav.test.ts
git commit -m "test: define canonical site routes"
```

### Task 2: Promote Assembly pages and add legacy redirects

**Files:**
- Modify: `next.config.ts`
- Modify: `app/page.tsx`
- Create: `app/about/page.tsx`
- Create: `app/speakers/page.tsx`
- Create: `app/agenda/page.tsx`
- Create: `app/media/page.tsx`
- Create: `app/partners/page.tsx`
- Create: `app/register/page.tsx`
- Create: `app/contact/page.tsx`
- Create: `app/not-found.tsx`
- Create: `tests/redirects.test.ts`

**Interfaces:**
- Consumes: canonical constants from Task 1.
- Produces: canonical public pages and permanent redirects for `/assembly`, `/assembly/:path*`, and `/nexus`.

- [ ] **Step 1: Write the failing redirect contract**

Export a named `legacyRedirects` array from `next.config.ts` and test it:

```ts
import { expect, it } from "vitest";
import { legacyRedirects } from "@/next.config";

it("redirects legacy design URLs to canonical routes", () => {
  expect(legacyRedirects).toEqual(expect.arrayContaining([
    { source: "/assembly", destination: "/", permanent: true },
    { source: "/assembly/:path*", destination: "/:path*", permanent: true },
    { source: "/nexus", destination: "/", permanent: true },
  ]));
});
```

- [ ] **Step 2: Run the redirect test**

Run: `npm test -- tests/redirects.test.ts`
Expected: FAIL because `legacyRedirects` does not exist.

- [ ] **Step 3: Add redirects**

```ts
export const legacyRedirects = [
  { source: "/assembly", destination: "/", permanent: true },
  { source: "/assembly/:path*", destination: "/:path*", permanent: true },
  { source: "/nexus", destination: "/", permanent: true },
] as const;

const nextConfig: NextConfig = {
  async redirects() {
    return [...legacyRedirects];
  },
};
```

- [ ] **Step 4: Promote the page modules**

Replace `app/page.tsx` with the Assembly home implementation. Copy the seven Assembly inner-page implementations into their canonical App Router directories. Keep their `getSummitContent("assembly")` calls and update all links through the canonical constants from Task 1. Copy the Assembly in-design 404 into `app/not-found.tsx` and ensure its home link is `/`.

- [ ] **Step 5: Verify routes and commit**

Run: `npm test -- tests/redirects.test.ts && npm run typecheck && npm run build`
Expected: PASS with canonical pages in the build route list.

```bash
git add next.config.ts app/page.tsx app/about app/speakers app/agenda app/media app/partners app/register app/contact app/not-found.tsx tests/redirects.test.ts
git commit -m "feat: promote assembly to canonical routes"
```

### Task 3: Make the root layout the final Assembly shell

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `components/assembly/AsmFooter.tsx`

**Interfaces:**
- Consumes: Assembly content, `AsmNav`, `AsmFooter`, and Assembly font variables.
- Produces: one root wrapper `.assembly`, one skip link, one nav/footer, final metadata, and Event JSON-LD.

- [ ] **Step 1: Verify the pre-change root layout uses legacy fonts**

Run: `rg "Inter_Tight|column-rules|Design C" app/layout.tsx components/assembly/AsmFooter.tsx`
Expected: matches legacy root chrome and the variant colophon.

- [ ] **Step 2: Replace root chrome**

Use `Barlow_Semi_Condensed`, `Barlow`, and `IBM_Plex_Mono`; load `getSummitContent("assembly")`; wrap body content as:

```tsx
<body>
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />
  <div className={`assembly ${display.variable} ${body.variable} ${mono.variable}`}>
    <a className="asm-skip" href="#main">Skip to content</a>
    <AsmNav year={edition.year} />
    {children}
    <AsmFooter edition={edition} host={host} assembly={assembly} />
  </div>
</body>
```

Import `./assembly/assembly.css` from the root layout. Reduce `globals.css` to the global box-sizing/body reset required outside the scoped Assembly wrapper. Remove the duplicate public-design switcher from `AsmFooter` and replace it with a neutral colophon.

- [ ] **Step 3: Verify one shell and commit**

Run: `npm run typecheck && npm run build`
Expected: PASS with one root layout and no public “Design A/B/C” copy.

```bash
git add app/layout.tsx app/globals.css components/assembly/AsmFooter.tsx
git commit -m "feat: make assembly the root site shell"
```

### Task 4: Convert the active design system to grayscale

**Files:**
- Modify: `app/assembly/assembly.css`
- Create: `tests/grayscale-css.test.ts`

**Interfaces:**
- Produces: grayscale Tier 1 primitives and semantic role tokens used by every active Assembly component.

- [ ] **Step 1: Write the failing active-colour audit**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("app/assembly/assembly.css", "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "");

describe("active Assembly CSS", () => {
  it("contains only grayscale hex literals", () => {
    const colors = [...css.matchAll(/#[0-9a-f]{6}\b/gi)].map(([value]) => value);
    const nonGray = colors.filter((value) => {
      const [r, g, b] = [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)];
      return r !== g || g !== b;
    });
    expect(nonGray).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the audit**

Run: `npm test -- tests/grayscale-css.test.ts`
Expected: FAIL on the petrol, sky, and blue primitives.

- [ ] **Step 3: Remap Tier 1**

Use a neutral value ramp and keep Tier 2 names unchanged:

```css
--asm-n-000: #ffffff;
--asm-n-025: #fafafa;
--asm-n-050: #f4f4f4;
--asm-n-100: #e8e8e8;
--asm-n-150: #dddddd;
--asm-n-200: #cecece;
--asm-n-300: #b6b6b6;
--asm-n-400: #969696;
--asm-n-500: #767676;
--asm-n-600: #5d5d5d;
--asm-n-700: #414141;
--asm-n-800: #262626;
--asm-n-900: #111111;
--asm-c-sky: #d7d7d7;
--asm-c-blue: #1d1d1d;
```

Update comments to describe grayscale roles and preserve contrast-conscious semantic assignments.

- [ ] **Step 4: Run the audit and commit**

Run: `npm test -- tests/grayscale-css.test.ts && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add app/assembly/assembly.css tests/grayscale-css.test.ts
git commit -m "feat: establish grayscale site tokens"
```

### Task 5: Add the unified footer countdown

**Files:**
- Create: `lib/countdown.ts`
- Create: `components/assembly/AsmCountdown.tsx`
- Modify: `components/assembly/AsmFooter.tsx`
- Modify: `app/assembly/assembly.css`
- Create: `tests/countdown.test.ts`

**Interfaces:**
- Produces: `partsUntil(targetMs: number, nowMs?: number): CountdownParts` and `<AsmCountdown targetIso: string>`.

- [ ] **Step 1: Write failing countdown tests**

```ts
import { expect, it } from "vitest";
import { partsUntil } from "@/lib/countdown";

it("returns bounded countdown parts", () => {
  expect(partsUntil(90_061_000, 0)).toEqual({ d: 1, h: 1, m: 1, s: 1 });
});

it("never becomes negative", () => {
  expect(partsUntil(0, 1)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
});
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- tests/countdown.test.ts`
Expected: FAIL because `lib/countdown.ts` does not exist.

- [ ] **Step 3: Implement the pure helper and client component**

Implement the tested arithmetic in `lib/countdown.ts`. `AsmCountdown` renders labeled day/hour/minute/second cells, initializes from the helper after mount, updates once per second, and clears its interval on unmount. It renders a stable zeroed server state without hydration mismatch.

- [ ] **Step 4: Integrate and style**

Place the countdown in the first footer column below the event details. Use existing card/type tokens, tabular numbers, a four-column desktop grid, and two columns on narrow screens. Under reduced motion, the numbers may update but must not animate.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/countdown.test.ts && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add lib/countdown.ts components/assembly/AsmCountdown.tsx components/assembly/AsmFooter.tsx app/assembly/assembly.css tests/countdown.test.ts
git commit -m "feat: add event countdown to footer"
```

### Task 6: Adapt the expandable agenda into Assembly

**Files:**
- Create: `components/assembly/AsmAgendaStrip.tsx`
- Modify: `components/assembly/AsmAgenda.tsx`
- Modify: `app/assembly/assembly.css`

**Interfaces:**
- Consumes: `Edition`, `Session[]`, `Track[]`.
- Produces: `<AsmAgendaStrip edition sessions tracks provisional>` with scroll controls and one expanded session at a time.

- [ ] **Step 1: Preserve data-driven agenda states**

Keep `AsmAgenda` responsible for published/provisional selection and the existing truthful header. Pass the selected rows to the new client strip:

```tsx
<AsmAgendaStrip
  edition={edition}
  sessions={rows}
  tracks={tracks}
  provisional={!published}
/>
```

- [ ] **Step 2: Implement the interactive strip**

Use a horizontal `<ul>` with scroll snapping. Previous/next buttons call `scrollBy` using the first card width. Each card exposes `aria-expanded`; opening a card reveals description, outcomes, duration, room, and speaker while closing the previously open card.

- [ ] **Step 3: Style in the Assembly vocabulary**

Use `.asm-card`, semantic borders, mono metadata, and a minimum card width near 320px. Avoid Nexus class names and colour literals. On mobile, preserve horizontal browsing rather than shrinking cards below readable width.

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run build`
Expected: PASS for proposed and confirmed data.

```bash
git add components/assembly/AsmAgenda.tsx components/assembly/AsmAgendaStrip.tsx app/assembly/assembly.css
git commit -m "feat: add expandable agenda strip"
```

### Task 7: Add the grayscale infrastructure card to About

**Files:**
- Create: `components/assembly/AsmInfrastructure.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/assembly/assembly.css`
- Create: `tests/infrastructure.test.ts`

**Interfaces:**
- Produces: exported `STAGE_TO_NODE: Record<ChainStage, string>` and `<AsmInfrastructure tracks: Track[]>`.

- [ ] **Step 1: Write the failing mapping test**

```ts
import { expect, it } from "vitest";
import { STAGE_TO_NODE } from "@/components/assembly/AsmInfrastructure";

it("maps every curriculum stage to the utility chain", () => {
  expect(STAGE_TO_NODE).toEqual({
    "grid-interface": "substation",
    network: "switchgear",
    facility: "ups",
    scale: "rack",
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- tests/infrastructure.test.ts`
Expected: FAIL because the active component does not exist.

- [ ] **Step 3: Implement the card**

Adapt the existing `FigureOne` SVG geometry into a rounded Assembly card. Replace legacy CSS variables with Assembly semantic variables, add a visible caption, derive track pins from `tracks`, and retain the complete accessible diagram description.

- [ ] **Step 4: Place it on About**

Render the card after the “What the day is about” section heading and before `AsmFocus`, so the diagram introduces the four track cards it controls.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/infrastructure.test.ts && npm run typecheck && npm run build`
Expected: PASS.

```bash
git add components/assembly/AsmInfrastructure.tsx app/about/page.tsx app/assembly/assembly.css tests/infrastructure.test.ts
git commit -m "feat: add summit infrastructure diagram"
```

### Task 8: Run the visual correction loop and finalize UI documentation

**Files:**
- Modify: `app/assembly/assembly.css`
- Modify: `components/assembly/AsmHero.tsx`
- Modify: `components/assembly/AsmShell.tsx`
- Modify: `components/assembly/AsmNav.tsx`
- Modify: `components/assembly/AsmAgendaStrip.tsx`
- Modify: `components/assembly/AsmInfrastructure.tsx`
- Modify: `components/assembly/AsmFooter.tsx`
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/agenda/page.tsx`
- Modify: `README.md`
- Modify: `COMPONENTS.md`

**Interfaces:**
- Produces: visually verified canonical routes and documentation describing one public site.

- [ ] **Step 1: Start the local site**

Run: `npm run dev`
Expected: Next.js reports a local URL and stays running.

- [ ] **Step 2: Inspect desktop routes**

Using the in-app browser at approximately 1440×1000, inspect `/`, `/about`, `/agenda`, `/speakers`, `/register`, and `/contact`. Capture screenshots of `/`, `/about`, and `/agenda`. Compare the root composition with the supplied IT/CONF reference: dominant type card, stacked media side cards, consistent gutters, decisive section cards, and no residual brand colour.

- [ ] **Step 3: Correct desktop defects**

Fix overflow, weak hierarchy, inconsistent card radii/gutters, duplicate chrome, incorrect sticky offsets, unreadable contrast, and borrowed components that do not look native to Assembly. Re-run `npm run typecheck` after each correction set.

- [ ] **Step 4: Inspect and correct mobile routes**

At approximately 390×844, inspect the same routes. Confirm a single-column reading order, usable drawer, readable display wrapping, no clipped cards, scrollable agenda, non-sticky rail cards, and comfortable form controls. Correct defects and repeat until stable.

- [ ] **Step 5: Verify redirects and accessibility states**

Open `/assembly`, `/assembly/agenda`, and `/nexus` and confirm their canonical destinations. Keyboard through nav, agenda controls, forms, and footer. Emulate reduced motion and confirm all content remains visible.

- [ ] **Step 6: Update docs**

Rewrite README and component references so `/` is the only public design, legacy families are reference-only, active routes are canonical, and the first-pass palette is intentionally grayscale.

- [ ] **Step 7: Run the full UI gate and commit**

Run: `npm test && npm run typecheck && npm run build`
Expected: all tests and the production build pass.

```bash
git add app components lib tests README.md COMPONENTS.md next.config.ts package.json package-lock.json
git commit -m "feat: finish unified grayscale site UI"
```
