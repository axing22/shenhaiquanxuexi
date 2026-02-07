'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // 获取后端返回的token
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token) {
      // 保存token到localStorage
      localStorage.setItem('aiHubToken', token);

      // 保存完整的token信息
      localStorage.setItem('aiHubToken_full', JSON.stringify({
        token: token,
        refreshToken: refreshToken || '',
        expire: 7200,
        refreshExpire: 604800,
        loginTime: Date.now()
      }));

      // 获取登录前的页面，如果有则跳转回去，否则跳转到studio
      const redirectUrl = sessionStorage.getItem('loginRedirectUrl') || '/';
      sessionStorage.removeItem('loginRedirectUrl'); // 清除重定向URL

      console.log('[GoogleAuthSuccess] 登录成功，准备跳转到:', redirectUrl);

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    } else {
      // 如果没有token，返回登录页
      router.push('/auth/signin?error=google_auth_failed');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">正在登录中...</p>
        <p className="text-sm text-muted-foreground mt-2">即将跳转到控制台</p>
      </div>
    </div>
  );
}