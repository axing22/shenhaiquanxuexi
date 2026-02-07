/**
 * 腾讯云 COS 上传服务
 * 基于官方文档：https://cloud.tencent.com/document/product/436/109014
 * 
 * 主要功能：
 * 1. 获取临时密钥（STS）
 * 2. 初始化 COS 客户端
 * 3. 文件上传（支持进度回调）
 * 4. 重试机制
 * 5. 批量上传
 */

import axiosInstance from './axios-config';

// COS 临时凭证接口
interface COSCredentials {
  tmpSecretId: string;     // 临时访问密钥 ID
  tmpSecretKey: string;    // 临时访问密钥 Key
  sessionToken: string;    // 安全令牌
  startTime: number;       // 凭证生效时间（秒）
  expiredTime: number;     // 凭证过期时间（秒）
  expiration: string;      // 凭证过期时间（ISO 格式）
  bucket: string;          // 存储桶名称
  region: string;          // 地域
  requestId: string;       // 请求 ID
  success: boolean;        // 请求是否成功
}

// API 响应接口
interface CredentialsResponse {
  code: number;
  message: string;
  data: COSCredentials;
}

// 上传类型定义
type UploadType =
  | 'avatar-training/image'              // 形象训练 - 用户上传图片
  | 'avatar-training/video'              // 形象训练 - 用户上传视频
  | 'avatar-training/generate/image'     // 形象训练 - AI生成图片
  | 'avatar-training/generate/video'     // 形象训练 - AI生成视频
  | 'voice-clone'                        // 声音克隆
  | 'video-generation/audio';            // 视频生成 - 音频驱动

// 上传选项接口
interface UploadOptions {
  onProgress?: (progress: number) => void;  // 进度回调
  onError?: (error: Error) => void;         // 错误回调
}

class COSUploadService {
  private cos: any | null = null;
  private credentials: COSCredentials | null = null;
  private credentialsExpiry: number = 0;
  private credentialsPromise: Promise<COSCredentials> | null = null;

  constructor() {
    // 初始化时不创建 COS 实例，等待获取临时密钥
  }

  /**
   * 获取 COS 临时密钥
   * 参考：https://cloud.tencent.com/document/product/436/109014
   * 
   * 临时密钥包含：
   * - TmpSecretId: 临时访问密钥 ID
   * - TmpSecretKey: 临时访问密钥 Key  
   * - SecurityToken: 安全令牌
   * - StartTime: 凭证生效时间
   * - ExpiredTime: 凭证过期时间
   */
  private async getCredentials(): Promise<COSCredentials> {
    const now = Math.floor(Date.now() / 1000);

    // 检查缓存的凭证是否还有效（提前5分钟刷新）
    if (this.credentials && this.credentialsExpiry > now + 300) {
      return this.credentials;
    }

    // 如果已经有一个正在进行的请求，等待它完成
    if (this.credentialsPromise) {
      return this.credentialsPromise;
    }

    // 创建新的请求
    this.credentialsPromise = this.fetchCredentials();
    
    try {
      const credentials = await this.credentialsPromise;
      return credentials;
    } finally {
      // 请求完成后清除 promise
      this.credentialsPromise = null;
    }
  }

