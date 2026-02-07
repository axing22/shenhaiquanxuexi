"use client";

import { useEffect } from "react";
import { debugGA4 } from "@/lib/analytics-debug";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics() {
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  useEffect(() => {
    // Attach debugGA4 to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).debugGA4 = debugGA4;
    }

    if (!analyticsId) {
      console.warn('[GA4] No measurement ID found');
      return;
    }

    if (!analyticsId.startsWith('G-')) {
      console.error('[GA4] Invalid measurement ID format');
      return;
    }

    // 初始化 dataLayer 和 gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // 配置 GA4
    window.gtag("js", new Date());
    window.gtag("config", analyticsId, {
      send_page_view: true,
      debug_mode: process.env.NODE_ENV === 'development',
      cookie_flags: 'SameSite=None;Secure'
    });

    // 加载 GA4 脚本
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    script.async = true;
    script.onerror = () => {
      console.error('[GA4] Failed to load script');
    };
    document.head.appendChild(script);

  }, [analyticsId]);

  return null;
}
