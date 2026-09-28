-- ===================================================================
-- V31: 收尾修正
-- 1) Kimi K2.5 人工卡 (id=49, model_key=kimi-k2-5 连字符) 日期纠正
--    V30 按 kimi-k2.5 未命中; 官方研究索引日期为 2026-01-27 (追加 25)
-- 2) 撤销因日期纠正产生冲突的无证据确认事件 (复用 V29 通用规则)
-- ===================================================================

UPDATE `ai_models`
SET `official_release_date` = '2026-01-27', `release_date_precision` = 'day'
WHERE `id` = 49 AND `model_key` = 'kimi-k2-5';

INSERT INTO `model_facts` (`model_id`, `field_key`, `field_value`, `unit`, `source_id`, `source_url`, `observed_at`, `confidence`, `status`, `created_at`)
SELECT id, 'releaseDate', '2026-01-27', 'day', NULL,
       'https://www.kimi.com/en/blog/', NOW(3), 'exact', 'ACTIVE', NOW(3)
FROM `ai_models` WHERE `id` = 49 AND `model_key` = 'kimi-k2-5';

UPDATE `model_events` e
JOIN (
    SELECT DISTINCT e1.id
    FROM `model_events` e1
    WHERE e1.`review_status` = 'CONFIRMED'
      AND e1.`event_type` IN ('MODEL_RELEASE', 'WEIGHTS_RELEASE')
      AND e1.`release_date` IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM `event_evidence` ev WHERE ev.`event_id` = e1.id)
      AND EXISTS (
          SELECT 1 FROM `model_events` e2
          WHERE e2.`model_id` = e1.`model_id`
            AND e2.`id` <> e1.`id`
            AND e2.`review_status` = 'CONFIRMED'
            AND e2.`event_type` IN ('MODEL_RELEASE', 'WEIGHTS_RELEASE')
            AND e2.`release_date` IS NOT NULL
            AND e2.`release_date` <> e1.`release_date`
            AND EXISTS (SELECT 1 FROM `event_evidence` ev2 WHERE ev2.`event_id` = e2.id)
      )
) bad ON e.id = bad.id
SET e.`review_status` = 'REVOKED';
