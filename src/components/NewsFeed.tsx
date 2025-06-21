import * as React from "react"
import { useInView } from "react-intersection-observer"
import { NewsCard } from "./NewsCard"
import { OptimizedRecommendationsSection } from "./OptimizedRecommendationsSection"
import { LoadingSkeleton } from "./ui/LoadingSkeleton"
import { supabase, type NewsArticle } from "../lib/supabase"
import { BangladeshNewsAgent } from "../lib/bangladeshAgent"
import { SourceRankingService } from "../lib/sourceRanking"
import { UserPreferencesManager } from "../lib/userPreferences"
import { Loader2, AlertCircle, Star, TrendingUp, Users, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { EnhancedNewsCard } from "./ui/EnhancedNewsCard"
import { formatTimeAgo } from "../lib/utils"

interface NewsFeedProps {
  category?: string
  searchQuery?: string
  region?: string
}

interface EnhancedNewsArticle extends NewsArticle {
  priority_score?: number
  source_tier?: string
}

interface BreakingNewsAlert {
  id: string
  alert_type: string
  alert_message: string
  severity: string
  sent_at: string
  created_at: string
  breaking_news: {
    id: string
    title: string
    description: string | null
    article_url: string
    image_url: string | null
    source: string
    priority_level: string
    urgency_score: number
    published_date: string
    detected_at: string
    keywords: string[]
  }
}

export function NewsFeed({ category = "Today", searchQuery = "", region }: NewsFeedProps) {
  const [articles, setArticles] = React.useState<EnhancedNewsArticle[]>([])
  const [breakingNewsAlerts, setBreakingNewsAlerts] = React.useState<BreakingNewsAlert[]>([])
  const [loading, setLoading] = React.useState(true)
  const [breakingNewsLoading, setBreakingNewsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [hasMore, setHasMore] = React.useState(true)
  const [page, setPage] = React.useState(0)
  
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  const ITEMS_PER_PAGE = 10

  // Enhanced breaking news alerts fetch with comprehensive filtering
  const fetchBreakingNewsAlerts = React.useCallback(async () => {
    if (category !== "Today") {
      setBreakingNewsAlerts([])
      setBreakingNewsLoading(false)
      return
    }

    try {
      setBreakingNewsLoading(true)
      
      // Define tier 1 sources for breaking news (most reputable)
      const tier1Sources = [
        'reuters', 'bbc', 'cnn', 'al jazeera', 'aljazeera', 'associated press', 'ap news',
        'new york times', 'nytimes', 'the guardian', 'washington post', 'france24', 
        'deutsche welle', 'npr', 'pbs', 'abc news', 'cbs news', 'nbc news'
      ]
      
      // Fetch breaking news alerts with joined breaking news data
      const { data, error } = await supabase
        .from('breaking_news_alerts')
        .select(`
          *,
          breaking_news!inner(
            id,
            title,
            description,
            article_url,
            image_url,
            source,
            priority_level,
            urgency_score,
            published_date,
            detected_at,
            keywords,
            is_active,
            expires_at
          )
        `)
        .eq('breaking_news.is_active', true)
        .gt('breaking_news.expires_at', new Date().toISOString())
        .gte('breaking_news.urgency_score', 60) // Only high urgency breaking news
        .in('severity', ['critical', 'high']) // Only critical and high severity alerts
        .order('sent_at', { ascending: false })
        .limit(50) // Fetch more to filter comprehensively

      if (error) throw error

      // Comprehensive filtering for top sources only
      const filteredAlerts = (data || []).filter(alert => {
        const breakingNews = alert.breaking_news
        const sourceLower = breakingNews.source.toLowerCase()
        
        // Check if source is from tier 1 list
        const isTier1Source = tier1Sources.some(tier1Source => 
          sourceLower.includes(tier1Source) || tier1Source.includes(sourceLower)
        )
        
        // Additional quality checks
        const hasGoodContent = breakingNews.title && breakingNews.title.length > 20 && 
                              breakingNews.description && breakingNews.description.length > 50
        
        // Check for breaking news keywords
        const hasBreakingKeywords = breakingNews.keywords && breakingNews.keywords.length > 0 &&
                                   breakingNews.keywords.some(keyword => 
                                     ['breaking', 'urgent', 'alert', 'developing'].includes(keyword.toLowerCase())
                                   )
        
        // Validate source with urgency score
        const isValidSource = SourceRankingService.validateBreakingNewsSource(
          breakingNews.source, 
          breakingNews.urgency_score
        )
        
        return isTier1Source && hasGoodContent && isValidSource && 
               (hasBreakingKeywords || breakingNews.urgency_score >= 75)
      })

      // Enhanced sorting with multiple criteria
      const sortedAlerts = filteredAlerts.sort((a, b) => {
        const breakingNewsA = a.breaking_news
        const breakingNewsB = b.breaking_news
        
        // Primary: Alert severity (critical > high)
        const severityOrder = { critical: 100, high: 75, medium: 50, low: 25 }
        const severityA = severityOrder[a.severity as keyof typeof severityOrder] || 0
        const severityB = severityOrder[b.severity as keyof typeof severityOrder] || 0
        
        if (severityA !== severityB) {
          return severityB - severityA
        }
        
        // Secondary: Breaking news priority level
        const priorityOrder = { critical: 100, high: 75, medium: 50 }
        const priorityA = priorityOrder[breakingNewsA.priority_level as keyof typeof priorityOrder] || 0
        const priorityB = priorityOrder[breakingNewsB.priority_level as keyof typeof priorityOrder] || 0
        
        if (priorityA !== priorityB) {
          return priorityB - priorityA
        }
        
        // Tertiary: Urgency score
        if (breakingNewsA.urgency_score !== breakingNewsB.urgency_score) {
          return breakingNewsB.urgency_score - breakingNewsA.urgency_score
        }
        
        // Quaternary: Source credibility
        const sourceScoreA = SourceRankingService.getSourcePriority(breakingNewsA.source).priority
        const sourceScoreB = SourceRankingService.getSourcePriority(breakingNewsB.source).priority
        
        if (sourceScoreA !== sourceScoreB) {
          return sourceScoreB - sourceScoreA
        }
        
        // Final: Alert recency
        return new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      })

      // Limit to top 8 breaking news alerts
      setBreakingNewsAlerts(sortedAlerts.slice(0, 8))
    } catch (err) {
      console.error('Failed to fetch breaking news alerts:', err)
      setBreakingNewsAlerts([])
    } finally {
      setBreakingNewsLoading(false)
    }
  }, [category])

  const fetchArticles = React.useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch more articles than needed for proper sorting by source priority
      const fetchLimit = Math.min((pageNum + 1) * ITEMS_PER_PAGE + 200, 500)

      let query = supabase
        .from('news_articles')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(fetchLimit)

      // Apply category filter
      if (category && category !== "Today") {
        query = query.eq('category', category.toLowerCase())
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply region filter
      if (region) {
        query = query.eq('region', region.toLowerCase())
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      let newArticles = data || []
      
      // Apply aggressive source prioritization
      const prioritizedArticles = SourceRankingService.prioritizeArticlesBySource(newArticles)
      
      // Add source tier information and priority scores
      const articlesWithMetadata = prioritizedArticles.map(article => {
        const sourcePriority = SourceRankingService.getSourcePriority(article.source)
        const priorityScore = SourceRankingService.calculateFeedPriority(article)
        
        return {
          ...article,
          priority_score: priorityScore,
          source_tier: sourcePriority.category
        }
      })

      // Apply Bangladesh prioritization for "Today" category (as secondary factor)
      let finalArticles = articlesWithMetadata
      if (category === "Today" && !searchQuery) {
        // For "Today" category, apply Bangladesh relevance as a secondary factor within same source tier
        finalArticles = articlesWithMetadata.sort((a, b) => {
          // Primary: Source tier (tier1 always first)
          if (a.source_tier !== b.source_tier) {
            const tierOrder = { tier1: 3, tier2: 2, tier3: 1 }
            return tierOrder[b.source_tier as keyof typeof tierOrder] - tierOrder[a.source_tier as keyof typeof tierOrder]
          }
          
          // Secondary: Within same tier, apply Bangladesh relevance
          const bangladeshScoreA = BangladeshNewsAgent.calculateBangladeshRelevanceScore(a)
          const bangladeshScoreB = BangladeshNewsAgent.calculateBangladeshRelevanceScore(b)
          
          if (Math.abs(bangladeshScoreA - bangladeshScoreB) > 10) {
            return bangladeshScoreB - bangladeshScoreA
          }
          
          // Tertiary: Priority score
          return (b.priority_score || 0) - (a.priority_score || 0)
        })
      }

      // Paginate the sorted results
      const startIndex = pageNum * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const paginatedArticles = finalArticles.slice(startIndex, endIndex)
      
      if (reset) {
        setArticles(paginatedArticles)
      } else {
        setArticles(prev => [...prev, ...paginatedArticles])
      }
      
      setHasMore(endIndex < finalArticles.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }, [category, searchQuery, region])

  // Reset and fetch when filters change
  React.useEffect(() => {
    setPage(0)
    setArticles([])
    setHasMore(true)
    fetchArticles(0, true)
    fetchBreakingNewsAlerts()
  }, [fetchArticles, fetchBreakingNewsAlerts])

  // Load more when scrolling
  React.useEffect(() => {
    if (inView && hasMore && !loading && page > 0) {
      fetchArticles(page)
    }
  }, [inView, hasMore, loading, page, fetchArticles])

  // Update page when we need to load more
  React.useEffect(() => {
    if (inView && hasMore && !loading && articles.length > 0) {
      setPage(prev => prev + 1)
    }
  }, [inView, hasMore, loading, articles.length])

  const handleArticleClick = (article: NewsArticle | BreakingNewsAlert) => {
    const url = 'breaking_news' in article ? article.breaking_news.article_url : article.article_url
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handlePreferenceChange = (articleId: string, isLiked: boolean) => {
    // Trigger recommendations refresh when preferences change
    // The OptimizedRecommendationsSection will handle this automatically
  }

  if (loading && articles.length === 0) {
    return (
      <LoadingSkeleton variant="card" count={5} />
    )
  }

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load news</h3>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
        <button
          onClick={() => fetchArticles(0, true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h3 className="text-lg font-semibold mb-2">No articles found</h3>
        <p className="text-muted-foreground text-center">
          {searchQuery 
            ? `No articles match "${searchQuery}"`
            : `No articles available for ${category}`
          }
        </p>
      </div>
    )
  }

  const articleIds = articles.map(article => article.id)

  return (
    <div className="space-y-6">
      {/* Clean Breaking News Section - Only in Today tab */}
      {category === "Today" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold mb-3 text-foreground">Breaking News</h2>
          
          {breakingNewsLoading ? (
            <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64">
                  <LoadingSkeleton variant="card" count={1} />
                </div>
              ))}
            </div>
          ) : breakingNewsAlerts.length > 0 ? (
            <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
              {breakingNewsAlerts.map((alert) => {
                const breakingNews = alert.breaking_news
                
                return (
                  <EnhancedNewsCard
                    key={alert.id}
                    imageSrc={breakingNews.image_url}
                    title={breakingNews.title}
                    description={breakingNews.description}
                    source={breakingNews.source}
                    uploadTime={formatTimeAgo(alert.sent_at)}
                    showSuggestMore={true}
                    isBreakingNews={true}
                    onClick={() => handleArticleClick(alert)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8" />
                <p>No breaking news alerts available</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Optimized Recommendations Section - Show after first few articles */}
      {articles.length >= 3 && (
        <OptimizedRecommendationsSection
          category={category}
          excludeArticleIds={articleIds}
          onArticleClick={handleArticleClick}
          className="my-8"
        />
      )}

      {/* Vertical News Feed */}
      <div className="space-y-4">
        {articles.map((article, index) => {
          const isTopSource = SourceRankingService.isTopPrioritySource(article.source)
          
          return (
            <div key={article.id} className="relative">
              <NewsCard
                article={{
                  ...article,
                  source_tier: article.source_tier
                }}
                onClick={handleArticleClick}
                onPreferenceChange={handlePreferenceChange}
                index={index}
              />

              {/* Show recommendations after every 8th article */}
              {(index + 1) % 8 === 0 && index < articles.length - 1 && (
                <div className="mt-6">
                  <OptimizedRecommendationsSection
                    category={category}
                    excludeArticleIds={articleIds.slice(0, index + 1)}
                    onArticleClick={handleArticleClick}
                    className=""
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Loading indicator */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading more articles...</span>
            </motion.div>
          )}
        </div>
      )}
      
      {!hasMore && articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2">
            <Star className="h-4 w-4" />
            <span>All articles loaded • Prioritized by source quality and relevance</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}