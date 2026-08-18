"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ASSEMBLY_BAR_ROUTES,
  ASSEMBLY_BASE,
  ASSEMBLY_HOME,
  ASSEMBLY_MORE_LABEL,
  ASSEMBLY_MORE_ROUTES,
  ASSEMBLY_REGISTER,
  ASSEMBLY_ROUTES,
  ASSEMBLY_RSVP_LABEL,
  ASSEMBLY_RSVP_URL,
  isCurrentRoute,
} from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import { AsmMark } from "./AsmGlyph";

export default function AsmNav({ year }: { year: number }) {
  const pathname = usePathname() ?? ASSEMBLY_BASE;
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  /* Close the drawer on navigation and on Escape — a drawer that survives a
     route change is the classic mobile-nav bug. The dropdown shares the rule. */
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open && !moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, moreOpen]);

  /* Pointer-down rather than click: a menu that survives the press that opened
     something else reads as a stuck menu. */
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [moreOpen]);

  const moreIsCurrent = ASSEMBLY_MORE_ROUTES.some((route) =>
    isCurrentRoute(route.href, pathname),
  );

  return (
    <div className="asm-navbar">
      <nav className="asm-navbar-inner" aria-label="Primary">
        <Link className="asm-wordmark" href={ASSEMBLY_HOME}>
          <AsmMark />
          <span>
            Cross Future <span className="asm-sr">AI Summit </span>/ {year}
          </span>
        </Link>

        <div className="asm-navlinks">
          {ASSEMBLY_BAR_ROUTES.map((route) => (
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

          <div
            className={`asm-more${moreOpen ? " is-open" : ""}`}
            ref={moreRef}
            /* Focus leaving the whole group closes it; focus moving between
               the trigger and its items does not. */
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setMoreOpen(false);
              }
            }}
          >
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              aria-controls="asm-more-menu"
              data-current={moreIsCurrent ? "true" : undefined}
              onClick={() => setMoreOpen((v) => !v)}
            >
              {ASSEMBLY_MORE_LABEL}
              <span className="caret" aria-hidden="true" />
            </button>

            <div id="asm-more-menu" className="asm-moremenu" hidden={!moreOpen}>
              {ASSEMBLY_MORE_ROUTES.map((route) => (
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
              <Link
                href={ASSEMBLY_REGISTER}
                aria-current={
                  isCurrentRoute(ASSEMBLY_REGISTER, pathname)
                    ? "page"
                    : undefined
                }
              >
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="asm-navcta">
          <AsmButton href={ASSEMBLY_RSVP_URL} arrow={false}>
            {ASSEMBLY_RSVP_LABEL}
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
        <a href={ASSEMBLY_RSVP_URL} target="_blank" rel="noreferrer">
          <span className="n">08</span>
          {ASSEMBLY_RSVP_LABEL}
        </a>
      </div>
    </div>
  );
}
