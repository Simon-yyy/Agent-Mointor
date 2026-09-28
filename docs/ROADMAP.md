# 博客项目完整开发路线

> 基于当前工程现状（后端 Spring Boot 骨架 + 前端 Vue 3 三页面壳，前后端未打通）制定的落地路线。
> 预计总工期：全职约 7~10 个工作日；业余时间约 2~3 周。

---

## 一、现状盘点

| 模块 | 现状 | 差距 |
|------|------|------|
| backend | Spring Boot 骨架，仅 HelloController，`application.properties` 为空壳，可正常打包 | 无数据库、无业务模块、无统一响应/异常处理 |
| frontend | Vue 3 + Vite + vue-router，Home/Articles/Works 三个空视图 | 无 axios、无 API 层、无组件库、页面为静态壳 |
| tools/jdk | 便携 JDK | 可用于免安装启动，尚未利用 |

**总体架构目标**：前后端分离开发、RESTful API、Markdown 内容驱动、可单 jar 合体部署。

---

## 二、里程碑总览

    M0 基座打通        ──►  M1 文章后端      ──►  M2 文章前端
    （半天~1天）            （2~3天）             （2~3天）
                                                    │
    M5 部署上线  ◄──  M4 体验完善  ◄──  M3 管理后台+登录
    （1~2天）          （3~5天）         （3~5天）
                                                    │
                                            M6 进阶可选（长期）

---

## 三、各阶段详细任务

### M0：跑通基座（0.5 ~ 1 天）★ 第一个优先级

**目标：前端能调通后端一个真实接口，开发环境彻底就绪。**

1. **后端配置**
   - `application.properties` 补齐：端口（建议 8080）、数据源、JPA 配置
   - 数据库选型：**开发期用 H2（零安装、开箱即用），生产切 MySQL**，通过 Spring Profile 区分
2. **后端工程化基建**
   - 统一响应体 `Result<T>`（code / message / data）
   - 全局异常处理 `@RestControllerAdvice`
   - CORS 配置（放行 Vite 开发端口 5173）
3. **前端基建**
   - 安装 `axios`，封装 `src/api/request.js`（拦截器统一处理 code 与错误）
   - 建好 `api/`、`components/`、`utils/` 目录结构

**验收标准**：浏览器从 ArticlesView 发起请求，页面渲染出后端返回的数据。

---

### M1：文章模块后端（2 ~ 3 天）

**目标：文章 CRUD 接口全部可用。**

