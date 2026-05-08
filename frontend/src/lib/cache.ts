// Simple in-memory cache with TTL for API responses
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > DEFAULT_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Auto-expire after TTL
  setTimeout(() => {
    cache.delete(key);
  }, ttl);
}

export function clearCache(): void {
  cache.clear();
}
