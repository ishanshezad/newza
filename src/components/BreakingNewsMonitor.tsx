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
  const [stats, setStats] = React.useState({
    sourcesMonitored: 0,
    breakingNewsFound: 0,
    totalProcessed: 0
  })

  const triggerBreakingNewsCheck = async () => {
    setIsMonitoring(true)
    setStatus('checking')
    
    try {
      const response = await fetch('/functions/v1/breaking-news-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setStatus('success')
        setStats({
          sourcesMonitored: result.sourcesMonitored || 0,
          breakingNewsFound: result.breakingNewsFound || 0,
          totalProcessed: result.totalProcessed || 0
        })
      } else {
        setStatus('error')
      }
      
      setLastCheck(new Date())
    } catch (error) {
      console.error('Breaking news check failed:', error)
      setStatus('error')
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
        return 'Monitoring failed'
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