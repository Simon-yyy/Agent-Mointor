-- ===================================================================
-- V27: 静态资源页特征补充回填 (追加 17 首轮 V26 之后的运行流残留)
-- 新增特征: 品牌指南 / 会员定价 / 学院教程 / 资源中心教程 / 产品导航页 /
--           裸域名首页 / ?from= 导航参数链接
-- 已被 V26 标记的行保持不变 (只增不减); 真实技术博客 (/blog/<slug>) 不受影响
-- ===================================================================

UPDATE `source_items`
SET `is_static_resource` = 1
WHERE `is_static_resource` = 0
  AND LOWER(CONCAT(IFNULL(`title`, ''), ' ', IFNULL(`canonical_url`, '')))
    REGEXP '(guidelines|[-_/]brand|/membership|/academy|/resources/|/products|/community|\\?from=|/en$|blog/\\?$|/bot$|/business$|//[^/]+/?$)';
