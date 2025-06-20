import * as React from "react"
import { motion, Reorder } from "framer-motion"
import { BarChart3, X, Zap, Users, TrendingUp, MapPin, Clock, Globe, AlertTriangle, Plus } from "lucide-react"
import { cn } from "../../lib/utils"

interface WarDashboardProps {
  isOpen: boolean
  onClose: () => void
}

interface DashboardWidget {
  id: string
  name: string
  icon: React.ElementType
  color: string
  component: React.FC<{ currentTime: Date }>
  size?: 'full' | 'half' | 'quarter'
}

interface WidgetLayout {
  id: string
  size: 'full' | 'half' | 'quarter'
}

export const WarDashboard: React.FC<WarDashboardProps> = ({ isOpen, onClose }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [showWidgetLibrary, setShowWidgetLibrary] = React.useState(false)
  const [dashboardWidgetIds, setDashboardWidgetIds] = React.useState<string[]>([
    'ai-updates', 'key-metrics', 'daily-events', 'casualty-metrics'
  ])
  const [widgetLayouts, setWidgetLayouts] = React.useState<WidgetLayout[]>([
    { id: 'ai-updates', size: 'full' },
    { id: 'key-metrics', size: 'half' },
    { id: 'daily-events', size: 'half' },
    { id: 'casualty-metrics', size: 'full' }
  ])
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

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

  const availableWidgets: DashboardWidget[] = [
    {
      id: 'ai-updates',
      name: 'AI News Updates',
      icon: Zap,
      color: 'text-purple-500',
      component: ({ currentTime }) => (
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-medium text-muted-foreground">AI-powered News Updates</span>
          <p className="text-lg font-bold ml-auto">Live: {formatTime(currentTime)}</p>
        </div>
      ),
    },
    {
      id: 'key-metrics',
      name: 'Key Metrics',
      icon: TrendingUp,
      color: 'text-blue-500',
      component: () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-3 w-3 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">Displaced</span>
            </div>
            <p className="text-sm font-bold">2.1M</p>
            <p className="text-xs text-red-500">+12% today</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground">Aid Delivered</span>
            </div>
            <p className="text-sm font-bold">847</p>
            <p className="text-xs text-green-500">+5% today</p>
          </div>
        </div>
      ),
    },
    {
      id: 'daily-events',
      name: 'Daily Event Log',
      icon: Clock,
      color: 'text-orange-500',
      component: () => (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          <div className="bg-muted/50 border border-border rounded-lg p-2">
            <div className="text-xs font-bold text-foreground">June 19</div>
            <div className="text-xs text-muted-foreground">Iranian missiles damage Soroka Hospital (200+ injured)</div>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-2">
            <div className="text-xs font-bold text-foreground">June 18</div>
            <div className="text-xs text-muted-foreground">Israel destroys Arak nuclear facility; 24 total deaths reported</div>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-2">
            <div className="text-xs font-bold text-foreground">June 20</div>
            <div className="text-xs text-muted-foreground">UN urges peace; EU revives diplomacy efforts</div>
          </div>
        </div>
      ),
    },
    {
      id: 'casualty-metrics',
      name: 'Casualty Metrics',
      icon: BarChart3,
      color: 'text-red-500',
      component: () => (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1 font-medium">Category</th>
                <th className="text-left py-1 font-medium">Israel</th>
                <th className="text-left py-1 font-medium">Iran</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-border/50">
                <td className="py-1 text-muted-foreground">Deaths</td>
                <td className="py-1">24 civilians</td>
                <td className="py-1">224–639 (disputed)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1 text-muted-foreground">Injured</td>
                <td className="py-1">200+ (hospital strike)</td>
                <td className="py-1">1,277+</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1 text-muted-foreground">Infrastructure</td>
                <td className="py-1">Hospital, neighborhoods</td>
                <td className="py-1">Natanz/Arak sites, refineries</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground">Displaced</td>
                <td className="py-1">5,110 homeless</td>
                <td className="py-1">Internet shutdown</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'timeline',
      name: 'Key Incidents Timeline',
      icon: MapPin,
      color: 'text-green-500',
      component: () => (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">June 12:</span>
            <span className="text-muted-foreground">War begins - Israeli airstrikes</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="font-medium">June 15:</span>
            <span className="text-muted-foreground">330,000 evacuated from Tehran</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium">June 20:</span>
            <span className="text-muted-foreground">EU revives diplomacy efforts</span>
          </div>
        </div>
      ),
    },
    {
      id: 'conflict-map',
      name: 'Conflict Zone Map',
      icon: Globe,
      color: 'text-indigo-500',
      component: () => (
        <div className="bg-muted/50 rounded-lg p-4 h-24 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Interactive map view</p>
          </div>
        </div>
      ),
    },
    {
      id: 'diplomatic-updates',
      name: 'Diplomatic Updates',
      icon: Users,
      color: 'text-cyan-500',
      component: () => (
        <div className="space-y-2">
          <div className="bg-muted/50 border border-border rounded-lg p-2">
            <div className="text-xs font-bold text-foreground">UN Security Council</div>
            <div className="text-xs text-muted-foreground">Emergency session scheduled for tomorrow</div>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-2">
            <div className="text-xs font-bold text-foreground">EU Mediation</div>
            <div className="text-xs text-muted-foreground">High-level talks resume in Brussels</div>
          </div>
        </div>
      ),
    },
    {
      id: 'media-coverage',
      name: 'Media Coverage',
      icon: AlertTriangle,
      color: 'text-yellow-500',
      component: () => (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span>BBC News</span>
            <span className="text-green-500">●</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>Reuters</span>
            <span className="text-green-500">●</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>Al Jazeera</span>
            <span className="text-yellow-500">●</span>
          </div>
        </div>
      ),
    },
  ]

  const addWidget = (widgetId: string) => {
    if (!dashboardWidgetIds.includes(widgetId)) {
      setDashboardWidgetIds([...dashboardWidgetIds, widgetId])
      setWidgetLayouts([...widgetLayouts, { id: widgetId, size: 'full' }])
    }
    setShowWidgetLibrary(false)
  }

  const removeWidget = (widgetId: string) => {
    setDashboardWidgetIds(dashboardWidgetIds.filter(id => id !== widgetId))
    setWidgetLayouts(widgetLayouts.filter(layout => layout.id !== widgetId))
  }

  const getWidgetSize = (widgetId: string) => {
    return widgetLayouts.find(layout => layout.id === widgetId)?.size || 'full'
  }

  const handleWidgetReorder = (newOrder: string[]) => {
    setDashboardWidgetIds(newOrder)
  }

  const handleDragOver = (index: number) => {
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    setDragOverIndex(null)
  }

  const getGridClass = (size: 'full' | 'half' | 'quarter') => {
    switch (size) {
      case 'full': return 'col-span-2'
      case 'half': return 'col-span-1'
      case 'quarter': return 'col-span-1 row-span-1'
      default: return 'col-span-2'
    }
  }

  const getWidgetById = (id: string) => availableWidgets.find(w => w.id === id)

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
        <div className="p-6 border-b border-border" style={{ background: 'linear-gradient(135deg, #800000 0%, #a00000 100%)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-wide">War Dashboard</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4 pb-20">
          {dashboardWidgetIds.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No widgets added yet</p>
              <button
                onClick={() => setShowWidgetLibrary(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Your First Widget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Reorder.Group
                axis="y"
                values={dashboardWidgetIds}
                onReorder={handleWidgetReorder}
                className="contents"
              >
                {dashboardWidgetIds.map((widgetId, index) => {
                  const widget = getWidgetById(widgetId)
                  if (!widget) return null

                  const Icon = widget.icon
                  const WidgetComponent = widget.component
                  const widgetSize = getWidgetSize(widgetId)

                  return (
                    <Reorder.Item
                      key={widget.id}
                      value={widget.id}
                      className={cn(
                        "bg-card border border-border rounded-xl p-4 relative overflow-hidden transition-all duration-300",
                        "cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md",
                        "flex flex-col gap-3",
                        getGridClass(widgetSize),
                        dragOverIndex === index ? "ring-2 ring-primary ring-opacity-50" : ""
                      )}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onDragStart={() => handleDragOver(index)}
                      onDragEnd={handleDragEnd}
                    >
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="absolute top-2 right-2 w-5 h-5 bg-muted/80 hover:bg-destructive/20 rounded-full flex items-center justify-center transition-colors group z-10"
                        aria-label={`Remove ${widget.name}`}
                      >
                        <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive transition-colors" />
                      </button>
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5", widget.color)} />
                        <h3 className="font-semibold text-base text-foreground">{widget.name}</h3>
                      </div>
                      <div className="flex-1">
                        <WidgetComponent currentTime={currentTime} />
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            </div>
          )}
        </div>

        {/* Add Widget Button - Center Bottom */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
        >
          <button
            onClick={() => setShowWidgetLibrary(true)}
            className="w-12 h-12 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(128, 0, 0, 0.3)' }}
            aria-label="Add Widget"
          >
            <Plus className="h-6 w-6 text-white opacity-70" />
          </button>
        </motion.div>

        {/* Widget Library Modal */}
        {showWidgetLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Widget Library</h3>
                <button
                  onClick={() => setShowWidgetLibrary(false)}
                  className="p-1 rounded-full hover:bg-accent transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {availableWidgets.map((widget) => {
                  const Icon = widget.icon
                  const isAdded = dashboardWidgetIds.includes(widget.id)
                  return (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget.id)}
                      disabled={isAdded}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        isAdded 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Icon className={cn("h-5 w-5", widget.color)} />
                      <div>
                        <div className="font-medium">{widget.name}</div>
                        {isAdded && <div className="text-xs text-muted-foreground">Already added</div>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}