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
  useEffect(() => () => activeRequest.current?.abort(), []);
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

  const upload = async (file: File) => {
    selectedFile.current = file;
    setError(null);
    setStatus("uploading");
    setProgress(5);
    const maxBytes = 200 * 1024 * 1024;
    if (!file.type.startsWith("video/") || file.size <= 0 || file.size > maxBytes) {
      setStatus("failed");
      setError("Choose a video file smaller than 200 MB.");
      return;
    }
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
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
      if (!session.uploadId || !(session.uploadUrl ?? session.uploadURL)) throw new Error("Upload session was incomplete");
      const uploadUrl = session.uploadUrl ?? session.uploadURL!;
      setProgress(15);
      const form = new FormData();
      form.append("file", file, file.name);
      const directResponse = await fetch(uploadUrl, { method: "POST", body: form });
      if (!directResponse.ok) throw new Error("Video transfer failed");
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
        if (completion?.status === "ready" || completion?.status === "failed") break;
        setStatus(completion?.status ?? "processing");
        await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
      }
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
      setStatus("failed");
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
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
        <button type="button" onClick={() => void upload(selectedFile.current!)}>Retry upload</button>
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
