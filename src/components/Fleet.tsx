import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Fuel, 
  DollarSign, 
  Activity, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Navigation,
  TrendingUp,
  Settings,
  X,
  FileText,
  Download,
  Zap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Leaflet icon fix for Vite/React
const icon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-8 h-8 bg-porteo-blue rounded-full border-2 border-white flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: 'AVAILABLE' | 'ON_ROUTE' | 'MAINTENANCE' | 'OFFLINE';
  costPerKm: number;
  lat: number;
  lng: number;
  driver: string;
  load: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  bioStatus: 'READY' | 'WARNING' | 'ERROR';
  fatigue: number;
}

interface FleetProps {
  activeTab?: string;
  lang?: 'en' | 'es';
}

const MOCK_VEHICLES: Vehicle[] = [
  { id: '1', plate: 'MX-4421', model: 'Kenworth T680', status: 'ON_ROUTE', costPerKm: 1.25, lat: 19.4326, lng: -99.1332, driver: 'Juan P.', load: 'Perishables', risk: 'LOW', bioStatus: 'READY', fatigue: 12 },
  { id: '2', plate: 'MX-8890', model: 'Freightliner Cascadia', status: 'ON_ROUTE', costPerKm: 1.40, lat: 20.6597, lng: -103.3496, driver: 'Maria C.', load: 'Electronics', risk: 'LOW', bioStatus: 'READY', fatigue: 8 },
  { id: '3', plate: 'MX-1234', model: 'Volvo VNL', status: 'AVAILABLE', costPerKm: 1.15, lat: 25.6866, lng: -100.3161, driver: 'Carlos R.', load: 'Empty', risk: 'LOW', bioStatus: 'READY', fatigue: 0 },
  { id: '4', plate: 'US-9901', model: 'Tesla Semi', status: 'MAINTENANCE', costPerKm: 0.85, lat: 34.0522, lng: -118.2437, driver: 'John D.', load: 'N/A', risk: 'HIGH', bioStatus: 'ERROR', fatigue: 0 },
  { id: '5', plate: 'MX-7722', model: 'Hino 500', status: 'ON_ROUTE', costPerKm: 1.10, lat: 19.0414, lng: -98.2063, driver: 'Pedro L.', load: 'Retail', risk: 'MEDIUM', bioStatus: 'WARNING', fatigue: 25 },
];

