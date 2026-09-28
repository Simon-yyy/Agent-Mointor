-- V15: 自适应高频采集调度、内容健康度监控与四维溯源时间戳 (落地追加 09 规范)

-- 1. 为 model_sources 表扩展细粒度调度与内容健康度字段
ALTER TABLE `model_sources`
  ADD COLUMN `check_interval_seconds` INT NOT NULL DEFAULT 600 COMMENT '期望轮询间隔(秒)：高频源 300s，普通源 900s' AFTER `source_type`,
  ADD COLUMN `consecutive_empty_count` INT NOT NULL DEFAULT 0 COMMENT '连续解析为空次数(内容健康度告警)' AFTER `failure_count`,
  ADD COLUMN `content_status` VARCHAR(50) NOT NULL DEFAULT 'HEALTHY' COMMENT '内容状态: HEALTHY/PARSE_EMPTY/RATE_LIMITED/ERROR' AFTER `consecutive_empty_count`,
  ADD COLUMN `last_parsed_count` INT NOT NULL DEFAULT 0 COMMENT '最近一次成功解析条目数' AFTER `content_status`,
  ADD COLUMN `latest_item_published_at` DATETIME(3) NULL COMMENT '最近发现最新文章发布时刻' AFTER `last_parsed_count`;

-- 2. 为 source_items 扩展四维溯源时间戳
ALTER TABLE `source_items`
  ADD COLUMN `ingested_at` DATETIME(3) NULL COMMENT '入库时间戳' AFTER `first_seen_at`,
  ADD COLUMN `visible_at` DATETIME(3) NULL COMMENT '前台可见时间戳' AFTER `ingested_at`;

-- 回填已有存量数据的 ingested_at 和 visible_at
UPDATE `source_items`
SET `ingested_at` = COALESCE(`first_seen_at`, `created_at`),
    `visible_at` = COALESCE(`first_seen_at`, `created_at`)
WHERE `ingested_at` IS NULL;

-- 3. 按源站特性分层配置轮询间隔与初始检查时间
-- 核心高频原厂 RSS/API 设为 300 秒 (5分钟)
UPDATE `model_sources`
SET `check_interval_seconds` = 300,
    `next_check_time` = NOW(3)
WHERE `source_type` IN ('RSS', 'ATOM') AND `vendor_id` IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

-- HTML 归档与长列表页面设为 900 秒 (15分钟)
UPDATE `model_sources`
SET `check_interval_seconds` = 900,
    `next_check_time` = NOW(3)
WHERE `source_type` = 'HTML' OR `vendor_id` NOT IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
