<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { currentTheme, toggleTheme } from '../utils/theme.js'

const route = useRoute()
const mobileMenuOpen = ref(false)

const primaryLinks = [
  { name: '模型动态', path: '/' },
  { name: '模型目录', path: '/models' },
  { name: '厂商', path: '/vendors' },
  { name: '时间线', path: '/model-timeline' },
]

const secondaryLinks = [
  { name: '文章', path: '/articles' },
  { name: '作品', path: '/works' },
  { name: '关于', path: '/about' },
]

const navLinks = [...primaryLinks, ...secondaryLinks]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="navbar-header">
    <div class="nav-container">
      <!-- 站点品牌 Logo -->
      <router-link to="/" class="site-logo">
        <span class="logo-name">Simon</span>
        <span class="logo-subtag">全球模型动态观察台</span>
      </router-link>

      <!-- 桌面端导航菜单 (主次分明) -->
      <nav class="desktop-nav">
        <!-- 主栏目：模型动态观察体系 -->
        <div class="nav-group primary-group">
          <router-link
            v-for="item in primaryLinks"
            :key="item.path"
            :to="item.path"
            :class="['nav-link-item', { active: isActive(item.path) }]"
          >
            {{ item.name }}
          </router-link>
        </div>

        <div class="nav-divider"></div>

        <!-- 次级栏目：个人博客手记与作品 -->
        <div class="nav-group secondary-group">
          <router-link
            v-for="item in secondaryLinks"
            :key="item.path"
            :to="item.path"
            :class="['nav-link-item secondary', { active: isActive(item.path) }]"
          >
            {{ item.name }}
          </router-link>
          <a href="https://github.com" target="_blank" class="nav-link-item secondary github-link">
            GitHub ↗
          </a>
        </div>
      </nav>

      <!-- 右侧快捷控制区（仅保留纯净的主题切换） -->
      <div class="nav-actions">
        <!-- 主题切换按钮 -->
        <button
          class="theme-switch-btn"
          :title="currentTheme === 'dark' ? '切换为浅色模式' : '切换为暗色模式'"
          @click="toggleTheme"
        >
          <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
        </button>

        <!-- 移动端汉堡折叠按钮 -->
        <button class="mobile-toggle-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <span class="hamburger-icon">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
        </button>
      </div>
    </div>

    <!-- 移动端弹出抽屉 -->
    <div v-if="mobileMenuOpen" class="mobile-menu-drawer">
      <router-link
        v-for="item in navLinks"
        :key="item.path"
        :to="item.path"
        :class="['mobile-link', { active: isActive(item.path) }]"
        @click="mobileMenuOpen = false"
      >
        {{ item.name }}
      </router-link>
      <a href="https://github.com" target="_blank" class="mobile-link">GitHub ↗</a>
    </div>
  </header>
</template>

<style scoped>
.navbar-header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--nav-bg);
  transition: all 0.2s ease;
}

.nav-container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3.5vw, 4.5rem);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 品牌 Logo */
.site-logo {
  text-decoration: none;
  color: var(--text-main);
  display: flex;
  align-items: baseline;
  gap: 8px;
  transition: opacity 0.15s ease;
}

.site-logo:hover {
  opacity: 0.8;
}

.logo-name {
  font-size: 1.25rem;
  font-weight: 850;
  letter-spacing: -0.04em;
  color: var(--text-main);
}

.logo-subtag {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 2px 7px;
  border-radius: 4px;
  background-color: var(--obs-hero-bg, #103443);
  color: #eff4ef;
  opacity: 0.9;
}

/* 导航链接 */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.nav-divider {
  width: 1px;
  height: 18px;
  background-color: var(--border-color);
  opacity: 0.7;
  margin: 0 4px;
}

.nav-link-item {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
}

.nav-link-item:hover {
  color: var(--text-main);
}

.nav-link-item.active {
  color: var(--accent-color);
  font-weight: 700;
}

.nav-link-item.active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--accent-color);
  border-radius: 2px;
}

.nav-link-item.secondary {
  font-size: 0.86rem;
  opacity: 0.85;
}

.github-link {
  opacity: 0.75;
}

/* 操作区域 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-switch-btn {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.theme-switch-btn:hover {
  border-color: var(--accent-color);
  background: var(--bg-secondary);
}

.mobile-toggle-btn {
  display: none;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 5px 9px;
  font-size: 1.1rem;
  color: var(--text-main);
  cursor: pointer;
}

/* 移动端菜单 */
.mobile-menu-drawer {
  display: none;
}

@media (max-width: 680px) {
  .desktop-nav {
    display: none;
  }
  .mobile-toggle-btn {
    display: block;
  }
  .mobile-menu-drawer {
    display: flex;
    flex-direction: column;
    padding: 1rem 1.25rem;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    gap: 4px;
  }
  .mobile-link {
    text-decoration: none;
    padding: 8px 12px;
    font-size: 0.92rem;
    font-weight: 500;
    color: var(--text-muted);
    border-radius: 6px;
  }
  .mobile-link.active {
    background: var(--bg-hover);
    color: var(--accent-color);
    font-weight: 700;
  }
}
</style>
