import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface ImageWithTransitionProps {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
}

export function ImageWithTransition({ 
  src, 
  alt, 
  className = "",
  fallbackClassName = "bg-gradient-to-br from-slate-200 to-slate-300"
}: ImageWithTransitionProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(false)
  }

  if (!src || hasError) {
    return (
      <div className={cn(fallbackClassName, className)}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-muted-foreground text-xs">No image</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div className={cn(fallbackClassName, "absolute inset-0 animate-pulse")}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-muted-foreground text-xs">Loading...</div>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </div>
  )
}