import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_VISION_MODEL } from '../constants';
import { PlantDiagnosis, ImagePart, EncyclopediaEntry, CropInsight, FarmingAdvice } from '../types';

const API_KEY = process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error("Gemini API Key (process.env.API_KEY) is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const parseJsonFromGeminiResponse = <T,>(text: string): T | { error: string } => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    return { error: "Failed to parse AI response. The response might not be valid JSON." };
  }
};

export const diagnosePlant = async (imageBase64: string, mimeType: string, customPrompt?: string): Promise<PlantDiagnosis> => {
  const defaultReturn: PlantDiagnosis = { condition: "", diseaseName: "", careSuggestions: [], confidenceLevel: "" };
  if (!API_KEY) return { ...defaultReturn, error: "API Key not configured." };
  
  try {
    // If no image and no mimeType, use text model for prompt correction
    if ((!imageBase64 || imageBase64 === '') && (!mimeType || mimeType === '')) {
      const improvedPrompt = customPrompt ? `${customPrompt}\nRewrite the above as a clear, grammatically correct, natural sentence in the same language. If the text is a question, make it a polite, complete question. Do not translate. Do not add extra information.` : '';
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: improvedPrompt,
        config: { responseMimeType: "application/json" }
      });
      const text = (response as any).text || (response as any).candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) return { ...defaultReturn, error: "AI did not return a response." };
      return { ...defaultReturn, condition: text };
    }
    // Otherwise, use vision model for image + prompt
    const imagePart: ImagePart = {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64.split(',')[1],
      },
    };
    const basePrompt = `You are a plant health expert. Analyze the attached plant image. Respond ONLY in JSON format with these keys:
1. "condition": (string, e.g., "Healthy", "Diseased", "Needs Attention", "Unknown").
2. "statusTag": (string, one of "Healthy", "Diseased", "NeedsAttention", "Unknown"). This should correspond to the condition.
3. "diseaseName": (string, specific disease/issue if any, or "N/A").
4. "careSuggestions": (array of strings, practical, actionable tips as bullet points. If "Healthy" or "Unknown", provide general care tips or state "N/A").
5. "confidenceLevel": (string, e.g., "High", "Medium", "Low", or "N/A if not a plant").
If the image is not a plant, set condition to "Unknown", statusTag to "Unknown", and other relevant fields to "N/A".`;
    const textPart = {
      text: customPrompt ? `${customPrompt} ${basePrompt}` : basePrompt,
    };
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_VISION_MODEL,
      contents: { parts: [imagePart, textPart] },
      config: { responseMimeType: "application/json" }
    });
    const text = (response as any).text || (response as any).candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) return { ...defaultReturn, error: "AI did not return a response." };
    const parsedResult = parseJsonFromGeminiResponse<PlantDiagnosis>(text || "");
    if (!('condition' in parsedResult)) {
      return { ...defaultReturn, error: (parsedResult as { error: string }).error || "AI service returned an unspecified error." };
    }
    const diagnosis = parsedResult as PlantDiagnosis;
    if (typeof diagnosis.careSuggestions === 'string') {
        diagnosis.careSuggestions = diagnosis.careSuggestions.split('\n').map(s => s.trim().replace(/^- /, '')).filter(s => s);
    }
    if (!Array.isArray(diagnosis.careSuggestions)) {
        diagnosis.careSuggestions = diagnosis.careSuggestions ? [String(diagnosis.careSuggestions)] : [];
    }
    return diagnosis;
  } catch (error) {
    console.error("Error diagnosing plant:", error);
    return {
      ...defaultReturn,
      error: `Error from AI: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

export const getEncyclopediaEntry = async (plantName: string): Promise<EncyclopediaEntry> => {
  const defaultReturn: EncyclopediaEntry = { plantName, summary:"", sunlight:"", watering:"", care:"", commonDiseases:""};
  if (!API_KEY) return { ...defaultReturn, error: "API Key not configured."};
  try {
    const prompt = `Provide an encyclopedia-style summary for the plant "${plantName}". Respond ONLY in JSON format with the following keys: "plantName" (string), "summary" (string), "sunlight" (string), "watering" (string), "care" (string), "commonDiseases" (string). If the plant is not found, return an error message under an "error" key, and set other fields to "N/A" or empty strings.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsedResult = parseJsonFromGeminiResponse<EncyclopediaEntry>(response.text || "");
    if (!('summary' in parsedResult)) { // 'summary' is a key in EncyclopediaEntry. If not present, parsedResult is {error: string}
     return { ...defaultReturn, error: (parsedResult as { error: string }).error || "AI service returned an unspecified error." };
    }
    return parsedResult as EncyclopediaEntry;

  } catch (error) {
    console.error("Error fetching encyclopedia entry:", error);
    return { 
      ...defaultReturn,
      error: `Error from AI: ${error instanceof Error ? error.message : String(error)}`, 
    };
  }
};

