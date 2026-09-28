<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { aiApi } from '../../api/ai.js'

const router = useRouter()

const models = ref([])
const vendors = ref([])
const loading = ref(true)

// 筛选与搜索
const searchKeyword = ref('')
const selectedVendorId = ref('')
const selectedModality = ref('')
const selectedStatus = ref('')

const capabilityOptions = [
  { key: '', label: '全部能力' },
  { key: '文本', label: '🧠 文本与推理' },
  { key: '代码', label: '⚡ 代码智能' },
  { key: '视觉', label: '👁️ 视觉与多模态' },
  { key: '语音', label: '🎙️ 语音交互' },
]

const statusOptions = [
  { key: '', label: '全部开放形态' },
  { key: 'WEIGHTS_OPEN', label: '模型权重开源 [WEIGHTS_OPEN]' },
  { key: 'API_ONLY', label: '仅限云端 API [API_ONLY]' },
  { key: 'AVAILABLE', label: '全面商用就绪 [AVAILABLE]' },
  { key: 'PREVIEW', label: '公测/预览体验 [PREVIEW]' },
]

const modelsVendorCount = computed(() => {
  return new Set(models.value.map(m => m.vendorId)).size
})

const errorMsg = ref('')

async function loadData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [modelsRes, vendorsRes] = await Promise.all([
      aiApi.getModels(),
      aiApi.getVendors(),
    ])
    models.value = modelsRes || []
    vendors.value = vendorsRes || []
  } catch (e) {
    console.error('加载模型数据失败', e)
    errorMsg.value = e.message || '加载模型档案失败，请检查网络或后端服务'
  } finally {
    loading.value = false
  }
}

const filteredModels = computed(() => {
  return models.value.filter(m => {
    // 厂商匹配
    if (selectedVendorId.value && String(m.vendorId) !== String(selectedVendorId.value)) {
      return false
    }
    // 状态匹配
    if (selectedStatus.value && m.availabilityStatus !== selectedStatus.value) {
      return false
    }
    // 模态能力匹配
    if (selectedModality.value) {
      if (!m.modalities || !m.modalities.includes(selectedModality.value)) {
        return false
      }
    }
    // 关键词匹配
    if (searchKeyword.value.trim()) {
      const q = searchKeyword.value.trim().toLowerCase()
      const matchName = m.displayName && m.displayName.toLowerCase().includes(q)
      const matchSeries = m.series && m.series.toLowerCase().includes(q)
      const matchKey = m.modelKey && m.modelKey.toLowerCase().includes(q)
      const matchVendor = m.vendorName && m.vendorName.toLowerCase().includes(q)
      if (!matchName && !matchSeries && !matchKey && !matchVendor) {
        return false
      }
    }
    return true
  })
})

function parseModalities(modStr) {
  if (!modStr) return []
  return modStr.split(',').map(s => s.trim()).filter(Boolean)
}

function getStatusBadge(status) {
  if (status === 'WEIGHTS_OPEN') {
    return { text: '权重开源', color: '#E8B96E', bg: 'rgba(232, 185, 110, 0.15)' }
  }
  if (status === 'API_ONLY') {
    return { text: '云端 API', color: '#087D82', bg: 'rgba(8, 125, 130, 0.15)' }
  }
  if (status === 'AVAILABLE') {
    return { text: '全面可用', color: '#76D4CE', bg: 'rgba(118, 212, 206, 0.15)' }
  }
  if (status === 'PREVIEW') {
    return { text: '公测预览', color: '#EA735C', bg: 'rgba(234, 115, 92, 0.15)' }
  }
  return { text: '收录中', color: '#59717a', bg: 'rgba(89, 113, 122, 0.1)' }
}

