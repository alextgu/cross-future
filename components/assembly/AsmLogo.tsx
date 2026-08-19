/**
 * The real Cross Future Hub mark, taken from the live site's own assets
 * (`/brand/*.png`, lifted from cross-future.com and trimmed to their alpha
 * bounds).
 *
 * Both files are single-colour artwork on transparency, so they are drawn as
 * a mask filled with `currentColor` rather than as an <img>. That is what lets
 * one asset sit in accent blue on the white nav, in white on the deep footer
 * card, and recolour itself when the scheme changes — with no second file and
 * no filter hacks.
 */
export function AsmMark({ className = "" }: { className?: string }) {
  return <span className={`asm-brand asm-brand-mark ${className}`.trim()} />;
}

export function AsmLockup({
  className = "",
  label = "Cross Future Hub",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={`asm-brand asm-brand-lockup ${className}`.trim()}
      role="img"
      aria-label={label}
    />
  );
}
