// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import CloudflareVideoInput from "./CloudflareVideoInput";

afterEach(cleanup);

function props() {
  return {
    value: { alt: "A clip", caption: "" },
    onChange: vi.fn(),
    renderDefault: () => <div data-testid="native-fields" />,
    apiOrigin: "https://api.example",
    authToken: "session-token",
  } as any;
}

it("uploads a selected video, shows progress, and writes only Stream metadata", async () => {
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ uploadId: "upload-1", uploadUrl: "https://upload.example/session" }), { status: 201 }))
    .mockResolvedValueOnce(new Response("", { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ streamUid: "stream-uid-123", status: "ready", metadata: { durationSeconds: 12, posterUrl: "https://img.example/poster.jpg" } }), { status: 200 })));
  const inputProps = props();
  render(<CloudflareVideoInput {...inputProps} />);

  const file = new File(["video"], "clip.mp4", { type: "video/mp4" });
  fireEvent.change(screen.getByLabelText(/choose video/i), { target: { files: [file] } });

  await waitFor(() => expect(screen.getByText(/ready/i)).toBeTruthy());
  expect(screen.getByText("stream-uid-123")).toBeTruthy();
  expect(inputProps.onChange).toHaveBeenCalled();
  expect(vi.mocked(fetch).mock.calls[0][0]).toBe("https://api.example/api/video-upload");
  expect((vi.mocked(fetch).mock.calls[0][1] as RequestInit).headers).toMatchObject({ Authorization: "Bearer session-token" });
  expect((vi.mocked(fetch).mock.calls[1][1] as RequestInit).body).toBeInstanceOf(FormData);
  expect((screen.getByLabelText(/alt text/i) as HTMLInputElement).value).toBe("A clip");
  expect(screen.getByLabelText(/caption/i)).toBeTruthy();
});

it("polls with bounded idempotent requests until Stream is ready", async () => {
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ uploadId: "upload-poll", uploadUrl: "https://upload.example/session" }), { status: 201 }))
    .mockResolvedValueOnce(new Response("", { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ streamUid: "stream-poll", status: "processing", metadata: {} }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ streamUid: "stream-poll", status: "ready", metadata: {} }), { status: 200 })));
  render(<CloudflareVideoInput {...props()} />);
  fireEvent.change(screen.getByLabelText(/choose video/i), { target: { files: [new File(["video"], "clip.mp4", { type: "video/mp4" })] } });
  await waitFor(() => expect(screen.getByText(/ready/i)).toBeTruthy(), { timeout: 2000 });
  expect(fetch).toHaveBeenCalledTimes(4);
  const thirdHeaders = (vi.mocked(fetch).mock.calls[2][1] as RequestInit).headers as Record<string, string>;
  const fourthHeaders = (vi.mocked(fetch).mock.calls[3][1] as RequestInit).headers as Record<string, string>;
  expect(thirdHeaders["Idempotency-Key"]).toContain(":poll:0");
  expect(fourthHeaders["Idempotency-Key"]).toContain(":poll:1");
});

it("preserves metadata edited while completion is in flight", async () => {
  let finish!: (response: Response) => void;
  const completion = new Promise<Response>((resolve) => { finish = resolve; });
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ uploadId: "upload-stale", uploadUrl: "https://upload.example/session" }), { status: 201 }))
    .mockResolvedValueOnce(new Response("", { status: 200 }))
    .mockReturnValueOnce(completion));
  const inputProps = props();
  render(<CloudflareVideoInput {...inputProps} />);
  fireEvent.change(screen.getByLabelText(/choose video/i), { target: { files: [new File(["video"], "clip.mp4", { type: "video/mp4" })] } });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  fireEvent.change(screen.getByLabelText(/alt text/i), { target: { value: "Edited while polling" } });
  finish(new Response(JSON.stringify({ streamUid: "stream-stale", status: "ready", metadata: {} }), { status: 200 }));
  await waitFor(() => expect(screen.getByText(/ready/i)).toBeTruthy());
  const finalPatch = inputProps.onChange.mock.calls.at(-1)?.[0];
  expect(JSON.stringify(finalPatch)).toContain("Edited while polling");
  expect(JSON.stringify(finalPatch)).toContain("stream-stale");
});

it("shows a retry action after an upload failure", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
  render(<CloudflareVideoInput {...props()} />);
  const file = new File(["video"], "clip.mp4", { type: "video/mp4" });
  fireEvent.change(screen.getByLabelText(/choose video/i), { target: { files: [file] } });
  await waitFor(() => expect(screen.getByRole("button", { name: /retry/i })).toBeTruthy());
  expect(screen.getByText(/upload failed/i)).toBeTruthy();
});

it("aborts a direct transfer when the selected file is replaced", async () => {
  let finishFirstTransfer!: (response: Response) => void;
  const firstTransfer = new Promise<Response>((resolve) => { finishFirstTransfer = resolve; });
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ uploadId: "upload-first", uploadUrl: "https://upload.example/first" }), { status: 201 }))
    .mockReturnValueOnce(firstTransfer)
    .mockResolvedValueOnce(new Response(JSON.stringify({ uploadId: "upload-second", uploadUrl: "https://upload.example/second" }), { status: 201 }))
    .mockResolvedValueOnce(new Response("", { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ streamUid: "stream-second", status: "ready", metadata: {} }), { status: 200 })));
  render(<CloudflareVideoInput {...props()} />);
  const chooser = screen.getByLabelText(/choose video/i);
  fireEvent.change(chooser, { target: { files: [new File(["first"], "first.mp4", { type: "video/mp4" })] } });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  const firstSignal = (vi.mocked(fetch).mock.calls[1][1] as RequestInit).signal as AbortSignal;
  fireEvent.change(chooser, { target: { files: [new File(["second"], "second.mp4", { type: "video/mp4" })] } });
  expect(firstSignal.aborted).toBe(true);
  finishFirstTransfer(new Response("", { status: 200 }));
  await waitFor(() => expect(screen.getByText(/ready/i)).toBeTruthy());
  expect(fetch).toHaveBeenCalledTimes(5);
});

it("cancels a polling backoff on unmount", async () => {
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ uploadId: "upload-backoff", uploadUrl: "https://upload.example/session" }), { status: 201 }))
    .mockResolvedValueOnce(new Response("", { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ streamUid: "stream-backoff", status: "processing", metadata: {} }), { status: 200 })));
  const view = render(<CloudflareVideoInput {...props()} />);
  fireEvent.change(screen.getByLabelText(/choose video/i), { target: { files: [new File(["video"], "clip.mp4", { type: "video/mp4" })] } });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  view.unmount();
  await new Promise((resolve) => setTimeout(resolve, 250));
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("remains active after React StrictMode effect replay", async () => {
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ uploadId: "upload-strict", uploadUrl: "https://upload.example/session" }), { status: 201 }))
    .mockResolvedValueOnce(new Response("", { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ streamUid: "stream-strict", status: "ready", metadata: {} }), { status: 200 })));
  render(<StrictMode><CloudflareVideoInput {...props()} /></StrictMode>);
  fireEvent.change(screen.getByLabelText(/choose video/i), { target: { files: [new File(["video"], "clip.mp4", { type: "video/mp4" })] } });
  await waitFor(() => expect(screen.getByText(/ready/i)).toBeTruthy());
  expect(screen.getByText("stream-strict")).toBeTruthy();
});
