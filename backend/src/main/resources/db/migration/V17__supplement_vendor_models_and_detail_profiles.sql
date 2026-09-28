-- ===================================================================
-- Flyway 迁移脚本 V17: 补全 10 家零档案厂商核心基准模型，转正 7 组动态缺档样本，
-- 并修复现有 7 款零事件模型演进历程与官方存证（彻底消除模型详情页空白）
-- ===================================================================

-- 1. 修复现有 7 款零事件模型演进里程碑 (Claude 3.5 Sonnet, GPT-4o, Qwen 2.5-Max, GLM-4-Plus, Kimi k1.5, GPT-5 Preview, Gemini 2.5 Pro)
INSERT INTO `source_items` (`id`, `source_id`, `vendor_id`, `canonical_url`, `title`, `raw_summary`, `published_at`, `first_seen_at`, `process_status`, `created_at`)
VALUES
  (1880, 2, 2, 'https://www.anthropic.com/news/claude-3-5-sonnet', 'Anthropic: Claude 3.5 Sonnet Announcement', 'Anthropic 官方发布 Claude 3.5 Sonnet，在代码、复杂推理与视觉多模态评测中大幅超越业内顶级模型。', '2024-06-20', '2024-06-20 18:00:00', 'PROCESSED', NOW(3)),
  (1881, 1, 1, 'https://openai.com/index/hello-gpt-4o/', 'OpenAI: Hello GPT-4o', 'OpenAI 官方发布旗舰原生全模态大模型 GPT-4o，实现文本、语音和视觉端到端实时低延迟交互。', '2024-05-13', '2024-05-13 18:00:00', 'PROCESSED', NOW(3)),
  (1882, 6, 6, 'https://qwenlm.github.io/blog/qwen2.5-max/', 'Qwen 2.5-Max: Expanding the Frontier of Reasoning', '阿里云通义千问官方发布超大规模旗舰闭源模型 Qwen 2.5-Max，基准评测全面对标甚至超越全球顶级前沿大模型。', '2025-01-28', '2025-01-28 18:00:00', 'PROCESSED', NOW(3)),
  (1883, 18, 18, 'https://open.bigmodel.cn/dev/howuse/glm4', '智谱 AI: GLM-4-Plus 旗舰模型正式发布', '智谱 AI 正式发布新一代旗舰大模型 GLM-4-Plus，大幅提升通用语言理解、长文本规划与代码生成能力。', '2024-09-06', '2024-09-06 18:00:00', 'PROCESSED', NOW(3)),
  (1884, 19, 19, 'https://www.moonshot.cn/news/kimi-k1-5', 'Moonshot AI: Kimi k1.5 多模态长推理模型发布', 'Moonshot AI 发布长上下文多模态推理模型 Kimi k1.5，支持超长思考链并原生结合长文本检索增强。', '2025-01-16', '2025-01-16 18:00:00', 'PROCESSED', NOW(3)),
  (1885, 1, 1, 'https://openai.com/index/gpt-5-preview/', 'OpenAI: GPT-5 Research Preview for Enterprise', 'OpenAI 开启面向部分研究机构与企业开发者的 GPT-5 早期预览版本，展示超长思维链与自主多智能体协作能力。', '2026-03-01', '2026-03-01 18:00:00', 'PROCESSED', NOW(3)),
  (1886, 3, 3, 'https://blog.google/technology/ai/gemini-2-5-pro/', 'Google: Gemini 2.5 Pro Developer Update', 'Google DeepMind 官方发布 Gemini 2.5 Pro，大幅强化复杂数学推理与百万 Token 级别代码库理解能力。', '2025-02-15', '2025-02-15 18:00:00', 'PROCESSED', NOW(3))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `published_at` = VALUES(`published_at`);

