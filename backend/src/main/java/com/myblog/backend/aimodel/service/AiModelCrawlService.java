package com.myblog.backend.aimodel.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AI 模型发布官方来源真实采集、报文解析与候选发现服务
 * 负责调度巡检官方发布渠道、解析 RSS/Atom 存入 source_items 并生成待审候选
 */
@Service
public class AiModelCrawlService {

    private static final Logger log = LoggerFactory.getLogger(AiModelCrawlService.class);

    private final JdbcTemplate jdbcTemplate;
    private final HttpClient httpClient;

    public AiModelCrawlService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    /**
     * 自适应高频轮询任务：每 5 分钟轮询一次已到期的官方来源 (高频源 5 分钟，普通源 15 分钟)
     */
    @Scheduled(fixedRate = 300000, initialDelay = 15000)
    public void scheduledAdaptiveCrawl() {
        runCrawlJob(false);
    }

    public synchronized Map<String, Object> runCrawlJob() {
        return runCrawlJob(true);
    }

    /**
     * 核心采集与自适应巡检调度任务 (支持条件请求 ETag / If-Modified-Since、内容健康度监测与四维时间戳)
     * @param forceAll 是否强制检查所有来源 (忽略 next_check_time)
     */
    public synchronized Map<String, Object> runCrawlJob(boolean forceAll) {
        LocalDateTime startTime = LocalDateTime.now();
        log.info(">> [ADAPTIVE CRAWLER] 启动 AI 官方来源调度任务 (forceAll={}): {}", forceAll, startTime);

        // 1. 初始化 crawl_runs 运行记录
        String insertRunSql = "INSERT INTO `crawl_runs` (`start_time`, `status`, `sources_checked`) VALUES (?, 'RUNNING', 0)";
        jdbcTemplate.update(insertRunSql, Timestamp.valueOf(startTime));
        Long runId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);

        // 2. 查询需要巡检的官方来源 (支持动态到期调度)
        String querySourcesSql = "SELECT s.*, v.name as vendor_name FROM `model_sources` s " +
                "JOIN `model_vendors` v ON s.vendor_id = v.id " +
                "WHERE s.is_active = 1 " +
                (forceAll ? "" : "AND (s.next_check_time IS NULL OR s.next_check_time <= NOW(3)) ") +
                "ORDER BY s.vendor_id ASC, s.id ASC";

        List<Map<String, Object>> sources = jdbcTemplate.queryForList(querySourcesSql);

        int checked = 0;
        int succeeded = 0;
        int failed = 0;
        int totalNewCandidates = 0;
        int totalItemsParsed = 0;

