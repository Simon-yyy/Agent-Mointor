<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { aiApi } from '../../api/ai.js'
import { authApi } from '../../api/auth.js'
import Pagination from '../../components/Pagination.vue'

const router = useRouter()

// 选项卡：candidates (待审队列) | sources (官方信源监控)
const currentTab = ref('candidates')

// 指标看板
const stats = ref({
  pendingCount: 0,
  activeSources: 0,
  abnormalSources: 0,
  totalEvents: 0,
  lastCheckTime: '—'
})

// 候选列表状态
const candidates = ref([])
const totalCandidates = ref(0)
const candPage = ref(1)
const candSize = ref(8)
const candTotalPages = ref(1)
const candStatusFilter = ref('PENDING')
const candKeyword = ref('')
const loadingCandidates = ref(false)

// 审核弹窗控制
const showApproveModal = ref(false)
const currentCandidate = ref(null)
const approveForm = ref({
  vendorId: 1,
  modelKey: '',
  displayName: '',
  series: '',
  version: '1.0',
  modalities: '文本,混合推理',
  availabilityStatus: 'API_ONLY',
  eventType: 'MODEL_RELEASE',
  stage: '正式发布',
  releaseDate: '',
  summary: '',
  reviewerNote: '经核实官方公告无误，准予发布'
})

// 厂商列表 (用于审核通过时下拉绑定)
const vendors = ref([])

// 信源监控状态
const sources = ref([])
const loadingSources = ref(false)
const crawling = ref(false)
const crawlResult = ref(null)

async function loadStats() {
  try {
    const data = await aiApi.getStatus()
    if (data) {
      stats.value = {
        pendingCount: data.pendingCandidates || 0,
        activeSources: data.activeSources || 0,
        abnormalSources: data.abnormalSources || 0,
        totalEvents: data.totalEvents || 0,
        lastCheckTime: data.lastCheckTime || '—'
      }
    }
  } catch (e) {
    console.error('获取监控统计失败', e)
  }
}

async function loadVendors() {
  try {
    const data = await aiApi.getVendors()
    vendors.value = data || []
  } catch (e) {
    console.error('加载厂商列表失败', e)
  }
}

async function loadCandidates() {
  loadingCandidates.value = true
  try {
    const res = await aiApi.getCandidates({
      status: candStatusFilter.value,
      keyword: candKeyword.value,
      page: candPage.value,
      size: candSize.value
    })
    candidates.value = res.list || []
    totalCandidates.value = res.total || 0
    candTotalPages.value = res.totalPages || 1
  } catch (e) {
    console.error('获取候选列表异常', e)
  } finally {
    loadingCandidates.value = false
  }
}

async function loadSources() {
  loadingSources.value = true
  try {
    const data = await aiApi.getAdminSources()
    sources.value = data || []
  } catch (e) {
    console.error('获取信源列表异常', e)
  } finally {
    loadingSources.value = false
  }
}

// 历史回填管理状态
const backfills = ref([])
const loadingBackfills = ref(false)
const backfillForm = ref({
  startDate: '2026-01-01',
  endDate: new Date().toISOString().slice(0, 10),
  dryRun: false
})
const startingBackfill = ref(false)

async function loadBackfills() {
  loadingBackfills.value = true
  try {
    const data = await aiApi.listBackfills()
    backfills.value = data || []
  } catch (e) {
    console.error('获取回填任务失败', e)
  } finally {
    loadingBackfills.value = false
  }
}

const coverageAudits = ref([])
const loadingCoverage = ref(false)

async function loadCoverageAudits() {
  loadingCoverage.value = true
  try {
    const data = await aiApi.getCoverage({ year: '2026' })
    coverageAudits.value = data || []
  } catch (e) {
    console.error('获取覆盖审计失败', e)
  } finally {
    loadingCoverage.value = false
  }
}

async function handleCreateBackfill() {
  startingBackfill.value = true
  try {
    await aiApi.createBackfill(backfillForm.value)
    alert('已成功创建后台回填任务，正在按月扫描推进...')
    await loadBackfills()
    await loadCoverageAudits()
  } catch (e) {
    alert('创建回填任务失败: ' + e.message)
  } finally {
    startingBackfill.value = false
  }
}

function handleTabChange(tab) {
  currentTab.value = tab
  if (tab === 'candidates') {
    loadCandidates()
  } else if (tab === 'sources') {
    loadSources()
  } else if (tab === 'backfills') {
    loadBackfills()
    loadCoverageAudits()
  }
}

function handleStatusFilter(status) {
  candStatusFilter.value = status
  candPage.value = 1
  loadCandidates()
}

function handleSearch() {
  candPage.value = 1
  loadCandidates()
}

