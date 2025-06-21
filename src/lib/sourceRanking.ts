export interface SourcePriority {
  source: string
  priority: number
  category: 'tier1' | 'tier2' | 'tier3'
}

export class SourceRankingService {
  // Tier 1: Premium international sources (highest priority) - Top reputable sources for breaking news
  private static readonly TIER1_SOURCES = [
    'reuters', 'bbc', 'cnn', 'al jazeera', 'aljazeera', 'associated press', 'ap news',
    'new york times', 'nytimes', 'the guardian', 'washington post', 'france24', 
    'deutsche welle', 'npr', 'pbs', 'abc news', 'cbs news', 'nbc news',
    'the economist', 'financial times', 'wall street journal', 'wsj', 'sky news',
    'itv news', 'channel 4 news', 'euronews', 'dw', 'rfi', 'rte'
  ]

  // Tier 2: Regional and specialized sources (medium priority)
  private static readonly TIER2_SOURCES = [
    'jerusalem post', 'middle east eye', 'al-monitor', 'press tv',
    'tehran times', 'radio free europe', 'the hindu', 'india today',
    'channel news asia', 'prothom alo', 'daily star', 'times of india',
    'dawn', 'the nation', 'express tribune', 'geo news', 'arab news',
    'gulf news', 'khaleej times', 'the national', 'middle east monitor'
  ]

  // Tier 3: Local and other sources (standard priority)
  private static readonly TIER3_SOURCES = [
    'bangla tribune', 'bd24live', 'risingbd', 'bangladesh diplomat',
    'energy bangla', 'jagonews24', 'daily bangladesh', 'blitz'
  ]

  static getSourcePriority(sourceName: string): SourcePriority {
    const normalizedSource = sourceName.toLowerCase().trim()

    // Check Tier 1 sources (highest priority) - Top reputable sources
    for (const tier1Source of this.TIER1_SOURCES) {
      if (normalizedSource.includes(tier1Source) || tier1Source.includes(normalizedSource)) {
        return {
          source: sourceName,
          priority: 100, // Maximum priority for top sources
          category: 'tier1'
        }
      }
    }

    // Check Tier 2 sources (medium priority)
    for (const tier2Source of this.TIER2_SOURCES) {
      if (normalizedSource.includes(tier2Source) || tier2Source.includes(normalizedSource)) {
        return {
          source: sourceName,
          priority: 70,
          category: 'tier2'
        }
      }
    }

    // Default to Tier 3 (standard priority)
    return {
      source: sourceName,
      priority: 40,
      category: 'tier3'
    }
  }

  static calculateSourceScore(sourceName: string, baseScore: number = 0): number {
    const sourcePriority = this.getSourcePriority(sourceName)
    
    // Apply aggressive source priority multiplier for top sources
    let priorityMultiplier = 1.0
    let sourceBonus = 0
    
    switch (sourcePriority.category) {
      case 'tier1':
        priorityMultiplier = 3.0 // 3x multiplier for top sources
        sourceBonus = 200 // Large bonus for Reuters, BBC, CNN, etc.
        break
      case 'tier2':
        priorityMultiplier = 1.8 // 1.8x multiplier for regional sources
        sourceBonus = 80
        break
      default:
        priorityMultiplier = 1.0
        sourceBonus = 0
    }
    
    return Math.round(baseScore * priorityMultiplier + sourceBonus)
  }

  static sortArticlesBySourcePriority<T extends { source: string; published_date: string }>(
    articles: T[]
  ): T[] {
    return articles.sort((a, b) => {
      const priorityA = this.getSourcePriority(a.source).priority
      const priorityB = this.getSourcePriority(b.source).priority

      // Primary sort: Source priority (higher is better) - Strong emphasis on top sources
      if (Math.abs(priorityA - priorityB) > 5) {
        return priorityB - priorityA
      }

      // Secondary sort: Published date (newer is better)
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })
  }

