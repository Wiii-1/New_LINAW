/*
 * Questions I still need to answer:
 *
 * - Should the limiter identify clients by IP, session, user ID, or a combination?
 * - What is the request window?
 * - What happens after the limit is exceeded?
 * - Should repeated violations increase the timeout?
 * - How do we avoid blocking legitimate users behind the same IP?
 * - How do multiple application instances share limiter state?
 * - Should Redis failure fail-open or fail-closed?
 * - How do we clean up expired entries?
 * - Should different endpoints have different limits?
 */


import { redis }  from "./redis.js"

import type {
    RateLimitContext,
    RateLimitResult
} from "./rate-limiter.types.js"

const WINDOW_SECONDS = 60;

const SESSION_LIMIT = 100;
const USER_LIMIT = 500;
const IP_LIMIT = 1000;

const RATE_LIMIT_SCRIPT =`
local sessionKey = KEYS[1]
local userKey = KEYS[2]
local ipKey = KEYS[3]

local sessionLimit = tonumber(ARGV[1])
local userLimit = tonumber(ARGV[2])
local ipLimit = tonumber(ARGV[3])
local window = tonumber(ARGV[4])

local sessionCount = tonumber(redis.call("GET", sessionKey) or "0")
local userCount = tonumber(redis.call("GET", userKey) or "0")
local ipCount = tonumber(redis.call("GET", ipKey) or "0")

if sessionCount >= sessionLimit then
    return {0, sessionLimit - sessionCount, 0}
end

if userCount >= userLimit then
    return {0, userLimit - userCount, 1}
end

if ipCount >= ipLimit then
    return {0, ipLimit - ipCount, 2}
end

sessionCount = redis.call("INCR", sessionKey)
userCount = redis.call("INCR", userKey)
ipCount = redis.call("INCR", ipKey)

if sessionCount == 1 then
    redis.call("EXPIRE", sessionKey, window)
end

if userCount == 1 then
    redis.call("EXPIRE", userKey, window)
end

if ipCount == 1 then
    redis.call("EXPIRE", ipKey, window)
end

return {
    1,
    sessionLimit - sessionCount,
    0
}
`

export async function checkRateLimit(
  context: RateLimitContext,
): Promise<RateLimitResult> {

  console.log("[RateLimit] Starting");

  const sessionKey =
    `rate-limit:session:${context.sessionId}:${context.endpoint}`;

  const userKey =
    `rate-limit:user:${context.userId}:${context.endpoint}`;

  const ipKey =
    `rate-limit:ip:${context.ip}:${context.endpoint}`;

  console.log("[RateLimit] Executing Redis script...");

  const result = await redis.eval(RATE_LIMIT_SCRIPT, {
    keys: [
      sessionKey,
      userKey,
      ipKey,
    ],
    arguments: [
      SESSION_LIMIT.toString(),
      USER_LIMIT.toString(),
      IP_LIMIT.toString(),
      WINDOW_SECONDS.toString(),
    ],
  }) as [number, number, number];

  console.log("[RateLimit] Redis script completed:", result);

  const [allowed, remaining, reasonCode] = result;

  console.log("[RateLimit] Parsed result:", {
      allowed,
      remaining,
      reasonCode,
  });

  if (allowed === 1) {
      console.log("[RateLimit] Returning allowed result");

      const output = {
          allowed: true as const,
          remaining,
      };

      console.log("[RateLimit] Output:", output);

      return output;
  }

  type RateLimitReason = "session" | "user" | "ip";

  const reasons = [
    "session",
    "user",
    "ip",
  ] as const;

  const reason = reasons[reasonCode];

  if (reason === undefined) {
    throw new Error(`Invalid rate-limit reason code: ${reasonCode}`);
  }

  const retryAfter = await redis.ttl(
    reason === "session"
      ? sessionKey
      : reason === "user"
        ? userKey
        : ipKey,
  );

  return {
    allowed: false,
    remaining: 0,
    retryAfter,
    reason,
  };
}