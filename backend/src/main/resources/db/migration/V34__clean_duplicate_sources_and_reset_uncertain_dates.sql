-- V34: 信源异常停用、重复信源清理、同日发布日期复核清洗与真实覆盖状态扩展

-- 1. 停用 404 错误源 ID 24 (智谱 https://z.ai/blog/ 已不可访问)
UPDATE `model_sources` 
SET `is_active` = 0, `last_error` = 'DEPRECATED_404_URL' 
WHERE `id` = 24;

-- 2. 停用与 ID 8 完全重复的百度新闻信源 ID 14
UPDATE `model_sources` 
SET `is_active` = 0, `last_error` = 'DEPRECATED_DUPLICATE_SOURCE' 
WHERE `id` = 14;

-- 3. 清洗 source_items 中无官方事件证据且 published_at = DATE(first_seen_at) 的残留虚假/猜测日期
-- 历史上 V22 曾用 first_seen_at 批量回填，导致旧闻冒充今天发布；此处批量重置为 NULL，回归“日期待核实”
UPDATE `source_items` si
SET `published_at` = NULL
WHERE si.`published_at` IS NOT NULL
  AND DATE(si.`published_at`) = DATE(si.`first_seen_at`)
  AND NOT EXISTS (
      SELECT 1 FROM `event_evidence` ev 
      WHERE ev.`source_item_id` = si.`id`
  );

-- 4. 扩展 source_coverage.status 字段长度以容纳标准语义状态
ALTER TABLE `source_coverage` 
MODIFY COLUMN `status` VARCHAR(32) NOT NULL DEFAULT 'INCOMPLETE' 
COMMENT 'VERIFIED_COVERED: 已扫完有条目, VERIFIED_EMPTY: 已查完无更新, INCOMPLETE: 抓取或解析有缺口, UNVERIFIED: 待核验';

-- 5. 将历史 source_coverage 中的旧语义平滑映射至规范语义
UPDATE `source_coverage` SET `status` = 'VERIFIED_COVERED' WHERE `status` = 'FULL';
UPDATE `source_coverage` SET `status` = 'INCOMPLETE' WHERE `status` = 'PARTIAL';
UPDATE `source_coverage` SET `status` = 'UNVERIFIED' WHERE `status` = 'GAP' OR `status` = 'NONE';
