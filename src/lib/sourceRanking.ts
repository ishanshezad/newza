export interface SourcePriority {
  source: string
  priority: number
  category: 'tier1' | 'tier2' | 'tier3'
}

export class SourceRankingService {
  // Tier 1: Premium international sources (highest priority)
  private static readonly TIER1_SOURCES = [
    'reuters', 'bbc', 'cnn', 'al jazeera', 'aljazeera', 'associated press', 'ap news',
    'new york times', 'nytimes', 'the guardian', 'washington post', 'france24', 
    'deutsche welle', 'npr', 'pbs', 'abc news', 'cbs news', 'nbc news',
    'the economist', 'financial times', 'wall street journal', 'wsj', 'sky news',
    'itv news', 'channel 4 news', 'euronews', 'dw', 'rfi', 'rte'
  ]

  // Tier 2: Regional and specialized sources
  private static readonly TIER2_SOURCES = [
    'jerusalem post', 'middle east eye', 'al-monitor', 'press tv',
    'tehran times', 'radio free europe', 'the hindu', 'india today',
    'channel news asia', 'prothom alo', 'daily star', 'times of india',
    'dawn', 'the nation', 'express tribune', 'geo news', 'arab news',
    'gulf news', 'khaleej times', 'the national', 'middle east monitor'
  ]

  // Tier 3: Local and other sources
  private static readonly TIER3_SOURCES = [
    'bangla tribune', 'bd24live', 'risingbd', 'bangladesh diplomat',
    'energy bangla', 'jagonews24', 'daily bangladesh', 'blitz'
  ]

  static getSourcePriority(sourceName: string): SourcePriority {
    const normalizedSource = sourceName.toLowerCase().trim()

    // Check Tier 1 sources
    for (const tier1Source of this.TIER1_SOURCES) {
      if (normalizedSource.includes(tier1Source) || tier1Source.includes(normalizedSource)) {
        return {
          source: sourceName,
          priority: 100,
          category: 'tier1'
        }
      }
    }

    // Check Tier 2 sources
    for (const tier2Source of this.TIER2_SOURCES) {
      if (normalizedSource.includes(tier2Source) || tier2Source.includes(normalizedSource)) {
        return {
          source: sourceName,
          priority: 70,
          category: 'tier2'
        }
      }
    }

    // Default to Tier 3
    return {
      source: sourceName,
      priority: 40,
      category: 'tier3'
    }
  }

  static calculateSourceScore(sourceName: string, baseScore: number = 0): number {
    const sourcePriority = this.getSourcePriority(sourceName)
    
    let priorityMultiplier = 1.0
    let sourceBonus = 0
    
    switch (sourcePriority.category) {
      case 'tier1':
        priorityMultiplier = 3.0
        sourceBonus = 200
        break
      case 'tier2':
        priorityMultiplier = 1.8
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

      if (Math.abs(priorityA - priorityB) > 5) {
        return priorityB - priorityA
      }

      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })
  }

  static getTopPrioritySources(): string[] {
    return this.TIER1_SOURCES
  }

  static isTopPrioritySource(sourceName: string): boolean {
    const normalizedSource = sourceName.toLowerCase().trim()
    return this.TIER1_SOURCES.some(tier1Source => 
      normalizedSource.includes(tier1Source) || tier1Source.includes(normalizedSource)
    )
  }

  static calculateFeedPriority(article: {
    source: string
    published_date: string
    title: string
    description?: string | null
  }): number {
    let score = 0
    
    // Base recency score
    const hoursOld = (Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60)
    const recencyScore = Math.max(0, 100 - (hoursOld / 24) * 3)
    score += recencyScore

    // Apply source priority scoring
    const sourceScore = this.calculateSourceScore(article.source, score)
    
    // Breaking news boost for top sources
    if (this.isTopPrioritySource(article.source)) {
      const content = `${article.title} ${article.description || ''}`.toLowerCase()
      const breakingKeywords = ['breaking', 'urgent', 'alert', 'developing', 'live', 'exclusive']
      
      if (breakingKeywords.some(keyword => content.includes(keyword))) {
        return sourceScore + 150
      }
    }
    
    return sourceScore
  }

  static prioritizeArticlesBySource<T extends {
    source: string
    published_date: string
    title: string
    description?: string | null
  }>(articles: T[]): T[] {
    const articlesWithPriority = articles.map(article => ({
      ...article,
      _priorityScore: this.calculateFeedPriority(article),
      _sourceTier: this.getSourcePriority(article.source).category
    }))

    return articlesWithPriority.sort((a, b) => {
      // Primary: Source tier
      if (a._sourceTier !== b._sourceTier) {
        const tierOrder = { tier1: 3, tier2: 2, tier3: 1 }
        return tierOrder[b._sourceTier] - tierOrder[a._sourceTier]
      }
      
      // Secondary: Priority score
      if (a._priorityScore !== b._priorityScore) {
        return b._priorityScore - a._priorityScore
      }
      
      // Tertiary: Published date
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })
  }

  // Enhanced method for breaking news source validation
  static validateBreakingNewsSource(sourceName: string, urgencyScore: number): boolean {
    const sourcePriority = this.getSourcePriority(sourceName)
    
    if (urgencyScore >= 80) {
      return sourcePriority.category === 'tier1'
    }
    
    if (urgencyScore >= 60) {
      return sourcePriority.category === 'tier1' || sourcePriority.category === 'tier2'
    }
    
    return true
  }
}