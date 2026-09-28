package com.myblog.backend.aimodel.catalog.adapter;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.myblog.backend.aimodel.catalog.CatalogModelDraft;
import com.myblog.backend.aimodel.catalog.CatalogSourceAdapter;
import com.myblog.backend.aimodel.catalog.identity.ModelIdentityResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * models.dev 目录源主适配器 (方案 §1.1 + §2.1 规范)
 * 正确遍历其 Map<Provider, ProviderDetail> 顶级结构
 */
@Component
public class ModelsDevAdapter implements CatalogSourceAdapter {

    private static final Logger log = LoggerFactory.getLogger(ModelsDevAdapter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ModelIdentityResolver identityResolver;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public ModelsDevAdapter(ModelIdentityResolver identityResolver) {
        this.identityResolver = identityResolver;
    }

    @Override
    public String getSourceKey() {
        return "models_dev";
    }

    @Override
    public List<CatalogModelDraft> fetchCatalogModels() {
        List<CatalogModelDraft> list = new ArrayList<>();
        String url = "https://models.dev/api.json";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", "Agent-Monitor/1.0 (CatalogSync; +https://github.com/Simon-yyy/Agent-Mointor)")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200 && response.body() != null && !response.body().isBlank()) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.isObject()) {
                    var providerFields = root.properties();
                    for (Map.Entry<String, JsonNode> pEntry : providerFields) {
                        String providerKey = pEntry.getKey();
                        JsonNode pNode = pEntry.getValue();
                        String vendorName = pNode.path("name").asText(providerKey);

                        JsonNode modelsNode = pNode.path("models");
                        if (modelsNode != null && modelsNode.isObject()) {
                            var modelFields = modelsNode.properties();
                            for (Map.Entry<String, JsonNode> mEntry : modelFields) {
                                String modelId = mEntry.getKey();
                                JsonNode mNode = mEntry.getValue();
                                CatalogModelDraft draft = parseNode(providerKey, vendorName, modelId, mNode);
                                if (draft != null) {
                                    list.add(draft);
                                }
                            }
                        }
                    }
                }
                log.info("models.dev 全量解析完成，共提取有效模型候选 {} 款", list.size());
            } else {
                log.warn("models.dev 返回状态异常: status={}", response.statusCode());
            }
        } catch (Exception e) {
            log.info("models.dev 远端接口拉取异常 (外网或超时)，保留现有本地权威目录: {}", e.getMessage());
        }
        return list;
    }

    private CatalogModelDraft parseNode(String providerKey, String vendorName, String modelId, JsonNode mNode) {
        if (modelId == null || modelId.isBlank()) return null;
        if (identityResolver.isServiceVariant(modelId)) {
            return null; // 档位守卫过滤
        }

        String name = mNode.path("name").asText(modelId);
        String contextStr = null;
        JsonNode limitNode = mNode.path("limit");
        if (limitNode.isObject() && limitNode.has("context")) {
            long ctx = limitNode.path("context").asLong();
            if (ctx > 0) {
                contextStr = (ctx >= 1000) ? (ctx / 1000 + "K") : String.valueOf(ctx);
            }
        }

        // 提取发布日期
        String releaseDate = mNode.path("release_date").asText(null);

        // 提取模态
        List<String> mods = new ArrayList<>();
        JsonNode modInput = mNode.path("modalities").path("input");
        if (modInput.isArray()) {
            for (JsonNode in : modInput) {
                String text = in.asText();
                if ("text".equalsIgnoreCase(text)) mods.add("文本");
                else if ("image".equalsIgnoreCase(text)) mods.add("视觉");
                else if ("audio".equalsIgnoreCase(text)) mods.add("语音");
            }
        }
        if (mods.isEmpty()) mods.add("文本");
        String modalityStr = String.join(",", mods);

        CatalogModelDraft draft = new CatalogModelDraft(modelId, vendorName, name, contextStr, modalityStr, mNode.toString());
        draft.setReleaseDate(releaseDate);

        // 提取定价 ($/M token)
        JsonNode costNode = mNode.path("cost");
        if (costNode.isObject()) {
            draft.setPricingInputPerM(parsePrice(costNode.path("input")));
            draft.setPricingOutputPerM(parsePrice(costNode.path("output")));
            draft.setPricingCachedPerM(parsePrice(costNode.path("cache_read")));
        }

        return draft;
    }

    private BigDecimal parsePrice(JsonNode pNode) {
        if (pNode == null || pNode.isMissingNode() || pNode.isNull()) return null;
        try {
            if (pNode.isNumber()) {
                double val = pNode.asDouble();
                if (val > 0) {
                    return BigDecimal.valueOf(val).setScale(4, BigDecimal.ROUND_HALF_UP);
                }
            } else if (pNode.isTextual()) {
                String str = pNode.asText().trim();
                if (!str.isBlank()) {
                    double val = Double.parseDouble(str);
                    if (val > 0) {
                        return BigDecimal.valueOf(val).setScale(4, BigDecimal.ROUND_HALF_UP);
                    }
                }
            }
        } catch (Exception ignored) {}
        return null;
    }
}
