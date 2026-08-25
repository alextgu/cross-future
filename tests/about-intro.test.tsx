// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

it("positions and clears the desktop pointer glow without rerendering content", () => {
  const { container } = render(<AsmAboutIntro />);
  const intro = container.firstElementChild as HTMLElement;
  intro.getBoundingClientRect = () =>
    ({
      top: 100,
      left: 0,
      width: 1200,
      height: 600,
      right: 1200,
      bottom: 700,
      x: 0,
      y: 100,
      toJSON: () => undefined,
    }) as DOMRect;

  fireEvent.mouseMove(intro, { clientX: 320, clientY: 260 });

  expect(intro.dataset.glowActive).toBe("true");
  expect(intro.style.getPropertyValue("--asm-glow-x")).toBe("320px");
  expect(intro.style.getPropertyValue("--asm-glow-y")).toBe("160px");

  fireEvent.mouseLeave(intro);
  expect(intro.hasAttribute("data-glow-active")).toBe(false);
});
