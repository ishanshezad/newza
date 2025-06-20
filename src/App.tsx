import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { NewsHeader } from './components/NewsHeader'
import { NewsFeed } from './components/NewsFeed'
import { SplashScreens } from './components/SplashScreen'
import { useDebounce } from './hooks/useDebounce'
import './index.css'

const categories = [
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
    const { SplashScreen1, SplashScreen2, SplashScreen3, SplashScreen4 } = SplashScreens
    
    switch (splashType) {
      case 1: return <SplashScreen1 onComplete={handleSplashComplete} />
      case 2: return <SplashScreen2 onComplete={handleSplashComplete} />
      case 3: return <SplashScreen3 onComplete={handleSplashComplete} />
      case 4: return <SplashScreen4 onComplete={handleSplashComplete} />
      default: return <SplashScreen1 onComplete={handleSplashComplete} />
    }
  }

  if (showSplash) {
    return renderSplashScreen()
  }

  return (
    <div className="min-h-screen bg-black">
      <NewsHeader
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
        searchValue={searchQuery}
        placeholder="Search breaking news..."
      />
      
      <main className="px-4 py-6 max-w-4xl mx-auto">
        <NewsFeed
          category={activeCategory}
          searchQuery={debouncedSearchQuery}
        />
      </main>
      
      <Toaster position="bottom-center" />
    </div>
  )
}

export default App