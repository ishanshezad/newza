/*
  # Add Additional Middle East War RSS Sources

  1. International News Sources
    - BBC World and Middle East feeds
    - CNN World and Middle East feeds
    - Al Jazeera general and Middle East feeds
    - Reuters World and Middle East feeds
    - The Guardian World and Middle East feeds
    - New York Times World and Middle East feeds
    - Washington Post World and Middle East feeds
    - Associated Press feeds
    - France24 feeds
    - Deutsche Welle feeds
    - Iranian/Regional English sources

  2. Notes
    - All sources set to active by default
    - Category set to 'middle-east-war' for consistency
    - Region set to 'middle-east' for all sources
    - Comprehensive coverage from multiple perspectives
*/

-- Insert additional Middle East War RSS sources
INSERT INTO middleeastwarrss (name, url, rss_url, category, region, active) VALUES

-- BBC Sources
('BBC World News', 'https://www.bbc.com', 'http://feeds.bbci.co.uk/news/world/rss.xml', 'middle-east-war', 'middle-east', true),
('BBC Middle East', 'https://www.bbc.com', 'http://feeds.bbci.co.uk/news/world/middle_east/rss.xml', 'middle-east-war', 'middle-east', true),

-- CNN Sources
('CNN World News', 'https://www.cnn.com', 'http://rss.cnn.com/rss/edition_world.rss', 'middle-east-war', 'middle-east', true),
('CNN Middle East', 'https://www.cnn.com', 'http://rss.cnn.com/rss/edition_meast.rss', 'middle-east-war', 'middle-east', true),

-- Al Jazeera Sources
('Al Jazeera All News', 'https://www.aljazeera.com', 'https://www.aljazeera.com/xml/rss/all.xml', 'middle-east-war', 'middle-east', true),
('Al Jazeera Middle East', 'https://www.aljazeera.com', 'https://www.aljazeera.com/xml/rss/middleeast.xml', 'middle-east-war', 'middle-east', true),

-- Reuters Sources
('Reuters World News', 'https://www.reuters.com', 'http://feeds.reuters.com/Reuters/worldNews', 'middle-east-war', 'middle-east', true),
('Reuters Middle East', 'https://www.reuters.com', 'http://feeds.reuters.com/reuters/MEworldNews', 'middle-east-war', 'middle-east', true),

-- The Guardian Sources
('The Guardian World', 'https://www.theguardian.com', 'https://www.theguardian.com/world/rss', 'middle-east-war', 'middle-east', true),
('The Guardian Middle East', 'https://www.theguardian.com', 'https://www.theguardian.com/world/middleeast/rss', 'middle-east-war', 'middle-east', true),

-- New York Times Sources
('New York Times World', 'https://www.nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', 'middle-east-war', 'middle-east', true),
('New York Times Middle East', 'https://www.nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', 'middle-east-war', 'middle-east', true),

-- Washington Post Sources
('Washington Post World', 'https://www.washingtonpost.com', 'http://feeds.washingtonpost.com/rss/world', 'middle-east-war', 'middle-east', true),
('Washington Post Middle East', 'https://www.washingtonpost.com', 'http://feeds.washingtonpost.com/rss/world/middleeast', 'middle-east-war', 'middle-east', true),

-- Associated Press Sources
('Associated Press Top News', 'https://apnews.com', 'https://apnews.com/apf-topnews?format=feed', 'middle-east-war', 'middle-east', true),
('Associated Press Middle East', 'https://apnews.com', 'https://apnews.com/hub/middle-east?format=feed', 'middle-east-war', 'middle-east', true),

-- France24 Sources
('France24 English', 'https://www.france24.com', 'https://www.france24.com/en/rss', 'middle-east-war', 'middle-east', true),
('France24 Middle East', 'https://www.france24.com', 'https://www.france24.com/en/middle-east/rss', 'middle-east-war', 'middle-east', true),

-- Deutsche Welle Sources
('Deutsche Welle All News', 'https://www.dw.com', 'https://rss.dw.com/rdf/rss-en-all', 'middle-east-war', 'middle-east', true),
('Deutsche Welle Middle East', 'https://www.dw.com', 'https://rss.dw.com/rdf/rss-en-middleeast', 'middle-east-war', 'middle-east', true),

-- Iranian/Regional English Sources
('Tehran Times', 'https://www.tehrantimes.com', 'https://www.tehrantimes.com/rss/feed.xml', 'middle-east-war', 'middle-east', true),
('Press TV', 'https://www.presstv.ir', 'https://www.presstv.ir/rss', 'middle-east-war', 'middle-east', true),
('Radio Free Europe/Radio Liberty Middle East', 'https://www.rferl.org', 'https://www.rferl.org/api/zmg/rss/rss2.xml?category=middle-east', 'middle-east-war', 'middle-east', true)

ON CONFLICT (rss_url) DO NOTHING;