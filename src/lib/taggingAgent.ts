export interface ArticleTag {
  id: string
  name: string
  slug: string
  category: string
  description?: string
  color: string
  usage_count: number
  is_active: boolean
}

export interface TagAssignment {
  id: string
  article_id: string
  tag_id: string
  relevance_score: number
  assigned_at: string
}

export interface TagRelationship {
  id: string
  parent_tag_id: string
  related_tag_id: string
  relationship_type: string
  strength: number
}

export interface TagFilter {
  tags: string[]
  operation: 'AND' | 'OR'
  categories?: string[]
  minRelevance?: number
}

export class NewsTaggingAgent {
  private static readonly TAG_PATTERNS = {
    // Industry patterns
    technology: [
      'ai', 'artificial intelligence', 'machine learning', 'blockchain', 'cryptocurrency',
      'software', 'app', 'digital', 'cyber', 'tech', 'innovation', 'startup',
      'internet', 'online', 'mobile', 'computer', 'data', 'algorithm'
    ],
    healthcare: [
      'health', 'medical', 'hospital', 'doctor', 'patient', 'medicine', 'treatment',
      'vaccine', 'disease', 'covid', 'pandemic', 'healthcare', 'clinic', 'surgery'
    ],
    finance: [
      'bank', 'banking', 'loan', 'credit', 'investment', 'stock', 'market', 'economy',
      'financial', 'money', 'currency', 'trade', 'business', 'profit', 'revenue'
    ],
    education: [
      'school', 'university', 'student', 'teacher', 'education', 'academic', 'exam',
      'graduation', 'scholarship', 'learning', 'curriculum', 'research'
    ],
    agriculture: [
      'farm', 'farmer', 'crop', 'harvest', 'agriculture', 'rice', 'wheat', 'food',
      'irrigation', 'pesticide', 'fertilizer', 'livestock', 'fishing'
    ],
    energy: [
      'power', 'electricity', 'energy', 'solar', 'renewable', 'coal', 'gas', 'oil',
      'nuclear', 'grid', 'utility', 'fuel', 'battery'
    ],
    textiles: [
      'garments', 'textile', 'rmg', 'clothing', 'fashion', 'fabric', 'export',
      'apparel', 'manufacturing', 'factory'
    ],

    // Region patterns
    bangladesh: [
      'bangladesh', 'bengal', 'dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna',
      'barisal', 'rangpur', 'mymensingh', 'bengali', 'bangla'
    ],
    asia: [
      'asia', 'asian', 'india', 'china', 'pakistan', 'myanmar', 'thailand', 'vietnam',
      'indonesia', 'malaysia', 'singapore', 'japan', 'korea'
    ],
    global: [
      'international', 'global', 'worldwide', 'world', 'united nations', 'un',
      'international', 'foreign'
    ],

    // Topic type patterns
    politics: [
      'government', 'minister', 'parliament', 'election', 'vote', 'political',
      'policy', 'law', 'legislation', 'prime minister', 'president', 'party'
    ],
    sports: [
      'cricket', 'football', 'soccer', 'match', 'tournament', 'championship',
      'olympics', 'sports', 'player', 'team', 'game', 'victory', 'defeat'
    ],
    crime: [
      'police', 'arrest', 'crime', 'murder', 'theft', 'robbery', 'court', 'trial',
      'investigation', 'criminal', 'law enforcement', 'justice'
    ],
    weather: [
      'weather', 'rain', 'flood', 'cyclone', 'storm', 'temperature', 'climate',
      'drought', 'monsoon', 'disaster', 'natural disaster'
    ],

    // Event type patterns
    election: [
      'election', 'vote', 'ballot', 'candidate', 'campaign', 'polling', 'electoral'
    ],
    protest: [
      'protest', 'demonstration', 'rally', 'march', 'strike', 'movement', 'activist'
    ],
    disaster: [
      'disaster', 'emergency', 'rescue', 'evacuation', 'damage', 'casualties',
      'relief', 'aid', 'humanitarian'
    ],
    conference: [
      'conference', 'summit', 'meeting', 'forum', 'symposium', 'convention'
    ]
  }

