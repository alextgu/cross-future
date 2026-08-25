// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import ProgramPage from "../app/program/page";

afterEach(cleanup);

it("publishes the current event program on its own route", async () => {
  render(await ProgramPage());
  expect(
    screen.getByRole("heading", { level: 1, name: "Program" })
  ).toBeTruthy();
  expect(screen.getByText(/program updates coming soon/i)).toBeTruthy();
  const statusCard = document.querySelector<HTMLElement>(
    ".asm-card.is-provisional"
  );
  expect(statusCard).not.toBeNull();
  expect(
    within(statusCard as HTMLElement).queryByRole("link", {
      name: /register|get updates/i,
    })
  ).toBeNull();
});
