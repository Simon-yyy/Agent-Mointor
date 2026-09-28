<script setup>
import { ref, onMounted, computed } from 'vue'
import { aiApi } from '../../api/ai.js'

const events = ref([])
const loading = ref(true)
const errorMsg = ref('')
const collapsedMonths = ref(new Set())

async function loadTimeline() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await aiApi.getTimeline()
    events.value = res || []
  } catch (e) {
    console.error('加载时间线失败', e)
    errorMsg.value = e.message || '加载全球演进时间线失败，请检查网络或后端服务'
  } finally {
    loading.value = false
  }
}

// 按 YYYY-MM 格式分组
const timelineGroups = computed(() => {
  const groups = {}
  for (const ev of events.value) {
    const dateStr = ev.releaseDate || ev.firstSeenAt || '未知日期'
    const monthKey = dateStr.length >= 7 ? dateStr.substring(0, 7) : '其他'
    if (!groups[monthKey]) {
      groups[monthKey] = {
        month: monthKey,
        events: [],
      }
    }
    groups[monthKey].events.push(ev)
  }
  // 按月份倒序排列
  return Object.values(groups).sort((a, b) => b.month.localeCompare(a.month))
})

function toggleMonth(month) {
  if (collapsedMonths.value.has(month)) {
    collapsedMonths.value.delete(month)
  } else {
    collapsedMonths.value.add(month)
  }
}

