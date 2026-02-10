import { NextRequest, NextResponse } from 'next/server';
import type { AxiosInstance } from 'axios';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';
import { createGoogleAuthAxios } from '@/lib/google-credentials';
import { containsChinese, translateText, simpleTranslateText } from '@/lib/translate';

// 创建 Google Vertex AI axios 实例(服务器端)
async function createGoogleAxiosInstance(): Promise<AxiosInstance> {
  const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
  const GOOGLE_LOCATION = process.env.GOOGLE_LOCATION || 'us-central1';

  const VERTEX_AI_BASE_URL = GOOGLE_PROJECT_ID && GOOGLE_LOCATION
    ? `https://${GOOGLE_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${GOOGLE_LOCATION}`
    : '';

  if (!VERTEX_AI_BASE_URL) {
    throw new Error('Google Vertex AI credentials not configured');
  }

  // 使用工具函数创建 axios 实例，会自动处理 credentials 解析和 OAuth2
  return createGoogleAuthAxios(VERTEX_AI_BASE_URL);
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

    // Detect if prompt contains Chinese and translate if needed
    let finalPrompt = prompt;
    if (containsChinese(prompt)) {
      log('[Imagen Image-to-Image] 检测到中文提示词，开始翻译:', prompt);
      try {
        // Try Google Cloud Translation API first
        finalPrompt = await translateText(prompt, 'en');
        log('[Imagen Image-to-Image] 翻译完成:', finalPrompt);
      } catch (error) {
        // Fallback to simple translation if Google Cloud fails
        log('[Imagen Image-to-Image] Google翻译失败，尝试备用翻译方案');
        finalPrompt = await simpleTranslateText(prompt);
        log('[Imagen Image-to-Image] 备用翻译完成:', finalPrompt);
      }
    }

    log('[Imagen Image-to-Image] 收到请求:', {
      user: session.user.email,
      originalPrompt: prompt,
      finalPrompt: finalPrompt !== prompt ? finalPrompt : undefined,
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
          prompt: finalPrompt,
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
      // Translate negative prompt if it contains Chinese
      let finalNegativePrompt = negativePrompt;
      if (containsChinese(negativePrompt)) {
        log('[Imagen Image-to-Image] 检测到中文负面提示词，开始翻译:', negativePrompt);
        try {
          finalNegativePrompt = await translateText(negativePrompt, 'en');
          log('[Imagen Image-to-Image] 负面提示词翻译完成:', finalNegativePrompt);
        } catch (error) {
          finalNegativePrompt = await simpleTranslateText(negativePrompt);
        }
      }
      requestBody.instances[0].negativePrompt = finalNegativePrompt;
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
