import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Globe, 
  Truck, 
  Package, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Cpu,
  ArrowRight,
  Search,
  RefreshCw,
  Activity,
  LayoutDashboard,
  Box,
  X,
  Download
} from 'lucide-react';
import { getStrategicInsight, getStrategicSimulation, getComplianceAuditReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface StrategicResearchProps {
  lang: 'en' | 'es';
  market: 'USA' | 'MEXICO';
  setActiveTab: (tab: string) => void;
  addNotification: (message: string, type?: 'operational' | 'alert' | 'success' | 'info') => void;
}

export const StrategicResearch: React.FC<StrategicResearchProps> = ({ lang, market, setActiveTab, addNotification }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [complianceStatus, setComplianceStatus] = useState<'validating' | 'ready' | 'idle'>('idle');
  const [showComplianceCert, setShowComplianceCert] = useState(false);
  const [showSimResult, setShowSimResult] = useState(false);
  const [showAuditResult, setShowAuditResult] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [simCounter, setSimCounter] = useState(0);
  const [simulationData, setSimulationData] = useState<{
    throughput: number;
    leadTime: number;
    accuracy: number;
    advice: string;
  } | null>(null);

  const [auditData, setAuditData] = useState<{
    auditId: string;
    items: { label: string; status: 'Passed' | 'Warning' | 'Failed'; score: string; required: boolean }[];
    alert: { title: string; details: string };
  } | null>(null);

  const [activeTool, setActiveTool] = useState<'compliance' | 'simulator' | 'audit'>('compliance');
  const [marketPulse, setMarketPulse] = useState({
    nearshoring: { 
      level: 'High', 
      advice: market === 'USA' ? 'Focus on Onshoring/Reshoring strategy.' : 'Focus on Monterrey/Bajio expansion.' 
    },
    regulatory: { 
      level: 'Moderate', 
      advice: market === 'USA' ? 'Monitor FMCSA updates for ELD compliance.' : 'Monitor SAT updates for Carta Porte v3.1.' 
    },
    tech: { 
      level: 'Accelerating', 
      advice: market === 'USA' ? 'Invest in automated sorting systems.' : 'Invest in AI-driven slotting tools.' 
    }
  });

  // Update market pulse when language or market changes to ensure correct default advice
  useEffect(() => {
    setMarketPulse({
      nearshoring: { 
        level: 'High', 
        advice: market === 'USA' ? (lang === 'en' ? 'Focus on Onshoring/Reshoring strategy.' : 'Enfoque en estrategia de Onshoring/Reshoring.') : (lang === 'en' ? 'Focus on Monterrey/Bajio expansion.' : 'Enfoque en expansión en Monterrey/Bajío.')
      },
      regulatory: { 
        level: 'Moderate', 
        advice: market === 'USA' ? (lang === 'en' ? 'Monitor FMCSA updates for ELD compliance.' : 'Monitorear actualizaciones de FMCSA para cumplimiento de ELD.') : (lang === 'en' ? 'Monitor SAT updates for Carta Porte v3.1.' : 'Monitorear actualizaciones del SAT para Carta Porte v3.1.')
      },
      tech: { 
        level: 'Accelerating', 
        advice: market === 'USA' ? (lang === 'en' ? 'Invest in automated sorting systems.' : 'Invertir en sistemas de clasificación automatizados.') : (lang === 'en' ? 'Invest in AI-driven slotting tools.' : 'Invertir en herramientas de slotting impulsadas por IA.')
      }
    });
  }, [lang, market]);

  const t = {
    title: lang === 'en' ? 'Strategic Logistics Hub' : 'Hub de Logística Estratégica',
    subtitle: lang === 'en' ? 'Advanced tools for compliance, simulation, and operational growth' : 'Herramientas avanzadas para cumplimiento, simulación y crecimiento operativo',
    compliance: market === 'USA' ? (lang === 'en' ? 'US Compliance' : 'Cumplimiento EUA') : (lang === 'en' ? 'Mexico Compliance' : 'Cumplimiento Mexicano'),
    complianceButton: market === 'USA' ? (lang === 'en' ? 'DOT/FMCSA Ready' : 'DOT/FMCSA Listo') : (lang === 'en' ? 'CFDI 4.0 Ready' : 'CFDI 4.0 Listo'),
    cartaPorteButton: market === 'USA' ? (lang === 'en' ? 'Bill of Lading v3.0' : 'Conocimiento de Embarque v3.0') : (lang === 'en' ? 'Carta Porte v3.0' : 'Carta Porte v3.0'),
    automotive: lang === 'en' ? 'Automotive Tools' : 'Herramientas Automotrices',
    aiAdvisor: lang === 'en' ? 'AI Strategic Advisor' : 'Asesor Estratégico IA',
    generateInsight: lang === 'en' ? 'Generate Strategic Insight' : 'Generar Perspectiva Estratégica',
    growthProjections: lang === 'en' ? 'Growth Projections' : 'Proyecciones de Crecimiento',
    auditButton: lang === 'en' ? 'Run Full Audit' : 'Ejecutar Auditoría Completa',
    simulationButton: lang === 'en' ? 'Start Simulation' : 'Iniciar Simulación',
    auditTitle: lang === 'en' ? 'Compliance Auditor' : 'Auditor de Cumplimiento',
    auditDesc: market === 'USA' 
      ? (lang === 'en' ? 'Automated audit of all DOT/FMCSA and Bill of Lading documents against US regulations.' : 'Auditoría automatizada de todos los documentos DOT/FMCSA y Bill of Lading contra las regulaciones de EUA.')
      : (lang === 'en' ? 'Automated audit of all CFDI 4.0 and Carta Porte documents against SAT regulations.' : 'Auditoría automatizada de todos los documentos CFDI 4.0 y Carta Porte contra las regulaciones del SAT.'),
    simTitle: lang === 'en' ? 'Operational Simulator' : 'Simulador Operativo',
    simDesc: lang === 'en' 
      ? 'Run "What-If" scenarios for your assembly lines and warehouse layout using ML to predict bottlenecks.' 
      : 'Ejecuta escenarios "Qué pasaría si" para tus líneas de ensamble y diseño de almacén usando ML para predecir cuellos de botella.'
  };

  const generateStrategicInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const region = market === 'USA' ? 'USA' : 'Mexico';
      const complianceTerm = market === 'USA' ? 'DOT/FMCSA' : 'CFDI 4.0';
      const query = lang === 'en' 
        ? `Analyze current automotive logistics in ${region}. 
           Provide a strategic growth projection for a warehouse in ${region}.
           Focus on assembly lines and ${complianceTerm} compliance benefits.
           Also, provide 3 market pulse metrics: ${market === 'USA' ? 'Onshoring' : 'Nearshoring'} Demand, Regulatory Pressure, and Tech Adoption.
           Format the pulse metrics at the end of your response as a JSON block: 
           {"nearshoring": {"level": "...", "advice": "..."}, "regulatory": {"level": "...", "advice": "..."}, "tech": {"level": "...", "advice": "..."}}`
        : `Analiza la logística automotriz actual en ${region}.
           Proporciona una proyección de crecimiento estratégico para un almacén en ${region}.
           Enfócate en las líneas de ensamble y los beneficios del cumplimiento de ${complianceTerm}.
           Además, proporciona 3 métricas de pulso de mercado: Demanda de ${market === 'USA' ? 'Onshoring' : 'Nearshoring'}, Presión Regulatoria y Adopción Tecnológica.
           Formatea las métricas de pulso al final de tu respuesta como un bloque JSON:
           {"nearshoring": {"level": "...", "advice": "..."}, "regulatory": {"level": "...", "advice": "..."}, "tech": {"level": "...", "advice": "..."}}`;
      
      const insight = await getStrategicInsight(query, lang);
      
      // Extract JSON if present
      const jsonMatch = insight?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const pulseData = JSON.parse(jsonMatch[0]);
          setMarketPulse(pulseData);
          setAiInsight(insight?.replace(jsonMatch[0], '').trim() || '');
        } catch (e) {
          setAiInsight(insight || '');
        }
      } else {
        setAiInsight(insight || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const validateCompliance = async () => {
    setComplianceStatus('validating');
    try {
      // Simulate a deep check
      await new Promise(resolve => setTimeout(resolve, 2000));
      setComplianceStatus('ready');
      setShowComplianceCert(true);
    } catch (error) {
      console.error(error);
      setComplianceStatus('idle');
    }
  };

  const startSimulation = async () => {
    setIsSimulating(true);
    try {
      const data = await getStrategicSimulation(market, lang);
      setSimulationData(data);
      setSimCounter(prev => prev + 1);
      setShowSimResult(true);
    } catch (error) {
      console.error(error);
      addNotification(lang === 'en' ? 'Error running simulation.' : 'Error al ejecutar la simulación.', 'alert');
    } finally {
      setIsSimulating(false);
    }
  };

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const data = await getComplianceAuditReport(market, lang);
      setAuditData(data);
      setShowAuditResult(true);
    } catch (error) {
      console.error(error);
      addNotification(lang === 'en' ? 'Error running audit.' : 'Error al ejecutar la auditoría.', 'alert');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyOptimization = () => {
    addNotification(lang === 'en' ? 'Optimization parameters applied to WMS production environment.' : 'Parámetros de optimización aplicados al entorno de producción del WMS.', 'success');
    setShowSimResult(false);
  };

  const handleDownloadAudit = () => {
    addNotification(lang === 'en' ? 'Downloading Compliance Audit Report (PDF)...' : 'Descargando Informe de Auditoría de Cumplimiento (PDF)...', 'operational');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{t.title}</h2>
          <p className="text-white/40 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={validateCompliance}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all border ${
              complianceStatus === 'ready' 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
              : 'bg-white/5 border-white/10 text-white/60 hover:border-porteo-orange/50'
            }`}
          >
            {complianceStatus === 'validating' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-widest">
              {complianceStatus === 'validating' ? (lang === 'en' ? 'Validating...' : 'Validando...') : t.complianceButton}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('tpl')}
            className="px-4 py-2 bg-porteo-orange/10 border border-porteo-orange/20 rounded-xl flex items-center gap-2 hover:border-porteo-orange/50 transition-all group"
          >
            <Truck className="w-4 h-4 text-porteo-orange group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-porteo-orange uppercase tracking-widest">{t.cartaPorteButton}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Toolkit Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-[40px] border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Zap className="w-6 h-6 text-porteo-orange" />
                {lang === 'en' ? 'Operational Toolkit' : 'Kit de Herramientas Operativas'}
              </h3>
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                {(['compliance', 'simulator', 'audit'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTool(tab)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTool === tab ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTool === 'compliance' && (
                <>
                  {/* Tool 1: Inventory Quick Access */}
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:border-porteo-orange/30 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-porteo-orange/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6 text-porteo-orange" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{lang === 'en' ? 'Automotive SKU Intelligence' : 'Inteligencia de SKU Automotriz'}</h4>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {lang === 'en' 
                        ? 'Access specialized inventory with OEM cross-referencing and vehicle compatibility tools.' 
                        : 'Accede al inventario especializado con cruce de referencias OEM y compatibilidad vehicular.'}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-porteo-orange text-xs font-bold">
                      {lang === 'en' ? 'Open Inventory' : 'Abrir Inventario'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Tool 2: Assembly Line Manager */}
                  <button 
                    onClick={() => setActiveTab('assembly')}
                    className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:border-porteo-orange/30 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-porteo-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Cpu className="w-6 h-6 text-porteo-blue" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{lang === 'en' ? 'Assembly & Kitting BOM' : 'BOM de Ensamble y Kitting'}</h4>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {lang === 'en' 
                        ? 'Manage production lines and Bill of Materials for automotive part kits.' 
                        : 'Gestiona líneas de producción y listas de materiales para kits de autopartes.'}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-porteo-blue text-xs font-bold">
                      {lang === 'en' ? 'Manage Lines' : 'Gestionar Líneas'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Tool 3: Patio & Yard Control */}
                  <button 
                    onClick={() => setActiveTab('patio')}
                    className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:border-porteo-orange/30 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Truck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{lang === 'en' ? 'Yard & Patio Visibility' : 'Visibilidad de Patio y Patio'}</h4>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {lang === 'en' 
                        ? 'Real-time monitoring of 2,500+ parking slots and staging zones.' 
                        : 'Monitoreo en tiempo real de más de 2,500 cajones y zonas de staging.'}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-emerald-500 text-xs font-bold">
                      {lang === 'en' ? 'View Yard' : 'Ver Patio'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Tool 4: 3PL Workflow & Carta Porte */}
                  <button 
                    onClick={() => setActiveTab('tpl')}
                    className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:border-porteo-orange/30 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{lang === 'en' ? '3PL Compliance Engine' : 'Motor de Cumplimiento 3PL'}</h4>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {lang === 'en' 
                        ? 'Generate Bill of Lading v3.0 and manage end-to-end logistics documentation.' 
                        : 'Genera Carta Porte v3.0 y gestiona la documentación logística de extremo a extremo.'}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-white text-xs font-bold">
                      {lang === 'en' ? 'Documentation' : 'Documentación'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </>
              )}

              {activeTool === 'simulator' && (
                <div className="col-span-2 p-12 bg-white/5 rounded-[40px] border border-white/10 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-porteo-orange/10 rounded-3xl flex items-center justify-center">
                    {isSimulating ? <RefreshCw className="w-10 h-10 text-porteo-orange animate-spin" /> : <Cpu className="w-10 h-10 text-porteo-orange" />}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">{t.simTitle}</h4>
                    <p className="text-white/40 max-w-md mx-auto">
                      {t.simDesc}
                    </p>
                  </div>
                  <button 
                    onClick={startSimulation}
                    disabled={isSimulating}
                    className="px-8 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all disabled:opacity-50"
                  >
                    {isSimulating ? (lang === 'en' ? 'Running ML Models...' : 'Ejecutando Modelos ML...') : t.simulationButton}
                  </button>
                </div>
              )}

              {activeTool === 'audit' && (
                <div className="col-span-2 p-12 bg-white/5 rounded-[40px] border border-white/10 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-porteo-blue/10 rounded-3xl flex items-center justify-center">
                    {isAuditing ? <RefreshCw className="w-10 h-10 text-porteo-blue animate-spin" /> : <ShieldCheck className="w-10 h-10 text-porteo-blue" />}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">{t.auditTitle}</h4>
                    <p className="text-white/40 max-w-md mx-auto">
                      {t.auditDesc}
                    </p>
                  </div>
                  <button 
                    onClick={runAudit}
                    disabled={isAuditing}
                    className="px-8 py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/90 transition-all disabled:opacity-50"
                  >
                    {isAuditing ? (lang === 'en' ? 'Auditing Documents...' : 'Auditando Documentos...') : t.auditButton}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Strategic Advisor Sidebar */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-porteo-orange/10 to-transparent">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-porteo-orange" />
              {t.growthProjections}
            </h3>
            
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'Current Efficiency' : 'Eficiencia Actual'}</span>
                  <span className="text-sm font-bold text-emerald-500">+12.4%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    className="bg-emerald-500 h-full" 
                  />
                </div>
              </div>

              <button 
                onClick={generateStrategicInsight}
                disabled={isLoadingInsight}
                className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20 disabled:opacity-50"
              >
                {isLoadingInsight ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                {t.generateInsight}
              </button>

              <AnimatePresence mode="wait">
                {aiInsight && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 bg-porteo-blue/10 border border-porteo-blue/20 rounded-3xl"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 text-porteo-blue" />
                      <span className="text-[10px] font-bold text-porteo-blue uppercase tracking-widest">{t.aiAdvisor}</span>
                    </div>
                    <div className="text-xs text-white/70 leading-relaxed prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown>{aiInsight}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
              <Activity className="w-5 h-5 text-porteo-orange" />
              {lang === 'en' ? 'Market Pulse' : 'Pulso del Mercado'}
            </h3>
            <div className="space-y-4">
              {[
                { label: lang === 'en' ? 'Onshoring Demand' : 'Demanda de Nearshoring', key: 'nearshoring', color: 'text-emerald-500' },
                { label: lang === 'en' ? 'Regulatory Pressure' : 'Presión Regulatoria', key: 'regulatory', color: 'text-porteo-orange' },
                { label: lang === 'en' ? 'Tech Adoption' : 'Adopción Tecnológica', key: 'tech', color: 'text-porteo-blue' }
              ].map((item) => (
                <div key={item.key} className="group relative">
                  <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-white/5 transition-all cursor-help border border-transparent hover:border-white/10">
                    <span className="text-sm text-white/60">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{(marketPulse as any)[item.key].level}</span>
                  </div>
                  {/* Advice Tooltip */}
                  <div className="absolute left-0 bottom-full mb-2 w-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                    <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl">
                      <p className="text-[10px] font-bold text-porteo-orange uppercase tracking-widest mb-1">AI Advice</p>
                      <p className="text-xs text-white/80">{(marketPulse as any)[item.key].advice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Certificate Modal */}
      <AnimatePresence>
        {showComplianceCert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowComplianceCert(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-emerald-500/30 rounded-[40px] p-10 shadow-2xl text-center"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{lang === 'en' ? 'Compliance Certified' : 'Cumplimiento Certificado'}</h3>
              <p className="text-white/40 mb-8">
                {lang === 'en' 
                  ? 'Your system is fully compliant with DOT, FMCSA, and IRS regulations for the 2026 fiscal year.' 
                  : 'Su sistema cumple totalmente con las regulaciones de CFDI 4.0 y Carta Porte v3.0 para el año fiscal 2026.'}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Tax ID Status' : 'RFC Status'}</p>
                  <p className="text-sm font-bold text-emerald-500">VALID</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'FMCSA Sync' : 'SAT Sync'}</p>
                  <p className="text-sm font-bold text-emerald-500">ACTIVE</p>
                </div>
              </div>
              <button 
                onClick={() => setShowComplianceCert(false)}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all"
              >
                {lang === 'en' ? 'Close' : 'Cerrar'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Simulation Result Modal */}
      <AnimatePresence>
        {showSimResult && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowSimResult(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0A0A] border border-porteo-orange/30 rounded-[40px] p-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-porteo-orange/20 rounded-xl flex items-center justify-center">
                    <Cpu className="text-porteo-orange w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{lang === 'en' ? 'ML Simulation Results' : 'Resultados de Simulación ML'}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Scenario: Peak Demand Q3 2026</p>
                  </div>
                </div>
                <button onClick={() => setShowSimResult(false)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Throughput</p>
                  <p className="text-lg font-bold text-emerald-500">+{simulationData?.throughput || (15 + (simCounter % 5))}%</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Lead Time</p>
                  <p className="text-lg font-bold text-emerald-500">-{simulationData?.leadTime || (10 + (simCounter % 3))}m</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Accuracy</p>
                  <p className="text-lg font-bold text-porteo-blue">{simulationData?.accuracy || (99.7 + (simCounter % 3) / 10)}%</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-porteo-orange" />
                    AI Optimization Advice
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {simulationData?.advice || (lang === 'en' 
                      ? 'Machine Learning models suggest reconfiguring Assembly Line 4 to handle increased kitting volume. Predicted bottleneck at Dock 7 can be mitigated by shifting 15% of inbound traffic to Dock 12.' 
                      : 'Los modelos de Machine Learning sugieren reconfigurar la Línea de Ensamble 4 para manejar el aumento del volumen de kitting. El cuello de botella predicho en el Muelle 7 puede mitigarse desplazando el 15% del tráfico entrante al Muelle 12.')}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleApplyOptimization}
                className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all"
              >
                {lang === 'en' ? 'Apply Optimization' : 'Aplicar Optimización'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Result Modal */}
      <AnimatePresence>
        {showAuditResult && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowAuditResult(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0A0A] border border-porteo-blue/30 rounded-[40px] p-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-porteo-blue/20 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="text-porteo-blue w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{lang === 'en' ? 'Compliance Audit Report' : 'Informe de Auditoría de Cumplimiento'}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Audit ID: {auditData?.auditId || 'AUD-2026-0042'}</p>
                  </div>
                </div>
                <button onClick={() => setShowAuditResult(false)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {(auditData?.items || [
                  { label: lang === 'en' ? 'DOT Documentation' : 'Documentación SAT', status: 'Passed', score: '100%', required: true },
                  { label: lang === 'en' ? 'Bill of Lading Integrity' : 'Integridad de Carta Porte', status: 'Passed', score: '100%', required: true },
                  { label: lang === 'en' ? 'FMCSA Safety Sync' : 'Sincronización de Seguridad', status: 'Warning', score: '85%', required: false },
                  { label: lang === 'en' ? 'Tax Compliance' : 'Cumplimiento Fiscal', status: 'Passed', score: '100%', required: true }
                ]).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-sm text-white/80">{item.label}</span>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold ${item.status === 'Passed' ? 'text-emerald-500 bg-emerald-500/10' : item.status === 'Warning' ? 'text-porteo-orange bg-porteo-orange/10' : 'text-red-500 bg-red-500/10'} px-2 py-1 rounded uppercase`}>
                        {item.status}
                      </span>
                      <span className="text-sm font-bold text-white">{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-porteo-orange/10 border border-porteo-orange/20 rounded-2xl mb-8">
                <p className="text-xs text-porteo-orange font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {auditData?.alert?.title || (lang === 'en' ? 'Incomplete Platform Data' : 'Datos de Plataforma Incompletos')}
                </p>
                <p className="text-[10px] text-porteo-orange/60 mt-1">
                  {auditData?.alert?.details || (lang === 'en' 
                    ? 'Audit detected missing ELD logs for 3 shipments. Please upload required documents to achieve 100% compliance.' 
                    : 'La auditoría detectó registros ELD faltantes para 3 envíos. Por favor, cargue los documentos requeridos para lograr el 100% de cumplimiento.')}
                </p>
              </div>

              <button 
                onClick={handleDownloadAudit}
                className="w-full py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/90 transition-all"
              >
                {lang === 'en' ? 'Download Full Report' : 'Descargar Informe Completo'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
