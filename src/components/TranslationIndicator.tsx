import React from 'react'
import { Languages, Tag, Users, FileText } from 'lucide-react'
import { TranslationService } from '../lib/translationService'

interface TranslationIndicatorProps {
  article: {
    originalLanguage?: string
    translatedTitle?: string
    primaryCategory?: string
    contentType?: string
    audienceLevel?: string
    autoTags?: string[]
  }
  showDetails?: boolean
  className?: string
}

export function TranslationIndicator({ 
  article, 
  showDetails = false, 
  className = '' 
}: TranslationIndicatorProps) {
  const isTranslated = article.originalLanguage === 'bangla' && article.translatedTitle

  if (!isTranslated && !showDetails) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Translation Badge */}
      {isTranslated && (
        <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
          <Languages className="h-3 w-3" />
          <span>Translated from Bangla</span>
        </div>
      )}

      {/* Content Analysis Details */}
      {showDetails && (
        <div className="flex flex-wrap gap-2 text-xs">
          {article.primaryCategory && (
            <div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
              <Tag className="h-3 w-3" />
              <span>{TranslationService.getCategoryDisplayName(article.primaryCategory)}</span>
            </div>
          )}
          
          {article.contentType && (
            <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              <FileText className="h-3 w-3" />
              <span>{TranslationService.getContentTypeDisplayName(article.contentType)}</span>
            </div>
          )}
          
          {article.audienceLevel && (
            <div className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
              <Users className="h-3 w-3" />
              <span>{TranslationService.getAudienceDisplayName(article.audienceLevel)}</span>
            </div>
          )}
        </div>
      )}

      {/* Auto Tags */}
      {showDetails && article.autoTags && article.autoTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {article.autoTags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}