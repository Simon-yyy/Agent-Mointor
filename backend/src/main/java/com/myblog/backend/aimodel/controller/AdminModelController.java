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

    public AdminModelController(AiModelService aiModelService, AiModelCrawlService aiModelCrawlService) {
        this.aiModelService = aiModelService;
        this.aiModelCrawlService = aiModelCrawlService;
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
}
