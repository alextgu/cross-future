import {
  getIdempotentSession,
  hasDurableVideoUploadStore,
  saveSession,
  type VideoUploadSession,
} from "./state";

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const SESSION_TTL_SECONDS = 30 * 60;

function configuredUploadSecrets(): string[] {
  return [
    process.env.SANITY_STUDIO_UPLOAD_TOKEN,
    process.env.SANITY_STUDIO_UPLOAD_SECRET,
    process.env.SANITY_STUDIO_API_TOKEN,
    process.env.SANITY_STUDIO_TOKEN,
    process.env.SANITY_API_WRITE_TOKEN,
  ].filter((value): value is string => Boolean(value));
}

export function isStudioRequestAuthenticated(request: Request): boolean {
  const configured = configuredUploadSecrets();
  if (configured.length === 0) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  const supplied = bearer ?? request.headers.get("x-sanity-upload-token") ?? request.headers.get("x-sanity-studio-token") ?? "";
  return supplied.length > 0 && configured.includes(supplied);
}

function jsonError(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

async function bodyOf(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}

function validatedInput(body: Record<string, unknown>): { filename: string; size: number; mimeType: string } | null {
  const filenameValue = body.filename ?? body.name;
  const filename = typeof filenameValue === "string" ? filenameValue.trim() : "";
  const size = typeof body.size === "number" ? body.size : Number(body.size);
  const mimeValue = body.mimeType ?? body.mime ?? body.type;
  const mimeType = typeof mimeValue === "string" ? mimeValue.trim().toLowerCase() : "";
  if (!filename || filename.length > 255 || !Number.isSafeInteger(size) || size <= 0 || size > MAX_VIDEO_BYTES) return null;
  if (!mimeType.startsWith("video/")) return null;
  return { filename, size, mimeType };
}

export async function POST(request: Request): Promise<Response> {
  if (!isStudioRequestAuthenticated(request)) return jsonError("Unauthorized", 401);
  if (process.env.NODE_ENV === "production" && !hasDurableVideoUploadStore()) return jsonError("Durable video upload state is not configured", 503);
  const body = await bodyOf(request);
  if (!body) return jsonError("Invalid JSON payload", 400);
  const input = validatedInput(body);
  if (!input) return jsonError("A valid video filename, MIME type, and size are required", 400);

  const idempotencyKey = (request.headers.get("idempotency-key") ?? (typeof body.idempotencyKey === "string" ? body.idempotencyKey : "")).trim();
  if (idempotencyKey) {
    const prior = await getIdempotentSession(idempotencyKey);
    if (prior) return Response.json(prior, { status: 200 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !apiToken) return jsonError("Video upload is not configured", 500);

  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  let providerResponse: Response;
  try {
    providerResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/stream/direct_upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ expiry: expiresAt, maxDurationSeconds: 3600, meta: { name: input.filename } }),
    });
  } catch {
    return jsonError("Unable to create video upload session", 502);
  }
  let providerBody: any;
  try {
    providerBody = await providerResponse.json();
  } catch {
    providerBody = null;
  }
  const result = providerBody?.result;
  if (!providerResponse.ok || providerBody?.success !== true || typeof result?.uid !== "string" || typeof result?.uploadURL !== "string") {
    return jsonError("Unable to create video upload session", 502);
  }

  const session: VideoUploadSession = {
    uploadId: crypto.randomUUID(),
    streamUid: result.uid,
    uploadUrl: result.uploadURL,
    ...input,
    expiresAt,
    status: "queued",
    completionResponses: new Map(),
  };
  const responseBody = {
    uploadId: session.uploadId,
    streamUid: session.streamUid,
    uploadUrl: session.uploadUrl,
    uploadURL: session.uploadUrl,
    expiresAt: session.expiresAt,
    status: session.status,
  };
  await saveSession(session, idempotencyKey, responseBody);
  return Response.json(responseBody, { status: 201 });
}

export { MAX_VIDEO_BYTES };
