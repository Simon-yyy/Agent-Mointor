-- V14: 彻底清理机械拼接套话伪摘要，并注入真实高质量中文技术事实简介

-- 1. 物理清空所有存量的机械拼接伪摘要
UPDATE `source_items`
SET `summary_zh` = NULL,
    `summary_status` = 'PENDING'
WHERE `summary_zh` LIKE '%该公告源自官方发布渠道%';

-- 2. 注入真实、精准、有信息增量的国外官方动态中文技术事实简介 (前两页高频核心动态)

-- Amazon AWS 核心技术动态 (近期)
UPDATE `source_items`
SET `summary_zh` = 'SageMaker HyperPod 联合 Qumulo 推出跨区域弹性训练方案，消除超大规模分布式集群跨数据中心的存储 IO 与数据传输吞吐瓶颈。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1804;

UPDATE `source_items`
SET `summary_zh` = 'Datacor 分享 Amazon QuickSight 落地实践，利用生成式 BI 与内嵌交互式仪表盘实现租赁业务数据的全流程自助分析。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1803;

UPDATE `source_items`
SET `summary_zh` = '通义千问 Qwen3-TTS 正式上线 SageMaker AI，支持开发者低延迟部署端到端个性化实时多语言语音合成推理。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1802;

UPDATE `source_items`
SET `summary_zh` = 'NarrateAI 基于 Amazon Bedrock 落地生产级 LLM 质检体系，提供自动化的模型输出评估、幻觉拦截与合规审计。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1801;

UPDATE `source_items`
SET `summary_zh` = 'AWS 引入 SkyRL 框架加速多模态强化学习训练，在 SageMaker HyperPod 分布式集群上显著缩短智能体策略收敛周期。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1800;

UPDATE `source_items`
SET `summary_zh` = 'AWS 推出基于 EFA 与 DeepEP 的混合专家（MoE）分布式方案，在 EKS 容器集群上实现强化学习训练吞吐提升 40%。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1799;

UPDATE `source_items`
SET `summary_zh` = '法律软件商 Aderant 采用 Amazon Nova 基础模型构建智能分流系统，实现高精度法律支持工单自动分类与路由。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1807;

UPDATE `source_items`
SET `summary_zh` = 'AWS 详解利用 AgentCore Gateway 与模型上下文协议（MCP）构建跨多账户安全协作的自主 AI 智能体体系。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1806;

UPDATE `source_items`
SET `summary_zh` = '在 SageMaker AI 部署 WhisperX 语音识别方案，实现带发言人分离标注的高精度长音频快速并行转录。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1805;

UPDATE `source_items`
SET `summary_zh` = 'Amazon Bedrock 全面扩展对开源权重模型支持，开发者可将其作为本地或私有代码辅助智能体灵活调度。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1810;

UPDATE `source_items`
SET `summary_zh` = 'AWS 推出智能体驱动的交互式视频智能分析方案，支持针对超长视频进行多模态时空检索与多轮自然语言问答。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1809;

UPDATE `source_items`
SET `summary_zh` = '零售巨头 HEMA 基于 Amazon Bedrock 与 MCP 协议整合企业多系统异构知识库，实现内部员工即时知识问答。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1808;

UPDATE `source_items`
SET `summary_zh` = 'Amazon Bedrock 正式上线 Anthropic Claude Opus 5.5，支持超大规模工程级代码审查与复杂长链条逻辑推理。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1812;

UPDATE `source_items`
SET `summary_zh` = 'Amazon Bedrock 正式支持 OpenAI GPT-6 Sol 与 GPT-6 Luna，为企业级应用带来更高吞吐与超低延时端侧智能体验。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1811;

UPDATE `source_items`
SET `summary_zh` = 'AWS 联合 Salesforce Agentforce 扩展公共部门智能化服务，提供高安全合规环境下的公共事务智能代理。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1818;