function openApproveModal(cand) {
  currentCandidate.value = cand
  // 智能推断厂商
  let matchedVendor = vendors.value.find(v => 
    cand.guessVendorName && v.name.toLowerCase().includes(cand.guessVendorName.toLowerCase())
  )
  if (!matchedVendor && vendors.value.length > 0) {
    matchedVendor = vendors.value[0]
  }

  // 智能推断 modelKey
  let key = (cand.guessModelName || cand.rawTitle || 'model')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  approveForm.value = {
    vendorId: matchedVendor ? matchedVendor.id : 1,
    modelKey: key,
    displayName: cand.guessModelName || cand.rawTitle,
    series: cand.guessModelName ? cand.guessModelName.split(' ')[0] : 'Foundation',
    version: '1.0',
    modalities: '文本,混合推理',
    availabilityStatus: 'API_ONLY',
    eventType: 'MODEL_RELEASE',
    stage: '正式发布',
    releaseDate: cand.upstreamDate || new Date().toISOString().slice(0, 10),
    summary: cand.rawSummary || cand.rawTitle,
    reviewerNote: '经核验官方公告确凿，确认发布'
  }
  showApproveModal.value = true
}

async function submitApprove() {
  if (!approveForm.value.modelKey) {
    alert('请填写模型规范标识 (modelKey)')
    return
  }
  if (!approveForm.value.releaseDate) {
    alert('请填写官方发布日期')
    return
  }
  try {
    await aiApi.decideCandidate(currentCandidate.value.id, {
      action: 'APPROVE',
      ...approveForm.value
    })
    alert('审核通过！该事件已转正并发布到公开监控主页。')
    showApproveModal.value = false
    loadStats()
    loadCandidates()
  } catch (e) {
    alert('审核操作失败: ' + e.message)
  }
}

async function handleReject(cand) {
  const reason = prompt('请输入驳回该候选的原因批注：', '非模型发布公告或缺乏官方确切证据')
  if (reason === null) return
  try {
    await aiApi.decideCandidate(cand.id, {
      action: 'REJECT',
      reviewerNote: reason
    })
    alert('已成功驳回该候选条目')
    loadStats()
    loadCandidates()
  } catch (e) {
    alert('驳回失败: ' + e.message)
  }
}

async function handleToggleSource(source) {
  const targetActive = !source.is_active
  try {
    await aiApi.toggleSource(source.id, targetActive)
    source.is_active = targetActive ? 1 : 0
  } catch (e) {
    alert('修改信源状态失败: ' + e.message)
  }
}

async function handleTriggerCrawl() {
  if (crawling.value) return
  crawling.value = true
  crawlResult.value = null
  try {
    const res = await aiApi.triggerAdminCrawl()
    crawlResult.value = res
    alert(`巡检完成！耗时 ${res.durationMs || 0}ms，解析条目 ${res.parsedItems || 0}，新增候选 ${res.newCandidates || 0}`)
    loadStats()
    if (currentTab.value === 'candidates') loadCandidates()
    if (currentTab.value === 'sources') loadSources()
  } catch (e) {
    alert('巡检触发失败: ' + e.message)
  } finally {
    crawling.value = false
  }
}

function handleLogout() {
  if (confirm('确定要退出管理员登录吗？')) {
    authApi.logout()
    router.push('/')
  }
}

onMounted(() => {
  loadStats()
  loadVendors()
  loadCandidates()
})
</script>

