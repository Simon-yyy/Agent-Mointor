package com.myblog.backend.aimodel.catalog.merge;

import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * 字段级多源仲裁与转正服务 (方案阶段 2 落地)
 * 职责：
 * 1. 逐字段仲裁（发布日期 min + 60天护栏、高精度定价归一、模态非空首选）
 * 2. 字段血缘事实 (model_facts) 与快照 (facts_provenance) 写入
 * 3. 冲突与日期变动进审核队列 (catalog_conflicts)
 * 4. 厂商自动发现注册 (vendor_aliases + model_vendors)
 * 5. 暂存模型自动建卡转正 (AUTO_PUBLISHED)
 */
@Component
public class ModelFactMerger {

    private static final Logger log = LoggerFactory.getLogger(ModelFactMerger.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final com.myblog.backend.aimodel.catalog.identity.ModelIdentityResolver identityResolver;

    // 已知推理托管商/云服务平台（不建厂商卡，作为托管途径处理）
    private static final Set<String> HOSTING_PROVIDERS = new HashSet<>(Arrays.asList(
            "deepinfra", "together", "fireworks", "groq", "siliconflow", "lepton", "openrouter", "replicate",
            "digitalocean", "cloudflare", "vultr", "novita", "hyperbolic", "cerebras", "sambanova",
            "anyscale", "scaleway", "crusoe", "hugging face", "vertex", "amazon bedrock", "oci generative ai",
            "siliconflow (china)", "deep infra", "deepinfra (china)", "aliyun", "tencent cloud", "baidu cloud"
    ));

    public ModelFactMerger(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper,
                           com.myblog.backend.aimodel.catalog.identity.ModelIdentityResolver identityResolver) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        this.identityResolver = identityResolver;
    }

    /**
     * 自动解析或注册厂商 (方案 §4.9 厂商自动发现与三级分层)
     */
    public Long resolveOrRegisterVendor(Long sourceId, String rawVendor, String upstreamModelId) {
        if (rawVendor == null || rawVendor.isBlank()) {
            return null;
        }

        String vendorKey = rawVendor.trim().toLowerCase(Locale.ROOT);
        // 过滤已知纯托管商 / 云服务平台
        if (HOSTING_PROVIDERS.contains(vendorKey)) {
            return null;
        }

        // 1. 优先查 vendor_aliases
        List<Long> aliased = jdbcTemplate.query(
                "SELECT vendor_id FROM `vendor_aliases` WHERE `source_id` = ? AND `upstream_vendor_id` = ? LIMIT 1",
                (rs, rowNum) -> rs.getLong("vendor_id"),
                sourceId, vendorKey
        );
        if (!aliased.isEmpty()) {
            return aliased.get(0);
        }

        // 2. 检查已知主厂商归一化别名映射（防止 Alibaba (China) 等分支分化出幽灵厂商）
        Long normalizedId = getKnownRootVendorId(vendorKey);
        if (normalizedId != null) {
            try {
                jdbcTemplate.update(
                        "INSERT INTO `vendor_aliases` (`source_id`, `upstream_vendor_id`, `vendor_id`, `is_primary`, `created_at`) VALUES (?, ?, ?, 1, NOW(3))",
                        sourceId, vendorKey, normalizedId
                );
            } catch (Exception ignored) {}
            return normalizedId;
        }

        // 3. 查本地已有 model_vendors (按 slug 或 name)
        List<Long> existing = jdbcTemplate.query(
                "SELECT id FROM `model_vendors` WHERE LOWER(`slug`) = ? OR LOWER(`name`) = ? LIMIT 1",
                (rs, rowNum) -> rs.getLong("id"),
                vendorKey, vendorKey
        );
        if (!existing.isEmpty()) {
            Long vId = existing.get(0);
            try {
                jdbcTemplate.update(
                        "INSERT INTO `vendor_aliases` (`source_id`, `upstream_vendor_id`, `vendor_id`, `is_primary`, `created_at`) VALUES (?, ?, ?, 1, NOW(3))",
                        sourceId, vendorKey, vId
                );
            } catch (Exception ignored) {}
            return vId;
        }

        // 4. 确认为新厂商 -> 自动建卡 (status=PENDING, tier=T2, auto_registered=1)
        try {
            String color = String.format("#%06x", (vendorKey.hashCode() & 0x00FFFFFF));
            String region = isChineseVendorKey(vendorKey) ? "中国" : "海外";
            jdbcTemplate.update(
                    "INSERT INTO `model_vendors` (`name`, `slug`, `region`, `brand_color`, `tier`, `auto_registered`, `status`, `created_at`) " +
                            "VALUES (?, ?, ?, ?, 'T2', 1, 'PENDING', NOW(3))",
                    rawVendor, vendorKey, region, color
            );
            Long newVendorId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
            jdbcTemplate.update(
                    "INSERT INTO `vendor_aliases` (`source_id`, `upstream_vendor_id`, `vendor_id`, `is_primary`, `created_at`) VALUES (?, ?, ?, 1, NOW(3))",
                    sourceId, vendorKey, newVendorId
            );
            log.info("目录自动发现并注册新厂商: vendorName={}, vendorId={}, region={}", rawVendor, newVendorId, region);
            return newVendorId;
        } catch (Exception e) {
            log.warn("注册新厂商异常: vendorKey={}, err={}", vendorKey, e.getMessage());
            return null;
        }
    }

