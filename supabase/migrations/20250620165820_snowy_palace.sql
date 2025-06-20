/*
  # Breaking News System for Israel-Iran War

  1. New Tables
    - `breaking_news` - Stores breaking news articles with priority and urgency
    - `breaking_news_sources` - Specialized sources for breaking news monitoring
    
  2. Features
    - Priority levels (critical, high, medium)
    - Urgency indicators
    - Auto-expiration of breaking news
    - Source credibility tracking
    
  3. Security
    - Enable RLS on all tables
    - Public read access for breaking news
    - Authenticated user management
*/

-- Create breaking news table
CREATE TABLE IF NOT EXISTS breaking_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  full_text text,
  article_url text NOT NULL UNIQUE,
  image_url text,
  source text NOT NULL,
  priority_level text NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('critical', 'high', 'medium')),
  urgency_score integer DEFAULT 50 CHECK (urgency_score >= 0 AND urgency_score <= 100),
  keywords text[] DEFAULT '{}',
  region text NOT NULL DEFAULT 'middle-east',
  category text NOT NULL DEFAULT 'breaking-news',
  is_active boolean DEFAULT true,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  published_date timestamptz NOT NULL,
  detected_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create breaking news sources table for specialized monitoring
CREATE TABLE IF NOT EXISTS breaking_news_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  rss_url text NOT NULL UNIQUE,
  api_endpoint text,
  source_type text NOT NULL DEFAULT 'rss' CHECK (source_type IN ('rss', 'api', 'scraper')),
  credibility_score integer DEFAULT 80 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  priority_weight decimal DEFAULT 1.0,
  check_interval_minutes integer DEFAULT 10,
  keywords_filter text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_checked timestamptz,
  success_rate decimal DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create breaking news alerts table for tracking alert history
CREATE TABLE IF NOT EXISTS breaking_news_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breaking_news_id uuid NOT NULL REFERENCES breaking_news(id) ON DELETE CASCADE,
  alert_type text NOT NULL DEFAULT 'new' CHECK (alert_type IN ('new', 'update', 'escalation')),
  alert_message text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breaking_news
CREATE POLICY "Public can read active breaking news"
  ON breaking_news
  FOR SELECT
  TO public
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Authenticated users can manage breaking news"
  ON breaking_news
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for breaking_news_sources
CREATE POLICY "Public can read breaking news sources"
  ON breaking_news_sources
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage breaking news sources"
  ON breaking_news_sources
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for breaking_news_alerts
CREATE POLICY "Public can read breaking news alerts"
  ON breaking_news_alerts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage breaking news alerts"
  ON breaking_news_alerts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_breaking_news_priority ON breaking_news(priority_level, urgency_score DESC);
CREATE INDEX IF NOT EXISTS idx_breaking_news_active ON breaking_news(is_active, expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_breaking_news_detected_at ON breaking_news(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_breaking_news_keywords ON breaking_news USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_breaking_news_sources_active ON breaking_news_sources(is_active, check_interval_minutes) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_breaking_news_alerts_severity ON breaking_news_alerts(severity, sent_at DESC);

-- Full-text search index for breaking news
CREATE INDEX IF NOT EXISTS idx_breaking_news_search 
ON breaking_news USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Update triggers
CREATE TRIGGER update_breaking_news_updated_at 
    BEFORE UPDATE ON breaking_news 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breaking_news_sources_updated_at 
    BEFORE UPDATE ON breaking_news_sources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-expire old breaking news
CREATE OR REPLACE FUNCTION expire_old_breaking_news()
RETURNS void AS $$
BEGIN
  UPDATE breaking_news 
  SET is_active = false, last_updated = now()
  WHERE is_active = true AND expires_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate urgency score based on keywords and timing
CREATE OR REPLACE FUNCTION calculate_urgency_score(
  title_text text,
  description_text text DEFAULT '',
  source_credibility integer DEFAULT 80
) RETURNS integer AS $$
DECLARE
  urgency_score integer := 50;
  content_text text;
  critical_keywords text[] := ARRAY[
    'breaking', 'urgent', 'alert', 'emergency', 'immediate',
    'missile strike', 'airstrike', 'bombing', 'attack', 'explosion',
    'casualties', 'killed', 'wounded', 'dead', 'injured',
    'nuclear', 'chemical', 'biological', 'radiation',
    'evacuation', 'shelter', 'lockdown', 'curfew',
    'ceasefire', 'peace talks', 'negotiation', 'agreement',
    'escalation', 'retaliation', 'response', 'counter-attack'
  ];
  high_keywords text[] := ARRAY[
    'military', 'forces', 'troops', 'soldiers', 'defense',
    'government', 'official', 'statement', 'announcement',
    'international', 'diplomatic', 'sanctions', 'embargo',
    'humanitarian', 'aid', 'refugee', 'displaced',
    'hospital', 'school', 'civilian', 'infrastructure'
  ];
  keyword text;
BEGIN
  content_text := lower(title_text || ' ' || COALESCE(description_text, ''));
  
  -- Check for critical keywords (high urgency boost)
  FOREACH keyword IN ARRAY critical_keywords LOOP
    IF content_text LIKE '%' || keyword || '%' THEN
      urgency_score := urgency_score + 15;
    END IF;
  END LOOP;
  
  -- Check for high priority keywords (medium urgency boost)
  FOREACH keyword IN ARRAY high_keywords LOOP
    IF content_text LIKE '%' || keyword || '%' THEN
      urgency_score := urgency_score + 8;
    END IF;
  END LOOP;
  
  -- Source credibility factor
  urgency_score := urgency_score + ((source_credibility - 50) / 10);
  
  -- Title emphasis (breaking news often in titles)
  IF lower(title_text) LIKE '%breaking%' OR lower(title_text) LIKE '%urgent%' THEN
    urgency_score := urgency_score + 20;
  END IF;
  
  -- Ensure score is within bounds
  urgency_score := GREATEST(0, LEAST(100, urgency_score));
  
  RETURN urgency_score;
END;
$$ LANGUAGE plpgsql;