import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { getSummitContent, getCurrentEdition } from "@/lib/content";
import "./nexus.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-nx-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-nx-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-nx-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSummitContent("nexus");
  const edition = getCurrentEdition(content);
  return {
    title: edition.seo.title,
    description: edition.seo.description,
  };
}

export default function NexusLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`nexus ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      {children}
    </div>
  );
}
