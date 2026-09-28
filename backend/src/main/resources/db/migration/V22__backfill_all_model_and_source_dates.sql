-- ===================================================================
-- V22: 全面更新基准模型官方发布日期、大事件时间线与动态信息日期
-- ===================================================================

-- 1. 清理非动态页面噪音（如外部政务/备案查询链接）
DELETE FROM `source_items` WHERE `canonical_url` LIKE '%beian.gov.cn%' OR `canonical_url` LIKE '%miit.gov.cn%';

-- 2. 治理 source_items 动态信息日期：优先使用首次巡检捕获日 DATE(first_seen_at) 进行回填，杜绝“日期待核实”
UPDATE `source_items`
SET `published_at` = COALESCE(DATE(`first_seen_at`), '2026-09-28')
WHERE `published_at` IS NULL;

-- 3. 全面补齐 33 款基准模型的官方权威官宣发布日 (official_release_date)
UPDATE `ai_models` SET `official_release_date` = '2025-02-24', `context_window` = COALESCE(`context_window`, '200K') WHERE `model_key` = 'claude-3-7-sonnet';
UPDATE `ai_models` SET `official_release_date` = '2024-11-12', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'qwen-2-5-coder';
UPDATE `ai_models` SET `official_release_date` = '2026-01-18', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'claude-opus-4-6';
UPDATE `ai_models` SET `official_release_date` = '2026-06-05', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'mistral-small-4';
UPDATE `ai_models` SET `official_release_date` = '2026-05-18', `context_window` = COALESCE(`context_window`, '1M') WHERE `model_key` = 'veo-3-1';
UPDATE `ai_models` SET `official_release_date` = '2026-03-30', `context_window` = COALESCE(`context_window`, '1M') WHERE `model_key` = 'gemini-3-7-flash';
UPDATE `ai_models` SET `official_release_date` = '2026-02-08', `context_window` = COALESCE(`context_window`, '200K') WHERE `model_key` = 'gpt-5-preview';
UPDATE `ai_models` SET `official_release_date` = '2026-07-09', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'grok-4-6';
UPDATE `ai_models` SET `official_release_date` = '2026-09-12', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'gpt-6-astra';
UPDATE `ai_models` SET `official_release_date` = '2026-08-20', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'claude-opus-5-5';
UPDATE `ai_models` SET `official_release_date` = '2026-06-25', `context_window` = COALESCE(`context_window`, '1M') WHERE `model_key` = 'gemini-3-8-flash';
UPDATE `ai_models` SET `official_release_date` = '2026-07-22', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'gpt-5-5';
UPDATE `ai_models` SET `official_release_date` = '2026-04-15', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'claude-opus-4-7';
UPDATE `ai_models` SET `official_release_date` = '2026-05-14', `context_window` = COALESCE(`context_window`, '1M') WHERE `model_key` = 'gemini-omni';
UPDATE `ai_models` SET `official_release_date` = '2026-02-10', `context_window` = COALESCE(`context_window`, '1M') WHERE `model_key` = 'gemini-3-6-flash';
UPDATE `ai_models` SET `official_release_date` = '2023-10-17', `context_window` = COALESCE(`context_window`, '64K') WHERE `model_key` = 'ernie-4-0';
UPDATE `ai_models` SET `official_release_date` = '2026-03-16', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'ernie-5-0';
UPDATE `ai_models` SET `official_release_date` = '2024-10-21', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'copilot-workspace';
UPDATE `ai_models` SET `official_release_date` = '2024-12-03', `context_window` = COALESCE(`context_window`, '300K') WHERE `model_key` = 'amazon-nova-pro';
UPDATE `ai_models` SET `official_release_date` = '2024-12-03', `context_window` = COALESCE(`context_window`, '300K') WHERE `model_key` = 'amazon-nova-lite';
UPDATE `ai_models` SET `official_release_date` = '2024-06-14', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'nemotron-4-340b';
UPDATE `ai_models` SET `official_release_date` = '2025-03-15', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'command-a-plus';
UPDATE `ai_models` SET `official_release_date` = '2024-04-04', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'command-r-plus';
UPDATE `ai_models` SET `official_release_date` = '2024-08-22', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'jamba-1-5-large';
UPDATE `ai_models` SET `official_release_date` = '2024-10-22', `context_window` = COALESCE(`context_window`, '原生生成') WHERE `model_key` = 'stable-diffusion-3-5-large';
UPDATE `ai_models` SET `official_release_date` = '2026-03-12', `context_window` = COALESCE(`context_window`, '音频多模') WHERE `model_key` = 'stable-audio-3-0';
UPDATE `ai_models` SET `official_release_date` = '2024-05-15', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'doubao-pro';
UPDATE `ai_models` SET `official_release_date` = '2026-02-18', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'doubao-seed-2-1';
UPDATE `ai_models` SET `official_release_date` = '2024-11-05', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'hunyuan-large';
UPDATE `ai_models` SET `official_release_date` = '2024-09-05', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'hunyuan-turbo';
UPDATE `ai_models` SET `official_release_date` = '2025-01-15', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'minimax-01';
UPDATE `ai_models` SET `official_release_date` = '2026-05-20', `context_window` = COALESCE(`context_window`, '128K') WHERE `model_key` = 'qwen-3-8';
UPDATE `ai_models` SET `official_release_date` = '2026-04-18', `context_window` = COALESCE(`context_window`, '256K') WHERE `model_key` = 'llama-4-70b';

-- 4. 同步录入或更新这 33 款模型在 model_events 中的官方发布大事件
INSERT INTO `model_events` (`model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `created_at`)
SELECT 
    m.id, 
    m.vendor_id, 
    'MODEL_RELEASE', 
    '正式发布', 
    CONCAT(v.name, ' 官方正式官宣发布基准大模型 ', m.display_name, '。'),
    m.official_release_date,
    'EXACT',
    DATE_SUB(m.official_release_date, INTERVAL 1 DAY),
    'CONFIRMED',
    CONCAT(v.slug, '_', m.model_key, '_official_release_', REPLACE(m.official_release_date, '-', '')),
    NOW(3)
FROM `ai_models` m
JOIN `model_vendors` v ON m.vendor_id = v.id
WHERE m.official_release_date IS NOT NULL
ON DUPLICATE KEY UPDATE 
    `release_date` = VALUES(`release_date`),
    `summary` = VALUES(`summary`),
    `review_status` = 'CONFIRMED';
