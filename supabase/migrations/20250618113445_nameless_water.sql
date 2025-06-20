/*
  # Add Article Tagging System

  1. New Tables
    - `article_tags` - Master list of available tags with categories
    - `article_tag_assignments` - Many-to-many relationship between articles and tags
    
  2. Tag Categories
    - Industry, Region, Topic Type, Time Sensitivity, Event Type
    
  3. Features
    - Tag hierarchy and relationships
    - Tag popularity tracking
    - Flexible tag assignment system
    
  4. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to manage tags
    - Public read access for tag filtering
*/

-- Create article_tags table for master tag list
CREATE TABLE IF NOT EXISTS article_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text,
  color text DEFAULT '#6B7280',
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create article_tag_assignments for many-to-many relationship
CREATE TABLE IF NOT EXISTS article_tag_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES article_tags(id) ON DELETE CASCADE,
  relevance_score integer DEFAULT 100,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

-- Create tag_relationships for related tags
CREATE TABLE IF NOT EXISTS tag_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_tag_id uuid NOT NULL REFERENCES article_tags(id) ON DELETE CASCADE,
  related_tag_id uuid NOT NULL REFERENCES article_tags(id) ON DELETE CASCADE,
  relationship_type text DEFAULT 'related',
  strength integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_tag_id, related_tag_id)
);

-- Enable RLS
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for article_tags
CREATE POLICY "Public can read article tags"
  ON article_tags
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage article tags"
  ON article_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for article_tag_assignments
CREATE POLICY "Public can read tag assignments"
  ON article_tag_assignments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage tag assignments"
  ON article_tag_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for tag_relationships
