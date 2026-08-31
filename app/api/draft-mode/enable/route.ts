import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/** Enables preview only after a server-held secret has been presented. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");
  const expectedSecret = process.env.SANITY_PREVIEW_SECRET;
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const destination =
    url.searchParams.get("slug") ?? url.searchParams.get("path") ?? url.searchParams.get("redirect");
  let destinationUrl: URL | null = null;
  let pathname = "";
  try {
    let decodedDestination = destination ?? "";
    for (let index = 0; index < 4; index += 1) {
      const next = decodeURIComponent(decodedDestination);
      if (next === decodedDestination) break;
      decodedDestination = next;
    }
    if (decodedDestination.includes("\\") || decodedDestination.startsWith("//")) {
      throw new Error("Unsafe preview destination");
    }
    destinationUrl = new URL(decodedDestination, url);
    pathname = destinationUrl.pathname;
    for (let index = 0; index < 4; index += 1) {
      const next = decodeURIComponent(pathname);
      if (next === pathname) break;
      pathname = next;
    }
  } catch {
    destinationUrl = null;
  }
  if (
    !destination ||
    !destination.startsWith("/") ||
    destination.startsWith("//") ||
    destination.includes("\\") ||
    pathname.includes("\\") ||
    pathname.startsWith("//") ||
    !destinationUrl ||
    destinationUrl.origin !== url.origin
  ) {
    return new Response("Missing preview path", { status: 400 });
  }

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(`${pathname}${destinationUrl.search}${destinationUrl.hash}`, url));
}