export const getCropInsights = async (district: string, month: string): Promise<CropInsight> => {
  const defaultReturn: CropInsight = { district, month, suitableCrops:[], tips:"", climatePatterns:"" };
  if (!API_KEY) return { ...defaultReturn, error: "API Key not configured." };
  try {
    const prompt = `For ${district} district in Karnataka, during the month of ${month}, what are the most suitable crops to grow? Respond ONLY in JSON format with keys: "district" (string), "month" (string), "suitableCrops" (array of strings), "tips" (string, general farming tips for these crops in this context), "climatePatterns" (string, typical climate patterns for this district and month).`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const parsedResult = parseJsonFromGeminiResponse<CropInsight>(response.text || "");

    if (!('suitableCrops' in parsedResult)) { // 'suitableCrops' is a key in CropInsight.
      return { ...defaultReturn, error: (parsedResult as { error: string }).error || "AI service returned an unspecified error." };
    }
    return parsedResult as CropInsight;

  } catch (error) {
    console.error("Error fetching crop insights:", error);
     return { 
      ...defaultReturn,
      error: `Error from AI: ${error instanceof Error ? error.message : String(error)}`, 
    };
  }
};

export const getWeatherBasedAdvice = async (weatherJson: string, context: string): Promise<FarmingAdvice> => {
  const defaultReturn: FarmingAdvice = { advice: "" };
  if (!API_KEY) return { ...defaultReturn, error: "API Key not configured." };
  try {
    const prompt = `Given the following weather data for ${context}: ${weatherJson}. You are a strict, highly experienced agricultural advisor. If the crop or farming context is NOT suitable for the current weather, location, or season (for example, rice in a dry region like Sidlaghatta), you must give a very clear, strict, and lengthy warning. Explain in detail why it is not suitable, including water, soil, and climate requirements, and strongly advise the farmer to avoid this crop. Suggest better alternatives if possible. Do NOT sugar-coat or encourage unsuitable choices. If the crop is suitable, provide a detailed, practical, and actionable plan for today. Respond ONLY in JSON format with one key: "advice" (string, at least 5-10 sentences if warning, and always detailed).`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const parsedResult = parseJsonFromGeminiResponse<FarmingAdvice>(response.text || "");

    if (!('advice' in parsedResult)) { // 'advice' is a key in FarmingAdvice.
      return { ...defaultReturn, error: (parsedResult as { error: string }).error || "AI service returned an unspecified error." };
    }
    return parsedResult as FarmingAdvice;
    
  } catch (error) {
    console.error("Error fetching weather-based advice:", error);
    return { 
      ...defaultReturn,
      error: `Error from AI: ${error instanceof Error ? error.message : String(error)}`, 
    };
  }
};

export const generateCaptionForImage = async (imageBase64: string, mimeType: string): Promise<{ caption: string; error?: string }> => {
  if (!API_KEY) return { caption: "", error: "API Key not configured."};
  try {
    const imagePart: ImagePart = {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64.split(',')[1],
      },
    };
    const textPart = {
      text: `Generate a fun, engaging, and informative Instagram-style caption for this plant photo. Keep it concise (1-3 sentences). Respond ONLY in JSON format with one key: "caption" (string).`,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_VISION_MODEL,
      contents: { parts: [imagePart, textPart] },
      config: { responseMimeType: "application/json" }
    });
    const parsedResult = parseJsonFromGeminiResponse<{caption: string}>(response.text || "");

    if (!('caption' in parsedResult)) {
        // parsedResult is of type { error: string }
        return { caption: "", error: (parsedResult as { error: string }).error || "AI service returned an unspecified error." };
    }
    // If here, parsedResult is of type { caption: string }
    return { caption: parsedResult.caption };

  } catch (error) {
    console.error("Error generating caption:", error);
    return { 
      caption: "",
      error: `Error from AI: ${error instanceof Error ? error.message : String(error)}`, 
    };
  }
};
