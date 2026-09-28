-- ===================================================================
-- V2__seed_vendors_and_blogs.sql: 迁移原博客数据与播种首批 20 家厂商及模型事件
-- ===================================================================

-- 1. 迁移原博客文章
INSERT INTO `articles` (`id`, `title`, `summary`, `content_md`, `cover_url`, `category`, `tags`, `status`, `views`, `created_at`, `updated_at`) VALUES
(1, '搭建一个属于自己的轻量个人博客：架构选型与折腾手记', '受够了第三方博客平台的各种限制和广告，花了一周自己搭一个轻量的前后端分离博客。记录一下架构选型和踩坑。', '# 搭建一个属于自己的轻量个人博客：架构选型与折腾手记\n\n主流的托管平台要么改版频繁、要么开始插广告，而且想加点自己定制的小交互（比如作品在线运行、随手记短内容）总是处处受限。静态生成工具（Hugo、Astro、Hexo）虽然轻巧，但每次更新都得本地跑一次构建再推 Git，在手机或外部电脑上想改个错字都很折腾。\n\n权衡之后，决定自己写一个轻量的前后端分离小站，核心诉求只有两个：**自己完全掌控**、**维护成本足够低**。\n\n## 技术选型怎么定？\n\n- **后端**：Spring Boot 3.3 + Java 21。选用轻量 JSON 原子引擎作为持久层，不配复杂的数据库，开箱即用，几十兆内存就能跑得飞快。\n- **前端**：Vue 3 + Vite。原生 CSS 变量自适应暗色模式，不堆臃肿的 UI 库，让页面像书本一样轻快干净。\n- **部署**：单一可执行 Jar 包，配合前端静态构建产物，日常基本不需要操心。\n\n## 统一返回体结构\n\n接口通信遵循最简单的设计，不搞复杂的嵌套装箱：\n\n```java\npublic record Result<T>(int code, String message, T data) {\n    public static <T> Result<T> success(T data) {\n        return new Result<>(0, "ok", data);\n    }\n    \n    public static <T> Result<T> error(String message) {\n        return new Result<>(500, message, null);\n    }\n}\n```\n\n## 总结\n\n折腾这一圈下来，虽然花了一个周末的闲暇时间，但看着清清爽爽、没有任何干扰的阅读界面，觉得这趟折腾还是很值的。代码仓库开源在 GitHub，随缘更新。', '', '架构设计', '全栈,架构', 1, 138, '2026-09-12 00:37:35', '2026-09-12 00:37:35'),
(2, 'Java 21 虚拟线程在压测下的实际表现与踩坑记录', '把服务切到 Java 21 跑了阵子，用 wrk 压了下 5 万长连接，顺带把 carrier 线程被 synchronized 锁死的教训记录一下。', '# Java 21 虚拟线程在压测下的实际表现与踩坑记录\n\n升级到 Java 21 后，最期待的自然是虚拟线程（Virtual Threads）。过去做高并发 IO 密集型服务，要么开一大堆操作系统线程把内存撑爆，要么写恶心难调试的响应式异步回调。\n\n虚拟线程把这两种做法的优点结合起来了：写同步阻塞的代码，底层享受异步的吞吐量。\n\n## 简单使用\n\n在 Java 21 里启动虚拟线程极其简单：\n\n```java\ntry (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    IntStream.range(0, 10_000).forEach(i -> {\n        executor.submit(() -> {\n            Thread.sleep(Duration.ofSeconds(1));\n            return i;\n        });\n    });\n}\n```\n\n## 压测踩坑：Carrier 线程锁死 (Pinning)\n\n初次接入后，用 `wrk -t12 -c50000 -d30s` 压测时发现 QPS 并没有预想中的暴涨，反而偶尔卡死。\n排查后发现是某个老的序列化工具库内部用了 `synchronized` 关键字保护锁，导致底层载体（Carrier）操作系统线程被 Pin 住，无法让出执行权。\n\n**解决方法**：将老代码中的 `synchronized` 统一替换为 `ReentrantLock`：\n\n```java\nprivate final ReentrantLock lock = new ReentrantLock();\n\npublic void doSomething() {\n    lock.lock();\n    try {\n        // 阻塞操作\n    } finally {\n        lock.unlock();\n    }\n}\n```\n\n另外记住一点：**千万不要对虚拟线程搞池化**（ThreadPool），虚拟线程创建成本极低，用完即扔即可。', '', '后端技术', 'Java,并发', 1, 265, '2026-09-16 00:37:35', '2026-09-16 00:37:35'),
(3, 'Vue 3 组合式 API 的代码组织心得：怎么避免写成面条代码', '从 Options API 切到组合式 API 之后，很容易把代码写成一千多行的面条。记几个日常用来拆分和组织逻辑的小习惯。', '# Vue 3 组合式 API 的代码组织心得：怎么避免写成面条代码\n\n刚接触 Vue 3 `<script setup>` 的时候，大家都很开心：不用在 `data`、`methods`、`computed` 之间反复横跳了。但写着写着很容易走入另一个极端——所有的 `ref`、函数、`watch` 混在一个文件里，滚轮滑不到头，成了典型的“面条代码”。\n\n分享两个日常开发中坚持的组织原则：\n\n## 1. 业务逻辑按功能内聚（Composable）\n\n不要把所有状态都直接摊在组件顶层。超过 20 行且有独立上下文的逻辑，抽取成单个 hook：\n\n```javascript\n// hooks/useWindowSize.js\nimport { ref, onMounted, onUnmounted } from \'vue\'\n\nexport function useWindowSize() {\n  const width = ref(window.innerWidth)\n  const height = ref(window.innerHeight)\n\n  const update = () => {\n    width.value = window.innerWidth\n    height.value = window.innerHeight\n  }\n\n  onMounted(() => window.addEventListener(\'resize\', update))\n  onUnmounted(() => window.removeEventListener(\'resize\', update))\n\n  return { width, height }\n}\n```\n\n## 2. 区分 UI 状态与业务数据\n\n- UI 状态（比如弹窗显隐、当前展开的 Tab、加载状态）：留在单文件组件里。\n- 数据操作与请求（分页、过滤、缓存）：收敛到具体的 API/Service 层或状态 Store 中。\n\n保持单个 Vue 文件的 script 部分在 150 行以内，读起来会舒服非常多。', '', '前端工程', 'Vue 3,前端', 1, 95, '2026-09-19 00:37:35', '2026-09-19 00:37:35'),
(4, 'Spring Boot 3.3 开启虚拟线程后的排错记录', '生产环境开 virtual threads 挺香，但第三方老库里的 ThreadLocal 和 synchronized 还是会坑人。', '# Spring Boot 3.3 开启虚拟线程后的排错记录\n\n在 Spring Boot 3.2+ 和 3.3 中，开启虚拟线程只需要在配置里加一行：\n\n```properties\nspring.threads.virtual.enabled=true\n```\n\n看起来很美好，但在实际项目集成中，有两点需要特别注意：\n\n## 1. 线程池配置千万别再开几百个\n\n很多老项目习惯在 Tomcat 里配置 `server.tomcat.threads.max=200` 甚至 `500`。开启虚拟线程后，Tomcat 会为每个请求自动分配一个虚拟线程，这个参数基本就失效了。\n\n## 2. ThreadLocal 内存膨胀隐患\n\n虚拟线程生命周期极短，数量可能瞬间达到几十万。如果在虚拟线程里滥用 `ThreadLocal` 存放大量大对象，GC 会面临巨大压力。建议配合 Java 21 的 `ScopedValue` 或者及时在 finally 块中 `remove()`。\n\n小结：开虚拟线程前，先用 `-Djdk.tracePinnedThreads=full` 跑一遍单测，把潜在的 carrier pinning 提前找出来。', '', '后端技术', 'Spring Boot,性能', 1, 42, '2026-09-19 21:31:33', '2026-09-19 21:31:33')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 2. 迁移原博客作品
INSERT INTO `works` (`id`, `title`, `description`, `cover_url`, `demo_url`, `github_url`, `tech_stack`, `sort_order`, `created_at`) VALUES
(1, '极简个人全栈博客', '用 Spring Boot 3 + Vue 3 写的轻量个人站，去掉了臃肿的三方组件库，自适应明暗主题，本地持久化零运维负担。', '', 'http://localhost:5180', 'https://github.com/myblog/blog-system', 'Spring Boot 3,Vue 3,Java 21', 1, '2026-09-19 00:37:35'),
(2, '轻量 Markdown 在线编辑器', '支持实时分屏预览、代码高亮、大纲定位和本地草稿自动暂存的轻量写作小工具。', '', 'http://localhost:5180/admin/articles/new', 'https://github.com/myblog/web-markdown-editor', 'Vue 3,Markdown', 2, '2026-09-19 00:37:35'),
(3, 'HTTP 接口并发压测工具', '基于 Java 21 虚拟线程编写的简单压测脚本，用于快速摸清高并发 IO 密集型接口的吞吐量瓶颈。', '', 'http://localhost:5180/works', 'https://github.com/myblog/concurrency-dashboard', 'Java 21,虚拟线程', 3, '2026-09-19 00:37:35')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 3. 播种首批 20 家重点 AI 厂商
INSERT INTO `model_vendors` (`id`, `slug`, `name`, `region`, `brand_color`, `website_url`, `is_active`, `created_at`) VALUES
(1, 'openai', 'OpenAI', '美国', '#10a37f', 'https://openai.com/news', 1, NOW(3)),
(2, 'anthropic', 'Anthropic', '美国', '#d97757', 'https://www.anthropic.com/news', 1, NOW(3)),
(3, 'google-deepmind', 'Google DeepMind', '美国', '#4285f4', 'https://deepmind.google/discover/blog', 1, NOW(3)),
(4, 'meta', 'Meta AI', '美国', '#0668e1', 'https://ai.meta.com/blog', 1, NOW(3)),
(5, 'deepseek', 'DeepSeek (深度求索)', '中国', '#1e40af', 'https://www.deepseek.com', 1, NOW(3)),
(6, 'alibaba', 'Alibaba (阿里通义)', '中国', '#ff6a00', 'https://tongyi.aliyun.com', 1, NOW(3)),
(7, 'xai', 'xAI', '美国', '#1f2937', 'https://x.ai', 1, NOW(3)),
(8, 'microsoft', 'Microsoft', '美国', '#00a4ef', 'https://blogs.microsoft.com/ai', 1, NOW(3)),
(9, 'amazon', 'Amazon AWS', '美国', '#ff9900', 'https://aws.amazon.com/blogs/machine-learning', 1, NOW(3)),
(10, 'nvidia', 'NVIDIA', '美国', '#76b900', 'https://blogs.nvidia.com/blog/category/deep-learning', 1, NOW(3)),
(11, 'mistral', 'Mistral AI', '法国', '#ea580c', 'https://mistral.ai/news', 1, NOW(3)),
(12, 'cohere', 'Cohere', '加拿大', '#39594c', 'https://cohere.com/blog', 1, NOW(3)),
(13, 'ai21', 'AI21 Labs', '以色列', '#4f46e5', 'https://www.ai21.com/blog', 1, NOW(3)),
(14, 'stability-ai', 'Stability AI', '英国', '#8b5cf6', 'https://stability.ai/news', 1, NOW(3)),
(15, 'bytedance', '字节跳动 (豆包)', '中国', '#3b82f6', 'https://www.doubao.com', 1, NOW(3)),
(16, 'baidu', '百度 (文心一言)', '中国', '#2932e1', 'https://yiyan.baidu.com', 1, NOW(3)),
(17, 'tencent', '腾讯 (混元)', '中国', '#0052d9', 'https://hunyuan.tencent.com', 1, NOW(3)),
(18, 'zhipu', '智谱 AI (GLM)', '中国', '#2563eb', 'https://www.zhipuai.cn', 1, NOW(3)),
(19, 'moonshot', '月之暗面 (Kimi)', '中国', '#0f172a', 'https://kimi.moonshot.cn', 1, NOW(3)),
(20, 'minimax', 'MiniMax (名之梦)', '中国', '#dc2626', 'https://www.minimaxi.com', 1, NOW(3))
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 4. 播种主流 AI 模型档案
INSERT INTO `ai_models` (`id`, `vendor_id`, `model_key`, `display_name`, `series`, `version`, `modalities`, `availability_status`, `created_at`) VALUES
(1, 5, 'deepseek-r1', 'DeepSeek-R1', 'R1', '1.0', '文本,代码,推理', 'WEIGHTS_OPEN', NOW(3)),
(2, 5, 'deepseek-v3', 'DeepSeek-V3', 'V3', '3.0', '文本,代码', 'WEIGHTS_OPEN', NOW(3)),
(3, 2, 'claude-3-7-sonnet', 'Claude 3.7 Sonnet', 'Claude 3.7', '3.7', '文本,代码,视觉,混合推理', 'API_ONLY', NOW(3)),
(4, 2, 'claude-3-5-sonnet', 'Claude 3.5 Sonnet', 'Claude 3.5', '3.5', '文本,代码,视觉', 'API_ONLY', NOW(3)),
(5, 1, 'o3-mini', 'OpenAI o3-mini', 'o3', 'mini', '文本,推理,代码', 'API_ONLY', NOW(3)),
(6, 1, 'gpt-4o', 'GPT-4o', 'GPT-4', 'Omni', '文本,语音,视觉', 'API_ONLY', NOW(3)),
(7, 3, 'gemini-2-0-flash', 'Gemini 2.0 Flash', 'Gemini 2', '2.0', '多模态,视觉,语音', 'API_ONLY', NOW(3)),
(8, 6, 'qwen-2-5-max', 'Qwen 2.5-Max', 'Qwen 2.5', 'Max', '文本,代码,多语言', 'API_ONLY', NOW(3)),
(9, 6, 'qwen-2-5-coder', 'Qwen 2.5-Coder-32B', 'Qwen 2.5', '32B', '代码,文本', 'WEIGHTS_OPEN', NOW(3)),
(10, 4, 'llama-3-3-70b', 'Llama 3.3 70B', 'Llama 3', '3.3', '文本,代码', 'WEIGHTS_OPEN', NOW(3)),
(11, 18, 'glm-4-plus', 'GLM-4-Plus', 'GLM-4', 'Plus', '文本,代码,视觉', 'API_ONLY', NOW(3)),
(12, 19, 'kimi-k1-5', 'Kimi k1.5', 'Kimi', '1.5', '长文本,多模态,推理', 'API_ONLY', NOW(3))
ON DUPLICATE KEY UPDATE `display_name`=VALUES(`display_name`);

