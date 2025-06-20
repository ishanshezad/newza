/*
  # Add New RSS Sources

  1. Bangladesh News Sources
    - Additional Bangladeshi news sources from the provided list
    
  2. Middle East Coverage Sources
    - Jerusalem Post feeds for Israel/Iran war coverage
    - Tasnim News for Iranian perspective
    
  3. Notes
    - All sources set to active by default
    - Categories assigned based on source focus
    - Region set appropriately for each source
*/

-- Insert additional Bangladesh news sources
INSERT INTO news_sources (name, url, rss_url, category, region, active) VALUES
  ('Amar Bangla BD', 'https://www.amarbanglabd.com', 'https://www.amarbanglabd.com/rss', 'general', 'asia', true),
  ('TBS News', 'https://www.tbsnews.net', 'https://www.tbsnews.net/tbs-rss', 'general', 'asia', true),
  ('News BD', 'https://news.bd.com', 'https://news.bd.com/index.php?rsspage=20295&s=20324', 'general', 'asia', true),
  ('Bangla News 24', 'https://www.banglanews24.com', 'https://www.banglanews24.com/rss/rss.xml', 'general', 'asia', true),
  ('Jugantor RSS', 'https://www.jugantor.com', 'https://www.jugantor.com/feed/rss.xml', 'general', 'asia', true),
  ('The Daily Star Frontpage', 'https://www.thedailystar.net', 'https://www.thedailystar.net/frontpage/rss.xml', 'general', 'asia', true),
  ('Daily Star Feed Index', 'https://newsindex.fahadahammed.com', 'https://newsindex.fahadahammed.com/feed/get_feed_data/thedailystar/feed.xml', 'general', 'asia', true),

-- Insert Middle East / Israel-Iran War coverage sources
  ('Jerusalem Post - Arab Israeli Conflict', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsarabisraeliconflict.aspx', 'politics', 'middle-east', true),
  ('Jerusalem Post - Gaza News', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsgaza.aspx', 'politics', 'middle-east', true),
  ('Jerusalem Post - Israel News', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsisraelnews.aspx', 'politics', 'middle-east', true),
  ('Jerusalem Post - Iran News', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsiran.aspx', 'politics', 'middle-east', true),
  ('Tasnim News', 'https://www.tasnimnews.com', 'https://www.tasnimnews.com/en/rss', 'politics', 'middle-east', true)

ON CONFLICT (rss_url) DO NOTHING;