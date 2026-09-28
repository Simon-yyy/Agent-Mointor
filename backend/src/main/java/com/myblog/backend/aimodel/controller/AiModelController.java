package com.myblog.backend.aimodel.controller;

import com.myblog.backend.aimodel.dto.CrawlStatusDto;
import com.myblog.backend.aimodel.model.AiModel;
import com.myblog.backend.aimodel.model.ModelEvent;
import com.myblog.backend.aimodel.model.Vendor;
import com.myblog.backend.aimodel.service.AiModelService;
import com.myblog.backend.common.PageResult;
import com.myblog.backend.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI 模型动态追踪公开只读接口
 * 路径契约: /api/model-updates/**
 */
@RestController
@RequestMapping("/api/model-updates")
public class AiModelController {

    private final AiModelService aiModelService;
    private final com.myblog.backend.aimodel.service.AiModelCrawlService aiModelCrawlService;

    public AiModelController(AiModelService aiModelService, com.myblog.backend.aimodel.service.AiModelCrawlService aiModelCrawlService) {
        this.aiModelService = aiModelService;
        this.aiModelCrawlService = aiModelCrawlService;
    }

    /**
     * 0. 手动触发来源巡检已收敛至受保护的管理员接口
     */
    @PostMapping("/crawl/trigger")
    public Result<String> triggerCrawl() {
        return Result.error(403, "手动触发官方巡检为敏感管理操作，已收敛至后台管理接口 /api/admin/model-updates/crawl/trigger");
    }

    /**
     * 1. 分页检索模型动态事件流 (带关键词、厂商、模态、类型筛选)
     */
    @GetMapping("/events")
    public Result<PageResult<ModelEvent>> getEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String vendor,
            @RequestParam(required = false) String modality,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {
        return Result.success(aiModelService.getEvents(keyword, vendor, modality, type, page, size));
    }

    /**
     * 2. 查询全部厂商目录
     */
    @GetMapping("/vendors")
    public Result<List<Vendor>> getVendors() {
        return Result.success(aiModelService.getVendors());
    }

    /**
     * 3. 查询单个厂商详情
     */
    @GetMapping("/vendors/{slug}")
    public Result<Vendor> getVendorDetail(@PathVariable String slug) {
        return Result.success(aiModelService.getVendorBySlug(slug));
    }

    /**
     * 4. 查询 AI 模型目录
     */
    @GetMapping("/models")
    public Result<List<AiModel>> getModels(
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String series) {
        return Result.success(aiModelService.getModels(vendorId, series));
    }

    /**
     * 5. 查询单个 AI 模型详情档案
     */
    @GetMapping("/models/{id}")
    public Result<AiModel> getModelDetail(@PathVariable Long id) {
        return Result.success(aiModelService.getModelDetail(id));
    }

    /**
     * 5.1 查询指定模型发生的历史演进事件列表 (精确模型 ID 关联)
     */
    @GetMapping("/models/{id}/events")
    public Result<List<ModelEvent>> getModelEvents(@PathVariable Long id) {
        return Result.success(aiModelService.getEventsByModelId(id));
    }

    /**
     * 6. 查询月份历史时间线
     */
    @GetMapping("/timeline")
    public Result<List<ModelEvent>> getTimeline() {
        return Result.success(aiModelService.getTimeline());
    }

    /**
     * 7. 查询系统监控采集与来源健康状态
     */
    @GetMapping("/status")
    public Result<CrawlStatusDto> getStatus() {
        return Result.success(aiModelService.getStatus());
    }

    /**
     * 8. 公开查询官方动态信息流（可按月份 YYYY-MM、厂商、主题类别 category、关键字 keyword 过滤）
     */
    @GetMapping("/official-updates")
    public Result<PageResult<com.myblog.backend.aimodel.dto.OfficialUpdateDto>> getOfficialUpdates(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "15") int size) {
        return Result.success(aiModelService.getOfficialUpdates(month, vendorId, category, keyword, page, size));
    }

    /**
     * 9. 公开查询 2026 年各月厂商覆盖审计矩阵
     */
    @GetMapping("/coverage")
    public Result<List<com.myblog.backend.aimodel.dto.CoverageAuditDto>> getCoverage(
            @RequestParam(defaultValue = "2026") String year,
            @RequestParam(required = false) Long vendorId) {
        return Result.success(aiModelService.getCoverageAudits(year, vendorId));
    }

}
