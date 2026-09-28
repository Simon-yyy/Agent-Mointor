-- V11: 修复厂商与模型归属错位，修复模型能力乱码
-- 1. 恢复 id=19 为 xAI 旗下真实的 Grok 4.6 模型档案
UPDATE `ai_models`
SET `display_name` = 'Grok 4.6',
    `series` = 'Grok 4',
    `version` = '4.6',
    `modalities` = '文本,代码,逻辑推理'
WHERE `id` = 19;

-- 2. 修复 id=16 (Gemini 3.7 Flash) 存入 ASCII 问号的乱码能力标签
UPDATE `ai_models`
SET `modalities` = '文本,代码,多模态,混合推理'
WHERE `id` = 16;

-- 3. 为 Google DeepMind 独立建立 Gemini 3.8 Flash 模型档案 (id=22)
INSERT INTO `ai_models` (`id`, `vendor_id`, `model_key`, `display_name`, `series`, `version`, `modalities`, `availability_status`, `created_at`)
VALUES (22, 3, 'gemini-3-8-flash', 'Gemini 3.8 Flash', 'Gemini 3', '3.8', '文本,代码,多模态,深度推理', 'API_ONLY', NOW(3))
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`), `vendor_id` = VALUES(`vendor_id`), `modalities` = VALUES(`modalities`);

-- 4. 纠正 Google DeepMind Gemini 3.8 Flash 官方发布事件 (event_id=15) 的外键关联，指向真正的 gemini-3-8-flash (id=22)
UPDATE `model_events`
SET `model_id` = 22
WHERE `id` = 15;
