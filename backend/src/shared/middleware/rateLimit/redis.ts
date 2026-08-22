import { createClient } from "redis";
import { env } from "../../../config/env.js";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err);
});

export async function connectRedis() {
  console.log("[Redis] Starting connection...");

  if (!redis.isOpen) {
    console.log("[Redis] Calling redis.connect()...");
    await redis.connect();
  }

  console.log("[Redis] Connection successful.");
}