  static analyzeArticleForTags(article: {
    title: string
    description?: string | null
    category: string
    source: string
    region: string
  }): { tagSlugs: string[], relevanceScores: Record<string, number> } {
    const content = `${article.title} ${article.description || ''}`.toLowerCase()
    const tagSlugs: string[] = []
    const relevanceScores: Record<string, number> = {}

    // Analyze content against tag patterns
    for (const [tagSlug, patterns] of Object.entries(this.TAG_PATTERNS)) {
      let score = 0
      let matches = 0

      for (const pattern of patterns) {
        if (content.includes(pattern.toLowerCase())) {
          matches++
          // Higher score for title matches
          if (article.title.toLowerCase().includes(pattern.toLowerCase())) {
            score += 20
          } else {
            score += 10
          }
        }
      }

      if (matches > 0) {
        // Bonus for multiple pattern matches
        score += Math.min(matches * 5, 25)
        
        // Category alignment bonus
        if (this.isCategoryAligned(tagSlug, article.category)) {
          score += 15
        }

        // Region alignment bonus
        if (this.isRegionAligned(tagSlug, article.region)) {
          score += 10
        }

        if (score >= 20) { // Minimum threshold
          tagSlugs.push(tagSlug)
          relevanceScores[tagSlug] = Math.min(score, 100)
        }
      }
    }

    // Always add category-based tags
    const categoryTag = this.getCategoryTag(article.category)
    if (categoryTag && !tagSlugs.includes(categoryTag)) {
      tagSlugs.push(categoryTag)
      relevanceScores[categoryTag] = 90
    }

    // Always add region-based tags
    const regionTag = this.getRegionTag(article.region)
    if (regionTag && !tagSlugs.includes(regionTag)) {
      tagSlugs.push(regionTag)
      relevanceScores[regionTag] = 85
    }

    // Determine time sensitivity
    const timeSensitivityTag = this.getTimeSensitivityTag(content)
    if (timeSensitivityTag && !tagSlugs.includes(timeSensitivityTag)) {
      tagSlugs.push(timeSensitivityTag)
      relevanceScores[timeSensitivityTag] = 75
    }

    // Limit to maximum 5 tags, prioritize by relevance
    const sortedTags = tagSlugs
      .sort((a, b) => (relevanceScores[b] || 0) - (relevanceScores[a] || 0))
      .slice(0, 5)

    const finalScores: Record<string, number> = {}
    sortedTags.forEach(tag => {
      finalScores[tag] = relevanceScores[tag] || 50
    })

    return {
      tagSlugs: sortedTags,
      relevanceScores: finalScores
    }
  }

  private static isCategoryAligned(tagSlug: string, category: string): boolean {
    const alignments: Record<string, string[]> = {
      technology: ['technology', 'tech'],
      politics: ['politics', 'political'],
      sports: ['sports', 'sport'],
      healthcare: ['health', 'medical'],
      finance: ['business', 'finance', 'economy'],
      education: ['education', 'academic'],
      entertainment: ['entertainment', 'culture']
    }

    return alignments[tagSlug]?.some(cat => 
      category.toLowerCase().includes(cat)
    ) || false
  }

  private static isRegionAligned(tagSlug: string, region: string): boolean {
    const alignments: Record<string, string[]> = {
      bangladesh: ['asia', 'south asia'],
      asia: ['asia'],
      global: ['global', 'world', 'international']
    }

    return alignments[tagSlug]?.some(reg => 
      region.toLowerCase().includes(reg)
    ) || false
  }

  private static getCategoryTag(category: string): string | null {
    const categoryMap: Record<string, string> = {
      politics: 'politics',
      sports: 'sports',
      technology: 'technology',
      health: 'healthcare',
      business: 'finance',
      entertainment: 'entertainment',
      general: 'breaking-news'
    }

    return categoryMap[category.toLowerCase()] || null
  }

  private static getRegionTag(region: string): string | null {
    const regionMap: Record<string, string> = {
      asia: 'asia',
      'south asia': 'south-asia',
      global: 'global',
      international: 'global'
    }

    return regionMap[region.toLowerCase()] || null
  }

  private static getTimeSensitivityTag(content: string): string | null {
    if (content.includes('breaking') || content.includes('urgent') || content.includes('alert')) {
      return 'urgent'
    }
    if (content.includes('developing') || content.includes('ongoing') || content.includes('continues')) {
      return 'developing'
    }
    if (content.includes('trending') || content.includes('viral') || content.includes('popular')) {
      return 'trending'
    }
    return null
  }

  static generateTagFilters(selectedTags: string[], operation: 'AND' | 'OR' = 'OR'): TagFilter {
    return {
      tags: selectedTags,
      operation,
      minRelevance: 20
    }
  }

  static buildTagQuery(filter: TagFilter): string {
    const tagConditions = filter.tags.map(tag => 
      `article_tags.slug = '${tag}'`
    ).join(` ${filter.operation} `)

    return `
      SELECT DISTINCT na.*, 
             array_agg(at.name) as tag_names,
             array_agg(at.slug) as tag_slugs,
             array_agg(at.color) as tag_colors,
             avg(ata.relevance_score) as avg_relevance
      FROM news_articles na
      JOIN article_tag_assignments ata ON na.id = ata.article_id
      JOIN article_tags at ON ata.tag_id = at.id
      WHERE (${tagConditions})
      ${filter.minRelevance ? `AND ata.relevance_score >= ${filter.minRelevance}` : ''}
      GROUP BY na.id
      ORDER BY avg_relevance DESC, na.published_date DESC
    `
  }

  static getRelatedTags(tagSlugs: string[]): string {
    return `
      SELECT DISTINCT rt.related_tag_id, at.name, at.slug, at.color, tr.strength
      FROM tag_relationships tr
      JOIN article_tags rt ON tr.related_tag_id = rt.id
      JOIN article_tags at ON tr.parent_tag_id = at.id
      WHERE at.slug IN (${tagSlugs.map(slug => `'${slug}'`).join(', ')})
      ORDER BY tr.strength DESC
      LIMIT 10
    `
  }
}