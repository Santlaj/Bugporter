import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "../lib/constants";
import { RateLimitError } from "../lib/errors";

let redisClient = null;
let ipRatelimit = null;
let projectRatelimit = null;

// Initialize Upstash Redis if environment credentials are provided
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ipRatelimit = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.IP_MAX_REQUESTS,
        `${RATE_LIMITS.IP_WINDOW_SECONDS} s`
      ),
      prefix: "@br/rl/ip",
    });

    projectRatelimit = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.PROJECT_MAX_REQUESTS,
        `${RATE_LIMITS.PROJECT_WINDOW_SECONDS} s`
      ),
      prefix: "@br/rl/project",
    });
  } catch (err) {
    console.warn("[UpstashRateLimit] Failed to initialize Upstash client:", err.message);
  }
}

// In-memory sliding window fallback for local development without Upstash credentials
const memoryStore = new Map();

function checkMemoryLimit(key, limit, windowSeconds) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  let timestamps = memoryStore.get(key) || [];

  // Filter out expired timestamps
  timestamps = timestamps.filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    return false;
  }

  timestamps.push(now);
  memoryStore.set(key, timestamps);
  return true;
}

export const rateLimitService = {
  /**
   * Checks both IP and Project rate limits.
   * Throws RateLimitError if exceeded.
   * @param {string} ip
   * @param {string} projectId
   */
  async checkRateLimits(ip = "unknown", projectId) {
    // 1. IP Rate limit check
    if (ipRatelimit) {
      const { success } = await ipRatelimit.limit(ip);
      if (!success) {
        throw new RateLimitError("Rate limit exceeded for this IP address (20 reports / 10 min)");
      }
    } else {
      const allowed = checkMemoryLimit(`ip:${ip}`, RATE_LIMITS.IP_MAX_REQUESTS, RATE_LIMITS.IP_WINDOW_SECONDS);
      if (!allowed) {
        throw new RateLimitError("Rate limit exceeded for this IP address");
      }
    }

    // 2. Project Rate limit check
    if (projectRatelimit && projectId) {
      const { success } = await projectRatelimit.limit(projectId);
      if (!success) {
        throw new RateLimitError("Rate limit exceeded for this project (100 reports / hour)");
      }
    } else if (projectId) {
      const allowed = checkMemoryLimit(
        `proj:${projectId}`,
        RATE_LIMITS.PROJECT_MAX_REQUESTS,
        RATE_LIMITS.PROJECT_WINDOW_SECONDS
      );
      if (!allowed) {
        throw new RateLimitError("Rate limit exceeded for this project");
      }
    }

    return true;
  },
};

export default rateLimitService;
