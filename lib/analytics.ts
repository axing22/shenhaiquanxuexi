/**
 * Google Analytics 4 事件追踪工具函数
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * 发送 GA4 事件
 * @param eventName 事件名称
 * @param eventParams 事件参数
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // 检查 gtag 是否已加载
  if (!window.gtag) {
    // 如果 gtag 还没加载，将事件推送到 dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams,
      });
    }
    return;
  }

  // 使用 gtag 发送事件
  try {
    window.gtag('event', eventName, eventParams);
  } catch (error) {
    console.error('[GA4] Failed to send event:', eventName, error);
  }
}

/**
 * 1. 首页 Try It Now 按钮点击
 */
export function trackTryItNowClick(location: string = 'hero') {
  trackEvent('try_it_now_click', {
    button_location: location,
    page_path: window.location.pathname,
  });
}

/**
 * 2. 顶部菜单 Price 点击
 */
export function trackPriceMenuClick() {
  trackEvent('price_menu_click', {
    menu_item: 'pricing',
    page_path: window.location.pathname,
  });
}

/**
 * 3. 顶部菜单登录按钮点击
 */
export function trackLoginButtonClick(location: string = 'header') {
  trackEvent('login_button_click', {
    button_location: location,
    page_path: window.location.pathname,
  });
}

/**
 * 4. 登录成功回调事件
 * 衡量标准：
 * - 在登录成功后立即触发
 * - 记录登录方式（Google, Email, etc.）
 * - 记录用户 ID（匿名化）
 */
export function trackLoginSuccess(method: 'google' | 'email' | 'wechat' | 'phone', userId?: string) {
  trackEvent('login_success', {
    login_method: method,
    user_id: userId ? hashUserId(userId) : undefined, // 使用哈希后的 user_id
    timestamp: new Date().toISOString(),
  });
}

/**
 * 5. 订阅按钮点击
 * @param planName 套餐名称
 * @param planPrice 套餐价格
 * @param planType 套餐类型 (month/year)
 */
export function trackSubscribeButtonClick(
  planName: string,
  planPrice: number,
  planType: 'month' | 'year',
  location: string = 'pricing_page'
) {
  trackEvent('subscribe_button_click', {
    plan_name: planName,
    plan_price: planPrice,
    plan_type: planType,
    button_location: location,
    currency: 'CNY',
    page_path: window.location.pathname,
  });
}

/**
 * 6. 支付成功回调事件
 * 衡量标准：
 * - 在支付成功后触发（通过支付回调接口确认）
 * - 记录订单号、金额、套餐信息
 * - 发送 GA4 电商事件 'purchase'
 *
 * 实现方式：
 * 1. 轮询订单状态，当订单状态变为 'paid' 时触发
 * 2. 或在支付成功页面检测 URL 参数（如 ?payment_success=true）
 */
export function trackPaymentSuccess(
  orderNo: string,
  transactionValue: number,
  planName: string,
  planType: 'month' | 'year',
  paymentMethod: 'wechat' | 'alipay' | 'stripe'
) {
  // 发送标准的 purchase 事件（GA4 电商事件）
  trackEvent('purchase', {
    transaction_id: orderNo,
    value: transactionValue / 100, // 转换为元
    currency: 'CNY',
    items: [
      {
        item_id: planName,
        item_name: planName,
        item_category: 'subscription',
        price: transactionValue / 100,
        quantity: 1,
      },
    ],
    payment_method: paymentMethod,
    plan_type: planType,
  });

  // 同时发送自定义的支付成功事件
  trackEvent('payment_success', {
    order_no: orderNo,
    amount: transactionValue,
    plan_name: planName,
    plan_type: planType,
    payment_method: paymentMethod,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 支付开始（用户点击支付按钮并打开支付界面）
 */
export function trackPaymentStart(
  orderNo: string,
  planName: string,
  amount: number,
  paymentMethod: 'wechat' | 'alipay' | 'stripe'
) {
  trackEvent('begin_checkout', {
    order_no: orderNo,
    plan_name: planName,
    value: amount / 100,
    currency: 'CNY',
    payment_method: paymentMethod,
  });
}

/**
 * 简单的用户 ID 哈希函数（用于隐私保护）
 */
function hashUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `user_${Math.abs(hash)}`;
}
