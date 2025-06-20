export interface BangladeshNewsFilter {
  keywords: string[]
  sources: string[]
  categories: string[]
  regions: string[]
}

export class BangladeshNewsAgent {
  private static readonly BANGLADESH_KEYWORDS = [
    // Country names
    'bangladesh', 'bengal', 'dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal', 'rangpur', 'mymensingh',
    
    // Political terms
    'awami league', 'bnp', 'jatiya party', 'sheikh hasina', 'khaleda zia', 'parliament', 'jatiya sangsad',
    
    // Geographic locations
    'cox\'s bazar', 'sundarbans', 'padma', 'jamuna', 'meghna', 'rohingya', 'saint martin',
    
    // Cultural/Religious
    'bengali', 'bangla', 'pohela boishakh', 'durga puja', 'eid', 'ramadan', 'victory day', 'independence day',
    
    // Economic terms
    'taka', 'garments', 'rmg', 'textile', 'jute', 'tea', 'shrimp', 'hilsa',
    
    // Organizations
    'brac', 'grameen', 'yunus', 'microcredit', 'bangladesh bank', 'dse', 'cse'
  ]

  private static readonly BANGLADESH_SOURCES = [
    'bangla tribune', 'bd24live', 'risingbd', 'bangladesh diplomat', 
    'the dhaka post', 'energy bangla', 'daily jagaran', 'jagonews24.com', 
    'daily bangladesh', 'blitz'
  ]

  static calculateBangladeshRelevanceScore(article: {
    title: string
    description?: string | null
    source: string
    category: string
    region: string
  }): number {
    let score = 0
    
    // MASSIVE score boost for Bangladesh region (articles explicitly marked as Bangladesh)
    if (article.region.toLowerCase() === 'bangladesh') {
      score += 100 // Increased from 10 to 100 for maximum priority
    }
    
    // High score for Asia region (fallback for Bangladesh sources)
    if (article.region.toLowerCase() === 'asia') {
      score += 20 // Increased from 10 to 20
    }
    
    // High score for Bangladesh sources
    if (this.BANGLADESH_SOURCES.some(source => 
      article.source.toLowerCase().includes(source.toLowerCase())
    )) {
      score += 60 // Increased from 50 to 60
    }
    
    // Content analysis
    const content = `${article.title} ${article.description || ''}`.toLowerCase()
    
    // Keyword matching with weighted scores
    const keywordMatches = this.BANGLADESH_KEYWORDS.filter(keyword => 
      content.includes(keyword.toLowerCase())
    )
    
    // Higher score for more keyword matches
    score += keywordMatches.length * 20 // Increased from 15 to 20
    
    // Bonus for title matches (more important than description)
    const titleMatches = this.BANGLADESH_KEYWORDS.filter(keyword => 
      article.title.toLowerCase().includes(keyword.toLowerCase())
    )
    score += titleMatches.length * 15 // Increased from 10 to 15
    
    // Category relevance
    const relevantCategories = ['politics', 'general', 'business', 'sports']
    if (relevantCategories.includes(article.category.toLowerCase())) {
      score += 10 // Increased from 5 to 10
    }
    
    return score
  }

  static isBangladeshRelated(article: {
    title: string
    description?: string | null
    source: string
    category: string
    region: string
  }): boolean {
    // Lower threshold but prioritize explicit Bangladesh region marking
    if (article.region.toLowerCase() === 'bangladesh') {
      return true // Always consider Bangladesh region articles as BD-related
    }
    
    return this.calculateBangladeshRelevanceScore(article) >= 15
  }

  static sortByBangladeshRelevance<T extends {
    title: string
    description?: string | null
    source: string
    category: string
    region: string
    published_date: string
  }>(articles: T[]): T[] {
    return articles.sort((a, b) => {
      const scoreA = this.calculateBangladeshRelevanceScore(a)
      const scoreB = this.calculateBangladeshRelevanceScore(b)
      
      // Primary sort by Bangladesh relevance
      if (scoreA !== scoreB) {
        return scoreB - scoreA
      }
      
      // Secondary sort by recency
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    })
  }

  static getBangladeshFilter(): BangladeshNewsFilter {
    return {
      keywords: this.BANGLADESH_KEYWORDS,
      sources: this.BANGLADESH_SOURCES,
      categories: ['general', 'politics', 'business', 'sports', 'entertainment'],
      regions: ['bangladesh', 'asia'] // Include both explicit Bangladesh and Asia regions
    }
  }

  static generateBangladeshQuery(): string {
    // Create a search query that captures Bangladesh-related content
    const primaryKeywords = ['bangladesh', 'dhaka', 'bengali', 'bangla']
    return primaryKeywords.join(' OR ')
  }
}