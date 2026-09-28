<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { aiApi } from '../../api/ai.js'
import {
  normalizeElo,
  normalizePercent,
  calculateModelTier,
  getModelTierName
} from '../../utils/scale.js'

const route = useRoute()
const router = useRouter()

const model = ref(null)
const relatedEvents = ref([])
const benchmarks = ref(null)
const benchmarkLoading = ref(false)
const loading = ref(true)
const errorMsg = ref('')
const eventsErrorMsg = ref('')

async function loadDetail() {
  loading.value = true
  errorMsg.value = ''
  eventsErrorMsg.value = ''
  const modelId = route.params.id
  try {
    const modelRes = await aiApi.getModelDetail(modelId)
    model.value = modelRes
  } catch (err) {
    console.error('加载模型详情失败', err)
    errorMsg.value = err.message || '未找到该模型档案，可能尚未收录或已被移除'
    loading.value = false
    return
  }

  // 加载评测战绩与事件
  try {
    const [eventsRes, benchmarkRes] = await Promise.all([
      aiApi.getModelEvents(modelId).catch(() => []),
      aiApi.getModelBenchmarks(modelId).catch(() => null)
    ])
    relatedEvents.value = eventsRes || []
    benchmarks.value = Array.isArray(benchmarkRes) && benchmarkRes.length > 0 ? benchmarkRes[0] : (benchmarkRes || null)
  } catch (err) {
    console.error('加载模型关联数据失败', err)
    eventsErrorMsg.value = '加载官方演进历史失败，请点击重试'
  } finally {
    loading.value = false
  }
}

async function retryLoadEvents() {
  const modelId = route.params.id
  eventsErrorMsg.value = ''
  try {
    const eventsRes = await aiApi.getModelEvents(modelId)
    relatedEvents.value = eventsRes || []
  } catch (err) {
    console.error('重试加载模型事件失败', err)
    eventsErrorMsg.value = '重试加载失败，请检查网络或后端服务'
  }
}

function parseModalities(modStr) {
  if (!modStr) return []
  return modStr.split(',').map(s => s.trim()).filter(Boolean)
}

