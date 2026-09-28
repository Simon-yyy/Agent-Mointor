-- ===================================================================
-- Flyway V35: 采集防覆盖锁定、前台门禁收严与防再污染基线
-- 1. 为 source_items 增加人工锁定字段与原因分类
-- 2. 固化历史隔离项 locked_by_reviewer = 1，爬虫巡检绝不覆盖
-- 3. 隔离遗留无日期纯导航/控制台链接并锁定
-- ===================================================================

-- 1. 扩展字段
ALTER TABLE `source_items`
  ADD COLUMN `locked_by_reviewer` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否由管理员人工锁定隔离(1=锁定，爬虫重抓绝不覆盖)',
  ADD COLUMN `classification_reason` VARCHAR(100) NULL COMMENT '静态资源隔离或审查原因分类';

-- 2. 将此前已标记隔离的存量静态资源项全量锁定，禁止爬虫重算时回流
UPDATE `source_items`
SET `locked_by_reviewer` = 1, `classification_reason` = 'MANUAL_AUDIT_ISOLATED'
WHERE `is_static_resource` = 1;

-- 3. 对存量无有效发布日期且属于典型导航、产品页、控制台的条目执行锁定隔离
UPDATE `source_items`
SET `is_static_resource` = 1, `locked_by_reviewer` = 1, `classification_reason` = 'NAV_OR_PRODUCT_PAGE'
WHERE `is_static_resource` = 0
  AND `published_at` IS NULL
  AND (
    `canonical_url` REGEXP '(/features|/solutions|/pricing|/app|/chat|/security|/console|/docs/overview|/community|/careers|developers\\.openai\\.com/api/docs/changelog$)'
    OR `title` REGEXP '(定价|控制台|解决方案|用户协议|功能总览|Overview|Pricing|Dashboard)'
  );
