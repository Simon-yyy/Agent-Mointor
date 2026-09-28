package com.myblog.backend.controller;

import com.myblog.backend.common.PageResult;
import com.myblog.backend.common.Result;
import com.myblog.backend.model.Article;
import com.myblog.backend.service.ArticleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 读者侧文章公开接口
 */
@RestController
@RequestMapping("/api")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    /**
     * 分页获取已发布文章列表
     */
    @GetMapping("/articles")
    public Result<PageResult<Article>> listArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(articleService.listPublishedArticles(keyword, tag, category, page, size));
    }

    /**
     * 获取文章详情（自动自增阅读量）
     */
    @GetMapping("/articles/{id}")
    public Result<Article> getArticleDetail(@PathVariable Long id) {
        return Result.success(articleService.getArticleById(id, true));
    }

    /**
     * 获取最新发布的前 N 篇文章（供首页精选展示）
     */
    @GetMapping("/articles/recent")
    public Result<List<Article>> getRecentArticles(@RequestParam(defaultValue = "5") int limit) {
        return Result.success(articleService.getRecentArticles(limit));
    }

    /**
     * 获取归档时间轴
     */
    @GetMapping("/articles/archives")
    public Result<Map<String, List<Article>>> getArchives() {
        return Result.success(articleService.getArchives());
    }

    /**
     * 获取全部分类及文章数量
     */
    @GetMapping("/categories")
    public Result<Map<String, Long>> getCategories() {
        return Result.success(articleService.getCategories());
    }

    /**
     * 获取全部标签及文章数量
     */
    @GetMapping("/tags")
    public Result<Map<String, Long>> getTags() {
        return Result.success(articleService.getTags());
    }
}
