"use client"

import * as React from "react"
import { motion, MotionConfig } from "framer-motion"
import { Search, ArrowLeft } from "lucide-react"
import { cn } from "../../lib/utils"
import { useDebounceCallback } from "../../hooks/useDebounceCallback"

interface TikTokHeaderProps {
  categories?: string[]
  activeCategory?: string
  onCategorySelect?: (category: string) => void
  onSearch?: (value: string) => void
  searchValue?: string
  placeholder?: string
}

export function TikTokHeader({
  categories = ["Middle East War", "Today", "Politics", "Sports", "Entertainment", "Technology", "Health", "Business"],
  activeCategory = "Today",
  onCategorySelect,
  onSearch,
  searchValue = "",
  placeholder = "Search news..."
}: TikTokHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue)
  const [scrollOffset, setScrollOffset] = React.useState(0)
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const categoriesRef = React.useRef<HTMLDivElement>(null)
  const categoryRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const transition = {
    type: "spring",
    bounce: 0.1,
    duration: 0.3,
  }

  // Debounced category selection to prevent rapid transitions
  const debouncedCategorySelect = useDebounceCallback((category: string) => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      onCategorySelect?.(category)
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false)
      }, 400)
    }
  }, 150)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  React.useEffect(() => {
    setLocalSearchValue(searchValue)
  }, [searchValue])

  // Auto-center active category with smooth animation
  React.useEffect(() => {
    if (activeCategory && categoriesRef.current && categoryRefs.current.length > 0) {
      const categoryIndex = categories.indexOf(activeCategory)
      const categoryElement = categoryRefs.current[categoryIndex]
      const containerElement = categoriesRef.current

      if (categoryElement && containerElement) {
        const containerWidth = containerElement.offsetWidth
        const categoryLeft = categoryElement.offsetLeft
        const categoryWidth = categoryElement.offsetWidth
        const containerCenter = containerWidth / 2
        const categoryCenter = categoryLeft + categoryWidth / 2

        const newScrollOffset = containerCenter - categoryCenter
        setScrollOffset(newScrollOffset)
      }
    }
  }, [activeCategory, categories])

  const handleCategoryClick = (category: string) => {
    if (category !== activeCategory && !isTransitioning) {
      debouncedCategorySelect(category)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(localSearchValue)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchValue(value)
    onSearch?.(value)
  }

  return (
    <MotionConfig transition={transition}>
      <div className="sticky top-0 z-50 bg-background"> {/* Removed border */}
        <div className="relative" ref={containerRef}>
          <motion.div
            className="flex items-center justify-between px-4 py-3"
            animate={{
              opacity: isSearchOpen ? 0 : 1,
              scale: isSearchOpen ? 0.95 : 1,
            }}
            style={{
              pointerEvents: isSearchOpen ? "none" : "auto"
            }}
          >
            {/* Left - Empty space for balance */}
            <div className="w-10 flex-shrink-0"></div>

            {/* Center - Category Filters */}
            <div className="flex-1 flex justify-start overflow-hidden">
              <div
                ref={categoriesRef}
                className="flex items-center gap-2 overflow-x-hidden"
              >
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ x: scrollOffset }}
                  transition={{ 
                    type: "spring", 
                    damping: 20, 
                    stiffness: 300,
                    duration: 0.6
                  }}
                >
                  {categories.map((category, index) => (
                    <button
                      key={category}
                      ref={el => categoryRefs.current[index] = el}
                      onClick={() => handleCategoryClick(category)}
                      disabled={isTransitioning}
                      className={cn(
                        "relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out",
                        activeCategory === category
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                        isTransitioning && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {category}
                      {activeCategory === category && (
                        <motion.div
                          layoutId="activeCategory"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                          transition={{ 
                            type: "spring", 
                            bounce: 0.2, 
                            duration: 0.6,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right - Search Icon */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-accent transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </motion.div>

          {/* Search Overlay */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isSearchOpen ? 1 : 0,
              scale: isSearchOpen ? 1 : 0.95,
            }}
            style={{
              pointerEvents: isSearchOpen ? "auto" : "none"
            }}
          >
            <div className="flex items-center px-4 py-3 gap-3">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-full hover:bg-accent transition-colors flex-shrink-0"
                aria-label="Close search"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={localSearchValue}
                  onChange={handleSearchChange}
                  placeholder={placeholder}
                  className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                />
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}