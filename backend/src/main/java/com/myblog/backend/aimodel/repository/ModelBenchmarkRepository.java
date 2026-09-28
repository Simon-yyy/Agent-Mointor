package com.myblog.backend.aimodel.repository;

import com.myblog.backend.aimodel.model.ModelBenchmark;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.List;

@Repository
public class ModelBenchmarkRepository {

    private final JdbcTemplate jdbcTemplate;

    public ModelBenchmarkRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<ModelBenchmark> rowMapper = (rs, rowNum) -> {
        ModelBenchmark b = new ModelBenchmark();
        b.setId(rs.getLong("id"));
        b.setModelId(rs.getLong("model_id"));
        b.setBenchmarkSuite(rs.getString("benchmark_suite"));
        b.setMmluPro(rs.getBigDecimal("mmlu_pro"));
        b.setMath500(rs.getBigDecimal("math_500"));
        b.setSweBenchVerified(rs.getBigDecimal("swe_bench_verified"));
        b.setGpqaDiamond(rs.getBigDecimal("gpqa_diamond"));
        b.setLivecodebench(rs.getBigDecimal("livecodebench"));
        b.setArenaElo(rs.getBigDecimal("arena_elo"));
        Date d = rs.getDate("eval_date");
        if (d != null) {
            b.setEvalDate(d.toLocalDate());
        }
        b.setSourceUrl(rs.getString("source_url"));
        b.setRawScores(rs.getString("raw_scores"));
        if (rs.getTimestamp("created_at") != null) {
            b.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }
        if (rs.getTimestamp("updated_at") != null) {
            b.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        // 联合查询字段容错映射
        try {
            b.setModelName(rs.getString("display_name"));
            b.setModelKey(rs.getString("model_key"));
            b.setVendorName(rs.getString("vendor_name"));
        } catch (Exception ignored) {}

        return b;
    };

    /**
     * 查询指定模型的所有评测集得分
     */
    public List<ModelBenchmark> findByModelId(Long modelId) {
        String sql = "SELECT b.*, m.display_name, m.model_key, v.name AS vendor_name " +
                "FROM `model_benchmarks` b " +
                "JOIN `ai_models` m ON b.model_id = m.id " +
                "LEFT JOIN `model_vendors` v ON m.vendor_id = v.id " +
                "WHERE b.model_id = ? AND b.verified = 1 " +
                "ORDER BY b.eval_date DESC";
        return jdbcTemplate.query(sql, rowMapper, modelId);
    }

    /**
     * 获取全网评测天梯榜 (默认按 arena_elo 降序，支持动态指标排序)
     */
    public List<ModelBenchmark> getLeaderboard(String suite, String sortBy, int limit) {
        String safeSuite = (suite != null && !suite.isBlank()) ? suite : "EPOCH_AI";
        String orderCol = "b.arena_elo";
        if ("swe_bench".equalsIgnoreCase(sortBy)) {
            orderCol = "b.swe_bench_verified";
        } else if ("math_500".equalsIgnoreCase(sortBy)) {
            orderCol = "b.math_500";
        } else if ("mmlu_pro".equalsIgnoreCase(sortBy)) {
            orderCol = "b.mmlu_pro";
        } else if ("gpqa_diamond".equalsIgnoreCase(sortBy)) {
            orderCol = "b.gpqa_diamond";
        } else if ("livecodebench".equalsIgnoreCase(sortBy)) {
            orderCol = "b.livecodebench";
        }

        String sql = "SELECT b.*, m.display_name, m.model_key, v.name AS vendor_name " +
                "FROM `model_benchmarks` b " +
                "JOIN `ai_models` m ON b.model_id = m.id " +
                "LEFT JOIN `model_vendors` v ON m.vendor_id = v.id " +
                "WHERE b.benchmark_suite = ? AND b.verified = 1 " +
                "ORDER BY (CASE WHEN " + orderCol + " IS NULL THEN 1 ELSE 0 END), " + orderCol + " DESC LIMIT ?";
        return jdbcTemplate.query(sql, rowMapper, safeSuite, Math.max(1, Math.min(limit, 100)));
    }

    /**
     * 写入或更新评测事实
     */
    public void upsert(ModelBenchmark b) {
        String sql = "INSERT INTO `model_benchmarks` " +
                "(`model_id`, `benchmark_suite`, `mmlu_pro`, `math_500`, `swe_bench_verified`, `gpqa_diamond`, `livecodebench`, `arena_elo`, `eval_date`, `source_url`, `raw_scores`, `created_at`, `updated_at`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3)) " +
                "ON DUPLICATE KEY UPDATE " +
                "`mmlu_pro` = COALESCE(VALUES(`mmlu_pro`), `mmlu_pro`), " +
                "`math_500` = COALESCE(VALUES(`math_500`), `math_500`), " +
                "`swe_bench_verified` = COALESCE(VALUES(`swe_bench_verified`), `swe_bench_verified`), " +
                "`gpqa_diamond` = COALESCE(VALUES(`gpqa_diamond`), `gpqa_diamond`), " +
                "`livecodebench` = COALESCE(VALUES(`livecodebench`), `livecodebench`), " +
                "`arena_elo` = COALESCE(VALUES(`arena_elo`), `arena_elo`), " +
                "`eval_date` = COALESCE(VALUES(`eval_date`), `eval_date`), " +
                "`source_url` = COALESCE(VALUES(`source_url`), `source_url`), " +
                "`raw_scores` = COALESCE(VALUES(`raw_scores`), `raw_scores`), " +
                "`updated_at` = NOW(3)";

        Date sqlDate = b.getEvalDate() != null ? Date.valueOf(b.getEvalDate()) : null;
        jdbcTemplate.update(sql, b.getModelId(), b.getBenchmarkSuite(), b.getMmluPro(), b.getMath500(),
                b.getSweBenchVerified(), b.getGpqaDiamond(), b.getLivecodebench(), b.getArenaElo(),
                sqlDate, b.getSourceUrl(), b.getRawScores());
    }
}
