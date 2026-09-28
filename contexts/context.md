# 项目工程上下文 (Operational Context)

## 一、 技术栈与运行环境
- **基础运行环境**:
  - Java 运行环境：JDK 21.0.12.1（位于外部系统目录 `D:\Java`）
  - 前端运行环境：Node.js 18+ / npm 10+（开发服务器与构建）
  - 构建工具：Apache Maven 3.9.9（位于 `tools/maven`，本地依赖仓储位于 `tools/m2-repo`）
- **核心框架与关键组件**:
  - 后端：Spring Boot 4.1.1 (`spring-boot-starter-webmvc`, `spring-boot-starter-validation`)、Jackson 3 (`tools.jackson.core:jackson-databind:3.1.5`)、内嵌 Tomcat 11.0.24
  - 前端：Vue 3.5.13、Vue Router 4.5.0、Vite 6.0.7（纯原生 ESM 架构，原生 Fetch 网络通信，避免引入需要子进程管道编译的重量级外部依赖）
  - 持久化引擎：内置轻量级读写锁与原子写入持久化引擎，数据序列化落地在项目根目录 `data/` 下，无须安装或运行外部数据库服务。

---

## 二、 核心业务流与规则基线
- **核心业务与鉴权流**:
  1. **公开访问链路**：读者侧访问 `/`、`/articles`、`/works`、`/archives`，通过 `/api/articles/**` 与 `/api/works/**` 获取数据，文章阅读量在获取详情时原子自增。
  2. **管理鉴权链路**：
     - 管理员通过 `POST /api/auth/login`（默认内置 `admin` / `admin123`）获取 HMAC-SHA256 签名 Token（7 天有效）；
     - 客户端本地存储 Token，并在后续请求管理端接口时附带 HTTP Header：`Authorization: Bearer <token>`；
     - 后端通过 [`AuthInterceptor.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/config/AuthInterceptor.java) 拦截所有 `/api/admin/**` 路由，严格校验 Token 合法性与过期时间，未授权请求直接返回 401 统一 JSON。
  3. **数据存取基线**：
     - 数据模型：`Article`（含 Markdown 原文、标签、分类、浏览量、状态）与 `Work`（含演示链接、GitHub 链接、技术栈、排序）。
     - 仓储操作严格经过线程读写锁（`ReentrantReadWriteLock`）并采用原子文件覆盖（`StandardCopyOption.ATOMIC_MOVE`）避免数据并发写入损坏。
     - 首次启动自动执行播种（Seed Data），填充精美示例文章与作品。

- **异常与返回体契约规范**:
  - **标准统一返回体格式 (`Result<T>`)**:
    ```json
    {
      "code": 0,
      "message": "ok",
      "data": { ... },
      "timestamp": 1726675000000
    }
    ```
  - **分页载荷规范 (`PageResult<T>`)**:
    ```json
    {
      "list": [ ... ],
      "total": 42,
      "page": 1,
      "size": 10,
      "totalPages": 5
    }
    ```
  - **错误处理规范**:
    - 业务异常由 `BusinessException` 显式抛出；
    - 统一由 `@RestControllerAdvice` 捕获，返回包含非 0 错误码与友好错误提示的 JSON；
    - 前端 `request.js` 统一拦截业务非 0 响应与 HTTP 401 自动跳转。

- **部署与静态资源映射规范**:
  - 前端执行 `npm run build` 生成的纯静态产物托管在 `backend/src/main/resources/static/`；
  - 后端配置 [`WebMvcConfig.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/config/WebMvcConfig.java)，将非 `/api/**` 的 SPA 前端路由请求自动 fallback 转发到 `index.html`，实现单 Jar 包开箱即跑与 History 模式刷新不 404。

---

## 三、 全球 AI 模型动态追踪子系统 (AI Model Observatory)
- **架构与数据引擎**:
  - **数据库持久化**: MySQL 8.0+ 驱动，Alibaba Druid 高性能连接池，Flyway 严格版本化迁移（**当前基线已演进至 `V31`**）。
  - **Flyway 核心迁移脉络**:
    - `V1~V16`: 基础模型库、官方信源巡检与中文摘要存证；
    - `V17~V18`: 全球主流大模型规格档案与参数扩充；
    - `V19`: 模型别名体系 (`model_aliases`) 与目录同步机制；
    - `V20~V22`: 全量官宣发布日期 (`official_release_date`) 历史回填与双语摘要扩充；
    - `V23`: 字段级事实仲裁 (`model_facts`)、血缘追溯 (`facts_provenance`) 与冲突审核队列 (`catalog_conflicts`)；
    - `V24`: 权威 Benchmark 评测基准表与评分事实表 (`model_benchmarks`, `model_benchmark_scores`)；
    - `V25`: 托管商混挂彻底去重纠偏、真实研发原厂归位 (`inferRootVendorId`) 与国内外地域标签 (`region`) 全量清洗；
    - `V26~V28`: 静态资源页特征提取与止血阻断 (`source_items.is_static_resource`)，彻底过滤服务条款、隐私政策、招聘、关于我们、博客主页等非动态内容流入前台；停用未实现适配器的假源 `openrouter`；
    - `V29`: 官方发布日期纠正（Gemini 3.8/3.7 Flash）、撤销无凭证 CONFIRMED 历史事件（留痕不物理删除）、同名重复卡隔离待审 (`PENDING_REVIEW`)；
    - `V30`: 恢复误隐藏规范候选卡、按官方原文纠正 Claude Opus 4.6 与 Kimi 动态日期、备案号等静态特征扩充、`model_benchmarks` 增加 `verified` 隔离未验证样本、接入 OpenAI API changelog 官方信源；
    - `V31`: Kimi K2.5 人工卡日期最终纠正（2026-01-27）与无证据事件撤销留痕；
    - `V32`: 纠偏 Gemini 3.8 衍生型号归属 Google DeepMind，补录 2026-09 演进事件与凭证，隔离 OpenAI changelog 50 条侧边栏无日期导航项；
    - `V33`: 变更日志结构提取修复与 304 缓存状态保留，彻底拦截第三方滚动路由别名 (`*-latest`)，撤销无证据历史事件并隔离冲突项；
    - `V34`: 停用死链与重复信源（活跃信源精准核准为 24 条），清洗无证据同日发布日期，真实回填流水线落地；
    - `V35`: 增加 `locked_by_reviewer` 字段与防再污染机制，重构 `ON DUPLICATE KEY UPDATE` 保护人工锁定并单向升高，前台动态流收严 `published_at IS NOT NULL` 门禁，第三方目录模型严格收敛为 `PENDING_REVIEW` 待审。
  - **23+ 家原厂官方信源**: 100% 覆盖 OpenAI、Anthropic、DeepMind、Meta、Microsoft、阿里、DeepSeek 等主流 AI 机构官方直达源。
- **高频自适应错峰调度与时效保障 (SLA P95 ≤ 15m)**:
  - **轻量 5 分钟轮询**: 后端基于 `@Scheduled(fixedRate = 300000)` 自适应触发各来源。高频源（如 OpenAI/Anthropic/AWS）设定 300s~600s 间隔，错峰探测；
  - **HTTP 条件请求 (304 Not Modified)**: 请求头自适应携带 `If-None-Match` (ETag) 与 `If-Modified-Since`，零带宽开销，无更新时极速释放连接；
  - **内容健康度与连续空解析监控**: 若连续 3 次解析条目为 0，标记 `content_status = 'PARSE_EMPTY'` 触发告警排查；
  - **四维溯源时间戳闭环**:
    - `published_at`: 官方对外官宣时间；
    - `ingested_at`: 爬虫首次抓取并写入数据库时间；
    - `visible_at`: 面向读者公开可见生效时间；
    - `reviewed_at`: 人工/准入规则审核转正时间。
- **中文核心事实呈现纪律**:
  - **坚决杜绝低劣机械拼凑套话**: 严禁截断英文标题并拼接模板废话；
  - **真实增量事实**: 仅展示具有实质技术信息增量的中文事实简介（35~75字）；未生成或暂无真实摘要时前端优雅收缩卡片，杜绝无意义占位符。

---

## 四、 模型目录与自动化多源事实仲裁管线 (Catalog Arbitration Pipeline)
- **模型身份与研发原厂推断 (`ModelIdentityResolver`)**:
  - **三级阶梯解析**:
    1. 阶梯 1: 查 `model_aliases` 别名映射；
    2. 阶梯 2: 剥除计费/服务档位后缀（`-fast`、`-flex`、`-xhigh` 等），二次查别名；
    3. 阶梯 3: 厂商 + 规范化名称（正则清洗特殊字符）匹配已有模型。
  - **真实研发原厂推断 (`inferRootVendorId`)**:
    - 针对第三方云服务商/聚合源（models.dev、OpenRouter、DigitalOcean、DeepInfra 等）将托管平台作为厂商的结构性错位，通过模型 Key 与特征前缀反向推导研发原厂；
    - 彻底分离“模型研发者 (Vendor)”与“算力托管商 (Provider)”，严禁将 Claude 归于 DigitalOcean、严禁将 DeepSeek 归于阿里。
- **字段级仲裁与防污染机制 (`ModelFactMerger`)**:
  - **发布日期仲裁**: 取 `min(官方日期, 外部多源日期)`；若外部日期比当前早 >60 天或当前为人工锁定的 `MANUAL` 状态，排入 `catalog_conflicts` 待审队列，杜绝乱序覆盖；
  - **高精度定价仲裁**: 统一归一至 `$/M tokens`，非空优先；
  - **托管商黑名单过滤**: 维护已知推理托管商集合（`HOSTING_PROVIDERS`），命中时跳过自动建卡；
  - **厂商别名归一化与地域绑定**:
    - 收敛 `Alibaba (China)` 等变体别名至主厂商 `Alibaba (阿里通义)`（ID 6）；
    - 厂商建卡与修正时，精准注入 `region = '中国'` 或 `'海外'`，杜绝国内原厂被标记为海外。

---

## 五、 权威基准评测体系 (Benchmark Evaluation System)
- **8 大权威基准支持 (`model_benchmarks`)**:
  - `MMLU-Pro` (综合知识推理)
  - `Chatbot Arena Elo` (盲测真实人类对齐)
  - `SWE-bench Verified` (真实复杂软件工程代码生成)
  - `HumanEval` (Python 算法编程通过率)
  - `MATH-500` (高难度竞赛数学推理)
  - `GPQA Diamond` (专家级博士问答)
  - `LiveCodeBench` (防泄露动态编程)
  - `GSM8K` (小学数学多步推理)
- **模型详情页可视化呈现**:
  - 支持官方实测评分、第三方权威机构评分及置信度标注；
  - 提供综合能力雷达（知识、代码、数学、对齐、推理五维），直观量化模型综合代际水准。

---

## 六、 对外公开只读 API 契约增量 (API Contract Extensions)
- **模型目录多维组合分页检索**:
  - `GET /api/model-updates/models`
  - 参数支持：
    - `region`: 厂商地域筛选（`中国` / `海外`）；
    - `vendorId`: 指定研发厂商 ID；
    - `series`: 模型系列代号；
    - `keyword`: 名称/代号模糊搜索；
    - `modality`: 核心能力多选（`文本`、`代码`、`多模态`、`语音`）；
    - `sort`: 排序策略（默认权威宣发日期最新倒序 `date_desc`、发布日期 `release_desc`、定价升降序）；
    - `page` & `size`: 服务端标准化分页（返回 `PageResult<AiModel>`）。
- **模型权威评测基准数据**:
  - `GET /api/model-updates/models/{id}/benchmarks`：返回该模型在各个权威评测集上的绝对得分、行业分位、测试日期与可信来源。
- **模型演进历程事件流**:
  - `GET /api/model-updates/models/{id}/events`：返回该模型全生命周期内的版本发布、能力升级与价格调整事件流。

---

## 七、 数据质量与信源治理规范 (Data Quality & Source Governance)
- **静态资源页自动阻断 (Static Resource Quarantine)**:
  - 核心依据：爬虫巡检会遍历官网根路径或导航栏，极易抓取条款 (`/terms`)、招聘 (`/careers`)、隐私 (`privacy`)、帮助文档 (`help`)、关于我们 (`about`) 及博客主页 (`/blog$`)；
  - 阻断规则：通过 `source_items.is_static_resource = 1` 物理隔离，公开事件流与动态流强制追加 `WHERE is_static_resource = 0`，确保仅技术发布动态向读者公开；
  - 留痕机制：原始抓取数据全量保留，后台提供管理端工作台 (`ModelsAdminView`) 支持误判一键纠偏。
- **凭证溯源与冲突撤销纪律 (Evidence Traceability)**:
  - 官方日期严禁伪造，必须有可溯源的官方 Blog / GitHub Release / 官方文档链接；
  - 同一模型出现多个日期冲突时，以挂载 `event_evidence` 的事件为准；历史误标的无凭证事件采用状态流转 (`review_status = 'REVOKED'`) 留痕撤销，严禁物理删除以保全审计链路。
- **同名重复卡安全隔离**:
  - 目录同步发生同名冲突且难以机器仲裁时，新引入卡片进入 `catalog_status = 'PENDING_REVIEW'`，不得直接以同名显示覆写正品卡或随意物理删除。
- **变更日志结构抽取与信源质量断言守护 (CODE_REVIEW 追加 29/33/34)**:
  - **结构分块抽取**: 针对更新日志/Changelog 类型的官方源（如 `developers.openai.com/api/docs/changelog`），启用专用提取器 `parseChangelogAnnouncements`，按 `h1~h5` 标题层级跨段落继承年份与月份上下文（如从 `September, 2026` 继承年份到 `Sep 25`），结构化组装完整日期；
  - **同页多条稳定身份**: 使用条目内容摘要散列生成源内唯一锚点（如 `source_url#2026-09-25-image-encoding-fix`），防止全局 `canonical_url` 冲突导致同日更新被覆盖；
  - **无日期侧边栏阻断**: 严禁将开发文档侧边栏、通用资源链接等无日期条目标记为发布动态；对所有 Changelog 源条目强制要求 `guessDate != null`，未命中日期的链接直接跳过；
  - **健康度断言守卫**: 若当次抓取条目数为 0 或未解析出有效发布日期，必须判定为 `PARSE_EMPTY`，严禁在缺少实质发布事实时误标为 `HEALTHY`；
  - **HTTP 304 缓存保留纪律**: HTTP 304 仅代表传输层缓存未变，严禁改写 `content_status`，必须保留此前的内容解析健康结论与空解析计数，杜绝假健康“洗绿”；
  - **第三方滚动路由别名防污染 (追加 30)**: 在 `ModelIdentityResolver` 与 `ModelFactMerger` 中硬拦截 `*-latest`（如 `deepseek-pro-latest` 等），严禁将其作为研发厂商的独立规范模型建卡发布；
- **信源治理与重复停用纪律 (CODE_REVIEW 追加 34/35)**:
  - 404 死链（如智谱海外博客死链 ID 24）以及完全重复登记信源（如百度新闻 ID 14 与 ID 8 重复）必须通过状态流转标记为 `is_active = 0`，保留历史外键但从巡检调度队列中安全退出；
  - 全站启用官方信源数收敛为精确真实的 24 条。
- **无证据同日发布日期复核清洗 (CODE_REVIEW 追加 28/34)**:
  - 对 `source_items` 中无官方事件证据支撑且 `DATE(published_at) = DATE(first_seen_at)` 的存量条目，一律重置为 `published_at = NULL`，并在界面标准呈现为“日期待核实”，彻底消除旧闻冒充今天/虚假高新鲜度风险。
- **真实历史回填流水线与覆盖审计矩阵规范 (方案第四节 / 追加 35)**:
  - 回填任务必须通过 `crawlService.runCrawlJob(true)` 真实执行全部启用信源的网络抓取与报文解析，真实记录 `durationMs`、`sourcesChecked`、`itemsParsed` 与 `newCandidatesFound`；
  - 彻底废止 `cnt >= 3 ? "FULL" : "PARTIAL"` 的假完整判定；
  - 月度覆盖矩阵严格依据遍历证据记录：
    - `VERIFIED_COVERED`：已完成官方归档巡检且捕获到真实已核验条目；
    - `VERIFIED_EMPTY`：已完成官方归档巡检但该月该厂商无模型发布更新；
    - `INCOMPLETE`：巡检过程中出现网络异常、HTTP 超时或解析缺口；
    - `UNVERIFIED`：尚未进行归档深入核验；
- **模型动态流按厂商分类正交筛选交互契约 (CODE_REVIEW 追加 36)**:
  - 前台官方动态流与已核实事件流均提供标准厂商分类胶囊条（`leads-vendor-strip`），展示各厂商品牌色点，支持展开全部 20 家官方厂商；
  - 厂商、主题分类、月份观测、关键字搜索实现四维正交联合过滤，自动联动 `GET /api/model-updates/official-updates`（`vendorId` 参数）与 `GET /api/model-updates/events`（`vendor` 参数），双向同步浏览器 URL 参数 `?vendor=...`；
  - 侧边栏近期活跃厂商卡片与主信息流厂商胶囊深度双向绑定，提供丝滑的原厂聚焦浏览体验。
- **信源监测台账与自动化防回退回归套件 (方案第五节 / 追加 37)**:
  - 管理控制台 `ModelsAdminView` 完整呈现每条信源的解析健康度 (`content_status`)、最新有效发布日期 (`latest_item_published_at`)、捕获动态数与已确认事件数双轨口径，杜绝把未经核实的原始条目混同于确认模型史；
  - 固化 `scripts/verify-crawler-reliability.ps1` 自动化断言校验套件，采用规范中文与 UTF-8 BOM 编码，彻底消灭 Windows PowerShell 终端乱码。
- **采集防再污染锁定与前台门禁收严纪律 (CODE_REVIEW 追加 38/39 与 Flyway V35)**:
  - **审查锁定持久化 (`locked_by_reviewer`)**: `source_items` 增加 `locked_by_reviewer` 字段与 `classification_reason` 分类；所有人工或脚本隔离的静态项被标记为锁定状态（`locked_by_reviewer = 1`，原因 `MANUAL_AUDIT_ISOLATED` 或 `NAV_OR_PRODUCT_PAGE`）；
  - **巡检单向升高与防覆盖**: `AiModelCrawlService` 在执行 `ON DUPLICATE KEY UPDATE` 时，强制保护 `is_static_resource = CASE WHEN locked_by_reviewer = 1 THEN 1 ELSE GREATEST(is_static_resource, VALUES(is_static_resource)) END`，杜绝爬虫重抓将人工隔离项复位为 0 导致噪音回流；
  - **静态资源拦截规则强化**: `StaticResourceRule.java` 扩充产品首页、控制台、通用解决方案、价格页、安全合规等特征路径正则，从源头阻断非新闻类入口进入动态池；
  - **入库异常日志留痕**: 移除 `catch (Exception ignored)` 吞异常行为，引入规范的 `log.warn`，保证数据冲突和写入异常透明可查；
  - **前台动态流门禁收严 (`published_at IS NOT NULL`)**: `findOfficialUpdates` 与 `countOfficialUpdates` 同步追加 `published_at IS NOT NULL` 条件，前台主动态流 100% 具备确切的官宣日期，空日期杂质彻底隔离在后台待审队列；
  - **第三方目录转正收敛 (Third-party Catalog Safeguard)**: `ModelFactMerger.createAndPublishModel` 中，第三方目录（`models_dev` 等）发现的新模型严格收敛为 `PENDING_REVIEW` 待审，严禁直接自动公开（`AUTO_PUBLISHED`）；第三方声称的日期仅作为字段事实存入 `model_facts`（`upstreamClaimedDate`），严禁越权直接写入 `ai_models.official_release_date`；
  - **全链路 10 项自动化防回退回归测试**: `scripts/verify-crawler-reliability.ps1` 覆盖 10 项严密断言（活跃源 24、确认事件基线 53、9月22/25双条事件与证据链、滚动路由别名拦截、官方动态流置顶更新、前台无空日期条目、覆盖矩阵标准语义、厂商筛选精准正交隔离、信源健康度双轨统计正常且异常源为 0），保障系统长期演进无退化。







