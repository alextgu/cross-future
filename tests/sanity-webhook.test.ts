import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidateTag, revalidatePath, enableDraftMode } = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  enableDraftMode: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidateTag, revalidatePath }));
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ enable: enableDraftMode })),
}));

import { POST as revalidateSanity } from "../app/api/revalidate/sanity/route";
import { GET as enableDraft } from "../app/api/draft-mode/enable/route";

const secret = "test-webhook-secret";

function signedRequest(payload: unknown, signatureSecret = secret): Request {
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", signatureSecret).update(body).digest("hex");
  return new Request("http://localhost/api/revalidate/sanity", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-sanity-signature": `sha256=${signature}`,
    },
    body,
  });
}

describe("Sanity publish webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SANITY_REVALIDATE_SECRET", secret);
  });

  it("rejects an invalid signature", async () => {
    const response = await revalidateSanity(signedRequest({ tags: ["sanity:content"] }, "wrong"));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a validly signed webhook without paths or tags", async () => {
    const response = await revalidateSanity(signedRequest({ _id: "edition-1" }));
    expect(response.status).toBe(400);
  });

  it("revalidates supplied tags and paths after a publish", async () => {
    const response = await revalidateSanity(
      signedRequest({ tags: ["sanity:content", "sanity:document:edition-1"], paths: ["/", "/interviews"] })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      revalidated: ["sanity:content", "sanity:document:edition-1", "/", "/interviews"],
    });
    expect(revalidateTag).toHaveBeenCalledWith("sanity:content");
    expect(revalidateTag).toHaveBeenCalledWith("sanity:document:edition-1");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/interviews");
  });
});

describe("draft preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SANITY_PREVIEW_SECRET", "preview-secret");
  });

  it("enables draft mode only with the server-side preview secret", async () => {
    const unauthorized = await enableDraft(
      new Request("http://localhost/api/draft-mode/enable?secret=wrong&slug=/interviews")
    );
    expect(unauthorized.status).toBe(401);
    expect(enableDraftMode).not.toHaveBeenCalled();

    const response = await enableDraft(
      new Request("http://localhost/api/draft-mode/enable?secret=preview-secret&slug=/interviews")
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/interviews");
    expect(enableDraftMode).toHaveBeenCalledOnce();
  });
});

it("keeps metadata fetches published and Stega-free", async () => {
  const queries = await import("../lib/sanity/queries");
  expect(queries.SANITY_FETCH_OPTIONS).toMatchObject({ stega: false });
  expect(JSON.stringify(queries.SANITY_FETCH_OPTIONS)).not.toContain("draft");
});
