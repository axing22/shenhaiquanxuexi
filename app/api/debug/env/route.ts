import { NextResponse } from 'next/server';

export async function GET() {
  // 安全地检查环境变量（不暴露完整值）
  const envStatus = {
    authGoogleId: process.env.AUTH_GOOGLE_ID ? {
      set: true,
      prefix: process.env.AUTH_GOOGLE_ID.substring(0, 20) + '...'
    } : { set: false },
    authGoogleSecret: process.env.AUTH_GOOGLE_SECRET ? {
      set: true,
      length: process.env.AUTH_GOOGLE_SECRET.length
    } : { set: false },
    authSecret: process.env.AUTH_SECRET ? {
      set: true,
      length: process.env.AUTH_SECRET.length
    } : { set: false },
    googleProjectId: process.env.GOOGLE_PROJECT_ID || null,
    googleLocation: process.env.GOOGLE_LOCATION || null,
    googleCredentials: process.env.GOOGLE_CREDENTIALS ? {
      set: true,
      length: process.env.GOOGLE_CREDENTIALS.length
    } : { set: false },
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json({
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    envStatus
  });
}
