<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi } from '../../api/articles.js'
import { authApi } from '../../api/auth.js'
import { renderMarkdown, calculateReadingStats } from '../../utils/markdown.js'

const route = useRoute()
const router = useRouter()

const articleId = computed(() => route.params.id)
const isEditMode = computed(() => Boolean(articleId.value))

const form = ref({
  title: '',
  summary: '',
  contentMd: '',
  coverUrl: '',
  category: '技术探讨',
  tagsString: '',
  status: 1, // 0 草稿, 1 已发布
})

const submitting = ref(false)
const showMetaDrawer = ref(true) // 是否展开元数据配置
const viewMode = ref('split') // 'split' | 'edit' | 'preview'
const cursorInfo = ref({ line: 1, col: 1 })

// 常用分类与预设标签
const presetCategories = ['技术探讨', '架构设计', '后端开发', '前端工程', '性能调优', 'DevOps', '阅读思考']
const presetTags = ['Java 21', 'Spring Boot 3', 'Vue 3', 'MySQL', 'Redis', 'Docker', '架构设计', '高并发', '微服务']

const previewHtml = computed(() => renderMarkdown(form.value.contentMd))
const stats = computed(() => {
  const base = calculateReadingStats(form.value.contentMd)
  const lineCount = form.value.contentMd ? form.value.contentMd.split('\n').length : 0
  const charCount = form.value.contentMd ? form.value.contentMd.length : 0
  return {
    ...base,
    lines: lineCount,
    chars: charCount
  }
})

const tagList = computed(() => {
  if (!form.value.tagsString) return []
  return form.value.tagsString
    .split(/[,，]/)
    .map(t => t.trim())
    .filter(Boolean)
})

async function loadArticle() {
  if (!isEditMode.value) return
  try {
    const data = await articleApi.getAdminArticleDetail(articleId.value)
    if (data) {
      form.value = {
        title: data.title || '',
        summary: data.summary || '',
        contentMd: data.contentMd || '',
        coverUrl: data.coverUrl || '',
        category: data.category || '技术探讨',
        tagsString: (data.tags || []).join(', '),
        status: data.status !== undefined ? data.status : 1,
      }
    }
  } catch (e) {
    alert('加载文章失败: ' + e.message)
    router.push('/admin/articles')
  }
}

function handleSelectCategory(cat) {
  form.value.category = cat
}

function handleAddPresetTag(tag) {
  const currentTags = tagList.value
  if (!currentTags.includes(tag)) {
    form.value.tagsString = currentTags.length > 0 ? `${form.value.tagsString}, ${tag}` : tag
  }
}

function insertTemplate() {
  form.value.title = 'Spring Boot 3.3 与虚拟线程高并发调优实战'
  form.value.summary = '详细梳理在生产级高吞吐系统中采用 Java 21 虚拟线程替代传统平台线程池的选型依据、踩坑点与实战评测。'
  form.value.category = '架构设计'
  form.value.tagsString = 'Spring Boot, Java 21, 虚拟线程, 高并发, 性能调优'
  form.value.coverUrl = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
  form.value.contentMd = `# Spring Boot 3.3 与虚拟线程高并发调优实战

在传统的基于操作系统内核线程的 Servlet 容器中，每个 HTTP 请求绑定一个系统线程。当遇到大量数据库等待或下游 RPC 调用时，线程处于阻塞状态，造成极高的内存与上下文切换开销。

## 一、 核心架构配置

在 \`application.properties\` 中无缝启用虚拟线程支持：

\`\`\`properties
# 启用虚拟线程执行器
spring.threads.virtual.enabled=true
server.tomcat.threads.max=200
\`\`\`

## 二、 关键性能基准对比

基于 wrk 压测 50,000 并发连接下的实测数据物证：

| 测试维度 | 传统平台线程池 (200 线程) | Java 21 虚拟线程 (按需动态创建) | 性能收益提升 |
|---|---|---|---|
| 最大并发连接 | ~1,600 req/s | > 52,000 req/s | **+3200%** |
| 内存开销 (RSS) | ~380 MB | ~48 MB | **-87.3%** |
| P99 响应延迟 | 145 ms | 19 ms | **-86.8%** |

## 三、 避坑避雷与生产纪律

> 💡 **架构黄金准则**：
> 1. **严禁将虚拟线程投入固定容量的线程池**！虚拟线程应当随任务诞生、瞬时销毁；
> 2. **警惕 \`synchronized\` 引起的载体线程锁死 (Thread Pinning)**，应全面升级为 \`ReentrantLock\`。

\`\`\`java
// 推荐的高并发锁写法
private final ReentrantLock lock = new ReentrantLock();

public void processTask() {
    lock.lock();
    try {
        // 执行安全业务逻辑
    } finally {
        lock.unlock();
    }
}
\`\`\`
`
}