function resetFilters() {
  searchKeyword.value = ''
  selectedVendorId.value = ''
  selectedModality.value = ''
  selectedStatus.value = ''
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="models-observatory-page">
    <!-- 头部标头 -->
    <header class="page-header-block">
      <div class="header-pre-badge">
        <span class="badge-dot"></span>
        <span class="badge-txt">MODEL CATALOG // 前沿大模型档案库</span>
      </div>
      <h1 class="page-title">AI 大模型档案库</h1>
      <p class="page-desc">
        收录全球前沿核心大模型基准档案与衍生代际，建立规范化标识与官方存证索引，支持按研发厂商、核心能力与开放形态多维检索。
      </p>

      <!-- 统计指标条 -->
      <div class="models-stats-bar">
        <div class="stat-pill">
          <span class="stat-k">本站建档基准模型:</span>
          <span class="stat-v">{{ models.length }} 款</span>
        </div>
        <div class="stat-pill">
          <span class="stat-k">已建档覆盖厂商:</span>
          <span class="stat-v highlight">{{ modelsVendorCount }} 家</span>
        </div>
        <div class="stat-pill">
          <span class="stat-k">总巡检厂商基数:</span>
          <span class="stat-v">{{ vendors.length }} 家</span>
        </div>
        <div class="stat-pill">
          <span class="stat-k">当前筛选匹配:</span>
          <span class="stat-v highlight-amber">{{ filteredModels.length }} 项</span>
        </div>
      </div>
    </header>

    <!-- 检索与控制面板 -->
    <section class="control-panel">
      <!-- 搜索主行 -->
      <div class="search-row">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索模型名称、系列代号、研发厂商或关键词..."
            class="search-input"
          />
          <button v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''">×</button>
        </div>

        <!-- 厂商下拉 -->
        <select v-model="selectedVendorId" class="filter-select">
          <option value="">全部研发厂商 ({{ vendors.length }})</option>
          <option v-for="v in vendors" :key="v.id" :value="v.id">
            {{ v.name }}
          </option>
        </select>

        <!-- 开放状态下拉 -->
        <select v-model="selectedStatus" class="filter-select">
          <option v-for="opt in statusOptions" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- 核心能力探索标签行 (方案第 5 节：沿用同一能力类别语言) -->
      <div class="capability-chips-row">
        <span class="chip-label">核心能力分类：</span>
        <div class="chip-buttons">
          <button
            v-for="cap in capabilityOptions"
            :key="cap.key"
            class="cap-filter-chip"
            :class="{ active: selectedModality === cap.key }"
            @click="selectedModality = cap.key"
          >
            {{ cap.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- 加载中 -->
    <div v-if="loading" class="models-loading-grid">
      <div v-for="i in 6" :key="i" class="skeleton-model-card"></div>
    </div>

    <!-- 空数据提示 -->
    <div v-else-if="filteredModels.length === 0" class="models-empty-box">
      <span class="empty-icon">📂</span>
      <h3 class="empty-title">未找到匹配的模型档案</h3>
      <p class="empty-sub">尝试放宽搜索关键字或重置筛选条件</p>
      <button class="reset-filter-btn" @click="resetFilters">重置全部筛选条件</button>
    </div>

    <!-- 模型网格卡片 (方案第 5 节：突出模型名、厂商、发布日期；开放方式与模态是辅助信息) -->
    <div v-else class="models-grid">
      <article
        v-for="m in filteredModels"
        :key="m.id"
        class="model-card"
        @click="router.push(`/models/${m.id}`)"
      >
        <div class="card-top-meta">
          <div class="vendor-tag">
            <span class="vendor-dot" :style="{ backgroundColor: m.brandColor || 'var(--obs-primary)' }"></span>
            <span class="vendor-name">{{ m.vendorName || 'AI Lab' }}</span>
          </div>

          <!-- 开放状态辅助徽记 -->
          <span
            class="status-badge"
            :style="{
              color: getStatusBadge(m.availabilityStatus).color,
              backgroundColor: getStatusBadge(m.availabilityStatus).bg,
            }"
          >
            {{ getStatusBadge(m.availabilityStatus).text }}
          </span>
        </div>

        <!-- 模型核心名称 (突出大字重) -->
        <h3 class="model-title">{{ m.displayName }}</h3>
        
        <div class="model-series-line">
          <span v-if="m.series" class="series-tag">系列: {{ m.series }}</span>
          <span v-if="m.modelKey" class="key-tag font-mono">{{ m.modelKey }}</span>
        </div>

        <!-- 模态标签群 -->
        <div class="modalities-group">
          <span
            v-for="mod in parseModalities(m.modalities)"
            :key="mod"
            class="mod-tag"
          >
            #{{ mod }}
          </span>
        </div>

        <!-- 底部发布与进入详情入口 -->
        <div class="card-footer">
          <span class="enter-detail-link">演进历程与证据链 →</span>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.models-observatory-page {
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

.models-stats-bar {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: baseline;
  gap: 6px;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.stat-k {
  color: var(--obs-text-muted, #59717a);
}

.stat-v {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--obs-text, #172F38);
}

.stat-v.highlight {
  color: var(--obs-primary, #087D82);
}

.stat-v.highlight-amber {
  color: var(--obs-accent-amber, #E8B96E);
}

/* 控制栏 */
.control-panel {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 0.88rem;
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
}

.search-input:focus {
  border-color: var(--obs-primary, #087D82);
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--obs-text-muted, #59717a);
  cursor: pointer;
}

.filter-select {
  padding: 0.55rem 1rem;
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 8px;
  background-color: var(--obs-bg, #F4F2EA);
  color: var(--obs-text, #172F38);
  font-size: 0.88rem;
  outline: none;
  cursor: pointer;
}

.filter-select:focus {
  border-color: var(--obs-primary, #087D82);
}

.capability-chips-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--obs-border, #D8E1DB);
}

.chip-label {
  font-size: 0.82rem;
  color: var(--obs-text-muted, #59717a);
}

.chip-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cap-filter-chip {
  background-color: var(--obs-bg, #F4F2EA);
  border: 1px solid var(--obs-border, #D8E1DB);
  color: var(--obs-text, #172F38);
  font-size: 0.82rem;
  font-weight: 550;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cap-filter-chip:hover {
  border-color: var(--obs-primary, #087D82);
}

.cap-filter-chip.active {
  background-color: var(--obs-primary, #087D82);
  color: #ffffff;
  border-color: var(--obs-primary, #087D82);
}

/* 模型网格 */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.model-card {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.model-card:hover {
  transform: translateY(-2px);
  border-color: var(--obs-primary, #087D82);
  box-shadow: 0 8px 24px rgba(23, 47, 56, 0.08);
}

.card-top-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vendor-tag {
  display: flex;
  align-items: center;
  gap: 7px;
}

.vendor-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.vendor-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--obs-text, #172F38);
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}

.model-title {
  font-size: 1.35rem;
  font-weight: 850;
  color: var(--obs-text, #172F38);
  margin: 0;
  line-height: 1.25;
}

.model-series-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--obs-text-muted, #59717a);
}

.series-tag {
  background-color: var(--obs-card-teal, #E5F0EC);
  padding: 1px 6px;
  border-radius: 3px;
}

.key-tag {
  opacity: 0.8;
}

.modalities-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.mod-tag {
  font-size: 0.74rem;
  color: var(--obs-text-muted, #59717a);
  background-color: var(--obs-bg, #F4F2EA);
  padding: 1px 6px;
  border-radius: 3px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid var(--obs-border, #D8E1DB);
  padding-top: 0.75rem;
  margin-top: auto;
}

.enter-detail-link {
  font-size: 0.82rem;
  font-weight: 650;
  color: var(--obs-primary, #087D82);
}

/* 骨架与空状态 */
.models-loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.skeleton-model-card {
  height: 220px;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  opacity: 0.5;
}

.models-empty-box {
  text-align: center;
  padding: 4rem 1.5rem;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px dashed var(--obs-border, #D8E1DB);
  border-radius: 12px;
}

.empty-icon {
  font-size: 2.4rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 750;
  color: var(--obs-text, #172F38);
  margin: 0 0 0.5rem;
}

.empty-sub {
  font-size: 0.88rem;
  color: var(--obs-text-muted, #59717a);
  margin: 0 0 1.25rem;
}

.reset-filter-btn {
  background-color: var(--obs-primary, #087D82);
  color: #ffffff;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
</style>
