/**
 * AI Hub 认证管理
 * 使用 AI Hub 的 token 进行统一认证
 */

interface AuthData {
  token: string;
  refreshToken: string;
  expire: number;
  refreshExpire: number;
  loginTime: number;
}

const AUTH_KEY = 'aiHubToken';

/**
 * 保存认证信息
 */
export function saveAuth(data: {
  token: string;
  refreshToken: string;
  expire: number;
  refreshExpire: number;
}) {
  if (typeof window === 'undefined') return;
  
  // 直接存储 token 字符串
  localStorage.setItem(AUTH_KEY, data.token);
  
  // 存储完整的认证数据到另一个 key（如果需要）
  const authData: AuthData = {
    ...data,
    loginTime: Date.now()
  };
  localStorage.setItem(`${AUTH_KEY}_full`, JSON.stringify(authData));
}

/**
 * 获取认证信息
 */
export function getAuth(): AuthData | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // 获取 token（现在是字符串）
    const token = localStorage.getItem(AUTH_KEY);
    
    // 获取完整的认证数据
    const fullDataStr = localStorage.getItem(`${AUTH_KEY}_full`);
    
    if (!token || !fullDataStr) {
      return null;
    }
    
    const authData = JSON.parse(fullDataStr) as AuthData;
    return authData;
  } catch (error) {
    console.error('Failed to get auth data:', error);
    return null;
  }
}

/**
 * 获取当前 token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // 直接从 localStorage 获取 token 字符串
  const token = localStorage.getItem(AUTH_KEY);
  return token;
}

/**
 * 获取 refresh token
 */
export function getRefreshToken(): string | null {
  const auth = getAuth();
  return auth?.refreshToken || null;
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * 清除认证信息（退出登录）
 */
export function clearAuth() {
  if (typeof window === 'undefined') return;
  
  console.log('[clearAuth] Clearing authentication...');
  
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(`${AUTH_KEY}_full`);
  localStorage.removeItem('userInfo');
  localStorage.removeItem('aiHubData');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userAccount');  // 清除用户账户信息
  // 兼容清理历史遗留的 appContextUser
  localStorage.removeItem('appContextUser');
  
  // 清除 cookie
  document.cookie = 'aiHubToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  console.log('[clearAuth] Authentication cleared');
  
  // 触发自定义事件，通知其他组件用户已退出
  window.dispatchEvent(new Event('logout'));
  
  // 跳转到首页
  window.location.href = '/';
}

/**
 * 获取 Authorization header
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getToken();
  if (!token) return {};
  
  // AI Hub 不需要 Bearer 前缀
  return {
    Authorization: token
  };
}

/**
 * 检查响应是否表示登录失效
 */
export function isLoginExpired(response: any): boolean {
  // Check if response has 401 status
  if (response?.status === 401) {
    return true;
  }
  
  // Check if code is 401
  if (response?.code === 401) {
    return true;
  }
  
  // Check if message contains login-related keywords
  if (response?.message) {
    const msg = response.message.toLowerCase();
    const loginFailedKeywords = ['登录失效', '未登录', 'not logged in', 'unauthorized', 'token expired', 'token invalid'];
    if (loginFailedKeywords.some(keyword => msg.includes(keyword))) {
      return true;
    }
  }
  
  // Also check data.message for nested responses
  if (response?.data?.message) {
    const msg = response.data.message.toLowerCase();
    const loginFailedKeywords = ['登录失效', '未登录', 'not logged in', 'unauthorized', 'token expired', 'token invalid'];
    if (loginFailedKeywords.some(keyword => msg.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

/**
 * 刷新 token
 */
export async function refreshToken(): Promise<boolean> {
  const auth = getAuth();
  if (!auth?.refreshToken) return false;
  
  try {
    const response = await fetch('/api/user/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: auth.refreshToken
      })
    });
    
    if (!response.ok) return false;
    
    const result = await response.json();
    
    // 检查登录失效
    if (isLoginExpired(result) || isLoginExpired(response)) {
      console.log('[Auth] Login expired:', result.message);
      // 清除本地存储
      clearAuth();
      // 跳转到首页
      window.location.href = '/';
      return false;
    }
    
    if (result.code === 1000 && result.data) {
      saveAuth(result.data);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

/**
 * 统一退出登录流程：
 * 1) 调用后端 logoff 接口使 token 失效
 * 2) 清理服务端/客户端 cookie 与本地存储
 * 3) 最终跳转到首页
 */
export async function logout(): Promise<void> {
  try {
    const token = getToken();
    if (typeof window !== 'undefined' && token) {
      try {
        await fetch('/api/user/logoff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        });
      } catch (e) {
        console.error('[logout] Call /api/user/logoff failed:', e);
      }
    }

    // 清理服务器端 cookie（服务端读取的 aiHubToken）
    try {
      if (typeof window !== 'undefined') {
        const { clearServerToken } = await import('./server-auth');
        clearServerToken();
      }
    } catch (e) {
      console.warn('[logout] clearServerToken failed:', e);
    }

  } finally {
    // 最后统一清理并跳转
    clearAuth();
  }
}

/**
 * 生成用户头像首字母
 * 优先使用 nickname 或 name，取首个字符大写
 */
export function getUserAvatarInitials(nickname?: string | null, name?: string | null): string {
  const displayName = nickname || name || 'U';
  return displayName.charAt(0).toUpperCase();
}