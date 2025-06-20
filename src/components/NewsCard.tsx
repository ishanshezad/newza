import * as React from "react"
import { Clock } from "lucide-react"
import { formatTimeAgo, truncateText } from "../lib/utils"
import { ThumbsUpButton } from "./ThumbsUpButton"
import { TranslationIndicator } from "./TranslationIndicator"
import { TranslationService } from "../lib/translationService"
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
  }
  onClick?: (article: NewsArticle) => void
  showThumbsUp?: boolean
  onPreferenceChange?: (articleId: string, isLiked: boolean) => void
}

export function NewsCard({ 
  article, 
  onClick, 
  showThumbsUp = true,
  onPreferenceChange 
}: NewsCardProps) {
  const handleClick = () => {
    onClick?.(article)
  }

  // Use translated content if available
  const displayTitle = TranslationService.getDisplayTitle(article)
  const displayDescription = TranslationService.getDisplayDescription(article)

  return (
    <div 
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image Preview */}
      {article.image_url && (
        <div className="w-full h-48 relative overflow-hidden">
          <img 
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(article.published_date)}</span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-5">
        {/* Translation and Category Indicators */}
        <TranslationIndicator 
          article={article} 
          showDetails={true}
          className="mb-3"
        />

        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-foreground leading-tight flex-1 text-lg group-hover:text-primary transition-colors duration-200">
            {truncateText(displayTitle, 100)}
          </h3>
          {showThumbsUp && (
            <ThumbsUpButton 
              article={article}
              onPreferenceChange={onPreferenceChange}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
            />
          )}
        </div>
        
        {displayDescription && (
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            {truncateText(displayDescription, 150)}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-1 rounded-full">
              {article.source}
            </span>
            {article.category && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {article.category}
                </span>
              </>
            )}
          </div>
          
          {!article.image_url && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(article.published_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}