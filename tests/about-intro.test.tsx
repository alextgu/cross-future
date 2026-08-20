// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import AsmAboutIntro from "../components/assembly/AsmAboutIntro";

afterEach(cleanup);

it("presents the summit priorities as one structured systems brief", () => {
  render(<AsmAboutIntro />);

  const brief = screen.getByRole("region", { name: "Systems in scope" });
  expect(
    within(brief).getByText(
      (_, element) =>
        element?.tagName === "P" && element.textContent === "03 priorities"
    )
  ).toBeTruthy();

  const priorities = within(brief).getAllByRole("listitem");
  expect(priorities).toHaveLength(3);
  expect(priorities[0].textContent).toContain("01 // GRID RESILIENCE");
  expect(priorities[1].textContent).toContain("02 // HIGH-DENSITY COMPUTE");
  expect(priorities[2].textContent).toContain("03 // LOW-CARBON DISPATCH");
});
