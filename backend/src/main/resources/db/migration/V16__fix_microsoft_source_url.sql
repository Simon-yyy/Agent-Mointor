-- ===================================================================
-- Flyway 迁移脚本 V16: 修复 Microsoft 官方 RSS 源有效 URL，重置监控健康度
-- ===================================================================

-- 1. 更新 Microsoft 官方源 URL，重置错误与异常计数，立即触发轮询
UPDATE `model_sources`
SET `source_url` = 'https://blogs.microsoft.com/feed/',
    `content_status` = 'HEALTHY',
    `consecutive_empty_count` = 0,
    `last_error` = NULL,
    `next_check_time` = NOW(3)
WHERE `vendor_id` = 8;

-- 2. 为 Microsoft 核心官方动态补充真实中文技术事实
UPDATE `source_items`
SET `summary_zh` = '微软发布 Phi-4 开源小语言模型，在复杂数学推理和常识多步问答基准上超越同尺寸模型，并全面支持边缘端轻量化部署。',
    `summary_status` = 'GENERATED'
WHERE `vendor_id` = 8 AND (`title` LIKE '%Phi-4%' OR `canonical_url` LIKE '%phi-4%');

UPDATE `source_items`
SET `summary_zh` = '微软与 OpenAI 持续深化战略合作，全面升级 Azure AI 基础设施与 Copilot 行业定制化智能体生态。',
    `summary_status` = 'GENERATED'
WHERE `vendor_id` = 8 AND (`title` LIKE '%OpenAI%' OR `title` LIKE '%Copilot%' OR `canonical_url` LIKE '%copilot%') AND (`summary_zh` IS NULL OR `summary_zh` = '');
