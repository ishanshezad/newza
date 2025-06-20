import * as React from "react"
import { Clock } from "lucide-react"
import { formatTimeAgo, truncateText } from "../lib/utils"
import { TranslationIndicator } from "./TranslationIndicator"
import { TranslationService } from "../lib/translationService"
import { EnhancedNewsCard } from "./ui/EnhancedNewsCard"
import { SourceRankingService } from "../lib/sourceRanking"
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
    // Add to user preferences when sparkles is clicked
    UserPreferencesManager.addPreference(article)
    onPreferenceChange?.(article.id, true)
  }

  // Use translated content if available
  const displayTitle = TranslationService.getDisplayTitle(article)
  const displayDescription = TranslationService.getDisplayDescription(article)

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
      {/* Translation and Category Indicators */}
      <TranslationIndicator 
        article={article} 
        showDetails={true}
        className="mb-3"
      />
    </EnhancedNewsCard>
  )
}