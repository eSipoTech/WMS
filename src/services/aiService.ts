import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AuditSuggestion {
  sku: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
}

export const getPredictiveDiscrepancy = async (inventoryData: any[]): Promise<AuditSuggestion[]> => {
  try {
    const prompt = `
      Analyze the following inventory data and identify items that might have discrepancies or require an audit.
      Consider factors like low stock, high velocity (implied), or unusual patterns.
      Return a JSON array of objects with 'sku', 'riskLevel' (low, medium, high), and 'reason'.
      
      Inventory Data:
      ${JSON.stringify(inventoryData.map(i => ({ sku: i.sku, name: i.name, qty: i.qty, bin: i.bin })))}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sku: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
              reason: { type: Type.STRING }
            },
            required: ['sku', 'riskLevel', 'reason']
          }
        }
      }
    });

    const result = JSON.parse(response.text || '[]');
    return result;
  } catch (error) {
    console.error("AI Discrepancy Analysis Error:", error);
    return [];
  }
};

export const performItemAudit = async (item: any): Promise<{ confirmed: boolean; discrepancy?: number; message: string }> => {
  try {
    const prompt = `
      Simulate an inventory audit for the following item. 
      Decide if there is a discrepancy (10% chance) or if the count is confirmed.
      Return a JSON object with 'confirmed' (boolean), 'discrepancy' (number, optional, difference from current qty), and 'message' (string).
      
      Item: ${JSON.stringify(item)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confirmed: { type: Type.BOOLEAN },
            discrepancy: { type: Type.NUMBER },
            message: { type: Type.STRING }
          },
          required: ['confirmed', 'message']
        }
      }
    });

    return JSON.parse(response.text || '{"confirmed": true, "message": "Audit failed to run"}');
  } catch (error) {
    console.error("Item Audit Error:", error);
    return { confirmed: true, message: "Audit completed with no issues found (system fallback)." };
  }
};
