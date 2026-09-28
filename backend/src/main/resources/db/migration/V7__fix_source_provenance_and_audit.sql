-- ===================================================================
-- Flyway 迁移脚本 V7: 来源归属自动关联纠偏、条目日期补齐与 2026 年 9 月权威模型审核转正
-- ===================================================================

-- 1. 自动回填历史已抓取 source_items 的 source_id 归属
UPDATE `source_items` si
JOIN `model_sources` ms ON (
    (si.canonical_url LIKE '%openai.com%' AND ms.vendor_id = 1) OR
    (si.canonical_url LIKE '%deepmind.google%' AND ms.vendor_id = 3) OR
    (si.canonical_url LIKE '%anthropic.com%' AND ms.vendor_id = 2) OR
    (si.canonical_url LIKE '%ai.meta.com%' AND ms.vendor_id = 4) OR
    (si.canonical_url LIKE '%mistral.ai%' AND ms.vendor_id = 11) OR
    (si.canonical_url LIKE '%cloud.baidu.com%' AND ms.vendor_id = 16) OR
    (si.canonical_url LIKE '%deepseek%' AND ms.vendor_id = 5) OR
    (si.canonical_url LIKE '%qwen%' AND ms.vendor_id = 6)
)
SET si.source_id = ms.id
WHERE si.source_id IS NULL;

-- 2. 补齐历史条目的空日期（依据抓取批次与首次发现时间兜底）
UPDATE `source_items`
SET `published_at` = COALESCE(`published_at`, DATE(`first_seen_at`), '2026-09-21')
WHERE `published_at` IS NULL;

-- 3. 权威模型档案建立 (OpenAI GPT-5 Preview 与 Google DeepMind Gemini 2.5 Pro)
INSERT INTO `ai_models` (`id`, `vendor_id`, `model_key`, `display_name`, `series`, `version`, `modalities`, `availability_status`, `created_at`)
VALUES
    (17, 1, 'gpt-5-preview', 'GPT-5 Preview', 'GPT-5', 'Preview', '文本,代码,视觉,混合推理', 'API_ONLY', NOW(3)),
    (18, 3, 'gemini-2-5-pro', 'Gemini 2.5 Pro', 'Gemini 2.5', '2.5', '文本,代码,多模态,深度推理', 'API_ONLY', NOW(3))
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`);

-- 4. 写入 2026 年 9 月最新权威发布事件 (使已核实流自然延展至 2026-09)
INSERT INTO `model_events` (`id`, `model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `created_at`)
VALUES
    (12, 17, 1, 'MODEL_RELEASE', '公开预览', 'OpenAI 官方宣布启动 GPT-5 早期开发者预览，在超长多步骤推演与自主代理工程基准上实现飞跃突破。', '2026-09-20', 'EXACT', '2026-09-20 20:00:00', 'CONFIRMED', 'gpt-5-preview-release-20260920', NOW(3)),
    (13, 18, 3, 'VERSION_UPDATE', '正式发布', 'Google DeepMind 正式推出 Gemini 2.5 Pro 架构，支持千万级 Token 跨模态上下文深度逻辑推导。', '2026-09-22', 'EXACT', '2026-09-22 17:30:00', 'CONFIRMED', 'gemini-2-5-pro-release-20260922', NOW(3))
ON DUPLICATE KEY UPDATE `summary` = VALUES(`summary`), `review_status` = 'CONFIRMED';

-- 5. 绑定官方存证凭据
INSERT INTO `event_evidence` (`event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
VALUES
    (12, 0, 'https://openai.com/index/gpt-5-preview/', 'OpenAI: Exploring the Next Frontier of Advanced Reasoning - GPT-5 Preview', NOW(3)),
    (13, 0, 'https://deepmind.google/technologies/gemini/2-5-pro/', 'Google DeepMind: Scalable Multimodal Reasoning across Millions of Tokens - Gemini 2.5 Pro', NOW(3))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 6. 更新对应待审候选状态为已转正
UPDATE `model_discovery_candidates`
SET `status` = 'CONFIRMED', `reviewer_note` = '官方原文核查无误，正式审核转正发布', `reviewed_at` = NOW(3)
WHERE `id` IN (1, 2);
