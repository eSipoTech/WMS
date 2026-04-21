import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getAIInsight = async (prompt: string, responseMimeType: string = "text/plain", useSearch: boolean = false) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an advanced Neural G-Core v5.0 AI expert focused on the Porteo Logistics ecosystem. Provide high-density, actionable insights for warehouse operations, global logistics, and supply chain strategy. Use a professional, data-driven, and highly optimized tone. Your thinking process prioritizes efficiency, cost-reduction, and neural path optimization across multi-warehouse environments. DO NOT hallucinate alerts about temperature or security unless specifically mentioned in the data. Focus on occupancy, throughput, predictive maintenance, and strategic inventory positioning.",
        temperature: 0.4,
        responseMimeType: responseMimeType as any,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      },
    });

    if (!response || !response.text) {
      throw new Error("Empty response from AI");
    }

    return response.text;
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    
    // Handle rate limit specifically
    if (error.message?.includes("429") || error.message?.includes("rate limit") || error.message?.includes("Rate exceeded")) {
      console.warn("Gemini API Rate Limit Exceeded. Returning fallback data.");
    }

    if (responseMimeType === "application/json") {
      return JSON.stringify({ 
        observations: ["Service temporarily unavailable. Please try again later."], 
        recommendations: ["Check system connectivity", "Verify API quota"],
        headlines: ["AI Service Busy"],
        content: ["The AI service is currently experiencing high demand. Please wait a moment before requesting more insights."],
        throughput: 0,
        leadTime: 0,
        accuracy: 0,
        advice: "AI optimization is currently unavailable due to high demand.",
        items: [],
        alert: { title: "AI Offline", details: "Rate limit exceeded" }
      });
    }
    return "AI service is currently unavailable. Please try again in a few moments.";
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
  try {
    const result = await getAIInsight(prompt, "application/json");
    return JSON.parse(result);
  } catch (e) {
    console.error("Failed to parse AI Analytics Insights:", e);
    return { observations: ["Error parsing AI response."], recommendations: [] };
  }
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
  try {
    const result = await getAIInsight(fullPrompt, "application/json");
    return JSON.parse(result);
  } catch (e) {
    console.error("Failed to parse AI Graph Creation:", e);
    return { title: "Error", type: "bar", dataKey: "revenue", color: "#F27D26" };
  }
};

export const getCFOConsultation = async (data: any, query: string, lang: string) => {
  const prompt = `Language: ${lang}. Provide CFO-level analysis for query "${query}" based on data: ${JSON.stringify(data)}. Return JSON with "observations" and "recommendations".`;
  try {
    const result = await getAIInsight(prompt, "application/json");
    return JSON.parse(result);
  } catch (e) {
    console.error("Failed to parse CFO Consultation:", e);
    return { observations: ["Error parsing AI response."], recommendations: [] };
  }
};

export const getStrategicSimulation = async (market: string, lang: string, contextData?: any) => {
  const prompt = `Language: ${lang}. Market: ${market}. 
  Context Data (Current Status): ${JSON.stringify(contextData)}
  Run a high-fidelity strategic warehouse simulation for Peak Demand Q3 2026 based STRICTLY on the provided context data if available.
  Return a JSON object with:
  "throughput": number (percentage increase, e.g. 15),
  "leadTime": number (minutes reduction, e.g. 10),
  "accuracy": number (percentage, e.g. 99.8),
  "advice": string (concise AI optimization advice specifically addressing bottlenecks seen in the data).`;
  try {
    const result = await getAIInsight(prompt, "application/json");
    return JSON.parse(result);
  } catch (e) {
    console.error("Failed to parse Strategic Simulation:", e);
    return { throughput: 0, leadTime: 0, accuracy: 0, advice: "Simulation failed due to neural sync error." };
  }
};

export const getComplianceAuditReport = async (market: string, lang: string, contextData?: any) => {
  const prompt = `Language: ${lang}. Market: ${market}. 
  Operational Context: ${JSON.stringify(contextData)}
  Perform a deep virtual compliance audit for a logistics company in 2026, evaluating the provided operational context against current regulations (SAT/Carta Porte if MX, DOT/FMCSA if USA).
  Return a JSON object with:
  "auditId": string (e.g. AUD-2026-XXXX),
  "items": array of objects with "label", "status" (Passed/Warning/Failed), "score" (percentage string), "required" (boolean),
  "alert": object with "title" and "details". Ensure items reflect real regulatory requirements for the specific market.`;
  try {
    const result = await getAIInsight(prompt, "application/json");
    return JSON.parse(result);
  } catch (e) {
    console.error("Failed to parse Compliance Audit Report:", e);
    return { auditId: "ERR-000", items: [], alert: { title: "Audit Link Failure", details: "Could not establish secure neural link to regulatory database." } };
  }
};

export const getStrategicInsight = async (data: any, lang: string) => {
  return getAIInsight(`Language: ${lang}. Provide strategic insight for: ${JSON.stringify(data)}`);
};
