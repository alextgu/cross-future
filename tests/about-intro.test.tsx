// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import AsmAboutIntro from "../components/assembly/AsmAboutIntro";

afterEach(cleanup);

it("introduces Cross Future with concise copy and three event moments", () => {
  render(<AsmAboutIntro />);

  expect(
    screen.getByRole("heading", {
      name: "Where AI ideas become shared momentum.",
    })
  ).toBeTruthy();
  expect(
    screen.getByText(
      "Cross Future connects professors, researchers and industry builders through recurring AI events built for useful exchange and lasting collaboration."
    )
  ).toBeTruthy();
  expect(screen.getAllByRole("img")).toHaveLength(3);
  expect(screen.queryByText(/^Professors$/)).toBeNull();
  expect(screen.queryByText(/^Researchers$/)).toBeNull();
  expect(screen.queryByText(/^Industry builders$/)).toBeNull();
});
