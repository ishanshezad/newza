import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, Sparkles } from 'lucide-react'
import { UserPreferencesManager } from '../lib/userPreferences'
import type { NewsArticle } from '../lib/supabase'

interface ThumbsUpButtonProps {
  article: NewsArticle
  onPreferenceChange?: (articleId: string, isLiked: boolean) => void
  className?: string
}

export function ThumbsUpButton({ article, onPreferenceChange, className = '' }: ThumbsUpButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)

  useEffect(() => {
    setIsLiked(UserPreferencesManager.hasPreference(article.id))
  }, [article.id])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isAnimating) return
    
    setIsAnimating(true)
    
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    
    if (newLikedState) {
      UserPreferencesManager.addPreference(article)
      setShowSparkles(true)
      setTimeout(() => setShowSparkles(false), 1000)
    } else {
      UserPreferencesManager.removePreference(article.id)
    }
    
    onPreferenceChange?.(article.id, newLikedState)
    
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleClick}
        className={`
          relative p-2 rounded-full transition-all duration-200 
          ${isLiked 
            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-background
        `}
        disabled={isAnimating}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isLiked ? 'Remove from preferences' : 'Add to preferences'}
        aria-pressed={isLiked}
      >
        <motion.div
          animate={{
            scale: isAnimating ? [1, 1.2, 1] : 1,
            rotate: isLiked ? [0, 10, -10, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <ThumbsUp 
            className={`h-4 w-4 transition-all duration-200 ${
              isLiked ? 'fill-current' : ''
            }`} 
          />
        </motion.div>
        
        {/* Ripple effect */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Sparkles animation */}
      <AnimatePresence>
        {showSparkles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  scale: 0, 
                  x: 0, 
                  y: 0,
                  rotate: 0
                }}
                animate={{ 
                  scale: [0, 1, 0], 
                  x: (Math.random() - 0.5) * 40,
                  y: (Math.random() - 0.5) * 40,
                  rotate: Math.random() * 360
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <Sparkles className="h-3 w-3 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}