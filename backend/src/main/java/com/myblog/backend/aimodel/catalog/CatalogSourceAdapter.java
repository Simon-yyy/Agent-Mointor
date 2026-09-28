package com.myblog.backend.aimodel.catalog;

import java.util.List;

/**
 * 上游模型目录适配器规范 (CODE_REVIEW 追加 15)
 */
public interface CatalogSourceAdapter {

    /**
     * 源唯一标识，如 models_dev, openrouter
     */
    String getSourceKey();

    /**
     * 从上游拉取并归一化模型草稿列表
     */
    List<CatalogModelDraft> fetchCatalogModels();

    /**
     * 判断上游 ID 是否属于需要被过滤的端点别名或速度档位 (-fast, -free, -batch 等)
     */
    default boolean isEndpointOrVariant(String upstreamModelId) {
        if (upstreamModelId == null) return false;
        String lower = upstreamModelId.toLowerCase();
        return lower.endsWith("-fast") || lower.endsWith(":fast")
                || lower.endsWith("-free") || lower.endsWith(":free")
                || lower.endsWith("-batch") || lower.endsWith(":batch")
                || lower.endsWith("-exact") || lower.contains("/moderation")
                || lower.contains("/embeddings") || lower.contains("-embed");
    }
}