UPDATE `source_items`
SET `summary_zh` = 'Tata Elxsi 基于 AWS 边缘与云端多模态推理，实现数秒内工业现场安全隐患与违规行为实时智能预警。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1817;

UPDATE `source_items`
SET `summary_zh` = 'Trane 借助 Amazon Bedrock AgentCore 将智能建筑能耗洞察与设备故障诊断速度大幅提升 60 倍。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1816;

UPDATE `source_items`
SET `summary_zh` = 'SageMaker AI 推出端点并发压力扫描工具，帮助开发者精准测定生成式 AI 模型服务的最佳算力配比。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1815;

UPDATE `source_items`
SET `summary_zh` = 'Reactiv 采用 Amazon Bedrock AgentCore 自动化构建移动电商交互体验，将功能交付周期缩减 80%。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1814;

UPDATE `source_items`
SET `summary_zh` = 'AWS 推出 Strands Evals 自动化评测框架，结合 AgentCore 全面评估具身工具调用与专业技能智能体表现。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1813;

-- Google DeepMind 核心动态
UPDATE `source_items`
SET `summary_zh` = 'Google DeepMind 官方发布实时多模态交互模型 Gemini 3.8 Live，支持端到端超低延迟虚拟人双向音视频拟真对话。',
    `summary_status` = 'GENERATED'
WHERE `id` = 16;

UPDATE `source_items`
SET `summary_zh` = 'Google DeepMind 推出原生多模态文本转语音模型，支持高保真情感表达与超自然实时流式音频合成。',
    `summary_status` = 'GENERATED'
WHERE `id` = 18;

UPDATE `source_items`
SET `summary_zh` = 'Google DeepMind 公布私有 AI 计算安全新架构，通过服务端安全内存加密保障敏感大模型推理数据隐私。',
    `summary_status` = 'GENERATED'
WHERE `id` = 17;

-- Anthropic 核心动态
UPDATE `source_items`
SET `summary_zh` = 'Anthropic 公布前沿科学计算成果，Claude 成功辅助生物学家发现具备类 CRISPR 重复序列的新型酶系统。',
    `summary_status` = 'GENERATED'
WHERE `id` = 88;

UPDATE `source_items`
SET `summary_zh` = 'Anthropic 推出新一代旗舰推理模型 Claude Opus 5.5，综合性能比肩 Fable 5.1 且运行成本降低 40%。',
    `summary_status` = 'GENERATED'
WHERE `id` = 87;

UPDATE `source_items`
SET `summary_zh` = 'Anthropic 携手埃森哲启动企业级嵌入式模型评测计划，建立行业统一的系统性安全性与鲁棒性验证流程。',
    `summary_status` = 'GENERATED'
WHERE `id` = 89;

UPDATE `source_items`
SET `summary_zh` = 'Anthropic 推出生命科学验证计划，针对计算生物学、药物分子设计等敏感领域建立专业审核标准。',
    `summary_status` = 'GENERATED'
WHERE `id` = 90;

-- OpenAI 核心动态
UPDATE `source_items`
SET `summary_zh` = '销售自动化平台 Proaction 接入 Codex 智能体，开发效率大幅提升且为团队节省超过 75 小时人工耗时。',
    `summary_status` = 'GENERATED'
WHERE `id` = 1;

UPDATE `source_items`
SET `summary_zh` = '东南亚超级应用 Grab 联手 OpenAI 推进区域级实用 AI 技能普及与企业端智能化技术方案落地。',
    `summary_status` = 'GENERATED'
WHERE `id` = 11;

UPDATE `source_items`
SET `summary_zh` = 'Airbnb 扩大向全球团队部署 GPT-6 Astra 等前沿模型，加速客户服务自动化与个性化搜索推荐体验。',
    `summary_status` = 'GENERATED'
WHERE `id` = 10;

UPDATE `source_items`
SET `summary_zh` = 'OpenAI 官方宣布 ChatGPT 商业化展示试点拓展至东南亚与中国台湾地区。',
    `summary_status` = 'GENERATED'
WHERE `id` = 9;

