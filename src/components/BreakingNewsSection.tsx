import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Clock, ExternalLink, Zap, TrendingUp, X } from "lucide-react"
import { supabase, type BreakingNews } from "../lib/breakingNewsSupabase"
import { formatTimeAgo } from "../lib/utils"

interface BreakingNewsSectionProps {
  className?: string
  maxItems?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function BreakingNewsSection({ 
  className = "",
  maxItems = 3,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
}: BreakingNewsSectionProps) {
  const [breakingNews, setBreakingNews] = React.useState<BreakingNews[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [dismissedItems, setDismissedItems] = React.useState<Set<string>>(new Set())

  const fetchBreakingNews = React.useCallback(async () => {
    try {
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('breaking_news')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('urgency_score', { ascending: false })
        .order('detected_at', { ascending: false })
        .limit(maxItems * 2) // Fetch more in case some are dismissed

      if (fetchError) throw fetchError

      // Filter out dismissed items
      const filteredNews = (data || []).filter(item => !dismissedItems.has(item.id))
      setBreakingNews(filteredNews.slice(0, maxItems))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch breaking news')
    } finally {
      setLoading(false)
    }
  }, [maxItems, dismissedItems])

  // Initial fetch
  React.useEffect(() => {
    fetchBreakingNews()
  }, [fetchBreakingNews])

  // Auto-refresh
  React.useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchBreakingNews, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchBreakingNews])

  const handleDismiss = (itemId: string) => {
    setDismissedItems(prev => new Set([...prev, itemId]))
    setBreakingNews(prev => prev.filter(item => item.id !== itemId))
  }

  const handleItemClick = (item: BreakingNews) => {
    window.open(item.article_url, '_blank', 'noopener,noreferrer')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          accent: 'text-red-600 dark:text-red-400',
          icon: 'text-red-600 dark:text-red-400'
        }
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-200',
          accent: 'text-orange-600 dark:text-orange-400',
          icon: 'text-orange-600 dark:text-orange-400'
        }
      default:
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          accent: 'text-yellow-600 dark:text-yellow-400',
          icon: 'text-yellow-600 dark:text-yellow-400'
        }
    }
  }

  const getUrgencyIcon = (urgencyScore: number) => {
    if (urgencyScore >= 80) return <Zap className="h-4 w-4" />
    if (urgencyScore >= 60) return <TrendingUp className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  if (loading && breakingNews.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-red-300 rounded w-1/4"></div>
                  <div className="h-4 bg-red-200 rounded w-3/4"></div>
                  <div className="h-3 bg-red-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && breakingNews.length === 0) {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Failed to load breaking news</span>
        </div>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
      </div>
    )
  }

  if (breakingNews.length === 0) {
    return null // Don't show anything if no breaking news
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence mode="popLayout">
        {breakingNews.map((item, index) => {
          const colors = getPriorityColor(item.priority_level)
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 relative group`}
              onClick={() => handleItemClick(item)}
            >
              {/* Dismiss button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDismiss(item.id)
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>

              <div className="flex items-start gap-3">
                <div className={`${colors.icon} mt-0.5 flex-shrink-0`}>
                  {getUrgencyIcon(item.urgency_score)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-sm ${colors.text} uppercase tracking-wide`}>
                      {item.priority_level === 'critical' ? '🚨 CRITICAL' : 
                       item.priority_level === 'high' ? '⚠️ HIGH PRIORITY' : 
                       '📢 BREAKING NEWS'}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${colors.accent} font-medium`}>
                        Score: {item.urgency_score}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`${colors.text} text-sm font-medium mb-2 leading-tight`}>
                    {item.title}
                  </p>
                  
                  {item.description && (
                    <p className={`${colors.accent} text-sm mb-2 leading-relaxed line-clamp-2`}>
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`${colors.accent} font-medium`}>
                        {item.source}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className={`h-3 w-3 ${colors.accent}`} />
                        <span className={colors.accent}>
                          {formatTimeAgo(item.detected_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs">
                      <ExternalLink className={`h-3 w-3 ${colors.accent}`} />
                      <span className={colors.accent}>Read more</span>
                    </div>
                  </div>

                  {/* Keywords */}
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.keywords.slice(0, 4).map((keyword, keywordIndex) => (
                        <span
                          key={keywordIndex}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.border} border`}
                          style={{ 
                            backgroundColor: `${colors.accent.includes('red') ? '#FEE2E2' : 
                                             colors.accent.includes('orange') ? '#FEF3C7' : '#FEF9C3'}`,
                            color: colors.accent.replace('text-', '').replace(' dark:text-red-400', '')
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}