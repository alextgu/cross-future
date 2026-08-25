// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import AsmStatsBridge from "../components/assembly/AsmStatsBridge";

afterEach(cleanup);

it("presents each temporary metric as one labelled list item", () => {
  render(
    <AsmStatsBridge
      items={[
        { value: "XX", label: "Events" },
        { value: "XX", label: "Speakers" },
        { value: "YY", label: "Interviews" },
        { value: "YY", label: "Partners" },
      ]}
    />
  );

  expect(
    screen.getByRole("complementary", {
      name: "Cross Future at a glance",
    })
  ).toBeTruthy();
  expect(
    screen.getAllByRole("listitem").map((item) => item.textContent)
  ).toEqual(["XXEvents", "XXSpeakers", "YYInterviews", "YYPartners"]);
});
