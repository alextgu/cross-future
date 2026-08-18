export interface CountdownParts {
  d: number;
  h: number;
  m: number;
  s: number;
}

export function partsUntil(targetMs: number, nowMs = Date.now()): CountdownParts {
  const remaining = Math.max(0, targetMs - nowMs);
  return {
    d: Math.floor(remaining / 86_400_000),
    h: Math.floor(remaining / 3_600_000) % 24,
    m: Math.floor(remaining / 60_000) % 60,
    s: Math.floor(remaining / 1_000) % 60,
  };
}
