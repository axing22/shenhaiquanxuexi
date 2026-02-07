/**
 * 模型ID到消耗项类型的映射
 * 用于根据模型ID查找对应的积分消耗规则
 */

/**
 * 将图片模型ID映射到消耗项类型
 * @param modelId 模型ID，如 'imagen-4-standard', 'seedream-4.0' 等
 * @returns 消耗项类型，如 'Imagen4Standard', 'SeeDream' 等
 */
export function mapImageModelToConsumptionType(modelId: string): string | null {
  // Imagen 4 系列
  if (modelId.includes('imagen-4-standard')) {
    return 'Imagen4Standard'
  }
  if (modelId.includes('imagen-4-fast')) {
    return 'Imagen4Fast'
  }
  if (modelId.includes('imagen-4-ultra')) {
    return 'Imagen4Ultra'
  }

  // Gemini 2.5 Flash（Nano Banana）
  if (modelId.includes('gemini-2.5-flash')) {
    return 'Gemini2_5FlashImage'
  }

  // 未找到映射
  return null
}

/**
 * 将视频模型ID映射到消耗项类型
 * @param modelId 视频模型ID
 * @returns 消耗项类型
 */
export function mapVideoModelToConsumptionType(modelId: string): string | null {
  // Veo3 系列
  if (modelId.includes('veo-3') || modelId.includes('veo3')) {
    if (modelId.includes('fast')) {
      if (modelId.includes('audio')) {
        return 'Veo3FastVideoWithAudio'
      }
      return 'Veo3FastVideo'
    }
    if (modelId.includes('audio')) {
      return 'Veo3VideoWithAudio'
    }
    return 'Veo3Video'
  }

  // Veo3.1 系列
  if (modelId.includes('veo-3.1') || modelId.includes('veo3.1') || modelId.includes('veo3_1')) {
    if (modelId.includes('audio')) {
      return 'Veo3_1VideoWithAudio'
    }
    return 'Veo3_1Video'
  }

  // 未找到映射
  return null
}
