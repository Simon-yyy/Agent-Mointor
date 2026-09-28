import { request } from './request.js'

/**
 * AI 模型动态追踪 API 客户端
 */
export const aiApi = {
  /**
   * 分页检索事件流 (支持9大分类筛选)
   */
  getEvents(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.vendor) searchParams.append('vendor', params.vendor)
    if (params.modality) searchParams.append('modality', params.modality)
    if (params.type) searchParams.append('type', params.type)
    if (params.category) searchParams.append('category', params.category)
    if (params.page) searchParams.append('page', params.page)
    if (params.size) searchParams.append('size', params.size)

    const query = searchParams.toString()
    return request(`/api/model-updates/events${query ? '?' + query : ''}`)
  },

  /**
   * 获取模型基准评测天梯榜 (方案阶段 4 & 5)
   */
  getLeaderboard(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.suite) searchParams.append('suite', params.suite)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.limit) searchParams.append('limit', params.limit)
    const query = searchParams.toString()
    return request(`/api/model-updates/benchmarks/leaderboard${query ? '?' + query : ''}`)
  },

  /**
   * 获取指定模型的全维评测雷达数据
   */
  getModelBenchmarks(id) {
    return request(`/api/model-updates/models/${id}/benchmarks`)
  },

  /**
   * 获取全部厂商目录
   */
  getVendors() {
    return request('/api/model-updates/vendors')
  },

  /**
   * 获取单个厂商详情
   */
  getVendorDetail(slug) {
    return request(`/api/model-updates/vendors/${encodeURIComponent(slug)}`)
  },

  /**
   * 获取模型目录 (支持服务端多维分页与历史全量模式)
   */
  getModels(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.vendorId) searchParams.append('vendorId', params.vendorId)
    if (params.series) searchParams.append('series', params.series)
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.modality) searchParams.append('modality', params.modality)
    if (params.availability) searchParams.append('availability', params.availability)
    if (params.region) searchParams.append('region', params.region)
    if (params.sort) searchParams.append('sort', params.sort)
    if (params.page) searchParams.append('page', params.page)
    if (params.size) searchParams.append('size', params.size)
    const query = searchParams.toString()
    return request(`/api/model-updates/models${query ? '?' + query : ''}`)
  },

  /**
   * 获取单个模型详情
   */
  getModelDetail(id) {
    return request(`/api/model-updates/models/${id}`)
  },

  /**
   * 获取按月归档的历史时间线
   */
  getTimeline() {
    return request('/api/model-updates/timeline')
  },

  /**
   * 获取系统监控与来源健康状态
   */
  getStatus() {
    return request('/api/model-updates/status')
  },

  /**
   * 精确获取单个模型关联的全部事件
   */
  getModelEvents(id) {
    return request(`/api/model-updates/models/${id}/events`)
  },

  /**
   * 公开巡检接口已收敛，推荐使用管理端 triggerAdminCrawl()
   */
  triggerCrawl() {
    return this.triggerAdminCrawl()
  },

  // ========== 管理员专属接口 ==========

  /**
   * 分页获取待审模型发现候选
   */
  getCandidates(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.append('status', params.status)
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.page) searchParams.append('page', params.page)
    if (params.size) searchParams.append('size', params.size)
    const query = searchParams.toString()
    return request(`/api/admin/model-updates/candidates${query ? '?' + query : ''}`)
  },

  /**
   * 提交候选审核决定 (APPROVE / REJECT)
   */
  decideCandidate(id, data) {
    return request(`/api/admin/model-updates/candidates/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  /**
   * 获取管理端官方信源监控列表
   */
  getAdminSources() {
    return request('/api/admin/model-updates/sources')
  },

  /**
   * 切换信源启用/停用状态
   */
  toggleSource(id, active) {
    return request(`/api/admin/model-updates/sources/${id}/toggle?active=${active}`, {
      method: 'POST'
    })
  },

  /**
   * 管理员手动触发官方信源全量巡检
   */
  triggerAdminCrawl() {
    return request('/api/admin/model-updates/crawl/trigger', { method: 'POST' })
  },

  /**
   * 创建 2026 历史回填任务
   */
  createBackfill(data = {}) {
    return request('/api/admin/model-updates/backfills', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  /**
   * 查询回填任务详情
   */
  getBackfill(id) {
    return request(`/api/admin/model-updates/backfills/${id}`)
  },

  /**
   * 获取全部回填任务记录
   */
  listBackfills() {
    return request('/api/admin/model-updates/backfills')
  },

  /**
   * 获取官方最新动态线索（可按月份 YYYY-MM、厂商过滤）
   */
  getOfficialUpdates(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.month) searchParams.append('month', params.month)
    if (params.vendorId) searchParams.append('vendorId', params.vendorId)
    if (params.category) searchParams.append('category', params.category)
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.page) searchParams.append('page', params.page)
    if (params.size) searchParams.append('size', params.size)
    const query = searchParams.toString()
    return request(`/api/model-updates/official-updates${query ? '?' + query : ''}`)
  },

  /**
   * 获取 2026 各月厂商覆盖审计矩阵
   */
  getCoverage(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.year) searchParams.append('year', params.year)
    if (params.vendorId) searchParams.append('vendorId', params.vendorId)
    const query = searchParams.toString()
    return request(`/api/model-updates/coverage${query ? '?' + query : ''}`)
  },

  // ========== 目录聚合同步 (管理端) ==========

  /**
   * 目录计数口径报告 (追加 16/17): 端点行/规范模型/待审/厂商分层/重复实体/静态资源页分列
   */
  getCatalogReport() {
    return request('/api/admin/model-updates/catalog/report')
  },

  /**
   * 目录同步运行审计列表 (含 SyncReport JSON)
   */
  getCatalogRuns(limit = 20) {
    return request(`/api/admin/model-updates/catalog/runs?limit=${limit}`)
  },

  /**
   * 手动触发目录同步 (sourceKey: models_dev / epoch_ai_benchmark / all)
   */
  triggerCatalogSync(sourceKey = 'all') {
    return request(`/api/admin/model-updates/catalog/sync/${encodeURIComponent(sourceKey)}`, {
      method: 'POST'
    })
  },

  /**
   * 目录字段冲突待审队列
   */
  getCatalogConflicts(status = 'PENDING', limit = 50) {
    return request(`/api/admin/model-updates/catalog/conflicts?status=${status}&limit=${limit}`)
  },

  /**
   * 处置目录字段冲突 (KEEP 保留现值 / TAKE 采纳上游)
   */
  resolveCatalogConflict(id, decision = 'KEEP') {
    return request(`/api/admin/model-updates/catalog/conflicts/${id}/resolve?decision=${decision}`, {
      method: 'POST'
    })
  },
}
