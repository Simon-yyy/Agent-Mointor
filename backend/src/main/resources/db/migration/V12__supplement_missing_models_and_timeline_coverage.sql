-- V12: 补全 4-7 月官方动态断层，建档 GPT-6 Sol/Luna、Grok 4.7 等 7 款关键基准模型并关联真实存证

-- 1. 录入 4-7 月历史官方原厂动态 (source_items)
INSERT INTO `source_items` (`id`, `source_id`, `vendor_id`, `canonical_url`, `title`, `raw_summary`, `published_at`, `first_seen_at`, `process_status`, `created_at`)
VALUES
  (1871, 1, 1, 'https://openai.com/index/introducing-gpt-5-5/', 'Introducing GPT-5.5', 'OpenAI 官方发布旗舰模型 GPT-5.5', '2026-04-23 00:00:00.000', '2026-04-23 10:00:00.000', 'PROCESSED', NOW(3)),
  (1872, 2, 2, 'https://www.anthropic.com/news/claude-opus-4-7', 'Introducing Claude Opus 4.7', 'Anthropic 官方发布 Claude Opus 4.7 前沿推理模型', '2026-04-16 00:00:00.000', '2026-04-16 10:00:00.000', 'PROCESSED', NOW(3)),
  (1873, 3, 3, 'https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-collection/', 'Google I/O 2026: Introducing Gemini Omni and Gemini 3.5', 'Google DeepMind 在 I/O 2026 发布原生全模态架构 Gemini Omni 与 Gemini 3.5', '2026-05-19 00:00:00.000', '2026-05-19 10:00:00.000', 'PROCESSED', NOW(3)),
  (1874, 3, 3, 'https://blog.google/products-and-platforms/products/gemini/gemini-drop-july-2026/', 'Gemini Drops July 2026: Gemini 3.6 Flash and Gemini 3.5 Flash-Lite', 'Google DeepMind 发布 7 月更新 Gemini 3.6 Flash 与 Gemini 3.5 Flash-Lite', '2026-07-31 00:00:00.000', '2026-07-31 10:00:00.000', 'PROCESSED', NOW(3))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `published_at` = VALUES(`published_at`);

