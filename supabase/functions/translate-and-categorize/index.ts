/*
  Translation and Content Categorization Edge Function
  
  This function:
  1. Detects language of articles
  2. Translates Bangla content to English
  3. Analyzes content for categorization
  4. Assigns tags and categories automatically
  5. Updates articles with translated content and metadata
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Content analysis patterns for categorization
const CONTENT_PATTERNS = {
  // Primary Topics
  technology: [
    'ai', 'artificial intelligence', 'machine learning', 'blockchain', 'cryptocurrency',
    'software', 'app', 'digital', 'cyber', 'tech', 'innovation', 'startup',
    'internet', 'online', 'mobile', 'computer', 'data', 'algorithm', 'robot',
    'automation', 'cloud', 'programming', 'coding', 'development'
  ],
  business: [
    'business', 'company', 'corporate', 'industry', 'market', 'economy', 'economic',
    'financial', 'finance', 'bank', 'banking', 'investment', 'stock', 'trade',
    'commerce', 'entrepreneur', 'startup', 'profit', 'revenue', 'sales',
    'merger', 'acquisition', 'ipo', 'earnings', 'growth'
  ],
  politics: [
    'government', 'minister', 'parliament', 'election', 'vote', 'political',
    'policy', 'law', 'legislation', 'prime minister', 'president', 'party',
    'democracy', 'governance', 'administration', 'cabinet', 'opposition',
    'coalition', 'referendum', 'campaign', 'diplomat', 'foreign policy'
  ],
  culture: [
    'culture', 'cultural', 'art', 'artist', 'music', 'film', 'movie', 'book',
    'literature', 'festival', 'celebration', 'tradition', 'heritage',
    'language', 'religion', 'community', 'society', 'lifestyle',
    'entertainment', 'celebrity', 'fashion', 'food', 'cuisine'
  ],
  sports: [
    'cricket', 'football', 'soccer', 'match', 'tournament', 'championship',
    'olympics', 'sports', 'player', 'team', 'game', 'victory', 'defeat',
    'league', 'club', 'athlete', 'coach', 'stadium', 'score', 'goal'
  ],
  health: [
    'health', 'medical', 'hospital', 'doctor', 'patient', 'medicine', 'treatment',
    'vaccine', 'disease', 'covid', 'pandemic', 'healthcare', 'clinic', 'surgery',
    'therapy', 'diagnosis', 'prevention', 'wellness', 'fitness', 'nutrition'
  ],
  education: [
    'education', 'school', 'university', 'student', 'teacher', 'academic',
    'exam', 'graduation', 'scholarship', 'learning', 'curriculum', 'research',
    'study', 'college', 'degree', 'course', 'training', 'knowledge'
  ],
  environment: [
    'environment', 'climate', 'weather', 'pollution', 'green', 'renewable',
    'sustainability', 'conservation', 'nature', 'forest', 'wildlife',
    'carbon', 'emission', 'global warming', 'recycling', 'energy'
  ]
}

const CONTENT_TYPES = {
  news: ['breaking', 'reported', 'announced', 'confirmed', 'according to', 'sources say'],
  opinion: ['opinion', 'editorial', 'commentary', 'analysis', 'perspective', 'view', 'believe'],
  feature: ['profile', 'interview', 'investigation', 'in-depth', 'special report', 'feature'],
  tutorial: ['how to', 'guide', 'tutorial', 'step by step', 'instructions', 'tips'],
  review: ['review', 'rating', 'evaluation', 'assessment', 'critique', 'analysis']
}

const AUDIENCE_INDICATORS = {
  general: ['public', 'everyone', 'citizens', 'people', 'community', 'society'],
  professional: ['industry', 'experts', 'professionals', 'specialists', 'executives'],
  students: ['students', 'learners', 'academic', 'educational', 'university', 'college'],
  technical: ['developers', 'engineers', 'technical', 'advanced', 'implementation']
}

// Simple language detection for Bangla
function detectLanguage(text: string): 'bangla' | 'english' {
  // Check for Bangla Unicode characters
  const banglaPattern = /[\u0980-\u09FF]/
  return banglaPattern.test(text) ? 'bangla' : 'english'
}

// Mock translation function (in production, use Google Translate API or similar)
async function translateBanglaToEnglish(text: string): Promise<string> {
  // This is a placeholder - in production you would use:
  // - Google Translate API
  // - Azure Translator
  // - AWS Translate
  // - Or other translation services
  
  // For now, return the original text with a note
  return `[TRANSLATED] ${text}`
}

function analyzeContent(title: string, description: string = '', content: string = ''): {
  primaryCategory: string
  secondaryCategories: string[]
  contentType: string
  audienceLevel: string
  themes: string[]
  tags: string[]
} {
  const fullText = `${title} ${description} ${content}`.toLowerCase()
  
  // Analyze primary category
  let primaryCategory = 'general'
  let maxScore = 0
  
  for (const [category, patterns] of Object.entries(CONTENT_PATTERNS)) {
    const score = patterns.filter(pattern => fullText.includes(pattern)).length
    if (score > maxScore) {
      maxScore = score
      primaryCategory = category
    }
  }
  
  // Find secondary categories
  const categoryScores: { [key: string]: number } = {}
  for (const [category, patterns] of Object.entries(CONTENT_PATTERNS)) {
    categoryScores[category] = patterns.filter(pattern => fullText.includes(pattern)).length
  }
  
  const secondaryCategories = Object.entries(categoryScores)
    .filter(([cat, score]) => cat !== primaryCategory && score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([cat]) => cat)
  
  // Determine content type
  let contentType = 'news'
  for (const [type, indicators] of Object.entries(CONTENT_TYPES)) {
    if (indicators.some(indicator => fullText.includes(indicator))) {
      contentType = type
      break
    }
  }
  
  // Determine audience level
  let audienceLevel = 'general'
  for (const [audience, indicators] of Object.entries(AUDIENCE_INDICATORS)) {
    if (indicators.some(indicator => fullText.includes(indicator))) {
      audienceLevel = audience
      break
    }
  }
  
  // Extract themes (top keywords)
  const words = fullText.split(/\s+/).filter(word => word.length > 3)
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  const themes = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word)
  
  // Generate tags
  const tags = [
    primaryCategory,
    contentType,
    audienceLevel,
    ...secondaryCategories,
    ...themes.slice(0, 2)
  ].filter((tag, index, arr) => arr.indexOf(tag) === index).slice(0, 7)
  
  return {
    primaryCategory,
    secondaryCategories,
    contentType,
    audienceLevel,
    themes,
    tags
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
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const forceRetranslate = url.searchParams.get('force') === 'true'

    // Get articles that need translation/categorization
    let query = supabase
      .from('news_articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!forceRetranslate) {
      // Only get articles without translation metadata
      query = query.is('translated_content', null)
    }

    const { data: articles, error: articlesError } = await query

    if (articlesError) {
      throw articlesError
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No articles need translation/categorization',
          processed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    let processedCount = 0
    let translatedCount = 0
    let errors: string[] = []

    // Process each article
    for (const article of articles) {
      try {
        let translatedTitle = article.title
        let translatedDescription = article.description
        let translatedContent = article.full_text
        let wasTranslated = false

        // Check if translation is needed
        const titleLanguage = detectLanguage(article.title)
        const descLanguage = article.description ? detectLanguage(article.description) : 'english'

        if (titleLanguage === 'bangla') {
          translatedTitle = await translateBanglaToEnglish(article.title)
          wasTranslated = true
        }

        if (article.description && descLanguage === 'bangla') {
          translatedDescription = await translateBanglaToEnglish(article.description)
          wasTranslated = true
        }

        if (article.full_text && detectLanguage(article.full_text) === 'bangla') {
          translatedContent = await translateBanglaToEnglish(article.full_text)
          wasTranslated = true
        }

        // Analyze content for categorization
        const analysis = analyzeContent(
          translatedTitle,
          translatedDescription || '',
          translatedContent || ''
        )

        // Update article with translation and categorization
        const updateData: any = {
          primary_category: analysis.primaryCategory,
          secondary_categories: analysis.secondaryCategories,
          content_type: analysis.contentType,
          audience_level: analysis.audienceLevel,
          main_themes: analysis.themes,
          auto_tags: analysis.tags,
          analysis_completed_at: new Date().toISOString()
        }

        if (wasTranslated) {
          updateData.translated_title = translatedTitle
          updateData.translated_description = translatedDescription
          updateData.translated_content = translatedContent
          updateData.original_language = titleLanguage
          updateData.translation_completed_at = new Date().toISOString()
          translatedCount++
        }

        const { error: updateError } = await supabase
          .from('news_articles')
          .update(updateData)
          .eq('id', article.id)

        if (updateError) {
          console.error(`Error updating article ${article.id}:`, updateError)
          errors.push(`Article ${article.title}: ${updateError.message}`)
        } else {
          processedCount++
        }

      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError)
        errors.push(`Article ${article.title}: ${articleError instanceof Error ? articleError.message : String(articleError)}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} articles, translated ${translatedCount}`,
        processed: processedCount,
        translated: translatedCount,
        totalArticles: articles.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Translation and categorization error:', error)
    
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