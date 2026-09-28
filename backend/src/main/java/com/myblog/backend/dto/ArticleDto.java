package com.myblog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * 创建/更新文章提交的 DTO
 */
public class ArticleDto {

    @NotBlank(message = "文章标题不能为空")
    private String title;

    private String summary;

    @NotBlank(message = "文章内容不能为空")
    private String contentMd;

    private String coverUrl;

    private String category;

    private List<String> tags;

    private Integer status; // 0 草稿, 1 已发布

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
}
