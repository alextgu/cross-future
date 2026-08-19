/**
 * The state a block renders when its collection is empty.
 *
 * Every collection here is genuinely incomplete right now — the roster is
 * still being confirmed, most partner logos have not been supplied, the
 * photographic archive of this edition does not exist because the edition has
 * not happened. A grid that silently renders nothing reads as a broken page;
 * this says which thing is missing and, where there is one, where to go
 * instead. It is one hairline card, not an illustration.
 */
export default function AsmEmpty({
  label,
  note,
  children,
}: {
  /** What is missing, in the block's own words. */
  label: string;
  /** One line on why, or when it lands. */
  note: string;
  /** Optional action — a link that works today. */
  children?: React.ReactNode;
}) {
  return (
    <div className="asm-empty asm-card is-padded t-outline">
      <p className="asm-eyebrow">{label}</p>
      <p className="asm-body">{note}</p>
      {children ? <div className="asm-empty-action">{children}</div> : null}
    </div>
  );
}
