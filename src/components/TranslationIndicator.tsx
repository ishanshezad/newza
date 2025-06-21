import React from 'react'
import { Languages } from 'lucide-react'

interface TranslationIndicatorProps {
  article: {
    originalLanguage?: string
    translatedTitle?: string
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

  if (!isTranslated) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
        <Languages className="h-3 w-3" />
        <span>Translated from Bangla</span>
      </div>
    </div>
  )
}