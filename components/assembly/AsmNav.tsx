"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ASSEMBLY_BASE,
  ASSEMBLY_HOME,
  ASSEMBLY_PAST_EVENTS_ROUTE,
  ASSEMBLY_REGISTER,
  ASSEMBLY_REGISTER_LABEL,
  ASSEMBLY_SECTIONS,
  isCurrentRoute,
  sectionNumber,
  sectionHref,
} from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import { AsmMark } from "./AsmLogo";

/** Past this much scrolling the bar has been read and can get out of the way. */
const HIDE_AFTER = 260;
/** Cursor inside this band at the top of the window calls the bar back. */
const REVEAL_BAND = 90;

export default function AsmNav({ year }: { year: number }) {
  const pathname = usePathname() ?? ASSEMBLY_BASE;
  const onHome = pathname === ASSEMBLY_HOME;
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const barRef = useRef<HTMLElement | null>(null);

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

  /* Hide going down, show going up — plus two safety valves: the pointer
     reaching for the top of the window, and focus landing inside the bar,
     which is how a keyboard gets back to it. */
  useEffect(() => {
    let last = window.scrollY;
    let idleTimer: number | null = null;

    /* Read straight off the scroll event rather than through
       requestAnimationFrame: rAF is throttled when the tab is not painting,
       which leaves the bar stuck in whichever state it was last in. The work
       here is two comparisons, and React coalesces the state writes. */
    const onScroll = () => {
      const y = window.scrollY;
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setHidden(false);
      }, 480);
      /* A few pixels of jitter — a trackpad settling, an address bar
         resizing — should not toggle the bar. */
      if (Math.abs(y - last) < 6) return;
      const goingDown = y > last;
      last = y;
      setHidden(goingDown && y > HIDE_AFTER && !open);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.clientY <= REVEAL_BAND) setHidden(false);
    };
    const onFocus = () => {
      if (barRef.current?.contains(document.activeElement)) setHidden(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("focusin", onFocus);
      if (idleTimer !== null) window.clearTimeout(idleTimer);
    };
  }, [open]);

  /* Which section the reader is in, so the anchors say where they are. Home
     only: elsewhere the anchors point off-page and marking one would lie. */
  useEffect(() => {
    if (!onHome) {
      setActive(null);
      return;
    }
    const targets = ASSEMBLY_SECTIONS.map(({ section }) =>
      document.getElementById(section)
    ).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -70% 0px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [onHome]);

  return (
    <div
      className={`asm-navbar${hidden ? " is-hidden" : ""}`}
      data-hidden={hidden ? "true" : undefined}
    >
      <nav className="asm-navbar-inner" aria-label="Primary" ref={barRef}>
        <Link className="asm-wordmark" href={ASSEMBLY_HOME}>
          <AsmMark />
          <span>
            Cross Future <span className="asm-sr">AI Summit </span>/ {year}
          </span>
        </Link>

        <div className="asm-navlinks">
          {ASSEMBLY_SECTIONS.map((item) => (
            <a
              key={item.section}
              href={sectionHref(item.section, pathname)}
              aria-current={
                onHome && active === item.section ? "true" : undefined
              }
            >
              <span className="n">{sectionNumber(item.section)}</span>
              {item.label}
            </a>
          ))}
        </div>

        <div className="asm-navaux">
          <Link
            className="asm-navpage"
            href={ASSEMBLY_PAST_EVENTS_ROUTE.href}
            aria-current={
              isCurrentRoute(ASSEMBLY_PAST_EVENTS_ROUTE.href, pathname)
                ? "page"
                : undefined
            }
          >
            {ASSEMBLY_PAST_EVENTS_ROUTE.label}
          </Link>
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

      {/* Home sections in the drawer; Past Events and tickets are separate. */}
      <div
        id="asm-drawer"
        className={`asm-drawer${open ? " is-open" : ""}`}
        hidden={!open}
      >
        {ASSEMBLY_SECTIONS.map((item) => (
          <a
            key={item.section}
            href={sectionHref(item.section, pathname)}
            onClick={() => setOpen(false)}
            aria-current={
              onHome && active === item.section ? "true" : undefined
            }
          >
            <span className="n">{sectionNumber(item.section)}</span>
            {item.label}
          </a>
        ))}

        <p className="asm-drawer-divider" aria-hidden="true" />

        <Link
          className="asm-drawer-page"
          href={ASSEMBLY_PAST_EVENTS_ROUTE.href}
          onClick={() => setOpen(false)}
          aria-current={
            isCurrentRoute(ASSEMBLY_PAST_EVENTS_ROUTE.href, pathname)
              ? "page"
              : undefined
          }
        >
          {ASSEMBLY_PAST_EVENTS_ROUTE.label}
        </Link>

        {/* The ticket link leaves the site, so it is an anchor, not a route. */}
        <a href={ASSEMBLY_REGISTER} target="_blank" rel="noreferrer">
          <span className="n">↗</span>
          {ASSEMBLY_REGISTER_LABEL}
        </a>
      </div>
    </div>
  );
}