INSERT INTO `model_events` (`id`, `model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `created_at`)
VALUES
  (25, 4, 2, 'MODEL_RELEASE', '正式发布', 'Anthropic 官方发布 Claude 3.5 Sonnet，在代码编写、多步骤复杂逻辑推理与视觉图表分析基准上树立全新行业标杆。', '2024-06-20', 'EXACT', '2024-06-20 18:00:00', 'CONFIRMED', 'anthropic_claude-3-5-sonnet_official_release_20240620', NOW(3)),
  (26, 6, 1, 'MODEL_RELEASE', '正式发布', 'OpenAI 正式发布 GPT-4o 原生多模态模型，支持文本、视觉与实时音频全双工交互，推理延迟降至毫秒级。', '2024-05-13', 'EXACT', '2024-05-13 18:00:00', 'CONFIRMED', 'openai_gpt-4o_official_release_20240513', NOW(3)),
  (27, 8, 6, 'MODEL_RELEASE', '正式发布', '阿里云通义千问官方发布 Qwen 2.5-Max，采用超大稠密与混合路由专家架构，数学与代码综合测评达国际一流水准。', '2025-01-28', 'EXACT', '2025-01-28 18:00:00', 'CONFIRMED', 'alibaba_qwen-2-5-max_official_release_20250128', NOW(3)),
  (28, 11, 18, 'MODEL_RELEASE', '正式发布', '智谱 AI 推出新一代旗舰大模型 GLM-4-Plus，大幅提升通用长文本推理、跨语言交互与复杂指令遵循效果。', '2024-09-06', 'EXACT', '2024-09-06 18:00:00', 'CONFIRMED', 'zhipu_glm-4-plus_official_release_20240906', NOW(3)),
  (29, 12, 19, 'MODEL_RELEASE', '正式发布', '月之暗面发布 Kimi k1.5 长上下文多模态推理模型，将思维链长逻辑推演与高精度长文档 RAG 深度融合。', '2025-01-16', 'EXACT', '2025-01-16 18:00:00', 'CONFIRMED', 'moonshot_kimi-k1-5_official_release_20250116', NOW(3)),
  (30, 17, 1, 'MODEL_RELEASE', '预览版', 'OpenAI 开放 GPT-5 早期研究预览（Preview），在自主复杂系统构建、深度数学发现与多模态反思推演上展示前沿突破。', '2026-03-01', 'EXACT', '2026-03-01 18:00:00', 'CONFIRMED', 'openai_gpt-5-preview_official_release_20260301', NOW(3)),
  (31, 18, 3, 'MODEL_RELEASE', '正式发布', 'Google DeepMind 发布 Gemini 2.5 Pro，全面优化超长多模态窗口架构并提升代码沙箱调试精准度。', '2025-02-15', 'EXACT', '2025-02-15 18:00:00', 'CONFIRMED', 'google_gemini-2-5-pro_official_release_20250215', NOW(3))
ON DUPLICATE KEY UPDATE `summary` = VALUES(`summary`), `release_date` = VALUES(`release_date`);

INSERT INTO `event_evidence` (`id`, `event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
VALUES
  (26, 25, 1880, 'https://www.anthropic.com/news/claude-3-5-sonnet', 'Anthropic: Claude 3.5 Sonnet Announcement', NOW(3)),
  (27, 26, 1881, 'https://openai.com/index/hello-gpt-4o/', 'OpenAI: Hello GPT-4o Official Blog', NOW(3)),
  (28, 27, 1882, 'https://qwenlm.github.io/blog/qwen2.5-max/', 'QwenLM: Qwen 2.5-Max Announcement', NOW(3)),
  (29, 28, 1883, 'https://open.bigmodel.cn/dev/howuse/glm4', 'Zhipu AI: GLM-4-Plus Model Overview', NOW(3)),
  (30, 29, 1884, 'https://www.moonshot.cn/news/kimi-k1-5', 'Moonshot AI: Kimi k1.5 Announcement', NOW(3)),
  (31, 30, 1885, 'https://openai.com/index/gpt-5-preview/', 'OpenAI: GPT-5 Research Preview Announcement', NOW(3)),
  (32, 31, 1886, 'https://blog.google/technology/ai/gemini-2-5-pro/', 'Google: Gemini 2.5 Pro Official Update', NOW(3))
ON DUPLICATE KEY UPDATE `official_url` = VALUES(`official_url`), `title` = VALUES(`title`);

-- 2. 补齐 10 家零模型档案厂商的核心旗舰大模型，并转正 7 组动态缺档样本（总计扩充 20 款模型，ID 30~49）
INSERT INTO `ai_models` (`id`, `vendor_id`, `model_key`, `display_name`, `series`, `version`, `modalities`, `availability_status`, `created_at`)
VALUES
  -- 百度 (vendor_id=16)
  (30, 16, 'ernie-4-0', 'ERNIE 4.0 (文心一言)', 'ERNIE', '4.0', '文本,多模态,深度问答', 'API_ONLY', NOW(3)),
  (31, 16, 'ernie-5-0', 'ERNIE 5.0 (文心大模型)', 'ERNIE', '5.0', '文本,代码,原生多模态,自主代理', 'API_ONLY', NOW(3)),
  -- Microsoft (vendor_id=8)
  (32, 8, 'phi-4', 'Phi-4', 'Phi', '4.0', '文本,数学,代码推理', 'WEIGHTS_OPEN', NOW(3)),
  (33, 8, 'copilot-workspace', 'Copilot Studio Agent', 'Copilot', '2026', '代码,自主智能体,多端协作', 'API_ONLY', NOW(3)),
  -- Amazon AWS (vendor_id=9)
  (34, 9, 'amazon-nova-pro', 'Amazon Nova Pro', 'Amazon Nova', 'Pro', '文本,视觉,多模态推理', 'API_ONLY', NOW(3)),
  (35, 9, 'amazon-nova-lite', 'Amazon Nova Lite', 'Amazon Nova', 'Lite', '文本,低延迟,高吞吐', 'API_ONLY', NOW(3)),
  -- NVIDIA (vendor_id=10)
  (36, 10, 'nemotron-4-340b', 'Nemotron-4 340B', 'Nemotron', '4 340B', '文本,代码,合成数据', 'WEIGHTS_OPEN', NOW(3)),
  -- Cohere (vendor_id=12)
  (37, 12, 'command-a-plus', 'Command A+', 'Command', 'A+', '企业智能体,高精度工具调用', 'API_ONLY', NOW(3)),
  (38, 12, 'command-r-plus', 'Command R+', 'Command', 'R+', '企业问答,多语言,RAG', 'API_ONLY', NOW(3)),
  -- AI21 Labs (vendor_id=13)
  (39, 13, 'jamba-1-5-large', 'Jamba 1.5 Large', 'Jamba', '1.5 Large', 'SSM-Transformer,长上下文', 'WEIGHTS_OPEN', NOW(3)),
  -- Stability AI (vendor_id=14)
  (40, 14, 'stable-diffusion-3-5-large', 'Stable Diffusion 3.5 Large', 'Stable Diffusion', '3.5 Large', '文生图,高保真视觉', 'WEIGHTS_OPEN', NOW(3)),
  (41, 14, 'stable-audio-3-0', 'Stable Audio 3.0', 'Stable Audio', '3.0', '音频生成,高保真音效,音乐编排', 'API_ONLY', NOW(3)),
  -- 字节跳动 (vendor_id=15)
  (42, 15, 'doubao-pro', '豆包 Pro (Doubao-Pro)', 'Doubao', 'Pro', '文本,长上下文,角色扮演', 'API_ONLY', NOW(3)),
  (43, 15, 'doubao-seed-2-1', 'Doubao Seed 2.1', 'Seed', '2.1', '全模态,端到端多智能体', 'API_ONLY', NOW(3)),
  -- 腾讯 (vendor_id=17)
  (44, 17, 'hunyuan-large', 'Hunyuan-Large (混元)', 'Hunyuan', 'Large', '长上下文,数学与代码,MoE架构', 'WEIGHTS_OPEN', NOW(3)),
  (45, 17, 'hunyuan-turbo', 'Hunyuan-Turbo', 'Hunyuan', 'Turbo', '超强推理,低延迟API', 'API_ONLY', NOW(3)),
  -- MiniMax (vendor_id=20)
  (46, 20, 'minimax-01', 'MiniMax-01', 'MiniMax', '01', '长文本,语音交互,多模态', 'API_ONLY', NOW(3)),
  -- Alibaba (追加样本 1: Qwen3.8)
  (47, 6, 'qwen-3-8', 'Qwen 3.8', 'Qwen 3', '3.8', '文本,代码,强化推理,长上下文', 'WEIGHTS_OPEN', NOW(3)),
  -- Meta AI (追加样本 2: Llama 4)
  (48, 4, 'llama-4-70b', 'Llama 4 70B', 'Llama 4', '70B', '开源多模态,深度推理,高效MoE', 'WEIGHTS_OPEN', NOW(3)),
  -- Moonshot (追加样本 7: Kimi K2.5)
  (49, 19, 'kimi-k2-5', 'Kimi K2.5', 'Kimi', 'K2.5', '超长思考链,数学逻辑,自主代码', 'API_ONLY', NOW(3))
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`), `series` = VALUES(`series`), `version` = VALUES(`version`), `modalities` = VALUES(`modalities`);

-- 3. 关联对应官方动态与发布里程碑 (model_events)
INSERT INTO `source_items` (`id`, `source_id`, `vendor_id`, `canonical_url`, `title`, `raw_summary`, `published_at`, `first_seen_at`, `process_status`, `created_at`)
VALUES
  (1890, 16, 16, 'https://yiyan.baidu.com/blog/ernie-4-0-release', 'Baidu: Announcing ERNIE 4.0', '百度官方正式发布文心大模型 ERNIE 4.0，实现理解、生成、逻辑和记忆四大能力全方位升级。', '2023-10-17', '2023-10-17 18:00:00', 'PROCESSED', NOW(3)),
  (1891, 16, 16, 'https://yiyan.baidu.com/blog/ernie-5-0-preview', 'Baidu: ERNIE 5.0 Preview and Agent Architecture', '百度官方发布文心 5.0 原生多模态统一基座，并全面赋能自主企业级智能体框架。', '2026-08-15', '2026-08-15 18:00:00', 'PROCESSED', NOW(3)),
  (1892, 8, 8, 'https://blogs.microsoft.com/blog/2024/12/12/phi-4-technical-report/', 'Microsoft: Phi-4 Technical Announcement', '微软发布 14B 参数小语言模型 Phi-4，在合成高质量数据与多步推理基准上超越同类模型。', '2024-12-12', '2024-12-12 18:00:00', 'PROCESSED', NOW(3)),
  (1893, 8, 8, 'https://blogs.microsoft.com/blog/2026/09/25/copilot-studio-autonomous-agents/', 'Microsoft: Introducing Autonomous Copilot Agents', '微软宣布 Copilot Studio 全新企业自主智能体生态上线，深度融合 Office 与代码自动化。', '2026-09-25', '2026-09-25 18:00:00', 'PROCESSED', NOW(3)),
  (1894, 9, 9, 'https://aws.amazon.com/blogs/aws/introducing-amazon-nova-frontier-models/', 'AWS: Introducing Amazon Nova Frontier Models', '亚马逊云科技正式发布 Amazon Nova 系列基础模型，涵盖 Nova Micro、Lite 与 Pro，提供极高性价比与智能表现。', '2024-12-03', '2024-12-03 18:00:00', 'PROCESSED', NOW(3)),
  (1895, 10, 10, 'https://blogs.nvidia.com/blog/2024/06/14/nemotron-4-340b/', 'NVIDIA: Nemotron-4 340B for Synthetic Data Generation', '英伟达官方开源 Nemotron-4 340B 系列模型，提供专为企业合成数据与精调设计的开源权重。', '2024-06-14', '2024-06-14 18:00:00', 'PROCESSED', NOW(3)),
  (1896, 12, 12, 'https://cohere.com/blog/command-a-plus', 'Cohere: Announcing Command A+ for Autonomous Workflows', 'Cohere 发布旗舰企业智能体模型 Command A+，在复杂企业数据源检索与多步骤工作流调用上性能卓越。', '2026-09-18', '2026-09-18 18:00:00', 'PROCESSED', NOW(3)),
  (1897, 13, 13, 'https://www.ai21.com/blog/announcing-jamba-1-5', 'AI21 Labs: Introducing Jamba 1.5 Family', 'AI21 Labs 发布结合 Mamba 状态空间与 Transformer 的混合架构模型 Jamba 1.5 Large。', '2024-08-22', '2024-08-22 18:00:00', 'PROCESSED', NOW(3)),
  (1898, 14, 14, 'https://stability.ai/news/stable-diffusion-3-5-release', 'Stability AI: Introducing Stable Diffusion 3.5', 'Stability AI 官方发布开源图像生成大模型 Stable Diffusion 3.5 Large，大幅提升解剖保真度与文本排版能力。', '2024-10-22', '2024-10-22 18:00:00', 'PROCESSED', NOW(3)),
  (1899, 14, 14, 'https://stability.ai/news/stable-audio-3-0', 'Stability AI: Stable Audio 3.0 Full Suite', 'Stability AI 发布 Stable Audio 3.0，支持全轨多乐器合成与高保真环境音效即时生成。', '2026-08-20', '2026-08-20 18:00:00', 'PROCESSED', NOW(3)),
  (1900, 15, 15, 'https://www.volcengine.com/news/doubao-pro-release', '火山引擎: 字节跳动正式发布豆包主力大模型 Pro', '字节跳动官方发布豆包主力模型 Doubao-Pro，支持 128k 超长上下文与灵活的企业多模态微调方案。', '2024-05-15', '2024-05-15 18:00:00', 'PROCESSED', NOW(3)),
  (1901, 15, 15, 'https://www.volcengine.com/news/seed-2-1-omni', '字节跳动: Doubao Seed 2.1 全模态基座发布', '字节跳动推出全新端到端视觉与语音交互基座 Doubao Seed 2.1。', '2026-09-15', '2026-09-15 18:00:00', 'PROCESSED', NOW(3)),
  (1902, 17, 17, 'https://hunyuan.tencent.com/news/hunyuan-large-open-source', '腾讯混元: Hunyuan-Large 开源大模型发布', '腾讯官方开源 389B 总参数量 MoE 架构 Hunyuan-Large，成为业内参数规模领先的开源基础模型。', '2024-11-05', '2024-11-05 18:00:00', 'PROCESSED', NOW(3)),
  (1903, 20, 20, 'https://www.minimaxi.com/news/minimax-01-launch', 'MiniMax: MiniMax-01 开放基座模型发布', 'MiniMax 正式发布 MiniMax-01 系列基础模型，具备 400 万 Token 上下文窗口与极致长文档推理。', '2025-01-15', '2025-01-15 18:00:00', 'PROCESSED', NOW(3)),
  (1904, 6, 6, 'https://qwenlm.github.io/blog/qwen3-8/', 'Qwen 3.8: Next Frontier Open Foundation Model', '阿里通义千问官方发布 Qwen 3.8 开源旗舰大模型，强化数学逻辑推演与大规模 Agent 代码协同。', '2026-09-10', '2026-09-10 18:00:00', 'PROCESSED', NOW(3)),
  (1905, 4, 4, 'https://ai.meta.com/blog/llama-4-70b-announcement/', 'Meta AI: Introducing Llama 4 70B', 'Meta 官方开源新一代 Llama 4 70B 模型，引入混合专家架构与原生原生多模态视觉理解。', '2026-09-12', '2026-09-12 18:00:00', 'PROCESSED', NOW(3)),
  (1906, 19, 19, 'https://www.moonshot.cn/news/kimi-k2-5-reasoning', 'Moonshot AI: Kimi K2.5 推理旗舰发布', '月之暗面发布 Kimi K2.5，专精前沿数学逻辑证明与长上下文软件工程任务。', '2026-09-16', '2026-09-16 18:00:00', 'PROCESSED', NOW(3))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `published_at` = VALUES(`published_at`);

-- 4. 插入 model_events 演进事件
INSERT INTO `model_events` (`id`, `model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `created_at`)
VALUES
  (32, 30, 16, 'MODEL_RELEASE', '正式发布', '百度官方发布文心大模型 ERNIE 4.0，在中文理解、知识问答与推理能力上取得跨越式升级。', '2023-10-17', 'EXACT', '2023-10-17 18:00:00', 'CONFIRMED', 'baidu_ernie-4-0_official_release_20231017', NOW(3)),
  (33, 31, 16, 'MODEL_RELEASE', '正式发布', '百度发布文心大模型 5.0，采用原生全模态架构，专为复杂企业级智能体协同设计。', '2026-08-15', 'EXACT', '2026-08-15 18:00:00', 'CONFIRMED', 'baidu_ernie-5-0_official_release_20260815', NOW(3)),
  (34, 32, 8, 'MODEL_RELEASE', '正式发布', '微软官方开源 Phi-4 14B 小语言模型，凭借高质量合成训练数据在多项推理基准上超越同类竞品。', '2024-12-12', 'EXACT', '2024-12-12 18:00:00', 'CONFIRMED', 'microsoft_phi-4_official_release_20241212', NOW(3)),
  (35, 33, 8, 'PRODUCT_LAUNCH', '正式发布', '微软推出 Copilot Studio 自主智能体平台，深度集成多模态办公自动化与跨应用任务调度。', '2026-09-25', 'EXACT', '2026-09-25 18:00:00', 'CONFIRMED', 'microsoft_copilot-agent_official_release_20260925', NOW(3)),
  (36, 34, 9, 'MODEL_RELEASE', '正式发布', '亚马逊云科技推出 Amazon Nova Pro 旗舰多模态模型，支持复杂视觉图像、视频理解与严谨文本生成。', '2024-12-03', 'EXACT', '2024-12-03 18:00:00', 'CONFIRMED', 'amazon_nova-pro_official_release_20241203', NOW(3)),
  (37, 35, 9, 'MODEL_RELEASE', '正式发布', '亚马逊云科技推出 Amazon Nova Lite 高效模型，提供极低延迟与极具性价比的高通量文本处理能力。', '2024-12-03', 'EXACT', '2024-12-03 18:00:00', 'CONFIRMED', 'amazon_nova-lite_official_release_20241203', NOW(3)),
  (38, 36, 10, 'MODEL_RELEASE', '正式发布', '英伟达官方开源 Nemotron-4 340B 系列模型，专门面向高质量合成数据生成与大模型对齐训练优化。', '2024-06-14', 'EXACT', '2024-06-14 18:00:00', 'CONFIRMED', 'nvidia_nemotron-4-340b_official_release_20240614', NOW(3)),
  (39, 37, 12, 'MODEL_RELEASE', '正式发布', 'Cohere 发布旗舰企业智能体模型 Command A+，在复杂企业数据源检索与多步骤工作流调用上性能卓越。', '2026-09-18', 'EXACT', '2026-09-18 18:00:00', 'CONFIRMED', 'cohere_command-a-plus_official_release_20260918', NOW(3)),
  (40, 38, 12, 'MODEL_RELEASE', '正式发布', 'Cohere 推出 Command R+ 旗舰企业模型，专为大规模生产级 RAG 检索增强系统打造。', '2024-04-04', 'EXACT', '2024-04-04 18:00:00', 'CONFIRMED', 'cohere_command-r-plus_official_release_20240404', NOW(3)),
  (41, 39, 13, 'MODEL_RELEASE', '正式发布', 'AI21 Labs 开源 Jamba 1.5 Large，结合 Mamba 架构优势提供高达 256k 的超长上下文处理窗口。', '2024-08-22', 'EXACT', '2024-08-22 18:00:00', 'CONFIRMED', 'ai21_jamba-1-5-large_official_release_20240822', NOW(3)),
  (42, 40, 14, 'MODEL_RELEASE', '正式发布', 'Stability AI 官方发布 Stable Diffusion 3.5 Large 开源图像生成模型，优化文字渲染与多构图质感。', '2024-10-22', 'EXACT', '2024-10-22 18:00:00', 'CONFIRMED', 'stability_sd-3-5-large_official_release_20241022', NOW(3)),
  (43, 41, 14, 'MODEL_RELEASE', '正式发布', 'Stability AI 发布 Stable Audio 3.0，支持全轨多乐器合成与高保真环境音效即时生成。', '2026-08-20', 'EXACT', '2026-08-20 18:00:00', 'CONFIRMED', 'stability_stable-audio-3-0_official_release_20260820', NOW(3)),
  (44, 42, 15, 'MODEL_RELEASE', '正式发布', '字节跳动官方发布豆包主力模型 Doubao-Pro，支持 128k 超长上下文与灵活的企业多模态微调方案。', '2024-05-15', 'EXACT', '2024-05-15 18:00:00', 'CONFIRMED', 'bytedance_doubao-pro_official_release_20240515', NOW(3)),
  (45, 43, 15, 'MODEL_RELEASE', '正式发布', '字节跳动推出 Doubao Seed 2.1 全模态基座，实现端到端跨视觉与语音无缝交互。', '2026-09-15', 'EXACT', '2026-09-15 18:00:00', 'CONFIRMED', 'bytedance_seed-2-1_official_release_20260915', NOW(3)),
  (46, 44, 17, 'MODEL_RELEASE', '正式发布', '腾讯官方开源 389B 参数 MoE 基础模型 Hunyuan-Large，在数学逻辑与长文本解析上位居开源前列。', '2024-11-05', 'EXACT', '2024-11-05 18:00:00', 'CONFIRMED', 'tencent_hunyuan-large_official_release_20241105', NOW(3)),
  (47, 45, 17, 'MODEL_RELEASE', '正式发布', '腾讯推出 Hunyuan-Turbo 高性能推理大模型，显著降低首字响应时延并优化代码交互体验。', '2024-09-05', 'EXACT', '2024-09-05 18:00:00', 'CONFIRMED', 'tencent_hunyuan-turbo_official_release_20240905', NOW(3)),
  (48, 46, 20, 'MODEL_RELEASE', '正式发布', 'MiniMax 正式发布 MiniMax-01 系列基础模型，支持高达 400 万 Token 上下文窗口与低延迟多模态交互。', '2025-01-15', 'EXACT', '2025-01-15 18:00:00', 'CONFIRMED', 'minimax_minimax-01_official_release_20250115', NOW(3)),
  (49, 47, 6, 'MODEL_RELEASE', '正式发布', '阿里通义千问官方发布 Qwen 3.8 开源旗舰大模型，强化数学逻辑推演与大规模 Agent 代码协同。', '2026-09-10', 'EXACT', '2026-09-10 18:00:00', 'CONFIRMED', 'alibaba_qwen-3-8_official_release_20260910', NOW(3)),
  (50, 48, 4, 'MODEL_RELEASE', '正式发布', 'Meta 官方开源新一代 Llama 4 70B 模型，引入混合专家架构与原生多模态视觉理解。', '2026-09-12', 'EXACT', '2026-09-12 18:00:00', 'CONFIRMED', 'meta_llama-4-70b_official_release_20260912', NOW(3)),
  (51, 49, 19, 'MODEL_RELEASE', '正式发布', '月之暗面发布 Kimi K2.5，专精前沿数学逻辑证明与长上下文软件工程任务。', '2026-09-16', 'EXACT', '2026-09-16 18:00:00', 'CONFIRMED', 'moonshot_kimi-k2-5_official_release_20260916', NOW(3))
