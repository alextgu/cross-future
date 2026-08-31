import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as createUpload } from "../app/api/video-upload/route";
import { POST as completeUpload } from "../app/api/video-upload/complete/route";

const auth = { Authorization: "Bearer studio-secret", "Content-Type": "application/json" };

function request(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { ...auth, ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv("SANITY_STUDIO_UPLOAD_SECRET", "studio-secret");
  vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "account");
  vi.stubEnv("CLOUDFLARE_STREAM_API_TOKEN", "stream-secret");
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/video-upload", () => {
  it("rejects requests without Studio authentication", async () => {
    const response = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { Authorization: "" }));
    expect(response.status).toBe(401);
  });

  it("rejects non-video MIME types and oversized files", async () => {
    const badMime = await createUpload(request("/api/video-upload", { filename: "clip.txt", size: 100, mimeType: "text/plain" }));
    expect(badMime.status).toBe(400);
    const tooLarge = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 6_000_000_001, mimeType: "video/mp4" }));
    expect(tooLarge.status).toBe(400);
    const overBasicLimit = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 201 * 1024 * 1024, mimeType: "video/mp4" }));
    expect(overBasicLimit.status).toBe(400);
  });

  it("reports missing Stream configuration without calling the provider", async () => {
    vi.stubEnv("CLOUDFLARE_STREAM_API_TOKEN", "");
    const response = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }));
    expect(response.status).toBe(500);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates a scoped direct-upload session without returning the long-lived token", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-123", uploadURL: "https://upload.example/session" } }), { status: 200 }));
    const response = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "retry-1" }));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body).toMatchObject({ uploadId: expect.any(String), streamUid: "stream-uid-123", uploadUrl: "https://upload.example/session" });
    expect(JSON.stringify(body)).not.toContain("stream-secret");
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("/stream/direct_upload");
    expect((vi.mocked(fetch).mock.calls[0][1] as RequestInit).headers).toMatchObject({ Authorization: "Bearer stream-secret" });
  });

  it("returns the same session for a duplicate idempotency key", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-456", uploadURL: "https://upload.example/session-2" } }), { status: 200 }));
    const first = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "same" }));
    const second = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "same" }));
    expect(await first.json()).toEqual(await second.json());
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("uses a durable KV-compatible store when the binding is present", async () => {
    const values = new Map<string, string>();
    vi.stubGlobal("VIDEO_UPLOAD_KV", {
      get: async (key: string) => values.get(key) ?? null,
      put: async (key: string, value: string) => { values.set(key, value); },
    });
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true, result: { uid: "stream-kv", uploadURL: "https://upload.example/kv" } }), { status: 200 }));
    const first = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "kv-key" }));
    const second = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "kv-key" }));
    expect(await first.json()).toEqual(await second.json());
    expect([...values.keys()].some((key) => key.includes("idempotency"))).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("resolves the KV binding from the OpenNext Cloudflare runtime context in production", async () => {
    const values = new Map<string, string>();
    const binding = {
      get: async (key: string) => values.get(key) ?? null,
      put: async (key: string, value: string) => { values.set(key, value); },
    };
    const contextSymbol = Symbol.for("__cloudflare-context__");
    Object.defineProperty(globalThis, contextSymbol, { configurable: true, writable: true, value: { env: { VIDEO_UPLOAD_KV: binding } } });
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true, result: { uid: "stream-context", uploadURL: "https://upload.example/context" } }), { status: 200 }));
    try {
      const first = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "context-key" }));
      const second = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "context-key" }));
      expect(first.status).toBe(201);
      expect(await first.json()).toEqual(await second.json());
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally {
      delete (globalThis as Record<PropertyKey, unknown>)[contextSymbol];
    }
  });

  it("accepts the common MIME alias used by browser clients", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-alias", uploadURL: "https://upload.example/session-alias" } }), { status: 200 }));
    const response = await createUpload(request("/api/video-upload", { name: "clip.mp4", size: 100, type: "video/mp4" }));
    expect(response.status).toBe(201);
  });
});

describe("POST /api/video-upload/complete", () => {
  it("returns explicit processing states and metadata", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-789", uploadURL: "https://upload.example/session" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-789", readyToStream: false, status: { state: "inprogress" }, duration: 42 } }), { status: 200 }));
    const created = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "complete-1" }));
    const { uploadId } = await created.json();
    const response = await completeUpload(request("/api/video-upload/complete", { uploadId }, { "Idempotency-Key": "poll-1" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ uploadId, streamUid: "stream-uid-789", status: "processing", metadata: { durationSeconds: 42 } });
  });

  it("maps a provider string status of ready to the explicit ready state", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-string", uploadURL: "https://upload.example/session" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-string", status: "ready" } }), { status: 200 }));
    const created = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "complete-string" }));
    const { uploadId } = await created.json();
    const response = await completeUpload(request("/api/video-upload/complete", { uploadId }));
    expect((await response.json()).status).toBe("ready");
  });

  it("does not poll Stream twice for a duplicate completion retry", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-999", uploadURL: "https://upload.example/session" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, result: { uid: "stream-uid-999", readyToStream: true, status: { state: "ready" }, thumbnail: "https://img.example/poster.jpg" } }), { status: 200 }));
    const created = await createUpload(request("/api/video-upload", { filename: "clip.mp4", size: 100, mimeType: "video/mp4" }, { "Idempotency-Key": "complete-2" }));
    const { uploadId } = await created.json();
    const first = await completeUpload(request("/api/video-upload/complete", { uploadId }, { "Idempotency-Key": "poll-same" }));
    const second = await completeUpload(request("/api/video-upload/complete", { uploadId }, { "Idempotency-Key": "poll-same" }));
    expect(await first.json()).toEqual(await second.json());
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
