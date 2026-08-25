// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AsmHero from "../components/assembly/AsmHero";
import {
  getAssembly,
  getCurrentEdition,
  getSummitContent,
} from "../lib/content";

afterEach(cleanup);

it("keeps the event identity readable over one uninterrupted video canvas", async () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
  vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(
    () => undefined
  );
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);

  render(<AsmHero edition={edition} assembly={assembly} />);

  expect(screen.getByRole("banner").getAttribute("data-tone")).toBe("neutral");

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Cross Future",
    })
  ).toBeTruthy();
  const tagline = screen.getByRole("heading", {
    level: 2,
    name: "Shaping the future of AI, innovating for tomorrow.",
  });
  expect(tagline).toBeTruthy();
  expect(within(tagline).getByText("AI").tagName).toBe("MARK");
  expect(within(tagline).getByText("tomorrow").tagName).toBe("U");
  expect(screen.queryByText("2026")).toBeNull();
  expect(
    screen.getByRole("link", { name: "Register Now" }).getAttribute("href")
  ).toBe("https://www.eventgo.ai/event/1000909471805");
  expect(screen.getAllByRole("link")).toHaveLength(1);

  const registration = screen.getByRole("group", {
    name: "Event registration",
  });
  expect(registration.getAttribute("data-cta-size")).toBe("slim");
  expect(registration.getAttribute("data-layout")).toBe("headline");
  expect(within(registration).getByText("Montréal, Canada")).toBeTruthy();
  expect(
    within(registration).getByText("October 8, 2026 · 9 AM–5 PM")
  ).toBeTruthy();
  expect(
    within(registration).getByRole("link", { name: "Register Now" })
  ).toBeTruthy();

  const video = screen.getByLabelText(
    "The summit auditorium during a plenary, the Cross Future banner on the stage screen"
  );
  expect(video.closest("figure")?.classList.contains("is-duo")).toBe(false);
  expect(video.closest("figure")?.classList.contains("is-scrim")).toBe(false);
});
