// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AsmNav from "../components/assembly/AsmNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

afterEach(cleanup);

it("presents Cross Future So Far as a recommended primary destination", () => {
  render(<AsmNav year={2026} />);

  const nav = screen.getByRole("navigation", { name: "Primary" });
  const progressLink = within(nav).getByRole("link", {
    name: /04 so far recommended/i,
  });

  expect(progressLink.getAttribute("href")).toBe("#progress");
});
