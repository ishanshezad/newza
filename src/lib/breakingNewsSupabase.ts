import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type BreakingNews = {
  id: string
  title: string
  description: string | null
  full_text: string | null
  article_url: string
  image_url: string | null
  source: string
  priority_level: 'critical' | 'high' | 'medium'
  urgency_score: number
  keywords: string[]
  region: string
  category: string
  is_active: boolean
  expires_at: string
  published_date: string
  detected_at: string
  last_updated: string
  created_at: string
}

export type BreakingNewsAlert = {
  id: string
  breaking_news_id: string
  alert_type: 'new' | 'update' | 'escalation'
  alert_message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  sent_at: string
  created_at: string
}

export type BreakingNewsSource = {
  id: string
  name: string
  url: string
  rss_url: string
  api_endpoint?: string
  source_type: 'rss' | 'api' | 'scraper'
  credibility_score: number
  priority_weight: number
  check_interval_minutes: number
  keywords_filter: string[]
  is_active: boolean
  last_checked: string | null
  success_rate: number
  created_at: string
  updated_at: string
}