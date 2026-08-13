import { serve } from "std/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

const limiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds per IP
});

export async function rateLimitMiddleware(req: Request): Promise<Response | null> {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  try {
    await limiter.consume(ip);
    return null; // allow request
  } catch (rejRes) {
    return new Response(
      JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Higher-order function to wrap handlers
export function withRateLimit(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const limitResp = await rateLimitMiddleware(req);
    if (limitResp) return limitResp;
    return handler(req);
  };
}