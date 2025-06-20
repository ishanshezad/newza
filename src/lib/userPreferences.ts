export interface UserPreference {
  articleId: string
  title: string
  category: string
  source: string
  region: string
  keywords: string[]
  timestamp: number
}

export interface RecommendationScore {
  articleId: string
  score: number
  reasons: string[]
}

export class UserPreferencesManager {
  private static readonly STORAGE_KEY = 'news_user_preferences'
  private static readonly MAX_PREFERENCES = 100

  static getPreferences(): UserPreference[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static addPreference(article: {
    id: string
    title: string
    category: string
    source: string
    region: string
    description?: string | null
  }): void {
    const preferences = this.getPreferences()
    
    // Remove existing preference for same article
    const filtered = preferences.filter(p => p.articleId !== article.id)
    
    // Extract keywords from title and description
    const keywords = this.extractKeywords(article.title, article.description)
    
    const newPreference: UserPreference = {
      articleId: article.id,
      title: article.title,
      category: article.category,
      source: article.source,
      region: article.region,
      keywords,
      timestamp: Date.now()
    }
    
    // Add new preference at the beginning
    filtered.unshift(newPreference)
    
    // Keep only the most recent preferences
    const trimmed = filtered.slice(0, this.MAX_PREFERENCES)
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed))
    } catch (error) {
      console.warn('Failed to save user preferences:', error)
    }
  }

  static removePreference(articleId: string): void {
    const preferences = this.getPreferences()
    const filtered = preferences.filter(p => p.articleId !== articleId)
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.warn('Failed to remove user preference:', error)
    }
  }

  static hasPreference(articleId: string): boolean {
    return this.getPreferences().some(p => p.articleId === articleId)
  }

  static getPreferredCategories(): Record<string, number> {
    const preferences = this.getPreferences()
    const categories: Record<string, number> = {}
    
    preferences.forEach(pref => {
      categories[pref.category] = (categories[pref.category] || 0) + 1
    })
    
    return categories
  }

  static getPreferredSources(): Record<string, number> {
    const preferences = this.getPreferences()
    const sources: Record<string, number> = {}
    
    preferences.forEach(pref => {
      sources[pref.source] = (sources[pref.source] || 0) + 1
    })
    
    return sources
  }

  static getPreferredKeywords(): Record<string, number> {
    const preferences = this.getPreferences()
    const keywords: Record<string, number> = {}
    
    preferences.forEach(pref => {
      pref.keywords.forEach(keyword => {
        keywords[keyword] = (keywords[keyword] || 0) + 1
      })
    })
    
    return keywords
  }

  private static extractKeywords(title: string, description?: string | null): string[] {
    const text = `${title} ${description || ''}`.toLowerCase()
    
    // Remove common words and extract meaningful keywords
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ])
    
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 10) // Limit to 10 keywords
    
    return [...new Set(words)] // Remove duplicates
  }

  static calculateRecommendationScore(article: {
    id: string
    title: string
    category: string
    source: string
    region: string
    description?: string | null
    published_date: string
  }): RecommendationScore {
    const preferences = this.getPreferences()
    
    if (preferences.length === 0) {
      return { articleId: article.id, score: 0, reasons: [] }
    }
    
    let score = 0
    const reasons: string[] = []
    
    // Category preference scoring
    const categoryPrefs = this.getPreferredCategories()
    const categoryScore = (categoryPrefs[article.category] || 0) * 10
    if (categoryScore > 0) {
      score += categoryScore
      reasons.push(`Matches preferred category: ${article.category}`)
    }
    
    // Source preference scoring
    const sourcePrefs = this.getPreferredSources()
    const sourceScore = (sourcePrefs[article.source] || 0) * 8
    if (sourceScore > 0) {
      score += sourceScore
      reasons.push(`From preferred source: ${article.source}`)
    }
    
    // Keyword matching
    const articleKeywords = this.extractKeywords(article.title, article.description)
    const preferredKeywords = this.getPreferredKeywords()
    
    let keywordScore = 0
    const matchedKeywords: string[] = []
    
    articleKeywords.forEach(keyword => {
      const keywordWeight = preferredKeywords[keyword] || 0
      if (keywordWeight > 0) {
        keywordScore += keywordWeight * 5
        matchedKeywords.push(keyword)
      }
    })
    
    if (keywordScore > 0) {
      score += keywordScore
      reasons.push(`Contains preferred keywords: ${matchedKeywords.join(', ')}`)
    }
    
    // Recency bonus (newer articles get slight boost)
    const articleAge = Date.now() - new Date(article.published_date).getTime()
    const daysSincePublished = articleAge / (1000 * 60 * 60 * 24)
    
    if (daysSincePublished < 1) {
      score += 5
      reasons.push('Recent article')
    }
    
    // Region preference (implicit from user's liked articles)
    const regionPrefs: Record<string, number> = {}
    preferences.forEach(pref => {
      regionPrefs[pref.region] = (regionPrefs[pref.region] || 0) + 1
    })
    
    const regionScore = (regionPrefs[article.region] || 0) * 3
    if (regionScore > 0) {
      score += regionScore
      reasons.push(`From preferred region: ${article.region}`)
    }
    
    return {
      articleId: article.id,
      score: Math.round(score),
      reasons
    }
  }

  static clearPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear user preferences:', error)
    }
  }
}