package com.myblog.backend.aimodel.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * 历史回填任务 DTO (Backfill Job)
 */
public class BackfillJobDto {
    private String jobId;
    private String startDate; // 默认 2026-01-01 起
    private String endDate;
    private List<Long> vendorIds = new ArrayList<>();
    private boolean dryRun;
    private String status; // RUNNING, COMPLETED, FAILED
    private int sourcesProcessed;
    private int candidatesFound;
    private int confirmedEvents;
    private List<String> coverageGaps = new ArrayList<>();
    private String startTime;
    private String endTime;
    private List<String> logs = new ArrayList<>();

    public BackfillJobDto() {}

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public List<Long> getVendorIds() {
        return vendorIds;
    }

    public void setVendorIds(List<Long> vendorIds) {
        this.vendorIds = vendorIds;
    }

    public boolean isDryRun() {
        return dryRun;
    }

    public void setDryRun(boolean dryRun) {
        this.dryRun = dryRun;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getSourcesProcessed() {
        return sourcesProcessed;
    }

    public void setSourcesProcessed(int sourcesProcessed) {
        this.sourcesProcessed = sourcesProcessed;
    }

    public int getCandidatesFound() {
        return candidatesFound;
    }

    public void setCandidatesFound(int candidatesFound) {
        this.candidatesFound = candidatesFound;
    }

    public int getConfirmedEvents() {
        return confirmedEvents;
    }

    public void setConfirmedEvents(int confirmedEvents) {
        this.confirmedEvents = confirmedEvents;
    }

    public List<String> getCoverageGaps() {
        return coverageGaps;
    }

    public void setCoverageGaps(List<String> coverageGaps) {
        this.coverageGaps = coverageGaps;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public List<String> getLogs() {
        return logs;
    }

    public void setLogs(List<String> logs) {
        this.logs = logs;
    }
}
