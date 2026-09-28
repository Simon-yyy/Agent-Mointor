package com.myblog.backend.service;

import com.myblog.backend.common.BusinessException;
import com.myblog.backend.common.PageResult;
import com.myblog.backend.dto.ArticleDto;
import com.myblog.backend.model.Article;
import com.myblog.backend.repository.ArticleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 文章业务逻辑服务
 */
@Service
public class ArticleService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    public PageResult<Article> listPublishedArticles(String keyword, String tag, String category, int page, int size) {
        return queryPaged(1, keyword, tag, category, page, size);
    }

    public PageResult<Article> listAllArticles(String keyword, String tag, String category, int page, int size) {
        return queryPaged(null, keyword, tag, category, page, size);
    }

    private PageResult<Article> queryPaged(Integer status, String keyword, String tag, String category, int page, int size) {
        int validPage = Math.max(1, page);
        int validSize = Math.max(1, Math.min(100, size));

        List<Article> matched = articleRepository.query(status, keyword, tag, category);
        long total = matched.size();

        int fromIndex = (validPage - 1) * validSize;
        if (fromIndex >= total) {
            return PageResult.of(Collections.emptyList(), total, validPage, validSize);
        }
        int toIndex = Math.min(fromIndex + validSize, (int) total);
        List<Article> pagedList = matched.subList(fromIndex, toIndex);

        return PageResult.of(pagedList, total, validPage, validSize);
    }

    public Article getArticleById(Long id, boolean incrementViews) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));

        if (incrementViews) {
            articleRepository.incrementViews(id);
            article.setViews((article.getViews() != null ? article.getViews() : 0L) + 1);
        }
        return article;
    }

    public List<Article> getRecentArticles(int limit) {
        return articleRepository.query(1, null, null, null).stream()
                .limit(Math.max(1, limit))
                .collect(Collectors.toList());
    }

    public Map<String, Long> getCategories() {
        return articleRepository.countCategories();
    }

    public Map<String, Long> getTags() {
        return articleRepository.countTags();
    }

    public Map<String, List<Article>> getArchives() {
        List<Article> published = articleRepository.query(1, null, null, null);
        Map<String, List<Article>> archiveMap = new LinkedHashMap<>();

        for (Article article : published) {
            String time = article.getCreatedAt();
            String year = (time != null && time.length() >= 4) ? time.substring(0, 4) : "其他";
            archiveMap.computeIfAbsent(year, k -> new ArrayList<>()).add(article);
        }
        return archiveMap;
    }

    public Article createArticle(ArticleDto dto) {
        String now = LocalDateTime.now().format(FMT);
        Article article = new Article();
        article.setTitle(dto.getTitle());
        article.setSummary(dto.getSummary());
        article.setContentMd(dto.getContentMd());
        article.setCoverUrl(dto.getCoverUrl());
        article.setCategory(dto.getCategory() != null && !dto.getCategory().isBlank() ? dto.getCategory() : "随笔");
        article.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());
        article.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        article.setViews(0L);
        article.setCreatedAt(now);
        article.setUpdatedAt(now);

        return articleRepository.save(article);
    }

    public Article updateArticle(Long id, ArticleDto dto) {
        Article existing = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "要更新的文章不存在"));

        String now = LocalDateTime.now().format(FMT);
        existing.setTitle(dto.getTitle());
        existing.setSummary(dto.getSummary());
        existing.setContentMd(dto.getContentMd());
        existing.setCoverUrl(dto.getCoverUrl());
        if (dto.getCategory() != null) {
            existing.setCategory(dto.getCategory());
        }
        if (dto.getTags() != null) {
            existing.setTags(dto.getTags());
        }
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }
        existing.setUpdatedAt(now);

        return articleRepository.save(existing);
    }

    public void deleteArticle(Long id) {
        boolean ok = articleRepository.deleteById(id);
        if (!ok) {
            throw new BusinessException(404, "要删除的文章不存在");
        }
    }

    public Map<String, Object> getAdminStats() {
        List<Article> all = articleRepository.findAll();
        long totalArticles = all.size();
        long publishedCount = all.stream().filter(a -> a.getStatus() != null && a.getStatus() == 1).count();
        long draftCount = totalArticles - publishedCount;
        long totalViews = all.stream().mapToLong(a -> a.getViews() != null ? a.getViews() : 0).sum();

        return Map.of(
                "totalArticles", totalArticles,
                "publishedCount", publishedCount,
                "draftCount", draftCount,
                "totalViews", totalViews
        );
    }
}
