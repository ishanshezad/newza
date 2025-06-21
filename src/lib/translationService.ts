// Minimal translation service for display purposes only
export class TranslationService {
  static getDisplayTitle(article: {
    title: string
    translatedTitle?: string
    originalLanguage?: string
  }): string {
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
    if (article.originalLanguage === 'bangla' && article.translatedDescription) {
      return article.translatedDescription
    }
    return article.description
  }
}