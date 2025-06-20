import { supabase, type NewsArticle } from './supabase'
import { UserPreferencesManager, type RecommendationScore } from './userPreferences'
import { RecommendationCache, type CachedRecommendation, type RecommendationResponse } from './recommendationCache'

export interface RecommendationOptions {
  category?: string
  excludeArticleIds?: string[]
  limit?: number
  forceRefresh?: boolean
}

export class RecommendationEngine {
  private static readonly REQUEST_TIMEOUT = 2000 // 2 seconds max
  private static readonly MIN_SCORE_THRESHOLD = 15
  private static readonly BATCH_SIZE = 100

  static async getRecommendations(options: RecommendationOptions = {}): Promise<RecommendationResponse> {
    const {
      category = 'Today',
      excludeArticleIds = [],
      limit = 3,
      forceRefresh = false
    } = options

    const cacheKey = RecommendationCache.generateCacheKey(category, excludeArticleIds)

    try {
      // Check for pending request to avoid duplicate calls
      const pendingRequest = RecommendationCache.getPendingRequest(cacheKey)
      if (pendingRequest) {
        return await pendingRequest
      }

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = RecommendationCache.get(category, excludeArticleIds)
        if (cached) {
          return {
            hasRecommendations: cached.data.length > 0,
            recommendations: cached.data.slice(0, limit),
            timestamp: Date.now(),
            cacheStatus: 'hit',
            lastUpdate: cached.timestamp
          }
        }
      }

      // Create and cache the request promise
      const requestPromise = this.fetchRecommendations(category, excludeArticleIds, limit)
      RecommendationCache.setPendingRequest(cacheKey, requestPromise)

      return await requestPromise

    } catch (error) {
      console.error('Recommendation engine error:', error)
      return {
        hasRecommendations: false,
        recommendations: [],
        timestamp: Date.now(),
        cacheStatus: 'miss',
        lastUpdate: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations'
      }
    }
  }

  private static async fetchRecommendations(
    category: string,
    excludeArticleIds: string[],
    limit: number
  ): Promise<RecommendationResponse> {
    const startTime = Date.now()

    // Check if user has preferences
    const preferences = UserPreferencesManager.getPreferences()
    if (preferences.length === 0) {
      return {
        hasRecommendations: false,
        recommendations: [],
        timestamp: Date.now(),
        cacheStatus: 'miss',
        lastUpdate: 0
      }
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.REQUEST_TIMEOUT)
    })

    try {
      // Race between actual request and timeout
      const result = await Promise.race([
        this.performRecommendationQuery(category, excludeArticleIds, limit),
        timeoutPromise
      ])

      const processingTime = Date.now() - startTime
      console.log(`Recommendations processed in ${processingTime}ms`)

      return result

    } catch (error) {
      if (error instanceof Error && error.message === 'Request timeout') {
        console.warn('Recommendation request timed out after 2 seconds')
        return {
          hasRecommendations: false,
          recommendations: [],
          timestamp: Date.now(),
          cacheStatus: 'miss',
          lastUpdate: 0,
          error: 'Request timeout - recommendations unavailable'
        }
      }
      throw error
    }
  }

  private static async performRecommendationQuery(
    category: string,
    excludeArticleIds: string[],
    limit: number
  ): Promise<RecommendationResponse> {
    // Build optimized query
    let query = supabase
      .from('news_articles')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(this.BATCH_SIZE) // Fetch larger batch for better scoring

    // Apply category filter
    if (category && category !== 'Today') {
      query = query.eq('category', category.toLowerCase())
    }

    // Exclude already shown articles
    if (excludeArticleIds.length > 0) {
      query = query.not('id', 'in', `(${excludeArticleIds.join(',')})`)
    }

    const { data: articles, error } = await query

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    if (!articles || articles.length === 0) {
      return {
        hasRecommendations: false,
        recommendations: [],
        timestamp: Date.now(),
        cacheStatus: 'miss',
        lastUpdate: Date.now()
      }
    }

    // Score and filter articles
    const scoredRecommendations = this.scoreAndFilterArticles(articles, limit)

    // Cache the results
    RecommendationCache.set(category, excludeArticleIds, scoredRecommendations)

    return {
      hasRecommendations: scoredRecommendations.length > 0,
      recommendations: scoredRecommendations,
      timestamp: Date.now(),
      cacheStatus: 'miss',
      lastUpdate: Date.now()
    }
  }

  private static scoreAndFilterArticles(articles: NewsArticle[], limit: number): CachedRecommendation[] {
    const scoredArticles = articles
      .map(article => {
        const scoreData = UserPreferencesManager.calculateRecommendationScore(article)
        return {
          ...article,
          score: scoreData.score,
          reasons: scoreData.reasons
        }
      })
      .filter(article => article.score >= this.MIN_SCORE_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scoredArticles.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      published_date: article.published_date,
      article_url: article.article_url,
      image_url: article.image_url,
      source: article.source,
      category: article.category,
      region: article.region,
      score: article.score,
      reasons: article.reasons
    }))
  }

  static async batchUpdateRecommendations(categories: string[]): Promise<void> {
    const updatePromises = categories.map(category => 
      this.getRecommendations({ category, forceRefresh: true })
    )

    try {
      await Promise.allSettled(updatePromises)
      console.log('Batch recommendation update completed')
    } catch (error) {
      console.error('Batch update failed:', error)
    }
  }

  static invalidateCache(category?: string): void {
    RecommendationCache.invalidate(category)
  }

  static getCacheStats() {
    return RecommendationCache.getCacheStats()
  }
}