  private async fetchCredentials(): Promise<COSCredentials> {
    const now = Math.floor(Date.now() / 1000);
    
    try {
      // 从环境变量获取配置
      const bucket = process.env.NEXT_PUBLIC_COS_BUCKET;
      const region = process.env.NEXT_PUBLIC_COS_REGION;
      
      // 调用后端 API 获取临时密钥
      const response = await axiosInstance.post('/api/sts/get-credential', {
        bucket,
        region,
        actionType: 'default'
      });
      
      const result = response.data;
      
      if (result.code !== 0 || !result.data) {
        throw new Error(result.message || '获取临时密钥失败');
      }

      // 缓存凭证 - 转换字段名以匹配接口
      this.credentials = {
        tmpSecretId: result.data.secretId,
        tmpSecretKey: result.data.secretKey,
        sessionToken: result.data.sessionToken,
        startTime: result.data.startTime,
        expiredTime: result.data.expiredTime,
        expiration: new Date(result.data.expiredTime * 1000).toISOString(),
        bucket: result.data.bucket,
        region: result.data.region,
        requestId: '',
        success: true
      };
      this.credentialsExpiry = result.data.expiredTime || now + 3600;
      
      return this.credentials;
      
    } catch (error) {
      console.error('获取 COS 临时密钥失败:', error instanceof Error ? error.message : String(error));
      throw new Error(`获取 COS 上传凭证失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 初始化 COS 客户端
   * 使用 getAuthorization 回调函数方式，每次调用时动态获取最新临时密钥
   */
  private async initCOS() {
    try {
      // 动态导入 COS SDK（浏览器端）
      const COS = (await import('cos-js-sdk-v5')).default;
      
      // 使用 getAuthorization 回调函数方式创建 COS 实例
      this.cos = new COS({
        getAuthorization: (options, callback) => {
          // 每次调用 COS 方法时都会进入此回调，动态获取最新临时密钥
          this.getCredentials()
            .then(data => {
              callback({
                TmpSecretId: data?.tmpSecretId,
                TmpSecretKey: data?.tmpSecretKey,
                SecurityToken: data?.sessionToken,
                StartTime: data.startTime,
                ExpiredTime: data.expiredTime,
                ScopeLimit: true, // 细粒度控制权限
              });
            })
            .catch(() => {
              callback({
                TmpSecretId: '',
                TmpSecretKey: '',
                SecurityToken: '',
                StartTime: 0,
                ExpiredTime: 0,
              });
            });
        }
      });
      
    } catch (error) {
      console.error('初始化 COS SDK 失败:', error instanceof Error ? error.message : String(error));
      throw new Error(`COS SDK 初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 生成文件 Key（COS 对象路径）
   *
   * 路径规则：
   * - 形象训练（用户上传）：
   *   - 图片：digital-human/avatar-training/image/YYYY-MM-DD/filename.ext
   *   - 视频：digital-human/avatar-training/video/YYYY-MM-DD/filename.ext
   * - 形象训练（AI生成）：
   *   - 图片：digital-human/avatar-training/generate/image/YYYY-MM-DD/filename.ext
   *   - 视频：digital-human/avatar-training/generate/video/YYYY-MM-DD/filename.ext
   * - 声音克隆：
   *   - 音频：digital-human/voice-clone/YYYY-MM-DD/filename.ext
   * - 视频生成：
   *   - 音频驱动：digital-human/video-generation/audio/YYYY-MM-DD/filename.ext
   */
  private generateKey(file: File, uploadType: UploadType): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // 生成6位随机数
    const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    // 获取文件扩展名
    const ext = file.name.split('.').pop() || 'bin';

    // 生成文件名：时间戳_随机数.扩展名
    const filename = `${Date.now()}_${random}.${ext}`;

    // 根据上传类型生成路径
    // uploadType 格式：'avatar-training/image' 或 'voice-clone'
    if (uploadType === 'voice-clone') {
      return `digital-human/voice-clone/${dateStr}/${filename}`;
    }

    // 其他类型：digital-human/{uploadType}/{dateStr}/{filename}
    return `digital-human/${uploadType}/${dateStr}/${filename}`;
  }


  /**
   * 上传文件到 COS
   * 使用 uploadFile 高级上传接口，支持大文件分片上传
   */
  async uploadFile(
    file: File,
    uploadType: UploadType,
    options?: UploadOptions
  ): Promise<string> {
    try {
      // 使用 getAuthorization 回调方式，只需初始化一次，每次调用时自动获取最新密钥
      if (!this.cos) {
        await this.initCOS();
      }

      if (!this.cos) {
        throw new Error('COS 客户端未初始化');
      }

      // 生成文件路径
      const key = this.generateKey(file, uploadType);
      
      // 获取存储桶和地域配置
      const bucket = process.env.NEXT_PUBLIC_COS_BUCKET || 'chatmix-1253741020';
      const region = process.env.NEXT_PUBLIC_COS_REGION || 'ap-shanghai';

      return new Promise((resolve, reject) => {
        this.cos!.uploadFile(
          {
            Bucket: bucket,
            Region: region,
            Key: key,
            Body: file,
            onProgress: (progressData: any) => {
              const percent = Math.round(progressData.percent * 100);
              options?.onProgress?.(percent);
            },
          },
          (err: any, data: any) => {
            if (err) {
              options?.onError?.(err);
              reject(new Error(`文件上传失败: ${err.message}`));
            } else {
              // 构造文件访问 URL
              const url = `https://${data.Location}`;
              resolve(url);
            }
          }
        );
      });
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * 带重试机制的上传
   * 在凭证过期或网络错误时自动重试
   */
  async uploadFileWithRetry(
    file: File,
    uploadType: UploadType,
    options?: UploadOptions,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.uploadFile(file, uploadType, options);
      } catch (error) {
        lastError = error as Error;
        // 如果是凭证相关错误，清除缓存的凭证（getAuthorization 回调会自动获取新密钥）
        if (error instanceof Error && this.isCredentialError(error.message)) {
          this.credentials = null;
          this.credentialsExpiry = 0;
          // 使用 getAuthorization 回调方式时，COS 客户端可以保留，下次调用时会自动获取新密钥
        }
        
        // 最后一次尝试失败后抛出错误
        if (attempt === maxRetries) {
          throw new Error(`上传失败，已重试 ${maxRetries} 次。最后错误: ${lastError?.message}`);
        }
        
        // 等待后重试（递增延迟）
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError || new Error('上传失败');
  }

  /**
   * 判断是否为凭证相关错误
   */
  private isCredentialError(errorMessage: string): boolean {
    const credentialErrors = [
      'credentials',
      'expired',
      'InvalidAccessKeyId',
      'SignatureDoesNotMatch',
      'AccessDenied',
      'SecurityTokenExpired'
    ];
    
    return credentialErrors.some(error => errorMessage.includes(error));
  }

  /**
   * 批量上传文件
   * 支持多文件上传，统一进度回调
   */
  async uploadFiles(
    files: File[],
    uploadType: UploadType,
    options?: UploadOptions
  ): Promise<string[]> {
    const urls: string[] = [];
    let totalProgress = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const url = await this.uploadFileWithRetry(file, uploadType, {
        ...options,
        onProgress: (progress) => {
          // 计算总体进度
          totalProgress = ((i * 100) + progress) / files.length;
          options?.onProgress?.(Math.round(totalProgress));
        },
      });
      
      urls.push(url);
    }

    return urls;
  }

  /**
   * 获取上传服务状态
   */
  getUploadStatus(): {
    isCredentialsValid: boolean;
    credentialsExpiry: Date | null;
    hasValidCOS: boolean;
  } {
    const now = Math.floor(Date.now() / 1000);
    return {
      isCredentialsValid: this.credentials !== null && this.credentialsExpiry > now,
      credentialsExpiry: this.credentialsExpiry > 0 ? new Date(this.credentialsExpiry * 1000) : null,
      hasValidCOS: this.cos !== null
    };
  }

  /**
   * 手动刷新凭证
   * 清除缓存的凭证，强制重新获取
   */
  async refreshCredentials(): Promise<void> {
    this.credentials = null;
    this.credentialsExpiry = 0;
    await this.getCredentials();
  }

  /**
   * 清理资源
   * 清除所有缓存的凭证和 COS 实例
   */
  cleanup(): void {
    this.credentials = null;
    this.credentialsExpiry = 0;
    this.cos = null;
  }
  
}

// 导出单例实例
export const cosUploadService = new COSUploadService();

// 默认导出单例实例
export default cosUploadService;

// 导出类本身（如果需要创建新实例）
export { COSUploadService };

// 导出类型定义
export type { COSCredentials, UploadOptions, UploadType };