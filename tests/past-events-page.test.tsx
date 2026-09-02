// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import PastEventsPage from "../app/past-events/page";

afterEach(cleanup);

it("shows every interview candidate in a vertically flowing archive", async () => {
  render(await PastEventsPage());

  const candidates = screen.getByRole("region", {
    name: "Interview candidates",
  });

  expect(
    within(candidates).getByRole("heading", {
      level: 2,
      name: "Interview candidates",
    })
  ).toBeTruthy();
  expect(
    candidates.querySelectorAll('a[href^="/interviews/"]')
  ).toHaveLength(18);
  expect(candidates.querySelector(".asm-row")).toBeTruthy();
  expect(candidates.querySelector(".asm-rail")).toBeNull();
});

it("matches each candidate to the portrait belonging to that person", async () => {
  render(await PastEventsPage());

  const candidates = screen.getByRole("region", {
    name: "Interview candidates",
  });
  const shyamGollakota = within(candidates).getByRole("link", {
    name: /Shyam Gollakota/i,
  });
  const portrait = within(shyamGollakota).getByRole("img", {
    name: "Portrait of Shyam Gollakota",
  });

  expect(portrait.getAttribute("src")).toBe(
    "/summit/portraits/shyam-gollakota.jpg"
  );
});

it("uses the candidate's own interview still when their portrait is a placeholder", async () => {
  render(await PastEventsPage());

  const candidates = screen.getByRole("region", {
    name: "Interview candidates",
  });
  const chrisSmith = within(candidates).getByRole("link", {
    name: /Chris Smith/i,
  });
  const still = within(chrisSmith).getByRole("img", {
    name:
      "Still from the recorded interview with Chris Smith at the Cross Future AI Summit",
  });

  expect(still.getAttribute("src")).toBe(
    "/summit/interviews/chris-smith.jpg"
  );
});

it("does not use an unverified interview still as a person's photo", async () => {
  render(await PastEventsPage());

  const candidates = screen.getByRole("region", {
    name: "Interview candidates",
  });
  const shaunVanWeelden = within(candidates).getByRole("link", {
    name: /Shaun VanWeelden/i,
  });
  const placeholder = within(shaunVanWeelden).getByRole("img", {
    name: "Portrait of Shaun VanWeelden",
  });

  expect(placeholder.getAttribute("src")).toBe(
    "/summit/portraits/shaun-vanweelden.svg"
  );
});

it("uses one portrait ratio without episode labels in the candidate gallery", async () => {
  render(await PastEventsPage());

  const candidates = screen.getByRole("region", {
    name: "Interview candidates",
  });
  const figures = Array.from(candidates.querySelectorAll("figure"));

  expect(figures).toHaveLength(18);
  expect(
    figures.every(
      (figure) => figure.style.getPropertyValue("--asm-aspect") === "4 / 5"
    )
  ).toBe(true);
  expect(candidates.querySelectorAll("figcaption")).toHaveLength(0);
  expect(candidates.textContent).not.toMatch(/IV\.\d{2}/);
});
