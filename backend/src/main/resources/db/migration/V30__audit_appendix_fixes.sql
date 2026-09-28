-- ===================================================================
-- V30: 追加 25/26/27/28 可自动化修复汇总
-- 1) 恢复被 V29 keep_id 缺陷整组误隐藏的重复组规范候选 (每组保留最小真实 id)
-- 2) 按月之暗面官方索引纠正 6 条被回填日期的 Kimi 动态
-- 3) 按厂商官方原文纠正两处确证错期: Claude Opus 4.6 / Kimi K2.5
-- 4) 补充静态特征: 备案 / 公安备案 / beian / icp
-- 5) 血缘修正: model_facts.source_url 字面量源键回填为可打开链接
-- 6) upstream_release_date 从 raw_json 结构化回填 (追加 19)
-- 7) 评测隔离: model_benchmarks 加 verified 标记, 硬编码样本全部退出公开榜
-- 8) 孤儿确认事件 (模型已不存在) 撤销留痕
-- 9) 新增 OpenAI API changelog 官方信源 (追加 27)
-- ===================================================================

-- 1) 恢复整组误隐藏的重复组: 组内全部为 PENDING_REVIEW 且无 MANUAL/AUTO 时,
--    将组内最小真实 id 恢复为 AUTO_PUBLISHED, 保证每组恰有一张公开规范候选
UPDATE `ai_models` m
JOIN (
    SELECT vendor_id, LOWER(display_name) AS dn, MIN(id) AS restore_id,
           SUM(catalog_status = 'AUTO_PUBLISHED') AS auto_cnt,
           SUM(catalog_status = 'MANUAL') AS manual_cnt
    FROM `ai_models`
    WHERE display_name IS NOT NULL AND display_name <> ''
    GROUP BY vendor_id, LOWER(display_name)
    HAVING COUNT(*) > 1
       AND SUM(catalog_status = 'AUTO_PUBLISHED') = 0
       AND SUM(catalog_status = 'MANUAL') = 0
) g ON m.vendor_id = g.vendor_id AND LOWER(m.display_name) = g.dn AND m.id = g.restore_id
SET m.catalog_status = 'AUTO_PUBLISHED';

-- 2) 追加 28: Kimi 六条旧闻日期按官方研究索引纠正 (原值是 V22 回填的抓取日)
UPDATE `source_items` SET `published_at` = '2026-02-03' WHERE `canonical_url` LIKE '%blog/worldvqa';
UPDATE `source_items` SET `published_at` = '2026-02-09' WHERE `canonical_url` LIKE '%blog/agent-swarm';
UPDATE `source_items` SET `published_at` = '2026-07-16' WHERE `canonical_url` LIKE '%blog/perception-bench';
UPDATE `source_items` SET `published_at` = '2026-01-27' WHERE `canonical_url` LIKE '%blog/kimi-k2-5';
UPDATE `source_items` SET `published_at` = '2026-04-20' WHERE `canonical_url` LIKE '%blog/kimi-k2-6';
UPDATE `source_items` SET `published_at` = '2026-07-16' WHERE `canonical_url` LIKE '%blog/kimi-k3';

-- 3a) 追加 25 确证错期: Claude Opus 4.6 卡片 2026-01-18 -> 2026-02-05 (Anthropic 官方公告)
UPDATE `ai_models`
SET `official_release_date` = '2026-02-05', `release_date_precision` = 'day'
WHERE `model_key` = 'claude-opus-4-6';

INSERT INTO `model_facts` (`model_id`, `field_key`, `field_value`, `unit`, `source_id`, `source_url`, `observed_at`, `confidence`, `status`, `created_at`)
SELECT id, 'releaseDate', '2026-02-05', 'day', NULL,
       'https://www.anthropic.com/news/claude-opus-4-6', NOW(3), 'exact', 'ACTIVE', NOW(3)
FROM `ai_models` WHERE `model_key` = 'claude-opus-4-6';

-- 3b) 追加 25 确证错期: Kimi K2.5 人工卡 2026-09-16 -> 2026-01-27 (月之暗面官方研究索引)
UPDATE `ai_models`
SET `official_release_date` = '2026-01-27', `release_date_precision` = 'day'
WHERE `model_key` = 'kimi-k2.5';

INSERT INTO `model_facts` (`model_id`, `field_key`, `field_value`, `unit`, `source_id`, `source_url`, `observed_at`, `confidence`, `status`, `created_at`)
SELECT id, 'releaseDate', '2026-01-27', 'day', NULL,
       'https://www.kimi.com/en/blog/', NOW(3), 'exact', 'ACTIVE', NOW(3)
FROM `ai_models` WHERE `model_key` = 'kimi-k2.5';

-- 4) 静态特征补漏: 备案 / 公安备案 / beian / icp (追加 25: 5 条漏网)
UPDATE `source_items`
SET `is_static_resource` = 1
WHERE `is_static_resource` = 0
  AND LOWER(CONCAT(IFNULL(`title`, ''), ' ', IFNULL(`canonical_url`, '')))
    REGEXP '(备案|beian|icp)';

-- 5) 追加 25: model_facts 的字面量源键回填为真实链接
UPDATE `model_facts` SET `source_url` = 'https://models.dev/' WHERE `source_url` = 'models_dev';

-- 6) 追加 19/25: 暂存表 upstream_release_date 从 raw_json 回填历史原始日期
UPDATE `catalog_source_models`
SET `upstream_release_date` = JSON_UNQUOTE(JSON_EXTRACT(`raw_json`, '$.release_date'))
WHERE `upstream_release_date` IS NULL
  AND `raw_json` IS NOT NULL
  AND JSON_EXTRACT(`raw_json`, '$.release_date') IS NOT NULL;

-- 7) 追加 23/25 P0: 评测隔离 —— 17 条硬编码样本全部退出公开榜与详情,
--    回源逐行核实后由管理端显式置 verified=1 才可重新上榜
ALTER TABLE `model_benchmarks`
    ADD COLUMN `verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已回源核实(0=待核实,不参与公开榜)';

-- 8) 孤儿确认事件 (关联模型已不存在) 撤销留痕, 修复 101/100 差额
UPDATE `model_events` e
LEFT JOIN `ai_models` m ON e.`model_id` = m.id
SET e.`review_status` = 'REVOKED'
WHERE e.`review_status` = 'CONFIRMED'
  AND e.`model_id` IS NOT NULL
  AND m.id IS NULL;

-- 9) 追加 27: 新增 OpenAI API changelog 官方信源 (产品更新/修复动态入口)
INSERT INTO `model_sources` (`vendor_id`, `source_url`, `source_type`, `check_interval_seconds`, `is_active`, `content_status`, `created_at`)
SELECT 1, 'https://developers.openai.com/api/docs/changelog', 'HTML', 900, 1, 'HEALTHY', NOW(3)
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `model_sources` WHERE `source_url` = 'https://developers.openai.com/api/docs/changelog');
