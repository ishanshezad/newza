import * as React from "react"
import { useInView } from "react-intersection-observer"
import { NewsCard } from "./NewsCard"
import { OptimizedRecommendationsSection } from "./OptimizedRecommendationsSection"
import { LoadingSkeleton } from "./ui/LoadingSkeleton"
import { supabase, type NewsArticle } from "../lib/supabase"
import { BangladeshNewsAgent } from "../lib/bangladeshAgent"
import { SourceRankingService } from "../lib/sourceRanking"
import { UserPreferencesManager } from "../lib/userPreferences"
import { Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface NewsFeedProps {
  category?: string
  searchQuery?: string
  region?: string
}

interface EnhancedNewsArticle extends NewsArticle {
  priority_score?: number
  source_tier?: string
}

export function NewsFeed({ category = "Today", searchQuery = "", region }: NewsFeedProps) {
  const [articles, setArticles] = React.useState<EnhancedNewsArticle[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [hasMore, setHasMore] = React.useState(true)
  const [page, setPage] = React.useState(0)
  
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  const ITEMS_PER_PAGE = 10

  const calculateArticlePriority = (article: NewsArticle): number => {
    let score = 0
    
    // Base recency score (newer articles get higher base score)
    const hoursOld = (Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60)
    const recencyScore = Math.max(0, 100 - (hoursOld / 24) * 5) // Decrease by 5 points per day
    score += recencyScore

    // Apply source priority scoring
    const sourceScore = SourceRankingService.calculateSourceScore(article.source, score)
    
    return Math.round(sourceScore)
  }

  const fetchArticles = React.useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch more articles than needed for proper sorting by source priority
      const fetchLimit = Math.min((pageNum + 1) * ITEMS_PER_PAGE + 100, 300)

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
      
      // Calculate priority scores and add source tier information
      const articlesWithPriority = newArticles.map(article => {
        const priorityScore = calculateArticlePriority(article)
        const sourcePriority = SourceRankingService.getSourcePriority(article.source)
        
        return {
          ...article,
          priority_score: priorityScore,
          source_tier: sourcePriority.category
        }
      })

      // Sort by priority score (highest first), then by published date (newest first)
      const sortedArticles = articlesWithPriority.sort((a, b) => {
        // Primary sort: Priority score (higher is better)
        if (a.priority_score !== b.priority_score) {
          return (b.priority_score || 0) - (a.priority_score || 0)
        }
        // Secondary sort: Published date (newer is better)
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
      })

      // Apply Bangladesh prioritization for "Today" category (after source prioritization)
      let finalArticles = sortedArticles
      if (category === "Today" && !searchQuery) {
        // For "Today" category, apply Bangladesh relevance as a secondary factor
        finalArticles = sortedArticles.sort((a, b) => {
          const sourcePriorityA = SourceRankingService.getSourcePriority(a.source).priority
          const sourcePriorityB = SourceRankingService.getSourcePriority(b.source).priority
          
          // If same source tier, then apply Bangladesh relevance
          if (Math.abs(sourcePriorityA - sourcePriorityB) < 20) {
            const bangladeshScoreA = BangladeshNewsAgent.calculateBangladeshRelevanceScore(a)
            const bangladeshScoreB = BangladeshNewsAgent.calculateBangladeshRelevanceScore(b)
            
            if (bangladeshScoreA !== bangladeshScoreB) {
              return bangladeshScoreB - bangladeshScoreA
            }
          }
          
          // Otherwise maintain priority score order
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
  }, [fetchArticles])

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

  const handleArticleClick = (article: NewsArticle) => {
    window.open(article.article_url, '_blank', 'noopener,noreferrer')
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
      {/* Optimized Recommendations Section - Show after first few articles */}
      {articles.length >= 3 && (
        <OptimizedRecommendationsSection
          category={category}
          excludeArticleIds={articleIds}
          onArticleClick={handleArticleClick}
          className="my-8"
        />
      )}

      {/* Articles Grid */}
      <div className="space-y-4">
        {articles.map((article, index) => {
          return (
            <div key={article.id} className="relative">
              <NewsCard
                article={article}
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
          No more articles to load
        </motion.div>
      )}
    </div>
  )
}