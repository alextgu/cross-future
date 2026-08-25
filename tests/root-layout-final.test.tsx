import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import RootLayout from "../app/layout";

vi.mock("next/font/google", () => ({
  Barlow: () => ({ variable: "font-body" }),
  Barlow_Semi_Condensed: () => ({ variable: "font-display" }),
  IBM_Plex_Mono: () => ({ variable: "font-mono" }),
}));

vi.mock("@/lib/content", () => ({
  getSummitContent: vi.fn().mockResolvedValue({}),
  getCurrentEdition: () => ({
    name: "Cross Future",
    year: 2026,
    startsAt: "2026-10-08T09:00:00-04:00",
    endsAt: "2026-10-08T17:00:00-04:00",
    venue: {
      name: "Venue",
      city: "Toronto",
      region: "Ontario",
      country: "Canada",
    },
    seo: { title: "Cross Future", description: "AI event" },
  }),
  getHostOrganization: () => undefined,
  getAssembly: () => ({}),
}));

vi.mock("@/components/assembly/AsmNav", () => ({
  default: () => <nav aria-label="Primary" />,
}));

vi.mock("@/components/assembly/AsmFooter", () => ({
  default: () => <footer />,
}));

it("ships a fixed light theme without review controls or stored overrides", async () => {
  const markup = renderToStaticMarkup(
    await RootLayout({ children: <main id="main" /> })
  );

  expect(markup).toContain('<html lang="en" data-theme="hub">');
  expect(markup).not.toContain("Review ·");
  expect(markup).not.toContain("localStorage");
});