-- 2. 独立建档 7 款规范基准大模型档案 (ai_models)
INSERT INTO `ai_models` (`id`, `vendor_id`, `model_key`, `display_name`, `series`, `version`, `modalities`, `availability_status`, `created_at`)
VALUES
  (23, 1, 'gpt-6-sol', 'GPT-6 Sol', 'GPT-6', 'Sol', '文本,代码,多模态,自主代理', 'API_ONLY', NOW(3)),
  (24, 1, 'gpt-6-luna', 'GPT-6 Luna', 'GPT-6', 'Luna', '文本,代码,轻量低延时', 'API_ONLY', NOW(3)),
  (25, 7, 'grok-4-7', 'Grok 4.7', 'Grok 4', '4.7', '文本,代码,逻辑推理', 'API_ONLY', NOW(3)),
  (26, 1, 'gpt-5-5', 'GPT-5.5', 'GPT-5', '5.5', '文本,代码,深度推理,长上下文', 'API_ONLY', NOW(3)),
  (27, 2, 'claude-opus-4-7', 'Claude Opus 4.7', 'Claude 4', 'Opus 4.7', '文本,代码,长思维链', 'API_ONLY', NOW(3)),
  (28, 3, 'gemini-omni', 'Gemini Omni', 'Gemini Omni', '1.0', '全模态,端到端视音频,低延迟交互', 'API_ONLY', NOW(3)),
  (29, 3, 'gemini-3-6-flash', 'Gemini 3.6 Flash', 'Gemini 3', '3.6', '文本,代码,多模态,高通量', 'API_ONLY', NOW(3))
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`), `series` = VALUES(`series`), `version` = VALUES(`version`), `modalities` = VALUES(`modalities`);

-- 3. 写入已确认模型演进里程碑事件 (model_events)
INSERT INTO `model_events` (`id`, `model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `created_at`)
VALUES
  (18, 23, 1, 'MODEL_RELEASE', '正式发布', 'OpenAI 官方发布前沿高通量旗舰模型 GPT-6 Sol，专为高频编程交互与生产级自主代理系统优化。', '2026-09-22', 'EXACT', '2026-09-22 10:00:00.000', 'CONFIRMED', 'openai_gpt-6-sol_official_release_20260922', NOW(3)),
  (19, 24, 1, 'MODEL_RELEASE', '正式发布', 'OpenAI 推出极致轻量化与低延迟模型 GPT-6 Luna，以极低推理成本支持端侧与实时多模态任务。', '2026-09-22', 'EXACT', '2026-09-22 10:00:00.000', 'CONFIRMED', 'openai_gpt-6-luna_official_release_20260922', NOW(3)),
  (20, 25, 7, 'VERSION_UPDATE', '正式发布', 'xAI 正式推出 Grok 4.7，推理速度提升两倍且价格减半，显著强化代码编写与知识工作能力。', '2026-09-21', 'EXACT', '2026-09-21 10:00:00.000', 'CONFIRMED', 'xai_grok-4-7_official_release_20260921', NOW(3)),
  (21, 26, 1, 'VERSION_UPDATE', '正式发布', 'OpenAI 官方推出旗舰升级模型 GPT-5.5，全面提升复杂逻辑推理与百万上下文编程处理能力。', '2026-04-23', 'EXACT', '2026-04-23 10:00:00.000', 'CONFIRMED', 'openai_gpt-5-5_official_release_20260423', NOW(3)),
  (22, 27, 2, 'VERSION_UPDATE', '正式发布', 'Anthropic 官方发布 Claude Opus 4.7，在跨学科复杂数学建模与长思维链软件工程评估中大幅领先。', '2026-04-16', 'EXACT', '2026-04-16 10:00:00.000', 'CONFIRMED', 'anthropic_claude-opus-4-7_official_release_20260416', NOW(3)),
  (23, 28, 3, 'MODEL_RELEASE', '正式发布', 'Google DeepMind 在 I/O 2026 震撼发布原生全模态架构 Gemini Omni，支持全双工超低延时跨模态即时理解。', '2026-05-19', 'EXACT', '2026-05-19 10:00:00.000', 'CONFIRMED', 'google_gemini-omni_official_release_20260519', NOW(3)),
  (24, 29, 3, 'VERSION_UPDATE', '正式发布', 'Google DeepMind 发布 7 月更新 Gemini 3.6 Flash，大幅降低长多模态输入延迟并优化云端吞吐量。', '2026-07-31', 'EXACT', '2026-07-31 10:00:00.000', 'CONFIRMED', 'google_gemini-3-6-flash_official_release_20260731', NOW(3))
ON DUPLICATE KEY UPDATE `summary` = VALUES(`summary`), `release_date` = VALUES(`release_date`), `review_status` = VALUES(`review_status`);

-- 4. 建立事件与官方存证的强关联 (event_evidence)
INSERT INTO `event_evidence` (`id`, `event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
VALUES
  (19, 18, 13, 'https://openai.com/index/introducing-gpt-6-sol-and-luna', 'OpenAI: Introducing GPT-6 Sol and Luna', NOW(3)),
  (20, 19, 13, 'https://openai.com/index/introducing-gpt-6-sol-and-luna', 'OpenAI: Introducing GPT-6 Sol and Luna', NOW(3)),
  (21, 20, 489, 'https://x.ai/news/grok-4-7', 'xAI: Introducing Grok 4.7', NOW(3)),
  (22, 21, 1871, 'https://openai.com/index/introducing-gpt-5-5/', 'OpenAI: Introducing GPT-5.5', NOW(3)),
  (23, 22, 1872, 'https://www.anthropic.com/news/claude-opus-4-7', 'Anthropic: Introducing Claude Opus 4.7', NOW(3)),
  (24, 23, 1873, 'https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-collection/', 'Google: Google I/O 2026 Collection', NOW(3)),
  (25, 24, 1874, 'https://blog.google/products-and-platforms/products/gemini/gemini-drop-july-2026/', 'Google: Gemini Drop July 2026', NOW(3))
ON DUPLICATE KEY UPDATE `official_url` = VALUES(`official_url`), `title` = VALUES(`title`);

-- 5. 闭环转正待审候选
UPDATE `model_discovery_candidates`
SET `status` = 'CONFIRMED',
    `reviewer_note` = 'CODE_REVIEW 审计核准：原厂官网公告确认属实，已建档模型变体并转正发布',
    `reviewed_at` = NOW(3)
WHERE `id` IN (10, 77);
