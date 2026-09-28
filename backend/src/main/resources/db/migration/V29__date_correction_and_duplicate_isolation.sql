-- ===================================================================
-- V29: 日期纠正 + 无证据确认事件撤销 + 同名重复卡隔离
-- (CODE_REVIEW 追加 18 / 19 / 20 / 21 的可自动化修复部分)
-- 原则: 不改写已执行的 V22; 错误日期用新迁移更正; 无证据事件撤销留痕不物理删除;
--       同名重复卡只隔离待审 (PENDING_REVIEW), 决不按显示名物理删除。
-- ===================================================================

-- 1) 追加 18: Gemini 3.8 Flash 官方发布日为 2026-09-02 (Google 官方公告),
--    V22 硬编码的 2026-06-25 覆盖了正确日期
UPDATE `ai_models`
SET `official_release_date` = '2026-09-02', `release_date_precision` = 'day'
WHERE `model_key` = 'gemini-3-8-flash';

INSERT INTO `model_facts` (`model_id`, `field_key`, `field_value`, `unit`, `source_id`, `source_url`, `observed_at`, `confidence`, `status`, `created_at`)
SELECT id, 'releaseDate', '2026-09-02', 'day', NULL,
       'https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/',
       NOW(3), 'exact', 'ACTIVE', NOW(3)
FROM `ai_models` WHERE `model_key` = 'gemini-3-8-flash';

-- 2) 追加 18: Gemini 3.7 Flash 卡片日期与有证据事件对齐 (Google API 日期记录 2026-08-13)
UPDATE `ai_models`
SET `official_release_date` = '2026-08-13', `release_date_precision` = 'day'
WHERE `model_key` = 'gemini-3-7-flash';

INSERT INTO `model_facts` (`model_id`, `field_key`, `field_value`, `unit`, `source_id`, `source_url`, `observed_at`, `confidence`, `status`, `created_at`)
SELECT id, 'releaseDate', '2026-08-13', 'day', NULL,
       'https://ai.google.dev/gemini-api/docs/deprecations',
       NOW(3), 'exact', 'ACTIVE', NOW(3)
FROM `ai_models` WHERE `model_key` = 'gemini-3-7-flash';

-- 3) 追加 18 验收项 (通用规则): 同一型号同时存在"有证据的不同日期 CONFIRMED 事件"时,
--    撤销无证据的那条 CONFIRMED (改为 REVOKED 留痕, 不物理删除)
--    MySQL 限制: UPDATE 目标表不得直接出现在子查询中, 故先用派生表物化命中 id
UPDATE `model_events` e
JOIN (
    -- DISTINCT 强制物化派生表, 规避 derived_merge 把目标表重新带回 FROM 子句
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

-- 4) 追加 19: 无官方发布日期的卡片不得声称 day 精度
UPDATE `ai_models`
SET `release_date_precision` = 'unknown'
WHERE `official_release_date` IS NULL AND `release_date_precision` = 'day';

-- 5) 追加 19: 暂存表结构化保存上游原始发布日期
ALTER TABLE `catalog_source_models`
    ADD COLUMN `upstream_release_date` VARCHAR(30) NULL COMMENT '上游原始发布日期(结构化暂存, 追加19)';

-- 6) 追加 20/21: 同厂商同名重复卡隔离 (只处理 AUTO_PUBLISHED, MANUAL 永远保留;
--    保留规则: MANUAL 优先, 其次最低 id; 被隔离行转 PENDING_REVIEW 待人工归并, 不物理删除)
UPDATE `ai_models` m
JOIN (
    SELECT vendor_id, LOWER(display_name) AS dn,
           MIN(CASE WHEN catalog_status = 'MANUAL' THEN id ELSE 999999999 + id END) AS keep_id
    FROM `ai_models`
    WHERE display_name IS NOT NULL AND display_name <> ''
    GROUP BY vendor_id, LOWER(display_name)
    HAVING COUNT(*) > 1
) g ON m.vendor_id = g.vendor_id AND LOWER(m.display_name) = g.dn
SET m.catalog_status = 'PENDING_REVIEW'
WHERE m.id <> g.keep_id
  AND m.catalog_status = 'AUTO_PUBLISHED';
