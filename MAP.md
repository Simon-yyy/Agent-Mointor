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
- **公共组件与工具 (`components/` & `utils/` & `api/`)**:
  - [`NavBar.vue`](file:///d:/code_files/博客/frontend/src/components/NavBar.vue) & [`FooterBar.vue`](file:///d:/code_files/博客/frontend/src/components/FooterBar.vue) - 响应式顶部导航与页脚。
  - [`Pagination.vue`](file:///d:/code_files/博客/frontend/src/components/Pagination.vue) - 通用可交互分页器。
  - [`markdown.js`](file:///d:/code_files/博客/frontend/src/utils/markdown.js) - 纯原生 Markdown 解析引擎与字数/阅读时间估算。
  - [`theme.js`](file:///d:/code_files/博客/frontend/src/utils/theme.js) - 深色/浅色模式切换与持久化。
  - [`request.js`](file:///d:/code_files/博客/frontend/src/api/request.js) - 原生 Fetch 封装，统一拦截与 Token 自动注入。
