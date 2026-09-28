package com.myblog.backend.aimodel.service;

import com.myblog.backend.aimodel.catalog.adapter.EpochAiBenchmarkAdapter;
import com.myblog.backend.aimodel.model.ModelBenchmark;
import com.myblog.backend.aimodel.repository.ModelBenchmarkRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 模型基准评测服务 (方案阶段 4)
 */
@Service
public class ModelBenchmarkService {

    private final ModelBenchmarkRepository benchmarkRepository;
    private final EpochAiBenchmarkAdapter benchmarkAdapter;

    public ModelBenchmarkService(ModelBenchmarkRepository benchmarkRepository,
                                 EpochAiBenchmarkAdapter benchmarkAdapter) {
        this.benchmarkRepository = benchmarkRepository;
        this.benchmarkAdapter = benchmarkAdapter;
    }

    /**
     * 查询指定模型全部基准评测
     */
    public List<ModelBenchmark> getBenchmarksByModelId(Long modelId) {
        return benchmarkRepository.findByModelId(modelId);
    }

    /**
     * 查询评测天梯榜单
     */
    public List<ModelBenchmark> getLeaderboard(String suite, String sortBy, int limit) {
        return benchmarkRepository.getLeaderboard(suite, sortBy, limit);
    }

    /**
     * 手动触发同步 Epoch AI 评测战绩
     */
    public int triggerEpochAiSync() {
        return benchmarkAdapter.syncBenchmarks();
    }
}
