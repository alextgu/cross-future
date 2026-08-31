import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/** Enables preview only after a server-held secret has been presented. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");
  const expectedSecret = process.env.SANITY_PREVIEW_SECRET ?? process.env.SANITY_API_READ_TOKEN;
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const destination =
    url.searchParams.get("slug") ?? url.searchParams.get("path") ?? url.searchParams.get("redirect");
  if (!destination || !destination.startsWith("/") || destination.startsWith("//")) {
    return new Response("Missing preview path", { status: 400 });
  }

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(destination, request.url));
}
