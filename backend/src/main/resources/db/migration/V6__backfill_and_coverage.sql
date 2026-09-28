-- V6: 历史回填持久化、月份覆盖审计与扩充厂商官方信源

-- 1. 历史回填任务表
CREATE TABLE IF NOT EXISTS `backfill_jobs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `job_id` VARCHAR(64) NOT NULL UNIQUE,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `dry_run` TINYINT(1) NOT NULL DEFAULT 1,
    `status` VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
    `sources_processed` INT NOT NULL DEFAULT 0,
    `candidates_found` INT NOT NULL DEFAULT 0,
    `confirmed_events` INT NOT NULL DEFAULT 0,
    `coverage_gaps_json` TEXT NULL,
    `logs_json` TEXT NULL,
    `start_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `end_time` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_job_status` (`status`),
    INDEX `idx_job_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 厂商月份覆盖审计表 (2026 年起)
CREATE TABLE IF NOT EXISTS `source_coverage` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `vendor_id` BIGINT NOT NULL,
    `coverage_month` VARCHAR(7) NOT NULL COMMENT '格式: YYYY-MM',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PARTIAL' COMMENT 'FULL: 已扫完, PARTIAL: 部分覆盖, NONE: 无可用归档',
    `sources_scanned` INT NOT NULL DEFAULT 0,
    `earliest_item_date` DATE NULL,
    `latest_item_date` DATE NULL,
    `candidates_count` INT NOT NULL DEFAULT 0,
    `gap_notes` VARCHAR(500) NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_vendor_month` (`vendor_id`, `coverage_month`),
    INDEX `idx_coverage_month` (`coverage_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 扩充厂商官方信源 (遵循方案 6.1.1 节清单)
INSERT INTO `model_sources` (`vendor_id`, `source_url`, `source_type`, `is_active`, `last_error`, `failure_count`, `created_at`)
VALUES
    (5, 'https://api-docs.deepseek.com/updates/', 'HTML_SCRAPE', 1, NULL, 0, NOW(3)),
    (6, 'https://qwen.ai/blog', 'HTML_SCRAPE', 1, NULL, 0, NOW(3)),
    (7, 'https://x.ai/news', 'HTML_SCRAPE', 1, NULL, 0, NOW(3)),
    (12, 'https://docs.cohere.com/v1/changelog', 'HTML_SCRAPE', 1, NULL, 0, NOW(3)),
    (15, 'https://www.volcengine.com/docs/82379/?lang=zh', 'HTML_SCRAPE', 1, NULL, 0, NOW(3)),
    (16, 'https://cloud.baidu.com/news/news', 'HTML_SCRAPE', 1, NULL, 0, NOW(3)),
    (17, 'https://www.tencent.com/zh-cn/newsroom/all-news/', 'HTML_SCRAPE', 1, NULL, 0, NOW(3)),
    (18, 'https://www.zhipuai.cn/zh/news', 'HTML_SCRAPE', 1, NULL, 0, NOW(3)),
    (19, 'https://www.kimi.com/news/', 'HTML_SCRAPE', 1, NULL, 0, NOW(3))
ON DUPLICATE KEY UPDATE `is_active` = 1;
