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

    // 真实客观规格字段 (Flyway V18)
    private String summaryZh;
    private String officialReleaseDate;
    private String contextWindow;
    private String parameterSize;
    private String license;
    private String modelCardUrl;

    // 关联显示
    private String vendorName;
    private String vendorSlug;
    private String brandColor;
    private String vendorRegion;

    // 管线契约与血缘 (Flyway V23)
    private String releaseDatePrecision;
    private String factsProvenance;
    private java.math.BigDecimal pricingInputPerM;
    private java.math.BigDecimal pricingOutputPerM;
    private java.math.BigDecimal pricingCachedPerM;
    private String catalogStatus;

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

    public String getSummaryZh() { return summaryZh; }
    public void setSummaryZh(String summaryZh) { this.summaryZh = summaryZh; }

    public String getOfficialReleaseDate() { return officialReleaseDate; }
    public void setOfficialReleaseDate(String officialReleaseDate) { this.officialReleaseDate = officialReleaseDate; }

    public String getContextWindow() { return contextWindow; }
    public void setContextWindow(String contextWindow) { this.contextWindow = contextWindow; }

    public String getParameterSize() { return parameterSize; }
    public void setParameterSize(String parameterSize) { this.parameterSize = parameterSize; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getModelCardUrl() { return modelCardUrl; }
    public void setModelCardUrl(String modelCardUrl) { this.modelCardUrl = modelCardUrl; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorSlug() { return vendorSlug; }
    public void setVendorSlug(String vendorSlug) { this.vendorSlug = vendorSlug; }

    public String getBrandColor() { return brandColor; }
    public void setBrandColor(String brandColor) { this.brandColor = brandColor; }

    public String getVendorRegion() { return vendorRegion; }
    public void setVendorRegion(String vendorRegion) { this.vendorRegion = vendorRegion; }

    public String getReleaseDatePrecision() { return releaseDatePrecision; }
    public void setReleaseDatePrecision(String releaseDatePrecision) { this.releaseDatePrecision = releaseDatePrecision; }

    public String getFactsProvenance() { return factsProvenance; }
    public void setFactsProvenance(String factsProvenance) { this.factsProvenance = factsProvenance; }

    public java.math.BigDecimal getPricingInputPerM() { return pricingInputPerM; }
    public void setPricingInputPerM(java.math.BigDecimal pricingInputPerM) { this.pricingInputPerM = pricingInputPerM; }

    public java.math.BigDecimal getPricingOutputPerM() { return pricingOutputPerM; }
    public void setPricingOutputPerM(java.math.BigDecimal pricingOutputPerM) { this.pricingOutputPerM = pricingOutputPerM; }

    public java.math.BigDecimal getPricingCachedPerM() { return pricingCachedPerM; }
    public void setPricingCachedPerM(java.math.BigDecimal pricingCachedPerM) { this.pricingCachedPerM = pricingCachedPerM; }

    public String getCatalogStatus() { return catalogStatus; }
    public void setCatalogStatus(String catalogStatus) { this.catalogStatus = catalogStatus; }
}
