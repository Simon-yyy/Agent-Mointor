-- ===================================================================
-- V28: 静态资源页第三轮回填 (修正 V27 的正则转义笔误)
-- V27 中 blog/\\?$ 在 MySQL 字符串里成为正则 "blog/<字面?>$", 导致博客索引页
-- (如 kimi.com/en/blog/, 标题 "All research") 未被标记; 本轮用 blog/?$ 修正。
-- 只增不减: V26/V27 已标记的行保持不变。
-- ===================================================================

UPDATE `source_items`
SET `is_static_resource` = 1
WHERE `is_static_resource` = 0
  AND LOWER(CONCAT(IFNULL(`title`, ''), ' ', IFNULL(`canonical_url`, '')))
    REGEXP '(guidelines|[-_/]brand|/membership|/academy|/resources/|/products|/community|\\?from=|/en$|blog/?$|/bot$|/business$|//[^/]+/?$)';
