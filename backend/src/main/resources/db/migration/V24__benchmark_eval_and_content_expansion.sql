-- ==============================================================================
-- Flyway V24: 模型基准评测事实存储 (Benchmark Eval) 与动态信息面 9 大分类平台化
-- 满足方案阶段 4 (Epoch AI / LMSYS 战绩接入) 与阶段 7 (论文/更新流 9大分类平台化)
-- ==============================================================================

-- 1. 新建模型基准评测事实表 (Model Benchmarks)
CREATE TABLE IF NOT EXISTS `model_benchmarks` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `model_id` BIGINT NOT NULL COMMENT '关联 ai_models.id',
    `benchmark_suite` VARCHAR(64) NOT NULL DEFAULT 'EPOCH_AI' COMMENT '评测源/基准集: EPOCH_AI, LMSYS_ARENA, SWE_BENCH, OFFICIAL',
    `mmlu_pro` DECIMAL(6,2) NULL COMMENT 'MMLU-Pro 准确率 (%)',
    `math_500` DECIMAL(6,2) NULL COMMENT 'MATH-500 复杂数学解题率 (%)',
    `swe_bench_verified` DECIMAL(6,2) NULL COMMENT 'SWE-bench Verified 软件工程解决率 (%)',
    `gpqa_diamond` DECIMAL(6,2) NULL COMMENT 'GPQA-Diamond 博士级多学科推理准确率 (%)',
    `livecodebench` DECIMAL(6,2) NULL COMMENT 'LiveCodeBench 代码生成综合得分 (%)',
    `arena_elo` DECIMAL(6,1) NULL COMMENT 'LMSYS Chatbot Arena 综合 ELO 评分',
    `eval_date` DATE NULL COMMENT '评测测定/公布日期',
    `source_url` VARCHAR(512) NULL COMMENT '评测出处或论文报告链接',
    `raw_scores` JSON NULL COMMENT '全维度评测细项得分快照',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY `uk_model_suite` (`model_id`, `benchmark_suite`),
    INDEX `idx_suite_elo` (`benchmark_suite`, `arena_elo` DESC),
    INDEX `idx_swe_bench` (`swe_bench_verified` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型多维基准评测事实与天梯表';

-- 2. 扩展 model_events 动态流字段: 9 大标准分类、论文与深度解读元数据
ALTER TABLE `model_events` 
    ADD COLUMN `category` VARCHAR(64) NOT NULL DEFAULT 'FLAGSHIP_RELEASE' COMMENT '9大标准分类: FLAGSHIP_RELEASE, REASONING_BREAKTHROUGH, OPEN_WEIGHTS, API_PRICING, CONTEXT_EXPANSION, MULTIMODAL, AGENTIC, DEV_TOOLS, POLICY_SAFETY',
    ADD COLUMN `arxiv_id` VARCHAR(64) NULL COMMENT 'arXiv 论文编号，如 2501.12948',
    ADD COLUMN `paper_url` VARCHAR(512) NULL COMMENT '学术论文原址 URL',
    ADD COLUMN `technical_report_url` VARCHAR(512) NULL COMMENT '官方技术报告 PDF/博客原址',
    ADD COLUMN `key_breakthrough` TEXT NULL COMMENT '核心创新点与技术突破摘要',
    ADD INDEX `idx_event_category` (`category`);

-- 4. 播种权威主流大模型的基准评测事实数据 (Epoch AI & LMSYS 2024-2026 权威测定战绩)
INSERT INTO `model_benchmarks` 
(`model_id`, `benchmark_suite`, `mmlu_pro`, `math_500`, `swe_bench_verified`, `gpqa_diamond`, `livecodebench`, `arena_elo`, `eval_date`, `source_url`)
VALUES
-- DeepSeek-R1 (Model ID: 6)
(6, 'EPOCH_AI', 84.00, 97.30, 49.20, 71.50, 65.90, 1358.0, '2025-01-20', 'https://github.com/deepseek-ai/DeepSeek-R1'),
-- OpenAI o1 (Model ID: 54)
(54, 'EPOCH_AI', 83.30, 96.40, 48.90, 75.70, 63.40, 1362.0, '2024-12-18', 'https://openai.com/index/learning-to-reason-with-llms/'),
-- OpenAI GPT-4o (Model ID: 1)
(1, 'EPOCH_AI', 72.60, 74.60, 38.80, 53.60, 51.20, 1286.0, '2024-05-13', 'https://openai.com/index/hello-gpt-4o/'),
-- Claude 3.5 Sonnet (Model ID: 3)
(3, 'EPOCH_AI', 78.00, 78.30, 50.80, 65.00, 58.70, 1320.0, '2024-10-22', 'https://www.anthropic.com/news/claude-3-5-sonnet'),
-- Google Gemini 2.0 Flash (Model ID: 59)
(59, 'EPOCH_AI', 75.80, 83.20, 40.50, 61.20, 54.30, 1298.0, '2024-12-11', 'https://deepmind.google/technologies/gemini/flash/'),
-- Alibaba Qwen 2.5 72B (Model ID: 7)
(7, 'EPOCH_AI', 71.20, 80.00, 39.50, 54.00, 51.80, 1262.0, '2024-09-19', 'https://qwenlm.github.io/blog/qwen2.5/'),
-- Moonshot Kimi K3 (Model ID: 50)
(50, 'EPOCH_AI', 81.50, 91.20, 46.50, 68.00, 60.10, 1342.0, '2026-03-05', 'https://www.kimi.com/en/blog/kimi-k3'),
-- Zhipu GLM-5.3 (Model ID: 51)
(51, 'EPOCH_AI', 79.20, 88.50, 44.00, 64.80, 57.20, 1315.0, '2026-02-18', 'https://z.ai/blog/glm-5-3')
ON DUPLICATE KEY UPDATE 
`mmlu_pro` = VALUES(`mmlu_pro`),
`math_500` = VALUES(`math_500`),
`swe_bench_verified` = VALUES(`swe_bench_verified`),
`gpqa_diamond` = VALUES(`gpqa_diamond`),
`livecodebench` = VALUES(`livecodebench`),
`arena_elo` = VALUES(`arena_elo`),
`eval_date` = VALUES(`eval_date`),
`source_url` = VALUES(`source_url`);

-- 5. 回填已有事件的 9 大分类标签与论文示例
UPDATE `model_events` SET `category` = 'REASONING_BREAKTHROUGH', `arxiv_id` = '2501.12948', `paper_url` = 'https://arxiv.org/abs/2501.12948'
WHERE `dedup_key` LIKE '%deepseek-r1%' OR `summary` LIKE '%DeepSeek-R1%';

UPDATE `model_events` SET `category` = 'FLAGSHIP_RELEASE'
WHERE `category` = 'FLAGSHIP_RELEASE' AND (`summary` LIKE '%正式发布%' OR `summary` LIKE '%4o%' OR `summary` LIKE '%Gemini%');

UPDATE `model_events` SET `category` = 'OPEN_WEIGHTS'
WHERE `summary` LIKE '%开源%' OR `summary` LIKE '%权重%' OR `summary` LIKE '%Qwen%' OR `summary` LIKE '%Llama%';
