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
    // 1. 移除首尾空白字符
    let cleaned = credentialsRaw.trim();

    // 2. Vercel 环境变量的问题：
    //    - 每个值末尾都添加了字面量 "\n"（从 .env.production 可以看到）
    //    - 例如：AUTH_GOOGLE_ID="xxx\n"
    //    - 对于 JSON 值，这会破坏 JSON 结构
    // 解决方案：检查并移除末尾的字面量 \n
    if (cleaned.endsWith('\\n')) {
      cleaned = cleaned.slice(0, -2);
    }

    // 3. 现在 cleaned 应该是干净的 JSON 字符串
    const credentials = JSON.parse(cleaned);

    // 4. 处理私钥中的字面量 \n，转换为真正的换行符
    if (credentials.private_key && typeof credentials.private_key === 'string') {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
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
