-- ===================================================================
-- V26: 止血与存量整改 (CODE_REVIEW 追加 17; 模型数据管线改进方案 阶段 0)
-- 1) source_items 增加静态资源页标记: 条款/招聘/隐私/导航等页面不进入公开动态流
-- 2) 存量回填: 按 URL/标题特征标记已入库的静态资源页 (追加 17 审计: >=21 条)
-- 3) openrouter 目录源从未实现适配器, 停用避免假源统计
-- 说明: 静态页仅退出公开动态流, 原始抓取记录保留供审计; 个别误标可在管理端人工修正
-- ===================================================================

ALTER TABLE `source_items`
    ADD COLUMN `is_static_resource` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '静态资源页(条款/招聘/隐私/导航等), 不入公开动态流';

UPDATE `source_items`
SET `is_static_resource` = 1
WHERE LOWER(CONCAT(IFNULL(`title`, ''), ' ', IFNULL(`canonical_url`, '')))
    REGEXP '(terms[-_ ]?of|/terms|privacy|cookie|/careers|careers\.|/about|about-us|about\.html|press-kit|press kit|/support|help[-_ ]?center|help center|discord|/contact|contact[-_ ]?sales|contact sales|/jobs|/legal|/brand|招聘|服务条款|隐私政策|加入我们|品牌规范|文档中心)';

UPDATE `catalog_sources` SET `is_active` = 0 WHERE `source_key` = 'openrouter';
