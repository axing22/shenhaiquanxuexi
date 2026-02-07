import { NextRequest, NextResponse } from 'next/server';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // 使用 NextAuth 获取 session
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    log('[Evolink Task] 查询任务状态:', {
      user: session.user.email,
      taskId
    });

    const response = await evolinkAxios.get(`/v1/tasks/${taskId}`);

    log('[Evolink Task] 任务状态响应:', response.data);

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: response.data
    });
  } catch (error: any) {
    logError('[Evolink Task] 查询失败:', error);
    const errorData = error.response?.data?.error || {};
    return NextResponse.json(
      {
        code: error.response?.status || 500,
        message: errorData.message || error.message || '查询失败',
        error: errorData
      },
      { status: error.response?.status || 500 }
    );
  }
}
