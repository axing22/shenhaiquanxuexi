/**
 * Google Cloud 环境变量清理工具
 *
 * Vercel 环境变量会将换行符转换为字面量 \n 字符
 * 这个函数用于清理和修复这些环境变量
 */

/**
 * 清理并解析 GOOGLE_CREDENTIALS 环境变量
 *
 * @param credentialsRaw - 原始的 GOOGLE_CREDENTIALS 环境变量值
 * @returns 解析后的 Google Cloud credentials 对象
 * @throws 如果解析失败会抛出错误
 */
export function parseGoogleCredentials(credentialsRaw: string | undefined): any {
  if (!credentialsRaw) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
  }

  try {
    // 1. 移除首尾空白字符（包括 Vercel 添加的末尾 \n）
    const trimmed = credentialsRaw.trim();

    // 2. 将字面量 \n 转换为真正的换行符
    // 这是因为 Vercel 环境变量会将 JSON 中的换行符保存为字面量 \n
    const cleaned = trimmed.replace(/\\n/g, '\n');

    // 3. 解析 JSON
    const credentials = JSON.parse(cleaned);

    // 4. 再次检查 private_key 中是否还有字面量 \n（双重转义的情况）
    if (credentials.private_key && typeof credentials.private_key === 'string') {
      if (credentials.private_key.includes('\\n')) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
    }

    return credentials;
  } catch (error: any) {
    throw new Error(`Failed to parse GOOGLE_CREDENTIALS: ${error.message}`);
  }
}

/**
 * 创建用于 Google Cloud 认证的 axios 实例
 * 这个函数会自动处理环境变量的清理和 OAuth2 令牌获取
 *
 * @param baseURL - Google Cloud API 的 base URL
 * @returns 配置好的 axios 实例
 */
export async function createGoogleAuthAxios(baseURL: string) {
  const axios = (await import('axios')).default;
  const { GoogleAuth } = await import('google-auth-library');

  const instance = axios.create({
    baseURL,
    timeout: 300000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器 - 自动添加 OAuth2 令牌
  instance.interceptors.request.use(async (config: any) => {
    const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;

    // 使用工具函数解析 credentials
    const credentials = parseGoogleCredentials(GOOGLE_CREDENTIALS);

    // 创建 GoogleAuth 客户端
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // accessToken 可能是对象或字符串
    const token = typeof accessToken === 'string' ? accessToken : accessToken.token;

    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  });

  return instance;
}
