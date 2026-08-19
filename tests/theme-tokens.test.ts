import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_DEFAULT, THEME_SCHEMES, isThemeId } from "../lib/themes";

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const activeCss = strip(readFileSync("app/assembly/assembly.css", "utf8"));
const themeCss = strip(readFileSync("app/assembly/themes.css", "utf8"));

/* The switcher's own chrome is deliberately outside the design system — it is
   a review tool, not a surface — so the token rules stop where it starts. */
const schemeCss = themeCss.slice(0, themeCss.indexOf(".asm-lab"));

const RAMP = [
  "000",
  "025",
  "050",
  "100",
  "150",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
].map((step) => `--asm-n-${step}`);

function declarationsWithLiterals(css: string): string[] {
  return [...css.matchAll(/([^;{}]+):\s*([^;{}]*#[0-9a-f]{3,8}[^;{}]*)/gi)].map(
    ([, property]) => property.trim(),
  );
}

describe("the design system's colour discipline", () => {
  it("keeps every literal colour inside a Tier-1 token", () => {
    /* This is the rule the whole retheme rests on: if a component or a tone
       rule ever hardcodes a colour, swapping schemes stops being mechanical
       and starts being a hunt. */
    /* Mask gradients are exempt: only their alpha is read, so the colour in
       a mask stop is a stand-in for "opaque" and carries no theme meaning. */
    const offenders = declarationsWithLiterals(activeCss).filter(
      (property) =>
        !property.startsWith("--asm-") && !property.endsWith("mask-image"),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps every scheme override inside a Tier-1 token too", () => {
    const offenders = declarationsWithLiterals(schemeCss).filter(
      (property) => !property.startsWith("--asm-") && property !== "background",
    );

    /* `background` is allowed: <body> sits outside .assembly, so the page
       ground has to be stated per scheme rather than derived from a token. */
    expect(offenders).toEqual([]);
  });

  it("gives every scheme the complete ramp", () => {
    for (const scheme of THEME_SCHEMES) {
      if (scheme.id === THEME_DEFAULT) continue; /* the base block */
      const block = schemeCss.match(
        new RegExp(`\\[data-theme="${scheme.id}"\\] \\.assembly \\{([^}]*)\\}`),
      )?.[1];

      expect(block, `${scheme.id} has a token block`).toBeDefined();
      for (const token of [...RAMP, "--asm-c-sky", "--asm-c-blue"]) {
        expect(block, `${scheme.id} declares ${token}`).toContain(`${token}:`);
      }
    }
  });

  it("keeps the default scheme defined in the base block, not an override", () => {
    expect(isThemeId(THEME_DEFAULT)).toBe(true);
    expect(schemeCss).not.toContain(`[data-theme="${THEME_DEFAULT}"]`);
    expect(activeCss).toMatch(/--asm-c-blue:\s*#215f9a/i);
  });

  it("keeps the motion budget at two moments", () => {
    /* Motion is spent where it carries meaning — the marquee ticker and the
       countdown's own tick — and nowhere else. Scroll-reveal on every card
       was removed: it gated static content behind an observer per card and
       animated nothing. This test is what stops it coming back. */
    const keyframes = [...activeCss.matchAll(/@keyframes\s+([\w-]+)/g)].map(
      ([, name]) => name,
    );
    expect(keyframes).toEqual(["asm-marquee"]);

    /* One component may watch the scroll position, and only this one: the
       nav, to say which section you are in. Anything else reaching for an
       observer is the reveal-on-scroll pattern coming back. */
    const observing = readdirSync("components/assembly")
      .filter((file) => file.endsWith(".tsx"))
      .filter((file) =>
        readFileSync(`components/assembly/${file}`, "utf8").includes(
          "IntersectionObserver",
        ),
      );
    expect(observing).toEqual(["AsmNav.tsx"]);
  });
});
