import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
    const GOOGLE_LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';
    const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;

    // 解析凭证
    let credentials = typeof GOOGLE_CREDENTIALS === 'string'
      ? JSON.parse(GOOGLE_CREDENTIALS)
      : GOOGLE_CREDENTIALS;

    // 修复私钥
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    const { GoogleAuth } = await import('google-auth-library');
    const authClient = new GoogleAuth({
      credentials: credentials,
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    const accessToken = await authClient.getAccessToken();

    // 提取 token 字符串
    let token: string;
    if (typeof accessToken === 'string') {
      token = accessToken;
    } else if (accessToken && typeof accessToken === 'object' && 'token' in accessToken) {
      token = (accessToken as { token: string }).token;
    } else {
      return NextResponse.json(
        { code: 500, message: 'Failed to get access token' },
        { status: 500 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { code: 500, message: 'Failed to get access token' },
        { status: 500 }
      );
    }

    // 测试列出可用模型
    const listModelsUrl = `https://${GOOGLE_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${GOOGLE_LOCATION}/publishers/google/models`;

    const response = await axios.get(listModelsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        project: GOOGLE_PROJECT_ID,
        location: GOOGLE_LOCATION,
        models: response.data
      }
    });
  } catch (error: any) {
    console.error('[Imagen Test] 错误:', error);
    return NextResponse.json(
      {
        code: 500,
        message: error.message || '测试失败',
        error: error.response?.data || error.toString()
      },
      { status: 500 }
    );
  }
}
