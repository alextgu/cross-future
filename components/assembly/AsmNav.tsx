"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ASSEMBLY_BASE,
  ASSEMBLY_HOME,
  ASSEMBLY_PRIMARY_NAV,
  ASSEMBLY_REGISTER,
  ASSEMBLY_REGISTER_LABEL,
  isCurrentRoute,
} from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import { AsmMark } from "./AsmLogo";

const NAV_IDLE_DELAY = 1500;

export default function AsmNav(_props: { year: number }) {
  const pathname = usePathname() ?? ASSEMBLY_BASE;
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  /* Close the drawer on navigation and on Escape — a drawer that survives a
     route change is the classic mobile-nav bug. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const finePointer = window.matchMedia?.(
      "(hover: hover) and (pointer: fine)"
    );

    // Touch users have no cursor movement with which to recover the nav.
    if (!finePointer?.matches) {
      setHidden(false);
      return;
    }

    const navbar = navbarRef.current;
    const hero = document.querySelector<HTMLElement>(".asm-future-hero");
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let pastHero = true;

    const clearIdleTimer = () => {
      if (idleTimer !== undefined) clearTimeout(idleTimer);
      idleTimer = undefined;
    };

    const navHasFocus = () =>
      navbar !== null && navbar.contains(document.activeElement);

    const measurePastHero = () => {
      if (!hero) return true;
      const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
      return hero.getBoundingClientRect().bottom <= navbarHeight;
    };

    const scheduleHide = () => {
      clearIdleTimer();
      if (!pastHero || open || navHasFocus()) {
        setHidden(false);
        return;
      }

      idleTimer = setTimeout(() => {
        if (pastHero && !open && !navHasFocus()) setHidden(true);
      }, NAV_IDLE_DELAY);
    };

    const onScroll = () => {
      pastHero = measurePastHero();
      clearIdleTimer();

      if (!pastHero || open || navHasFocus()) {
        setHidden(false);
        return;
      }

      setHidden(true);
    };

    const onPointerMove = () => {
      pastHero = measurePastHero();
      setHidden(false);
      scheduleHide();
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!navbar?.contains(event.target as Node)) return;
      clearIdleTimer();
      setHidden(false);
    };

    const onFocusOut = () => {
      pastHero = measurePastHero();
      scheduleHide();
    };

    pastHero = measurePastHero();
    setHidden(false);
    if (pastHero) scheduleHide();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    navbar?.addEventListener("focusin", onFocusIn);
    navbar?.addEventListener("focusout", onFocusOut);

    return () => {
      clearIdleTimer();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      navbar?.removeEventListener("focusin", onFocusIn);
      navbar?.removeEventListener("focusout", onFocusOut);
    };
  }, [open, pathname]);

  return (
    <div
      ref={navbarRef}
      className={`asm-navbar${hidden ? " is-hidden" : ""}`}
    >
      <nav className="asm-navbar-inner" aria-label="Primary">
        <Link className="asm-wordmark" href={ASSEMBLY_HOME}>
          <AsmMark />
          <span>Cross Future Hub</span>
        </Link>

        <div className="asm-navlinks">
          {ASSEMBLY_PRIMARY_NAV.map((route) => (
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

        <div className="asm-navaux">
          <AsmButton href={ASSEMBLY_REGISTER} arrow={false}>
            {ASSEMBLY_REGISTER_LABEL}
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

      {/* The drawer mirrors the primary bar, then separates archival and
          ticket actions below the divider. */}
      <div
        id="asm-drawer"
        className={`asm-drawer${open ? " is-open" : ""}`}
        hidden={!open}
      >
        {ASSEMBLY_PRIMARY_NAV.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => setOpen(false)}
            aria-current={
              isCurrentRoute(route.href, pathname) ? "page" : undefined
            }
          >
            {route.label}
          </Link>
        ))}

        <p className="asm-drawer-divider" aria-hidden="true" />

        {/* The ticket link leaves the site, so it is an anchor, not a route. */}
        <a href={ASSEMBLY_REGISTER} target="_blank" rel="noreferrer">
          <span className="n">↗</span>
          {ASSEMBLY_REGISTER_LABEL}
        </a>
      </div>
    </div>
  );
}
