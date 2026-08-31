const allowedMethods = "POST, OPTIONS";
const allowedHeaders = "Authorization, Content-Type, Idempotency-Key";

function configuredStudioOrigin(): string | null {
  const configured = process.env.SANITY_STUDIO_ORIGIN
    ?? process.env.SANITY_STUDIO_ALLOWED_ORIGIN
    ?? process.env.VIDEO_UPLOAD_ALLOWED_ORIGIN;
  if (!configured) return null;
  try {
    const parsed = new URL(configured);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function isAllowedStudioOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = configuredStudioOrigin();
  return configured !== null && origin === configured;
}

export function withCors(response: Response, request: Request): Response {
  const origin = request.headers.get("origin");
  const configured = configuredStudioOrigin();
  if (origin && configured !== null && origin === configured) {
    response.headers.set("Access-Control-Allow-Origin", configured);
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export function preflightResponse(request: Request): Response {
  if (!isAllowedStudioOrigin(request)) return new Response(null, { status: 403 });
  const response = new Response(null, { status: 204 });
  const origin = request.headers.get("origin");
  const configured = configuredStudioOrigin();
  if (origin && configured !== null && origin === configured) {
    response.headers.set("Access-Control-Allow-Origin", configured);
    response.headers.set("Access-Control-Allow-Methods", allowedMethods);
    response.headers.set("Access-Control-Allow-Headers", allowedHeaders);
    response.headers.set("Access-Control-Max-Age", "600");
    response.headers.set("Vary", "Origin");
  }
  return response;
}
