/*
  # Seed News Sources Data

  1. Bangladesh News Sources
  2. Asian News Sources  
  3. Americas & Western Countries News Sources

  This migration adds all the RSS feeds specified in the requirements.
*/

-- Bangladesh News Sources
INSERT INTO news_sources (name, url, rss_url, category, region) VALUES
('Prothom Alo', 'https://prothomalo.com', 'https://prothomalo.com/feed/', 'general', 'bangladesh'),
('Jugantor', 'https://jugantor.com', 'https://jugantor.com/rss.xml', 'general', 'bangladesh'),
('BDNews24', 'https://bdnews24.com', 'https://bdnews24.com/rss/', 'general', 'bangladesh'),
('Kaler Kantho', 'https://kalerkantho.com', 'https://kalerkantho.com/rss.xml', 'general', 'bangladesh'),
('The Daily Star', 'https://thedailystar.net', 'https://thedailystar.net/rss', 'general', 'bangladesh'),
('Bangladesh Pratidin', 'https://bd-pratidin.com', 'https://bd-pratidin.com/rss.xml', 'general', 'bangladesh');

-- CNN Sources
INSERT INTO news_sources (name, url, rss_url, category, region) VALUES
('CNN Top Stories', 'https://cnn.com', 'http://rss.cnn.com/rss/cnn_topstories.rss', 'general', 'global'),
('CNN World', 'https://cnn.com', 'http://rss.cnn.com/rss/cnn_world.rss', 'world', 'global');

-- Channel News Asia Sources
INSERT INTO news_sources (name, url, rss_url, category, region) VALUES
('Channel News Asia', 'https://channelnewsasia.com', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', 'general', 'asia'),
('Channel News Asia Asia', 'https://channelnewsasia.com', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511', 'world', 'asia'),
('Channel News Asia Business', 'https://channelnewsasia.com', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6936', 'business', 'asia'),
('Channel News Asia Singapore', 'https://channelnewsasia.com', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416', 'general', 'singapore'),
('Channel News Asia Sport', 'https://channelnewsasia.com', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10296', 'sports', 'asia'),
('Channel News Asia World', 'https://channelnewsasia.com', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6311', 'world', 'asia'),
('Channel News Asia Today', 'https://channelnewsasia.com', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=679471', 'general', 'asia');

-- Al Jazeera
INSERT INTO news_sources (name, url, rss_url, category, region) VALUES
('Al Jazeera', 'https://aljazeera.com', 'https://www.aljazeera.com/xml/rss/all.xml', 'world', 'global');

-- India Today Sources
INSERT INTO news_sources (name, url, rss_url, category, region) VALUES
('India Today Top Stories', 'https://indiatoday.in', 'https://www.indiatoday.in/rss/1', 'general', 'india'),
('India Today India', 'https://indiatoday.in', 'https://www.indiatoday.in/rss/2', 'general', 'india'),
('India Today World', 'https://indiatoday.in', 'https://www.indiatoday.in/rss/3', 'world', 'india'),
('India Today Business', 'https://indiatoday.in', 'https://www.indiatoday.in/rss/4', 'business', 'india'),
('India Today Sports', 'https://indiatoday.in', 'https://www.indiatoday.in/rss/5', 'sports', 'india'),
('India Today Technology', 'https://indiatoday.in', 'https://www.indiatoday.in/rss/6', 'technology', 'india');

-- The Hindu Sources
INSERT INTO news_sources (name, url, rss_url, category, region) VALUES
('The Hindu Home', 'https://thehindu.com', 'https://www.thehindu.com/news/national/?service=rss', 'general', 'india'),
('The Hindu World', 'https://thehindu.com', 'https://www.thehindu.com/news/international/?service=rss', 'world', 'india'),
('The Hindu Business', 'https://thehindu.com', 'https://www.thehindu.com/business/?service=rss', 'business', 'india'),
('The Hindu Sport', 'https://thehindu.com', 'https://www.thehindu.com/sport/?service=rss', 'sports', 'india'),
('The Hindu Opinion', 'https://thehindu.com', 'https://www.thehindu.com/opinion/?service=rss', 'politics', 'india');

-- BBC Sources
INSERT INTO news_sources (name, url, rss_url, category, region) VALUES
('BBC News', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/rss.xml', 'general', 'uk'),
('BBC World', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/world/rss.xml', 'world', 'uk'),
('BBC UK', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/uk/rss.xml', 'general', 'uk'),
('BBC Business', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/business/rss.xml', 'business', 'uk'),
('BBC Politics', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/politics/rss.xml', 'politics', 'uk'),
('BBC Health', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/health/rss.xml', 'health', 'uk'),
('BBC Education', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/education/rss.xml', 'general', 'uk'),
('BBC Science', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'technology', 'uk'),
('BBC Technology', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/technology/rss.xml', 'technology', 'uk'),
('BBC Entertainment', 'https://bbc.com', 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', 'entertainment', 'uk');

-- New York Times Sources
INSERT INTO news_sources (name, url, rss_url, category, region) VALUES
('New York Times', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', 'general', 'us'),
('New York Times World', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', 'world', 'us'),
('New York Times US', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml', 'general', 'us'),
('New York Times Politics', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', 'politics', 'us'),
('New York Times Business', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', 'business', 'us'),
('New York Times Technology', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', 'technology', 'us'),
('New York Times Sports', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml', 'sports', 'us'),
('New York Times Science', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', 'technology', 'us'),
('New York Times Health', 'https://nytimes.com', 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', 'health', 'us');