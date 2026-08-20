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
import {
  REVIEW_COLLECTION_DEFAULT,
  REVIEW_COLLECTION_DEPTHS,
  REVIEW_COLLECTION_STORAGE_KEY,
  REVIEW_DENSITIES,
  REVIEW_DENSITY_DEFAULT,
  REVIEW_DENSITY_STORAGE_KEY,
  REVIEW_RADIUS_DEFAULT,
  REVIEW_RADIUS_MAX,
  REVIEW_RADIUS_MIN,
  REVIEW_RADIUS_STORAGE_KEY,
  clampReviewRadius,
  isReviewCollectionDepth,
  isReviewDensity,
  type ReviewCollectionDepth,
  type ReviewDensity,
} from "@/lib/review-settings";

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* The preview remains live when persistence is blocked. */
  }
}

export default function AsmThemeLab() {
  const [theme, setTheme] = useState(THEME_DEFAULT);
  const [mediaTint, setMediaTint] = useState(THEME_MEDIA_TINT_DEFAULT);
  const [radius, setRadius] = useState(REVIEW_RADIUS_DEFAULT);
  const [density, setDensity] = useState<ReviewDensity>(REVIEW_DENSITY_DEFAULT);
  const [collection, setCollection] = useState<ReviewCollectionDepth>(
    REVIEW_COLLECTION_DEFAULT
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isThemeId(root.dataset.theme)) setTheme(root.dataset.theme!);
    if (isReviewDensity(root.dataset.reviewDensity)) {
      setDensity(root.dataset.reviewDensity);
    }
    if (isReviewCollectionDepth(root.dataset.reviewCollection)) {
      setCollection(root.dataset.reviewCollection);
    }

    const appliedTint = Number(
      root.style.getPropertyValue("--asm-media-tint") || THEME_MEDIA_TINT_DEFAULT
    );
    if (Number.isFinite(appliedTint)) setMediaTint(appliedTint);

    const appliedRadius = Number.parseFloat(
      root.style.getPropertyValue("--asm-radius")
    );
    if (Number.isFinite(appliedRadius)) setRadius(clampReviewRadius(appliedRadius));
  }, []);

  function chooseTheme(id: string) {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    store(THEME_STORAGE_KEY, id);
  }

  function chooseMediaTint(value: number) {
    const next = Math.min(THEME_MEDIA_TINT_MAX, Math.max(THEME_MEDIA_TINT_MIN, value));
    setMediaTint(next);
    document.documentElement.style.setProperty("--asm-media-tint", String(next));
    store(THEME_MEDIA_TINT_KEY, String(next));
  }

  function chooseRadius(value: number) {
    const next = clampReviewRadius(value);
    setRadius(next);
    document.documentElement.style.setProperty("--asm-radius", `${next}px`);
    store(REVIEW_RADIUS_STORAGE_KEY, String(next));
  }

  function chooseDensity(value: ReviewDensity) {
    setDensity(value);
    document.documentElement.dataset.reviewDensity = value;
    store(REVIEW_DENSITY_STORAGE_KEY, value);
  }

  function chooseCollection(value: ReviewCollectionDepth) {
    setCollection(value);
    document.documentElement.dataset.reviewCollection = value;
    store(REVIEW_COLLECTION_STORAGE_KEY, value);
  }

  function reset() {
    chooseTheme(THEME_DEFAULT);
    chooseMediaTint(THEME_MEDIA_TINT_DEFAULT);
    chooseRadius(REVIEW_RADIUS_DEFAULT);
    chooseDensity(REVIEW_DENSITY_DEFAULT);
    chooseCollection(REVIEW_COLLECTION_DEFAULT);
  }

  const current =
    THEME_SCHEMES.find((scheme) => scheme.id === theme) ?? THEME_SCHEMES[0];

  if (!open) {
    return (
      <div className="asm-lab">
        <button className="asm-lab-open" type="button" onClick={() => setOpen(true)}>
          <span
            className="asm-lab-dot"
            style={{ background: current.swatch[1] }}
            aria-hidden="true"
          />
          Review · {current.label}
        </button>
      </div>
    );
  }

  return (
    <aside className="asm-lab" aria-label="CEO review controls">
      <div className="asm-lab-panel">
        <header className="asm-lab-header">
          <div>
            <strong>CEO review</strong>
            <span>Preview controls</span>
          </div>
          <button
            className="asm-lab-close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close review controls"
          >
            ×
          </button>
        </header>

        <section className="asm-lab-group" aria-labelledby="review-theme-label">
          <span className="asm-lab-label" id="review-theme-label">Theme</span>
          <div className="asm-lab-list">
            {THEME_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                className="asm-lab-swatch"
                type="button"
                aria-pressed={scheme.id === theme}
                title={scheme.note}
                onClick={() => chooseTheme(scheme.id)}
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
        </section>

        <label className="asm-lab-range">
          <span>Tint <b>{Math.round(mediaTint * 100)}%</b></span>
          <input
            type="range"
            min={THEME_MEDIA_TINT_MIN}
            max={THEME_MEDIA_TINT_MAX}
            step={0.05}
            value={mediaTint}
            onChange={(event) => chooseMediaTint(Number(event.target.value))}
          />
        </label>

        <label className="asm-lab-range">
          <span>Card radius <b>{radius}px</b></span>
          <input
            type="range"
            min={REVIEW_RADIUS_MIN}
            max={REVIEW_RADIUS_MAX}
            step={1}
            value={radius}
            onChange={(event) => chooseRadius(Number(event.target.value))}
          />
        </label>

        <section className="asm-lab-group" aria-labelledby="review-density-label">
          <span className="asm-lab-label" id="review-density-label">Density</span>
          <div className="asm-lab-options">
            {REVIEW_DENSITIES.map((value) => (
              <button
                type="button"
                aria-pressed={density === value}
                onClick={() => chooseDensity(value)}
                key={value}
              >
                {value}
              </button>
            ))}
          </div>
        </section>

        <section className="asm-lab-group" aria-labelledby="review-collection-label">
          <span className="asm-lab-label" id="review-collection-label">Homepage collections</span>
          <div className="asm-lab-options">
            {REVIEW_COLLECTION_DEPTHS.map((value) => (
              <button
                type="button"
                aria-pressed={collection === value}
                onClick={() => chooseCollection(value)}
                key={value}
              >
                {value}
              </button>
            ))}
          </div>
        </section>

        <button className="asm-lab-reset" type="button" onClick={reset}>
          Reset recommended view
        </button>
      </div>
    </aside>
  );
}