    private Long getKnownRootVendorId(String vendorKey) {
        if (vendorKey.contains("alibaba") || vendorKey.contains("aliyun") || vendorKey.contains("qwen")) return 6L;
        if (vendorKey.contains("deepseek")) return 5L;
        if (vendorKey.contains("openai")) return 1L;
        if (vendorKey.contains("anthropic")) return 2L;
        if (vendorKey.contains("google")) return 3L;
        if (vendorKey.contains("meta")) return 4L;
        if (vendorKey.contains("zhipu") || vendorKey.contains("glm") || vendorKey.contains("bigmodel")) return 18L;
        if (vendorKey.contains("moonshot") || vendorKey.contains("kimi")) return 19L;
        if (vendorKey.contains("bytedance") || vendorKey.contains("doubao")) return 15L;
        if (vendorKey.contains("baidu") || vendorKey.contains("ernie")) return 16L;
        if (vendorKey.contains("tencent") || vendorKey.contains("hunyuan")) return 17L;
        if (vendorKey.contains("minimax")) return 20L;
        if (vendorKey.contains("mistral")) return 11L;
        if (vendorKey.contains("xai") || vendorKey.contains("grok")) return 7L;
        return null;
    }

    private boolean isChineseVendorKey(String vendorKey) {
        return vendorKey.contains("china") || vendorKey.contains("chinese") || vendorKey.contains("ali")
                || vendorKey.contains("deepseek") || vendorKey.contains("zhipu") || vendorKey.contains("baidu")
                || vendorKey.contains("tencent") || vendorKey.contains("bytedance") || vendorKey.contains("moonshot")
                || vendorKey.contains("minimax") || vendorKey.contains("baichuan") || vendorKey.contains("stepfun");
    }

