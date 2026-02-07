/**
 * 前端统一请求方法
 * 自动添加 Authorization 等公共参数
 */

import { getToken, clearAuth } from './auth';
import { toast } from 'sonner';

interface RequestOptions extends RequestInit {
  // 是否需要认证（默认 false）
  requireAuth?: boolean;
}

/**
 * 统一的 fetch 封装
 */
async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = false, headers = {}, body, ...restOptions } = options;

  // 准备请求头
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // 只有在有 body 且不是 FormData 时才设置 Content-Type
  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // 如果需要认证，添加 Authorization header
  if (requireAuth) {
    const token = getToken();
    if (token) {
      requestHeaders['Authorization'] = token;
    }
  } else {
    // 即使不强制要求，也尝试添加 token（如果有的话）
    const token = getToken();
    if (token) {
      requestHeaders['Authorization'] = token;
    }
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      body,
    });

    // 尝试解析 JSON
    const data = await response.json();

    // 统一处理登录失效的情况
    const isLoginExpired =
      response.status === 401 ||
      data?.message?.includes('登录失效') ||
      data?.data?.message?.includes('登录失效');

    if (isLoginExpired) {
      // 清除认证信息
      clearAuth();

      // 显示提示
      if (typeof window !== 'undefined') {
        toast.error('登录已失效，请重新登录', {
          duration: 2000,
        });

        // 延迟跳转到首页，确保提示能显示
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }

      throw new Error('LOGIN_EXPIRED');
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * GET 请求
 */
export async function clientGet<T = any>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  return request<T>(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST 请求
 */
export async function clientPost<T = any>(
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>(url, {
    ...options,
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
export async function clientPut<T = any>(
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
export async function clientDelete<T = any>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  return request<T>(url, {
    ...options,
    method: 'DELETE',
  });
}
