// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import ProgramPage from "../app/program/page";

afterEach(cleanup);

it("publishes the current event program on its own route", async () => {
  render(await ProgramPage());
  expect(
    screen.getByRole("heading", { level: 1, name: "Program" })
  ).toBeTruthy();
  expect(screen.getByText(/program updates coming soon/i)).toBeTruthy();
  expect(screen.getByRole("link", { name: /register|get updates/i })).toBeTruthy();
});
