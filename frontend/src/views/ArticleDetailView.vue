<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi } from '../api/articles.js'
import { renderMarkdown, calculateReadingStats, extractHeadings } from '../utils/markdown.js'

const route = useRoute()
const router = useRouter()

const article = ref(null)
const loading = ref(true)
const error = ref(null)
const activeHeadingId = ref('')
const showBackToTop = ref(false)

const renderedContent = computed(() => {
  if (!article.value || !article.value.contentMd) return ''
  return renderMarkdown(article.value.contentMd)
})

const stats = computed(() => {
  if (!article.value || !article.value.contentMd) return { words: 0, readMinutes: 1 }
  return calculateReadingStats(article.value.contentMd)
})

const headings = computed(() => {
  if (!article.value || !article.value.contentMd) return []
  return extractHeadings(article.value.contentMd)
})

function scrollToHeading(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    activeHeadingId.value = id
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  showBackToTop.value = scrollTop > 300

  // 监听当前视口中的活跃标题
  if (headings.value.length === 0) return
  for (let i = headings.value.length - 1; i >= 0; i--) {
    const h = headings.value[i]
    const el = document.getElementById(h.id)
    if (el) {
      const top = el.getBoundingClientRect().top
      if (top <= 120) {
        activeHeadingId.value = h.id
        break
      }
    }
  }
}

