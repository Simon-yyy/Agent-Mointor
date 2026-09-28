<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi } from '../../api/articles.js'
import { authApi } from '../../api/auth.js'
import Pagination from '../../components/Pagination.vue'

const router = useRouter()
const articles = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(8)
const totalPages = ref(1)
const loading = ref(false)
const keyword = ref('')
const statusFilter = ref('')

const stats = ref({
  totalArticles: 0,
  publishedCount: 0,
  draftCount: 0,
  totalViews: 0,
})

async function fetchStats() {
  try {
    const data = await articleApi.getArticleStats()
    if (data) {
      stats.value = data
    }
  } catch (e) {
    console.error('获取文章统计异常', e)
  }
}

async function loadArticles() {
  loading.value = true
  try {
    const res = await articleApi.getAdminArticles({
      page: page.value,
      size: size.value,
      keyword: keyword.value,
      status: statusFilter.value === '' ? undefined : Number(statusFilter.value),
    })
    articles.value = res.list || []
    total.value = res.total || 0
    totalPages.value = res.totalPages || 1
  } catch (e) {
    console.error('获取管理端文章列表异常', e)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadArticles()
}

function handleStatusFilter(val) {
  statusFilter.value = val
  page.value = 1
  loadArticles()
}

function handlePageChange(p) {
  page.value = p
  loadArticles()
}

async function toggleStatus(art) {
  const newStatus = art.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '发布上线' : '转为草稿'
  if (!confirm(`确定要将《${art.title}》${actionText}吗？`)) return

  try {
    await articleApi.patchArticleStatus(art.id, newStatus)
    art.status = newStatus
    fetchStats()
  } catch (e) {
    alert(`${actionText}失败: ` + e.message)
  }
}

async function handleDelete(art) {
  if (!confirm(`【高危操作警告】确定要永久删除博文《${art.title}》吗？此操作不可恢复！`)) {
    return
  }
  try {
    await articleApi.deleteArticle(art.id)
    alert('博文已成功删除')
    fetchStats()
    loadArticles()
  } catch (e) {
    alert('删除失败: ' + e.message)
  }
}

function handleLogout() {
  if (confirm('确定要退出管理员登录吗？')) {
    authApi.logout()
    router.push('/')
  }
}

onMounted(() => {
  fetchStats()
  loadArticles()
})
</script>

<template>
  <div class="admin-console-page">
    <!-- 统一控制台极客顶栏 (Admin Console Shell Header) -->
    <header class="console-topbar-card">
      <div class="console-brand">
        <div class="console-shield-badge">⚙️</div>
        <div class="console-brand-text">
          <span class="console-title">博客后台管理</span>
          <span class="console-runtime-badge">文章与内容维护</span>
        </div>
      </div>

      <nav class="console-nav-tabs">
        <router-link to="/admin/models" class="console-tab-item">
          🤖 模型监控审核
        </router-link>
        <router-link to="/admin/articles" class="console-tab-item active">
          📝 博文管理
        </router-link>
        <router-link to="/admin/works" class="console-tab-item">
          🛠️ 作品管理
        </router-link>
        <router-link to="/admin/articles/new" class="console-tab-item create-tab">
          ✍️ 撰写新博文
        </router-link>
      </nav>

      <div class="console-right-actions">
        <span class="admin-user-pill">👤 admin</span>
        <router-link to="/" target="_blank" class="preview-front-btn" title="在新标签页预览前台">
          ↗ 前台博客
        </router-link>
        <button class="console-logout-btn" title="安全退出登录" @click="handleLogout">
          登出
        </button>
      </div>
    </header>

    <!-- 4 色高光数据指标看板 (4-Color Radiant Stats Panel) -->
    <section class="admin-stats-grid">
      <div class="admin-stat-card stat-cyan">
        <div class="stat-top">
          <span class="stat-icon">📚</span>
          <span class="stat-tag">ALL POSTS</span>
        </div>
        <div class="stat-number">{{ stats.totalArticles }}</div>
        <div class="stat-label">总博文数</div>
      </div>

      <div class="admin-stat-card stat-emerald">
        <div class="stat-top">
          <span class="stat-icon">🌐</span>
          <span class="stat-tag">ONLINE</span>
        </div>
        <div class="stat-number">{{ stats.publishedCount }}</div>
        <div class="stat-label">已公开发布</div>
      </div>

      <div class="admin-stat-card stat-amber">
        <div class="stat-top">
          <span class="stat-icon">📝</span>
          <span class="stat-tag">DRAFT</span>
        </div>
        <div class="stat-number">{{ stats.draftCount }}</div>
        <div class="stat-label">草稿箱存储</div>
      </div>

      <div class="admin-stat-card stat-purple">
        <div class="stat-top">
          <span class="stat-icon">👁️</span>
          <span class="stat-tag">VIEWS</span>
        </div>
        <div class="stat-number">{{ stats.totalViews }}</div>
        <div class="stat-label">全站总阅读人次</div>
      </div>
    </section>

    <!-- 主管理面板：搜索与数据表格 -->
    <main class="console-main-panel">
      <div class="panel-header-bar">
        <div class="filter-pills-wrap">
          <button
            :class="['filter-btn-pill', { active: statusFilter === '' }]"
            @click="handleStatusFilter('')"
          >
            全部 ({{ total }})
          </button>
          <button
            :class="['filter-btn-pill', { active: statusFilter === '1' }]"
            @click="handleStatusFilter('1')"
          >
            🟢 已发布
          </button>
          <button
            :class="['filter-btn-pill', { active: statusFilter === '0' }]"
            @click="handleStatusFilter('0')"
          >
            🟡 草稿
          </button>
        </div>

        <div class="search-and-new-wrap">
          <div class="search-input-box">
            <span class="search-ico">🔍</span>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索标题或摘要关键词..."
              class="search-input-field"
              @keyup.enter="handleSearch"
            />
            <button v-if="keyword" class="clear-search-btn" @click="keyword = ''; handleSearch()">✕</button>
          </div>
          <button class="search-trigger-btn" @click="handleSearch">搜索</button>
          <router-link to="/admin/articles/new" class="create-article-cta">
            ✍️ 撰写新文章
          </router-link>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <table class="modern-admin-table">
          <thead>
            <tr>
              <th width="38%">文章标题与标签</th>
              <th width="14%">分类领域</th>
              <th width="12%">发布状态</th>
              <th width="10%">累计阅读</th>
              <th width="12%">创建时间</th>
              <th width="14%" class="text-right">管理操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="empty-cell">
                <span class="loading-spinner">⌛ 正在同步系统数据…</span>
              </td>
            </tr>
            <tr v-else-if="articles.length === 0">
              <td colspan="6" class="empty-cell">
                📭 暂无符合条件的文章数据
              </td>
            </tr>
            <tr v-for="art in articles" :key="art.id" class="table-data-row">
              <td>
                <div class="title-column-wrap">
                  <router-link :to="`/articles/${art.id}`" target="_blank" class="table-art-link">
                    {{ art.title }}
                  </router-link>
                  <div class="table-tags-list">
                    <span v-for="t in art.tags" :key="t" class="mini-tag-pill">#{{ t }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="category-badge">{{ art.category || '随笔' }}</span>
              </td>
              <td>
                <span :class="['status-glow-pill', art.status === 1 ? 'is-published' : 'is-draft']">
                  <span class="glow-dot"></span>
                  {{ art.status === 1 ? '已公开' : '草稿箱' }}
                </span>
              </td>
              <td>
                <span class="views-count">👁️ {{ art.views || 0 }}</span>
              </td>
              <td class="date-text">
                {{ art.createdAt }}
              </td>
              <td class="text-right">
                <div class="table-actions-group">
                  <button
                    :class="['action-mini-pill', art.status === 1 ? 'btn-offline' : 'btn-publish']"
                    :title="art.status === 1 ? '转为草稿下线' : '立即公开发布'"
                    @click="toggleStatus(art)"
                  >
                    {{ art.status === 1 ? '下线' : '发布' }}
                  </button>
                  <router-link :to="`/admin/articles/edit/${art.id}`" class="action-mini-pill btn-edit">
                    编辑
                  </router-link>
                  <button class="action-mini-pill btn-delete" @click="handleDelete(art)">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页组件 -->
      <Pagination
        :current-page="page"
        :total-pages="totalPages"
        @change="handlePageChange"
      />
    </main>
  </div>
</template>

<style scoped>
.admin-console-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 统一控制台极客顶栏 */
.console-topbar-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem 1.6rem;
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
  position: relative;
  overflow: hidden;
}

