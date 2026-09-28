package com.myblog.backend.model;

import java.util.ArrayList;
import java.util.List;

/**
 * 作品/项目实体
 */
public class Work {

    private Long id;
    private String title;
    private String description;
    private String coverUrl;
    private String demoUrl;
    private String githubUrl;
    private List<String> techStack = new ArrayList<>();
    private Integer sortOrder = 0;
    private String createdAt;

    public Work() {
    }

    public Work(Long id, String title, String description, String coverUrl, String demoUrl,
                String githubUrl, List<String> techStack, Integer sortOrder, String createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.coverUrl = coverUrl;
        this.demoUrl = demoUrl;
        this.githubUrl = githubUrl;
        this.techStack = techStack != null ? techStack : new ArrayList<>();
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.createdAt = createdAt;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public List<String> getTechStack() {
        return techStack;
    }

    public void setTechStack(List<String> techStack) {
        this.techStack = techStack;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
