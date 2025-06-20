/*
  # Add Bangladesh News Sources

  1. New Sources
    - Bangla Tribune (https://banglatribune.com/feed)
    - BD24Live (https://bd24live.com/bangla/feed)
    - Risingbd (https://risingbd.com/rss/rss.xml)
    - Bangladesh Diplomat (https://bangladeshdiplomat.com/feed)
    - The Dhaka Post (https://thedhakapost.com/rss.xml)
    - Energy Bangla (https://energybangla.com/feed)
    - Daily Jagaran (https://dailyjagaran.com/rss/rss.xml)
    - Jagonews24.com (https://www.jagonews24.com/rss/rss.xml)
    - Daily Bangladesh (https://www.daily-bangladesh.com/rss/rss.xml)
    - BLiTZ (http://blitz.tobomi.com/feed/)

  2. Notes
    - All sources set to active by default
    - Categories assigned based on source focus
    - Region set to 'asia' for all Bangladesh sources
    - Bangladesh Journal excluded due to incomplete RSS URL
    - MyBangla24 and eShomoy excluded (no RSS feeds found)
*/

-- Insert Bangladesh news sources
INSERT INTO news_sources (name, url, rss_url, category, region, active) VALUES
  ('Bangla Tribune', 'https://banglatribune.com', 'https://banglatribune.com/feed', 'general', 'asia', true),
  ('BD24Live', 'https://bd24live.com', 'https://bd24live.com/bangla/feed', 'general', 'asia', true),
  ('Risingbd', 'https://risingbd.com', 'https://risingbd.com/rss/rss.xml', 'general', 'asia', true),
  ('Bangladesh Diplomat', 'https://bangladeshdiplomat.com', 'https://bangladeshdiplomat.com/feed', 'politics', 'asia', true),
  ('The Dhaka Post', 'https://thedhakapost.com', 'https://thedhakapost.com/rss.xml', 'general', 'asia', true),
  ('Energy Bangla', 'https://energybangla.com', 'https://energybangla.com/feed', 'business', 'asia', true),
  ('Daily Jagaran', 'https://dailyjagaran.com', 'https://dailyjagaran.com/rss/rss.xml', 'general', 'asia', true),
  ('Jagonews24.com', 'https://www.jagonews24.com', 'https://www.jagonews24.com/rss/rss.xml', 'general', 'asia', true),
  ('Daily Bangladesh', 'https://www.daily-bangladesh.com', 'https://www.daily-bangladesh.com/rss/rss.xml', 'general', 'asia', true),
  ('BLiTZ', 'http://blitz.tobomi.com', 'http://blitz.tobomi.com/feed/', 'general', 'asia', true)
ON CONFLICT (rss_url) DO NOTHING;