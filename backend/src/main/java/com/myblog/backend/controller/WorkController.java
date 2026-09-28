package com.myblog.backend.controller;

import com.myblog.backend.common.Result;
import com.myblog.backend.model.Work;
import com.myblog.backend.service.WorkService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 读者侧作品仓库公开接口
 */
@RestController
@RequestMapping("/api/works")
public class WorkController {

    private final WorkService workService;

    public WorkController(WorkService workService) {
        this.workService = workService;
    }

    /**
     * 获取全部作品列表（按排序权重和时间倒序）
     */
    @GetMapping
    public Result<List<Work>> listWorks() {
        return Result.success(workService.listWorks());
    }

    /**
     * 获取作品详情
     */
    @GetMapping("/{id}")
    public Result<Work> getWorkDetail(@PathVariable Long id) {
        return Result.success(workService.getWorkById(id));
    }
}
