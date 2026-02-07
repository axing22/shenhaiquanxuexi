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

    // 获取查询参数
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    console.log('[Points Transactions] Fetching transactions for:', userEmail, { page, pageSize });

    // 查询用户信息获取 uuid
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('uuid')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('[Points Transactions] User not found:', userError);
      return NextResponse.json(
        { code: 404, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 计算分页偏移量
    const offset = (page - 1) * pageSize;

    // 查询积分交易记录总数
    const { count, error: countError } = await supabase
      .from('credit_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_uuid', userData.uuid);

    if (countError) {
      console.error('[Points Transactions] Count error:', countError);
    }

    const total = count || 0;

    // 查询积分交易记录（分页）
    const { data: transactions, error: transactionsError } = await supabase
      .from('credit_history')
      .select('id, user_uuid, amount, type, description, created_at')
      .eq('user_uuid', userData.uuid)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (transactionsError) {
      console.error('[Points Transactions] Query error:', transactionsError);
      return NextResponse.json(
        { code: 500, message: '查询积分记录失败' },
        { status: 500 }
      );
    }

    // 查询当前积分余额
    const { data: creditsData } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_uuid', userData.uuid)
      .single();

    const currentBalance = creditsData?.balance || 0;

    // 转换数据格式以匹配前端期望的格式
    const formattedTransactions = (transactions || []).map((item, index) => {
      // 计算当时的余额（从当前余额倒推）
      let balanceAtTime = currentBalance;
      for (let i = 0; i < index; i++) {
        balanceAtTime -= (transactions[i].amount || 0);
      }

      return {
        id: item.id,
        userId: userData.uuid,
        pointsChange: item.amount,
        pointsBalance: balanceAtTime,
        businessType: item.type || 'unknown',
        businessNo: `TXN-${item.id}`,
        createTime: item.created_at,
        updateTime: item.created_at,
      };
    });

    console.log('[Points Transactions] Found', formattedTransactions.length, 'transactions');

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        list: formattedTransactions,
        pagination: {
          page,
          size: pageSize,
          total,
        }
      }
    });
  } catch (error: any) {
    console.error('[Points Transactions] Error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: '获取积分记录失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
