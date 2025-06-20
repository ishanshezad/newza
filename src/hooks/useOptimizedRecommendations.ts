import { useState, useEffect, useCallback, useRef } from 'react'
import { RecommendationEngine, type RecommendationOptions } from '../lib/recommendationEngine'
import { type CachedRecommendation, type RecommendationResponse } from '../lib/recommendationCache'
import { UserPreferencesManager } from '../lib/userPreferences'

interface OptimizedRecommendationsState {
  recommendations: CachedRecommendation[]
  hasRecommendations: boolean
  loading: boolean
  error: string | null
  lastUpdate: number
  cacheStatus: 'hit' | 'miss' | 'expired' | null
}

interface UseOptimizedRecommendationsOptions extends RecommendationOptions {
  enabled?: boolean
  refreshInterval?: number
}

export function useOptimizedRecommendations(options: UseOptimizedRecommendationsOptions = {}) {
  const {
    category = 'Today',
    excludeArticleIds = [],
    limit = 3,
    enabled = true,
    refreshInterval = 5 * 60 * 1000 // 5 minutes
  } = options

  const [state, setState] = useState<OptimizedRecommendationsState>({
    recommendations: [],
    hasRecommendations: false,
    loading: false,
    error: null,
    lastUpdate: 0,
    cacheStatus: null
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRecommendations = useCallback(async (forceRefresh = false) => {
    // Check if user has preferences first
    const preferences = UserPreferencesManager.getPreferences()
    if (preferences.length === 0) {
      setState(prev => ({
        ...prev,
        recommendations: [],
        hasRecommendations: false,
        loading: false,
        error: null
      }))
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }))

    try {
      const response: RecommendationResponse = await RecommendationEngine.getRecommendations({
        category,
        excludeArticleIds,
        limit,
        forceRefresh
      })

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      setState(prev => ({
        ...prev,
        recommendations: response.recommendations,
        hasRecommendations: response.hasRecommendations,
        loading: false,
        error: response.error || null,
        lastUpdate: response.lastUpdate,
        cacheStatus: response.cacheStatus
      }))

    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      console.error('Failed to fetch recommendations:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        hasRecommendations: false,
        recommendations: []
      }))
    }
  }, [category, excludeArticleIds, limit])

  const refreshRecommendations = useCallback(() => {
    fetchRecommendations(true)
  }, [fetchRecommendations])

  // Initial fetch and dependency changes
  useEffect(() => {
    if (!enabled) return

    fetchRecommendations()
  }, [fetchRecommendations, enabled])

  // Auto-refresh interval
  useEffect(() => {
    if (!enabled || !refreshInterval) return

    refreshTimeoutRef.current = setInterval(() => {
      // Only refresh if we have recommendations and no error
      if (state.hasRecommendations && !state.error) {
        fetchRecommendations()
      }
    }, refreshInterval)

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
    }
  }, [enabled, refreshInterval, state.hasRecommendations, state.error, fetchRecommendations])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
    }
  }, [])

  // Listen for preference changes to trigger refresh
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'news_user_preferences') {
        // Delay to allow preference update to complete
        setTimeout(() => fetchRecommendations(true), 100)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [fetchRecommendations])

  return {
    ...state,
    refreshRecommendations,
    isEnabled: enabled && UserPreferencesManager.getPreferences().length > 0
  }
}