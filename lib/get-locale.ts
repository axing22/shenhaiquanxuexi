/**
 * 获取当前语言环境
 * 用于在非组件环境中获取 locale
 */

/**
 * 从客户端获取当前 locale
 * 优先级: URL路径 > Cookie > localStorage > 默认值
 */
export function getLocale(): string {
  if (typeof window === 'undefined') {
    return 'en'; // 服务端默认返回英文
  }

  try {
    // 1. 从 URL 路径中提取 locale (如 /zh/xxx 或 /en/xxx)
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    if (localeMatch && (localeMatch[1] === 'zh' || localeMatch[1] === 'en')) {
      return localeMatch[1];
    }

    // 2. 从 Cookie 中读取 (next-intl 默认使用 NEXT_LOCALE)
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'NEXT_LOCALE') {
        const locale = decodeURIComponent(value);
        if (locale === 'zh' || locale === 'en') {
          return locale;
        }
      }
    }

    // 3. 从 localStorage 读取
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale && (storedLocale === 'zh' || storedLocale === 'en')) {
      return storedLocale;
    }

    // 4. 从浏览器语言判断
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
      return 'zh';
    }

    // 5. 默认英文
    return 'en';
  } catch (error) {
    console.error('[getLocale] Error getting locale:', error);
    return 'en';
  }
}

/**
 * 设置当前 locale 到 localStorage
 */
export function setLocale(locale: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (locale === 'zh' || locale === 'en') {
    localStorage.setItem('locale', locale);
  }
}
