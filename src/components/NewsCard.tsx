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

  // Get source tier information
  const sourceTierBadge = SourceRankingService.getSourceTierBadge(article.source)
  const isPopularSource = article.source_tier === 'tier1'

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
      className={`
        group
        ${isPopularSource ? 'border-l-blue-500 shadow-md' : ''}
      `}
      index={index}
    >
      {/* Source Tier Badge for Popular Sources */}
      {isPopularSource && (
        <div className="mb-2">
          <span
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: sourceTierBadge.bgColor, 
              color: sourceTierBadge.color 
            }}
          >
            ⭐ {sourceTierBadge.label} Source
          </span>
        </div>
      )}

      {/* Translation and Category Indicators */}
      <TranslationIndicator 
        article={article} 
        showDetails={true}
        className="mb-3"
      />
    </EnhancedNewsCard>
  )
}