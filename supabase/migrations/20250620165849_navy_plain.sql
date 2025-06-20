-- Insert specialized breaking news sources for Israel-Iran war monitoring
INSERT INTO breaking_news_sources (name, url, rss_url, source_type, credibility_score, priority_weight, check_interval_minutes, keywords_filter) VALUES

-- Tier 1: Premium International Sources (highest credibility)
('BBC Breaking News', 'https://www.bbc.com', 'http://feeds.bbci.co.uk/news/world/middle_east/rss.xml', 'rss', 95, 1.5, 5, 
 ARRAY['iran', 'israel', 'gaza', 'breaking', 'urgent', 'missile', 'airstrike', 'attack']),

('Reuters Breaking', 'https://www.reuters.com', 'http://feeds.reuters.com/reuters/MEworldNews', 'rss', 95, 1.5, 5,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'military', 'strike', 'conflict']),

('CNN Breaking News', 'https://www.cnn.com', 'http://rss.cnn.com/rss/edition_meast.rss', 'rss', 90, 1.4, 5,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'attack', 'missile', 'war']),

('Al Jazeera Breaking', 'https://www.aljazeera.com', 'https://www.aljazeera.com/xml/rss/middleeast.xml', 'rss', 90, 1.4, 5,
 ARRAY['iran', 'israel', 'palestine', 'gaza', 'breaking', 'urgent', 'conflict']),

('Associated Press Breaking', 'https://apnews.com', 'https://apnews.com/hub/middle-east?format=feed', 'rss', 95, 1.5, 5,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'military', 'attack', 'strike']),

-- Tier 2: Regional Specialized Sources
('Jerusalem Post Breaking', 'https://www.jpost.com', 'https://www.jpost.com//rss/israel-hamas-war', 'rss', 85, 1.3, 7,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'idf', 'hamas', 'hezbollah']),

('Times of Israel Breaking', 'https://www.timesofisrael.com', 'https://www.timesofisrael.com/feed/', 'rss', 85, 1.3, 7,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'security', 'military']),

('Middle East Eye Breaking', 'https://middleeasteye.net', 'https://middleeasteye.net/rss', 'rss', 80, 1.2, 10,
 ARRAY['iran', 'israel', 'palestine', 'breaking', 'urgent', 'conflict']),

('Press TV Breaking', 'https://www.presstv.ir', 'https://www.presstv.ir/rss', 'rss', 75, 1.1, 10,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'military', 'response']),

-- Tier 3: Additional Monitoring Sources
('Haaretz Breaking', 'https://www.haaretz.com', 'https://www.haaretz.com/cmlink/1.628752', 'rss', 85, 1.2, 10,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'security', 'politics']),

('Iran International Breaking', 'https://www.iranintl.com', 'https://www.iranintl.com/en/rss.xml', 'rss', 80, 1.1, 10,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'military', 'nuclear']),

('The Guardian Middle East', 'https://www.theguardian.com', 'https://www.theguardian.com/world/middleeast/rss', 'rss', 90, 1.3, 7,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'conflict', 'war']),

('New York Times Middle East', 'https://www.nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', 'rss', 90, 1.3, 7,
 ARRAY['iran', 'israel', 'breaking', 'urgent', 'military', 'diplomatic'])

ON CONFLICT (rss_url) DO NOTHING;