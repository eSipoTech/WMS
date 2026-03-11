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
      "COO Assistant": "You are the COO Assistant AI. You focus on operational efficiency, labor management, and financial performance.",
      "Assembly Expert": "You are the Assembly and Kitting Expert AI. You specialize in production line optimization, Bill of Materials (BOM) management, and kitting efficiency.",
      "Warehouse Director": "You are the Warehouse and Inventory Director AI. You specialize in warehouse layout optimization, inventory slotting, and operational excellence. You can help users create and optimize warehouse layouts from uploaded data."
    },
    es: {
      "Control Tower": "Eres la IA de la Torre de Control. Monitoreas operaciones en tiempo real, identificas cuellos de botella y sugieres optimizaciones inmediatas.",
      "Supply Chain Director": "Eres la IA del Director de Cadena de Suministro. Te enfocas en la estrategia a largo plazo, optimización de red y gestión de riesgos.",
      "COO Assistant": "Eres la IA del Asistente del COO. Te enfocas en la eficiencia operativa, gestión laboral y desempeño financiero.",
      "Assembly Expert": "Eres la IA Experta en Ensamble y Kitting. Te especializas en la optimización de líneas de producción, gestión de Listas de Materiales (BOM) y eficiencia de kitting.",
      "Warehouse Director": "Eres la IA del Director de Almacén e Inventarios. Te especializas en la optimización del diseño del almacén, el slotting de inventario y la excelencia operativa. Puedes ayudar a los usuarios a crear y optimizar diseños de almacén a partir de datos cargados."
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

export async function getStrategicInsight(query: string, language: 'en' | 'es') {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      systemInstruction: language === 'en'
        ? "You are a Strategic Logistics Consultant with extensive knowledge in global warehousing, automotive assembly lines, and Mexican regulatory compliance (CFDI 4.0, Carta Porte). Provide high-level, data-driven strategic advice."
        : "Eres un Consultor Estratégico de Logística con amplio conocimiento en almacenamiento global, líneas de ensamble automotriz y cumplimiento regulatorio mexicano (CFDI 4.0, Carta Porte). Proporciona asesoría estratégica de alto nivel basada en datos."
    }
  });
  return response.text;
}

export async function getAnalyticsInsights(metric: string, data: any, language: 'en' | 'es') {
  const prompt = language === 'en'
    ? `Analyze the following data for the metric "${metric}": ${JSON.stringify(data)}. 
       Provide 3 concise, data-driven "Key Observations" and 2 "Recommended Actions". 
       Format the response as a JSON object with "observations" (array of strings) and "recommendations" (array of strings).`
    : `Analiza los siguientes datos para la métrica "${metric}": ${JSON.stringify(data)}. 
       Proporciona 3 "Observaciones Clave" concisas y basadas en datos, y 2 "Acciones Recomendadas". 
       Formatea la respuesta como un objeto JSON con "observations" (arreglo de cadenas) y "recommendations" (arreglo de cadenas).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: language === 'en'
        ? "You are an expert Data Analyst and Logistics Consultant. You provide deep, actionable insights based on operational data."
        : "Eres un experto Analista de Datos y Consultor Logístico. Proporcionas perspectivas profundas y accionables basadas en datos operativos."
    }
  });
  return JSON.parse(response.text || '{"observations": [], "recommendations": []}');
}

export async function getCFOConsultation(financialData: any, query: string, language: 'en' | 'es') {
  const prompt = language === 'en'
    ? `As a Virtual CFO, analyze these financials: ${JSON.stringify(financialData)}. User Question: ${query}. 
       Provide a strategic analysis, identifying risks, opportunities, and specific calls to action. 
       Use a professional, high-level executive tone.`
    : `Como CFO Virtual, analiza estas finanzas: ${JSON.stringify(financialData)}. Pregunta del Usuario: ${query}. 
       Proporciona un análisis estratégico, identificando riesgos, oportunidades y llamadas a la acción específicas. 
       Usa un tono ejecutivo profesional de alto nivel.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: language === 'en'
        ? "You are a world-class Virtual CFO and Financial Strategist for a global logistics company. You provide data-driven advice, identify financial risks, and suggest optimizations for profitability."
        : "Eres un CFO Virtual y Estratega Financiero de clase mundial para una empresa de logística global. Proporcionas consejos basados en datos, identificas riesgos financieros y sugieres optimizaciones para la rentabilidad."
    }
  });
  return response.text;
}

export async function getAIGraphCreation(prompt: string, language: 'en' | 'es') {
  const systemInstruction = language === 'en'
    ? "You are an AI Graph Creator. Based on the user's request, identify the best data variable, graph type, and title. Return a JSON object with 'title', 'type' (bar, line, area, pie), 'dataKey' (revenue, cost, profit, pallets, occupancy, accuracy, lines), and 'color' (hex code). If the user specifies dates, locations, or customers, include them in the title."
    : "Eres un Creador de Gráficas por IA. Basado en la solicitud del usuario, identifica la mejor variable de datos, tipo de gráfica y título. Devuelve un objeto JSON con 'title', 'type' (bar, line, area, pie), 'dataKey' (revenue, cost, profit, pallets, occupancy, accuracy, lines) y 'color' (código hex). Si el usuario especifica fechas, ubicaciones o clientes, inclúyelos en el título.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction,
    }
  });
  return JSON.parse(response.text || '{}');
}
