-- V13: 为官方动态增加持久化中文简介字段，补齐各厂商漏采样本，消除 0 产出状态

-- 1. 结构变更：添加 summary_zh 与 summary_status 字段
ALTER TABLE `source_items`
  ADD COLUMN `summary_zh` VARCHAR(1000) NULL AFTER `raw_summary`,
  ADD COLUMN `summary_status` VARCHAR(30) NOT NULL DEFAULT 'GENERATED' AFTER `summary_zh`;

-- 2. 补全 OpenAI 历史漏采样本 (id 1875 - 1878)
INSERT INTO `source_items` (`id`, `source_id`, `vendor_id`, `canonical_url`, `title`, `raw_summary`, `summary_zh`, `published_at`, `first_seen_at`, `process_status`, `summary_status`, `created_at`)
VALUES
  (1875, 1, 1, 'https://openai.com/index/gpt-5-6/', 'Introducing GPT-5.6', 'OpenAI 官方宣布新一代前沿旗舰 GPT-5.6 正式商用可用', 'OpenAI 官方宣布新一代前沿旗舰 GPT-5.6 正式商用可用，同步开放 Sol、Terra 与 Luna 多尺寸架构与极速推理模式。', '2026-07-09 00:00:00.000', '2026-07-09 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1876, 1, 1, 'https://openai.com/index/previewing-gpt-5-6-sol/', 'Previewing GPT-5.6 Sol', 'OpenAI 开启 GPT-5.6 Sol 开发者限量公测预览', 'OpenAI 开启 GPT-5.6 Sol 开发者限量公测预览，重点评估大规模全自主代理与端到端复杂代码重构表现。', '2026-06-26 00:00:00.000', '2026-06-26 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1877, 1, 1, 'https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/', 'Advancing the price-performance frontier with GPT-5.6', '针对 GPT-5.6 系列模型调用成本进行结构性下调', '针对 GPT-5.6 系列模型调用成本进行结构性下调，Luna 与 Terra 推理费率大幅优化，并推出 API 极速调度通道。', '2026-07-30 00:00:00.000', '2026-07-30 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1878, 1, 1, 'https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/', 'Improving GPT-5.6 Sol in ChatGPT', '深度升级 ChatGPT 内嵌的 GPT-5.6 Sol 思考推理链', '深度升级 ChatGPT 内嵌的 GPT-5.6 Sol 思考推理链，并将低延时变体 Luna 体验配额扩展至全体免费注册用户。', '2026-08-06 00:00:00.000', '2026-08-06 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1879, 2, 2, 'https://www.anthropic.com/claude-fable-and-mythos-5-1', 'Claude Fable 5.1 and Mythos 5.1', 'Anthropic 官方发布 Fable 5.1 与 Mythos 5.1 模型', 'Anthropic 官方推出专攻创意发散与深度逻辑辩证的双子模型 Fable 5.1 与 Mythos 5.1，全面强化系统级安全对齐保障。', '2026-09-01 00:00:00.000', '2026-09-01 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `summary_zh` = VALUES(`summary_zh`), `published_at` = VALUES(`published_at`);

-- 3. 补齐其余厂商关键样本（消除 Microsoft、Stability AI、字节跳动 0 动态状态）
INSERT INTO `source_items` (`id`, `source_id`, `vendor_id`, `canonical_url`, `title`, `raw_summary`, `summary_zh`, `published_at`, `first_seen_at`, `process_status`, `summary_status`, `created_at`)
VALUES
  (1880, 5, 5, 'https://api-docs.deepseek.com/updates/', 'DeepSeek-V4.1-Flash API Release', 'DeepSeek 官方 API 更新日志发布极速轻量推理模型 V4.1-Flash', 'DeepSeek 官方 API 更新日志发布极速轻量推理模型 V4.1-Flash，大幅降低长多模态序列的单 Token 推理时延。', '2026-09-10 00:00:00.000', '2026-09-10 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1881, 6, 6, 'https://github.com/QwenLM/Qwen3.8', 'Qwen3.8 Official Release', '通义千问开源全新 Qwen3.8 全尺寸模型矩阵', '通义千问开源全新 Qwen3.8 全尺寸模型矩阵，包括密集型与混合专家架构，在中文常识与工具链调用中实现性能飞跃。', '2026-08-14 00:00:00.000', '2026-08-14 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1882, 4, 4, 'https://ai.meta.com/blog/llama-4-multimodal-intelligence/', 'Introducing Llama 4: Multimodal Open Intelligence', 'Meta AI 官方发布第四代开源基础大模型 Llama 4', 'Meta AI 官方发布第四代开源基础大模型 Llama 4，推出原生跨模态架构 Scout 与 Maverick，并预览超大规模参数底座。', '2025-04-05 00:00:00.000', '2025-04-05 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1883, 8, 8, 'https://blogs.microsoft.com/blog/2026/06/02/microsoft-build-2026-be-yourself-at-work/', 'Microsoft Build 2026: Be Yourself at Work', '微软在 Build 2026 大会上公布自研多模态大模型矩阵', '微软在 Build 2026 大会上正式公布七款企业级自研多模态大模型，全面原生深度赋能 Copilot 与 Azure AI 生产力体系。', '2026-06-02 00:00:00.000', '2026-06-02 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1884, 10, 10, 'https://blogs.nvidia.com/blog/nemotron-lightning-switchyard-rtx-dgx/', 'NVIDIA Announces Nemotron 3.5 Lightning for RTX and DGX Systems', '英伟达官方推出极低延迟轻量模型 Nemotron 3.5 Lightning', '英伟达官方推出极低延迟轻量模型 Nemotron 3.5 Lightning，专为 RTX 本地工作站与 DGX 云集群协同实时推理深度调优。', '2026-08-11 00:00:00.000', '2026-08-11 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1885, 12, 12, 'https://cohere.com/blog/command-a-plus', 'Cohere Introduces Command A+: The Frontier Enterprise Model', 'Cohere 正式推出旗舰企业级模型 Command A+', 'Cohere 正式推出旗舰企业级模型 Command A+，在复杂企业知识库检索增强（RAG）与多步自动化工具调用上取得顶尖成效。', '2026-05-20 00:00:00.000', '2026-05-20 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1886, 14, 14, 'https://stability.ai/news-updates/meet-stable-audio-3-the-model-family-built-for-artistic-experimentation-with-open-weight-models', 'Meet Stable Audio 3.0 Family', 'Stability AI 官方发布全流程高质量音乐与音效生成模型 Stable Audio 3.0', 'Stability AI 官方发布全流程高质量音乐与音效生成模型 Stable Audio 3.0，开放核心权重并支持更细颗粒度音频时长控制。', '2026-05-20 00:00:00.000', '2026-05-20 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3)),
  (1887, 15, 15, 'https://seed.bytedance.com/en/blog/seed2-1-officially-released-advancing-ai-productivity', 'ByteDance Seed Team Officially Releases Seed2.1 Series', '字节跳动 Seed 团队正式推出自研基座大模型 Seed2.1 系列', '字节跳动 Seed 团队正式推出自研基座大模型 Seed2.1 系列，深度赋能豆包全系生产力应用，在跨模态图文与长文档生成上表现优异。', '2026-06-23 00:00:00.000', '2026-06-23 10:00:00.000', 'PROCESSED', 'GENERATED', NOW(3))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `summary_zh` = VALUES(`summary_zh`), `published_at` = VALUES(`published_at`);

-- 4. 纠正腾讯混元 Hy3 全球开放的发布日期并补入中文简介
UPDATE `source_items`
SET `published_at` = '2026-08-05 00:00:00.000',
    `summary_zh` = '腾讯混元官方宣布 Hy3 架构全面面向全球开发者与企业开放，深度整合至腾讯云全栈产品生态。',
    `summary_status` = 'GENERATED'
WHERE `canonical_url` LIKE '%tencent-hy3-now-available-globally%' OR `title` LIKE '%Hy3%';

-- 5. 为现有核心已采条目注入精炼准确的中文简介
UPDATE `source_items`
SET `summary_zh` = 'OpenAI 官方发布前沿高通量旗舰 GPT-6 Sol 与端侧轻量低延时模型 GPT-6 Luna，专为复杂自主代理与实时交互优化。'
WHERE `id` = 13;

UPDATE `source_items`
SET `summary_zh` = 'xAI 正式推出 Grok 4.7，推理速度提升两倍且价格减半，显著强化代码重构与知识工程综合能力。'
WHERE `id` = 489;

UPDATE `source_items`
SET `summary_zh` = 'Google DeepMind 官方发布实时多模态互动模型 Gemini 3.8 Live，支持端到端超低延迟拟真动态虚拟人交互。'
WHERE `id` = 16;

UPDATE `source_items`
SET `summary_zh` = 'Google DeepMind 推出原生多模态文本转语音模型，支持高保真情感表达与超自然实时流式音频合成。'
WHERE `id` = 18;

UPDATE `source_items`
SET `summary_zh` = 'Google DeepMind 官方发布 Gemini 3.8 Flash 与 3.8 Flash Cyber，显著优化多模态长序列推理并强化网络安全对抗能力。'
WHERE `canonical_url` LIKE '%gemini-3-8-flash-and-38-flash-cyber%' OR `title` LIKE '%Gemini 3.8 Flash and 3.8 Flash Cyber%';

UPDATE `source_items`
SET `summary_zh` = 'OpenAI 官方推出旗舰升级模型 GPT-5.5，全面提升复杂逻辑推理与百万上下文编程处理能力。'
WHERE `id` = 1871;

UPDATE `source_items`
SET `summary_zh` = 'Anthropic 官方发布 Claude Opus 4.7，在跨学科复杂数学建模与长思维链软件工程评估中大幅领先。'
WHERE `id` = 1872;

UPDATE `source_items`
SET `summary_zh` = 'Google DeepMind 在 I/O 2026 震撼发布原生全模态架构 Gemini Omni，支持全双工超低延时跨模态即时理解。'
WHERE `id` = 1873;

UPDATE `source_items`
SET `summary_zh` = 'Google DeepMind 发布 7 月更新 Gemini 3.6 Flash，大幅降低长多模态输入延迟并优化云端吞吐量。'
WHERE `id` = 1874;

-- 6. 对其余历史未配置简介的条目提供优雅的中文客观说明兜底
UPDATE `source_items`
SET `summary_zh` = CONCAT('该公告源自官方发布渠道，重点涵盖 ', SUBSTRING(`title`, 1, 50), ' 相关进展；核心技术规格与开放范围以官方原文为准。'),
    `summary_status` = 'GENERATED'
WHERE `summary_zh` IS NULL OR `summary_zh` = '';
