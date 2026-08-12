/**
 * Route table for Design C. Nav, mobile drawer, footer and the 404 all read
 * from here, so a page cannot exist without being reachable — and cannot be
 * linked from three places with three different labels.
 */
export const ASSEMBLY_BASE = "/assembly";

export interface AssemblyRoute {
  num: string;
  label: string;
  href: string;
  /** Shown in the nav bar; the rest are drawer/footer only. */
  primary: boolean;
}

export const ASSEMBLY_ROUTES: AssemblyRoute[] = [
  { num: "00", label: "Home", href: `${ASSEMBLY_BASE}`, primary: false },
  { num: "01", label: "About", href: `${ASSEMBLY_BASE}/about`, primary: true },
  { num: "02", label: "Speakers", href: `${ASSEMBLY_BASE}/speakers`, primary: true },
  { num: "03", label: "Agenda", href: `${ASSEMBLY_BASE}/agenda`, primary: true },
  { num: "04", label: "Media", href: `${ASSEMBLY_BASE}/media`, primary: true },
  { num: "05", label: "Partners", href: `${ASSEMBLY_BASE}/partners`, primary: true },
  { num: "06", label: "Contact", href: `${ASSEMBLY_BASE}/contact`, primary: false },
];

export const ASSEMBLY_REGISTER = `${ASSEMBLY_BASE}/register`;

/** Longest-prefix match so /assembly/speakers does not light up /assembly. */
export function isCurrentRoute(href: string, pathname: string): boolean {
  if (href === ASSEMBLY_BASE) return pathname === ASSEMBLY_BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
}
