import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

type AppRedisClient = ReturnType<typeof createClient>;

declare global {
  var redisClientPromise: Promise<AppRedisClient> | undefined;
}

export async function getRedisClient() {
  if (!global.redisClientPromise) {
    const client = createClient({ url: redisUrl });

    client.on("error", (error) => {
      console.error("Redis client error", error);
    });

    global.redisClientPromise = client.connect().then(() => client);
  }

  return global.redisClientPromise;
}
