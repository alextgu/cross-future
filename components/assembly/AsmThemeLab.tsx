"use client";

import { useEffect, useState } from "react";
import {
  THEME_DEFAULT,
  THEME_MEDIA_TINT_DEFAULT,
  THEME_MEDIA_TINT_KEY,
  THEME_MEDIA_TINT_MAX,
  THEME_MEDIA_TINT_MIN,
  THEME_SCHEMES,
  THEME_STORAGE_KEY,
  isThemeId,
} from "@/lib/themes";

const SECTION_CONTRAST_KEY = "cf-section-contrast";

/**
 * On-screen scheme switcher for review sessions.
 *
 * It writes one attribute — `data-theme` on <html> — and stores the choice so
 * a reload, or a walk through the whole site mid-demo, keeps the scheme. The
 * boot script in the root layout applies the same value before first paint,
 * so there is no flash of the default scheme on navigation.
 */
export default function AsmThemeLab() {
  const [theme, setTheme] = useState(THEME_DEFAULT);
  const [mediaTint, setMediaTint] = useState(THEME_MEDIA_TINT_DEFAULT);
  const [sectionContrast, setSectionContrast] = useState(false);
  const [open, setOpen] = useState(true);

  /* Adopt whatever the boot script already put on the element rather than
     re-deciding it here — otherwise the first paint and the first render
     disagree and the scheme visibly snaps back. */
  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    if (isThemeId(applied)) setTheme(applied as string);

    try {
      const stored = Number(window.localStorage.getItem(THEME_MEDIA_TINT_KEY));
      if (Number.isFinite(stored)) {
        const clamped = Math.min(
          THEME_MEDIA_TINT_MAX,
          Math.max(THEME_MEDIA_TINT_MIN, stored)
        );
        setMediaTint(clamped);
        document.documentElement.style.setProperty(
          "--asm-media-tint",
          String(clamped)
        );
        return;
      }
    } catch {
      /* If storage is blocked, keep the default saturation for this view. */
    }
    document.documentElement.style.setProperty(
      "--asm-media-tint",
      String(THEME_MEDIA_TINT_DEFAULT)
    );

    try {
      const stored = window.localStorage.getItem(SECTION_CONTRAST_KEY) === "on";
      setSectionContrast(stored);
      if (stored) {
        document.documentElement.dataset.sectionContrast = "on";
      } else {
        delete document.documentElement.dataset.sectionContrast;
      }
    } catch {
      /* Keep default (off) when storage is unavailable. */
    }
  }, []);

  function choose(id: string) {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* Private mode or a blocked store: the switch still works for this
         page view, it just will not survive a reload. */
    }
  }

  function chooseMediaTint(value: number) {
    const clamped = Math.min(
      THEME_MEDIA_TINT_MAX,
      Math.max(THEME_MEDIA_TINT_MIN, value)
    );
    setMediaTint(clamped);
    document.documentElement.style.setProperty("--asm-media-tint", String(clamped));
    try {
      window.localStorage.setItem(THEME_MEDIA_TINT_KEY, String(clamped));
    } catch {
      /* Same as theme selection: live change still works without persistence. */
    }
  }

  function toggleSectionContrast() {
    setSectionContrast((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.dataset.sectionContrast = "on";
      } else {
        delete document.documentElement.dataset.sectionContrast;
      }
      try {
        window.localStorage.setItem(SECTION_CONTRAST_KEY, next ? "on" : "off");
      } catch {
        /* Live toggle still works without persistence. */
      }
      return next;
    });
  }

  const current =
    THEME_SCHEMES.find((scheme) => scheme.id === theme) ?? THEME_SCHEMES[0];

  if (!open) {
    return (
      <div className="asm-lab">
        <button
          type="button"
          className="asm-lab-open"
          onClick={() => setOpen(true)}
        >
          <span
            className="asm-lab-dot"
            style={{ background: current.swatch[1] }}
            aria-hidden="true"
          />
          Theme · {current.label}
        </button>
      </div>
    );
  }

  return (
    <div className="asm-lab">
      <div className="asm-lab-panel" role="group" aria-label="Colour scheme">
        <span className="asm-lab-head" title={current.note}>
          Dev · scheme
        </span>

        <div className="asm-lab-list">
          {THEME_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              className="asm-lab-swatch"
              aria-pressed={scheme.id === theme}
              title={scheme.note}
              onClick={() => choose(scheme.id)}
            >
              <span className="asm-lab-chips" aria-hidden="true">
                {scheme.swatch.map((colour) => (
                  <i key={colour} style={{ background: colour }} />
                ))}
              </span>
              <span className="asm-lab-name">{scheme.label}</span>
            </button>
          ))}
        </div>

        <label className="asm-lab-sat">
          <span>Tint {Math.round(mediaTint * 100)}%</span>
          <input
            type="range"
            min={THEME_MEDIA_TINT_MIN}
            max={THEME_MEDIA_TINT_MAX}
            step={0.05}
            value={mediaTint}
            onChange={(event) => chooseMediaTint(Number(event.target.value))}
            aria-label="Media tint strength"
          />
        </label>

        <button
          type="button"
          className="asm-lab-toggle"
          aria-pressed={sectionContrast}
          onClick={toggleSectionContrast}
        >
          Sections {sectionContrast ? "On" : "Off"}
        </button>

        <button
          type="button"
          className="asm-lab-close"
          onClick={() => setOpen(false)}
          aria-label="Hide the scheme switcher"
        >
          ×
        </button>
      </div>
    </div>
  );
}
