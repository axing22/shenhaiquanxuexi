import { NextRequest, NextResponse } from 'next/server';
import { googleAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';

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
      seed
    } = body;

    log('[Imagen Generate] 收到请求:', {
      user: session.user.email,
      prompt,
      model,
      aspectRatio,
      numberOfImages
    });

    // 验证必需参数
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { code: 400, message: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // 构建符合 Vertex AI Imagen API 格式的请求
    const requestBody: Record<string, any> = {
      instances: [
        {
          prompt: prompt,
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

    log('[Imagen Generate] 调用 Google Vertex AI API:', endpoint);

    const response = await googleAxios.post(endpoint, requestBody);

    log('[Imagen Generate] 响应成功:', {
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
    logError('[Imagen Generate] 错误:', error);

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
