import { NextRequest, NextResponse } from 'next/server';
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';

// 创建 Google Vertex AI axios 实例(服务器端)
async function createGoogleAxiosInstance(): Promise<AxiosInstance> {
  const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
  const GOOGLE_LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';
  const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS;

  const VERTEX_AI_BASE_URL = GOOGLE_PROJECT_ID && GOOGLE_LOCATION
    ? `https://${GOOGLE_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${GOOGLE_LOCATION}`
    : '';

  if (!VERTEX_AI_BASE_URL) {
    throw new Error('Google Vertex AI credentials not configured');
  }

  if (!GOOGLE_CREDENTIALS) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
  }

  const instance = axios.create({
    baseURL: VERTEX_AI_BASE_URL,
    timeout: 300000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器 - 添加 OAuth2 令牌
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const { GoogleAuth } = await import('google-auth-library');

      // 解析 GOOGLE_CREDENTIALS JSON 字符串
      let credentials;
      try {
        credentials = typeof GOOGLE_CREDENTIALS === 'string'
          ? JSON.parse(GOOGLE_CREDENTIALS)
          : GOOGLE_CREDENTIALS;
      } catch (error) {
        throw new Error('Failed to parse GOOGLE_CREDENTIALS');
      }

      // 修复私钥中的换行符:将字面量 \n 转换为真正的换行符
      if (credentials.private_key && typeof credentials.private_key === 'string') {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }

      // 使用明确的凭据创建 GoogleAuth
      const auth = new GoogleAuth({
        credentials: credentials,
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      });

      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      // accessToken 是一个对象，需要提取 token 属性
      const token = typeof accessToken === 'string' ? accessToken : accessToken.token;

      config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    }
  );

  return instance;
}

export async function POST(request: NextRequest) {
  try {
    // 使用 NextAuth 获取 session
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      model = 'imagen-3.0-generate-001',
      aspectRatio = '1:1',
      numberOfImages = 1,
      negativePrompt,
      seed,
      imageBase64 // 输入图片的 base64 编码
    } = body;

    log('[Imagen Image-to-Image] 收到请求:', {
      user: session.user.email,
      prompt,
      model,
      aspectRatio,
      numberOfImages,
      hasImage: !!imageBase64
    });

    // 验证必需参数
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { code: 400, message: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!imageBase64) {
      return NextResponse.json(
        { code: 400, message: 'imageBase64 is required for image-to-image' },
        { status: 400 }
      );
    }

    // 构建符合 Vertex AI Imagen API 格式的请求
    const requestBody: Record<string, any> = {
      instances: [
        {
          prompt: prompt,
          image: {
            bytesBase64Encoded: imageBase64.replace(/^data:image\/\w+;base64,/, '')
          }
        },
      ],
      parameters: {
        aspectRatio: aspectRatio,
        numberOfImages: numberOfImages,
      },
    };

    // 添加可选参数
    if (negativePrompt) {
      requestBody.instances[0].negativePrompt = negativePrompt;
    }

    if (seed !== undefined) {
      requestBody.parameters.seed = seed;
    }

    // 构建完整的 API 端点 URL
    // 格式: /publishers/google/models/{MODEL}:predict
    const endpoint = `/publishers/google/models/${model}:predict`;

    log('[Imagen Image-to-Image] 调用 Google Vertex AI API:', endpoint);

    const googleAxios = await createGoogleAxiosInstance();
    const response = await googleAxios.post(endpoint, requestBody);

    log('[Imagen Image-to-Image] 响应成功:', {
      predictionsCount: response.data?.predictions?.length || 0
    });

    // 提取 base64 编码的图片数据
    const predictions = response.data?.predictions || [];

    // 将 predictions 转换为更易用的格式
    const images = predictions.map((prediction: any) => {
      // Vertex AI Imagen 返回格式: { bytesBase64Encoded: "..." }
      if (prediction.bytesBase64Encoded) {
        return `data:image/png;base64,${prediction.bytesBase64Encoded}`;
      }
      // 或者其他可能的格式
      return prediction;
    });

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        images: images,
        count: images.length,
        model: model
      }
    });
  } catch (error: any) {
    logError('[Imagen Image-to-Image] 错误:', error);

    // 提取更详细的错误信息
    let errorMessage = '生成失败';
    let errorCode = 500;
    let errorDetails: any = {};

    if (error.response) {
      errorCode = error.response.status;
      errorDetails = error.response.data;

      // Google Cloud API 错误格式
      if (error.response.data?.error) {
        errorMessage = error.response.data.error.message || errorMessage;
      } else {
        errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        code: errorCode,
        message: errorMessage,
        error: errorDetails
      },
      { status: errorCode }
    );
  }
}
