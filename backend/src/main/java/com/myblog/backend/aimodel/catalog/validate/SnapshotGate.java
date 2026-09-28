package com.myblog.backend.aimodel.catalog.validate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 目录发布前校验闸门 (方案阶段 3 落地; 追加 17 审计后补齐全套缺口)
 * 职责：在数据发布前执行合理性检查, 任一严重项不过则阻断发布并告警留痕。
 * 追加 17 教训: 闸门必须先于/伴随发布事务执行, "只查总数骤降与负价"不足以拦截
 * 暴涨、托管商当厂商、同名重复、静态页混入等真实污染模式。
 */
@Component
public class SnapshotGate {

    private static final Logger log = LoggerFactory.getLogger(SnapshotGate.class);

    private final JdbcTemplate jdbcTemplate;

    public SnapshotGate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public static class GateResult {
        private final boolean passed;
        private final String blockedReason;
        private final List<String> warnings;

        public GateResult(boolean passed, String blockedReason, List<String> warnings) {
            this.passed = passed;
            this.blockedReason = blockedReason;
            this.warnings = warnings;
        }

        public boolean isPassed() { return passed; }
        public String getBlockedReason() { return blockedReason; }
        public List<String> getWarnings() { return warnings; }
    }

    /**
     * 执行校验闸门 (发布事务内调用; 返回不通过时调用方须回滚发布事务)
     * @param prevTotalCount 发布前模型总数
     * @param currentTotalCount 发布后模型总数
     * @return 闸门裁决结果
     */
    public GateResult inspect(int prevTotalCount, int currentTotalCount) {
        List<String> warnings = new ArrayList<>();

        // 1. 总量护栏：模型总数不得比上次减少超过 10%
        if (prevTotalCount > 0 && currentTotalCount < prevTotalCount * 0.9) {
            String err = String.format("模型总数出现断崖式下跌: 上次=%d, 当前=%d (降幅 >10%%)", prevTotalCount, currentTotalCount);
            log.error("【发布闸门阻断】{}", err);
            return new GateResult(false, err, warnings);
        }

        // 2. 定价合法性检查：定价不得为负数（允许开源/免费模型为 0）
        Long invalidPriceCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `ai_models` WHERE pricing_input_per_m < 0 OR pricing_output_per_m < 0", Long.class);
        if (invalidPriceCount != null && invalidPriceCount > 0) {
            String err = String.format("检测到 %d 款模型定价为负数，存在解析异常风险", invalidPriceCount);
            log.error("【发布闸门阻断】{}", err);
            return new GateResult(false, err, warnings);
        }

        // 3. [追加 17] 规范模型数单轮暴涨护栏：防止 provider 清单整体导入重演 (49 -> 3534)
        if (prevTotalCount > 0) {
            int growth = currentTotalCount - prevTotalCount;
            if (growth > 100 && currentTotalCount > prevTotalCount * 1.5) {
                String err = String.format("模型总数单轮异常增长: +%d 款 (%d -> %d, 涨幅 >50%% 且绝对增量 >100), 疑似端点清单整体导入", growth, prevTotalCount, currentTotalCount);
                log.error("【发布闸门阻断】{}", err);
                return new GateResult(false, err, warnings);
            }
            if (growth > 0 && currentTotalCount > prevTotalCount * 1.2) {
                warnings.add(String.format("模型总数单轮增长 %d%% (%d -> %d), 请确认来源与身份归并是否正确", Math.round(growth * 100.0 / prevTotalCount), prevTotalCount, currentTotalCount));
            }
        }

        // 4. [追加 17] 自动注册厂商中无官方信源(疑似托管渠道)的比例
        Long autoVendors = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `model_vendors` WHERE auto_registered = 1", Long.class);
        Long autoNoSource = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `model_vendors` v WHERE v.auto_registered = 1 " +
                        "AND NOT EXISTS (SELECT 1 FROM `model_sources` ms WHERE ms.vendor_id = v.id)", Long.class);
        if (autoVendors != null && autoVendors > 0 && autoNoSource != null && autoNoSource > 0) {
            warnings.add(String.format("%d 家自动注册厂商没有官方信源(疑似托管渠道/产品平台), 合计 %d 家自动注册厂商", autoNoSource, autoVendors));
        }

        // 5. [追加 17] 同名跨源重复实体 (同厂商下展示名重复)
        Long dupModels = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(c), 0) FROM (SELECT COUNT(*) c FROM `ai_models` " +
                        "GROUP BY vendor_id, LOWER(display_name) HAVING COUNT(*) > 1) t", Long.class);
        if (dupModels != null && dupModels > 0) {
            warnings.add(String.format("存在 %d 款同厂商同名模型(疑似跨端点重复), 请在管理端核对归并", dupModels));
        }

        // 6. [追加 17] 无证据的 CONFIRMED 事件 (确认状态不等于原文已核验)
        Long noEvidenceEvents = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `model_events` e WHERE e.review_status = 'CONFIRMED' " +
                        "AND NOT EXISTS (SELECT 1 FROM `event_evidence` ev WHERE ev.event_id = e.id)", Long.class);
        if (noEvidenceEvents != null && noEvidenceEvents > 0) {
            warnings.add(String.format("存在 %d 条无证据链接的已核实事件, 建议抽样回源复核", noEvidenceEvents));
        }

        // 7. [追加 17] 静态资源页混入动态流 (条款/招聘/隐私/导航)
        Long staticLeak = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `source_items` WHERE is_static_resource = 0 " +
                        "AND LOWER(CONCAT(IFNULL(title, ''), ' ', IFNULL(canonical_url, ''))) REGEXP '" + StaticResourceRule.SQL_REGEXP + "'", Long.class);
        if (staticLeak != null && staticLeak > 0) {
            warnings.add(String.format("仍有 %d 条疑似静态资源页未标记排除, 请补跑 V26 存量回填或人工核对", staticLeak));
        }

        // 8. 覆盖率核验：检查官方发布日期覆盖率
        Long dateNullCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `ai_models` WHERE official_release_date IS NULL AND catalog_status = 'MANUAL'", Long.class);
        if (dateNullCount != null && dateNullCount > 0) {
            warnings.add(String.format("存在 %d 款人工核实模型的发布日期为空", dateNullCount));
        }

        // 8b. [追加 19] 自动公开卡的空日期检查 (此前只查 MANUAL, 307 张自动空日期卡漏检)
        Long autoNoDate = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `ai_models` WHERE official_release_date IS NULL AND catalog_status = 'AUTO_PUBLISHED'", Long.class);
        if (autoNoDate != null && autoNoDate > 0) {
            warnings.add(String.format("存在 %d 款自动公开模型无官方发布日期 (显示为'日期待核实'), 请按厂商批次回源补齐", autoNoDate));
        }

        // 9. 冲突队列积压检查
        Long pendingConflicts = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM `catalog_conflicts` WHERE status = 'PENDING'", Long.class);
        if (pendingConflicts != null && pendingConflicts > 20) {
            warnings.add(String.format("当前待审冲突积压达到 %d 条，请及时在管理端核对", pendingConflicts));
        }

        log.info("【发布闸门通过】prevTotal={}, curTotal={}, warnings={}", prevTotalCount, currentTotalCount, warnings.size());
        return new GateResult(true, null, warnings);
    }
}
