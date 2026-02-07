/**
 * 日志工具函数，自动处理长字符串的截断
 */

interface LogOptions {
  maxLength?: number;
  showEllipsis?: boolean;
}

/**
 * 截断长字符串
 */
function truncateString(str: string, maxLength: number = 200): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * 深度截断对象中的长字符串
 */
function truncateDeep(obj: any, maxLength: number = 200, visited = new WeakSet()): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return truncateString(obj, maxLength);
  }
  
  // 防止循环引用
  if (typeof obj === 'object') {
    if (visited.has(obj)) {
      return '[Circular]';
    }
    visited.add(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => truncateDeep(item, maxLength, visited));
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = truncateDeep(obj[key], maxLength, visited);
      }
    }
    return result;
  }
  
  return obj;
}

/**
 * 带截断功能的日志函数
 */
export function log(message: string, data?: any, options: LogOptions = {}) {
  if (process.env.NODE_ENV === 'production') return;

  const { maxLength = 200 } = options;

  if (data === undefined) {
    console.log(message);
    return;
  }

  const truncatedData = truncateDeep(data, maxLength);
  console.log(message, truncatedData);
}

/**
 * 带截断功能的错误日志函数
 */
export function logError(message: string, error?: any, options: LogOptions = {}) {
  const { maxLength = 200 } = options;
  
  if (error === undefined) {
    console.error(message);
    return;
  }
  
  const truncatedError = truncateDeep(error, maxLength);
  console.error(message, truncatedError);
}

/**
 * 带截断功能的警告日志函数
 */
export function logWarn(message: string, data?: any, options: LogOptions = {}) {
  const { maxLength = 200 } = options;
  
  if (data === undefined) {
    console.warn(message);
    return;
  }
  
  const truncatedData = truncateDeep(data, maxLength);
  console.warn(message, truncatedData);
}