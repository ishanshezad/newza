import { useState, useEffect, useCallback } from 'react'
import { supabase, type NewsArticle } from '../lib/supabase'
import { UserPreferencesManager, type RecommendationScore } from '../lib/userPreferences'

interface UseRecommendationsOptions {
  category?: string
  excludeArticleIds?: string[]
  limit?: number
}

interface RecommendationsState {
  recommendations: NewsArticle[]
  scores: Record<string, RecommendationScore>
  loading: boolean
  error: string | null
}

export function useRecommendations({
  category,
  excludeArticleIds = [],
  limit = 5
}: UseRecommendationsOptions = {}) {
  const [state, setState] = useState<RecommendationsState>({
    recommendations: [],
    scores: {},
    loading: false,
    error: null
  })

  const fetchRecommendations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Get user preferences to determine if we should show recommendations
      const preferences = UserPreferencesManager.getPreferences()
      
      if (preferences.length === 0) {
        setState(prev => ({ 
          ...prev, 
          recommendations: [], 
          scores: {},
          loading: false 
        }))
        return
      }

      // Build query for potential recommendations
      let query = supabase
        .from('news_articles')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(50) // Get more articles to score and filter

      // Apply category filter if specified
      if (category && category !== 'Today') {
        query = query.eq('category', category.toLowerCase())
      }

      // Exclude already shown articles
      if (excludeArticleIds.length > 0) {
        query = query.not('id', 'in', `(${excludeArticleIds.join(',')})`)
      }

      const { data: articles, error } = await query

      if (error) throw error

      if (!articles || articles.length === 0) {
        setState(prev => ({ 
          ...prev, 
          recommendations: [], 
          scores: {},
          loading: false 
        }))
        return
      }

      // Calculate recommendation scores for all articles
      const scoredArticles = articles.map(article => ({
        article,
        score: UserPreferencesManager.calculateRecommendationScore(article)
      }))

      // Filter out articles with very low scores and sort by score
      const filteredAndSorted = scoredArticles
        .filter(({ score }) => score.score > 10) // Minimum threshold
        .sort((a, b) => b.score.score - a.score.score)
        .slice(0, limit)

      const recommendations = filteredAndSorted.map(({ article }) => article)
      const scores = filteredAndSorted.reduce((acc, { article, score }) => {
        acc[article.id] = score
        return acc
      }, {} as Record<string, RecommendationScore>)

      setState(prev => ({
        ...prev,
        recommendations,
        scores,
        loading: false
      }))

    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch recommendations',
        loading: false
      }))
    }
  }, [category, excludeArticleIds, limit])

  const refreshRecommendations = useCallback(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    ...state,
    refreshRecommendations
  }
}