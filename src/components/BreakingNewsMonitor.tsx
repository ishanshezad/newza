import * as React from "react"
import { motion } from "framer-motion"
import { RefreshCw, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface BreakingNewsMonitorProps {
  className?: string
}

export function BreakingNewsMonitor({ className = "" }: BreakingNewsMonitorProps) {
  const [isMonitoring, setIsMonitoring] = React.useState(false)
  const [lastCheck, setLastCheck] = React.useState<Date | null>(null)
  const [status, setStatus] = React.useState<'idle' | 'checking' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState({
    sourcesMonitored: 0,
    breakingNewsFound: 0,
    totalProcessed: 0
  })

  const triggerBreakingNewsCheck = async () => {
    setIsMonitoring(true)
    setStatus('checking')
    setErrorMessage(null) // Clear any previous error messages
    
    try {
      const response = await fetch('/functions/v1/breaking-news-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // Check if the response is OK before attempting to parse JSON
      if (!response.ok) {
        // Try to get error message from response body
        let errorText = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorBody = await response.text()
          if (errorBody) {
            errorText += ` - ${errorBody}`
          }
        } catch (textError) {
          // If we can't read the response body, use the status text
        }
        throw new Error(errorText)
      }

      // Attempt to parse JSON response
      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        throw new Error(`Invalid JSON response from server: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error'}`)
      }
      
      // Check if the server reported success
      if (result.success) {
        setStatus('success')
        setStats({
          sourcesMonitored: result.sourcesMonitored || 0,
          breakingNewsFound: result.breakingNewsFound || 0,
          totalProcessed: result.totalProcessed || 0
        })
      } else {
        // Server returned a JSON response but indicated failure
        setStatus('error')
        setErrorMessage(result.error || 'Server reported an error but provided no details')
      }
      
      setLastCheck(new Date())
    } catch (error) {
      console.error('Breaking news check failed:', error)
      setStatus('error')
      
      // Set a user-friendly error message
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unknown error occurred during breaking news check')
      }
    } finally {
      setIsMonitoring(false)
    }
  }

  // Auto-check every 10 minutes
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isMonitoring) {
        triggerBreakingNewsCheck()
      }
    }, 10 * 60 * 1000) // 10 minutes

    // Initial check
    triggerBreakingNewsCheck()

    return () => clearInterval(interval)
  }, [isMonitoring])

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Zap className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Monitoring sources...'
      case 'success':
        return `Found ${stats.breakingNewsFound} breaking news items`
      case 'error':
        return errorMessage || 'Monitoring failed'
      default:
        return 'Ready to monitor'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-lg p-3 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">Breaking News Monitor</span>
        </div>
        
        <button
          onClick={triggerBreakingNewsCheck}
          disabled={isMonitoring}
          className="p-1 rounded hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isMonitoring ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground mb-2">
        {getStatusText()}
      </p>
      
      {status === 'success' && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium text-blue-500">{stats.sourcesMonitored}</div>
            <div className="text-muted-foreground">Sources</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-500">{stats.breakingNewsFound}</div>
            <div className="text-muted-foreground">Breaking</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-500">{stats.totalProcessed}</div>
            <div className="text-muted-foreground">Processed</div>
          </div>
        </div>
      )}
      
      {lastCheck && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last check: {lastCheck.toLocaleTimeString()}</span>
        </div>
      )}
    </motion.div>
  )
}