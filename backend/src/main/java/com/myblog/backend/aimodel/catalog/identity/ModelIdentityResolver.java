package com.myblog.backend.aimodel.catalog.identity;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * 模型身份与别名自动化解析器 (方案阶段 1 落地)
 * 职责：
 * 1. 阶梯匹配（别名表 -> 剥服务档位后缀 -> 厂商+规范名称）
 * 2. 档位后缀守卫（过滤 -fast/-flex/-xhigh 等计费/推理分身）
 * 3. 别名自动沉淀（命中后自动回填 model_aliases，免人工维护）
 */
@Component
public class ModelIdentityResolver {

    private static final Logger log = LoggerFactory.getLogger(ModelIdentityResolver.class);

    private final JdbcTemplate jdbcTemplate;

    // 需剥离并守卫的纯服务/推理档位后缀（刻意保留 -medium 和 -pro 等真实型号）
    private static final List<String> VARIANT_SUFFIXES = Arrays.asList(
            "-fast", ":fast", "-free", ":free", "-flex", ":flex",
            "-priority", ":priority", "-batch", ":batch",
            "-xhigh", "-high", "-low"
    );

    private static final Pattern NORMALIZE_PATTERN = Pattern.compile("[^a-z0-9]");

    public ModelIdentityResolver(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * 判断上游 ID 是否属于可合并或需过滤的纯计费/服务档位
     */
    public boolean isServiceVariant(String upstreamModelId) {
        if (upstreamModelId == null || upstreamModelId.isBlank()) return false;
        String lower = upstreamModelId.toLowerCase(Locale.ROOT);
        for (String suffix : VARIANT_SUFFIXES) {
            if (lower.endsWith(suffix)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断是否属于第三方服务商/聚合平台的滚动路由别名 (CODE_REVIEW 追加 30)
     * 例如 deepseek-pro-latest, deepseek-flash-latest, *-latest
     * 严禁作为研发原厂的新规范模型自动建卡
     */
    public boolean isThirdPartyRollingAlias(String upstreamModelId) {
        if (upstreamModelId == null || upstreamModelId.isBlank()) return false;
        String lower = upstreamModelId.toLowerCase(Locale.ROOT).trim();
        return lower.endsWith("-latest") || lower.endsWith(":latest") || lower.endsWith("/latest")
                || lower.endsWith(".latest") || lower.contains("-latest-") || lower.endsWith(" latest");
    }

    /**
     * 剥除服务档位后缀，获取核心基准 ID
     */
    public String stripVariantSuffix(String upstreamModelId) {
        if (upstreamModelId == null) return null;
        String result = upstreamModelId;
        String lower = upstreamModelId.toLowerCase(Locale.ROOT);
        for (String suffix : VARIANT_SUFFIXES) {
            if (lower.endsWith(suffix)) {
                return result.substring(0, result.length() - suffix.length());
            }
        }
        return result;
    }

    /**
     * 智能识别模型研发真原厂（Root Creator Detection）
     * 解决上游托管商（如 DigitalOcean、Deep Infra、SiliconFlow、百炼等）导致模型张冠李戴的问题
     */
    public Long inferRootVendorId(String rawName, String modelKey, String rawVendor) {
        String combined = ((rawName != null ? rawName : "") + " " + (modelKey != null ? modelKey : "")).toLowerCase(Locale.ROOT);

        // 1. Anthropic (Claude 系列) -> id=2
        if (combined.contains("claude")) {
            return 2L;
        }
        // 2. Alibaba 阿里通义 (Qwen, Tongyi, Wan/Wanx 万相) -> id=6
        if (combined.contains("qwen") || combined.contains("tongyi") || combined.contains("wan2.") || combined.contains("wanx")) {
            return 6L;
        }
        // 3. DeepSeek 深度求索 (DeepSeek 系列，包括开源蒸馏版) -> id=5
        if (combined.contains("deepseek")) {
            return 5L;
        }
        // 4. OpenAI (GPT, o1, o3, DALL-E, Sora, text-embedding, Whisper) -> id=1
        if (combined.contains("gpt-") || combined.contains("chatgpt") || combined.contains("openai") ||
                combined.contains("text-embedding") || combined.contains("dall-e") || combined.contains("sora") ||
                combined.contains("o1-") || combined.contains("o3-") || combined.equals("o1") || combined.equals("o3") || combined.contains("o1 mini") || combined.contains("o3 mini")) {
            return 1L;
        }
        // 5. Meta AI (Llama 全系列) -> id=4
        if (combined.contains("llama") || combined.contains("codellama")) {
            return 4L;
        }
        // 6. 智谱 AI (GLM, ChatGLM, CogView, CogVideo) -> id=18
        if (combined.contains("glm") || combined.contains("chatglm") || combined.contains("cogview") || combined.contains("cogvideo")) {
            return 18L;
        }
        // 7. Google DeepMind (Gemini, Gemma, PaLM) -> id=3
        if (combined.contains("gemini") || combined.contains("gemma") || combined.contains("palm")) {
            return 3L;
        }
        // 8. 月之暗面 (Kimi, Moonshot) -> id=19
        if (combined.contains("kimi") || combined.contains("moonshot")) {
            return 19L;
        }
        // 9. Mistral AI (Mistral, Mixtral, Codestral, Pixtral, Ministral) -> id=11
        if (combined.contains("mistral") || combined.contains("mixtral") || combined.contains("codestral") || combined.contains("pixtral") || combined.contains("ministral")) {
            return 11L;
        }
        // 10. MiniMax 名之梦 (MiniMax, abab) -> id=20
        if (combined.contains("minimax") || combined.contains("abab")) {
            return 20L;
        }
        // 11. 百度 (ERNIE, 文心) -> id=16
        if (combined.contains("ernie") || combined.contains("wenxin")) {
            return 16L;
        }
        // 12. 腾讯 (Hunyuan, 混元) -> id=17
        if (combined.contains("hunyuan")) {
            return 17L;
        }
        // 13. 字节跳动 (Doubao, 豆包, Skylark) -> id=15
        if (combined.contains("doubao") || combined.contains("skylark")) {
            return 15L;
        }
        // 14. xAI (Grok) -> id=7
        if (combined.contains("grok")) {
            return 7L;
        }

        return null;
    }

    /**
     * 执行阶梯匹配解析模型身份
     * @param sourceId 上游源 ID
     * @param upstreamModelId 上游原始模型 ID
     * @param rawVendor 上游厂商标识/名称
     * @param rawName 上游模型展示名
     * @param vendorId 已解析出的本地 vendorId（可为空）
     * @return 命中的本地 model_id，若未命中返回 null
     */
    public Long resolveModelId(Long sourceId, String upstreamModelId, String rawVendor, String rawName, Long vendorId) {
        if (upstreamModelId == null || upstreamModelId.isBlank()) return null;

        // 阶梯 1: model_aliases 精确匹配 (upstream_model_id 或 rawVendor/upstream_model_id)
        String vendorPrefixed = (rawVendor != null && !rawVendor.isBlank()) ? (rawVendor.toLowerCase() + "/" + upstreamModelId) : upstreamModelId;
        List<Long> matched = jdbcTemplate.query(
                "SELECT a.model_id FROM `model_aliases` a JOIN `ai_models` m ON a.model_id = m.id WHERE a.`alias_key` = ? OR a.`alias_key` = ? LIMIT 1",
                (rs, rowNum) -> rs.getLong("model_id"),
                upstreamModelId, vendorPrefixed
        );
        if (!matched.isEmpty()) {
            return matched.get(0);
        }

        // 阶梯 2: 剥离服务档位后缀后匹配
        String stripped = stripVariantSuffix(upstreamModelId);
        if (!stripped.equalsIgnoreCase(upstreamModelId)) {
            String strippedVendorPrefixed = (rawVendor != null && !rawVendor.isBlank()) ? (rawVendor.toLowerCase() + "/" + stripped) : stripped;
            List<Long> strippedMatched = jdbcTemplate.query(
                    "SELECT a.model_id FROM `model_aliases` a JOIN `ai_models` m ON a.model_id = m.id WHERE a.`alias_key` = ? OR a.`alias_key` = ? LIMIT 1",
                    (rs, rowNum) -> rs.getLong("model_id"),
                    stripped, strippedVendorPrefixed
            );
            if (!strippedMatched.isEmpty()) {
                Long modelId = strippedMatched.get(0);
                autoPersistAlias(sourceId, upstreamModelId, modelId, "ENDPOINT");
                return modelId;
            }
        }

        // 阶梯 3: 若已识别真原厂，按真原厂 + 规范化名称精确比对
        Long effectiveVendorId = inferRootVendorId(rawName, upstreamModelId, rawVendor);
        if (effectiveVendorId == null) {
            effectiveVendorId = vendorId;
        }

        if (effectiveVendorId != null && effectiveVendorId > 0) {
            // 先尝试按 model_key 精确匹配
            List<Long> keyMatched = jdbcTemplate.query(
                    "SELECT id FROM `ai_models` WHERE `vendor_id` = ? AND (`model_key` = ? OR `model_key` = ?) LIMIT 1",
                    (rs, rowNum) -> rs.getLong("id"),
                    effectiveVendorId, upstreamModelId.toLowerCase(), stripped.toLowerCase()
            );
            if (!keyMatched.isEmpty()) {
                Long modelId = keyMatched.get(0);
                autoPersistAlias(sourceId, upstreamModelId, modelId, "UPSTREAM_ID");
                return modelId;
            }

            // 按 display_name 规范化比对 (追加 21 修复: 必须用归并后的真原厂 ID,
            // 传原始 vendorId 时托管商 ID 与研发厂商 ID 不一致, 同名规范卡永远匹配不到,
            // 导致 kimi-k3 与 moonshotai-kimi-k3 并存)
            if (rawName != null && !rawName.isBlank()) {
                String cleanRaw = normalizeName(rawName);
                List<Long> nameMatched = jdbcTemplate.query(
                        "SELECT id, display_name FROM `ai_models` WHERE `vendor_id` = ?",
                        (rs, rowNum) -> {
                            String localName = rs.getString("display_name");
                            if (localName != null && normalizeName(localName).equals(cleanRaw)) {
                                return rs.getLong("id");
                            }
                            return null;
                        },
                        effectiveVendorId
                );
                for (Long mId : nameMatched) {
                    if (mId != null) {
                        autoPersistAlias(sourceId, upstreamModelId, mId, "SLUG_ALIAS");
                        return mId;
                    }
                }
            }
        }

        return null;
    }

    /**
     * 别名自动沉淀入库 (is_auto = 1)
     */
    public void autoPersistAlias(Long sourceId, String aliasKey, Long modelId, String aliasType) {
        if (aliasKey == null || modelId == null) return;
        try {
            jdbcTemplate.update(
                    "INSERT INTO `model_aliases` (`model_id`, `alias_key`, `alias_type`, `source_id`, `is_primary`, `is_auto`, `created_at`) " +
                            "VALUES (?, ?, ?, ?, 0, 1, NOW(3)) " +
                            "ON DUPLICATE KEY UPDATE `model_id` = VALUES(`model_id`)",
                    modelId, aliasKey, aliasType, sourceId
            );
            log.info("别名自动沉淀成功: aliasKey={}, modelId={}, sourceId={}", aliasKey, modelId, sourceId);
        } catch (Exception e) {
            log.warn("别名自动沉淀失败: aliasKey={}, error={}", aliasKey, e.getMessage());
        }
    }

    private String normalizeName(String name) {
        if (name == null) return "";
        return NORMALIZE_PATTERN.matcher(name.toLowerCase(Locale.ROOT)).replaceAll("");
    }
}
