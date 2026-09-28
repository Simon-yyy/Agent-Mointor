package com.myblog.backend.controller;

import com.myblog.backend.common.Result;
import com.myblog.backend.dto.WorkDto;
import com.myblog.backend.model.Work;
import com.myblog.backend.service.WorkService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * 管理后台作品管理接口
 */
@RestController
@RequestMapping("/api/admin/works")
public class AdminWorkController {

    private final WorkService workService;

    public AdminWorkController(WorkService workService) {
        this.workService = workService;
    }

    /**
     * 新增作品
     */
    @PostMapping
    public Result<Work> createWork(@Valid @RequestBody WorkDto dto) {
        return Result.success("作品创建成功", workService.createWork(dto));
    }

    /**
     * 更新作品
     */
    @PutMapping("/{id}")
    public Result<Work> updateWork(@PathVariable Long id, @Valid @RequestBody WorkDto dto) {
        return Result.success("作品更新成功", workService.updateWork(id, dto));
    }

    /**
     * 删除作品
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteWork(@PathVariable Long id) {
        workService.deleteWork(id);
        return Result.success("作品已删除", null);
    }
}
