<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { workApi } from '../../api/works.js'
import { authApi } from '../../api/auth.js'

const router = useRouter()
const works = ref([])
const loading = ref(true)

// 编辑模态框状态
const isModalOpen = ref(false)
const modalTitle = ref('新增作品')
const editingId = ref(null)
const submitting = ref(false)

const form = ref({
  title: '',
  description: '',
  coverUrl: '',
  demoUrl: '',
  githubUrl: '',
  techStackString: '',
  sortOrder: 0,
})

function getTagColorClass(tag) {
  if (!tag) return 'tag-cyan'
  const hash = tag.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const classes = ['tag-cyan', 'tag-emerald', 'tag-violet', 'tag-amber', 'tag-rose']
  return classes[hash % classes.length]
}

async function loadWorks() {
  loading.value = true
  try {
    const list = await workApi.getWorks()
    works.value = list || []
  } catch (e) {
    console.error('加载作品异常', e)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingId.value = null
  modalTitle.value = '新增作品'
  form.value = {
    title: '',
    description: '',
    coverUrl: '',
    demoUrl: '',
    githubUrl: '',
    techStackString: '',
    sortOrder: works.value.length + 1,
  }
  isModalOpen.value = true
}

function openEditModal(w) {
  editingId.value = w.id
  modalTitle.value = '编辑作品'
  form.value = {
    title: w.title || '',
    description: w.description || '',
    coverUrl: w.coverUrl || '',
    demoUrl: w.demoUrl || '',
    githubUrl: w.githubUrl || '',
    techStackString: (w.techStack || []).join(', '),
    sortOrder: w.sortOrder !== undefined ? w.sortOrder : 0,
  }
  isModalOpen.value = true
}

async function handleSave() {
  if (!form.value.title.trim()) {
    alert('请填写作品名称')
    return
  }

  const techStack = form.value.techStackString
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)

  const payload = {
    title: form.value.title,
    description: form.value.description,
    coverUrl: form.value.coverUrl,
    demoUrl: form.value.demoUrl,
    githubUrl: form.value.githubUrl,
    techStack,
    sortOrder: Number(form.value.sortOrder) || 0,
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await workApi.updateWork(editingId.value, payload)
      alert('作品更新成功！')
    } else {
      await workApi.createWork(payload)
      alert('作品新增成功！')
    }
    isModalOpen.value = false
    loadWorks()
  } catch (e) {
    alert('保存失败: ' + e.message)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(w) {
  if (!confirm(`【高危操作警告】确定要删除作品《${w.title}》吗？`)) {
    return
  }
  try {
    await workApi.deleteWork(w.id)
    alert('作品已成功删除')
    loadWorks()
  } catch (e) {
    alert('删除失败: ' + e.message)
  }
}

function handleLogout() {
  if (confirm('确定要退出管理员登录吗？')) {
    authApi.logout()
    router.push('/')
  }
}

onMounted(() => {
  loadWorks()
})
</script>

<template>
  <div class="admin-console-page">
    <!-- 统一控制台极客顶栏 (Admin Console Shell Header) -->
    <header class="console-topbar-card">
      <div class="console-brand">
        <div class="console-shield-badge">⚙️</div>
        <div class="console-brand-text">
          <span class="console-title">博客后台管理</span>
          <span class="console-runtime-badge">作品项目维护</span>
        </div>
      </div>

      <nav class="console-nav-tabs">
        <router-link to="/admin/models" class="console-tab-item">
          🤖 模型监控审核
        </router-link>
        <router-link to="/admin/articles" class="console-tab-item">
          📝 博文管理
        </router-link>
        <router-link to="/admin/works" class="console-tab-item active">
          🛠️ 作品管理
        </router-link>
        <router-link to="/admin/articles/new" class="console-tab-item create-tab">
          ✍️ 撰写新博文
        </router-link>
      </nav>

      <div class="console-right-actions">
        <span class="admin-user-pill">👤 admin</span>
        <router-link to="/" target="_blank" class="preview-front-btn" title="在新标签页预览前台">
          ↗ 前台博客
        </router-link>
        <button class="console-logout-btn" title="安全退出登录" @click="handleLogout">
          登出
        </button>
      </div>
    </header>

    <!-- 主管理面板：作品管理列表 -->
    <main class="console-main-panel">
      <div class="panel-header-bar">
        <div class="title-with-count">
          <h2 class="section-title">作品仓库列表 ({{ works.length }})</h2>
          <span class="section-desc">维护个人代表性工程开源成果、演示体验地址与技术栈</span>
        </div>

        <button class="create-work-cta" @click="openCreateModal">
          ➕ 新增代表作品
        </button>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <table class="modern-admin-table">
          <thead>
            <tr>
              <th width="30%">作品信息</th>
              <th width="32%">详细描述</th>
              <th width="18%">技术栈</th>
              <th width="8%">权重</th>
              <th width="12%" class="text-right">管理操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="empty-cell">
                ⌛ 正在读取作品数据…
              </td>
            </tr>
            <tr v-else-if="works.length === 0">
              <td colspan="5" class="empty-cell">
                📦 暂无作品数据，点击右上角“新增代表作品”添加
              </td>
            </tr>
            <tr v-for="w in works" :key="w.id" class="table-data-row">
              <td>
                <div class="work-identity-cell">
                  <img
                    v-if="w.coverUrl"
                    :src="w.coverUrl"
                    :alt="w.title"
                    class="work-thumb-mini"
                  />
                  <div class="work-title-wrap">
                    <span class="work-name">{{ w.title }}</span>
                    <div class="work-links-row">
                      <a v-if="w.demoUrl" :href="w.demoUrl" target="_blank" class="mini-ext-link">
                        演示 ↗
                      </a>
                      <a v-if="w.githubUrl" :href="w.githubUrl" target="_blank" class="mini-ext-link">
                        源码 ↗
                      </a>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <p class="work-desc-text">{{ w.description }}</p>
              </td>
              <td>
                <div class="work-tech-pills">
                  <span v-for="t in w.techStack" :key="t" :class="['tech-pill', getTagColorClass(t)]">
                    {{ t }}
                  </span>
                </div>
              </td>
              <td>
                <span class="order-badge">{{ w.sortOrder || 0 }}</span>
              </td>
              <td class="text-right">
                <div class="table-actions-group">
                  <button class="action-mini-pill btn-edit" @click="openEditModal(w)">
                    编辑
                  </button>
                  <button class="action-mini-pill btn-delete" @click="handleDelete(w)">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- 毛玻璃编辑模态弹窗 (Modal Dialog) -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="isModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-heading">{{ modalTitle }}</h3>
          <button class="modal-close-btn" @click="isModalOpen = false">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label">作品名称 *</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="例如：极简个人全栈博客系统"
              class="modal-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">简要描述</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="一句话清晰说明该作品的架构特色或业务功能..."
              class="modal-textarea"
            ></textarea>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">技术栈标签（逗号隔开）</label>
              <input
                v-model="form.techStackString"
                type="text"
                placeholder="Spring Boot 4, Vue 3, Vite"
                class="modal-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">排序权重（越大越靠前）</label>
              <input
                v-model.number="form.sortOrder"
                type="number"
                class="modal-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">封面图片 URL</label>
            <input
              v-model="form.coverUrl"
              type="url"
              placeholder="https://images.unsplash.com/..."
              class="modal-input"
            />
            <div v-if="form.coverUrl" class="img-preview-box">
              <img :src="form.coverUrl" alt="封面预览" />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">在线体验链接 (Demo URL)</label>
              <input
                v-model="form.demoUrl"
                type="url"
                placeholder="http://localhost:8080"
                class="modal-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">GitHub 开源仓库 URL</label>
              <input
                v-model="form.githubUrl"
                type="url"
                placeholder="https://github.com/..."
                class="modal-input"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="isModalOpen = false">取消</button>
            <button type="submit" class="btn-save" :disabled="submitting">
              {{ submitting ? '保存中…' : '确认保存作品' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-console-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 统一控制台极客顶栏 */
.console-topbar-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem 1.6rem;
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
  position: relative;
  overflow: hidden;
}

.console-topbar-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899);
}

