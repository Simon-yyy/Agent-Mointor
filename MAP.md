# 项目模块地图 (MAP.md / Agent Navigation)

## 一、 项目架构与工程定位
本项目为 **前后端分离的个人博客与作品仓库全栈系统**，同时支持将前端编译产物整合入 Spring Boot 静态资源目录进行**单 Jar 包独立合体运行**。

---

## 二、 核心入口与端口矩阵
| 服务 / 模块 | 职责与技术栈 | 开发环境入口 / 端口 | 关键配置 / 依赖 |
| :--- | :--- | :--- | :--- |
| **后端服务 (backend)** | RESTful API、持久化数据引擎、鉴权拦截 (Spring Boot 4.1 / Java 21) | `http://localhost:8080` (验证: `/api/hello`) | `application.properties` / `tools/jdk` / `tools/maven` |
| **前端服务 (frontend)** | 读者侧展示、双栏 Markdown 编辑器、站长后台 (Vue 3 / Vite 6) | `http://localhost:5180` (反代 `/api` -> 8080) | `vite.config.mjs` / `package.json` |
| **一体化合体运行** | 后端单 Jar 托管前端 SPA 静态页面 (History 模式自动路由兜底) | `http://localhost:8080` | `WebMvcConfig.java` / `backend/src/main/resources/static/` |
| **数据存储 (data)** | 本地原子文件持久化，启动自动播种高质量初始数据 | 根目录 `data/*.json` | `DataStorageEngine.java` |
| **一键启动脚本** | 免安装便携环境快捷启动 | `启动后端.bat` / `启动前端.bat` | 根目录批处理脚本 |

---

## 三、 模块拓扑与职责分工

### 1. 后端模块 (`backend/src/main/java/com/myblog/backend/`)
- **启动引导**: [`BlogBackendApplication.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/BlogBackendApplication.java) - Spring Boot 主程序入口。
- **控制器层 (`controller/`)**:
  - [`ArticleController.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/controller/ArticleController.java) - 读者侧文章列表（分页/搜索/分类/标签）、详情、阅读量递增、归档时间轴聚合。
  - [`WorkController.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/controller/WorkController.java) - 读者侧作品列表与详情。
  - [`AuthController.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/controller/AuthController.java) - 管理员账号密码登录认证与 Token 有效性检查。
  - [`AdminArticleController.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/controller/AdminArticleController.java) - 管理端文章全量列表、新建发布、编辑修改、删除、指标看板。
  - [`AdminWorkController.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/controller/AdminWorkController.java) - 管理端作品新增、编辑与删除。
  - [`HelloController.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/controller/HelloController.java) - 基础健康探活兼容接口。
- **业务服务层 (`service/`)**:
  - [`ArticleService.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/service/ArticleService.java) - 核心文章业务逻辑、搜索过滤、时间线归档算法与统计。
  - [`WorkService.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/service/WorkService.java) - 作品排序与增删改查。
  - [`AuthService.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/service/AuthService.java) - 基于 HMAC-SHA256 的安全 Token 签发与过期验证。
