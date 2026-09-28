/**
 * 统一 HTTP 请求客户端（基于原生 fetch 封装）
 * 零第三方依赖、纯 ESM，自动注入 Token、统一错误处理
 */

const TOKEN_KEY = 'blog_admin_token';
const USERNAME_KEY = 'blog_admin_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuthSession(token, username) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (username) {
    localStorage.setItem(USERNAME_KEY, username);
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function getLoggedInUser() {
  return localStorage.getItem(USERNAME_KEY) || '';
}

export function isLoggedIn() {
  return Boolean(getToken());
}

/**
 * 统一网络请求封装
 * @param {string} url 
 * @param {RequestInit} options 
 * @returns {Promise<any>}
 */
export async function request(url, options = {}) {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // 未授权处理
    if (response.status === 401) {
      clearAuthSession();
      // 如果当前是在管理端路由，则跳转至登录页
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || '登录会话已过期，请重新登录');
    }

    const data = await response.json();

    if (!response.ok || (data.code !== undefined && data.code !== 0)) {
      throw new Error(data.message || `请求失败 (${response.status})`);
    }

    return data.data;
  } catch (err) {
    console.error(`[API Error] ${url}:`, err.message);
    throw err;
  }
}
