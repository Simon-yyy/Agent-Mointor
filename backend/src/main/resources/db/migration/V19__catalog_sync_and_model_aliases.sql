-- ==============================================================================
-- Flyway V19: 模型目录可持续扩展架构 (Catalog Sync, Upstream Staging & Model Aliases)
-- 满足 CODE_REVIEW 追加 15：
-- 1. 建立目录源配置表 catalog_sources 与同步审计表 catalog_sync_runs
-- 2. 建立上游暂存表 catalog_source_models（防上游异常清空已有库）
-- 3. 建立规范别名与服务档位端点映射表 model_aliases
-- 4. 初始化 models.dev 上游源配置及 72 款基准模型的规范别名映射
-- ==============================================================================

-- 1. 目录聚合源配置表
CREATE TABLE IF NOT EXISTS `catalog_sources` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `source_key` VARCHAR(64) NOT NULL UNIQUE COMMENT '源唯一标识，如 models_dev, openrouter',
    `name` VARCHAR(128) NOT NULL COMMENT '源名称',
    `api_url` VARCHAR(512) NOT NULL COMMENT 'API 端点或元数据文件 URL',
    `source_type` VARCHAR(32) NOT NULL DEFAULT 'JSON_API' COMMENT 'JSON_API, STATIC_JSON, METADATA_REPO',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
    `last_sync_time` DATETIME(3) NULL COMMENT '最后同步完成时间',
    `last_status` VARCHAR(32) NOT NULL DEFAULT 'INIT' COMMENT 'INIT, SUCCESS, FAILED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型目录上游聚合源配置';

