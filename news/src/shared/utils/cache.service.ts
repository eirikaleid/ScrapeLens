export class CacheService<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map();
  private ttl: number;

  constructor(ttlInSeconds: number = 300) { // Default 5 minutes
    this.ttl = ttlInSeconds * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
