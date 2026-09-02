import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  discoverVideoSources,
  createTusUploader,
  mapVideoTargets,
  migrateVideos,
  type SanityVideoClient,
  type StreamUploader,
  type VideoSource,
} from "./migrate-videos-to-stream";

const namedFiles = [
  "01_SHORT_YangWang_Horizontal.mp4",
  "02_SHORT_ChrisSmith_AMD_Horizontal.mp4",
  "02_SHORT_MariaParysz_Horizontal.mp4",
  "02_SHORT_NicoleTroster_Horizontal.mp4",
  "02_SHORT_PuiSaiLau_Horizontal.mp4",
  "03_SHORT_RasoulYousef_Horizontal.mp4",
  "04_SHORT_JamesElder_Horizontal.mp4",
  "04_SHORT_JosephTurcotte_Horizontal.mp4",
  "05_SHORT_MiryamLazarte_Horizontal.mp4",
] as const;

async function fixtureSources(names: readonly string[] = namedFiles): Promise<VideoSource[]> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "video-migration-"));
  await Promise.all(names.map((name, index) => writeFile(path.join(directory, name), Buffer.alloc(index + 1, index))));
  return discoverVideoSources(directory);
}

function sanityClient(ids: Record<string, string> = {}): SanityVideoClient & { patches: Array<{ id: string; value: Record<string, unknown> }> } {
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const fetch = vi.fn(async (_query: string, params?: Record<string, string>) => [{ _id: ids[params?.target ?? ""] }]);
  return {
    patches,
    fetch: fetch as unknown as SanityVideoClient["fetch"],
    patch: vi.fn((id: string) => ({
      set: (value: Record<string, unknown>) => ({
        commit: async () => { patches.push({ id, value }); return { _id: id }; },
      }),
    })),
  };
}

