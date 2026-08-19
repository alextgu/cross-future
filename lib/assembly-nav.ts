/**
 * Canonical route table. Nav, mobile drawer, footer and the 404 all read
 * from here, so a page cannot exist without being reachable — and cannot be
 * linked from three places with three different labels.
 */
export const ASSEMBLY_BASE = "";
export const ASSEMBLY_HOME = "/";

export interface AssemblyRoute {
  num: string;
  label: string;
  href: string;
}

/**
 * The bar is a table of contents for the home page, not a site map.
 *
 * Every label used to load a different route, so reading down the page and
 * then reaching for the nav threw the reader back to the top of somewhere
 * else. These are anchors into the sections they name; the fuller pages
 * behind them are still reached from each section's own "all speakers",
 * "media archive", "full agenda" action, and from the footer.
 *
 * `section` is the element id on the home page. `page` is the route that goes
 * deeper on the same subject, for the footer and the drawer.
 */
export interface AssemblySection {
  num: string;
  label: string;
  /** Element id on the home page. */
  section: string;
  /** The page that carries the same subject in full, if there is one. */
  page?: string;
}

export const ASSEMBLY_SECTIONS: AssemblySection[] = [
  { num: "00", label: "About", section: "about", page: "/about" },
  { num: "01", label: "Interviews", section: "interviews", page: "/media" },
  { num: "02", label: "Speakers", section: "faculty", page: "/speakers" },
  { num: "03", label: "Focus", section: "focus" },
  { num: "04", label: "Agenda", section: "agenda", page: "/agenda" },
  { num: "05", label: "Partners", section: "partners", page: "/partners" },
  { num: "06", label: "Contact", section: "contact", page: "/contact" },
];

/**
 * An anchor works as `#id` on the home page and as `/#id` anywhere else, so
 * the same bar keeps working from a subpage instead of dead-ending.
 */
export function sectionHref(section: string, pathname: string): string {
  return pathname === ASSEMBLY_HOME ? `#${section}` : `/#${section}`;
}

/** Full routes. The footer lists these; the nav bar no longer does. */
export const ASSEMBLY_ROUTES: AssemblyRoute[] = [
  { num: "00", label: "Home", href: ASSEMBLY_HOME },
  { num: "01", label: "About", href: "/about" },
  { num: "02", label: "Speakers", href: "/speakers" },
  { num: "03", label: "Agenda", href: "/agenda" },
  { num: "04", label: "Media", href: "/media" },
  { num: "05", label: "Partners", href: "/partners" },
  { num: "06", label: "Contact", href: "/contact" },
];

/**
 * One conversion path, not two. "RSVP" and "Register" were the same action
 * wearing different words — the button jumped straight to the ticketing page
 * while the page of the same name sat inside the site. The chrome now points
 * at `/register`, and that page is where the external ticket link lives, so
 * the outbound hop happens once and in context.
 */
export const ASSEMBLY_REGISTER = `${ASSEMBLY_BASE}/register`;
export const ASSEMBLY_REGISTER_LABEL = "Register";

/** The ticketing page the register flow hands off to. */
export const ASSEMBLY_TICKET_URL = "https://www.eventgo.ai/event/1000909471805";
export const ASSEMBLY_TICKET_LABEL = "Tickets on EventGo";

/** Longest-prefix match while keeping the root link exact. */
export function isCurrentRoute(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
