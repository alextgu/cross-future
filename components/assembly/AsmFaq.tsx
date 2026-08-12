import type { FaqItem } from "@/lib/content";

/**
 * Native <details>/<summary>. No JavaScript, keyboard-operable and
 * find-in-page-able for free — an accordion is not worth a client component.
 */
export default function AsmFaq({ items }: { items: FaqItem[] }) {
  return (
    <div className="asm-card t-plain">
      {items.map((item) => (
        <details className="asm-faq" key={item.question}>
          <summary>
            {item.question}
            <span className="sign" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="asm-faq-answer">
            <p className="asm-body">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
