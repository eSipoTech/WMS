import React from 'react';
import { useAuthStore } from '../store';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Cpu, 
  DollarSign, 
  ChevronRight,
  Globe,
  Activity,
  ChevronDown,
  Warehouse,
  ClipboardList,
  BarChart3,
  Map as MapIcon,
  Navigation,
  Box,
  Factory,
  Truck as PatioIcon,
  FileText,
  Briefcase,
  Search,
  BrainCircuit,
  Microscope,
  TrendingUp,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  market?: 'USA' | 'MEXICO';
  setMarket?: (market: 'USA' | 'MEXICO') => void;
  lang?: 'en' | 'es';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, market = 'MEXICO', setMarket, lang = 'en' }) => {
  const { user, logout } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['wms', 'commercial', 'fleet', 'ai']);

  const t = {
    en: {
      dashboard: 'Dashboard',
      controlTower: 'Control Tower',
      wms: 'WMS (Logistics)',
      warehouseOps: 'Warehouse Ops',
      visualization3d: '3D Visualization',
      patioMgmt: 'Patio Management',
      assemblyLine: 'Assembly Line',
      tplWorkflow: 'TPL Workflow',
      commercial: 'Commercial',
      crm: 'CRM (B2B)',
      commMgmt: 'Commercial Mgmt',
      tplBilling: 'TPL Billing',
      fleetMgmt: 'Fleet Mgmt',
      liveTracking: 'Live Tracking',
      routeOpt: 'Route Optimization',
      advLogistics: 'Advanced Logistics',
      finance: 'Finance',
      analytics: 'Analytics',
      ai: 'AI & Intelligence',
      aiPlatform: 'AI Platform',
      intelAgents: 'Intelligence Agents',
      strategicRes: 'Strategic Research',
      chat: 'Internal Chat',
      admin: 'Admin Panel',
      node: 'Node',
      online: 'Online',
      enterpriseWms: 'WMS Platform'
    },
    es: {
      dashboard: 'Tablero',
      controlTower: 'Torre de Control',
      wms: 'WMS (Logística)',
      warehouseOps: 'Ops de Almacén',
      visualization3d: 'Visualización 3D',
      patioMgmt: 'Gestión de Patio',
      assemblyLine: 'Línea de Ensamblaje',
      tplWorkflow: 'Flujo TPL',
      commercial: 'Comercial',
      crm: 'CRM (B2B)',
      commMgmt: 'Gestión Comercial',
      tplBilling: 'Facturación TPL',
      fleetMgmt: 'Gestión de Flota',
      liveTracking: 'Rastreo en Vivo',
      routeOpt: 'Optimización de Rutas',
      advLogistics: 'Logística Avanzada',
      finance: 'Finanzas',
      analytics: 'Analítica',
      ai: 'IA e Inteligencia',
      aiPlatform: 'Plataforma IA',
      intelAgents: 'Agentes de Inteligencia',
      strategicRes: 'Investigación Estratégica',
      chat: 'Chat Interno',
      admin: 'Panel de Admin',
      node: 'Nodo',
      online: 'En Línea',
      enterpriseWms: 'Plataforma WMS'
    }
  }[lang];

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'control-tower', label: t.controlTower, icon: Activity },
    { 
      id: 'wms', 
      label: t.wms, 
      icon: Package,
      subItems: [
        { id: 'wms-ops', label: t.warehouseOps, icon: ClipboardList },
        { id: 'wms-3d', label: t.visualization3d, icon: Box },
        { id: 'wms-patio', label: t.patioMgmt, icon: PatioIcon },
        { id: 'wms-assembly', label: t.assemblyLine, icon: Factory },
        { id: 'wms-tpl', label: t.tplWorkflow, icon: RefreshCw },
      ]
    },
    { 
      id: 'commercial', 
      label: t.commercial, 
      icon: Briefcase,
      subItems: [
        { id: 'crm', label: t.crm, icon: Users },
        { id: 'comm-mgmt', label: t.commMgmt, icon: TrendingUp },
        { id: 'tpl-billing', label: t.tplBilling, icon: FileText },
      ]
    },
    { 
      id: 'fleet', 
      label: t.fleetMgmt, 
      icon: Truck,
      subItems: [
        { id: 'fleet-tracking', label: t.liveTracking, icon: MapIcon },
        { id: 'fleet-routes', label: t.routeOpt, icon: Navigation },
        { id: 'adv-logistics', label: t.advLogistics, icon: Globe },
      ]
    },
    { id: 'finance', label: t.finance, icon: DollarSign },
    { id: 'analytics', label: t.analytics, icon: BarChart3 },
    { 
      id: 'ai', 
      label: t.ai, 
      icon: Cpu,
      subItems: [
        { id: 'ai-platform', label: t.aiPlatform, icon: BrainCircuit },
        { id: 'intel-agents', label: t.intelAgents, icon: Zap },
        { id: 'strategic-res', label: t.strategicRes, icon: Microscope },
      ]
    },
    { id: 'chat', label: t.chat, icon: MessageSquare },
    { id: 'admin', label: t.admin, icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => !item.roles || item.roles.includes(user?.role || ''));

  return (
    <div className="w-72 h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col p-6 sticky top-0 overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="p-3 bg-porteo-blue/20 rounded-xl">
          <ShieldCheck className="w-8 h-8 text-porteo-blue" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Porteo Group</h2>
          <p className="text-xs text-white/40 uppercase tracking-widest">{t.enterpriseWms}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id || (item.subItems?.some(s => s.id === activeTab));
          const isExpanded = expandedMenus.includes(item.id);

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (item.subItems) {
                    toggleMenu(item.id);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  isActive && !item.subItems
                    ? 'bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-porteo-blue group-hover:scale-110 transition-transform'}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                {item.subItems ? (
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                ) : (
                  isActive && <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {item.subItems && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-12 space-y-1"
                  >
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${
                          activeTab === sub.id
                            ? 'text-white bg-white/10'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <sub.icon className={`w-4 h-4 ${activeTab === sub.id ? 'text-porteo-blue' : ''}`} />
                        {sub.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-porteo-blue to-porteo-orange p-[1px]">
            <div className="w-full h-full rounded-[11px] bg-[#0a0a0a] flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.[0]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-white/40 hover:text-porteo-orange transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={() => setMarket?.(market === 'MEXICO' ? 'USA' : 'MEXICO')}
          className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group w-full"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
            <span className="text-xs font-bold text-white/60">{t.node}: {market === 'MEXICO' ? 'MEX' : 'USA'}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase">{t.online}</span>
        </button>
      </div>
    </div>
  );
};
