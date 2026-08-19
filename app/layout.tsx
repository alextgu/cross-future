import type { Metadata } from "next";
import { Barlow, Barlow_Semi_Condensed, IBM_Plex_Mono } from "next/font/google";
import {
  getAssembly,
  getCurrentEdition,
  getHostOrganization,
  getSummitContent,
} from "@/lib/content";
import AsmFooter from "@/components/assembly/AsmFooter";
import AsmNav from "@/components/assembly/AsmNav";
import AsmThemeLab from "@/components/assembly/AsmThemeLab";
import { THEME_DEFAULT, THEME_SCHEMES, THEME_STORAGE_KEY } from "@/lib/themes";
import "./globals.css";
import "./assembly/assembly.css";
import "./assembly/themes.css";

/* Applied before first paint so a stored scheme never flashes through the
   default one. Kept to a single attribute write and wrapped in try/catch:
   storage is blocked outright in some privacy modes. */
const THEME_BOOT = `(function(){try{var ids=${JSON.stringify(
  THEME_SCHEMES.map((scheme) => scheme.id),
)};var v=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.dataset.theme=ids.indexOf(v)>-1?v:${JSON.stringify(
  THEME_DEFAULT,
)};}catch(e){document.documentElement.dataset.theme=${JSON.stringify(
  THEME_DEFAULT,
)};}})();`;

/* The switcher is a review tool. It ships unless the deploy turns it off. */
const THEME_LAB_ENABLED = process.env.NEXT_PUBLIC_THEME_LAB !== "off";

const display = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-asm-display",
  display: "swap",
});

const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-asm-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-asm-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://cross-future.com"
    ),
    title: {
      default: edition.seo.title,
      template: `%s — ${edition.name}`,
    },
    description: edition.seo.description,
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const host = getHostOrganization(content);
  const assembly = getAssembly(content);

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: edition.name,
    description: edition.seo.description,
    startDate: edition.startsAt,
    endDate: edition.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: edition.venue.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: edition.venue.city,
        addressRegion: edition.venue.region,
        addressCountry: edition.venue.country,
      },
    },
    organizer: host
      ? {
          "@type": "Organization",
          name: host.name,
          url: host.url,
          nonprofitStatus: "https://schema.org/NonprofitType",
        }
      : undefined,
  };

  return (
    <html lang="en" data-theme={THEME_DEFAULT} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
        <div
          className={`assembly ${display.variable} ${body.variable} ${mono.variable}`}
        >
          <a className="asm-skip" href="#main">
            Skip to content
          </a>
          <AsmNav year={edition.year} />
          {children}
          <AsmFooter edition={edition} host={host} assembly={assembly} />
          {THEME_LAB_ENABLED ? <AsmThemeLab /> : null}
        </div>
      </body>
    </html>
  );
}
