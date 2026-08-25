export type AsmStatsBridgeItem = {
  value: string;
  label: string;
};

export default function AsmStatsBridge({
  items,
}: {
  items: readonly AsmStatsBridgeItem[];
}) {
  return (
    <aside className="asm-stats-bridge" aria-label="Cross Future at a glance">
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
