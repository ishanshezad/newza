export interface CachedRecommendation {
  id: string
  title: string
  description: string | null
  published_date: string
  article_url: string
  image_url: string | null
  source: string
  category: string
  region: string
  score: number
  reasons: string[]
}

export interface RecommendationResponse {
  hasRecommendations: boolean
  recommendations: CachedRecommendation[]
  timestamp: number
  cacheStatus: 'hit' | 'miss' | 'expired'
  lastUpdate: number
  error?: string
}

export interface CacheEntry {
  data: CachedRecommendation[]
  timestamp: number
  category: string
  excludeIds: string[]
  expiresAt: number
}

export class RecommendationCache {
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50
  private static cache = new Map<string, CacheEntry>()
  private static pendingRequests = new Map<string, Promise<RecommendationResponse>>()

  static generateCacheKey(category: string, excludeIds: string[]): string {
    const sortedIds = [...excludeIds].sort()
    return `${category}:${sortedIds.join(',')}`
  }

  static get(category: string, excludeIds: string[]): CacheEntry | null {
    const key = this.generateCacheKey(category, excludeIds)
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if cache entry is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry
  }

  static set(category: string, excludeIds: string[], data: CachedRecommendation[]): void {
    const key = this.generateCacheKey(category, excludeIds)
    const now = Date.now()
    
    const entry: CacheEntry = {
      data,
      timestamp: now,
      category,
      excludeIds: [...excludeIds],
      expiresAt: now + this.CACHE_DURATION
    }
    
    // Implement LRU cache eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, entry)
  }

  static invalidate(category?: string): void {
    if (category) {
      // Invalidate specific category
      for (const [key, entry] of this.cache.entries()) {
        if (entry.category === category) {
          this.cache.delete(key)
        }
      }
    } else {
      // Clear all cache
      this.cache.clear()
    }
  }

  static getPendingRequest(key: string): Promise<RecommendationResponse> | null {
    return this.pendingRequests.get(key) || null
  }

  static setPendingRequest(key: string, promise: Promise<RecommendationResponse>): void {
    this.pendingRequests.set(key, promise)
    
    // Clean up after request completes
    promise.finally(() => {
      this.pendingRequests.delete(key)
    })
  }

  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}