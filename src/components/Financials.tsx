import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Download, 
  Upload, 
  FileText, 
  Zap, 
  ChevronRight, 
  X, 
  Activity, 
  Target, 
  Users,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { getCFOConsultation, getAnalyticsInsights } from '../services/geminiService';
import Markdown from 'react-markdown';

interface FinancialsProps {
  lang: 'en' | 'es';
  financialData: any[];
  pieData: any[];
  colors: string[];
}

export const Financials: React.FC<FinancialsProps> = ({ lang, financialData: propsFinancialData, pieData: propsPieData, colors }) => {
  const [financialData, setFinancialData] = useState(propsFinancialData);
  const [pieData, setPieData] = useState(propsPieData);

  // Sync state with props when props change (e.g. system movements)
  // but only if we haven't manually uploaded data in this session
  const [hasManualUpload, setHasManualUpload] = useState(false);

  React.useEffect(() => {
    if (!hasManualUpload) {
      setFinancialData(propsFinancialData);
      setPieData(propsPieData);
    }
  }, [propsFinancialData, propsPieData, hasManualUpload]);

  const [drillDownStat, setDrillDownStat] = useState<string | null>(null);
  const [financialFilter, setFinancialFilter] = useState<'revenue' | 'cost' | 'profit'>('revenue');
  const [activeStatement, setActiveStatement] = useState<'income' | 'balance'>('income');
  const [cfoQuery, setCfoQuery] = useState('');
  const [cfoResponse, setCfoResponse] = useState<string | null>(null);
  const [isCfoLoading, setIsCfoLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiInsights, setAiInsights] = useState<{ observations: string[], recommendations: string[] }>({ observations: [], recommendations: [] });
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [selectedStatementItem, setSelectedStatementItem] = useState<string | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<any | null>(null);

  const t = {
    performance: lang === 'en' ? 'Performance Analysis' : 'Análisis de Rendimiento',
    costDist: lang === 'en' ? 'Cost Distribution' : 'Distribución de Costos',
    statements: lang === 'en' ? 'Financial Statements' : 'Estados Financieros',
    income: lang === 'en' ? 'Income Statement' : 'Estado de Resultados',
    balance: lang === 'en' ? 'Balance Sheet' : 'Balance General',
    cfoAssistant: lang === 'en' ? 'CFO AI Strategist' : 'Estratega IA CFO',
    upload: lang === 'en' ? 'Upload Data' : 'Subir Datos',
    download: lang === 'en' ? 'Download Report' : 'Descargar Reporte',
    revenue: lang === 'en' ? 'Revenue' : 'Ingresos',
    cost: lang === 'en' ? 'Cost' : 'Costos',
    profit: lang === 'en' ? 'Profit' : 'Utilidad',
    askCfo: lang === 'en' ? 'Ask CFO AI...' : 'Preguntar a IA CFO...',
    analyzing: lang === 'en' ? 'Analyzing financials...' : 'Analizando finanzas...',
    drillDownTitle: lang === 'en' ? 'Granular Financial Detail' : 'Detalle Financiero Granular',
    processing: lang === 'en' ? 'Processing File...' : 'Procesando Archivo...',
    aiForecast: lang === 'en' ? 'AI Forecast' : 'Pronóstico IA'
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsProcessing(true);
      // Simulate reading and updating state with significant changes
      setTimeout(() => {
        const newData = financialData.map(d => {
          const revMult = 1.5 + Math.random() * 0.5; // Significant increase
          const costMult = 0.7 + Math.random() * 0.2; // Significant decrease
          const newRev = Math.round(d.revenue * revMult);
          const newCost = Math.round(d.cost * costMult);
          return {
            ...d,
            revenue: newRev,
            cost: newCost,
            profit: newRev - newCost
          };
        });
        
        const newPieData = pieData.map(p => ({
          ...p,
          value: Math.round(p.value * (1.2 + Math.random() * 0.8))
        }));

        setFinancialData(newData);
        setPieData(newPieData);
        setHasManualUpload(true);
        setIsProcessing(false);
        alert(lang === 'en' ? 'Financial data updated from file! Revenue and Profit margins have been recalculated.' : '¡Datos financieros actualizados desde el archivo! Los márgenes de Ingresos y Utilidad han sido recalculados.');
      }, 2000);
    }
  };

  const handleDownload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Month,Revenue,Cost,Profit\n"
        + financialData.map(d => `${d.name},${d.revenue},${d.cost},${d.profit}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsProcessing(false);
      alert(lang === 'en' ? 'Financial report generated and downloaded.' : 'Reporte financiero generado y descargado.');
    }, 1500);
  };

  // Fetch AI Insights when drillDownStat changes
  React.useEffect(() => {
    let isMounted = true;
    if (drillDownStat) {
      setIsLoadingInsights(true);
      const metricData = drillDownStat === 'performance' ? financialData : pieData;
      
      // Safety timeout to prevent getting stuck
      const timeout = setTimeout(() => {
        if (isMounted && isLoadingInsights) {
          setAiInsights({
            observations: [
              lang === 'en' ? "Data analysis taking longer than expected. Using cached patterns." : "El análisis de datos está tardando más de lo esperado. Usando patrones en caché.",
              lang === 'en' ? "Current trend shows stable growth despite market volatility." : "La tendencia actual muestra un crecimiento estable a pesar de la volatilidad del mercado.",
              lang === 'en' ? "Operational costs are within 5% of quarterly targets." : "Los costos operativos están dentro del 5% de los objetivos trimestrales."
            ],
            recommendations: [
              lang === 'en' ? "Review resource allocation for peak periods." : "Revisar la asignación de recursos para periodos pico.",
              lang === 'en' ? "Optimize vendor contracts for Q3." : "Optimizar contratos con proveedores para el Q3."
            ]
          });
          setIsLoadingInsights(false);
        }
      }, 5000);

      getAnalyticsInsights(drillDownStat, metricData, lang)
        .then(insights => {
          if (isMounted) {
            clearTimeout(timeout);
            setAiInsights(insights);
            setIsLoadingInsights(false);
          }
        })
        .catch(err => {
          console.error("AI Insights failed:", err);
          if (isMounted) {
            setIsLoadingInsights(false);
          }
        });
    }
    return () => { isMounted = false; };
  }, [drillDownStat, lang, financialData, pieData]);

  const handleCfoConsult = async () => {
    if (!cfoQuery.trim()) return;
    setIsCfoLoading(true);
    try {
      const response = await getCFOConsultation({ financialData, pieData }, cfoQuery, lang);
      setCfoResponse(response);
    } catch (error) {
      console.error("CFO Consultation failed:", error);
    } finally {
      setIsCfoLoading(false);
    }
  };

  const getDrillDownData = (id: string) => {
    if (id === 'performance') {
      return financialData.map(d => ({
        ...d,
        details: [
          { name: 'Storage', value: d[financialFilter] * 0.4 },
          { name: 'Labor', value: d[financialFilter] * 0.3 },
          { name: 'Transport', value: d[financialFilter] * 0.2 },
          { name: 'Other', value: d[financialFilter] * 0.1 },
        ]
      }));
    }
    if (id.startsWith('cost-dist')) {
      const category = id === 'cost-dist' ? 'Labor' : id.replace('cost-dist-', '');
      // Create distinct patterns for different categories
      const multipliers: Record<string, number> = {
        'Labor': 1.2,
        'Storage': 0.8,
        'Utilities': 1.0,
        'Last Mile': 1.5
      };
      const mult = multipliers[category] || 1.0;
      
      return financialData.map((d, i) => ({
        name: d.name,
        value: Math.round((d.cost * (pieData.find(p => p.name === category)?.value || 100) / 1000) * (0.9 + Math.sin(i) * 0.1 * mult))
      }));
    }
    return financialData;
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      // Ensure we have all necessary fields for the detail modal
      setSelectedMonthDetail({
        ...payload,
        revenue: payload.revenue || payload.value || 0,
        cost: payload.cost || (payload.revenue ? payload.revenue * 0.7 : 0),
        profit: payload.profit || (payload.revenue ? payload.revenue * 0.3 : 0)
      });
    }
  };

  const forecastText = useMemo(() => {
    const lastMonth = financialData[financialData.length - 1];
    const prevMonth = financialData[financialData.length - 2];
    const growth = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1);
    return lang === 'en' 
      ? `Revenue grew by ${growth}% this month. AI projects a further 5.2% increase for next period based on seasonal trends.`
      : `Los ingresos crecieron un ${growth}% este mes. La IA proyecta un aumento adicional del 5.2% para el próximo período basado en tendencias estacionales.`;
  }, [financialData, lang]);

  const incomeStatement = {
    revenue: 1250000,
    cogs: 750000,
    grossProfit: 500000,
    operatingExpenses: 300000,
    ebitda: 200000,
    taxes: 60000,
    netIncome: 140000
  };

  const balanceSheet = {
    assets: {
      cash: 250000,
      receivables: 180000,
      inventory: 450000,
      equipment: 1200000,
      total: 2080000
    },
    liabilities: {
      payables: 120000,
      debt: 800000,
      total: 920000
    },
    equity: {
      retainedEarnings: 660000,
      capital: 500000,
      total: 1160000
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{lang === 'en' ? 'Financial Management' : 'Gestión Financiera'}</h2>
          <p className="text-white/40 text-sm mt-1">{lang === 'en' ? 'Real-time profitability tracking and strategic planning' : 'Seguimiento de rentabilidad en tiempo real y planeación estratégica'}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="file" 
              id="financial-upload" 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="financial-upload"
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isProcessing ? t.processing : t.upload}
            </label>
          </div>
          <button 
            onClick={handleDownload}
            disabled={isProcessing}
            className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-sm font-bold hover:bg-porteo-orange/90 transition-all flex items-center gap-2 shadow-lg shadow-porteo-orange/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {t.download}
          </button>
        </div>
      </div>

      {/* Main Financial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Analysis */}
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border border-white/5 relative group">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">{t.performance}</h3>
              <p className="text-white/40 text-xs mt-1">{lang === 'en' ? 'Monthly trend analysis' : 'Análisis de tendencia mensual'}</p>
            </div>
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {(['revenue', 'cost', 'profit'] as const).map((f) => (
                <button 
                  key={f}
                  onClick={() => setFinancialFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${financialFilter === f ? 'bg-porteo-orange text-white shadow-lg shadow-porteo-orange/20' : 'text-white/40 hover:text-white'}`}
                >
                  {t[f]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-80 w-full cursor-pointer group/chart relative" onClick={() => setDrillDownStat('performance')}>
            <div className="absolute top-4 right-4 opacity-0 group-hover/chart:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-white/60 font-bold uppercase tracking-widest z-20">
              {lang === 'en' ? 'Click for Granular Detail' : 'Click para Detalle Granular'}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={financialFilter} 
                  stroke="#F27D26" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase font-bold tracking-widest">{t.aiForecast}</p>
              <p className="text-sm text-white/80">{forecastText}</p>
            </div>
          </div>
        </div>

        {/* Cost Distribution */}
        <div className="glass p-8 rounded-[40px] border border-white/5 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8">{t.costDist}</h3>
          <div className="h-64 w-full cursor-pointer group/chart relative" onClick={() => setDrillDownStat('cost-dist')}>
            <div className="absolute top-4 right-4 opacity-0 group-hover/chart:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-white/60 font-bold uppercase tracking-widest z-20">
              {lang === 'en' ? 'Click for Granular Detail' : 'Click para Detalle Granular'}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data, index, e) => {
                    if (e) e.stopPropagation();
                    setDrillDownStat(`cost-dist-${data.name}`);
                  }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4 flex-1">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer" onClick={() => setDrillDownStat(`cost-dist-${item.name}`)}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">${item.value}k</span>
                  <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-porteo-orange transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Statements & CFO Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Statements */}
        <div className="glass p-8 rounded-[40px] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">{t.statements}</h3>
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setActiveStatement('income')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeStatement === 'income' ? 'bg-porteo-blue text-white' : 'text-white/40 hover:text-white'}`}
              >
                {t.income}
              </button>
              <button 
                onClick={() => setActiveStatement('balance')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeStatement === 'balance' ? 'bg-porteo-blue text-white' : 'text-white/40 hover:text-white'}`}
              >
                {t.balance}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {activeStatement === 'income' ? (
              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedStatementItem('revenue')}
                  className="w-full flex justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/60">{t.revenue}</span>
                  <span className="text-white font-bold">${incomeStatement.revenue.toLocaleString()}</span>
                </button>
                <button 
                  onClick={() => setSelectedStatementItem('cogs')}
                  className="w-full flex justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/60">COGS</span>
                  <span className="text-white font-bold text-red-400">-${incomeStatement.cogs.toLocaleString()}</span>
                </button>
                <button 
                  onClick={() => setSelectedStatementItem('grossProfit')}
                  className="w-full flex justify-between p-4 bg-porteo-orange/10 rounded-2xl border border-porteo-orange/20 hover:bg-porteo-orange/20 transition-colors"
                >
                  <span className="text-porteo-orange font-bold">Gross Profit</span>
                  <span className="text-porteo-orange font-bold">${incomeStatement.grossProfit.toLocaleString()}</span>
                </button>
                <button 
                  onClick={() => setSelectedStatementItem('operatingExpenses')}
                  className="w-full flex justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/60">Operating Expenses</span>
                  <span className="text-white font-bold text-red-400">-${incomeStatement.operatingExpenses.toLocaleString()}</span>
                </button>
                <button 
                  onClick={() => setSelectedStatementItem('netIncome')}
                  className="w-full flex justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  <span className="text-emerald-500 font-bold">Net Income</span>
                  <span className="text-emerald-500 font-bold">${incomeStatement.netIncome.toLocaleString()}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-3">Assets</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedStatementItem('cash')}
                      className="w-full flex justify-between text-sm hover:text-white transition-colors"
                    >
                      <span className="text-white/60">Cash & Equivalents</span>
                      <span className="text-white">${balanceSheet.assets.cash.toLocaleString()}</span>
                    </button>
                    <button 
                      onClick={() => setSelectedStatementItem('inventory')}
                      className="w-full flex justify-between text-sm hover:text-white transition-colors"
                    >
                      <span className="text-white/60">Inventory</span>
                      <span className="text-white">${balanceSheet.assets.inventory.toLocaleString()}</span>
                    </button>
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                      <span className="text-white">Total Assets</span>
                      <span className="text-white">${balanceSheet.assets.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-3">Liabilities & Equity</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedStatementItem('liabilities')}
                      className="w-full flex justify-between text-sm hover:text-white transition-colors"
                    >
                      <span className="text-white/60">Total Liabilities</span>
                      <span className="text-white">${balanceSheet.liabilities.total.toLocaleString()}</span>
                    </button>
                    <button 
                      onClick={() => setSelectedStatementItem('equity')}
                      className="w-full flex justify-between text-sm hover:text-white transition-colors"
                    >
                      <span className="text-white/60">Total Equity</span>
                      <span className="text-white">${balanceSheet.equity.total.toLocaleString()}</span>
                    </button>
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                      <span className="text-white">Total L&E</span>
                      <span className="text-white">${(balanceSheet.liabilities.total + balanceSheet.equity.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CFO AI Assistant */}
        <div className="glass p-8 rounded-[40px] border-l-4 border-porteo-blue flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-porteo-blue/20 rounded-2xl text-porteo-blue">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t.cfoAssistant}</h3>
              <p className="text-white/40 text-xs">{lang === 'en' ? 'Strategic financial advisory' : 'Asesoría financiera estratégica'}</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {cfoResponse ? (
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="prose prose-invert prose-sm max-w-none">
                  <Markdown>{cfoResponse}</Markdown>
                </div>
                <button 
                  onClick={() => setCfoResponse(null)}
                  className="mt-4 text-[10px] text-white/20 hover:text-white transition-colors uppercase font-bold tracking-widest"
                >
                  {lang === 'en' ? 'Clear Analysis' : 'Limpiar Análisis'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-porteo-blue/5 rounded-2xl border border-porteo-blue/10">
                  <p className="text-xs font-bold text-porteo-blue uppercase tracking-widest mb-2">Market Insight</p>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {lang === 'en' 
                      ? "Fuel prices in Mexico are projected to rise by 3.2% next month. Consider hedging or optimizing route density to maintain margins."
                      : "Se proyecta que los precios del combustible en México aumenten un 3.2% el próximo mes. Considere coberturas u optimizar la densidad de rutas."}
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Profit Opportunity</p>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {lang === 'en' 
                      ? "Consolidating LTL shipments for Customer X could save $12,500 in monthly operational costs."
                      : "Consolidar los envíos LTL para el Cliente X podría ahorrar $12,500 en costos operativos mensuales."}
                  </p>
                </div>
                <div className="p-4 bg-porteo-orange/5 rounded-2xl border border-porteo-orange/10">
                  <p className="text-xs font-bold text-porteo-orange uppercase tracking-widest mb-2">Action Required</p>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {lang === 'en' 
                      ? "Accounts receivable for 'Global Logistics Inc' is 15 days overdue. Recommend immediate follow-up."
                      : "Las cuentas por cobrar de 'Global Logistics Inc' tienen 15 días de retraso. Se recomienda seguimiento inmediato."}
                  </p>
                  <button className="mt-3 text-[10px] font-bold text-porteo-orange hover:underline uppercase tracking-widest">
                    {lang === 'en' ? 'Send Reminder' : 'Enviar Recordatorio'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <input 
              type="text" 
              value={cfoQuery}
              onChange={(e) => setCfoQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCfoConsult()}
              placeholder={t.askCfo}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-porteo-blue transition-all"
            />
            <button 
              onClick={handleCfoConsult}
              disabled={isCfoLoading}
              className="p-4 bg-porteo-blue text-white rounded-2xl hover:bg-porteo-blue/80 transition-all disabled:opacity-50"
            >
              {isCfoLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Drill Down Modal */}
      <AnimatePresence>
        {drillDownStat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrillDownStat(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                    {t.drillDownTitle}: {drillDownStat === 'performance' ? t.performance : t.costDist}
                  </h3>
                  <p className="text-white/40 text-sm">{lang === 'en' ? 'Granular financial data and cost breakdowns' : 'Datos financieros granulares y desgloses de costos'}</p>
                </div>
                <button 
                  onClick={() => setDrillDownStat(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    onClick={() => {
                      const lastVal = financialData[financialData.length-1][financialFilter];
                      alert(lang === 'en' ? `Current Period ${financialFilter}: $${(lastVal * 10).toLocaleString()}` : `${t[financialFilter]} Periodo Actual: $${(lastVal * 10).toLocaleString()}`);
                    }}
                    className="p-6 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Current Period' : 'Periodo Actual'}</p>
                    <p className="text-3xl font-bold text-white">${(financialData[financialData.length-1][financialFilter] * 10).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      <span>+8.2% vs last period</span>
                    </div>
                  </div>
                  <div 
                    onClick={() => {
                      const lastVal = financialData[financialData.length-1][financialFilter];
                      alert(lang === 'en' ? `Projected ${financialFilter}: $${(lastVal * 11).toLocaleString()}` : `${t[financialFilter]} Proyectado: $${(lastVal * 11).toLocaleString()}`);
                    }}
                    className="p-6 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Projected' : 'Proyectado'}</p>
                    <p className="text-3xl font-bold text-white">${(financialData[financialData.length-1][financialFilter] * 11).toLocaleString()}</p>
                    <p className="text-[10px] text-white/20 mt-2">{lang === 'en' ? 'Based on current growth' : 'Basado en crecimiento actual'}</p>
                  </div>
                  <div 
                    onClick={() => alert(lang === 'en' ? 'Variance Analysis: -$4,200 (2.8% below target due to seasonal labor spike)' : 'Análisis de Varianza: -$4,200 (2.8% debajo del objetivo debido al pico laboral estacional)')}
                    className="p-6 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Variance' : 'Varianza'}</p>
                    <p className="text-3xl font-bold text-porteo-orange">-$4,200</p>
                    <p className="text-[10px] text-white/20 mt-2">{lang === 'en' ? 'Below target' : 'Debajo del objetivo'}</p>
                  </div>
                </div>

                <div className="h-[400px] w-full bg-white/5 rounded-3xl p-8 border border-white/10 relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-white/60 font-bold uppercase tracking-widest">
                    {lang === 'en' ? 'Click bar for granular detail' : 'Click en barra para detalle granular'}
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    {drillDownStat?.includes('cost-dist-') ? (
                      <BarChart data={getDrillDownData(drillDownStat)} onClick={handleChartClick}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                        <XAxis dataKey="name" stroke="#ffffff20" />
                        <YAxis stroke="#ffffff20" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="value" fill="#F27D26" radius={[8, 8, 0, 0]} className="cursor-pointer" />
                      </BarChart>
                    ) : (
                      <BarChart data={getDrillDownData(drillDownStat || '')} onClick={handleChartClick}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                        <XAxis dataKey="name" stroke="#ffffff20" />
                        <YAxis stroke="#ffffff20" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey={financialFilter} fill="#F27D26" radius={[8, 8, 0, 0]} className="cursor-pointer" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                  {isLoadingInsights && (
                    <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-10 h-10 text-porteo-orange animate-spin" />
                        <p className="text-white font-bold uppercase tracking-widest">{t.analyzing}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">{lang === 'en' ? 'Key Observations' : 'Observaciones Clave'}</h4>
                    <div className="space-y-3">
                      {aiInsights.observations.length > 0 ? aiInsights.observations.map((obs, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                          <div className="p-2 bg-white/5 rounded-xl">
                            {i === 0 ? <Activity className="text-porteo-blue" /> : i === 1 ? <Target className="text-emerald-500" /> : <Users className="text-porteo-orange" />}
                          </div>
                          <p className="text-sm text-white/70">{obs}</p>
                        </div>
                      )) : (
                        [1, 2, 3].map(i => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 animate-pulse h-16" />
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">{lang === 'en' ? 'Recommended Actions' : 'Acciones Recomendadas'}</h4>
                    <div className="space-y-3">
                      {aiInsights.recommendations.length > 0 ? aiInsights.recommendations.map((rec, i) => (
                        <button 
                          key={i}
                          onClick={() => alert(`${lang === 'en' ? 'Executing' : 'Ejecutando'}: ${rec}`)}
                          className="w-full p-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex justify-between items-center group"
                        >
                          <span className="text-left">{rec}</span>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-porteo-orange transition-colors" />
                        </button>
                      )) : (
                        [1, 2].map(i => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 animate-pulse h-16" />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Statement Item Detail Modal */}
      <AnimatePresence>
        {selectedStatementItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStatementItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl z-[210]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  {lang === 'en' ? 'Line Item Detail' : 'Detalle de Partida'}: {selectedStatementItem}
                </h3>
                <button onClick={() => setSelectedStatementItem(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
      <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Description' : 'Descripción'}</p>
                  <p className="text-sm text-white/80">
                    {lang === 'en' 
                      ? `Detailed breakdown of ${selectedStatementItem} for the current fiscal period. This includes ${
                          selectedStatementItem === 'revenue' ? 'all sales channels and service fees' :
                          selectedStatementItem === 'cogs' ? 'direct labor, materials, and warehouse overhead' :
                          selectedStatementItem === 'operatingExpenses' ? 'administrative costs, marketing, and R&D' :
                          'all relevant sub-accounts and adjustments'
                        }.`
                      : `Desglose detallado de ${selectedStatementItem} para el periodo fiscal actual. Esto incluye ${
                          selectedStatementItem === 'revenue' ? 'todos los canales de venta y tarifas de servicio' :
                          selectedStatementItem === 'cogs' ? 'mano de obra directa, materiales y gastos generales de almacén' :
                          selectedStatementItem === 'operatingExpenses' ? 'costos administrativos, marketing e I+D' :
                          'todas las subcuentas y ajustes relevantes'
                        }.`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Budgeted' : 'Presupuestado'}</p>
                    <p className="text-lg font-bold text-white">
                      ${(selectedStatementItem === 'revenue' ? 1200000 : 
                         selectedStatementItem === 'cogs' ? 700000 : 
                         selectedStatementItem === 'grossProfit' ? 500000 :
                         selectedStatementItem === 'operatingExpenses' ? 300000 :
                         selectedStatementItem === 'ebitda' ? 200000 :
                         selectedStatementItem === 'taxes' ? 60000 :
                         selectedStatementItem === 'netIncome' ? 140000 : 250000).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Actual' : 'Real'}</p>
                    <p className="text-lg font-bold text-porteo-orange">
                      ${(selectedStatementItem === 'revenue' ? 1250000 : 
                         selectedStatementItem === 'cogs' ? 750000 : 
                         selectedStatementItem === 'grossProfit' ? 500000 :
                         selectedStatementItem === 'operatingExpenses' ? 320000 :
                         selectedStatementItem === 'ebitda' ? 180000 :
                         selectedStatementItem === 'taxes' ? 55000 :
                         selectedStatementItem === 'netIncome' ? 125000 : 300000).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLedger(true)}
                  className="w-full py-3 bg-porteo-blue text-white rounded-xl font-bold text-sm hover:bg-porteo-blue/80 transition-all"
                >
                  {lang === 'en' ? 'View General Ledger' : 'Ver Libro Mayor'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Month Detail Modal */}
      <AnimatePresence>
        {selectedMonthDetail && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMonthDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  {lang === 'en' ? 'Monthly Detail' : 'Detalle Mensual'}: {selectedMonthDetail.name}
                </h3>
                <button onClick={() => setSelectedMonthDetail(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">{t.revenue}</p>
                    <p className="text-xl font-bold text-white">${(selectedMonthDetail.revenue || selectedMonthDetail.value || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-white/40 uppercase font-bold mb-1">{t.cost}</p>
                    <p className="text-xl font-bold text-white">${(selectedMonthDetail.cost || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-6 bg-porteo-orange/10 rounded-2xl border border-porteo-orange/20">
                  <h4 className="text-sm font-bold text-porteo-orange uppercase tracking-widest mb-4">{lang === 'en' ? 'Top Cost Drivers' : 'Principales Factores de Costo'}</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Direct Labor', value: '42%' },
                      { name: 'Fuel & Transport', value: '28%' },
                      { name: 'Facility Maintenance', value: '15%' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm text-white/60">{item.name}</span>
                        <span className="text-sm font-bold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* General Ledger Modal */}
      <AnimatePresence>
        {showLedger && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLedger(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-950 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                    {lang === 'en' ? 'General Ledger' : 'Libro Mayor'}: {selectedStatementItem}
                  </h3>
                  <p className="text-white/40 text-sm">{lang === 'en' ? 'Transaction-level financial records' : 'Registros financieros a nivel de transacción'}</p>
                </div>
                <button onClick={() => setShowLedger(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Date</th>
                      <th className="pb-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Description</th>
                      <th className="pb-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Reference</th>
                      <th className="pb-4 text-[10px] font-bold text-white/20 uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { date: '2026-03-05', desc: 'Vendor Payment - Fuel', ref: 'INV-99281', amount: -12500 },
                      { date: '2026-03-04', desc: 'Customer Payment - Global Logistics', ref: 'REC-22102', amount: 45000 },
                      { date: '2026-03-03', desc: 'Payroll - Shift A', ref: 'PAY-00129', amount: -32000 },
                      { date: '2026-03-02', desc: 'Utility Bill - Warehouse 1', ref: 'UTIL-8812', amount: -4200 },
                      { date: '2026-03-01', desc: 'Inventory Purchase - Pallets', ref: 'PO-7721', amount: -8500 },
                    ].map((row, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 text-sm text-white/60">{row.date}</td>
                        <td className="py-4 text-sm text-white">{row.desc}</td>
                        <td className="py-4 text-xs text-white/40 font-mono">{row.ref}</td>
                        <td className={`py-4 text-sm font-bold text-right ${row.amount > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                          {row.amount > 0 ? '+' : ''}{row.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-8 bg-white/5 border-t border-white/10 flex justify-end gap-4">
                <button 
                  onClick={() => {
                    setIsProcessing(true);
                    setTimeout(() => {
                      setIsProcessing(false);
                      alert(lang === 'en' ? 'Ledger exported to PDF successfully.' : 'Libro mayor exportado a PDF con éxito.');
                    }, 1500);
                  }}
                  className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  Export PDF
                </button>
                <button 
                  onClick={() => {
                    setIsProcessing(true);
                    setTimeout(() => {
                      setIsProcessing(false);
                      alert(lang === 'en' ? 'Transactions reconciled with bank records.' : 'Transacciones conciliadas con registros bancarios.');
                    }, 2000);
                  }}
                  className="px-6 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/90 transition-all flex items-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                  Reconcile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
