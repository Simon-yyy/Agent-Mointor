import { request, setAuthSession, clearAuthSession, isLoggedIn, getToken } from './request.js';

export const authApi = {
  async login(username, password) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data && data.token) {
      setAuthSession(data.token, data.username);
    }
    return data;
  },

  async check() {
    return request('/api/auth/check');
  },

  logout() {
    clearAuthSession();
  },

  isLoggedIn,
  getToken,
};
