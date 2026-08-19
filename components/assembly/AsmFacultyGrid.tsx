import type { FacultyMember } from "@/lib/content";
import AsmPersonCard from "./AsmPersonCard";
import AsmEmpty from "./AsmEmpty";

/**
 * The faculty in two shapes.
 *
 * `grid` is the roster page: portraits at reading size, wrapped in rows.
 * `strip` is every other page: one row, roughly eight portraits across a
 * desktop screen, the rest reached by scrolling sideways. The roster is
 * dozens of people — as a wrapped grid it buried everything below it, and a
 * section nobody can see past is worse than a section that admits it is a
 * sample.
 *
 * The strip is a focusable region with an accessible name, so it can be
 * reached and scrolled from the keyboard, not only by dragging.
 */
export default function AsmFacultyGrid({
  members,
  columns = 3,
  aspect,
  layout = "grid",
}: {
  members: FacultyMember[];
  columns?: number;
  aspect?: string;
  layout?: "grid" | "strip";
}) {
  if (members.length === 0) {
    return (
      <AsmEmpty
        label="Roster in progress"
        note="Speakers appear here as each one confirms. Nobody is listed before they have agreed to the date."
      />
    );
  }

  if (layout === "strip") {
    return (
      <div
        className="asm-facultystrip"
        tabIndex={0}
        role="group"
        aria-label={`${members.length} confirmed speakers — scroll sideways for more`}
      >
        {members.map((member) => (
          <AsmPersonCard
            key={member.person.slug}
            member={member}
            aspect={aspect ?? "3 / 4"}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="asm-row"
      style={{ ["--cols" as string]: columns, ["--cols-md" as string]: 2 }}
    >
      {members.map((member) => (
        <AsmPersonCard key={member.person.slug} member={member} aspect={aspect} />
      ))}
    </div>
  );
}
