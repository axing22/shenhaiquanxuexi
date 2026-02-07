/**
 * 积分扣除规则服务
 */

import { apiClient } from '@/lib/api-client'

// 会员等级类型
export type MemberLevel = 'free_vip' | 'standard' | 'normal_vip' | 'pro_vip'

// 固定定价
export interface FixedPricing {
  free_vip: number
  standard: number
  normal_vip: number
  pro_vip: number
}

// 基于参数的定价
export interface ParameterBasedPricing {
  [aspectRatio: string]: {
    [param: string]: {
      [subParam: string]: number
    }
  }
}

// 时长倍数配置
export interface DurationMultiplier {
  enabled: boolean
  unit: string // 'second', 'minute' etc.
  baseUnit: number
  roundUp: boolean
}

// 消费项
export interface ConsumptionItem {
  name: string // 显示名称
  description: string // 描述
  pricingMode: 'fixed' | 'parameter_based' // 定价模式
  pricing?: FixedPricing // 固定定价（pricingMode=fixed 时有）
  memberLevelPricing?: {
    [memberLevel: string]: ParameterBasedPricing
  } // 基于参数的定价（pricingMode=parameter_based 时有）
  durationMultiplier?: DurationMultiplier // 时长倍数配置
  fallback?: {
    pointsRequired: number // 默认积分
  }
}

// 所有消费项（key 是消费项类型）
export interface ConsumptionItemsData {
  [itemType: string]: ConsumptionItem
}

export interface ConsumptionItemsResponse {
  code: number
  message: string
  data: ConsumptionItemsData
}

/**
 * 获取所有积分扣除规则
 * 不需要登录，公开接口
 */
export async function getConsumptionItems(): Promise<ConsumptionItemsData> {
  try {
    const response = await apiClient.get<ConsumptionItemsData>('/api/payment/consumption-items')

    if (response.code === 1000 && response.data) {
      return response.data
    }

    return {}
  } catch (error) {
    console.error('[Consumption] Failed to fetch consumption items:', error)
    return {}
  }
}

/**
 * 根据项目类型和会员等级获取需要的积分数
 * @param items 所有消费项数据
 * @param itemType 消费项类型，如 'SeeDream', 'Imagen4Standard' 等
 * @param memberLevel 会员等级，默认为 'standard'
 * @param params 可选参数，用于 parameter_based 定价模式
 * @returns 需要的积分数，如果找不到则返回 0
 */
export function getCreditsForItemType(
  items: ConsumptionItemsData,
  itemType: string,
  memberLevel: MemberLevel = 'standard',
  params?: {
    aspectRatio?: string
    resolution?: string
    duration?: number // 秒或分钟数
  }
): number {
  const item = items[itemType]
  if (!item) {
    return 0
  }

  // 固定定价模式
  if (item.pricingMode === 'fixed' && item.pricing) {
    return item.pricing[memberLevel] || 0
  }

  // 基于参数的定价模式
  if (item.pricingMode === 'parameter_based' && item.memberLevelPricing) {
    const levelPricing = item.memberLevelPricing[memberLevel]
    if (!levelPricing) {
      return item.fallback?.pointsRequired || 0
    }

    // 获取基础单价
    const aspectRatio = params?.aspectRatio || 'default'
    const resolution = params?.resolution || 'default'

    const aspectRatioPricing = levelPricing[aspectRatio] || levelPricing['default']
    if (!aspectRatioPricing) {
      return item.fallback?.pointsRequired || 0
    }

    const resolutionPricing = aspectRatioPricing['resolution'] || aspectRatioPricing['default']
    if (!resolutionPricing) {
      return item.fallback?.pointsRequired || 0
    }

    const basePrice = resolutionPricing[resolution] || resolutionPricing['default'] || item.fallback?.pointsRequired || 0

    // 如果有时长倍数，计算总价
    if (item.durationMultiplier?.enabled && params?.duration) {
      const { baseUnit, roundUp } = item.durationMultiplier
      let units = params.duration / baseUnit
      if (roundUp) {
        units = Math.ceil(units)
      }
      return Math.round(basePrice * units)
    }

    return basePrice
  }

  // 使用 fallback
  return item.fallback?.pointsRequired || 0
}
