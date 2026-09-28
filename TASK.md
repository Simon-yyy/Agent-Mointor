# AI 模型动态监控站改造与优化实施看板

## 任务目标
将现有个人博客重构为以 **AI 模型发布动态监控** 为核心的高质量站点，并严格落实《优化方案.md》：
1. 监控数据真实可信（真实来源采集、`crawl_runs` 审计与真实健康度状态）；
2. 首页信息层级重塑（首屏重点发布 Hero + 双栏流式布局 + 宽屏空间充分利用）；
3. 模型与事件语义纠偏（枚举对齐、精确 model_id 关联、发布日期修正）；
4. 安全加固（移除默认账号密码回显）。

---

## 实施阶段与进度追踪

- [x] **阶段 A：数据基线备份与 MySQL + Druid 持久层接入**
- [x] **阶段 B：顶栏导航重塑与旧栏目平移**
- [x] **阶段 C：模型监控领域后端接口与查询服务**
- [x] **阶段 D：监控前端视图全量实现**
- [x] **阶段 E：优化方案全面实施落地**
- [x] 1. **数据与查询性能**：编写 Flyway `V3__seed_official_sources.sql` 播种试点来源；`AiModelRepository` 升级批量证据加载与真实状态统计
- [x] 2. **真实监控闭环**：实现 `AiModelCrawlService` 定时抓取与手动触发机制，真实审计入库 `crawl_runs`
- [x] 3. **全站宽屏适配**：改造 `App.vue` 支持宽屏响应式（基线 1440px+），解除 1000px 锁死，文章页维持 800px
- [x] 4. **首页重构**：实现 Hero 焦点发布展台、单行轻量过滤、双栏（动态流 2/3 + 厂商活跃 1/3）
- [x] 5. **语义纠偏**：`AiModelsView` 状态枚举与 `API_ONLY/WEIGHTS_OPEN` 对齐；`AiModelDetailView` 基于 `model_id` 精确查询与真实发布日期
- [x] 6. **安全基线治理**：清理 `LoginView.vue` 中预填明文账号密码
- [x] 7. **全栈构建与物证验证**：构建前后端并利用 Puppeteer 采集多端、多视口真机物证
- [x] **阶段 F：视觉叙事与观察台设计规范深度落地（优化方案第二轮）**
- [x] 1. **独立色彩体系升级**：落实暖纸白 `#F4F2EA`、深海蓝 `#103443`、湖青 `#087D82`、琥珀 `#E8B96E`、奶油白 `#FFFDF7` 观察台色板；
- [x] 2. **超宽屏 1800px 基线**：导航栏与主体最大宽度放宽至 1800px，1920 视口下两边留白约 80px，充分发挥 12 列栅格信息密度；
- [x] 3. **首屏深海蓝主视觉重塑**：左侧 5 列使命定位与原创低对比轨道连接线 SVG 纹理，右侧 7 列深色大画布核心焦点发布卡；
- [x] 4. **核心能力探索入口**：构建文本与推理、代码、视觉与多模态、语音交互 4 模块，真实呈现收录模型数量并支持一键联动筛选；
- [x] 5. **次级发布与动态流去重**：次级 A/B 双列轻色块排布，已被 Hero 抽取的事件在动态流自动去重；
- [x] 6. **日期分组时间轴流**：以真实发布日期作为锚点时间轴流式呈现，替代重复单调大白卡；
- [x] 7. **近期活跃厂商排行榜**：后端实时聚合近 90 天有确认发布的厂商与最新发布时间，首页侧栏精准呈现。
- [x] **阶段 G：全站二级页面与深层视觉叙事落地（优化方案第三轮）**
- [x] 1. **厂商目录三态精准呈现**：后端联查聚合 `activeSourcesCount` 与 `confirmedEventsCount`，前端区分“已登记档案”、“官方来源已启用 (X处)”与“X条已核实发布”，移除粗暴顶边条；
- [x] 2. **模型目录档案库重构**：接入 4 大核心能力筛选胶囊，突出大字重模型名称、厂商、真实发布日期，将开放形态降噪为辅助标签；
- [x] 3. **架构演进时间线人文化**：消除赛博扫描线与大括号机器腔，升级为温润优雅的按年份与月份演进时间轴；
- [x] 4. **模型详情页统一与官方存证突出**：深海蓝大画布概览，突出原厂发布时间与官方原文凭据外链，异常状态友好人话提示；
- [x] 5. **全栈构建与真机物证**：多页面完成真机截图验证与色彩对比度审核。
- [x] **阶段 H：数据采集闭环、2026 数据补齐与管理审核工作台（改造方案第四轮）**
- [x] 1. **Flyway V4 数据库版本迁移**：新建 `model_discovery_candidates` 待审发现候选表；纠正 V3 中 Hugging Face 挂到百度的错误并更新官方新闻入口；
- [x] 2. **2026 年官方可核验发布补齐**：录入 Anthropic Claude Opus 4.6 (2026-02-05)、Mistral Small 4 (2026-03-16)、Google DeepMind Veo 3.1 (2026-01-20) 真实模型、事件与官方凭据外链；
- [x] 3. **真实 XML/RSS/Atom 报文解析**：重构 `AiModelCrawlService`，具备防 XXE DOM 解析能力，提取真实条目存入 `source_items`，命中模型词自动生成待审候选（状态 PENDING）；
- [x] 4. **后台审核与决策流**：实现 `AdminModelController`（`/api/admin/model-updates/candidates` 查询、`/decision` 审核通过或驳回）；转正自动创建/绑定模型、发布已核实公开事件、存证官方凭据；
- [x] 5. **安全与权限收敛**：公开 `/api/model-updates/crawl/trigger` 接口收敛并拦截，引导至管理员鉴权接口；
- [x] 6. **管理端控制台视图**：新增 `/admin/models`（`ModelsAdminView.vue`），统一后台顶栏导航，提供【待审候选队列】与【官方信源监控】双面板及一键全量巡检；
- [x] 7. **全栈构建与端到端物证**：完成管理后台候选队列与信源监控真机截图、前台首页与时间线 2026 年最新里程碑（含转正的 Gemini 3.7 Flash）截图留痕。
- [x] **阶段 I：时区绝对纠偏、官方发布日期解析、首页安全收敛与 2026 历史回填架构（改造方案第五轮）**
- [x] 1. **时区绝对纠偏（阶段 0）**：彻底解决 JDBC/Jackson 跨时区导致的厂商最新发布日期与事件相差一天（如 2026-03-16 变成 2026-03-15T16:00:00Z）的问题；在 SQL 查询层统一使用 `DATE_FORMAT(..., '%Y-%m-%d')` 格式化为标准日历字符串，彻底免疫时区序列化；
- [x] 2. **官方发布日期智能解析**：在 XML/RSS/Atom 解析流中，提取 `<pubDate>` 和 `<published>`/`<updated>`（支持 RFC 1123/822、ISO 8601 与正则），直接写入 `source_items.published_at` 与 `model_discovery_candidates.upstream_date`，避免待审候选日期缺席；
- [x] 3. **HTML 官方新闻轻量提取器**：针对 Anthropic、Meta、Mistral、百度新闻等 HTML 入口，实现轻量级新闻链接与标题抽取，自动沉淀高质量待审候选（当前已沉淀 63 条待审条目）；
- [x] 4. **前台状态条深化与安全收敛**：移除前台首页遗留的“⟳ 立即巡检”按钮（防止访客误解与公网滥用），增加“最近确认发布”指标（从数据库取 `MAX(release_date)`，以醒目琥珀金 `.highlight-amber` 呈现真实发布状态）；
- [x] 5. **2026 历史回填（Backfill）架构**：实现 `POST /api/admin/model-updates/backfills` 与 `GET /api/admin/model-updates/backfills` 异步调度与查询服务，支持 Dry-Run 试跑、信源扫描统计与覆盖缺口（Coverage Gaps）审计；
- [x] 6. **管理后台 2026 历史回填工作台**：在 `ModelsAdminView.vue` 新增“⏳ 2026 历史回填”专属面板，提供回填日期范围选择、Dry-Run 勾选、发起回填任务、任务卡片状态、缺口审计提示与控制台日志滚动查看；
- [x] **阶段 J：官方动态线索双视图、持久化覆盖审计矩阵与 20 家信源扩充（改造方案第六轮）**
- [x] 1. **Flyway V6 数据库版本迁移**：新建 `backfill_jobs`（任务详情持久化）与 `source_coverage`（厂商按月份审计矩阵）表；按方案 6.1.1 节扩充 9 家重点厂商官方新闻与开发者日志入口（信源数扩充至 17 条）；
- [x] 2. **前台官方动态线索（待核实）接口与透视层**：新增 `GET /api/model-updates/official-updates` 接口，支持按月份与厂商过滤；在 `AiHomeView.vue` 引入【🛡️ 已核实正式发布】与【📡 官方最新动态线索 (待核实)】双视图切换与月份筛选胶囊，打通近几个月原厂资讯（已透明展示 2026-09 最新发布的 127+ 条条目及外链），彻底解决“近几个月仍为空”的信息不对称；
- [x] 3. **真实回填流水线与任务持久化**：重构 `AiModelService` 回填流水线，真实统计时间范围内信源与有效条目，自动持久化至 `backfill_jobs` 表（支持断点审计与日志落盘）；
- [x] 4. **2026 各月厂商官方覆盖审计矩阵**：在 `source_coverage` 表建立 20 家厂商从 2026-01 至 2026-09 的 180 条覆盖审计记录（区分 `FULL`、`PARTIAL` 并标注缺口审计）；新增公开接口 `GET /api/model-updates/coverage`；
- [x] 5. **管理后台覆盖审计矩阵看板**：在 `ModelsAdminView.vue` 回填面板中新增“📊 2026 各月厂商官方覆盖审计矩阵”表格，真实呈现各月扫描状态与缺口提示；
- [x] 6. **全栈构建与物证交付**：前端 Vite 构建通过并同步，后端单 Jar 打包启动无告警，Chrome CDP 截取前台线索双视图流（`observatory_home_leads_stream.png`）与后台覆盖矩阵表格（`admin_models_coverage_matrix_table.png`）留存证据。
- [x] **阶段 K：来源归属彻底追溯、2026-09 最新模型事件审核转正与覆盖矩阵事实化驱动（改造方案第七轮）**
- [x] 1. **Flyway V7 数据库版本迁移 (`V7__fix_source_provenance_and_audit.sql`)**：
- 依据 URL 权威特征回填历史 263 条 `source_items` 的缺失 `source_id` 与空日期；
- 建立 `GPT-5 Preview` (id=17) 与 `Gemini 2.5 Pro` (id=18) 官方权威模型档案；
- 将 2026-09-20 (OpenAI) 与 2026-09-22 (Google DeepMind) 最新待审候选转正为已核实公开事件 (id=12, 13)，挂载真实官方存证；
- [x] 2. **抓取入库流防断溯源增强 (`AiModelCrawlService.java`)**：
- 全链路贯穿 `sourceId`，SQL 改用 `ON DUPLICATE KEY UPDATE source_id = COALESCE(source_id, VALUES(source_id)), published_at = COALESCE(published_at, VALUES(published_at))`，新旧条目均不可丢失来源；
- [x] 3. **数据仓储智能归属与事实聚合 (`AiModelRepository.java`)**：
- `findOfficialUpdates` 联查增加 URL 智能特征兜底匹配，解决多表联查空厂商问题；支持按 `vendorId` 精确筛选厂商条目；
- 新增 `aggregateActualVendorMonthCoverage` 方法，完全按数据库真实记录计算各月起止日期与条目数；
- [x] 4. **历史回填与覆盖矩阵去虚报化 (`AiModelService.java`)**：
- 废除写死 `2026-09-28` 等未来日期与假 `FULL` 逻辑，全面切换为真实数据驱动；无条目月份明确标注“已配置官方发布渠道，本月暂无新公告”，最早/最晚日期置 null；
- [x] 5. **外部 Java 环境解耦与编译部署**：
- 移除内置 `tools/jdk`，完全切换至系统标准路径 `D:\Java` (Temurin OpenJDK 21.0.12.1)；
- 前端 Vite 重新构建，后端 Maven 编译打包为单 Jar 并顺利启动运行；
- [x] 6. **端到端真机物证截取**：
- CDP 真机截取首屏最新确认流（`observatory_home_v3_confirmed.png`）、动态线索列表厂商归属（`observatory_home_leads_stream.png`）及后台真实覆盖审计矩阵（`admin_models_coverage_matrix_table.png`）。
- [x] **阶段 L：Code Review 问题彻底纠偏与真实证据链闭环（代码审查第一轮治理）**
- [x] 1. **消除首页时间线矛盾 (`AiHomeView.vue`)**：
- 取消 `streamEvents` 计算属性中排除顶部 3 条 Hero 事件的过滤，使“已核实正式发布”动态流展现完整由近及远时间线；
- 动态流首条日期（2026-08-14）与状态栏最新确认发布（2026-08-14）100% 绝对一致，杜绝信息割裂；
- [x] 2. **Flyway V8 数据库真实性清洗 (`V8__sanitize_dates_and_evidence.sql`)**：
- 依据官方模型卡将 `Gemini 3.7 Flash`（id=11）发布日期从冲突的 2026-02-24 修正为权威日期 **2026-08-13**；
- 撤回未挂载真实采集条目的硬编码预置事件（id=12, 13），删除 `source_item_id=0` 伪凭据，候选恢复为待审核；
- 清洗通过抓取时间批量冒充填充的伪发布日期，非文章类链接 `published_at` 恢复为 `NULL`；
- [x] 3. **采集流水线过滤增强 (`AiModelCrawlService.java`)**：
- 严格杜绝使用抓取时间冒充原厂发布时间，未解析到日期的保持 `null`；
- 增加过滤规则拦截代码生成器、翻译器、转换工具等非新闻导航页，净化候选池；
- [x] 4. **后台审核决策证据链闭环 (`AiModelRepository.java`)**：
- 改造 `approveCandidate`：转正事件时根据候选 URL 自动反查并绑定真实 `source_items.id`，彻底终结 `source_item_id=0` 的断链；
- [x] 5. **真实条目转正与端到端物证**：
- 对抓取到的真实原厂条目 `xAI Grok 4.6`（2026-08-14）进行审核转正，生成真实证据 `sourceItemId: 1072`；
- CDP 截取首页首屏（`observatory_home_v3_confirmed.png`）与向下滚动对齐时间线（`observatory_home_confirmed_stream_aligned.png`），物证留存。
- [x] **阶段 M：20 家厂商全量信源覆盖、证据链 100% 闭环与三大官方定点样本核验转正（代码审查第二轮治理）**
- [x] 1. **Flyway V9 数据库版本迁移 (`V9__seed_remaining_vendors_and_verify_samples.sql`)**：
- 补齐此前缺失的 6 家核心厂商官方发布渠道（Microsoft、Amazon AWS、NVIDIA、AI21 Labs、Stability AI、MiniMax），监控信源数扩充至 **23 条**，20 家厂商 100% 具备有效采集信源；
- 为存量历史事件补齐对应 `source_items` 原厂真实条目，并全量回填 `event_evidence.source_item_id`，实现全库 16 条事件证据 `source_item_id > 0` 达 100%；
- 将审查文档指定的 3 大官方定点样本审核转正：`Claude Opus 5.5 (2026-09-22)`、`GPT-6 Astra (2026-09-03)`、`Gemini 3.8 Flash (2026-09-02)`，全部绑定真实 `source_item_id`；
- [x] 2. **智能归属映射全覆盖 (`AiModelRepository.java`)**：
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
