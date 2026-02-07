import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 基本健康检查
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    // 检查数据库连接（如果需要）
    // TODO: 添加实际的数据库连接检查
    
    // 检查必要的环境变量
    const requiredEnvVars = [
      'AUTH_SECRET',
    ];
    
    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          ...health,
          status: 'degraded',
          warnings: {
            missingEnvVars: missingEnvVars,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

// 支持 HEAD 请求用于简单的存活检查
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}