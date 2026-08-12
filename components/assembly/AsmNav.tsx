"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ASSEMBLY_BASE,
  ASSEMBLY_REGISTER,
  ASSEMBLY_ROUTES,
  isCurrentRoute,
} from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import { AsmMark } from "./AsmGlyph";

export default function AsmNav({ year }: { year: number }) {
  const pathname = usePathname() ?? ASSEMBLY_BASE;
  const [open, setOpen] = useState(false);

  /* Close the drawer on navigation and on Escape — a drawer that survives a
     route change is the classic mobile-nav bug. */
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const primary = ASSEMBLY_ROUTES.filter((r) => r.primary);

  return (
    <div className="asm-navbar">
      <nav className="asm-navbar-inner" aria-label="Primary">
        <Link className="asm-wordmark" href={ASSEMBLY_BASE}>
          <AsmMark />
          <span>
            Cross Future <span className="asm-sr">AI Summit </span>/ {year}
          </span>
        </Link>

        <div className="asm-navlinks">
          {primary.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              aria-current={
                isCurrentRoute(route.href, pathname) ? "page" : undefined
              }
            >
              {route.label}
            </Link>
          ))}
        </div>

        <div className="asm-navcta">
          <AsmButton href={ASSEMBLY_REGISTER} arrow={false}>
            Register
          </AsmButton>
        </div>

        <button
          type="button"
          className="asm-burger"
          aria-expanded={open}
          aria-controls="asm-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
          <span className="asm-sr">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </nav>

      <div
        id="asm-drawer"
        className={`asm-drawer${open ? " is-open" : ""}`}
        hidden={!open}
      >
        {ASSEMBLY_ROUTES.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            aria-current={
              isCurrentRoute(route.href, pathname) ? "page" : undefined
            }
          >
            <span className="n">{route.num}</span>
            {route.label}
          </Link>
        ))}
        <Link href={ASSEMBLY_REGISTER}>
          <span className="n">07</span>
          Register
        </Link>
      </div>
    </div>
  );
}
