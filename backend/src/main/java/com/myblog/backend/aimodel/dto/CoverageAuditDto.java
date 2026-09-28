package com.myblog.backend.aimodel.dto;

import java.util.List;

/**
 * 厂商按月份覆盖审计数据传输对象
 */
public class CoverageAuditDto {
    private Long vendorId;
    private String vendorName;
    private String vendorSlug;
    private String brandColor;
    private String coverageMonth; // YYYY-MM
    private String status;        // FULL, PARTIAL, NONE
    private int sourcesScanned;
    private String earliestItemDate;
    private String latestItemDate;
    private int candidatesCount;
    private String gapNotes;

    public CoverageAuditDto() {}

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorSlug() { return vendorSlug; }
    public void setVendorSlug(String vendorSlug) { this.vendorSlug = vendorSlug; }

    public String getBrandColor() { return brandColor; }
    public void setBrandColor(String brandColor) { this.brandColor = brandColor; }

    public String getCoverageMonth() { return coverageMonth; }
    public void setCoverageMonth(String coverageMonth) { this.coverageMonth = coverageMonth; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getSourcesScanned() { return sourcesScanned; }
    public void setSourcesScanned(int sourcesScanned) { this.sourcesScanned = sourcesScanned; }

    public String getEarliestItemDate() { return earliestItemDate; }
    public void setEarliestItemDate(String earliestItemDate) { this.earliestItemDate = earliestItemDate; }

    public String getLatestItemDate() { return latestItemDate; }
    public void setLatestItemDate(String latestItemDate) { this.latestItemDate = latestItemDate; }

    public int getCandidatesCount() { return candidatesCount; }
    public void setCandidatesCount(int candidatesCount) { this.candidatesCount = candidatesCount; }

    public String getGapNotes() { return gapNotes; }
    public void setGapNotes(String gapNotes) { this.gapNotes = gapNotes; }
}
