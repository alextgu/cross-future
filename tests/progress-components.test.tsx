// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PastEdition } from "../lib/content";
import AsmProgress from "../components/assembly/AsmProgress";

afterEach(cleanup);

const editions: PastEdition[] = [
  {
    label: "ED.02",
    year: 2025,
    city: "Toronto",
    headline: "Recognition and a larger room.",
    stats: [{ value: "02", label: "Letters of support" }],
    highlights: ["Recognized by the Province of Ontario and City of Toronto."],
    media: {
      kind: "image",
      src: "/past-2025.svg",
      alt: "The 2025 audience",
      placeholder: true,
    },
  },
  {
    label: "ED.01",
    year: 2024,
    city: "Toronto",
    headline: "The first convening.",
    stats: [{ value: "01", label: "Day" }],
    highlights: ["Academia and industry met in one room."],
    media: {
      kind: "image",
      src: "/past-2024.svg",
      alt: "The 2024 plenary",
      placeholder: true,
    },
  },
];

describe("festival progress", () => {
  it("tells the completed-edition story and links once to the archive", () => {
    render(<AsmProgress editions={editions} />);

    expect(document.querySelector("#progress")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Built edition by edition" })).toBeTruthy();
    expect(
      screen.getByText(/cross future is designed as a long-term platform/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/community, institutional support, and a visible record of progress/i)
    ).toBeTruthy();
    expect(screen.getByText("2025")).toBeTruthy();
    expect(screen.getByText("2024")).toBeTruthy();
    expect(
      screen.getByText("Recognized by the Province of Ontario and City of Toronto.")
    ).toBeTruthy();
    expect(screen.getByText("Academia and industry met in one room.")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /past events/i })).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: /past events/i }).getAttribute("href")
    ).toBe("/past-events");
  });

  it("omits the progress region until a completed edition exists", () => {
    const { container } = render(<AsmProgress editions={[]} />);

    expect(container.childElementCount).toBe(0);
  });
});
