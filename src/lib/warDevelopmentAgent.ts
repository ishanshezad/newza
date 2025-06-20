export interface WarDevelopment {
  id: string
  title: string
  description: string
  category: 'ceasefire' | 'humanitarian' | 'diplomatic' | 'military' | 'civilian'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  sources: string[]
  confidence: number
}

export interface DevelopmentSummary {
  developments: WarDevelopment[]
  lastUpdated: string
  totalArticlesAnalyzed: number
}

export class WarDevelopmentAgent {
  private static readonly DEVELOPMENT_KEYWORDS = {
    ceasefire: [
      'ceasefire', 'truce', 'peace talks', 'negotiation', 'mediation', 'agreement',
      'diplomatic solution', 'peace process', 'talks resume', 'dialogue'
    ],
    humanitarian: [
      'humanitarian aid', 'medical supplies', 'food assistance', 'refugee',
      'displaced', 'evacuation', 'relief convoy', 'red cross', 'un aid',
      'emergency assistance', 'shelter', 'water shortage'
    ],
    diplomatic: [
      'diplomatic', 'ambassador', 'foreign minister', 'summit', 'meeting',
      'international community', 'un security council', 'sanctions',
      'diplomatic pressure', 'international law', 'mediation'
    ],
    military: [
      'military', 'forces', 'troops', 'deployment', 'operation', 'strike',
      'attack', 'defense', 'offensive', 'strategic', 'tactical', 'combat'
    ],
    civilian: [
      'civilian', 'casualties', 'hospital', 'school', 'infrastructure',
      'power grid', 'water supply', 'residential', 'non-combatant'
    ]
  }

  private static readonly URGENCY_INDICATORS = {
    critical: [
      'breaking', 'urgent', 'emergency', 'immediate', 'critical', 'alert',
      'major escalation', 'significant development', 'unprecedented'
    ],
    high: [
      'important', 'significant', 'major', 'substantial', 'considerable',
      'notable', 'serious', 'grave', 'escalating'
    ],
    medium: [
      'developing', 'ongoing', 'continues', 'reports indicate', 'sources say',
      'according to', 'officials confirm'
    ],
    low: [
      'minor', 'small', 'limited', 'isolated', 'local', 'brief'
    ]
  }

  static async generateDevelopmentSummary(): Promise<DevelopmentSummary> {
    try {
      // This would typically call an AI service or analyze articles
      // For now, we'll generate realistic developments based on current patterns
      const developments = await this.analyzeRecentArticles()
      
      return {
        developments,
        lastUpdated: new Date().toISOString(),
        totalArticlesAnalyzed: developments.length * 3 // Simulated
      }
    } catch (error) {
      console.error('Failed to generate development summary:', error)
      return {
        developments: [],
        lastUpdated: new Date().toISOString(),
        totalArticlesAnalyzed: 0
      }
    }
  }

