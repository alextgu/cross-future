"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scrollHorizontalPage } from "@/lib/scroll-horizontal-page";

export function useHorizontalRailScroll() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const update = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setCanScrollBack(node.scrollLeft > 4);
    setCanScrollForward(node.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  const scroll = useCallback((direction: -1 | 1) => {
    const node = ref.current;
    if (!node) return;
    scrollHorizontalPage(node, direction);
  }, []);

  return { ref, scroll, canScrollBack, canScrollForward };
}
