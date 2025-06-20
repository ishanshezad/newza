import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FadeTransitionProps {
  children: React.ReactNode
  isVisible: boolean
  duration?: number
  className?: string
}

export function FadeTransition({ 
  children, 
  isVisible, 
  duration = 0.3,
  className = "" 
}: FadeTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration,
            ease: "easeInOut"
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}