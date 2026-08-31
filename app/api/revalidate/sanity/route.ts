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
    const binary = atob(normalized.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function currentSanitySignature(value: string | null, body: string, secret: string): Promise<boolean> {
  if (!value) return Promise.resolve(false);
  const fields = new Map(value.split(",").map((part) => part.trim().split("=", 2) as [string, string]));
  const timestamp = fields.get("t");
  const signature = fields.get("v1");
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) return Promise.resolve(false);
  const now = Math.floor(Date.now() / 1000);
  const configuredTolerance = Number(process.env.SANITY_WEBHOOK_TOLERANCE_SECONDS ?? 300);
  const tolerance = Number.isFinite(configuredTolerance)
    ? Math.min(Math.max(configuredTolerance, 0), 3600)
    : 300;
  if (Math.abs(now - Number(timestamp)) > tolerance) return Promise.resolve(false);
  const bytes = decodeSignature(signature);
  if (!bytes) return Promise.resolve(false);
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"])
    .then((key) => crypto.subtle.verify("HMAC", key, bytes as unknown as BufferSource, encoder.encode(`${timestamp}.${body}`) as unknown as BufferSource));
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
  const currentSignature = request.headers.get("sanity-webhook-signature");
  const valid = currentSignature
    ? await currentSanitySignature(currentSignature, body, secret)
    : await isValidSignature(body, request.headers.get("x-sanity-signature"), secret);
  if (!valid) {
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

  const configuredDelay = Number.parseInt(process.env.SANITY_REVALIDATE_DELAY_MS ?? "250", 10);
  const delayMs = Number.isFinite(configuredDelay) ? Math.min(Math.max(configuredDelay, 0), 10_000) : 250;
  if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));

  for (const tag of uniqueTags) revalidateTag(tag);
  for (const path of uniquePaths) revalidatePath(path);

  return Response.json({ revalidated: [...uniqueTags, ...uniquePaths] });
}
