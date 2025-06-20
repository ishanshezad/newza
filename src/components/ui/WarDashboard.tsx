import * as React from "react"
import { motion } from "framer-motion"
import { BarChart3, X, Zap, Users, TrendingUp, MapPin } from "lucide-react"
import { cn } from "../../lib/utils"

interface WarDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export const WarDashboard: React.FC<WarDashboardProps> = ({ isOpen, onClose }) => {
  const keyIncidents = [
    { date: "Today", event: "Ceasefire talks begin", severity: "high" },
    { date: "June 19", event: "Airstrikes on infrastructure", severity: "critical" },
    { date: "June 18", event: "Humanitarian corridor opened", severity: "medium" },
    { date: "June 17", event: "Cyber attacks reported", severity: "high" },
    { date: "June 16", event: "Emergency summit called", severity: "medium" },
    { date: "June 15", event: "Civilian casualties rise", severity: "critical" },
  ]

  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    })
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isOpen ? "0%" : "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-background border-t border-border rounded-t-2xl shadow-2xl"
      style={{ height: "auto", maxHeight: "85vh" }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">War Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-6 pb-6">
          {/* AI-powered News Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-muted-foreground">AI-powered News Updates</span>
            </div>
            <p className="text-lg font-bold">Live: {formatTime(currentTime)}</p>
            <p className="text-xs text-muted-foreground">Analyzing real-time data for critical insights.</p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">Displaced</span>
              </div>
              <p className="text-lg font-bold">2.1M</p>
              <p className="text-xs text-red-500">+12% today</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-muted-foreground">Aid Delivered</span>
              </div>
              <p className="text-lg font-bold">847</p>
              <p className="text-xs text-green-500">+5% today</p>
            </div>
          </motion.div>

          {/* Timeline of Key Incidents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Key Incidents Timeline
            </h3>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-2" style={{ width: "max-content", minWidth: "100%" }}>
                {keyIncidents.map((incident, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-shrink-0 w-32 p-3 rounded-lg border text-center",
                      incident.severity === "critical" && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
                      incident.severity === "high" && "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
                      incident.severity === "medium" && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1">{incident.date}</div>
                    <div className="text-xs font-medium leading-tight">{incident.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Map Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Conflict Zone Map
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border border-border rounded-lg h-48 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              <div className="text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Interactive Map</p>
                <p className="text-xs text-muted-foreground">Iran • Israel • Gaza</p>
              </div>
              {/* Simulated map markers */}
              <div className="absolute top-6 left-8 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 right-12 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="absolute top-12 right-6 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}