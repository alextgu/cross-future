/**
 * Horizontally scrolling strip of the summit's own vocabulary.
 * The list is rendered twice so the translate(-50%) loop is seamless; the
 * duplicate is aria-hidden so a screen reader hears each phrase once.
 * The animation stops entirely under prefers-reduced-motion (see CSS).
 */
export default function AsmMarquee({
  items,
  tone = "deep",
}: {
  items: string[];
  tone?: "deep" | "tint" | "mist" | "accent" | "plain";
}) {
  const line = (hidden: boolean) => (
    <span aria-hidden={hidden ? "true" : undefined}>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </span>
  );

  return (
    <div className={`asm-card t-${tone} asm-marquee`}>
      <div className="asm-marquee-track">
        {line(false)}
        {line(true)}
      </div>
    </div>
  );
}
