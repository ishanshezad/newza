/*
  Breaking News Monitor Edge Function
  
  This function automatically monitors multiple sources every 10 minutes
  to detect breaking news about the Israel-Iran war and stores it in the
  breaking_news table with priority scoring.
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RSSItem {
  title: string
  description?: string
  link: string
  pubDate: string
  content?: string
  media?: string
}

interface BreakingNewsSource {
  id: string
  name: string
  rss_url: string
  credibility_score: number
  priority_weight: number
  keywords_filter: string[]
}

// Critical keywords that indicate breaking news
const BREAKING_NEWS_KEYWORDS = [
  'breaking', 'urgent', 'alert', 'emergency', 'immediate',
  'missile strike', 'airstrike', 'bombing', 'attack', 'explosion',
  'casualties', 'killed', 'wounded', 'dead', 'injured',
  'nuclear', 'chemical', 'radiation', 'evacuation', 'shelter',
  'ceasefire', 'peace talks', 'escalation', 'retaliation'
]

// Iran-Israel specific keywords
const CONFLICT_KEYWORDS = [
  'iran', 'israel', 'gaza', 'hamas', 'hezbollah', 'idf', 'irgc',
  'tehran', 'jerusalem', 'tel aviv', 'beirut', 'damascus',
  'middle east', 'persian gulf', 'strait of hormuz'
]

function parseXML(xmlString: string): RSSItem[] {
  try {
    const items: RSSItem[] = []
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
    
    for (const itemXml of itemMatches) {
      const item: RSSItem = {
        title: extractXMLValue(itemXml, 'title') || '',
        description: extractXMLValue(itemXml, 'description') || extractXMLValue(itemXml, 'summary'),
        link: extractXMLValue(itemXml, 'link') || extractXMLValue(itemXml, 'guid') || '',
        pubDate: extractXMLValue(itemXml, 'pubDate') || extractXMLValue(itemXml, 'published') || new Date().toISOString(),
        content: extractXMLValue(itemXml, 'content:encoded') || extractXMLValue(itemXml, 'content'),
      }
      
      // Extract media/image
      const mediaUrl = extractXMLValue(itemXml, 'media:content', 'url') || 
                      extractXMLValue(itemXml, 'media:thumbnail', 'url') ||
                      extractXMLValue(itemXml, 'enclosure', 'url')
      
      if (mediaUrl) {
        item.media = mediaUrl
      }
      
      // Extract image from description if no media found
      if (!item.media && item.description) {
        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/i)
        if (imgMatch) {
          item.media = imgMatch[1]
        }
      }
      
      if (item.title && item.link) {
        items.push(item)
      }
    }
    
    return items
  } catch (error) {
    console.error('XML parsing error:', error)
    return []
  }
}

function extractXMLValue(xml: string, tag: string, attribute?: string): string | undefined {
  if (attribute) {
    const regex = new RegExp(`<${tag}[^>]*${attribute}="([^"]*)"`, 'i')
    const match = xml.match(regex)
    return match ? match[1] : undefined
  }
  
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : undefined
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function parseDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function isBreakingNews(title: string, description: string = '', keywords: string[] = []): boolean {
  const content = `${title} ${description}`.toLowerCase()
  
  // Check for breaking news indicators
  const hasBreakingKeywords = BREAKING_NEWS_KEYWORDS.some(keyword => 
    content.includes(keyword.toLowerCase())
  )
  
  // Check for conflict-related keywords
  const hasConflictKeywords = CONFLICT_KEYWORDS.some(keyword => 
    content.includes(keyword.toLowerCase())
  )
  
  // Check source-specific keywords
  const hasSourceKeywords = keywords.some(keyword => 
    content.includes(keyword.toLowerCase())
  )
  
  // Must have breaking indicators AND conflict relevance
  return hasBreakingKeywords && (hasConflictKeywords || hasSourceKeywords)
}

function calculatePriorityLevel(urgencyScore: number): string {
  if (urgencyScore >= 80) return 'critical'
  if (urgencyScore >= 60) return 'high'
  return 'medium'
}

function extractKeywords(title: string, description: string = ''): string[] {
  const content = `${title} ${description}`.toLowerCase()
  const foundKeywords: string[] = []
  
  // Extract breaking news keywords
  BREAKING_NEWS_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword)
    }
  })
  
  // Extract conflict keywords
  CONFLICT_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword)
    }
  })
  
  return [...new Set(foundKeywords)] // Remove duplicates
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

    console.log('Starting breaking news monitoring...')

    // Get all active breaking news sources
    const { data: sources, error: sourcesError } = await supabase
      .from('breaking_news_sources')
      .select('*')
      .eq('is_active', true)
      .order('priority_weight', { ascending: false })

    if (sourcesError) {
      throw sourcesError
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active breaking news sources found',
          breakingNewsFound: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    let totalBreakingNews = 0
    let totalProcessed = 0
    let errors: string[] = []

    // Process each source
    for (const source of sources as BreakingNewsSource[]) {
      try {
        console.log(`Monitoring breaking news from: ${source.name}`)
        
        // Fetch RSS feed with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
        
        const response = await fetch(source.rss_url, {
          headers: {
            'User-Agent': 'BreakingNewsMonitor/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const xmlContent = await response.text()
        
        if (!xmlContent || xmlContent.trim().length === 0) {
          throw new Error('Empty RSS feed content')
        }
        
        const items = parseXML(xmlContent)
        console.log(`Parsed ${items.length} items from ${source.name}`)
        
        // Process each article for breaking news detection
        for (const item of items) {
          try {
            totalProcessed++
            
            // Validate required fields
            if (!item.title || !item.link) {
              continue
            }

            // Check if this is breaking news
            if (!isBreakingNews(item.title, item.description, source.keywords_filter)) {
              continue
            }

            // Check if breaking news already exists
            const { data: existing } = await supabase
              .from('breaking_news')
              .select('id')
              .eq('article_url', item.link)
              .single()

            if (existing) {
              continue // Skip if already exists
            }

            // Calculate urgency score
            const { data: urgencyResult } = await supabase
              .rpc('calculate_urgency_score', {
                title_text: item.title,
                description_text: item.description || '',
                source_credibility: source.credibility_score
              })

            const urgencyScore = urgencyResult || 50
            const priorityLevel = calculatePriorityLevel(urgencyScore)
            const keywords = extractKeywords(item.title, item.description)

            // Insert breaking news
            const { error: insertError } = await supabase
              .from('breaking_news')
              .insert({
                title: stripHtml(item.title).substring(0, 500),
                description: item.description ? stripHtml(item.description).substring(0, 1000) : null,
                full_text: item.content ? stripHtml(item.content) : null,
                article_url: item.link,
                image_url: item.media || null,
                source: source.name,
                priority_level: priorityLevel,
                urgency_score: urgencyScore,
                keywords: keywords,
                published_date: parseDate(item.pubDate),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
              })

            if (insertError) {
              console.error(`Error inserting breaking news from ${source.name}:`, insertError)
              errors.push(`${source.name}: ${insertError.message}`)
            } else {
              totalBreakingNews++
              console.log(`🚨 BREAKING NEWS DETECTED: ${item.title} (Priority: ${priorityLevel}, Score: ${urgencyScore})`)
              
              // Create alert record
              await supabase
                .from('breaking_news_alerts')
                .insert({
                  breaking_news_id: (await supabase
                    .from('breaking_news')
                    .select('id')
                    .eq('article_url', item.link)
                    .single()).data?.id,
                  alert_type: 'new',
                  alert_message: `Breaking: ${stripHtml(item.title)}`,
                  severity: priorityLevel === 'critical' ? 'critical' : priorityLevel === 'high' ? 'high' : 'medium'
                })
            }
          } catch (articleError) {
            console.error(`Error processing article from ${source.name}:`, articleError)
          }
        }

        // Update last_checked timestamp and success rate
        const successRate = errors.length === 0 ? 1.0 : Math.max(0, 1.0 - (errors.length / totalProcessed))
        await supabase
          .from('breaking_news_sources')
          .update({ 
            last_checked: new Date().toISOString(),
            success_rate: successRate
          })
          .eq('id', source.id)

      } catch (sourceError) {
        const errorMsg = `Error monitoring ${source.name}: ${sourceError instanceof Error ? sourceError.message : String(sourceError)}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    // Clean up expired breaking news
    await supabase.rpc('expire_old_breaking_news')

    return new Response(
      JSON.stringify({
        success: true,
        message: `Monitored ${sources.length} sources, found ${totalBreakingNews} breaking news items out of ${totalProcessed} articles processed`,
        breakingNewsFound: totalBreakingNews,
        sourcesMonitored: sources.length,
        totalProcessed,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Breaking News Monitor error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})