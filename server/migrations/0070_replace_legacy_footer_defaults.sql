-- +goose Up

-- Remove the original author's footer links and identity from existing installs.
UPDATE website_info
SET info_json = jsonb_set(
        COALESCE(info_json, '{}'::jsonb),
        '{footer}',
        $json$
        {
          "sections": [
            {
              "title": "这个空间",
              "links": [
                { "name": "文章", "href": "/posts" },
                { "name": "手记", "href": "/moments" },
                { "name": "时间线", "href": "/timeline" },
                { "name": "项目", "href": "/projects" }
              ]
            },
            {
              "title": "联系",
              "links": [
                { "name": "写留言", "href": "/message" }
              ]
            }
          ],
          "brand": {
            "name": "Yu的博客空间",
            "tagline": "记录工作、生活和一路上的新发现"
          },
          "copyright": {
            "startYear": 2026,
            "owner": "Yu",
            "designedWithText": "由 Yu 维护"
          },
          "presence": {
            "connectedText": "正在有 {count} 位小伙伴看着我的网站呐",
            "loadingText": "正在同步在线状态..."
          }
        }
        $json$::jsonb,
        TRUE
    ),
    updated_at = now()
WHERE info_key = 'theme_extend_info'
  AND (
    info_json #>> '{footer,brand,name}' = 'Grtsinry43''s Blog.'
    OR info_json #>> '{footer,copyright,owner}' = 'grtsinry43'
    OR info_json::text LIKE '%/about-site%'
  );

-- +goose Down
-- Intentionally left empty: restoring the previous author's identity would be unsafe.