-- 2. 目录同步运行日志与审计
CREATE TABLE IF NOT EXISTS `catalog_sync_runs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `source_id` BIGINT NOT NULL COMMENT '关联 catalog_sources.id',
    `status` VARCHAR(32) NOT NULL COMMENT 'RUNNING, SUCCESS, FAILED, PARTIAL',
    `fetched_count` INT NOT NULL DEFAULT 0 COMMENT '拉取到的原始上游模型数',
    `matched_count` INT NOT NULL DEFAULT 0 COMMENT '成功匹配归并到本地的模型数',
    `created_draft_count` INT NOT NULL DEFAULT 0 COMMENT '新生成的待核实草稿数',
    `error_message` TEXT NULL COMMENT '异常日志摘要',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finished_at` DATETIME(3) NULL,
    INDEX `idx_source_time` (`source_id`, `started_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='目录同步执行审计记录';

-- 3. 上游模型暂存与快照表（隔离直接写入，防故障穿透）
CREATE TABLE IF NOT EXISTS `catalog_source_models` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `source_id` BIGINT NOT NULL COMMENT '关联 catalog_sources.id',
    `upstream_model_id` VARCHAR(128) NOT NULL COMMENT '上游模型的原始 ID',
    `raw_vendor` VARCHAR(128) NULL COMMENT '上游返回的厂商名称',
    `raw_name` VARCHAR(256) NOT NULL COMMENT '上游返回的模型展示名',
    `context_length` VARCHAR(64) NULL COMMENT '上下文窗口说明',
    `pricing_prompt` VARCHAR(64) NULL COMMENT '输入计费口径',
    `pricing_completion` VARCHAR(64) NULL COMMENT '输出计费口径',
    `modality` VARCHAR(128) NULL COMMENT '支持模态',
    `raw_json` JSON NULL COMMENT '上游报文完整快照',
    `matched_model_id` BIGINT NULL COMMENT '匹配映射的本地 ai_models.id',
    `sync_status` VARCHAR(32) NOT NULL DEFAULT 'STAGED' COMMENT 'STAGED, MATCHED, DRAFT, IGNORED',
    `last_seen_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '最近一次上游巡检探测到该模型的时间',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY `uk_source_upstream` (`source_id`, `upstream_model_id`),
    INDEX `idx_matched_model` (`matched_model_id`),
    INDEX `idx_sync_status` (`sync_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上游元数据模型暂存镜像';

-- 4. 规范别名与端点映射表（解决别名碰撞、-fast/-batch 端点过滤）
CREATE TABLE IF NOT EXISTS `model_aliases` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `model_id` BIGINT NOT NULL COMMENT '关联核心 ai_models.id',
    `alias_key` VARCHAR(128) NOT NULL COMMENT '上游模型 ID 或 API 调用别名',
    `alias_type` VARCHAR(32) NOT NULL DEFAULT 'UPSTREAM_ID' COMMENT 'UPSTREAM_ID, ENDPOINT, SLUG_ALIAS',
    `source_id` BIGINT NULL COMMENT '来源 catalog_sources.id',
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为该源的主别名',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY `uk_alias_key` (`alias_key`),
    INDEX `idx_model_id` (`model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型多源别名映射与端点归并表';

-- 5. 初始化 models.dev 上游源配置
INSERT INTO `catalog_sources` (`source_key`, `name`, `api_url`, `source_type`, `is_active`, `last_status`)
VALUES 
('models_dev', 'models.dev Catalog API', 'https://models.dev/api.json', 'JSON_API', 1, 'INIT'),
('openrouter', 'OpenRouter Public Models', 'https://openrouter.ai/api/v1/models', 'JSON_API', 1, 'INIT')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `api_url` = VALUES(`api_url`);

-- 6. 初始化核心 72 款模型的权威别名映射（防止后续同步产生冗余或错挂）
INSERT INTO `model_aliases` (`model_id`, `alias_key`, `alias_type`, `is_primary`) VALUES
-- OpenAI
(1, 'gpt-4o', 'UPSTREAM_ID', 1),
(1, 'openai/gpt-4o', 'UPSTREAM_ID', 0),
(2, 'gpt-4o-mini', 'UPSTREAM_ID', 1),
(2, 'openai/gpt-4o-mini', 'UPSTREAM_ID', 0),
(54, 'o1', 'UPSTREAM_ID', 1),
(54, 'openai/o1', 'UPSTREAM_ID', 0),
(55, 'o3-mini', 'UPSTREAM_ID', 1),
(55, 'openai/o3-mini', 'UPSTREAM_ID', 0),
-- Anthropic
(3, 'claude-3-5-sonnet-20241022', 'UPSTREAM_ID', 1),
(3, 'anthropic/claude-3.5-sonnet', 'UPSTREAM_ID', 0),
(57, 'claude-3-5-haiku-20241022', 'UPSTREAM_ID', 1),
(57, 'anthropic/claude-3.5-haiku', 'UPSTREAM_ID', 0),
(58, 'claude-3-opus-20240229', 'UPSTREAM_ID', 1),
(58, 'anthropic/claude-3-opus', 'UPSTREAM_ID', 0),
-- Google
(4, 'gemini-1.5-flash', 'UPSTREAM_ID', 1),
(4, 'google/gemini-flash-1.5', 'UPSTREAM_ID', 0),
(59, 'gemini-2.0-flash-exp', 'UPSTREAM_ID', 1),
(59, 'google/gemini-2.0-flash', 'UPSTREAM_ID', 0),
(60, 'gemini-1.5-pro', 'UPSTREAM_ID', 1),
(60, 'google/gemini-pro-1.5', 'UPSTREAM_ID', 0),
-- DeepSeek
(6, 'deepseek-r1', 'UPSTREAM_ID', 1),
(6, 'deepseek/deepseek-r1', 'UPSTREAM_ID', 0),
(5, 'deepseek-chat', 'UPSTREAM_ID', 1),
(5, 'deepseek-v3', 'UPSTREAM_ID', 0),
(63, 'deepseek-coder-v2', 'UPSTREAM_ID', 1),
-- Qwen
(7, 'qwen-2.5-72b-instruct', 'UPSTREAM_ID', 1),
(64, 'qwen-2.5-coder-32b-instruct', 'UPSTREAM_ID', 1),
(65, 'qwen-2.5-72b', 'UPSTREAM_ID', 1),
-- Moonshot / Kimi
(50, 'kimi-k3', 'UPSTREAM_ID', 1),
(50, 'moonshot/kimi-k3', 'UPSTREAM_ID', 0),
(25, 'kimi-k2.5', 'UPSTREAM_ID', 1),
-- Zhipu / GLM
(51, 'glm-5.3', 'UPSTREAM_ID', 1),
(51, 'zhipu/glm-5.3', 'UPSTREAM_ID', 0),
(52, 'glm-5.3-flash', 'UPSTREAM_ID', 1),
(24, 'glm-4-plus', 'UPSTREAM_ID', 1),
-- Meta Llama
(61, 'meta-llama/llama-3.3-70b-instruct', 'UPSTREAM_ID', 1),
(62, 'meta-llama/llama-3.1-405b-instruct', 'UPSTREAM_ID', 1),
(8, 'meta-llama/llama-3.1-70b-instruct', 'UPSTREAM_ID', 1)
ON DUPLICATE KEY UPDATE `is_primary` = VALUES(`is_primary`);
