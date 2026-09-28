<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../../api/auth.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMsg.value = '请完整填写用户名与密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await authApi.login(username.value, password.value)
    router.push('/admin/articles')
  } catch (err) {
    errorMsg.value = err.message || '登录失败，请检查用户名或密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-circle">
          <span>🛡️</span>
        </div>
        <h1 class="login-title">站长控制台登录</h1>
        <p class="login-subtitle">管理个人站博文创作、作品发布与系统数据运维</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div v-if="errorMsg" class="error-banner">
          ⚠️ {{ errorMsg }}
        </div>

        <div class="form-group">
          <label class="form-label">管理员账号</label>
          <div class="input-with-icon">
            <span class="field-icon">👤</span>
            <input
              v-model="username"
              type="text"
              placeholder="请输入管理员账号"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">管理密码</label>
          <div class="input-with-icon">
            <span class="field-icon">🔑</span>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="form-input"
              required
            />
          </div>
        </div>


        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">验证鉴权中…</span>
          <span v-else>立即登录控制台 →</span>
        </button>

        <router-link to="/" class="back-home-link">
          ← 返回博客前台首页
        </router-link>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 72vh;
  padding: 1.5rem 0;
}

.login-card {
  width: 100%;
  max-width: 430px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2.8rem 2.2rem;
  box-shadow: 0 20px 48px -6px rgba(0, 0, 0, 0.15), 0 0 28px rgba(139, 92, 246, 0.15);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-circle {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
}

.login-title {
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.4px;
  color: var(--text-main);
}

.login-subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 6px;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-banner {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.84rem;
  text-align: center;
  font-weight: 600;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
}

.input-with-icon {
  display: flex;
  align-items: center;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0 12px;
  transition: all 0.2s ease;
}

.input-with-icon:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--glow-color);
}

.field-icon {
  font-size: 0.95rem;
  margin-right: 8px;
  opacity: 0.7;
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-main);
  padding: 11px 0;
  font-size: 0.92rem;
  outline: none;
}

.preset-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  padding: 7px 12px;
  border-radius: 8px;
}

.tip-label {
  font-weight: 600;
}

.preset-tip code {
  color: var(--accent-color);
  font-weight: 700;
  background: var(--tag-bg);
  padding: 1px 5px;
  border-radius: 4px;
}

.fill-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--accent-color);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.submit-btn {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.96rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
  margin-top: 0.4rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(139, 92, 246, 0.45);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.back-home-link {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
  margin-top: 0.2rem;
  transition: color 0.2s;
}

.back-home-link:hover {
  color: var(--accent-color);
}
</style>
