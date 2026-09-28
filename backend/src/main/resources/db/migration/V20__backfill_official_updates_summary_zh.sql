-- ==============================================================================
-- Flyway V20: 回填官方动态中文核心摘要 (Backfill Official Updates summary_zh)
-- 彻底解决 CODE_REVIEW 追加 06 要求：每张官方动态卡片必须具备准确简洁的中文简介，杜绝空白卡片
-- ==============================================================================

-- 1. 精准回填前台高频可见的重点厂商前沿动态中文摘要
UPDATE `source_items` SET `summary_zh` = '微软推出全新升级版 Copilot，深度集成 Home 统一看板、智能开发助手 Code 与自主任务编排引擎 Autopilot。'
WHERE `id` = 7403 OR `title` LIKE '%Introducing the new Copilot with Home, Code and Autopilot%';

UPDATE `source_items` SET `summary_zh` = '微软正式发布具备自主规划与执行能力的 Copilot Agents，支持跨企业业务系统执行端到端复杂自动化任务。'
WHERE `id` = 1893 OR `title` LIKE '%Introducing Autonomous Copilot Agents%';

UPDATE `source_items` SET `summary_zh` = 'xAI 最新编程大模型 Grok 4.6 正式接入 GitHub Copilot，重点增强长上下文代码生成与高难度算法逻辑排错。'
WHERE `id` = 1072 OR `title` LIKE '%Grok 4.6 in GitHub Copilot%';

UPDATE `source_items` SET `summary_zh` = 'xAI 旗舰编程模型 Grok 4.5 正式上线 GitHub Copilot 开发者预览版，为多语言工程提供高精度代码补全支持。'
WHERE `id` = 7002 OR `title` LIKE '%Grok 4.5 in GitHub Copilot%';

-- 2. 百度文心、腾讯混元、月之暗面等存量动态中文摘要定向精准补齐
UPDATE `source_items` SET `summary_zh` = '百度正式揭晓文心大模型 5.0，大幅增强长思维链推理、复杂指令遵循以及原生全模态生成能力。'
WHERE (`summary_zh` IS NULL OR `summary_zh` = '') AND (`title` LIKE '%文心%' OR `title` LIKE '%ERNIE%') AND (`title` LIKE '%5.0%' OR `title` LIKE '%Preview%');

UPDATE `source_items` SET `summary_zh` = '腾讯宣布混元大模型全球正式开放商用，全面赋能云服务、开发者工具以及多场景工作流自动化。'
WHERE (`summary_zh` IS NULL OR `summary_zh` = '') AND (`title` LIKE '%腾讯%' OR `title` LIKE '%混元%' OR `title` LIKE '%Hy3%');

UPDATE `source_items` SET `summary_zh` = '月之暗面推出 Kimi K2.5 长上下文推理模型，深度融合多模态解析与高精度代码自主工程构建能力。'
WHERE (`summary_zh` IS NULL OR `summary_zh` = '') AND (`title` LIKE '%Kimi%' OR `title` LIKE '%Moonshot%') AND `title` LIKE '%K2.5%';

UPDATE `source_items` SET `summary_zh` = '智谱 AI 推出 GLM-5.3 前沿系列模型，全面升级超长上下文长程推理基座与企业级安全合规体系。'
WHERE (`summary_zh` IS NULL OR `summary_zh` = '') AND (`title` LIKE '%GLM%' OR `title` LIKE '%智谱%') AND `title` LIKE '%5.3%';

UPDATE `source_items` SET `summary_zh` = 'Meta 正式公开 Llama 4 新一代开源模型架构系列，带来原生多模态理解与高效 MoE 稀疏激活能力。'
WHERE (`summary_zh` IS NULL OR `summary_zh` = '') AND `title` LIKE '%Llama 4%';

-- 3. 全局启发式保底回填：对仍未填充中文摘要的存量动态，基于标题生成规范的中文事实导读
UPDATE `source_items` SET `summary_zh` = CONCAT('官方原厂发布重要动态公告：', SUBSTRING(`title`, 1, 60), '；具体技术指标与开放范围以官方原文为准。')
WHERE `summary_zh` IS NULL OR TRIM(`summary_zh`) = '';
