/**
 * 服务端认证工具
 * 用于在服务端组件中获取 AI Hub token
 */

const AUTH_COOKIE_NAME = 'aiHubToken';

/**
 * 客户端调用：将 token 存储到 cookie
 */
export function setServerToken(token: string) {
  if (typeof document === 'undefined') return;
  
  // 设置 cookie，7 天过期
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const cookieValue = `${AUTH_COOKIE_NAME}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  document.cookie = cookieValue;
  
  console.log('[setServerToken] Cookie set:', cookieValue.substring(0, 50) + '...');
  
  // 验证 cookie 是否设置成功
  const allCookies = document.cookie;
  console.log('[setServerToken] All cookies:', allCookies);
}

/**
 * 客户端调用：清除 token cookie
 */
export function clearServerToken() {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * 服务端：从 cookie 获取 token
 * 只能在服务端组件中使用
 */
export async function getServerToken(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  // 获取所有 cookies 用于调试
  const allCookies = cookieStore.getAll();
  console.log('[getServerToken] All cookies:', allCookies.map(c => c.name));
  
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  console.log('[getServerToken] Token cookie:', token ? 'exists' : 'none');
  
  return token?.value || null;
}

/**
 * 服务端：从 cookie token 获取用户信息（用于 SSR）
 * 只能在服务端组件中使用
 */
export async function getUserInfoFromServerToken(): Promise<any | null> {
  try {
    const token = await getServerToken();
    if (!token) {
      console.log('[getUserInfoFromServerToken] No token found');
      return null;
    }

    console.log('[getUserInfoFromServerToken] Fetching user info from token...');
    
    // 使用 internal API 调用获取用户信息
    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/user/info`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      // 不传 cookie，直接用 Authorization header
    });

    if (!response.ok) {
      console.warn('[getUserInfoFromServerToken] API returned:', response.status);
      return null;
    }

    const result = await response.json();
    
    if (result.code === 1000 && result.data) {
      console.log('[getUserInfoFromServerToken] User info fetched successfully');
      return result.data;
    }

    return null;
  } catch (e) {
    console.error('[getUserInfoFromServerToken] Error:', e);
    return null;
  }
}

