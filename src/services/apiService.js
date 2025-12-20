// apiService.js - API服务层

const API_BASE_URL = 'http://localhost:8080/api';

// 获取认证令牌
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// 通用请求函数
const request = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // 未授权，清除本地存储并跳转到登录
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    throw new Error(`API请求失败: ${response.status}`);
  }

  // 检查响应是否为JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return response;
};

// 用户认证API
export const authApi = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// 用户数据API
export const userDataApi = {
  getAll: () => request('/user-data'),
  getByType: (dataType) => request(`/user-data/type/${dataType}`),
  getByTypeAndKey: (dataType, dataKey) => request(`/user-data/type/${dataType}/key/${dataKey}`),
  createOrUpdate: (userData) => request('/user-data', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  delete: (id) => request(`/user-data/${id}`, {
    method: 'DELETE',
  }),
};

// 课件数据API
export const coursewareApi = {
  getAll: () => request('/user-data/type/courseware'),
  getById: (id) => request(`/user-data/type/courseware/key/${id}`),
  createOrUpdate: (coursewareData) => request('/user-data', {
    method: 'POST',
    body: JSON.stringify({
      ...coursewareData,
      dataType: 'courseware',
    }),
  }),
  delete: (id) => request(`/user-data/type/courseware/key/${id}`, {
    method: 'DELETE',
  }),
};

// 图数据API
export const graphApi = {
  getAll: () => request('/user-data/type/graphs'),
  getById: (id) => request(`/user-data/type/graphs/key/${id}`),
  createOrUpdate: (graphData) => request('/user-data', {
    method: 'POST',
    body: JSON.stringify({
      ...graphData,
      dataType: 'graphs',
    }),
  }),
  delete: (id) => request(`/user-data/type/graphs/key/${id}`, {
    method: 'DELETE',
  }),
};

// 树数据API
export const treeApi = {
  getAll: () => request('/user-data/type/trees'),
  getById: (id) => request(`/user-data/type/trees/key/${id}`),
  createOrUpdate: (treeData) => request('/user-data', {
    method: 'POST',
    body: JSON.stringify({
      ...treeData,
      dataType: 'trees',
    }),
  }),
  delete: (id) => request(`/user-data/type/trees/key/${id}`, {
    method: 'DELETE',
  }),
};

// 知识图谱API
export const knowledgeGraphApi = {
  getAll: () => request('/user-data/type/knowledge-graph'),
  getById: (id) => request(`/user-data/type/knowledge-graph/key/${id}`),
  createOrUpdate: (graphData) => request('/user-data', {
    method: 'POST',
    body: JSON.stringify({
      ...graphData,
      dataType: 'knowledge-graph',
    }),
  }),
  delete: (id) => request(`/user-data/type/knowledge-graph/key/${id}`, {
    method: 'DELETE',
  }),
};

// 用户管理API
export const userApi = {
  getAllUsers: () => request('/users'),
};
