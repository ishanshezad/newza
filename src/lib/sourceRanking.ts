export interface SourcePriority {
  source: string
  priority: number
  category: 'tier1' | 'tier2' | 'tier3'
}

export class SourceRankingService {
  // Tier 1: Premium international sources (highest priority)
  private static readonly TIER1_SOURCES = [
    'bbc', 'cnn', 'reuters', 'al jazeera', 'aljazeera',
    'associated press', 'ap news', 'new york times', 'nytimes',
    'the guardian', 'washington post', 'france24', 'deutsche welle'
  ]

  // Tier 2: Regional and specialized sources (medium priority)
  private static readonly TIER2_SOURCES = [
    'jerusalem post', 'middle east eye', 'al-monitor', 'press tv',
    'tehran times', 'radio free europe', 'the hindu', 'india today',
    'channel news asia', 'prothom alo', 'daily star'
  ]

  // Tier 3: Local and other sources (standard priority)
  private static readonly TIER3_SOURCES = [
    'bangla tribune', 'bd24live', 'risingbd', 'bangladesh diplomat',
    'energy bangla', 'jagonews24', 'daily bangladesh', 'blitz'
  ]

  static getSourcePriority(sourceName: string): SourcePriority {
    const normalizedSource = sourceName.toLowerCase().trim()

    // Check Tier 1 sources (highest priority)
    for (const tier1Source of this.TIER1_SOURCES) {
      if (normalizedSource.includes(tier1Source) || tier1Source.includes(normalizedSource)) {
        return {
          source: sourceName,
          priority: 100,
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
    
    // Apply source priority multiplier
    const priorityMultiplier = sourcePriority.priority / 100
    const sourceBonus = sourcePriority.priority - 40 // Bonus points for higher tier sources
    
    return Math.round(baseScore * priorityMultiplier + sourceBonus)
  }

  static sortArticlesBySourcePriority<T extends { source: string; published_date: string }>(
    articles: T[]
  ): T[] {
    return articles.sort((a, b) => {
      const priorityA = this.getSourcePriority(a.source).priority
      const priorityB = this.getSourcePriority(b.source).priority

      // Primary sort: Source priority (higher is better)
      if (priorityA !== priorityB) {
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
}