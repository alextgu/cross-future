import type { FacultyMember } from "@/lib/content";
import AsmPersonCard from "./AsmPersonCard";
import AsmReveal from "./AsmReveal";

/**
 * Grid of portrait cards. Used by the home page preview (6) and the speakers
 * page (the full roster, grouped), so the card treatment is identical in both
 * places without either owning it.
 */
export default function AsmFacultyGrid({
  members,
  columns = 3,
  aspect,
}: {
  members: FacultyMember[];
  columns?: number;
  aspect?: string;
}) {
  return (
    <div
      className="asm-row"
      style={{ ["--cols" as string]: columns, ["--cols-md" as string]: 2 }}
    >
      {members.map((member, i) => (
        <AsmReveal key={member.person.slug} delay={(i % columns) * 60}>
          <AsmPersonCard member={member} aspect={aspect} />
        </AsmReveal>
      ))}
    </div>
  );
}