  static getSourceTierBadge(sourceName: string): {
    label: string
    color: string
    bgColor: string
  } {
    const priority = this.getSourcePriority(sourceName)
    
    switch (priority.category) {
      case 'tier1':
        return {
          label: 'Premium',
          color: '#DC2626',
          bgColor: '#FEE2E2'
        }
      case 'tier2':
        return {
          label: 'Regional',
          color: '#D97706',
          bgColor: '#FEF3C7'
        }
      default:
        return {
          label: 'Local',
          color: '#059669',
          bgColor: '#D1FAE5'
        }
    }
  }

  // Enhanced method to get top priority sources for breaking news filtering
  static getTopPrioritySources(): string[] {
    return this.TIER1_SOURCES
  }

  // Enhanced method to check if a source is a top priority source
  static isTopPrioritySource(sourceName: string): boolean {
    const normalizedSource = sourceName.toLowerCase().trim()
    return this.TIER1_SOURCES.some(tier1Source => 
      normalizedSource.includes(tier1Source) || tier1Source.includes(normalizedSource)
    )
  }

  // Enhanced priority calculation for news feeds with breaking news emphasis
  static calculateFeedPriority(article: {
    source: string
    published_date: string
    title: string
    description?: string | null
  }): number {
    let score = 0
    
    // Base recency score (newer articles get higher base score)
    const hoursOld = (Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60)
    const recencyScore = Math.max(0, 100 - (hoursOld / 24) * 3) // Decrease by 3 points per day
    score += recencyScore

    // Apply aggressive source priority scoring
    const sourceScore = this.calculateSourceScore(article.source, score)
    
    // Additional boost for breaking news keywords in top sources
    if (this.isTopPrioritySource(article.source)) {
      const content = `${article.title} ${article.description || ''}`.toLowerCase()
      const breakingKeywords = ['breaking', 'urgent', 'alert', 'developing', 'live', 'exclusive']
      
      if (breakingKeywords.some(keyword => content.includes(keyword))) {
        return sourceScore + 150 // Extra boost for breaking news from top sources
      }
    }
    
    return sourceScore
  }

  // Method to prioritize articles with aggressive source ranking
  static prioritizeArticlesBySource<T extends {
    source: string
    published_date: string
    title: string
    description?: string | null
  }>(articles: T[]): T[] {
    // Calculate priority scores for all articles
    const articlesWithPriority = articles.map(article => ({
      ...article,
      _priorityScore: this.calculateFeedPriority(article),
      _sourceTier: this.getSourcePriority(article.source).category
    }))

    // Sort by priority score (highest first), with strong emphasis on source tier
    return articlesWithPriority.sort((a, b) => {
      // Primary sort: Source tier (tier1 always comes first)
      if (a._sourceTier !== b._sourceTier) {
        const tierOrder = { tier1: 3, tier2: 2, tier3: 1 }
        return tierOrder[b._sourceTier] - tierOrder[a._sourceTier]
      }
      
      // Secondary sort: Priority score within same tier
      if (a._priorityScore !== b._priorityScore) {
        return b._priorityScore - a._priorityScore
      }
      
      // Tertiary sort: Published date (newer is better)
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })
  }

  // Method to get source display information
  static getSourceDisplayInfo(sourceName: string): {
    displayName: string
    isTopSource: boolean
    tier: string
    badge?: {
      label: string
      color: string
      bgColor: string
    }
  } {
    const priority = this.getSourcePriority(sourceName)
    const isTopSource = this.isTopPrioritySource(sourceName)
    
    return {
      displayName: sourceName,
      isTopSource,
      tier: priority.category,
      badge: isTopSource ? this.getSourceTierBadge(sourceName) : undefined
    }
  }

  // Enhanced method for breaking news source validation
  static validateBreakingNewsSource(sourceName: string, urgencyScore: number): boolean {
    const sourcePriority = this.getSourcePriority(sourceName)
    
    // Only tier 1 sources for critical breaking news
    if (urgencyScore >= 80) {
      return sourcePriority.category === 'tier1'
    }
    
    // Tier 1 and 2 sources for high urgency
    if (urgencyScore >= 60) {
      return sourcePriority.category === 'tier1' || sourcePriority.category === 'tier2'
    }
    
    // All sources for medium urgency
    return true
  }
}