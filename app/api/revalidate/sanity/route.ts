import { revalidatePath, revalidateTag } from "next/cache";

const encoder = new TextEncoder();

function decodeSignature(value: string): Uint8Array | null {
  const normalized = value.trim().replace(/^sha256[=-]/i, "");
  if (/^[0-9a-f]{64}$/i.test(normalized)) {
    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
    }
    return bytes;
  }
  try {
    const binary = atob(normalized);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function isValidSignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  const bytes = decodeSignature(signature);
  if (!bytes) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    bytes as unknown as BufferSource,
    encoder.encode(body) as unknown as BufferSource,
  );
}

function strings(value: unknown): string[] {
  if (typeof value === "string") {
    const item = value.trim();
    return item ? [item] : [];
  }
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "Revalidation is not configured" }, { status: 500 });

  const body = await request.text();
  if (!(await isValidSignature(body, request.headers.get("x-sanity-signature"), secret))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Object required");
    payload = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const tags = [...strings(payload.tags), ...strings(payload.tag)];
  const paths = [
    ...strings(payload.paths),
    ...strings(payload.path),
    ...strings(payload.routes),
    ...strings(payload.route),
  ];
  const uniqueTags = [...new Set(tags)];
  const uniquePaths = [...new Set(paths)];
  if (uniqueTags.length === 0 && uniquePaths.length === 0) {
    return Response.json({ error: "Payload must include tags or paths" }, { status: 400 });
  }

  for (const tag of uniqueTags) revalidateTag(tag);
  for (const path of uniquePaths) revalidatePath(path);

  return Response.json({ revalidated: [...uniqueTags, ...uniquePaths] });
}
