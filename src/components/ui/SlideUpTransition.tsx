import * as React from "react"
import { motion } from "framer-motion"

interface SlideUpTransitionProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function SlideUpTransition({ 
  children, 
  delay = 0, 
  duration = 0.4,
  className = "" 
}: SlideUpTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration,
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}