        for (Map<String, Object> source : sources) {
            checked++;
            Long sourceId = ((Number) source.get("id")).longValue();
            Long vendorId = ((Number) source.get("vendor_id")).longValue();
            String url = (String) source.get("source_url");
            String vendorName = (String) source.get("vendor_name");
            String sourceType = (String) source.get("source_type");
            int checkInterval = source.get("check_interval_seconds") != null ? ((Number) source.get("check_interval_seconds")).intValue() : 600;
            int consecutiveEmpty = source.get("consecutive_empty_count") != null ? ((Number) source.get("consecutive_empty_count")).intValue() : 0;
            String savedEtag = (String) source.get("etag");
            String savedLastModified = (String) source.get("last_modified");

            try {
                HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(10))
                        .header("User-Agent", "AiModelObservatory/4.0 (+https://localhost:8080; adaptive-crawler)")
                        .header("Accept", "application/rss+xml, application/atom+xml, text/xml, application/xml;q=0.9, text/html;q=0.8, */*;q=0.7")
                        .GET();

                // 注入 HTTP 条件请求头 (RFC 9110) 避免重复传输未变更数据
                if (savedEtag != null && !savedEtag.isBlank()) {
                    reqBuilder.header("If-None-Match", savedEtag);
                }
                if (savedLastModified != null && !savedLastModified.isBlank()) {
                    reqBuilder.header("If-Modified-Since", savedLastModified);
                }

                HttpRequest request = reqBuilder.build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                int statusCode = response.statusCode();

                // 2.1 HTTP 304 Not Modified: 源站内容无更新
                if (statusCode == 304) {
                    succeeded++;
                    // CODE_REVIEW 追加 33 修复: 304 仅代表传输层缓存未变，必须保留原 content_status 与解析计数，严禁强写为 HEALTHY
                    jdbcTemplate.update(
                            "UPDATE `model_sources` SET `last_success_time` = NOW(3), `failure_count` = 0, `last_error` = NULL, " +
                            "`next_check_time` = DATE_ADD(NOW(3), INTERVAL ? SECOND) WHERE `id` = ?",
                            checkInterval, sourceId
                    );
                    log.info("✓ 官方来源 304 缓存命中 (源站内容未修改): [{} -> {}], 调度步长: {}s", vendorName, url, checkInterval);
                    continue;
                }

                // 2.2 HTTP 200~299: 成功接收报文并解析
                if (statusCode >= 200 && statusCode < 400) {
                    succeeded++;
                    String body = response.body();
                    String newEtag = response.headers().firstValue("ETag").orElse(null);
                    String newLastModified = response.headers().firstValue("Last-Modified").orElse(null);

                    ParseResult result = parseAndPersistPayload(sourceId, vendorId, vendorName, url, sourceType, body);
                    totalNewCandidates += result.candidatesCreated;
                    totalItemsParsed += result.itemsParsed;

                    // 内容健康度判定 (Content Health Guard - CODE_REVIEW 追加 29 质量断言守护)
                    // 1. 若条目数为 0 或未解析出有效发布日期 (latestPublishedDate == null)，说明未提取到带时间戳的有效动态，判定为 PARSE_EMPTY
                    // 2. 只有当条目数 > 0 且具有有效发布日期证据时，才标定为 HEALTHY
                    int nextEmptyCount;
                    String contentStatus;
                    if (result.itemsParsed == 0 || result.latestPublishedDate == null) {
                        nextEmptyCount = consecutiveEmpty + 1;
                        contentStatus = "PARSE_EMPTY";
                        if (nextEmptyCount >= 3) {
                            log.warn("⚠️ [内容健康度告警] 官方来源连续 {} 次未能解析出带日期的有效公告: [{} -> {}]，可能遭遇站点改版、SPA动态加载或反爬拦截",
                                    nextEmptyCount, vendorName, url);
                        }
                    } else {
                        nextEmptyCount = 0;
                        contentStatus = "HEALTHY";
                    }

                    java.sql.Date latestSqlDate = result.latestPublishedDate != null ? java.sql.Date.valueOf(result.latestPublishedDate) : null;

                    jdbcTemplate.update(
                            "UPDATE `model_sources` SET `last_success_time` = NOW(3), `failure_count` = 0, `last_error` = NULL, " +
                            "`etag` = COALESCE(?, `etag`), `last_modified` = COALESCE(?, `last_modified`), " +
                            "`consecutive_empty_count` = ?, `content_status` = ?, `last_parsed_count` = ?, " +
                            "`latest_item_published_at` = COALESCE(?, `latest_item_published_at`), " +
                            "`next_check_time` = DATE_ADD(NOW(3), INTERVAL ? SECOND) WHERE `id` = ?",
                            newEtag, newLastModified, nextEmptyCount, contentStatus, result.itemsParsed,
                            latestSqlDate, checkInterval, sourceId
                    );

                    log.info("✓ 官方来源巡检成功: [{} -> {}], HTTP {}, 解析公告: {}, 产生候选: {}, 内容状态: {}",
                            vendorName, url, statusCode, result.itemsParsed, result.candidatesCreated, contentStatus);
                } else {
                    failed++;
                    String err = "HTTP 响应异常状态码: " + statusCode;
                    jdbcTemplate.update(
                            "UPDATE `model_sources` SET `failure_count` = `failure_count` + 1, `last_error` = ?, " +
                            "`content_status` = 'ERROR', `next_check_time` = DATE_ADD(NOW(3), INTERVAL ? SECOND) WHERE `id` = ?",
                            err, Math.min(checkInterval, 300), sourceId
                    );
                    log.warn("✗ 官方来源巡检未通过: [{} -> {}], 状态: {}", vendorName, url, err);
                }
            } catch (Exception ex) {
                failed++;
                String err = "抓取连接超时或解析失败: " + ex.getMessage();
                jdbcTemplate.update(
                        "UPDATE `model_sources` SET `failure_count` = `failure_count` + 1, `last_error` = ?, " +
                        "`content_status` = 'ERROR', `next_check_time` = DATE_ADD(NOW(3), INTERVAL ? SECOND) WHERE `id` = ?",
                        err.length() > 500 ? err.substring(0, 500) : err, Math.min(checkInterval, 300), sourceId
                );
                log.warn("✗ 官方来源巡检异常: [{} -> {}], 错误: {}", vendorName, url, ex.getMessage());
            }
        }

        LocalDateTime endTime = LocalDateTime.now();
        String finalStatus = failed == 0 ? "SUCCESS" : (succeeded > 0 ? "PARTIAL_SUCCESS" : "FAILED");

        // 3. 完结 crawl_runs 审计记录
        jdbcTemplate.update(
                "UPDATE `crawl_runs` SET `end_time` = ?, `sources_checked` = ?, `sources_succeeded` = ?, " +
                "`sources_failed` = ?, `new_events_found` = ?, `status` = ? WHERE `id` = ?",
                Timestamp.valueOf(endTime), checked, succeeded, failed, totalNewCandidates, finalStatus, runId
        );

        log.info("<< [ADAPTIVE CRAWLER] 巡检完成: Run ID {}, 耗时: {}ms, 检查源: {}, 成功: {}, 失败: {}, 解析条目: {}, 新候选: {}, 状态: {}",
                runId, Duration.between(startTime, endTime).toMillis(), checked, succeeded, failed, totalItemsParsed, totalNewCandidates, finalStatus);

        return Map.of(
                "runId", runId,
                "status", finalStatus,
                "sourcesChecked", checked,
                "sourcesSucceeded", succeeded,
                "sourcesFailed", failed,
                "itemsParsed", totalItemsParsed,
                "newCandidatesFound", totalNewCandidates,
                "durationMs", Duration.between(startTime, endTime).toMillis()
        );
    }

    private static final DateTimeFormatter[] DATE_FORMATTERS = new DateTimeFormatter[]{
            DateTimeFormatter.RFC_1123_DATE_TIME,
            DateTimeFormatter.ISO_OFFSET_DATE_TIME,
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,
            DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss Z", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd")
    };

    public static LocalDate parseToDate(String rawDate) {
        if (rawDate == null || rawDate.isBlank()) return null;
        String trimmed = rawDate.trim();
        for (DateTimeFormatter fmt : DATE_FORMATTERS) {
            try {
                TemporalAccessor accessor = fmt.parseBest(trimmed, ZonedDateTime::from, LocalDateTime::from, LocalDate::from);
                if (accessor instanceof ZonedDateTime zdt) {
                    return zdt.toLocalDate();
                } else if (accessor instanceof LocalDateTime ldt) {
                    return ldt.toLocalDate();
                } else if (accessor instanceof LocalDate ld) {
                    return ld;
                }
            } catch (Exception ignored) {}
        }
        // 正则提取形如 2026-02-05 或 2026/02/05
        Pattern p = Pattern.compile("(\\d{4})[-/](\\d{1,2})[-/](\\d{1,2})");
        Matcher m = p.matcher(trimmed);
        if (m.find()) {
            try {
                int y = Integer.parseInt(m.group(1));
                int mo = Integer.parseInt(m.group(2));
                int d = Integer.parseInt(m.group(3));
                return LocalDate.of(y, mo, d);
            } catch (Exception ignored) {}
        }

        // 正则提取形如 Sep 22, 2026 或 Aug 14, 2026 (常见于 Anthropic、xAI 等原厂新闻)
        Pattern engPattern = Pattern.compile("(?i)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+(\\d{1,2}),?\\s+(\\d{4})");
        Matcher engM = engPattern.matcher(trimmed);
        if (engM.find()) {
            try {
                String monthStr = engM.group(1).substring(0, 3).toLowerCase();
                int day = Integer.parseInt(engM.group(2));
                int year = Integer.parseInt(engM.group(3));
                int month = switch (monthStr) {
                    case "jan" -> 1;
                    case "feb" -> 2;
                    case "mar" -> 3;
                    case "apr" -> 4;
                    case "may" -> 5;
                    case "jun" -> 6;
                    case "jul" -> 7;
                    case "aug" -> 8;
                    case "sep" -> 9;
                    case "oct" -> 10;
                    case "nov" -> 11;
                    case "dec" -> 12;
                    default -> 1;
                };
                return LocalDate.of(year, month, day);
            } catch (Exception ignored) {}
        }

        // 正则提取形如 2026年9月2日
        Pattern zhPattern = Pattern.compile("(\\d{4})年(\\d{1,2})月(\\d{1,2})日?");
        Matcher zhM = zhPattern.matcher(trimmed);
        if (zhM.find()) {
            try {
                int y = Integer.parseInt(zhM.group(1));
                int mo = Integer.parseInt(zhM.group(2));
                int d = Integer.parseInt(zhM.group(3));
                return LocalDate.of(y, mo, d);
            } catch (Exception ignored) {}
        }
        return null;
    }

    public static class ParseResult {
        public int itemsParsed = 0;
        public int candidatesCreated = 0;
        public LocalDate latestPublishedDate = null;
    }

    /**
     * 解析 RSS / Atom XML 报文或 HTML 页面并提取条目存入 source_items 与 model_discovery_candidates
     */
    private ParseResult parseAndPersistPayload(Long sourceId, Long vendorId, String vendorName, String sourceUrl, String sourceType, String body) {
        ParseResult result = new ParseResult();
        if (body == null || body.isBlank()) return result;

        // 如果是 HTML 官方发布页
        if ("HTML".equalsIgnoreCase(sourceType) || (!body.trim().startsWith("<?xml") && !body.trim().startsWith("<rss") && !body.trim().startsWith("<feed"))) {
            if (sourceUrl != null && sourceUrl.toLowerCase().contains("changelog")) {
                ParseResult changelogResult = parseChangelogAnnouncements(sourceId, vendorId, vendorName, sourceUrl, body);
                if (changelogResult.itemsParsed > 0) {
                    return changelogResult;
                }
            }
            return parseHtmlAnnouncements(sourceId, vendorId, vendorName, sourceUrl, body);
        }

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            // 防 XXE 注入保护
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(body)));

            // 1. RSS 2.0: <item>
            NodeList items = doc.getElementsByTagName("item");
            if (items.getLength() > 0) {
                for (int i = 0; i < Math.min(items.getLength(), 50); i++) {
                    Element item = (Element) items.item(i);
                    String title = getXmlText(item, "title");
                    String link = getXmlText(item, "link");
                    String desc = getXmlText(item, "description");
                    String pubDateStr = getXmlText(item, "pubDate");
                    LocalDate publishedDate = parseToDate(pubDateStr);

                    if (link.isBlank()) continue;

                    result.itemsParsed++;
                    if (publishedDate != null && (result.latestPublishedDate == null || publishedDate.isAfter(result.latestPublishedDate))) {
                        result.latestPublishedDate = publishedDate;
                    }

                    boolean created = recordSourceItemAndCandidate(sourceId, vendorId, vendorName, sourceUrl, title, link, desc, publishedDate);
                    if (created) result.candidatesCreated++;
                }
                return result;
            }

            // 2. Atom 1.0: <entry>
            NodeList entries = doc.getElementsByTagName("entry");
            if (entries.getLength() > 0) {
                for (int i = 0; i < Math.min(entries.getLength(), 50); i++) {
                    Element entry = (Element) entries.item(i);
                    String title = getXmlText(entry, "title");
                    String desc = getXmlText(entry, "summary");
                    String pubDateStr = getXmlText(entry, "published");
                    if (pubDateStr.isBlank()) pubDateStr = getXmlText(entry, "updated");
                    LocalDate publishedDate = parseToDate(pubDateStr);

                    String link = "";
                    NodeList linkNodes = entry.getElementsByTagName("link");
                    if (linkNodes.getLength() > 0) {
                        Element linkEl = (Element) linkNodes.item(0);
                        link = linkEl.getAttribute("href");
                        if (link.isBlank()) link = linkEl.getTextContent();
                    }
                    if (link.isBlank()) continue;

                    result.itemsParsed++;
                    if (publishedDate != null && (result.latestPublishedDate == null || publishedDate.isAfter(result.latestPublishedDate))) {
                        result.latestPublishedDate = publishedDate;
                    }

                    boolean created = recordSourceItemAndCandidate(sourceId, vendorId, vendorName, sourceUrl, title, link, desc, publishedDate);
                    if (created) result.candidatesCreated++;
                }
                return result;
            }
        } catch (Exception ex) {
            log.debug("XML 解析跳过，转入 HTML 扫描: {} -> {}", sourceUrl, ex.getMessage());
            if (sourceUrl != null && sourceUrl.toLowerCase().contains("changelog")) {
                ParseResult changelogResult = parseChangelogAnnouncements(sourceId, vendorId, vendorName, sourceUrl, body);
                if (changelogResult.itemsParsed > 0) {
                    return changelogResult;
                }
            }
            return parseHtmlAnnouncements(sourceId, vendorId, vendorName, sourceUrl, body);
        }

        return result;
    }

    /**
     * 针对变更日志 (Changelog) 页面的专用结构抽取器 (CODE_REVIEW 追加 29/33/34)
     * 支持跨大标题层级继承年份/月份上下文，准确抽取日级别更新条目，并生成同页多条稳定唯一锚点
     */
    private ParseResult parseChangelogAnnouncements(Long sourceId, Long vendorId, String vendorName, String sourceUrl, String htmlBody) {
        ParseResult result = new ParseResult();
        if (htmlBody == null || htmlBody.isBlank()) return result;

        // 提取所有 h1-h5 标题元素及其位置
        Pattern headingPattern = Pattern.compile("<h([1-5])[^>]*>(.*?)</h\\1>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        Matcher matcher = headingPattern.matcher(htmlBody);

        List<HeadingBlock> blocks = new ArrayList<>();
        while (matcher.find()) {
            String titleText = matcher.group(2).replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
            blocks.add(new HeadingBlock(matcher.start(), matcher.end(), titleText));
        }

        if (blocks.isEmpty()) return result;

        Integer currentYear = null;
        Integer currentMonth = null;
        int count = 0;

        Pattern monthYearPattern = Pattern.compile("(?i)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\\s+(\\d{4})");
        Pattern yearMonthPattern = Pattern.compile("(\\d{4})\\s*[-/年]\\s*(\\d{1,2})");
        Pattern monthDayPattern = Pattern.compile("(?i)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+(\\d{1,2})(?:st|nd|rd|th)?");

        for (int i = 0; i < blocks.size() && count < 50; i++) {
            HeadingBlock current = blocks.get(i);
            String title = current.text;

            // 1. 检查是否为"月份 年份"大标题 (如 "September, 2026" 或 "2026年9月")
            Matcher myM = monthYearPattern.matcher(title);
            if (myM.find()) {
                currentMonth = parseMonthNumber(myM.group(1));
                currentYear = Integer.parseInt(myM.group(2));
            } else {
                Matcher ymM = yearMonthPattern.matcher(title);
                if (ymM.find()) {
                    currentYear = Integer.parseInt(ymM.group(1));
                    currentMonth = Integer.parseInt(ymM.group(2));
                }
            }

            // 2. 尝试从当前标题提取完整日期
            LocalDate itemDate = parseToDate(title);

            // 3. 若未获得完整日期，但有月-日标题且存在上下文年份 (如 "Sep 25" 或 "September 22")
            if (itemDate == null && currentYear != null) {
                Matcher mdM = monthDayPattern.matcher(title);
                if (mdM.find()) {
                    int m = parseMonthNumber(mdM.group(1));
                    int d = Integer.parseInt(mdM.group(2));
                    try {
                        itemDate = LocalDate.of(currentYear, m, d);
                    } catch (Exception ignored) {}
                }
            }

            // 4. 若为有效条目标题且获得了有效日期
            if (itemDate != null) {
                // 计算该标题所辖正文内容（直到下一个同级或高级标题）
                int contentStart = current.endPos;
                int contentEnd = (i + 1 < blocks.size()) ? blocks.get(i + 1).startPos : htmlBody.length();
                if (contentEnd > contentStart) {
                    String rawContent = htmlBody.substring(contentStart, contentEnd);
                    String cleanContent = rawContent.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
                    if (cleanContent.length() > 10) {
                        String summary = cleanContent.length() > 300 ? cleanContent.substring(0, 300) + "..." : cleanContent;
                        // 生成清晰标题与稳定条目锚点
                        String entryTitle = title.contains(String.valueOf(itemDate.getYear())) ? title : (title + ", " + itemDate.getYear());
                        if (entryTitle.length() < 15 && cleanContent.length() > 5) {
                            String firstSentence = cleanContent.split("[\\.\\!\\?\\n。！]")[0].trim();
                            if (!firstSentence.isBlank()) {
                                entryTitle += ": " + (firstSentence.length() > 80 ? firstSentence.substring(0, 80) + "..." : firstSentence);
                            }
                        }

                        // 生成源内稳定唯一键，避免全局 canonical_url 冲突
                        String slug = entryTitle.replaceAll("[^a-zA-Z0-9]+", "-").toLowerCase();
                        if (slug.length() > 40) slug = slug.substring(0, 40);
                        String itemUrl = sourceUrl + "#" + itemDate + "-" + slug;

                        result.itemsParsed++;
                        if (result.latestPublishedDate == null || itemDate.isAfter(result.latestPublishedDate)) {
                            result.latestPublishedDate = itemDate;
                        }

                        boolean created = recordSourceItemAndCandidate(sourceId, vendorId, vendorName, sourceUrl, entryTitle, itemUrl, summary, itemDate);
                        if (created) result.candidatesCreated++;
                        count++;
                    }
                }
            }
        }
        return result;
    }

    /**
     * 官方 HTML 发布页轻量提取
     */
    private ParseResult parseHtmlAnnouncements(Long sourceId, Long vendorId, String vendorName, String sourceUrl, String htmlBody) {
        ParseResult result = new ParseResult();
        if (htmlBody == null || htmlBody.isBlank()) return result;

        boolean isChangelogSource = sourceUrl != null && sourceUrl.toLowerCase().contains("changelog");

        Pattern pattern = Pattern.compile("<a\\s+(?:[^>]*?\\s+)?href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        Matcher m = pattern.matcher(htmlBody);
        Set<String> seen = new HashSet<>();
        int count = 0;

        while (m.find() && count < 50) {
            String href = m.group(1).trim();
            String rawTitle = m.group(2).replaceAll("<[^>]+>", "").trim();
            if (rawTitle.length() < 6 || rawTitle.length() > 200) continue;
            if (href.startsWith("#") || href.startsWith("javascript:")) continue;
            if (seen.contains(href)) continue;
            seen.add(href);

            // 过滤常见非文章类链接（工具、功能页、下载、协议等），避免污染发布线索
            String lowerHref = href.toLowerCase();
            String lowerTitleCheck = rawTitle.toLowerCase();
            if (lowerHref.contains("tools") || lowerHref.contains("download") || lowerHref.contains("help")
                    || lowerHref.contains("privacy") || lowerHref.contains("terms") || lowerHref.contains("contact")
                    || lowerHref.contains("llms.txt") || lowerHref.contains("/docs/") || lowerHref.contains("api/docs")
                    || lowerHref.equals("/api/docs") || lowerHref.equals("/docs")
                    || lowerTitleCheck.contains("生成器") || lowerTitleCheck.contains("翻译器")
                    || lowerTitleCheck.contains("转换器") || lowerTitleCheck.contains("下载")
                    || lowerTitleCheck.contains("关于我们") || lowerTitleCheck.contains("用户协议")
                    || lowerTitleCheck.equals("docs") || lowerTitleCheck.equals("documentation")
                    || lowerTitleCheck.equals("resources") || lowerTitleCheck.equals("changelog")
                    || lowerTitleCheck.equals("chatgpt") || lowerTitleCheck.equals("overview")
                    || lowerTitleCheck.equals("pricing")) {
                continue;
            }

            String fullUrl = href;
            if (href.startsWith("/")) {
                try {
                    URI base = URI.create(sourceUrl);
                    fullUrl = base.resolve(href).toString();
                } catch (Exception ignored) {}
            }
            if (!fullUrl.startsWith("http")) continue;

            LocalDate guessDate = parseToDate(rawTitle);

            // 对于 changelog 类页面或文档页面，若没有有效日期，一律判定为导航/侧边栏链接跳过，杜绝假阳性
            if (isChangelogSource && guessDate == null) {
                continue;
            }

            result.itemsParsed++;
            if (guessDate != null && (result.latestPublishedDate == null || guessDate.isAfter(result.latestPublishedDate))) {
                result.latestPublishedDate = guessDate;
            }

            boolean created = recordSourceItemAndCandidate(sourceId, vendorId, vendorName, sourceUrl, rawTitle, fullUrl, rawTitle, guessDate);
            if (created) result.candidatesCreated++;
            count++;
        }
        return result;
    }

    private String getXmlText(Element parent, String tagName) {
        NodeList nl = parent.getElementsByTagName(tagName);
        if (nl != null && nl.getLength() > 0) {
            return nl.item(0).getTextContent().trim();
        }
        return "";
    }

    /**
     * 将抓取到的条目写入 source_items，并对命中 AI 大模型关键词的条目创建待审候选
     */
    private boolean recordSourceItemAndCandidate(Long sourceId, Long vendorId, String vendorName, String sourceUrl,
                                                 String title, String link, String desc, LocalDate publishedDate) {
        if (link == null || link.isBlank()) return false;

        java.sql.Date sqlDate = publishedDate != null ? java.sql.Date.valueOf(publishedDate) : null;

        // 0. 静态资源页识别 (追加 17 止血): 条款/招聘/隐私/导航等标记 is_static_resource=1,
        //    仍入库留作审计, 但不进入公开动态流, 也不生成模型候选
        boolean staticResource = com.myblog.backend.aimodel.catalog.validate.StaticResourceRule
                .isStaticResource(title, link);

        // 1. 存入 source_items (带 source_id 归属、四维时间戳并在冲突时防覆盖已有人工锁定)
        try {
            String insertSourceItemSql = "INSERT INTO `source_items` " +
                    "(`canonical_url`, `source_id`, `vendor_id`, `title`, `raw_summary`, `published_at`, `first_seen_at`, `ingested_at`, `visible_at`, `process_status`, `is_static_resource`, `created_at`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, NOW(3), NOW(3), NOW(3), 'PENDING', ?, NOW(3)) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "`source_id` = COALESCE(VALUES(`source_id`), `source_id`), " +
                    "`vendor_id` = COALESCE(VALUES(`vendor_id`), `vendor_id`), " +
                    "`published_at` = COALESCE(VALUES(`published_at`), `published_at`), " +
                    "`ingested_at` = COALESCE(`ingested_at`, NOW(3)), " +
                    "`visible_at` = COALESCE(`visible_at`, NOW(3)), " +
                    "`is_static_resource` = CASE WHEN `locked_by_reviewer` = 1 THEN 1 ELSE GREATEST(`is_static_resource`, VALUES(`is_static_resource`)) END";
            jdbcTemplate.update(insertSourceItemSql, link, sourceId, vendorId,
                    title.length() > 400 ? title.substring(0, 400) : title,
                    desc != null && desc.length() > 800 ? desc.substring(0, 800) : desc,
                    sqlDate, staticResource ? 1 : 0);
        } catch (Exception e) {
            log.warn("【采集入库】写入条目异常: link={}, err={}", link, e.getMessage());
        }

        if (staticResource) {
            log.info("【采集】识别为静态资源页, 跳过候选生成: {}", link);
            return false;
        }

        // 2. 识别是否包含 AI 大模型发布特征词
        String lowerTitle = (title + " " + (desc != null ? desc : "")).toLowerCase();
        boolean isAiModelPost = lowerTitle.contains("model") || lowerTitle.contains("reasoning")
                || lowerTitle.contains("gpt") || lowerTitle.contains("claude")
                || lowerTitle.contains("gemini") || lowerTitle.contains("llama")
                || lowerTitle.contains("deepseek") || lowerTitle.contains("qwen")
                || lowerTitle.contains("mistral") || lowerTitle.contains("grok")
                || lowerTitle.contains("weights") || lowerTitle.contains("omni")
                || lowerTitle.contains("sol") || lowerTitle.contains("luna")
                || lowerTitle.contains("phi") || lowerTitle.contains("nova")
                || lowerTitle.contains("nemotron") || lowerTitle.contains("command")
                || lowerTitle.contains("jamba") || lowerTitle.contains("stable")
                || lowerTitle.contains("doubao") || lowerTitle.contains("seed")
                || lowerTitle.contains("hunyuan") || lowerTitle.contains("glm")
                || lowerTitle.contains("kimi") || lowerTitle.contains("minimax")
                || lowerTitle.contains("release") || lowerTitle.contains("announce")
                || lowerTitle.contains("introducing") || lowerTitle.contains("api")
                || lowerTitle.contains("模型") || lowerTitle.contains("开源") || lowerTitle.contains("发布")
                || lowerTitle.contains("文心") || lowerTitle.contains("豆包") || lowerTitle.contains("混元");

        if (isAiModelPost) {
            // 提取所有命中的具名模型（支持一文多型号识别，彻底解决多尺寸与组合发布漏审）
            List<String> guessModels = guessModelNames(title, vendorName);
            boolean anyCreated = false;
            for (String guessModel : guessModels) {
                try {
                    Integer existCount = jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM `model_discovery_candidates` WHERE `evidence_url` = ? AND `guess_model_name` = ?",
                            Integer.class, link, guessModel);
                    if (existCount != null && existCount == 0) {
                        String insertCandidateSql = "INSERT INTO `model_discovery_candidates` " +
                                "(`source_name`, `external_model_id`, `guess_vendor_name`, `guess_model_name`, `raw_title`, `raw_summary`, `evidence_url`, `upstream_date`, `first_seen_at`, `status`, `created_at`) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(3), 'PENDING', NOW(3))";
                        jdbcTemplate.update(insertCandidateSql,
                                vendorName + " Official Feed",
                                guessModel.toLowerCase().replace(" ", "-"),
                                vendorName,
                                guessModel,
                                title.length() > 400 ? title.substring(0, 400) : title,
                                desc != null && desc.length() > 800 ? desc.substring(0, 800) : desc,
                                link,
                                sqlDate);
                        anyCreated = true;
                    }
                } catch (Exception ex) {
                    log.debug("候选写入跳过: {}", ex.getMessage());
                }
            }
            return anyCreated;
        }
        return false;
    }

    private static final Pattern MODEL_NAME_PATTERN = Pattern.compile(
            "\\b(GPT-[0-9a-zA-Z\\.\\-]+(?:\\s+(?:Sol|Luna|Astra|Omni|Turbo|Preview|Mini))?|" +
            "Claude\\s+(?:Opus|Sonnet|Haiku)?\\s*[0-9a-zA-Z\\.\\-]+|" +
            "Gemini\\s+(?:Omni|Pro|Flash|Ultra|Live|Nano)?\\s*[0-9a-zA-Z\\.\\-]+|" +
            "Grok\\s+[0-9a-zA-Z\\.\\-]+|" +
            "DeepSeek-[0-9a-zA-Z\\.\\-]+|" +
            "Qwen\\s*[0-9a-zA-Z\\.\\-]+|" +
            "Llama\\s*[0-9a-zA-Z\\.\\-]+|" +
            "Mistral\\s+[0-9a-zA-Z\\.\\-]+|" +
            "ERNIE\\s*[0-9a-zA-Z\\.\\-]+|" +
            "文心[0-9a-zA-Z\\.\\-]+|" +
            "Phi-[0-9a-zA-Z\\.\\-]+|" +
            "Nova\\s+(?:Micro|Lite|Pro|Canvas|Reel)[0-9a-zA-Z\\.\\-]*|" +
            "Nemotron-[0-9a-zA-Z\\.\\-]+|" +
            "Command\\s+(?:A\\+|R\\+|R|Light)[0-9a-zA-Z\\.\\-]*|" +
            "Jamba\\s+[0-9a-zA-Z\\.\\-]+|" +
            "Stable\\s+(?:Diffusion|Audio|Video)\\s*[0-9a-zA-Z\\.\\-]+|" +
            "Doubao-[0-9a-zA-Z\\.\\-]+|" +
            "Seed\\s*[0-9a-zA-Z\\.\\-]+|" +
            "豆包[0-9a-zA-Z\\.\\-]+|" +
            "Hunyuan-[0-9a-zA-Z\\.\\-]+|" +
            "混元[0-9a-zA-Z\\.\\-]+|" +
            "GLM-[0-9a-zA-Z\\.\\-]+|" +
            "Kimi\\s+(?:k[0-9\\.]+|K[0-9\\.]+)?|" +
            "MiniMax-[0-9a-zA-Z\\.\\-]+)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private List<String> guessModelNames(String title, String vendorName) {
        if (title == null || title.isBlank()) {
            return List.of(vendorName + " 新发布");
        }

        List<String> names = new ArrayList<>();
        Matcher matcher = MODEL_NAME_PATTERN.matcher(title);
        while (matcher.find()) {
            String found = matcher.group(1).trim();
            if (!names.contains(found)) {
                names.add(found);
            }
        }

        if (!names.isEmpty()) {
            return names;
        }

        // 检查冒号分隔结构
        if (title.contains(":")) {
            String[] parts = title.split(":");
            if (parts.length > 1 && parts[1].trim().length() < 35) {
                return List.of(parts[1].trim());
            }
        }

        // 3. 清理常见的发布前缀（如 Introducing、Announcing）
        String cleanTitle = title.replaceAll("(?i)^(Introducing|Announcing|Release of|Launching)\\s+", "").trim();
        if (cleanTitle.length() <= 35) {
            return List.of(cleanTitle);
        }

        return List.of(vendorName + " 官方动态");
    }

    private static class HeadingBlock {
        final int startPos;
        final int endPos;
        final String text;

        HeadingBlock(int startPos, int endPos, String text) {
            this.startPos = startPos;
            this.endPos = endPos;
            this.text = text;
        }
    }

    private static int parseMonthNumber(String monthStr) {
        if (monthStr == null || monthStr.length() < 3) return 1;
        String m = monthStr.substring(0, 3).toLowerCase(Locale.ROOT);
        return switch (m) {
            case "jan" -> 1;
            case "feb" -> 2;
            case "mar" -> 3;
            case "apr" -> 4;
            case "may" -> 5;
            case "jun" -> 6;
            case "jul" -> 7;
            case "aug" -> 8;
            case "sep" -> 9;
            case "oct" -> 10;
            case "nov" -> 11;
            case "dec" -> 12;
            default -> 1;
        };
    }
}
