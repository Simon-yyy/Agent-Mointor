<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { articleApi } from '../api/articles.js'
import Pagination from '../components/Pagination.vue'

const route = useRoute()

const articles = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(6)
const totalPages = ref(1)
const loading = ref(false)

const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedTag = ref('')

const categories = ref({})
const tags = ref({})

function getCategoryColorClass(cat) {
  if (!cat) return 'tag-cyan'
  if (cat.includes('前端') || cat.includes('Vue')) return 'tag-emerald'
  if (cat.includes('后端') || cat.includes('Java')) return 'tag-amber'
  if (cat.includes('架构') || cat.includes('系统')) return 'tag-violet'
  return 'tag-cyan'
}

function getTagColorClass(tag) {
  if (!tag) return 'tag-cyan'
  const hash = tag.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const classes = ['tag-cyan', 'tag-emerald', 'tag-violet', 'tag-amber', 'tag-rose']
  return classes[hash % classes.length]
}

async function fetchMeta() {
  try {
    const [catRes, tagRes] = await Promise.all([
      articleApi.getCategories().catch(() => ({})),
      articleApi.getTags().catch(() => ({})),
    ])
    categories.value = catRes || {}
    tags.value = tagRes || {}
  } catch (e) {
    console.error('加载分类/标签失败', e)
  }
}

async function loadArticles() {
  loading.value = true
  try {
    const res = await articleApi.getArticles({
      page: page.value,
      size: size.value,
      keyword: searchKeyword.value,
      category: selectedCategory.value,
      tag: selectedTag.value,
    })
    articles.value = res.list || []
    total.value = res.total || 0
    totalPages.value = res.totalPages || 1
  } catch (e) {
    console.error('加载文章列表失败', e)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadArticles()
}

function selectCategory(cat) {
  selectedCategory.value = selectedCategory.value === cat ? '' : cat
  page.value = 1
  loadArticles()
}

function selectTag(tag) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  page.value = 1
  loadArticles()
}

function handlePageChange(p) {
  page.value = p
  loadArticles()
}

function clearFilters() {
  searchKeyword.value = ''
  selectedCategory.value = ''
  selectedTag.value = ''
  page.value = 1
  loadArticles()
}

onMounted(() => {
  if (route.query.tag) selectedTag.value = route.query.tag
  if (route.query.category) selectedCategory.value = route.query.category
  fetchMeta()
  loadArticles()
})
</script>

<template>
  <div class="articles-page">
    <!-- 头部极简横幅与搜索 -->
    <div class="articles-top-banner">
      <div class="banner-title-wrap">
        <h1 class="page-title">全部手记</h1>
        <p class="page-desc">平时记录的排错日志、架构笔记与折腾心得（共 {{ total }} 篇）</p>
      </div>

      <div class="search-form-wrap">
        <div class="search-input-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索文章标题或关键词..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''; handleSearch()">✕</button>
        </div>
      </div>
    </div>

    <!-- 极简分类过滤条（去厚重底框） -->
    <div class="filter-pure-bar">
      <div class="categories-list">
        <button
          :class="['category-pure-btn', { active: !selectedCategory }]"
          @click="selectCategory('')"
        >
          全部 ({{ total }})
        </button>
        <button
          v-for="(count, cat) in categories"
          :key="cat"
          :class="['category-pure-btn', { active: selectedCategory === cat }]"
          @click="selectCategory(cat)"
        >
          {{ cat }} <span class="badge-num">({{ count }})</span>
        </button>
      </div>

      <div v-if="selectedCategory || selectedTag || searchKeyword" class="filter-reset-wrap">
        <span v-if="selectedCategory" class="filter-chip">分类: {{ selectedCategory }}</span>
        <span v-if="selectedTag" class="filter-chip">标签: {{ selectedTag }}</span>
        <span v-if="searchKeyword" class="filter-chip">搜索: {{ searchKeyword }}</span>
        <button class="btn-clear-link" @click="clearFilters">清空过滤</button>
      </div>
    </div>

    <!-- 文章骨架屏 -->
    <div v-if="loading" class="articles-skeleton-list">
      <div class="skeleton-card-row" v-for="i in 3" :key="i"></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="articles.length === 0" class="empty-state-box">
      <p class="empty-title">未找到相关手记</p>
      <button class="btn-reset-filters" @click="clearFilters">查看全部手记</button>
    </div>

    <!-- 极简高信噪比文章列表 -->
    <div v-else class="refined-articles-stream">
      <article v-for="item in articles" :key="item.id" class="stream-article-item">
        <div class="item-main-row">
          <h2 class="stream-item-title">
            <router-link :to="`/articles/${item.id}`">{{ item.title }}</router-link>
          </h2>
          <div class="stream-item-meta">
            <span class="stream-date">{{ (item.createdAt || '').slice(0, 10) }}</span>
            <span class="stream-cat" v-if="item.category">{{ item.category }}</span>
          </div>
        </div>

        <p class="stream-item-summary">{{ item.summary }}</p>
      </article>
    </div>

    <!-- 分页器 -->
    <Pagination
      :current-page="page"
      :total-pages="totalPages"
      @change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.articles-page {
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
}

.articles-top-banner {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1.5rem;
}

.banner-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banner-sub {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--accent-color);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 850;
  letter-spacing: -0.5px;
}

.page-desc {
  color: var(--text-muted);
  font-size: 0.96rem;
}

/* 搜索框 */
.search-form-wrap {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

.search-input-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0 12px;
  width: 100%;
  max-width: 320px;
}

.search-icon {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 0.88rem;
  padding: 8px 0;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 2px 4px;
}

/* 极简分类过滤条 */
.filter-pure-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.categories-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.category-pure-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.86rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.category-pure-btn:hover {
  color: var(--text-main);
  background: var(--bg-hover);
}

.category-pure-btn.active {
  background: var(--bg-hover);
  color: var(--text-main);
  font-weight: 600;
  border-color: var(--border-color);
}

.badge-num {
  font-size: 0.76rem;
  opacity: 0.75;
}

.filter-reset-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-chip {
  font-size: 0.78rem;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 2px 8px;
  border-radius: 4px;
}

.btn-clear-link {
  background: none;
  border: none;
  color: var(--accent-color);
  font-size: 0.82rem;
  cursor: pointer;
  text-decoration: underline;
}

/* 极简文章流列表 */
.refined-articles-stream {
  display: flex;
  flex-direction: column;
}

.stream-article-item {
  padding: 1.4rem 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.stream-article-item:first-child {
  padding-top: 0.25rem;
}

.stream-article-item:last-child {
  border-bottom: none;
}

.item-main-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}

.stream-item-title {
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.45;
  margin: 0;
  flex: 1;
}

.stream-item-title a {
  text-decoration: none;
  color: var(--text-main);
  transition: color 0.15s ease;
}

.stream-item-title a:hover {
  color: var(--accent-color);
}

.stream-item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.stream-date {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.stream-cat {
  font-size: 0.76rem;
  background: var(--bg-hover);
  color: var(--text-muted);
  padding: 1px 6px;
  border-radius: 4px;
}

.stream-item-summary {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 骨架屏与空状态 */
.articles-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-card-row {
  height: 80px;
  background: var(--bg-hover);
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

.empty-state-box {
  text-align: center;
  padding: 3.5rem 1rem;
  background: var(--bg-hover);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.8rem;
}

.btn-reset-filters {
  background: var(--accent-color);
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}

@media (max-width: 680px) {
  .article-glass-card {
    flex-direction: column;
  }
  .card-cover-side {
    width: 100%;
    height: 160px;
  }
}
</style>
