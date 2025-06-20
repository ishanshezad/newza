import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { TikTokHeader } from './components/ui/TikTokHeader'
import { NewsFeed } from './components/NewsFeed'
import { MiddleEastWarFeed } from './components/MiddleEastWarFeed'
import { WarDashboard } from './components/ui/WarDashboard'
import { SplashScreens } from './components/SplashScreen'
import { useDebounce } from './hooks/useDebounce'
import { BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

const categories = [
  "Middle East War",
  "Today", 
  "Politics", 
  "Sports", 
  "Entertainment", 
  "Technology", 
  "Health", 
  "Business", 
  "World"
]

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashType, setSplashType] = useState(1)
  const [activeCategory, setActiveCategory] = useState("Today")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMiddleEastTags, setSelectedMiddleEastTags] = useState<string[]>([])
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category)
    setSearchQuery("") // Clear search when changing category
    setSelectedMiddleEastTags([]) // Clear Middle East tags when changing category
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const renderSplashScreen = () => {
    const { SplashScreen1 } = SplashScreens
    return <SplashScreen1 onComplete={handleSplashComplete} />
  }

  if (showSplash) {
    return renderSplashScreen()
  }

  const isMiddleEastWarCategory = activeCategory === "Middle East War"

  return (
    <div className="min-h-screen bg-background">
      <TikTokHeader
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
        searchValue={searchQuery}
        placeholder={isMiddleEastWarCategory ? "Search Middle East war news..." : "Search breaking news..."}
      />
      
      {/* Main content area */}
      <div className="py-4 pb-20">
        <motion.div
          key={activeCategory} // Key for seamless animation on category change
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {isMiddleEastWarCategory ? (
            <div>
              <MiddleEastWarFeed
                searchQuery={debouncedSearchQuery}
                selectedTags={selectedMiddleEastTags}
              />
            </div>
          ) : (
            <div className="px-4 space-y-4">
              <NewsFeed
                category={activeCategory}
                searchQuery={debouncedSearchQuery}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Analytics Button - Only show in Middle East War tab - Moved to center */}
      <AnimatePresence>
        {isMiddleEastWarCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ 
              delay: 0.5,
              duration: 0.3,
              ease: "easeOut"
            }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
          >
            <motion.button
              onClick={() => setIsDashboardOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="h-6 w-6" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* War Dashboard */}
      <WarDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
      
      <Toaster position="bottom-center" />
    </div>
  )
}

export default App