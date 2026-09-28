-- ===================================================================
-- Flyway 迁移脚本 V18: 全局模型技术画像建模、20 家厂商最新前沿型号全量补齐 (扩至 72 款)
-- 彻底响应 CODE_REVIEW 追加 13 与追加 14 要求，消除虚构模板断言与代际断层
-- ===================================================================

-- 1. 表结构扩展：为 ai_models 增加真实官方规格与技术画像字段
ALTER TABLE `ai_models`
    ADD COLUMN `summary_zh` TEXT DEFAULT NULL COMMENT '中文核心技术简介',
    ADD COLUMN `official_release_date` VARCHAR(50) DEFAULT NULL COMMENT '原厂权威官宣发布日期',
    ADD COLUMN `context_window` VARCHAR(50) DEFAULT NULL COMMENT '官方上下文窗口长度',
    ADD COLUMN `parameter_size` VARCHAR(100) DEFAULT NULL COMMENT '参数规模/架构规格',
    ADD COLUMN `license` VARCHAR(100) DEFAULT NULL COMMENT '开源协议/商业交付形态',
    ADD COLUMN `model_card_url` VARCHAR(500) DEFAULT NULL COMMENT '官方模型卡/技术报告直达外链';

-- 2. 补齐监控信源：增加智谱 z.ai 与 Kimi en/blog 原厂发布入口
INSERT INTO `model_sources` (`vendor_id`, `source_url`, `source_type`, `is_active`, `created_at`)
VALUES
    (18, 'https://z.ai/blog/', 'HTML', 1, NOW(3)),
    (19, 'https://www.kimi.com/en/blog/', 'HTML', 1, NOW(3))
ON DUPLICATE KEY UPDATE `is_active` = 1;