async function fetchDetail() {
  const id = route.params.id
  if (!id) {
    error.value = '未指定文章 ID'
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await articleApi.getArticleDetail(id)
    article.value = res
  } catch (err) {
    error.value = err.message || '获取文章详情失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="article-detail-view">
    <!-- 顶部导航条 -->
    <div class="top-nav-bar">
      <button class="back-btn" @click="router.back()">
        ← 返回上一页
      </button>
      <div class="breadcrumb-trail">
        <router-link to="/">首页</router-link>
        <span class="trail-sep">/</span>
        <router-link to="/articles">文章列表</router-link>
        <span class="trail-sep">/</span>
        <span class="trail-current">{{ article ? article.title : '正文' }}</span>
      </div>
    </div>

    <!-- 加载与错误状态 -->
    <div v-if="loading" class="detail-loading-box">
      <div class="skeleton-header-box"></div>
      <div class="skeleton-body-box" v-for="i in 4" :key="i"></div>
    </div>

    <div v-else-if="error" class="detail-error-box">
      <div class="error-emoji">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <button class="btn-retry" @click="fetchDetail">重新加载</button>
    </div>

    <!-- 正文双栏布局容器 -->
    <div v-else-if="article" class="detail-layout-grid">
      <!-- 左侧主文章区 -->
      <article class="article-main-card">
        <!-- 封面大图 -->
        <div v-if="article.coverUrl" class="detail-hero-cover">
          <img :src="article.coverUrl" :alt="article.title" />
        </div>

        <!-- 头部元信息 -->
        <header class="post-header">
          <div class="post-meta-clean">
            <span class="post-date">{{ (article.createdAt || '').slice(0, 10) }}</span>
            <span class="meta-dot">·</span>
            <span class="post-read-time">约 {{ stats.readMinutes }} 分钟阅读</span>
            <span class="meta-dot">·</span>
            <span class="post-views">{{ article.views || 0 }} 次阅读</span>
            <span class="meta-dot" v-if="article.category">·</span>
            <span class="post-cat" v-if="article.category">{{ article.category }}</span>
          </div>

          <h1 class="post-title">{{ article.title }}</h1>

          <p v-if="article.summary" class="post-summary-quote">
            {{ article.summary }}
          </p>
        </header>

        <div class="post-divider"></div>

        <!-- Markdown 正文 -->
        <div class="markdown-body" v-html="renderedContent"></div>

        <!-- 底部版权与声明 -->
        <footer class="post-footer">
          <div class="copyright-card">
            <p class="copyright-text">
              许可协议：<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a>，转载请保留出处。
            </p>
          </div>
        </footer>
      </article>

      <!-- 右侧悬浮文章目录大纲树 (TOC) -->
      <aside class="article-toc-aside">
        <div class="toc-sticky-card">
          <div class="toc-title">
            <span>目录</span>
          </div>

          <div v-if="headings.length === 0" class="toc-empty">
            当前文章未包含子标题
          </div>

          <nav v-else class="toc-nav-list">
            <a
              v-for="h in headings"
              :key="h.id"
              :href="`#${h.id}`"
              :class="[
                'toc-link',
                `level-${h.level}`,
                { active: activeHeadingId === h.id }
              ]"
              @click.prevent="scrollToHeading(h.id)"
            >
              {{ h.text }}
            </a>
          </nav>

          <div class="toc-quick-actions">
            <button class="quick-top-btn" @click="scrollToTop">
              ↑ 回到顶部
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- 浮动返回顶部按钮 -->
    <transition name="fade">
      <button
        v-if="showBackToTop"
        class="floating-back-top"
        title="回到页面顶部"
        @click="scrollToTop"
      >
        ▲
      </button>
    </transition>
  </div>
</template>

<style scoped>
.article-detail-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.breadcrumb-trail {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb-trail a {
  color: var(--text-muted);
  text-decoration: none;
}

.breadcrumb-trail a:hover {
  color: var(--accent-color);
}

.trail-sep {
  opacity: 0.5;
}

.trail-current {
  color: var(--text-main);
  font-weight: 600;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 双栏主网格 */
.detail-layout-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  align-items: start;
}

/* 主文章卡片 */
.article-main-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2.8rem 3rem;
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.detail-hero-cover {
  width: 100%;
  max-height: 400px;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 2.2rem;
  box-shadow: var(--card-shadow);
}

.detail-hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-header {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.post-meta-clean {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--text-muted);
}

.post-date {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.meta-dot {
  color: var(--border-color);
}

.post-cat {
  background: var(--bg-hover);
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 0.78rem;
}

.post-title {
  font-size: 2.4rem;
  font-weight: 850;
  line-height: 1.3;
  letter-spacing: -0.6px;
  color: var(--text-main);
}

.post-summary-quote {
  font-size: 1.05rem;
  color: var(--text-muted);
  line-height: 1.7;
  padding: 14px 18px;
  background: var(--bg-hover);
  border-left: 4px solid var(--accent-color);
  border-radius: 0 10px 10px 0;
  position: relative;
}

.summary-quote-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--accent-color);
  background: var(--tag-bg);
  padding: 1px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

.post-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-tag-item {
  text-decoration: none;
  font-size: 0.82rem;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 3px 12px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.post-tag-item:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
  background: var(--tag-bg);
}

.post-divider {
  height: 1px;
  background: var(--border-color);
  margin: 2.2rem 0 2rem;
}

.post-footer {
  margin-top: 3.5rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1.8rem;
}

.copyright-card {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  font-size: 0.88rem;
}

.copyright-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.copyright-text {
  color: var(--text-muted);
  line-height: 1.6;
}

.copyright-text a {
  color: var(--accent-color);
}

/* 右侧 TOC 侧边栏 */
.article-toc-aside {
  position: sticky;
  top: 90px;
}

.toc-sticky-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.4rem;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.toc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.toc-empty {
  font-size: 0.82rem;
  color: var(--text-muted);
  padding: 8px 0;
}

.toc-nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-link {
  text-decoration: none;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-link.level-1 { font-weight: 700; }
.toc-link.level-2 { padding-left: 18px; }
.toc-link.level-3 { padding-left: 28px; font-size: 0.8rem; }
.toc-link.level-4 { padding-left: 36px; font-size: 0.78rem; }

.toc-link:hover {
  color: var(--text-main);
  background: var(--bg-hover);
}

.toc-link.active {
  color: var(--accent-color);
  background: var(--tag-bg);
  font-weight: 700;
}

.toc-quick-actions {
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
}

.quick-top-btn {
  width: 100%;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-top-btn:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

/* 浮动回到顶部 */
.floating-back-top {
  position: fixed;
  bottom: 35px;
  right: 35px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent-color);
  color: #fff;
  border: none;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  transition: transform 0.2s, background 0.2s;
}

.floating-back-top:hover {
  transform: translateY(-3px);
  background: var(--accent-hover);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 骨架 */
.detail-loading-box {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.skeleton-header-box {
  height: 160px;
  background: var(--bg-hover);
  border-radius: 20px;
  animation: pulse 1.5s infinite;
}
.skeleton-body-box {
  height: 90px;
  background: var(--bg-hover);
  border-radius: 12px;
  animation: pulse 1.5s infinite;
}

.detail-error-box {
  text-align: center;
  padding: 4rem;
  background: var(--bg-card);
  border-radius: 20px;
  border: 1px solid var(--border-color);
}
.error-emoji { font-size: 2.5rem; margin-bottom: 0.5rem; }
.btn-retry {
  margin-top: 1rem;
  padding: 8px 20px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 960px) {
  .detail-layout-grid {
    grid-template-columns: 1fr;
  }
  .article-toc-aside {
    display: none;
  }
  .article-main-card {
    padding: 1.8rem 1.4rem;
  }
  .post-title {
    font-size: 1.8rem;
  }
}
</style>
