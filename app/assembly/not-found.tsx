import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
} from "@/lib/content";
import { ASSEMBLY_SITE_ROUTES, ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import Link from "next/link";
import AsmShell from "@/components/assembly/AsmShell";
import AsmButton from "@/components/assembly/AsmButton";
import AsmMedia from "@/components/assembly/AsmMedia";

/**
 * 404 inside the Assembly shell — same nav, same rail, same footer, so a
 * wrong URL is a wrong turn rather than an exit. Every route is listed,
 * generated from the same table the nav uses.
 */
export default async function AssemblyNotFound() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);

  return (
    <AsmShell rail={assembly.rail}>
      <header className="asm-card t-deep asm-hero">
        <AsmMedia media={assembly.gallery[7]} bleed scrim />
        <div className="asm-hero-inner">
          <p className="asm-eyebrow">Error 404</p>
          <h1 className="asm-d0 asm-hero-title">
            <span>Nothing</span>
            <span>Here</span>
          </h1>
          <p className="asm-lede" style={{ textAlign: "center" }}>
            That page does not exist. The {edition.year} summit does — every
            page of it is one click below.
          </p>
          <AsmButton href={ASSEMBLY_REGISTER} tone="inverse">
            Register instead
          </AsmButton>
        </div>
      </header>

      <section className="asm-card is-padded t-plain">
        <p className="asm-eyebrow" style={{ marginBottom: 24 }}>
          Every page
        </p>
        <ul
          className="asm-row"
          style={{ ["--cols" as string]: 3, ["--cols-md" as string]: 2 }}
        >
          {ASSEMBLY_SITE_ROUTES.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                style={{
                  display: "grid",
                  gap: 6,
                  padding: "18px 0",
                  borderTop: "1px solid var(--asm-hair)",
                }}
              >
                <span className="asm-meta">{route.num}</span>
                <span className="asm-d3" style={{ fontSize: "1.4rem" }}>
                  {route.label} ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AsmShell>
  );
}
