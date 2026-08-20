// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  it("presents the accomplishments as an explicitly fictional slideshow", () => {
    render(<AsmProgress editions={editions} />);

    expect(document.querySelector("#progress")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What Cross Future could show" })).toBeTruthy();
    expect(
      screen.getByText(/cross future is designed as a long-term platform/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/all accomplishments, figures, and captions in this slideshow are fictional examples/i)
    ).toBeTruthy();
    expect(screen.getByText(/mock data — not factual/i)).toBeTruthy();
    expect(screen.getByText(/illustrative placeholder image/i)).toBeTruthy();
    expect(screen.getByRole("region", { name: "Mock accomplishments slideshow" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "A growing room for Canadian AI" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Slide 1 of 3");
    expect(screen.getAllByRole("link", { name: /past events/i })).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: /past events/i }).getAttribute("href")
    ).toBe("/past-events");
  });

  it("moves through mock accomplishments with buttons, dots, and arrow keys", () => {
    render(<AsmProgress editions={editions} />);

    fireEvent.click(screen.getByRole("button", { name: "Next accomplishment" }));
    expect(screen.getByRole("heading", { name: "Ideas crossing sectors" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Slide 2 of 3");

    fireEvent.click(screen.getByRole("button", { name: "Show mock accomplishment 3" }));
    expect(
      screen.getByRole("heading", {
        name: "Partnerships that continue after the room",
      })
    ).toBeTruthy();

    fireEvent.keyDown(
      screen.getByRole("region", { name: "Mock accomplishments slideshow" }),
      { key: "ArrowRight" }
    );
    expect(screen.getByRole("heading", { name: "A growing room for Canadian AI" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Previous accomplishment" }));
    expect(
      screen.getByRole("heading", {
        name: "Partnerships that continue after the room",
      })
    ).toBeTruthy();
  });

  it("omits the progress region until a completed edition exists", () => {
    const { container } = render(<AsmProgress editions={[]} />);

    expect(container.childElementCount).toBe(0);
  });
});
