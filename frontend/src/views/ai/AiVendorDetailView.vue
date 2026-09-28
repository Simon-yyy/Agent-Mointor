<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { aiApi } from '../../api/ai.js'

const route = useRoute()
const router = useRouter()

const vendor = ref(null)
const models = ref([])
const events = ref([])
const eventsTotal = ref(0)
const officialUpdates = ref([])
const officialUpdatesTotal = ref(0)
const loading = ref(true)
const errorMsg = ref('')

async function loadDetail() {
  const slug = route.params.slug
  if (!slug) return
  loading.value = true
  errorMsg.value = ''
  try {
    const v = await aiApi.getVendorDetail(slug)
    vendor.value = v
    if (v && v.id) {
      const [modelsRes, eventsRes, updatesRes] = await Promise.all([
        aiApi.getModels({ vendorId: v.id }),
        aiApi.getEvents({ vendor: slug, size: 50 }),
        aiApi.getOfficialUpdates({ vendorId: v.id, size: 30 }).catch(() => ({ list: [], total: 0 })),
      ])
      models.value = modelsRes || []
      events.value = eventsRes.list || []
      eventsTotal.value = eventsRes.total !== undefined ? eventsRes.total : (events.value.length)
      officialUpdates.value = updatesRes.list || []
      officialUpdatesTotal.value = updatesRes.total !== undefined ? updatesRes.total : (officialUpdates.value.length)
    }
  } catch (e) {
    console.error('加载厂商详情失败', e)
    errorMsg.value = e.message || '加载厂商档案详情失败，请检查网络或后端服务'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="vendor-detail-page">
    <!-- 加载中状态 -->
    <div v-if="loading" class="detail-loading-box">
      <div class="loading-pulse-line"></div>
      <p>正在同步厂商全景档案与官方动态数据...</p>
    </div>

    <!-- 错误重试状态 -->
    <div v-else-if="errorMsg" class="detail-error-box">
      <p class="err-tip">{{ errorMsg }}</p>
      <button class="retry-btn" @click="loadDetail">重新加载</button>
    </div>

    <!-- 厂商详情正文 -->
    <div v-else-if="vendor" class="vendor-content-flow">
      <!-- 头部返回与厂商识别栏 -->
      <div class="detail-header-card" :style="{ '--brand-color': vendor.brandColor || '#3b82f6' }">
        <button class="back-link-btn font-mono" @click="router.back()">← 返回厂商列表</button>
        <div class="vendor-hero-row">
          <div class="vendor-badge-icon font-mono">
            {{ vendor.name.slice(0, 2).toUpperCase() }}
          </div>
          <div class="vendor-meta-main">
            <div class="name-row">
              <h1 class="vendor-name">{{ vendor.name }}</h1>
              <span class="region-badge">{{ vendor.region }}</span>
            </div>
            <p class="vendor-slug font-mono">SLUG: {{ vendor.slug }}</p>
          </div>

          <a
            v-if="vendor.websiteUrl"
            :href="vendor.websiteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="vendor-site-btn font-mono"
          >
            访问官方发布来源 ↗
          </a>
        </div>
      </div>

      <!-- 该厂商的模型档案 -->
      <section class="section-block">
        <div class="sub-heading-wrap">
          <h2 class="sub-heading">旗下收录大模型 ({{ models.length }})</h2>
          <span class="sub-heading-note">已建档的基准模型与衍生版本</span>
        </div>
        <div v-if="models.length === 0" class="empty-hint">暂未收录该厂商的独立大模型档案</div>
        <div v-else class="models-grid">
          <router-link
            v-for="m in models"
            :key="m.id"
            :to="`/models/${m.id}`"
            class="model-chip-card"
          >
            <div class="model-head-line">
              <h3 class="model-name-text">{{ m.displayName }}</h3>
              <span class="avail-badge font-mono">{{ m.availabilityStatus }}</span>
            </div>
            <div class="model-meta-info font-mono">
              <span>系列: {{ m.series || '通用' }}</span>
              <span>·</span>
              <span>模态: {{ m.modalities || '多模态' }}</span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- 已核实模型发布里程碑 -->
      <section class="section-block">
        <div class="sub-heading-wrap">
          <h2 class="sub-heading">已核实模型发布里程碑 ({{ eventsTotal }})</h2>
          <span class="sub-heading-note">经官方存证核实的人工确认模型演进事件</span>
        </div>
        <div v-if="events.length === 0" class="empty-hint">暂无已确认的模型里程碑事件</div>
        <div v-else class="vendor-events-list">
          <div v-for="ev in events" :key="ev.id" class="vendor-event-row">
            <div class="ev-date-side font-mono">
              {{ ev.releaseDate || (ev.firstSeenAt ? ev.firstSeenAt.slice(0, 10) : '未记录') }}
            </div>
            <div class="ev-main-side">
              <h3 class="ev-title">{{ ev.modelName }} · {{ ev.stage || '发布' }}</h3>
              <p class="ev-summary">{{ ev.summary }}</p>
              <div class="ev-evidences" v-if="ev.evidences && ev.evidences.length > 0">
                <a
                  v-for="evi in ev.evidences"
                  :key="evi.id"
                  :href="evi.officialUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="evidence-link"
                >
                  🔗 官方存证: {{ evi.title || evi.officialUrl }} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 该厂商官方原厂动态与文章流 -->
      <section class="section-block">
        <div class="sub-heading-wrap">
          <h2 class="sub-heading">官方原厂最新动态与公告 ({{ officialUpdatesTotal }})</h2>
          <span class="sub-heading-note">来自厂商官方博客、新闻稿或模型卡源的直达资讯流</span>
        </div>
        <div v-if="officialUpdates.length === 0" class="empty-hint">
          暂未检索到该厂商的官方动态抓取记录
        </div>
        <div v-else class="vendor-updates-grid">
          <article
            v-for="item in officialUpdates"
            :key="item.id"
            class="update-card"
          >
            <div class="update-meta-row font-mono">
              <span class="update-date">{{ item.publishedAt || item.firstSeenAt?.slice(0, 10) || '日期待核实' }}</span>
              <span class="update-cat-badge">{{ item.categoryName || '官方资讯' }}</span>
            </div>
            <h4 class="update-title">
              <a
                :href="item.canonicalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="update-link"
              >
                {{ item.title }} ↗
              </a>
            </h4>
            <p class="update-summary-zh">
              {{ (item.summaryZh && item.summaryZh.trim()) ? item.summaryZh : '官方摘要整理中，详情以原厂公告原文为准。' }}
            </p>
            <div class="update-footer">
              <span class="vendor-tag font-mono">来源: {{ vendor.name }}</span>
              <a
                :href="item.canonicalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="read-source-btn font-mono"
              >
                阅读官方原文
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.vendor-detail-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.detail-header-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--brand-color);
  border-radius: 8px;
  padding: 1.5rem 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.back-link-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  width: fit-content;
  font-size: 0.82rem;
  padding: 0;
}

