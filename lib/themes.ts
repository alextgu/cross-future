/**
 * The scheme roster. One entry per Tier-1 restatement in
 * `app/assembly/themes.css`; the ids are the `data-theme` values.
 *
 * `swatch` is only what the switcher draws in its three-chip preview — the
 * real values live in CSS. It is duplicated here on purpose: the lab has to
 * paint a scheme it is not currently displaying.
 */
export interface ThemeScheme {
  id: string;
  label: string;
  note: string;
  /** [ground, accent, deep] — the three chips in the switcher. */
  swatch: [string, string, string];
}

export const THEME_DEFAULT = "hub";

export const THEME_SCHEMES: ThemeScheme[] = [
  {
    id: "hub",
    label: "Hub blue",
    note: "The mark's own blue",
    swatch: ["#eef2f7", "#215f9a", "#0d1723"],
  },
  {
    id: "signal",
    label: "Signal",
    note: "Navy ground, amber accent",
    swatch: ["#f3efe8", "#a4560c", "#16233a"],
  },
  {
    id: "verdant",
    label: "Verdant",
    note: "Forest ground, green accent",
    swatch: ["#eef3ee", "#1f7a4d", "#0e1a13"],
  },
  {
    id: "midnight",
    label: "Midnight",
    note: "The ramp inverted",
    swatch: ["#0a0f15", "#63aae8", "#f1f6fb"],
  },
  {
    id: "mono",
    label: "Mono",
    note: "The approved greyscale study",
    swatch: ["#f4f4f4", "#1d1d1d", "#111111"],
  },
];

export const THEME_STORAGE_KEY = "cf-theme";

export function isThemeId(value: string | null | undefined): boolean {
  return THEME_SCHEMES.some((scheme) => scheme.id === value);
}
