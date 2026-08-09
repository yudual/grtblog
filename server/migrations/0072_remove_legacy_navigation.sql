-- +goose Up

-- Hide legacy navigation entries that belong to the previous frontend setup.
-- Keep the underlying pages, tags, and APIs so existing content is not deleted.
UPDATE nav_menu
SET deleted_at = NOW(),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND (
      lower(trim(url)) IN ('/tags', '/thinkings', '/friends', '/friends-timeline')
      OR name IN ('标签', '思考', '友链', '朋友圈')
  );

-- Do not leave an empty "More" menu after its legacy children are hidden.
UPDATE nav_menu AS parent
SET deleted_at = NOW(),
    updated_at = NOW()
WHERE parent.deleted_at IS NULL
  AND parent.url = '#'
  AND parent.name = '更多'
  AND NOT EXISTS (
      SELECT 1
      FROM nav_menu AS child
      WHERE child.parent_id = parent.id
        AND child.deleted_at IS NULL
  );

-- +goose Down
-- Intentionally left empty: the removed entries belong to the old menu setup.