  private static async analyzeRecentArticles(): Promise<WarDevelopment[]> {
    // In a real implementation, this would:
    // 1. Fetch recent war articles from the database
    // 2. Use AI/NLP to analyze content and extract key developments
    // 3. Categorize and prioritize developments
    // 4. Generate concise summaries
    
    // For now, we'll return realistic sample developments
    const currentTime = new Date()
    
    return [
      {
        id: 'dev-1',
        title: 'CEASEFIRE TALKS',
        description: 'Negotiations have resumed with international mediators present. Both sides report cautious optimism.',
        category: 'ceasefire',
        urgency: 'high',
        timestamp: new Date(currentTime.getTime() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        sources: ['Reuters', 'BBC News', 'Al Jazeera'],
        confidence: 85
      },
      {
        id: 'dev-2',
        title: 'HUMANITARIAN AID',
        description: 'New convoy reaches affected areas with medical supplies and food assistance.',
        category: 'humanitarian',
        urgency: 'medium',
        timestamp: new Date(currentTime.getTime() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        sources: ['Red Cross', 'UN News', 'Associated Press'],
        confidence: 92
      },
      {
        id: 'dev-3',
        title: 'BORDER UPDATE',
        description: 'International observers report reduced military activity along disputed borders.',
        category: 'military',
        urgency: 'medium',
        timestamp: new Date(currentTime.getTime() - 32 * 60 * 1000).toISOString(), // 32 minutes ago
        sources: ['Defense News', 'Reuters', 'CNN'],
        confidence: 78
      },
      {
        id: 'dev-4',
        title: 'DIPLOMATIC PROGRESS',
        description: 'Regional leaders express support for ongoing peace initiatives and dialogue.',
        category: 'diplomatic',
        urgency: 'medium',
        timestamp: new Date(currentTime.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        sources: ['Foreign Affairs', 'BBC News', 'France24'],
        confidence: 88
      }
    ]
  }

  static async analyzeArticleForDevelopments(article: {
    title: string
    description?: string
    content?: string
    source: string
    published_date: string
  }): Promise<WarDevelopment | null> {
    const content = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase()
    
    // Determine category
    let category: WarDevelopment['category'] = 'military' // default
    let maxCategoryScore = 0
    
    for (const [cat, keywords] of Object.entries(this.DEVELOPMENT_KEYWORDS)) {
      const score = keywords.filter(keyword => content.includes(keyword.toLowerCase())).length
      if (score > maxCategoryScore) {
        maxCategoryScore = score
        category = cat as WarDevelopment['category']
      }
    }
    
    // Determine urgency
    let urgency: WarDevelopment['urgency'] = 'low'
    for (const [urg, indicators] of Object.entries(this.URGENCY_INDICATORS)) {
      if (indicators.some(indicator => content.includes(indicator.toLowerCase()))) {
        urgency = urg as WarDevelopment['urgency']
        break
      }
    }
    
    // Only create development if we have meaningful content
    if (maxCategoryScore === 0) {
      return null
    }
    
    // Generate a concise summary (in real implementation, this would use AI)
    const summary = this.generateSummary(article.title, article.description, category)
    
    return {
      id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: this.generateTitle(category, urgency),
      description: summary,
      category,
      urgency,
      timestamp: article.published_date,
      sources: [article.source],
      confidence: Math.min(90, 60 + maxCategoryScore * 10)
    }
  }

  private static generateTitle(category: string, urgency: string): string {
    const titles = {
      ceasefire: ['CEASEFIRE TALKS', 'PEACE NEGOTIATIONS', 'DIPLOMATIC BREAKTHROUGH'],
      humanitarian: ['HUMANITARIAN AID', 'RELIEF EFFORTS', 'CIVILIAN ASSISTANCE'],
      diplomatic: ['DIPLOMATIC PROGRESS', 'INTERNATIONAL MEDIATION', 'PEACE INITIATIVE'],
      military: ['MILITARY UPDATE', 'OPERATIONAL CHANGE', 'STRATEGIC DEVELOPMENT'],
      civilian: ['CIVILIAN IMPACT', 'INFRASTRUCTURE UPDATE', 'POPULATION SAFETY']
    }
    
    const categoryTitles = titles[category as keyof typeof titles] || ['UPDATE']
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)]
  }

  private static generateSummary(title: string, description?: string, category?: string): string {
    // In a real implementation, this would use AI to generate concise summaries
    // For now, we'll create realistic summaries based on the category
    
    const content = `${title} ${description || ''}`.toLowerCase()
    
    if (category === 'ceasefire' && content.includes('talk')) {
      return 'Negotiations have resumed with international mediators present. Both sides report cautious optimism.'
    }
    
    if (category === 'humanitarian' && content.includes('aid')) {
      return 'New convoy reaches affected areas with medical supplies and food assistance.'
    }
    
    if (category === 'diplomatic') {
      return 'Regional leaders express support for ongoing peace initiatives and dialogue.'
    }
    
    if (category === 'military') {
      return 'International observers report reduced military activity along disputed borders.'
    }
    
    // Fallback: truncate and clean the original description
    const summary = (description || title).substring(0, 120)
    return summary.length < (description || title).length ? summary + '...' : summary
  }

  static getCategoryColor(category: WarDevelopment['category']): string {
    const colors = {
      ceasefire: '#10B981', // green
      humanitarian: '#F59E0B', // orange
      diplomatic: '#3B82F6', // blue
      military: '#EF4444', // red
      civilian: '#8B5CF6'  // purple
    }
    return colors[category] || '#6B7280'
  }

  static getUrgencyIcon(urgency: WarDevelopment['urgency']): string {
    const icons = {
      critical: '🚨',
      high: '⚠️',
      medium: '📢',
      low: 'ℹ️'
    }
    return icons[urgency] || 'ℹ️'
  }
}