export const Fleet: React.FC<FleetProps> = ({ activeTab, lang = 'en' }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'logistics'>('tracking');
  const [activeLogisticsTab, setActiveLogisticsTab] = useState<'routes' | 'costs'>('routes');
  const [dashboardFocus, setDashboardFocus] = useState<'GENERAL' | 'SECURITY' | 'EFFICIENCY' | 'COSTS' | 'ROUTES'>('GENERAL');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [minCost, setMinCost] = useState(0);
  const [maxCost, setMaxCost] = useState(5);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationApplied, setOptimizationApplied] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGranularityModal, setShowGranularityModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [granularityData, setGranularityData] = useState<any>(null);

  const t = {
    en: {
      title: 'Fleet Management',
      subtitle: 'Real-time Telemetry & Intelligence',
      tracking: 'Live Tracking',
      routes: 'Route Optimization',
      costs: 'Cost Analysis',
      activeUnits: 'Active Units',
      costKm: 'Avg. Cost/Km',
      fuelEff: 'Fuel Efficiency',
      compliance: 'On-Time Compliance',
      optimized: 'AI Fleet Optimized',
      realtime: 'En-Route Monitoring',
      searchPlaceholder: 'Search by plate, driver or model...',
      allStatus: 'All Status',
      onRoute: 'On Route',
      available: 'Available',
      maintenance: 'Maintenance',
      details: 'Details',
      contact: 'Contact Driver',
      history: 'Full History',
      exportAll: 'Export All Reports',
      regUnit: 'Register Unit',
      efficiencyTitle: 'Operational Efficiency',
      optimizationBtn: 'Engagement Analysis',
      optimizationActive: 'Engaged & Monitoring',
      optimizationLoading: 'Analyzing congestion data...',
      waMessage: 'WhatsApp Message',
      voipCall: 'Direct VoIP Call',
      forceAlert: 'Force Emergency Alert',
      filterByCost: 'Max Cost/Km',
      securityComplianceTitle: 'Security & Compliance Monitoring',
      riskLevel: 'Risk Level',
      biometricStatus: 'Biometric Status',
      fatigueLevel: 'Fatigue Probability',
      allUnits: 'All Units'
    },
    es: {
      title: 'Gestión de Flota',
      subtitle: 'Telemetría e Inteligencia en Tiempo Real',
      tracking: 'Rastreo en Vivo',
      routes: 'Optimización de Rutas',
      costs: 'Analítica de Costos',
      activeUnits: 'Unidades Activas',
      costKm: 'Costo Prom/Km',
      fuelEff: 'Eficiencia Comb.',
      compliance: 'Cumplimiento Puntual',
      optimized: 'Flota Optimizada por IA',
      realtime: 'Monitoreo en Ruta',
      searchPlaceholder: 'Buscar por placa, chofer o modelo...',
      allStatus: 'Todos los Estados',
      onRoute: 'En Ruta',
      available: 'Disponible',
      maintenance: 'Mantenimiento',
      details: 'Detalles',
      contact: 'Contactar Chofer',
      history: 'Historial Completo',
      exportAll: 'Exportar Reportes',
      regUnit: 'Nueva Unidad',
      efficiencyTitle: 'Eficiencia Operativa',
      optimizationBtn: 'Ejecutar Análisis de IA',
      optimizationActive: 'Optimizador Activo',
      optimizationLoading: 'Analizando tráfico...',
      waMessage: 'Mensaje de WhatsApp',
      voipCall: 'Llamada VoIP Directa',
      forceAlert: 'Alerta de Emergencia',
      filterByCost: 'Costo Máx/Km',
      securityComplianceTitle: 'Monitoreo de Seguridad y Cumplimiento',
      riskLevel: 'Nivel de Riesgo',
      biometricStatus: 'Estado Biométrico',
      fatigueLevel: 'Probabilidad de Fatiga',
      allUnits: 'Ver todas las unidades'
    }
  }[lang];

  useEffect(() => {
    if (activeTab === 'fleet-tracking') {
      setActiveSubTab('tracking');
      setDashboardFocus('GENERAL');
    }
    else if (activeTab === 'fleet-routes') {
      setActiveSubTab('logistics');
      setActiveLogisticsTab('routes');
      setDashboardFocus('ROUTES');
    }
    else if (activeTab === 'fleet-costs') {
      setActiveSubTab('logistics');
      setActiveLogisticsTab('costs');
      setDashboardFocus('COSTS');
    }
  }, [activeTab]);

  // Real-time movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'ON_ROUTE') {
          return {
            ...v,
            lat: v.lat + (Math.random() - 0.5) * 0.0005,
            lng: v.lng + (Math.random() - 0.5) * 0.0005,
          };
        }
        return v;
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getDashboardStats = () => {
    if (activeSubTab === 'tracking') {
      return [
        { label: t.activeUnits, value: '52', icon: Truck, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10', trend: '+4', type: 'activeUnits' },
        { label: t.compliance, value: '98%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: 'Stable', type: 'compliance' },
        { label: lang === 'es' ? 'Alertas Fatiga' : 'Fatigue Alerts', value: '3', icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10', trend: '-12%', type: 'compliance' },
        { label: lang === 'es' ? 'Nivel Riesgo Flota' : 'Fleet Risk Level', value: 'Low', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: 'Optimal', type: 'compliance' },
      ];
    } else if (activeLogisticsTab === 'routes') {
      return [
        { label: lang === 'es' ? 'Total Rutas' : 'Total Routes', value: '1,240', icon: Navigation, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10', trend: '+12%', type: 'routes' },
        { label: lang === 'es' ? 'Eficiencia Ruta' : 'Route Efficiency', value: '92%', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+5%', type: 'efficiency' },
        { label: lang === 'es' ? 'Millas Vacías' : 'Empty Miles', value: '124km', icon: Activity, color: 'text-porteo-orange', bg: 'bg-porteo-orange/10', trend: '-8%', type: 'efficiency' },
        { label: lang === 'es' ? 'Tiempo Promedio' : 'Avg. Route Time', value: '4.2h', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '-15%', type: 'efficiency' },
      ];
    } else {
      return [
        { label: t.costKm, value: '$1.42', icon: DollarSign, color: 'text-porteo-orange', bg: 'bg-porteo-orange/10', trend: '-2%', type: 'costKm' },
        { label: lang === 'es' ? 'Gasto Combustible' : 'Fuel Spending', value: '$14,200', icon: Fuel, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '-4%', type: 'fuelEff' },
        { label: lang === 'es' ? 'Costo Mantenimiento' : 'Maint. Cost', value: '$6,800', icon: Settings, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10', trend: 'On Target', type: 'maintenance' },
        { label: lang === 'es' ? 'ROI Logístico' : 'Logistics ROI', value: '24%', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+2.4%', type: 'totalOperative' },
      ];
    }
  };

  const currentStats = getDashboardStats();

  const filteredVehicles = vehicles.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = v.plate.toLowerCase().includes(term) || 
                          v.driver.toLowerCase().includes(term) || 
                          v.model.toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    const matchesCost = v.costPerKm <= maxCost;
    return matchesSearch && matchesStatus && matchesCost;
  });

  const handleExportAll = () => {
    const data = vehicles.map(v => `${v.plate},${v.driver},${v.model},${v.status},${v.costPerKm}`).join("\n");
    const blob = new Blob([`Plate,Driver,Model,Status,CostPerKm\n${data}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    a.download = `Fleet_Full_Report.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    toast.success(lang === 'es' ? 'Reporte consolidado descargado' : 'Consolidated report downloaded');
  };

  const handleDownloadGranular = (data: any) => {
    if (!data) return;
    const csvContent = "Label,Value,Status\n" + data.items.map((it: any) => `${it.label},${it.value},${it.status}`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '_')}_Report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(lang === 'es' ? 'Reporte detallado descargado' : 'Detailed report downloaded');
  };

  const handleItemClick = (item: any) => {
    toast.info(`${lang === 'es' ? 'Filtrando por' : 'Filtering by'}: ${item.label}`);
    
    const label = item.label.toLowerCase();
    if (label.includes('ruta') || label.includes('route')) {
      setFilterStatus('ON_ROUTE');
    } else if (label.includes('espera') || label.includes('available') || label.includes('waiting')) {
      setFilterStatus('AVAILABLE');
    } else if (label.includes('taller') || label.includes('garage') || label.includes('maintenance')) {
      setFilterStatus('MAINTENANCE');
    } else if (label.includes('kenworth')) {
      setSearchTerm('Kenworth');
    } else if (label.includes('volvo')) {
      setSearchTerm('Volvo');
    } else if (label.includes('hino')) {
      setSearchTerm('Hino');
    } else if (label.includes('punctuality') || label.includes('puntualidad') || label.includes('compliance')) {
      setFilterStatus('ALL');
      setSearchTerm('');
    }
    
    setShowGranularityModal(false);
  };

  const handleStatClick = (type: string) => {
    // If user clicks on a stat, we should show granularity but also filter if applicable
    if (type === 'activeUnits') {
      setFilterStatus('ALL');
      setSearchTerm('');
      setDashboardFocus('GENERAL');
    } else if (type === 'compliance') {
      setFilterStatus('ALL');
      setSearchTerm('');
      setDashboardFocus('SECURITY');
    } else if (type === 'costKm' || type === 'fuelEff' || type === 'totalOperative') {
      setFilterStatus('ALL');
      setSearchTerm('');
      setDashboardFocus('COSTS');
    } else if (type === 'maintenance') {
      setFilterStatus('MAINTENANCE');
      setSearchTerm('');
      setDashboardFocus('COSTS');
    } else if (type === 'efficiency' || type === 'routes') {
      setDashboardFocus(type === 'routes' ? 'ROUTES' : 'EFFICIENCY');
    }
    
    const data: Record<string, any> = {
      activeUnits: {
        title: lang === 'es' ? 'Desglose de Unidades Activas' : 'Active Units Breakdown',
        description: lang === 'es' ? 'Monitoreo detallado de flota disponible y en tránsito.' : 'Detailed monitoring of fleet units in transit and available.',
        items: [
          { label: lang === 'es' ? 'En Ruta' : 'On Route', value: '38', status: 'Active' },
          { label: lang === 'es' ? 'Espera de Carga' : 'Waiting for Load', value: '14', status: 'Available' },
          { label: lang === 'es' ? 'En Taller' : 'In Garage', value: '5', status: 'Maintenance' },
        ]
      },
      costKm: {
        title: lang === 'es' ? 'Análisis de Costo por KM' : 'Cost per KM Analysis',
        description: lang === 'es' ? 'Tendencia histórica y comparativa de costos operativos.' : 'Historical trend and operational cost comparison.',
        items: [
          { label: lang === 'es' ? 'Combustible' : 'Fuel', value: '$0.84', status: 'Target' },
          { label: lang === 'es' ? 'Mantenimiento' : 'Maintenance', value: '$0.22', status: 'Success' },
          { label: lang === 'es' ? 'Otros' : 'Others', value: '$0.36', status: 'Warning' },
        ]
      },
      fuelEff: {
        title: lang === 'es' ? 'Eficiencia de Combustible' : 'Fuel Efficiency',
        description: lang === 'es' ? 'Rendimiento promedio por modelo de unidad.' : 'Average performance by vehicle model.',
        items: [
          { label: 'Kenworth T680', value: '8.8 km/L', status: 'Success' },
          { label: 'Volvo VNL', value: '8.1 km/L', status: 'Target' },
          { label: 'Hino 500', value: '9.2 km/L', status: 'Success' },
        ]
      },
      compliance: {
        title: lang === 'es' ? 'Cumplimiento de Entrega' : 'On-Time Delivery Compliance',
        description: lang === 'es' ? 'Análisis de puntualidad en puntos de carga y descarga.' : 'Punctuality analysis at load and unload points.',
        items: [
          { label: lang === 'es' ? 'Puntualidad Carga' : 'Load Punctuality', value: '99%', status: 'Success' },
          { label: lang === 'es' ? 'Puntualidad Descarga' : 'Unload Punctuality', value: '97%', status: 'Success' },
        ]
      },
      totalOperative: {
        title: lang === 'es' ? 'Costo Operativo Total' : 'Total Operating Cost',
        description: lang === 'es' ? 'Resumen financiero consolidado del periodo actual.' : 'Consolidated financial summary of current period.',
        items: [
          { label: lang === 'es' ? 'Costo Directo' : 'Direct Cost', value: '$22,450', status: 'Active' },
          { label: lang === 'es' ? 'Cosos Indirectos' : 'Indirect Costs', value: '$8,850', status: 'Warning' },
        ]
      }
    };
    setGranularityData(data[type]);
    setShowGranularityModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header section with Language Support */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-porteo-blue/10 rounded-lg">
              <Activity className="w-5 h-5 text-porteo-blue" />
            </div>
            <span className="text-[10px] font-bold text-porteo-blue uppercase tracking-[0.2em]">
              {activeSubTab === 'tracking' ? (lang === 'es' ? 'Telemetría Satelital' : 'Satellite Telemetry') : (lang === 'es' ? 'Inteligencia Logística' : 'Logistics Intelligence')}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {activeSubTab === 'logistics' 
              ? (activeLogisticsTab === 'routes' ? t.routes : t.costs) 
              : t.tracking}
          </h1>
          <p className="text-white/40 mt-1 font-medium italic">
            {activeSubTab === 'logistics' 
              ? (lang === 'es' ? 'Análisis heurístico de cadena de suministro' : 'Heuristic supply chain analysis')
              : (lang === 'es' ? 'Monitoreo activo y respuesta a riesgos' : 'Active monitoring and risk response')}
          </p>
        </div>
        
        <div className="flex flex-col gap-4 items-end">
          <div className="flex bg-neutral-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            <button
              onClick={() => {
                setActiveSubTab('tracking');
                setDashboardFocus('GENERAL');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'tracking' 
                  ? 'bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {t.tracking}
            </button>
            <button
              onClick={() => {
                setActiveSubTab('logistics');
                setDashboardFocus(activeLogisticsTab === 'routes' ? 'ROUTES' : 'COSTS');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'logistics' 
                  ? 'bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {lang === 'es' ? 'Logística' : 'Logistics'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportAll}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all transform active:scale-95"
              title={t.exportAll}
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="px-6 py-3 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/90 transition-all shadow-xl shadow-porteo-blue/20 flex items-center gap-2 transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {t.regUnit}
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {activeSubTab === 'logistics' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex bg-white/5 p-1 rounded-[1.5rem] w-fit border border-white/10"
          >
            <button
              onClick={() => {
                setActiveLogisticsTab('routes');
                setDashboardFocus('ROUTES');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeLogisticsTab === 'routes' 
                  ? 'bg-porteo-blue text-white' 
                  : 'text-white/20 hover:text-white hover:bg-white/5'
              }`}
            >
              <Navigation className="w-3 h-3" />
              {t.routes}
            </button>
            <button
              onClick={() => {
                setActiveLogisticsTab('costs');
                setDashboardFocus('COSTS');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeLogisticsTab === 'costs' 
                  ? 'bg-porteo-blue text-white' 
                  : 'text-white/20 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              {t.costs}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {currentStats.map((stat, i) => (
          <motion.div 
            key={`${activeSubTab}-${activeLogisticsTab}-${i}`} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleStatClick(stat.type)}
            className="glass p-6 rounded-[32px] border border-white/10 group hover:border-porteo-blue/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-emerald-400 text-xs font-bold leading-none">{stat.trend}</span>
                <span className="text-[8px] text-white/20 uppercase font-black tracking-tighter mt-1">Real-time</span>
              </div>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1 group-hover:text-porteo-blue transition-colors">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeSubTab === 'tracking' && (
              <motion.div 
                key="tracking"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative h-[600px] glass rounded-[40px] border border-white/10 overflow-hidden"
              >
                {/* Map Overlay Indicator */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
                  <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    <span className="text-xs font-bold text-white uppercase tracking-[0.1em]">{t.realtime}</span>
                  </div>
                  {optimizationApplied && (
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="bg-porteo-blue/30 backdrop-blur-xl border border-porteo-blue/40 px-5 py-3 rounded-2xl flex items-center gap-3"
                    >
                      <Zap className="w-4 h-4 text-porteo-blue animate-bounce" />
                      <span className="text-[10px] font-bold text-porteo-blue uppercase">{t.optimized}</span>
                    </motion.div>
                  )}
                </div>

                {/* Leaflet Map Implementation */}
                <div className="absolute inset-0 z-0">
                  <MapContainer 
                    center={[19.4326, -99.1332]} 
                    zoom={5} 
                    style={{ height: '100%', width: '100%', background: '#050505' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {filteredVehicles.map(v => (
                      <Marker 
                        key={v.id} 
                        position={[v.lat, v.lng]} 
                        icon={icon}
                        eventHandlers={{
                          click: () => setSelectedVehicle(v),
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="p-3">
                            <h5 className="font-bold text-porteo-blue">{v.plate}</h5>
                            <p className="text-xs text-gray-400">{v.model}</p>
                            <p className="text-[10px] mt-2 text-gray-500 uppercase font-black">{v.driver}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                {/* Tracking Side Panel for Selected Vehicle */}
                <AnimatePresence>
                  {selectedVehicle && (
                    <>
                      {/* Backdrop for easy dismissal */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedVehicle(null)}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10"
                      />
                      <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute top-0 right-0 bottom-0 w-80 glass border-l border-white/20 z-20 p-8 shadow-2xl flex flex-col"
                      >
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h4 className="text-lg font-bold text-white leading-none">{selectedVehicle.plate}</h4>
                      <span className="text-[8px] font-black uppercase text-porteo-blue tracking-[0.2em] mt-1 block">{lang === 'es' ? 'TELEMETRÍA ACTIVA' : 'TELEMETRY SECURE'}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedVehicle(null)} 
                      className="p-3 hover:bg-white/10 rounded-full text-white/40 transition-colors transform active:scale-90"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                      <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="w-12 h-12 bg-porteo-blue/20 rounded-xl flex items-center justify-center text-porteo-blue">
                            <Truck className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{selectedVehicle.model}</p>
                            <p className="text-[10px] text-white/40 font-mono italic">{selectedVehicle.id}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-white/20 uppercase mb-1">Status</p>
                            <p className="text-xs font-bold text-porteo-blue">{selectedVehicle.status}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-white/20 uppercase mb-1">Load</p>
                            <p className="text-xs font-bold text-white">{selectedVehicle.load}</p>
                          </div>
                        </div>

                        <div className="p-5 bg-porteo-blue/5 border border-porteo-blue/20 rounded-2xl">
                          <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">AI Safety Score: 98</span>
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed italic">
                            {lang === 'es' 
                              ? 'Comportamiento de manejo óptimo detectado. Sin alertas de fatiga en las últimas 4h.' 
                              : 'Optimal driving behavior detected. No fatigue alerts in the last 4h.'}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <button 
                            onClick={() => setShowContactModal(true)}
                            className="w-full py-4 bg-porteo-blue text-white rounded-2xl font-bold text-xs hover:bg-porteo-blue/90 transition-all flex items-center justify-center gap-2"
                          >
                            <Activity className="w-4 h-4" />
                            {t.contact}
                          </button>
                          <button 
                            onClick={() => {
                              toast.loading(lang === 'es' ? 'Recuperando historial...' : 'Retrieving history...', { duration: 2000 });
                              setTimeout(() => {
                                toast.success(lang === 'es' ? 'Historial cargado' : 'History loaded');
                              }, 2000);
                            }}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            {t.history}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

            {activeSubTab === 'logistics' && activeLogisticsTab === 'routes' && (
              <motion.div 
                key="routes"
                className="glass rounded-[40px] border border-white/10 p-10 h-[600px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white tracking-tight">{t.routes}</h3>
                    <p className="text-white/40 mt-1">{lang === 'es' ? 'Motor de optimización heurística mediante IA' : 'AI-powered heuristic route planning engine'}</p>
                  </div>
                  <button 
                    onClick={() => setShowRouteModal(true)}
                    className="bg-porteo-blue px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-porteo-blue/20 shrink-0 transform active:scale-95"
                  >
                    {lang === 'es' ? 'Nuevo Plan de Ruta' : 'New Plan Engine'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-10 overflow-hidden">
                  {[
                    { l: 'Route Time', v: isOptimizing ? '...' : '4.2h', d: '-15%', type: 'time' },
                    { l: 'Empty Miles', v: isOptimizing ? '...' : '124km', d: '-8%', type: 'miles' },
                    { l: 'Drop Count', v: isOptimizing ? '...' : '45/day', d: '+12%', type: 'drops' },
                  ].map((it, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (isOptimizing) return;
                        setGranularityData({
                          title: it.l,
                          description: lang === 'es' ? 'Resumen detallado de la métrica seleccionada.' : 'Detailed summary of the selected metric.',
                          items: [{ label: it.l, value: it.v, status: 'Success' }]
                        });
                        setShowGranularityModal(true);
                      }}
                      className={`p-6 bg-white/[0.03] border border-white/10 rounded-3xl cursor-pointer hover:bg-white/[0.06] transition-all min-w-0 ${isOptimizing ? 'animate-pulse' : ''}`}
                    >
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 truncate">{it.l}</p>
                      <div className="flex items-center justify-between gap-2 overflow-hidden">
                        <span className="text-2xl font-bold text-white truncate">{it.v}</span>
                        {!isOptimizing && <span className="text-emerald-400 text-xs font-bold shrink-0">{it.d}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex-1 bg-black/40 border border-white/5 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden p-6">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full">
                      <path d="M100 100 Q400 50 700 400" stroke="#004A99" strokeWidth="4" fill="none" strokeDasharray="10 10" />
                      <circle cx="100" cy="100" r="10" fill="#004A99" />
                      <circle cx="700" cy="400" r="10" fill="#F27D26" />
                    </svg>
                  </div>
                  <Navigation className="w-16 h-16 text-porteo-blue opacity-50 mb-4 animate-pulse shrink-0" />
                  <p className="text-white font-bold text-lg text-center">{lang === 'es' ? 'Motor de Consolidación Aktivo' : 'Aktiva Consolidation Hub'}</p>
                  <p className="text-white/40 text-sm mt-1 text-center max-w-md">{lang === 'es' ? 'Analizando 1,240 peticiones para consolidación de carga' : 'Analyzing 1,240 load requests for consolidation'}</p>
                  <button 
                    onClick={() => {
                      setIsOptimizing(true);
                      setTimeout(() => {
                        setIsOptimizing(false);
                        setOptimizationApplied(true);
                        toast.success(lang === 'es' ? 'Optimización profunda completada.' : 'Deep analysis completed.');
                      }, 3000);
                    }}
                    className="mt-8 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white hover:bg-porteo-blue hover:border-porteo-blue transition-all shrink-0 shadow-lg"
                  >
                    {lang === 'es' ? 'Iniciar Análisis de IA' : 'Run Deep-Route Analysis'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'logistics' && activeLogisticsTab === 'costs' && (
              <motion.div 
                key="costs"
                className="glass rounded-[40px] border border-white/10 p-10 h-[600px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{t.costs}</h3>
                    <p className="text-white/40 mt-1">{lang === 'es' ? 'Desglose financiero operativo por unidad' : 'Operational financial breakdown by unit'}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowSettingsModal(true)}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all transform active:scale-95"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleExportAll}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all transform active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 flex-1 overflow-hidden">
                  <div className="space-y-8 overflow-y-auto pr-2 scrollbar-hide">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{lang === 'es' ? 'DISTRIBUCIÓN DE GASTOS' : 'EXPENSE DISTRIBUTION'}</h4>
                    {[
                      { l: 'Fuel', v: '$14,200', p: 45, c: 'bg-porteo-blue', type: 'fuelEff' },
                      { l: 'Maintenance', v: '$6,800', p: 22, c: 'bg-porteo-orange', type: 'costKm' },
                      { l: 'Labor', v: '$9,100', p: 29, c: 'bg-emerald-400', type: 'compliance' },
                      { l: 'Fixed Costs', v: '$1,200', p: 4, c: 'bg-purple-400', type: 'totalOperative' },
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        className="space-y-3 cursor-pointer group"
                        onClick={() => handleStatClick(item.type)}
                      >
                        <div className="flex justify-between font-bold text-sm">
                          <span className="text-white/60 group-hover:text-white transition-colors">{item.l}</span>
                          <span className="text-white">{item.v}</span>
                        </div>
                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.p}%` }}
                            className={`h-full ${item.c} group-hover:opacity-80 transition-opacity`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div 
                    onClick={() => handleStatClick('totalOperative')}
                    className="bg-porteo-blue/5 border border-porteo-blue/20 rounded-[32px] p-8 flex flex-col justify-center text-center cursor-pointer hover:bg-porteo-blue/10 transition-all group"
                  >
                    <p className="text-[10px] font-black text-porteo-blue uppercase tracking-widest mb-2">{lang === 'es' ? 'COSTO TOTAL OPERATIVO' : 'TOTAL OPERATIONAL COST'}</p>
                    <h4 className="text-5xl font-black text-white group-hover:scale-105 transition-transform">$31,300</h4>
                    <span className="text-emerald-400 text-sm font-bold mt-2">-$2,400 vs Prev. Month</span>

                    <div className="mt-12 p-6 bg-black/40 border border-white/5 rounded-3xl text-left backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-4 h-4 text-porteo-blue" />
                        <span className="text-xs font-bold text-white uppercase">{lang === 'es' ? 'Insight de IA' : 'AI Financial Insight'}</span>
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        {lang === 'es' 
                          ? 'Optimización de combustible por IA redujo el gasto en $450 USD semanales mediante ruteo dinámico.' 
                          : 'AI Fuel optimization reduced spending by $450 USD weekly through dynamic rerouting.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Fleet Table */}
          <div id="fleet-table" className="glass rounded-[40px] border border-white/10 overflow-hidden max-w-full">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {dashboardFocus === 'SECURITY' ? (lang === 'es' ? 'Protocolos de Seguridad' : 'Security Protocols') :
                   dashboardFocus === 'COSTS' ? (lang === 'es' ? 'Bitácora de Costos' : 'Cost Ledger') :
                   dashboardFocus === 'ROUTES' ? (lang === 'es' ? 'Misiones Programadas' : 'Scheduled Missions') :
                   dashboardFocus === 'EFFICIENCY' ? (lang === 'es' ? 'Rendimiento de Unidades' : 'Unit Performance') :
                   (lang === 'es' ? 'Estado de Flota' : 'Fleet Status')}
                </h3>
                <p className="text-white/20 text-[10px] font-medium uppercase mt-1">
                  {lang === 'es' ? 'Contexto de datos' : 'Data context'}: {dashboardFocus}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                <div className="relative col-span-1 sm:col-span-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-porteo-blue/50 transition-all w-full"
                  />
                </div>
                <select 
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white focus:outline-none appearance-none cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">{t.allStatus}</option>
                  <option value="ON_ROUTE">{t.onRoute}</option>
                  <option value="AVAILABLE">{t.available}</option>
                  <option value="MAINTENANCE">{t.maintenance}</option>
                </select>
                <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 flex flex-col justify-center">
                  <p className="text-[8px] font-black text-white/20 uppercase mb-1">{t.filterByCost}</p>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="0.1" 
                      value={maxCost}
                      onChange={(e) => setMaxCost(parseFloat(e.target.value))}
                      className="accent-porteo-blue h-1 flex-1"
                    />
                    <span className="text-[10px] font-bold text-white">${maxCost}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-white/10 pb-4">
              <table className="w-full text-left min-w-[1400px]">
                <thead>
                  <tr className="bg-white/[0.02] text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">
                    <th className="px-8 py-5 whitespace-nowrap">Plate / Model</th>
                    <th className="px-8 py-5 whitespace-nowrap">Driver</th>
                    <th className="px-8 py-5 whitespace-nowrap">Status</th>
                    {(dashboardFocus === 'GENERAL' || dashboardFocus === 'COSTS') && <th className="px-8 py-5 whitespace-nowrap">Cost / Km</th>}
                    {(dashboardFocus === 'SECURITY') && <th className="px-8 py-5 whitespace-nowrap">Risk LVL</th>}
                    {(dashboardFocus === 'SECURITY' || dashboardFocus === 'GENERAL') && <th className="px-8 py-5 whitespace-nowrap">Bio-Validation</th>}
                    {(dashboardFocus === 'SECURITY' || dashboardFocus === 'EFFICIENCY' || dashboardFocus === 'GENERAL') && <th className="px-8 py-5 whitespace-nowrap">Fatigue %</th>}
                    {dashboardFocus === 'ROUTES' && <th className="px-8 py-5 whitespace-nowrap">Destination</th>}
                    {dashboardFocus === 'COSTS' && <th className="px-8 py-5 whitespace-nowrap">Fuel Burn</th>}
                    <th className="px-8 py-5 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVehicles.map(v => (
                    <tr 
                      key={v.id} 
                      onClick={() => {
                        setSelectedVehicle(v);
                      }}
                      className={`group hover:bg-white/[0.03] transition-all cursor-pointer border-b border-white/5 ${selectedVehicle?.id === v.id ? 'bg-porteo-blue/10 border-porteo-blue/50' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl transition-all ${selectedVehicle?.id === v.id ? 'bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20' : 'bg-white/5 text-white/40'}`}>
                            <Truck className="w-5 h-5 flex-shrink-0" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white font-mono truncate">{v.plate}</p>
                            <p className="text-[10px] text-white/20 uppercase font-black truncate">{v.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-white/60 whitespace-nowrap">{v.driver}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border ${
                          v.status === 'ON_ROUTE' ? 'bg-porteo-blue/20 text-porteo-blue border-porteo-blue/30' :
                          v.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          'bg-white/5 text-white/40 border-white/5'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      
                      {(dashboardFocus === 'GENERAL' || dashboardFocus === 'COSTS') && (
                        <td className="px-8 py-6 text-sm font-bold text-white whitespace-nowrap">${v.costPerKm}</td>
                      )}

                      {(dashboardFocus === 'SECURITY') && (
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                            v.risk === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' :
                            v.risk === 'MEDIUM' ? 'bg-porteo-orange/20 text-porteo-orange' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {v.risk}
                          </span>
                        </td>
                      )}

                      {(dashboardFocus === 'SECURITY' || dashboardFocus === 'GENERAL') && (
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${v.bioStatus === 'READY' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                            <span className="text-[10px] font-black text-white/60 uppercase">{v.bioStatus}</span>
                          </div>
                        </td>
                      )}

                      {(dashboardFocus === 'SECURITY' || dashboardFocus === 'EFFICIENCY' || dashboardFocus === 'GENERAL') && (
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${v.fatigue > 20 ? 'bg-porteo-orange' : 'bg-emerald-400'}`}
                                style={{ width: `${v.fatigue}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-white/60">{v.fatigue}%</span>
                          </div>
                        </td>
                      )}

                      {dashboardFocus === 'ROUTES' && (
                        <td className="px-8 py-6 text-sm font-bold text-white/40 italic whitespace-nowrap">CDMX → MTY</td>
                      )}

                      {dashboardFocus === 'COSTS' && (
                        <td className="px-8 py-6 text-sm font-bold text-emerald-400 whitespace-nowrap">-$120.50</td>
                      )}

                      <td className="px-8 py-6">
                         <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-porteo-blue transform group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Rail: Optimization & Secondary Analysis */}
        <div className="xl:col-span-4 space-y-8">
          <div className="glass p-10 rounded-[40px] border border-white/10 relative overflow-hidden">
             {isOptimizing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-porteo-blue/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                <p className="text-white text-xl font-bold">{t.optimizationLoading}</p>
                <p className="text-white/60 text-xs mt-2 italic">Neural processing of 12k route permutations</p>
              </motion.div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-porteo-blue/20 rounded-2xl text-porteo-blue">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight">{t.efficiencyTitle}</h4>
            </div>

            <div className="space-y-10">
              {[
                { l: 'Fuel Consumption', v: 85, c: 'bg-emerald-400', d: 'Optimized via AI engine', type: 'fuelEff' },
                { l: 'Time Variance', v: 92, c: 'bg-porteo-blue', d: 'Consistent on-time performance', type: 'time' },
                { l: 'Engine Health', v: 76, c: 'bg-porteo-orange', d: 'Minor maintenance suggested', type: 'maintenance' },
              ].map((it, i) => (
                <div 
                  key={i} 
                  className="space-y-4 cursor-pointer group/item"
                  onClick={() => {
                    if (it.type === 'fuelEff') handleStatClick('fuelEff');
                    else if (it.type === 'time') handleStatClick('compliance');
                    else handleStatClick('costKm');
                  }}
                >
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 group-hover/item:text-white transition-colors">{it.l}</p>
                      <p className="text-xs text-white font-medium">{it.d}</p>
                    </div>
                    <span className="text-2xl font-black text-white group-hover/item:text-porteo-blue transition-colors">{it.v}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${it.v}%` }}
                      className={`h-full ${it.c} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setIsOptimizing(true);
                setTimeout(() => {
                  setIsOptimizing(false);
                  setOptimizationApplied(true);
                  toast.success(lang === 'es' ? 'Optimización de Flota Aplicada' : 'Fleet Optimization Engaged');
                }, 3000);
              }}
              disabled={optimizationApplied}
              className={`mt-12 w-full py-5 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl ${
                optimizationApplied 
                  ? 'bg-emerald-500 text-white cursor-default' 
                  : 'bg-porteo-blue text-white hover:bg-porteo-blue/90 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {optimizationApplied ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  {t.optimizationActive}
                </div>
              ) : t.optimizationBtn}
            </button>
          </div>

          <div 
            onClick={() => {
              setDashboardFocus('SECURITY');
              setGranularityData({
                title: t.securityComplianceTitle,
                description: lang === 'es' ? 'Puntuación de seguridad derivada de métricas telemáticas.' : 'Safety score derived from telemetric metrics.',
                items: [
                  { label: t.riskLevel, value: lang === 'es' ? 'Bajo' : 'Low', status: 'Success' },
                  { label: t.biometricStatus, value: 'Active', status: 'Success' },
                  { label: t.fatigueLevel, value: '12%', status: 'Success' },
                ]
              });
              setShowGranularityModal(true);
            }}
            className="glass p-10 rounded-[40px] border border-white/10 group cursor-pointer hover:border-porteo-blue/30 transition-all overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-porteo-blue/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-porteo-blue/10 transition-all" />
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight">{lang === 'es' ? 'Seguridad y Cumplimiento' : 'Security & Compliance'}</h4>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 italic">
              {lang === 'es' 
                ? 'Monitoreo dinámico de fatiga activo. Última validación biométrica: OK.' 
                : 'Dynamic fatigue monitoring engaged. Last biometric validation: OK.'}
            </p>
            <div className="space-y-4">
              {[
                { label: lang === 'es' ? 'Nivel de Riesgo' : 'Risk Level', value: lang === 'es' ? 'BAJO' : 'LOW', color: 'text-emerald-400' },
                { label: lang === 'es' ? 'Bio-Validación' : 'Bio-Validation', value: 'Active', color: 'text-porteo-blue' },
                { label: lang === 'es' ? 'Fatiga' : 'Fatigue', value: '12%', color: 'text-porteo-orange' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatClick('compliance');
                  }}
                >
                  <span className="text-xs font-bold text-white">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals with Multi-language */}
      <AnimatePresence>
        {showContactModal && selectedVehicle && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#050505] border border-white/20 rounded-[48px] w-full max-w-md overflow-hidden shadow-[0_0_100px_rgba(0,74,153,0.3)] p-12"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h4 className="text-2xl font-bold text-white uppercase tracking-tight">{lang === 'es' ? 'Centro de Enlace' : 'Comm Gateway'}</h4>
                  <p className="text-[10px] text-white/40 font-black tracking-widest mt-1 uppercase">Unit ID: {selectedVehicle.id}</p>
                </div>
                <button onClick={() => setShowContactModal(false)} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <a 
                  href={`https://wa.me/5211234567890?text=Hello%20Porteo%20Driver%20of%20unit%20${selectedVehicle.plate}%2C%20please%20report%20status.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-[24px] font-bold transition-all flex items-center justify-center gap-4 border border-[#25D366]/20 shadow-lg shadow-[#25D366]/10"
                >
                  <Activity className="w-6 h-6" />
                  {t.waMessage}
                </a>
                <button 
                  onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: lang === 'es' ? 'Estableciendo cifrado VoIP...' : 'Establishing VoIP encryption...',
                        success: lang === 'es' ? 'Llamada conectada a unidad' : 'Call connected to unit',
                        error: 'Connection failed',
                      }
                    );
                  }}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[24px] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-4 backdrop-blur-md"
                >
                  <Navigation className="w-6 h-6 text-porteo-blue" />
                  {t.voipCall}
                </button>
                <button 
                  onClick={() => {
                    toast.error(lang === 'es' ? 'ALERTA DE EMERGENCIA ENVIADA' : 'EMERGENCY ALERT BROADCASTED', {
                      duration: 5000,
                      icon: <AlertCircle className="text-red-500" />
                    });
                  }}
                  className="w-full py-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-[24px] font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-4 shadow-lg shadow-rose-500/10"
                >
                  <AlertCircle className="w-6 h-6" />
                  {t.forceAlert}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGranularityModal && granularityData && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl text-white">
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="glass max-w-2xl w-full rounded-[48px] border border-white/20 p-12 overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold">{granularityData.title}</h3>
                <button 
                  onClick={() => setShowGranularityModal(false)} 
                  className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all transform hover:rotate-90 active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                {granularityData.items.map((item: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => handleItemClick(item)}
                    className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center cursor-pointer hover:bg-white/[0.08] hover:border-porteo-blue/30 transition-all group/item"
                  >
                    <div>
                      <p className="text-[10px] uppercase font-black text-white/40 mb-1 group-hover/item:text-porteo-blue transition-colors">{item.label}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.status === 'Active' || item.status === 'Success' ? 'bg-porteo-blue/20 text-porteo-blue' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleDownloadGranular(granularityData)}
                className="mt-12 w-full py-5 bg-porteo-blue rounded-3xl font-bold flex items-center justify-center gap-3 shadow-2xl shadow-porteo-blue/30 transform active:scale-95 transition-all text-white"
              >
                <Download className="w-5 h-5" />
                {lang === 'es' ? 'Descargar Análisis Detallado' : 'Download Granular Report'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="glass max-w-xl w-full rounded-[48px] border border-white/20 p-12 text-white"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold">{t.regUnit}</h3>
                <button onClick={() => setShowRegisterModal(false)} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all transform hover:rotate-90 active:scale-90">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast.success('Unit added to processing queue'); setShowRegisterModal(false); }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Plate / Placas</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-porteo-blue text-white" placeholder="MX-0000" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Model / Modelo</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-porteo-blue text-white" placeholder="Kenworth T680" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Driver / Operador</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-porteo-blue text-white" placeholder="Nombre completo" required />
                </div>
                <button type="submit" className="w-full py-5 bg-porteo-blue text-white rounded-3xl font-bold mt-6 shadow-2xl shadow-porteo-blue/30 transform active:scale-95 transition-all uppercase tracking-widest text-sm">
                  {lang === 'es' ? 'Sincronizar Unidad' : 'Sync New Unit'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showRouteModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass max-w-xl w-full rounded-[48px] border-white/20 p-12 text-white"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-bold">{lang === 'es' ? 'Constructor de Rutas' : 'Route Builder'}</h3>
              <button 
                onClick={() => setShowRouteModal(false)} 
                className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all transform hover:rotate-90 active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-8">
              <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/30 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <Zap className="w-6 h-6 text-porteo-blue" />
                  <p className="text-xs font-bold text-porteo-blue uppercase tracking-widest">Aktivo AI Assistant</p>
                </div>
                <p className="text-sm text-white/70 italic leading-relaxed">
                  {lang === 'es' 
                    ? '¿Deseas que genere una ruta óptima basada en el tráfico actual de CDMX y disponibilidad de operadores?' 
                    : 'Do you want me to generate an optimal route based on current NYC traffic and operator availability?'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { toast.success('Auto-generating route...'); setShowRouteModal(false); setIsOptimizing(true); setTimeout(() => setIsOptimizing(false), 2000); }}
                  className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-porteo-blue hover:border-porteo-blue transition-all"
                >
                  {lang === 'es' ? 'Auto-Generar' : 'Auto-Generate'}
                </button>
                <button 
                  onClick={() => { toast.info('Opening manual map editor...'); setShowRouteModal(false); }}
                  className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-porteo-orange hover:border-porteo-orange transition-all"
                >
                  {lang === 'es' ? 'Manual Editor' : 'Manual Editor'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass max-w-xl w-full rounded-[48px] border-white/20 p-12 text-white"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-bold">{lang === 'es' ? 'Configuración de Costos' : 'Cost Settings'}</h3>
              <button 
                onClick={() => setShowSettingsModal(false)} 
                className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all transform hover:rotate-90 active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Fuel Target Rate', value: '1.2 USD/km' },
                { label: 'Maintenance Interval', value: '10,000 km' },
                { label: 'Operator Base Wage', value: '3,200 USD/mo' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <span className="text-sm font-bold text-white/60">{s.label}</span>
                  <input type="text" defaultValue={s.value} className="bg-transparent text-right font-black text-porteo-blue focus:outline-none" />
                </div>
              ))}
              <button 
                onClick={() => { toast.success('Settings updated'); setShowSettingsModal(false); }}
                className="w-full py-5 bg-porteo-blue text-white rounded-3xl font-bold mt-6 shadow-2xl shadow-porteo-blue/30 transform active:scale-95 transition-all uppercase tracking-widest text-sm"
              >
                {lang === 'es' ? 'Guardar Cambios' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
