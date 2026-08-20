export const REVIEW_DENSITIES = ["compact", "balanced", "airy"] as const;
export type ReviewDensity = (typeof REVIEW_DENSITIES)[number];

export const REVIEW_COLLECTION_DEPTHS = ["curated", "full"] as const;
export type ReviewCollectionDepth = (typeof REVIEW_COLLECTION_DEPTHS)[number];

export const REVIEW_DENSITY_DEFAULT: ReviewDensity = "balanced";
export const REVIEW_COLLECTION_DEFAULT: ReviewCollectionDepth = "curated";
export const REVIEW_RADIUS_MIN = 8;
export const REVIEW_RADIUS_MAX = 28;
export const REVIEW_RADIUS_DEFAULT = 22;

export const REVIEW_DENSITY_STORAGE_KEY = "cf-review-density";
export const REVIEW_COLLECTION_STORAGE_KEY = "cf-review-collection";
export const REVIEW_RADIUS_STORAGE_KEY = "cf-review-radius";

export function isReviewDensity(
  value: string | null | undefined
): value is ReviewDensity {
  return REVIEW_DENSITIES.includes(value as ReviewDensity);
}

export function isReviewCollectionDepth(
  value: string | null | undefined
): value is ReviewCollectionDepth {
  return REVIEW_COLLECTION_DEPTHS.includes(value as ReviewCollectionDepth);
}

export function clampReviewRadius(value: number): number {
  return Math.min(REVIEW_RADIUS_MAX, Math.max(REVIEW_RADIUS_MIN, value));
}
