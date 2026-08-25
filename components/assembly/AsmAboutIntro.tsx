"use client";

import type { MouseEvent } from "react";

const EVENT_MOMENTS = [
  {
    src: "/summit/media/hero-poster.jpg",
    alt: "Audience members gathered in front of the Cross Future stage",
    className: "is-primary",
  },
  {
    src: "/summit/media/rail-interviews.jpg",
    alt: "Two Cross Future guests discussing AI on stage",
    className: "is-dialogue",
  },
  {
    src: "/summit/media/intro-media.jpg",
    alt: "A Cross Future guest sharing her perspective in an interview",
    className: "is-perspective",
  },
] as const;

export default function AsmAboutIntro() {
  function moveGlow(event: MouseEvent<HTMLDivElement>) {
    const intro = event.currentTarget;
    const bounds = intro.getBoundingClientRect();

    intro.dataset.glowActive = "true";
    intro.style.setProperty("--asm-glow-x", `${event.clientX}px`);
    intro.style.setProperty(
      "--asm-glow-y",
      `${event.clientY - bounds.top}px`
    );
  }

  function clearGlow(event: MouseEvent<HTMLDivElement>) {
    delete event.currentTarget.dataset.glowActive;
  }

  return (
    <div
      className="asm-about-intro"
      onMouseMove={moveGlow}
      onMouseLeave={clearGlow}
    >
      <div className="asm-about-copy">
        <p className="asm-about-kicker">Cross Future / AI Forum</p>
        <h2 className="asm-about-title">
          Where <span>AI ideas</span> become shared momentum.
        </h2>
        <p className="asm-about-lead">
          Cross Future connects professors, researchers and industry builders
          through recurring AI events built for useful exchange and lasting
          collaboration.
        </p>
      </div>

      <div className="asm-about-collage" aria-label="Cross Future event moments">
        {EVENT_MOMENTS.map((moment) => (
          <figure
            className={`asm-about-moment ${moment.className}`}
            key={moment.src}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={moment.src}
              alt={moment.alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
