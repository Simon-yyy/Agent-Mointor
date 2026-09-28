-- 修正月之暗面 Kimi K3 官方 Research 权威发布时间为 2026-07-16 (CODE_REVIEW 追加 15 实测核准)
UPDATE `ai_models`
SET `official_release_date` = '2026-07-16'
WHERE `model_key` = 'kimi-k3';

UPDATE `model_events`
SET `release_date` = '2026-07-16',
    `dedup_key` = 'moonshot_kimi-k3_official_release_20260716'
WHERE `dedup_key` LIKE 'moonshot_kimi-k3%'
   OR `model_id` IN (SELECT id FROM (SELECT id FROM `ai_models` WHERE `model_key` = 'kimi-k3') as t);