.back-link-btn:hover {
  color: var(--text-main);
  text-decoration: underline;
}

.vendor-hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.vendor-badge-icon {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  background: var(--bg-hover);
  border: 1px solid var(--brand-color);
  color: var(--brand-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 850;
}

.vendor-meta-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vendor-name {
  font-size: 1.6rem;
  font-weight: 850;
  margin: 0;
}

.region-badge {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.74rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.vendor-slug {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.vendor-site-btn {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--accent-color);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: 6px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sub-heading {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.model-chip-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.15s ease;
}

.model-chip-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.model-head-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.model-name-text {
  font-size: 1.05rem;
  font-weight: 750;
  color: var(--text-main);
  margin: 0;
}

.avail-badge {
  font-size: 0.7rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 1px 6px;
  border-radius: 3px;
}

.model-meta-info {
  display: flex;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* 事件列表 */
.vendor-events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vendor-event-row {
  display: flex;
  gap: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1.2rem;
}

.ev-date-side {
  min-width: 100px;
  font-size: 0.85rem;
  color: var(--accent-color);
  font-weight: 700;
}

.ev-main-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ev-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.ev-summary {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

.ev-evidences {
  margin-top: 4px;
}

.evidence-link {
  font-size: 0.8rem;
  color: var(--accent-color);
  text-decoration: underline;
}

.empty-hint {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  background: var(--bg-hover);
  border-radius: 6px;
}

.sub-heading-wrap {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.sub-heading-note {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.vendor-updates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.update-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.8rem;
  transition: all 0.2s ease;
}

.update-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.update-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
}

.update-date {
  color: var(--accent-color);
  font-weight: 700;
}

.update-cat-badge {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-muted);
}

.update-title {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.45;
  font-weight: 650;
}

.update-link {
  color: var(--text-main);
  text-decoration: none;
}

.update-link:hover {
  color: var(--accent-color);
}

.update-summary-zh {
  font-size: 0.84rem;
  line-height: 1.55;
  color: var(--text-muted);
  margin: 0.5rem 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.update-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  border-top: 1px dashed var(--border-color);
  padding-top: 0.6rem;
}

.vendor-tag {
  color: var(--text-muted);
}

.read-source-btn {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
}

.read-source-btn:hover {
  text-decoration: underline;
}

.detail-loading-box,
.detail-error-box {
  padding: 4rem 2rem;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.loading-pulse-line {
  width: 120px;
  height: 4px;
  background: var(--accent-color);
  margin: 0 auto 1.5rem;
  border-radius: 2px;
  animation: pulse-width 1.5s infinite ease-in-out;
}

@keyframes pulse-width {
  0% { transform: scaleX(0.4); opacity: 0.5; }
  50% { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(0.4); opacity: 0.5; }
}

.retry-btn {
  margin-top: 1rem;
  padding: 6px 16px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
