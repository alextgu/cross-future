"use client";

import { useState, type KeyboardEvent } from "react";
import type { MediaAsset } from "@/lib/content";
import AsmMedia from "./AsmMedia";

export interface ProgressSlide {
  kicker: string;
  title: string;
  body: string;
  media: MediaAsset;
  metrics: { value: string; label: string }[];
}

const MOCK_PROGRESS_SLIDES: ProgressSlide[] = [
  {
    kicker: "Example 01 · Community",
    title: "A growing room for Canadian AI",
    body:
      "Illustrative copy showing how a future report could describe audience growth across editions.",
    media: {
      kind: "image",
      src: "/summit/media/hero-poster.jpg",
      alt: "Illustrative placeholder image of a Cross Future auditorium",
      placeholder: true,
      focalPoint: { x: 50, y: 52 },
    },
    metrics: [
      { value: "650*", label: "Sample attendees" },
      { value: "12*", label: "Sample countries" },
      { value: "03*", label: "Sample editions" },
    ],
  },
  {
    kicker: "Example 02 · Program",
    title: "Ideas crossing sectors",
    body:
      "Illustrative copy showing how the summit could summarize the range of voices, disciplines, and sessions in one view.",
    media: {
      kind: "image",
      src: "/summit/media/rail-interviews.jpg",
      alt: "Illustrative placeholder image of a Cross Future interview",
      placeholder: true,
      focalPoint: { x: 54, y: 48 },
    },
    metrics: [
      { value: "48*", label: "Sample speakers" },
      { value: "09*", label: "Sample fields" },
      { value: "24*", label: "Sample sessions" },
    ],
  },
  {
    kicker: "Example 03 · Momentum",
    title: "Partnerships that continue after the room",
    body:
      "Illustrative copy showing how post-event collaborations and institutional relationships could be documented here.",
    media: {
      kind: "image",
      src: "/summit/media/intro-media.jpg",
      alt: "Illustrative placeholder image of a Cross Future participant",
      placeholder: true,
      focalPoint: { x: 66, y: 48 },
    },
    metrics: [
      { value: "16*", label: "Sample partners" },
      { value: "11*", label: "Sample collaborations" },
      { value: "04*", label: "Sample cities" },
    ],
  },
];

export default function AsmProgressCarousel({
  slides = MOCK_PROGRESS_SLIDES,
}: {
  slides?: ProgressSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[activeIndex];

  if (!active) return null;

  const move = (direction: number) => {
    setActiveIndex((current) =>
      (current + direction + slides.length) % slides.length
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  return (
    <section
      className="asm-progress-carousel"
      role="region"
      aria-label="Mock accomplishments slideshow"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="asm-progress-slide">
        <div className="asm-progress-visual">
          <AsmMedia
            media={active.media}
            bleed
            duotone={false}
            sizes="(max-width: 760px) 100vw, 58vw"
          />
          <p className="asm-progress-image-label">
            Illustrative placeholder image
          </p>
        </div>

        <article className="asm-progress-copy" aria-live="polite">
          <div className="asm-progress-slide-meta">
            <p className="asm-progress-mock-label">Mock data — not factual</p>
            <p className="asm-meta">{active.kicker}</p>
          </div>
          <h3 className="asm-d2">{active.title}</h3>
          <p className="asm-body">{active.body}</p>
          <dl className="asm-progress-metrics">
            {active.metrics.map((metric) => (
              <div key={metric.label}>
                <dd className="asm-d3">{metric.value}</dd>
                <dt className="asm-meta">{metric.label}</dt>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <div className="asm-progress-controls">
        <div className="asm-progress-arrows">
          <button
            type="button"
            aria-label="Previous accomplishment"
            onClick={() => move(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Next accomplishment"
            onClick={() => move(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="asm-progress-dots" aria-label="Choose an accomplishment">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              aria-label={`Show mock accomplishment ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>

        <p className="asm-meta asm-progress-counter" role="status" aria-live="polite">
          Slide {activeIndex + 1} of {slides.length}
        </p>
      </div>
    </section>
  );
}
