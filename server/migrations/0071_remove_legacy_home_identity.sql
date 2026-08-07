-- +goose Up

-- Use the frontend's Yu defaults when an install still has the original
-- author's homepage identity from migration 0029.
UPDATE sys_config
SET value = jsonb_set(
        CASE
            WHEN value IS NULL OR btrim(value) = '' THEN '{}'::jsonb
            WHEN jsonb_typeof(value::jsonb) = 'object' THEN value::jsonb
            ELSE '{}'::jsonb
        END,
        '{home}',
        '{}'::jsonb,
        TRUE
    )::text,
    updated_at = now()
WHERE config_key = 'site.theme_extend_info'
  AND (
    lower(value) LIKE '%grtsinry%'
    OR lower(value) LIKE '%grtinry%'
    OR lower(value) LIKE '%dogeoss%'
    OR lower(value) LIKE '%outlook.com%'
  );

-- +goose Down
-- Intentionally left empty: restoring the previous author's identity would be unsafe.
