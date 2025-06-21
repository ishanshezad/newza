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
  const [isSticky, setIsSticky] = React.useState(false)
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

  // Sticky header detection
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsSticky(scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Set initial scroll position for "Today" to be centered using the middle set
  React.useEffect(() => {
    const todayIndex = categories.indexOf("Today");
    if (todayIndex !== -1) {
      const middleIndex = todayIndex + categories.length; // Use middle set
      const categoryElement = categoryRefs.current[middleIndex];
      const containerElement = categoriesRef.current;

      if (categoryElement && containerElement) {
        const containerWidth = containerElement.offsetWidth;
        const categoryLeft = categoryElement.offsetLeft;
        const categoryWidth = categoryElement.offsetWidth;
        const containerCenter = containerWidth / 2;
        const categoryCenter = categoryLeft + categoryWidth / 2;

        const initialScrollOffset = containerCenter - categoryCenter;
        setScrollOffset(initialScrollOffset);
      }
    }
  }, [categories]);

  const handleCategoryClick = (category: string) => {
    if (category !== activeCategory && !isTransitioning) {
      // Find the middle occurrence of the category for circular navigation
      const totalCategories = categories.length
      const categoryIndex = categories.indexOf(category)
      const middleIndex = categoryIndex + totalCategories // Use the middle set for positioning
      const categoryElement = categoryRefs.current[middleIndex]
      const containerElement = categoriesRef.current

      if (categoryElement && containerElement) {
        const containerWidth = containerElement.offsetWidth
        const categoryLeft = categoryElement.offsetLeft
        const categoryWidth = categoryElement.offsetWidth
        const containerCenter = containerWidth / 2
        const categoryCenter = categoryLeft + categoryWidth / 2

        const newScrollOffset = containerCenter - categoryCenter
        
        // Smooth transition to new position
        setScrollOffset(newScrollOffset)
      }

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
      <motion.div 
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isSticky 
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm sticky-backdrop" 
            : "bg-background"
        )}
        animate={{
          y: isSticky ? 0 : 0,
          scale: isSticky ? 0.98 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          duration: 0.3
        }}
      >
        <div className="relative" ref={containerRef}>
          <motion.div
            className="flex items-center justify-between px-4 py-3"
            animate={{
              opacity: isSearchOpen ? 0 : 1,
              scale: isSearchOpen ? 0.95 : 1,
              paddingTop: isSticky ? "0.5rem" : "0.75rem",
              paddingBottom: isSticky ? "0.5rem" : "0.75rem",
            }}
            style={{
              pointerEvents: isSearchOpen ? "none" : "auto"
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.2
            }}
          >
            {/* Left - Empty space for balance */}
            <div className="w-10 flex-shrink-0"></div>

            {/* Center - Category Filters with Circular Infinite Scroll */}
            <div className="flex-1 flex justify-start overflow-hidden">
              <div
                ref={categoriesRef}
                className="flex items-center gap-2 overflow-x-hidden auto-slide-container"
              >
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ x: scrollOffset }}
                  transition={{ 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 400,
                    mass: 0.8,
                    duration: 0.6
                  }}
                >
                  {/* Render categories in a circular fashion - triple the array for seamless infinite looping */}
                  {categories.concat(categories, categories).map((category, index) => (
                    <motion.button
                      key={`${category}-${index}`}
                      ref={el => categoryRefs.current[index] = el}
                      onClick={() => handleCategoryClick(category)}
                      disabled={isTransitioning}
                      className={cn(
                        "relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out flex-shrink-0 rounded-full category-button auto-slide-item category-transition",
                        activeCategory === category
                          ? "text-foreground bg-accent/50 active-category-glow"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
                        isTransitioning && "opacity-70 cursor-not-allowed"
                      )}
                      whileHover={{ 
                        scale: activeCategory === category ? 1.02 : 1.05,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        transition: { duration: 0.1 }
                      }}
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
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right - Search Icon */}
            <div className="flex items-center flex-shrink-0">
              <motion.button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-accent transition-colors"
                aria-label="Search"
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.9,
                  transition: { duration: 0.1 }
                }}
              >
                <Search className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Search Overlay */}
          <motion.div
            className="absolute inset-0 bg-background/95 backdrop-blur-md"
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
              <motion.button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-full hover:bg-accent transition-colors flex-shrink-0"
                aria-label="Close search"
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.9,
                  transition: { duration: 0.1 }
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <motion.input
                  ref={inputRef}
                  type="text"
                  value={localSearchValue}
                  onChange={handleSearchChange}
                  placeholder={placeholder}
                  className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ 
                    x: isSearchOpen ? 0 : 20, 
                    opacity: isSearchOpen ? 1 : 0 
                  }}
                  transition={{ delay: isSearchOpen ? 0.1 : 0 }}
                />
              </form>
            </div>
          </motion.div>
        </div>

        {/* Sticky indicator line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: isSticky ? 1 : 0, 
            opacity: isSticky ? 1 : 0 
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            duration: 0.3
          }}
        />
      </motion.div>
    </MotionConfig>
  )
}