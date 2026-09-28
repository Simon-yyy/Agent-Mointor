<script setup>
import { ref, onMounted, computed } from 'vue'
import { aiApi } from '../../api/ai.js'

const vendors = ref([])
const loading = ref(true)

async function loadVendors() {
  loading.value = true
  try {
    const list = await aiApi.getVendors()
    vendors.value = list || []
  } catch (e) {
    console.error('加载厂商目录失败', e)
  } finally {
    loading.value = false
  }
}

// 统计三态数据
const stats = computed(() => {
  const total = vendors.value.length
  const activeSources = vendors.value.filter(v => (v.activeSourcesCount || 0) > 0).length
  const withEvents = vendors.value.filter(v => (v.confirmedEventsCount || 0) > 0).length
  return { total, activeSources, withEvents }
})

onMounted(() => {
  loadVendors()
})
</script>

<template>
  <div class="ai-vendors-page">
    <!-- 观察台头部标头 -->
    <header class="page-header-block">
      <div class="header-pre-badge">
        <span class="badge-dot"></span>
        <span class="badge-txt">VENDOR DIRECTORY // 厂商全景索引</span>
      </div>
      <h1 class="page-title">AI 研发机构与厂商档案</h1>
      <p class="page-desc">
        收录全球核心大模型研发实验室与科技企业官方发布通道，严格区分官方信源启用与已核实发布动态。
      </p>

      <!-- 厂商状态概览 -->
      <div class="vendor-stats-bar">
        <div class="v-stat-pill">
          <span class="v-lbl">已登记厂商:</span>
          <span class="v-val">{{ stats.total }} 家</span>
        </div>
        <div class="v-stat-pill">
          <span class="v-lbl">已启用官方来源:</span>
          <span class="v-val highlight">{{ stats.activeSources }} 家</span>
        </div>
        <div class="v-stat-pill">
          <span class="v-lbl">有已核实发布:</span>
          <span class="v-val highlight-amber">{{ stats.withEvents }} 家</span>
        </div>
      </div>
    </header>

    <!-- 加载中骨架 -->
    <div v-if="loading" class="vendors-skeleton-grid">
      <div v-for="i in 8" :key="i" class="skeleton-vendor-card"></div>
    </div>

    <!-- 厂商卡片网格 (采用细微品牌色标记，严格区分三态) -->
    <div v-else class="vendors-grid">
      <router-link
        v-for="v in vendors"
        :key="v.slug"
        :to="`/vendors/${v.slug}`"
        class="vendor-box-card"
        :style="{ '--brand-color': v.brandColor || 'var(--obs-primary)' }"
      >
        <div class="card-top-row">
          <div class="vendor-identity">
            <span class="vendor-dot" :style="{ backgroundColor: v.brandColor || 'var(--obs-primary)' }"></span>
            <div class="vendor-avatar">
              {{ v.name.slice(0, 2).toUpperCase() }}
            </div>
            <div class="vendor-titles">
              <h2 class="vendor-name">{{ v.name }}</h2>
              <span class="vendor-slug">@{{ v.slug }}</span>
            </div>
          </div>

          <!-- 仅在有实际地区数据时展示真实地区 -->
          <span v-if="v.region && v.region !== '未知'" class="vendor-region-chip">
            {{ v.region }}
          </span>
        </div>

        <!-- 方案第 5 节：三态区分（已登记 · 来源已启用 · 有确认发布） -->
        <div class="vendor-status-triad">
          <!-- 1. 登记状态 -->
          <div class="triad-item active">
            <span class="triad-dot">●</span>
            <span class="triad-label">已登记档案</span>
          </div>

          <!-- 2. 官方来源是否已启用 -->
          <div
            class="triad-item"
            :class="(v.activeSourcesCount || 0) > 0 ? 'enabled' : 'inactive'"
          >
            <span class="triad-dot">{{ (v.activeSourcesCount || 0) > 0 ? '●' : '○' }}</span>
            <span class="triad-label">
              {{ (v.activeSourcesCount || 0) > 0 ? `已启用官方源 (${v.activeSourcesCount})` : '待接入信源' }}
            </span>
          </div>

          <!-- 3. 是否有已确认发布 -->
          <div
            class="triad-item"
            :class="(v.confirmedEventsCount || 0) > 0 ? 'confirmed' : 'inactive'"
          >
            <span class="triad-dot">{{ (v.confirmedEventsCount || 0) > 0 ? '●' : '○' }}</span>
            <span class="triad-label">
              {{ (v.confirmedEventsCount || 0) > 0 ? `${v.confirmedEventsCount} 条已核实发布` : '暂无审计事件' }}
            </span>
          </div>
        </div>

        <!-- 底部操作入口 -->
        <div class="vendor-card-footer">
          <span class="view-history-btn">查看模型与历史 →</span>
          <a
            v-if="v.websiteUrl"
            :href="v.websiteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="ext-home-btn"
            @click.stop
          >
            官网 ↗
          </a>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.ai-vendors-page {
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

.vendor-stats-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.v-stat-pill {
  display: flex;
  align-items: baseline;
  gap: 6px;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.v-lbl {
  color: var(--obs-text-muted, #59717a);
}

.v-val {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--obs-text, #172F38);
}

.v-val.highlight {
  color: var(--obs-primary, #087D82);
}

.v-val.highlight-amber {
  color: var(--obs-accent-amber, #E8B96E);
}

/* 厂商卡片网格 */
.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.vendor-box-card {
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.vendor-box-card:hover {
  transform: translateY(-2px);
  border-color: var(--obs-primary, #087D82);
  box-shadow: 0 8px 24px rgba(23, 47, 56, 0.08);
}

.card-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.vendor-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vendor-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.vendor-avatar {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background-color: var(--obs-card-teal, #E5F0EC);
  border: 1px solid var(--obs-border, #D8E1DB);
  color: var(--obs-text, #172F38);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.vendor-titles {
  display: flex;
  flex-direction: column;
}

.vendor-name {
  font-size: 1.12rem;
  font-weight: 750;
  color: var(--obs-text, #172F38);
  margin: 0;
  line-height: 1.3;
}

.vendor-slug {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: var(--obs-text-muted, #59717a);
}

.vendor-region-chip {
  font-size: 0.74rem;
  color: var(--obs-text-muted, #59717a);
  background-color: var(--obs-bg, #F4F2EA);
  border: 1px solid var(--obs-border, #D8E1DB);
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 方案第 5 节：三态区分微标签 */
.vendor-status-triad {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: var(--obs-bg, #F4F2EA);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.triad-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.triad-item.active {
  color: var(--obs-text, #172F38);
  font-weight: 600;
}

.triad-item.enabled {
  color: var(--obs-primary, #087D82);
  font-weight: 650;
}

.triad-item.confirmed {
  color: var(--obs-accent-amber, #E8B96E);
  font-weight: 650;
}

.triad-item.inactive {
  color: var(--obs-text-muted, #59717a);
  opacity: 0.65;
}

.triad-dot {
  font-size: 0.85rem;
}

.vendor-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--obs-border, #D8E1DB);
  padding-top: 0.85rem;
  margin-top: auto;
}

.view-history-btn {
  font-size: 0.85rem;
  font-weight: 650;
  color: var(--obs-primary, #087D82);
}

.ext-home-btn {
  font-size: 0.82rem;
  color: var(--obs-text-muted, #59717a);
  text-decoration: none;
  font-weight: 600;
}

.ext-home-btn:hover {
  color: var(--obs-primary, #087D82);
  text-decoration: underline;
}

/* 骨架屏 */
.vendors-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.skeleton-vendor-card {
  height: 200px;
  background-color: var(--obs-card-cream, #FFFDF7);
  border: 1px solid var(--obs-border, #D8E1DB);
  border-radius: 12px;
  opacity: 0.5;
}
</style>
