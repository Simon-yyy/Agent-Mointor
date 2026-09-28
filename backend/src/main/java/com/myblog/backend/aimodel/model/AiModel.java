package com.myblog.backend.aimodel.model;

/**
 * AI 模型档案实体
 */
public class AiModel {
    private Long id;
    private Long vendorId;
    private String modelKey;
    private String displayName;
    private String series;
    private String version;
    private String modalities;
    private String availabilityStatus;
    private String createdAt;

    // 关联显示
    private String vendorName;
    private String vendorSlug;
    private String brandColor;

    public AiModel() {}

    public AiModel(Long id, Long vendorId, String modelKey, String displayName, String series,
                   String version, String modalities, String availabilityStatus, String createdAt) {
        this.id = id;
        this.vendorId = vendorId;
        this.modelKey = modelKey;
        this.displayName = displayName;
        this.series = series;
        this.version = version;
        this.modalities = modalities;
        this.availabilityStatus = availabilityStatus;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getModelKey() { return modelKey; }
    public void setModelKey(String modelKey) { this.modelKey = modelKey; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getSeries() { return series; }
    public void setSeries(String series) { this.series = series; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getModalities() { return modalities; }
    public void setModalities(String modalities) { this.modalities = modalities; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorSlug() { return vendorSlug; }
    public void setVendorSlug(String vendorSlug) { this.vendorSlug = vendorSlug; }

    public String getBrandColor() { return brandColor; }
    public void setBrandColor(String brandColor) { this.brandColor = brandColor; }
}
