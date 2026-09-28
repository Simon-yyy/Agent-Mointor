<script setup>
import { ref, computed, onMounted } from 'vue'
import { workApi } from '../api/works.js'

const works = ref([])
const loading = ref(true)
const activeTechFilter = ref('')

async function loadWorks() {
  loading.value = true
  try {
    const list = await workApi.getWorks()
    works.value = list || []
  } catch (e) {
    console.error('加载作品列表异常', e)
  } finally {
    loading.value = false
  }
}

// 提取全部可用技术栈列表
const allTechs = computed(() => {
  const set = new Set()
  works.value.forEach((w) => {
    ;(w.techStack || []).forEach((t) => set.add(t))
  })
  return Array.from(set)
})

const filteredWorks = computed(() => {
  if (!activeTechFilter.value) return works.value
  return works.value.filter((w) =>
    (w.techStack || []).some((t) => t.toLowerCase() === activeTechFilter.value.toLowerCase())
  )
})

function getTagColorClass(tag) {
  if (!tag) return 'tag-cyan'
  const hash = tag.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const classes = ['tag-cyan', 'tag-emerald', 'tag-violet', 'tag-amber', 'tag-rose']
  return classes[hash % classes.length]
}

onMounted(() => {
  loadWorks()
})
</script>

<template>
  <div class="works-page">
    <!-- 头部介绍 -->
    <div class="works-header-banner">
      <div class="header-texts">
        <h1 class="page-title">开源与作品</h1>
        <p class="page-desc">
          平时折腾的一些独立工具、小脚本与实战 Demo。
        </p>
      </div>

      <!-- 技术栈过滤胶囊 -->
      <div v-if="allTechs.length > 0" class="tech-filter-bar">
        <button
          :class="['filter-pill', { active: !activeTechFilter }]"
          @click="activeTechFilter = ''"
        >
          全部 ({{ works.length }})
        </button>
        <button
          v-for="tech in allTechs"
          :key="tech"
          :class="['filter-pill', { active: activeTechFilter === tech }]"
          @click="activeTechFilter = activeTechFilter === tech ? '' : tech"
        >
          {{ tech }}
        </button>
      </div>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="works-skeleton-grid">
      <div class="skeleton-card-item" v-for="i in 3" :key="i"></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredWorks.length === 0" class="empty-gallery-box">
      <div class="empty-icon-box">📦</div>
      <h3>暂未检索到相关项目</h3>
      <button class="reset-tech-btn" @click="activeTechFilter = ''">查看全部项目</button>
    </div>

    <!-- 作品网格 -->
    <div v-else class="works-card-grid">
      <div v-for="work in filteredWorks" :key="work.id" class="project-clean-card">
        <div class="card-details-box">
          <div class="project-header-row">
            <h2 class="project-title">{{ work.title }}</h2>
          </div>
          <p class="project-narrative">{{ work.description }}</p>

          <div class="tech-chips-wrapper" v-if="work.techStack && work.techStack.length > 0">
            <span v-for="t in work.techStack" :key="t" class="tech-tag-chip">
              {{ t }}
            </span>
          </div>

          <div class="project-action-buttons">
            <a v-if="work.demoUrl" :href="work.demoUrl" target="_blank" class="action-btn-demo">
              在线预览 ↗
            </a>
            <a v-if="work.githubUrl" :href="work.githubUrl" target="_blank" class="action-btn-github">
              GitHub 源码
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.works-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.works-header-banner {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1.6rem;
}

.header-texts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-kicker {
  font-size: 0.72rem;
  font-weight: 850;
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
  font-size: 0.98rem;
  max-width: 680px;
}

.tech-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-pill {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill:hover {
  color: var(--text-main);
  border-color: var(--border-hover);
}

.filter-pill.active {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}

/* 作品网格 */
.works-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.project-clean-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.project-clean-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.project-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-arrow {
  color: var(--text-muted);
  font-size: 0.9rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.project-clean-card:hover .project-arrow {
  transform: translate(2px, -2px);
  color: var(--accent-color);
}

.card-details-box {
  padding: 1.3rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.75rem;
}

.project-title {
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.project-narrative {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.tech-chips-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-tag-chip {
  font-size: 0.74rem;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--bg-hover);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.project-action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 0.25rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-color);
}

.action-btn-demo, .action-btn-github {
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
}

.action-btn-demo {
  color: var(--accent-color);
  font-weight: 600;
}

.action-btn-demo:hover {
  text-decoration: underline;
}

.action-btn-github {
  color: var(--text-muted);
}

.action-btn-github:hover {
  color: var(--text-main);
}

/* 骨架屏与空状态 */
.works-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 2rem;
}

.skeleton-card-item {
  height: 320px;
  background: var(--bg-hover);
  border-radius: 18px;
  animation: pulse 1.5s infinite;
}

.empty-gallery-box {
  text-align: center;
  padding: 4rem;
  background: var(--bg-card);
  border-radius: 18px;
  border: 1px dashed var(--border-color);
}

.empty-icon-box {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.reset-tech-btn {
  margin-top: 1rem;
  padding: 8px 18px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}
</style>
