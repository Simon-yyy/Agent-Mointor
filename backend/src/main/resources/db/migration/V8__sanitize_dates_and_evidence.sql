-- ===================================================================
-- Flyway 迁移脚本 V8: 纠正模型发布日期、隔离未存证预置事件、清洗冒充发布日期
-- 依据 CODE_REVIEW.md 审计要求，杜绝伪造数据，确保公开内容 100% 真实可信
-- ===================================================================

-- 1. 纠偏 Google DeepMind Gemini 3.7 Flash 官方发布日期 (由 2026-02-24 修正为 2026-08-13)
UPDATE `model_events`
SET `release_date` = '2026-08-13',
    `stage` = '正式发布',
    `summary` = 'Google DeepMind 正式推出 Gemini 3.7 Flash，集成前沿混合推理架构，在保持极低延迟的同时实现数学与长链路推理突破。'
WHERE `id` = 11;

-- 更新对应官方存证凭据为权威模型卡/公告地址
UPDATE `event_evidence`
SET `official_url` = 'https://deepmind.google/models/model-cards/gemini-3-7-flash/',
    `title` = 'Google DeepMind: Gemini 3.7 Flash Model Card and Announcement'
WHERE `event_id` = 11;

-- 2. 隔离 V7 未挂载真实采集条目的预置事件 (撤回公开审核状态，待后续挂载真实条目重新审核)
UPDATE `model_events`
SET `review_status` = 'PENDING'
WHERE `id` IN (12, 13);

-- 删除 source_item_id = 0 的伪凭证
DELETE FROM `event_evidence`
WHERE `event_id` IN (12, 13) AND `source_item_id` = 0;

-- 恢复对应待审候选状态为 PENDING，保留审核留痕
UPDATE `model_discovery_candidates`
SET `status` = 'PENDING',
    `reviewer_note` = 'CODE_REVIEW 审计：隔离未绑定真实采集条目的预置事件，待关联原厂实际抓取条目后重新审核',
    `reviewed_at` = NULL
WHERE `id` IN (1, 2);

-- 3. 清洗被 DATE(first_seen_at) 批量冒充的伪发布日期
-- 对于非真实发布文章的纯工具/功能/导航链接，将其 published_at 恢复为 NULL
UPDATE `source_items`
SET `published_at` = NULL
WHERE `canonical_url` REGEXP '(converter|translator|generator|kimi\\.ai/tools|download|help|about)'
   OR `title` REGEXP '(生成器|翻译器|转换器|工具|导航)';
