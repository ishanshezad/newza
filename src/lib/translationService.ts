export interface TranslationMetadata {
  originalLanguage: string
  translatedTitle?: string
  translatedDescription?: string
  translatedContent?: string
  translationCompletedAt?: string
}

export interface ContentAnalysis {
  primaryCategory: string
  secondaryCategories: string[]
  contentType: string
  audienceLevel: string
  mainThemes: string[]
  autoTags: string[]
  analysisCompletedAt?: string
}

export interface ProcessedArticle {
  id: string
  title: string
  description?: string
  translationMetadata?: TranslationMetadata
  contentAnalysis?: ContentAnalysis
}

export class TranslationService {
  private static readonly API_BASE = '/functions/v1'

  static async processArticles(options: {
    limit?: number
    forceRetranslate?: boolean
  } = {}): Promise<{
    success: boolean
    processed: number
    translated: number
    message: string
    errors?: string[]
  }> {
    const { limit = 50, forceRetranslate = false } = options

    try {
      const response = await fetch(`${this.API_BASE}/translate-and-categorize?limit=${limit}&force=${forceRetranslate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Translation service error:', error)
      throw error
    }
  }

  static async getProcessingStatus(): Promise<{
    totalArticles: number
    translatedArticles: number
    categorizedArticles: number
    pendingTranslation: number
    pendingCategorization: number
  }> {
    // This would query the database to get processing statistics
    // Implementation depends on your specific needs
    return {
      totalArticles: 0,
      translatedArticles: 0,
      categorizedArticles: 0,
      pendingTranslation: 0,
      pendingCategorization: 0
    }
  }

  static getDisplayTitle(article: {
    title: string
    translatedTitle?: string
    originalLanguage?: string
  }): string {
    // Return translated title if available and original was in Bangla
    if (article.originalLanguage === 'bangla' && article.translatedTitle) {
      return article.translatedTitle
    }
    return article.title
  }

  static getDisplayDescription(article: {
    description?: string
    translatedDescription?: string
    originalLanguage?: string
  }): string | undefined {
    // Return translated description if available and original was in Bangla
    if (article.originalLanguage === 'bangla' && article.translatedDescription) {
      return article.translatedDescription
    }
    return article.description
  }

  static getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      technology: 'Technology',
      business: 'Business',
      politics: 'Politics',
      culture: 'Culture',
      sports: 'Sports',
      health: 'Health',
      education: 'Education',
      environment: 'Environment',
      general: 'General'
    }
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)
  }

  static getContentTypeDisplayName(type: string): string {
    const typeNames: Record<string, string> = {
      news: 'News',
      opinion: 'Opinion',
      feature: 'Feature',
      tutorial: 'Tutorial',
      review: 'Review'
    }
    return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  static getAudienceDisplayName(audience: string): string {
    const audienceNames: Record<string, string> = {
      general: 'General Public',
      professional: 'Professionals',
      students: 'Students',
      technical: 'Technical Audience'
    }
    return audienceNames[audience] || audience.charAt(0).toUpperCase() + audience.slice(1)
  }
}