function getStatusBadge(status) {
  if (status === 'WEIGHTS_OPEN') {
    return { text: '权重完全开源', color: '#E8B96E', bg: 'rgba(232, 185, 110, 0.15)' }
  }
  if (status === 'API_ONLY') {
    return { text: '仅限云端 API', color: '#087D82', bg: 'rgba(8, 125, 130, 0.15)' }
  }
  if (status === 'AVAILABLE') {
    return { text: '全面商用就绪', color: '#76D4CE', bg: 'rgba(118, 212, 206, 0.15)' }
  }
  if (status === 'PREVIEW') {
    return { text: '公测/预览体验', color: '#EA735C', bg: 'rgba(234, 115, 92, 0.15)' }
  }
  return { text: status || '收录中', color: '#59717a', bg: 'rgba(89, 113, 122, 0.1)' }
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

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="model-detail-page">
    <!-- 顶部返回导航 -->
    <nav class="back-nav-bar">
      <router-link to="/models" class="back-link-btn">
        ← 返回模型档案库
      </router-link>
    </nav>

    <!-- 加载中 -->
    <div v-if="loading" class="detail-loading-box">
      <div class="loading-pulse-bar"></div>
      <p class="loading-tip">正在加载模型档案与官方存证证据...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="errorMsg" class="detail-error-card">
      <span class="error-ico">⚠️</span>
      <h3 class="error-title">无法查看模型档案</h3>
      <p class="error-desc">{{ errorMsg }}</p>
      <router-link to="/models" class="error-back-btn">返回模型目录</router-link>
    </div>

    <!-- 详情正文 -->
    <div v-else-if="model" class="detail-content-wrap">
      <!-- 头部深海蓝概览大画布 -->
      <section class="model-hero-card">
        <div class="hero-top-strip">
          <div class="vendor-identity">
            <span class="vendor-dot" :style="{ backgroundColor: model.brandColor || 'var(--obs-primary)' }"></span>
            <router-link
              v-if="model.vendorSlug"
              :to="`/vendors/${model.vendorSlug}`"
              class="vendor-anchor"
            >
              {{ model.vendorName }}
            </router-link>
            <span v-else class="vendor-name-txt">{{ model.vendorName }}</span>
          </div>

          <span
            class="status-pill"
            :style="{
              color: getStatusBadge(model.availabilityStatus).color,
              backgroundColor: getStatusBadge(model.availabilityStatus).bg,
            }"
          >
            {{ getStatusBadge(model.availabilityStatus).text }}
          </span>
        </div>

        <h1 class="model-hero-title">{{ model.displayName }}</h1>

        <div class="model-meta-line">
          <span v-if="model.series" class="meta-item">所属系列: {{ model.series }}</span>
          <span v-if="model.modelKey" class="meta-item font-mono">标识: {{ model.modelKey }}</span>
          <span v-if="model.officialReleaseDate" class="meta-item">
            原厂官宣发布: <strong>{{ formatDate(model.officialReleaseDate) }}</strong>
          </span>
          <span v-else-if="model.createdAt" class="meta-item">收录时间: {{ formatDate(model.createdAt) }}</span>
        </div>

        <!-- 中文核心技术简介与定位 -->
        <div v-if="model.summaryZh" class="hero-summary-box">
          <p class="hero-summary-txt">{{ model.summaryZh }}</p>
        </div>

        <!-- 模态标签群与外链快捷直达 -->
        <div class="modalities-tag-group">
          <span
            v-for="m in parseModalities(model.modalities)"
            :key="m"
            class="hero-mod-pill"
          >
            #{{ m }}
          </span>
          <a
            v-if="model.modelCardUrl"
            :href="model.modelCardUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="hero-card-link"
          >
            📄 官方模型卡 / 技术报告 ↗
          </a>
        </div>
      </section>

      <!-- 核心客观技术规格网格 (基于官方真实可信档案，杜绝假断言) -->
      <section class="model-specs-grid">
        <div class="spec-card">
          <span class="spec-label">权威官宣发布日</span>
          <span class="spec-val font-mono">{{ model.officialReleaseDate ? formatDate(model.officialReleaseDate) : '暂无可信公开数据' }}</span>
          <span class="spec-sub">官方原厂对外公开发布节点</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">上下文窗口规模</span>
          <span class="spec-val font-mono">{{ model.contextWindow || '暂无可信公开数据' }}</span>
          <span class="spec-sub">原生混合处理最大窗口</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">参数架构与规模</span>
          <span class="spec-val">{{ model.parameterSize || '暂无可信公开数据' }}</span>
          <span class="spec-sub">Dense / MoE 激活及总规模</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">开源 / 交付许可</span>
          <span class="spec-val font-mono">{{ model.license || (model.availabilityStatus === 'WEIGHTS_OPEN' ? '开源协议' : 'Proprietary') }}</span>
          <span class="spec-sub">使用权限与商用条款定义</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">交付开放形态</span>
          <span class="spec-val font-mono">{{ getStatusBadge(model.availabilityStatus).text }}</span>
          <span class="spec-sub">{{ model.availabilityStatus === 'WEIGHTS_OPEN' ? '开源权重可本地私有化部署' : '官方云端托管推理 API' }}</span>
        </div>
        <div class="spec-card">
          <span class="spec-label">官方模型卡与技术报告</span>
          <div v-if="model.modelCardUrl" class="spec-val-link-wrap">
            <a :href="model.modelCardUrl" target="_blank" rel="noopener noreferrer" class="spec-link">
              查看原厂技术报告 ↗
            </a>
          </div>
          <span v-else class="spec-val text-muted">暂无官方独立外链</span>
          <span class="spec-sub">HuggingFace / 官方博客 / 原创论文</span>
        </div>
      </section>

      <!-- 权威学术与工程基准评测战绩 (方案阶段 4 + 阶段 5 评测标尺) -->
      <section v-if="benchmarks && (benchmarks.arenaElo || benchmarks.sweBenchVerified || benchmarks.math500 || benchmarks.mmluPro)" class="model-benchmarks-section">
        <div class="section-title-line">
          <div class="title-with-pill">
            <h2 class="section-title">权威学术与工程基准战绩</h2>
            <span class="suite-pill">Epoch AI / LMSYS</span>
          </div>
          <span v-if="getModelTierName(benchmarks)" class="tier-pill-large" :class="`tier-${getModelTierName(benchmarks).toLowerCase().replace('+', '-plus')}`">
            战力评级: {{ getModelTierName(benchmarks) }}
          </span>
        </div>

        <div class="benchmarks-scale-grid">
          <!-- Arena ELO -->
          <div v-if="benchmarks.arenaElo != null" class="scale-metric-card">
            <div class="scale-metric-head">
              <span class="metric-name">Arena 竞技场 (LMSYS)</span>
              <span class="metric-val font-mono">{{ benchmarks.arenaElo }} ELO</span>
            </div>
            <div class="scale-track">
              <div class="scale-fill elo" :style="{ width: `${normalizeElo(benchmarks.arenaElo)}%` }"></div>
            </div>
            <span class="scale-note">盲测对战综合战力标尺 (基线 1000 ~ 峰值 1400)</span>
          </div>

          <!-- SWE-bench -->
          <div v-if="benchmarks.sweBenchVerified != null" class="scale-metric-card">
            <div class="scale-metric-head">
              <span class="metric-name">SWE-bench Verified (真实工程)</span>
              <span class="metric-val font-mono">{{ benchmarks.sweBenchVerified }}%</span>
            </div>
            <div class="scale-track">
              <div class="scale-fill coding" :style="{ width: `${normalizePercent(benchmarks.sweBenchVerified)}%` }"></div>
            </div>
            <span class="scale-note">GitHub 真实开源缺陷端到端修复率</span>
          </div>

          <!-- MATH-500 -->
          <div v-if="benchmarks.math500 != null" class="scale-metric-card">
            <div class="scale-metric-head">
              <span class="metric-name">MATH-500 (竞赛数学)</span>
              <span class="metric-val font-mono">{{ benchmarks.math500 }}%</span>
            </div>
            <div class="scale-track">
              <div class="scale-fill math" :style="{ width: `${normalizePercent(benchmarks.math500)}%` }"></div>
            </div>
            <span class="scale-note">高难度奥林匹克竞赛数学推演准确率</span>
          </div>

          <!-- MMLU-Pro -->
          <div v-if="benchmarks.mmluPro != null" class="scale-metric-card">
            <div class="scale-metric-head">
              <span class="metric-name">MMLU-Pro (跨学科知识)</span>
              <span class="metric-val font-mono">{{ benchmarks.mmluPro }}%</span>
            </div>
            <div class="scale-track">
              <div class="scale-fill reasoning" :style="{ width: `${normalizePercent(benchmarks.mmluPro)}%` }"></div>
            </div>
            <span class="scale-note">大学及专家级全学科综合知识理解</span>
          </div>
        </div>
      </section>

      <!-- 核心事件与官方发布证据链 -->
      <section class="events-history-section">
        <div class="section-title-line">
          <h2 class="section-title">官方发布历史与存证凭据</h2>
          <span class="section-count">共 {{ relatedEvents.length }} 项已核实记录</span>
        </div>

        <div v-if="eventsErrorMsg" class="no-events-box events-err-box">
          <p class="err-tip">{{ eventsErrorMsg }}</p>
          <button class="retry-btn" @click="retryLoadEvents">重试加载演进历程</button>
        </div>

        <div v-else-if="relatedEvents.length === 0" class="no-events-box">
          <div class="no-events-icon">📋</div>
          <h3 class="no-events-title">已收录基准档案，演进历程比对中</h3>
          <p class="no-events-desc">
            该模型已录入基准档案库。相关的代际首发、版本升级与官方存证正由巡检引擎持续比对中。
          </p>
          <router-link
            v-if="model.vendorSlug"
            :to="`/vendors/${model.vendorSlug}`"
            class="goto-vendor-btn font-mono"
          >
            查看 {{ model.vendorName }} 官方动态资讯 ↗
          </router-link>
        </div>

        <div v-else class="events-cards-list">
          <article
            v-for="ev in relatedEvents"
            :key="ev.id"
            class="event-history-card"
          >
            <div class="event-card-header">
              <div class="event-date-row">
                <span class="ev-date-icon">📅</span>
                <span class="ev-date-val">{{ formatDate(ev.releaseDate || ev.firstSeenAt) }}</span>
                <span v-if="ev.stage" class="ev-stage-tag">{{ ev.stage }}</span>
              </div>

              <span
                class="event-type-badge"
                :style="{
                  color: getEventTypeBadge(ev.eventType).color,
                  backgroundColor: getEventTypeBadge(ev.eventType).bg,
                }"
              >
                {{ getEventTypeBadge(ev.eventType).text }}
              </span>
            </div>

            <p class="ev-summary-content">{{ ev.summary }}</p>

            <!-- 官方证据外链列表 (重点突出真实官方存证) -->
            <div v-if="ev.evidences && ev.evidences.length > 0" class="evidence-list-block">
              <span class="evidence-heading">官方溯源存证依据：</span>
              <div class="evidence-links-wrap">
                <a
                  v-for="proof in ev.evidences"
                  :key="proof.id"
                  :href="proof.officialUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="official-proof-chip"
                >
                  <span class="proof-ico">🔗</span>
                  <span class="proof-title">{{ proof.title || '官方发布原文' }}</span>
                  <span class="proof-arrow">↗</span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.model-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  color: var(--obs-text, #172F38);
}

