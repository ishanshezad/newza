/*
  # News Aggregator Database Schema

  1. New Tables
    - `news_sources`
      - `id` (uuid, primary key)
      - `name` (text, source name like "BBC News")
      - `url` (text, main website URL)
      - `rss_url` (text, RSS feed URL)
      - `category` (text, default category)
      - `region` (text, geographical region)
      - `active` (boolean, whether to fetch from this source)
      - `last_fetched` (timestamptz, when last fetched)
      - `created_at` (timestamptz)

    - `news_articles`
      - `id` (uuid, primary key)
      - `title` (text, article title)
      - `description` (text, article description/summary)
      - `full_text` (text, full article content if available)
      - `published_date` (timestamptz, when article was published)
      - `article_url` (text, original article URL)
      - `image_url` (text, featured image URL)
      - `source` (text, source name)
      - `category` (text, article category)
      - `region` (text, geographical region)
      - `source_id` (uuid, foreign key to news_sources)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (since this is a news app)
    - Add policies for authenticated users to manage sources

  3. Indexes
    - Add indexes for efficient querying by date, category, source
    - Add full-text search capabilities
*/

CREATE TABLE IF NOT EXISTS news_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  rss_url text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'general',
  region text NOT NULL DEFAULT 'global',
  active boolean NOT NULL DEFAULT true,
  last_fetched timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  full_text text,
  published_date timestamptz NOT NULL,
  article_url text NOT NULL UNIQUE,
  image_url text,
  source text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  region text NOT NULL DEFAULT 'global',
  source_id uuid REFERENCES news_sources(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Public can read news sources"
  ON news_sources
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read news articles"
  ON news_articles
  FOR SELECT
  TO public
  USING (true);

-- Policies for authenticated users to manage sources
CREATE POLICY "Authenticated users can manage news sources"
  ON news_sources
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage news articles"
  ON news_articles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published_date ON news_articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_region ON news_articles(region);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_news_articles_search 
ON news_articles USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_sources_updated_at 
    BEFORE UPDATE ON news_sources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();