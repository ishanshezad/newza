/*
  War Development Analyzer Edge Function
  
  This function analyzes Middle East war articles to generate real-time
  development summaries and insights for the Latest Developments section.
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WarDevelopment {
  id: string
  title: string
  description: string
  category: 'ceasefire' | 'humanitarian' | 'diplomatic' | 'military' | 'civilian'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  sources: string[]
  confidence: number
  keywords: string[]
}

// Development detection patterns
const DEVELOPMENT_PATTERNS = {
  ceasefire: {
    keywords: [
      'ceasefire', 'truce', 'peace talks', 'negotiation', 'mediation', 'agreement',
      'diplomatic solution', 'peace process', 'talks resume', 'dialogue', 'armistice'
    ],
    urgencyBoost: 30,
    titleTemplates: ['CEASEFIRE TALKS', 'PEACE NEGOTIATIONS', 'DIPLOMATIC BREAKTHROUGH']
  },
  humanitarian: {
    keywords: [
      'humanitarian aid', 'medical supplies', 'food assistance', 'refugee',
      'displaced', 'evacuation', 'relief convoy', 'red cross', 'un aid',
      'emergency assistance', 'shelter', 'water shortage', 'civilian casualties'
    ],
    urgencyBoost: 20,
    titleTemplates: ['HUMANITARIAN AID', 'RELIEF EFFORTS', 'CIVILIAN ASSISTANCE']
  },
  diplomatic: {
    keywords: [
      'diplomatic', 'ambassador', 'foreign minister', 'summit', 'meeting',
      'international community', 'un security council', 'sanctions',
      'diplomatic pressure', 'international law', 'mediation', 'envoy'
    ],
    urgencyBoost: 15,
    titleTemplates: ['DIPLOMATIC PROGRESS', 'INTERNATIONAL MEDIATION', 'PEACE INITIATIVE']
  },
  military: {
    keywords: [
      'military', 'forces', 'troops', 'deployment', 'operation', 'strike',
      'attack', 'defense', 'offensive', 'strategic', 'tactical', 'combat',
      'airstrike', 'missile', 'bombing', 'rocket'
    ],
    urgencyBoost: 25,
    titleTemplates: ['MILITARY UPDATE', 'OPERATIONAL CHANGE', 'STRATEGIC DEVELOPMENT']
  },
  civilian: {
    keywords: [
      'civilian', 'casualties', 'hospital', 'school', 'infrastructure',
      'power grid', 'water supply', 'residential', 'non-combatant',
      'evacuation', 'shelter', 'humanitarian crisis'
    ],
    urgencyBoost: 35,
    titleTemplates: ['CIVILIAN IMPACT', 'INFRASTRUCTURE UPDATE', 'POPULATION SAFETY']
  }
}

const URGENCY_INDICATORS = {
  critical: ['breaking', 'urgent', 'emergency', 'immediate', 'critical', 'alert', 'major escalation'],
  high: ['important', 'significant', 'major', 'substantial', 'escalating', 'serious'],
  medium: ['developing', 'ongoing', 'continues', 'reports indicate', 'sources say'],
  low: ['minor', 'small', 'limited', 'isolated', 'local']
}

function analyzeArticleContent(article: any): WarDevelopment | null {
  const content = `${article.title} ${article.description || ''}`.toLowerCase()
  
  // Determine category and relevance
  let bestCategory: keyof typeof DEVELOPMENT_PATTERNS = 'military'
  let maxScore = 0
  let matchedKeywords: string[] = []
  
  for (const [category, pattern] of Object.entries(DEVELOPMENT_PATTERNS)) {
    const keywords = pattern.keywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    )
    
    if (keywords.length > maxScore) {
      maxScore = keywords.length
      bestCategory = category as keyof typeof DEVELOPMENT_PATTERNS
      matchedKeywords = keywords
    }
  }
  
  // Skip if no relevant keywords found
  if (maxScore === 0) {
    return null
  }
  
  // Determine urgency
  let urgency: WarDevelopment['urgency'] = 'low'
  let urgencyScore = 0
  
  for (const [level, indicators] of Object.entries(URGENCY_INDICATORS)) {
    const matches = indicators.filter(indicator => content.includes(indicator))
    if (matches.length > 0) {
      urgency = level as WarDevelopment['urgency']
      urgencyScore = matches.length * 10
      break
    }
  }
  
  // Calculate confidence score
  const confidence = Math.min(95, 50 + (maxScore * 15) + urgencyScore + 
    (article.source.toLowerCase().includes('reuters') || 
     article.source.toLowerCase().includes('bbc') || 
     article.source.toLowerCase().includes('associated press') ? 20 : 0))
  
  // Generate development summary
  const summary = generateDevelopmentSummary(article, bestCategory, matchedKeywords)
  const title = selectTitle(bestCategory, urgency, content)
  
  return {
    id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description: summary,
    category: bestCategory,
    urgency,
    timestamp: article.published_date || new Date().toISOString(),
    sources: [article.source],
    confidence,
    keywords: matchedKeywords
  }
}

function generateDevelopmentSummary(article: any, category: string, keywords: string[]): string {
  const title = article.title
  const description = article.description || ''
  
  // Smart summary generation based on category and content
  if (category === 'ceasefire' && keywords.some(k => ['talks', 'negotiation', 'mediation'].includes(k))) {
    if (title.toLowerCase().includes('resume') || description.toLowerCase().includes('resume')) {
      return 'Negotiations have resumed with international mediators present. Both sides report cautious optimism.'
    }
    if (title.toLowerCase().includes('progress') || description.toLowerCase().includes('breakthrough')) {
      return 'Significant progress reported in peace negotiations with potential breakthrough imminent.'
    }
    return 'Diplomatic efforts continue as parties engage in ceasefire discussions.'
  }
  
  if (category === 'humanitarian' && keywords.some(k => ['aid', 'relief', 'assistance'].includes(k))) {
    if (title.toLowerCase().includes('convoy') || description.toLowerCase().includes('convoy')) {
      return 'New convoy reaches affected areas with medical supplies and food assistance.'
    }
    if (keywords.includes('evacuation')) {
      return 'Emergency evacuation operations underway to move civilians from conflict zones.'
    }
    return 'Humanitarian organizations mobilize resources to assist affected populations.'
  }
  
  if (category === 'diplomatic') {
    if (keywords.includes('summit') || keywords.includes('meeting')) {
      return 'Regional leaders express support for ongoing peace initiatives and dialogue.'
    }
    if (keywords.includes('sanctions')) {
      return 'International community considers additional diplomatic measures and sanctions.'
    }
    return 'Diplomatic channels remain active as international pressure mounts for resolution.'
  }
  
  if (category === 'military') {
    if (keywords.some(k => ['reduced', 'decrease', 'pullback'].some(w => description.toLowerCase().includes(w)))) {
      return 'International observers report reduced military activity along disputed borders.'
    }
    if (keywords.includes('deployment')) {
      return 'Military forces adjust positions as strategic situation evolves.'
    }
    return 'Military developments continue to shape the operational landscape.'
  }
  
  if (category === 'civilian') {
    if (keywords.includes('hospital') || keywords.includes('medical')) {
      return 'Medical facilities report increased casualties requiring urgent international assistance.'
    }
    if (keywords.includes('infrastructure')) {
      return 'Critical infrastructure damage affects civilian population access to essential services.'
    }
    return 'Civilian population faces mounting challenges as conflict impacts daily life.'
  }
  
  // Fallback: clean and truncate original description
  const cleanDescription = description.replace(/<[^>]*>/g, '').trim()
  return cleanDescription.length > 120 ? cleanDescription.substring(0, 117) + '...' : cleanDescription
}

function selectTitle(category: string, urgency: string, content: string): string {
  const pattern = DEVELOPMENT_PATTERNS[category as keyof typeof DEVELOPMENT_PATTERNS]
  const templates = pattern.titleTemplates
  
  // Select title based on content context
  if (category === 'ceasefire') {
    if (content.includes('breakthrough') || content.includes('agreement')) {
      return 'PEACE BREAKTHROUGH'
    }
    if (content.includes('resume') || content.includes('continue')) {
      return 'CEASEFIRE TALKS'
    }
  }
  
  if (category === 'humanitarian') {
    if (content.includes('convoy') || content.includes('delivery')) {
      return 'HUMANITARIAN AID'
    }
    if (content.includes('evacuation')) {
      return 'EMERGENCY EVACUATION'
    }
  }
  
  if (category === 'military') {
    if (content.includes('reduced') || content.includes('pullback')) {
      return 'MILITARY PULLBACK'
    }
    if (content.includes('escalation')) {
      return 'MILITARY ESCALATION'
    }
  }
  
  // Default to first template
  return templates[0]
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
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const hoursBack = parseInt(url.searchParams.get('hours') || '24')

    // Get recent Middle East war articles
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
    
    const { data: articles, error: articlesError } = await supabase
      .from('middleeastwararticles')
      .select('*')
      .gte('published_date', cutoffTime)
      .order('published_date', { ascending: false })
      .limit(limit)

    if (articlesError) {
      throw articlesError
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          developments: [],
          message: 'No recent articles found for analysis',
          articlesAnalyzed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Analyze articles for developments
    const developments: WarDevelopment[] = []
    let processedCount = 0

    for (const article of articles) {
      try {
        const development = analyzeArticleContent(article)
        if (development) {
          developments.push(development)
        }
        processedCount++
      } catch (error) {
        console.error(`Error analyzing article ${article.id}:`, error)
      }
    }

    // Sort developments by urgency and confidence
    developments.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      
      if (urgencyDiff !== 0) return urgencyDiff
      return b.confidence - a.confidence
    })

    // Take top developments
    const topDevelopments = developments.slice(0, 8)

    return new Response(
      JSON.stringify({
        success: true,
        developments: topDevelopments,
        articlesAnalyzed: processedCount,
        totalDevelopments: developments.length,
        lastUpdated: new Date().toISOString(),
        timeRange: `${hoursBack} hours`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('War Development Analyzer error:', error)
    
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