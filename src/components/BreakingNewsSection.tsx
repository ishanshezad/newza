```tsx
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, ExternalLink, X } from "lucide-react"
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

  if (loading && breakingNews.length === 0) {
    return (
      <div className={\`space-y-3 ${className}`}>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-card border border-border border-l-4 border-l-red-500 rounded-lg overflow-hidden shadow-sm flex flex-col sm:flex-row relative">
              <div className="w-full sm:w-1/3 h-32 sm:h-auto bg-muted relative flex-shrink-0"></div>
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-1"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-3 bg-muted rounded w-20"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && breakingNews.length === 0) {
    return null // Don't show error state for breaking news
  }

  if (breakingNews.length === 0) {
    return null // Don't show anything if no breaking news
  }

  return (
    <div className={\`space-y-3 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">BREAKING NEWS</h2>
      </div>
      
      <AnimatePresence mode="popLayout">
        {breakingNews.map((item, index) => (
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
            className="bg-card border border-border border-l-4 border-l-red-500 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row relative cursor-pointer group"
            onClick={() => handleItemClick(item)}
          >
            {/* Dismiss button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDismiss(item.id)
              }}
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>

            {/* Image Preview */}
            <div className="w-full sm:w-1/3 h-32 sm:h-auto bg-gradient-to-br from-slate-200 to-slate-300 relative flex-shrink-0">
              <img
                src={item.image_url || "https://picsum.photos/400/200?random=breaking"}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-1 text-foreground line-clamp-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-muted-foreground text-xs sm:text-sm leading-snug line-clamp-3 mb-2">
                    {item.description}
                  </p>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xs text-muted-foreground font-medium">
                  {item.source}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(item.detected_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```