.back-nav-bar {
  display: flex;
  align-items: center;
}

.back-link-btn {
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--obs-primary, #087D82);
  transition: opacity 0.15s ease;
}

.back-link-btn:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* 头部深海蓝概览大画布 */
.model-hero-card {
  background-color: var(--obs-hero-bg, #103443);
  color: var(--obs-hero-text, #EFF4EF);
  border-radius: 16px;
  padding: 2.5rem clamp(1.5rem, 3.5vw, 3.5rem);
  box-shadow: 0 10px 30px rgba(16, 52, 67, 0.2);
}

.hero-top-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.vendor-identity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vendor-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.vendor-anchor {
  color: #ffffff;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 700;
}

.vendor-anchor:hover {
  text-decoration: underline;
}

.status-pill {
  font-size: 0.76rem;
  font-weight: 750;
  padding: 3px 10px;
  border-radius: 4px;
}

.model-hero-title {
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 850;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin: 0 0 1rem;
  line-height: 1.2;
}

.model-meta-line {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.88rem;
  color: rgba(239, 244, 239, 0.8);
  margin-bottom: 1.25rem;
}

.hero-summary-box {
  background: rgba(255, 255, 255, 0.08);
  border-left: 3px solid var(--obs-accent-amber, #E8B96E);
  border-radius: 6px;
  padding: 0.85rem 1.15rem;
  margin-bottom: 1.25rem;
  backdrop-filter: blur(4px);
}

.hero-summary-txt {
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgba(239, 244, 239, 0.95);
  margin: 0;
}

.modalities-tag-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-mod-pill {
  font-size: 0.8rem;
  color: rgba(239, 244, 239, 0.85);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.hero-card-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  background: rgba(232, 185, 110, 0.25);
  border: 1px solid rgba(232, 185, 110, 0.5);
  padding: 2px 10px;
  border-radius: 4px;
  transition: all 0.15s ease;
  margin-left: auto;
}

.hero-card-link:hover {
  background: rgba(232, 185, 110, 0.45);
  border-color: #E8B96E;
  text-decoration: none;
}

/* 核心规格与技术画像网格 */
.model-specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.spec-card {
  background: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1.15rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.spec-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--obs-text-muted, #59717a);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.spec-val {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
  word-break: break-word;
}

.spec-val.text-muted {
  color: var(--obs-text-muted, #8a9ea7);
  font-weight: 600;
  font-size: 0.95rem;
}

.spec-val-link-wrap {
  display: flex;
  align-items: center;
}

.spec-link {
  font-size: 0.95rem;
  font-weight: 750;
  color: var(--obs-primary, #087D82);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.spec-link:hover {
  text-decoration: underline;
  color: #055458;
}

.spec-sub {
  font-size: 0.78rem;
  color: var(--obs-text-muted, #59717a);
}

.text-amber {
  color: #c98a2c !important;
}

/* 官方发布历史与证据链 */
.events-history-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid var(--obs-border, #D8E1DB);
  padding-bottom: 0.75rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--obs-text, #172F38);
  margin: 0;
}

.section-count {
  font-size: 0.85rem;
  color: var(--obs-text-muted, #59717a);
}

.events-cards-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.event-history-card {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  transition: all 0.2s ease;
}

.event-history-card:hover {
  border-color: var(--obs-primary, #087D82);
  box-shadow: 0 6px 18px rgba(23, 47, 56, 0.06);
}

.event-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.event-date-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ev-date-icon {
  font-size: 0.9rem;
}

.ev-date-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 750;
  color: var(--obs-accent-amber, #E8B96E);
}

.ev-stage-tag {
  font-size: 0.75rem;
  background-color: var(--obs-card-teal, #E5F0EC);
  color: var(--obs-text, #172F38);
  padding: 2px 7px;
  border-radius: 4px;
}

.event-type-badge {
  font-size: 0.76rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.ev-summary-content {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--obs-text, #172F38);
  margin: 0 0 1.25rem;
}

.evidence-list-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--obs-bg, #F4F2EA);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.evidence-heading {
  font-size: 0.8rem;
  font-weight: 650;
  color: var(--obs-text-muted, #59717a);
}

.evidence-links-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.official-proof-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--obs-primary, #087D82);
  transition: all 0.15s ease;
}

.official-proof-chip:hover {
  border-color: var(--obs-primary, #087D82);
  background-color: var(--obs-card-teal, #E5F0EC);
}

/* 异常状态与加载 */
.detail-loading-box,
.detail-error-card,
.no-events-box {
  text-align: center;
  padding: 4rem 1.5rem;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px dashed var(--obs-border, #D8E1DB);
  border-radius: 12px;
}

.loading-pulse-bar {
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
  font-size: 0.88rem;
  color: var(--obs-text-muted, #59717a);
}

.error-ico {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.error-title {
  font-size: 1.15rem;
  font-weight: 750;
  color: var(--obs-text, #172F38);
  margin: 0 0 0.5rem;
}

.error-desc {
  font-size: 0.9rem;
  color: var(--obs-text-muted, #59717a);
  margin: 0 0 1.25rem;
}

.error-back-btn {
  display: inline-block;
  text-decoration: none;
  background-color: var(--obs-primary, #087D82);
  color: #ffffff;
  padding: 0.45rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.88rem;
}

.events-err-box {
  background-color: #fef2f2 !important;
  border-color: #fca5a5 !important;
}

.err-tip {
  color: #dc2626;
  font-size: 0.92rem;
  margin-bottom: 0.8rem;
}

.retry-btn {
  padding: 6px 16px;
  background-color: var(--obs-primary, #087D82);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.no-events-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.no-events-title {
  font-size: 1.1rem;
  font-weight: 750;
  color: var(--obs-text, #172F38);
  margin: 0 0 0.5rem;
}

.no-events-desc {
  font-size: 0.88rem;
  color: var(--obs-text-muted, #59717a);
  max-width: 520px;
  margin: 0 auto 1.25rem;
  line-height: 1.55;
}

.goto-vendor-btn {
  display: inline-block;
  text-decoration: none;
  background-color: var(--obs-primary, #087D82);
  color: #ffffff;
  padding: 0.45rem 1.2rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* 评测战绩标尺网格 */
.model-benchmarks-section {
  background-color: var(--obs-card-bg, #ffffff);
  border: 1px solid var(--obs-card-border, rgba(16, 52, 67, 0.08));
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--obs-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
}
.title-with-pill {
  display: flex;
  align-items: center;
  gap: 10px;
}
.suite-pill {
  font-size: 11px;
  font-weight: 700;
  color: #76D4CE;
  background: #103443;
  padding: 2px 8px;
  border-radius: 4px;
}
.tier-pill-large {
  font-size: 12px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 6px;
}
.tier-pill-large.tier-s-plus {
  background: #f43f5e;
  color: #ffffff;
}
.tier-pill-large.tier-s {
  background: #E8B96E;
  color: #382404;
}
.tier-pill-large.tier-a {
  background: #76D4CE;
  color: #0f3c3a;
}
.tier-pill-large.tier-b {
  background: rgba(8, 125, 130, 0.15);
  color: #087D82;
}
.tier-pill-large.tier-c {
  background: #ecefe8;
  color: #4b635d;
}
.benchmarks-scale-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 1rem;
}
.scale-metric-card {
  background: rgba(16, 52, 67, 0.02);
  border: 1px solid rgba(16, 52, 67, 0.06);
  border-radius: 8px;
  padding: 12px 14px;
}
.scale-metric-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.metric-name {
  font-size: 12px;
  font-weight: 700;
  color: #103443;
}
.metric-val {
  font-size: 13px;
  font-weight: 800;
  color: #087D82;
}
.scale-track {
  height: 6px;
  background: rgba(16, 52, 67, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}
.scale-fill {
  height: 100%;
  border-radius: 3px;
  background: #087D82;
  transition: width 0.5s ease;
}
.scale-fill.elo {
  background: #E8B96E;
}
.scale-fill.coding {
  background: #76D4CE;
}
.scale-fill.math {
  background: #087D82;
}
.scale-fill.reasoning {
  background: #EA735C;
}
.scale-note {
  font-size: 10.5px;
  color: #718892;
  display: block;
}
</style>
