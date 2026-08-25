// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AsmNav from "../components/assembly/AsmNav";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

afterEach(() => {
  cleanup();
  pathname = "/";
});

it("renders the canonical page routes in the desktop navigation", () => {
  render(<AsmNav year={2026} />);

  const nav = screen.getByRole("navigation", { name: "Primary" });
  const labels = within(nav)
    .getAllByRole("link")
    .map((link) => link.textContent?.replace(/\s+/g, " ").trim());

  expect(labels).toEqual([
    "Cross Future Hub",
    "Home",
    "Speakers & Interviews",
    "Program",
    "Past Events",
    "Register",
  ]);
  expect(
    within(nav)
      .getByRole("link", { name: "Speakers & Interviews" })
      .getAttribute("href")
  ).toBe("/speakers");
  expect(
    within(nav).getByRole("link", { name: "Home" }).getAttribute("href")
  ).toBe("/");
  expect(
    within(nav).getByRole("link", { name: "Program" }).getAttribute("href")
  ).toBe("/program");
  expect(nav.textContent).not.toMatch(/\b0[1-9]\b/);
});

it("marks the current route rather than a home-page section", () => {
  pathname = "/program";
  render(<AsmNav year={2026} />);

  const nav = screen.getByRole("navigation", { name: "Primary" });
  expect(
    within(nav).getByRole("link", { name: "Program" }).getAttribute("aria-current")
  ).toBe("page");
  expect(
    within(nav).getByRole("link", { name: "Home" }).getAttribute("aria-current")
  ).toBeNull();
});

it("mirrors the desktop routes in the mobile drawer and closes on Escape", () => {
  render(<AsmNav year={2026} />);
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

  const drawer = document.getElementById("asm-drawer");
  expect(drawer).not.toBeNull();
  if (!drawer) return;

  expect(
    within(drawer)
      .getAllByRole("link")
      .map((link) => link.textContent?.replace(/\s+/g, " ").trim())
  ).toEqual([
    "Home",
    "Speakers & Interviews",
    "Program",
    "Past Events",
    "↗Register",
  ]);

  fireEvent.keyDown(window, { key: "Escape" });
  expect(drawer.hidden).toBe(true);
});
