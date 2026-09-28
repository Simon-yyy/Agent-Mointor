-- ===================================================================
-- V1__init_schema.sql: AI 模型动态监控站与博客初始数据库 Schema (MySQL 8)
-- ===================================================================

-- 1. 博客文章表
CREATE TABLE IF NOT EXISTS `articles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `summary` VARCHAR(1000) DEFAULT NULL,
    `content_md` LONGTEXT NOT NULL,
    `cover_url` VARCHAR(500) DEFAULT NULL,
    `category` VARCHAR(100) DEFAULT NULL,
    `tags` VARCHAR(500) DEFAULT NULL,
    `status` INT NOT NULL DEFAULT 1,
    `views` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 博客作品表
CREATE TABLE IF NOT EXISTS `works` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(1000) DEFAULT NULL,
    `cover_url` VARCHAR(500) DEFAULT NULL,
    `demo_url` VARCHAR(500) DEFAULT NULL,
    `github_url` VARCHAR(500) DEFAULT NULL,
    `tech_stack` VARCHAR(500) DEFAULT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. AI 厂商元数据表 (首批 20 家)
CREATE TABLE IF NOT EXISTS `model_vendors` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `region` VARCHAR(50) DEFAULT '全球',
    `brand_color` VARCHAR(30) DEFAULT '#3b82f6',
    `website_url` VARCHAR(500) DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 厂商官方来源配置表
CREATE TABLE IF NOT EXISTS `model_sources` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `vendor_id` BIGINT NOT NULL,
    `source_url` VARCHAR(1000) NOT NULL,
    `source_type` VARCHAR(50) NOT NULL DEFAULT 'RSS',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `etag` VARCHAR(255) DEFAULT NULL,
    `last_modified` VARCHAR(255) DEFAULT NULL,
    `last_success_time` DATETIME(3) DEFAULT NULL,
    `next_check_time` DATETIME(3) DEFAULT NULL,
    `failure_count` INT NOT NULL DEFAULT 0,
    `last_error` VARCHAR(1000) DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL,
    INDEX `idx_vendor_source` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 采集候选条目表
CREATE TABLE IF NOT EXISTS `source_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `canonical_url` VARCHAR(768) NOT NULL UNIQUE,
    `vendor_id` BIGINT NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `raw_summary` TEXT DEFAULT NULL,
    `published_at` DATETIME(3) DEFAULT NULL,
    `first_seen_at` DATETIME(3) NOT NULL,
    `content_fingerprint` VARCHAR(128) DEFAULT NULL,
    `process_status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL,
    INDEX `idx_vendor_status` (`vendor_id`, `process_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. AI 模型档案表
CREATE TABLE IF NOT EXISTS `ai_models` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `vendor_id` BIGINT NOT NULL,
    `model_key` VARCHAR(100) NOT NULL,
    `display_name` VARCHAR(150) NOT NULL,
    `series` VARCHAR(100) DEFAULT NULL,
    `version` VARCHAR(50) DEFAULT NULL,
    `modalities` VARCHAR(255) DEFAULT '文本',
    `availability_status` VARCHAR(50) NOT NULL DEFAULT 'PROD',
    `created_at` DATETIME(3) NOT NULL,
    UNIQUE KEY `uk_vendor_model` (`vendor_id`, `model_key`),
    INDEX `idx_series` (`series`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 模型发布事件表
CREATE TABLE IF NOT EXISTS `model_events` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `model_id` BIGINT NOT NULL,
    `vendor_id` BIGINT NOT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `stage` VARCHAR(50) DEFAULT '正式发布',
    `summary` TEXT NOT NULL,
    `release_date` DATE DEFAULT NULL,
    `date_precision` VARCHAR(30) NOT NULL DEFAULT 'EXACT',
    `first_seen_at` DATETIME(3) NOT NULL,
    `review_status` VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    `dedup_key` VARCHAR(191) NOT NULL UNIQUE,
    `created_at` DATETIME(3) NOT NULL,
    INDEX `idx_vendor_date` (`vendor_id`, `release_date`),
    INDEX `idx_model_date` (`model_id`, `release_date`),
    INDEX `idx_first_seen` (`first_seen_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 事件证据链表
CREATE TABLE IF NOT EXISTS `event_evidence` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `event_id` BIGINT NOT NULL,
    `source_item_id` BIGINT DEFAULT NULL,
    `official_url` VARCHAR(1000) NOT NULL,
    `title` VARCHAR(500) DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL,
    INDEX `idx_event_evidence` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. 采集审计日志表
CREATE TABLE IF NOT EXISTS `crawl_runs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) DEFAULT NULL,
    `sources_checked` INT NOT NULL DEFAULT 0,
    `sources_succeeded` INT NOT NULL DEFAULT 0,
    `sources_failed` INT NOT NULL DEFAULT 0,
    `new_events_found` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    `error_message` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
