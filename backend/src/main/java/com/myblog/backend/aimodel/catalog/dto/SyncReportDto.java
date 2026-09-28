package com.myblog.backend.aimodel.catalog.dto;

import java.util.List;

/**
 * 目录聚合同步审计综合报告 DTO
 */
public class SyncReportDto {
    private String sourceKey;
    private int fetchedCount;
    private int matchedCount;
    private int autoPublishedCount;
    private int conflictCount;
    private double pricingCoverage;
    private double dateCoverage;
    private boolean passedGates;
    private String blockedReason;
    private List<String> warnings;
    private String syncTime;
    private boolean autoPublishEnabled;

    public SyncReportDto() {}

    public boolean isAutoPublishEnabled() { return autoPublishEnabled; }
    public void setAutoPublishEnabled(boolean autoPublishEnabled) { this.autoPublishEnabled = autoPublishEnabled; }

    public String getSourceKey() { return sourceKey; }
    public void setSourceKey(String sourceKey) { this.sourceKey = sourceKey; }

    public int getFetchedCount() { return fetchedCount; }
    public void setFetchedCount(int fetchedCount) { this.fetchedCount = fetchedCount; }

    public int getMatchedCount() { return matchedCount; }
    public void setMatchedCount(int matchedCount) { this.matchedCount = matchedCount; }

    public int getAutoPublishedCount() { return autoPublishedCount; }
    public void setAutoPublishedCount(int autoPublishedCount) { this.autoPublishedCount = autoPublishedCount; }

    public int getConflictCount() { return conflictCount; }
    public void setConflictCount(int conflictCount) { this.conflictCount = conflictCount; }

    public double getPricingCoverage() { return pricingCoverage; }
    public void setPricingCoverage(double pricingCoverage) { this.pricingCoverage = pricingCoverage; }

    public double getDateCoverage() { return dateCoverage; }
    public void setDateCoverage(double dateCoverage) { this.dateCoverage = dateCoverage; }

    public boolean isPassedGates() { return passedGates; }
    public void setPassedGates(boolean passedGates) { this.passedGates = passedGates; }

    public String getBlockedReason() { return blockedReason; }
    public void setBlockedReason(String blockedReason) { this.blockedReason = blockedReason; }

    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }

    public String getSyncTime() { return syncTime; }
    public void setSyncTime(String syncTime) { this.syncTime = syncTime; }
}
