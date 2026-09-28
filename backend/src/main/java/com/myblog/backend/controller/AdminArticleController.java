package com.myblog.backend.controller;

import com.myblog.backend.common.PageResult;
import com.myblog.backend.common.Result;
import com.myblog.backend.dto.ArticleDto;
import com.myblog.backend.model.Article;
import com.myblog.backend.service.ArticleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 管理后台文章接口
 */
@RestController
@RequestMapping("/api/admin/articles")
public class AdminArticleController {

    private final ArticleService articleService;

    public AdminArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    /**
     * 管理端文章全量列表（包含草稿与发布状态）
     */
    @GetMapping
    public Result<PageResult<Article>> listAllArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "15") int size) {
        return Result.success(articleService.listAllArticles(keyword, tag, category, page, size));
    }

    /**
     * 管理端获取文章详情（供编辑，不增加 views）
     */
    @GetMapping("/{id}")
    public Result<Article> getArticleForEdit(@PathVariable Long id) {
        return Result.success(articleService.getArticleById(id, false));
    }

    /**
     * 新增文章（草稿或直接发布）
     */
    @PostMapping
    public Result<Article> createArticle(@Valid @RequestBody ArticleDto dto) {
        return Result.success("文章保存成功", articleService.createArticle(dto));
    }

    /**
     * 更新文章
     */
    @PutMapping("/{id}")
    public Result<Article> updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleDto dto) {
        return Result.success("文章更新成功", articleService.updateArticle(id, dto));
    }

    /**
     * 删除文章
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return Result.success("文章已删除", null);
    }

    /**
     * 获取管理端概览统计指标
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getAdminStats() {
        return Result.success(articleService.getAdminStats());
    }
}
