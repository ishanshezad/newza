import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

interface ContentContainerProps {
  children: React.ReactNode
  isLoading?: boolean
  minHeight?: string
  className?: string
  contentKey: string // Used for AnimatePresence key
}

export function ContentContainer({ 
  children, 
  isLoading = false,
  minHeight = "400px",
  className = "",
  contentKey
}: ContentContainerProps) {
  return (
    <div 
      className={cn("relative", className)}
      style={{ minHeight }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={contentKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}