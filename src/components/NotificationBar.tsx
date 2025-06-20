import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface NotificationBarProps {
  show: boolean
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  showSpinner?: boolean
}

export function NotificationBar({ 
  show, 
  message = "Compiling data to build recommendations...", 
  type = 'success',
  showSpinner = true 
}: NotificationBarProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white/95 text-purple-600 border-purple-200/50'
      case 'error':
        return 'bg-white/95 text-red-600 border-red-200/50'
      case 'warning':
        return 'bg-white/95 text-yellow-600 border-yellow-200/50'
      case 'info':
        return 'bg-white/95 text-blue-600 border-blue-200/50'
      default:
        return 'bg-white/95 text-purple-600 border-purple-200/50'
    }
  }

  const getSpinnerColor = () => {
    switch (type) {
      case 'success':
        return 'text-purple-500'
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      case 'info':
        return 'text-blue-500'
      default:
        return 'text-purple-500'
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.4 
          }}
          className={`
            fixed top-0 left-0 right-0 z-[60] 
            ${getTypeStyles()}
            backdrop-blur-sm border-b shadow-sm
          `}
        >
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              {showSpinner && (
                <Loader2 className={`h-4 w-4 animate-spin flex-shrink-0 ${getSpinnerColor()}`} />
              )}
              <span className="text-sm font-medium text-center">
                {message}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}