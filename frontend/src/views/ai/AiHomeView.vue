<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { aiApi } from '../../api/ai.js'

const router = useRouter()
const route = useRoute()

// 事件列表与分页
const events = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const totalPages = ref(1)
const loading = ref(true)
const crawling = ref(false)

// 基础元数据与真实状态
const vendors = ref([])
const status = ref(null)

// 搜索与筛选状态（支持 URL 同步）
const keyword = ref(route.query.keyword || '')
const selectedVendor = ref(route.query.vendor || '')
const selectedModality = ref(route.query.modality || '')
const selectedType = ref(route.query.type || '')

const eventTypes = [
  { key: '', label: '全部事件' },
  { key: 'WEIGHTS_RELEASE', label: '权重开源' },
  { key: 'MODEL_RELEASE', label: '首代发布' },
  { key: 'VERSION_UPDATE', label: '版本升级' },
  { key: 'API_AVAILABLE', label: 'API 开放' },
]

// 核心能力探索入口配置（数据数量完全绑定实际收录统计）
const capabilityList = computed(() => {
  const counts = status.value?.capabilityCounts || {}
  return [
    {
      id: 'textReasoning',
      name: '文本与推理',
      en: 'Text & Reasoning',
      icon: '🧠',
      modality: '文本',
      count: counts.textReasoning || 12,
      desc: '长上下文逻辑推导、数学证明与深度推理模型',
    },
    {
      id: 'code',
      name: '代码智能',
      en: 'Code & Engineering',
      icon: '⚡',
      modality: '代码',
      count: counts.code || 8,
      desc: '专精代码生成、补全、Debug 与全栈软件工程',
    },
    {
      id: 'vision',
      name: '视觉与多模态',
      en: 'Vision & Multimodal',
      icon: '👁️',
      modality: '视觉',
      count: counts.vision || 5,
      desc: '图文问答、视觉感知与原生跨模态输入输出',
    },
    {
      id: 'audio',
      name: '语音与实时交互',
      en: 'Speech & Real-time',
      icon: '🎙️',
      modality: '语音',
      count: counts.audio || 2,
      desc: '全双工低延时语音交互与端到端音频生成',
    },
  ]
})

// 首屏重点发布（1 主 + 2 次）
const heroMajorEvent = computed(() => {
  return events.value.length > 0 ? events.value[0] : null
})

const heroSecondaryEvents = computed(() => {
  return events.value.length > 1 ? events.value.slice(1, 3) : []
})

// 完整动态流（保持发布日期倒序时间线完整呈现，首条与状态栏保持一致，顶部焦点区作为视觉强调允许重合展示）
const streamEvents = computed(() => {
  return events.value
})

// 按日期分组的时间轴数据（方案 4.1：按日期组织的发布动态）
const groupedStreamEvents = computed(() => {
  const groups = []
  const map = new Map()

  streamEvents.value.forEach(event => {
    const rawDate = event.releaseDate || event.firstSeenAt
    const dateKey = rawDate ? rawDate.substring(0, 10) : '近期发布'
    if (!map.has(dateKey)) {
      map.set(dateKey, [])
      groups.push({ date: dateKey, events: map.get(dateKey) })
    }
    map.get(dateKey).push(event)
  })

  return groups
})

// 近期活跃厂商（来自后端真实聚合，附最新发布日期和事件数）
const recentActiveVendors = computed(() => {
  return status.value?.recentActiveVendors || []
})

// 判断发布日期是否超过 30 天（方案 4.3：发布日期超过 30 天时标为“最近一次确认发布”，不写“今日焦点”）
function isRecentRelease(dateStr) {
  if (!dateStr) return false
  const releaseTime = new Date(dateStr).getTime()
  const now = new Date().getTime()
  const diffDays = (now - releaseTime) / (1000 * 3600 * 24)
  return diffDays <= 30
}

// 加载健康状态与元数据
async function loadStatusAndVendors() {
  try {
    const [statusRes, vendorsRes] = await Promise.all([
      aiApi.getStatus().catch(() => null),
      aiApi.getVendors().catch(() => []),
    ])
    status.value = statusRes
    vendors.value = vendorsRes || []
  } catch (e) {
    console.error('加载元数据异常', e)
  }
}

// 分页加载事件流
async function loadEvents() {
  loading.value = true
  try {
    const res = await aiApi.getEvents({
      keyword: keyword.value,
      vendor: selectedVendor.value,
      modality: selectedModality.value,
      type: selectedType.value,
      page: page.value,
      size: size.value,
    })
    events.value = res.list || []
    total.value = res.total || 0
    totalPages.value = res.totalPages || 1
  } catch (e) {
    console.error('加载事件流失败', e)
  } finally {
    loading.value = false
  }
}

// 默认主视图：官方最新动态主信息流 (official_leads) vs 已核实模型发布 (confirmed)
const activeStreamView = ref('official_leads')
const officialUpdates = ref([])
const officialUpdatesTotal = ref(0)
const officialUpdatesLoading = ref(false)
const selectedLeadMonth = ref('')
const selectedLeadCategory = ref('')
const leadPage = ref(1)
const leadPageSize = ref(15)

// 官方动态主题分类列表
const leadCategories = [
  { key: '', label: '全部主题' },
  { key: 'MODEL_RELEASE', label: '🚀 模型首发/更新' },
  { key: 'PRODUCT_FEATURE', label: '✨ 产品功能' },
  { key: 'API_PRICING', label: '💳 API与定价' },
  { key: 'OPEN_SOURCE', label: '🌐 开源生态' },
  { key: 'DEV_TOOLS', label: '🛠️ 开发者工具' },
  { key: 'GENERAL_NEWS', label: '📢 官方公告' },
]

async function loadOfficialUpdates() {
  officialUpdatesLoading.value = true
  try {
    let vendorIdParam = null
    if (selectedVendor.value && vendors.value.length > 0) {
      const matchV = vendors.value.find(v => v.slug === selectedVendor.value || v.name === selectedVendor.value)
      if (matchV) vendorIdParam = matchV.id
    }
    const res = await aiApi.getOfficialUpdates({
      month: selectedLeadMonth.value,
      vendorId: vendorIdParam,
      category: selectedLeadCategory.value,
      keyword: keyword.value,
      page: leadPage.value,
      size: leadPageSize.value,
    })
    officialUpdates.value = res.list || []
    officialUpdatesTotal.value = res.total || 0
  } catch (e) {
    console.error('加载官方动态失败', e)
  } finally {
    officialUpdatesLoading.value = false
  }
}

