export function getHorizontalScrollTarget(
  scrollLeft: number,
  scrollWidth: number,
  clientWidth: number,
  direction: -1 | 1
) {
  const page = clientWidth;
  if (page <= 0) return scrollLeft;

  const maxScroll = Math.max(0, scrollWidth - page);
  const pageIndex = Math.ceil((scrollLeft + 1) / page) - 1;
  return Math.max(0, Math.min(maxScroll, (pageIndex + direction) * page));
}

export function scrollHorizontalPage(
  node: HTMLElement,
  direction: -1 | 1
) {
  const target = getHorizontalScrollTarget(
    node.scrollLeft,
    node.scrollWidth,
    node.clientWidth,
    direction
  );

  node.scrollTo({ left: target, behavior: "smooth" });
}
