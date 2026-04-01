import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box as BoxIcon, 
  Layers, 
  Truck, 
  Thermometer, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Settings, 
  Download, 
  ChevronRight, 
  Info, 
  BarChart3, 
  LineChart, 
  PieChart as PieChartIcon,
  X,
  Maximize2,
  Zap,
  Activity,
  Target,
  Users,
  Sparkles,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { getAnalyticsInsights, getAIGraphCreation } from '../services/geminiService';

interface AnalyticsProps {
  lang: 'en' | 'es';
  financialData: any[];
  pieData: any[];
  colors: string[];
  statsOverride?: {
    pallets?: string;
    occupancy?: string;
    trucks?: string;
    temp?: string;
  };
  exportReport: (title: string, data: any) => void;
  addNotification: (message: string, type?: 'operational' | 'alert' | 'success' | 'info') => void;
}

interface CustomChart {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'area';
  dataKey: string;
  color: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ lang, financialData, pieData, colors, statsOverride, exportReport, addNotification }) => {
  const [drillDownStat, setDrillDownStat] = useState<string | null>(null);
  const [drillDownView, setDrillDownView] = useState<'current' | 'average' | 'peak' | 'trend'>('trend');
  const [aiInsights, setAiInsights] = useState<{ observations: string[], recommendations: string[] }>({ observations: [], recommendations: [] });
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [chartConfigs, setChartConfigs] = useState({
    financial: { type: 'area', variables: ['revenue', 'cost'] },
    space: { type: 'pie' },
    fulfillment: { type: 'bar' },
    productivity: { type: 'area' }
  });
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([]);
  const [isAddingChart, setIsAddingChart] = useState(false);
  const [isAICreating, setIsAICreating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-12-31' });
  const [newChartForm, setNewChartForm] = useState<Partial<CustomChart>>({
    type: 'bar',
    color: '#F27D26'
  });

  const stats = [
    { id: 'pallets', label: lang === 'en' ? 'Total Pallets' : 'Total de Pallets', value: statsOverride?.pallets || '12,450', trend: '+12%', icon: <BoxIcon />, color: 'porteo-orange' },
    { id: 'occupancy', label: lang === 'en' ? 'Occupancy' : 'Ocupación', value: statsOverride?.occupancy || '84%', trend: '+2%', icon: <Layers />, color: 'porteo-blue' },
    { id: 'trucks', label: lang === 'en' ? 'Active Trucks' : 'Camiones Activos', value: statsOverride?.trucks || '24', trend: '-5%', icon: <Truck />, color: 'porteo-blue-light' },
    { id: 'temp', label: lang === 'en' ? 'Avg Temp' : 'Temp Promedio', value: statsOverride?.temp || '18°C', trend: 'Stable', icon: <Thermometer />, color: 'emerald-500' },
  ];  // Fetch AI Insights when drillDownStat or drillDownView changes
  React.useEffect(() => {
    if (drillDownStat) {
      setIsLoadingInsights(true);
      const metricData = getDrillDownData(drillDownStat);

      getAnalyticsInsights(drillDownStat, { ...metricData, view: drillDownView }, lang)
        .then(insights => {
          setAiInsights(insights);
          setIsLoadingInsights(false);
        })
        .catch(err => {
          console.error("Failed to fetch AI insights:", err);
          setIsLoadingInsights(false);
          setAiInsights({
            observations: [
              lang === 'en' ? "Data analysis suggests a stable trend with minor fluctuations." : "El análisis de datos sugiere una tendencia estable con fluctuaciones menores.",
              lang === 'en' ? "Peak performance observed during mid-week shifts." : "Rendimiento máximo observado durante los turnos de mitad de semana.",
              lang === 'en' ? "Operational costs correlate with volume increases." : "Los costos operativos se correlacionan con los aumentos de volumen."
            ],
            recommendations: [
              lang === 'en' ? "Review resource allocation for upcoming peak periods." : "Revisar la asignación de recursos para los próximos períodos pico.",
              lang === 'en' ? "Implement automated reporting for real-time monitoring." : "Implementar informes automatizados para el monitoreo en tiempo real."
            ]
          });
        });
    }
  }, [drillDownStat, drillDownView, lang]);

  const getDrillDownTitle = (id: string) => {
    const mapping: Record<string, string> = {
      pallets: lang === 'en' ? 'Pallet Inventory Analysis' : 'Análisis de Inventario de Pallets',
      occupancy: lang === 'en' ? 'Warehouse Occupancy Trends' : 'Tendencias de Ocupación de Almacén',
      trucks: lang === 'en' ? 'Fleet Utilization Details' : 'Detalles de Uso de Flota',
      temp: lang === 'en' ? 'Environmental Monitoring' : 'Monitoreo Ambiental',
      financial: lang === 'en' ? 'Financial Performance Deep-Dive' : 'Análisis Profundo de Desempeño Financiero',
      space: lang === 'en' ? 'Space Utilization Breakdown' : 'Desglose de Uso de Espacio',
      fulfillment: lang === 'en' ? 'Order Accuracy Metrics' : 'Métricas de Precisión de Pedidos',
      productivity: lang === 'en' ? 'Labor Efficiency Analysis' : 'Análisis de Eficiencia Laboral'
    };
    return mapping[id] || id;
  };

  const filteredFinancialData = useMemo(() => {
    const startMonth = new Date(dateRange.start).getMonth();
    const endMonth = new Date(dateRange.end).getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return financialData.filter(d => {
      const monthIndex = months.indexOf(d.name);
      return monthIndex >= startMonth && monthIndex <= endMonth;
    });
  }, [financialData, dateRange]);

  const getDrillDownData = (id: string) => {
    if (id === 'financial') return { data: filteredFinancialData, keys: ['revenue', 'cost', 'profit'], colors: ['#F27D26', '#004A99', '#10b981'] };
    if (id === 'space' || id === 'occupancy') return { data: pieData, keys: ['value'], colors: ['#F27D26'] };
    
    // Generate more granular data for drill down (daily for the last 30 days)
    const generateDailyData = (baseValue: number, variance: number, unit: string = '') => {
      return Array.from({ length: 30 }).map((_, i) => {
        const val = baseValue + (Math.random() - 0.5) * variance;
        return {
          name: `Day ${i + 1}`,
          value: parseFloat(val.toFixed(2)),
          average: parseFloat(baseValue.toFixed(2)),
          peak: parseFloat((baseValue + variance * 0.4).toFixed(2)),
          unit
        };
      });
    };

    if (id === 'pallets') {
      const base = parseInt(statsOverride?.pallets?.replace(/,/g, '') || '12450');
      const dailyData = generateDailyData(base, base * 0.15);
      
      if (drillDownView === 'average') return { data: dailyData, keys: ['average'], colors: ['#00AEEF'] };
      if (drillDownView === 'peak') return { data: dailyData, keys: ['peak'], colors: ['#F27D26'] };
      return { data: dailyData, keys: ['value'], colors: ['#10b981'] };
    }

    if (id === 'occupancy') {
      const base = parseFloat(statsOverride?.occupancy?.replace('%', '') || '83');
      const dailyData = generateDailyData(base, 10, '%');
      if (drillDownView === 'average') return { data: dailyData, keys: ['average'], colors: ['#00AEEF'] };
      if (drillDownView === 'peak') return { data: dailyData, keys: ['peak'], colors: ['#F27D26'] };
      return { data: dailyData, keys: ['value'], colors: ['#10b981'] };
    }

    if (id === 'trucks') {
      const base = parseInt(statsOverride?.trucks || '12');
      const dailyData = generateDailyData(base, 8);
      return { data: dailyData, keys: ['value'], colors: ['#00AEEF'] };
    }
    
    if (id === 'fulfillment') {
      const dailyData = generateDailyData(98.5, 3, '%');
      return { data: dailyData, keys: ['value'], colors: ['#F27D26'] };
    }

    if (id === 'productivity') {
      const dailyData = generateDailyData(240, 60, 'L/h');
      return { data: dailyData, keys: ['value'], colors: ['#10b981'] };
    }
    
    // Default for KPI stats
    return { data: filteredFinancialData.map(d => ({ ...d, value: Math.random() * 1000 })), keys: ['value'], colors: ['#F27D26'] };
  };

  const toggleVariable = (chartId: string, variable: string) => {
    setChartConfigs(prev => {
      const config = (prev as any)[chartId];
      const variables = config.variables.includes(variable)
        ? config.variables.filter((v: string) => v !== variable)
        : [...config.variables, variable];
      return { ...prev, [chartId]: { ...config, variables } };
    });
  };

  const changeChartType = (chartId: string, type: string) => {
    setChartConfigs(prev => ({ ...prev, [chartId]: { ...(prev as any)[chartId], type } }));
  };

  const handleAddCustomChart = () => {
    if (newChartForm.title && newChartForm.dataKey) {
      const chart: CustomChart = {
        id: `custom-${Date.now()}`,
        title: newChartForm.title,
        type: newChartForm.type as any,
        dataKey: newChartForm.dataKey,
        color: newChartForm.color || '#F27D26'
      };
      setCustomCharts([...customCharts, chart]);
      setIsAddingChart(false);
      setNewChartForm({ type: 'bar', color: '#F27D26' });
    }
  };

  const handleAICreateGraph = async () => {
    if (!aiPrompt.trim()) return;
    setIsAICreating(true);
    try {
      const config = await getAIGraphCreation(aiPrompt, lang);
      if (config.title && config.dataKey) {
        const chart: CustomChart = {
          id: `ai-custom-${Date.now()}`,
          title: config.title,
          type: (config.type?.toLowerCase() as any) || 'bar',
          dataKey: config.dataKey,
          color: config.color || '#F27D26'
        };
        setCustomCharts([chart, ...customCharts]);
        setAiPrompt('');
        addNotification(lang === 'en' ? `AI Expert created: ${config.title}` : `El experto de IA creó: ${config.title}`, 'success');
      } else {
        throw new Error("Invalid AI response");
      }
    } catch (error) {
      console.error("AI Graph Creation failed:", error);
      addNotification(lang === 'en' ? "AI was unable to create the graph. Try a different prompt." : "La IA no pudo crear la gráfica. Intenta con otro prompt.", "alert");
    } finally {
      setIsAICreating(false);
    }
  };

  const renderChart = (type: string, data: any[], dataKeys: string[], colors: string[]) => {
    const ChartComponent = (type === 'bar' ? BarChart : type === 'line' ? RechartsLineChart : type === 'scatter' ? ScatterChart : AreaChart) as any;
    const DataComponent = (type === 'bar' ? Bar : type === 'line' ? Line : type === 'scatter' ? Scatter : Area) as any;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
          {dataKeys.map((key, i) => (
            <DataComponent 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={colors[i % colors.length]} 
              fill={type === 'area' ? colors[i % colors.length] : undefined}
              fillOpacity={type === 'area' ? 0.1 : 1}
              strokeWidth={3}
              radius={type === 'bar' ? 4 : undefined}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {lang === 'en' ? 'Analytics Dashboard' : 'Panel de Analítica'}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {lang === 'en' ? 'Real-time operational insights and performance tracking' : 'Información operativa en tiempo real y seguimiento del rendimiento'}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-white/40" />
            <select 
              className="bg-transparent border-none text-xs text-white focus:ring-0 cursor-pointer"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            >
              <option value="2026-01-01" className="bg-slate-900">Jan 2026</option>
              <option value="2026-03-01" className="bg-slate-900">Mar 2026</option>
              <option value="2026-06-01" className="bg-slate-900">Jun 2026</option>
            </select>
            <span className="text-white/20 text-xs">-</span>
            <select 
              className="bg-transparent border-none text-xs text-white focus:ring-0 cursor-pointer"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            >
              <option value="2026-06-30" className="bg-slate-900">Jun 2026</option>
              <option value="2026-09-30" className="bg-slate-900">Sep 2026</option>
              <option value="2026-12-31" className="bg-slate-900">Dec 2026</option>
            </select>
          </div>
          <button 
            onClick={() => setIsAddingChart(true)}
            className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-sm font-bold hover:bg-porteo-orange/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {lang === 'en' ? 'Add Custom Graph' : 'Agregar Gráfica'}
          </button>
          <button 
            onClick={() => exportReport(lang === 'en' ? 'Full Analytics Report' : 'Reporte Analítico Completo', { financial: financialData, custom: customCharts })}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {lang === 'en' ? 'Export Report' : 'Exportar Reporte'}
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.02 }}
            onClick={() => setDrillDownStat(stat.id)}
            className="glass p-6 rounded-3xl border-b-4 border-porteo-orange/20 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {stat.icon}
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-2xl text-porteo-orange">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            <div className="mt-4 flex items-center gap-1 text-[10px] text-porteo-orange font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{lang === 'en' ? 'View Details' : 'Ver Detalles'}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Graph Creator Expert */}
      <div className="glass p-8 rounded-[40px] border border-porteo-blue/20 bg-gradient-to-br from-porteo-blue/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-24 h-24 text-porteo-blue" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-porteo-blue/20 rounded-2xl">
              <Sparkles className="w-6 h-6 text-porteo-blue" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{lang === 'en' ? 'AI Graph Creator & Data Expert' : 'Creador de Gráficas IA y Experto en Datos'}</h3>
              <p className="text-sm text-white/40">{lang === 'en' ? 'Ask the AI to create custom visualizations and analyze your data' : 'Pide a la IA que cree visualizaciones personalizadas y analice tus datos'}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input 
                type="text"
                placeholder={lang === 'en' ? "e.g. Create a line graph for revenue and pallets in Monterrey for Q1..." : "ej. Crea una gráfica de líneas para ingresos y pallets en Monterrey para el Q1..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white outline-none focus:border-porteo-blue/50 transition-all"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAICreateGraph()}
              />
              <button 
                onClick={handleAICreateGraph}
                disabled={isAICreating || !aiPrompt.trim()}
                className="absolute right-2 top-2 p-2 bg-porteo-blue text-white rounded-xl hover:bg-porteo-blue/80 disabled:opacity-50 transition-all"
              >
                {isAICreating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              lang === 'en' ? "Revenue vs Pallets" : "Ingresos vs Pallets",
              lang === 'en' ? "Occupancy in Laredo" : "Ocupación en Laredo",
              lang === 'en' ? "Accuracy by Customer" : "Precisión por Cliente",
              lang === 'en' ? "Labor Productivity" : "Productividad Laboral"
            ].map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => setAiPrompt(suggestion)}
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-porteo-blue hover:border-porteo-blue/50 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue & Profit Trend */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl relative group">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">{lang === 'en' ? 'Revenue vs. Cost Trend' : 'Tendencia de Ingresos vs. Costos'}</h3>
              <p className="text-xs text-white/40 mt-1">{lang === 'en' ? 'Monthly financial performance' : 'Rendimiento financiero mensual'}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => changeChartType('financial', 'area')}
                  className={`p-2 rounded-lg transition-all ${chartConfigs.financial.type === 'area' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => changeChartType('financial', 'line')}
                  className={`p-2 rounded-lg transition-all ${chartConfigs.financial.type === 'line' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <LineChart className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => changeChartType('financial', 'bar')}
                  className={`p-2 rounded-lg transition-all ${chartConfigs.financial.type === 'bar' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <BarChart3 className="w-4 h-4 rotate-90" />
                </button>
              </div>
              <button 
                onClick={() => setDrillDownStat('financial')}
                className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 mb-6">
            {['revenue', 'cost', 'profit'].map(v => (
              <button 
                key={v}
                onClick={() => toggleVariable('financial', v)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${chartConfigs.financial.variables.includes(v) ? 'bg-porteo-orange/20 border-porteo-orange text-porteo-orange' : 'bg-white/5 border-white/10 text-white/40'}`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="h-80 w-full cursor-pointer" onClick={() => setDrillDownStat('financial')}>
            {renderChart(chartConfigs.financial.type, filteredFinancialData, chartConfigs.financial.variables, ['#F27D26', '#004A99', '#10b981'])}
          </div>

          <div className="mt-6 p-4 bg-porteo-blue/10 border border-porteo-blue/20 rounded-2xl flex items-start gap-3 relative overflow-hidden group/insight">
            <div className="absolute top-0 right-0 p-2">
              <span className="text-[8px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full uppercase tracking-tighter">
                {lang === 'en' ? 'Status: Optimal' : 'Estado: Óptimo'}
              </span>
            </div>
            <Zap className="w-5 h-5 text-porteo-blue mt-0.5 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-porteo-blue uppercase tracking-widest mb-1 flex items-center gap-2">
                AI Insight 
                <span className="text-[10px] lowercase font-normal text-white/20 italic">powered by Gemini 3.1</span>
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                {lang === 'en' 
                  ? "Profit margins increased by 15% in March due to optimized labor allocation. Recommend maintaining current staffing levels for Q2. Revenue growth is outpacing cost increases by 4.2%."
                  : "Los márgenes de beneficio aumentaron un 15% en marzo debido a la asignación optimizada de mano de obra. Se recomienda mantener los niveles actuales para el Q2. El crecimiento de los ingresos supera el aumento de los costos en un 4.2%."}
              </p>
            </div>
          </div>
        </div>

        {/* Space Utilization */}
        <div className="glass p-8 rounded-3xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white">{lang === 'en' ? 'Space Utilization' : 'Uso de Espacio'}</h3>
            <button onClick={() => setDrillDownStat('space')} className="text-white/20 hover:text-white transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 w-full cursor-pointer" onClick={() => setDrillDownStat('space')}>
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
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3 flex-1">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer" onClick={() => setDrillDownStat('space')}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className="text-xs text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{((item.value / 1000) * 100).toFixed(0)}%</span>
                  <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-porteo-orange transition-colors" />
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => {
              const msg = lang === 'en' ? 'Running Slotting Optimization Algorithm...' : 'Ejecutando Algoritmo de Optimización de Slotting...';
              addNotification(msg, 'info');
              setTimeout(() => {
                addNotification(lang === 'en' ? 'Optimization Complete. 34 movements recommended.' : 'Optimización Completa. 34 movimientos recomendados.', 'success');
              }, 2000);
            }}
            className="w-full mt-6 py-3 bg-porteo-orange/10 border border-porteo-orange/20 rounded-xl text-xs font-bold text-porteo-orange hover:bg-porteo-orange hover:text-white transition-all shadow-lg shadow-porteo-orange/5"
          >
            {lang === 'en' ? 'Optimize Slotting' : 'Optimizar Slotting'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Fulfillment Accuracy */}
        <div className="glass p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">{lang === 'en' ? 'Order Fulfillment Accuracy' : 'Precisión de Surtido'}</h3>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => changeChartType('fulfillment', 'bar')}
                className={`p-2 rounded-lg transition-all ${chartConfigs.fulfillment.type === 'bar' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => changeChartType('fulfillment', 'line')}
                className={`p-2 rounded-lg transition-all ${chartConfigs.fulfillment.type === 'line' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 w-full cursor-pointer" onClick={() => setDrillDownStat('fulfillment')}>
            {renderChart(chartConfigs.fulfillment.type, getDrillDownData('fulfillment').data, getDrillDownData('fulfillment').keys, getDrillDownData('fulfillment').colors)}
          </div>
        </div>

        {/* Labor Productivity */}
        <div className="glass p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">{lang === 'en' ? 'Labor Productivity (Lines/Hr)' : 'Productividad Laboral (Líneas/Hr)'}</h3>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => changeChartType('productivity', 'area')}
                className={`p-2 rounded-lg transition-all ${chartConfigs.productivity.type === 'area' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => changeChartType('productivity', 'line')}
                className={`p-2 rounded-lg transition-all ${chartConfigs.productivity.type === 'line' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 w-full cursor-pointer" onClick={() => setDrillDownStat('productivity')}>
            {renderChart(chartConfigs.productivity.type, getDrillDownData('productivity').data, getDrillDownData('productivity').keys, getDrillDownData('productivity').colors)}
          </div>
        </div>
      </div>

      {/* Custom Charts Section */}
      {customCharts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {customCharts.map(chart => (
            <div key={chart.id} className="glass p-8 rounded-3xl relative group">
              <button 
                onClick={() => setCustomCharts(prev => prev.filter(c => c.id !== chart.id))}
                className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white mb-6">{chart.title}</h3>
              <div className="h-64 w-full">
                {renderChart(chart.type, filteredFinancialData, [chart.dataKey], [chart.color])}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drill Down Modal */}
      <AnimatePresence>
        {drillDownStat && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
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
              <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                    {getDrillDownTitle(drillDownStat)}
                  </h3>
                  <p className="text-white/40 text-sm">{lang === 'en' ? 'Granular data view and historical trends' : 'Vista de datos granulares y tendencias históricas'}</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <select 
                    className="bg-transparent border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-porteo-orange/50 transition-all"
                    value={drillDownStat}
                    onChange={(e) => setDrillDownStat(e.target.value)}
                  >
                    {stats.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.label}</option>)}
                    <option value="financial" className="bg-slate-900">{lang === 'en' ? 'Financials' : 'Finanzas'}</option>
                    <option value="space" className="bg-slate-900">{lang === 'en' ? 'Space' : 'Espacio'}</option>
                    <option value="fulfillment" className="bg-slate-900">{lang === 'en' ? 'Fulfillment' : 'Surtido'}</option>
                    <option value="productivity" className="bg-slate-900">{lang === 'en' ? 'Productivity' : 'Productividad'}</option>
                  </select>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => exportReport(getDrillDownTitle(drillDownStat), getDrillDownData(drillDownStat).data)}
                      className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setDrillDownStat(null)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    onClick={() => setDrillDownView('current')}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer ${drillDownView === 'current' ? 'bg-porteo-orange/20 border-porteo-orange' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Current Value' : 'Valor Actual'}</p>
                    <p className="text-3xl font-bold text-white">
                      {drillDownStat === 'space' ? (stats.find(s => s.id === 'occupancy')?.value) : (stats.find(s => s.id === drillDownStat)?.value || 'N/A')}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      <span>{lang === 'en' ? '+12.4% vs last month' : '+12.4% vs mes anterior'}</span>
                    </div>
                  </div>
                  <div 
                    onClick={() => setDrillDownView('average')}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer ${drillDownView === 'average' ? 'bg-porteo-orange/20 border-porteo-orange' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Average (30d)' : 'Promedio (30d)'}</p>
                    <p className="text-3xl font-bold text-white">
                      {drillDownStat === 'pallets' ? '11,840' : drillDownStat === 'occupancy' || drillDownStat === 'space' ? '82%' : 'Calculated'}
                    </p>
                    <p className="text-[10px] text-white/20 mt-2">{lang === 'en' ? 'Stable performance' : 'Rendimiento estable'}</p>
                  </div>
                  <div 
                    onClick={() => setDrillDownView('peak')}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer ${drillDownView === 'peak' ? 'bg-porteo-orange/20 border-porteo-orange' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Peak Value' : 'Valor Pico'}</p>
                    <p className="text-3xl font-bold text-porteo-orange">
                      {drillDownStat === 'pallets' ? '14,200' : drillDownStat === 'occupancy' || drillDownStat === 'space' ? '96%' : 'Peak'}
                    </p>
                    <p className="text-[10px] text-white/20 mt-2">{lang === 'en' ? 'Recorded on March 15' : 'Registrado el 15 de marzo'}</p>
                  </div>
                </div>

                <div className="h-[400px] w-full bg-white/5 rounded-3xl p-8 border border-white/10 relative">
                  {isLoadingInsights && (
                    <div className="absolute inset-0 z-10 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-porteo-orange border-t-transparent rounded-full animate-spin" />
                        <p className="text-white/60 text-sm font-bold uppercase tracking-widest">{lang === 'en' ? 'AI is analyzing data...' : 'La IA está analizando datos...'}</p>
                      </div>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getDrillDownData(drillDownStat).data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                      <XAxis dataKey="name" stroke="#ffffff20" />
                      <YAxis stroke="#ffffff20" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      {getDrillDownData(drillDownStat).keys.map((key, i) => (
                        <Area 
                          key={key}
                          type="monotone" 
                          dataKey={key} 
                          stroke={getDrillDownData(drillDownStat).colors[i]} 
                          fill={`${getDrillDownData(drillDownStat).colors[i]}20`} 
                          strokeWidth={4} 
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-porteo-orange" />
                      {lang === 'en' ? 'Key Observations' : 'Observaciones Clave'}
                    </h4>
                    <div className="space-y-3">
                      {isLoadingInsights ? (
                        [1, 2, 3].map(i => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 animate-pulse h-16" />
                        ))
                      ) : (
                        aiInsights.observations.map((obs, i) => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-xl">
                              {i === 0 ? <Activity className="text-porteo-blue w-4 h-4" /> : i === 1 ? <Target className="text-emerald-500 w-4 h-4" /> : <Users className="text-porteo-orange w-4 h-4" />}
                            </div>
                            <p className="text-sm text-white/70">{obs}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-porteo-blue" />
                      {lang === 'en' ? 'Recommended Actions' : 'Acciones Recomendadas'}
                    </h4>
                    <div className="space-y-3">
                      {isLoadingInsights ? (
                        [1, 2].map(i => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 animate-pulse h-16" />
                        ))
                      ) : (
                        aiInsights.recommendations.map((rec, i) => (
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
                        ))
                      )}
                      <div className="pt-4 flex gap-4">
                        <button 
                          onClick={() => {
                            addNotification(lang === 'en' ? 'Generating PDF Report...' : 'Generando Reporte PDF...', 'operational');
                          }}
                          className="flex-1 p-4 bg-porteo-orange text-white rounded-2xl font-bold text-sm hover:bg-porteo-orange/80 transition-all flex justify-center items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>{lang === 'en' ? 'Generate Report' : 'Generar Reporte'}</span>
                        </button>
                        <button 
                          onClick={() => {
                            addNotification(lang === 'en' ? 'Scheduling AI Optimization...' : 'Programando Optimización IA...', 'operational');
                          }}
                          className="flex-1 p-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex justify-center items-center gap-2"
                        >
                          <Zap className="w-4 h-4 text-porteo-blue" />
                          <span>{lang === 'en' ? 'Schedule AI' : 'Programar IA'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Custom Chart Modal */}
      <AnimatePresence>
        {isAddingChart && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingChart(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Create Custom Graph</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Graph Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Q1 Performance"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-porteo-orange/50 transition-all"
                    value={newChartForm.title || ''}
                    onChange={e => setNewChartForm({...newChartForm, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Data Variable</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-porteo-orange/50 transition-all"
                    value={newChartForm.dataKey || ''}
                    onChange={e => setNewChartForm({...newChartForm, dataKey: e.target.value})}
                  >
                    <option value="" disabled>Select variable</option>
                    <option value="revenue" className="bg-slate-900">Revenue</option>
                    <option value="cost" className="bg-slate-900">Cost</option>
                    <option value="profit" className="bg-slate-900">Profit</option>
                    <option value="pallets" className="bg-slate-900">Pallets</option>
                    <option value="occupancy" className="bg-slate-900">Occupancy</option>
                    <option value="accuracy" className="bg-slate-900">Accuracy</option>
                    <option value="lines" className="bg-slate-900">Lines/Hr</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Graph Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['bar', 'line', 'area', 'scatter'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setNewChartForm({...newChartForm, type: type as any})}
                        className={`py-3 rounded-xl text-xs font-bold uppercase border transition-all ${newChartForm.type === type ? 'bg-porteo-orange/20 border-porteo-orange text-porteo-orange' : 'bg-white/5 border-white/10 text-white/40'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Accent Color</label>
                  <div className="flex gap-3">
                    {['#F27D26', '#004A99', '#10b981', '#00AEEF', '#8b5cf6'].map(color => (
                      <button 
                        key={color}
                        onClick={() => setNewChartForm({...newChartForm, color})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${newChartForm.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsAddingChart(false)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddCustomChart}
                    className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-all shadow-lg shadow-porteo-orange/20"
                  >
                    Create Graph
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
