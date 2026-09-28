-- Keep the exact configured source for each crawled item. Older rows are
-- linked on the next successful crawl of their original feed.
ALTER TABLE `source_items`
    ADD COLUMN `source_id` BIGINT NULL,
    ADD INDEX `idx_source_published` (`source_id`, `published_at`);
