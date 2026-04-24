import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从本地存储获取用户信息
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      // 携带 token 和 userId 到请求头
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`
      }
      if (user.id) {
        config.headers['X-User-Id'] = user.id
      }
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 统一处理后端返回码
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  error => {
    console.error('响应错误:', error)
    ElMessage.error('网络错误，请检查网络连接')
    return Promise.reject(error)
  }
)

export default request