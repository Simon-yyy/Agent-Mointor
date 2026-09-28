package com.myblog.backend.aimodel.dto;

/**
 * 官方最新动态线索 DTO（公开层：供访客透明查看原厂捕获动态，标明待核实状态）
 */
public class OfficialUpdateDto {
    private Long id;
    private Long vendorId;
    private String vendorName;
    private String vendorSlug;
    private String brandColor;
    private String title;
    private String sourceUrl;
    private String canonicalUrl;
    private String publishedAt;
    private String firstSeenAt;
    private String processStatus; // PENDING, PROCESSED, IGNORED
    private boolean candidateGenerated;
    private String category; // MODEL_RELEASE, PRODUCT_FEATURE, API_PRICING, OPEN_SOURCE, DEV_TOOLS, GENERAL_NEWS
    private String categoryName;
    private String summaryZh;
    private boolean dateUncertain; // 追加 17: 发布日与首次抓取日同日时, 日期来源为回填, 展示为"日期待核实"

    public OfficialUpdateDto() {}

    public boolean isDateUncertain() { return dateUncertain; }
    public void setDateUncertain(boolean dateUncertain) { this.dateUncertain = dateUncertain; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorSlug() { return vendorSlug; }
    public void setVendorSlug(String vendorSlug) { this.vendorSlug = vendorSlug; }

    public String getBrandColor() { return brandColor; }
    public void setBrandColor(String brandColor) { this.brandColor = brandColor; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getCanonicalUrl() { return canonicalUrl; }
    public void setCanonicalUrl(String canonicalUrl) { this.canonicalUrl = canonicalUrl; }

    public String getPublishedAt() { return publishedAt; }
    public void setPublishedAt(String publishedAt) { this.publishedAt = publishedAt; }

    public String getFirstSeenAt() { return firstSeenAt; }
    public void setFirstSeenAt(String firstSeenAt) { this.firstSeenAt = firstSeenAt; }

    public String getProcessStatus() { return processStatus; }
    public void setProcessStatus(String processStatus) { this.processStatus = processStatus; }

    public boolean isCandidateGenerated() { return candidateGenerated; }
    public void setCandidateGenerated(boolean candidateGenerated) { this.candidateGenerated = candidateGenerated; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getSummaryZh() { return summaryZh; }
    public void setSummaryZh(String summaryZh) { this.summaryZh = summaryZh; }
}
