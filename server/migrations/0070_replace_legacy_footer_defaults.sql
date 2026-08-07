-- +goose Up

-- Remove the original author's footer links and identity from existing installs.
-- The old website_info table was migrated to sys_config in migration 0035.
WITH parsed AS (
    SELECT
        config_key,
        CASE
            WHEN value IS NULL OR btrim(value) = '' THEN '{}'::jsonb
            WHEN jsonb_typeof(value::jsonb) = 'object' THEN value::jsonb
            ELSE '{}'::jsonb
        END AS theme
    FROM sys_config
    WHERE config_key = 'site.theme_extend_info'
),
matched AS (
    SELECT
        config_key,
        jsonb_set(
            theme,
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
        ) AS value_json
    FROM parsed
    WHERE theme #>> '{footer,brand,name}' = 'Grtsinry43''s Blog.'
       OR theme #>> '{footer,copyright,owner}' = 'grtsinry43'
       OR theme::text LIKE '%/about-site%'
)
UPDATE sys_config AS sc
SET value = matched.value_json::text,
    updated_at = now()
FROM matched
WHERE sc.config_key = matched.config_key;

-- +goose Down
-- Intentionally left empty: restoring the previous author's identity would be unsafe.
