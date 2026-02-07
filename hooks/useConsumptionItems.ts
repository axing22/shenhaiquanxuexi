/**
 * 积分扣除规则 Hook
 * 用于在组件中获取和使用积分扣除规则
 */

import { useAppContext } from '@/contexts/app'
import {
  ConsumptionItem,
  ConsumptionItemsData,
  MemberLevel,
  getCreditsForItemType
} from '@/services/consumption'

export function useConsumptionItems() {
  const { consumptionItems = {}, user } = useAppContext()

  // 从用户信息中获取会员等级，默认为 'standard'
  const getMemberLevel = (): MemberLevel => {
    // TODO: 根据实际的用户会员等级字段调整
    // 这里假设用户对象有 memberLevel 或类似字段
    return 'standard'
  }

  /**
   * 根据项目类型获取需要的积分数
   * @param itemType 项目类型，如 'SeeDream', 'Imagen4Standard' 等
   * @param params 可选参数（分辨率、时长等）
   * @returns 需要的积分数，如果找不到则返回 0
   */
  const getCredits = (
    itemType: string,
    params?: {
      aspectRatio?: string
      resolution?: string
      duration?: number
      memberLevel?: MemberLevel
    }
  ): number => {
    const memberLevel = params?.memberLevel || getMemberLevel()
    return getCreditsForItemType(consumptionItems, itemType, memberLevel, params)
  }

  /**
   * 获取所有积分扣除规则
   */
  const getAll = (): ConsumptionItemsData => {
    return consumptionItems
  }

  /**
   * 根据项目类型查找积分扣除规则项
   */
  const getItem = (itemType: string): ConsumptionItem | undefined => {
    return consumptionItems[itemType]
  }

  /**
   * 获取所有消费项类型列表
   */
  const getItemTypes = (): string[] => {
    return Object.keys(consumptionItems)
  }

  return {
    consumptionItems,
    getCredits,
    getAll,
    getItem,
    getItemTypes,
  }
}
