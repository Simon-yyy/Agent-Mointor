<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
import { initTheme } from './utils/theme.js'

const scrollProgress = ref(0)

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  scrollProgress.value = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
}

onMounted(() => {
  initTheme()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="app-layout">
    <!-- 顶部全站阅读进度条 -->
    <div class="reading-progress-bar" :style="{ width: scrollProgress + '%' }"></div>

    <NavBar />

    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <FooterBar />
  </div>
</template>

<style>
/* ====================================================
   设计令牌与主题系统 (Design Tokens & Theming)
==================================================== */
:root {
  /* 全局观察台体系专属设计令牌 (Observatory Design Tokens) */
  --obs-bg: #F4F2EA;           /* 暖纸白 */
  --obs-text: #172F38;         /* 墨蓝正文与标题 */
  --obs-text-muted: #59717a;   /* 辅助说明 */
  --obs-hero-bg: #103443;      /* 深海蓝大画布主视觉 */
  --obs-hero-text: #EFF4EF;    /* 画布上的米白文字 */
  --obs-primary: #087D82;      /* 湖青 (主品牌、主要按钮、关键高亮) */
  --obs-primary-hover: #066367;
  --obs-accent-coral: #EA735C; /* 珊瑚橙 (重要标记、动态标签) */
  --obs-accent-amber: #E8B96E; /* 琥珀 (日期、里程碑、关键时间) */
  --obs-card-cream: #FFFDF7;   /* 辅助卡片奶油白 */
  --obs-card-teal: #E5F0EC;    /* 辅助卡片浅青 */
  --obs-border: #D8E1DB;       /* 分隔线灰绿 */

  /* 基础通用变量 */
  --bg-primary: #F4F2EA;
  --bg-secondary: #FFFDF7;
  --bg-hover: #EBF2ED;
  --bg-card: #FFFDF7;
  --text-main: #172F38;
  --text-muted: #59717a;
  --border-color: #D8E1DB;
  --border-hover: #BDCBC2;
  --accent-color: #087D82;
  --accent-hover: #066367;
  --accent-light: rgba(8, 125, 130, 0.08);
  --nav-bg: rgba(244, 242, 234, 0.94);
  --card-shadow: 0 2px 10px rgba(23, 47, 56, 0.04);
  --card-shadow-hover: 0 8px 24px rgba(23, 47, 56, 0.08);
  --code-bg: #103443;
  --code-text: #EFF4EF;
  --tag-bg: #E5F0EC;
  --tag-text: #172F38;
  --success-color: #087D82;
  --danger-color: #EA735C;
  --glow-color: transparent;
}

html.dark {
  /* 观察台深色体系 */
  --obs-bg: #091821;           /* 深夜蓝 */
  --obs-text: #EFF4EF;         /* 米白 */
  --obs-text-muted: #829aa4;   /* 浅灰青 */
  --obs-hero-bg: #12313C;      /* 墨绿蓝 */
  --obs-hero-text: #EFF4EF;
  --obs-primary: #76D4CE;      /* 浅湖青 */
  --obs-primary-hover: #5ec7c0;
  --obs-accent-coral: #F39883; /* 柔珊瑚 */
  --obs-accent-amber: #F2CB84; /* 浅琥珀 */
  --obs-card-cream: #17313B;   /* 深青灰 */
  --obs-card-teal: #203A42;    /* 深青灰2 */
  --obs-border: #35525B;       /* 蓝绿灰分隔线 */

  --bg-primary: #091821;
  --bg-secondary: #12242F;
  --bg-hover: #19313E;
  --bg-card: #12242F;
  --text-main: #EFF4EF;
  --text-muted: #829aa4;
  --border-color: #27434D;
  --border-hover: #35525B;
  --accent-color: #76D4CE;
  --accent-hover: #96E2DC;
  --accent-light: rgba(118, 212, 206, 0.12);
  --nav-bg: rgba(9, 24, 33, 0.94);
  --card-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  --card-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.5);
  --code-bg: #061117;
  --code-text: #EFF4EF;
  --tag-bg: #1A343E;
  --tag-text: #B4CAD2;
  --success-color: #76D4CE;
  --danger-color: #F39883;
  --glow-color: transparent;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-main);
  line-height: 1.75;
  letter-spacing: -0.01em;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* 顶部阅读进度条 */
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--obs-primary);
  z-index: 9999;
  transition: width 0.1s ease-out;
}

