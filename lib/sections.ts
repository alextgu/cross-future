/** Summit-as-school numbering, shared by nav, section marks and footer. */
export const SECTIONS = [
  { num: "01", label: "Manifesto", id: "manifesto" },
  { num: "02", label: "Curriculum", id: "curriculum" },
  { num: "03", label: "Faculty", id: "faculty" },
  { num: "04", label: "Register", id: "register" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export function sectionNum(id: SectionId): string {
  const found = SECTIONS.find((s) => s.id === id);
  return found ? found.num : "";
}
