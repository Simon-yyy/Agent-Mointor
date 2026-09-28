<script setup>
import { ref, onMounted } from 'vue'
import { articleApi } from '../api/articles.js'
import { workApi } from '../api/works.js'

const recentArticles = ref([])
const featuredWorks = ref([])
const loading = ref(true)

function getCategoryColorClass(cat) {
  if (!cat) return 'tag-neutral'
  if (cat.includes('前端') || cat.includes('Vue')) return 'tag-emerald'
  if (cat.includes('后端') || cat.includes('Java')) return 'tag-amber'
  if (cat.includes('架构') || cat.includes('系统')) return 'tag-blue'
  return 'tag-neutral'
}

onMounted(async () => {
  try {
    const [articles, works] = await Promise.all([
      articleApi.getRecentArticles(5).catch(() => []),
      workApi.getWorks().catch(() => []),
    ])
    recentArticles.value = articles || []
    featuredWorks.value = (works || []).slice(0, 3)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home-page">
    <!-- 1. 清爽个人主页 Hero -->
    <section class="profile-hero">
      <div class="hero-content">
        <h1 class="hero-title">Simon</h1>
        <p class="hero-subline">写写后端与前端</p>
        <p class="hero-desc">
          平时在这里记点排错笔记、技术折腾手记与零碎心得，也放几个自己做的小工具。偏爱简单、克制且长久可用的软件设计。
        </p>
        <div class="hero-quick-nav">
          <router-link to="/articles" class="quick-link">全部文章 →</router-link>
          <router-link to="/works" class="quick-link">开源与作品 →</router-link>
          <router-link to="/archives" class="quick-link">归档 →</router-link>
          <a href="https://github.com" target="_blank" class="quick-link ext">GitHub ↗</a>
        </div>
      </div>
    </section>

    <!-- 2. 精选小项目展示 -->
    <section class="section-block" v-if="featuredWorks.length > 0 || loading">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">开源与作品</h2>
          <span class="section-subtitle">平时折腾的一些小项目与工具</span>
        </div>
        <router-link to="/works" class="section-more">全部作品 →</router-link>
      </div>

      <div v-if="loading" class="works-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>

      <div v-else class="works-grid">
        <div v-for="work in featuredWorks" :key="work.id" class="work-card">
          <div class="work-header-row">
            <h3 class="work-name">{{ work.title }}</h3>
          </div>
          <p class="work-summary">{{ work.description }}</p>
          <div class="work-tags" v-if="work.techStack && work.techStack.length > 0">
            <span v-for="tag in work.techStack" :key="tag" class="tech-tag">
              {{ tag }}
            </span>
          </div>
          <div class="work-actions">
            <a v-if="work.demoUrl" :href="work.demoUrl" target="_blank" class="work-btn-link primary">
              在线预览 ↗
            </a>
            <a v-if="work.githubUrl" :href="work.githubUrl" target="_blank" class="work-btn-link">
              GitHub 源码
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. 最新文章列表 -->
    <section class="section-block">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">最新手记</h2>
          <span class="section-subtitle">近期整理的踩坑记录与随笔</span>
        </div>
        <router-link to="/articles" class="section-more">查看全部 →</router-link>
      </div>

      <div v-if="loading" class="article-skeleton-list">
        <div v-for="i in 3" :key="i" class="article-skeleton-row"></div>
      </div>

      <div v-else-if="recentArticles.length > 0" class="articles-clean-list">
        <article v-for="art in recentArticles" :key="art.id" class="article-item">
          <div class="article-item-header">
            <h3 class="article-title">
              <router-link :to="`/articles/${art.id}`">{{ art.title }}</router-link>
            </h3>
            <div class="article-meta-side">
              <span class="meta-date">{{ (art.createdAt || '').slice(0, 10) }}</span>
              <span class="meta-cat" v-if="art.category">{{ art.category }}</span>
            </div>
          </div>

          <p class="article-summary">{{ art.summary }}</p>
        </article>
      </div>

      <div v-else class="empty-hint">
        暂无文章，写点什么吧。
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

/* 1. Profile Hero (极简纯文字风格) */
.profile-hero {
  padding: 1.5rem 0 2rem;
  border-bottom: 1px solid var(--border-color);
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.hero-title {
  font-size: 2.3rem;
  font-weight: 850;
  letter-spacing: -0.04em;
  color: var(--text-main);
  margin: 0;
}

.hero-subline {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--accent-color);
  margin: -4px 0 0;
}

.hero-desc {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.75;
  max-width: 820px;
  margin: 0;
}

.hero-quick-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.quick-link {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.quick-link:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

.quick-link.ext {
  opacity: 0.85;
}

/* 通用板块标题栏 */
.section-block {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.85rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-main);
  margin: 0;
}

.section-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.section-more {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.2s;
}

.section-more:hover {
  text-decoration: underline;
}

/* 2. 精选项目卡片网格 (纯净 GitHub Repo 风格) */
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.work-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.work-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.work-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-name {
  font-size: 1.08rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.work-ext-icon {
  color: var(--text-muted);
  font-size: 0.9rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.work-card:hover .work-ext-icon {
  transform: translate(2px, -2px);
  color: var(--accent-color);
}

.work-summary {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-tag {
  font-size: 0.74rem;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--bg-hover);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.work-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 0.25rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-color);
}

.work-btn-link {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.work-btn-link:hover {
  color: var(--text-main);
}

.work-btn-link.primary {
  color: var(--accent-color);
  font-weight: 600;
}

/* 3. 文章列表排版 (极简高信噪比) */
.articles-clean-list {
  display: flex;
  flex-direction: column;
}

.article-item {
  padding: 1.35rem 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.article-item:first-child {
  padding-top: 0.25rem;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}

.article-title {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.45;
  margin: 0;
  flex: 1;
}

.article-title a {
  color: var(--text-main);
  text-decoration: none;
  transition: color 0.15s ease;
}

.article-title a:hover {
  color: var(--accent-color);
}

.article-meta-side {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.meta-date {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.meta-cat {
  font-size: 0.76rem;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 1px 6px;
  border-radius: 4px;
}

.article-summary {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}



.empty-hint {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border: 1px dashed var(--border-color);
  border-radius: 10px;
}

/* 骨架屏 */
.skeleton-card, .article-skeleton-row {
  background: var(--bg-hover);
  border-radius: 10px;
  animation: pulse 1.5s infinite;
}

.skeleton-card {
  height: 220px;
}

.article-skeleton-row {
  height: 100px;
  margin-bottom: 1rem;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

@media (max-width: 680px) {
  .profile-hero {
    flex-direction: column;
    gap: 1rem;
  }
  .hero-title {
    font-size: 1.5rem;
  }
}
</style>
