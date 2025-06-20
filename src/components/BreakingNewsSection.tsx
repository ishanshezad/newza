import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, ExternalLink, X, AlertTriangle, Zap, TrendingUp } from "lucide-react"
import { supabase, type BreakingNewsAlert } from "../lib/breakingNewsSupabase"
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
  const [breakingNewsAlerts, setBreakingNewsAlerts] = React.useState<BreakingNewsAlert[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [dismissedItems, setDismissedItems] = React.useState<Set<string>>(new Set())

  const fetchBreakingNewsAlerts = React.useCallback(async () => {
    try {
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('breaking_news_alerts')
        .select(`
          *,
          breaking_news (
            id,
            title,
            description,
            article_url,
            image_url,
            source,
            priority_level,
            urgency_score,
            keywords,
            published_date,
            detected_at,
            is_active,
            expires_at
          )
        `)
        .not('breaking_news.is_active', 'eq', false)
        .gte('breaking_news.expires_at', new Date().toISOString())
        .order('sent_at', { ascending: false })
        .limit(maxItems * 2) // Fetch more in case some are dismissed

      if (fetchError) throw fetchError

      // Filter out dismissed items and ensure we have valid breaking news data
      const filteredAlerts = (data || [])
        .filter(alert => 
          alert.breaking_news && 
          !dismissedItems.has(alert.id) &&
          alert.breaking_news.is_active
        )
        .slice(0, maxItems)

      setBreakingNewsAlerts(filteredAlerts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch breaking news alerts')
    } finally {
      setLoading(false)
    }
  }, [maxItems, dismissedItems])

  // Initial fetch
  React.useEffect(() => {
    fetchBreakingNewsAlerts()
  }, [fetchBreakingNewsAlerts])

  // Auto-refresh
  React.useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchBreakingNewsAlerts, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchBreakingNewsAlerts])

  const handleDismiss = (alertId: string) => {
    setDismissedItems(prev => new Set([...prev, alertId]))
    setBreakingNewsAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const handleItemClick = (alert: BreakingNewsAlert) => {
    if (alert.breaking_news?.article_url) {
      window.open(alert.breaking_news.article_url, '_blank', 'noopener,noreferrer')
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high':
        return <Zap className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500'
      case 'high':
        return 'border-l-orange-500'
      case 'medium':
        return 'border-l-yellow-500'
      default:
        return 'border-l-blue-500'
    }
  }

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'new':
        return 'NEW'
      case 'update':
        return 'UPDATE'
      case 'escalation':
        return 'ESCALATION'
      default:
        return 'ALERT'
    }
  }

  if (loading && breakingNewsAlerts.length === 0) {
    return (
      <div className={className}>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">BREAKING NEWS ALERTS</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="animate-pulse flex-shrink-0 w-80">
              <div className="bg-card border border-border border-l-4 border-l-red-500 rounded-lg overflow-hidden shadow-sm flex flex-col relative h-48">
                <div className="w-full h-24 bg-muted relative flex-shrink-0"></div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-1"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-3 bg-muted rounded w-20"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && breakingNewsAlerts.length === 0) {
    return null // Don't show error state for breaking news
  }

  if (breakingNewsAlerts.length === 0) {
    return null // Don't show anything if no breaking news alerts
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">BREAKING NEWS ALERTS</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        <AnimatePresence mode="popLayout">
          {breakingNewsAlerts.map((alert, index) => {
            const breakingNews = alert.breaking_news
            if (!breakingNews) return null

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className={`bg-card border border-border border-l-4 ${getSeverityColor(alert.severity)} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative cursor-pointer group flex-shrink-0 w-80 h-48`}
                onClick={() => handleItemClick(alert)}
              >
                {/* Dismiss button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDismiss(alert.id)
                  }}
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>

                {/* Alert Type Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-border rounded-full px-2 py-1">
                    {getSeverityIcon(alert.severity)}
                    <span className="text-xs font-medium text-foreground">
                      {getAlertTypeLabel(alert.alert_type)}
                    </span>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="w-full h-24 bg-gradient-to-br from-slate-200 to-slate-300 relative flex-shrink-0">
                  <img
                    src={breakingNews.image_url || "https://picsum.photos/400/200?random=breaking"}
                    alt={breakingNews.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 text-foreground line-clamp-2">
                      {alert.alert_message}
                    </h3>
                    {breakingNews.description && (
                      <p className="text-muted-foreground text-xs leading-snug line-clamp-2 mb-2">
                        {breakingNews.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-muted-foreground font-medium truncate mr-2">
                      {breakingNews.source}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(alert.sent_at)}
                        </span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}