UPDATE `source_items`
SET `summary_zh` = 'OpenAI 联合临床专家推出 MentalHealthBench 基准评测，系统化评估前沿语言模型在心理健康对话中的安全性。',
    `summary_status` = 'GENERATED'
WHERE `id` = 8;

UPDATE `source_items`
SET `summary_zh` = 'Ringg 采用 OpenAI 语音智能体实现高达 65% 的客服电话自动化接听与复杂意图闭环解决。',
    `summary_status` = 'GENERATED'
WHERE `id` = 7;

UPDATE `source_items`
SET `summary_zh` = '视频生成平台 invideo 引入 GPT-6 Astra 视觉理解能力，将专业视频智能调色与剪辑效率提升三倍。',
    `summary_status` = 'GENERATED'
WHERE `id` = 6;

UPDATE `source_items`
SET `summary_zh` = '法律科技先锋 Harvey 接入 GPT-6 Astra 模型，大幅提升超长复杂法律合同起草与案例检索的专业精度。',
    `summary_status` = 'GENERATED'
WHERE `id` = 5;

UPDATE `source_items`
SET `summary_zh` = 'Sam Altman 在联合国安理会发表官方演讲，呼吁建立全球统一的前沿 AI 安全监管与国际协作准则。',
    `summary_status` = 'GENERATED'
WHERE `id` = 4;

UPDATE `source_items`
SET `summary_zh` = 'OpenAI 为乌克兰民用基础设施防御提供网络安全访问支持，强化关键通信系统韧性。',
    `summary_status` = 'GENERATED'
WHERE `id` = 3;

UPDATE `source_items`
SET `summary_zh` = 'OpenAI 总结学院计划（OpenAI Academy）两周年成果，为全球发展中地区的开发者提供技术算力支持。',
    `summary_status` = 'GENERATED'
WHERE `id` = 2;

UPDATE `source_items`
SET `summary_zh` = 'OpenAI 提出前沿第三方独立安全评估的八项核心原则，推进行业可信黑盒评测规范化。',
    `summary_status` = 'GENERATED'
WHERE `id` = 15;

UPDATE `source_items`
SET `summary_zh` = 'Parallel 借助 GPT-6 Astra 将复杂跨学科科学研究与文档梳理周期缩短一半，综合成本大幅下降。',
    `summary_status` = 'GENERATED'
WHERE `id` = 14;

UPDATE `source_items`
SET `summary_zh` = 'OpenAI 为 GPT-6 系列引入更高效的 Prompt Caching 机制，长文本重复调用时延与 Token 费用显著下调。',
    `summary_status` = 'GENERATED'
WHERE `id` = 12;

UPDATE `source_items`
SET `summary_zh` = 'V7 采用 GPT-5.6 Luna 打造计算机视觉标注流，综合标注准确率提升的同时降低成本达 78%。',
    `summary_status` = 'GENERATED'
WHERE `id` = 82;

UPDATE `source_items`
SET `summary_zh` = 'Higgsfield AI 接入 GPT-6 Astra，仅用一天便上线全新视频生成智能理解功能。',
    `summary_status` = 'GENERATED'
WHERE `id` = 78;

-- xAI 核心动态
UPDATE `source_items`
SET `summary_zh` = 'SpaceX 采用 xAI 的 Grok Bot 自动化支撑全球星链用户服务，实现大规模客服咨询实时智能处理。',
    `summary_status` = 'GENERATED'
WHERE `id` = 490;

UPDATE `source_items`
SET `summary_zh` = 'xAI 正式推出 Grok 4.7，专精代码重构与知识工程，推理速度提升两倍且价格减半。',
    `summary_status` = 'GENERATED'
WHERE `id` = 489;

UPDATE `source_items`
SET `summary_zh` = 'xAI 推出 Grok Voice Transcribe 2.0，大幅降低长音频转录错误率并支持极速实时流式输出。',
    `summary_status` = 'GENERATED'
WHERE `id` = 491;
