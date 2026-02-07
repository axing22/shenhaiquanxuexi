import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // 跳过验证文件，直接返回
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/baidu_verify') || pathname.startsWith('/yandex_')) {
    return NextResponse.next();
  }

  // 检测并拒绝异常URL
  const invalidPatterns = [
    /\/\$$/,           // 以$结尾
    /\/&$/,            // 以&结尾
    /\/月$/,           // 以"月"结尾
    /\/month$/,        // 以"month"结尾
    /\/year$/,         // 以"year"结尾
    /\/cdn-cgi\//,     // Cloudflare内部路径
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(pathname)) {
      // 返回410 Gone状态码，告诉搜索引擎这些页面永久不存在
      return new NextResponse(null, {
        status: 410,
        statusText: 'Gone',
        headers: {
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }
  }

  const response = intlMiddleware(request);

  // 添加性能优化相关的头部
  const headers = new Headers(response.headers);

  // DNS 预连接优化
  headers.set(
    "Link",
    [
      "<https://www.googletagmanager.com>; rel=preconnect",
      "<https://hm.baidu.com>; rel=preconnect",
      "<https://accounts.google.com>; rel=preconnect",
    ].join(", ")
  );

  // 添加安全头部
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 返回修改后的响应
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  matcher: [
    "/",
    "/(en|en-US|zh|zh-CN|zh-TW|zh-HK|zh-MO|ja|ko|ru|fr|de|ar|es|it)/:path*",
    "/((?!privacy-policy|terms-of-service|api|_next|_vercel|baidu_verify|yandex_|.*\\..*).*)",
  ],
};
