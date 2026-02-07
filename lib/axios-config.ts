import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken } from './auth';
import { log, logError } from './logger';
import { authEventBus } from './auth-event';
import { getLocale } from './get-locale';

// 创建默认 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  timeout: 600000, // 600秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 打印请求日志
    log(`\n[Axios Request] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      log('Request data:', config.data);
    }
    return config;
  },
  (error: AxiosError) => {
    logError('[Axios Request Error]', error.message);
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 打印响应日志
    log(`[Axios Response] ${response.status} ${response.statusText}`);
    if (response.data) {
      log('Response data:', response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // 服务器响应了错误状态码
      logError(`[Axios Response Error] ${error.response.status} ${error.response.statusText}`);
      logError('Error data:', error.response.data);
      
      // 不自动处理 401，让调用方根据业务逻辑决定
      // 注意：如果需要在登录失效时重定向，应该在业务层处理
      if (error.response.status === 401) {
        logError('[Axios] Token expired or invalid (401) - letting caller handle');
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      logError('[Axios Network Error] No response received');
    } else {
      // 其他错误
      logError('[Axios Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// 创建 AI Hub 专用的 axios 实例
const AI_HUB_BASE_URL = process.env.NEXT_PUBLIC_AI_HUB_API_URL
const AI_HUB_APP_KEY = process.env.AI_HUB_APP_KEY

console.log('[AI Hub Config] Using base URL:', AI_HUB_BASE_URL);
console.log('[AI Hub Config] App Key configured:', !!AI_HUB_APP_KEY);

// 判断是否为登录前的请求（不需要 token，使用 App Key 认证）
function isPreLoginRequest(url?: string): boolean {
  if (!url) return false;
  
  const preLoginPaths = [
    '/app/user/login/smsCode',      // AI Hub: 发送短信验证码
    '/app/user/login/phone',         // AI Hub: 手机号登录
    '/app/user/login/resetPassword', // AI Hub: 重置密码
    '/admin/base/open/captcha',      // AI Hub: 获取图形验证码
    '/admin/base/open/login',        // AI Hub: 验证图形验证码
  ];
  
  return preLoginPaths.some(path => url.includes(path));
}

const aiHubAxios: AxiosInstance = axios.create({
  baseURL: AI_HUB_BASE_URL,
  timeout: 300000, // 300秒（5分钟）超时，克隆音色合成需要更长时间
  headers: {
    'Content-Type': 'application/json',
    'Connection': 'keep-alive',
  },
  // 禁用请求体大小限制
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

// AI Hub 请求拦截器
aiHubAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const fullUrl = `${config.baseURL}${config.url}`;

    // 添加 App Key
    if (AI_HUB_APP_KEY) {
      config.headers['appkey'] = AI_HUB_APP_KEY;
      log(`\n[AI Hub Request] ${config.method?.toUpperCase()} ${fullUrl}`);
      log('Using App Key authentication');
    }

    // 登录后请求：使用 Token 认证
    // 优先使用请求中已经传入的 Authorization（适用于 API Route 场景）
    const existingAuth = config.headers.Authorization;
    if (existingAuth) {
      // 已经有 token，保持不变
      log(`\n[AI Hub Request - Authenticated] ${config.method?.toUpperCase()} ${fullUrl}`);
      log('Using existing Authorization from request headers');
    } else {
      // 没有 token，尝试从 localStorage 获取（仅客户端环境）
      const token = getToken();
      if (token) {
        config.headers.Authorization = token;  // AI Hub 不需要 Bearer 前缀
        log(`\n[AI Hub Request - Authenticated] ${config.method?.toUpperCase()} ${fullUrl}`);
        log('Using Token from localStorage');
      } else {
        log(`\n[AI Hub Request - No Auth] ${config.method?.toUpperCase()} ${fullUrl}`);
        logError('[AI Hub] No token found for authenticated request');
      }
    }

    // 添加语言头
    const locale = getLocale();
    // 映射前端语言代码到后端格式: zh -> zh-cn, en -> en
    const backendLocale = locale === 'zh' ? 'zh-cn' : locale;
    config.headers['language'] = backendLocale;
    log('Using language:', backendLocale);

    // 打印请求数据
    if (config.data) {
      // 如果是 FormData，打印其字段信息
      if (config.data instanceof FormData) {
        const formDataEntries: Record<string, any> = {};
        config.data.forEach((value: any, key: string) => {
          if (value instanceof Blob || value instanceof File) {
            formDataEntries[key] = `[${value.constructor.name}] ${value.size} bytes`;
          } else {
            formDataEntries[key] = value;
          }
        });
        log('Request data (FormData):', formDataEntries);
      } else {
        log('Request data:', config.data);
      }
    }

    // 临时：输出完整的请求头用于调试
    log('Request headers (full for debugging):', {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers['Authorization'],
      'appkey': config.headers['appkey'],
      'language': config.headers['language'],
    });

    return config;
  },
  (error: AxiosError) => {
    logError('[AI Hub Request Error]', error.message);
    return Promise.reject(error);
  }
);

// AI Hub 响应拦截器
aiHubAxios.interceptors.response.use(
  (response) => {
    log(`[AI Hub Response] ${response.status} ${response.statusText}`);
    if (response.data) {
      log('Response data:', response.data);
      
      // 检查业务层面的登录失效（message 包含"登录失效"）
      if (response.data.message && response.data.message.includes('登录失效')) {
        logError('[AI Hub] Login expired:', response.data.message);
        // 在服务端环境，不能使用 window 对象
        // 只是记录日志，让调用方处理
        if (typeof window !== 'undefined') {
          // 客户端环境：清除存储并触发事件打开登录弹窗
          localStorage.removeItem('aiHubToken');
          localStorage.removeItem('aiHubToken_full');
          localStorage.removeItem('aiHubData');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('userPhone');
          
          // 触发登录失效事件，打开登录弹窗
          authEventBus.emit({
            type: 'login-expired',
            message: response.data.message
          });
          
          // 抛出错误，阻止后续处理
          return Promise.reject(new Error('登录失效，请重新登录'));
        }
        // 服务端环境只返回原始数据，让路由处理
      }
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      logError(`[AI Hub Response Error] ${error.response.status} ${error.response.statusText}`);
      logError('Error data:', error.response.data);
      
      // 检查 HTTP 401 状态码，触发事件打开登录弹窗
      if (error.response.status === 401) {
        logError('[AI Hub] Token expired or invalid (401)');
        if (typeof window !== 'undefined') {
          // 清除本地认证信息
          localStorage.removeItem('aiHubToken');
          localStorage.removeItem('aiHubToken_full');
          localStorage.removeItem('aiHubData');
          
          // 触发登录失效事件，打开登录弹窗
          authEventBus.emit({
            type: 'unauthorized',
            message: '您的登录已过期，请重新登录'
          });
        }
      }
    } else if (error.request) {
      logError('[AI Hub Network Error] No response received');
      logError('Request details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        timeout: error.config?.timeout,
        code: error.code,
        message: error.message
      });
    } else {
      logError('[AI Hub Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// 创建 Evolink 专用的 axios 实例
const EVOLINK_API_URL = process.env.EVOLINK_API_URL;
const EVOLINK_API_KEY = process.env.EVOLINK_API_KEY;

console.log('[Evolink Config] Using base URL:', EVOLINK_API_URL);
console.log('[Evolink Config] API Key configured:', !!EVOLINK_API_KEY);

const evolinkAxios: AxiosInstance = axios.create({
  baseURL: EVOLINK_API_URL,
  timeout: 300000, // 300秒（5分钟）超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// Evolink 请求拦截器
evolinkAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const fullUrl = `${config.baseURL}${config.url}`;

    // 添加 API Key
    if (EVOLINK_API_KEY) {
      config.headers['Authorization'] = `Bearer ${EVOLINK_API_KEY}`;
      log(`\n[Evolink Request] ${config.method?.toUpperCase()} ${fullUrl}`);
      log('Using API Key authentication');
    }

    // 打印请求数据
    if (config.data) {
      log('Request data:', config.data);
    }

    return config;
  },
  (error: AxiosError) => {
    logError('[Evolink Request Error]', error.message);
    return Promise.reject(error);
  }
);

// Evolink 响应拦截器
evolinkAxios.interceptors.response.use(
  (response) => {
    log(`[Evolink Response] ${response.status} ${response.statusText}`);
    if (response.data) {
      log('Response data:', response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      logError(`[Evolink Response Error] ${error.response.status} ${error.response.statusText}`);
      logError('Error data:', error.response.data);
    } else if (error.request) {
      logError('[Evolink Network Error] No response received');
      logError('Request details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        timeout: error.config?.timeout,
        code: error.code,
        message: error.message
      });
    } else {
      logError('[Evolink Error]', error.message);
    }
    return Promise.reject(error);
  }
);


export { axiosInstance, aiHubAxios, evolinkAxios };

export default axiosInstance;
