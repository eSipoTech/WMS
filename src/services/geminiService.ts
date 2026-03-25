import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getAIInsight = async (prompt: string, responseMimeType: string = "text/plain", useSearch: boolean = false) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior WMS and Supply Chain expert. Provide concise, actionable insights for warehouse operations, inventory optimization, and logistics. Use a professional, data-driven tone. DO NOT hallucinate alerts about temperature or security unless specifically mentioned in the data. Focus on occupancy, throughput, and inventory levels.",
        temperature: 0.4, // Lower temperature for more consistent data-driven responses
        responseMimeType: responseMimeType as any,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
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

export const getPredictiveDiscrepancy = async (inventoryData: any, lang: string = 'en') => {
  const prompt = `Language: ${lang}. Based on this inventory snapshot, predict potential cyclic count discrepancies and suggest which SKUs should be audited first: ${JSON.stringify(inventoryData)}`;
  return getAIInsight(prompt);
};

export const getMarketResearch = async (market: string, lang: string = 'en') => {
  const prompt = `Provide a brief market research summary for the logistics industry in 2026, specifically for ${market}. 
  If the market is Mexico, provide the response in ${lang === 'es' ? 'Spanish' : 'English'}.
  Focus on trade corridors, nearshoring trends, and local infrastructure.
  Return the response as a JSON object with "headlines" (array of strings) and "content" (array of strings, matching headlines).`;
  return getAIInsight(prompt, "application/json", true);
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
  const prompt = `Language: ${lang}. Generate 3 REAL-TIME operational alerts based STRICTLY on this data: ${JSON.stringify(data)}. 
  Focus on:
  1. Occupancy vs Capacity
  2. Low stock items
  3. Active shipments/trucks
  DO NOT mention temperature or security gates unless they are in the data. 
  Format: One alert per line, no bullets.`;
  return getAIInsight(prompt);
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

export const getAIGraphCreation = async (prompt: string, lang: string = 'en') => {
  const fullPrompt = `Language: ${lang}. User request: "${prompt}". 
  Based on this request, suggest a custom graph configuration for a warehouse analytics dashboard.
  Available data variables: "revenue", "cost", "profit", "pallets", "occupancy", "accuracy", "lines".
  Return a JSON object with:
  "title": string (descriptive title),
  "type": string (one of: "bar", "line", "area", "scatter"),
  "dataKey": string (one of the available variables),
  "color": string (hex color code).`;
  const result = await getAIInsight(fullPrompt, "application/json");
  return JSON.parse(result);
};

export const getCFOConsultation = async (data: any, query: string, lang: string) => {
  const prompt = `Language: ${lang}. Provide CFO-level analysis for query "${query}" based on data: ${JSON.stringify(data)}. Return JSON with "observations" and "recommendations".`;
  const result = await getAIInsight(prompt, "application/json");
  return JSON.parse(result);
};

export const getStrategicSimulation = async (market: string, lang: string) => {
  const prompt = `Language: ${lang}. Market: ${market}. 
  Run a strategic warehouse simulation for Peak Demand Q3 2026.
  Return a JSON object with:
  "throughput": number (percentage increase, e.g. 15),
  "leadTime": number (minutes reduction, e.g. 10),
  "accuracy": number (percentage, e.g. 99.8),
  "advice": string (concise AI optimization advice).`;
  const result = await getAIInsight(prompt, "application/json");
  return JSON.parse(result);
};

export const getComplianceAuditReport = async (market: string, lang: string) => {
  const prompt = `Language: ${lang}. Market: ${market}. 
  Perform a virtual compliance audit for a logistics company in 2026.
  Return a JSON object with:
  "auditId": string (e.g. AUD-2026-XXXX),
  "items": array of objects with "label", "status" (Passed/Warning/Failed), "score" (percentage string), "required" (boolean),
  "alert": object with "title" and "details".`;
  const result = await getAIInsight(prompt, "application/json");
  return JSON.parse(result);
};

export const getStrategicInsight = async (data: any, lang: string) => {
  return getAIInsight(`Language: ${lang}. Provide strategic insight for: ${JSON.stringify(data)}`);
};
