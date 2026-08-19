import { checkRateLimit } from "./rate-limiter.js";

import type {
  Request,
  Response,
  NextFunction,
} from "express";

export async function criticalRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {

  const userId = req.user.user_id
  const sessionId = req.user.session_id;
  const ip = req.ip;

  if (!userId) {
    res.status(401).json({
      error: "Authenticated user is required",
    });
    return;
  }

  if (!sessionId) {
    res.status(401).json({
      error: "Authenticated session is required",
    });
    return;
  }

  if (!ip) {
    res.status(400).json({
      error: "Client IP is not available",
    });
    return;
  }

  const result = await checkRateLimit({
    userId,
    sessionId,
    ip,
    endpoint: req.path,
  });

  if (!result.allowed) {
    res.setHeader(
      "Retry-After",
      String(result.retryAfter),
    );

    res.status(429).json({
      error: "Too many requests",
      retryAfter: result.retryAfter,
      reason: result.reason,
    });
    return;
  }

  next();
}