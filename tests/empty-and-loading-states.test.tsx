// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { afterEach, expect, it } from "vitest";
import AsmFacultyGrid from "../components/assembly/AsmFacultyGrid";
import AsmInterviews from "../components/assembly/AsmInterviews";
import AsmGallery from "../components/assembly/AsmGallery";
import AsmPartners from "../components/assembly/AsmPartners";
import AsmCountdown from "../components/assembly/AsmCountdown";

afterEach(cleanup);

/* Every collection on this site is genuinely incomplete right now, so the
   empty branch is the state most visitors will meet first — not an edge
   case. Each one has to say which thing is missing. */

it("says what is missing when the roster is empty", () => {
  render(<AsmFacultyGrid members={[]} />);
  expect(screen.getByText(/Roster in progress/i)).toBeTruthy();
  expect(screen.getByText(/as each one confirms/i)).toBeTruthy();
});

it("says what is missing when there are no interviews", () => {
  render(<AsmInterviews cards={[]} />);
  expect(screen.getByText(/No interviews yet/i)).toBeTruthy();
});

it("says what is missing when the gallery is empty", () => {
  render(<AsmGallery items={[]} />);
  expect(screen.getByText(/Photographs pending/i)).toBeTruthy();
});

it("says what is missing when no partner group has members", () => {
  render(
    <AsmPartners
      groups={[
        { type: "academic", partners: [] },
        { type: "industry", partners: [] },
      ]}
    />
  );
  expect(screen.getByText(/Partners being confirmed/i)).toBeTruthy();
});

/* The countdown is the one genuinely client-computed value on the site: it
   depends on the reader's clock, so the server cannot render it. */

const target = () =>
  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60_000).toISOString();

it("paints a skeleton, not a false zero, before the clock is read", () => {
  /* The server pass is the first paint. One bar per unit, four tiles exactly
     as in the loaded state, and no digits at all — "00 days" would claim the
     summit is starting right now. */
  const markup = renderToStaticMarkup(<AsmCountdown targetIso={target()} />);

  expect(markup.match(/asm-skel-num/g)?.length).toBe(4);
  expect(markup.match(/asm-countdown-part/g)?.length).toBe(4);
  expect(markup).toContain('aria-busy="true"');
  expect(markup.replace(/<[^>]*>/g, "")).not.toMatch(/\d/);
});

it("replaces every skeleton with a figure once mounted", () => {
  const { container } = render(<AsmCountdown targetIso={target()} />);

  expect(container.querySelectorAll(".asm-skel-num").length).toBe(0);
  expect(container.querySelectorAll(".asm-countdown-part").length).toBe(4);
  expect(container.querySelector(".asm-countdown")?.getAttribute("aria-busy")).toBe(
    "false"
  );
  expect(container.textContent).toMatch(/03/);
});
