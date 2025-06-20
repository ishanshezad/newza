import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { NewsCard } from './NewsCard'
import { MovingBorderButton } from './ui/MovingBorderButton'
import { MagicWandIcon } from './ui/MagicWandIcon'
import { useOptimizedRecommendations } from '../hooks/useOptimizedRecommendations'
import { UserPreferencesManager } from '../lib/userPreferences'
import type { NewsArticle } from '../lib/supabase'
import { Sparkles } from "lucide-react";

interface OptimizedRecommendationsSectionProps {
  category?: string
  excludeArticleIds?: string[]
  onArticleClick?: (article: NewsArticle) => void
  className?: string
}

export function OptimizedRecommendationsSection({
  category,
  excludeArticleIds = [],
  onArticleClick,
  className = ''
}: OptimizedRecommendationsSectionProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  
  const {
    recommendations,
    hasRecommendations,
    loading,
    error,
    lastUpdate,
    cacheStatus,
    refreshRecommendations,
    isEnabled
  } = useOptimizedRecommendations({
    category,
    excludeArticleIds,
    limit: 3,
    enabled: true
  })

  const preferences = UserPreferencesManager.getPreferences()

  // Don't render anything if not enabled or no preferences
  if (!isEnabled || preferences.length === 0) {
    return null
  }

  // Don't render if no recommendations and not loading
  if (!hasRecommendations && !loading && !error) {
    return null
  }

  const handleSuggestedClick = (articleId: string, reasons: string[], score: number) => {
    setShowTooltip(showTooltip === articleId ? null : articleId)
  }

  const handlePreferenceChange = (articleId: string, isLiked: boolean) => {
    // Trigger recommendations refresh when preferences change
    if (isLiked) {
      setTimeout(() => refreshRecommendations(), 100)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
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

      {/* Error State */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={refreshRecommendations}
                className="text-xs text-destructive hover:underline"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      <AnimatePresence mode="wait">
        {!loading && !error && hasRecommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {recommendations.map((recommendation, index) => {
              return (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Moving Border Suggested Button */}
                  <div className="absolute top-2 left-2 z-10">
                    <div className="relative">
                      <MovingBorderButton
                        borderRadius="1.75rem"
                        duration={3000}
                        onClick={() => handleSuggestedClick(recommendation.id, recommendation.reasons, recommendation.score)}
                        className="hover:bg-white/20 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          <span>Suggested</span>
                        </div>
                      </MovingBorderButton>

                      {/* Tooltip */}
                      <AnimatePresence>
                        {showTooltip === recommendation.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute left-0 top-8 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg z-30"
                          >
                            <p className="text-xs font-medium text-foreground mb-2">Why this was suggested:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {recommendation.reasons.map((reason, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span className="text-purple-400 mt-0.5">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 pt-2 border-t border-border">
                              <span className="text-xs font-medium text-purple-400">
                                Score: {recommendation.score}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <NewsCard
                    article={recommendation}
                    onClick={onArticleClick}
                    showSuggestMore={false}
                    onPreferenceChange={handlePreferenceChange}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close tooltip */}
      {showTooltip && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowTooltip(null)}
        />
      )}
    </div>
  )
}