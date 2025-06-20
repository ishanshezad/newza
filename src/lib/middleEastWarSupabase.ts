import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type MiddleEastWarArticle = {
  id: string
  title: string
  description: string | null
  full_text: string | null
  published_date: string
  article_url: string
  image_url: string | null
  source: string
  category: string
  region: string
  created_at: string
  updated_at: string
}

export type MiddleEastWarTag = {
  id: string
  name: string
  slug: string
  category: string
  description?: string
  color: string
  usage_count: number
  is_active: boolean
}

export type MiddleEastWarTagAssignment = {
  id: string
  article_id: string
  tag_id: string
  relevance_score: number
  assigned_at: string
}

export type MiddleEastWarSource = {
  id: string
  name: string
  url: string
  rss_url: string
  category: string
  region: string
  active: boolean
  last_fetched: string | null
  created_at: string
}