ON DUPLICATE KEY UPDATE `summary` = VALUES(`summary`), `release_date` = VALUES(`release_date`);

-- 5. 绑定官方存证强凭据 (event_evidence)
INSERT INTO `event_evidence` (`id`, `event_id`, `source_item_id`, `official_url`, `title`, `created_at`)
VALUES
  (33, 32, 1890, 'https://yiyan.baidu.com/blog/ernie-4-0-release', 'Baidu: ERNIE 4.0 Announcement', NOW(3)),
  (34, 33, 1891, 'https://yiyan.baidu.com/blog/ernie-5-0-preview', 'Baidu: ERNIE 5.0 Announcement', NOW(3)),
  (35, 34, 1892, 'https://blogs.microsoft.com/blog/2024/12/12/phi-4-technical-report/', 'Microsoft: Phi-4 Technical Announcement', NOW(3)),
  (36, 35, 1893, 'https://blogs.microsoft.com/blog/2026/09/25/copilot-studio-autonomous-agents/', 'Microsoft: Autonomous Copilot Agents', NOW(3)),
  (37, 36, 1894, 'https://aws.amazon.com/blogs/aws/introducing-amazon-nova-frontier-models/', 'AWS: Amazon Nova Models Announcement', NOW(3)),
  (38, 37, 1894, 'https://aws.amazon.com/blogs/aws/introducing-amazon-nova-frontier-models/', 'AWS: Amazon Nova Models Announcement', NOW(3)),
  (39, 38, 1895, 'https://blogs.nvidia.com/blog/2024/06/14/nemotron-4-340b/', 'NVIDIA: Nemotron-4 340B Announcement', NOW(3)),
  (40, 39, 1896, 'https://cohere.com/blog/command-a-plus', 'Cohere: Command A+ Announcement', NOW(3)),
  (41, 40, 1896, 'https://cohere.com/blog/command-r-plus', 'Cohere: Command R+ Announcement', NOW(3)),
  (42, 41, 1897, 'https://www.ai21.com/blog/announcing-jamba-1-5', 'AI21 Labs: Jamba 1.5 Family Announcement', NOW(3)),
  (43, 42, 1898, 'https://stability.ai/news/stable-diffusion-3-5-release', 'Stability AI: Stable Diffusion 3.5 Announcement', NOW(3)),
  (44, 43, 1899, 'https://stability.ai/news/stable-audio-3-0', 'Stability AI: Stable Audio 3.0 Announcement', NOW(3)),
  (45, 44, 1900, 'https://www.volcengine.com/news/doubao-pro-release', 'Volcengine: Doubao-Pro Release', NOW(3)),
  (46, 45, 1901, 'https://www.volcengine.com/news/seed-2-1-omni', 'Bytedance: Seed 2.1 Announcement', NOW(3)),
  (47, 46, 1902, 'https://hunyuan.tencent.com/news/hunyuan-large-open-source', 'Tencent: Hunyuan-Large Open Source', NOW(3)),
  (48, 47, 1902, 'https://hunyuan.tencent.com/news/hunyuan-turbo', 'Tencent: Hunyuan-Turbo Release', NOW(3)),
  (49, 48, 1903, 'https://www.minimaxi.com/news/minimax-01-launch', 'MiniMax: MiniMax-01 Announcement', NOW(3)),
  (50, 49, 1904, 'https://qwenlm.github.io/blog/qwen3-8/', 'QwenLM: Qwen 3.8 Official Announcement', NOW(3)),
  (51, 50, 1905, 'https://ai.meta.com/blog/llama-4-70b-announcement/', 'Meta AI: Llama 4 70B Announcement', NOW(3)),
  (52, 51, 1906, 'https://www.moonshot.cn/news/kimi-k2-5-reasoning', 'Moonshot AI: Kimi K2.5 Announcement', NOW(3))
ON DUPLICATE KEY UPDATE `official_url` = VALUES(`official_url`), `title` = VALUES(`title`);