.console-topbar-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899);
}

.console-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.console-shield-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.console-brand-text {
  display: flex;
  flex-direction: column;
}

.console-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.console-runtime-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

/* 胶囊导航 Tabs */
.console-nav-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-hover);
  padding: 4px 6px;
  border-radius: 30px;
  border: 1px solid var(--border-color);
}

.console-tab-item {
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 6px 16px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.console-tab-item:hover {
  color: var(--text-main);
}

.console-tab-item.active {
  background: var(--bg-secondary);
  color: var(--accent-color);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.console-tab-item.create-tab {
  color: #10b981;
}

/* 顶栏右侧快捷操作 */
.console-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-user-pill {
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 5px 12px;
  border-radius: 20px;
}

.preview-front-btn, .console-logout-btn {
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.preview-front-btn {
  background: var(--bg-hover);
  color: var(--accent-color);
  border: 1px solid var(--border-color);
}

.preview-front-btn:hover {
  border-color: var(--accent-color);
}

.console-logout-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.console-logout-btn:hover {
  background: #ef4444;
  color: #fff;
}

/* ====================================================
   4 色高光数据指标看板
==================================================== */
.admin-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.admin-stat-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.3rem 1.4rem;
  box-shadow: var(--card-shadow);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.admin-stat-card:hover {
  transform: translateY(-3px);
}

.admin-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.stat-icon { font-size: 1.15rem; }

.stat-tag {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.stat-number {
  font-size: 1.95rem;
  font-weight: 850;
  letter-spacing: -0.5px;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* 各卡片主题色彩 */
.stat-cyan::before { background: linear-gradient(90deg, #06b6d4, #3b82f6); }
.stat-cyan .stat-number {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-emerald::before { background: linear-gradient(90deg, #10b981, #06b6d4); }
.stat-emerald .stat-number {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-amber::before { background: linear-gradient(90deg, #f59e0b, #ea580c); }
.stat-amber .stat-number {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-purple::before { background: linear-gradient(90deg, #8b5cf6, #ec4899); }
.stat-purple .stat-number {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ====================================================
   主管理面板与表格
==================================================== */
.console-main-panel {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.6rem 1.8rem;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-pills-wrap {
  display: flex;
  gap: 6px;
}

.filter-btn-pill {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.84rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn-pill:hover {
  color: var(--text-main);
  border-color: var(--border-hover);
}

.filter-btn-pill.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.search-and-new-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input-box {
  display: flex;
  align-items: center;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0 10px;
  width: 250px;
  transition: border-color 0.2s;
}

.search-input-box:focus-within {
  border-color: var(--accent-color);
}

.search-ico {
  font-size: 0.85rem;
  margin-right: 6px;
  opacity: 0.6;
}

.search-input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.85rem;
  color: var(--text-main);
  padding: 8px 0;
}

.clear-search-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.search-trigger-btn {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 7px 16px;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-trigger-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.create-article-cta {
  text-decoration: none;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: #fff;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 7px 18px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  transition: all 0.2s;
}

.create-article-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

/* 数据表格 */
.table-container {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.modern-admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  text-align: left;
}

.modern-admin-table th {
  background: var(--bg-hover);
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.76rem;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.modern-admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  vertical-align: middle;
}

.table-data-row:hover td {
  background: var(--bg-hover);
}

.title-column-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-art-link {
  text-decoration: none;
  font-weight: 700;
  color: var(--text-main);
  transition: color 0.2s;
}

.table-art-link:hover {
  color: var(--accent-color);
}

.table-tags-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.mini-tag-pill {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.category-badge {
  background: var(--tag-bg);
  color: var(--tag-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-glow-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
}

.glow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.is-published {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.is-published .glow-dot {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.is-draft {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}
.is-draft .glow-dot {
  background: #f59e0b;
}

.views-count {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.date-text {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.text-right { text-align: right; }

.table-actions-group {
  display: inline-flex;
  gap: 6px;
}

.action-mini-pill {
  text-decoration: none;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
  background: var(--bg-hover);
  color: var(--text-main);
}

.action-mini-pill:hover {
  transform: translateY(-1px);
}

.btn-publish {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.btn-offline {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}

.btn-edit {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  border-color: rgba(6, 182, 212, 0.3);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.empty-cell {
  text-align: center;
  padding: 3rem !important;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .admin-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
