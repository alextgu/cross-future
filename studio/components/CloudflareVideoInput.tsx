"use client";

import { set, type ObjectInputProps } from "sanity";
import { useEffect, useRef, useState } from "react";

type VideoStatus = "queued" | "processing" | "ready" | "failed";

export interface CloudflareVideoValue {
  streamUid?: string;
  status?: VideoStatus;
  posterUrl?: string;
  durationSeconds?: number;
  alt?: string;
  caption?: string;
  credit?: string;
  aspect?: string;
  [key: string]: unknown;
}

function statusLabel(status: VideoStatus | "uploading" | null): string {
  if (status === "uploading") return "Uploading…";
  if (status === "processing") return "Processing…";
  if (status === "ready") return "Ready";
  if (status === "failed") return "Upload failed";
  return "Queued";
}

export default function CloudflareVideoInput(
  props: ObjectInputProps<CloudflareVideoValue> & { apiOrigin?: string; authToken?: string },
) {
  const [value, setValue] = useState<CloudflareVideoValue>((props.value ?? {}) as CloudflareVideoValue);
  const [status, setStatus] = useState<VideoStatus | "uploading" | null>(value.status ?? null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const selectedFile = useRef<File | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const valueRef = useRef(value);
  const activeRequest = useRef<AbortController | null>(null);
  const operationRef = useRef(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      operationRef.current += 1;
      activeRequest.current?.abort();
    };
  }, []);
  useEffect(() => {
    const next = (props.value ?? {}) as CloudflareVideoValue;
    valueRef.current = next;
    setValue(next);
  }, [props.value]);

  const update = (patch: Partial<CloudflareVideoValue>) => {
    const next = { ...valueRef.current, ...patch };
    valueRef.current = next;
    setValue(next);
    props.onChange(set(next));
  };

  const sleepWithAbort = (delayMs: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      const aborted = new Error("Upload aborted");
      aborted.name = "AbortError";
      reject(aborted);
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, delayMs);
    function abort() {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      const aborted = new Error("Upload aborted");
      aborted.name = "AbortError";
      reject(aborted);
    }
    signal.addEventListener("abort", abort, { once: true });
  });

  const upload = async (file: File, options: { reuseIdempotency?: boolean } = {}) => {
    selectedFile.current = file;
    activeRequest.current?.abort();
    const operation = ++operationRef.current;
    const controller = new AbortController();
    activeRequest.current = controller;
    const isCurrent = () => mountedRef.current && operationRef.current === operation && !controller.signal.aborted;
    setError(null);
    setStatus("uploading");
    setProgress(5);
    const maxBytes = 200 * 1024 * 1024;
    if (!file.type.startsWith("video/") || file.size <= 0 || file.size > maxBytes) {
      if (isCurrent()) {
        setStatus("failed");
        setError("Choose a video file smaller than 200 MB.");
      }
      return;
    }
    if (!options.reuseIdempotency || !idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    try {
      const origin = props.apiOrigin ?? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VIDEO_UPLOAD_API_ORIGIN : undefined) ?? "";
      const authHeaders: Record<string, string> = props.authToken ? { Authorization: `Bearer ${props.authToken}` } : {};
      const sessionResponse = await fetch(`${origin}/api/video-upload`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey.current },
        body: JSON.stringify({ filename: file.name, size: file.size, mimeType: file.type }),
        signal: controller.signal,
      });
      if (!sessionResponse.ok) throw new Error("Unable to create upload session");
      const session = await sessionResponse.json() as { uploadId?: string; uploadUrl?: string; uploadURL?: string };
      if (!isCurrent()) return;
      if (!session.uploadId || !(session.uploadUrl ?? session.uploadURL)) throw new Error("Upload session was incomplete");
      const uploadUrl = session.uploadUrl ?? session.uploadURL!;
      setProgress(15);
      const form = new FormData();
      form.append("file", file, file.name);
      const directResponse = await fetch(uploadUrl, { method: "POST", body: form, signal: controller.signal });
      if (!directResponse.ok) throw new Error("Video transfer failed");
      if (!isCurrent()) return;
      setProgress(75);
      let completion: {
        streamUid?: string;
        status?: VideoStatus;
        metadata?: { durationSeconds?: number; posterUrl?: string };
      } | undefined;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const completionResponse = await fetch(`${origin}/api/video-upload/complete`, {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json", "Idempotency-Key": `${idempotencyKey.current}:poll:${attempt}` },
          body: JSON.stringify({ uploadId: session.uploadId }),
          signal: controller.signal,
        });
        if (!completionResponse.ok) throw new Error("Unable to read processing status");
        completion = await completionResponse.json() as typeof completion;
        if (!isCurrent()) return;
        if (completion?.status === "ready" || completion?.status === "failed") break;
        setStatus(completion?.status ?? "processing");
        await sleepWithAbort(200 * 2 ** attempt, controller.signal);
      }
      if (!isCurrent()) return;
      if (!completion) throw new Error("Unable to read processing status");
      const nextStatus = completion.status ?? "processing";
      setStatus(nextStatus);
      setProgress(nextStatus === "ready" ? 100 : 85);
      update({
        ...(completion.streamUid ? { streamUid: completion.streamUid } : {}),
        status: nextStatus,
        ...(completion.metadata?.durationSeconds !== undefined ? { durationSeconds: completion.metadata.durationSeconds } : {}),
        ...(completion.metadata?.posterUrl ? { posterUrl: completion.metadata.posterUrl } : {}),
      });
    } catch (uploadError) {
      if (!isCurrent()) return;
      setStatus("failed");
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  };

  return (
    <div aria-label="Cloudflare video upload" style={{ display: "grid", gap: 12 }}>
      <label>
        Choose video
        <input
          aria-label="Choose video"
          type="file"
          accept="video/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>
      {status && <div role="status">{statusLabel(status)}</div>}
      {status === "uploading" && <progress aria-label="Upload progress" value={progress} max={100} />}
      {value.streamUid && <div>Stream UID: <code>{value.streamUid}</code></div>}
      {error && <p role="alert">{error}</p>}
      {status === "failed" && selectedFile.current && (
        <button type="button" onClick={() => void upload(selectedFile.current!, { reuseIdempotency: true })}>Retry upload</button>
      )}
      <label>
        Poster URL
        <input value={value.posterUrl ?? ""} onChange={(event) => update({ posterUrl: event.currentTarget.value || undefined })} />
      </label>
      <label>
        Alt text
        <input value={value.alt ?? ""} onChange={(event) => update({ alt: event.currentTarget.value })} />
      </label>
      <label>
        Caption
        <textarea value={value.caption ?? ""} onChange={(event) => update({ caption: event.currentTarget.value })} />
      </label>
      {props.renderDefault ? props.renderDefault(props) : null}
    </div>
  );
}