function insertMarkdownSnippet(prefix, suffix = '', defaultText = '文本') {
  const textarea = document.getElementById('md-editor-textarea')
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = form.value.contentMd.substring(start, end)
  const insertContent = selected || defaultText
  const replacement = prefix + insertContent + suffix
  
  form.value.contentMd =
    form.value.contentMd.substring(0, start) +
    replacement +
    form.value.contentMd.substring(end)

  // 恢复聚焦并设置光标
  setTimeout(() => {
    textarea.focus()
    const newCursor = start + prefix.length + insertContent.length
    textarea.setSelectionRange(newCursor, newCursor)
    updateCursorInfo()
  }, 0)
}

function handleKeydown(e) {
  // Tab 键插入 2 个空格
  if (e.key === 'Tab') {
    e.preventDefault()
    insertMarkdownSnippet('  ', '', '')
    return
  }
  // Ctrl+S / Cmd+S 暂存草稿
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSave(0)
    return
  }
  // Ctrl+Enter 快速发布
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    handleSave(1)
    return
  }
}

function updateCursorInfo() {
  const textarea = document.getElementById('md-editor-textarea')
  if (!textarea) return
  const pos = textarea.selectionStart
  const textBefore = form.value.contentMd.substring(0, pos)
  const lines = textBefore.split('\n')
  cursorInfo.value = {
    line: lines.length,
    col: lines[lines.length - 1].length + 1
  }
}

async function handleSave(statusToSet) {
  if (!form.value.title.trim()) {
    alert('请填写文章标题')
    return
  }
  if (!form.value.contentMd.trim()) {
    alert('请撰写文章 Markdown 正文')
    return
  }

  const tags = tagList.value

  const payload = {
    title: form.value.title,
    summary: form.value.summary,
    contentMd: form.value.contentMd,
    coverUrl: form.value.coverUrl,
    category: form.value.category,
    tags,
    status: statusToSet !== undefined ? statusToSet : form.value.status,
  }

  submitting.value = true
  try {
    if (isEditMode.value) {
      await articleApi.updateArticle(articleId.value, payload)
      alert('博文已成功更新！')
    } else {
      await articleApi.createArticle(payload)
      alert('博文已成功发布上线！')
    }
    router.push('/admin/articles')
  } catch (e) {
    alert('保存失败: ' + e.message)
  } finally {
    submitting.value = false
  }
}

function handleLogout() {
  if (confirm('确定要退出管理员登录吗？')) {
    authApi.logout()
    router.push('/admin/login')
  }
}

onMounted(() => {
  loadArticle()
})
</script>

