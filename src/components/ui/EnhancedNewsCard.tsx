import * as React from "react"
import { motion } from "framer-motion"
import { Clock, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"

interface EnhancedNewsCardProps {
  imageSrc?: string | null
  title: string
  description?: string | null
  source: string
  uploadTime?: string
  showSuggestMore?: boolean
  onClick?: () => void
  onSuggestMoreClick?: () => void
  className?: string
  children?: React.ReactNode
  index?: number
  isBreakingNews?: boolean
}

export const EnhancedNewsCard: React.FC<EnhancedNewsCardProps> = ({ 
  imageSrc, 
  title, 
  description, 
  source, 
  uploadTime, 
  showSuggestMore = true,
  onClick,
  onSuggestMoreClick,
  className = "",
  children,
  index = 0,
  isBreakingNews = false
}) => {
  const [isClicked, setIsClicked] = React.useState(false)

  const handleSparklesClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsClicked(true)
    
    // Call the preference change callback
    onSuggestMoreClick?.()
    
    // Don't reset - keep it purple permanently
  }

  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex relative cursor-pointer",
        isBreakingNews ? "flex-col w-64 flex-shrink-0" : "flex-col sm:flex-row",
        isBreakingNews ? "border-l-4 border-l-red-600" : "border-l-4 border-l-[var(--card-border-color)]",
        className
      )}
      style={{ '--card-border-color': '#800000' } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Suggest More Button (Sparkles) */}
      {showSuggestMore && (
        <div className="absolute top-2 right-2 z-10">
          <div className="group relative">
            <motion.button
              onClick={handleSparklesClick}
              className="bg-background/80 backdrop-blur-sm border border-border rounded-full p-1.5 hover:bg-accent transition-all duration-200 hover:scale-105 shadow-sm"
              aria-label="Suggest more like this"
              animate={isClicked ? {
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <motion.div
                animate={isClicked ? {
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{ duration: 0.4 }}
              >
                <Sparkles className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isClicked ? "text-purple-500" : "text-muted-foreground"
                )} />
              </motion.div>
              {/* Success ripple effect */}
              {isClicked && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-500"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.button>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Suggest more
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      <div className={cn(
        "w-full relative flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300",
        isBreakingNews ? "h-32" : "sm:w-1/3 h-32 sm:h-auto"
      )}>
        <img
          src={imageSrc || "https://picsum.photos/400/200?random=1"}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Custom content (tags, etc.) */}
          {children}
          
          <h3 className="font-semibold text-sm sm:text-base mb-1 text-foreground line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground text-xs sm:text-sm leading-snug line-clamp-3 mb-2">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xs text-muted-foreground font-medium truncate mr-2">
            {source}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {uploadTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{uploadTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}