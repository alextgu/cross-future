// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import AsmThemeLab from "../components/assembly/AsmThemeLab";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-review-density");
  document.documentElement.removeAttribute("data-review-collection");
  document.documentElement.style.removeProperty("--asm-radius");
  document.documentElement.style.removeProperty("--asm-media-tint");
});

it("opens compactly and applies the visible presentation controls", () => {
  const { container } = render(<AsmThemeLab />);
  fireEvent.click(screen.getByRole("button", { name: /Review · Hub blue/i }));

  fireEvent.click(screen.getByRole("button", { name: "Mono" }));
  fireEvent.click(screen.getByRole("button", { name: "compact" }));

  expect(screen.queryByRole("button", { name: "curated" })).toBeNull();
  expect(screen.queryByRole("button", { name: "full" })).toBeNull();

  const ranges = container.querySelectorAll<HTMLInputElement>('input[type="range"]');
  fireEvent.change(ranges[0], { target: { value: "0.5" } });
  fireEvent.change(ranges[1], { target: { value: "12" } });

  expect(document.documentElement.dataset.theme).toBe("mono");
  expect(document.documentElement.dataset.reviewDensity).toBe("compact");
  expect(document.documentElement.style.getPropertyValue("--asm-media-tint")).toBe("0.5");
  expect(document.documentElement.style.getPropertyValue("--asm-radius")).toBe("12px");
});

it("restores the recommended CEO view", () => {
  const { container } = render(<AsmThemeLab />);
  fireEvent.click(screen.getByRole("button", { name: /Review · Hub blue/i }));
  fireEvent.click(screen.getByRole("button", { name: "airy" }));
  const ranges = container.querySelectorAll<HTMLInputElement>('input[type="range"]');
  fireEvent.change(ranges[0], { target: { value: "0.75" } });
  fireEvent.click(screen.getByRole("button", { name: "Reset recommended view" }));

  expect(document.documentElement.dataset.theme).toBe("hub");
  expect(document.documentElement.dataset.reviewDensity).toBe("balanced");
  expect(document.documentElement.style.getPropertyValue("--asm-radius")).toBe("22px");
  expect(document.documentElement.style.getPropertyValue("--asm-media-tint")).toBe("0.4");
});
