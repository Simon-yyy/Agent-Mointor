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
  - **数据库持久化**: MySQL 8.0+ 驱动，Flyway 严格版本化迁移（当前基线至 `V16`）。
  - **23 家原厂官方信源**: 100% 覆盖 OpenAI、Anthropic、DeepMind、Meta、Microsoft 等主流 AI 机构官方 RSS/ATOM/HTML 直达源。
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

