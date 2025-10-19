// Translation cache to avoid redundant API calls
const translationCache: Map<string, string> = new Map();

/**
 * Get cached translation or fetch from API
 * @param text - Text to translate
 * @param targetLang - Target language code
 * @returns Object with translated text and script validation result
 */
export async function getCachedTranslation(
  text: string, 
  targetLang: string
): Promise<{ translated: string; scriptOk: boolean }> {
  if (!text || targetLang === 'en') {
    return { translated: text, scriptOk: true };
  }
  
  const cacheKey = `${text}_${targetLang}`;
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey)!;
    const scriptOk = isTextInExpectedScript(cached, targetLang);
    return { translated: cached, scriptOk };
  }
  
  try {
    // Call the backend translation API
    const response = await fetch('http://localhost:5001/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [text],
        target: targetLang,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Translation API failed');
    }
    
    const data = await response.json();
    const translatedText = data.translations?.[0] || text;
    
    // Cache the result
    translationCache.set(cacheKey, translatedText);
    
    // Validate the script
    const scriptOk = isTextInExpectedScript(translatedText, targetLang);
    
    return { translated: translatedText, scriptOk };
  } catch (error) {
    console.error('Translation error:', error);
    return { translated: text, scriptOk: true }; // Return original text on error
  }
}

/**
 * Check if text is in the expected script for the language
 * @param text - Text to check
 * @param langCode - Language code
 * @returns True if text appears to be in the expected script
 */
export function isTextInExpectedScript(text: string, langCode: string): boolean {
  if (!text || langCode === 'en') return true;
  
  // Define Unicode ranges for different scripts
  const scriptRanges: Record<string, RegExp> = {
    'hi': /[\u0900-\u097F]/, // Devanagari (Hindi)
    'kn': /[\u0C80-\u0CFF]/, // Kannada
    'ta': /[\u0B80-\u0BFF]/, // Tamil
    'te': /[\u0C00-\u0C7F]/, // Telugu
    'bn': /[\u0980-\u09FF]/, // Bengali
    'mr': /[\u0900-\u097F]/, // Marathi (Devanagari)
    'gu': /[\u0A80-\u0AFF]/, // Gujarati
    'ml': /[\u0D00-\u0D7F]/, // Malayalam
    'pa': /[\u0A00-\u0A7F]/, // Punjabi (Gurmukhi)
    'ur': /[\u0600-\u06FF]/, // Urdu (Arabic script)
    'or': /[\u0B00-\u0B7F]/, // Oriya
  };
  
  const expectedScript = scriptRanges[langCode];
  
  if (!expectedScript) {
    // If we don't have a script range for this language, assume it's okay
    return true;
  }
  
  // Check if the text contains characters from the expected script
  // We'll consider it valid if at least 20% of non-space characters match
  // OR if the text is very short (less than 20 characters) - likely a plant name
  const nonSpaceChars = text.replace(/\s/g, '');
  if (nonSpaceChars.length === 0) return true;
  
  // For short texts (like plant names), be more lenient
  if (nonSpaceChars.length < 20) return true;
  
  const matchingChars = (text.match(expectedScript) || []).length;
  const ratio = matchingChars / nonSpaceChars.length;
  
  return ratio > 0.2;
}

/**
 * Batch translate multiple texts
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code
 * @returns Array of translated texts
 */
export async function batchTranslate(texts: string[], targetLang: string): Promise<string[]> {
  if (!texts.length || targetLang === 'en') return texts;
  
  try {
    const response = await fetch('http://localhost:5001/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        target: targetLang,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Translation API failed');
    }
    
    const data = await response.json();
    return data.translations || texts;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts; // Return original texts on error
  }
}
