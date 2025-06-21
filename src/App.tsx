import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { TikTokHeader } from './components/ui/TikTokHeader'
import { NewsFeed } from './components/NewsFeed'
import { MiddleEastWarFeed } from './components/MiddleEastWarFeed'
import { SplashScreens } from './components/SplashScreen'
import { useDebounce } from './hooks/useDebounce'
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
  const [activeCategory, setActiveCategory] = useState("Today")
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category)
    setSearchQuery("") // Clear search when changing category
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
      
      {/* Main content area - Optimized for fast category switching */}
      <div className="py-4 pb-20">
        {isMiddleEastWarCategory ? (
          <div>
            <MiddleEastWarFeed
              searchQuery={debouncedSearchQuery}
              selectedTags={[]}
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
      </div>
      
      <Toaster position="bottom-center" />
    </div>
  )
}

export default App