1. **表设计落地**（见第五节 SQL 草案）：`t_article`、`t_category`、`t_tag`、`t_article_tag`
2. **分层实现**：Entity → Repository（Spring Data JPA）→ Service → Controller → DTO
3. **接口清单**：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/articles` | 分页列表，支持 `page/size/keyword/tag` 参数 |
| GET | `/api/articles/{id}` | 文章详情（正文为 Markdown 原文） |
| POST | `/api/admin/articles` | 新建（暂不做鉴权，M3 再补） |
| PUT | `/api/admin/articles/{id}` | 更新 |
| DELETE | `/api/admin/articles/{id}` | 删除 |

4. **参数校验**：`spring-boot-starter-validation`，标题非空、长度限制等
5. **可选提效**：引入 `springdoc-openapi` 自动生成接口文档，替代 Postman 手工维护

**验收标准**：用接口文档/HTTP 工具完成「新建 → 列表 → 详情 → 更新 → 删除」全流程。

---

### M2：文章模块前端（2 ~ 3 天）

**目标：博客的"读者侧"成型。**

1. `api/articles.js` 接口模块
2. **ArticlesView**：文章卡片列表 + 分页 + 关键词搜索 + 标签筛选
3. **文章详情页**：新增路由 `/articles/:id`
   - `markdown-it` 渲染正文 + `highlight.js` 代码高亮
4. **HomeView**：最新文章 N 篇 + 博客简介区
5. **WorksView**：同步加 `t_work` 表和接口；赶进度可先静态数据占位
6. UI 可选择：轻量手写样式，或引入组件库（Element Plus / Naive UI）

**验收标准**：从首页进入文章列表 → 点开详情，Markdown 正常渲染，移动端布局不破。

---

### M3：管理后台与登录（3 ~ 5 天）

**目标：不用写 SQL 就能发文章。**

1. **鉴权**：Spring Security + JWT，单管理员账号（配置文件内置初始密码即可，无需注册功能）
   - `POST /api/auth/login` → 返回 token
   - `/api/admin/**` 路径校验 token
2. **前端管理路由**：`/admin` 前缀 + 路由守卫
   - 登录页
   - 文章管理列表（状态筛选：草稿/已发布）
   - **Markdown 编辑器**（推荐 `md-editor-v3`，自带工具栏与预览）
   - 作品管理页
3. **草稿/发布工作流**：status 字段流转，读者侧接口只查已发布

**验收标准**：在管理后台写一篇带代码块的 Markdown 文章 → 发布 → 读者侧立即可见。

---

### M4：体验完善（3 ~ 5 天）

按价值排序，可裁剪：

1. **浏览量统计**：详情接口 `views + 1`（同 IP 简单去重可用 Redis，先用内存/数据库即可）
2. **归档页 + 标签页**：按年月分组、标签聚合
3. **暗色模式**：CSS 变量 + `prefers-color-scheme` + 手动切换按钮
4. **响应式打磨**：手机端导航、文章排版
5. **评论系统**：自建成本高，**强烈建议接 giscus（GitHub Discussions）或 Waline**，半天搞定
6. **SEO 基础**：路由切换动态更新 `document.title` 与 meta description；（SSR/预渲染属于 M6 范畴）

---

### M5：部署上线（1 ~ 2 天）

**方案 A（推荐，最简单）：合体部署**

- `npm run build` 产物放入 `backend/src/main/resources/static`
- 一个 jar 同时提供 API 与页面，利用 `tools/jdk` 免安装运行
- 注意：前端路由用 history 模式时，后端需将非 `/api` 请求全部转发到 `index.html`

**方案 B：Nginx 分离部署**

- Nginx 托管前端静态文件，`/api` 反代到 8080
- 适合后续需要 CDN、HTTPS 自动续期的场景

**配套事项**：

- `application-prod.properties`：MySQL 连接、日志路径
- `scripts/` 下编写一键启动脚本（设置 JAVA_HOME 指向 tools/jdk）
- 数据库定时备份（哪怕先写个 mysqldump 计划任务）

---

### M6：进阶可选（长期迭代）

- 全文搜索（MySQL 全文索引 → 后续可换 Meilisearch）
- 图床（本地 `/uploads` → OSS/COS）
- 缓存（首页与列表页接口加 Spring Cache）
- CI/CD（GitHub Actions：push 自动构建部署）
- RSS / sitemap

---

## 四、目录结构规划

    backend/src/main/java/com/myblog/backend/
    ├── config/            # WebMvc、CORS、Security 配置
    ├── common/            # Result 统一响应、全局异常、常量
    ├── controller/
    ├── service/
    ├── repository/
    ├── entity/            # JPA 实体，与表一一对应
    ├── dto/               # 请求/响应对象，隔离实体
    └── BlogBackendApplication.java

    frontend/src/
    ├── api/               # request.js 封装 + articles.js / works.js / auth.js
    ├── components/        # ArticleCard、Pagination、Navbar 等复用组件
    ├── router/
    ├── stores/            # Pinia（用户态、主题态，需要时再引入）
    ├── utils/
    ├── views/
    │   ├── HomeView.vue / ArticlesView.vue / WorksView.vue
    │   ├── ArticleDetailView.vue
    │   └── admin/         # LoginView、ArticleManage、ArticleEdit、WorkManage
    ├── App.vue
    └── main.js

    scripts/               # 启动/构建/备份脚本（禁止散落根目录）
    docs/                  # 本文档等

---

## 五、数据库设计草案

    CREATE TABLE t_article (
      id          BIGINT AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(200) NOT NULL,
      summary     VARCHAR(500),
      content_md  TEXT         NOT NULL COMMENT 'Markdown 原文',
      cover_url   VARCHAR(500),
      category_id BIGINT,
      status      TINYINT      NOT NULL DEFAULT 0 COMMENT '0草稿 1已发布',
      views       BIGINT       NOT NULL DEFAULT 0,
      created_at  DATETIME     NOT NULL,
      updated_at  DATETIME     NOT NULL,
      INDEX idx_status_created (status, created_at DESC)
    );

    CREATE TABLE t_category (
      id   BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE t_tag (
      id   BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE t_article_tag (
      article_id BIGINT NOT NULL,
      tag_id     BIGINT NOT NULL,
      PRIMARY KEY (article_id, tag_id)
    );

    CREATE TABLE t_work (
      id          BIGINT AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(200) NOT NULL,
      description VARCHAR(1000),
      cover_url   VARCHAR(500),
      link        VARCHAR(500),
      sort_order  INT NOT NULL DEFAULT 0,
      created_at  DATETIME NOT NULL
    );

---

## 六、API 约定

统一响应体：

    { "code": 0, "message": "ok", "data": { "...": "..." } }

- 业务错误 code 非 0，HTTP 状态码仅表达传输层/框架层问题
- 分页响应 data 固定为 `{ list, total, page, size }`
- 前端 axios 拦截器统一弹错，业务代码只关心 data

---

## 七、关键决策与风险提示

| 事项 | 建议 | 理由 |
|------|------|------|
| 内容格式 | Markdown 而非富文本 | 便携、可迁移、编辑器生态成熟 |
| ORM | Spring Data JPA | 这个量级足够，开发速度最快 |
| 评论 | 三方方案优先 | 自建评论是最大的时间黑洞 |
| 前端路由 history 模式 | 部署时必须做兜底转发 | 否则刷新非首页路由直接 404 |
| Spring Boot 3.x | 需 JDK 17+ | 确认 tools/jdk 版本满足，否则锁 2.7.x |
| 上线节奏 | M2 结束即可先部署第一版 | 尽早暴露部署问题，管理后台可后补 |

---

## 八、建议执行顺序（下一步行动）

**立即启动 M0**，具体三件事：

1. 后端：补 `application.properties`（H2 + JPA）+ `Result` 统一响应 + CORS
2. 后端：写一个临时 `/api/ping` 接口验证链路
3. 前端：装 axios，ArticlesView 调通该接口

M0 完成当天即可进入 M1 表结构与实体开发。