-- 5. 播种模型发布事件 (近 90 天代表性真实大事件)
INSERT INTO `model_events` (`id`, `model_id`, `vendor_id`, `event_type`, `stage`, `summary`, `release_date`, `date_precision`, `first_seen_at`, `review_status`, `dedup_key`, `created_at`) VALUES
(1, 1, 5, 'WEIGHTS_RELEASE', '正式发布', 'DeepSeek 正式开源发布首代推理模型 DeepSeek-R1，包含 671B 满血版及 6 个基于 Qwen/Llama 蒸馏的小模型，在数学、代码与长逻辑推理上比肩 OpenAI o1，完全开放模型权重与论文。', '2025-01-20', 'EXACT', '2025-01-20 08:00:00', 'CONFIRMED', 'deepseek-r1-release-20250120', NOW(3)),
(2, 3, 2, 'MODEL_RELEASE', '正式发布', 'Anthropic 推出首款混合推理大模型 Claude 3.7 Sonnet，用户可自由调节思考时间预算（Thinking Budget），在通用代码理解与深入长链条思考之间无缝切换。', '2025-02-24', 'EXACT', '2025-02-24 16:00:00', 'CONFIRMED', 'claude-3-7-sonnet-20250224', NOW(3)),
(3, 5, 1, 'API_AVAILABLE', '正式发布', 'OpenAI 开放 o3-mini 推理模型 API，主打高性价比、低延迟的科学计算与编程推理，并在 ChatGPT 免费版全面上线。', '2025-01-31', 'EXACT', '2025-01-31 18:30:00', 'CONFIRMED', 'openai-o3-mini-20250131', NOW(3)),
(4, 7, 3, 'MODEL_RELEASE', '公开预览', 'Google DeepMind 推出 Gemini 2.0 Flash 实验版，具备原生多模态输入输出能力，实时交互延迟降低 50% 以上。', '2024-12-11', 'EXACT', '2024-12-11 10:00:00', 'CONFIRMED', 'gemini-2-0-flash-20241211', NOW(3)),
(5, 9, 6, 'WEIGHTS_RELEASE', '正式发布', '阿里云通义开源 Qwen 2.5-Coder 旗舰 32B 代码专用模型，代码生成与补全能力刷新开源基准榜单，全面支持 Apache 2.0 商业开源许可。', '2024-11-12', 'EXACT', '2024-11-12 11:20:00', 'CONFIRMED', 'qwen-2-5-coder-32b-20241112', NOW(3)),
(6, 10, 4, 'WEIGHTS_RELEASE', '正式发布', 'Meta 发布 Llama 3.3 70B 模型，用 70B 参数规模实现了媲美早先 Llama 3.1 405B 的评测表现，极大降低了私有化部署推理门槛。', '2024-12-06', 'EXACT', '2024-12-06 14:00:00', 'CONFIRMED', 'llama-3-3-70b-20241206', NOW(3)),
(7, 2, 5, 'WEIGHTS_RELEASE', '正式发布', 'DeepSeek 发布通用大模型 DeepSeek-V3，采用 Multi-head Latent Attention (MLA) 与 DeepSeekMoE 架构，总参数 671B，激活 37B，训练成本仅 557 万美元。', '2024-12-26', 'EXACT', '2024-12-26 12:00:00', 'CONFIRMED', 'deepseek-v3-release-20241226', NOW(3))
ON DUPLICATE KEY UPDATE `summary`=VALUES(`summary`);

