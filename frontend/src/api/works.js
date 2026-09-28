import { request } from './request.js';

export const workApi = {
  // 读者端
  getWorks() {
    return request('/api/works');
  },

  getWorkDetail(id) {
    return request(`/api/works/${id}`);
  },

  // 管理端
  createWork(data) {
    return request('/api/admin/works', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWork(id, data) {
    return request(`/api/admin/works/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteWork(id) {
    return request(`/api/admin/works/${id}`, {
      method: 'DELETE',
    });
  },
};
