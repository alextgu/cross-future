import type { Metadata } from "next";
import { Barlow, Barlow_Semi_Condensed, IBM_Plex_Mono } from "next/font/google";
import {
  getSummitContent,
  getCurrentEdition,
  getHostOrganization,
  getAssembly,
} from "@/lib/content";
import AsmNav from "@/components/assembly/AsmNav";
import AsmFooter from "@/components/assembly/AsmFooter";
import "./assembly.css";

/* Barlow is the type family the live Cross Future site already uses. The
   semi-condensed cut carries the oversized uppercase display of the reference
   layout without introducing a second voice. */
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
    title: {
      default: edition.seo.title,
      template: `%s — ${edition.name}`,
    },
    description: edition.seo.description,
  };
}

export default async function AssemblyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const host = getHostOrganization(content);
  const assembly = getAssembly(content);

  return (
    <div
      className={`assembly ${display.variable} ${body.variable} ${mono.variable}`}
    >
      <a className="asm-skip" href="#main">
        Skip to content
      </a>
      <AsmNav year={edition.year} />
      {children}
      <AsmFooter edition={edition} host={host} assembly={assembly} />
    </div>
  );
}