<template>
  <div class="admin-console-page">
    <!-- 控制台极客顶栏 -->
    <header class="console-topbar-card">
      <div class="console-brand">
        <div class="console-shield-badge">🛰️</div>
        <div class="console-brand-text">
          <span class="console-title">模型监控管理控制台</span>
          <span class="console-runtime-badge">数据闭环 · 审核转正 · 信源状态</span>
        </div>
      </div>

      <nav class="console-nav-tabs">
        <router-link to="/admin/models" class="console-tab-item active">
          🤖 模型监控审核
        </router-link>
        <router-link to="/admin/articles" class="console-tab-item">
          📝 博文管理
        </router-link>
        <router-link to="/admin/works" class="console-tab-item">
          🛠️ 作品管理
        </router-link>
        <router-link to="/admin/articles/new" class="console-tab-item create-tab">
          ✍️ 撰写新博文
        </router-link>
      </nav>

      <div class="console-right-actions">
        <span class="admin-user-pill">👤 admin</span>
        <router-link to="/" target="_blank" class="preview-front-btn" title="在新标签页预览前台">
          ↗ 前台监控
        </router-link>
        <button class="console-logout-btn" title="安全退出登录" @click="handleLogout">
          登出
        </button>
      </div>
    </header>

    <!-- 4 色高光数据指标看板 -->
    <section class="admin-stats-grid">
      <div class="admin-stat-card stat-amber" :class="{ 'has-pending': stats.pendingCount > 0 }">
        <div class="stat-top">
          <span class="stat-icon">⏳</span>
          <span class="stat-tag">REVIEW QUEUE</span>
        </div>
        <div class="stat-number">{{ stats.pendingCount }}</div>
        <div class="stat-label">待审核候选条目</div>
      </div>

      <div class="admin-stat-card stat-cyan">
        <div class="stat-top">
          <span class="stat-icon">📡</span>
          <span class="stat-tag">ACTIVE FEEDS</span>
        </div>
        <div class="stat-number">{{ stats.activeSources }}</div>
        <div class="stat-label">已启用监控信源</div>
      </div>

      <div class="admin-stat-card stat-rose">
        <div class="stat-top">
          <span class="stat-icon">⚠️</span>
          <span class="stat-tag">FEED ISSUES</span>
        </div>
        <div class="stat-number">{{ stats.abnormalSources }}</div>
        <div class="stat-label">异常连接信源</div>
      </div>

      <div class="admin-stat-card stat-emerald">
        <div class="stat-top">
          <span class="stat-icon">🛡️</span>
          <span class="stat-tag">CONFIRMED EVENTS</span>
        </div>
        <div class="stat-number">{{ stats.totalEvents }}</div>
        <div class="stat-label">公开已核实事件</div>
      </div>
    </section>

    <!-- 管理工作台主区域 -->
    <main class="console-body">
      <!-- 模块二级切换与全局巡检按钮 -->
      <div class="work-toolbar">
        <div class="tab-pill-group">
          <button 
            class="tab-pill-btn" 
            :class="{ active: currentTab === 'candidates' }"
            @click="handleTabChange('candidates')"
          >
            📋 候选审核队列 ({{ stats.pendingCount }})
          </button>
          <button 
            class="tab-pill-btn" 
            :class="{ active: currentTab === 'sources' }"
            @click="handleTabChange('sources')"
          >
            🛰️ 官方信源状态 ({{ sources.length || stats.activeSources }})
          </button>
          <button 
            class="tab-pill-btn" 
            :class="{ active: currentTab === 'backfills' }"
            @click="handleTabChange('backfills')"
          >
            ⏳ 2026 历史回填
          </button>
        </div>

        <div class="toolbar-actions">
          <button 
            class="crawl-trigger-btn" 
            :disabled="crawling" 
            @click="handleTriggerCrawl"
          >
            <span class="crawl-spin" v-if="crawling">🔄</span>
            <span v-else>🚀</span>
            {{ crawling ? '正在执行全量抓取与解析...' : '立即执行全量巡检' }}
          </button>
        </div>
      </div>

      <!-- 选项卡 1: 待审候选队列 -->
      <section v-if="currentTab === 'candidates'" class="panel-section">
        <!-- 筛选与搜索 -->
        <div class="filter-bar">
          <div class="filter-pills">
            <button 
              class="pill-btn" 
              :class="{ active: candStatusFilter === 'PENDING' }"
              @click="handleStatusFilter('PENDING')"
            >待审核 ({{ stats.pendingCount }})</button>
            <button 
              class="pill-btn" 
              :class="{ active: candStatusFilter === 'CONFIRMED' }"
              @click="handleStatusFilter('CONFIRMED')"
            >已转正</button>
            <button 
              class="pill-btn" 
              :class="{ active: candStatusFilter === 'REJECTED' }"
              @click="handleStatusFilter('REJECTED')"
            >已驳回</button>
            <button 
              class="pill-btn" 
              :class="{ active: candStatusFilter === 'ALL' }"
              @click="handleStatusFilter('ALL')"
            >全部</button>
          </div>

          <div class="search-box">
            <input 
              v-model="candKeyword" 
              type="text" 
              placeholder="搜索标题、模型名或厂商..." 
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">🔍 检索</button>
          </div>
        </div>

        <!-- 候选列表 -->
        <div v-if="loadingCandidates" class="loading-state">
          <div class="spinner"></div>
          <p>正在读取候选消息队列...</p>
        </div>

        <div v-else-if="candidates.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <h4>当前队列暂无候选记录</h4>
          <p>官方信源巡检发现包含模型关键词的新动态后，将自动推送至本待审工作台。</p>
        </div>

        <div v-else class="candidates-grid">
          <div 
            v-for="cand in candidates" 
            :key="cand.id" 
            class="candidate-card"
            :class="'card-' + cand.status.toLowerCase()"
          >
            <div class="card-header">
              <div class="source-tag">
                <span class="source-icon">📡</span>
                <span class="source-name">{{ cand.sourceName }}</span>
              </div>
              <div class="status-pill" :class="'pill-' + cand.status.toLowerCase()">
                {{ cand.status === 'PENDING' ? '待审核' : (cand.status === 'CONFIRMED' ? '已转正' : '已驳回') }}
              </div>
            </div>

            <div class="card-meta">
              <span class="meta-vendor">推断厂商: <strong>{{ cand.guessVendorName || '未知' }}</strong></span>
              <span class="meta-sep">·</span>
              <span class="meta-model">推断模型: <strong>{{ cand.guessModelName || '待提取' }}</strong></span>
              <span class="meta-sep">·</span>
              <span class="meta-date">发布: {{ cand.upstreamDate || '待核实' }}</span>
            </div>

            <h3 class="card-title">
              <a :href="cand.evidenceUrl" target="_blank" rel="noopener noreferrer" title="查看官方公告原文">
                {{ cand.rawTitle }} ↗
              </a>
            </h3>

            <p class="card-summary" :title="cand.rawSummary">
              {{ cand.rawSummary || '暂无抓取摘要文本' }}
            </p>

            <div class="card-footer">
              <span class="seen-time">发现于 {{ cand.firstSeenAt }}</span>

              <div class="action-buttons" v-if="cand.status === 'PENDING'">
                <button class="btn-approve" @click="openApproveModal(cand)">
                  ✓ 审核通过并转正
                </button>
                <button class="btn-reject" @click="handleReject(cand)">
                  ✕ 驳回
                </button>
              </div>
              <div class="reviewer-note" v-else>
                <span class="note-label">审核批注:</span>
                <span class="note-text">{{ cand.reviewerNote || '无' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <Pagination 
          v-if="candTotalPages > 1" 
          :current="candPage" 
          :total="candTotalPages" 
          @change="(p) => { candPage = p; loadCandidates(); }"
        />
      </section>

      <!-- 选项卡 2: 官方信源状态 -->
      <section v-if="currentTab === 'sources'" class="panel-section">
        <div class="sources-card">
          <div class="sources-header">
            <div>
              <h3>全量官方来源巡检状态与健康度</h3>
              <p class="section-desc">已登记 {{ sources.length }} 条官方信源。系统通过防 XXE 标准 DOM 解析 XML 订阅与 HTML 官方发布页。</p>
            </div>
            <div class="last-check-badge">
              最近检查: {{ stats.lastCheckTime }}
            </div>
          </div>

          <div v-if="loadingSources" class="loading-state">
            <div class="spinner"></div>
            <p>正在拉取信源状态...</p>
          </div>

          <div v-else class="table-responsive">
            <table class="sources-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>所属厂商</th>
                  <th>信源 URL 与类型</th>
                  <th>状态</th>
                  <th>最近成功</th>
                  <th>异常排查</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sources" :key="s.id">
                  <td>#{{ s.id }}</td>
                  <td>
                    <span class="vendor-badge" :style="{ borderColor: s.brand_color, color: s.brand_color }">
                      {{ s.vendor_name }}
                    </span>
                  </td>
                  <td>
                    <div class="source-url-col">
                      <a :href="s.source_url" target="_blank" rel="noopener noreferrer" class="source-link">
                        {{ s.source_url }} ↗
                      </a>
                      <span class="type-tag">{{ s.source_type }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="health-pill" :class="{ 'healthy': s.failure_count === 0, 'faulty': s.failure_count > 0 }">
                      {{ s.failure_count === 0 ? '● 正常' : '▲ 失败 ' + s.failure_count + '次' }}
                    </span>
                  </td>
                  <td class="time-col">
                    {{ s.last_success_time || s.last_success_at || '尚无成功记录' }}
                  </td>
                  <td class="error-col">
                    <span v-if="s.last_error" class="error-text" :title="s.last_error">{{ s.last_error }}</span>
                    <span v-else class="no-error">—</span>
                  </td>
                  <td>
                    <button 
                      class="toggle-btn" 
                      :class="{ 'btn-on': s.is_active, 'btn-off': !s.is_active }"
                      @click="handleToggleSource(s)"
                    >
                      {{ s.is_active ? '已启用' : '已停用' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 选项卡 3: 2026 历史回填 -->
      <section v-if="currentTab === 'backfills'" class="panel-section">
        <div class="sources-card">
          <div class="sources-header">
            <div>
              <h3>2026 年官方发布历史回填与覆盖审计</h3>
              <p class="section-desc">从 2026-01-01 起按厂商与月份深入官方归档追溯历史模型，生成可核验已核实发布记录并识别覆盖缺口。</p>
            </div>
            <button class="crawl-trigger-btn" :disabled="startingBackfill" @click="handleCreateBackfill">
              <span>{{ startingBackfill ? '⏳ 启动中...' : '▶ 发起历史回填任务' }}</span>
            </button>
          </div>

          <!-- 回填参数设置 -->
          <div class="backfill-config-grid">
            <div class="config-col">
              <label>回填起始日期</label>
              <input v-model="backfillForm.startDate" type="date" />
            </div>
            <div class="config-col">
              <label>回填截止日期</label>
              <input v-model="backfillForm.endDate" type="date" />
            </div>
            <div class="config-col checkbox-col">
              <label class="checkbox-label">
                <input v-model="backfillForm.dryRun" type="checkbox" />
                仅试跑 (Dry-Run 模式，不正式入库)
              </label>
            </div>
          </div>

          <div v-if="loadingBackfills" class="loading-state">
            <div class="spinner"></div>
            <p>正在读取历史回填任务记录...</p>
          </div>

          <div v-else-if="backfills.length === 0" class="empty-state">
            <span class="empty-icon">⏳</span>
            <h4>暂无正在运行或已完成的历史回填任务</h4>
            <p>点击上方“发起历史回填任务”，系统将通过异步虚拟线程扫描已登记官方渠道并记录月份覆盖状态。</p>
          </div>

          <div v-else class="backfill-list">
            <div v-for="job in backfills" :key="job.jobId" class="backfill-job-card">
              <div class="job-header">
                <span class="job-id">任务编号: {{ job.jobId }}</span>
                <span class="job-status-pill" :class="'status-' + job.status.toLowerCase()">
                  {{ job.status === 'COMPLETED' ? '✓ 已完成' : (job.status === 'RUNNING' ? '⏳ 正在回填...' : '✕ 失败') }}
                </span>
              </div>
              <div class="job-meta">
                <span>范围: {{ job.startDate }} 至 {{ job.endDate }}</span>
                <span class="meta-sep">·</span>
                <span>处理信源: {{ job.sourcesProcessed }} 条</span>
                <span class="meta-sep">·</span>
                <span>发现候选: {{ job.candidatesFound }} 个</span>
                <span class="meta-sep">·</span>
                <span>匹配已核实: {{ job.confirmedEvents }} 条</span>
              </div>
              <!-- 覆盖缺口说明 -->
              <div v-if="job.coverageGaps && job.coverageGaps.length > 0" class="coverage-gaps-box">
                <div class="gap-title">⚠️ 来源覆盖缺口与审计提示：</div>
                <ul>
                  <li v-for="(gap, idx) in job.coverageGaps" :key="idx">{{ gap }}</li>
                </ul>
              </div>
              <!-- 执行日志摘要 -->
              <div class="job-logs-box">
                <div class="log-line" v-for="(log, idx) in job.logs" :key="idx">
                  [{{ job.startTime }}] {{ log }}
                </div>
              </div>
            </div>
          </div>

          <!-- 厂商月份覆盖审计矩阵 (source_coverage) -->
          <div class="coverage-matrix-container" style="margin-top: 32px;">
            <div class="matrix-header" style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: baseline;">
              <h4 style="margin: 0; font-size: 15px; color: #103443;">📊 2026 各月厂商官方覆盖审计矩阵</h4>
              <span class="matrix-sub" style="font-size: 12px; color: rgba(16, 52, 67, 0.65);">全量覆盖 (FULL) / 部分覆盖 (PARTIAL) / 缺口审计</span>
            </div>

            <div v-if="loadingCoverage" class="loading-state">
              <div class="spinner"></div>
              <p>正在读取覆盖审计矩阵...</p>
            </div>

            <div v-else-if="coverageAudits.length === 0" class="empty-state">
              <p>暂无覆盖审计数据，请先发起历史回填任务生成。</p>
            </div>

            <div v-else class="table-responsive">
              <table class="sources-table">
                <thead>
                  <tr>
                    <th>厂商</th>
                    <th>月份</th>
                    <th>覆盖状态</th>
                    <th>最早条目</th>
                    <th>最晚条目</th>
                    <th>审计说明 / 覆盖缺口</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cov in coverageAudits" :key="cov.vendorId + '-' + cov.coverageMonth">
                    <td>
                      <span class="vendor-badge" :style="{ borderColor: cov.brandColor, color: cov.brandColor }">
                        {{ cov.vendorName }}
                      </span>
                    </td>
                    <td><strong>{{ cov.coverageMonth }}</strong></td>
                    <td>
                      <span 
                        class="health-pill" 
                        :class="{ 'healthy': cov.status === 'FULL', 'faulty': cov.status !== 'FULL' }"
                      >
                        {{ cov.status === 'FULL' ? '● 已扫完 (FULL)' : '▲ 部分覆盖 (PARTIAL)' }}
                      </span>
                    </td>
                    <td>{{ cov.earliestItemDate || '—' }}</td>
                    <td>{{ cov.latestItemDate || '—' }}</td>
                    <td class="error-col">
                      <span :title="cov.gapNotes">{{ cov.gapNotes || '正常扫描' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 审核转正弹窗 -->
    <div v-if="showApproveModal" class="modal-backdrop" @click.self="showApproveModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>✅ 候选审核确认并转正为公开事件</h3>
          <button class="close-btn" @click="showApproveModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <label>所属厂商 *</label>
            <select v-model="approveForm.vendorId">
              <option v-for="v in vendors" :key="v.id" :value="v.id">{{ v.name }} ({{ v.slug }})</option>
            </select>
          </div>

          <div class="form-row-2">
            <div class="form-col">
              <label>模型唯一键 (modelKey) *</label>
              <input v-model="approveForm.modelKey" placeholder="例如: gpt-5-preview" />
            </div>
            <div class="form-col">
              <label>展示名称 *</label>
              <input v-model="approveForm.displayName" placeholder="例如: GPT-5 Preview" />
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-col">
              <label>事件类型 *</label>
              <select v-model="approveForm.eventType">
                <option value="MODEL_RELEASE">模型正式发布</option>
                <option value="WEIGHTS_RELEASE">模型权重开源</option>
                <option value="VERSION_UPDATE">版本大升级</option>
                <option value="API_AVAILABLE">开放 API 准入</option>
              </select>
            </div>
            <div class="form-col">
              <label>官方发布日期 *</label>
              <input v-model="approveForm.releaseDate" type="date" />
            </div>
            <div class="form-col">
              <label>开放形态 *</label>
              <select v-model="approveForm.availabilityStatus">
                <option value="API_ONLY">仅 API / 云服务</option>
                <option value="WEIGHTS_OPEN">权重开源可用</option>
                <option value="CLOSED">内部闭源</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <label>事件摘要描述 *</label>
            <textarea v-model="approveForm.summary" rows="3" placeholder="清晰提炼模型技术特性与影响"></textarea>
          </div>

          <div class="form-row">
            <label>审核操作批注</label>
            <input v-model="approveForm.reviewerNote" placeholder="审核留痕批注" />
          </div>

          <div class="evidence-preview">
            <span class="preview-label">官方存证链接：</span>
            <a :href="currentCandidate?.evidenceUrl" target="_blank">{{ currentCandidate?.evidenceUrl }}</a>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-cancel-btn" @click="showApproveModal = false">取消</button>
          <button class="modal-submit-btn" @click="submitApprove">确认并通过发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-console-page {
  min-height: 100vh;
  background-color: #F4F2EA;
  color: #103443;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

/* 控制台顶栏 */
.console-topbar-card {
  max-width: 1720px;
  margin: 0 auto 24px auto;
  background: #FFFDF7;
  border: 1px solid rgba(16, 52, 67, 0.12);
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(16, 52, 67, 0.04);
}

.console-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.console-shield-badge {
  font-size: 24px;
}
.console-brand-text {
  display: flex;
  flex-direction: column;
}
.console-title {
  font-size: 16px;
  font-weight: 700;
  color: #103443;
}
.console-runtime-badge {
  font-size: 12px;
  color: #6C7A82;
}

.console-nav-tabs {
  display: flex;
  gap: 8px;
}
.console-tab-item {
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  color: #486572;
  transition: all 0.2s ease;
}
.console-tab-item:hover {
  background: rgba(16, 52, 67, 0.05);
  color: #103443;
}
.console-tab-item.active {
  background: #103443;
  color: #FFFDF7;
}

.console-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin-user-pill {
  font-size: 13px;
  font-weight: 600;
  color: #087D82;
  background: rgba(8, 125, 130, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}
.preview-front-btn {
  text-decoration: none;
  font-size: 13px;
  color: #103443;
  padding: 6px 12px;
  border: 1px solid rgba(16, 52, 67, 0.2);
  border-radius: 6px;
  transition: all 0.2s ease;
}
.preview-front-btn:hover {
  background: #103443;
  color: #FFFDF7;
}
.console-logout-btn {
  background: none;
  border: 1px solid rgba(220, 38, 38, 0.3);
  color: #DC2626;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}
.console-logout-btn:hover {
  background: #DC2626;
  color: #FFF;
}

/* 4 色数据看板 */
.admin-stats-grid {
  max-width: 1720px;
  margin: 0 auto 24px auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.admin-stat-card {
  background: #FFFDF7;
  border: 1px solid rgba(16, 52, 67, 0.1);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(16, 52, 67, 0.04);
}
.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.stat-icon {
  font-size: 20px;
}
.stat-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 4px;
}
.stat-amber .stat-tag { background: #FEF3C7; color: #D97706; }
.stat-amber.has-pending { border: 2px solid #E8B96E; }
.stat-cyan .stat-tag { background: #E0F2FE; color: #0284C7; }
.stat-rose .stat-tag { background: #FFE4E6; color: #E11D48; }
.stat-emerald .stat-tag { background: #D1FAE5; color: #059669; }

.stat-number {
  font-size: 32px;
  font-weight: 800;
  color: #103443;
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: #6C7A82;
  margin-top: 4px;
}

/* 主工作台 */
.console-body {
  max-width: 1720px;
  margin: 0 auto;
}

.work-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.tab-pill-group {
  display: flex;
  background: rgba(16, 52, 67, 0.06);
  padding: 4px;
  border-radius: 10px;
}
.tab-pill-btn {
  border: none;
  background: transparent;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #486572;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tab-pill-btn.active {
  background: #FFFDF7;
  color: #103443;
  box-shadow: 0 2px 6px rgba(16, 52, 67, 0.08);
}

.crawl-trigger-btn {
  background: #087D82;
  color: #FFF;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;
}
.crawl-trigger-btn:hover:not(:disabled) {
  background: #066266;
}
.crawl-trigger-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.crawl-spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* 过滤栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #FFFDF7;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid rgba(16, 52, 67, 0.08);
}
.filter-pills {
  display: flex;
  gap: 8px;
}
.pill-btn {
  border: 1px solid rgba(16, 52, 67, 0.15);
  background: transparent;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #486572;
  cursor: pointer;
}
.pill-btn.active {
  background: #103443;
  color: #FFFDF7;
  border-color: #103443;
}

.search-box {
  display: flex;
  gap: 8px;
}
.search-box input {
  padding: 8px 14px;
  border: 1px solid rgba(16, 52, 67, 0.2);
  border-radius: 6px;
  font-size: 13px;
  width: 260px;
  outline: none;
}
.search-btn {
  background: #103443;
  color: #FFFDF7;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

/* 候选卡片栅格 */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.candidate-card {
  background: #FFFDF7;
  border: 1px solid rgba(16, 52, 67, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.candidate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 52, 67, 0.06);
}
.candidate-card.card-pending {
  border-left: 4px solid #E8B96E;
}
.candidate-card.card-confirmed {
  border-left: 4px solid #10B981;
}
.candidate-card.card-rejected {
  border-left: 4px solid #EF4444;
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.source-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6C7A82;
}
.status-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}
.pill-pending { background: #FEF3C7; color: #D97706; }
.pill-confirmed { background: #D1FAE5; color: #059669; }
.pill-rejected { background: #FEE2E2; color: #DC2626; }

.card-meta {
  font-size: 13px;
  color: #486572;
  margin-bottom: 8px;
}
.meta-sep {
  margin: 0 6px;
  color: #CBD5E1;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 10px 0;
}
.card-title a {
  color: #103443;
  text-decoration: none;
}
.card-title a:hover {
  color: #087D82;
  text-decoration: underline;
}

.card-summary {
  font-size: 13px;
  color: #6C7A82;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(16, 52, 67, 0.08);
  padding-top: 12px;
}
.seen-time {
  font-size: 12px;
  color: #94A3B8;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-approve {
  background: #103443;
  color: #FFFDF7;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn-approve:hover {
  background: #087D82;
}
.btn-reject {
  background: transparent;
  color: #DC2626;
  border: 1px solid rgba(220, 38, 38, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
.btn-reject:hover {
  background: #DC2626;
  color: #FFF;
}

.reviewer-note {
  font-size: 12px;
  color: #6C7A82;
}
.note-label {
  font-weight: 600;
  margin-right: 4px;
}

/* 官方信源表格 */
.sources-card {
  background: #FFFDF7;
  border: 1px solid rgba(16, 52, 67, 0.1);
  border-radius: 12px;
  padding: 24px;
}
.sources-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.sources-header h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
}
.section-desc {
  margin: 0;
  font-size: 13px;
  color: #6C7A82;
}
.last-check-badge {
  font-size: 13px;
  font-weight: 600;
  color: #087D82;
  background: rgba(8, 125, 130, 0.08);
  padding: 6px 12px;
  border-radius: 6px;
}

.sources-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.sources-table th, .sources-table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(16, 52, 67, 0.08);
  font-size: 13px;
}
.sources-table th {
  background: rgba(16, 52, 67, 0.03);
  font-weight: 700;
  color: #486572;
}
.vendor-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 700;
}
.source-url-col {
  display: flex;
  align-items: center;
  gap: 8px;
}
.source-link {
  color: #103443;
  text-decoration: none;
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.source-link:hover {
  color: #087D82;
  text-decoration: underline;
}
.type-tag {
  background: #E2E8F0;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.health-pill {
  font-size: 12px;
  font-weight: 700;
}
.health-pill.healthy { color: #059669; }
.health-pill.faulty { color: #DC2626; }
.error-col {
  max-width: 280px;
}
.error-text {
  color: #DC2626;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
  font-size: 12px;
}
.no-error { color: #94A3B8; }
.toggle-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-on {
  background: #D1FAE5;
  color: #059669;
}
.btn-off {
  background: #FEE2E2;
  color: #DC2626;
}

/* 弹窗 */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(16, 52, 67, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-box {
  background: #FFFDF7;
  border-radius: 12px;
  width: 680px;
  max-width: 95vw;
  box-shadow: 0 16px 36px rgba(0,0,0,0.2);
  overflow: hidden;
}
.modal-header {
  padding: 18px 24px;
  background: #103443;
  color: #FFFDF7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
}
.close-btn {
  background: none;
  border: none;
  color: #FFFDF7;
  font-size: 18px;
  cursor: pointer;
}
.modal-body {
  padding: 24px;
}
.form-row {
  margin-bottom: 16px;
}
.form-row label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}
.form-row input, .form-row select, .form-row textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(16, 52, 67, 0.2);
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box;
}
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.form-col label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}
.form-col input, .form-col select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(16, 52, 67, 0.2);
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box;
}
.evidence-preview {
  background: rgba(16, 52, 67, 0.04);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 8px;
  word-break: break-all;
}
.evidence-preview a {
  color: #087D82;
}
.modal-footer {
  padding: 16px 24px;
  background: rgba(16, 52, 67, 0.03);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(16, 52, 67, 0.08);
}
.modal-cancel-btn {
  background: transparent;
  border: 1px solid rgba(16, 52, 67, 0.2);
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.modal-submit-btn {
  background: #103443;
  color: #FFFDF7;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}
.modal-submit-btn:hover {
  background: #087D82;
}

/* 缺省与加载状态 */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #FFFDF7;
  border-radius: 12px;
  border: 1px dashed rgba(16, 52, 67, 0.2);
}
.empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(16, 52, 67, 0.1);
  border-top-color: #087D82;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px auto;
}

/* 2026 历史回填与缺口审计面板样式 */
.backfill-config-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
  background: rgba(16, 52, 67, 0.03);
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}
.config-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.config-col label {
  font-size: 12px;
  font-weight: 600;
  color: #103443;
}
.config-col input[type="date"] {
  padding: 8px 12px;
  border: 1px solid rgba(16, 52, 67, 0.2);
  border-radius: 6px;
  background: #FFFDF7;
  font-size: 13px;
  color: #103443;
}
.checkbox-col {
  justify-content: center;
  padding-bottom: 6px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  color: #103443;
  user-select: none;
}
.backfill-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.backfill-job-card {
  background: #FFFDF7;
  border: 1px solid rgba(16, 52, 67, 0.12);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(16, 52, 67, 0.03);
}
.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.job-id {
  font-family: monospace;
  font-weight: 700;
  font-size: 14px;
  color: #103443;
}
.job-status-pill {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}
.status-completed {
  background: rgba(8, 125, 130, 0.12);
  color: #087D82;
}
.status-running {
  background: rgba(224, 159, 62, 0.15);
  color: #B57514;
}
.status-failed {
  background: rgba(220, 53, 69, 0.12);
  color: #DC3545;
}
.job-meta {
  font-size: 13px;
  color: rgba(16, 52, 67, 0.7);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.meta-sep {
  color: rgba(16, 52, 67, 0.3);
}
.coverage-gaps-box {
  background: #FFF8E7;
  border: 1px solid rgba(224, 159, 62, 0.4);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 14px;
}
.gap-title {
  font-size: 12px;
  font-weight: 700;
  color: #B57514;
  margin-bottom: 6px;
}
.coverage-gaps-box ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #794D0C;
}
.coverage-gaps-box li {
  margin-bottom: 4px;
}
.job-logs-box {
  background: #103443;
  color: #E2E8F0;
  padding: 12px 14px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  max-height: 140px;
  overflow-y: auto;
}
.log-line {
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .admin-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .candidates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
