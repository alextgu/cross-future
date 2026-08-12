import type { RailContent } from "@/lib/content";
import AsmRail from "./AsmRail";

/**
 * Two-column page body: the main card stack, plus the sticky rail.
 * Every page renders through this, so the rail placement and gutter rhythm
 * cannot drift between routes.
 */
export default function AsmShell({
  children,
  rail,
}: {
  children: React.ReactNode;
  rail: RailContent;
}) {
  return (
    <div className="asm-shell">
      <main className="asm-main" id="main">
        {children}
      </main>
      <AsmRail rail={rail} />
    </div>
  );
}
