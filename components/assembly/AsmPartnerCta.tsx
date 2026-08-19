import AsmButton from "./AsmButton";

export default function AsmPartnerCta() {
  return (
    <aside className="asm-partner-cta" aria-label="Become a partner">
      <h3 className="asm-d2">Become our partner</h3>
      <p className="asm-lede">
        Put your team in front of builders, researchers, and decision-makers in
        one focused room.
      </p>

      <AsmButton href="#contact" tone="accent" className="is-large">
        Become a partner
      </AsmButton>
    </aside>
  );
}
