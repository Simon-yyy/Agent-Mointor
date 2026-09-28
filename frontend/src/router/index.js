import { createRouter, createWebHistory } from 'vue-router'
import { authApi } from '../api/auth.js'

// AI 模型监控主站视图
import AiHomeView from '../views/ai/AiHomeView.vue'
import AiModelsView from '../views/ai/AiModelsView.vue'
import AiModelDetailView from '../views/ai/AiModelDetailView.vue'
import AiVendorsView from '../views/ai/AiVendorsView.vue'
import AiVendorDetailView from '../views/ai/AiVendorDetailView.vue'
import AiTimelineView from '../views/ai/AiTimelineView.vue'

// 博客与次级栏目视图
import AboutView from '../views/AboutView.vue'
import ArticlesView from '../views/ArticlesView.vue'
import ArticleDetailView from '../views/ArticleDetailView.vue'
import WorksView from '../views/WorksView.vue'
import ArchiveView from '../views/ArchiveView.vue'

// 管理端视图
import LoginView from '../views/admin/LoginView.vue'
import ArticleManageView from '../views/admin/ArticleManageView.vue'
import ArticleEditView from '../views/admin/ArticleEditView.vue'
import WorkManageView from '../views/admin/WorkManageView.vue'
import ModelsAdminView from '../views/admin/ModelsAdminView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 1. AI 模型监控站核心路由
    { path: '/', name: 'ai-home', component: AiHomeView, meta: { title: 'AI 模型动态监控站 · 全球重点厂商发布追踪' } },
    { path: '/models', name: 'ai-models', component: AiModelsView, meta: { title: '大模型目录档案 · AI 模型动态站' } },
    { path: '/models/:id', name: 'ai-model-detail', component: AiModelDetailView, meta: { title: '模型详情与演进 · AI 模型动态站' } },
    { path: '/vendors', name: 'ai-vendors', component: AiVendorsView, meta: { title: '重点 AI 厂商目录 · AI 模型动态站' } },
    { path: '/vendors/:slug', name: 'ai-vendor-detail', component: AiVendorDetailView, meta: { title: '厂商模型发布详情 · AI 模型动态站' } },
    { path: '/model-timeline', name: 'ai-timeline', component: AiTimelineView, meta: { title: '模型发布历史时间线 · AI 模型动态站' } },

    // 2. 个人博客与次级栏目路由 (保留全部业务能力)
    { path: '/about', name: 'about', component: AboutView, meta: { title: '关于博主 · Simon' } },
    { path: '/articles', name: 'articles', component: ArticlesView, meta: { title: '全部手记 · Simon' } },
    { path: '/articles/:id', name: 'article-detail', component: ArticleDetailView, meta: { title: '手记详情 · Simon' } },
    { path: '/works', name: 'works', component: WorksView, meta: { title: '开源与作品 · Simon' } },
    { path: '/archives', name: 'archives', component: ArchiveView, meta: { title: '手记归档 · Simon' } },

    // 3. 管理端路由
    { path: '/admin/login', name: 'admin-login', component: LoginView, meta: { title: '管理员登录 · 控制台' } },
    { path: '/admin/models', name: 'admin-models', component: ModelsAdminView, meta: { requiresAuth: true, title: '模型监控与审核 · 控制台' } },
    { path: '/admin/articles', name: 'admin-articles', component: ArticleManageView, meta: { requiresAuth: true, title: '文章管理 · 控制台' } },
    { path: '/admin/articles/new', name: 'admin-article-new', component: ArticleEditView, meta: { requiresAuth: true, title: '撰写新博文 · 控制台' } },
    { path: '/admin/articles/edit/:id', name: 'admin-article-edit', component: ArticleEditView, meta: { requiresAuth: true, title: '编辑博文 · 控制台' } },
    { path: '/admin/works', name: 'admin-works', component: WorkManageView, meta: { requiresAuth: true, title: '作品管理 · 控制台' } },

    // 404 兜底
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  }

  if (to.meta && to.meta.requiresAuth) {
    if (!authApi.isLoggedIn()) {
      next({ path: '/admin/login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
