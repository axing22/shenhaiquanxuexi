/**
 * 认证事件管理
 * 用于在拦截器中触发登录失效事件，打开登录弹窗
 */

type AuthEventListener = (event: AuthEvent) => void;

export interface AuthEvent {
  type: 'login-expired' | 'unauthorized';
  message?: string;
}

class AuthEventBus {
  private listeners: Set<AuthEventListener> = new Set();

  subscribe(listener: AuthEventListener): () => void {
    this.listeners.add(listener);
    console.log('[AuthEventBus] Listener registered, total:', this.listeners.size);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
      console.log('[AuthEventBus] Listener unregistered, total:', this.listeners.size);
    };
  }

  emit(event: AuthEvent): void {
    console.log('[AuthEventBus] Emitting event:', event.type, 'Listeners:', this.listeners.size);
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[AuthEventBus] Error in listener:', error);
      }
    });
  }

  clearListeners(): void {
    this.listeners.clear();
    console.log('[AuthEventBus] All listeners cleared');
  }
}

// 导出单例
export const authEventBus = new AuthEventBus();
