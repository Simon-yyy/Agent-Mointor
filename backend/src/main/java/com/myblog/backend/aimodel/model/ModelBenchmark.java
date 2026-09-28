package com.myblog.backend.aimodel.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * AI 模型多维基准评测事实实体 (方案阶段 4)
 */
public class ModelBenchmark {

    private Long id;
    private Long modelId;
    private String benchmarkSuite;
    private BigDecimal mmluPro;
    private BigDecimal math500;
    private BigDecimal sweBenchVerified;
    private BigDecimal gpqaDiamond;
    private BigDecimal livecodebench;
    private BigDecimal arenaElo;
    private LocalDate evalDate;
    private String sourceUrl;
    private String rawScores;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 联表展示用冗余字段
    private String modelName;
    private String modelKey;
    private String vendorName;

    public ModelBenchmark() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }

    public String getBenchmarkSuite() { return benchmarkSuite; }
    public void setBenchmarkSuite(String benchmarkSuite) { this.benchmarkSuite = benchmarkSuite; }

    public BigDecimal getMmluPro() { return mmluPro; }
    public void setMmluPro(BigDecimal mmluPro) { this.mmluPro = mmluPro; }

    public BigDecimal getMath500() { return math500; }
    public void setMath500(BigDecimal math500) { this.math500 = math500; }

    public BigDecimal getSweBenchVerified() { return sweBenchVerified; }
    public void setSweBenchVerified(BigDecimal sweBenchVerified) { this.sweBenchVerified = sweBenchVerified; }

    public BigDecimal getGpqaDiamond() { return gpqaDiamond; }
    public void setGpqaDiamond(BigDecimal gpqaDiamond) { this.gpqaDiamond = gpqaDiamond; }

    public BigDecimal getLivecodebench() { return livecodebench; }
    public void setLivecodebench(BigDecimal livecodebench) { this.livecodebench = livecodebench; }

    public BigDecimal getArenaElo() { return arenaElo; }
    public void setArenaElo(BigDecimal arenaElo) { this.arenaElo = arenaElo; }

    public LocalDate getEvalDate() { return evalDate; }
    public void setEvalDate(LocalDate evalDate) { this.evalDate = evalDate; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getRawScores() { return rawScores; }
    public void setRawScores(String rawScores) { this.rawScores = rawScores; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getModelKey() { return modelKey; }
    public void setModelKey(String modelKey) { this.modelKey = modelKey; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
}
