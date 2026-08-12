import type { JournalPost } from "@/lib/content";
import AsmMedia from "./AsmMedia";
import AsmReveal from "./AsmReveal";

/** Field notes — editorial cards drawn from the summit's own material. */
export default function AsmJournal({ posts }: { posts: JournalPost[] }) {
  return (
    <div className="asm-row" style={{ ["--cols" as string]: posts.length }}>
      {posts.map((post, i) => (
        <AsmReveal
          key={post.slug}
          as="article"
          delay={i * 70}
          className="asm-card t-plain"
        >
          <AsmMedia media={post.media} aspect="3 / 2" />
          <div
            style={{ padding: "var(--asm-pad-tight)", display: "grid", gap: 12 }}
          >
            <p className="asm-meta">
              <time dateTime={post.date}>
                {new Intl.DateTimeFormat("en-CA", {
                  dateStyle: "medium",
                }).format(new Date(post.date))}
              </time>
              {" · "}
              {post.readMin} min read
            </p>
            <h3 className="asm-d3" style={{ fontSize: "1.3rem" }}>
              {post.title}
            </h3>
            <p className="asm-body" style={{ fontSize: "0.92rem" }}>
              {post.excerpt}
            </p>
          </div>
        </AsmReveal>
      ))}
    </div>
  );
}
