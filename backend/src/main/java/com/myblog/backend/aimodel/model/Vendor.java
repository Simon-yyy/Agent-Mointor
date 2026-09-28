package com.myblog.backend.aimodel.model;

/**
 * AI 厂商实体
 */
public class Vendor {
    private Long id;
    private String slug;
    private String name;
    private String region;
    private String brandColor;
    private String websiteUrl;
    private Boolean isActive;
    private String createdAt;
    private Integer activeSourcesCount = 0;
    private Integer confirmedEventsCount = 0;

    public Vendor() {}

    public Vendor(Long id, String slug, String name, String region, String brandColor, String websiteUrl, Boolean isActive, String createdAt) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.region = region;
        this.brandColor = brandColor;
        this.websiteUrl = websiteUrl;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Integer getActiveSourcesCount() { return activeSourcesCount; }
    public void setActiveSourcesCount(Integer activeSourcesCount) { this.activeSourcesCount = activeSourcesCount; }

    public Integer getConfirmedEventsCount() { return confirmedEventsCount; }
    public void setConfirmedEventsCount(Integer confirmedEventsCount) { this.confirmedEventsCount = confirmedEventsCount; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getBrandColor() { return brandColor; }
    public void setBrandColor(String brandColor) { this.brandColor = brandColor; }

    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
