/*
  # Seed Middle East War Data

  1. RSS Sources
    - Insert all Middle East war RSS feeds
    
  2. Tags
    - Insert all Middle East war specific tags
*/

-- Insert Middle East War RSS sources
INSERT INTO middleeastwarrss (name, url, rss_url, category, region) VALUES
-- The Jerusalem Post feeds
('Jerusalem Post - Arab Israeli Conflict', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsarabisraeliconflict.aspx', 'middle-east-war', 'middle-east'),
('Jerusalem Post - Gaza News', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsgaza.aspx', 'middle-east-war', 'middle-east'),
('Jerusalem Post - Israel Hamas War', 'https://www.jpost.com', 'https://www.jpost.com//rss/israel-hamas-war', 'middle-east-war', 'middle-east'),
('Jerusalem Post - Israel News', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsisraelnews.aspx', 'middle-east-war', 'middle-east'),
('Jerusalem Post - Middle East', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsmiddleeastnews.aspx', 'middle-east-war', 'middle-east'),
('Jerusalem Post - Iran News', 'https://www.jpost.com', 'https://www.jpost.com//rss/rssfeedsiran', 'middle-east-war', 'middle-east'),

-- AL-Monitor
('AL-Monitor', 'https://www.al-monitor.com', 'https://www.al-monitor.com/rss', 'middle-east-war', 'middle-east'),

-- Al Bawaba
('Al Bawaba', 'https://www.albawaba.com', 'https://www.albawaba.com/rss/all', 'middle-east-war', 'middle-east'),

-- Middle East Institute
('Middle East Institute', 'https://mei.edu', 'https://mei.edu/rss.xml', 'middle-east-war', 'middle-east'),

-- LSE Review of Books
('LSE Review of Books - Africa and Middle East', 'https://blogs.lse.ac.uk', 'https://blogs.lse.ac.uk/lsereviewofbooks/subscribevia-rss/', 'middle-east-war', 'middle-east'),

-- Egyptian Streets
('Egyptian Streets', 'https://egyptianstreets.com', 'https://egyptianstreets.com/feed/', 'middle-east-war', 'middle-east'),

-- Israellycool
('Israellycool', 'https://israellycool.com', 'https://israellycool.com/feed/', 'middle-east-war', 'middle-east'),

-- Menews247
('Menews247', 'https://menews247.com', 'https://menews247.com/feed/', 'middle-east-war', 'middle-east'),

-- Middle East Eye
('Middle East Eye', 'https://middleeasteye.net', 'https://middleeasteye.net/rss', 'middle-east-war', 'middle-east'),

-- Palestine Chronicle
('Palestine Chronicle', 'https://palestinechronicle.com', 'https://palestinechronicle.com/feed/', 'middle-east-war', 'middle-east'),

-- MarTech Vibe
('MarTech Vibe', 'https://martechvibe.com', 'https://martechvibe.com/feed/', 'middle-east-war', 'middle-east'),

-- Middle East Report
('Middle East Report', 'https://merip.org', 'https://merip.org/feed/', 'middle-east-war', 'middle-east')

ON CONFLICT (rss_url) DO NOTHING;

-- Insert Middle East War tags
INSERT INTO middleeastwartagtable (name, slug, category, description, color) VALUES
-- Military Operations and Attacks
('Iran–Israel airstrike', 'iran-israel-airstrike', 'military-operations', 'Direct military strikes between Iran and Israel', '#DC2626'),
('Missile barrage', 'missile-barrage', 'military-operations', 'Large-scale missile attacks', '#EF4444'),
('Sejjil missile', 'sejjil-missile', 'military-operations', 'Iranian medium-range ballistic missile', '#F87171'),
('Ballistic drone attacks', 'ballistic-drone-attacks', 'military-operations', 'Unmanned aerial vehicle attacks', '#FCA5A5'),
('Precision strikes', 'precision-strikes', 'military-operations', 'Targeted military strikes', '#FECACA'),
('F-35 participation', 'f35-participation', 'military-operations', 'Israeli F-35 fighter jet operations', '#FEE2E2'),

-- Civilian Impact
('Soroka Hospital hit', 'soroka-hospital-hit', 'civilian-impact', 'Attack on Soroka Medical Center', '#B91C1C'),
('Civilian casualties', 'civilian-casualties', 'civilian-impact', 'Non-combatant deaths and injuries', '#991B1B'),
('Hospital damage', 'hospital-damage', 'civilian-impact', 'Medical facility destruction', '#7F1D1D'),
('Residential strikes', 'residential-strikes', 'civilian-impact', 'Attacks on civilian housing', '#DC2626'),
('Palestinian casualties', 'palestinian-casualties', 'civilian-impact', 'Palestinian civilian deaths and injuries', '#B91C1C'),

-- Military Forces
('Israel Defense Forces (IDF)', 'idf', 'military-forces', 'Israeli military operations', '#1D4ED8'),
('Revolutionary Guard (IRGC)', 'irgc', 'military-forces', 'Iranian elite military force', '#DC2626'),
('Hezbollah involvement warning', 'hezbollah-involvement-warning', 'military-forces', 'Lebanese militant group threats', '#F59E0B'),
('Iran-backed militias', 'iran-backed-militias', 'military-forces', 'Proxy forces supported by Iran', '#EF4444'),

-- Nuclear Facilities
('SPND site', 'spnd-site', 'nuclear-facilities', 'Iranian nuclear research facility', '#7C3AED'),
('Arak reactor', 'arak-reactor', 'nuclear-facilities', 'Iranian heavy water reactor', '#8B5CF6'),
('Natanz facility', 'natanz-facility', 'nuclear-facilities', 'Iranian uranium enrichment site', '#A855F7'),
('Bushehr nuclear concern', 'bushehr-nuclear-concern', 'nuclear-facilities', 'Iranian nuclear power plant', '#C084FC'),
('Fordow bunker', 'fordow-bunker', 'nuclear-facilities', 'Underground Iranian nuclear facility', '#DDD6FE'),

-- Defense Systems
('Missile defense (Iron Dome)', 'iron-dome', 'defense-systems', 'Israeli missile defense system', '#059669'),
('Air raid warnings', 'air-raid-warnings', 'defense-systems', 'Emergency alert systems', '#F59E0B'),
('Civilian shelter use', 'civilian-shelter-use', 'defense-systems', 'Population protection measures', '#10B981'),

-- Diplomacy
('U.S. diplomatic window', 'us-diplomatic-window', 'diplomacy', 'American diplomatic intervention', '#3B82F6'),
('Trump ultimatum', 'trump-ultimatum', 'diplomacy', 'US presidential diplomatic pressure', '#1D4ED8'),
('Geneva diplomacy', 'geneva-diplomacy', 'diplomacy', 'International diplomatic efforts', '#2563EB'),
('UN mediation', 'un-mediation', 'diplomacy', 'United Nations intervention', '#1E40AF'),
('European foreign ministers', 'european-foreign-ministers', 'diplomacy', 'EU diplomatic involvement', '#1E3A8A'),

-- International Response
('Russia warning', 'russia-warning', 'international-response', 'Russian government statements', '#DC2626'),
('China condemnation', 'china-condemnation', 'international-response', 'Chinese government criticism', '#EF4444'),
('UN emergency sessions', 'un-emergency-sessions', 'international-response', 'United Nations crisis meetings', '#F97316'),
('ICC investigation', 'icc-investigation', 'international-response', 'International Criminal Court inquiry', '#F59E0B'),

-- Evacuations
('Australian embassy evacuation', 'australian-embassy-evacuation', 'evacuations', 'Australian diplomatic withdrawal', '#10B981'),
('British embassy withdrawal', 'british-embassy-withdrawal', 'evacuations', 'UK diplomatic evacuation', '#059669'),
('Indian student evacuation', 'indian-student-evacuation', 'evacuations', 'Evacuation of Indian nationals', '#047857'),
('Medical evacuation', 'medical-evacuation', 'evacuations', 'Emergency medical transport', '#065F46'),

-- Operations
('Operation Beech', 'operation-beech', 'operations', 'Military operation codename', '#7C2D12'),
('Operation Sindhu', 'operation-sindhu', 'operations', 'Military operation codename', '#92400E'),
('Operation Rising Lion', 'operation-rising-lion', 'operations', 'Israeli military operation', '#A16207'),
('Operation True Promise II', 'operation-true-promise-ii', 'operations', 'Iranian military operation', '#CA8A04'),
('Operation Days of Repentance', 'operation-days-of-repentance', 'operations', 'Military operation codename', '#EAB308'),

-- Humanitarian Crisis
('Refugee displacement', 'refugee-displacement', 'humanitarian-crisis', 'Population displacement', '#DC2626'),
('Gaza humanitarian crisis', 'gaza-humanitarian-crisis', 'humanitarian-crisis', 'Gaza Strip humanitarian situation', '#B91C1C'),
('Food/water shortages', 'food-water-shortages', 'humanitarian-crisis', 'Essential resource scarcity', '#991B1B'),
('NGO aid convoys', 'ngo-aid-convoys', 'humanitarian-crisis', 'Humanitarian aid delivery', '#7F1D1D'),

-- Infrastructure
('Airspace closure', 'airspace-closure', 'infrastructure', 'Aviation restrictions', '#6B7280'),
('Power grid outages', 'power-grid-outages', 'infrastructure', 'Electrical system failures', '#4B5563'),
('Transport shutdowns', 'transport-shutdowns', 'infrastructure', 'Transportation system closures', '#374151'),
('Infrastructure damage', 'infrastructure-damage', 'infrastructure', 'Critical infrastructure destruction', '#1F2937'),

-- Security Concerns
('Chemical leak risk', 'chemical-leak-risk', 'security-concerns', 'Hazardous material threats', '#DC2626'),
('Radiation fears', 'radiation-fears', 'security-concerns', 'Nuclear contamination concerns', '#B91C1C'),
('Nuclear contamination', 'nuclear-contamination', 'security-concerns', 'Radioactive material spread', '#991B1B'),

-- Regional Impact
('Regional spillover', 'regional-spillover', 'regional-impact', 'Conflict expansion beyond borders', '#F59E0B'),
('Yemen (Houthi) attack', 'yemen-houthi-attack', 'regional-impact', 'Yemeni militant group involvement', '#EF4444'),
('Strait of Hormuz stakes', 'strait-of-hormuz-stakes', 'regional-impact', 'Strategic waterway concerns', '#DC2626'),

-- Economic Impact
('Energy market impact', 'energy-market-impact', 'economic-impact', 'Oil and gas market effects', '#059669'),
('Oil shipment disruption', 'oil-shipment-disruption', 'economic-impact', 'Petroleum transport interference', '#047857'),
('Global economic volatility', 'global-economic-volatility', 'economic-impact', 'Worldwide market instability', '#065F46'),
('Sanctions enforcement', 'sanctions-enforcement', 'economic-impact', 'Economic penalty implementation', '#064E3B'),

-- Cyber Warfare
('Cyber sabotage', 'cyber-sabotage', 'cyber-warfare', 'Digital infrastructure attacks', '#7C3AED'),
('Network blackout (Iran internet)', 'network-blackout-iran', 'cyber-warfare', 'Internet service disruption', '#8B5CF6'),
('Cyberwarfare operations', 'cyberwarfare-operations', 'cyber-warfare', 'Digital military operations', '#A855F7'),

-- Intelligence
('Mossad drone base', 'mossad-drone-base', 'intelligence', 'Israeli intelligence operations', '#1D4ED8'),
('Covert operations', 'covert-operations', 'intelligence', 'Secret military activities', '#2563EB'),
('Satellite imagery', 'satellite-imagery', 'intelligence', 'Space-based surveillance', '#3B82F6'),
('Intelligence briefings', 'intelligence-briefings', 'intelligence', 'Classified information reports', '#60A5FA'),

-- Media and Information
('Media propaganda', 'media-propaganda', 'media-information', 'Information warfare campaigns', '#F59E0B'),
('Disinformation campaigns', 'disinformation-campaigns', 'media-information', 'False information spread', '#EF4444'),
('Fact-checking alerts', 'fact-checking-alerts', 'media-information', 'Information verification efforts', '#10B981'),
('Expert analysis', 'expert-analysis', 'media-information', 'Professional commentary', '#059669')

ON CONFLICT (slug) DO NOTHING;