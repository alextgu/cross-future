// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AssemblyHome from "../app/page";

afterEach(cleanup);

it("moves directly from the event hero into a two-row speaker gallery", async () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
  vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(
    () => undefined
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  );

  render(await AssemblyHome());

  const sections = document.querySelectorAll("main#main > section");
  expect(sections[1]?.id).toBe("faculty");
  expect(screen.queryByRole("region", { name: "Summit at a glance" })).toBeNull();

  const speakerSection = sections[1] as HTMLElement;
  expect(
    within(speakerSection).getByRole("heading", {
      name: "Previous Speakers",
    })
  ).toBeTruthy();
  expect(
    within(speakerSection).getByText(
      "Where AI ideas meet the people who move them forward."
    )
  ).toBeTruthy();

  const gallery = within(speakerSection).getByRole("group", {
    name: /previous speakers.*scroll horizontally/i,
  });
  expect(gallery.getAttribute("data-rows")).toBe("2");
  expect(within(gallery).getAllByRole("article")).toHaveLength(32);
  expect(
    within(speakerSection).getByRole("button", {
      name: "Previous speakers",
    })
  ).toBeTruthy();
  expect(
    within(speakerSection).getByRole("button", {
      name: "Next speakers",
    })
  ).toBeTruthy();
  expect(
    within(speakerSection)
      .getByRole("link", { name: "View all speakers & interviews" })
      .getAttribute("href")
  ).toBe("/speakers");

  expect(
    within(speakerSection).getByRole("heading", {
      level: 2,
      name: "Recorded interviews",
    })
  ).toBeTruthy();
  const interviewLinks = Array.from(
    speakerSection.querySelectorAll<HTMLAnchorElement>(
      'a[href^="/interviews/"]'
    )
  );
  expect(interviewLinks).toHaveLength(3);

  const archiveCta = within(speakerSection).getByRole("link", {
    name: "View all speakers & interviews",
  });
  expect(
    interviewLinks[2].compareDocumentPosition(archiveCta) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(document.querySelector("main#main > section#interviews")).toBeNull();
  expect(
    screen.getByRole("link", { name: "View full program" }).getAttribute("href")
  ).toBe("/program");
});
