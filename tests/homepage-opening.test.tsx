// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AssemblyHome from "../app/page";

afterEach(cleanup);

it("moves from the event hero through About into speakers and interviews", async () => {
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

  const mainChildren = Array.from(
    document.querySelectorAll<HTMLElement>("main#main > *")
  );
  expect(mainChildren.slice(0, 4).map((child) => [child.tagName, child.id])).toEqual([
    ["SECTION", ""],
    ["ASIDE", ""],
    ["SECTION", "about"],
    ["SECTION", "faculty"],
  ]);
  expect(
    screen.getByRole("complementary", { name: "Cross Future at a glance" })
  ).toBeTruthy();

  const speakerSection = mainChildren[3] as HTMLElement;
  expect(
    within(speakerSection).getByRole("heading", {
      name: "Previous Speakers",
    })
  ).toBeTruthy();
  expect(
    within(speakerSection).queryByText(
      "Where AI ideas meet the people who move them forward."
    )
  ).toBeNull();
  expect(
    screen.queryByText(
      "Our first two editions received formal recognition from the Province of Ontario and the City of Toronto."
    )
  ).toBeNull();

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
      name: "Interviews",
    })
  ).toBeTruthy();
  expect(within(speakerSection).queryByText("From the archive")).toBeNull();
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
    screen.queryByRole("region", { name: "Festival progress" })
  ).toBeNull();
  expect(
    screen.getByRole("link", { name: "View full program" }).getAttribute("href")
  ).toBe("/program");
});
