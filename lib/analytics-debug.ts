/**
 * GA4 调试工具
 * 在浏览器控制台中运行以检查 GA4 状态
 * 使用方法：在浏览器控制台输入 window.debugGA4()
 */

export function debugGA4() {
  if (typeof window === 'undefined') {
    console.error('❌ Window is undefined. Run this in the browser console.');
    return;
  }

  console.log('\n=== 🔍 GA4 Debug Info ===\n');

  // 1. 检查环境变量
  console.log('📋 Configuration:');
  const gaId = (window as any).__NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'Check .env file';
  console.log('  Measurement ID:', gaId);
  console.log('  Expected format: G-XXXXXXXXXX');
  console.log('');

  // 2. 检查 gtag 函数
  console.log('🔧 GA4 Components:');
  const hasGtag = typeof window.gtag === 'function';
  console.log('  window.gtag:', hasGtag ? '✅ Loaded' : '❌ Not found');

  // 3. 检查 dataLayer
  const hasDataLayer = Array.isArray((window as any).dataLayer);
  console.log('  window.dataLayer:', hasDataLayer ? '✅ Loaded' : '❌ Not found');
  console.log('');

  // 4. 检查脚本加载
  console.log('📜 Scripts:');
  const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  const scriptSrc = gaScript ? gaScript.getAttribute('src') : null;
  console.log('  GA4 Script:', gaScript ? '✅ Loaded' : '❌ Not loaded');
  if (scriptSrc) {
    console.log('  Script URL:', scriptSrc);
  }
  console.log('');

  // 5. 显示 dataLayer 内容
  if (hasDataLayer) {
    const dataLayer = (window as any).dataLayer;
    console.log('📊 DataLayer Status:');
    console.log('  Total items:', dataLayer.length);
    console.log('  Recent events (last 5):');
    const recentEvents = dataLayer.slice(-5);
    recentEvents.forEach((item: any, index: number) => {
      if (item && typeof item === 'object') {
        console.log(`    ${index + 1}.`, item);
      }
    });
    console.log('');
  }

  // 6. 诊断结果
  console.log('🎯 Diagnostic Results:');
  if (hasGtag && hasDataLayer && gaScript) {
    console.log('  ✅ GA4 is properly configured and ready to track events');
    console.log('  ✅ You can now send events using trackEvent() functions');
  } else {
    console.log('  ⚠️ GA4 setup incomplete:');
    if (!hasGtag) console.log('    - gtag function not found (script may not be loaded yet)');
    if (!hasDataLayer) console.log('    - dataLayer not initialized');
    if (!gaScript) console.log('    - GA4 script not loaded in DOM');
  }
  console.log('');

  // 7. 测试发送事件
  console.log('🧪 Sending test event...');
  if (hasGtag) {
    try {
      window.gtag('event', 'debug_test', {
        test_param: 'debug_value',
        timestamp: new Date().toISOString(),
        source: 'debugGA4'
      });
      console.log('  ✅ Test event "debug_test" sent successfully via gtag');
      console.log('  📊 Check GA4 DebugView to see if it appears within 10 seconds');
    } catch (error) {
      console.error('  ❌ Failed to send test event:', error);
    }
  } else {
    console.log('  ❌ Cannot send test event - gtag not available');
    console.log('  💡 Wait a few seconds for GA4 to load, then run debugGA4() again');
  }

  console.log('\n===================\n');

  // 返回状态对象供程序使用
  return {
    configured: hasGtag && hasDataLayer && !!gaScript,
    gtag: hasGtag,
    dataLayer: hasDataLayer,
    script: !!gaScript,
    measurementId: gaId
  };
}
