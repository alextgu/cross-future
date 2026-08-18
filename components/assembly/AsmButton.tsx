import Link from "next/link";
import React from "react";

export type AsmButtonTone = "accent" | "ghost" | "inverse";

/**
 * One pill, three tones. Internal hrefs go through next/link, external ones
 * get rel="noreferrer" without the call site having to remember.
 */
export default function AsmButton({
  children,
  href,
  tone = "accent",
  block = false,
  arrow = true,
  type,
  disabled,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  tone?: AsmButtonTone;
  block?: boolean;
  arrow?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const classes = [
    "asm-btn",
    tone === "ghost" ? "is-ghost" : "",
    tone === "inverse" ? "is-inverse" : "",
    block ? "is-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span>{children}</span>
      {arrow ? (
        <span className="arrow" aria-hidden="true">
          ↗
        </span>
      ) : null}
    </>
  );

  if (href) {
    const external = /^https?:\/\//.test(href) || href.startsWith("mailto:");
    if (external) {
      return (
        <a
          className={classes}
          href={href}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noreferrer"
        >
          {inner}
        </a>
      );
    }
    return (
      <Link className={classes} href={href}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}
