package com.myblog.backend.aimodel.catalog.service;

import tools.jackson.databind.ObjectMapper;
import com.myblog.backend.aimodel.catalog.CatalogModelDraft;
import com.myblog.backend.aimodel.catalog.CatalogSourceAdapter;
import com.myblog.backend.aimodel.catalog.dto.SyncReportDto;
import com.myblog.backend.aimodel.catalog.identity.ModelIdentityResolver;
import com.myblog.backend.aimodel.catalog.merge.ModelFactMerger;
import com.myblog.backend.aimodel.catalog.validate.SnapshotGate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.*;

/**
 * 模型目录聚合同步核心服务 (方案阶段 0 ~ 阶段 3 闭环; 追加 17 审计后修订)
 * 执行顺序 (闸门先行于公开, 追加 17 教训):
 * 1. 抓取与暂存 (catalog_source_models, 自提交, 不参与发布事务)
 * 2. 发布事务 (TransactionTemplate): 厂商注册 -> 身份解析 -> 字段级仲裁 -> 受控自动建卡
 * 3. 闸门在发布事务内执行, 不通过则 setRollbackOnly 整体回滚本次 ai_models 写入
 * 4. 运行审计 (catalog_sync_runs) 在事务外自提交, 闸门拦截也留痕
 * 自动公开建卡默认关闭 (blog.catalog.auto-publish-enabled=false, 追加 17 止血):
 * 未匹配候选一律保持 STAGED 待审, 管理端审核通过后才进入 ai_models。
 */
@Service
public class CatalogSyncService {

    private static final Logger log = LoggerFactory.getLogger(CatalogSyncService.class);

    private final JdbcTemplate jdbcTemplate;
    private final List<CatalogSourceAdapter> adapters;
    private final ModelIdentityResolver identityResolver;
    private final ModelFactMerger factMerger;
    private final SnapshotGate snapshotGate;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate publishTx;

    /**
     * 自动公开建卡开关 (追加 17 止血: 默认关闭)。
     * 关闭时未匹配候选保持 STAGED 待审; 仅在闸门稳定运行后由管理员显式开启。
     */
    @Value("${blog.catalog.auto-publish-enabled:false}")
    private boolean autoPublishEnabled;

    public CatalogSyncService(JdbcTemplate jdbcTemplate,
                              List<CatalogSourceAdapter> adapters,
                              ModelIdentityResolver identityResolver,
                              ModelFactMerger factMerger,
                              SnapshotGate snapshotGate,
                              ObjectMapper objectMapper,
                              PlatformTransactionManager transactionManager) {
        this.jdbcTemplate = jdbcTemplate;
        this.adapters = adapters;
        this.identityResolver = identityResolver;
        this.factMerger = factMerger;
        this.snapshotGate = snapshotGate;
        this.objectMapper = objectMapper;
        this.publishTx = new TransactionTemplate(transactionManager);
    }

    /**
     * 每日凌晨 04:00 定时执行全量同步
     */
    @Scheduled(cron = "0 0 4 * * ?")
    public void scheduledSync() {
        log.info("【目录管线】触发每日定时同步...");
        syncAllSources();
    }

    public synchronized List<SyncReportDto> syncAllSources() {
        List<SyncReportDto> reports = new ArrayList<>();
        for (CatalogSourceAdapter adapter : adapters) {
            SyncReportDto rep = syncSource(adapter);
            if (rep != null) {
                reports.add(rep);
            }
        }
        return reports;
    }

    /**
     * 手动触发指定源或全部源同步
     */
    public synchronized SyncReportDto triggerManualSync(String sourceKey) {
        for (CatalogSourceAdapter adapter : adapters) {
            if (adapter.getSourceKey().equalsIgnoreCase(sourceKey)) {
                return syncSource(adapter);
            }
        }
        throw new IllegalArgumentException("未找到启用的目录源: " + sourceKey);
    }

    public SyncReportDto syncSource(CatalogSourceAdapter adapter) {
        String key = adapter.getSourceKey();
        List<Map<String, Object>> sources = jdbcTemplate.queryForList(
                "SELECT id, is_active FROM `catalog_sources` WHERE `source_key` = ?", key);
        if (sources.isEmpty()) {
            log.info("目录源 [{}] 未配置，跳过同步", key);
            return null;
        }
        Object activeObj = sources.get(0).get("is_active");
        boolean isActive = activeObj instanceof Boolean ? (Boolean) activeObj : (activeObj instanceof Number && ((Number) activeObj).intValue() != 0);
        if (!isActive) {
            log.info("目录源 [{}] 已被停用，跳过同步", key);
            return null;
        }

        Long sourceId = ((Number) sources.get(0).get("id")).longValue();
        int initialModelCount = getPublishedModelCount();

        // 1. 创建同步执行审计 (事务外自提交, 闸门拦截也留痕)
        jdbcTemplate.update("INSERT INTO `catalog_sync_runs` (`source_id`, `status`, `started_at`) VALUES (?, 'RUNNING', NOW(3))", sourceId);
        Long runId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);