describe("video to Stream migration", () => {
  it("discovers source files in deterministic filename order and totals filesystem bytes", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "video-discovery-"));
    await writeFile(path.join(directory, "z.mp4"), Buffer.alloc(7));
    await writeFile(path.join(directory, "a.mp4"), Buffer.alloc(3));
    await writeFile(path.join(directory, "ignore.txt"), "not a video");

    const videos = await discoverVideoSources(directory);

    expect(videos.map((video) => video.fileName)).toEqual(["a.mp4", "z.mp4"]);
    expect(videos.reduce((total, video) => total + video.bytes, 0)).toBe(10);
  });

  it("maps only the nine exact approved filenames to the Assembly interview codes", async () => {
    const targets = mapVideoTargets(await fixtureSources());

    expect(Object.fromEntries(targets.map((target) => [target.source.fileName, target.target]))).toEqual({
      "01_SHORT_YangWang_Horizontal.mp4": "IV.17",
      "02_SHORT_ChrisSmith_AMD_Horizontal.mp4": "IV.10",
      "02_SHORT_MariaParysz_Horizontal.mp4": "IV.13",
      "02_SHORT_NicoleTroster_Horizontal.mp4": "IV.14",
      "02_SHORT_PuiSaiLau_Horizontal.mp4": "IV.16",
      "03_SHORT_RasoulYousef_Horizontal.mp4": "IV.18",
      "04_SHORT_JamesElder_Horizontal.mp4": "IV.11",
      "04_SHORT_JosephTurcotte_Horizontal.mp4": "IV.15",
      "05_SHORT_MiryamLazarte_Horizontal.mp4": "IV.12",
    });
  });

  it("does not infer targets from a person-name substring and rejects overrides of a fixed file", async () => {
    const sources = await fixtureSources(["Chris Smith outtake.mp4", "02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const nearMatch = sources.find((source) => source.fileName === "Chris Smith outtake.mp4")!;
    const fixed = sources.find((source) => source.fileName === "02_SHORT_ChrisSmith_AMD_Horizontal.mp4")!;

    expect(mapVideoTargets([nearMatch])[0].target).toBeUndefined();
    expect(() => mapVideoTargets([fixed], { [fixed.migrationKey]: "IV.99" })).toThrow("cannot override fixed target");
  });

  it("leaves generic filenames unresolved unless an explicit external mapping supplies a real target", async () => {
    const [generic] = await fixtureSources(["Interview US.mp4"]);

    expect(mapVideoTargets([generic])[0].target).toBeUndefined();
    expect(mapVideoTargets([generic], { "Interview US.mp4": "IV.10" })[0].target).toBe("IV.10");
  });

  it("reports unresolved targets in dry run without checkpoints, uploads, or Sanity reads", async () => {
    const videos = await fixtureSources(["Interview US.mp4"]);
    const checkpointPath = path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`);
    const uploader = vi.fn<StreamUploader>();
    const client = sanityClient();

    const result = await migrateVideos({ videos, dryRun: true, checkpointPath, upload: uploader, client });

    expect(result).toMatchObject({ dryRun: true, totalBytes: 1, unresolved: ["Interview US.mp4"], uploaded: 0, patched: 0 });
    await expect(stat(checkpointPath)).rejects.toMatchObject({ code: "ENOENT" });
    expect(uploader).not.toHaveBeenCalled();
    expect(client.fetch).not.toHaveBeenCalled();
    expect(client.patch).not.toHaveBeenCalled();
  });

  it("fails closed before upload when a live run has unresolved targets", async () => {
    const videos = await fixtureSources(["Interview US.mp4"]);
    const uploader = vi.fn<StreamUploader>();

    await expect(migrateVideos({ videos, checkpointPath: path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`), upload: uploader, client: sanityClient() }))
      .rejects.toThrow("Unresolved video targets: Interview US.mp4");
    expect(uploader).not.toHaveBeenCalled();
  });

  it("fails closed before upload when an external mapping reuses an interview target", async () => {
    const videos = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4", "Interview US.mp4"]);
    const uploader = vi.fn<StreamUploader>();

    await expect(migrateVideos({
      videos,
      externalMappings: { "Interview US.mp4": "IV.10" },
      checkpointPath: path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`),
      upload: uploader,
      client: sanityClient(),
    })).rejects.toThrow("Duplicate video targets: IV.10");
    expect(uploader).not.toHaveBeenCalled();
  });

  it("reuses a completed checkpoint and prevents a duplicate upload", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const checkpointPath = path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`);
    const client = sanityClient({ "IV.10": "real-sanity-id" });
    const uploader = vi.fn<StreamUploader>(async () => "stream-uid-001");

    await migrateVideos({ videos: [video], checkpointPath, upload: uploader, client });
    await migrateVideos({ videos: [video], checkpointPath, upload: uploader, client });

    expect(uploader).toHaveBeenCalledTimes(1);
    expect(client.patches).toHaveLength(1);
  });

  it("retries a failed upload from its checkpoint and persists a stable Stream UID before patching", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const checkpointPath = path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`);
    const client = sanityClient({ "IV.10": "real-sanity-id" });
    let attempt = 0;
    const uploader: StreamUploader = async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("network interrupted");
      return "stable-stream-uid";
    };

    await expect(migrateVideos({ videos: [video], checkpointPath, upload: uploader, client })).rejects.toThrow("network interrupted");
    await migrateVideos({ videos: [video], checkpointPath, upload: uploader, client });

    const checkpoint = JSON.parse(await readFile(checkpointPath, "utf8"));
    expect(checkpoint.entries[video.migrationKey]).toMatchObject({ status: "completed", streamUid: "stable-stream-uid", attempts: 2, sanityPatched: true });
    expect(client.patches).toEqual([{ id: "real-sanity-id", value: { video: { _type: "cloudflareVideo", streamUid: "stable-stream-uid", status: "processing", alt: "Recorded interview: Chris Smith" } } }]);
  });

  it("queries target records for their real Sanity IDs rather than deriving an ID", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const client = sanityClient({ "IV.10": "actual-document-id" });
    const checkpointPath = path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`);

    await migrateVideos({ videos: [video], checkpointPath, upload: async () => "stream-uid-002", client });

    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining("migrationKey == $target || code == $target"), { target: "IV.10" });
    expect(client.patches[0]?.id).toBe("actual-document-id");
  });

  it("rejects a corrupt checkpoint entry before any upload", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const checkpointPath = path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`);
    await writeFile(checkpointPath, JSON.stringify({ version: 1, entries: { [video.migrationKey]: { source: {}, target: "IV.10", status: "bad" } } }));
    const uploader = vi.fn<StreamUploader>();

    await expect(migrateVideos({ videos: [video], checkpointPath, upload: uploader, client: sanityClient({ "IV.10": "real-id" }) }))
      .rejects.toThrow("Migration checkpoint is corrupt");
    expect(uploader).not.toHaveBeenCalled();
  });

  it("rejects an otherwise-valid checkpoint entry with an unknown field", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const checkpointPath = path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`);
    await writeFile(checkpointPath, JSON.stringify({
      version: 1,
      entries: {
        [video.migrationKey]: {
          source: { fileName: video.fileName, filePath: video.filePath, bytes: video.bytes, mtimeMs: video.mtimeMs },
          target: "IV.10", status: "failed", attempts: 1, unexpected: true,
        },
      },
    }));

    await expect(migrateVideos({ videos: [video], checkpointPath, upload: vi.fn<StreamUploader>(), client: sanityClient({ "IV.10": "real-id" }) }))
      .rejects.toThrow("Migration checkpoint is corrupt");
  });

  it("fails closed when a checkpointed migration key has a changed source identity", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const checkpointPath = path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`);
    await writeFile(checkpointPath, JSON.stringify({
      version: 1,
      entries: {
        [video.migrationKey]: {
          source: { fileName: video.fileName, filePath: video.filePath, bytes: video.bytes + 1, mtimeMs: video.mtimeMs },
          target: "IV.10", status: "failed", attempts: 1, tusUploadUrl: "https://uploads.example/resume", streamUid: "uid-kept-safe",
        },
      },
    }));
    const uploader = vi.fn<StreamUploader>();

    await expect(migrateVideos({ videos: [video], checkpointPath, upload: uploader, client: sanityClient({ "IV.10": "real-id" }) }))
      .rejects.toThrow(`Checkpoint source identity changed for ${video.migrationKey}`);
    expect(uploader).not.toHaveBeenCalled();
  });

  it("requires exactly one real Sanity interview target before upload", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const client: SanityVideoClient = {
      fetch: async () => [{ _id: "first" }, { _id: "second" }] as any,
      patch: () => ({ set: () => ({ commit: async () => undefined }) }),
    };
    const uploader = vi.fn<StreamUploader>();

    await expect(migrateVideos({ videos: [video], checkpointPath: path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`), upload: uploader, client }))
      .rejects.toThrow("Expected exactly one Sanity interview for target IV.10");
    expect(uploader).not.toHaveBeenCalled();
  });

  it("resumes a failed Sanity patch from its persisted Stream UID without re-uploading", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const checkpointPath = path.join(os.tmpdir(), `video-migration-${crypto.randomUUID()}.json`);
    const client = sanityClient({ "IV.10": "real-sanity-id" });
    let patchAttempt = 0;
    client.patch = vi.fn((id: string) => ({
      set: (value: Record<string, unknown>) => ({
        commit: async () => {
          patchAttempt += 1;
          if (patchAttempt === 1) throw new Error("Sanity temporarily unavailable");
          client.patches.push({ id, value });
        },
      }),
    }));
    const uploader = vi.fn<StreamUploader>(async () => "uid-after-upload");

    await expect(migrateVideos({ videos: [video], checkpointPath, upload: uploader, client })).rejects.toThrow("Sanity temporarily unavailable");
    await migrateVideos({ videos: [video], checkpointPath, upload: uploader, client });

    expect(uploader).toHaveBeenCalledTimes(1);
    expect(client.patches).toHaveLength(1);
  });

  it("persists the TUS creation URL and Stream UID before the real client sends a chunk", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    let patchRequests = 0;
    const server = createServer((request, response) => {
      request.resume();
      if (request.method === "POST" && request.url === "/stream?direct_user=true") {
        response.writeHead(201, { Location: "/uploads/one", "stream-media-id": "stable-stream-uid", "Tus-Resumable": "1.0.0" });
        response.end();
        return;
      }
      if (request.method === "PATCH" && request.url === "/uploads/one") {
        patchRequests += 1;
        response.writeHead(204, { "Upload-Offset": String(video.bytes), "Tus-Resumable": "1.0.0" });
        response.end();
        return;
      }
      response.writeHead(404).end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test TUS server did not bind a TCP port");
    const uploader = createTusUploader({ accountId: "account", apiToken: "secret" }, { endpoint: `http://127.0.0.1:${address.port}/stream?direct_user=true` });
    let releasePersistence!: () => void;
    const persistenceReleased = new Promise<void>((resolve) => { releasePersistence = resolve; });
    let notifyPersistence!: () => void;
    const persistenceStarted = new Promise<void>((resolve) => { notifyPersistence = resolve; });
    const saved: Record<string, string> = {};

    try {
      const upload = uploader(video, {}, async (update) => {
        Object.assign(saved, update);
        notifyPersistence();
        await persistenceReleased;
      });
      await persistenceStarted;
      expect(saved).toEqual({ tusUploadUrl: `http://127.0.0.1:${address.port}/uploads/one`, streamUid: "stable-stream-uid" });
      expect(patchRequests).toBe(0);

      releasePersistence();
      await expect(upload).resolves.toBe("stable-stream-uid");
      expect(patchRequests).toBe(1);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("uses the persisted TUS URL and UID to resume without creating another Stream upload", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    const requests: string[] = [];
    const server = createServer((request, response) => {
      request.resume();
      requests.push(`${request.method} ${request.url}`);
      if (request.method === "HEAD" && request.url === "/uploads/resume") {
        response.writeHead(200, { "Upload-Offset": "0", "Upload-Length": String(video.bytes), "Tus-Resumable": "1.0.0" });
        response.end();
        return;
      }
      if (request.method === "PATCH" && request.url === "/uploads/resume") {
        response.writeHead(204, { "Upload-Offset": String(video.bytes), "Tus-Resumable": "1.0.0" });
        response.end();
        return;
      }
      response.writeHead(500).end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test TUS server did not bind a TCP port");
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const uploader = createTusUploader({ accountId: "account", apiToken: "secret" }, { endpoint: `${baseUrl}/stream?direct_user=true` });

    try {
      await expect(uploader(video, { tusUploadUrl: `${baseUrl}/uploads/resume`, streamUid: "stable-stream-uid" }, async () => {
        throw new Error("A resumed upload must not rewrite its already durable creation URL");
      })).resolves.toBe("stable-stream-uid");
      expect(requests).toEqual(["HEAD /uploads/resume", "PATCH /uploads/resume"]);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("rejects a creation response without a stable Stream UID before sending a chunk", async () => {
    const [video] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);
    let patchRequests = 0;
    const server = createServer((request, response) => {
      request.resume();
      if (request.method === "POST") {
        response.writeHead(201, { Location: "/uploads/missing-uid", "Tus-Resumable": "1.0.0" });
        response.end();
        return;
      }
      if (request.method === "PATCH") patchRequests += 1;
      response.writeHead(500).end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test TUS server did not bind a TCP port");
    const uploader = createTusUploader({ accountId: "account", apiToken: "secret" }, { endpoint: `http://127.0.0.1:${address.port}/stream?direct_user=true` });

    try {
      await expect(uploader(video, {}, async () => undefined)).rejects.toThrow("stream-media-id");
      expect(patchRequests).toBe(0);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
