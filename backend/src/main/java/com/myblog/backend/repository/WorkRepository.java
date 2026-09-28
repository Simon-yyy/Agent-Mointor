package com.myblog.backend.repository;

import com.myblog.backend.model.Work;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 作品数据仓储层 (基于 MySQL + JdbcTemplate + Druid)
 */
@Repository
public class WorkRepository {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final JdbcTemplate jdbcTemplate;

    public WorkRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Work> workRowMapper = new RowMapper<>() {
        @Override
        public Work mapRow(ResultSet rs, int rowNum) throws SQLException {
            Long id = rs.getLong("id");
            String title = rs.getString("title");
            String description = rs.getString("description");
            String coverUrl = rs.getString("cover_url");
            String demoUrl = rs.getString("demo_url");
            String githubUrl = rs.getString("github_url");
            String rawStack = rs.getString("tech_stack");
            List<String> techStack = (rawStack == null || rawStack.isBlank())
                    ? Collections.emptyList()
                    : Arrays.stream(rawStack.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
            Integer sortOrder = rs.getInt("sort_order");

            Timestamp createdTs = rs.getTimestamp("created_at");
            String createdAt = createdTs != null ? createdTs.toLocalDateTime().format(FMT) : null;

            return new Work(id, title, description, coverUrl, demoUrl, githubUrl, techStack, sortOrder, createdAt);
        }
    };

    public List<Work> findAll() {
        String sql = "SELECT * FROM `works` ORDER BY `sort_order` ASC, `created_at` DESC";
        return jdbcTemplate.query(sql, workRowMapper);
    }

    public Optional<Work> findById(Long id) {
        if (id == null) return Optional.empty();
        String sql = "SELECT * FROM `works` WHERE `id` = ?";
        List<Work> list = jdbcTemplate.query(sql, workRowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Work save(Work work) {
        String stackJoined = (work.getTechStack() != null && !work.getTechStack().isEmpty())
                ? String.join(",", work.getTechStack())
                : "";
        LocalDateTime now = LocalDateTime.now();

        if (work.getId() == null) {
            String sql = "INSERT INTO `works` (`title`, `description`, `cover_url`, `demo_url`, `github_url`, `tech_stack`, `sort_order`, `created_at`) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql,
                    work.getTitle(),
                    work.getDescription(),
                    work.getCoverUrl(),
                    work.getDemoUrl(),
                    work.getGithubUrl(),
                    stackJoined,
                    work.getSortOrder() != null ? work.getSortOrder() : 0,
                    Timestamp.valueOf(now));

            Long generatedId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
            work.setId(generatedId);
            work.setCreatedAt(now.format(FMT));
        } else {
            String sql = "UPDATE `works` SET `title` = ?, `description` = ?, `cover_url` = ?, `demo_url` = ?, `github_url` = ?, `tech_stack` = ?, `sort_order` = ? " +
                         "WHERE `id` = ?";
            jdbcTemplate.update(sql,
                    work.getTitle(),
                    work.getDescription(),
                    work.getCoverUrl(),
                    work.getDemoUrl(),
                    work.getGithubUrl(),
                    stackJoined,
                    work.getSortOrder() != null ? work.getSortOrder() : 0,
                    work.getId());
        }
        return work;
    }

    public boolean deleteById(Long id) {
        if (id == null) return false;
        String sql = "DELETE FROM `works` WHERE `id` = ?";
        int rows = jdbcTemplate.update(sql, id);
        return rows > 0;
    }
}