<template>
  <div class="edit-page">
    <!-- 统一极客控制台顶栏 -->
    <header class="admin-topbar">
      <div class="topbar-left">
        <div class="console-badge">
          <span>内容编辑</span>
        </div>
        <div class="title-with-nav">
          <router-link to="/admin/articles" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回管理
          </router-link>
          <h1 class="page-title">
            {{ isEditMode ? '编辑博文' : '撰写新博文' }}
          </h1>
        </div>
      </div>

      <div class="topbar-right">
        <button type="button" class="action-btn outline-btn" @click="insertTemplate" title="填入预置高并发工程实战范文">
          <span class="btn-icon">⚡</span>
          <span>技术样例范文</span>
        </button>
        <button
          type="button"
          class="action-btn draft-btn"
          :disabled="submitting"
          @click="handleSave(0)"
          title="快捷键: Ctrl + S"
        >
          <span class="btn-icon">💾</span>
          <span>暂存草稿</span>
        </button>
        <button
          type="button"
          class="action-btn publish-btn"
          :disabled="submitting"
          @click="handleSave(1)"
          title="快捷键: Ctrl + Enter"
        >
          <span class="btn-icon">🚀</span>
          <span>{{ submitting ? '保存中…' : (isEditMode ? '更新发布' : '立即发布') }}</span>
        </button>

        <div class="nav-divider"></div>
        <router-link to="/admin/articles" class="nav-tab active">文章</router-link>
        <router-link to="/admin/works" class="nav-tab">作品</router-link>
        <router-link to="/" class="view-site-btn" target="_blank">↗ 前台</router-link>
        <button class="logout-btn" @click="handleLogout" title="退出后台">登出</button>
      </div>
    </header>

    <!-- 元数据配置区域 (支持收起/展开) -->
    <section class="meta-section" :class="{ 'collapsed': !showMetaDrawer }">
      <div class="meta-header-bar" @click="showMetaDrawer = !showMetaDrawer">
        <div class="meta-bar-left">
          <span class="meta-icon">⚙️</span>
          <span class="meta-heading">文章属性与元数据配置</span>
          <span class="meta-hint" v-if="!showMetaDrawer">
            [{{ form.category || '未分类' }}] {{ form.title || '（未输入标题）' }}
          </span>
        </div>
        <button type="button" class="drawer-toggle-btn">
          {{ showMetaDrawer ? '收起配置 ▲' : '展开配置 ▼' }}
        </button>
      </div>

      <div v-show="showMetaDrawer" class="meta-body">
        <!-- 标题行 -->
        <div class="meta-row">
          <div class="meta-col col-grow">
            <label class="meta-label">
              <span>文章主标题</span>
              <span class="required-star">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="例如：Spring Boot 3 与虚拟线程生产环境落地全纪实..."
              class="meta-input title-input"
              required
            />
          </div>

          <div class="meta-col col-fixed">
            <label class="meta-label">所属分类</label>
            <input
              v-model="form.category"
              type="text"
              placeholder="自定义或选择..."
              class="meta-input"
            />
            <div class="category-chips">
              <span
                v-for="cat in presetCategories"
                :key="cat"
                class="cat-chip"
                :class="{ active: form.category === cat }"
                @click="handleSelectCategory(cat)"
              >
                {{ cat }}
              </span>
            </div>
          </div>
        </div>

        <!-- 摘要与封面 -->
        <div class="meta-row">
          <div class="meta-col col-grow">
            <label class="meta-label">文章摘要 (Summary)</label>
            <textarea
              v-model="form.summary"
              rows="2"
              placeholder="概括文章核心技术价值，将在首页和列表页流式呈现..."
              class="meta-input meta-textarea"
            ></textarea>
          </div>

          <div class="meta-col col-fixed">
            <label class="meta-label">封面图片 URL (选填)</label>
            <input
              v-model="form.coverUrl"
              type="url"
              placeholder="https://images.unsplash.com/..."
              class="meta-input"
            />
            <div v-if="form.coverUrl" class="cover-preview-wrapper">
              <img :src="form.coverUrl" alt="Cover Preview" class="cover-thumb" @error="$event.target.style.display='none'" />
              <span class="cover-status">封面预览成功</span>
            </div>
          </div>
        </div>

        <!-- 标签管理与预设 -->
        <div class="meta-row">
          <div class="meta-col full-width">
            <div class="label-with-tags">
              <label class="meta-label">技术标签 (逗号分隔)</label>
              <div v-if="tagList.length > 0" class="tag-badges-preview">
                <span v-for="tag in tagList" :key="tag" class="tag-badge">
                  # {{ tag }}
                </span>
              </div>
            </div>
            <input
              v-model="form.tagsString"
              type="text"
              placeholder="输入标签，以逗号分隔，如：Java 21, Spring Boot, 虚拟线程"
              class="meta-input"
            />
            <div class="preset-tags-bar">
              <span class="preset-title">推荐标签：</span>
              <button
                v-for="ptag in presetTags"
                :key="ptag"
                type="button"
                class="preset-tag-btn"
                @click="handleAddPresetTag(ptag)"
              >
                + {{ ptag }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 沉浸式双栏 Markdown 编辑与实时渲染工作台 -->
    <main class="editor-workspace" :class="`view-${viewMode}`">
      <!-- 左栏：源码编辑器 -->
      <section class="pane editor-pane" v-show="viewMode !== 'preview'">
        <!-- 工具栏 -->
        <div class="pane-header">
          <div class="tool-group">
            <span class="pane-tag">SOURCE MD</span>
            <div class="format-buttons">
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('**', '**', '粗体文字')" title="粗体 (Ctrl+B)"><b>B</b></button>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('*', '*', '斜体文字')" title="斜体"><i>I</i></button>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('~~', '~~', '删除线')" title="删除线"><s>S</s></button>
              <span class="fmt-divider"></span>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('# ', '', '一级标题')" title="一级标题">H1</button>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('## ', '', '二级标题')" title="二级标题">H2</button>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('### ', '', '三级标题')" title="三级标题">H3</button>
              <span class="fmt-divider"></span>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('> ', '', '精选引用或核心观点')" title="引用块">”</button>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('`', '`', 'code')" title="行内代码">&lt;/&gt;</button>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('```java\n', '\n```', '// 业务核心逻辑\n')" title="代码块">BLOCK</button>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('| 表头 1 | 表头 2 |\n|---|---|\n| 数据项 | 数据项 |\n', '', '')" title="插入表格">TABLE</button>
              <button type="button" class="fmt-btn" @click="insertMarkdownSnippet('[', '](https://example.com)', '链接描述')" title="超链接">LINK</button>
            </div>
          </div>

          <div class="view-mode-selector">
            <button
              type="button"
              class="mode-btn"
              :class="{ active: viewMode === 'edit' }"
              @click="viewMode = 'edit'"
              title="仅展示编辑器"
            >
              纯写
            </button>
            <button
              type="button"
              class="mode-btn"
              :class="{ active: viewMode === 'split' }"
              @click="viewMode = 'split'"
              title="左右分屏实时对比"
            >
              双栏
            </button>
            <button
              type="button"
              class="mode-btn"
              :class="{ active: viewMode === 'preview' }"
              @click="viewMode = 'preview'"
              title="仅展示排版预览"
            >
              预览
            </button>
          </div>
        </div>

        <!-- 编辑器主体 -->
        <div class="textarea-container">
          <textarea
            id="md-editor-textarea"
            v-model="form.contentMd"
            class="md-code-input"
            placeholder="在此挥洒技术灵感... 支持完整 GFM Markdown 语法、表格与高亮代码块 (Tab 缩进 2 空格，Ctrl+S 保存草稿)"
            spellcheck="false"
            @keydown="handleKeydown"
            @click="updateCursorInfo"
            @keyup="updateCursorInfo"
          ></textarea>
        </div>

        <!-- 编辑区底部微状态栏 -->
        <div class="pane-footer">
          <div class="footer-stats">
            <span class="stat-pill">行 {{ cursorInfo.line }} : 列 {{ cursorInfo.col }}</span>
            <span class="stat-pill">{{ stats.lines }} 行</span>
            <span class="stat-pill">{{ stats.words }} 词 / {{ stats.chars }} 字符</span>
            <span class="stat-pill highlight">预计阅读 {{ stats.readMinutes }} 分钟</span>
          </div>
          <div class="footer-shortcuts">
            <span>Tab 缩进</span>
            <span>Ctrl+S 暂存</span>
            <span>Ctrl+Enter 发布</span>
          </div>
        </div>
      </section>

      <!-- 右栏：实时高精预览视窗 -->
      <section class="pane preview-pane" v-show="viewMode !== 'edit'">
        <div class="pane-header preview-header">
          <div class="preview-title-wrap">
            <span class="pulse-indicator"></span>
            <span class="pane-tag">LIVE PREVIEW</span>
            <span class="preview-sync-note">1:1 同步渲染</span>
          </div>
          <div class="reading-indicator">
            阅读时长：{{ stats.readMinutes }} min · {{ stats.words }} 词
          </div>
        </div>

        <div class="preview-scroll-container">
          <!-- 模拟文章头部渲染 -->
          <article class="rendered-article-preview">
            <header v-if="form.title" class="preview-article-header">
              <div class="preview-cat-badge">{{ form.category || '技术探讨' }}</div>
              <h1 class="preview-article-title">{{ form.title }}</h1>
              <div class="preview-article-meta">
                <span>作者：Simon</span>
                <span>•</span>
                <span>{{ stats.words }} 字</span>
                <span>•</span>
                <span>{{ stats.readMinutes }} 分钟阅读</span>
              </div>
              <p v-if="form.summary" class="preview-article-summary">
                {{ form.summary }}
              </p>
            </header>

            <!-- Markdown 内容渲染 -->
            <div
              v-if="form.contentMd.trim()"
              class="markdown-body custom-markdown"
              v-html="previewHtml"
            ></div>

            <div v-else class="preview-empty-state">
              <div class="empty-icon">📝</div>
              <h3 class="empty-title">等待 Markdown 内容输入...</h3>
              <p class="empty-desc">
                在左侧键入 Markdown 文本，右侧将以高精度格式、极客科技风标题线与代码高亮实时渲染。
              </p>
              <button type="button" class="insert-sample-btn" @click="insertTemplate">
                ⚡ 载入范例文档体验
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.edit-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: calc(100vh - 120px);
}

