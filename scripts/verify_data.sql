-- Check counts
SELECT 
  (SELECT COUNT(*) FROM vendors) as vendors_count,
  (SELECT COUNT(*) FROM businesses) as businesses_count,
  (SELECT COUNT(*) FROM properties) as properties_count,
  (SELECT COUNT(*) FROM events) as events_count;

-- Check a business image
SELECT name, hero_image_url FROM businesses WHERE slug = 'the-hideout-cafe-danang';

-- Check a property image
SELECT id, address, images FROM properties WHERE address ILIKE '%123 Lac Long Quan%';

SELECT * FROM events;
