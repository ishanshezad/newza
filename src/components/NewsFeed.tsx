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

// Mock breaking news data for horizontal feed
const breakingNewsData = [
  {
    title: "New AI breakthrough in medical diagnostics",
    description: "Researchers announce a significant leap in AI's ability to detect early signs of disease.",
    imageSrc: "https://picsum.photos/400/200?random=100",
    source: "Tech Today",
    uploadTime: "15m ago"
  },
  {
    title: "Global markets react to central bank decision",
    description: "Unexpected interest rate hike sends ripples across stock exchanges worldwide.",
    imageSrc: "https://picsum.photos/400/200?random=101",
    source: "Financial Times",
    uploadTime: "30m ago"
  },
  {
    title: "Rare celestial event visible tonight",
    description: "Astronomers advise stargazers to prepare for a once-in-a-lifetime meteor shower.",
    imageSrc: "https://picsum.photos/400/200?random=102",
    source: "Space.com",
    uploadTime: "1h ago"
  },
  {
    title: "Local elections see record voter turnout",
    description: "Early results indicate a significant shift in political landscape.",
    imageSrc: "https://picsum.photos/400/200?random=103",
    source: "Local Gazette",
    uploadTime: "2h ago"
  },
]

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
      {/* Horizontal Breaking News Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="text-lg font-semibold mb-3 text-foreground">Breaking News</h2>
        <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
          {breakingNewsData.map((article, i) => (
            <EnhancedNewsCard
              key={`breaking-${i}`}
              imageSrc={article.imageSrc}
              title={article.title}
              description={article.description}
              source={article.source}
              uploadTime={article.uploadTime}
              showSuggestMore={true}
              isBreakingNews={true}
              onClick={() => console.log('Breaking news clicked:', article.title)}
            />
          ))}
        </div>
      </motion.div>

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