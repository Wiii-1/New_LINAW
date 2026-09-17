import type { Context, Next } from "hono"
import type { AppContext } from "../../types/hono.js";

import { createRedis } from "./redis.js";
import { checkRateLimit } from "./rate-limiter.js";

export async function criticalRateLimit(
  c: Context<AppContext>,
  next: Next
): Promise<void> {

  const user = c.get("user")

  const userId = user.user_id
  const sessionId = user.session_id;
  
  const ip = 
    c.req.header("CF-Connecting-IP") ??
    c.req.header("X-Forwarded-For")

  if (!userId) {
      throw new Error("Authenticated user is required");
  }

  if (!sessionId) {
      throw new Error("Authenticated session is required");
  }

  if (!ip) {
      throw new Error("Client IP is not available");
  }
  
  const redis = createRedis(c.env)

  const result = await checkRateLimit(
    redis,
    {
      userId,
      sessionId,
      ip,
      endpoint: c.req.path
    }
  );

  console.log("[RateLimit Middleware] Got result:", result);

  if (!result.allowed) {
      c.header(
          "Retry-After",
          String(result.retryAfter),
      );

      c.json({
          error: "Too many requests",
          retryAfter: result.retryAfter,
          reason: result.reason,
      }, 429);

      return
  }

  await next();
}