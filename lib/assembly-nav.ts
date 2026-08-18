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
  /** Shown in the nav bar; the rest are drawer/footer only. */
  primary: boolean;
}

export const ASSEMBLY_ROUTES: AssemblyRoute[] = [
  { num: "00", label: "Home", href: ASSEMBLY_HOME, primary: true },
  { num: "01", label: "Speakers", href: "/speakers", primary: true },
  { num: "02", label: "Agenda", href: "/agenda", primary: true },
  { num: "03", label: "Partners", href: "/partners", primary: true },
  { num: "04", label: "Contact", href: "/contact", primary: true },
  { num: "05", label: "About", href: "/about", primary: false },
  { num: "06", label: "Media", href: "/media", primary: false },
];

/** Bar order, matching the live site. */
export const ASSEMBLY_BAR_ROUTES = ASSEMBLY_ROUTES.filter((r) => r.primary);

/** Everything the bar has no room for, shown under the "More" dropdown. */
export const ASSEMBLY_MORE_ROUTES = ASSEMBLY_ROUTES.filter((r) => !r.primary);

export const ASSEMBLY_MORE_LABEL = "More";

/**
 * The nav and footer call-to-action point at the external ticketing page, as
 * the live site does. The in-page register flow at ASSEMBLY_REGISTER stays —
 * it is still linked from the page-level CTAs and the footer page list.
 */
export const ASSEMBLY_RSVP_URL = "https://www.eventgo.ai/event/1000909471805";
export const ASSEMBLY_RSVP_LABEL = "RSVP Event";

export const ASSEMBLY_REGISTER = `${ASSEMBLY_BASE}/register`;

/** Longest-prefix match while keeping the root link exact. */
export function isCurrentRoute(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
