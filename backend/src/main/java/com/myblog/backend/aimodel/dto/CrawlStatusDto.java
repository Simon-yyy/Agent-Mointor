package com.myblog.backend.aimodel.dto;

/**
 * 监控采集状态响应 DTO
 */
public class CrawlStatusDto {
    private String lastCheckTime;
    private Integer totalVendors;
    private Integer activeSources;
    private Integer abnormalSources;
    private Integer totalEvents;
    private Integer totalModels;
    private Integer pendingCandidates;
    private String latestConfirmedRelease;
    private Integer contentHealthySources;
    private Integer slaLatencyP95Minutes;
    private java.util.Map<String, Integer> capabilityCounts;
    private java.util.List<java.util.Map<String, Object>> recentActiveVendors;

    public CrawlStatusDto() {}

    public CrawlStatusDto(String lastCheckTime, Integer totalVendors, Integer activeSources,
                          Integer abnormalSources, Integer totalEvents, Integer totalModels) {
        this.lastCheckTime = lastCheckTime;
        this.totalVendors = totalVendors;
        this.activeSources = activeSources;
        this.abnormalSources = abnormalSources;
        this.totalEvents = totalEvents;
        this.totalModels = totalModels;
    }

    public String getLastCheckTime() { return lastCheckTime; }
    public void setLastCheckTime(String lastCheckTime) { this.lastCheckTime = lastCheckTime; }

    public Integer getTotalVendors() { return totalVendors; }
    public void setTotalVendors(Integer totalVendors) { this.totalVendors = totalVendors; }

    public Integer getActiveSources() { return activeSources; }
    public void setActiveSources(Integer activeSources) { this.activeSources = activeSources; }

    public Integer getAbnormalSources() { return abnormalSources; }
    public void setAbnormalSources(Integer abnormalSources) { this.abnormalSources = abnormalSources; }

    public Integer getTotalEvents() { return totalEvents; }
    public void setTotalEvents(Integer totalEvents) { this.totalEvents = totalEvents; }

    public Integer getTotalModels() { return totalModels; }
    public void setTotalModels(Integer totalModels) { this.totalModels = totalModels; }

    public Integer getPendingCandidates() { return pendingCandidates; }
    public void setPendingCandidates(Integer pendingCandidates) { this.pendingCandidates = pendingCandidates; }

    public String getLatestConfirmedRelease() { return latestConfirmedRelease; }
    public void setLatestConfirmedRelease(String latestConfirmedRelease) { this.latestConfirmedRelease = latestConfirmedRelease; }

    public Integer getContentHealthySources() { return contentHealthySources; }
    public void setContentHealthySources(Integer contentHealthySources) { this.contentHealthySources = contentHealthySources; }

    public Integer getSlaLatencyP95Minutes() { return slaLatencyP95Minutes; }
    public void setSlaLatencyP95Minutes(Integer slaLatencyP95Minutes) { this.slaLatencyP95Minutes = slaLatencyP95Minutes; }

    public java.util.Map<String, Integer> getCapabilityCounts() { return capabilityCounts; }
    public void setCapabilityCounts(java.util.Map<String, Integer> capabilityCounts) { this.capabilityCounts = capabilityCounts; }

    public java.util.List<java.util.Map<String, Object>> getRecentActiveVendors() { return recentActiveVendors; }
    public void setRecentActiveVendors(java.util.List<java.util.Map<String, Object>> recentActiveVendors) { this.recentActiveVendors = recentActiveVendors; }
}
