
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Optimizes a single bullet point using Gemini.
 */
export const optimizeBulletPoint = async (text: string, context: string = 'Resume Project Bullet'): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing. Please configure process.env.API_KEY";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Improve the following resume bullet point to be more impact-driven, using the STAR method where possible. 
      Keep it concise but technical. 
      Input text: "${text}"
      Context: ${context}`,
      config: {
        responseMimeType: 'text/plain',
        temperature: 0.7,
      }
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini optimization error:", error);
    return text;
  }
};

/**
 * Generates a professional summary based on the entire resume content.
 */
export const generateSummary = async (skills: string, projects: string, role: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a professional resume summary (approx 50-60 words) for a ${role}. 
      Highlight the following skills: ${skills}. 
      Mention experience with: ${projects}.
      Tone: Professional, motivated, detail-oriented.`,
      config: {
        responseMimeType: 'text/plain',
        temperature: 0.7,
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini summary error:", error);
    return "Error generating summary.";
  }
};
