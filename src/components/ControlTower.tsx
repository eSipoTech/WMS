import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Truck, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Map as MapIcon,
  ShieldCheck,
  X,
  ChevronRight,
  Zap,
  Navigation,
  Users,
  Warehouse,
  Cpu,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const data = [
  { time: '00:00', throughput: 450, efficiency: 92, labor: 120, energy: 45 },
  { time: '04:00', throughput: 380, efficiency: 88, labor: 110, energy: 40 },
  { time: '08:00', throughput: 850, efficiency: 95, labor: 280, energy: 85 },
  { time: '12:00', throughput: 920, efficiency: 94, labor: 310, energy: 92 },
  { time: '16:00', throughput: 780, efficiency: 91, labor: 250, energy: 78 },
  { time: '20:00', throughput: 520, efficiency: 89, labor: 180, energy: 55 },
];

interface ControlTowerProps {
  setActiveTab?: (tab: string) => void;
  market?: 'USA' | 'MEXICO';
  lang?: 'en' | 'es';
}

export const ControlTower: React.FC<ControlTowerProps> = ({ setActiveTab, market, lang = 'en' }) => {
  const [activeMetric, setActiveMetric] = useState<'throughput' | 'efficiency'>('throughput');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showGlobalMap, setShowGlobalMap] = useState(false);
  const [graphFilter, setGraphFilter] = useState<'24h' | '7d' | '30d'>('24h');
  const [drillDownLevel, setDrillDownLevel] = useState<'summary' | 'granular' | 'micro'>('summary');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [dateRange, setDateRange] = useState({ from: '2026-03-01', to: '2026-04-02' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Unique Data Generators for Metrics
  const getMetricData = (metric: string, filter: string) => {
    const seed = metric.length + filter.length;
    const baseData = [
      { time: '00:00', throughput: 450, efficiency: 92, utilization: 85, alerts: 1, sla: 99.9 },
      { time: '04:00', throughput: 380, efficiency: 88, utilization: 78, alerts: 0, sla: 99.8 },
      { time: '08:00', throughput: 850, efficiency: 95, utilization: 92, alerts: 2, sla: 99.7 },
      { time: '12:00', throughput: 920, efficiency: 94, utilization: 96, alerts: 1, sla: 99.9 },
      { time: '16:00', throughput: 780, efficiency: 91, utilization: 89, alerts: 3, sla: 99.6 },
      { time: '20:00', throughput: 520, efficiency: 89, utilization: 82, alerts: 0, sla: 99.9 },
    ];

    return baseData.map(d => ({
      ...d,
      throughput: Math.floor(d.throughput * (1 + (seed % 10) / 100)),
      efficiency: Math.min(100, d.efficiency + (seed % 5)),
      utilization: Math.min(100, d.utilization + (seed % 8)),
      alerts: Math.max(0, d.alerts + (seed % 2)),
      sla: Math.min(100, d.sla - (seed % 3) / 10),
    }));
  };

  const getMetricKey = (metric: string | null): string => {
    if (!metric) return 'throughput';
    const m = metric.toLowerCase();
    if (m.includes('throughput') || m.includes('rendimiento')) return 'throughput';
    if (m.includes('utilization') || m.includes('utilización')) return 'utilization';
    if (m.includes('alerts') || m.includes('alertas')) return 'alerts';
    if (m.includes('sla') || m.includes('cumplimiento')) return 'sla';
    if (m.includes('efficiency') || m.includes('eficiencia')) return 'efficiency';
    return 'throughput';
  };

  const currentMetricKey = getMetricKey(selectedMetric || activeMetric);
  const currentData = getMetricData(selectedMetric || activeMetric, graphFilter);

    const getMetricSummary = (metric: string | null) => {
    const key = getMetricKey(metric);
    const latest = currentData[currentData.length - 1] as any;
    const val = latest[key] || 0;
    
    let current = val.toString();
    let target = '';
    let variance = '';
    
    if (key === 'throughput') {
      current = val.toLocaleString();
      target = Math.floor(val * 0.95).toLocaleString();
      variance = `+${Math.floor(val * 0.05).toLocaleString()}`;
    } else if (key === 'utilization' || key === 'efficiency' || key === 'sla') {
      current = `${val.toFixed(1)}%`;
      target = `${(val * 0.98).toFixed(1)}%`;
      variance = `+${(val * 0.02).toFixed(1)}%`;
    } else if (key === 'alerts') {
      current = val.toString();
      target = '0';
      variance = `+${val}`;
    } else if (key === 'labor' || key === 'energy') {
      current = val.toLocaleString();
      target = Math.floor(val * 0.9).toLocaleString();
      variance = `-${Math.floor(val * 0.1).toLocaleString()}`;
    }

    return { current, target, variance };
  };

  const summary = getMetricSummary(selectedMetric);

  useEffect(() => {
    if (isRefreshing) {
      const timer = setTimeout(() => setIsRefreshing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing]);

  const handleDataRefresh = () => {
    setIsRefreshing(true);
    // In a real app, this would trigger a re-fetch
  };

  const t = {
    en: {
      title: 'Control Tower',
      subtitle: 'Global Operations & Real-time Monitoring',
      liveSystem: 'Live System',
      performance: 'Performance Analytics',
      deepDive: 'DEEP DIVE',
      activeOps: 'Active Operations',
      globalLog: 'Global Event Log',
      viewAll: 'View All Logs',
      throughput: 'Total Throughput',
      utilization: 'Fleet Utilization',
      alerts: 'Active Alerts',
      sla: 'SLA Compliance',
      optimal: 'Optimal',
      highLoad: 'High Load',
      maintenance: 'Maintenance',
      workers: 'Workers',
      docks: 'Docks',
      pending: 'Pending Orders',
      recommendations: 'Operational Recommendations',
      takeAction: 'TAKE ACTION',
      current: 'Current',
      target: 'Target',
      variance: 'Variance',
      history: 'Historical Breakdown',
      nodeDetails: 'Node Details',
      manageWms: 'Manage WMS',
      dispatchFleet: 'Dispatch Fleet',
      auditTrail: 'View System Audit Trail',
      origin: 'Origin',
      time: 'Time',
      stats: [
        { label: 'Total Throughput', value: '12,450', trend: '+12.5%', icon: Package, color: 'text-porteo-blue', tab: 'wms-ops', detail: 'Units processed across all hubs in the last 24h.' },
        { label: 'Fleet Utilization', value: '94.2%', trend: '+2.1%', icon: Truck, color: 'text-porteo-orange', tab: 'fleet-tracking', detail: 'Percentage of active fleet currently on assigned routes.' },
        { label: 'Active Alerts', value: '3', trend: '-2', icon: AlertTriangle, color: 'text-amber-400', tab: 'dashboard', detail: 'Critical system alerts requiring immediate attention.' },
        { label: 'SLA Compliance', value: '99.8%', trend: '+0.2%', icon: ShieldCheck, color: 'text-emerald-400', tab: 'finance', detail: 'On-time delivery performance against customer contracts.' },
      ],
      nodes: [
        { node: 'MEX Hub', status: 'Optimal', load: 85, color: 'bg-emerald-400', market: 'MEXICO', details: { workers: 142, docks: 12, pending: 45, throughput: 1250 } },
        { node: 'USA Hub', status: 'High Load', load: 92, color: 'bg-porteo-orange', market: 'USA', details: { workers: 210, docks: 18, pending: 156, throughput: 2840 } },
        { node: 'MEX Node', status: 'Optimal', load: 42, color: 'bg-emerald-400', market: 'MEXICO', details: { workers: 65, docks: 6, pending: 12, throughput: 450 } },
        { node: 'USA Node', status: 'Maintenance', load: 15, color: 'bg-amber-400', market: 'USA', details: { workers: 12, docks: 4, pending: 0, throughput: 85 } },
      ]
    },
    es: {
      title: 'Torre de Control',
      subtitle: 'Operaciones Globales y Monitoreo en Tiempo Real',
      liveSystem: 'Sistema en Vivo',
      performance: 'Analítica de Rendimiento',
      deepDive: 'INMERSIÓN PROFUNDA',
      activeOps: 'Operaciones Activas',
      globalLog: 'Registro de Eventos Globales',
      viewAll: 'Ver Todos los Registros',
      throughput: 'Rendimiento Total',
      utilization: 'Utilización de Flota',
      alerts: 'Alertas Activas',
      sla: 'Cumplimiento de SLA',
      optimal: 'Óptimo',
      highLoad: 'Carga Alta',
      maintenance: 'Mantenimiento',
      workers: 'Trabajadores',
      docks: 'Andenes',
      pending: 'Pedidos Pendientes',
      recommendations: 'Recomendaciones Operativas',
      takeAction: 'TOMAR ACCIÓN',
      current: 'Actual',
      target: 'Objetivo',
      variance: 'Variación',
      history: 'Desglose Histórico',
      nodeDetails: 'Detalles del Nodo',
      manageWms: 'Gestionar WMS',
      dispatchFleet: 'Despachar Flota',
      auditTrail: 'Ver Registro de Auditoría del Sistema',
      origin: 'Origen',
      time: 'Hora',
      stats: [
        { label: 'Rendimiento Total', value: '12,450', trend: '+12.5%', icon: Package, color: 'text-porteo-blue', tab: 'wms-ops', detail: 'Unidades procesadas en todos los centros en las últimas 24h.' },
        { label: 'Utilización de Flota', value: '94.2%', trend: '+2.1%', icon: Truck, color: 'text-porteo-orange', tab: 'fleet-tracking', detail: 'Porcentaje de flota activa actualmente en rutas asignadas.' },
        { label: 'Alertas Activas', value: '3', trend: '-2', icon: AlertTriangle, color: 'text-amber-400', tab: 'dashboard', detail: 'Alertas críticas del sistema que requieren atención inmediata.' },
        { label: 'Cumplimiento de SLA', value: '99.8%', trend: '+0.2%', icon: ShieldCheck, color: 'text-emerald-400', tab: 'finance', detail: 'Rendimiento de entrega a tiempo frente a contratos de clientes.' },
      ],
      nodes: [
        { node: 'MEX Hub', status: 'Óptimo', load: 85, color: 'bg-emerald-400', market: 'MEXICO', details: { workers: 142, docks: 12, pending: 45, throughput: 1250 } },
        { node: 'USA Hub', status: 'Carga Alta', load: 92, color: 'bg-porteo-orange', market: 'USA', details: { workers: 210, docks: 18, pending: 156, throughput: 2840 } },
        { node: 'MEX Nodo', status: 'Óptimo', load: 42, color: 'bg-emerald-400', market: 'MEXICO', details: { workers: 65, docks: 6, pending: 12, throughput: 450 } },
        { node: 'USA Nodo', status: 'Mantenimiento', load: 15, color: 'bg-amber-400', market: 'USA', details: { workers: 12, docks: 4, pending: 0, throughput: 85 } },
      ]
    }
  }[lang];

  const stats = t.stats;
  const allNodes = t.nodes;

  const nodes = allNodes.filter(n => n.market === market);

  const getRecommendations = (metric: string) => {
    const loc = market === 'MEXICO' ? 'MEX' : 'USA';
    const isEs = lang === 'es';
    
    // Simulated Reactive "ML" Engine
    const currentVal = parseInt(stats.find(s => s.label === metric || (isEs && s.label === metric))?.value.replace(/,/g, '') || '0');
    const targetVal = 11800;
    const variance = currentVal - targetVal;
    
    if (isEs && market === 'MEXICO') {
      switch (metric) {
        case 'Rendimiento Total':
          return [
            { 
              text: variance > 0 
                ? `Rendimiento excedido por ${variance} unidades. Optimizar asignación de AGVs (Cumplimiento NOM-035).` 
                : `Rendimiento bajo el objetivo por ${Math.abs(variance)} unidades. Desplegar 5 AGVs adicionales a la Zona B.`, 
              action: 'wms-ops', 
              icon: Zap 
            },
            { text: `Transferir 15% del volumen de entrada al Nodo MEX para balancear carga según leyes locales.`, action: 'adv-logistics', icon: TrendingUp },
            { text: `Auditar cuello de botella en Andén 4 en Hub MEX (Revisión de Aduana).`, action: 'wms-ops', icon: AlertTriangle }
          ];
        case 'Utilización de Flota':
          return [
            { text: `Optimizar rutas de retorno para 12 camiones en el corredor MEX (Carta Porte Digital).`, action: 'fleet-routes', icon: Navigation },
            { text: 'Programar mantenimiento preventivo para 3 unidades inactivas (Verificación Ambiental).', action: 'fleet-tracking', icon: Activity },
            { text: `Aumentar turnos de conductores para ruta MEX debido a retrasos en casetas.`, action: 'fleet-tracking', icon: Users }
          ];
        case 'Alertas Activas':
          return [
            { text: `Resolver alta latencia en nodo de red MEX (Protocolo de Seguridad SAT).`, action: 'dashboard', icon: ShieldCheck },
            { text: `Conciliar discrepancia de inventario en Hub MEX (Auditoría Fiscal).`, action: 'wms-ops', icon: Package },
            { text: `Actualizar firmware en 4 estaciones de escaneo en MEX (Cumplimiento de Privacidad).`, action: 'dashboard', icon: Cpu }
          ];
        case 'Cumplimiento de SLA':
          return [
            { text: `Revisar contratos de clientes MEX para penalizaciones por retraso.`, action: 'finance', icon: FileText },
            { text: `Acelerar despacho en Hub MEX para cumplir ventana de entrega local.`, action: 'wms-ops', icon: Zap },
            { text: `Validar documentación de exportación en Nodo MEX.`, action: 'analytics', icon: ShieldCheck }
          ];
        case 'Performance Analytics':
        case 'Analítica de Rendimiento':
          return [
            { text: 'Realizar auditoría laboral en Hub MEX (Cumplimiento LFT).', action: 'adv-logistics', icon: Users },
            { text: 'Auditar andenes en Hub MEX para optimizar recepción.', action: 'wms-ops', icon: Warehouse },
            { text: 'Ver análisis de tendencia granular en Analytics.', action: 'analytics', icon: TrendingUp }
          ];
        default: return [];
      }
    }

    // Default English or non-Mexico Spanish
    switch (metric) {
      case 'Total Throughput':
      case 'Rendimiento Total':
        return [
          { 
            text: variance > 0 
              ? `Throughput exceeded by ${variance} units. Optimizing AGV allocation for efficiency.` 
              : `Throughput below target by ${Math.abs(variance)} units. Deploy 5 additional AGVs to Zone B.`, 
            action: 'wms-ops', 
            icon: Zap 
          },
          { text: `Shift 15% of inbound volume to ${loc} Node to balance load.`, action: 'adv-logistics', icon: TrendingUp },
          { text: `Audit bottleneck at Dock 4 in ${loc} Hub.`, action: 'wms-ops', icon: AlertTriangle }
        ];
      case 'Fleet Utilization':
      case 'Utilización de Flota':
        return [
          { text: `Optimize backhaul routes for 12 trucks in ${loc} corridor.`, action: 'fleet-routes', icon: Navigation },
          { text: 'Schedule preventive maintenance for 3 idling units.', action: 'fleet-tracking', icon: Activity },
          { text: `Increase driver shifts for ${loc} route due to backlog.`, action: 'fleet-tracking', icon: Users }
        ];
      case 'Active Alerts':
      case 'Alertas Activas':
        return [
          { text: `Resolve high latency in ${loc} network node.`, action: 'dashboard', icon: ShieldCheck },
          { text: `Acknowledge inventory discrepancy in ${loc} Hub.`, action: 'wms-ops', icon: Package },
          { text: `Update firmware on 4 scanning stations in ${loc}.`, action: 'dashboard', icon: Cpu }
        ];
      case 'SLA Compliance':
      case 'Cumplimiento de SLA':
        return [
          { text: `Review ${loc} customer contracts for late delivery penalties.`, action: 'finance', icon: ShieldCheck },
          { text: `Expedite dispatch at ${loc} Hub to meet delivery window.`, action: 'wms-ops', icon: Zap },
          { text: `Validate export documentation at ${loc} Node.`, action: 'analytics', icon: ShieldCheck }
        ];
      case 'Performance Analytics':
      case 'Analítica de Rendimiento':
        return [
          { text: `Perform labor audit at ${loc} Hub.`, action: 'adv-logistics', icon: Users },
          { text: `Audit docks at ${loc} Hub for reception optimization.`, action: 'wms-ops', icon: Warehouse },
          { text: 'View granular trend analysis in Analytics.', action: 'analytics', icon: TrendingUp }
        ];
      default: return [];
    }
  };

  const allLogs = [
    { time: '16:32:10', event: lang === 'es' ? 'Sincronización AS/400 Exitosa' : 'AS/400 Sync Successful', node: 'MEX Hub', market: 'MEXICO', type: 'success', details: lang === 'es' ? 'Sincronización completa de inventario y pedidos completada en 4.2s. Arquitectura: IBM Power Systems. Conector: Porteo-AS400-v2.1.' : 'Full synchronization of inventory and orders completed in 4.2s. Architecture: IBM Power Systems. Connector: Porteo-AS400-v2.1.' },
    { time: '16:30:45', event: lang === 'es' ? 'Alta Latencia Detectada' : 'High Latency Detected', node: 'USA Hub', market: 'USA', type: 'warning', details: lang === 'es' ? 'Pico de latencia de 150ms detectado en el nodo USA Hub. Investigando enrutamiento de red. Latencia actual: 185ms (Objetivo: <50ms).' : 'Latency spike of 150ms detected in node USA Hub. Investigating network routing. Current latency: 185ms (Target: <50ms).' },
    { time: '16:28:12', event: lang === 'es' ? 'Nueva Ruta de Flota Optimizada' : 'New Fleet Route Optimized', node: 'Global', market: 'BOTH', type: 'info', details: lang === 'es' ? 'El motor de IA sugirió 12 nuevas rutas, ahorrando un estimado del 15% en costos de combustible. Impacto: 45 unidades afectadas.' : 'AI engine suggested 12 new routes, saving an estimated 15% in fuel costs. Impact: 45 units affected.' },
    { time: '16:25:00', event: lang === 'es' ? 'Auditoría de Inventario Completa' : 'Inventory Audit Complete', node: 'MEX Node', market: 'MEXICO', type: 'success', details: lang === 'es' ? 'La auditoría física coincidió con los registros del sistema con un 99.9% de precisión. 12,450 artículos verificados.' : 'Physical audit matched system records with 99.9% accuracy. 12,450 items verified.' },
  ];

  const filteredLogs = allLogs.filter(l => l.market === market || l.market === 'BOTH');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{t.title}</h1>
          <p className="text-white/60 mt-2">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-400/10 rounded-xl border border-emerald-400/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t.liveSystem}</span>
          </div>
          <button 
            onClick={() => setShowGlobalMap(true)}
            className="p-3 glass rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-porteo-blue/50 transition-all group"
          >
            <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.button 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => {
              setSelectedMetric(stat.label);
              setDrillDownLevel('summary');
            }}
            className="glass p-6 rounded-3xl border border-white/10 hover:border-porteo-blue/50 hover:bg-white/5 transition-all text-left group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-porteo-orange'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-sm text-white/40 font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-porteo-blue opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{lang === 'es' ? 'VER GRANULARIDAD' : 'VIEW GRANULARITY'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-white">{t.performance}</h3>
              <button 
                onClick={() => {
                  setSelectedMetric(t.performance);
                  setDrillDownLevel('summary');
                }}
                className="px-2 py-1 bg-porteo-blue/10 rounded text-[10px] font-bold text-porteo-blue hover:bg-porteo-blue/20 transition-colors"
              >
                {t.deepDive}
              </button>
              <button 
                onClick={handleDataRefresh}
                className={`p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all ${isRefreshing ? 'animate-spin text-porteo-blue' : ''}`}
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                <button 
                  onClick={() => setChartType('area')}
                  className={`p-2 rounded-lg transition-all ${chartType === 'area' ? 'bg-porteo-blue text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg transition-all ${chartType === 'bar' ? 'bg-porteo-blue text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg transition-all ${chartType === 'line' ? 'bg-porteo-blue text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button 
                  onClick={() => setActiveMetric('throughput')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeMetric === 'throughput' ? 'bg-porteo-blue text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  {lang === 'es' ? 'Rendimiento' : 'Throughput'}
                </button>
                <button 
                  onClick={() => setActiveMetric('efficiency')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeMetric === 'efficiency' ? 'bg-porteo-blue text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  {lang === 'es' ? 'Eficiencia' : 'Efficiency'}
                </button>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full cursor-pointer" onClick={() => {
            setSelectedMetric(t.performance);
            setDrillDownLevel('summary');
          }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={currentData}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#004A99" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#004A99" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => activeMetric === 'efficiency' ? `${value}%` : value} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey={activeMetric} stroke="#004A99" strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
                </AreaChart>
              ) : chartType === 'bar' ? (
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey={activeMetric} fill="#004A99" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey={activeMetric} stroke="#004A99" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-xl font-bold text-white">{t.activeOps}</h3>
          <div className="space-y-4">
            {nodes.map((node, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedNode(node)}
                className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all space-y-3 text-left group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white group-hover:text-porteo-blue transition-colors">{node.node}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${node.color.replace('bg-', 'text-')}`}>
                    {node.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>{lang === 'es' ? 'Carga de Capacidad' : 'Capacity Load'}</span>
                    <span>{node.load}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${node.load}%` }}
                      className={`h-full ${node.color}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-white/20 group-hover:text-porteo-blue transition-colors">
                  <span>{lang === 'es' ? 'VER DETALLES DEL NODO' : 'VIEW NODE DETAILS'}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white">{t.globalLog}</h3>
          <button 
            onClick={() => setSelectedLog({ type: 'all' })}
            className="text-xs font-bold text-porteo-blue hover:underline"
          >
            {t.viewAll}
          </button>
        </div>
        <div className="space-y-4">
          {filteredLogs.map((log, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedLog(log)}
              className="w-full flex items-center gap-6 p-4 hover:bg-white/5 transition-colors rounded-xl group text-left"
            >
              <span className="text-xs font-mono text-white/20">{log.time}</span>
              <div className={`w-2 h-2 rounded-full ${
                log.type === 'success' ? 'bg-emerald-400' : 
                log.type === 'warning' ? 'bg-porteo-orange' : 'bg-porteo-blue'
              }`} />
              <span className="flex-1 text-sm font-medium text-white/80">{log.event}</span>
              <span className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors">{log.node}</span>
              <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-porteo-blue transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Drill Down Modals */}
      <AnimatePresence>
        {selectedMetric && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedMetric(null);
                setDrillDownLevel('summary');
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  {(drillDownLevel === 'granular' || drillDownLevel === 'micro') && (
                    <button 
                      onClick={() => setDrillDownLevel(drillDownLevel === 'micro' ? 'granular' : 'summary')}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-white rotate-180" />
                    </button>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                      {selectedMetric} {drillDownLevel === 'granular' ? (lang === 'es' ? '- Vista Granular' : '- Granular View') : drillDownLevel === 'micro' ? (lang === 'es' ? '- Micro-Análisis' : '- Micro-Analysis') : ''}
                    </h3>
                    <p className="text-white/40 text-sm">
                      {drillDownLevel === 'micro' ? (lang === 'es' ? 'Análisis detallado por minuto y desglose de sensores' : 'Per-minute detailed analysis and sensor breakdown') : drillDownLevel === 'granular' ? (lang === 'es' ? 'Inmersión profunda en puntos de datos específicos y anomalías' : 'Deep dive into specific data points and anomalies') : (lang === 'es' ? 'Granularidad detallada e información operativa' : 'Detailed granularity and operational insights')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedMetric(null);
                    setDrillDownLevel('summary');
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto flex-1 space-y-8">
                {drillDownLevel === 'micro' ? (
                  <div className="space-y-8">
                    <div className="glass p-8 rounded-[32px] border border-white/10">
                      <h4 className="text-lg font-bold text-white mb-6">{lang === 'es' ? 'Desglose por Minuto' : 'Per-Minute Breakdown'}</h4>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[...Array(20)].map((_, i) => ({ time: `${i}m`, val: 80 + Math.random() * 20 }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                            <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} />
                            <YAxis stroke="#ffffff20" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10' }} />
                            <Line type="stepAfter" dataKey="val" stroke="#004A99" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: lang === 'es' ? 'Latencia de Sensor' : 'Sensor Latency', value: '12ms' },
                        { label: lang === 'es' ? 'Carga de CPU' : 'CPU Load', value: '42%' },
                        { label: lang === 'es' ? 'Uso de Memoria' : 'Memory Usage', value: '1.2GB' }
                      ].map((item, i) => (
                        <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-xs text-white/40 mb-1">{item.label}</p>
                          <p className="text-2xl font-bold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : drillDownLevel === 'granular' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div 
                        className="glass p-8 rounded-[32px] border border-white/10 cursor-pointer hover:border-porteo-blue/50 transition-all group"
                        onClick={() => setDrillDownLevel('micro')}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-porteo-blue" />
                            {lang === 'es' ? 'Análisis de Tendencias' : 'Trend Analysis'}
                          </h4>
                          <span className="text-[10px] font-bold text-porteo-blue opacity-0 group-hover:opacity-100 transition-opacity">
                            {lang === 'es' ? 'CLIC PARA MICRO-ANÁLISIS' : 'CLICK FOR MICRO-ANALYSIS'}
                          </span>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={currentData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                              />
                              <Line type="monotone" dataKey={currentMetricKey} stroke="#004A99" strokeWidth={4} dot={{ fill: '#004A99', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                              {currentMetricKey === 'throughput' && <Line type="monotone" dataKey="efficiency" stroke="#F27D26" strokeWidth={4} dot={{ fill: '#F27D26', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="glass p-8 rounded-[32px] border border-white/10 space-y-6">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-porteo-orange" />
                          {lang === 'es' ? 'Información de IA' : 'AI Insights'}
                        </h4>
                        <div className="space-y-4">
                          {[
                            { title: lang === 'es' ? 'Detección de Anomalías' : 'Anomaly Detection', desc: lang === 'es' ? 'Se detectó un patrón inusual en el Hub USA a las 14:00.' : 'Unusual pattern detected in USA Hub at 14:00.', status: 'CRITICAL', color: 'text-porteo-orange', action: 'wms-ops' },
                            { title: lang === 'es' ? 'Mantenimiento Predictivo' : 'Predictive Maintenance', desc: lang === 'es' ? 'El sistema sugiere mantenimiento para el Andén 4 en las próximas 48h.' : 'System suggests maintenance for Dock 4 within next 48h.', status: 'ADVISORY', color: 'text-porteo-blue', action: 'strategic-res' },
                            { title: lang === 'es' ? 'Optimización de Carga' : 'Load Optimization', desc: lang === 'es' ? 'El balanceo de carga podría mejorar la eficiencia en un 12%.' : 'Load balancing could improve efficiency by 12%.', status: 'OPTIMAL', color: 'text-emerald-400', action: 'admin' },
                          ].map((insight, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-white">{insight.title}</span>
                                <span className={`text-[8px] font-bold uppercase tracking-widest ${insight.color}`}>{insight.status}</span>
                              </div>
                              <p className="text-[10px] text-white/40 mb-3">{insight.desc}</p>
                              <button 
                                onClick={() => {
                                  setActiveTab?.(insight.action);
                                  setSelectedMetric(null);
                                }}
                                className="w-full py-2 bg-porteo-blue/10 hover:bg-porteo-blue text-porteo-blue hover:text-white text-[10px] font-bold rounded-lg transition-all uppercase"
                              >
                                {lang === 'es' ? 'Tomar Acción' : 'Take Action'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-white">{lang === 'es' ? 'Puntos de Datos Granulares' : 'Granular Data Points'}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: lang === 'es' ? 'Tiempo de Ciclo' : 'Cycle Time', value: '14.2 min', trend: '-2.1%' },
                          { label: lang === 'es' ? 'Tasa de Error' : 'Error Rate', value: '0.02%', trend: '-0.01%' },
                          { label: lang === 'es' ? 'Uptime' : 'Uptime', value: '99.98%', trend: '+0.01%' },
                          { label: lang === 'es' ? 'Costo/Unidad' : 'Cost/Unit', value: '$0.42', trend: '-$0.05' },
                        ].map((d, i) => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{d.label}</p>
                            <p className="text-xl font-bold text-white">{d.value}</p>
                            <p className="text-[8px] font-bold text-emerald-400 mt-1">{d.trend}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveTab?.('ai');
                        setSelectedMetric(null);
                      }}
                      className="w-full p-6 bg-porteo-blue text-white rounded-[24px] font-bold text-lg hover:bg-porteo-blue/80 transition-all flex items-center justify-center gap-3 group"
                    >
                      <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      {lang === 'es' ? 'EJECUTAR OPTIMIZACIÓN GLOBAL' : 'EXECUTE GLOBAL OPTIMIZATION'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: t.current, value: summary.current, trend: '+5.2%', color: 'text-porteo-blue', detail: lang === 'es' ? 'Datos agregados en tiempo real de todos los nodos.' : 'Real-time aggregated data from all nodes.' },
                        { label: t.target, value: summary.target, trend: 'Exceeded', color: 'text-emerald-400', detail: lang === 'es' ? 'Objetivo operativo definido para el período actual.' : 'Defined operational goal for the current period.' },
                        { label: t.variance, value: summary.variance, trend: 'Positive', color: 'text-porteo-orange', detail: lang === 'es' ? 'Diferencia entre el rendimiento real y el objetivo.' : 'Difference between actual performance and target.' },
                      ].map((s, i) => (
                        <button 
                          key={i} 
                          onClick={() => setDrillDownLevel('granular')}
                          className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-porteo-blue/50 hover:bg-white/10 transition-all text-left group"
                        >
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1 group-hover:text-porteo-blue transition-colors">{s.label}</p>
                          <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-[10px] text-white/20 mt-2 group-hover:text-white/40 transition-colors">{s.detail}</p>
                          <div className="mt-4 flex items-center gap-1 text-[8px] font-bold text-porteo-blue opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>{lang === 'es' ? 'EXPLORAR DATOS' : 'EXPLORE DATA'}</span>
                            <ArrowUpRight className="w-2 h-2" />
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest opacity-40">{t.history}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                            <Clock className="w-3 h-3 text-white/40" />
                            <input 
                              type="date" 
                              value={dateRange.from}
                              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                              className="bg-transparent text-[10px] text-white/60 outline-none border-none"
                            />
                            <span className="text-white/20 text-[10px]">-</span>
                            <input 
                              type="date" 
                              value={dateRange.to}
                              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                              className="bg-transparent text-[10px] text-white/60 outline-none border-none"
                            />
                          </div>
                          <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                            {(['24h', '7d', '30d'] as const).map((f) => (
                              <button 
                                key={f}
                                onClick={() => setGraphFilter(f)}
                                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${graphFilter === f ? 'bg-porteo-blue text-white' : 'text-white/40 hover:text-white'}`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div 
                        className="h-64 w-full bg-white/5 rounded-3xl p-6 border border-white/10 cursor-crosshair hover:border-porteo-blue/30 transition-colors group relative"
                        onClick={() => setDrillDownLevel('granular')}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={currentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                              itemStyle={{ color: '#fff' }}
                              cursor={{ fill: '#ffffff05' }}
                            />
                            <Bar dataKey={currentMetricKey} fill="#004A99" radius={[4, 4, 0, 0]}>
                              {currentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 3 ? '#F27D26' : '#004A99'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="px-4 py-2 bg-porteo-blue text-white text-[10px] font-bold rounded-full shadow-2xl">
                            {lang === 'es' ? 'CLIC PARA PROFUNDIZAR' : 'CLICK TO DRILL DOWN'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-white">{t.recommendations}</h4>
                      <div className="space-y-3">
                        {getRecommendations(selectedMetric).map((rec, i) => (
                          <button 
                            key={i}
                            onClick={() => {
                              setActiveTab?.(rec.action);
                              setSelectedMetric(null);
                            }}
                            className="w-full p-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 hover:border-porteo-blue/50 transition-all flex justify-between items-center group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-porteo-blue/10 rounded-lg text-porteo-blue group-hover:bg-porteo-blue group-hover:text-white transition-all">
                                <rec.icon className="w-4 h-4" />
                              </div>
                              <span>{rec.text}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-porteo-blue opacity-0 group-hover:opacity-100 transition-all">
                              <span>{lang === 'es' ? 'EJECUTAR AHORA' : 'EXECUTE NOW'}</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${selectedNode.color} animate-pulse`} />
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{selectedNode.node}</h3>
                    <p className="text-white/40 text-sm">{lang === 'es' ? 'Salud del Nodo' : 'Node Health'}: {selectedNode.status}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t.workers, value: selectedNode.details.workers, icon: Users, tab: 'adv-logistics', action: lang === 'es' ? 'Logística Avanzada' : 'Advanced Logistics' },
                    { label: t.docks, value: selectedNode.details.docks, icon: Warehouse, tab: 'wms-ops', action: lang === 'es' ? 'Operaciones WMS' : 'WMS Operations' },
                    { label: t.pending, value: selectedNode.details.pending, icon: Package, tab: 'wms-inventory', action: lang === 'es' ? 'Inventario' : 'Inventory' },
                    { label: lang === 'es' ? 'Rendimiento por Hora' : 'Hourly Throughput', value: selectedNode.details.throughput, icon: Activity, tab: 'analytics', action: lang === 'es' ? 'Analítica' : 'Analytics' },
                  ].map((d, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        setActiveTab?.(d.tab);
                        setSelectedNode(null);
                      }}
                      className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-porteo-blue/30 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-white/40 group-hover:text-porteo-blue transition-colors">
                          <d.icon className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{d.label}</span>
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-white/10 group-hover:text-porteo-blue transition-colors" />
                      </div>
                      <p className="text-xl font-bold text-white">{d.value}</p>
                      <p className="text-[8px] font-bold text-porteo-blue mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase">{lang === 'es' ? 'Ir a' : 'Go to'} {d.action}</p>
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest opacity-40">{lang === 'es' ? 'Acciones del Nodo' : 'Node Actions'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        setActiveTab?.('wms-ops');
                        setSelectedNode(null);
                      }}
                      className="p-4 bg-porteo-blue text-white rounded-2xl font-bold text-sm hover:bg-porteo-blue/80 transition-all flex flex-col items-center gap-2 group"
                    >
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4" />
                        <span>{t.manageWms}</span>
                      </div>
                      <span className="text-[8px] opacity-60 group-hover:opacity-100 transition-opacity uppercase font-bold">{lang === 'es' ? 'Optimizar Flujo de Almacén' : 'Optimize Warehouse Flow'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab?.('fleet-tracking');
                        setSelectedNode(null);
                      }}
                      className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 hover:border-porteo-blue/50 transition-all flex flex-col items-center gap-2 group"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <span>{t.dispatchFleet}</span>
                      </div>
                      <span className="text-[8px] opacity-40 group-hover:opacity-100 transition-opacity uppercase font-bold text-porteo-blue">{lang === 'es' ? 'Despacho de Rutas en Tiempo Real' : 'Real-time Route Dispatch'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${selectedLog.type === 'warning' ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-porteo-blue/20 text-porteo-blue'}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                      {selectedLog.type === 'all' ? (lang === 'es' ? 'Registros de Eventos Globales' : 'Global Event Logs') : (lang === 'es' ? 'Detalle del Evento' : 'Event Detail')}
                    </h3>
                    <p className="text-white/40 text-sm">
                      {selectedLog.type === 'all' ? (lang === 'es' ? 'Historial completo de operaciones del sistema' : 'Complete history of system operations') : `${lang === 'es' ? 'Marca de tiempo' : 'Timestamp'}: ${selectedLog.time}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {selectedLog.type === 'all' ? (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {allLogs.filter(l => l.market === market || l.market === 'BOTH').map((log, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs font-mono text-white/20">{log.time}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'success' ? 'bg-emerald-400' : log.type === 'warning' ? 'bg-porteo-orange' : 'bg-porteo-blue'}`} />
                        <span className="flex-1 text-sm text-white/80">{log.event}</span>
                        <span className="text-[10px] font-bold text-white/40">{log.node}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{lang === 'es' ? 'Descripción del Evento' : 'Event Description'}</span>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${selectedLog.type === 'success' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-porteo-orange/10 text-porteo-orange'}`}>
                          {selectedLog.type}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white">{selectedLog.event}</h4>
                      <p className="text-sm text-white/60 leading-relaxed">{selectedLog.details}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Nodo de Origen' : 'Origin Node'}</p>
                        <p className="text-lg font-bold text-white">{selectedLog.node}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Hora del Sistema' : 'System Time'}</p>
                        <p className="text-lg font-bold text-white">{selectedLog.time}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab?.('admin');
                        setSelectedLog(null);
                      }}
                      className="w-full p-4 bg-porteo-blue text-white rounded-2xl font-bold text-sm hover:bg-porteo-blue/80 transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {lang === 'es' ? 'Ver Pista de Auditoría del Sistema' : 'View System Audit Trail'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showGlobalMap && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGlobalMap(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[80vh]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  <Globe className="w-6 h-6 text-porteo-blue" />
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{lang === 'es' ? 'Mapa de Operaciones Globales' : 'Global Operations Map'}</h3>
                    <p className="text-white/40 text-sm">{lang === 'es' ? 'Conectividad de nodos en tiempo real y flujo de cadena de suministro' : 'Real-time node connectivity and supply chain flow'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGlobalMap(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="flex-1 relative bg-[#050505] p-12 overflow-hidden">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-porteo-blue rounded-full animate-ping" />
                  <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-porteo-orange rounded-full animate-ping" />
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <svg className="w-full h-full stroke-white/10 fill-none" viewBox="0 0 800 400">
                    <path d="M100,100 Q400,50 700,100 T600,300 Q300,350 100,300 Z" />
                    <path d="M150,150 L250,120 L400,180 L550,140 L650,200" strokeDasharray="5,5" />
                  </svg>
                </div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white">{lang === 'es' ? 'Corredores Activos' : 'Active Corridors'}</h4>
                    <div className="space-y-4">
                      {[
                        { route: 'MX-CDMX <-> USA-TX', status: lang === 'es' ? 'Tráfico Alto' : 'High Traffic', time: '4.2h', color: 'text-porteo-orange' },
                        { route: 'USA-TX <-> USA-CA', status: lang === 'es' ? 'Óptimo' : 'Optimal', time: '12.5h', color: 'text-emerald-400' },
                        { route: 'MX-MTY <-> MX-CDMX', status: lang === 'es' ? 'Óptimo' : 'Optimal', time: '8.1h', color: 'text-emerald-400' },
                      ].map((r, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            setActiveTab?.('fleet-routes');
                            setShowGlobalMap(false);
                          }}
                          className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/10 hover:border-porteo-blue/50 transition-all group"
                        >
                          <div className="text-left">
                            <p className="text-sm font-bold text-white group-hover:text-porteo-blue transition-colors">{r.route}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${r.color}`}>{r.status}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-sm font-bold text-white">{r.time}</p>
                              <p className="text-[10px] text-white/20 uppercase font-bold">{lang === 'es' ? 'Tránsito Promedio' : 'Avg Transit'}</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-porteo-blue transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col justify-center items-center text-center space-y-4">
                    <Navigation className="w-12 h-12 text-porteo-blue animate-bounce" />
                    <h4 className="text-xl font-bold text-white">{lang === 'es' ? 'Optimización de Rutas Activa' : 'Route Optimization Active'}</h4>
                    <p className="text-sm text-white/40 max-w-xs">
                      {lang === 'es' ? 'El motor de IA está recalculando actualmente 14 rutas globales basadas en datos de clima y tráfico en tiempo real.' : 'AI engine is currently recalculating 14 global routes based on real-time weather and traffic data.'}
                    </p>
                    <button 
                      onClick={() => {
                        setActiveTab?.('fleet-routes');
                        setShowGlobalMap(false);
                      }}
                      className="px-6 py-3 bg-porteo-blue text-white rounded-xl font-bold text-sm hover:bg-porteo-blue/80 transition-all"
                    >
                      {lang === 'es' ? 'Abrir Centro de Optimización' : 'Open Optimization Hub'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
