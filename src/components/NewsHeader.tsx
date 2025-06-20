import * as React from "react"
import { motion, MotionConfig } from "framer-motion"
import { Search, ArrowLeft } from "lucide-react"
import { cn } from "../lib/utils"

interface NewsHeaderProps {
  categories?: string[]
  activeCategory?: string
  onCategorySelect?: (category: string) => void
  onSearch?: (value: string) => void
  searchValue?: string
  placeholder?: string
}

export function NewsHeader({
  categories = ["Today", "Politics", "Sports", "Entertainment", "Technology", "Health", "Business", "World"],
  activeCategory = "Today",
  onCategorySelect,
  onSearch,
  searchValue = "",
  placeholder = "Search news..."
}: NewsHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const categoryRefs = React.useRef<{ [key: string]: HTMLButtonElement | null }>({})

  const transition = {
    type: "spring",
    bounce: 0.1,
    duration: 0.3,
  }

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

  // Auto-center active category
  React.useEffect(() => {
    if (activeCategory && scrollContainerRef.current && categoryRefs.current[activeCategory]) {
      const container = scrollContainerRef.current
      const activeButton = categoryRefs.current[activeCategory]
      
      if (activeButton) {
        const containerRect = container.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        
        const containerCenter = containerRect.width / 2
        const buttonCenter = buttonRect.left - containerRect.left + buttonRect.width / 2
        const scrollOffset = buttonCenter - containerCenter
        
        container.scrollTo({
          left: container.scrollLeft + scrollOffset,
          behavior: 'smooth'
        })
      }
    }
  }, [activeCategory])

  const handleCategoryClick = (category: string) => {
    onCategorySelect?.(category)
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
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
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
            {/* Center - Category Filters */}
            <div className="flex-1 flex justify-center">
              <div 
                ref={scrollContainerRef}
                className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-[calc(100vw-120px)] scroll-smooth"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    ref={(el) => {
                      categoryRefs.current[category] = el
                    }}
                    onClick={() => handleCategoryClick(category)}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0",
                      activeCategory === category
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {category}
                    {activeCategory === category && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full"
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
              </div>
            </div>

            {/* Right - Search Icon */}
            <div className="flex items-center">
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