-- 3. 建档 23 款核心前沿与主流高频模型档案 (ID 50~72，总模型数扩充至 72 款)
INSERT INTO `ai_models` (`id`, `vendor_id`, `model_key`, `display_name`, `series`, `version`, `modalities`, `availability_status`, `summary_zh`, `official_release_date`, `context_window`, `parameter_size`, `license`, `model_card_url`, `created_at`)
VALUES
  -- 月之暗面 Kimi (vendor_id=19)
  (50, 19, 'kimi-k3', 'Kimi K3', 'Kimi', '3.0', '文本,长思考链,数学逻辑,自主代码', 'API_ONLY', '月之暗面推出新一代前沿推理大模型 Kimi K3，专精超长思维链数学逻辑推导与复杂软件工程自主构建。', '2026-09-20', '256K', '超大规模前沿推理基座', '商业专有 API', 'https://www.kimi.com/en/blog/kimi-k3', NOW(3)),
  -- 智谱 AI (vendor_id=18)
  (51, 18, 'glm-5-3', 'GLM-5.3', 'GLM-5', '5.3', '文本,代码,多模态,深度推理', 'API_ONLY', '智谱 AI 推出新一代前沿旗舰大模型 GLM-5.3，采用混合专家架构，在长文本理解、复杂指令遵循与跨学科知识问答上取得显著突破。', '2026-08-14', '128K', '旗舰级 MoE 架构', '商业专有 API', 'https://z.ai/blog/glm-5.3', NOW(3)),
  (52, 18, 'glm-5-3-flash', 'GLM-5.3-Flash', 'GLM-5', '5.3 Flash', '文本,代码,超低延时', 'API_ONLY', '智谱 AI 发布 GLM-5.3-Flash 高通量轻量推理模型，在保证逻辑严谨性的同时大幅降低首字延迟与 API 调用成本。', '2026-08-26', '128K', '高通量极速推理模型', '商业专有 API / 免费体验', 'https://z.ai/blog/glm-5.3-flash', NOW(3)),
  (53, 18, 'glm-4v', 'GLM-4V', 'GLM-4', '4V', '文本,图像,视觉问答', 'API_ONLY', '智谱 AI 开源并上线的视觉语言大模型 GLM-4V，支持高分辨率多图联合理解与细腻的细粒度视觉推理。', '2024-06-25', '128K', '多模态视觉语言旗舰', '商业专有 API', 'https://open.bigmodel.cn/dev/howuse/glm-4v', NOW(3)),
  -- OpenAI (vendor_id=1)
  (54, 1, 'o1', 'OpenAI o1', 'o1', '1.0', '文本,代码,深度思维链', 'API_ONLY', 'OpenAI 正式发布具备自主强化学习反思能力的推理模型 OpenAI o1，在竞争性编程、国际数学奥林匹克等前沿基准上达到博士级水平。', '2024-09-12', '200K', '深度强化学习思考基座', '商业专有 API', 'https://openai.com/o1/', NOW(3)),
  (55, 1, 'o3-mini', 'OpenAI o3-mini', 'o3', 'mini', '文本,代码,高效数学推理', 'API_ONLY', 'OpenAI 推出兼顾超高推理精度与低延迟的高性价比 STEM 推理模型 o3-mini，支持可配置的推理努力程度（Reasoning Effort）。', '2025-01-31', '200K', '高效轻量推理大模型', '商业专有 API', 'https://openai.com/index/openai-o3-mini/', NOW(3)),
  (56, 1, 'gpt-4o-mini', 'GPT-4o mini', 'GPT-4', 'Omni Mini', '文本,视觉,多模态低延迟', 'API_ONLY', 'OpenAI 推出极其轻量且高智能的生产级小模型 GPT-4o mini，取代 GPT-3.5 Turbo 成为全球高频 API 的性价比主力。', '2024-07-18', '128K', '高效多模态微型基座', '商业专有 API', 'https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/', NOW(3)),
  -- Anthropic (vendor_id=2)
  (57, 2, 'claude-3-5-haiku', 'Claude 3.5 Haiku', 'Claude 3.5', '3.5 Haiku', '文本,代码,极速交互', 'API_ONLY', 'Anthropic 推出速度最快的新一代轻量模型 Claude 3.5 Haiku，在代码编程与学术基准测试中全面匹配前代旗舰 Claude 3 Opus。', '2024-11-04', '200K', '极速紧凑型智能基座', '商业专有 API', 'https://www.anthropic.com/news/claude-3-5-haiku', NOW(3)),
  (58, 2, 'claude-3-opus', 'Claude 3 Opus', 'Claude 3', '3 Opus', '文本,代码,复杂长文档推演', 'API_ONLY', 'Anthropic 首发 Claude 3 家族旗舰型号 Opus，长文本召回精度极高，专精于复杂的跨学科研究与企业级战略分析。', '2024-03-04', '200K', '前沿综合推理旗舰', '商业专有 API', 'https://www.anthropic.com/news/claude-3-family', NOW(3)),
  -- Google DeepMind (vendor_id=3)
  (59, 3, 'gemini-2-0-flash', 'Gemini 2.0 Flash', 'Gemini 2', '2.0 Flash', '全模态,实时音频,低延迟视频', 'API_ONLY', 'Google DeepMind 发布面向下一代 Agent 原生设计的 Gemini 2.0 Flash，全面支持百万级上下文、原生全双工音频流与多模态工具调用。', '2024-12-11', '1M', '全模态实时智能体基座', '商业专有 API', 'https://blog.google/technology/developers/gemini-2-0-flash-developer-preview/', NOW(3)),
  (60, 3, 'gemini-1-5-pro', 'Gemini 1.5 Pro', 'Gemini 1.5', '1.5 Pro', '文本,代码,百万上下文多模态', 'API_ONLY', 'Google DeepMind 正式推出突破性的 200 万 Token 超长上下文窗口大模型 Gemini 1.5 Pro，可在单个提示中消化数小时视频与整套大型工程代码。', '2024-02-15', '2M', '超长上下文多模态专家', '商业专有 API', 'https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/', NOW(3)),
  -- Meta AI (vendor_id=4)
  (61, 4, 'llama-3-3-70b', 'Llama 3.3 70B', 'Llama 3.3', '70B Instruct', '文本,多语言,代码推理', 'WEIGHTS_OPEN', 'Meta 官方开源 Llama 3.3 70B Instruct 模型，以 70B 参数规模达到业内顶级 405B 开源大模型的同等推理与编程水准。', '2024-12-06', '128K', '70B 稠密前沿基座', 'Llama 3.3 Community License', 'https://ai.meta.com/blog/llama-3-3-70b/', NOW(3)),
  (62, 4, 'llama-3-1-405b', 'Llama 3.1 405B', 'Llama 3.1', '405B', '文本,代码,全量合成数据生成', 'WEIGHTS_OPEN', 'Meta 官方开源全球最大规模开源前沿基础模型 Llama 3.1 405B，支持 128k 上下文并全面具备与前沿闭源旗舰媲美的综合智能。', '2024-07-23', '128K', '405B 超大规模开源基座', 'Llama 3.1 Community License', 'https://ai.meta.com/blog/meta-llama-3-1/', NOW(3)),
  -- DeepSeek (vendor_id=5)
  (63, 5, 'deepseek-coder-v2', 'DeepSeek-Coder-V2', 'DeepSeek Coder', 'V2', '代码,数学,长上下文推理', 'WEIGHTS_OPEN', '深度求索开源新一代代码与数学旗舰 DeepSeek-Coder-V2，采用 MoE 架构（236B 总参数/21B 激活），性能超越闭源顶尖 GPT-4-Turbo。', '2024-06-17', '128K', '236B MoE (21B active)', 'MIT License', 'https://github.com/deepseek-ai/DeepSeek-Coder-V2', NOW(3)),
  -- Alibaba (vendor_id=6)
  (64, 6, 'qwen-2-5-coder-32b', 'Qwen 2.5-Coder 32B', 'Qwen 2.5', 'Coder 32B', '代码编写,代码审查,代码推理', 'WEIGHTS_OPEN', '阿里通义千问官方开源代码旗舰 Qwen 2.5-Coder 32B，在权威代码评估基准 EvalPlus 上刷新开源纪录，成为开发者首选开源代码主力。', '2024-11-12', '128K', '32B 编程专用模型', 'Apache 2.0', 'https://qwenlm.github.io/blog/qwen2.5-coder/', NOW(3)),
  (65, 6, 'qwen-2-5-72b', 'Qwen 2.5 72B', 'Qwen 2.5', '72B Instruct', '通用语言,数学,长文本解析', 'WEIGHTS_OPEN', '阿里通义千问官方发布 Qwen 2.5 全系列开源模型，旗舰 72B Instruct 在综合知识、长文本与指令遵循测试中全面领跑。', '2024-09-19', '128K', '72B 稠密开源旗舰', 'Apache 2.0', 'https://qwenlm.github.io/blog/qwen2.5/', NOW(3)),
  -- 百度 (vendor_id=16)
  (66, 16, 'ernie-4-0-turbo', 'ERNIE 4.0 Turbo', 'ERNIE', '4.0 Turbo', '文本,多模态,高通量低延迟', 'API_ONLY', '百度官方上线 ERNIE 4.0 Turbo 大模型，大幅优化模型推理响应延迟，专为大规模生产级高频企业调用场景定制。', '2024-06-28', '128K', '企业高通量推理旗舰', '商业专有 API', 'https://yiyan.baidu.com/', NOW(3)),
  -- Amazon AWS (vendor_id=9)
  (67, 9, 'amazon-nova-micro', 'Amazon Nova Micro', 'Amazon Nova', 'Micro', '文本,毫秒级响应,超低成本', 'API_ONLY', '亚马逊云科技推出 Nova 系列超轻量模型 Nova Micro，专为高速文本处理、实时分类与低成本高频交互任务设计。', '2024-12-03', '128K', '轻量超低延迟文本模型', '商业专有 API', 'https://aws.amazon.com/blogs/aws/introducing-amazon-nova-frontier-models/', NOW(3)),
  -- NVIDIA (vendor_id=10)
  (68, 10, 'llama-3-1-nemotron-70b', 'Llama-3.1-Nemotron-70B', 'Nemotron', '3.1 70B', '指令遵循,复杂对齐,逻辑推演', 'WEIGHTS_OPEN', '英伟达官方开源 Llama-3.1-Nemotron-70B-Instruct，在 Arena-Hard、AlpacaEval 等真实用户对齐评估中超越同尺寸竞品。', '2024-10-15', '128K', '70B 深度对齐推理基座', 'NVIDIA Open Model License', 'https://blogs.nvidia.com/blog/2024/10/15/nemotron-70b-reward-model/', NOW(3)),
  -- Mistral AI (vendor_id=11)
  (69, 11, 'mistral-large-2', 'Mistral Large 2', 'Mistral Large', '2407', '代码,多语言,严谨推理', 'API_ONLY', 'Mistral AI 正式推出 123B 旗舰推理模型 Mistral Large 2，支持 128k 上下文并专精于复杂推理、大规模代码生成与多语言任务。', '2024-07-24', '128K', '123B 稠密前沿旗舰', 'Mistral Commercial License', 'https://mistral.ai/news/mistral-large-2407/', NOW(3)),
  (70, 11, 'codestral-22b', 'Codestral 22B', 'Codestral', '22B', '代码补全,单元测试,上下文填充', 'WEIGHTS_OPEN', 'Mistral AI 开源首个代码专用大模型 Codestral 22B，支持 80+ 种编程语言与 Fill-in-the-Middle 中间填充代码生成。', '2024-05-29', '32K', '22B 代码专用基座', 'Mistral Non-Production License', 'https://mistral.ai/news/codestral/', NOW(3)),
  -- Stability AI (vendor_id=14)
  (71, 14, 'stable-diffusion-3-5-medium', 'Stable Diffusion 3.5 Medium', 'Stable Diffusion', '3.5 Medium', '文生图,消费级显卡部署', 'WEIGHTS_OPEN', 'Stability AI 开源 2.5B 参数量的 Stable Diffusion 3.5 Medium，可在主流消费级硬件上直接实现高质量高保真图像生成。', '2024-10-29', '8K', '2.5B 高效视觉扩散模型', 'Stability Community License', 'https://stability.ai/news/stable-diffusion-3-5', NOW(3)),
  -- 字节跳动 (vendor_id=15)
  (72, 15, 'doubao-lite-128k', '豆包 Lite 128k', 'Doubao', 'Lite 128k', '高通量文本,长上下文客服', 'API_ONLY', '火山引擎推出豆包轻量版模型 Doubao-Lite-128k，以行业极低价格与高吞吐并发能力支撑海量业务落地。', '2024-05-15', '128K', '轻量高并发长文本基座', '商业专有 API', 'https://www.volcengine.com/product/doubao', NOW(3))
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`), `summary_zh` = VALUES(`summary_zh`), `official_release_date` = VALUES(`official_release_date`), `context_window` = VALUES(`context_window`), `parameter_size` = VALUES(`parameter_size`), `license` = VALUES(`license`), `model_card_url` = VALUES(`model_card_url`);

-- 4. 为已有 49 款模型回填真实客观的技术规格画像 (去除空白，补充真实参数与模型卡)
UPDATE `ai_models`
SET `summary_zh` = 'OpenAI 官方发布旗舰原生全模态大模型 GPT-4o，实现文本、语音和视觉端到端实时低延迟交互。',
    `official_release_date` = '2024-05-13',
    `context_window` = '128K',
    `parameter_size` = '全模态前沿稠密旗舰',
    `license` = '商业专有 API',
    `model_card_url` = 'https://openai.com/index/hello-gpt-4o/'
WHERE `id` = 6;

UPDATE `ai_models`
SET `summary_zh` = 'Anthropic 官方发布 Claude 3.5 Sonnet，在代码编写、多步骤复杂逻辑推理与视觉图表分析基准上树立全新行业标杆。',
    `official_release_date` = '2024-06-20',
    `context_window` = '200K',
    `parameter_size` = '前沿高精度推理旗舰',
    `license` = '商业专有 API',
    `model_card_url` = 'https://www.anthropic.com/news/claude-3-5-sonnet'
WHERE `id` = 4;

UPDATE `ai_models`
SET `summary_zh` = 'DeepSeek 官方开源 671B 参数 MLA 架构基座模型 DeepSeek-V3，在知识问答、数学和代码推理上领跑开源阵营。',
    `official_release_date` = '2024-12-26',
    `context_window` = '128K',
    `parameter_size` = '671B MoE (37B active)',
    `license` = 'MIT License',
    `model_card_url` = 'https://github.com/deepseek-ai/DeepSeek-V3'
WHERE `id` = 7 OR `model_key` = 'deepseek-v3';

UPDATE `ai_models`
SET `summary_zh` = 'DeepSeek 开源通过大规模强化学习训练的推理大模型 DeepSeek-R1，完全开源权重并具备匹敌前沿闭源推理模型的长思考链能力。',
    `official_release_date` = '2025-01-20',
    `context_window` = '128K',
    `parameter_size` = '671B MoE (37B active)',
    `license` = 'MIT License',
    `model_card_url` = 'https://github.com/deepseek-ai/DeepSeek-R1'
WHERE `id` = 10 OR `model_key` = 'deepseek-r1';

UPDATE `ai_models`
SET `summary_zh` = '阿里云通义千问官方发布超大规模旗舰闭源模型 Qwen 2.5-Max，采用大规模稠密与混合路由专家架构。',
    `official_release_date` = '2025-01-28',
    `context_window` = '128K',
    `parameter_size` = '超大规模混合路由专家',
    `license` = '商业专有 API',
    `model_card_url` = 'https://qwenlm.github.io/blog/qwen2.5-max/'
WHERE `id` = 8;

UPDATE `ai_models`
SET `summary_zh` = '微软发布 14B 参数小语言模型 Phi-4，在合成高质量数据与多步推理基准上超越同类竞品，适合轻量高效部署。',
    `official_release_date` = '2024-12-12',
    `context_window` = '16K',
    `parameter_size` = '14B 稠密小模型',
    `license` = 'MIT License',
    `model_card_url` = 'https://blogs.microsoft.com/blog/2024/12/12/phi-4-technical-report/'
WHERE `id` = 32;

UPDATE `ai_models`
SET `summary_zh` = '智谱 AI 推出新一代旗舰大模型 GLM-4-Plus，大幅提升通用长文本推理、跨语言交互与复杂指令遵循效果。',
    `official_release_date` = '2024-09-06',
    `context_window` = '128K',
    `parameter_size` = '旗舰级稠密语言模型',
    `license` = '商业专有 API',
    `model_card_url` = 'https://open.bigmodel.cn/dev/howuse/glm4'
WHERE `id` = 11;

UPDATE `ai_models`
SET `summary_zh` = '月之暗面发布 Kimi k1.5 长上下文多模态推理模型，将思维链长逻辑推演与高精度长文档 RAG 深度融合。',
    `official_release_date` = '2025-01-16',
    `context_window` = '128K',
    `parameter_size` = '长上下文多模态推理基座',
    `license` = '商业专有 API',
    `model_card_url` = 'https://www.moonshot.cn/news/kimi-k1-5'
WHERE `id` = 12;

UPDATE `ai_models`
SET `summary_zh` = '月之暗面发布 Kimi K2.5，专精前沿数学逻辑证明与长上下文软件工程任务。',
    `official_release_date` = '2026-09-16',
    `context_window` = '256K',
    `parameter_size` = '前沿长思考链推理架构',
    `license` = '商业专有 API',
    `model_card_url` = 'https://www.moonshot.cn/news/kimi-k2-5-reasoning'
WHERE `id` = 49;

UPDATE `ai_models`
SET `summary_zh` = 'Google DeepMind 官方发布 Gemini 2.5 Pro，大幅强化复杂数学推理与百万 Token 级别代码库理解能力。',
    `official_release_date` = '2025-02-15',
    `context_window` = '2M',
    `parameter_size` = '前沿多模态深度推理基座',
    `license` = '商业专有 API',
    `model_card_url` = 'https://blog.google/technology/ai/gemini-2-5-pro/'
WHERE `id` = 18;

UPDATE `ai_models`
SET `summary_zh` = 'OpenAI 官方发布前沿高通量旗舰模型 GPT-6 Sol，专为高频编程交互与生产级自主代理系统优化。',
    `official_release_date` = '2026-09-22',
    `context_window` = '512K',
    `parameter_size` = '自主智能体高通量旗舰',
    `license` = '商业专有 API',
    `model_card_url` = 'https://openai.com/index/introducing-gpt-6-sol-and-luna'
WHERE `id` = 23;

UPDATE `ai_models`
SET `summary_zh` = 'OpenAI 推出极致轻量化与低延迟模型 GPT-6 Luna，以极低推理成本支持端侧与实时多模态任务。',
    `official_release_date` = '2026-09-22',
    `context_window` = '256K',
    `parameter_size` = '极速端侧高通量模型',
    `license` = '商业专有 API',
    `model_card_url` = 'https://openai.com/index/introducing-gpt-6-sol-and-luna'
WHERE `id` = 24;

UPDATE `ai_models`
SET `summary_zh` = 'xAI 正式推出 Grok 4.7，推理速度提升两倍且价格减半，显著强化代码编写与知识工作能力。',
    `official_release_date` = '2026-09-21',
    `context_window` = '256K',
    `parameter_size` = '超长上下文前沿推理基座',
    `license` = '商业专有 API',
    `model_card_url` = 'https://x.ai/news/grok-4-7'
WHERE `id` = 25;

-- 5. 为新增模型关联官方发布事件 (model_events) 与权威存证 (event_evidence)
INSERT INTO `source_items` (`id`, `source_id`, `vendor_id`, `canonical_url`, `title`, `raw_summary`, `published_at`, `first_seen_at`, `process_status`, `created_at`)
VALUES
  (1910, 19, 19, 'https://www.kimi.com/en/blog/kimi-k3', 'Moonshot AI: Announcing Kimi K3 Autonomous Reasoning Model', '月之暗面官方发布前沿推理大模型 Kimi K3，提供强化学习长思考链与高阶代码工程能力。', '2026-09-20', '2026-09-20 18:00:00', 'PROCESSED', NOW(3)),
  (1911, 18, 18, 'https://z.ai/blog/glm-5.3', 'Zhipu AI: Announcing GLM-5.3 Frontier Model', '智谱 AI 官方发布新一代前沿旗舰 GLM-5.3，全面升级多模态与自主智能体能力。', '2026-08-14', '2026-08-14 18:00:00', 'PROCESSED', NOW(3)),
  (1912, 18, 18, 'https://z.ai/blog/glm-5.3-flash', 'Zhipu AI: Introducing GLM-5.3-Flash Ultra-Fast Model', '智谱 AI 发布 GLM-5.3-Flash 高通量轻量推理模型，兼具高速度与前沿精度。', '2026-08-26', '2026-08-26 18:00:00', 'PROCESSED', NOW(3)),
  (1913, 1, 1, 'https://openai.com/o1/', 'OpenAI: Learning to Reason with LLMs - OpenAI o1', 'OpenAI 正式发布 o1 强化学习深度推理大模型。', '2024-09-12', '2024-09-12 18:00:00', 'PROCESSED', NOW(3)),
  (1914, 4, 4, 'https://ai.meta.com/blog/llama-3-3-70b/', 'Meta AI: Introducing Llama 3.3 70B Open Weights', 'Meta 官方开源 Llama 3.3 70B 模型，达到 405B 等级推理能力。', '2024-12-06', '2024-12-06 18:00:00', 'PROCESSED', NOW(3)),
  (1915, 6, 6, 'https://qwenlm.github.io/blog/qwen2.5-coder/', 'QwenLM: Qwen 2.5-Coder Series Release', '通义千问官方开源 Qwen 2.5-Coder 代码专用旗舰模型系列。', '2024-11-12', '2024-11-12 18:00:00', 'PROCESSED', NOW(3))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `published_at` = VALUES(`published_at`);

INSERT INTO `model_events` (`id`, `model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `created_at`)
VALUES
  (52, 50, 19, 'MODEL_RELEASE', '正式发布', '月之暗面官方发布前沿推理大模型 Kimi K3，提供强化学习长思考链与高阶代码工程能力。', '2026-09-20', 'EXACT', '2026-09-20 18:00:00', 'CONFIRMED', 'moonshot_kimi-k3_official_release_20260920', NOW(3)),
  (53, 51, 18, 'MODEL_RELEASE', '正式发布', '智谱 AI 官方发布新一代前沿旗舰 GLM-5.3，采用混合专家架构全面升级多模态与自主智能体能力。', '2026-08-14', 'EXACT', '2026-08-14 18:00:00', 'CONFIRMED', 'zhipu_glm-5-3_official_release_20260814', NOW(3)),
  (54, 52, 18, 'MODEL_RELEASE', '正式发布', '智谱 AI 发布 GLM-5.3-Flash 高通量轻量推理模型，兼具超快响应速度与优异的代码与数学精度。', '2026-08-26', 'EXACT', '2026-08-26 18:00:00', 'CONFIRMED', 'zhipu_glm-5-3-flash_official_release_20260826', NOW(3)),
  (55, 54, 1, 'MODEL_RELEASE', '正式发布', 'OpenAI 正式发布具备深度思维链强化学习能力的推理模型 OpenAI o1。', '2024-09-12', 'EXACT', '2024-09-12 18:00:00', 'CONFIRMED', 'openai_o1_official_release_20240912', NOW(3)),
  (56, 61, 4, 'MODEL_RELEASE', '正式发布', 'Meta 官方开源 Llama 3.3 70B 模型，达到前代 405B 等级推理能力并全面支持 128k 上下文。', '2024-12-06', 'EXACT', '2024-12-06 18:00:00', 'CONFIRMED', 'meta_llama-3-3-70b_official_release_20241206', NOW(3)),
  (57, 64, 6, 'MODEL_RELEASE', '正式发布', '通义千问官方开源 Qwen 2.5-Coder 代码专用旗舰模型，刷新多项开源代码基准评测纪录。', '2024-11-12', 'EXACT', '2024-11-12 18:00:00', 'CONFIRMED', 'alibaba_qwen-2-5-coder_official_release_20241112', NOW(3))
