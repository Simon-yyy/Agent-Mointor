package com.myblog.backend.aimodel.controller;

import com.myblog.backend.aimodel.dto.CandidateDecisionRequest;
import com.myblog.backend.aimodel.model.ModelDiscoveryCandidate;
import com.myblog.backend.aimodel.service.AiModelCrawlService;
import com.myblog.backend.aimodel.service.AiModelService;
import com.myblog.backend.common.PageResult;
import com.myblog.backend.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI 模型动态监控后台管理接口
 * 权限约束: 需具备系统管理员鉴权 (受 /api/admin/** 拦截器保护)
 */
@RestController
@RequestMapping("/api/admin/model-updates")
public class AdminModelController {

    private final AiModelService aiModelService;
    private final AiModelCrawlService aiModelCrawlService;
    private final com.myblog.backend.aimodel.catalog.service.CatalogSyncService catalogSyncService;
    private final com.myblog.backend.aimodel.service.ModelBenchmarkService benchmarkService;

    public AdminModelController(AiModelService aiModelService,
                                AiModelCrawlService aiModelCrawlService,
                                com.myblog.backend.aimodel.catalog.service.CatalogSyncService catalogSyncService,
                                com.myblog.backend.aimodel.service.ModelBenchmarkService benchmarkService) {
        this.aiModelService = aiModelService;
        this.aiModelCrawlService = aiModelCrawlService;
        this.catalogSyncService = catalogSyncService;
        this.benchmarkService = benchmarkService;
    }

    /**
     * 1. 待审候选列表分页查询
     */
    @GetMapping("/candidates")
    public Result<PageResult<ModelDiscoveryCandidate>> getCandidates(
            @RequestParam(required = false, defaultValue = "PENDING") String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(aiModelService.getCandidates(status, keyword, page, size));
    }

    /**
     * 2. 执行候选审核决策 (通过或驳回)
     */
    @PostMapping("/candidates/{id}/decision")
    public Result<String> decideCandidate(
            @PathVariable Long id,
            @RequestBody CandidateDecisionRequest request) {
        aiModelService.handleCandidateDecision(id, request);
        return Result.success("操作成功");
    }

    /**
     * 3. 官方监控信源状态与列表
     */
    @GetMapping("/sources")
    public Result<List<Map<String, Object>>> getSources() {
        return Result.success(aiModelService.getAdminSources());
    }

    /**
     * 4. 启用或停用指定信源
     */
    @PostMapping("/sources/{id}/toggle")
    public Result<String> toggleSource(
            @PathVariable Long id,
            @RequestParam boolean active) {
        aiModelService.toggleSource(id, active);
        return Result.success(active ? "信源已启用" : "信源已停用");
    }

    /**
     * 5. 管理员手动触发全量官方来源巡检任务
     */
    @PostMapping("/crawl/trigger")
    public Result<Map<String, Object>> triggerCrawl() {
        return Result.success(aiModelCrawlService.runCrawlJob());
    }

    /**
     * 6. 创建历史回填任务 (从 2026-01-01 起按月推进)
     */
    @PostMapping("/backfills")
    public Result<com.myblog.backend.aimodel.dto.BackfillJobDto> createBackfill(
            @RequestBody(required = false) com.myblog.backend.aimodel.dto.BackfillJobDto req) {
        if (req == null) req = new com.myblog.backend.aimodel.dto.BackfillJobDto();
        return Result.success(aiModelService.createBackfillJob(req));
    }

    /**
     * 7. 查询指定历史回填任务进度与覆盖缺口
     */
    @GetMapping("/backfills/{id}")
    public Result<com.myblog.backend.aimodel.dto.BackfillJobDto> getBackfill(@PathVariable String id) {
        return Result.success(aiModelService.getBackfillJob(id));
    }

    /**
     * 8. 查询全部历史回填任务记录
     */
    @GetMapping("/backfills")
    public Result<List<com.myblog.backend.aimodel.dto.BackfillJobDto>> listBackfills() {
        return Result.success(aiModelService.listBackfillJobs());
    }

    /**
     * 9. 手动触发目录聚合同步 (可指定 sourceKey 如 models_dev，或 all)
     */
    @PostMapping("/catalog/sync/{sourceKey}")
    public Result<?> triggerCatalogSync(@PathVariable String sourceKey) {
        if ("all".equalsIgnoreCase(sourceKey)) {
            return Result.success(catalogSyncService.syncAllSources());
        }
        return Result.success(catalogSyncService.triggerManualSync(sourceKey));
    }

    /**
     * 10. 获取目录同步执行审计与 SyncReport 报告
     */
    @GetMapping("/catalog/runs")
    public Result<List<Map<String, Object>>> listCatalogRuns(@RequestParam(defaultValue = "20") int limit) {
        return Result.success(aiModelService.listCatalogSyncRuns(limit));
    }

    /**
     * 11. 获取目录字段冲突待审队列
     */
    @GetMapping("/catalog/conflicts")
    public Result<List<Map<String, Object>>> listCatalogConflicts(@RequestParam(required = false) String status,
                                                                 @RequestParam(defaultValue = "50") int limit) {
        return Result.success(aiModelService.listCatalogConflicts(status, limit));
    }

    /**
     * 12. 处置目录字段冲突 (KEEP: 保留现有值, TAKE: 采纳上游新值)
     */
    @PostMapping("/catalog/conflicts/{id}/resolve")
    public Result<String> resolveConflict(@PathVariable Long id,
                                          @RequestParam(defaultValue = "KEEP") String decision) {
        aiModelService.resolveCatalogConflict(id, decision, "ADMIN");
        return Result.success("冲突已成功处置: " + decision);
    }

    /**
     * 13. 手动触发 Epoch AI 评测战绩与天梯榜同步
     */
    @PostMapping("/benchmarks/sync/epoch_ai")
    public Result<Map<String, Object>> syncEpochAiBenchmarks() {
        int count = benchmarkService.triggerEpochAiSync();
        return Result.success(Map.of(
                "syncedCount", count,
                "suite", "EPOCH_AI",
                "message", "Epoch AI 评测战绩沉淀成功"
        ));
    }

    /**
     * 14. 目录计数口径报告 (追加 16/17): 端点行/规范模型/已公开/待审/自动公开/厂商分层/重复实体/静态资源页分列
     */
    @GetMapping("/catalog/report")
    public Result<Map<String, Object>> getCatalogReport() {
        return Result.success(aiModelService.getCatalogReport());
    }
}
