import { GoogleGenAI } from "@google/genai";

// Ensure API key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Edits an image using Gemini 2.5 Flash Image (Nano Banana).
 * 
 * @param base64Image The base64 string of the original image (raw data, no prefix).
 * @param mimeType The mime type of the original image.
 * @param prompt The user's text instruction for editing.
 * @returns The base64 string of the generated image.
 */
export const editImageWithGemini = async (
  base64Image: string, 
  mimeType: string, 
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Mapped from "nano banana"
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Note: responseMimeType and responseSchema are not supported for nano banana models
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content returned from Gemini.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }

    // Fallback if no image found but maybe text exists (error case usually)
    const textPart = parts.find(p => p.text);
    if (textPart) {
      throw new Error(`Model returned text instead of image: ${textPart.text}`);
    }

    throw new Error("No image data found in response.");
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};