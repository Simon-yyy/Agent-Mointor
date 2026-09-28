package com.myblog.backend.model;

import java.util.ArrayList;
import java.util.List;

/**
 * 博客文章领域实体
 */
public class Article {

    private Long id;
    private String title;
    private String summary;
    private String contentMd;
    private String coverUrl;
    private String category;
    private List<String> tags = new ArrayList<>();
    /**
     * 状态：0-草稿，1-已发布
     */
    private Integer status = 1;
    private Long views = 0L;
    private String createdAt;
    private String updatedAt;

    public Article() {
    }

    public Article(Long id, String title, String summary, String contentMd, String coverUrl,
                   String category, List<String> tags, Integer status, Long views,
                   String createdAt, String updatedAt) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.contentMd = contentMd;
        this.coverUrl = coverUrl;
        this.category = category;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.status = status != null ? status : 1;
        this.views = views != null ? views : 0L;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getContentMd() {
        return contentMd;
    }

    public void setContentMd(String contentMd) {
        this.contentMd = contentMd;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Long getViews() {
        return views;
    }

    public void setViews(Long views) {
        this.views = views;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
