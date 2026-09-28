package com.myblog.backend.aimodel.model;

import java.util.ArrayList;
import java.util.List;

/**
 * 模型发布事件实体
 */
public class ModelEvent {
    private Long id;
    private Long modelId;
    private Long vendorId;
    private String eventType;
    private String stage;
    private String summary;
    private String releaseDate;
    private String datePrecision;
    private String firstSeenAt;
    private String reviewStatus;
    private String dedupKey;
    private String createdAt;

    // 方案阶段 7: 9大分类与论文元数据
    private String category;
    private String arxivId;
    private String paperUrl;
    private String technicalReportUrl;
    private String keyBreakthrough;

    // 关联显示
    private String modelName;
    private String modelKey;
    private String series;
    private String modalities;
    private String availabilityStatus;
    private String vendorName;
    private String vendorSlug;
    private String brandColor;
    private List<EventEvidence> evidences = new ArrayList<>();

    public ModelEvent() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }

    public String getDatePrecision() { return datePrecision; }
    public void setDatePrecision(String datePrecision) { this.datePrecision = datePrecision; }

    public String getFirstSeenAt() { return firstSeenAt; }
    public void setFirstSeenAt(String firstSeenAt) { this.firstSeenAt = firstSeenAt; }

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }

    public String getDedupKey() { return dedupKey; }
    public void setDedupKey(String dedupKey) { this.dedupKey = dedupKey; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getModelKey() { return modelKey; }
    public void setModelKey(String modelKey) { this.modelKey = modelKey; }

    public String getSeries() { return series; }
    public void setSeries(String series) { this.series = series; }

    public String getModalities() { return modalities; }
    public void setModalities(String modalities) { this.modalities = modalities; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorSlug() { return vendorSlug; }
    public void setVendorSlug(String vendorSlug) { this.vendorSlug = vendorSlug; }

    public String getBrandColor() { return brandColor; }
    public void setBrandColor(String brandColor) { this.brandColor = brandColor; }

    public List<EventEvidence> getEvidences() { return evidences; }
    public void setEvidences(List<EventEvidence> evidences) { this.evidences = evidences != null ? evidences : new ArrayList<>(); }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getArxivId() { return arxivId; }
    public void setArxivId(String arxivId) { this.arxivId = arxivId; }

    public String getPaperUrl() { return paperUrl; }
    public void setPaperUrl(String paperUrl) { this.paperUrl = paperUrl; }

    public String getTechnicalReportUrl() { return technicalReportUrl; }
    public void setTechnicalReportUrl(String technicalReportUrl) { this.technicalReportUrl = technicalReportUrl; }

    public String getKeyBreakthrough() { return keyBreakthrough; }
    public void setKeyBreakthrough(String keyBreakthrough) { this.keyBreakthrough = keyBreakthrough; }
}