        SyncReportDto report = new SyncReportDto();
        report.setSourceKey(key);
        report.setSyncTime(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        report.setAutoPublishEnabled(autoPublishEnabled);

        int fetchedCount = 0;
        int[] counters = new int[3]; // [0]=matched, [1]=autoPublished, [2]=stagedDraft

        try {
            // 2. 抓取与暂存 (自提交: 暂存镜像是幂等 upsert, 不属于发布内容)
            List<CatalogModelDraft> drafts = adapter.fetchCatalogModels();
            fetchedCount = drafts.size();
            report.setFetchedCount(fetchedCount);

            String insertSql = "INSERT INTO `catalog_source_models` " +
                    "(`source_id`, `upstream_model_id`, `raw_vendor`, `raw_name`, `context_length`, `pricing_prompt`, `pricing_completion`, `modality`, `upstream_release_date`, `raw_json`, `last_seen_at`, `created_at`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3)) " +
                    "ON DUPLICATE KEY UPDATE `raw_name` = VALUES(`raw_name`), `context_length` = VALUES(`context_length`), " +
                    "`pricing_prompt` = VALUES(`pricing_prompt`), `pricing_completion` = VALUES(`pricing_completion`), " +
                    "`modality` = VALUES(`modality`), `upstream_release_date` = VALUES(`upstream_release_date`), " +
                    "`raw_json` = VALUES(`raw_json`), `last_seen_at` = NOW(3)";

            for (CatalogModelDraft d : drafts) {
                try {
                    String promptPriceStr = d.getPricingInputPerM() != null ? d.getPricingInputPerM().toString() : null;
                    String compPriceStr = d.getPricingOutputPerM() != null ? d.getPricingOutputPerM().toString() : null;
                    // 追加 19: 暂存表结构化保存上游原始发布日期 (不再只埋在 raw_json)
                    jdbcTemplate.update(insertSql, sourceId, d.getUpstreamModelId(), d.getRawVendor(),
                            d.getRawName(), d.getContextLength(), promptPriceStr, compPriceStr, d.getModality(),
                            d.getReleaseDate(), d.getRawJson());
                } catch (Exception e) {
                    log.warn("暂存单条模型镜像失败: upstreamModelId={}, err={}", d.getUpstreamModelId(), e.getMessage());
                }
            }

            // 3. 发布事务: 厂商注册 + 身份解析 + 字段仲裁 + 受控自动建卡
            //    闸门在事务内执行, 不通过则 setRollbackOnly —— 本次 ai_models/model_vendors 写入全部回滚
            final int prevTotal = initialModelCount;
            SnapshotGate.GateResult gateRes = publishTx.execute(status -> {
                try {
                    for (CatalogModelDraft d : drafts) {
                        try {
                            Long vendorId = factMerger.resolveOrRegisterVendor(sourceId, d.getRawVendor(), d.getUpstreamModelId());
                            Long matchedModelId = identityResolver.resolveModelId(sourceId, d.getUpstreamModelId(), d.getRawVendor(), d.getRawName(), vendorId);

                            if (matchedModelId != null) {
                                counters[0]++;
                                jdbcTemplate.update(
                                        "UPDATE `catalog_source_models` SET `matched_model_id` = ?, `sync_status` = 'MATCHED' WHERE `source_id` = ? AND `upstream_model_id` = ?",
                                        matchedModelId, sourceId, d.getUpstreamModelId());
                                // 字段级仲裁与血缘写入 (null 永不覆盖已核实值)
                                factMerger.arbitrateAndUpdate(matchedModelId, sourceId, key, d.getReleaseDate(),
                                        d.getContextLength(), d.getModality(), d.getPricingInputPerM(), d.getPricingOutputPerM(), d.getPricingCachedPerM());
                            } else if (autoPublishEnabled && "models_dev".equals(key) && vendorId != null) {
                                // 自动建卡: 仅在 blog.catalog.auto-publish-enabled=true 时执行 (追加 17 止血默认关闭)
                                Long newId = factMerger.createAndPublishModel(vendorId, d.getUpstreamModelId(), d.getRawName(),
                                        d.getContextLength(), d.getModality(), d.getPricingInputPerM(), d.getPricingOutputPerM(), key,
                                        d.getReleaseDate());
                                if (newId != null) {
                                    counters[1]++;
                                    identityResolver.autoPersistAlias(sourceId, d.getUpstreamModelId(), newId, "UPSTREAM_ID");
                                    jdbcTemplate.update(
                                            "UPDATE `catalog_source_models` SET `matched_model_id` = ?, `sync_status` = 'MATCHED' WHERE `source_id` = ? AND `upstream_model_id` = ?",
                                            newId, sourceId, d.getUpstreamModelId());
                                } else {
                                    counters[2]++;
                                }
                            } else {
                                // 未匹配候选保持 STAGED 待审 (管理端审核通过后才进入 ai_models)
                                counters[2]++;
                            }
                        } catch (Exception e) {
                            log.warn("处理单条模型候选失败: upstreamModelId={}, err={}", d.getUpstreamModelId(), e.getMessage());
                        }
                    }

                    report.setMatchedCount(counters[0]);
                    report.setAutoPublishedCount(counters[1]);

                    // 4. 统计指标与覆盖率
                    int finalModelCount = getPublishedModelCount();
                    report.setPricingCoverage(calculatePricingCoverage());
                    report.setDateCoverage(calculateDateCoverage());
                    Long conflictCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `catalog_conflicts` WHERE status = 'PENDING'", Long.class);
                    report.setConflictCount(conflictCount != null ? conflictCount.intValue() : 0);

                    // 5. 发布校验闸门 (事务内; 不通过则回滚本次全部发布写入)
                    SnapshotGate.GateResult res = snapshotGate.inspect(prevTotal, finalModelCount);
                    if (!res.isPassed()) {
                        status.setRollbackOnly();
                        log.error("【目录管线】[{}] 发布事务已被闸门回滚: {}", key, res.getBlockedReason());
                    }
                    return res;
                } catch (Exception e) {
                    status.setRollbackOnly();
                    throw new IllegalStateException("发布事务执行异常: " + e.getMessage(), e);
                }
            });

            if (gateRes == null) {
                gateRes = new SnapshotGate.GateResult(false, "发布事务未产生结果", new ArrayList<>());
            }

            report.setPassedGates(gateRes.isPassed());
            report.setWarnings(gateRes.getWarnings());
            report.setBlockedReason(gateRes.getBlockedReason());

            String repJson = objectMapper.writeValueAsString(report);

            if (gateRes.isPassed()) {
                jdbcTemplate.update(
                        "UPDATE `catalog_sync_runs` SET `status` = 'SUCCESS', `fetched_count` = ?, `matched_count` = ?, " +
                                "`created_draft_count` = ?, `sync_report_json` = ?, `finished_at` = NOW(3) WHERE `id` = ?",
                        fetchedCount, counters[0], counters[2], repJson, runId);
                jdbcTemplate.update("UPDATE `catalog_sources` SET `last_sync_time` = NOW(3), `last_status` = 'SUCCESS' WHERE `id` = ?", sourceId);
                if (!autoPublishEnabled && counters[2] > 0) {
                    log.info("【目录管线】[{}] 自动公开已停用(追加17止血): {} 个未匹配候选保持 STAGED 待审", key, counters[2]);
                }
                log.info("【目录管线】[{}] 同步成功落地: fetched={}, matched={}, autoPublished={}, staged={}, warnings={}",
                        key, fetchedCount, counters[0], counters[1], counters[2], gateRes.getWarnings().size());
            } else {
                // 闸门拦截: 发布事务已回滚, ai_models 保持上一版公开数据; 运行记录留痕
                jdbcTemplate.update(
                        "UPDATE `catalog_sync_runs` SET `status` = 'FAILED_BLOCKED', `blocked_reason` = ?, `sync_report_json` = ?, `finished_at` = NOW(3) WHERE `id` = ?",
                        gateRes.getBlockedReason(), repJson, runId);
                jdbcTemplate.update("UPDATE `catalog_sources` SET `last_status` = 'BLOCKED' WHERE `id` = ?", sourceId);
                log.error("【目录管线】[{}] 同步已被校验闸门阻断(发布事务已回滚): {}", key, gateRes.getBlockedReason());
            }

            return report;

        } catch (Exception e) {
            log.error("【目录管线】[{}] 同步异常: {}", key, e.getMessage(), e);
            report.setPassedGates(false);
            report.setBlockedReason("系统运行异常: " + e.getMessage());
            try {
                String repJson = objectMapper.writeValueAsString(report);
                jdbcTemplate.update(
                        "UPDATE `catalog_sync_runs` SET `status` = 'FAILED', `error_message` = ?, `sync_report_json` = ?, `finished_at` = NOW(3) WHERE `id` = ?",
                        e.getMessage(), repJson, runId);
            } catch (Exception ignored) {}
            jdbcTemplate.update("UPDATE `catalog_sources` SET `last_status` = 'FAILED' WHERE `id` = ?", sourceId);
            return report;
        }
    }

    private int getPublishedModelCount() {
        Integer cnt = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `ai_models`", Integer.class);
        return cnt != null ? cnt : 0;
    }

    private double calculatePricingCoverage() {
        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `ai_models`", Long.class);
        if (total == null || total == 0) return 0.0;
        Long hasPrice = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `ai_models` WHERE pricing_input_per_m IS NOT NULL", Long.class);
        return hasPrice != null ? (double) hasPrice / total : 0.0;
    }

    private double calculateDateCoverage() {
        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `ai_models`", Long.class);
        if (total == null || total == 0) return 0.0;
        Long hasDate = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `ai_models` WHERE official_release_date IS NOT NULL", Long.class);
        return hasDate != null ? (double) hasDate / total : 0.0;
    }
}
