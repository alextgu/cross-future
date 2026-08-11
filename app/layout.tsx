import type { Metadata } from "next";
import { Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import { getSummitContent, getCurrentEdition, getHostOrganization } from "@/lib/content";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSummitContent();
  const edition = getCurrentEdition(content);
  return {
    title: edition.seo.title,
    description: edition.seo.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getSummitContent();
  const edition = getCurrentEdition(content);
  const host = getHostOrganization(content);

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
    <html lang="en">
      <body className={`${interTight.variable} ${plexMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="column-rules" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        {children}
      </body>
    </html>
  );
}
