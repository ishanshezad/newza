import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, ChevronDown } from "lucide-react"
import { supabase } from "../lib/middleEastWarSupabase"

interface MiddleEastWarTag {
  id: string
  name: string
  slug: string
  category: string
  color: string
  usage_count: number
}

interface MiddleEastWarTagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  className?: string
}

export function MiddleEastWarTagFilter({ 
  selectedTags, 
  onTagsChange, 
  className = "" 
}: MiddleEastWarTagFilterProps) {
  const [tags, setTags] = React.useState<MiddleEastWarTag[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  // Group tags by category
  const tagsByCategory = React.useMemo(() => {
    const grouped: Record<string, MiddleEastWarTag[]> = {}
    tags.forEach(tag => {
      if (!grouped[tag.category]) {
        grouped[tag.category] = []
      }
      grouped[tag.category].push(tag)
    })
    return grouped
  }, [tags])

  const fetchTags = React.useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('middleeastwartagtable')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      if (error) throw error
      setTags(data || [])
    } catch (err) {
      console.error('Failed to fetch Middle East war tags:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleTagToggle = (tagSlug: string) => {
    if (selectedTags.includes(tagSlug)) {
      onTagsChange(selectedTags.filter(slug => slug !== tagSlug))
    } else {
      onTagsChange([...selectedTags, tagSlug])
    }
  }

  const clearAllTags = () => {
    onTagsChange([])
  }

  const getCategoryDisplayName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">
          Filter by Tags
          {selectedTags.length > 0 && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {selectedTags.length}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTags.map(tagSlug => {
            const tag = tags.find(t => t.slug === tagSlug)
            if (!tag) return null
            
            return (
              <motion.div
                key={tagSlug}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${tag.color}20`, 
                  color: tag.color,
                  border: `1px solid ${tag.color}30`
                }}
              >
                {tag.name}
                <button
                  onClick={() => handleTagToggle(tagSlug)}
                  className="hover:bg-black/10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )
          })}
          <button
            onClick={clearAllTags}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading tags...
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      {getCategoryDisplayName(category)}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categoryTags.map(tag => (
                        <button
                          key={tag.slug}
                          onClick={() => handleTagToggle(tag.slug)}
                          className={`
                            flex items-center justify-between p-2 rounded-md text-left transition-colors
                            ${selectedTags.includes(tag.slug)
                              ? 'bg-primary/20 border border-primary/30'
                              : 'hover:bg-accent'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm">{tag.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {tag.usage_count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}