import { request } from './request.js'

/**
 * AI 模型动态追踪 API 客户端
 */
export const aiApi = {
  /**
   * 分页检索事件流
   */
  getEvents(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.vendor) searchParams.append('vendor', params.vendor)
    if (params.modality) searchParams.append('modality', params.modality)
    if (params.type) searchParams.append('type', params.type)
    if (params.page) searchParams.append('page', params.page)
    if (params.size) searchParams.append('size', params.size)

    const query = searchParams.toString()
    return request(`/api/model-updates/events${query ? '?' + query : ''}`)
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
   * 获取模型目录
   */
  getModels(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.vendorId) searchParams.append('vendorId', params.vendorId)
    if (params.series) searchParams.append('series', params.series)
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
}
