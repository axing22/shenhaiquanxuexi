/**
 * 前端 API 客户端
 * 统一处理 API 调用和错误处理
 */

import { clearAuth, isLoginExpired } from './auth';
import { authEventBus } from './auth-event';
import { getLocale } from './get-locale';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

class ApiClient {
  private baseUrl = '';

  async fetch<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // 获取当前语言
      const locale = getLocale();

      const response = await fetch(url, {
        ...options,
        headers: {
          'language': locale, // 添加语言头
          ...options.headers,
        },
      });

      const data = await response.json();

      // 检查业务层面的登录失效 - 触发事件打开登录弹窗
      // 也检查 HTTP 401 状态码
      if (isLoginExpired(data) || isLoginExpired(response) || response.status === 401 || data?.code === 401) {
        console.error('[ApiClient] Login expired:', data.message || 'HTTP 401');
        // 清除认证信息
        clearAuth();
        // 清除其他相关的本地存储
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aiHubToken');
          localStorage.removeItem('aiHubToken_full');
          localStorage.removeItem('aiHubData');
          localStorage.removeItem('userInfo');
          
          // 触发登录失效事件，打开登录弹窗
          authEventBus.emit({
            type: 'login-expired',
            message: data.message || '登录已过期，请重新登录'
          });
        }
        throw new Error(data.message || '登录失效，请重新登录');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'GET',
    });
  }

  async post<T = any>(
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const locale = getLocale();
    return this.fetch<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'language': locale, // 添加语言头
        ...options?.headers,
      },
    });
  }

  async put<T = any>(
    url: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;