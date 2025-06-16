// Create a new cache service

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private cache: Record<string, CacheItem<any>> = {};
  private readonly MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes cache duration

  set<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }

  get<T>(key: string): T | null {
    const item = this.cache[key];
    
    if (!item) {
      return null;
    }
    
    // Check if the cache is still valid
    if (Date.now() - item.timestamp > this.MAX_AGE_MS) {
      delete this.cache[key];
      return null;
    }
    
    return item.data as T;
  }

  invalidate(key: string): void {
    delete this.cache[key];
  }

  invalidateAll(): void {
    this.cache = {};
  }
}

export const cacheService = new CacheService();