    /**
     * 自动建卡并转正 (未匹配但高置信的主源模型转为正式模型)
     * 追加 19 修复: 新卡必须带上游 release_date 并落入真实日期精度,
     * 无日期时精度标 unknown, 不得默认声称 day。
     */
    public Long createAndPublishModel(Long vendorId, String upstreamModelId, String rawName, String contextLength,
                                      String modality, BigDecimal inputPrice, BigDecimal outputPrice, String sourceKey,
                                      String releaseDate) {
        if (upstreamModelId == null || rawName == null) return null;

        // CODE_REVIEW 追加 30 拦截：禁止将第三方滚动路由别名（*-latest）作为原厂独立模型建卡
        if (identityResolver.isThirdPartyRollingAlias(upstreamModelId) || identityResolver.isThirdPartyRollingAlias(rawName)) {
            log.info("【目录仲裁】过滤第三方滚动路由别名，跳过模型建卡: upstreamModelId={}, rawName={}", upstreamModelId, rawName);
            return null;
        }

        // 优先使用真实研发原厂推断结果
        Long rootVendorId = identityResolver.inferRootVendorId(rawName, upstreamModelId, null);
        Long effectiveVendorId = rootVendorId != null ? rootVendorId : vendorId;
        if (effectiveVendorId == null) {
            log.warn("无法确定模型归属原厂，跳过自动建卡: rawName={}, upstreamModelId={}", rawName, upstreamModelId);
            return null;
        }

        String modelKey = upstreamModelId.toLowerCase(Locale.ROOT).replace("/", "-");
        try {
            String modStr = (modality != null && !modality.isBlank()) ? modality : "文本";
            // 日期精度按原始值形态判定: YYYY-MM -> month, YYYY-MM-DD -> day, 缺失 -> unknown
            String dateVal = (releaseDate != null && !releaseDate.isBlank()) ? releaseDate : null;
            String precision = dateVal == null ? "unknown" : (dateVal.length() == 7 ? "month" : "day");
            // CODE_REVIEW 追加 38/39 铁律: 第三方上游仅作发现线索，建卡后置为 PENDING_REVIEW 待审；
            // 第三方声称的日期仅作为 facts 存证，official_release_date 必须留空待官方原文核实，杜绝假阳性
            jdbcTemplate.update(
                    "INSERT INTO `ai_models` (`vendor_id`, `model_key`, `display_name`, `series`, `version`, `context_window`, " +
                            "`modalities`, `pricing_input_per_m`, `pricing_output_per_m`, `official_release_date`, " +
                            "`release_date_precision`, `catalog_status`, `created_at`) " +
                            "VALUES (?, ?, ?, ?, '1.0', ?, ?, ?, ?, NULL, 'unknown', 'PENDING_REVIEW', NOW(3))",
                    effectiveVendorId, modelKey, rawName, rawName, contextLength, modStr, inputPrice, outputPrice
            );
            Long newModelId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
            if (dateVal != null) {
                recordFact(newModelId, "upstreamClaimedDate", dateVal, precision, null, sourceUrlOf(sourceKey));
            }
            log.info("目录管线候选模型录入待审成功: modelKey={}, modelId={}, effectiveVendorId={}, upstreamDate={}",
                    modelKey, newModelId, effectiveVendorId, dateVal);
            return newModelId;
        } catch (Exception e) {
            log.warn("自动建卡转正失败: modelKey={}, err={}", modelKey, e.getMessage());
            return null;
        }
    }

    /**
     * 对已有模型执行字段级仲裁与更新
     */
    public void arbitrateAndUpdate(Long modelId, Long sourceId, String sourceKey, String newReleaseDate,
                                   String contextLength, String modality, BigDecimal inputPrice,
                                   BigDecimal outputPrice, BigDecimal cachedPrice) {
        if (modelId == null) return;
        // 追加 25: 血缘必须是可打开的证据链接, 不能把源键字面量当 source_url
        String sourceUrl = sourceUrlOf(sourceKey);

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT official_release_date, context_window, modalities, pricing_input_per_m, pricing_output_per_m, " +
                        "pricing_cached_per_m, catalog_status, facts_provenance FROM `ai_models` WHERE id = ?", modelId);
        if (rows.isEmpty()) {
            log.warn("无法找到目标模型，跳过字段仲裁: modelId={}", modelId);
            return;
        }
        Map<String, Object> current = rows.get(0);

        Map<String, String> provenance = new HashMap<>();
        String provJson = (String) current.get("facts_provenance");
        if (provJson != null && !provJson.isBlank()) {
            try {
                provenance = objectMapper.readValue(provJson, Map.class);
            } catch (Exception ignored) {}
        }

        // 1. 发布日期仲裁: 取 min + 60 天护栏；已存在的 MANUAL 发布日期变动进冲突待审
        String curDateStr = (String) current.get("official_release_date");
        String finalDate = curDateStr;
        if (newReleaseDate != null && !newReleaseDate.isBlank()) {
            if (curDateStr == null || curDateStr.isBlank()) {
                finalDate = newReleaseDate;
                recordFact(modelId, "releaseDate", finalDate, "day", sourceId, sourceUrl);
                provenance.put("releaseDate", sourceKey);
            } else {
                try {
                    LocalDate curDate = LocalDate.parse(curDateStr);
                    LocalDate newDate = LocalDate.parse(newReleaseDate);
                    long daysDiff = ChronoUnit.DAYS.between(newDate, curDate);

                    // 异常护栏：新日期比已有早 >60 天，或已有为 MANUAL 且日期不同，进入冲突待审
                    if (Math.abs(daysDiff) > 60 || "MANUAL".equals(current.get("catalog_status"))) {
                        if (!curDate.equals(newDate)) {
                            recordConflict(modelId, "official_release_date", curDateStr, newReleaseDate, sourceId, "DATE_CHANGED");
                        }
                    } else if (newDate.isBefore(curDate)) {
                        finalDate = newReleaseDate;
                        recordFact(modelId, "releaseDate", finalDate, "day", sourceId, sourceUrl);
                        provenance.put("releaseDate", sourceKey);
                    }
                } catch (Exception ignored) {}
            }
        }