CREATE POLICY "Public can read tag relationships"
  ON tag_relationships
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage tag relationships"
  ON tag_relationships
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_tags_category ON article_tags(category);
CREATE INDEX IF NOT EXISTS idx_article_tags_slug ON article_tags(slug);
CREATE INDEX IF NOT EXISTS idx_article_tags_usage_count ON article_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_article_tag_assignments_article_id ON article_tag_assignments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tag_assignments_tag_id ON article_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_tag_assignments_relevance ON article_tag_assignments(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_tag_relationships_parent ON tag_relationships(parent_tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_relationships_related ON tag_relationships(related_tag_id);

-- Create trigger to update usage_count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE article_tags 
    SET usage_count = usage_count + 1, updated_at = now()
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE article_tags 
    SET usage_count = GREATEST(usage_count - 1, 0), updated_at = now()
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_usage_trigger
  AFTER INSERT OR DELETE ON article_tag_assignments
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Insert predefined tags with categories
INSERT INTO article_tags (name, slug, category, description, color) VALUES
-- Industry Tags
('Technology', 'technology', 'industry', 'Technology and innovation news', '#3B82F6'),
('Healthcare', 'healthcare', 'industry', 'Medical and health-related news', '#10B981'),
('Finance', 'finance', 'industry', 'Banking, economics, and financial news', '#F59E0B'),
('Education', 'education', 'industry', 'Educational institutions and policies', '#8B5CF6'),
('Agriculture', 'agriculture', 'industry', 'Farming and agricultural developments', '#84CC16'),
('Manufacturing', 'manufacturing', 'industry', 'Industrial and manufacturing news', '#6B7280'),
('Energy', 'energy', 'industry', 'Power, renewable energy, and utilities', '#EF4444'),
('Transportation', 'transportation', 'industry', 'Transport infrastructure and logistics', '#06B6D4'),
('Telecommunications', 'telecommunications', 'industry', 'Telecom and communication services', '#EC4899'),
('Textiles', 'textiles', 'industry', 'Garments and textile industry', '#F97316'),

-- Region Tags
('Bangladesh', 'bangladesh', 'region', 'News from Bangladesh', '#006A4E'),
('Dhaka', 'dhaka', 'region', 'Capital city news', '#006A4E'),
('Chittagong', 'chittagong', 'region', 'Port city developments', '#006A4E'),
('Sylhet', 'sylhet', 'region', 'Sylhet division news', '#006A4E'),
('Asia', 'asia', 'region', 'Asian regional news', '#DC2626'),
('South Asia', 'south-asia', 'region', 'South Asian developments', '#DC2626'),
('Global', 'global', 'region', 'International news', '#1F2937'),
('Europe', 'europe', 'region', 'European news', '#3B82F6'),
('Middle East', 'middle-east', 'region', 'Middle Eastern developments', '#F59E0B'),
('North America', 'north-america', 'region', 'US and Canada news', '#10B981'),

-- Topic Type Tags
('Breaking News', 'breaking-news', 'topic-type', 'Urgent and breaking developments', '#DC2626'),
('Politics', 'politics', 'topic-type', 'Political developments and governance', '#7C3AED'),
('Economy', 'economy', 'topic-type', 'Economic indicators and market news', '#059669'),
('Sports', 'sports', 'topic-type', 'Sports events and achievements', '#EA580C'),
('Entertainment', 'entertainment', 'topic-type', 'Entertainment and cultural news', '#DB2777'),
('Crime', 'crime', 'topic-type', 'Criminal activities and law enforcement', '#991B1B'),
('Weather', 'weather', 'topic-type', 'Weather updates and natural disasters', '#0284C7'),
('Social Issues', 'social-issues', 'topic-type', 'Social problems and community issues', '#7C2D12'),
('Innovation', 'innovation', 'topic-type', 'New technologies and innovations', '#2563EB'),
('Research', 'research', 'topic-type', 'Scientific research and studies', '#9333EA'),

-- Time Sensitivity Tags
('Urgent', 'urgent', 'time-sensitivity', 'Requires immediate attention', '#DC2626'),
('Developing', 'developing', 'time-sensitivity', 'Ongoing developing story', '#F59E0B'),
('Scheduled', 'scheduled', 'time-sensitivity', 'Planned events and announcements', '#10B981'),
('Historical', 'historical', 'time-sensitivity', 'Historical context and anniversaries', '#6B7280'),
('Trending', 'trending', 'time-sensitivity', 'Currently trending topics', '#EC4899'),

-- Event Type Tags
('Conference', 'conference', 'event-type', 'Conferences and summits', '#8B5CF6'),
('Election', 'election', 'event-type', 'Electoral processes and results', '#DC2626'),
('Protest', 'protest', 'event-type', 'Demonstrations and protests', '#F59E0B'),
('Launch', 'launch', 'event-type', 'Product or service launches', '#10B981'),
('Merger', 'merger', 'event-type', 'Business mergers and acquisitions', '#3B82F6'),
('Disaster', 'disaster', 'event-type', 'Natural or man-made disasters', '#EF4444'),
('Festival', 'festival', 'event-type', 'Cultural festivals and celebrations', '#F97316'),
('Award', 'award', 'event-type', 'Awards and recognitions', '#FBBF24'),
('Investigation', 'investigation', 'event-type', 'Investigative reports', '#6B7280'),
('Policy', 'policy', 'event-type', 'Policy announcements and changes', '#7C3AED')

ON CONFLICT (slug) DO NOTHING;

-- Insert tag relationships
INSERT INTO tag_relationships (parent_tag_id, related_tag_id, relationship_type, strength) 
SELECT 
  t1.id as parent_tag_id,
  t2.id as related_tag_id,
  'related' as relationship_type,
  80 as strength
FROM article_tags t1, article_tags t2
WHERE (
  (t1.slug = 'bangladesh' AND t2.slug IN ('dhaka', 'chittagong', 'sylhet', 'asia', 'south-asia')) OR
  (t1.slug = 'politics' AND t2.slug IN ('election', 'policy', 'breaking-news')) OR
  (t1.slug = 'technology' AND t2.slug IN ('innovation', 'telecommunications', 'research')) OR
  (t1.slug = 'finance' AND t2.slug IN ('economy', 'merger', 'policy')) OR
  (t1.slug = 'breaking-news' AND t2.slug IN ('urgent', 'developing', 'trending'))
) AND t1.id != t2.id
ON CONFLICT (parent_tag_id, related_tag_id) DO NOTHING;