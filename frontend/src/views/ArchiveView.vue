<script setup>
import { ref, onMounted, computed } from 'vue'
import { articleApi } from '../api/articles.js'

const archives = ref({})
const loading = ref(true)

const totalCount = computed(() => {
  let count = 0
  for (const year in archives.value) {
    count += (archives.value[year] || []).length
  }
  return count
})

async function loadArchives() {
  loading.value = true
  try {
    const res = await articleApi.getArchives()
    archives.value = res || {}
  } catch (e) {
    console.error('加载归档异常', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArchives()
})
</script>

<template>
  <div class="archive-page">
    <div class="archive-header">
      <h1 class="page-title">时间线归档</h1>
      <p class="page-desc">历史博文时间轴，共收录 {{ totalCount }} 篇技术印记</p>
    </div>

    <div v-if="loading" class="archive-loading">
      <div class="skeleton-timeline" v-for="i in 3" :key="i"></div>
    </div>

    <div v-else-if="Object.keys(archives).length === 0" class="empty-archive">
      <p>暂无归档文章</p>
    </div>

    <div v-else class="timeline-container">
      <div v-for="(list, year) in archives" :key="year" class="year-block">
        <div class="year-heading">
          <span class="year-badge">{{ year }}</span>
          <span class="year-count">共 {{ list.length }} 篇</span>
        </div>

        <ul class="timeline-list">
          <li v-for="art in list" :key="art.id" class="timeline-item">
            <span class="timeline-dot"></span>
            <span class="timeline-date">{{ art.createdAt ? art.createdAt.substring(5, 10) : '' }}</span>
            <router-link :to="`/articles/${art.id}`" class="timeline-title">
              {{ art.title }}
            </router-link>
            <span v-if="art.category" class="timeline-cat">[{{ art.category }}]</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.archive-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1.25rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.page-desc {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 4px;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.year-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.year-heading {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.year-badge {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.year-count {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.timeline-list {
  list-style: none;
  border-left: 2px solid var(--border-color);
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-left: 0.75rem;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.timeline-dot {
  position: absolute;
  left: calc(-1.5rem - 6px);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-color);
  border: 2px solid var(--bg-primary);
}

.timeline-date {
  font-size: 0.88rem;
  color: var(--text-muted);
  font-family: monospace;
}

.timeline-title {
  text-decoration: none;
  font-size: 1rem;
  color: var(--text-main);
  font-weight: 600;
  transition: color 0.2s;
}

.timeline-title:hover {
  color: var(--accent-color);
}

.timeline-cat {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.skeleton-timeline {
  height: 80px;
  background: var(--bg-hover);
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}
</style>
