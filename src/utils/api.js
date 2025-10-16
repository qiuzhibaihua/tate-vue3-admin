// API 工具函数
import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  // API 基础URL
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  // 请求超时时间
  timeout: 10000,
  // 请求头设置
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从本地存储获取 token
    const token = localStorage.getItem('token')
    // 如果有 token，则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 检查响应状态码
    if (res.code !== 200) {
      // 处理常见错误
      if (res.code === 401) {
        // 未授权，清除 token 并跳转到登录页
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('Response error:', error)
    
    // 处理网络错误
    let errorMessage = '网络错误，请稍后重试'
    
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = error.response.data?.message || '服务器错误'
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '网络连接失败，请检查网络'
    }
    
    // 这里可以添加全局错误提示
    console.error(errorMessage)
    
    return Promise.reject(new Error(errorMessage))
  }
)

// 封装常用请求方法
export const request = {
  get: (url, params = {}) => service.get(url, { params }),
  post: (url, data = {}) => service.post(url, data),
  put: (url, data = {}) => service.put(url, data),
  delete: (url, params = {}) => service.delete(url, { params }),
  patch: (url, data = {}) => service.patch(url, data)
}

// 认证相关 API
export const loginApi = (credentials) => {
  return request.post('/auth/login', credentials)
}

export const logoutApi = () => {
  return request.post('/auth/logout')
}

export const getUserInfoApi = () => {
  return request.get('/auth/userInfo')
}

// 用户管理 API
export const getUserListApi = (params) => {
  return request.get('/users', params)
}

export const createUserApi = (data) => {
  return request.post('/users', data)
}

export const updateUserApi = (id, data) => {
  return request.put(`/users/${id}`, data)
}

export const deleteUserApi = (id) => {
  return request.delete(`/users/${id}`)
}

// 角色管理 API
export const getRoleListApi = (params) => {
  return request.get('/roles', params)
}

export const createRoleApi = (data) => {
  return request.post('/roles', data)
}

export const updateRoleApi = (id, data) => {
  return request.put(`/roles/${id}`, data)
}

export const deleteRoleApi = (id) => {
  return request.delete(`/roles/${id}`)
}

// 轨迹相关 API
export const getTrajectoryListApi = (params) => {
  return request.get('/trajectories', params)
}

export const createTrajectoryApi = (data) => {
  return request.post('/trajectories', data)
}

export const updateTrajectoryApi = (id, data) => {
  return request.put(`/trajectories/${id}`, data)
}

export const deleteTrajectoryApi = (id) => {
  return request.delete(`/trajectories/${id}`)
}

// 仪表盘数据 API
export const getDashboardDataApi = () => {
  return request.get('/dashboard/data')
}

export default service