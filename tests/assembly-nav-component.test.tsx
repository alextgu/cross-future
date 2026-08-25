// @vitest-environment jsdom

import {
  act,
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.querySelector(".asm-future-hero")?.remove();
  pathname = "/";
});

function useFinePointer() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      media: "(hover: hover) and (pointer: fine)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
  );
}

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

it("hides away from the hero after inactivity and reveals on pointer movement", () => {
  vi.useFakeTimers();
  useFinePointer();
  pathname = "/program";

  render(<AsmNav year={2026} />);
  const navbar = screen.getByRole("navigation", { name: "Primary" }).parentElement;

  expect(navbar).not.toBeNull();
  if (!navbar) return;

  expect(navbar.classList.contains("is-hidden")).toBe(false);
  act(() => vi.advanceTimersByTime(1500));
  expect(navbar.classList.contains("is-hidden")).toBe(true);

  fireEvent.pointerMove(window);
  expect(navbar.classList.contains("is-hidden")).toBe(false);
  act(() => vi.advanceTimersByTime(1499));
  expect(navbar.classList.contains("is-hidden")).toBe(false);
  act(() => vi.advanceTimersByTime(1));
  expect(navbar.classList.contains("is-hidden")).toBe(true);
});

it("stays visible over the hero and hides once the hero has scrolled away", () => {
  vi.useFakeTimers();
  useFinePointer();

  const hero = document.createElement("section");
  hero.className = "asm-future-hero";
  document.body.append(hero);
  vi.spyOn(hero, "getBoundingClientRect").mockReturnValue({
    bottom: 800,
    height: 800,
    left: 0,
    right: 1200,
    top: 0,
    width: 1200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  render(<AsmNav year={2026} />);
  const navbar = screen.getByRole("navigation", { name: "Primary" }).parentElement;

  expect(navbar).not.toBeNull();
  if (!navbar) return;

  act(() => vi.advanceTimersByTime(3000));
  expect(navbar.classList.contains("is-hidden")).toBe(false);

  vi.mocked(hero.getBoundingClientRect).mockReturnValue({
    bottom: -1,
    height: 800,
    left: 0,
    right: 1200,
    top: -801,
    width: 1200,
    x: 0,
    y: -801,
    toJSON: () => ({}),
  });
  fireEvent.scroll(window);
  expect(navbar.classList.contains("is-hidden")).toBe(true);
});

it("keeps the navbar visible on touch-oriented devices", () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches: false })
  );
  pathname = "/program";

  render(<AsmNav year={2026} />);
  const navbar = screen.getByRole("navigation", { name: "Primary" }).parentElement;

  expect(navbar).not.toBeNull();
  if (!navbar) return;

  act(() => vi.advanceTimersByTime(3000));
  expect(navbar.classList.contains("is-hidden")).toBe(false);
});