.console-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.console-shield-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.console-brand-text {
  display: flex;
  flex-direction: column;
}

.console-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.console-runtime-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

.console-nav-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-hover);
  padding: 4px 6px;
  border-radius: 30px;
  border: 1px solid var(--border-color);
}

.console-tab-item {
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 6px 16px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.console-tab-item:hover { color: var(--text-main); }
.console-tab-item.active {
  background: var(--bg-secondary);
  color: var(--accent-color);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.console-tab-item.create-tab { color: #10b981; }

.console-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-user-pill {
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 5px 12px;
  border-radius: 20px;
}

.preview-front-btn, .console-logout-btn {
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.preview-front-btn {
  background: var(--bg-hover);
  color: var(--accent-color);
  border: 1px solid var(--border-color);
}

.preview-front-btn:hover { border-color: var(--accent-color); }

.console-logout-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.console-logout-btn:hover {
  background: #ef4444;
  color: #fff;
}

/* 主面板 */
.console-main-panel {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.6rem 1.8rem;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-with-count {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.section-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.create-work-cta {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: #fff;
  border: none;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 9px 20px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
  transition: all 0.2s;
}

.create-work-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(6, 182, 212, 0.45);
}

/* 表格样式 */
.table-container {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.modern-admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  text-align: left;
}

.modern-admin-table th {
  background: var(--bg-hover);
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.76rem;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.modern-admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  vertical-align: middle;
}

.table-data-row:hover td {
  background: var(--bg-hover);
}

.work-identity-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.work-thumb-mini {
  width: 56px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.work-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.work-name {
  font-weight: 750;
  color: var(--text-main);
}

.work-links-row {
  display: flex;
  gap: 8px;
}

.mini-ext-link {
  font-size: 0.74rem;
  color: var(--accent-color);
  text-decoration: none;
}

.mini-ext-link:hover { text-decoration: underline; }

.work-desc-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.work-tech-pills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tech-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
}

.order-badge {
  font-family: monospace;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
}

.text-right { text-align: right; }

.table-actions-group {
  display: inline-flex;
  gap: 6px;
}

.action-mini-pill {
  text-decoration: none;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
  background: var(--bg-hover);
  color: var(--text-main);
}

.action-mini-pill:hover { transform: translateY(-1px); }

.btn-edit {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  border-color: rgba(6, 182, 212, 0.3);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.empty-cell {
  text-align: center;
  padding: 3rem !important;
  color: var(--text-muted);
}

/* ====================================================
   毛玻璃模态弹窗
==================================================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 580px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.8rem 2rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.modal-heading {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
}

.modal-input, .modal-textarea {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--text-main);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.modal-input:focus, .modal-textarea:focus {
  border-color: var(--accent-color);
}

.img-preview-box {
  margin-top: 6px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.img-preview-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  background: var(--bg-hover);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.btn-save:hover:not(:disabled) {
  filter: brightness(1.1);
}

/* 多彩徽标与标签通用样式 */
.tag-cyan {
  background: rgba(6, 182, 212, 0.12) !important;
  color: #06b6d4 !important;
  border: 1px solid rgba(6, 182, 212, 0.28) !important;
}
.tag-emerald {
  background: rgba(16, 185, 129, 0.12) !important;
  color: #10b981 !important;
  border: 1px solid rgba(16, 185, 129, 0.28) !important;
}
.tag-violet {
  background: rgba(139, 92, 246, 0.12) !important;
  color: #8b5cf6 !important;
  border: 1px solid rgba(139, 92, 246, 0.28) !important;
}
.tag-amber {
  background: rgba(245, 158, 11, 0.12) !important;
  color: #f59e0b !important;
  border: 1px solid rgba(245, 158, 11, 0.28) !important;
}
.tag-rose {
  background: rgba(236, 72, 153, 0.12) !important;
  color: #ec4899 !important;
  border: 1px solid rgba(236, 72, 153, 0.28) !important;
}
</style>
