-- +goose Up

-- The footer links to /message. Keep it as a normal built-in page so it has
-- the same comment area, moderation, metrics, and admin management as other pages.
INSERT INTO page (title, description, short_url, is_enabled, is_builtin, toc, content, content_hash)
VALUES (
    '留言',
    '欢迎留下你的想法、建议或近况。',
    'message',
    TRUE,
    TRUE,
    '[]'::jsonb,
    '欢迎留下你的想法、建议或近况。',
    md5('留言' || chr(0) || '欢迎留下你的想法、建议或近况。' || chr(0) || '欢迎留下你的想法、建议或近况。')
)
ON CONFLICT (short_url) DO NOTHING;

INSERT INTO comment_area (area_name, area_type, content_id, is_closed)
SELECT '评论区：页面：留言', 'page', id, FALSE
FROM page
WHERE short_url = 'message'
  AND comment_id IS NULL
ON CONFLICT (area_type, content_id) DO NOTHING;

UPDATE page
SET comment_id = comment_area.id
FROM comment_area
WHERE page.short_url = 'message'
  AND page.comment_id IS NULL
  AND comment_area.area_type = 'page'
  AND comment_area.content_id = page.id;

INSERT INTO page_metrics (page_id, views, likes, comments)
SELECT id, 0, 0, 0
FROM page
WHERE short_url = 'message'
ON CONFLICT (page_id) DO NOTHING;

-- +goose Down
UPDATE page
SET comment_id = NULL
WHERE short_url = 'message'
  AND is_builtin = TRUE;

DELETE FROM page_metrics
WHERE page_id = (SELECT id FROM page WHERE short_url = 'message');

DELETE FROM comment_area
WHERE area_type = 'page'
  AND content_id = (SELECT id FROM page WHERE short_url = 'message');

DELETE FROM page
WHERE short_url = 'message'
  AND is_builtin = TRUE;
