import { NextRequest, NextResponse } from 'next/server';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // 使用 NextAuth 获取 session
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, size = 'auto', quality = '2K', image_urls } = body;

    log('[Evolink Generate] 收到请求:', {
      user: session.user.email,
      prompt,
      size,
      quality,
      hasImageUrls: !!image_urls
    });

    const requestBody: Record<string, any> = {
      model: 'nano-banana-2-lite',
      prompt,
      size,
      quality
    };

    if (image_urls && image_urls.length > 0) {
      requestBody.image_urls = image_urls;
    }

    log('[Evolink Generate] 调用 Evolink API:', requestBody);

    const response = await evolinkAxios.post('/v1/images/generations', requestBody);

    log('[Evolink Generate] 响应:', response.data);

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: response.data
    });
  } catch (error: any) {
    logError('[Evolink Generate] 错误:', error);
    const errorData = error.response?.data?.error || {};
    return NextResponse.json(
      {
        code: error.response?.status || 500,
        message: errorData.message || error.message || '生成失败',
        error: errorData
      },
      { status: error.response?.status || 500 }
    );
  }
}
