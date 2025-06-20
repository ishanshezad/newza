/*
  Auto-Tag Articles Edge Function
  
  This function automatically analyzes and tags articles using the NewsTaggingAgent.
  It can be called manually or scheduled to run periodically.
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simplified tagging patterns for edge function
const TAG_PATTERNS = {
  technology: ['ai', 'tech', 'digital', 'software', 'app', 'internet', 'cyber', 'innovation'],
  healthcare: ['health', 'medical', 'hospital', 'doctor', 'vaccine', 'covid', 'treatment'],
  finance: ['bank', 'economy', 'financial', 'investment', 'market', 'business', 'trade'],
  politics: ['government', 'minister', 'parliament', 'election', 'political', 'policy'],
  sports: ['cricket', 'football', 'sports', 'match', 'tournament', 'championship', 'game'],
  bangladesh: ['bangladesh', 'dhaka', 'bengali', 'bangla', 'chittagong', 'sylhet'],
  breaking: ['breaking', 'urgent', 'alert', 'developing', 'trending']
}

function analyzeArticleForTags(article: any): { tagSlugs: string[], relevanceScores: Record<string, number> } {
  const content = `${article.title} ${article.description || ''}`.toLowerCase()
  const tagSlugs: string[] = []
  const relevanceScores: Record<string, number> = {}

  // Analyze content against patterns
  for (const [tagKey, patterns] of Object.entries(TAG_PATTERNS)) {
    let score = 0
    let matches = 0

    for (const pattern of patterns) {
      if (content.includes(pattern.toLowerCase())) {
        matches++
        score += article.title.toLowerCase().includes(pattern.toLowerCase()) ? 20 : 10
      }
    }

    if (matches > 0) {
      score += Math.min(matches * 5, 25)
      
      if (score >= 20) {
        tagSlugs.push(tagKey)
        relevanceScores[tagKey] = Math.min(score, 100)
      }
    }
  }

  // Add category-based tags
  const categoryMap: Record<string, string> = {
    politics: 'politics',
    sports: 'sports',
    technology: 'technology',
    health: 'healthcare',
    business: 'finance',
    general: 'breaking-news'
  }

  const categoryTag = categoryMap[article.category?.toLowerCase()]
  if (categoryTag && !tagSlugs.includes(categoryTag)) {
    tagSlugs.push(categoryTag)
    relevanceScores[categoryTag] = 90
  }

  // Add region tags
  if (article.region?.toLowerCase().includes('asia') && !tagSlugs.includes('asia')) {
    tagSlugs.push('asia')
    relevanceScores['asia'] = 85
  }

  return {
    tagSlugs: tagSlugs.slice(0, 5),
    relevanceScores
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const forceRetag = url.searchParams.get('force') === 'true'

    // Get articles that need tagging
    let query = supabase
      .from('news_articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!forceRetag) {
      // Only get articles without tags
      query = query.not('id', 'in', `(
        SELECT DISTINCT article_id 
        FROM article_tag_assignments
      )`)
    }

    const { data: articles, error: articlesError } = await query

    if (articlesError) {
      throw articlesError
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No articles need tagging',
          tagged: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Get all available tags
    const { data: availableTags, error: tagsError } = await supabase
      .from('article_tags')
      .select('*')
      .eq('is_active', true)

    if (tagsError) {
      throw tagsError
    }

    const tagMap = new Map(availableTags?.map(tag => [tag.slug, tag]) || [])
    let taggedCount = 0
    let errors: string[] = []

    // Process each article
    for (const article of articles) {
      try {
        // Clear existing tags if force retagging
        if (forceRetag) {
          await supabase
            .from('article_tag_assignments')
            .delete()
            .eq('article_id', article.id)
        }

        // Analyze article for tags
        const { tagSlugs, relevanceScores } = analyzeArticleForTags(article)

        // Create tag assignments
        const assignments = []
        for (const tagSlug of tagSlugs) {
          const tag = tagMap.get(tagSlug)
          if (tag) {
            assignments.push({
              article_id: article.id,
              tag_id: tag.id,
              relevance_score: relevanceScores[tagSlug] || 50
            })
          }
        }

        if (assignments.length > 0) {
          const { error: assignError } = await supabase
            .from('article_tag_assignments')
            .insert(assignments)

          if (assignError) {
            console.error(`Error assigning tags to article ${article.id}:`, assignError)
            errors.push(`Article ${article.title}: ${assignError.message}`)
          } else {
            taggedCount++
          }
        }

      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError)
        errors.push(`Article ${article.title}: ${articleError instanceof Error ? articleError.message : String(articleError)}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Tagged ${taggedCount} articles out of ${articles.length} processed`,
        tagged: taggedCount,
        processed: articles.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Auto-tag articles error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})