import type { JournalPost } from "@/lib/content";
import AsmMedia from "./AsmMedia";
import AsmEmpty from "./AsmEmpty";

/** Field notes — editorial cards drawn from the summit's own material. */
export default function AsmJournal({ posts }: { posts: JournalPost[] }) {
  if (posts.length === 0) {
    return (
      <AsmEmpty
        label="No briefings yet"
        note="Short pieces on the problem the programme is built around publish between editions."
      />
    );
  }

  return (
    <div className="asm-row" style={{ ["--cols" as string]: posts.length }}>
      {posts.map((post, i) => (
        <article key={post.slug} className="asm-card t-plain">
          <AsmMedia media={post.media} aspect="3 / 2" />
          <div
            style={{ padding: "var(--asm-pad-tight)", display: "grid", gap: 12 }}
          >
            {post.date ? (
              <p className="asm-meta">
                <time dateTime={post.date}>
                  {new Intl.DateTimeFormat("en-CA", {
                    dateStyle: "medium",
                  }).format(new Date(post.date))}
                </time>
                {post.readMin ? ` · ${post.readMin} min read` : null}
              </p>
            ) : null}
            <h3 className="asm-d3" style={{ fontSize: "1.3rem" }}>
              {post.title}
            </h3>
            <p className="asm-body" style={{ fontSize: "0.92rem" }}>
              {post.excerpt}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
