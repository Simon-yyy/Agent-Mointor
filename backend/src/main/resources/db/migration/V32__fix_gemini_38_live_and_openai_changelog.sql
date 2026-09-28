-- ===================================================================
-- Flyway 迁移脚本: V32__fix_gemini_38_live_and_openai_changelog.sql
-- 目标:
-- 1. 将 Gemini 3.8 Live、Extended Thinking、Flash TTS 等模型从 Vercel AI Gateway
--    纠偏归位至 Google DeepMind (ID 3)，恢复为公开规范模型卡
-- 2. 为 9月15日、23日、24日 Google 官方发布公告建立已确认模型事件与证据链 (event_evidence)
-- 3. 隔离 OpenAI changelog (source_id = 26) 误抓的 50 条无日期侧边栏导航链接 (is_static_resource = 1)
-- 4. 纠正 source_id = 26 假阳性健康状态
-- ===================================================================

-- 1. 纠偏 Gemini 3.8 衍生型号归属厂商至 Google DeepMind (ID = 3)
UPDATE `ai_models`
SET `vendor_id` = 3, `catalog_status` = 'AUTO_PUBLISHED'
WHERE `id` IN (2381, 2386, 2387, 2375);

-- 补充发布日期事实至 model_facts
INSERT INTO `model_facts` (`model_id`, `field_key`, `field_value`, `unit`, `source_id`, `source_url`, `observed_at`, `confidence`, `status`, `created_at`)
VALUES
(2381, 'releaseDate', '2026-09-15', 'day', 3, 'https://deepmind.google/blog/introducing-gemini-3-8-live-and-3-8-live-extended-thinking/', NOW(3), 'exact', 'ACTIVE', NOW(3)),
(2387, 'releaseDate', '2026-09-15', 'day', 3, 'https://deepmind.google/blog/introducing-gemini-3-8-live-and-3-8-live-extended-thinking/', NOW(3), 'exact', 'ACTIVE', NOW(3)),
(2386, 'releaseDate', '2026-09-23', 'day', 3, 'https://deepmind.google/blog/say-hello-to-gemini-38-text-to-speech/', NOW(3), 'exact', 'ACTIVE', NOW(3))
ON DUPLICATE KEY UPDATE `field_value` = VALUES(`field_value`);

-- 更新模型主表 official_release_date
UPDATE `ai_models` SET `official_release_date` = '2026-09-15', `release_date_precision` = 'day' WHERE `id` IN (2381, 2387);
UPDATE `ai_models` SET `official_release_date` = '2026-09-23', `release_date_precision` = 'day' WHERE `id` = 2386;

-- 2. 建立官方已确认事件 (model_events) 与证据链 (event_evidence)
-- 2.1 Gemini 3.8 Live 发布事件 (2026-09-15)
INSERT INTO `model_events` (`model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `category`, `created_at`)
VALUES
(2381, 3, 'MODEL_RELEASE', '正式版', 'Google DeepMind 官宣推出 Gemini 3.8 Live，具备低延迟全双工实时音视频交互能力与多模态原生理解。', '2026-09-15', 'day', '2026-09-15 00:00:00', 'CONFIRMED', 'google-gemini-3-8-live-release-20260915', 'MULTIMODAL', NOW(3)),
(2387, 3, 'MODEL_RELEASE', '正式版', 'Google DeepMind 官宣推出 Gemini 3.8 Live Extended Thinking，支持在实时交互流中进行扩展深度逻辑链思考。', '2026-09-15', 'day', '2026-09-15 00:00:00', 'CONFIRMED', 'google-gemini-3-8-live-thinking-release-20260915', 'REASONING', NOW(3)),
(2386, 3, 'MODEL_RELEASE', '正式版', 'Google DeepMind 正式推出 Gemini 3.8 Flash 文本转语音 (TTS) 专有前沿模型。', '2026-09-23', 'day', '2026-09-23 00:00:00', 'CONFIRMED', 'google-gemini-3-8-flash-tts-release-20260923', 'MULTIMODAL', NOW(3)),
(2381, 3, 'CAPABILITY_UPGRADE', '正式版', 'Google DeepMind 升级 Gemini 3.8 Live 核心能力，集成 Live Avatar 实时化身生成。', '2026-09-24', 'day', '2026-09-24 00:00:00', 'CONFIRMED', 'google-gemini-3-8-live-avatar-20260924', 'MULTIMODAL', NOW(3))
ON DUPLICATE KEY UPDATE `review_status` = 'CONFIRMED';

-- 2.2 挂载 event_evidence 溯源证据
INSERT INTO `event_evidence` (`event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
SELECT e.id, 19, 'https://deepmind.google/blog/introducing-gemini-3-8-live-and-3-8-live-extended-thinking/', 'Introducing Gemini 3.8 Live and 3.8 Live Extended Thinking', NOW(3)
FROM `model_events` e
WHERE e.`dedup_key` = 'google-gemini-3-8-live-release-20260915'
  AND NOT EXISTS (SELECT 1 FROM `event_evidence` ev WHERE ev.`event_id` = e.id AND ev.`source_item_id` = 19);

INSERT INTO `event_evidence` (`event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
SELECT e.id, 19, 'https://deepmind.google/blog/introducing-gemini-3-8-live-and-3-8-live-extended-thinking/', 'Introducing Gemini 3.8 Live and 3.8 Live Extended Thinking', NOW(3)
FROM `model_events` e
WHERE e.`dedup_key` = 'google-gemini-3-8-live-thinking-release-20260915'
  AND NOT EXISTS (SELECT 1 FROM `event_evidence` ev WHERE ev.`event_id` = e.id AND ev.`source_item_id` = 19);

INSERT INTO `event_evidence` (`event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
SELECT e.id, 18, 'https://deepmind.google/blog/say-hello-to-gemini-38-text-to-speech/', 'Gemini 3.8 text-to-speech says hello', NOW(3)
FROM `model_events` e
WHERE e.`dedup_key` = 'google-gemini-3-8-flash-tts-release-20260923'
  AND NOT EXISTS (SELECT 1 FROM `event_evidence` ev WHERE ev.`event_id` = e.id AND ev.`source_item_id` = 18);

INSERT INTO `event_evidence` (`event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
SELECT e.id, 16, 'https://deepmind.google/blog/introducing-gemini-38-live-with-live-avatar/', 'Introducing Gemini 3.8 Live with Live Avatar', NOW(3)
FROM `model_events` e
WHERE e.`dedup_key` = 'google-gemini-3-8-live-avatar-20260924'
  AND NOT EXISTS (SELECT 1 FROM `event_evidence` ev WHERE ev.`event_id` = e.id AND ev.`source_item_id` = 16);

-- 3. 清理 source_id = 26 (OpenAI Changelog) 误抓的无日期侧边栏导航链接
UPDATE `source_items`
SET `is_static_resource` = 1
WHERE `source_id` = 26 AND `published_at` IS NULL;

-- 4. 纠正 source_id = 26 假阳性健康状态
UPDATE `model_sources`
SET `content_status` = 'PARSE_EMPTY', `consecutive_empty_count` = 1
WHERE `id` = 26 AND NOT EXISTS (SELECT 1 FROM `source_items` WHERE `source_id` = 26 AND `is_static_resource` = 0 AND `published_at` IS NOT NULL);
