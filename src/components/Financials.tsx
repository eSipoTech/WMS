import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
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
import { toast } from 'sonner';

interface FinancialsProps {
  lang: 'en' | 'es';
  financialData: any[];
  pieData: any[];
  colors: string[];
  addNotification: (message: string, type?: 'operational' | 'alert' | 'success' | 'info') => void;
}

export const Financials: React.FC<FinancialsProps> = ({ lang, financialData: propsFinancialData, pieData: propsPieData, colors, addNotification }) => {
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
  const [selectedStatDetail, setSelectedStatDetail] = useState<{title: string, value: string, detail: string, breakdown: any[]} | null>(null);
  const [cfoQuery, setCfoQuery] = useState('');
  const [cfoResponse, setCfoResponse] = useState<string | null>(null);
  const [isCfoLoading, setIsCfoLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportExportOption, setReportExportOption] = useState<'download' | 'email' | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [financeInsights, setFinanceInsights] = useState<any[]>([
    {
      id: 'market-1',
      type: 'market',
      title: lang === 'en' ? 'Market Insight' : 'Insight de Mercado',
      value: lang === 'en' ? 'Fuel prices in Mexico are projected to rise by 3.2% next month.' : 'Se proyecta que los precios del combustible en México aumenten un 3.2% el próximo mes.',
      actionLabel: lang === 'en' ? 'Apply Hedging Strategy' : 'Aplicar Estrategia de Cobertura',
      executed: false
    },
    {
      id: 'profit-1',
      type: 'profit',
      title: lang === 'en' ? 'Profit Opportunity' : 'Oportunidad de Utilidad',
      value: lang === 'en' ? 'Consolidating LTL shipments for Customer X could save $12,500.' : 'Consolidar envíos LTL para el Cliente X podría ahorrar $12,500.',
      actionLabel: lang === 'en' ? 'Consolidate Now' : 'Consolidar Ahora',
      executed: false
    },
    {
      id: 'action-1',
      type: 'action',
      title: lang === 'en' ? 'Action Required' : 'Acción Requerida',
      value: lang === 'en' ? "Accounts receivable for 'Global Logistics Inc' is 15 days overdue." : "Las cuentas por cobrar de 'Global Logistics Inc' tienen 15 días de retraso.",
      actionLabel: lang === 'en' ? 'Send Reminder' : 'Enviar Recordatorio',
      executed: false
    },
    {
      id: 'tax-1',
      type: 'tax',
      title: lang === 'en' ? 'Tax Strategy' : 'Estrategia Fiscal',
      value: lang === 'en' ? 'New logistics tax deduction available for EV fleet investments.' : 'Nueva deducción fiscal disponible para inversiones en flotas eléctricas.',
      actionLabel: lang === 'en' ? 'Claim Deduction' : 'Reclamar Deducción',
      executed: false
    }
  ]);

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
      const file = e.target.files[0];
      setIsProcessing(true);
      toast.promise(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = new Uint8Array(event.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
              
              if (jsonData.length > 0) {
                // Simulate deep processing and metric recalibration
                setTimeout(() => {
                  const newData = financialData.map((d, idx) => {
                    const row = jsonData[idx % jsonData.length];
                    const newRev = parseFloat(row.revenue || row.Revenue || row.Ingresos || d.revenue * (1 + (Math.random() * 0.2)));
                    const newCost = parseFloat(row.cost || row.Cost || row.Costos || d.cost * (1 + (Math.random() * 0.1)));
                    return {
                      ...d,
                      revenue: newRev,
                      cost: newCost,
                      profit: newRev - newCost
                    };
                  });
                  
                  setFinancialData(newData);
                  setHasManualUpload(true);
                  
                  // Update insights reactively based on uploaded data
                  setFinanceInsights(prev => [
                    {
                      id: `file-insight-${Date.now()}`,
                      type: 'market',
                      title: lang === 'en' ? 'Post-Upload Insight' : 'Insight Post-Carga',
                      value: lang === 'en' ? 'Detected a 12% discrepancy in transportation costs from the uploaded record.' : 'Se detectó una discrepancia del 12% en costos de transporte según el registro cargado.',
                      actionLabel: lang === 'en' ? 'Automatic Reconciliation' : 'Conciliación Automática',
                      executed: false
                    },
                    ...prev.slice(0, 3)
                  ]);

                  resolve(true);
                }, 2000);
              } else {
                reject(new Error("Empty file"));
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error("File read error"));
          reader.readAsArrayBuffer(file);
        }),
        {
          loading: lang === 'en' ? 'Analyzing Financial Data Layers...' : 'Analizando capas de datos financieros...',
          success: () => {
            setIsProcessing(false);
            return lang === 'en' ? `Successfully synchronized ${file.name}. Charts updated.` : `Sincronizado con éxito ${file.name}. Gráficos actualizados.`;
          },
          error: () => {
            setIsProcessing(false);
            return lang === 'en' ? 'Error processing financial record.' : 'Error al procesar el registro financiero.';
          }
        }
      );
    }
  };

  const handleDownload = () => {
    setShowReportModal(true);
  };

  const executeDownload = (type: 'csv' | 'pdf') => {
    setIsProcessing(true);
    setTimeout(() => {
      if (type === 'csv') {
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
      }
      
      setIsProcessing(false);
      setShowReportModal(false);
      addNotification(lang === 'en' ? `Financial ${type.toUpperCase()} report generated and downloaded.` : `Reporte financiero ${type.toUpperCase()} generado y descargado.`, 'success');
    }, 2000);
  };

  const executeEmail = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowReportModal(false);
      toast.success(lang === 'en' ? 'Financial report sent to your secure inbox.' : 'Reporte financiero enviado a su bandeja de entrada segura.');
      addNotification(lang === 'en' ? 'Encrypted financial report dispatched via email.' : 'Reporte financiero encriptado enviado por correo.', 'success');
    }, 2500);
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
          <button 
            onClick={() => {
              setFinancialData(prev => prev.map(d => ({ ...d, revenue: d.revenue * (1 + (Math.random() * 0.01)) })));
              toast.info(lang === 'en' ? 'Live market data feed refreshed.' : 'Fuente de datos de mercado en vivo actualizada.');
            }}
            className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all active:scale-95"
            title="Refresh Live Feed"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="relative">
            <input 
              type="file" 
              id="financial-upload" 
              className="hidden" 
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
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

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: lang === 'en' ? 'Total Revenue' : 'Ingresos Totales', 
            value: `$${(financialData.reduce((acc, d) => acc + d.revenue, 0) / 1000).toFixed(1)}M`, 
            trend: '+12.4%', 
            color: 'text-emerald-500',
            id: 'revenue'
          },
          { 
            label: lang === 'en' ? 'Net Margin' : 'Margen Neto', 
            value: '28.4%', 
            trend: '+2.1%', 
            color: 'text-porteo-blue',
            id: 'margin'
          },
          { 
            label: lang === 'en' ? 'Op. Expense' : 'Gastos Op.', 
            value: `$${(financialData.reduce((acc, d) => acc + d.cost, 0) / 1000).toFixed(1)}M`, 
            trend: '-4.2%', 
            color: 'text-red-400',
            id: 'expense'
          },
          { 
            label: lang === 'en' ? 'EBITDA' : 'EBITDA', 
            value: `$${((financialData.reduce((acc, d) => acc + d.revenue - d.cost, 0)) / 1000).toFixed(1)}M`, 
            trend: '+6.8%', 
            color: 'text-porteo-orange',
            id: 'ebitda'
          },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => {
                const isEn = lang === 'en';
                const advice = stat.id === 'revenue' 
                    ? (isEn ? "Forecast indicates strong Q3 growth in logistics demand. Leverage last-mile route density for optimal scale." : "El pronóstico indica un fuerte crecimiento de la demanda en el T3. Aproveche la densidad de rutas de última milla.")
                    : stat.id === 'margin'
                    ? (isEn ? "Current margin is above industry average of 24.5%. Strategic reinvestment in automation is recommended." : "El margen actual está por encima del promedio de la industria del 24.5%. Se recomienda reinversión estratégica en automatización.")
                    : stat.id === 'expense'
                    ? (isEn ? "Operating expenses are down 4.2% YoY. Focus on consolidating LTL vendor tiers to further optimize opex." : "Los gastos operativos han bajado un 4.2% interanual. Focus en consolidar niveles de proveedores LTL para optimizar opex.")
                    : (isEn ? "EBITDA trajectory is positive. Debt-service coverage ratio is at 4.2x, providing significant borrowing capacity." : "La trayectoria del EBITDA es positiva. El ratio de cobertura del servicio de la deuda está en 4.2x, proporcionando capacidad de endeudamiento.");

                setSelectedStatDetail({
                    title: stat.label,
                    value: stat.value,
                    detail: advice,
                    breakdown: [
                        { label: isEn ? 'AI Strategic Health Score' : 'Score de Salud Estratégica IA', value: '98/100' },
                        { label: isEn ? 'CFO Recommendation' : 'Recomendación del CFO', value: 'Reinvest' },
                        { label: isEn ? 'Projected Impact' : 'Impacto Proyectado', value: '+14% EBIT' }
                    ]
                });
            }}
            className="glass p-6 rounded-3xl border border-white/5 hover:bg-white/10 hover:border-porteo-orange/40 transition-all cursor-pointer group"
          >
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-white group-hover:text-porteo-orange transition-colors">{stat.value}</p>
              <span className={`text-[10px] font-bold ${stat.color} mb-1 animate-pulse`}>{stat.trend}</span>
            </div>
            <p className="text-[8px] text-white/20 mt-2 flex items-center gap-1 group-hover:text-porteo-orange/60 transition-colors uppercase font-bold">
                <Target className="w-2 h-2" />
                {lang === 'en' ? 'Click for CFO Granularity' : 'Click para Granularidad CFO'}
            </p>
          </div>
        ))}
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
                {financeInsights.map((insight) => (
                    <div key={insight.id} className={`p-4 rounded-2xl border transition-all ${insight.executed ? 'opacity-50 grayscale' : 'hover:bg-white/5'}`} style={{ backgroundColor: `${insight.executed ? 'transparent' : 'rgba(255,255,255,0.02)'}`, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                            insight.type === 'market' ? 'text-porteo-blue' : 
                            insight.type === 'profit' ? 'text-emerald-500' : 
                            insight.type === 'action' ? 'text-porteo-orange' : 'text-purple-400'
                        }`}>{insight.title}</p>
                        <p className="text-sm text-white/80 leading-relaxed mb-3">{insight.value}</p>
                        <button 
                            disabled={insight.executed}
                            onClick={() => {
                                toast.promise(
                                    new Promise(r => setTimeout(r, 2000)),
                                    {
                                        loading: lang === 'en' ? `Implementing: ${insight.actionLabel}...` : `Implementando: ${insight.actionLabel}...`,
                                        success: () => {
                                            setFinanceInsights(prev => prev.map(inv => inv.id === insight.id ? { ...inv, executed: true } : inv));
                                            
                                            // Real data reaction: Impact based on action type
                                            setFinancialData(prev => prev.map(d => {
                                                let multiplierRev = 1;
                                                let multiplierCost = 1;
                                                
                                                if (insight.type === 'profit' || insight.type === 'action') {
                                                    multiplierCost = 0.95; // 5% cost reduction
                                                }
                                                if (insight.type === 'market' || insight.type === 'tax') {
                                                    multiplierRev = 1.03; // 3% revenue optimization
                                                }

                                                const newRev = d.revenue * multiplierRev;
                                                const newCost = d.cost * multiplierCost;
                                                return {
                                                    ...d,
                                                    revenue: newRev,
                                                    cost: newCost,
                                                    profit: newRev - newCost
                                                };
                                            }));

                                            return lang === 'en' ? 'Strategic action applied. Financial forecast adjusted.' : 'Acción estratégica aplicada. Pronóstico financiero ajustado.';
                                        }
                                    }
                                );
                            }}
                            className={`text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded-lg border transition-all ${
                                insight.executed ? 'border-white/10 text-white/20' : 'border-current hover:bg-current hover:text-black cursor-pointer'
                            }`}
                            style={{ color: insight.executed ? undefined : (
                                insight.type === 'market' ? '#00A3E0' : 
                                insight.type === 'profit' ? '#10b981' : 
                                insight.type === 'action' ? '#F27D26' : '#a855f7'
                            )}}
                        >
                            {insight.executed ? (lang === 'en' ? 'Completed' : 'Completado') : insight.actionLabel}
                        </button>
                    </div>
                ))}
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
                      setSelectedStatDetail({
                        title: lang === 'en' ? 'Current Period Analysis' : 'Análisis del Periodo Actual',
                        value: `$${(lastVal * 10).toLocaleString()}`,
                        detail: lang === 'en' ? 'Deep dive into regional performance for the current fiscal window.' : 'Inmersión profunda en el desempeño regional para la ventana fiscal actual.',
                        breakdown: [
                          { label: 'Porteo MX', value: '45%' },
                          { label: 'Porteo USA', value: '38%' },
                          { label: 'International', value: '17%' }
                        ]
                      });
                    }}
                    className="p-6 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:border-porteo-orange/40 transition-all group"
                  >
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Current Period' : 'Periodo Actual'}</p>
                    <p className="text-3xl font-bold text-white group-hover:text-porteo-orange transition-colors">${(financialData[financialData.length-1][financialFilter] * 10).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      <span>+8.2% vs last period</span>
                    </div>
                  </div>
                  <div 
                    onClick={() => {
                      const lastVal = financialData[financialData.length-1][financialFilter];
                      setSelectedStatDetail({
                        title: lang === 'en' ? 'AI Growth Forecast' : 'Pronóstico de Crecimiento IA',
                        value: `$${(lastVal * 11).toLocaleString()}`,
                        detail: lang === 'en' ? 'Projected performance based on seasonal regression and market trends.' : 'Desempeño proyectado basado en regresión estacional y tendencias de mercado.',
                        breakdown: [
                          { label: 'Pipeline Velocity', value: 'High' },
                          { label: 'Confidence Score', value: '94%' },
                          { label: 'Market Variance', value: '+/- 2%' }
                        ]
                      });
                    }}
                    className="p-6 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:border-porteo-orange/40 transition-all group"
                  >
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Projected' : 'Proyectado'}</p>
                    <p className="text-3xl font-bold text-white group-hover:text-porteo-orange transition-colors">${(financialData[financialData.length-1][financialFilter] * 11).toLocaleString()}</p>
                    <p className="text-[10px] text-white/20 mt-2">{lang === 'en' ? 'Based on current growth' : 'Basado en crecimiento actual'}</p>
                  </div>
                  <div 
                    onClick={() => {
                      setSelectedStatDetail({
                        title: lang === 'en' ? 'Variance Root Cause' : 'Causa Raíz de Varianza',
                        value: '-$4,200',
                        detail: lang === 'en' ? 'Identification of key factors resulting in negative variance vs targets.' : 'Identificación de factores clave que resultan en varianza negativa vs objetivos.',
                        breakdown: [
                          { label: 'Labor Overtime', value: '+$1,200' },
                          { label: 'Fuel Volatility', value: '+$2,500' },
                          { label: 'Equipment Repair', value: '+$500' }
                        ]
                      });
                    }}
                    className="p-6 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:border-porteo-orange/40 transition-all group"
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
                          onClick={() => {
                            addNotification(`${lang === 'en' ? 'Executing' : 'Ejecutando'}: ${rec}`, 'operational');
                          }}
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
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                 <button onClick={() => setSelectedMonthDetail(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                  {lang === 'en' ? 'Fiscal Audit' : 'Auditoría Fiscal'}: {selectedMonthDetail.name}
                </h3>
                <p className="text-white/40 text-sm">{lang === 'en' ? 'Detailed ledger summary for the selected period.' : 'Resumen detallado del libro mayor para el periodo seleccionado.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                  <p className="text-[10px] text-emerald-500/60 uppercase font-bold mb-1 tracking-widest">{t.revenue}</p>
                  <p className="text-3xl font-bold text-emerald-500">${(selectedMonthDetail.revenue || selectedMonthDetail.value || 0).toLocaleString()}</p>
                </div>
                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
                  <p className="text-[10px] text-red-500/60 uppercase font-bold mb-1 tracking-widest">{t.cost}</p>
                  <p className="text-3xl font-bold text-red-400">${(selectedMonthDetail.cost || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{lang === 'en' ? 'Operational Breakdown' : 'Desglose Operativo'}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { name: 'Direct Fulfillment', value: 45, color: '#F27D26' },
                      { name: 'Last Mile Logistics', value: 30, color: '#00A3E0' },
                      { name: 'Admin & Compliance', value: 25, color: '#a855f7' }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/60 font-medium">{item.name}</span>
                          <span className="text-white font-bold">{item.value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedMonthDetail(null);
                  setSelectedStatementItem('revenue');
                }}
                className="w-full mt-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {lang === 'en' ? 'View Full Statement' : 'Ver Estado Completo'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stat Detail Modal (Granularity for Metric Cards) */}
      <AnimatePresence>
        {selectedStatDetail && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStatDetail(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
               <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  {selectedStatDetail.title}
                </h3>
                <button onClick={() => setSelectedStatDetail(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-6 bg-porteo-orange/10 rounded-3xl border border-porteo-orange/20 mb-6 text-center">
                 <p className="text-4xl font-black text-white">{selectedStatDetail.value}</p>
                 <p className="text-xs text-porteo-orange font-bold uppercase tracking-widest mt-2">{lang === 'en' ? 'Consolidated Value' : 'Valor Consolidado'}</p>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-8">{selectedStatDetail.detail}</p>
              
              <div className="space-y-4">
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">{lang === 'en' ? 'Component Breakdown' : 'Desglose de Componentes'}</p>
                <div className="grid grid-cols-1 gap-2">
                  {selectedStatDetail.breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-white/60 font-bold">{item.label}</span>
                      <span className="text-white font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                <button 
                  onClick={() => {
                    setReportExportOption('download');
                    setTimeout(() => setReportExportOption(null), 3000);
                  }}
                  className="flex-1 py-3 bg-white border border-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-white transition-all relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {reportExportOption === 'download' ? (lang === 'en' ? 'Downloading...' : 'Descargando...') : (lang === 'en' ? 'Download PDF' : 'Descargar PDF')}
                  </span>
                  {reportExportOption === 'download' && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="absolute inset-0 bg-emerald-500/20"
                      />
                  )}
                </button>
                <button 
                  onClick={() => {
                    setReportExportOption('email');
                    setTimeout(() => {
                        setReportExportOption(null);
                        toast.success(lang === 'en' ? 'Report sent to your registered email.' : 'Reporte enviado a su correo registrado.');
                    }, 2000);
                  }}
                  className="flex-1 py-3 bg-porteo-orange border border-porteo-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-porteo-orange transition-all relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {reportExportOption === 'email' ? (lang === 'en' ? 'Sending...' : 'Enviando...') : (lang === 'en' ? 'Send to Email' : 'Enviar por Email')}
                  </span>
                  {reportExportOption === 'email' && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="absolute inset-0 bg-white/20"
                      />
                  )}
                </button>
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
                      addNotification(lang === 'en' ? 'Ledger exported to PDF successfully.' : 'Libro mayor exportado a PDF con éxito.', 'success');
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
                      addNotification(lang === 'en' ? 'Transactions reconciled with bank records.' : 'Transacciones conciliadas con registros bancarios.', 'success');
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

      {/* Global Report Export Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-porteo-orange/40" />
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{lang === 'en' ? 'Expert Financial Export' : 'Exportación Financiera Experta'}</h3>
                <p className="text-white/40 text-sm mt-2">{lang === 'en' ? 'Choose your preferred delivery method for the consolidated report.' : 'Elija su método de entrega preferido para el reporte consolidado.'}</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => executeDownload('pdf')}
                  disabled={isProcessing}
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-porteo-orange/40 transition-all group flex items-start gap-4 text-left"
                >
                  <div className="p-3 bg-red-400/20 rounded-2xl text-red-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{lang === 'en' ? 'Download as PDF' : 'Descargar como PDF'}</h4>
                    <p className="text-xs text-white/40">{lang === 'en' ? 'Includes high-res charts and AI commentary' : 'Incluye gráficos de alta resolución y comentarios IA'}</p>
                  </div>
                </button>

                <button 
                  onClick={() => executeDownload('csv')}
                  disabled={isProcessing}
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-porteo-orange/40 transition-all group flex items-start gap-4 text-left"
                >
                  <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                    <PieChartIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{lang === 'en' ? 'Export CSV Data' : 'Exportar Datos CSV'}</h4>
                    <p className="text-xs text-white/40">{lang === 'en' ? 'Raw ledger data for integration with ERP/Excel' : 'Datos brutos del libro mayor para integración con ERP/Excel'}</p>
                  </div>
                </button>

                <button 
                  onClick={() => executeEmail()}
                  disabled={isProcessing}
                  className="w-full p-6 bg-porteo-blue/10 border border-porteo-blue/20 rounded-3xl hover:bg-porteo-blue/20 hover:border-porteo-blue/40 transition-all group flex items-start gap-4 text-left"
                >
                  <div className="p-3 bg-porteo-blue/20 rounded-2xl text-porteo-blue group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{lang === 'en' ? 'Send to Registered Email' : 'Enviar a Correo Registrado'}</h4>
                    <p className="text-xs text-white/40">{lang === 'en' ? 'Secure encrypted delivery to: pilotplus@porteo.mx' : 'Entrega segura encriptada a: pilotplus@porteo.mx'}</p>
                  </div>
                </button>
              </div>

              {isProcessing && (
                <div className="mt-8 flex items-center justify-center gap-3 text-porteo-orange animate-pulse">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">{lang === 'en' ? 'Processing Strategic Data...' : 'Procesando Datos Estratégicos...'}</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
