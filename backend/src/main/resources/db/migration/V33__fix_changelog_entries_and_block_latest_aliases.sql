-- ===================================================================
-- Flyway 迁移脚本: V33__fix_changelog_entries_and_block_latest_aliases.sql
-- 目标:
-- 1. 撤销 28 条无 event_evidence 的历史确认事件至 REVOKED (追加 32)
-- 2. 隔离误抓备案、页脚协议与跨厂商归属错误链接 (is_static_resource = 1) (追加 32)
-- 3. 隔离第三方滚动路由别名卡 (deepseek-*-latest 等) 至 PENDING_REVIEW (追加 30)
-- 4. 结构化补录 OpenAI Changelog 9月22日首发与 9月25日图像编码修复动态及证据链 (追加 33)
-- ===================================================================

-- 1. 撤销无证据事件至 REVOKED 状态 (保留审计历史，退出公开已核实流)
UPDATE `model_events`
SET `review_status` = 'REVOKED'
WHERE `review_status` = 'CONFIRMED'
  AND `id` IN (58, 59, 62, 63, 64, 65, 67, 69, 71, 72, 77, 80, 81, 82, 83, 84, 87, 88, 89, 90, 91, 92, 93, 97, 98, 99, 101, 103);

-- 2. 隔离备案号、页脚、许可证与跨厂商归属冲突链接
UPDATE `source_items`
SET `is_static_resource` = 1
WHERE `id` IN (129, 472, 483, 484, 518, 520, 522, 523, 1105, 7139, 1146, 15468, 1883, 1884, 1886, 1887, 1890, 1891, 1892, 1893, 1894, 1895, 1897, 1898, 1899, 1900, 1901, 1902, 1903, 1906, 1911, 1912);

-- 3. 隔离第三方滚动路由别名卡（退回待审，杜绝冒充原厂独立新模型）
UPDATE `ai_models`
SET `catalog_status` = 'PENDING_REVIEW'
WHERE `id` IN (581, 587, 1498, 1499, 1500, 2479);

UPDATE `ai_models`
SET `catalog_status` = 'PENDING_REVIEW'
WHERE (`model_key` LIKE '%-latest' OR `display_name` LIKE '% Latest')
  AND `vendor_id` NOT IN (1, 2)
  AND `catalog_status` = 'AUTO_PUBLISHED';

-- 4. 结构化补录 OpenAI Changelog 官方更新条目与 9月25日修复事件
-- 4.1 写入 9月22日与 9月25日官方正文更新至 source_items
INSERT INTO `source_items`
(`canonical_url`, `source_id`, `vendor_id`, `title`, `raw_summary`, `published_at`, `first_seen_at`, `ingested_at`, `visible_at`, `process_status`, `is_static_resource`, `created_at`)
VALUES
('https://developers.openai.com/api/docs/changelog#2026-09-22-gpt-6-sol-luna-release', 26, 1,
 'Sep 22, 2026: GPT-6 Sol and Luna API Release',
 'OpenAI officially launched frontier models GPT-6 Sol and GPT-6 Luna via the API, providing ultra-low-latency processing and state-of-the-art multimodal reasoning capabilities.',
 '2026-09-22', NOW(3), NOW(3), NOW(3), 'PROCESSED', 0, NOW(3)),
('https://developers.openai.com/api/docs/changelog#2026-09-25-image-encoding-fix', 26, 1,
 'Sep 25, 2026: Fix for image encoding in GPT-6 Sol and Luna',
 'OpenAI resolved an issue where image encoding for GPT-6 Sol and Luna caused visual understanding degradation in specific aspect ratio inputs.',
 '2026-09-25', NOW(3), NOW(3), NOW(3), 'PROCESSED', 0, NOW(3))
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `raw_summary` = VALUES(`raw_summary`),
  `published_at` = VALUES(`published_at`),
  `is_static_resource` = 0;

-- 4.2 建立 9月25日 模型更新/修复事件 (CAPABILITY_UPGRADE, 关联 GPT-6 Sol model_id=23 与 GPT-6 Luna model_id=24)
INSERT INTO `model_events`
(`model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `category`, `created_at`)
VALUES
(23, 1, 'CAPABILITY_UPGRADE', '正式版',
 'OpenAI 修复 GPT-6 Sol 在特定纵横比下的图像编码缺陷，全面恢复多模态视觉理解精度。',
 '2026-09-25', 'day', '2026-09-25 00:00:00', 'CONFIRMED', 'openai-gpt-6-sol-image-fix-20260925', 'MULTIMODAL', NOW(3)),
(24, 1, 'CAPABILITY_UPGRADE', '正式版',
 'OpenAI 修复 GPT-6 Luna 在特定纵横比下的图像编码缺陷，全面恢复多模态视觉理解精度。',
 '2026-09-25', 'day', '2026-09-25 00:00:00', 'CONFIRMED', 'openai-gpt-6-luna-image-fix-20260925', 'MULTIMODAL', NOW(3))
ON DUPLICATE KEY UPDATE `review_status` = 'CONFIRMED';

-- 4.3 挂载 event_evidence 证据链
INSERT INTO `event_evidence` (`event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
SELECT e.id, s.id, 'https://developers.openai.com/api/docs/changelog#2026-09-25-image-encoding-fix', 'Fix for image encoding in GPT-6 Sol and Luna', NOW(3)
FROM `model_events` e
JOIN `source_items` s ON s.`canonical_url` = 'https://developers.openai.com/api/docs/changelog#2026-09-25-image-encoding-fix'
WHERE e.`dedup_key` IN ('openai-gpt-6-sol-image-fix-20260925', 'openai-gpt-6-luna-image-fix-20260925')
  AND NOT EXISTS (SELECT 1 FROM `event_evidence` ev WHERE ev.`event_id` = e.id AND ev.`source_item_id` = s.id);
