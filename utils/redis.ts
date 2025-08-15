import { Redis } from "@upstash/redis";
import { compressCode, decompressCode } from "./compression.ts";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL") || "",
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN") || "",
});

export async function storeCode(
  shortUrlId: string,
  code: string,
): Promise<boolean> {
  try {
    // Check if the key already exists
    const existing = await redis.get(shortUrlId);
    if (existing) {
      return false; // Key already exists, don't overwrite
    }

    // Compress and store the code
    const compressedCode = compressCode(code);
    await redis.set(shortUrlId, compressedCode);
    return true;
  } catch (error) {
    console.error("Error storing code:", error);
    return false;
  }
}

export async function getCode(shortUrlId: string): Promise<string | null> {
  try {
    const compressedCode = await redis.get(shortUrlId) as string | null;
    if (!compressedCode) {
      return null;
    }

    return decompressCode(compressedCode);
  } catch (error) {
    console.error("Error retrieving code:", error);
    return null;
  }
}