/* 统一极客控制台顶栏 */
.admin-topbar {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.1rem 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(12px);
}

.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.console-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  color: var(--accent-color);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 6px;
  width: fit-content;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-color);
}

.badge-dot.pulse {
  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}

.title-with-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.back-link:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
  transform: translateX(-2px);
}

.page-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-main);
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.outline-btn {
  background: var(--bg-hover);
  border-color: var(--border-color);
  color: var(--text-main);
}

.outline-btn:hover:not(:disabled) {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: rgba(37, 99, 235, 0.05);
}

.draft-btn {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-main);
}

.draft-btn:hover:not(:disabled) {
  border-color: var(--text-muted);
  background: var(--bg-hover);
}

.publish-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

.publish-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45);
  transform: translateY(-1px);
}

.nav-divider {
  width: 1px;
  height: 22px;
  background: var(--border-color);
  margin: 0 4px;
}

.nav-tab {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--text-muted);
  transition: all 0.2s;
}

.nav-tab.active {
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent-color);
}

.nav-tab:hover:not(.active) {
  color: var(--text-main);
  background: var(--bg-hover);
}

.view-site-btn {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  transition: all 0.2s;
}

.view-site-btn:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.logout-btn {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  transition: all 0.2s;
}

.logout-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

/* 元数据配置卡片 */
.meta-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.meta-header-bar {
  padding: 10px 16px;
  background: var(--bg-hover);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  user-select: none;
}

