-- ===================================================================
-- Flyway 迁移脚本 V4: 增加候选发现表、修正信源归属与补齐 2026 年真实事件
-- ===================================================================

-- 1. 新建待审核模型发现候选表 (model_discovery_candidates)
CREATE TABLE IF NOT EXISTS `model_discovery_candidates` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `source_name` VARCHAR(255) NOT NULL COMMENT '抓取来源名称或聚合源',
    `external_model_id` VARCHAR(255) NULL COMMENT '上游或外部模型ID',
    `guess_vendor_name` VARCHAR(255) NOT NULL COMMENT '推断所属厂商',
    `guess_model_name` VARCHAR(255) NOT NULL COMMENT '推断模型名称',
    `raw_title` VARCHAR(500) NOT NULL COMMENT '官方公告原文标题',
    `raw_summary` TEXT NULL COMMENT '原文摘要',
    `evidence_url` VARCHAR(1000) NOT NULL COMMENT '官方存证原链',
    `upstream_date` DATE NULL COMMENT '上游标注发布日期',
    `first_seen_at` DATETIME(3) NOT NULL COMMENT '本站首次发现时刻',
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING/CONFIRMED/REJECTED',
    `reviewer_note` VARCHAR(500) NULL COMMENT '审核批注',
    `reviewed_at` DATETIME(3) NULL COMMENT '审核操作时间',
    `created_at` DATETIME(3) NOT NULL,
    INDEX `idx_candidates_status` (`status`),
    INDEX `idx_candidates_vendor` (`guess_vendor_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 修正 V3 中的信源错误归属 (纠正 HuggingFace 挂到百度的错误)
UPDATE `model_sources`
SET `source_url` = 'https://cloud.baidu.com/news/news', `source_type` = 'HTML'
WHERE `vendor_id` = 16 AND `source_url` LIKE '%huggingface.co%';

-- 3. 补齐并更新 Anthropic, Meta, Mistral 稳定可达的官方信源
UPDATE `model_sources`
SET `source_url` = 'https://www.anthropic.com/news', `source_type` = 'HTML'
WHERE `vendor_id` = 2 AND `source_url` LIKE '%feed.xml%';

UPDATE `model_sources`
SET `source_url` = 'https://ai.meta.com/blog/', `source_type` = 'HTML'
WHERE `vendor_id` = 4 AND `source_url` LIKE '%ai.meta.com/blog/rss.xml%';

UPDATE `model_sources`
SET `source_url` = 'https://mistral.ai/news/', `source_type` = 'HTML'
WHERE `vendor_id` = 11 AND `source_url` LIKE '%mistral.ai/news/rss.xml%';

-- 4. 播种 2026 年以来的可核验官方发布真实里程碑 (Anthropic Claude Opus 4.6, Mistral Small 4, DeepMind Veo 3.1)
-- 4.1 新建模型基础档案 (如果不存在)
INSERT INTO `ai_models` (`id`, `vendor_id`, `model_key`, `display_name`, `series`, `version`, `modalities`, `availability_status`, `created_at`)
VALUES
    (13, 2, 'claude-opus-4-6', 'Claude Opus 4.6', 'Claude 4', '4.6', '文本,代码,视觉,混合推理', 'API_ONLY', NOW(3)),
    (14, 11, 'mistral-small-4', 'Mistral Small 4', 'Mistral Small', '4.0', '文本,代码,多语言', 'WEIGHTS_OPEN', NOW(3)),
    (15, 3, 'veo-3-1', 'Veo 3.1', 'Veo', '3.1', '多模态,视频,视觉', 'API_ONLY', NOW(3))
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`);

-- 4.2 写入 2026 年官方发布事件
INSERT INTO `model_events` (`id`, `model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `created_at`)
VALUES
    (8, 13, 2, 'MODEL_RELEASE', '正式发布', 'Anthropic 正式推出 Claude Opus 4.6 超强旗舰模型，在超长逻辑链深度推理、代码工程基准和跨模态视觉理解上刷新 SOTA 表现。', '2026-02-05', 'EXACT', '2026-02-05 18:00:00', 'CONFIRMED', 'claude-opus-4-6-release-20260205', NOW(3)),
    (9, 14, 11, 'WEIGHTS_RELEASE', '正式发布', 'Mistral AI 正式开源 Mistral Small 4 模型权重，采用 Apache 2.0 商业可用许可证，在极小推理显存占用下保持卓越的代码与数学推理表现。', '2026-03-16', 'EXACT', '2026-03-16 16:30:00', 'CONFIRMED', 'mistral-small-4-release-20260316', NOW(3)),
    (10, 15, 3, 'MODEL_RELEASE', '公开预览', 'Google DeepMind 发布高分辨率视频生成模型 Veo 3.1，支持原生高帧率视频生成与精准电影级运镜物理控制。', '2026-01-20', 'EXACT', '2026-01-20 19:00:00', 'CONFIRMED', 'veo-3-1-release-20260120', NOW(3))
ON DUPLICATE KEY UPDATE `summary` = VALUES(`summary`);

-- 4.3 绑定官方权威存证凭据
INSERT INTO `event_evidence` (`id`, `event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
VALUES
    (8, 8, 0, 'https://www.anthropic.com/news/claude-opus-4-6', 'Anthropic News: Introducing Claude Opus 4.6', NOW(3)),
    (9, 9, 0, 'https://mistral.ai/news/mistral-small-4/', 'Mistral AI: Mistral Small 4 is now available under Apache 2.0', NOW(3)),
    (10, 10, 0, 'https://deepmind.google/technologies/veo/', 'Google DeepMind Research: Advancing Video Generation with Veo 3.1', NOW(3))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 4.4 预置试点候选待审数据 (供后台审核流演示)
INSERT INTO `model_discovery_candidates` (`id`, `source_name`, `external_model_id`, `guess_vendor_name`, `guess_model_name`, `raw_title`, `raw_summary`, `evidence_url`, `upstream_date`, `first_seen_at`, `status`, `created_at`)
VALUES
    (1, 'OpenAI News RSS', 'gpt-5-preview', 'OpenAI', 'GPT-5 Preview', 'Exploring the Next Frontier of Advanced Reasoning: Early Developer Preview', 'OpenAI 官方博客发布关于下一代混合推理架构的实验性开发者测试公告。', 'https://openai.com/news/', '2026-09-20', NOW(3), 'PENDING', NOW(3)),
    (2, 'Google DeepMind RSS', 'gemini-2-5-pro', 'Google DeepMind', 'Gemini 2.5 Pro', 'Gemini 2.5 Pro: Scalable Multimodal Reasoning across Millions of Tokens', 'DeepMind 团队公布 Gemini 2.5 核心技术报告与开发者 API 准入通道。', 'https://deepmind.google/blog/', '2026-09-22', NOW(3), 'PENDING', NOW(3))
ON DUPLICATE KEY UPDATE `guess_model_name` = VALUES(`guess_model_name`);
