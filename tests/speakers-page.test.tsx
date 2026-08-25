// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import SpeakersAndInterviewsPage from "../app/speakers/page";

afterEach(cleanup);

it("offers the complete speaker roster and recorded interviews on one page", async () => {
  render(await SpeakersAndInterviewsPage());

  expect(
    screen.getByRole("heading", { level: 1, name: "Speakers & Interviews" })
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { level: 2, name: "Previous Speakers" })
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { level: 2, name: "Recorded Interviews" })
  ).toBeTruthy();
  expect(
    screen.queryByText(
      "A growing record of the people bringing research and industry into the same room."
    )
  ).toBeNull();
  expect(
    screen.queryByText(
      "Watch conversations captured across Cross Future editions."
    )
  ).toBeNull();
  expect(
    screen
      .getByRole("region", { name: "Previous Speakers" })
      .getAttribute("id")
  ).toBe("speakers");
  expect(
    screen
      .getByRole("region", { name: "Recorded Interviews" })
      .getAttribute("id")
  ).toBe("interviews");
});