- **持久化仓储层 (`repository/`)**:
  - [`DataStorageEngine.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/repository/DataStorageEngine.java) - 基于 Jackson 3 的读写锁（ReentrantReadWriteLock）与原子写入（Atomic Move）本地持久化引擎，支持自动数据播种。
  - [`ArticleRepository.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/repository/ArticleRepository.java) - 文章数据查询、过滤、排序与持久化。
  - [`WorkRepository.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/repository/WorkRepository.java) - 作品数据持久化。
- **基础设施与配置 (`common/` & `config/`)**:
  - [`Result.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/common/Result.java) & [`PageResult.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/common/PageResult.java) - 统一 RESTful 响应与分页载荷。
  - [`GlobalExceptionHandler.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/common/GlobalExceptionHandler.java) - 全局异常捕获处理。
  - [`AuthInterceptor.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/config/AuthInterceptor.java) - 保护 `/api/admin/**` 路由的鉴权拦截器。
  - [`WebMvcConfig.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/config/WebMvcConfig.java) - 跨域 CORS、拦截器注册与 SPA 静态资源转发。

### 2. 前端模块 (`frontend/src/`)
- **入口引导**: [`main.js`](file:///d:/code_files/博客/frontend/src/main.js) & [`App.vue`](file:///d:/code_files/博客/frontend/src/App.vue) - Vue 应用装配、主题系统初始化与全局布局。
- **路由控制**: [`router/index.js`](file:///d:/code_files/博客/frontend/src/router/index.js) - 注册读者端与后台路由，集成管理员登录守卫 `beforeEach`。
- **页面视图 (`views/`)**:
  - [`HomeView.vue`](file:///d:/code_files/博客/frontend/src/views/HomeView.vue) - 技术极简风首页（Hero 自我介绍、精选作品、最新文章）。
  - [`ArticlesView.vue`](file:///d:/code_files/博客/frontend/src/views/ArticlesView.vue) - 文章列表页（模糊检索、分类选择、标签筛选、卡片式列表、分页）。
  - [`ArticleDetailView.vue`](file:///d:/code_files/博客/frontend/src/views/ArticleDetailView.vue) - 文章详情页（Markdown 实时渲染、代码块复制、阅读时长统计）。
  - [`WorksView.vue`](file:///d:/code_files/博客/frontend/src/views/WorksView.vue) - 作品仓库页（网格化卡片、技术栈、在线体验与 GitHub 链接）。
  - [`ArchiveView.vue`](file:///d:/code_files/博客/frontend/src/views/ArchiveView.vue) - 时间线归档页（按年份折叠的时间轴）。
  - **管理后台 (`views/admin/`)**:
    - [`LoginView.vue`](file:///d:/code_files/博客/frontend/src/views/admin/LoginView.vue) - 管理员登录（支持一键填入默认凭据）。
    - [`ArticleManageView.vue`](file:///d:/code_files/博客/frontend/src/views/admin/ArticleManageView.vue) - 统计看板、文章状态流转、编辑与删除。
    - [`ArticleEditView.vue`](file:///d:/code_files/博客/frontend/src/views/admin/ArticleEditView.vue) - 双栏响应式实时 Markdown 编辑器工作台。
    - [`WorkManageView.vue`](file:///d:/code_files/博客/frontend/src/views/admin/WorkManageView.vue) - 作品在线维护与弹窗表单。
    - [`ModelsAdminView.vue`](file:///d:/code_files/博客/frontend/src/views/admin/ModelsAdminView.vue) - AI 模型与信源管理工作台（支持静态资源页标记审查、模型审核与手动触发巡检）。
- **公共组件与工具 (`components/` & `utils/` & `api/`)**:
  - [`NavBar.vue`](file:///d:/code_files/博客/frontend/src/components/NavBar.vue) & [`FooterBar.vue`](file:///d:/code_files/博客/frontend/src/components/FooterBar.vue) - 响应式顶部导航与页脚。
  - [`Pagination.vue`](file:///d:/code_files/博客/frontend/src/components/Pagination.vue) - 通用可交互分页器。
  - [`markdown.js`](file:///d:/code_files/博客/frontend/src/utils/markdown.js) - 纯原生 Markdown 解析引擎与字数/阅读时间估算。
  - [`theme.js`](file:///d:/code_files/博客/frontend/src/utils/theme.js) - 深色/浅色模式切换与持久化。
  - [`request.js`](file:///d:/code_files/博客/frontend/src/api/request.js) - 原生 Fetch 封装，统一拦截与 Token 自动注入。

---

### 3. 全球 AI 模型动态追踪与目录观察台 (`aimodel/`)
本模块负责全球 AI 研发原厂与前沿模型的多源追踪、自动化多源事实仲裁、权威基准评测呈现与可视化。

#### 3.1 后端拓扑与核心流水线 (`backend/src/main/java/com/myblog/backend/aimodel/`)
- **控制器层 (`controller/`)**:
  - [`AiModelController.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/controller/AiModelController.java) - 公开只读路由 (`/api/model-updates/**`)：动态事件流 (`/events`)、厂商矩阵 (`/vendors`)、模型目录多维分页 (`/models`)、模型详情与评测 (`/models/{id}`)、模型演进历程 (`/models/{id}/events`)。
  - [`AdminModelController.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/controller/AdminModelController.java) - 受保护管理路由 (`/api/admin/model-updates/**`)：候选审核流转 (`/candidates` 及 `/{id}/decision`)、信源台账与健康度监测 (`/sources`)、信源启停 (`/sources/{id}/toggle`)、真实历史回填任务创建与查询 (`/backfill` 及 `/{jobId}`)、手动触发全源错峰巡检 (`/crawl/trigger`)。
- **目录身份解析与推断引擎 (`catalog/identity/`)**:
  - [`ModelIdentityResolver.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/catalog/identity/ModelIdentityResolver.java) - 三级阶梯解析（别名表 -> 剥离计费/服务档位变体如 `-fast`/`-flex` -> 规范名匹配）；搭载 `inferRootVendorId` 研发原厂特征推断引擎，精准识别 Claude、Qwen、DeepSeek、GPT、Llama、Gemini、GLM、Kimi、Seed、MiMo 等所属真实厂商，彻底杜绝挂错托管商；内置 `isThirdPartyRollingAlias` 硬拦截 `*-latest` 别名卡。
- **事实仲裁与转正管线 (`catalog/merge/`)**:
  - [`ModelFactMerger.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/catalog/merge/ModelFactMerger.java) - 字段级多源仲裁（发布日期取 min + 60天护栏、定价归一 $/M token、模态与上下文补全）；维护托管商排除集合（DigitalOcean、DeepInfra 等不建厂商卡）；提供主厂商别名归一化与国内/海外地域自动精确标注；第三方目录新模型严格收敛为 `PENDING_REVIEW` 待审（第三方日期作为 facts 存证不冒充官方发布日）。
- **多源数据接入与同步 (`catalog/sync/` & `catalog/adapter/`)**:
  - [`CatalogSyncJob.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/catalog/sync/CatalogSyncJob.java) - 每日定时多源目录数据高置信拉取与增量合并。
  - [`ModelsDevAdapter.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/catalog/adapter/ModelsDevAdapter.java) - 上游规范数据源适配器与模型元数据提取。
- **官方信源自适应巡检与解析服务 (`crawl/` & `service/`)**:
  - [`AiModelCrawlService.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/service/AiModelCrawlService.java) - 全信源核心采集与解析引擎，支持 RSS/Atom/HTML/Changelog 四类适配，内置跨层级标题日期上下文继承、源内内容散列稳定锚点、HTTP 304 缓存保留前序健康状态机制、以及单向升高的 `locked_by_reviewer` 审查锁定防覆盖保障。
  - [`AdaptiveCrawlScheduler.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/crawl/scheduler/AdaptiveCrawlScheduler.java) - 覆盖 24 家官方信源的自适应错峰调度器，支持条件请求与连续空解析自动告警。
- **评测基准与业务服务 (`service/`)**:
  - [`AiModelService.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/service/AiModelService.java) - 模型、厂商与事件核心查询、多维服务端分页检索。
  - [`ModelBenchmarkService.java`](file:///d:/code_files/博客/backend/src/main/java/com/myblog/backend/aimodel/service/ModelBenchmarkService.java) - 权威基准评测服务（覆盖 MMLU-Pro、Arena Elo、SWE-bench Verified、MATH-500、HumanEval、GPQA Diamond、LiveCodeBench、GSM8K 等）。

#### 3.2 前端视图组件 (`frontend/src/views/`)
- [`AiHomeView.vue`](file:///d:/code_files/博客/frontend/src/views/ai/AiHomeView.vue) - 全球模型动态主看板（多信源时间线、双语技术事实摘要、主题分类与按厂商正交胶囊筛选、原厂品牌色点指示、双轨动态流呈现、指标数据统计）。
- [`AiModelsView.vue`](file:///d:/code_files/博客/frontend/src/views/ai/AiModelsView.vue) - 模型目录大厅（支持国内/海外地域分类、多模态能力多选、关键词模糊搜索、分页卡片流）。
- [`AiModelDetailView.vue`](file:///d:/code_files/博客/frontend/src/views/ai/AiModelDetailView.vue) - 模型详情档案（结构化演进时间线、基准评测绝对值与相对分位水平标尺、原厂存证凭据）。
- [`ModelsAdminView.vue`](file:///d:/code_files/博客/frontend/src/views/admin/ModelsAdminView.vue) - 模型监控与管理控制台（信源监测台账、双轨捕获/待审/确认计数、最新发布日与解析健康度、真实历史回填与月份覆盖审计矩阵）。
- [`ModelDetailView.vue`](file:///d:/code_files/博客/frontend/src/views/ModelDetailView.vue) - 模型独立档案详情（官方规格参数存证、8 大权威基准横向柱状图与综合能力评测、专属演进历史轴）。
- [`VendorsView.vue`](file:///d:/code_files/博客/frontend/src/views/VendorsView.vue) - 研发厂商矩阵大厅（分层展示主流研发厂商与收录模型规模）。
- [`TimelineView.vue`](file:///d:/code_files/博客/frontend/src/views/TimelineView.vue) - 全球 AI 发布全景时间轴。

---

## 四、 数据库与持久化拓扑
- **双模持久化架构**:
  1. **博客与作品数据**: 本地轻量原子文件存储 (`data/*.json`)，由 `DataStorageEngine.java` 驱动。
  2. **AI 模型与动态数据**: MySQL 8.0+ 关系型数据库 (`ai_model_hub`)，通过 Alibaba Druid 连接池管理。
- **Flyway 数据库自动化版本迁移 (`backend/src/main/resources/db/migration/`)**:
  - 当前最新基线版本：**`V35`**（`V35__crawl_locking_and_prevent_static_override.sql`）。
  - 核心表结构：`ai_models`、`model_vendors`、`model_events`、`model_sources`（含死链与重复源自动停用机制）、`source_items`（含 `locked_by_reviewer` 审查锁定、`is_static_resource` 静态页阻断、发布日期证据校验）、`event_evidence`（官方事件存证凭据）、`source_coverage`（标准语义覆盖审计：`VERIFIED_COVERED` / `VERIFIED_EMPTY` / `INCOMPLETE` / `UNVERIFIED`）、`backfill_jobs`（真实网络调度回填台账）、`model_facts`、`model_aliases`、`vendor_aliases`、`model_benchmarks`（含 `verified` 认证状态）、`model_benchmark_scores`、`catalog_conflicts`。
  - 数据质量机制：内置条款/招聘/备案/功能页/控制台静态资源页强化正则阻断、变更日志跨层级日期上下文抽取器（`parseChangelogAnnouncements`）、HTTP 304 缓存命中保留前序健康状态机制、第三方滚动路由别名硬拦截（`isThirdPartyRollingAlias` 阻断 `*-latest` 建卡）、第三方目录模型严格收敛为 `PENDING_REVIEW` 待审（第三方日期不冒充官方发布日）、真实历史回填与归档巡检引擎、前台官方动态流收严 `published_at IS NOT NULL` 门禁彻底消除空日期杂质、无证据历史确认事件可逆撤销至 `REVOKED` 留痕、真实原厂研发推断引擎、未验证评测隔离榜单。

---

## 五、 开发、构建与验证工作流 (Workflows & Commands)
- **环境规范**:
  - JDK 21：`D:\Java\bin\java.exe`
  - Maven：`D:\Maven\apache-maven-3.9.16\bin\mvn.cmd`
- **核心构建命令**:
  - 后端打包（跳过测试）：`mvn clean package -DskipTests`
  - 后端运行：`java -Dfile.encoding=UTF-8 -jar target/backend-0.0.1-SNAPSHOT.jar`
  - 前端开发：`npm run dev`
  - 前端构建：`npm run build`（输出至 `backend/src/main/resources/static/` 实现合体部署）
  - 全链路自动化回归校验：`powershell -ExecutionPolicy Bypass -File scripts\verify-crawler-reliability.ps1`（10 项信源可靠性与防再污染校验，耗时 ~600ms）
- **工程红线与协作原则**:
  - 严禁在代码中硬编码任何 API 密钥或敏感凭据；
  - Git 提交权 100% 归用户，严禁私自执行 `git commit` 或 `git push`；
  - 涉及数据库破坏性变更严禁私自执行，必须通过 Flyway 增量脚本平滑迁移。

