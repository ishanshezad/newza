/*
  Middle East War RSS Parser Edge Function
  
  This function fetches and parses RSS feeds specifically for Middle East war coverage,
  then stores articles in the middleeastwararticles table.
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

interface MiddleEastWarSource {
  id: string
  name: string
  rss_url: string
  category: string
  region: string
}

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active Middle East war RSS sources
    const { data: sources, error: sourcesError } = await supabase
      .from('middleeastwarrss')
      .select('*')
      .eq('active', true)

    if (sourcesError) {
      throw sourcesError
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active Middle East war RSS sources found',
          totalArticles: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    let totalArticles = 0
    let errors: string[] = []

    // Process each source
    for (const source of sources as MiddleEastWarSource[]) {
      try {
        console.log(`Fetching Middle East war RSS from: ${source.name}`)
        
        // Fetch RSS feed with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        const response = await fetch(source.rss_url, {
          headers: {
            'User-Agent': 'MiddleEastWarNewsAggregator/1.0',
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
        
        // Process each article
        for (const item of items) {
          try {
            // Validate required fields
            if (!item.title || !item.link) {
              continue
            }

            // Check if article already exists
            const { data: existing } = await supabase
              .from('middleeastwararticles')
              .select('id')
              .eq('article_url', item.link)
              .single()

            if (existing) {
              continue // Skip if already exists
            }

            // Insert new article
            const { error: insertError } = await supabase
              .from('middleeastwararticles')
              .insert({
                title: stripHtml(item.title).substring(0, 500),
                description: item.description ? stripHtml(item.description).substring(0, 500) : null,
                full_text: item.content ? stripHtml(item.content) : null,
                published_date: parseDate(item.pubDate),
                article_url: item.link,
                image_url: item.media || null,
                source: source.name,
                category: source.category,
                region: source.region,
                source_id: source.id
              })

            if (insertError) {
              console.error(`Error inserting article from ${source.name}:`, insertError)
            } else {
              totalArticles++
            }
          } catch (articleError) {
            console.error(`Error processing article from ${source.name}:`, articleError)
          }
        }

        // Update last_fetched timestamp
        await supabase
          .from('middleeastwarrss')
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
        message: `Processed ${sources.length} Middle East war sources, added ${totalArticles} new articles`,
        totalArticles,
        sourcesProcessed: sources.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Middle East War RSS Parser error:', error)
    
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