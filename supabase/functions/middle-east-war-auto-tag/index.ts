/*
  Middle East War Auto-Tag Articles Edge Function
  
  This function automatically analyzes and tags Middle East war articles 
  using the predefined Middle East war tags.
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Middle East War specific keywords mapped to tag slugs
const MIDDLE_EAST_WAR_PATTERNS = {
  'iran-israel-airstrike': ['iran', 'israel', 'airstrike', 'air strike', 'bombing', 'attack'],
  'missile-barrage': ['missile', 'barrage', 'rocket', 'projectile', 'ballistic'],
  'sejjil-missile': ['sejjil', 'sejil'],
  'ballistic-drone-attacks': ['drone', 'uav', 'unmanned', 'ballistic'],
  'civilian-casualties': ['civilian', 'casualties', 'deaths', 'killed', 'wounded', 'injured'],
  'hospital-damage': ['hospital', 'medical', 'clinic', 'healthcare', 'damage'],
  'idf': ['idf', 'israel defense forces', 'israeli military', 'israeli army'],
  'irgc': ['irgc', 'revolutionary guard', 'iranian guard', 'quds force'],
  'hezbollah-involvement-warning': ['hezbollah', 'hizbollah', 'lebanon', 'lebanese'],
  'iron-dome': ['iron dome', 'missile defense', 'air defense', 'interception'],
  'gaza-humanitarian-crisis': ['gaza', 'humanitarian', 'crisis', 'aid', 'relief'],
  'palestinian-casualties': ['palestinian', 'gaza', 'west bank', 'palestine'],
  'nuclear-contamination': ['nuclear', 'radiation', 'contamination', 'radioactive'],
  'un-emergency-sessions': ['un', 'united nations', 'security council', 'emergency'],
  'regional-spillover': ['regional', 'spillover', 'escalation', 'expansion'],
  'energy-market-impact': ['oil', 'energy', 'market', 'price', 'petroleum'],
  'cyber-sabotage': ['cyber', 'hacking', 'digital', 'internet', 'network'],
  'refugee-displacement': ['refugee', 'displaced', 'evacuation', 'flee'],
  'airspace-closure': ['airspace', 'flight', 'aviation', 'airport', 'closure'],
  'precision-strikes': ['precision', 'targeted', 'surgical', 'strike'],
  'f35-participation': ['f-35', 'f35', 'fighter jet', 'aircraft'],
  'operation-rising-lion': ['operation rising lion', 'rising lion'],
  'operation-true-promise-ii': ['operation true promise', 'true promise'],
  'operation-days-of-repentance': ['days of repentance', 'operation days'],
  'yemen-houthi-attack': ['yemen', 'houthi', 'ansarullah', 'yemeni'],
  'strait-of-hormuz-stakes': ['strait of hormuz', 'hormuz', 'persian gulf'],
  'sanctions-enforcement': ['sanctions', 'embargo', 'economic pressure'],
  'expert-analysis': ['expert', 'analysis', 'analyst', 'commentary'],
  'breaking-news': ['breaking', 'urgent', 'alert', 'developing']
}

function analyzeMiddleEastWarArticle(article: any): { tagSlugs: string[], relevanceScores: Record<string, number> } {
  const content = `${article.title} ${article.description || ''}`.toLowerCase()
  const tagSlugs: string[] = []
  const relevanceScores: Record<string, number> = {}

  // Analyze content against Middle East war patterns
  for (const [tagSlug, patterns] of Object.entries(MIDDLE_EAST_WAR_PATTERNS)) {
    let score = 0
    let matches = 0

    for (const pattern of patterns) {
      if (content.includes(pattern.toLowerCase())) {
        matches++
        // Higher score for title matches
        if (article.title.toLowerCase().includes(pattern.toLowerCase())) {
          score += 25
        } else {
          score += 15
        }
      }
    }

    if (matches > 0) {
      // Bonus for multiple pattern matches
      score += Math.min(matches * 10, 50)
      
      if (score >= 20) { // Minimum threshold
        tagSlugs.push(tagSlug)
        relevanceScores[tagSlug] = Math.min(score, 100)
      }
    }
  }

  // Always add the general middle-east-war category
  if (!tagSlugs.includes('middle-east-war')) {
    tagSlugs.push('middle-east-war')
    relevanceScores['middle-east-war'] = 95
  }

  // Limit to maximum 8 tags, prioritize by relevance
  const sortedTags = tagSlugs
    .sort((a, b) => (relevanceScores[b] || 0) - (relevanceScores[a] || 0))
    .slice(0, 8)

  const finalScores: Record<string, number> = {}
  sortedTags.forEach(tag => {
    finalScores[tag] = relevanceScores[tag] || 50
  })

  return {
    tagSlugs: sortedTags,
    relevanceScores: finalScores
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
      .from('middleeastwararticles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!forceRetag) {
      // Only get articles without tags
      query = query.not('id', 'in', `(
        SELECT DISTINCT article_id 
        FROM middleeastwar_tag_assignments
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
          message: 'No Middle East war articles need tagging',
          tagged: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Get all available Middle East war tags
    const { data: availableTags, error: tagsError } = await supabase
      .from('middleeastwartagtable')
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
            .from('middleeastwar_tag_assignments')
            .delete()
            .eq('article_id', article.id)
        }

        // Analyze article for tags
        const { tagSlugs, relevanceScores } = analyzeMiddleEastWarArticle(article)

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
            .from('middleeastwar_tag_assignments')
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
        message: `Tagged ${taggedCount} Middle East war articles out of ${articles.length} processed`,
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
    console.error('Middle East War auto-tag error:', error)
    
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