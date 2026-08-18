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
  { num: "00", label: "Home", href: ASSEMBLY_HOME, primary: false },
  { num: "01", label: "About", href: "/about", primary: true },
  { num: "02", label: "Speakers", href: "/speakers", primary: true },
  { num: "03", label: "Agenda", href: "/agenda", primary: true },
  { num: "04", label: "Media", href: "/media", primary: true },
  { num: "05", label: "Partners", href: "/partners", primary: true },
  { num: "06", label: "Contact", href: "/contact", primary: false },
];

export const ASSEMBLY_REGISTER = `${ASSEMBLY_BASE}/register`;

/** Longest-prefix match while keeping the root link exact. */
export function isCurrentRoute(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
