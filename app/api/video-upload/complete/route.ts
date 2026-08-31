import { getSession, hasDurableVideoUploadStore, saveSession } from "../state";
import { isStudioRequestAuthenticated } from "../route";

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

function statusOf(result: any): "queued" | "processing" | "ready" | "failed" {
  const stateValue = typeof result?.status === "string" ? result.status : result?.status?.state;
  const state = typeof stateValue === "string" ? stateValue.toLowerCase() : "";
  if (result?.readyToStream === true || state === "ready") return "ready";
  if (["error", "failed", "failure"].includes(state) || result?.status?.errorReasonCode || result?.status?.errorReasonText) return "failed";
  if (["queued", "pending", "uploading"].includes(state)) return "queued";
  return "processing";
}

export async function POST(request: Request): Promise<Response> {
  if (!isStudioRequestAuthenticated(request)) return jsonError("Unauthorized", 401);
  if (process.env.NODE_ENV === "production" && !hasDurableVideoUploadStore()) return jsonError("Durable video upload state is not configured", 503);
  const body = await bodyOf(request);
  const uploadId = typeof body?.uploadId === "string" ? body.uploadId.trim() : "";
  if (!uploadId) return jsonError("uploadId is required", 400);
  const session = await getSession(uploadId);
  if (!session) return jsonError("Upload session not found", 404);

  const idempotencyKey = (request.headers.get("idempotency-key") ?? (typeof body?.idempotencyKey === "string" ? body.idempotencyKey : "")).trim();
  if (idempotencyKey && session.completionResponses.has(idempotencyKey)) {
    return Response.json(session.completionResponses.get(idempotencyKey));
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !apiToken) return jsonError("Video upload is not configured", 500);
  let providerResponse: Response;
  try {
    providerResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/stream/${encodeURIComponent(session.streamUid)}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
  } catch {
    return jsonError("Unable to read video processing status", 502);
  }
  let providerBody: any;
  try {
    providerBody = await providerResponse.json();
  } catch {
    providerBody = null;
  }
  if (!providerResponse.ok || providerBody?.success !== true || !providerBody?.result) return jsonError("Unable to read video processing status", 502);

  const result = providerBody.result;
  const status = statusOf(result);
  session.status = status;
  const responseBody: Record<string, unknown> = {
    uploadId,
    streamUid: session.streamUid,
    status,
    metadata: {
      durationSeconds: typeof result.duration === "number" ? result.duration : undefined,
      posterUrl: typeof result.thumbnail === "string" ? result.thumbnail : undefined,
      width: typeof result.input?.width === "number" ? result.input.width : undefined,
      height: typeof result.input?.height === "number" ? result.input.height : undefined,
    },
  };
  if (idempotencyKey) session.completionResponses.set(idempotencyKey, responseBody);
  await saveSession(session);
  return Response.json(responseBody);
}

export { statusOf };
