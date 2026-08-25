// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import AsmAboutIntro from "../components/assembly/AsmAboutIntro";

afterEach(cleanup);

it("introduces the event through people and ideas instead of a technical brief", () => {
  render(<AsmAboutIntro />);

  expect(
    screen.getByRole("heading", {
      name: "About Cross Future",
    })
  ).toBeTruthy();

  const audience = screen.getByRole("region", { name: "Who meets here" });
  const groups = within(audience).getAllByRole("listitem");
  expect(groups.map((group) => group.textContent)).toEqual([
    "ProfessorsNew research, explained by the people behind it.",
    "ResearchersOpen questions, methods and discoveries worth sharing.",
    "Industry buildersReal applications, lessons and paths to impact.",
  ]);
});
