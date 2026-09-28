-- ===================================================================
-- Flyway 迁移脚本 V3: 播种试点重点厂商真实官方发布监控来源
-- ===================================================================

INSERT INTO `model_sources` (`vendor_id`, `source_url`, `source_type`, `is_active`, `created_at`)
VALUES
    -- 1. OpenAI 官方发布与 Research Blog
    (1, 'https://openai.com/news/rss.xml', 'RSS', 1, NOW(3)),
    -- 2. Anthropic 官方 Research & Announcements
    (2, 'https://www.anthropic.com/feed.xml', 'RSS', 1, NOW(3)),
    -- 3. Google DeepMind 官方博客
    (3, 'https://deepmind.google/blog/rss.xml', 'RSS', 1, NOW(3)),
    -- 4. Meta AI 官方技术博文
    (4, 'https://ai.meta.com/blog/rss.xml', 'RSS', 1, NOW(3)),
    -- 5. DeepSeek 官方 GitHub 发布源
    (5, 'https://github.com/deepseek-ai/DeepSeek-V3/releases.atom', 'ATOM', 1, NOW(3)),
    -- 6. Alibaba Qwen 开源发布源
    (6, 'https://github.com/QwenLM/Qwen2.5/releases.atom', 'ATOM', 1, NOW(3)),
    -- 7. Mistral AI 官方公告
    (11, 'https://mistral.ai/news/rss.xml', 'RSS', 1, NOW(3)),
    -- 8. HuggingFace 官方每日模型趋势
    (16, 'https://huggingface.co/blog/feed.xml', 'RSS', 1, NOW(3))
ON DUPLICATE KEY UPDATE `is_active` = 1;
