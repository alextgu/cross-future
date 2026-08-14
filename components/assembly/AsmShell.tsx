import type { RailContent } from "@/lib/content";
import AsmRail from "./AsmRail";

/**
 * Two-column page body: the main card stack, plus the sticky rail.
 * Every page renders through this, so the rail placement and gutter rhythm
 * cannot drift between routes.
 *
 * `rail` is optional because the home hero carries the agenda and ticket cards
 * itself — running the rail there too would put the same two calls to action
 * on screen twice above the fold. Omit it and the body goes full width.
 */
export default function AsmShell({
  children,
  rail,
}: {
  children: React.ReactNode;
  rail?: RailContent;
}) {
  return (
    <div className={rail ? "asm-shell" : "asm-shell is-full"}>
      <main className="asm-main" id="main">
        {children}
      </main>
      {rail ? <AsmRail rail={rail} /> : null}
    </div>
  );
}