-- 6. 播种官方证据链
INSERT INTO `event_evidence` (`id`, `event_id`, `source_item_id`, `official_url`, `title`, `created_at`) VALUES
(1, 1, NULL, 'https://github.com/deepseek-ai/DeepSeek-R1', 'DeepSeek-R1 GitHub 官方开源仓库', NOW(3)),
(2, 2, NULL, 'https://www.anthropic.com/news/claude-3-7-sonnet', 'Anthropic News: Claude 3.7 Sonnet Announcement', NOW(3)),
(3, 3, NULL, 'https://openai.com/index/openai-o3-mini/', 'OpenAI: Introducing o3-mini', NOW(3)),
(4, 4, NULL, 'https://blog.google/technology/developers/gemini-2-0-flash-developer-preview/', 'Google Developers: Gemini 2.0 Flash Preview', NOW(3)),
(5, 5, NULL, 'https://qwenlm.github.io/blog/qwen2.5-coder/', 'Qwen Blog: Qwen2.5-Coder is out!', NOW(3)),
(6, 6, NULL, 'https://ai.meta.com/blog/llama-3-3-70b/', 'Meta AI: Introducing Llama 3.3', NOW(3)),
(7, 7, NULL, 'https://github.com/deepseek-ai/DeepSeek-V3', 'DeepSeek-V3 GitHub 官方发布页', NOW(3))
ON DUPLICATE KEY UPDATE `official_url`=VALUES(`official_url`);