.meta-section:not(.collapsed) .meta-header-bar {
  border-bottom-color: var(--border-color);
}

.meta-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
}

.meta-hint {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 8px;
}

.drawer-toggle-btn {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent-color);
  background: transparent;
  border: none;
  cursor: pointer;
}

.meta-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.meta-row {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.meta-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-grow {
  flex: 1;
  min-width: 320px;
}

.col-fixed {
  width: 340px;
}

.full-width {
  flex: 1 1 100%;
}

.meta-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-star {
  color: #ef4444;
}

.meta-input {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.92rem;
  outline: none;
  transition: all 0.2s;
}

.meta-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  background: var(--bg-card);
}

.title-input {
  font-size: 1.15rem;
  font-weight: 700;
}

.meta-textarea {
  resize: vertical;
  min-height: 62px;
  font-family: inherit;
  line-height: 1.5;
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.cat-chip {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.cat-chip:hover {
  border-color: var(--accent-color);
  color: var(--text-main);
}

.cat-chip.active {
  background: rgba(37, 99, 235, 0.1);
  border-color: var(--accent-color);
  color: var(--accent-color);
  font-weight: 600;
}

.cover-preview-wrapper {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cover-thumb {
  width: 48px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.cover-status {
  font-size: 0.75rem;
  color: var(--success-color);
  font-weight: 600;
}

.label-with-tags {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-badges-preview {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(14, 165, 233, 0.1);
  color: #0284c7;
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.preset-tags-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.preset-title {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.preset-tag-btn {
  font-size: 0.72rem;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.preset-tag-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

/* 沉浸式编辑工作区 */
.editor-workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  height: calc(100vh - 280px);
  min-height: 580px;
}

.editor-workspace.view-edit {
  grid-template-columns: 1fr;
}

.editor-workspace.view-preview {
  grid-template-columns: 1fr;
}

.pane {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
}

.pane-tag {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  font-family: "JetBrains Mono", Consolas, monospace;
}

.format-buttons {
  display: flex;
  align-items: center;
  gap: 3px;
}

.fmt-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 5px;
  padding: 3px 7px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.fmt-btn:hover {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}

.fmt-divider {
  width: 1px;
  height: 16px;
  background: var(--border-color);
  margin: 0 3px;
}

.view-mode-selector {
  display: flex;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.mode-btn {
  background: transparent;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: var(--accent-color);
  color: #fff;
}

.mode-btn:hover:not(.active) {
  color: var(--text-main);
}

/* 文本编辑区 */
.textarea-container {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.md-code-input {
  flex: 1;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-main);
  border: none;
  padding: 1.25rem;
  font-family: "JetBrains Mono", "Fira Code", Consolas, Monaco, monospace;
  font-size: 0.95rem;
  line-height: 1.7;
  resize: none;
  outline: none;
  tab-size: 2;
  overflow-y: auto;
}

/* 底部状态栏 */
.pane-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 0.74rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.footer-stats {
  display: flex;
  gap: 8px;
}

.stat-pill {
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.stat-pill.highlight {
  color: var(--accent-color);
  border-color: rgba(37, 99, 235, 0.2);
  background: rgba(37, 99, 235, 0.06);
  font-weight: 600;
}

.footer-shortcuts {
  display: flex;
  gap: 10px;
}

/* 预览视窗 */
.preview-header {
  background: var(--bg-hover);
}

.preview-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.preview-sync-note {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.reading-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.preview-scroll-container {
  flex: 1;
  padding: 1.75rem 2rem;
  overflow-y: auto;
  background: var(--bg-secondary);
}

.rendered-article-preview {
  max-width: 780px;
  margin: 0 auto;
}

.preview-article-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
}

.preview-cat-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-color);
  background: rgba(37, 99, 235, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.preview-article-title {
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--text-main);
  margin-bottom: 10px;
}

.preview-article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.preview-article-summary {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.6;
  background: var(--bg-card);
  border-left: 3px solid var(--accent-color);
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  margin: 0;
}

.preview-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.empty-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  max-width: 420px;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.insert-sample-btn {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--accent-color);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.insert-sample-btn:hover {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}

@media (max-width: 960px) {
  .editor-workspace {
    grid-template-columns: 1fr !important;
    height: auto;
  }
  .pane {
    height: 520px;
  }
  .col-fixed {
    width: 100%;
  }
}
</style>