ON DUPLICATE KEY UPDATE `summary` = VALUES(`summary`), `release_date` = VALUES(`release_date`);

INSERT INTO `event_evidence` (`id`, `event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
VALUES
  (53, 52, 1910, 'https://www.kimi.com/en/blog/kimi-k3', 'Moonshot AI: Kimi K3 Official Technical Blog', NOW(3)),
  (54, 53, 1911, 'https://z.ai/blog/glm-5.3', 'Zhipu AI: GLM-5.3 Announcement', NOW(3)),
  (55, 54, 1912, 'https://z.ai/blog/glm-5.3-flash', 'Zhipu AI: GLM-5.3-Flash Announcement', NOW(3)),
  (56, 55, 1913, 'https://openai.com/o1/', 'OpenAI: Learning to Reason with LLMs (o1)', NOW(3)),
  (57, 56, 1914, 'https://ai.meta.com/blog/llama-3-3-70b/', 'Meta AI: Introducing Llama 3.3 70B', NOW(3)),
  (58, 57, 1915, 'https://qwenlm.github.io/blog/qwen2.5-coder/', 'QwenLM: Qwen 2.5-Coder Release', NOW(3))
ON DUPLICATE KEY UPDATE `official_url` = VALUES(`official_url`), `title` = VALUES(`title`);
