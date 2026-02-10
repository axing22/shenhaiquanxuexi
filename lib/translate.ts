/**
 * Translation utilities for prompt enhancement
 */

/**
 * Detect if text contains Chinese characters
 */
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * Translate text using free translation API (MyMemory Translation API)
 * This is a free API that doesn't require authentication
 */
export async function translateText(text: string, targetLang: string = 'en'): Promise<string> {
  // If no Chinese characters, return original text
  if (!containsChinese(text)) {
    return text;
  }

  try {
    const axios = (await import('axios')).default;

    // Using MyMemory Translation API (free, no auth required)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh|en`;

    const response = await axios.get(url, {
      timeout: 10000,
    });

    if (response.data && response.data.responseStatus === 200 && response.data.responseData) {
      const translatedText = response.data.responseData.translatedText;
      console.log('[Translation] Original:', text);
      console.log('[Translation] Translated:', translatedText);
      return translatedText;
    }

    // Fallback to original if translation fails
    console.warn('[Translation] API returned invalid response, using original text');
    return text;
  } catch (error) {
    console.error('[Translation] Error translating text:', error);
    // Fallback to original text on error
    return text;
  }
}

/**
 * Simple translation fallback using alternative free API
 */
export async function simpleTranslateText(text: string): Promise<string> {
  if (!containsChinese(text)) {
    return text;
  }

  try {
    const axios = (await import('axios')).default;

    // Using LibreTranslate (free, open-source)
    const response = await axios.post('https://libretranslate.com/translate', {
      q: text,
      source: 'zh',
      target: 'en',
      format: 'text',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data && response.data.translatedText) {
      console.log('[Translation] Simple translation - Original:', text);
      console.log('[Translation] Simple translation - Translated:', response.data.translatedText);
      return response.data.translatedText;
    }

    return text;
  } catch (error) {
    console.error('[Translation] Simple translation failed:', error);
    return text;
  }
}
