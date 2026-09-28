package com.myblog.backend.aimodel.catalog;

import java.math.BigDecimal;

/**
 * 上游模型归一化中间对象 (Catalog Draft)
 */
public class CatalogModelDraft {
    private String upstreamModelId;
    private String rawVendor;
    private String rawName;
    private String contextLength;
    private String releaseDate;
    private BigDecimal pricingInputPerM;
    private BigDecimal pricingOutputPerM;
    private BigDecimal pricingCachedPerM;
    private String modality;
    private String rawJson;

    public CatalogModelDraft() {}

    public CatalogModelDraft(String upstreamModelId, String rawVendor, String rawName,
                             String contextLength, String modality, String rawJson) {
        this.upstreamModelId = upstreamModelId;
        this.rawVendor = rawVendor;
        this.rawName = rawName;
        this.contextLength = contextLength;
        this.modality = modality;
        this.rawJson = rawJson;
    }

    public String getUpstreamModelId() { return upstreamModelId; }
    public void setUpstreamModelId(String upstreamModelId) { this.upstreamModelId = upstreamModelId; }

    public String getRawVendor() { return rawVendor; }
    public void setRawVendor(String rawVendor) { this.rawVendor = rawVendor; }

    public String getRawName() { return rawName; }
    public void setRawName(String rawName) { this.rawName = rawName; }

    public String getContextLength() { return contextLength; }
    public void setContextLength(String contextLength) { this.contextLength = contextLength; }

    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }

    public BigDecimal getPricingInputPerM() { return pricingInputPerM; }
    public void setPricingInputPerM(BigDecimal pricingInputPerM) { this.pricingInputPerM = pricingInputPerM; }

    public BigDecimal getPricingOutputPerM() { return pricingOutputPerM; }
    public void setPricingOutputPerM(BigDecimal pricingOutputPerM) { this.pricingOutputPerM = pricingOutputPerM; }

    public BigDecimal getPricingCachedPerM() { return pricingCachedPerM; }
    public void setPricingCachedPerM(BigDecimal pricingCachedPerM) { this.pricingCachedPerM = pricingCachedPerM; }

    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }

    public String getRawJson() { return rawJson; }
    public void setRawJson(String rawJson) { this.rawJson = rawJson; }
}