.app-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.main-content {
  position: relative;
  flex: 1;
  max-width: 1800px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem clamp(1rem, 3.5vw, 4.5rem) 5rem;
}

/* 页面切换动效 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 按钮点击按压反馈 */
button:active, .btn-press:active {
  transform: scale(0.975);
}

/* ====================================================
   Markdown 排版精细化规范 (Typography)
==================================================== */
.markdown-body {
  line-height: 1.85;
  color: var(--text-main);
  font-size: 1.02rem;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
  margin-top: 2.2rem;
  margin-bottom: 0.9rem;
  font-weight: 750;
  color: var(--text-main);
  scroll-margin-top: 90px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.markdown-body .heading-hash {
  color: var(--accent-color);
  opacity: 0.45;
  font-weight: 500;
  font-size: 0.85em;
  user-select: none;
}

.markdown-body h1 { font-size: 1.95rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem; }
.markdown-body h2 { font-size: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
.markdown-body h3 { font-size: 1.25rem; }
.markdown-body h4 { font-size: 1.1rem; }

.markdown-body p {
  margin-bottom: 1.2rem;
}

.markdown-body blockquote {
  border-left: 4px solid var(--accent-color);
  background: var(--tag-bg);
  padding: 1rem 1.4rem;
  margin: 1.4rem 0;
  border-radius: 0 10px 10px 0;
  color: var(--text-muted);
  font-size: 0.96rem;
}

.markdown-body .inline-code {
  background: var(--bg-hover);
  color: var(--accent-color);
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.88em;
  font-family: "JetBrains Mono", Consolas, Menlo, Monaco, monospace;
  border: 1px solid var(--border-color);
}

/* Mac 拟物风格代码块 */
.markdown-body .code-block-wrapper.mac-style {
  margin: 1.6rem 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--code-bg);
  box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.markdown-body .code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 16px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.mac-window-dots {
  display: flex;
  gap: 6px;
}

.mac-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}
.mac-dot.red { background: #ff5f56; }
.mac-dot.yellow { background: #ffbd2e; }
.mac-dot.green { background: #27c93f; }

.markdown-body .code-lang-tag {
  font-size: 0.76rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  font-family: "JetBrains Mono", Consolas, monospace;
}

.markdown-body .copy-code-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: none;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.76rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.markdown-body .copy-code-btn:hover {
  background: var(--accent-color);
  color: #fff;
}

.markdown-body .copy-code-btn.copied {
  background: var(--success-color);
  color: #fff;
}

.markdown-body pre {
  padding: 1.25rem 1.4rem;
  overflow-x: auto;
  margin: 0;
}

.markdown-body pre code {
  color: var(--code-text);
  font-family: "JetBrains Mono", Consolas, Menlo, Monaco, monospace;
  font-size: 0.92rem;
  line-height: 1.7;
}

.markdown-body .markdown-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.4rem 0;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.markdown-body .table-container {
  overflow-x: auto;
}

.markdown-body .markdown-table th, .markdown-body .markdown-table td {
  border: 1px solid var(--border-color);
  padding: 12px 16px;
  text-align: left;
}

.markdown-body .markdown-table th {
  background: var(--bg-hover);
  font-weight: 700;
  color: var(--text-main);
}

.markdown-body .markdown-list {
  padding-left: 1.8rem;
  margin-bottom: 1.2rem;
}

.markdown-body .markdown-list li {
  margin-bottom: 0.5rem;
}

.markdown-body .markdown-img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  margin: 1.2rem 0;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

.markdown-body .markdown-link {
  color: var(--accent-color);
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 500;
}

.markdown-body .markdown-divider {
  border: none;
  height: 1px;
  background: var(--border-color);
  margin: 2.5rem 0;
}
</style>
