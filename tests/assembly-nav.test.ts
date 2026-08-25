import { describe, expect, it } from "vitest";
import {
  ASSEMBLY_BASE,
  ASSEMBLY_HOME,
  ASSEMBLY_PAST_EVENTS,
  ASSEMBLY_PRIMARY_NAV,
  ASSEMBLY_PAST_EVENTS_ROUTE,
  ASSEMBLY_SITE_ROUTES,
  ASSEMBLY_REGISTER,
  ASSEMBLY_SECTIONS,
  ASSEMBLY_ANCHORS,
  ASSEMBLY_TICKET_URL,
  sectionNumber,
  sectionHref,
  isCurrentRoute,
} from "../lib/assembly-nav";

describe("canonical navigation", () => {
  it("publishes every primary destination as a first-class route", () => {
    expect(ASSEMBLY_BASE).toBe("");
    expect(ASSEMBLY_HOME).toBe("/");
    expect(ASSEMBLY_PAST_EVENTS).toBe("/past-events");
    expect(ASSEMBLY_PAST_EVENTS_ROUTE.href).toBe("/past-events");
    expect(ASSEMBLY_PAST_EVENTS_ROUTE.label).toBe("Past Events");
    expect(ASSEMBLY_PAST_EVENTS_ROUTE.num).toBeUndefined();
    expect(ASSEMBLY_PRIMARY_NAV).toEqual([
      { label: "Home", href: "/" },
      { label: "Speakers & Interviews", href: "/speakers" },
      { label: "Program", href: "/program" },
      { label: "Past Events", href: "/past-events" },
    ]);
    expect(ASSEMBLY_SITE_ROUTES).toEqual(ASSEMBLY_PRIMARY_NAV);
    expect(ASSEMBLY_PRIMARY_NAV.every(({ href }) => !href.includes("#"))).toBe(
      true
    );
  });

  it("sends the chrome call-to-action straight to the ticketing host", () => {
    /* There is no register route to hand off through any more — the button is
       the outbound hop. */
    expect(ASSEMBLY_REGISTER).toBe(ASSEMBLY_TICKET_URL);
    expect(ASSEMBLY_TICKET_URL).toBe(
      "https://www.eventgo.ai/event/1000909471805"
    );
  });

  it("matches home exactly and inner routes by prefix", () => {
    expect(isCurrentRoute("/", "/")).toBe(true);
    expect(isCurrentRoute("/", "/past-events")).toBe(false);
    expect(isCurrentRoute("/past-events", "/past-events")).toBe(true);
  });
});

describe("the bar as a short set of visitor choices", () => {
  it("keeps only the true in-page destinations in the section list", () => {
    expect(ASSEMBLY_SECTIONS.map((item) => item.label)).toEqual([
      "About",
      "Program",
    ]);
    expect(ASSEMBLY_SECTIONS.map((item) => item.section)).toEqual([
      "about",
      "focus",
    ]);
    expect(ASSEMBLY_SECTIONS.every((item) => item.num === undefined)).toBe(true);
  });

  it("keeps every published anchor available even when it is not in the bar", () => {
    /* Links to #interviews, #agenda and #partners were published before the
       merge; they still have to land somewhere real. */
    expect(ASSEMBLY_ANCHORS).toEqual([
      "about",
      "faculty",
      "interviews",
      "focus",
      "agenda",
      "progress",
      "recognition",
      "partners",
      "contact",
    ]);
    expect(sectionNumber("faculty")).toBe("");
    expect(sectionNumber("interviews")).toBe("");
    expect(sectionNumber("focus")).toBe("");
    expect(sectionNumber("agenda")).toBe("");
  });

  it("keeps the same anchor working from past events", () => {
    expect(sectionHref("faculty", "/")).toBe("#faculty");
    expect(sectionHref("faculty", "/past-events")).toBe("/#faculty");
  });
});
