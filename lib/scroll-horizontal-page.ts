export function scrollHorizontalPage(
  node: HTMLElement,
  direction: -1 | 1
) {
  const page = node.clientWidth;
  if (page <= 0) return;

  const target =
    direction === 1
      ? Math.min(
          node.scrollWidth - page,
          Math.ceil((node.scrollLeft + 1) / page) * page
        )
      : Math.max(0, Math.floor((node.scrollLeft - 1) / page) * page);

  node.scrollTo({ left: target, behavior: "smooth" });
}
