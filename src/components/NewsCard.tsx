import * as React from "react"
import { formatTimeAgo } from "../lib/utils"
import { TranslationIndicator } from "./TranslationIndicator"
import { TranslationService } from "../lib/translationService"
import { EnhancedNewsCard } from "./ui/EnhancedNewsCard"
import { UserPreferencesManager } from "../lib/userPreferences"
import type { NewsArticle } from "../lib/supabase"

interface NewsCardProps {
  article: NewsArticle & {
    originalLanguage?: string
    translatedTitle?: string
    translatedDescription?: string
    primaryCategory?: string
    contentType?: string
    audienceLevel?: string
    autoTags?: string[]
    source_tier?: string
  }
  onClick?: (article: NewsArticle) => void
  showSuggestMore?: boolean
  onPreferenceChange?: (articleId: string, isLiked: boolean) => void
  index?: number
}

export function NewsCard({ 
  article, 
  onClick, 
  showSuggestMore = true,
  onPreferenceChange,
  index = 0
}: NewsCardProps) {
  const handleClick = () => {
    onClick?.(article)
  }

  const handleSuggestMoreClick = () => {
    UserPreferencesManager.addPreference(article)
    onPreferenceChange?.(article.id, true)
  }

  // Use translated content if available, otherwise fallback to original
  const displayTitle = article.translatedTitle || article.title
  const displayDescription = article.translatedDescription || article.description

  return (
    <EnhancedNewsCard
      imageSrc={article.image_url}
      title={displayTitle}
      description={displayDescription}
      source={article.source}
      uploadTime={formatTimeAgo(article.published_date)}
      showSuggestMore={showSuggestMore}
      onClick={handleClick}
      onSuggestMoreClick={handleSuggestMoreClick}
      className="group"
      index={index}
    >
      {/* Translation indicator only if actually translated */}
      {article.originalLanguage === 'bangla' && article.translatedTitle && (
        <div className="mb-3">
          <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
            <span>Translated from Bangla</span>
          </div>
        </div>
      )}
    </EnhancedNewsCard>
  )
}