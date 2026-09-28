-- ==============================================================================
-- Flyway V23: 模型数据管线闭环 (字段级事实、多源仲裁、冲突队列与厂商自动归并)
-- 满足方案阶段 0 ~ 阶段 3 要求：
-- 1. 新建 model_facts (字段级事实与血缘 provenance)
-- 2. 新建 catalog_conflicts (冲突待审队列)
-- 3. 新建 vendor_aliases (厂商自动归并别名表)
-- 4. 扩展 model_aliases, model_vendors, ai_models, catalog_sync_runs
-- 5. 阶段 0 止血：停用 openrouter 假源，标记现有模型为 MANUAL
-- ==============================================================================

-- 1. 字段级事实与血缘表 (model_facts)
CREATE TABLE IF NOT EXISTS `model_facts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `model_id` BIGINT NOT NULL COMMENT '关联核心模型 ai_models.id',
    `field_key` VARCHAR(64) NOT NULL COMMENT '字段键名，如 pricing.outputPerMTok, contextWindow, releaseDate',
    `field_value` TEXT NULL COMMENT '字段值',
    `unit` VARCHAR(20) NULL COMMENT '量纲单位，如 USD/MTok, tokens, pct, elo',
    `source_id` BIGINT NULL COMMENT '来源 catalog_sources.id',
    `source_url` VARCHAR(512) NULL COMMENT '来源可信外链',
    `observed_at` DATETIME(3) NULL COMMENT '观察/拉取时间戳',
    `confidence` VARCHAR(20) NOT NULL DEFAULT 'exact' COMMENT '置信度: exact, estimated, unknown',
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, SUPERSEDED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `idx_facts_model_field` (`model_id`, `field_key`),
    INDEX `idx_facts_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型字段级事实与多源血缘记录';

-- 2. 目录数据冲突与异常待审队列 (catalog_conflicts)
CREATE TABLE IF NOT EXISTS `catalog_conflicts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `model_id` BIGINT NULL COMMENT '命中模型 ID（新发现模型可能为空）',
    `field_key` VARCHAR(64) NOT NULL COMMENT '冲突字段，如 official_release_date, name_clash',
    `current_value` TEXT NULL COMMENT '本地已存在权威值',
    `incoming_value` TEXT NULL COMMENT '上游同步传入的新值',
    `incoming_source_id` BIGINT NULL COMMENT '传入源 ID',
    `reason` VARCHAR(64) NOT NULL COMMENT '冲突原因: DATE_CHANGED, NAME_CLASH, VALUE_OUTLIER, MULTI_VENDOR_COLLISION',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, RESOLVED_KEEP, RESOLVED_TAKE, IGNORED',
    `decided_by` VARCHAR(64) NULL COMMENT '处置管理员',
    `decided_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `idx_conflicts_status` (`status`),
    INDEX `idx_conflicts_model` (`model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型目录数据冲突与异常待审队列';

-- 3. 厂商自动归并别名表 (vendor_aliases)
CREATE TABLE IF NOT EXISTS `vendor_aliases` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `source_id` BIGINT NOT NULL COMMENT '关联 catalog_sources.id',
    `upstream_vendor_id` VARCHAR(128) NOT NULL COMMENT '上游返回的厂商标识/slug',
    `vendor_id` BIGINT NOT NULL COMMENT '本地核心厂商 model_vendors.id',
    `alias_type` VARCHAR(32) NOT NULL DEFAULT 'UPSTREAM_ID' COMMENT 'UPSTREAM_ID, SLUG_ALIAS',
    `is_primary` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY `uk_source_upstream_vendor` (`source_id`, `upstream_vendor_id`),
    INDEX `idx_vendor_alias_vendor` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='厂商上游标识自动归并映射表';

-- 4. model_aliases 增加自动化标识 is_auto
ALTER TABLE `model_aliases` ADD COLUMN `is_auto` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为系统自动沉淀别名';

-- 5. model_vendors 扩展分层与自动发现字段
ALTER TABLE `model_vendors` 
    ADD COLUMN `tier` VARCHAR(10) NOT NULL DEFAULT 'T2' COMMENT '厂商层级: T1精养, T2目录收录, T3待定',
    ADD COLUMN `auto_registered` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为目录同步自动注册',
    ADD COLUMN `upstream_ids` JSON NULL COMMENT '各源上游标识快照',
    ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, PENDING';

-- 6. ai_models 扩展精度、血缘快照、定价与目录转正状态
ALTER TABLE `ai_models`
    ADD COLUMN `release_date_precision` VARCHAR(16) NOT NULL DEFAULT 'day' COMMENT '日期精度: day, month, year',
    ADD COLUMN `facts_provenance` JSON NULL COMMENT '字段级血缘映射快照 {"contextWindow":"models.dev",...}',
    ADD COLUMN `pricing_input_per_m` DECIMAL(10,4) NULL COMMENT '输入定价 $/M token',
    ADD COLUMN `pricing_output_per_m` DECIMAL(10,4) NULL COMMENT '输出定价 $/M token',
    ADD COLUMN `pricing_cached_per_m` DECIMAL(10,4) NULL COMMENT '缓存输入定价 $/M token',
    ADD COLUMN `modalities_input` VARCHAR(200) NULL COMMENT '结构化输入模态',
    ADD COLUMN `modalities_output` VARCHAR(200) NULL COMMENT '结构化输出模态',
    ADD COLUMN `catalog_status` VARCHAR(20) NOT NULL DEFAULT 'MANUAL' COMMENT 'MANUAL, AUTO_PUBLISHED, PENDING_REVIEW';

-- 7. catalog_sync_runs 扩展阻断原因与全量 SyncReport 快照
ALTER TABLE `catalog_sync_runs`
    ADD COLUMN `blocked_reason` VARCHAR(512) NULL COMMENT '闸门拦截原因',
    ADD COLUMN `sync_report_json` JSON NULL COMMENT '包含指标度量、覆盖率和口径的统一报告';

-- 8. 阶段 0 止血：停用 openrouter 假源配置
UPDATE `catalog_sources` SET `is_active` = 0 WHERE `source_key` = 'openrouter';

-- 9. 现有头部 20 家厂商标记为 T1 精养，现有 69 款模型标记为 MANUAL
UPDATE `model_vendors` SET `tier` = 'T1' WHERE `id` <= 20;
UPDATE `ai_models` SET `catalog_status` = 'MANUAL' WHERE `catalog_status` = 'MANUAL' OR `catalog_status` IS NULL;
