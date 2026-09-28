package com.myblog.backend.aimodel.model;

/**
 * 官方证据链接
 */
public class EventEvidence {
    private Long id;
    private Long eventId;
    private Long sourceItemId;
    private String officialUrl;
    private String title;
    private String createdAt;

    public EventEvidence() {}

    public EventEvidence(Long id, Long eventId, Long sourceItemId, String officialUrl, String title, String createdAt) {
        this.id = id;
        this.eventId = eventId;
        this.sourceItemId = sourceItemId;
        this.officialUrl = officialUrl;
        this.title = title;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getSourceItemId() { return sourceItemId; }
    public void setSourceItemId(Long sourceItemId) { this.sourceItemId = sourceItemId; }

    public String getOfficialUrl() { return officialUrl; }
    public void setOfficialUrl(String officialUrl) { this.officialUrl = officialUrl; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
