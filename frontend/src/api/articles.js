import { request } from './request.js';

export const articleApi = {
  // 读者端接口
  getArticles(params = {}) {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.tag) query.set('tag', params.tag);
    if (params.category) query.set('category', params.category);
    if (params.page) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    const qs = query.toString();
    return request(`/api/articles${qs ? '?' + qs : ''}`);
  },

  getArticleDetail(id) {
    return request(`/api/articles/${id}`);
  },

  getRecentArticles(limit = 5) {
    return request(`/api/articles/recent?limit=${limit}`);
  },

  getArchives() {
    return request('/api/articles/archives');
  },

  getCategories() {
    return request('/api/categories');
  },

  getTags() {
    return request('/api/tags');
  },

  // 管理端接口
  getAdminArticles(params = {}) {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.tag) query.set('tag', params.tag);
    if (params.category) query.set('category', params.category);
    if (params.page) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    const qs = query.toString();
    return request(`/api/admin/articles${qs ? '?' + qs : ''}`);
  },

  getAdminArticleDetail(id) {
    return request(`/api/admin/articles/${id}`);
  },

  createArticle(data) {
    return request('/api/admin/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateArticle(id, data) {
    return request(`/api/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteArticle(id) {
    return request(`/api/admin/articles/${id}`, {
      method: 'DELETE',
    });
  },

  getAdminStats() {
    return request('/api/admin/articles/stats');
  },
};
