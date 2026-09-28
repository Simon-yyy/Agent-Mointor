/**
 * 模型能力标尺与归一化工具模块 (方案阶段 5 落地)
 * 职责：提供前沿模型评测事实（ELO/SWE-bench/MATH-500/MMLU-Pro/定价）的标准化标尺计算
 */

// 1. ELO 归一化 (标尺区间: 1000 ~ 1400)
export function normalizeElo(elo) {
  if (elo == null || isNaN(elo)) return 0
  const num = Number(elo)
  const min = 1000
  const max = 1400
  const clamped = Math.max(min, Math.min(max, num))
  return Math.round(((clamped - min) / (max - min)) * 100)
}

// 2. 百分比评测归一化 (0 ~ 100)
export function normalizePercent(score) {
  if (score == null || isNaN(score)) return 0
  const num = Number(score)
  return Math.max(0, Math.min(100, Math.round(num)))
}

// 3. 定价对数标尺 (0.01$/M ~ 100$/M)
export function normalizePriceLog(price) {
  if (price == null || isNaN(price) || price <= 0) return 0
  const num = Number(price)
  const minLog = Math.log10(0.01)
  const maxLog = Math.log10(100)
  const curLog = Math.log10(Math.max(0.01, Math.min(100, num)))
  return Math.round(((curLog - minLog) / (maxLog - minLog)) * 100)
}

// 4. 计算综合能力段位梯队 (Tier S+, S, A, B, C)
export function calculateModelTier(itemOrElo, sweBench) {
  let elo = 0
  let swe = 0
  if (typeof itemOrElo === 'object' && itemOrElo !== null) {
    elo = Number(itemOrElo.arenaElo) || 0
    swe = Number(itemOrElo.sweBenchVerified) || 0
  } else {
    elo = Number(itemOrElo) || 0
    swe = Number(sweBench) || 0
  }

  if (elo >= 1350 || swe >= 48) {
    return { tier: 'S+', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', desc: '前沿顶尖推理与代码架构' }
  }
  if (elo >= 1300 || swe >= 40) {
    return { tier: 'S', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', desc: '第一梯队综合旗舰' }
  }
  if (elo >= 1250 || swe >= 30) {
    return { tier: 'A', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)', desc: '主流高性价比主力模型' }
  }
  if (elo >= 1150) {
    return { tier: 'B', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', desc: '端侧/轻量化专用模型' }
  }
  return { tier: 'C', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', desc: '基准探索模型' }
}

export function getModelTierName(item) {
  return calculateModelTier(item).tier
}

// 5. 9 大分类中文标签与色彩映射
export const CATEGORY_CONFIGS = {
  FLAGSHIP_RELEASE: { label: '旗舰迭代', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
  REASONING_BREAKTHROUGH: { label: '推理突破', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
  OPEN_WEIGHTS: { label: '开源权重', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  API_PRICING: { label: '定价下调', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  CONTEXT_EXPANSION: { label: '长窗口', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
  MULTIMODAL: { label: '多模态', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' },
  AGENTIC: { label: '智能体/工具', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  DEV_TOOLS: { label: '开发生态', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  POLICY_SAFETY: { label: '安全对齐', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' }
}

export function getCategoryBadge(category) {
  if (!category) return CATEGORY_CONFIGS.FLAGSHIP_RELEASE
  return CATEGORY_CONFIGS[category] || { label: category, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' }
}