function scrollToMonth(month) {
  const el = document.getElementById(`month-${month}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function getEventTypeBadge(type) {
  const map = {
    WEIGHTS_RELEASE: { text: '权重开源', color: '#E8B96E', bg: 'rgba(232, 185, 110, 0.15)' },
    MODEL_RELEASE: { text: '首代发布', color: '#087D82', bg: 'rgba(8, 125, 130, 0.15)' },
    VERSION_UPDATE: { text: '版本升级', color: '#76D4CE', bg: 'rgba(118, 212, 206, 0.15)' },
    API_AVAILABLE: { text: 'API 开放', color: '#EA735C', bg: 'rgba(234, 115, 92, 0.15)' },
  }
  return map[type] || { text: '发布动态', color: '#59717a', bg: 'rgba(89, 113, 122, 0.15)' }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return dateStr.substring(0, 10)
}

function formatMonthLabel(monthKey) {
  if (!monthKey || monthKey.length < 7) return monthKey
  const [year, month] = monthKey.split('-')
  return `${year} 年 ${month} 月`
}

onMounted(() => {
  loadTimeline()
})
</script>

<template>
  <div class="timeline-observatory-page">
    <!-- 头部标头 -->
    <header class="page-header-block">
      <div class="header-pre-badge">
        <span class="badge-dot"></span>
        <span class="badge-txt">CHRONOLOGICAL STREAM // 全球演进时间线</span>
      </div>
      <h1 class="page-title">模型架构代际演进历程</h1>
      <p class="page-desc">
        按年份与月份全景梳理已核实的人工确认模型架构迭代、开源发布与版本里程碑演进节点（共收录 {{ events.length }} 项已核实验进）。
      </p>

      <!-- 月份快速定位标签条 -->
      <div v-if="timelineGroups.length > 0" class="month-jump-bar">
        <span class="jump-lbl">月份快捷定位:</span>
        <div class="month-tags">
          <button
            v-for="group in timelineGroups"
            :key="group.month"
            class="month-btn"
            @click="scrollToMonth(group.month)"
          >
            {{ formatMonthLabel(group.month) }} ({{ group.events.length }})
          </button>
        </div>
      </div>
    </header>

    <!-- 加载中 -->
    <div v-if="loading" class="timeline-loading-state">
      <div class="loading-pulse-bar"></div>
      <p class="loading-tip">正在同步已审计的演进时间线...</p>
    </div>

    <!-- 错误重试状态 -->
    <div v-else-if="errorMsg" class="timeline-error-box">
      <p class="err-tip">{{ errorMsg }}</p>
      <button class="retry-btn" @click="loadTimeline">重新加载时间线</button>
    </div>

    <!-- 时间线主体流 -->
    <div v-else-if="timelineGroups.length > 0" class="timeline-flow">
      <section
        v-for="group in timelineGroups"
        :id="`month-${group.month}`"
        :key="group.month"
        class="month-block"
      >
        <!-- 月份分割标头 -->
        <div class="month-header" @click="toggleMonth(group.month)">
          <div class="month-title-wrap">
            <span class="month-bullet"></span>
            <span class="month-title">{{ formatMonthLabel(group.month) }}</span>
            <span class="month-badge">{{ group.events.length }} 项发布</span>
          </div>
          <button class="collapse-toggle">
            {{ collapsedMonths.has(group.month) ? '+ 展开月份' : '- 收起月份' }}
          </button>
        </div>

        <!-- 月份内事件列表 (时间轴形式) -->
        <div v-show="!collapsedMonths.has(group.month)" class="month-events-column">
          <article
            v-for="ev in group.events"
            :key="ev.id"
            class="timeline-card"
          >
            <!-- 轴点指示器 (琥珀色) -->
            <div class="timeline-axis-dot"></div>

            <div class="card-inner">
              <div class="card-meta-row">
                <div class="meta-left">
                  <span class="ev-date">{{ formatDate(ev.releaseDate || ev.firstSeenAt) }}</span>
                  <router-link
                    v-if="ev.vendorSlug"
                    :to="`/vendors/${ev.vendorSlug}`"
                    class="ev-vendor"
                  >
                    <span class="brand-point" :style="{ backgroundColor: ev.brandColor || 'var(--obs-primary)' }"></span>
                    <span>{{ ev.vendorName }}</span>
                  </router-link>
                </div>

                <span
                  class="event-type-tag"
                  :style="{
                    color: getEventTypeBadge(ev.eventType).color,
                    backgroundColor: getEventTypeBadge(ev.eventType).bg,
                  }"
                >
                  {{ getEventTypeBadge(ev.eventType).text }}
                </span>
              </div>

              <!-- 模型标题 -->
              <h3 class="ev-model-name">
                <router-link
                  v-if="ev.modelId"
                  :to="`/models/${ev.modelId}`"
                  class="ev-model-link"
                >
                  {{ ev.modelName }}
                </router-link>
                <span v-else>{{ ev.modelName }}</span>
              </h3>

              <!-- 摘要说明 -->
              <p class="ev-summary">{{ ev.summary }}</p>

              <!-- 底部官方证据链 -->
              <div class="ev-card-foot">
                <div class="ev-mod-tags">
                  <span v-if="ev.stage" class="stage-chip">{{ ev.stage }}</span>
                  <span v-if="ev.availabilityStatus" class="avail-chip">{{ ev.availabilityStatus }}</span>
                </div>

                <a
                  v-if="ev.evidences && ev.evidences.length > 0"
                  :href="ev.evidences[0].officialUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="proof-anchor"
                  @click.stop
                >
                  <span>🔗 {{ ev.evidences[0].title || '官方原厂发布证据' }} ↗</span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- 空数据 -->
    <div v-else class="timeline-empty-box">
      <p>暂无已确认的模型演进历史记录</p>
    </div>
  </div>
</template>

<style scoped>
.timeline-observatory-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: var(--obs-text, #172F38);
}

.page-header-block {
  border-bottom: 1px solid var(--obs-border, #D8E1DB);
  padding-bottom: 1.75rem;
}

.header-pre-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--obs-card-teal, #E5F0EC);
  border: 1px solid var(--obs-border, #D8E1DB);
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 0.6rem;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--obs-primary, #087D82);
}

.badge-txt {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--obs-primary, #087D82);
}

.page-title {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 850;
  letter-spacing: -0.03em;
  color: var(--obs-text, #172F38);
  margin: 0.2rem 0 0.5rem;
}

.page-desc {
  color: var(--obs-text-muted, #59717a);
  font-size: 0.95rem;
  margin: 0 0 1.25rem;
  max-width: 800px;
}

.month-jump-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.jump-lbl {
  font-size: 0.85rem;
  color: var(--obs-text-muted, #59717a);
}

.month-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.month-btn {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--obs-text, #172F38);
  cursor: pointer;
  transition: all 0.15s ease;
}

.month-btn:hover {
  border-color: var(--obs-primary, #087D82);
  background-color: var(--obs-card-teal, #E5F0EC);
}

/* 时间线主体流 */
.timeline-flow {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.month-block {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--obs-card-teal, #E5F0EC);
  border: 1px solid var(--obs-border, #D8E1DB);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
}

.month-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.month-bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--obs-primary, #087D82);
}

.month-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
}

.month-badge {
  font-size: 0.74rem;
  font-weight: 700;
  background-color: var(--obs-bg, #F4F2EA);
  color: var(--obs-primary, #087D82);
  padding: 2px 7px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}

.collapse-toggle {
  background: none;
  border: none;
  font-size: 0.82rem;
  color: var(--obs-text-muted, #59717a);
  cursor: pointer;
  font-weight: 600;
}

.month-events-column {
  position: relative;
  padding-left: 2rem;
  border-left: 2px solid var(--obs-border, #D8E1DB);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-left: 1rem;
}

.timeline-card {
  position: relative;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease;
}

.timeline-card:hover {
  transform: translateX(3px);
  border-color: var(--obs-primary, #087D82);
  box-shadow: 0 4px 16px rgba(23, 47, 56, 0.06);
}

.timeline-axis-dot {
  position: absolute;
  left: -2.6rem;
  top: 1.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--obs-accent-amber, #E8B96E);
  border: 3px solid var(--obs-bg, #F4F2EA);
}

.card-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ev-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: var(--obs-accent-amber, #E8B96E);
  font-weight: 700;
}

.ev-vendor {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--obs-text, #172F38);
}

.brand-point {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.event-type-tag {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}

.ev-model-name {
  font-size: 1.25rem;
  font-weight: 850;
  color: var(--obs-text, #172F38);
  margin: 0 0 0.5rem;
}

.ev-model-link {
  text-decoration: none;
  color: inherit;
}

.ev-model-link:hover {
  color: var(--obs-primary, #087D82);
}

.ev-summary {
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--obs-text-muted, #59717a);
  margin: 0 0 1rem;
}

.ev-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--obs-border, #D8E1DB);
  padding-top: 0.75rem;
}

.ev-mod-tags {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stage-chip,
.avail-chip {
  font-size: 0.72rem;
  background-color: var(--obs-card-teal, #E5F0EC);
  color: var(--obs-text, #172F38);
  padding: 2px 6px;
  border-radius: 3px;
}

.proof-anchor {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--obs-primary, #087D82);
  text-decoration: none;
}

.proof-anchor:hover {
  text-decoration: underline;
}

/* 加载状态 */
.timeline-loading-state {
  text-align: center;
  padding: 4rem 1.5rem;
}

.loading-pulse-bar {
  width: 120px;
  height: 3px;
  background-color: var(--obs-primary, #087D82);
  margin: 0 auto 1rem;
  animation: pulse-stream 1.2s infinite alternate;
}

@keyframes pulse-stream {
  from { width: 30px; opacity: 0.3; }
  to { width: 150px; opacity: 1; }
}

.loading-tip {
  font-size: 0.88rem;
  color: var(--obs-text-muted, #59717a);
}

.timeline-empty-box {
  text-align: center;
  padding: 3rem;
  color: var(--obs-text-muted, #59717a);
}

.timeline-error-box {
  text-align: center;
  padding: 3.5rem 1.5rem;
  background: var(--obs-surface, #F5F7F6);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 8px;
}

.err-tip {
  color: #dc2626;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 6px 18px;
  background-color: var(--obs-primary, #087D82);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.88rem;
}
</style>
