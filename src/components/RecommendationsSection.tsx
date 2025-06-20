import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, TrendingUp } from 'lucide-react'
import { NewsCard } from './NewsCard'
import { NotificationBar } from './NotificationBar'
import { useRecommendations } from '../hooks/useRecommendations'
import { UserPreferencesManager } from '../lib/userPreferences'
import type { NewsArticle } from '../lib/supabase'

interface RecommendationsSectionProps {
  category?: string
  excludeArticleIds?: string[]
  onArticleClick?: (article: NewsArticle) => void
  className?: string
}

export function RecommendationsSection({
  category,
  excludeArticleIds = [],
  onArticleClick,
  className = ''
}: RecommendationsSectionProps) {
  const { recommendations, scores, loading, error, refreshRecommendations } = useRecommendations({
    category,
    excludeArticleIds,
    limit: 3
  })

  const preferences = UserPreferencesManager.getPreferences()
  const hasPreferences = preferences.length > 0

  // Don't show section if user has no preferences OR no recommendations
  if (!hasPreferences || (!loading && !error && recommendations.length === 0)) {
    return null
  }

  // Show notification bar when there's an error (failed to load recommendations)
  const showNotificationBar = !!error && !loading

  return (
    <>
      {/* Notification Bar for failed recommendations */}
      <NotificationBar 
        show={showNotificationBar}
        message="Compiling data to build recommendations..."
        type="success"
        showSpinner={true}
      />

      <div className={`space-y-4 ${className}`}>
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Suggested for You</h2>
              <p className="text-sm text-muted-foreground">
                Based on your {preferences.length} liked article{preferences.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={refreshRecommendations}
            disabled={loading}
            className="p-2 rounded-full hover:bg-accent transition-colors disabled:opacity-50"
            aria-label="Refresh recommendations"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center py-8"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Finding articles you might like...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State - Now hidden since we show notification bar instead */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Recommendations */}
        <AnimatePresence mode="wait">
          {!loading && !error && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {recommendations.map((article, index) => {
                const score = scores[article.id]
                
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Recommendation Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-gradient-to-r from-white-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Suggested</span>
                        {score && score.score > 50 && (
                          <span className="text-yellow-200">★</span>
                        )}
                      </div>
                    </div>

                    {/* Recommendation Reasons Tooltip */}
                    {score && score.reasons.length > 0 && (
                      <div className="absolute top-2 right-2 z-10">
                        <div 
                          className="group relative"
                          title={`Why this was suggested:\n${score.reasons.join('\n')}`}
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-xs text-blue-400 font-medium">?</span>
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute right-0 top-8 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <p className="text-xs font-medium text-foreground mb-2">Why this was suggested:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {score.reasons.map((reason, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-blue-400 mt-0.5">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 pt-2 border-t border-border">
                              <span className="text-xs font-medium text-blue-400">
                                Score: {score.score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <NewsCard
                      article={article}
                      onClick={onArticleClick}
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}