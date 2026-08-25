# White About and Stats Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bridge the dark homepage hero into a light editorial body with placeholder event metrics and a photo-led Cross Future About section.

**Architecture:** Add one small, data-driven stats presentation component between the hero and About regions. Refactor the existing About component in place and scope all new visual behavior to the Assembly stylesheet so routes, navigation, and content APIs remain unchanged.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-25-white-about-stats-bridge-design.md`

## Global Constraints

- Work only in `/Users/agu/Desktop/cross-future` on `codex/event-first-pages`.
- Keep the values visibly temporary: `XX Events`, `XX Speakers`, `YY Interviews`, `YY Partners`.
- Reuse existing repository photography; add no packages or assets.
- Keep About source order as copy before imagery and preserve `#about` and `#faculty` anchors.
- Do not redesign the hero, speaker cards, interviews, Program, or footer.

---

### Task 1: Add the stats bridge and prove its homepage position

**Files:**
- Create: `components/assembly/AsmStatsBridge.tsx`
- Create: `tests/stats-bridge.test.tsx`
- Modify: `tests/homepage-opening.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing component and ordering tests**

Add a component test that renders four items and asserts accessible list semantics and the exact placeholder pairs. Extend the homepage test so the direct children of `main#main` begin in this order: hero section, stats bridge, About section, speakers section.

```tsx
const items = [
  { value: "XX", label: "Events" },
  { value: "XX", label: "Speakers" },
  { value: "YY", label: "Interviews" },
  { value: "YY", label: "Partners" },
] as const;

render(<AsmStatsBridge items={items} />);
expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
  "XXEvents",
  "XXSpeakers",
  "YYInterviews",
  "YYPartners",
]);
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run:

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/stats-bridge.test.tsx tests/homepage-opening.test.tsx
```

Expected: failure because `AsmStatsBridge` does not exist and the homepage has no bridge.

- [ ] **Step 3: Implement the smallest accessible component**

Use a typed item interface and keep the component purely presentational:

```tsx
export type AsmStatsBridgeItem = {
  value: string;
  label: string;
};

export default function AsmStatsBridge({
  items,
}: {
  items: readonly AsmStatsBridgeItem[];
}) {
  return (
    <aside className="asm-stats-bridge" aria-label="Cross Future at a glance">
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

Define the approved placeholder array in `app/page.tsx` and render the component immediately after the hero `AsmSection`.

- [ ] **Step 4: Run the focused tests and confirm GREEN**

Run the command from Step 2. Expected: both files pass.

- [ ] **Step 5: Commit the functional slice**

```bash
git add components/assembly/AsmStatsBridge.tsx tests/stats-bridge.test.tsx tests/homepage-opening.test.tsx app/page.tsx
git commit -m "feat: add homepage stats bridge"
```

---

### Task 2: Rebuild About as the start of the white editorial body

**Files:**
- Modify: `tests/about-intro.test.tsx`
- Modify: `components/assembly/AsmAboutIntro.tsx`
- Modify: `app/assembly/future-forum.css`

- [ ] **Step 1: Replace the old About assertions with the approved contract**

Assert the new headline, one concise explanatory paragraph, exactly three useful images, and absence of the old audience mini-cards.

```tsx
expect(
  screen.getByRole("heading", { name: "Where AI ideas become shared momentum." })
).toBeTruthy();
expect(screen.getAllByRole("img")).toHaveLength(3);
expect(screen.queryByText("Professors", { selector: "strong" })).toBeNull();
expect(screen.queryByText("Researchers", { selector: "strong" })).toBeNull();
expect(screen.queryByText("Industry builders", { selector: "strong" })).toBeNull();
```

- [ ] **Step 2: Run the About test and confirm RED**

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/about-intro.test.tsx
```

Expected: failure against the old heading, one-image figure, and audience cards.

- [ ] **Step 3: Refactor the existing About component in place**

Keep copy before images in the DOM. Use one dominant event image and two supporting event images from existing `/public/summit/` assets. The component structure should remain compact:

```tsx
<div className="asm-about-intro">
  <div className="asm-about-copy">
    <p className="asm-about-kicker">Cross Future / AI Forum</p>
    <h2 className="asm-about-title">
      Where <span>AI ideas</span> become shared momentum.
    </h2>
    <p className="asm-about-lead">
      Cross Future connects professors, researchers and industry builders
      through recurring events built for useful exchange and lasting collaboration.
    </p>
  </div>
  <div className="asm-about-collage" aria-label="Cross Future event moments">
    {/* three figures with meaningful alt text and small technical labels */}
  </div>
</div>
```

- [ ] **Step 4: Style the complete dark-to-light transition**

In `future-forum.css`:

- Give `.asm-stats-bridge` a deep electric-blue rectangular surface, four equal columns, thin internal dividers, large white values, and uppercase labels.
- Pull the bridge across the hero/About seam with negative block margin and a higher stacking context, without giving it a floating-card shadow or oversized rounding.
- Make `#about` establish a full-viewport-width white/near-white background using a scoped pseudo-element behind its centered content.
- Remove the old rounded dark About container and mini-card rules.
- Lay out About as large blue copy plus an asymmetric three-image collage with restrained `4px`–`8px` radii, thin rules, and subtle grid detailing.
- Continue the light canvas into `#faculty` without a fade.
- At mobile breakpoints, use a two-by-two stats grid and stack the About copy before a compact collage with no horizontal overflow.

- [ ] **Step 5: Run focused tests and type checking**

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test -- tests/about-intro.test.tsx tests/stats-bridge.test.tsx tests/homepage-opening.test.tsx
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run typecheck
```

Expected: all focused tests pass and TypeScript reports no errors.

- [ ] **Step 6: Commit the visual slice**

```bash
git add components/assembly/AsmAboutIntro.tsx app/assembly/future-forum.css tests/about-intro.test.tsx
git commit -m "feat: create light editorial about section"
```

---

### Task 3: Verify the finished homepage and restore localhost

**Files:**
- Verify only

- [ ] **Step 1: Run the full automated gates**

```bash
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run typecheck
git diff --check
```

Expected: all tests pass, TypeScript reports no errors, and the diff has no whitespace errors.

- [ ] **Step 2: Build without competing with the dev server**

Resolve the exact process listening on port 3000, stop only that PID, run the production build, and restart the dev server on port 3000. Do not use broad process-kill commands.

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run build
PATH=/Users/agu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run dev
```

- [ ] **Step 3: Confirm the local site responds**

```bash
curl -I http://localhost:3000/
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 4: Review scope and branch state**

```bash
git status --short
git log --oneline -5
```

Confirm only the approved stats/About change was introduced and the work remains on `codex/event-first-pages`.
