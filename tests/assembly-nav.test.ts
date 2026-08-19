import { describe, expect, it } from "vitest";
import {
  ASSEMBLY_BASE,
  ASSEMBLY_HOME,
  ASSEMBLY_REGISTER,
  ASSEMBLY_ROUTES,
  ASSEMBLY_SECTIONS,
  ASSEMBLY_TICKET_URL,
  sectionHref,
  isCurrentRoute,
} from "../lib/assembly-nav";

describe("canonical navigation", () => {
  it("keeps every public destination at the site root", () => {
    expect(ASSEMBLY_BASE).toBe("");
    expect(ASSEMBLY_HOME).toBe("/");
    expect(ASSEMBLY_REGISTER).toBe("/register");
    expect(ASSEMBLY_ROUTES.map((route) => route.href)).toEqual([
      "/",
      "/about",
      "/speakers",
      "/agenda",
      "/media",
      "/partners",
      "/contact",
    ]);
  });

  it("puts every route in the bar — nothing hides under a dropdown", () => {
    expect(ASSEMBLY_ROUTES.map((route) => route.label)).toEqual([
      "Home",
      "About",
      "Speakers",
      "Agenda",
      "Media",
      "Partners",
      "Contact",
    ]);
  });

  it("numbers the routes in the order they are shown", () => {
    expect(ASSEMBLY_ROUTES.map((route) => route.num)).toEqual([
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
    ]);
  });

  it("sends the chrome call-to-action to the one register route", () => {
    /* RSVP and Register were the same action under two names. The chrome now
       points inward; the outbound ticketing hop happens on /register only. */
    expect(ASSEMBLY_ROUTES.some((route) => route.href === ASSEMBLY_REGISTER)).toBe(
      false,
    );
    expect(ASSEMBLY_TICKET_URL).toBe(
      "https://www.eventgo.ai/event/1000909471805",
    );
  });

  it("matches home exactly and inner routes by prefix", () => {
    expect(isCurrentRoute("/", "/")).toBe(true);
    expect(isCurrentRoute("/", "/agenda")).toBe(false);
    expect(isCurrentRoute("/speakers", "/speakers/person")).toBe(true);
  });
});

describe("the bar as a table of contents", () => {
  it("points at sections of the page, not at other pages", () => {
    /* The bar used to load a route per label, so reaching for it mid-page
       threw the reader to the top of somewhere else. */
    expect(ASSEMBLY_SECTIONS.map((item) => item.section)).toEqual([
      "about",
      "interviews",
      "faculty",
      "focus",
      "agenda",
      "partners",
      "contact",
    ]);
  });

  it("keeps the same anchor working from a subpage", () => {
    expect(sectionHref("faculty", "/")).toBe("#faculty");
    expect(sectionHref("faculty", "/speakers")).toBe("/#faculty");
  });

  it("keeps a full page behind every section that has one", () => {
    const pages = ASSEMBLY_SECTIONS.flatMap((item) =>
      item.page ? [item.page] : []
    );
    for (const page of pages) {
      expect(ASSEMBLY_ROUTES.some((route) => route.href === page)).toBe(true);
    }
  });
});
