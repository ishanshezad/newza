import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface LoadingSkeletonProps {
  className?: string
  variant?: 'card' | 'timeline' | 'header' | 'text'
  count?: number
}

export function LoadingSkeleton({ 
  className = "", 
  variant = 'card',
  count = 1 
}: LoadingSkeletonProps) {
  const skeletonVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { 
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  }

  const renderCardSkeleton = () => (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm flex flex-col sm:flex-row relative">
      {/* Image skeleton */}
      <div className="w-full sm:w-1/3 h-32 sm:h-auto bg-muted relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>
      
      {/* Content skeleton */}
      <div className="p-3 sm:p-4 flex-1 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
          <div className="h-4 bg-muted rounded w-3/4 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
          <div className="h-3 bg-muted rounded w-5/6 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
          <div className="h-3 bg-muted rounded w-2/3 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
        </div>
        
        {/* Footer skeleton */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-muted rounded w-20 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
          <div className="h-3 bg-muted rounded w-16 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderTimelineSkeleton = () => (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex justify-start pt-2 gap-4">
          <div className="sticky flex flex-col z-40 items-start top-16 self-start w-[6%] pl-4 -mb-2">
            <div className="h-4 bg-muted rounded w-12 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
              />
            </div>
          </div>
          <div className="relative -ml-2 w-[96%] mt-6 space-y-4">
            {Array.from({ length: 2 + index }).map((_, cardIndex) => (
              <div key={cardIndex}>
                {renderCardSkeleton()}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderTextSkeleton = () => (
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>
      <div className="h-4 bg-muted rounded w-3/4 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>
    </div>
  )

  const renderHeaderSkeleton = () => (
    <div className="flex items-center gap-4 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-8 bg-muted rounded w-20 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      ))}
    </div>
  )

  const renderSkeleton = () => {
    switch (variant) {
      case 'timeline':
        return renderTimelineSkeleton()
      case 'header':
        return renderHeaderSkeleton()
      case 'text':
        return renderTextSkeleton()
      default:
        return renderCardSkeleton()
    }
  }

  return (
    <motion.div
      className={cn("animate-pulse", className)}
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={index > 0 ? "mt-4" : ""}>
          {renderSkeleton()}
        </div>
      ))}
    </motion.div>
  )
}