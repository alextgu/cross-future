import { notFound } from "next/navigation";

/**
 * Catch-all so any unmatched URL under /assembly renders the Assembly 404
 * inside the Assembly shell, rather than falling through to the app-wide
 * default and dropping the visitor out of the design.
 */
export default function AssemblyCatchAll() {
  notFound();
}
