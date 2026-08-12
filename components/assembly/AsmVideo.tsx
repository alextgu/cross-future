"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaAsset } from "@/lib/content";

/**
 * Background clips autoplay muted and looped — except under
 * prefers-reduced-motion, where CSS cannot help because autoplay is a media
 * attribute, not an animation. There we hold the poster frame and offer an
 * explicit play control, so the motion is available but never imposed.
 */
export default function AsmVideo({
  media,
  className,
  style,
  caption,
}: {
  media: MediaAsset;
  className: string;
  style: React.CSSProperties;
  caption: React.ReactNode;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      if (query.matches) {
        video.pause();
        video.removeAttribute("autoplay");
        setHeld(true);
      } else {
        setHeld(false);
        void video.play().catch(() => {
          /* Autoplay can still be refused by the browser; the poster stands in. */
        });
      }
    };

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <figure
      className={className}
      style={style}
      data-placeholder={media.placeholder ? "true" : undefined}
    >
      <video
        ref={ref}
        poster={media.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={media.alt}
      >
        <source src={media.src} />
      </video>
      {held ? (
        <button
          type="button"
          className="asm-videoplay"
          onClick={() => {
            setHeld(false);
            void ref.current?.play();
          }}
        >
          <span aria-hidden="true">▶</span>
          <span className="asm-sr">Play the background clip</span>
        </button>
      ) : null}
      {caption}
    </figure>
  );
}
