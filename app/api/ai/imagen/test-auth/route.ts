import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // 测试 NextAuth session
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({
        code: 401,
        message: '未登录',
        user: null
      });
    }

    // 测试 Google Cloud 认证
    const { GoogleAuth } = await import('google-auth-library');

    const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
    const GOOGLE_LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';
    const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;

    // 解析凭证
    let credentials;
    try {
      credentials = typeof GOOGLE_CREDENTIALS === 'string'
        ? JSON.parse(GOOGLE_CREDENTIALS)
        : GOOGLE_CREDENTIALS;
    } catch (error) {
      return NextResponse.json({
        code: 500,
        message: '无法解析 GOOGLE_CREDENTIALS',
        error: String(error)
      });
    }

    // 修复私钥
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    // 创建 GoogleAuth
    const googleAuth = new GoogleAuth({
      credentials: credentials,
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    // 获取 access token
    const client = await googleAuth.getClient();
    const accessToken = await client.getAccessToken();

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        user: session.user,
        google: {
          projectId: GOOGLE_PROJECT_ID,
          location: GOOGLE_LOCATION,
          hasCredentials: !!GOOGLE_CREDENTIALS,
          accessTokenPrefix: accessToken.token ? accessToken.token.substring(0, 30) + '...' : 'N/A',
          credentialsType: credentials.type,
          clientEmail: credentials.client_email
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      code: 500,
      message: '测试失败',
      error: error.message,
      stack: error.stack
    });
  }
}
