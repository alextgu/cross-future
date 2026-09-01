import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  discoverVideoSources,
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
  const fetch = vi.fn(async (_query: string, params?: Record<string, string>) => ({ _id: ids[params?.target ?? ""] }));
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

  it("maps only exact normalized person-name filenames to the approved Assembly interview codes", async () => {
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

  it("leaves generic filenames unresolved unless an explicit external mapping supplies a real target", async () => {
    const [generic] = await fixtureSources(["Interview US.mp4"]);

    expect(mapVideoTargets([generic])[0].target).toBeUndefined();
    expect(mapVideoTargets([generic], { "Interview US.mp4": "IV.10" })[0].target).toBe("IV.10");
  });

  it("lets an explicit mapping override an automatic person-name target", async () => {
    const [named] = await fixtureSources(["02_SHORT_ChrisSmith_AMD_Horizontal.mp4"]);

    expect(mapVideoTargets([named], { [named.migrationKey]: "interview:another-real-target" })[0].target).toBe("interview:another-real-target");
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
});
