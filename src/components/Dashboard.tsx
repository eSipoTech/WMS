import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  Users, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Zap,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const data = [
  { name: 'Mon', inbound: 40, outbound: 24, fleet: 12 },
  { name: 'Tue', inbound: 30, outbound: 13, fleet: 15 },
  { name: 'Wed', inbound: 20, outbound: 98, fleet: 18 },
  { name: 'Thu', inbound: 27, outbound: 39, fleet: 20 },
  { name: 'Fri', inbound: 18, outbound: 48, fleet: 22 },
  { name: 'Sat', inbound: 23, outbound: 38, fleet: 25 },
  { name: 'Sun', inbound: 34, outbound: 43, fleet: 28 },
];

interface DashboardProps {
  lang?: 'en' | 'es';
  market?: 'USA' | 'MEXICO';
  setMarket?: (market: 'USA' | 'MEXICO') => void;
  setActiveTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  lang = 'en', 
  market = 'USA', 
  setMarket, 
  setActiveTab 
}) => {
  const localizedData = React.useMemo(() => {
    const days = lang === 'es' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return data.map((d, i) => ({ ...d, name: days[i] }));
  }, [lang]);

  const t = {
    en: {
      title: 'Enterprise Dashboard',
      subtitle: 'Real-time Logistics & Business Intelligence',
      inventory: 'Total Inventory',
      fleet: 'Active Fleet',
      leads: 'B2B Leads',
      efficiency: 'AI Efficiency',
      logisticsPerf: 'Logistics Performance',
      openTower: 'OPEN CONTROL TOWER',
      inbound: 'Inbound',
      outbound: 'Outbound',
      systemAlerts: 'System Alerts',
      viewActivity: 'View All Activity',
      takeAction: 'TAKE ACTION',
      viewDetails: 'VIEW DETAILS',
      mex: 'MEX',
      usa: 'USA',
      alerts: [
        { type: 'CRITICAL', msg: 'Low stock on SKU-V8 in USA-TX', time: '2m ago', icon: AlertCircle, color: 'text-porteo-orange', tab: 'wms-inventory' },
        { type: 'INFO', msg: 'Sync with AS/400 completed', time: '15m ago', icon: CheckCircle2, color: 'text-emerald-400', tab: 'admin' },
        { type: 'WARNING', msg: 'Fleet Unit MX-123 delayed', time: '1h ago', icon: Clock, color: 'text-amber-400', tab: 'fleet-tracking' },
        { type: 'AI', msg: 'New optimization route suggested', time: '2h ago', icon: Zap, color: 'text-porteo-blue', tab: 'ai-platform' },
      ]
    },
    es: {
      title: 'Panel Empresarial',
      subtitle: 'Inteligencia de Negocios y Logística en Tiempo Real',
      inventory: 'Inventario Total',
      fleet: 'Flota Activa',
      leads: 'Prospectos B2B',
      efficiency: 'Eficiencia IA',
      logisticsPerf: 'Rendimiento Logístico',
      openTower: 'ABRIR TORRE DE CONTROL',
      inbound: 'Entrada',
      outbound: 'Salida',
      systemAlerts: 'Alertas del Sistema',
      viewActivity: 'Ver Toda la Actividad',
      takeAction: 'TOMAR ACCIÓN',
      viewDetails: 'VER DETALLES',
      mex: 'MEX',
      usa: 'USA',
      alerts: [
        { type: 'CRÍTICO', msg: 'Stock bajo en SKU-V8 en USA-TX', time: 'hace 2m', icon: AlertCircle, color: 'text-porteo-orange', tab: 'wms-inventory' },
        { type: 'INFO', msg: 'Sincronización con AS/400 completada', time: 'hace 15m', icon: CheckCircle2, color: 'text-emerald-400', tab: 'admin' },
        { type: 'AVISO', msg: 'Unidad de Flota MX-123 retrasada', time: 'hace 1h', icon: Clock, color: 'text-amber-400', tab: 'fleet-tracking' },
        { type: 'IA', msg: 'Nueva ruta de optimización sugerida', time: 'hace 2h', icon: Zap, color: 'text-porteo-blue', tab: 'ai-platform' },
      ]
    }
  }[lang];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{t.title}</h1>
          <p className="text-white/60 mt-2">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          <button 
            onClick={() => setMarket?.('MEXICO')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
              market === 'MEXICO' 
                ? "bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20" 
                : "text-white/40 hover:text-white/60"
            )}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-bold">{t.mex}</span>
          </button>
          <button 
            onClick={() => setMarket?.('USA')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
              market === 'USA' 
                ? "bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20" 
                : "text-white/40 hover:text-white/60"
            )}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-bold">{t.usa}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t.inventory, value: '1,240', icon: Package, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10', trend: '+12%', tab: 'wms-inventory' },
          { label: t.fleet, value: '42', icon: Truck, color: 'text-porteo-orange', bg: 'bg-porteo-orange/10', trend: '+5%', tab: 'fleet-tracking' },
          { label: t.leads, value: '18', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+24%', tab: 'crm' },
          { label: t.efficiency, value: '98.2%', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+1.5%', tab: 'ai-platform' },
        ].map((stat, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTab?.(stat.tab)}
            className="glass p-6 rounded-3xl border border-white/10 hover:border-porteo-blue/50 hover:bg-white/10 transition-all group text-left w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-emerald-400 text-xs font-bold">{stat.trend}</span>
            </div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-porteo-blue opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{t.viewDetails}</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div 
          className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group/chart"
          onClick={() => setActiveTab?.('control-tower')}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-white">{t.logisticsPerf}</h3>
              <div className="px-2 py-1 bg-porteo-blue/10 rounded text-[10px] font-bold text-porteo-blue opacity-0 group-hover/chart:opacity-100 transition-opacity">
                {t.openTower}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-porteo-blue" />
                <span className="text-xs text-white/60 font-bold">{t.inbound}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-porteo-orange" />
                <span className="text-xs text-white/60 font-bold">{t.outbound}</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={localizedData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="outbound" stroke="#FF6600" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8">{t.systemAlerts}</h3>
          <div className="space-y-6 flex-1">
            {t.alerts.map((alert, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTab?.(alert.tab)}
                className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group w-full text-left"
              >
                <div className={`p-2 rounded-lg bg-white/5 ${alert.color}`}>
                  <alert.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${alert.color}`}>{alert.type}</span>
                    <span className="text-[10px] text-white/20 font-bold">{alert.time}</span>
                  </div>
                  <p className="text-sm text-white/80 font-medium truncate">{alert.msg}</p>
                  <div className="mt-2 text-[10px] font-bold text-porteo-blue opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.takeAction}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setActiveTab?.('control-tower')}
            className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10"
          >
            {t.viewActivity}
          </button>
        </div>
      </div>
    </div>
  );
};
