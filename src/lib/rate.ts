import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
export const postLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, '5 m'), // 5 posts / 5 minutes
  analytics: true,
});
