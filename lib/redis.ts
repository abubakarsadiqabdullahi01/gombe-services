import { createClient } from "redis";

type RedisGlobal = {
  redis?: ReturnType<typeof createClient>;
  redisConnecting?: Promise<void> | null;
};

const globalForRedis = globalThis as unknown as RedisGlobal;

function createRedisClient() {
  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (error) => {
    console.error("[Redis]", error);
  });
  return client;
}

const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

async function ensureRedisConnected() {
  if (redis.isOpen) return;

  if (!globalForRedis.redisConnecting) {
    globalForRedis.redisConnecting = redis
      .connect()
      .then(() => undefined)
      .finally(() => {
        globalForRedis.redisConnecting = null;
      });
  }

  await globalForRedis.redisConnecting;
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  try {
    await ensureRedisConnected();
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.error("[Redis:getCachedJson]", error);
    return null;
  }
}

export async function setCachedJson(
  key: string,
  value: unknown,
  ttlSeconds: number,
) {
  try {
    await ensureRedisConnected();
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error("[Redis:setCachedJson]", error);
  }
}

export async function invalidateCacheByPattern(pattern: string) {
  try {
    await ensureRedisConnected();
    const keys: string[] = [];

    const iterator = redis.scanIterator({ MATCH: pattern, COUNT: 100 });
    for await (const key of iterator) {
      keys.push(String(key));
    }

    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error("[Redis:invalidateCacheByPattern]", error);
  }
}
