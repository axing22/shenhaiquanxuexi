"use client";

import { Button } from "@/components/ui/button";
import {
  trackTryItNowClick,
  trackPriceMenuClick,
  trackLoginButtonClick,
  trackLoginSuccess,
  trackSubscribeButtonClick,
  trackPaymentStart,
  trackPaymentSuccess
} from "@/lib/analytics";

export default function TestGA4Page() {

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">🔍 GA4 事件测试页面</h1>

      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm">
          ✅ 使用 <strong>GA4 (gtag.js)</strong> 进行事件追踪
        </p>
        <p className="text-sm mt-1">
          📊 Measurement ID: <code className="bg-green-100 px-2 py-1 rounded">G-V1YWFE9NDG</code>
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">🛠️ 调试工具</h2>
          <p className="text-sm text-gray-600 mb-4">
            打开浏览器控制台（F12）查看详细的事件追踪日志
          </p>
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                (window as any).debugGA4?.();
              }
            }}
            variant="outline"
          >
            运行 debugGA4() 检查状态
          </Button>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🎯 测试事件</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => trackTryItNowClick('hero')}>
              Try It Now
            </Button>

            <Button onClick={() => trackPriceMenuClick()}>
              Price Menu
            </Button>

            <Button onClick={() => trackLoginButtonClick('header')}>
              Login Button
            </Button>

            <Button onClick={() => trackLoginSuccess('email', 'test_user')}>
              Login Success
            </Button>

            <Button onClick={() => trackSubscribeButtonClick('基础会员', 69, 'month', 'test')}>
              Subscribe
            </Button>

            <Button onClick={() => trackPaymentStart('ORDER123', '基础会员', 6900, 'wechat')}>
              Payment Start
            </Button>

            <Button onClick={() => trackPaymentSuccess('ORDER123', 6900, '基础会员', 'month', 'wechat')}>
              Payment Success
            </Button>
          </div>
        </div>

        <div className="border p-4 rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">📖 使用说明</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>打开浏览器控制台（F12）</li>
            <li>点击上方按钮测试事件</li>
            <li>在 GA4 后台查看：<a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">analytics.google.com</a></li>
            <li>报告 → 实时 → 按事件名称查看</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
