/**
 * Canonical route table.
 *
 * The site is one page. The bar, the drawer and the footer are a table of
 * contents for it, not a site map: every label is an anchor into a section of
 * the home page. Past Events is the only other route — a placeholder for
 * editions behind the current summit.
 */
export const ASSEMBLY_BASE = "";
export const ASSEMBLY_HOME = "/";
export const ASSEMBLY_PAST_EVENTS = "/past-events";

export interface AssemblyRoute {
  /** Optional mono prefix — home sections use numbers; page routes may omit. */
  num?: string;
  label: string;
  href: string;
}

export interface AssemblySection {
  /** Display number shown in nav and drawer. */
  num: string;
  label: string;
  /** Element id on the home page. */
  section: string;
  /** Marks the most useful review stop without changing its nav behavior. */
  recommended?: boolean;
  /** Ids this section absorbed, so old links still land somewhere real. */
  alsoAnchors?: string[];
}

/**
 * Six destinations, not eight steps.
 *
 * The bar was a numbered list of eight, which reads as an order a visitor has
 * to work through; these are places to go. Sections that asked the same
 * question of a visitor were merged rather than listed twice: Program is what
 * the day covers and when it happens, Supporters is everyone vouching for it,
 * and the interview archive belongs to the speakers who are in it.
 */
export const ASSEMBLY_SECTIONS: AssemblySection[] = [
  { num: "01", label: "About", section: "about" },
  {
    num: "02",
    label: "Speakers",
    section: "faculty",
    alsoAnchors: ["interviews"],
  },
  { num: "03", label: "Program", section: "focus", alsoAnchors: ["agenda"] },
  {
    num: "04",
    label: "So Far",
    section: "progress",
    recommended: true,
  },
  {
    num: "05",
    label: "Supporters",
    section: "recognition",
    alsoAnchors: ["partners"],
  },
  { num: "06", label: "Contact", section: "contact" },
];

/** Past editions — a separate page, not part of the home scroll. */
export const ASSEMBLY_PAST_EVENTS_ROUTE: AssemblyRoute = {
  label: "Past Events",
  href: ASSEMBLY_PAST_EVENTS,
};

/** Every routable page — home plus Past Events. */
export const ASSEMBLY_SITE_ROUTES: AssemblyRoute[] = [
  { num: "00", label: "Home", href: ASSEMBLY_HOME },
  ASSEMBLY_PAST_EVENTS_ROUTE,
];

/** Every id the page answers to, merged-away anchors included. */
export const ASSEMBLY_ANCHORS: string[] = ASSEMBLY_SECTIONS.flatMap((item) => [
  item.section,
  ...(item.alsoAnchors ?? []),
]);

/**
 * Section number by anchor id. Absorbed anchors (e.g. interviews, agenda)
 * intentionally resolve to the same number as their parent section.
 */
const SECTION_NUM_BY_ANCHOR = new Map(
  ASSEMBLY_SECTIONS.flatMap((item) => [
    [item.section, item.num] as const,
    ...(item.alsoAnchors ?? []).map((anchor) => [anchor, item.num] as const),
  ])
);

export function sectionNumber(anchor: string): string {
  return SECTION_NUM_BY_ANCHOR.get(anchor) ?? "00";
}

/**
 * An anchor works as `#id` on the home page and as `/#id` anywhere else, so
 * the same bar keeps working from Past Events instead of dead-ending.
 */
export function sectionHref(section: string, pathname: string): string {
  return pathname === ASSEMBLY_HOME ? `#${section}` : `/#${section}`;
}

/**
 * One conversion path. There is no register page any more — the summit sells
 * through EventGo, so the button goes there directly rather than through a
 * page whose only job was to hand off.
 */
export const ASSEMBLY_TICKET_URL = "https://www.eventgo.ai/event/1000909471805";
export const ASSEMBLY_TICKET_LABEL = "Tickets on EventGo";
export const ASSEMBLY_REGISTER = ASSEMBLY_TICKET_URL;
export const ASSEMBLY_REGISTER_LABEL = "Register";

/** Longest-prefix match while keeping the root link exact. */
export function isCurrentRoute(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
