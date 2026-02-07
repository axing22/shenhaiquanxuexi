/**
 * Prompt History Management
 * 管理图片转提示词的历史记录
 */

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
  model?: string;
  imagePreview?: string;
}

const STORAGE_KEY = 'image-to-prompt-history';
const MAX_ITEMS = 20;

/**
 * 获取历史记录
 */
export function getPromptHistory(): PromptHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const history = JSON.parse(data) as PromptHistoryItem[];
    return history.slice(0, MAX_ITEMS); // 确保不超过最大数量
  } catch (error) {
    console.error('Failed to load prompt history:', error);
    return [];
  }
}

/**
 * 保存新的prompt到历史记录
 */
export function savePromptToHistory(prompt: string, model?: string, imagePreview?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getPromptHistory();

    const newItem: PromptHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt,
      timestamp: Date.now(),
      model,
      imagePreview,
    };

    // 添加到开头
    const updatedHistory = [newItem, ...history];

    // 只保留最新的20条
    const limitedHistory = updatedHistory.slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save prompt to history:', error);
  }
}

/**
 * 清空历史记录
 */
export function clearPromptHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear prompt history:', error);
  }
}

/**
 * 删除单条历史记录
 */
export function deletePromptHistoryItem(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getPromptHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to delete prompt history item:', error);
  }
}
