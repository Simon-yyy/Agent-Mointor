package com.myblog.backend.aimodel.model;

/**
 * 待审核模型发现候选实体
 */
public class ModelDiscoveryCandidate {
    private Long id;
    private String sourceName;
    private String externalModelId;
    private String guessVendorName;
    private String guessModelName;
    private String rawTitle;
    private String rawSummary;
    private String evidenceUrl;
    private String upstreamDate;
    private String firstSeenAt;
    private String status; // PENDING, CONFIRMED, REJECTED
    private String reviewerNote;
    private String reviewedAt;
    private String createdAt;

    public ModelDiscoveryCandidate() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getExternalModelId() {
        return externalModelId;
    }

    public void setExternalModelId(String externalModelId) {
        this.externalModelId = externalModelId;
    }

    public String getGuessVendorName() {
        return guessVendorName;
    }

    public void setGuessVendorName(String guessVendorName) {
        this.guessVendorName = guessVendorName;
    }

    public String getGuessModelName() {
        return guessModelName;
    }

    public void setGuessModelName(String guessModelName) {
        this.guessModelName = guessModelName;
    }

    public String getRawTitle() {
        return rawTitle;
    }

    public void setRawTitle(String rawTitle) {
        this.rawTitle = rawTitle;
    }

    public String getRawSummary() {
        return rawSummary;
    }

    public void setRawSummary(String rawSummary) {
        this.rawSummary = rawSummary;
    }

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public void setEvidenceUrl(String evidenceUrl) {
        this.evidenceUrl = evidenceUrl;
    }

    public String getUpstreamDate() {
        return upstreamDate;
    }

    public void setUpstreamDate(String upstreamDate) {
        this.upstreamDate = upstreamDate;
    }

    public String getFirstSeenAt() {
        return firstSeenAt;
    }

    public void setFirstSeenAt(String firstSeenAt) {
        this.firstSeenAt = firstSeenAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReviewerNote() {
        return reviewerNote;
    }

    public void setReviewerNote(String reviewerNote) {
        this.reviewerNote = reviewerNote;
    }

    public String getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(String reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
