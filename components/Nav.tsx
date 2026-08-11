import { SECTIONS } from "@/lib/sections";

export default function Nav() {
  return (
    <nav className="nav" aria-label="Primary">
      <div className="container nav-inner">
        <a className="nav-wordmark" href="#top">
          Cross Future <em>AI Summit</em>
        </a>
        <div className="nav-links">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              <span className="num" aria-hidden="true">
                {s.num}
              </span>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
