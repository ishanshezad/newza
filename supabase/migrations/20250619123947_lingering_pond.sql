/*
  # Add Translation and Categorization Columns

  1. New Columns for news_articles table
    - Translation fields for Bangla content
    - Content categorization metadata
    - Analysis timestamps
    
  2. Indexes for efficient querying
    - Category-based indexes
    - Language and translation status indexes
*/

-- Add translation columns
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS translated_title text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS translated_description text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS translated_content text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS original_language text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS translation_completed_at timestamptz;

-- Add categorization columns
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS primary_category text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS secondary_categories text[];
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS content_type text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS audience_level text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS main_themes text[];
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS auto_tags text[];
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS analysis_completed_at timestamptz;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_news_articles_primary_category ON news_articles(primary_category);
CREATE INDEX IF NOT EXISTS idx_news_articles_content_type ON news_articles(content_type);
CREATE INDEX IF NOT EXISTS idx_news_articles_audience_level ON news_articles(audience_level);
CREATE INDEX IF NOT EXISTS idx_news_articles_original_language ON news_articles(original_language);
CREATE INDEX IF NOT EXISTS idx_news_articles_translation_status ON news_articles(translation_completed_at) WHERE translation_completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_articles_analysis_status ON news_articles(analysis_completed_at) WHERE analysis_completed_at IS NOT NULL;

-- GIN indexes for array columns
CREATE INDEX IF NOT EXISTS idx_news_articles_secondary_categories ON news_articles USING gin(secondary_categories);
CREATE INDEX IF NOT EXISTS idx_news_articles_main_themes ON news_articles USING gin(main_themes);
CREATE INDEX IF NOT EXISTS idx_news_articles_auto_tags ON news_articles USING gin(auto_tags);