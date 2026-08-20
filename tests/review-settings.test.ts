import { describe, expect, it } from "vitest";
import {
  REVIEW_COLLECTION_DEFAULT,
  REVIEW_COLLECTION_STORAGE_KEY,
  REVIEW_DENSITY_DEFAULT,
  REVIEW_DENSITY_STORAGE_KEY,
  REVIEW_RADIUS_DEFAULT,
  REVIEW_RADIUS_MAX,
  REVIEW_RADIUS_MIN,
  REVIEW_RADIUS_STORAGE_KEY,
  clampReviewRadius,
  isReviewCollectionDepth,
  isReviewDensity,
} from "../lib/review-settings";

describe("CEO review settings", () => {
  it("publishes stable defaults and storage keys", () => {
    expect(REVIEW_DENSITY_DEFAULT).toBe("balanced");
    expect(REVIEW_COLLECTION_DEFAULT).toBe("curated");
    expect(REVIEW_RADIUS_DEFAULT).toBe(22);
    expect(REVIEW_RADIUS_MIN).toBe(8);
    expect(REVIEW_RADIUS_MAX).toBe(28);
    expect(REVIEW_DENSITY_STORAGE_KEY).toBe("cf-review-density");
    expect(REVIEW_COLLECTION_STORAGE_KEY).toBe("cf-review-collection");
    expect(REVIEW_RADIUS_STORAGE_KEY).toBe("cf-review-radius");
  });

  it("guards the two finite option sets", () => {
    expect(isReviewDensity("balanced")).toBe(true);
    expect(isReviewDensity("wide")).toBe(false);
    expect(isReviewCollectionDepth("curated")).toBe(true);
    expect(isReviewCollectionDepth("everything")).toBe(false);
  });

  it("clamps card radius to the review-safe range", () => {
    expect(clampReviewRadius(4)).toBe(8);
    expect(clampReviewRadius(31)).toBe(28);
    expect(clampReviewRadius(18)).toBe(18);
  });
});