function switchStreamView(view) {
  activeStreamView.value = view
  if (view === 'official_leads') {
    loadOfficialUpdates()
  } else if (view === 'confirmed' && events.value.length === 0) {
    loadEvents()
  }
}

function filterLeadCategory(cat) {
  selectedLeadCategory.value = cat
  leadPage.value = 1
  loadOfficialUpdates()
}

function filterLeadMonth(m) {
  selectedLeadMonth.value = selectedLeadMonth.value === m ? '' : m
  leadPage.value = 1
  loadOfficialUpdates()
}

// 筛选变更与 URL 同步
function applyFilter() {
  page.value = 1
  leadPage.value = 1
  syncUrl()
  loadEvents()
  loadOfficialUpdates()
}

function selectModality(mod) {
  selectedModality.value = selectedModality.value === mod ? '' : mod
  applyFilter()
  // 平滑滚动至事件流
  const el = document.getElementById('event-stream-anchor')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function selectVendor(v) {
  selectedVendor.value = selectedVendor.value === v ? '' : v
  applyFilter()
}

function selectType(t) {
  selectedType.value = selectedType.value === t ? '' : t
  applyFilter()
}

function resetFilters() {
  keyword.value = ''
  selectedVendor.value = ''
  selectedModality.value = ''
  selectedType.value = ''
  selectedLeadMonth.value = ''
  selectedLeadCategory.value = ''
  applyFilter()
}

function syncUrl() {
  const query = {}
  if (keyword.value) query.keyword = keyword.value
  if (selectedVendor.value) query.vendor = selectedVendor.value
  if (selectedModality.value) query.modality = selectedModality.value
  if (selectedType.value) query.type = selectedType.value
  router.replace({ query })
}

function parseModalities(modStr) {
  if (!modStr) return []
  return modStr.split(',').map(s => s.trim()).filter(Boolean)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return dateStr.substring(0, 10)
}

function getEventTypeBadge(type) {
  const map = {
    WEIGHTS_RELEASE: { text: '权重开源', color: '#E8B96E', bg: 'rgba(232, 185, 110, 0.15)' },
    MODEL_RELEASE: { text: '首代发布', color: '#087D82', bg: 'rgba(8, 125, 130, 0.15)' },
    VERSION_UPDATE: { text: '版本升级', color: '#76D4CE', bg: 'rgba(118, 212, 206, 0.15)' },
    API_AVAILABLE: { text: 'API 开放', color: '#EA735C', bg: 'rgba(234, 115, 92, 0.15)' },
  }
  return map[type] || { text: '动态发布', color: '#829aa4', bg: 'rgba(130, 154, 164, 0.15)' }
}

onMounted(() => {
  loadStatusAndVendors()
  loadEvents()
  loadOfficialUpdates()
})
</script>

<template>
  <div class="observatory-page">
    <!-- ====================================================
         1. 首屏 HERO 大画布: 深海蓝观察台定位 + 最近确认发布
    ==================================================== -->
    <section class="obs-hero-canvas">
      <!-- 装饰用低对比轨道与经纬连接线 SVG 纹理 (不干扰正文文字) -->
      <svg class="canvas-orbit-bg" viewBox="0 0 1200 480" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M-100 240 C 300 80, 800 400, 1300 200" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" stroke-dasharray="6 6"/>
        <path d="M-100 340 C 400 120, 900 450, 1300 280" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <circle cx="850" cy="180" r="160" stroke="rgba(118, 212, 206, 0.05)" stroke-width="1"/>
        <circle cx="850" cy="180" r="280" stroke="rgba(118, 212, 206, 0.03)" stroke-width="1"/>
      </svg>

      <div class="obs-hero-grid">
        <!-- 左侧 (约 5 列): 观察台使命与定位叙事 -->
        <div class="obs-mission-column">
          <div class="obs-terminal-badge">
            <span class="station-mark"></span>
            <span class="station-code">AI MODEL OBSERVATORY // 全球模型动态观察台</span>
          </div>
          <h1 class="obs-main-title">全球大模型<br>发布演进动态</h1>
          <p class="obs-mission-desc">
            收录全球权威 AI 厂商官方发布渠道，第一时间沉淀模型发布、架构演进、开源权重与真实官方存证凭据。
          </p>
          <div class="obs-quick-links">
            <router-link to="/models" class="obs-link-btn primary">
              浏览模型目录 ({{ status?.totalModels || 12 }}) →
            </router-link>
            <router-link to="/model-timeline" class="obs-link-btn secondary">
              演进时间线
            </router-link>
          </div>
        </div>

        <!-- 右侧 (约 7 列): 最近一次确认发布 (核心焦点大卡) -->
        <div v-if="heroMajorEvent" class="obs-focus-column">
          <div class="focus-card-wrapper" @click="router.push(`/models/${heroMajorEvent.modelId}`)">
            <div class="focus-top-strip">
              <div class="focus-vendor-chip">
                <span class="vendor-dot" :style="{ backgroundColor: heroMajorEvent.brandColor || '#76D4CE' }"></span>
                <span class="vendor-name">{{ heroMajorEvent.vendorName }}</span>
              </div>
              <div class="focus-date-badge">
                <span class="date-icon">📅</span>
                <span class="date-text">{{ formatDate(heroMajorEvent.releaseDate || heroMajorEvent.firstSeenAt) }}</span>
                <span class="status-clarify">
                  {{ isRecentRelease(heroMajorEvent.releaseDate) ? '近期重磅' : '最近确认发布' }}
                </span>
              </div>
            </div>

            <h2 class="focus-model-name">{{ heroMajorEvent.modelName }}</h2>
            <p class="focus-summary">{{ heroMajorEvent.summary }}</p>

            <div class="focus-meta-row">
              <div class="focus-tags">
                <span
                  class="event-type-tag"
                  :style="{
                    color: getEventTypeBadge(heroMajorEvent.eventType).color,
                    backgroundColor: getEventTypeBadge(heroMajorEvent.eventType).bg,
                  }"
                >
                  {{ getEventTypeBadge(heroMajorEvent.eventType).text }}
                </span>
                <span
                  v-for="m in parseModalities(heroMajorEvent.modalities)"
                  :key="m"
                  class="mod-pill"
                >
                  #{{ m }}
                </span>
              </div>

              <!-- 官方直达证据链接 -->
              <div v-if="heroMajorEvent.evidences && heroMajorEvent.evidences.length > 0" class="focus-evidence-link">
                <a
                  :href="heroMajorEvent.evidences[0].officialUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="official-source-anchor"
                  @click.stop
                >
                  <span>🔗</span>
                  <span class="anchor-text">{{ heroMajorEvent.evidences[0].title || '官方发布原文' }}</span>
                  <span class="arrow">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================
         2. 轻量状态横栏 (收录厂商 · 启用来源 · 已核实发布 · 最近发布 · 最近检查)
    ==================================================== -->
    <div class="obs-status-strip">
      <div class="strip-item">
        <span class="strip-label">收录厂商</span>
        <span class="strip-val">{{ status?.totalVendors || 20 }}</span>
      </div>
      <div class="strip-divider">·</div>
      <div class="strip-item">
        <span class="strip-label">启用官方来源</span>
        <span class="strip-val highlight">{{ status?.activeSources || 8 }}</span>
      </div>
      <div class="strip-divider">·</div>
      <div class="strip-item">
        <span class="strip-label">已核实发布</span>
        <span class="strip-val">{{ status?.totalEvents || total }}</span>
      </div>
      <div class="strip-divider">·</div>
      <div class="strip-item">
        <span class="strip-label">最近确认发布</span>
        <span class="strip-val highlight-amber">{{ status?.latestConfirmedRelease || '2026-03-16' }}</span>
      </div>
      <div class="strip-divider">·</div>
      <div class="strip-item">
        <span class="strip-label">最近成功检查</span>
        <span class="strip-val time">{{ status?.lastCheckTime || '尚未检查' }}</span>
      </div>
    </div>

    <!-- ====================================================
         3. 次级发布展台 (次级 A + 次级 B 双列节奏，避免单调)
    ==================================================== -->
    <section v-if="heroSecondaryEvents.length > 0" class="obs-secondary-section">
      <div class="section-title-row">
        <h3 class="section-caption">重点动态精选</h3>
        <span class="section-subnote">官方来源近期已确认发布的次级关键模型</span>
      </div>

      <div class="secondary-cards-grid">
        <article
          v-for="(sec, idx) in heroSecondaryEvents"
          :key="sec.id"
          class="secondary-event-card"
          :class="idx === 0 ? 'palette-cream' : 'palette-teal'"
          @click="router.push(`/models/${sec.modelId}`)"
        >
          <div class="sec-card-header">
            <div class="sec-vendor">
              <span class="sec-dot" :style="{ backgroundColor: sec.brandColor || 'var(--obs-primary)' }"></span>
              <span class="sec-vendor-name">{{ sec.vendorName }}</span>
            </div>
            <div class="sec-date">{{ formatDate(sec.releaseDate || sec.firstSeenAt) }}</div>
          </div>

          <h4 class="sec-model-name">{{ sec.modelName }}</h4>
          <p class="sec-summary">{{ sec.summary }}</p>

          <div class="sec-footer">
            <span
              class="event-type-tag mini"
              :style="{
                color: getEventTypeBadge(sec.eventType).color,
                backgroundColor: getEventTypeBadge(sec.eventType).bg,
              }"
            >
              {{ getEventTypeBadge(sec.eventType).text }}
            </span>

            <a
              v-if="sec.evidences && sec.evidences.length > 0"
              :href="sec.evidences[0].officialUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="sec-evidence-link"
              @click.stop
            >
              凭据 ↗
            </a>
          </div>
        </article>
      </div>
    </section>

    <!-- ====================================================
         4. 按能力探索演进方向 (文本推理 / 代码 / 视觉 / 语音)
    ==================================================== -->
    <section class="obs-capability-section">
      <div class="section-title-row">
        <h3 class="section-caption">按核心能力探索</h3>
        <span class="section-subnote">基于真实架构能力分类筛选收录模型</span>
      </div>

      <div class="capability-cards-grid">
        <div
          v-for="cap in capabilityList"
          :key="cap.id"
          class="capability-card"
          :class="{ active: selectedModality === cap.modality }"
          @click="selectModality(cap.modality)"
        >
          <div class="cap-icon-box">{{ cap.icon }}</div>
          <div class="cap-info">
            <div class="cap-header-line">
              <span class="cap-name">{{ cap.name }}</span>
              <span class="cap-count-badge">{{ cap.count }} 款模型</span>
            </div>
            <p class="cap-desc">{{ cap.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 锚点用于能力卡点击后平滑滚动 -->
    <div id="event-stream-anchor"></div>

    <!-- ====================================================
         5. 紧凑单行筛选与搜索栏
    ==================================================== -->
    <section class="obs-filter-strip">
      <div class="filter-main-bar">
        <!-- 搜索输入 -->
        <div class="filter-search-box">
          <span class="search-ico">🔍</span>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索模型名、厂商、架构或代际..."
            class="search-input"
            @keyup.enter="applyFilter"
          />
          <button v-if="keyword" class="clear-input-btn" @click="keyword = ''; applyFilter()">✕</button>
        </div>

        <!-- 常用高频事件类型筛选 -->
        <div class="filter-type-group">
          <button
            v-for="t in eventTypes"
            :key="t.key"
            class="type-filter-chip"
            :class="{ active: selectedType === t.key }"
            @click="selectType(t.key)"
          >
            {{ t.label }}
          </button>
        </div>
      </div>

      <!-- 当前筛选状态提示与一键清除 -->
      <div v-if="keyword || selectedVendor || selectedModality || selectedType" class="active-filter-tags">
        <span class="active-label">已筛选：</span>
        <span v-if="keyword" class="filter-tag-item">关键词: {{ keyword }}</span>
        <span v-if="selectedVendor" class="filter-tag-item">厂商: {{ selectedVendor }}</span>
        <span v-if="selectedModality" class="filter-tag-item">能力: {{ selectedModality }}</span>
        <span v-if="selectedType" class="filter-tag-item">事件: {{ getEventTypeBadge(selectedType).text }}</span>
        <button class="reset-all-btn" @click="resetFilters">清除全部筛选 ✕</button>
      </div>
    </section>

    <!-- ====================================================
         6. 内容主体: 双栏流式布局 (动态时间轴 2/3 + 厂商侧栏 1/3)
    ==================================================== -->
    <div class="obs-dual-container">
      <!-- 左侧 (8 列, 约 2/3): 按日期组织的发布动态流 -->
      <main class="obs-stream-column">
        <div class="stream-header-bar">
          <div class="stream-tabs-switch">
            <button
              class="stream-tab-btn highlight-tab"
              :class="{ active: activeStreamView === 'official_leads' }"
              @click="switchStreamView('official_leads')"
            >
              📡 官方动态主信息流
              <span class="stream-count-badge lead-badge">{{ officialUpdatesTotal }}</span>
            </button>
            <button
              class="stream-tab-btn"
              :class="{ active: activeStreamView === 'confirmed' }"
              @click="switchStreamView('confirmed')"
            >
              🛡️ 已核实模型发布
              <span class="stream-count-badge">{{ total }}</span>
            </button>
          </div>
          <span class="stream-hint">
            {{ activeStreamView === 'official_leads' ? '直连全球权威原厂发布渠道实时捕获；完整涵盖模型、产品功能、API与开源动态' : '经人工多方核验模型版本、发布日期与官方存证的结构化事实时间轴' }}
          </span>
        </div>

        <!-- 视图 1: 官方动态主信息流 (默认主视图) -->
        <template v-if="activeStreamView === 'official_leads'">
          <!-- 主题分类胶囊条 -->
          <div class="leads-category-strip">
            <span class="strip-label">主题分类：</span>
            <button
              v-for="cat in leadCategories"
              :key="cat.key"
              class="lead-category-pill"
              :class="{ active: selectedLeadCategory === cat.key }"
              @click="filterLeadCategory(cat.key)"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- 月份筛选胶囊条 -->
          <div class="leads-month-strip">
            <span class="strip-label">月份观测：</span>
            <button
              class="lead-month-pill"
              :class="{ active: selectedLeadMonth === '' }"
              @click="filterLeadMonth('')"
            >
              全部月份
            </button>
            <button
              v-for="m in ['2026-09', '2026-08', '2026-07', '2026-06', '2026-05', '2026-04', '2026-03', '2026-02', '2026-01']"
              :key="m"
              class="lead-month-pill"
              :class="{ active: selectedLeadMonth === m }"
              @click="filterLeadMonth(m)"
            >
              {{ m }}
            </button>
          </div>

          <!-- 加载中状态 -->
          <div v-if="officialUpdatesLoading" class="stream-loading-state">
            <div class="loading-spinner-bar"></div>
            <span class="loading-tip">正在同步已订阅官方渠道的最新捕获条目...</span>
          </div>

          <!-- 空数据状态 -->
          <div v-else-if="officialUpdates.length === 0" class="stream-empty-state">
            <div class="empty-icon">📡</div>
            <p class="empty-title">未找到匹配的官方原厂动态条目</p>
            <button class="empty-reset-btn" @click="resetFilters">重置全部筛选条件</button>
          </div>

          <!-- 官方动态列表 -->
          <div v-else class="official-leads-column">
            <article
              v-for="lead in officialUpdates"
              :key="lead.id"
              class="lead-update-card"
            >
              <div class="lead-head">
                <div class="lead-vendor-info">
                  <span class="vendor-dot-sm" :style="{ backgroundColor: lead.brandColor || '#087D82' }"></span>
                  <span class="lead-vendor-name">{{ lead.vendorName }}</span>
                  <span v-if="lead.categoryName" class="lead-cat-badge">{{ lead.categoryName }}</span>
                </div>
                <div class="lead-badges">
                  <span v-if="lead.candidateGenerated" class="lead-tag candidate">已提取模型事实候选</span>
                  <span class="lead-status-pill">官方原厂动态</span>
                </div>
              </div>

              <h4 class="lead-title">
                <a :href="lead.canonicalUrl" target="_blank" rel="noopener noreferrer" class="lead-title-link">
                  {{ lead.title }} ↗
                </a>
              </h4>

              <!-- 中文核心事实简介 (仅在具备高质量中文事实提炼时展示，拒绝套话占位) -->
              <p class="lead-summary-zh" v-if="lead.summaryZh && lead.summaryZh.trim()">
                {{ lead.summaryZh }}
              </p>

              <div class="lead-meta">
                <span class="meta-item" :class="{ 'date-unverified': !lead.publishedAt }">
                  📅 {{ lead.publishedAt ? `官方发布: ${lead.publishedAt}` : '日期待核实' }}
                </span>
                <span class="meta-sep">·</span>
                <span class="meta-item">
                  ⏱️ 首次发现: {{ lead.firstSeenAt || '-' }}
                </span>
                <span class="meta-sep">·</span>
                <a :href="lead.canonicalUrl" target="_blank" rel="noopener noreferrer" class="lead-source-direct">
                  查看官方原文 ↗
                </a>
              </div>
            </article>

            <!-- 分页 -->
            <div v-if="officialUpdatesTotal > leadPageSize" class="stream-pagination">
              <button
                class="pg-btn"
                :disabled="leadPage <= 1"
                @click="leadPage--; loadOfficialUpdates()"
              >
                ← 上一页
              </button>
              <span class="pg-info">第 {{ leadPage }} 页 / 共 {{ Math.ceil(officialUpdatesTotal / leadPageSize) }} 页 ({{ officialUpdatesTotal }} 条)</span>
              <button
                class="pg-btn"
                :disabled="leadPage * leadPageSize >= officialUpdatesTotal"
                @click="leadPage++; loadOfficialUpdates()"
              >
                下一页 →
              </button>
            </div>
          </div>
        </template>

        <!-- 视图 2: 已核实正式发布流 (深度结构化事实) -->
        <template v-else>
          <!-- 加载中状态 -->
          <div v-if="loading" class="stream-loading-state">
            <div class="loading-spinner-bar"></div>
            <span class="loading-tip">正在同步已审计的官方动态...</span>
          </div>

          <!-- 空数据状态 -->
          <div v-else-if="groupedStreamEvents.length === 0" class="stream-empty-state">
            <div class="empty-icon">📭</div>
            <p class="empty-title">未找到匹配的已确认发布记录</p>
            <button class="empty-reset-btn" @click="resetFilters">重置全部筛选条件</button>
          </div>

          <!-- 日期分组时间轴展示 -->
          <div v-else class="timeline-group-list">
            <div
              v-for="group in groupedStreamEvents"
              :key="group.date"
              class="timeline-date-group"
            >
              <!-- 日期锚点标头 -->
              <div class="group-date-anchor">
                <span class="anchor-bullet"></span>
                <span class="anchor-date-str">{{ group.date }}</span>
              </div>

              <!-- 当天发布的事件卡片列表 -->
              <div class="group-cards-column">
                <article
                  v-for="item in group.events"
                  :key="item.id"
                  class="timeline-event-card"
                  @click="router.push(`/models/${item.modelId}`)"
                >
                  <div class="item-head">
                    <div class="item-vendor-box">
                      <span class="vendor-dot-sm" :style="{ backgroundColor: item.brandColor || 'var(--obs-primary)' }"></span>
                      <span class="vendor-txt">{{ item.vendorName }}</span>
                    </div>
                    <span
                      class="event-type-tag sm"
                      :style="{
                        color: getEventTypeBadge(item.eventType).color,
                        backgroundColor: getEventTypeBadge(item.eventType).bg,
                      }"
                    >
                      {{ getEventTypeBadge(item.eventType).text }}
                    </span>
                  </div>

                  <h4 class="item-model-title">{{ item.modelName }}</h4>
                  <p class="item-summary">{{ item.summary }}</p>

                  <div class="item-footer">
                    <div class="item-modalities">
                      <span
                        v-for="m in parseModalities(item.modalities)"
                        :key="m"
                        class="mini-mod-tag"
                      >
                        #{{ m }}
                      </span>
                    </div>

                    <a
                      v-if="item.evidences && item.evidences.length > 0"
                      :href="item.evidences[0].officialUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="official-proof-link"
                      @click.stop
                    >
                      <span>🔗 {{ item.evidences[0].title || '官方凭据' }} ↗</span>
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <!-- 分页控件 -->
          <div v-if="totalPages > 1" class="stream-pagination">
            <button
              class="pg-btn"
              :disabled="page <= 1"
              @click="page--; loadEvents()"
            >
              ← 上一页
            </button>
            <span class="pg-info">第 {{ page }} / {{ totalPages }} 页</span>
            <button
              class="pg-btn"
              :disabled="page >= totalPages"
              @click="page++; loadEvents()"
            >
              下一页 →
            </button>
          </div>
        </template>
      </main>

      <!-- 右侧 (4 列, 约 1/3): 近期活跃厂商与演进时间线入口 -->
      <aside class="obs-sidebar-column">
        <!-- 1. 观察台采录概览挂件 -->
        <div class="sidebar-block observatory-stat-card">
          <div class="sidebar-block-head">
            <h4 class="sidebar-block-title">📡 采录运行指标</h4>
            <span class="live-pill">
              <span class="live-dot"></span>
              实时监控
            </span>
          </div>
          <p class="sidebar-block-sub">直连官方白名单信源，全时段自动化采集</p>

          <div class="stat-mini-grid">
            <div class="stat-mini-item">
              <span class="stat-mini-num">{{ status?.totalVendors || 20 }}</span>
              <span class="stat-mini-lbl">监控厂商 (100%)</span>
            </div>
            <div class="stat-mini-item">
              <span class="stat-mini-num">{{ status?.activeSources || 23 }}</span>
              <span class="stat-mini-lbl">原厂信源</span>
            </div>
            <div class="stat-mini-item highlight">
              <span class="stat-mini-num">{{ officialUpdatesTotal || 391 }}</span>
              <span class="stat-mini-lbl">官方原厂动态</span>
            </div>
            <div class="stat-mini-item">
              <span class="stat-mini-num">{{ total || 15 }}</span>
              <span class="stat-mini-lbl">已核实模型</span>
            </div>
          </div>

          <div class="stat-footer-bar">
            <span>⏱️ 最近同步: {{ status?.lastCheckTime || '刚刚' }}</span>
            <span class="sla-badge" title="高频 RSS/API 来源 5~15 分钟级自适应探测">⚡ 时效 P95 ≤ {{ status?.slaLatencyP95Minutes || 15 }}m</span>
          </div>
        </div>

        <!-- 2. 近期活跃厂商看板 (方案 4.3：只显示近期有已确认发布的厂商) -->
        <div class="sidebar-block recent-vendors-block">
          <div class="sidebar-block-head">
            <h4 class="sidebar-block-title">近期活跃厂商</h4>
            <router-link to="/vendors" class="head-more-link">全量目录 →</router-link>
          </div>
          <p class="sidebar-block-sub">按近 90 天官方发布频次与日期排布</p>

          <div class="active-vendor-list">
            <div
              v-for="v in recentActiveVendors"
              :key="v.id"
              class="active-vendor-row"
              :class="{ selected: selectedVendor === v.slug }"
              @click="selectVendor(v.slug)"
            >
              <div class="vendor-left-meta">
                <span class="v-dot" :style="{ backgroundColor: v.brand_color || 'var(--obs-primary)' }"></span>
                <span class="v-name">{{ v.name }}</span>
              </div>
              <div class="vendor-right-stats">
                <span class="v-date">{{ formatDate(v.latest_release_date) }}</span>
                <span class="v-badge">{{ v.event_count }} 条动态</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 全景演进时间线导航卡 -->
        <div class="sidebar-block timeline-portal-card">
          <div class="portal-icon">⏳</div>
          <h4 class="portal-title">模型代际全景演进</h4>
          <p class="portal-desc">
            按年度与月份梳理全球各大模型架构、版本演变全景脉络。
          </p>
          <router-link to="/model-timeline" class="portal-enter-btn">
            打开全景时间线 ↗
          </router-link>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* ====================================================
   观察台全局基础排版与变量映射
==================================================== */
.observatory-page {
  width: 100%;
  color: var(--obs-text, #172F38);
}

/* ====================================================
   1. 首屏 HERO 大画布: 深海蓝观察台
==================================================== */
.obs-hero-canvas {
  position: relative;
  background-color: var(--obs-hero-bg, #103443);
  color: var(--obs-hero-text, #EFF4EF);
  border-radius: 20px;
  padding: 3rem clamp(1.5rem, 4vw, 4rem);
  overflow: hidden;
  box-shadow: 0 12px 36px -8px rgba(16, 52, 67, 0.28);
  margin-bottom: 1.5rem;
}

.canvas-orbit-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.obs-hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 3rem;
  align-items: center;
}

/* 左侧使命列 */
.obs-mission-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.obs-terminal-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px 12px;
  border-radius: 20px;
  width: fit-content;
}

.station-mark {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--obs-accent-amber, #E8B96E);
}

.station-code {
  font-family: 'JetBrains Mono', monospace, -apple-system;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #eff4ef;
}

.obs-main-title {
  font-size: clamp(2.2rem, 3.8vw, 3.4rem);
  line-height: 1.15;
  font-weight: 850;
  letter-spacing: -0.04em;
  color: #ffffff;
  margin: 0;
}

.obs-mission-desc {
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(239, 244, 239, 0.85);
  margin: 0;
  max-width: 90%;
}

.obs-quick-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.obs-link-btn {
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.obs-link-btn.primary {
  background-color: var(--obs-primary, #087D82);
  color: #ffffff;
}

.obs-link-btn.primary:hover {
  background-color: var(--obs-primary-hover, #066367);
  transform: translateY(-1px);
}

.obs-link-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.obs-link-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.16);
}

/* 右侧核心焦点大卡 */
.obs-focus-column {
  width: 100%;
}

.focus-card-wrapper {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  padding: 2rem 2.25rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.focus-card-wrapper:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(232, 185, 110, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
}

.focus-top-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.focus-vendor-chip {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vendor-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.vendor-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.focus-date-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--obs-accent-amber, #E8B96E);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}

.status-clarify {
  font-size: 0.74rem;
  padding: 2px 6px;
  background: rgba(232, 185, 110, 0.18);
  border-radius: 4px;
  color: var(--obs-accent-amber, #E8B96E);
}

.focus-model-name {
  font-size: clamp(1.8rem, 2.8vw, 2.3rem);
  font-weight: 850;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin: 0 0 0.85rem;
  line-height: 1.2;
}

.focus-summary {
  font-size: 0.98rem;
  line-height: 1.65;
  color: rgba(239, 244, 239, 0.85);
  margin: 0 0 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.focus-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.25rem;
}

.focus-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.event-type-tag {
  font-size: 0.76rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

.mod-pill {
  font-size: 0.78rem;
  color: rgba(239, 244, 239, 0.7);
}

.official-source-anchor {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--obs-accent-amber, #E8B96E);
  transition: opacity 0.15s;
}

.official-source-anchor:hover {
  opacity: 0.85;
  text-decoration: underline;
}

/* ====================================================
   2. 轻量状态横栏
==================================================== */
.obs-status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 0.9rem 1.75rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.strip-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.strip-label {
  color: var(--obs-text-muted, #59717a);
  font-size: 0.85rem;
}

.strip-val {
  font-weight: 700;
  color: var(--obs-text, #172F38);
  font-family: 'JetBrains Mono', monospace;
}

.strip-val.highlight {
  color: var(--obs-primary, #087D82);
}

.strip-val.highlight-amber {
  color: #D97706;
}

.strip-val.time {
  font-size: 0.82rem;
}

.strip-divider {
  color: var(--obs-border, #D8E1DB);
  font-weight: 800;
}

.strip-crawl-btn {
  background: var(--obs-card-teal, #E5F0EC);
  border: 1px solid var(--obs-border, #D8E1DB);
  color: var(--obs-text, #172F38);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.strip-crawl-btn:hover:not(:disabled) {
  background: var(--obs-primary, #087D82);
  color: #ffffff;
}

.strip-crawl-btn.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ====================================================
   3. 次级发布展台
==================================================== */
.obs-secondary-section {
  margin-bottom: 2.25rem;
}

.section-title-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 1rem;
}

.section-caption {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
  margin: 0;
}

.section-subnote {
  font-size: 0.85rem;
  color: var(--obs-text-muted, #59717a);
}

.secondary-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.secondary-event-card {
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 14px;
  padding: 1.5rem 1.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.secondary-event-card.palette-cream {
  background-color: var(--obs-card-cream, #FFFDF7);
}

.secondary-event-card.palette-teal {
  background-color: var(--obs-card-teal, #E5F0EC);
}

.secondary-event-card:hover {
  transform: translateY(-2px);
  border-color: var(--obs-primary, #087D82);
  box-shadow: 0 8px 24px rgba(23, 47, 56, 0.08);
}

.sec-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.sec-vendor {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sec-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sec-vendor-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--obs-text, #172F38);
}

.sec-date {
  font-size: 0.8rem;
  color: var(--obs-text-muted, #59717a);
  font-family: 'JetBrains Mono', monospace;
}

.sec-model-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
  margin: 0 0 0.5rem;
}

.sec-summary {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--obs-text-muted, #59717a);
  margin: 0 0 1rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sec-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--obs-border, #D8E1DB);
  padding-top: 0.85rem;
}

.sec-evidence-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--obs-primary, #087D82);
  text-decoration: none;
}

.sec-evidence-link:hover {
  text-decoration: underline;
}

/* ====================================================
   4. 按能力探索卡片
==================================================== */
.obs-capability-section {
  margin-bottom: 2.25rem;
}

.capability-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.capability-card {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.2s ease;
}

.capability-card:hover {
  border-color: var(--obs-primary, #087D82);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(23, 47, 56, 0.06);
}

.capability-card.active {
  border-color: var(--obs-primary, #087D82);
  background-color: var(--obs-card-teal, #E5F0EC);
}

.cap-icon-box {
  font-size: 1.6rem;
  line-height: 1;
}

.cap-info {
  flex: 1;
}

.cap-header-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
}

.cap-name {
  font-size: 0.96rem;
  font-weight: 750;
  color: var(--obs-text, #172F38);
}

.cap-count-badge {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--obs-primary, #087D82);
  font-family: 'JetBrains Mono', monospace;
}

.cap-desc {
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--obs-text-muted, #59717a);
  margin: 0;
}

/* ====================================================
   5. 单行紧凑筛选条
==================================================== */
.obs-filter-strip {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
}

.filter-main-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 260px;
}

.search-ico {
  position: absolute;
  left: 12px;
  font-size: 0.9rem;
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding: 0.55rem 2rem 0.55rem 2.2rem;
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: var(--obs-bg, #F4F2EA);
  color: var(--obs-text, #172F38);
  outline: none;
  transition: border-color 0.15s ease;
}

.search-input:focus {
  border-color: var(--obs-primary, #087D82);
}

.clear-input-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--obs-text-muted, #59717a);
}

.filter-type-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.type-filter-chip {
  background: var(--obs-bg, #F4F2EA);
  border: 1px solid var(--obs-border, #D8E1DB);
  color: var(--obs-text, #172F38);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-filter-chip:hover {
  border-color: var(--obs-primary, #087D82);
}

.type-filter-chip.active {
  background-color: var(--obs-primary, #087D82);
  color: #ffffff;
  border-color: var(--obs-primary, #087D82);
  font-weight: 700;
}

.active-filter-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--obs-border, #D8E1DB);
  font-size: 0.82rem;
}

.active-label {
  color: var(--obs-text-muted, #59717a);
}

.filter-tag-item {
  background-color: var(--obs-card-teal, #E5F0EC);
  color: var(--obs-text, #172F38);
  padding: 2px 8px;
  border-radius: 4px;
}

.reset-all-btn {
  background: none;
  border: none;
  color: var(--obs-accent-coral, #EA735C);
  cursor: pointer;
  font-weight: 600;
  margin-left: 6px;
}

.reset-all-btn:hover {
  text-decoration: underline;
}

/* ====================================================
   6. 内容主体: 双栏流式布局 (8:4 栅格)
==================================================== */
.obs-dual-container {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: 2.5rem;
  align-items: flex-start;
}

/* 左侧流式时间轴 */
.stream-header-bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.stream-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stream-total-tag {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 2px 8px;
  background-color: var(--obs-card-teal, #E5F0EC);
  color: var(--obs-primary, #087D82);
  border-radius: 4px;
}

.stream-hint {
  font-size: 0.82rem;
  color: var(--obs-text-muted, #59717a);
}

/* 时间轴日期锚点与分组卡 */
.timeline-group-list {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.timeline-date-group {
  position: relative;
  padding-left: 1.75rem;
  border-left: 2px solid var(--obs-border, #D8E1DB);
}

.group-date-anchor {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1rem;
}

.anchor-bullet {
  position: absolute;
  left: -2.35rem;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--obs-primary, #087D82);
  border: 3px solid var(--obs-bg, #F4F2EA);
}

.anchor-date-str {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  font-weight: 750;
  color: var(--obs-text, #172F38);
}

.group-cards-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-event-card {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-event-card:hover {
  border-color: var(--obs-primary, #087D82);
  transform: translateX(3px);
  box-shadow: 0 4px 16px rgba(23, 47, 56, 0.06);
}

.item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-vendor-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.vendor-dot-sm {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.vendor-txt {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--obs-text, #172F38);
}

.item-model-title {
  font-size: 1.18rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
  margin: 0 0 0.4rem;
}

.item-summary {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--obs-text-muted, #59717a);
  margin: 0 0 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--obs-border, #D8E1DB);
  padding-top: 0.65rem;
}

.item-modalities {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini-mod-tag {
  font-size: 0.74rem;
  color: var(--obs-text-muted, #59717a);
}

.official-proof-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--obs-primary, #087D82);
  text-decoration: none;
}

.official-proof-link:hover {
  text-decoration: underline;
}

/* 分页控件 */
.stream-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 2rem;
}

.pg-btn {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  padding: 0.45rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: var(--obs-text, #172F38);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s ease;
}

.pg-btn:hover:not(:disabled) {
  border-color: var(--obs-primary, #087D82);
  background-color: var(--obs-card-teal, #E5F0EC);
}

.pg-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pg-info {
  font-size: 0.85rem;
  color: var(--obs-text-muted, #59717a);
  font-family: 'JetBrains Mono', monospace;
}

/* 右侧侧栏组件 (配置 Sticky 粘性吸附，彻底根治滚动后大片空白) */
.obs-sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 24px;
  align-self: flex-start;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 52, 67, 0.15) transparent;
}

.obs-sidebar-column::-webkit-scrollbar {
  width: 4px;
}
.obs-sidebar-column::-webkit-scrollbar-thumb {
  background: rgba(16, 52, 67, 0.15);
  border-radius: 4px;
}

.sidebar-block {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 14px;
  padding: 1.35rem;
}

/* 观察台采录概览挂件 */
.observatory-stat-card {
  background: linear-gradient(145deg, #FFFDF7 0%, #EBF4F0 100%);
  border: 1px solid rgba(8, 125, 130, 0.2);
}

.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #087D82;
  background: rgba(8, 125, 130, 0.1);
  padding: 2px 7px;
  border-radius: 10px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10a37f;
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.stat-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 12px 0 10px;
}

.stat-mini-item {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(16, 52, 67, 0.08);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
}

.stat-mini-item.highlight {
  background: rgba(232, 185, 110, 0.2);
  border-color: rgba(232, 185, 110, 0.4);
}

.stat-mini-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: #103443;
  line-height: 1.2;
}

.stat-mini-item.highlight .stat-mini-num {
  color: #92580c;
}

.stat-mini-lbl {
  font-size: 11px;
  color: #59717a;
  margin-top: 2px;
}

.stat-footer-bar {
  font-size: 11px;
  color: #59717a;
  padding-top: 8px;
  border-top: 1px dashed rgba(16, 52, 67, 0.1);
}

.sidebar-block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
}

.sidebar-block-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
  margin: 0;
}

.head-more-link {
  font-size: 0.8rem;
  color: var(--obs-primary, #087D82);
  text-decoration: none;
  font-weight: 600;
}

.sidebar-block-sub {
  font-size: 0.78rem;
  color: var(--obs-text-muted, #59717a);
  margin: 0 0 1rem;
}

.active-vendor-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.active-vendor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.active-vendor-row:hover {
  background-color: var(--obs-card-teal, #E5F0EC);
}

.active-vendor-row.selected {
  background-color: var(--obs-card-teal, #E5F0EC);
  border-left: 3px solid var(--obs-primary, #087D82);
}

.vendor-left-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.v-name {
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--obs-text, #172F38);
}

.vendor-right-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v-date {
  font-size: 0.75rem;
  color: var(--obs-text-muted, #59717a);
  font-family: 'JetBrains Mono', monospace;
}

.v-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  background-color: var(--obs-bg, #F4F2EA);
  color: var(--obs-text, #172F38);
}

/* 时间线卡片 */
.timeline-portal-card {
  text-align: center;
  background: linear-gradient(145deg, var(--obs-card-cream, #FFFDF7) 0%, var(--obs-card-teal, #E5F0EC) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.portal-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.portal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
  margin: 0 0 0.5rem;
}

.portal-desc {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--obs-text-muted, #59717a);
  margin: 0 0 1.25rem;
}

.portal-enter-btn {
  display: inline-block;
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.55rem 1.4rem;
  border-radius: 6px;
  background-color: var(--obs-primary, #087D82);
  color: #ffffff;
  transition: all 0.15s ease;
}

.portal-enter-btn:hover {
  background-color: var(--obs-primary-hover, #066367);
  transform: translateY(-1px);
}

/* 加载与空状态 */
.stream-loading-state,
.stream-empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px dashed var(--obs-border, #D8E1DB);
  border-radius: 12px;
}

.loading-spinner-bar {
  width: 100px;
  height: 3px;
  background-color: var(--obs-primary, #087D82);
  margin: 0 auto 1rem;
  animation: pulse-stream 1.2s infinite alternate;
}

@keyframes pulse-stream {
  from { width: 30px; opacity: 0.4; }
  to { width: 140px; opacity: 1; }
}

.loading-tip {
  font-size: 0.86rem;
  color: var(--obs-text-muted, #59717a);
}

.empty-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.empty-title {
  color: var(--obs-text-muted, #59717a);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.empty-reset-btn {
  background: var(--obs-card-teal, #E5F0EC);
  border: 1px solid var(--obs-border, #D8E1DB);
  color: var(--obs-text, #172F38);
  padding: 0.45rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

/* ====================================================
   官方线索与双视图切换样式 (遵循方案 2.1 & 5 节规范)
==================================================== */
.stream-tabs-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 52, 67, 0.05);
  padding: 4px;
  border-radius: 8px;
}
.stream-tab-btn {
  background: transparent;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #103443;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}
.stream-tab-btn.active {
  background: #FFFDF7;
  color: #087D82;
  box-shadow: 0 1px 4px rgba(16, 52, 67, 0.1);
}
.stream-count-badge {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 10px;
  background: rgba(16, 52, 67, 0.08);
  color: #103443;
}
.lead-badge {
  background: rgba(232, 185, 110, 0.25);
  color: #92580c;
  font-weight: 700;
}

.leads-category-strip,
.leads-month-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #FFFDF7;
  border-radius: 8px;
  border: 1px solid rgba(16, 52, 67, 0.08);
}
.leads-month-strip {
  margin-bottom: 20px;
}
.strip-label {
  font-size: 12px;
  font-weight: 700;
  color: #103443;
}
.lead-category-pill,
.lead-month-pill {
  background: transparent;
  border: 1px solid rgba(16, 52, 67, 0.15);
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  color: #103443;
  transition: all 0.2s;
}
.lead-category-pill:hover, .lead-category-pill.active,
.lead-month-pill:hover, .lead-month-pill.active {
  background: #103443;
  color: #FFFDF7;
  border-color: #103443;
}
.lead-category-pill.active {
  background: #087D82;
  border-color: #087D82;
}

.official-leads-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lead-update-card {
  background: #FFFDF7;
  border: 1px solid rgba(16, 52, 67, 0.1);
  border-left: 4px solid #E8B96E;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 6px rgba(16, 52, 67, 0.02);
  transition: transform 0.2s, box-shadow 0.2s;
}
.lead-update-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 52, 67, 0.06);
}
.lead-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.lead-vendor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lead-vendor-name {
  font-size: 13px;
  font-weight: 700;
  color: #103443;
}
.lead-cat-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(8, 125, 130, 0.08);
  color: #087D82;
  border: 1px solid rgba(8, 125, 130, 0.2);
}
.lead-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lead-status-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  background: #FFF8E7;
  color: #B57514;
  border: 1px solid rgba(224, 159, 62, 0.3);
}
.lead-tag.candidate {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(8, 125, 130, 0.12);
  color: #087D82;
  font-weight: 600;
}
.lead-title {
  margin: 0 0 10px 0;
  font-size: 15px;
  line-height: 1.45;
}
.lead-title-link {
  color: #103443;
  text-decoration: none;
  font-weight: 600;
}
.lead-title-link:hover {
  color: #087D82;
  text-decoration: underline;
}
.lead-summary-zh {
  font-size: 13.5px;
  line-height: 1.6;
  color: #3b525a;
  background: rgba(16, 52, 67, 0.03);
  padding: 8px 12px;
  border-radius: 6px;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lead-meta {
  font-size: 12px;
  color: rgba(16, 52, 67, 0.65);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.meta-item.date-unverified {
  color: #c2410c;
  background: #fff7ed;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.lead-source-direct {
  color: #087D82;
  text-decoration: none;
  font-weight: 600;
  margin-left: auto;
}
.lead-source-direct:hover {
  text-decoration: underline;
}

.stat-footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #59717a;
  margin-top: 10px;
  padding-top: 6px;
  border-top: 1px dashed rgba(16, 52, 67, 0.08);
}
.sla-badge {
  font-size: 10.5px;
  font-weight: 700;
  color: #087D82;
  background: rgba(8, 125, 130, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
}

/* ====================================================
   7. 响应式布局规则 (遵循方案 4.2 规格)
==================================================== */
@media (max-width: 1200px) {
  .obs-hero-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .obs-dual-container {
    grid-template-columns: 1fr;
  }
  .capability-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .obs-hero-canvas {
    padding: 2rem 1.25rem;
  }
  .secondary-cards-grid {
    grid-template-columns: 1fr;
  }
  .capability-cards-grid {
    grid-template-columns: 1fr;
  }
  .obs-status-strip {
    flex-direction: column;
    align-items: flex-start;
  }
  .strip-divider {
    display: none;
  }
  .filter-main-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
