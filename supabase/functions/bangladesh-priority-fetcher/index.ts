/*
  Bangladesh Priority News Fetcher
  
  This edge function specifically fetches and prioritizes Bangladesh-related news.
  It can be called separately or integrated with the main RSS parser.
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BangladeshNewsSource {
  id: string
  name: string
  rss_url: string
  category: string
  priority_score: number
}

const BANGLADESH_KEYWORDS = [
  'bangladesh', 'bengal', 'dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal',
  'awami league', 'bnp', 'sheikh hasina', 'khaleda zia', 'parliament', 'jatiya sangsad',
  'cox\'s bazar', 'sundarbans', 'padma', 'jamuna', 'rohingya', 'bengali', 'bangla',
  'taka', 'garments', 'rmg', 'textile', 'grameen', 'yunus', 'bangladesh bank'
]

function calculateBangladeshRelevance(title: string, description: string = ''): number {
  const content = `${title} ${description}`.toLowerCase()
  let score = 0
  
  for (const keyword of BANGLADESH_KEYWORDS) {
    if (content.includes(keyword.toLowerCase())) {
      // Higher score for title matches
      if (title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 10
      } else {
        score += 5
      }
    }
  }
  
  return score
}

function parseXML(xmlString: string): any[] {
  try {
    const items: any[] = []
    const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
    
    for (const itemXml of itemMatches) {
      const item = {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Bangladesh news sources (Asia region sources)
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('active', true)
      .eq('region', 'asia')

    if (sourcesError) {
      throw sourcesError
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No Bangladesh news sources found',
          totalArticles: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    let totalArticles = 0
    let bangladeshArticles = 0
    let errors: string[] = []

    // Process each Bangladesh source with priority
    for (const source of sources) {
      try {
        console.log(`Fetching Bangladesh news from: ${source.name}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        const response = await fetch(source.rss_url, {
          headers: {
            'User-Agent': 'BangladeshNewsAggregator/1.0',
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
        
        // Process and prioritize Bangladesh-related articles
        for (const item of items) {
          try {
            if (!item.title || !item.link) {
              continue
            }

            // Calculate Bangladesh relevance
            const relevanceScore = calculateBangladeshRelevance(item.title, item.description || '')
            const isBangladeshRelated = relevanceScore > 0

            // Check if article already exists
            const { data: existing } = await supabase
              .from('news_articles')
              .select('id')
              .eq('article_url', item.link)
              .single()

            if (existing) {
              continue
            }

            // Insert new article with Bangladesh priority - explicitly set region to 'bangladesh' for BD-related content
            const articleRegion = isBangladeshRelated ? 'bangladesh' : source.region

            const { error: insertError } = await supabase
              .from('news_articles')
              .insert({
                title: stripHtml(item.title).substring(0, 500),
                description: item.description ? stripHtml(item.description).substring(0, 500) : null,
                full_text: item.content ? stripHtml(item.content) : null,
                published_date: parseDate(item.pubDate),
                article_url: item.link,
                image_url: item.media || null,
                source: source.name,
                category: source.category,
                region: articleRegion, // Use Bangladesh-specific region for BD content
                source_id: source.id
              })

            if (insertError) {
              console.error(`Error inserting article from ${source.name}:`, insertError)
            } else {
              totalArticles++
              if (isBangladeshRelated) {
                bangladeshArticles++
              }
            }
          } catch (articleError) {
            console.error(`Error processing article from ${source.name}:`, articleError)
          }
        }

        // Update last_fetched timestamp
        await supabase
          .from('news_sources')
          .update({ last_fetched: new Date().toISOString() })
          .eq('id', source.id)

      } catch (sourceError) {
        const errorMsg = `Error fetching ${source.name}: ${sourceError instanceof Error ? sourceError.message : String(sourceError)}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${sources.length} Bangladesh sources, added ${totalArticles} new articles (${bangladeshArticles} Bangladesh-related)`,
        totalArticles,
        bangladeshArticles,
        sourcesProcessed: sources.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Bangladesh Priority Fetcher error:', error)
    
    let errorMessage = 'Unknown error occurred'
    
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error)
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})