        // 2. 定价仲裁: 归一 $/M token，优先采纳非空
        BigDecimal curIn = (BigDecimal) current.get("pricing_input_per_m");
        BigDecimal curOut = (BigDecimal) current.get("pricing_output_per_m");
        BigDecimal curCache = (BigDecimal) current.get("pricing_cached_per_m");

        BigDecimal finalIn = curIn != null ? curIn : inputPrice;
        BigDecimal finalOut = curOut != null ? curOut : outputPrice;
        BigDecimal finalCache = curCache != null ? curCache : cachedPrice;

        if (inputPrice != null && curIn == null) {
            recordFact(modelId, "pricing.inputPerMTok", inputPrice.toString(), "USD/MTok", sourceId, sourceUrl);
            provenance.put("pricing.input", sourceKey);
        }
        if (outputPrice != null && curOut == null) {
            recordFact(modelId, "pricing.outputPerMTok", outputPrice.toString(), "USD/MTok", sourceId, sourceUrl);
            provenance.put("pricing.output", sourceKey);
        }

        // 3. 上下文窗口: 缺则补，不覆盖非空
        String curCtx = (String) current.get("context_window");
        String finalCtx = curCtx;
        if ((curCtx == null || curCtx.isBlank()) && contextLength != null && !contextLength.isBlank()) {
            finalCtx = contextLength;
            recordFact(modelId, "contextWindow", finalCtx, "tokens", sourceId, sourceKey);
            provenance.put("contextWindow", sourceKey);
        }

        // 4. 模态: 缺则补
        String curMod = (String) current.get("modalities");
        String finalMod = curMod;
        if ((curMod == null || curMod.isBlank()) && modality != null && !modality.isBlank()) {
            finalMod = modality;
            recordFact(modelId, "modalities", finalMod, null, sourceId, sourceKey);
            provenance.put("modalities", sourceKey);
        }

        // 写回 ai_models 冗余列与 provenance JSON
        try {
            String updatedProvJson = objectMapper.writeValueAsString(provenance);
            jdbcTemplate.update(
                    "UPDATE `ai_models` SET `official_release_date` = ?, `context_window` = ?, `modalities` = ?, " +
                            "`pricing_input_per_m` = ?, `pricing_output_per_m` = ?, `pricing_cached_per_m` = ?, `facts_provenance` = ? WHERE `id` = ?",
                    finalDate, finalCtx, finalMod, finalIn, finalOut, finalCache, updatedProvJson, modelId
            );
        } catch (Exception e) {
            log.warn("更新仲裁结果失败: modelId={}, err={}", modelId, e.getMessage());
        }
    }

    /**
     * 目录源键 -> 可打开的证据链接 (追加 25: model_facts.source_url 不得存字面量源键)
     */
    public static String sourceUrlOf(String sourceKey) {
        if (sourceKey == null) return null;
        return switch (sourceKey) {
            case "models_dev" -> "https://models.dev/";
            case "epoch_ai_benchmark" -> "https://epoch.ai/data";
            default -> null;
        };
    }

    private void recordFact(Long modelId, String fieldKey, String value, String unit, Long sourceId, String sourceUrl) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO `model_facts` (`model_id`, `field_key`, `field_value`, `unit`, `source_id`, `source_url`, `observed_at`, `confidence`, `status`, `created_at`) " +
                            "VALUES (?, ?, ?, ?, ?, ?, NOW(3), 'exact', 'ACTIVE', NOW(3))",
                    modelId, fieldKey, value, unit, sourceId, sourceUrl
            );
        } catch (Exception ignored) {}
    }

    private void recordConflict(Long modelId, String fieldKey, String currentVal, String incomingVal, Long sourceId, String reason) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO `catalog_conflicts` (`model_id`, `field_key`, `current_value`, `incoming_value`, `incoming_source_id`, `reason`, `status`, `created_at`) " +
                            "VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW(3))",
                    modelId, fieldKey, currentVal, incomingVal, sourceId, reason
            );
            log.warn("检测到目录字段冲突并排入待审: modelId={}, field={}, cur={}, incoming={}", modelId, fieldKey, currentVal, incomingVal);
        } catch (Exception ignored) {}
    }
}
