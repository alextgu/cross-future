export type VideoUploadStatus = "queued" | "processing" | "ready" | "failed";

export interface VideoUploadSession {
  uploadId: string;
  streamUid: string;
  uploadUrl: string;
  filename: string;
  size: number;
  mimeType: string;
  expiresAt: string;
  status: VideoUploadStatus;
  completionResponses: Map<string, Record<string, unknown>>;
}

const sessions = new Map<string, VideoUploadSession>();
const idempotentSessions = new Map<string, Record<string, unknown>>();

interface KvLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

function durableStore(): KvLike | null {
  const value = (globalThis as Record<string, unknown>).VIDEO_UPLOAD_KV;
  return value && typeof (value as KvLike).get === "function" && typeof (value as KvLike).put === "function"
    ? value as KvLike
    : null;
}

/** Durable-compatible seam: Cloudflare deployments may provide a KV binding;
 * local tests intentionally use the deterministic in-memory fallback. */
export function hasDurableVideoUploadStore(): boolean {
  return durableStore() !== null;
}

export async function getSession(uploadId: string): Promise<VideoUploadSession | undefined> {
  const kv = durableStore();
  if (!kv) return sessions.get(uploadId);
  const raw = await kv.get(`video-upload:session:${uploadId}`);
  if (!raw) return undefined;
  const parsed = JSON.parse(raw) as Omit<VideoUploadSession, "completionResponses"> & { completionResponses?: Record<string, Record<string, unknown>> };
  return { ...parsed, completionResponses: new Map(Object.entries(parsed.completionResponses ?? {})) };
}

export async function getIdempotentSession(key: string): Promise<Record<string, unknown> | undefined> {
  const kv = durableStore();
  if (!kv) return idempotentSessions.get(key);
  const raw = await kv.get(`video-upload:idempotency:${key}`);
  return raw ? JSON.parse(raw) as Record<string, unknown> : undefined;
}

export async function saveSession(session: VideoUploadSession, idempotencyKey?: string, response?: Record<string, unknown>): Promise<void> {
  const kv = durableStore();
  if (kv) {
    await kv.put(`video-upload:session:${session.uploadId}`, JSON.stringify({ ...session, completionResponses: Object.fromEntries(session.completionResponses) }), { expirationTtl: 3600 });
    if (idempotencyKey && response) await kv.put(`video-upload:idempotency:${idempotencyKey}`, JSON.stringify(response), { expirationTtl: 3600 });
    return;
  }
  sessions.set(session.uploadId, session);
  if (idempotencyKey && response) idempotentSessions.set(idempotencyKey, response);
}

export function clearVideoUploadState(): void {
  sessions.clear();
  idempotentSessions.clear();
}
