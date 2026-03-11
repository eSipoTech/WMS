import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getAIInsight = async (prompt: string, responseMimeType: string = "text/plain") => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior WMS and Supply Chain expert. Provide concise, actionable insights for warehouse operations, inventory optimization, and logistics. Use a professional, data-driven tone.",
        temperature: 0.7,
        responseMimeType: responseMimeType as any,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return responseMimeType === "application/json" ? JSON.stringify({ observations: ["Error generating AI insight."], recommendations: [] }) : "Unable to generate AI insight.";
  }
};

export const getOperationalAdvice = async (operationType: string, data: any) => {
  const prompt = `Analyze the following ${operationType} data and provide 3 specific optimization recommendations: ${JSON.stringify(data)}`;
  return getAIInsight(prompt);
};

export const getPredictiveDiscrepancy = async (inventoryData: any) => {
  const prompt = `Based on this inventory snapshot, predict potential cyclic count discrepancies and suggest which SKUs should be audited first: ${JSON.stringify(inventoryData)}`;
  return getAIInsight(prompt);
};

export const getMarketResearch = async () => {
  return getAIInsight("Provide a brief market research summary for the logistics industry in 2026, focusing on USA and Mexico trade corridors.");
};

export const getLaborAdvice = async (data: any, lang: string) => {
  return getAIInsight(`Language: ${lang}. Analyze this labor data and provide optimization advice: ${JSON.stringify(data)}`);
};

export const getSlottingAdvice = async (data: any, lang: string) => {
  return getAIInsight(`Language: ${lang}. Analyze this warehouse layout and SKU velocity data to provide slotting advice: ${JSON.stringify(data)}`);
};

export const getCargoPrediction = async (item: any, history: any, lang: string) => {
  return getAIInsight(`Language: ${lang}. Predict cargo volumes for ${JSON.stringify(item)} based on history: ${JSON.stringify(history)}`);
};

export const getRealTimeAlerts = async (data: any, lang: string) => {
  return getAIInsight(`Language: ${lang}. Generate real-time operational alerts based on: ${JSON.stringify(data)}`);
};

export const getComplianceAudit = async (data: any, lang: string) => {
  return getAIInsight(`Language: ${lang}. Perform a virtual compliance audit on: ${JSON.stringify(data)}`);
};

export const getAIAssistance = async (role: string, message: string, context?: any, lang: string = 'en') => {
  const prompt = `Language: ${lang}. Role: ${role}\nUser Message: ${message}\nContext: ${JSON.stringify(context)}`;
  return getAIInsight(prompt);
};

export const getAnalyticsInsights = async (type: string, data: any, lang: string) => {
  const prompt = `Language: ${lang}. Provide deep analytics insights for ${type} data: ${JSON.stringify(data)}. Return JSON with "observations" (array of strings) and "recommendations" (array of strings).`;
  const result = await getAIInsight(prompt, "application/json");
  return JSON.parse(result);
};

export const getAIGraphCreation = async (data: any, type: string) => {
  const prompt = `Suggest the best visualization for ${type} data: ${JSON.stringify(data)}. Return JSON with "title", "type" (Line, Bar, Area, Pie), "dataKey", and "color".`;
  const result = await getAIInsight(prompt, "application/json");
  return JSON.parse(result);
};

export const getCFOConsultation = async (data: any, query: string, lang: string) => {
  const prompt = `Language: ${lang}. Provide CFO-level analysis for query "${query}" based on data: ${JSON.stringify(data)}. Return JSON with "observations" and "recommendations".`;
  const result = await getAIInsight(prompt, "application/json");
  return JSON.parse(result);
};

export const getStrategicInsight = async (data: any, lang: string) => {
  return getAIInsight(`Language: ${lang}. Provide strategic insight for: ${JSON.stringify(data)}`);
};
