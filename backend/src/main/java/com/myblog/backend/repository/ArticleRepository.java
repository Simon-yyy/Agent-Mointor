package com.myblog.backend.repository;

import com.myblog.backend.model.Article;
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
 * 文章数据仓储层 (基于 MySQL + JdbcTemplate + Druid)
 */
@Repository
public class ArticleRepository {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final JdbcTemplate jdbcTemplate;

    public ArticleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Article> articleRowMapper = new RowMapper<>() {
        @Override
        public Article mapRow(ResultSet rs, int rowNum) throws SQLException {
            Long id = rs.getLong("id");
            String title = rs.getString("title");
            String summary = rs.getString("summary");
            String contentMd = rs.getString("content_md");
            String coverUrl = rs.getString("cover_url");
            String category = rs.getString("category");
            String rawTags = rs.getString("tags");
            List<String> tags = (rawTags == null || rawTags.isBlank())
                    ? Collections.emptyList()
                    : Arrays.stream(rawTags.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
            Integer status = rs.getInt("status");
            Long views = rs.getLong("views");

            Timestamp createdTs = rs.getTimestamp("created_at");
            Timestamp updatedTs = rs.getTimestamp("updated_at");
            String createdAt = createdTs != null ? createdTs.toLocalDateTime().format(FMT) : null;
            String updatedAt = updatedTs != null ? updatedTs.toLocalDateTime().format(FMT) : null;

            return new Article(id, title, summary, contentMd, coverUrl, category, tags, status, views, createdAt, updatedAt);
        }
    };

    public List<Article> findAll() {
        String sql = "SELECT * FROM `articles` ORDER BY `created_at` DESC";
        return jdbcTemplate.query(sql, articleRowMapper);
    }

    public Optional<Article> findById(Long id) {
        if (id == null) return Optional.empty();
        String sql = "SELECT * FROM `articles` WHERE `id` = ?";
        List<Article> list = jdbcTemplate.query(sql, articleRowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Article save(Article article) {
        String tagsJoined = (article.getTags() != null && !article.getTags().isEmpty())
                ? String.join(",", article.getTags())
                : "";
        LocalDateTime now = LocalDateTime.now();

        if (article.getId() == null) {
            String sql = "INSERT INTO `articles` (`title`, `summary`, `content_md`, `cover_url`, `category`, `tags`, `status`, `views`, `created_at`, `updated_at`) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql,
                    article.getTitle(),
                    article.getSummary(),
                    article.getContentMd(),
                    article.getCoverUrl(),
                    article.getCategory(),
                    tagsJoined,
                    article.getStatus() != null ? article.getStatus() : 1,
                    article.getViews() != null ? article.getViews() : 0L,
                    Timestamp.valueOf(now),
                    Timestamp.valueOf(now));

            Long generatedId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
            article.setId(generatedId);
            article.setCreatedAt(now.format(FMT));
            article.setUpdatedAt(now.format(FMT));
        } else {
            String sql = "UPDATE `articles` SET `title` = ?, `summary` = ?, `content_md` = ?, `cover_url` = ?, `category` = ?, `tags` = ?, `status` = ?, `updated_at` = ? " +
                         "WHERE `id` = ?";
            jdbcTemplate.update(sql,
                    article.getTitle(),
                    article.getSummary(),
                    article.getContentMd(),
                    article.getCoverUrl(),
                    article.getCategory(),
                    tagsJoined,
                    article.getStatus() != null ? article.getStatus() : 1,
                    Timestamp.valueOf(now),
                    article.getId());
            article.setUpdatedAt(now.format(FMT));
        }
        return article;
    }

    public boolean deleteById(Long id) {
        if (id == null) return false;
        String sql = "DELETE FROM `articles` WHERE `id` = ?";
        int rows = jdbcTemplate.update(sql, id);
        return rows > 0;
    }

    public void incrementViews(Long id) {
        if (id == null) return;
        String sql = "UPDATE `articles` SET `views` = `views` + 1 WHERE `id` = ?";
        jdbcTemplate.update(sql, id);
    }

    public List<Article> query(Integer status, String keyword, String tag, String category) {
        StringBuilder sql = new StringBuilder("SELECT * FROM `articles` WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (status != null) {
            sql.append("AND `status` = ? ");
            params.add(status);
        }
        if (keyword != null && !keyword.isBlank()) {
            sql.append("AND (`title` LIKE ? OR `summary` LIKE ? OR `content_md` LIKE ?) ");
            String kw = "%" + keyword.trim() + "%";
            params.add(kw);
            params.add(kw);
            params.add(kw);
        }
        if (tag != null && !tag.isBlank()) {
            sql.append("AND FIND_IN_SET(?, `tags`) ");
            params.add(tag.trim());
        }
        if (category != null && !category.isBlank()) {
            sql.append("AND `category` = ? ");
            params.add(category.trim());
        }

        sql.append("ORDER BY `created_at` DESC");
        return jdbcTemplate.query(sql.toString(), articleRowMapper, params.toArray());
    }

    public Map<String, Long> countCategories() {
        String sql = "SELECT `category`, COUNT(*) as cnt FROM `articles` WHERE `status` = 1 AND `category` IS NOT NULL AND `category` != '' GROUP BY `category`";
        Map<String, Long> map = new LinkedHashMap<>();
        jdbcTemplate.query(sql, (rs) -> {
            map.put(rs.getString("category"), rs.getLong("cnt"));
        });
        return map;
    }

    public Map<String, Long> countTags() {
        // 通过查询全部有效标签并在内存聚合
        List<Article> articles = query(1, null, null, null);
        Map<String, Long> map = new LinkedHashMap<>();
        for (Article a : articles) {
            if (a.getTags() != null) {
                for (String t : a.getTags()) {
                    if (!t.isBlank()) {
                        map.put(t, map.getOrDefault(t, 0L) + 1L);
                    }
                }
            }
        }
        return map;
    }
}
