import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getMarketResearch() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Research the top Warehouse Management System (WMS) tools in the USA and Mexico for 2026. Also research trending logistics technologies for 2026 and beyond. Provide a concise summary for a dashboard.",
  });
  return response.text;
}

export async function getAIAssistance(role: string, context: string, prompt: string, language: 'en' | 'es') {
  const systemInstructions = {
    en: {
      "Control Tower": "You are the Control Tower AI. You monitor real-time operations, identify bottlenecks, and suggest immediate optimizations.",
      "Supply Chain Director": "You are the Supply Chain Director AI. You focus on long-term strategy, network optimization, and risk management.",
      "COO Assistant": "You are the COO Assistant AI. You focus on operational efficiency, labor management, and financial performance."
    },
    es: {
      "Control Tower": "Eres la IA de la Torre de Control. Monitoreas operaciones en tiempo real, identificas cuellos de botella y sugieres optimizaciones inmediatas.",
      "Supply Chain Director": "Eres la IA del Director de Cadena de Suministro. Te enfocas en la estrategia a largo plazo, optimización de red y gestión de riesgos.",
      "COO Assistant": "Eres la IA del Asistente del COO. Te enfocas en la eficiencia operativa, gestión laboral y desempeño financiero."
    }
  };

  const instruction = systemInstructions[language][role as keyof typeof systemInstructions['en']] || "You are a helpful logistics assistant.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Context: ${context}\n\nUser Question: ${prompt}`,
    config: {
      systemInstruction: instruction,
    }
  });
  return response.text;
}

export async function getLaborAdvice(shiftData: any, language: 'en' | 'es') {
  const prompt = language === 'en' 
    ? `Analyze the following warehouse shift productivity data and provide one concise, actionable AI insight (max 2 sentences) for labor optimization: ${JSON.stringify(shiftData)}`
    : `Analiza los siguientes datos de productividad de turnos de almacén y proporciona una perspectiva de IA concisa y accionable (máximo 2 oraciones) para la optimización laboral: ${JSON.stringify(shiftData)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: language === 'en' 
        ? "You are a warehouse labor optimization expert. Provide data-driven, professional advice."
        : "Eres un experto en optimización laboral de almacenes. Proporciona consejos profesionales basados en datos."
    }
  });
  return response.text;
}

export async function getSlottingAdvice(inventoryData: any, language: 'en' | 'es') {
  const prompt = language === 'en'
    ? `As a Senior Warehouse and Inventory Director, analyze this inventory data and provide 3 specific slotting optimization suggestions to improve picking efficiency: ${JSON.stringify(inventoryData)}`
    : `Como Director Senior de Almacén e Inventarios, analiza estos datos de inventario y proporciona 3 sugerencias específicas de optimización de slotting para mejorar la eficiencia de surtido: ${JSON.stringify(inventoryData)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: language === 'en'
        ? "You are a Senior Warehouse and Inventory Director. You provide high-level, strategic advice on inventory placement and warehouse flow."
        : "Eres un Director Senior de Almacén e Inventarios. Proporcionas consejos estratégicos de alto nivel sobre la ubicación del inventario y el flujo del almacén."
    }
  });
  return response.text;
}

export async function getComplianceAudit(shipmentData: any, language: 'en' | 'es') {
  const prompt = language === 'en'
    ? `As a Senior Compliance Expert for USA and Mexico, audit these shipment documents and identify any missing or non-compliant elements: ${JSON.stringify(shipmentData)}`
    : `Como Experto Senior en Cumplimiento para EE. UU. y México, audita estos documentos de envío e identifica cualquier elemento faltante o que no cumpla con las normas: ${JSON.stringify(shipmentData)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: language === 'en'
        ? "You are a Senior Compliance Expert specializing in US-Mexico cross-border logistics. You are thorough, professional, and identify regulatory risks."
        : "Eres un Experto Senior en Cumplimiento especializado en logística transfronteriza entre EE. UU. y México. Eres minucioso, profesional e identificas riesgos regulatorios."
    }
  });
  return response.text;
}

export async function getCargoPrediction(shipmentInfo: any, history: any[], language: 'en' | 'es') {
  const prompt = language === 'en'
    ? `Analyze this shipment: ${JSON.stringify(shipmentInfo)} based on historical patterns: ${JSON.stringify(history)}. Predict ETA, potential risks, and suggest optimizations. Use a professional ML-driven tone.`
    : `Analiza este envío: ${JSON.stringify(shipmentInfo)} basado en patrones históricos: ${JSON.stringify(history)}. Predice el ETA, riesgos potenciales y sugiere optimizaciones. Usa un tono profesional basado en ML.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: language === 'en'
        ? "You are a Predictive Logistics AI. You use machine learning patterns to forecast supply chain events."
        : "Eres una IA de Logística Predictiva. Usas patrones de aprendizaje automático para pronosticar eventos de la cadena de suministro."
    }
  });
  return response.text;
}

export async function getRealTimeAlerts(operationalData: any, language: 'en' | 'es') {
  const prompt = language === 'en'
    ? `Monitor this real-time data: ${JSON.stringify(operationalData)}. Identify any immediate anomalies or efficiency opportunities. Provide 2-3 short alerts.`
    : `Monitorea estos datos en tiempo real: ${JSON.stringify(operationalData)}. Identifica anomalías inmediatas u oportunidades de eficiencia. Proporciona 2-3 alertas cortas.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: language === 'en'
        ? "You are a Real-Time Operations Monitor. You provide instant, actionable alerts for warehouse and logistics teams."
        : "Eres un Monitor de Operaciones en Tiempo Real. Proporcionas alertas instantáneas y accionables para equipos de almacén y logística."
    }
  });
  return response.text;
}
