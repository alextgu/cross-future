import { describe, expect, it } from "vitest";
import {
  ASSEMBLY_BASE,
  ASSEMBLY_HOME,
  ASSEMBLY_PAST_EVENTS,
  ASSEMBLY_PAST_EVENTS_ROUTE,
  ASSEMBLY_REGISTER,
  ASSEMBLY_SECTIONS,
  ASSEMBLY_ANCHORS,
  ASSEMBLY_TICKET_URL,
  sectionNumber,
  sectionHref,
  isCurrentRoute,
} from "../lib/assembly-nav";

describe("canonical navigation", () => {
  it("keeps the site at two routes: the page, and past events", () => {
    expect(ASSEMBLY_BASE).toBe("");
    expect(ASSEMBLY_HOME).toBe("/");
    expect(ASSEMBLY_PAST_EVENTS).toBe("/past-events");
    expect(ASSEMBLY_PAST_EVENTS_ROUTE.href).toBe("/past-events");
    expect(ASSEMBLY_PAST_EVENTS_ROUTE.label).toBe("Past Events");
    expect(ASSEMBLY_PAST_EVENTS_ROUTE.num).toBeUndefined();
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

describe("the bar as a table of contents", () => {
  it("offers five numbered destinations", () => {
    expect(ASSEMBLY_SECTIONS.map((item) => item.label)).toEqual([
      "About",
      "Speakers",
      "Program",
      "Supporters",
      "Contact",
    ]);
    expect(ASSEMBLY_SECTIONS.map((item) => item.num)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
    ]);
    expect(ASSEMBLY_SECTIONS.map((item) => item.section)).toEqual([
      "about",
      "faculty",
      "focus",
      "recognition",
      "contact",
    ]);
  });

  it("keeps every id a merged section absorbed", () => {
    /* Links to #interviews, #agenda and #partners were published before the
       merge; they still have to land somewhere real. */
    expect(ASSEMBLY_ANCHORS).toEqual([
      "about",
      "faculty",
      "interviews",
      "focus",
      "agenda",
      "recognition",
      "partners",
      "contact",
    ]);
    expect(sectionNumber("faculty")).toBe("02");
    expect(sectionNumber("interviews")).toBe("02");
    expect(sectionNumber("focus")).toBe("03");
    expect(sectionNumber("agenda")).toBe("03");
  });

  it("keeps the same anchor working from past events", () => {
    expect(sectionHref("faculty", "/")).toBe("#faculty");
    expect(sectionHref("faculty", "/past-events")).toBe("/#faculty");
  });
});
