import * as React from "react"
import { useInView } from "react-intersection-observer"
import { EnhancedNewsCard } from "./ui/EnhancedNewsCard"
import { Timeline } from "./ui/Timeline"
import { LoadingSkeleton } from "./ui/LoadingSkeleton"
import { supabase, type MiddleEastWarArticle } from "../lib/middleEastWarSupabase"
import { SourceRankingService } from "../lib/sourceRanking"
import { Loader2, AlertCircle, Clock, Star, AlertTriangle, TrendingUp, Users, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { formatTimeAgo } from "../lib/utils"

interface MiddleEastWarFeedProps {
  searchQuery?: string
  selectedTags?: string[]
}

interface EnhancedMiddleEastWarArticle extends MiddleEastWarArticle {
  priority_score?: number
  matched_keywords?: string[]
  tag_count?: number
  source_tier?: string
  middleeastwar_tag_assignments?: any[]
}

interface TimelineEntry {
  title: string
  content: React.ReactNode
}

export function MiddleEastWarFeed({ searchQuery = "", selectedTags = [] }: MiddleEastWarFeedProps) {
  const [articles, setArticles] = React.useState<EnhancedMiddleEastWarArticle[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [hasMore, setHasMore] = React.useState(true)
  const [page, setPage] = React.useState(0)
  const [totalArticles, setTotalArticles] = React.useState(0)
  
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  const ITEMS_PER_PAGE = 15

  // High-priority keywords from the MiddleEastWarTag table
  const HIGH_PRIORITY_KEYWORDS = [
    'iran', 'israel', 'airstrike', 'missile', 'gaza', 'hezbollah', 'idf', 'irgc',
    'nuclear', 'civilian casualties', 'hospital', 'breaking', 'urgent', 'attack',
    'bombing', 'rocket', 'drone', 'ballistic', 'precision strike', 'operation',
    'escalation', 'emergency', 'evacuation', 'humanitarian crisis', 'refugee',
    'iron dome', 'air defense', 'regional spillover', 'sanctions', 'diplomacy'
  ]

  const calculatePriorityScore = (article: MiddleEastWarArticle, tagAssignments: any[] = []): number => {
    let score = 0
    const content = `${article.title} ${article.description || ''}`.toLowerCase()
    const matchedKeywords: string[] = []

    // Base score from recency (newer articles get higher base score)
    const hoursOld = (Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60)
    const recencyScore = Math.max(0, 100 - (hoursOld / 24) * 10) // Decrease by 10 points per day
    score += recencyScore

    // Apply aggressive source priority scoring (MAJOR BOOST for popular sources)
    const sourceScore = SourceRankingService.calculateFeedPriority({
      source: article.source,
      published_date: article.published_date,
      title: article.title,
      description: article.description
    })
    score = sourceScore

    // Keyword matching with weighted scores
    HIGH_PRIORITY_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword)
        // Higher score for title matches
        if (article.title.toLowerCase().includes(keyword.toLowerCase())) {
          score += 25
        } else {
          score += 15
        }
      }
    })

    // Bonus for multiple keyword matches
    if (matchedKeywords.length > 1) {
      score += matchedKeywords.length * 10
    }

    // Tag-based scoring
    const tagCount = tagAssignments.length
    score += tagCount * 5

    // High relevance tag bonus
    tagAssignments.forEach((assignment: any) => {
      if (assignment.relevance_score > 80) {
        score += 20
      } else if (assignment.relevance_score > 60) {
        score += 10
      }
    })

    // Breaking news indicators
    if (content.includes('breaking') || content.includes('urgent') || content.includes('alert')) {
      score += 50
    }

    return Math.round(score)
  }

  const fetchArticles = React.useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true)
      setError(null)

      // First, get the total count for pagination
      let countQuery = supabase
        .from('middleeastwararticles')
        .select('id', { count: 'exact', head: true })

      if (searchQuery) {
        countQuery = countQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      if (selectedTags.length > 0) {
        countQuery = countQuery.in('id', 
          supabase
            .from('middleeastwar_tag_assignments')
            .select('article_id')
            .in('tag_id', 
              supabase
                .from('middleeastwartagtable')
                .select('id')
                .in('slug', selectedTags)
            )
        )
      }

      const { count } = await countQuery
      setTotalArticles(count || 0)

      // Fetch more articles than needed for proper sorting by source priority
      const fetchLimit = Math.min((pageNum + 1) * ITEMS_PER_PAGE + 200, 600)

      // Fetch articles with tag assignments for priority calculation
      let query = supabase
        .from('middleeastwararticles')
        .select(`
          *,
          middleeastwar_tag_assignments(
            tag_id,
            relevance_score,
            middleeastwartagtable(
              name,
              slug,
              color,
              usage_count
            )
          )
        `)
        .limit(fetchLimit)

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply tag filter
      if (selectedTags.length > 0) {
        query = query.in('id', 
          supabase
            .from('middleeastwar_tag_assignments')
            .select('article_id')
            .in('tag_id', 
              supabase
                .from('middleeastwartagtable')
                .select('id')
                .in('slug', selectedTags)
            )
        )
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Calculate priority scores and apply aggressive source prioritization
      const articlesWithPriority = (data || []).map(article => {
        const tagAssignments = article.middleeastwar_tag_assignments || []
        const priorityScore = calculatePriorityScore(article, tagAssignments)
        const sourcePriority = SourceRankingService.getSourcePriority(article.source)
        
        const content = `${article.title} ${article.description || ''}`.toLowerCase()
        const matchedKeywords = HIGH_PRIORITY_KEYWORDS.filter(keyword => 
          content.includes(keyword.toLowerCase())
        )

        return {
          ...article,
          priority_score: priorityScore,
          matched_keywords: matchedKeywords,
          tag_count: tagAssignments.length,
          source_tier: sourcePriority.category
        }
      })

      // Sort with aggressive source priority emphasis
      const sortedArticles = articlesWithPriority.sort((a, b) => {
        // Primary sort: Source tier (tier1 always comes first)
        if (a.source_tier !== b.source_tier) {
          const tierOrder = { tier1: 3, tier2: 2, tier3: 1 }
          return tierOrder[b.source_tier as keyof typeof tierOrder] - tierOrder[a.source_tier as keyof typeof tierOrder]
        }
        
        // Secondary sort: Priority score (content relevance) within same tier
        if (a.priority_score !== b.priority_score) {
          return (b.priority_score || 0) - (a.priority_score || 0)
        }
        
        // Tertiary sort: Published date (newer is better)
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
      })

      // Paginate the sorted results
      const startIndex = pageNum * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const paginatedArticles = sortedArticles.slice(startIndex, endIndex)
      
      if (reset) {
        setArticles(paginatedArticles)
      } else {
        setArticles(prev => [...prev, ...paginatedArticles])
      }
      
      setHasMore(endIndex < sortedArticles.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Middle East war articles')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedTags])

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

  const handleArticleClick = (article: EnhancedMiddleEastWarArticle) => {
    window.open(article.article_url, '_blank', 'noopener,noreferrer')
  }

  // Group articles by date for timeline view
  const groupArticlesByDate = (articles: EnhancedMiddleEastWarArticle[]): TimelineEntry[] => {
    const grouped: { [key: string]: EnhancedMiddleEastWarArticle[] } = {}
    
    articles.forEach(article => {
      const date = new Date(article.published_date)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let dateKey: string
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today"
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Yesterday"
      } else {
        dateKey = date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        })
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(article)
    })

    return Object.entries(grouped).map(([date, articles]) => ({
      title: date,
      content: (
        <div className="space-y-4">
          {articles.map((article, index) => {
            // Extract tags from the joined data
            const articleTags = article.middleeastwar_tag_assignments?.map((assignment: any) => ({
              name: assignment.middleeastwartagtable.name,
              slug: assignment.middleeastwartagtable.slug,
              color: assignment.middleeastwartagtable.color,
              usage_count: assignment.middleeastwartagtable.usage_count,
              relevance_score: assignment.relevance_score
            })) || []

            // Sort tags by relevance score
            articleTags.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))

            const isHighPriority = (article.priority_score || 0) > 150

            return (
              <EnhancedNewsCard
                key={article.id}
                imageSrc={article.image_url}
                title={article.title}
                description={article.description}
                source={article.source}
                uploadTime={formatTimeAgo(article.published_date)}
                showSuggestMore={false}
                onClick={() => handleArticleClick(article)}
                className={`
                  ${isHighPriority ? 'border-red-500/30 bg-red-500/5' : ''}
                `}
                index={index}
              >
                {/* Tags */}
                {articleTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {articleTags.slice(0, 5).map((tag: any, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${tag.color}20`, 
                          color: tag.color,
                          border: `1px solid ${tag.color}30`
                        }}
                      >
                        {tag.name}
                        {tag.relevance_score > 80 && (
                          <span className="ml-1 text-yellow-400">★</span>
                        )}
                      </span>
                    ))}
                    {articleTags.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        +{articleTags.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </EnhancedNewsCard>
            )
          })}
        </div>
      )
    }))
  }

  if (loading && articles.length === 0) {
    return (
      <LoadingSkeleton variant="timeline" count={1} />
    )
  }

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load Middle East war news</h3>
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
        <h3 className="text-lg font-semibold mb-2">No Middle East war articles found</h3>
        <p className="text-muted-foreground text-center">
          {searchQuery 
            ? `No articles match "${searchQuery}"`
            : selectedTags.length > 0
            ? `No articles found with selected tags`
            : `No Middle East war articles available`
          }
        </p>
      </div>
    )
  }

  const timelineData = groupArticlesByDate(articles)

  return (
    <div className="space-y-6">
      {/* Latest Developments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mb-3"
      >
        <h2 className="text-lg font-semibold mb-3 text-foreground">Latest Developments</h2>
        <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
          <div className="flex-shrink-0 w-72 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm">CEASEFIRE TALKS</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  Negotiations have resumed with international mediators present. Both sides report cautious optimism.
                </p>
                <span className="text-xs text-red-600 dark:text-red-400">2 minutes ago</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-72 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">HUMANITARIAN AID</h3>
                <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                  New convoy reaches affected areas with medical supplies and food assistance.
                </p>
                <span className="text-xs text-orange-600 dark:text-orange-400">15 minutes ago</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-72 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">BORDER UPDATE</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  International observers report reduced military activity along disputed borders.
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-400">32 minutes ago</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-72 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200 text-sm">DIPLOMATIC PROGRESS</h3>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  Regional leaders express support for ongoing peace initiatives and dialogue.
                </p>
                <span className="text-xs text-green-600 dark:text-green-400">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Timeline View */}
      <Timeline data={timelineData} />
      
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