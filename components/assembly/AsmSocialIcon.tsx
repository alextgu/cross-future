import type { ReactNode } from "react";

type SocialKind =
  | "linkedin"
  | "x"
  | "instagram"
  | "youtube"
  | "facebook"
  | "github"
  | "website"
  | "link";

function socialKind(label: string, url: string): SocialKind {
  const key = `${label} ${url}`.toLowerCase();

  if (key.includes("linkedin")) return "linkedin";
  if (key.includes("twitter") || key.includes("x.com")) return "x";
  if (key.includes("instagram")) return "instagram";
  if (key.includes("youtube")) return "youtube";
  if (key.includes("facebook")) return "facebook";
  if (key.includes("github")) return "github";
  if (key.includes("website") || key.includes("cross-future.com")) return "website";

  return "link";
}

const ICONS: Record<SocialKind, ReactNode> = {
  linkedin: (
    <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.27h4.56V23.5H.22V8.27zm7.26 0h4.37v2.08h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 7V23.5h-4.56v-6.47c0-1.54-.03-3.52-2.14-3.52-2.14 0-2.47 1.67-2.47 3.4v6.59H7.48V8.27z" />
  ),
  x: (
    <path d="M13.67 10.55 21.58 2h-1.87l-6.87 7.93L7.6 2H1l8.3 12.09L1 22h1.87l7.25-8.38L15.4 22H22l-8.33-11.45Zm-2.58 2.98 -.84-1.2L4.16 3.64h2.88l5.4 7.72.84 1.2 7.02 10.04h-2.88l-5.73-8.17Z" />
  ),
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </>
  ),
  youtube: (
    <path d="M21.58 7.2a2.75 2.75 0 0 0-1.94-1.95C18.04 5 12 5 12 5s-6.04 0-7.64.25A2.75 2.75 0 0 0 2.42 7.2 28.9 28.9 0 0 0 2.17 12a28.9 28.9 0 0 0 .25 4.8 2.75 2.75 0 0 0 1.94 1.95C5.96 19 12 19 12 19s6.04 0 7.64-.25a2.75 2.75 0 0 0 1.94-1.95 28.9 28.9 0 0 0 .25-4.8 28.9 28.9 0 0 0-.25-4.8ZM10 15.27V8.73L15.82 12 10 15.27Z" />
  ),
  facebook: (
    <path d="M14 2.04c2.67 0 3.07.01 4.2.06 1.01.05 1.56.23 1.93.38.49.19.84.42 1.21.79.37.37.6.72.79 1.21.15.37.33.92.38 1.93.05 1.13.06 1.53.06 4.2v2.66c0 2.67-.01 3.07-.06 4.2-.05 1.01-.23 1.56-.38 1.93-.19.49-.42.84-.79 1.21-.37.37-.72.6-1.21.79-.37.15-.92.33-1.93.38-1.13.05-1.53.06-4.2.06h-2.66c-2.67 0-3.07-.01-4.2-.06-1.01-.05-1.56-.23-1.93-.38a3.28 3.28 0 0 1-1.21-.79 3.28 3.28 0 0 1-.79-1.21c-.15-.37-.33-.92-.38-1.93-.05-1.13-.06-1.53-.06-4.2V9.57c0-2.67.01-3.07.06-4.2.05-1.01.23-1.56.38-1.93.19-.49.42-.84.79-1.21.37-.37.72-.6 1.21-.79.37-.15.92-.33 1.93-.38 1.13-.05 1.53-.06 4.2-.06h2.66ZM12 7.1a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8Zm0 8.08a3.18 3.18 0 1 1 0-6.36 3.18 3.18 0 0 1 0 6.36Zm5.04-8.28a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z" />
  ),
  github: (
    <path d="M12 .5C5.65.5.58 5.45.58 11.78c0 4.98 3.22 9.2 7.68 10.69.56.1.77-.24.77-.54 0-.27-.01-1.18-.02-2.14-3.13.68-3.79-1.34-3.79-1.34-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .72 1.63.92 2.03.75.06-.58.39-.92.71-1.13-2.5-.28-5.12-1.24-5.12-5.53 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.11 1.15.9-.25 1.87-.38 2.83-.38.96 0 1.93.13 2.83.38 2.16-1.45 3.11-1.15 3.11-1.15.61 1.54.23 2.68.11 2.96.72.78 1.16 1.78 1.16 3 0 4.3-2.63 5.24-5.14 5.52.4.34.76 1.02.76 2.05 0 1.48-.01 2.68-.01 3.04 0 .3.2.65.78.54 4.45-1.5 7.66-5.71 7.66-10.69C23.42 5.45 18.35.5 12 .5Z" />
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12h18M12 3c2.5 2.8 3.8 6.2 3.8 9s-1.3 6.2-3.8 9M12 3c-2.5 2.8-3.8 6.2-3.8 9s1.3 6.2 3.8 9" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5 13.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.7 15.3 6.9 17.1a2.5 2.5 0 0 1-3.5-3.5l1.8-1.8M15.3 8.7l1.8-1.8a2.5 2.5 0 0 1 3.5 3.5l-1.8 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
};

export default function AsmSocialIcon({
  label,
  url,
  className = "",
}: {
  label: string;
  url: string;
  className?: string;
}) {
  const kind = socialKind(label, url);
  const strokeOnly = kind === "instagram" || kind === "website" || kind === "link";

  return (
    <svg
      className={`asm-social-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill={strokeOnly ? "none" : "currentColor"}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[kind]}
    </svg>
  );
}
