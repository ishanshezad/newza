/*
  # Create Middle East War News Tables

  1. New Tables
    - `middleeastwarrss` - RSS sources for Middle East war coverage
    - `middleeastwararticles` - Articles from Middle East war RSS feeds
    - `middleeastwartagtable` - Tags specific to Middle East war coverage
    - `middleeastwar_tag_assignments` - Many-to-many relationship between articles and tags

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to manage content

  3. Indexes
    - Add indexes for efficient querying by date, tags, source
*/

-- Create Middle East War RSS sources table
CREATE TABLE IF NOT EXISTS middleeastwarrss (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  rss_url text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'middle-east-war',
  region text NOT NULL DEFAULT 'middle-east',
  active boolean NOT NULL DEFAULT true,
  last_fetched timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Middle East War articles table
CREATE TABLE IF NOT EXISTS middleeastwararticles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  full_text text,
  published_date timestamptz NOT NULL,
  article_url text NOT NULL UNIQUE,
  image_url text,
  source text NOT NULL,
  category text NOT NULL DEFAULT 'middle-east-war',
  region text NOT NULL DEFAULT 'middle-east',
  source_id uuid REFERENCES middleeastwarrss(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Middle East War tags table
CREATE TABLE IF NOT EXISTS middleeastwartagtable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'middle-east-war',
  description text,
  color text DEFAULT '#DC2626',
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Middle East War tag assignments table
CREATE TABLE IF NOT EXISTS middleeastwar_tag_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES middleeastwararticles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES middleeastwartagtable(id) ON DELETE CASCADE,
  relevance_score integer DEFAULT 100,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

-- Enable RLS
ALTER TABLE middleeastwarrss ENABLE ROW LEVEL SECURITY;
ALTER TABLE middleeastwararticles ENABLE ROW LEVEL SECURITY;
ALTER TABLE middleeastwartagtable ENABLE ROW LEVEL SECURITY;
ALTER TABLE middleeastwar_tag_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for middleeastwarrss
CREATE POLICY "Public can read Middle East war RSS sources"
  ON middleeastwarrss
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage Middle East war RSS sources"
  ON middleeastwarrss
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for middleeastwararticles
CREATE POLICY "Public can read Middle East war articles"
  ON middleeastwararticles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage Middle East war articles"
  ON middleeastwararticles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for middleeastwartagtable
CREATE POLICY "Public can read Middle East war tags"
  ON middleeastwartagtable
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage Middle East war tags"
  ON middleeastwartagtable
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for middleeastwar_tag_assignments
CREATE POLICY "Public can read Middle East war tag assignments"
  ON middleeastwar_tag_assignments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage Middle East war tag assignments"
  ON middleeastwar_tag_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_middleeastwararticles_published_date ON middleeastwararticles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_middleeastwararticles_source ON middleeastwararticles(source);
CREATE INDEX IF NOT EXISTS idx_middleeastwararticles_created_at ON middleeastwararticles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_middleeastwartagtable_slug ON middleeastwartagtable(slug);
CREATE INDEX IF NOT EXISTS idx_middleeastwartagtable_usage_count ON middleeastwartagtable(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_middleeastwar_tag_assignments_article_id ON middleeastwar_tag_assignments(article_id);
CREATE INDEX IF NOT EXISTS idx_middleeastwar_tag_assignments_tag_id ON middleeastwar_tag_assignments(tag_id);

-- Full-text search index for Middle East war articles
CREATE INDEX IF NOT EXISTS idx_middleeastwararticles_search 
ON middleeastwararticles USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Update triggers
CREATE TRIGGER update_middleeastwarrss_updated_at 
    BEFORE UPDATE ON middleeastwarrss 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_middleeastwararticles_updated_at 
    BEFORE UPDATE ON middleeastwararticles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update tag usage count
CREATE OR REPLACE FUNCTION update_middleeastwar_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE middleeastwartagtable 
    SET usage_count = usage_count + 1, updated_at = now()
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE middleeastwartagtable 
    SET usage_count = GREATEST(usage_count - 1, 0), updated_at = now()
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_middleeastwar_tag_usage_trigger
  AFTER INSERT OR DELETE ON middleeastwar_tag_assignments
  FOR EACH ROW EXECUTE FUNCTION update_middleeastwar_tag_usage_count();