import axios, { AxiosRequestConfig } from "axios"
import { getCookie, COOKIE_NAMES, setCookie } from "../auth/cookie"
import router from "@/router"
import { userOps } from "../auth/auth"

// ref: https://www.bilibili.com/video/BV1qYduYqErV
const axiosInstance = axios.create({
  //@todo implement env baseURL
  baseURL: import.meta.env.DEV ? '/api' : 'http://localhost:3000',
  timeout: 10000, // 设置请求超时时间为10秒
  headers: {
    'Content-Type': 'application/json',
    // 'Accept': 'application/json'
  }
})
axiosInstance.interceptors.request.use(config => {
  const token = getCookie(COOKIE_NAMES.TOKEN)
  if (token) {
    //! 设定 Authorization header 而非直接用 cookie 传递，防止 CSRF 攻击？
    config.headers['authorization'] = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})
axiosInstance.interceptors.response.use(async res => {
  if (res.status === 401) {
    // Token 过期或无效，清除本地存储并跳转到登录页
    userOps.logout();
    router.push({ name: 'auth' });
  }
  if (res.status === 403) {
    // 没有权限访问，可能是因为 token 已过期或无效
    console.warn('没有权限访问该资源，请检查您的登录状态。');
    return res; // 继续返回响应
  }
  //! 实际传输全部是小写……
  const token = res.headers['authorization']?.replace('Bearer ', '')
  if (token) {
    // 存储新的 token
    setCookie(COOKIE_NAMES.TOKEN, token)
  }
  return res
})

export const request = {
  get: (url: string, params?: AxiosRequestConfig) => axiosInstance.get(url, params),
  post: (url: string, data: any) => axiosInstance.post(url, data),
  put: (url: string, data: any) => axiosInstance.put(url, data),
  delete: (url: string, params?: AxiosRequestConfig) => axiosInstance.delete(url, params),
  patch: (url: string, data: any) => axiosInstance.patch(url, data),
}