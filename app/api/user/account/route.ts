import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/models/db';
import { auth } from '@/auth/config';

export async function GET(req: NextRequest) {
  try {
    // 获取当前登录用户
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    console.log('[User Account] Fetching account info for:', userEmail);

    // 查询用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('uuid, email, nickname, avatar_url')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('[User Account] User not found:', userError);
      return NextResponse.json(
        { code: 404, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 查询用户积分余额
    const { data: creditsData, error: creditsError } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_uuid', userData.uuid)
      .single();

    if (creditsError) {
      console.error('[User Account] Credits query error:', creditsError);
    }

    const availablePoints = creditsData?.balance || 0;

    console.log('[User Account] Account info:', {
      uuid: userData.uuid,
      availablePoints
    });

    // 返回账户信息
    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        availablePoints,
        subscriptionStatus: 'inactive',
        subscriptionPlanCode: null,
        subscriptionPlanName: null,
        subscriptionEndTime: null,
      }
    });
  } catch (error: any) {
    console.error('[User Account] Error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: '获取账户信息失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
