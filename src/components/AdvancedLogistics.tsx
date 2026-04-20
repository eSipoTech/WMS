import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Waves, 
  Cpu, 
  RotateCcw, 
  Leaf, 
  Zap, 
  BarChart3, 
  Clock, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Truck,
  Package,
  Activity,
  ShieldCheck,
  Plus,
  AlertCircle,
  ArrowDownLeft,
  X,
  Maximize2,
  Terminal,
  Brain,
  History
} from 'lucide-react';
import { toast } from 'sonner';

interface Wave {
  id: string;
  name: string;
  status: 'planning' | 'releasing' | 'executing' | 'completed';
  orders: number;
  items: number;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  ordersList?: { id: string; status: string; customer: string }[];
}

interface Robot {
  id: string;
  name: string;
  type: 'AMR' | 'AGV' | 'Sorter' | 'Arm';
  status: 'online' | 'busy' | 'charging' | 'offline' | 'error';
  battery: number;
  task?: string;
}

interface RMA {
  id: string;
  customer: string;
  reason: string;
  status: 'pending' | 'received' | 'inspected' | 'restocked' | 'rejected';
  date: string;
}

export const AdvancedLogistics = ({ 
  lang, 
  warehouse, 
  addNotification 
}: { 
  lang: 'en' | 'es',
  warehouse: any,
  addNotification?: (msg: string, type?: 'market' | 'operational' | 'alert' | 'success' | 'info') => void
}) => {
  const [activeTab, setActiveTab] = useState<'waves' | 'automation' | 'rma' | 'sustainability' | 'slotting' | 'labor' | 'maintenance'>('waves');
  const [isAutoGeneratingWaves, setIsAutoGeneratingWaves] = useState(false);
  const [showGranularityModal, setShowGranularityModal] = useState(false);
  const [granularityData, setGranularityData] = useState<any>(null);
  const [showAutomationModal, setShowAutomationModal] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState(Array.from({ length: 50 }, () => Math.random()));
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [bonusPool, setBonusPool] = useState(4250);
  const [lmsMetrics, setLmsMetrics] = useState([
    { name: 'Picking', current: 145, target: 160, unit: 'u/hr' },
    { name: 'Packing', current: 42, target: 40, unit: 'o/hr' },
    { name: 'Receiving', current: 12, target: 10, unit: 'p/hr' },
  ]);
  
  const [insights, setInsights] = useState<any[]>([
    {
      id: 'SKU-882',
      type: 'optimization',
      title: 'SKU-882 Optimization Insight',
      gain: '14%',
      travelSaved: '2.4km/day',
      detail: 'Moving SKU-882 to Zone A will reduce travel time significantly by aligning with picking frequency.',
      status: 'pending'
    },
    {
      id: 'ZONE-B4',
      type: 'congestion',
      title: 'Zone B4 Congestion Alert',
      severity: 'High',
      alert: 'Over-saturation',
      detail: 'Zone B4 is currently over-saturated. Recommend splitting high-volume items to avoid bottleneck during peak hours.',
      status: 'pending'
    }
  ]);

  // Simulate evolving insights and operational jitter
  useEffect(() => {
    const interval = setInterval(() => {
      // Update insights
      setInsights(prev => {
        let currentInsights = [...prev];
        
        // Occasionally "expire" older pending insights to simulate changing warehouse conditions
        if (Math.random() > 0.85 && currentInsights.filter(i => i.status === 'pending').length > 1) {
          const pendingIdx = currentInsights.findIndex(i => i.status === 'pending');
          if (pendingIdx > -1) currentInsights.splice(pendingIdx, 1);
        }

        // Add new insights if below capacity
        if (Math.random() > 0.75 && currentInsights.length < 5) {
          const id = `SKU-${Math.floor(Math.random() * 900) + 100}`;
          const newInsight = {
            id,
            type: 'optimization',
            title: `${id} Optimization Insight`,
            gain: `${Math.floor(Math.random() * 10) + 5}%`,
            travelSaved: `${(Math.random() * 3).toFixed(1)}km/day`,
            detail: `Relocating ${id} based on recent velocity changes will optimize pick paths.`,
            status: 'pending'
          };
          currentInsights = [newInsight, ...currentInsights];
        }
        return currentInsights;
      });

      // Jitter LMS metrics for "live" feel
      setLmsMetrics(prev => prev.map(m => ({
        ...m,
        current: Math.max(5, m.current + (Math.random() > 0.5 ? 1 : -1))
      })));
    }, 12000);
    return () => clearInterval(interval);
  }, []);
  
  const [activeWaves, setActiveWaves] = useState<Wave[]>([
    { id: 'W-001', name: 'Morning Retail Wave', status: 'executing', orders: 45, items: 120, priority: 'high', progress: 65, ordersList: [
      { id: 'ORD-771', status: 'Picking', customer: 'Walmart' },
      { id: 'ORD-772', status: 'Picked', customer: 'Soriana' },
      { id: 'ORD-773', status: 'In Queue', customer: 'Chedraui' }
    ]},
    { id: 'W-002', name: 'E-commerce Priority', status: 'releasing', orders: 120, items: 340, priority: 'high', progress: 15 },
    { id: 'W-003', name: 'Wholesale Batch', status: 'planning', orders: 12, items: 850, priority: 'medium', progress: 0 },
    { id: 'W-004', name: 'International Shipping', status: 'completed', orders: 28, items: 145, priority: 'medium', progress: 100 },
  ]);

  const [robots, setRobots] = useState<Robot[]>([
    { id: 'R-101', name: 'Titan-1', type: 'AMR', status: 'busy', battery: 78, task: 'Moving Pallet to Dock 4' },
    { id: 'R-102', name: 'Swift-A', type: 'AMR', status: 'online', battery: 92 },
    { id: 'R-103', name: 'Sorter-X', type: 'Sorter', status: 'online', battery: 100 },
    { id: 'R-104', name: 'Arm-01', type: 'Arm', status: 'error', battery: 45, task: 'Pick Failure at Bin A12' },
    { id: 'R-105', name: 'Volt-2', type: 'AGV', status: 'charging', battery: 12 },
  ]);

  const [rmaList, setRmaList] = useState<RMA[]>([
    { id: 'RMA-901', customer: 'Amazon Retail', reason: 'Damaged in transit', status: 'received', date: '2026-03-22' },
    { id: 'RMA-902', customer: 'Best Buy', reason: 'Wrong item shipped', status: 'pending', date: '2026-03-23' },
    { id: 'RMA-903', customer: 'Direct Consumer', reason: 'Defective unit', status: 'inspected', date: '2026-03-21' },
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [maintenanceEquipment, setMaintenanceEquipment] = useState([
    { name: 'Conveyor System A', health: 94, nextService: '12 days', status: 'Optimal', details: lang === 'en' ? '6% reduction due to slight vibration in motor bearings. Recommended action: Lubricate bearings within 12 days.' : 'Reducción del 6% debido a una ligera vibración en los rodamientos del motor. Acción recomendada: Lubricar rodamientos en 12 días.' },
    { name: 'AS/RS Crane 04', health: 78, nextService: '2 days', status: 'Warning', details: lang === 'en' ? '22% warning: Hydraulic pressure fluctuation detected. Critical action: Inspect seals and fluid levels immediately.' : 'Advertencia del 22%: Se detectó fluctuación de presión hidráulica. Acción crítica: Inspeccionar sellos y niveles de fluido de inmediato.' },
    { name: 'Sortation Hub', health: 98, nextService: '45 days', status: 'Optimal', details: lang === 'en' ? '2% variance: Normal wear on sorter belts. No immediate action required.' : 'Varianza del 2%: Desgaste normal en las correas del clasificador. No se requiere acción inmediata.' },
    { name: 'AGV Fleet', health: 82, nextService: '5 days', status: 'Good', details: lang === 'en' ? '18% reduction: Battery degradation in 2 units and wheel alignment needed on 1 unit.' : 'Reducción del 18%: Degradación de batería en 2 unidades y alineación de ruedas necesaria en 1 unidad.' },
  ]);

  const [maintAlerts, setMaintAlerts] = useState([
    { component: 'Bearing #442 (AS/RS 04)', probability: 82, timeToFailure: '48h', severity: 'High' },
    { component: 'Motor M-12 (Conveyor A)', probability: 15, timeToFailure: '14d', severity: 'Low' },
  ]);

  const [rmaFilter, setRmaFilter] = useState('all');
  const filteredRmas = rmaList.filter(r => rmaFilter === 'all' || r.status === rmaFilter);

  const language = lang;

  const tabs = [
    { id: 'waves', label: language === 'en' ? 'Wave Management' : 'Gestión de Oleadas', icon: <Waves className="w-4 h-4" /> },
    { id: 'automation', label: language === 'en' ? 'Automation Hub' : 'Centro de Automatización', icon: <Cpu className="w-4 h-4" /> },
    { id: 'slotting', label: language === 'en' ? 'Slotting Optimization' : 'Optimización de Slotting', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'labor', label: language === 'en' ? 'Labor LMS' : 'Gestión Laboral LMS', icon: <Users className="w-4 h-4" /> },
    { id: 'maintenance', label: language === 'en' ? 'Predictive Maint.' : 'Mant. Predictivo', icon: <Settings className="w-4 h-4" /> },
    { id: 'rma', label: language === 'en' ? 'Returns (RMA)' : 'Devoluciones (RMA)', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'sustainability', label: language === 'en' ? 'Sustainability' : 'Sostenibilidad', icon: <Leaf className="w-4 h-4" /> },
  ];

  return (
    <>
      <div className="h-full flex flex-col gap-6">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all ${
              activeTab === tab.id 
                ? 'bg-porteo-orange text-white shadow-lg shadow-porteo-orange/20' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span className="text-sm font-bold">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 glass rounded-[32px] overflow-hidden flex flex-col">
        {activeTab === 'waves' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20 relative">
            {isAutoGeneratingWaves && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 rounded-[32px]"
              >
                <div className="w-12 h-12 border-4 border-porteo-orange border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-white font-bold text-lg">{language === 'en' ? 'AI Wave Synthesis' : 'Síntesis de Oleada por IA'}</p>
                <p className="text-white/40 text-xs mt-2 italic">Analyzing carrier cut-offs and picker proximity...</p>
              </motion.div>
            )}
            
            <div className="flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-bold">{language === 'en' ? 'Dynamic Wave Planning' : 'Planificación Dinámica de Oleadas'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Optimize order fulfillment through intelligent batching' : 'Optimice el cumplimiento de pedidos mediante lotes inteligentes'}</p>
              </div>
              <button 
                onClick={() => {
                  setIsAutoGeneratingWaves(true);
                  setTimeout(() => {
                    const newWave: Wave = {
                      id: `W-00${activeWaves.length + 1}`,
                      name: 'AI Generated Priority',
                      status: 'planning',
                      orders: Math.floor(Math.random() * 50) + 10,
                      items: Math.floor(Math.random() * 200) + 50,
                      priority: 'high',
                      progress: 0
                    };
                    setActiveWaves(prev => [newWave, ...prev]);
                    setIsAutoGeneratingWaves(false);
                    toast.success(language === 'en' ? 'New wave synthesized' : 'Nueva oleada sintetizada');
                  }, 2000);
                }}
                className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
              >
                <Zap className="w-4 h-4" />
                {language === 'en' ? 'Auto-Generate Waves' : 'Auto-Generar Oleadas'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div 
                onClick={() => {
                  setGranularityData({
                    title: language === 'en' ? 'Active Waves Breakdown' : 'Desglose de Oleadas Activas',
                    description: language === 'en' ? 'Operational status across all picking zones.' : 'Estado operativo en todas las zonas de surtido.',
                    items: [
                      { label: language === 'en' ? 'Zone A (High Velocity)' : 'Zona A (Alta Vel)', value: '5 Waves', status: 'Success' },
                      { label: language === 'en' ? 'Zone B (Bulk)' : 'Zona B (Granel)', value: '3 Waves', status: 'Active' },
                      { label: language === 'en' ? 'Zone C (Cold)' : 'Zona C (Frío)', value: '4 Waves', status: 'Active' }
                    ]
                  });
                  setShowGranularityModal(true);
                }}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors group"
              >
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1 group-hover:text-porteo-orange transition-colors">{language === 'en' ? 'Active Waves' : 'Oleadas Activas'}</p>
                <p className="text-2xl font-bold text-white">{activeWaves.length}</p>
              </div>
              <div 
                onClick={() => {
                  setGranularityData({
                    title: language === 'en' ? 'Picking Productivity' : 'Productividad de Surtido',
                    description: language === 'en' ? 'Units per hour by department.' : 'Unidades por hora por departamento.',
                    items: [
                      { label: 'E-commerce', value: '185 u/hr', status: 'Success' },
                      { label: 'Wholesale', value: '95 u/hr', status: 'Active' },
                      { label: 'Returns Delivery', value: '40 u/hr', status: 'Warning' }
                    ]
                  });
                  setShowGranularityModal(true);
                }}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors group"
              >
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1 group-hover:text-porteo-orange transition-colors">{language === 'en' ? 'Avg. Pick Rate' : 'Tasa de Picking Prom.'}</p>
                <p className="text-2xl font-bold text-emerald-500">145 <span className="text-xs text-white/40 font-normal">u/hr</span></p>
              </div>
              <div 
                onClick={() => {
                  setGranularityData({
                    title: language === 'en' ? 'Labor Utilization Detail' : 'Detalle de Uso de Mano de Obra',
                    description: language === 'en' ? 'Strategic breakdown of active workforce vs capacity.' : 'Desglose estratégico de fuerza laboral activa vs capacidad.',
                    items: [
                      { label: language === 'en' ? 'Direct Labor' : 'MO Directa', value: '72%', status: 'Success' },
                      { label: language === 'en' ? 'Indirect Labor' : 'MO Indirecta', value: '20%', status: 'Active' },
                      { label: language === 'en' ? 'Available Optimization' : 'Optimización Disponible', value: '8%', status: 'Warning' }
                    ],
                    cta: {
                      label: language === 'en' ? 'Optimize Idle Personnel' : 'Optimizar Personal Inactivo',
                      action: () => {
                        toast.promise(new Promise(res => setTimeout(res, 2000)), {
                          loading: language === 'en' ? 'Re-assigning 8% surplus to Zone B...' : 'Reasignando 8% de excedente a la Zona B...',
                          success: language === 'en' ? 'Workforce optimized to 98%' : 'Fuerza laboral optimizada al 98%'
                        });
                      }
                    }
                  });
                  setShowGranularityModal(true);
                }}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors group"
              >
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1 group-hover:text-porteo-orange transition-colors">{language === 'en' ? 'Labor Utilization' : 'Uso de Mano de Obra'}</p>
                <p className="text-2xl font-bold text-white">92%</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Task Interleaving' : 'Entrelazado de Tareas'}</p>
                <p className="text-2xl font-bold text-porteo-orange">Active</p>
              </div>
            </div>

            <div className="space-y-4">
              {activeWaves.map((wave) => (
                <div 
                  key={wave.id} 
                  className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-porteo-orange/30 transition-all group cursor-pointer"
                  onClick={() => {
                    setGranularityData({
                      title: wave.name,
                      description: `${language === 'en' ? 'Detailed order list for' : 'Lista detallada de pedidos para'} ${wave.id}`,
                      items: wave.ordersList?.map(o => ({
                        label: o.id,
                        value: o.customer,
                        status: o.status === 'Picked' ? 'Success' : 'Active'
                      })) || [
                        { label: 'ORD-101', value: 'Global Retail', status: 'Active' },
                        { label: 'ORD-102', value: 'Direct Hub', status: 'Success' },
                        { label: 'ORD-103', value: 'Amazon SC', status: 'Active' }
                      ]
                    });
                    setShowGranularityModal(true);
                  }}
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        wave.status === 'executing' ? 'bg-porteo-orange/20 text-porteo-orange' :
                        wave.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                        'bg-white/10 text-white/40'
                      }`}>
                        <Waves className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white group-hover:text-porteo-orange transition-colors">{wave.name}</h4>
                          <span className="text-[10px] font-mono text-white/40">{wave.id}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            <Package className="w-3 h-3" /> {wave.orders} {language === 'en' ? 'Orders' : 'Pedidos'}
                          </span>
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> {wave.items} {language === 'en' ? 'Items' : 'Artículos'}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            wave.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                          }`}>
                            {wave.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Status' : 'Estado'}</p>
                        <p className="text-sm font-bold text-white uppercase">{wave.status.replace('_', ' ')}</p>
                      </div>
                      <div className="flex gap-2">
                        {wave.status === 'planning' && (
                          <button 
                            onClick={() => {
                              setActiveWaves(prev => prev.map(w => w.id === wave.id ? { ...w, status: 'executing' } : w));
                              toast.success(language === 'en' ? `Wave ${wave.id} released` : `Oleada ${wave.id} liberada`);
                            }}
                            className="p-2 bg-white/5 rounded-xl text-white/60 hover:text-white hover:bg-porteo-orange transition-all active:scale-90"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {wave.status === 'executing' && (
                          <button 
                            onClick={() => {
                              setActiveWaves(prev => prev.map(w => w.id === wave.id ? { ...w, status: 'planning' } : w));
                              toast.info(language === 'en' ? `Wave ${wave.id} paused` : `Oleada ${wave.id} pausada`);
                            }}
                            className="p-2 bg-white/5 rounded-xl text-white/60 hover:text-white hover:bg-red-500 transition-all active:scale-90"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setShowAutomationModal({
                              type: 'wave-config',
                              title: `${language === 'en' ? 'Wave Config' : 'Config. de Oleada'} - ${wave.id}`,
                              data: wave
                            });
                          }}
                          className="p-2 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all active:scale-90"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {wave.status !== 'planning' && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">{language === 'en' ? 'Execution Progress' : 'Progreso de Ejecución'}</span>
                        <span className="text-white font-bold">{wave.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${wave.progress}%` }}
                          className={`h-full ${wave.status === 'completed' ? 'bg-emerald-500' : 'bg-porteo-orange'}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-bold">{language === 'en' ? 'Robotics & Automation Hub' : 'Centro de Robótica y Automatización'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Monitor and orchestrate automated systems in real-time' : 'Monitoree y orqueste sistemas automatizados en tiempo real'}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowAutomationModal({
                      type: 'fleet-config',
                      title: language === 'en' ? 'Fleet Configuration' : 'Configuración de Flota',
                      data: robots
                    });
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
                >
                  {language === 'en' ? 'Fleet Config' : 'Config. Flota'}
                </button>
                <button 
                  onClick={() => {
                    toast.success(language === 'en' ? 'All automation controllers synchronized' : 'Controladores de automatización sincronizados');
                  }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all active:scale-95"
                >
                  {language === 'en' ? 'All Systems Online' : 'Sistemas en Línea'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {robots.map((robot) => (
                <div key={robot.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        robot.status === 'error' ? 'bg-red-500/20 text-red-500' :
                        robot.status === 'busy' ? 'bg-porteo-orange/20 text-porteo-orange' :
                        'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{robot.name}</h4>
                        <p className="text-xs text-white/40 font-mono">{robot.id} • {robot.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${
                        robot.status === 'online' ? 'text-emerald-500' :
                        robot.status === 'busy' ? 'text-porteo-orange' :
                        robot.status === 'error' ? 'text-red-500' : 'text-white/40'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          robot.status === 'online' ? 'bg-emerald-500' :
                          robot.status === 'busy' ? 'bg-porteo-orange' :
                          robot.status === 'error' ? 'bg-red-500' : 'bg-white/40'
                        }`} />
                        {robot.status}
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <Zap className={`w-3 h-3 ${robot.battery < 20 ? 'text-red-500' : 'text-emerald-500'}`} />
                        <span className="text-xs font-bold text-white">{robot.battery}%</span>
                      </div>
                    </div>
                  </div>

                  {robot.task && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Current Task' : 'Tarea Actual'}</p>
                      <p className="text-xs text-white">{robot.task}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setShowAutomationModal({
                          type: 'diagnostic',
                          title: `${language === 'en' ? 'Diagnostics' : 'Diagnóstico'} - ${robot.name}`,
                          data: robot
                        });
                      }}
                      className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'Diagnostics' : 'Diagnóstico'}
                    </button>
                    <button 
                      onClick={() => {
                        setShowAutomationModal({
                          type: 'remote',
                          title: `${language === 'en' ? 'Remote Control' : 'Control Remoto'} - ${robot.name}`,
                          data: robot
                        });
                      }}
                      className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'Remote Control' : 'Control Remoto'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'slotting' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-bold">{language === 'en' ? 'AI Slotting Optimization' : 'Optimización de Slotting por IA'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Maximize picking efficiency by placing high-velocity items in optimal locations' : 'Maximice la eficiencia del picking colocando artículos de alta velocidad en ubicaciones óptimas'}</p>
              </div>
              <button 
                onClick={() => {
                  toast.promise(new Promise(res => setTimeout(res, 2000)), {
                    loading: language === 'en' ? 'AI is re-calculating slotting...' : 'La IA está re-calculando el slotting...',
                    success: language === 'en' ? 'Slotting optimization engaged' : 'Optimización de slotting activada',
                  });
                }}
                className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
              >
                <Zap className="w-4 h-4" />
                {language === 'en' ? 'Run Re-Slotting Analysis' : 'Ejecutar Análisis de Re-Slotting'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass p-6 rounded-3xl">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">{language === 'en' ? 'Warehouse Velocity Heatmap' : 'Mapa de Calor de Velocidad del Almacén'}</h4>
                <div className="grid grid-cols-10 gap-2 aspect-[2/1]">
                  {heatmapData.map((velocity, i) => {
                    return (
                      <div 
                        onClick={() => {
                          setGranularityData({
                            title: `Zone ${i+1} Detailed Metrics`,
                            description: `AI-driven throughput analysis for Zone ${i+1}`,
                            items: [
                              { label: 'Current Velocity', value: `${Math.round(velocity * 100)}%`, status: velocity > 0.8 ? 'Warning' : 'Success' },
                              { label: 'Occupancy', value: `${Math.round(40 + velocity * 50)}%`, status: 'Active' },
                              { label: 'Picker Traffic', value: velocity > 0.7 ? 'High' : 'Normal', status: velocity > 0.7 ? 'Warning' : 'Success' }
                            ]
                          });
                          setShowGranularityModal(true);
                        }}
                        key={i} 
                        className={`rounded-md transition-all hover:scale-125 cursor-pointer active:scale-90 ${
                          velocity > 0.8 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                          velocity > 0.5 ? 'bg-porteo-orange' :
                          velocity > 0.2 ? 'bg-amber-500/40' : 'bg-white/5'
                        }`}
                        title={`Zone ${i+1}: ${Math.round(velocity * 100)}% Velocity`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm" />
                    <span className="text-[10px] text-white/40 font-bold uppercase">High Velocity (A)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-porteo-orange rounded-sm" />
                    <span className="text-[10px] text-white/40 font-bold uppercase">Medium Velocity (B)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white/5 rounded-sm" />
                    <span className="text-[10px] text-white/40 font-bold uppercase">Low Velocity (C)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-white tracking-tight">{language === 'en' ? 'Optimization Insights' : 'Insights de Optimización'}</h4>
                    <span className="px-2 py-0.5 bg-porteo-orange/20 text-porteo-orange text-[8px] font-black uppercase rounded-full animate-pulse">Live</span>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {insights.map((insight) => (
                      <div 
                        key={insight.id}
                        onClick={() => {
                          setShowAutomationModal({
                            type: 'insight',
                            title: insight.title,
                            data: insight,
                            id: insight.id
                          });
                        }}
                        className={`p-4 border rounded-2xl group cursor-pointer transition-all active:scale-95 ${
                          insight.type === 'congestion' 
                            ? 'bg-porteo-orange/10 border-porteo-orange/20 hover:bg-porteo-orange/20' 
                            : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className={`text-xs font-black uppercase tracking-tighter ${insight.type === 'congestion' ? 'text-porteo-orange' : 'text-emerald-500'}`}>
                            {insight.type === 'congestion' ? (language === 'en' ? 'Congestion Alert' : 'Alerta de Congestión') : `${language === 'en' ? 'Potential Gain' : 'Ganancia Potencial'}: ${insight.gain}`}
                          </p>
                          {insight.status === 'applied' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        </div>
                        <p className="text-xs font-bold text-white mb-1">{insight.title}</p>
                        <p className="text-[10px] text-white/50 leading-relaxed">{insight.detail}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[8px] font-black text-white/20 uppercase underline decoration-white/10 group-hover:text-white transition-colors tracking-widest">
                            {language === 'en' ? 'View Analysis' : 'Ver Análisis'}
                          </span>
                          {insight.status === 'simulated' && <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Simulation Ready</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div 
                  onClick={() => {
                    setGranularityData({
                      title: language === 'en' ? 'Space Utilization Forecast' : 'Pronóstico de Uso de Espacio',
                      description: 'AI projection for next 7 days based on incoming shipments.',
                      items: [
                        { label: 'Current Use', value: '88.4%', status: 'Warning' },
                        { label: 'Projected Peak', value: '94.2%', status: 'Alert' },
                        { label: 'Available Slots', value: '1,240', status: 'Success' }
                      ]
                    });
                    setShowGranularityModal(true);
                  }}
                  className="p-6 bg-white/5 border border-white/10 rounded-3xl cursor-pointer hover:bg-white/10 transition-colors group"
                >
                  <h4 className="text-sm font-bold text-white mb-2 group-hover:text-porteo-orange transition-colors">{language === 'en' ? 'Space Utilization' : 'Uso de Espacio'}</h4>
                  <p className="text-2xl font-bold text-white">88.4%</p>
                  <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-porteo-orange w-[88.4%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'labor' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold">{language === 'en' ? 'Labor Management (LMS)' : 'Gestión de Mano de Obra (LMS)'}</h3>
                  <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Track performance, manage shifts, and gamify warehouse operations' : 'Rastree el desempeño, gestione turnos y gamifique las operaciones del almacén'}</p>
                </div>
                {lastSyncTime && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">ERP Sync: {lastSyncTime}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setGranularityData({
                      title: language === 'en' ? 'Shift Schedule Details' : 'Detalles del Horario de Turnos',
                      description: 'Current shift: Morning A (06:00 - 14:00)',
                      items: [
                        { label: 'Active Personnel', value: '42', status: 'Active', detailData: {
                            title: 'Labor Deep Dive',
                            description: 'Personnel status by terminal.',
                            items: [
                              { label: 'Receiving Dock', value: '12 active', status: 'Success' },
                              { label: 'Shipping Lane', value: '18 active', status: 'Success' },
                              { label: 'Support/Admin', value: '12 active', status: 'Active' }
                            ],
                            cta: { 
                              label: 'Sync Payroll Data', 
                              action: () => {
                                  toast.success('Syncing with ERP Financial Layer...');
                                  setTimeout(() => {
                                      setBonusPool(prev => prev + 50);
                                      setLastSyncTime(new Date().toLocaleTimeString());
                                      toast.success('Payroll sync complete: Bonus Pool updated.');
                                  }, 1500);
                              }
                            }
                        }},
                        { label: 'On Break', value: '4', status: 'Warning' },
                        { label: 'Next Shift Start', value: '14:00', status: 'Active' }
                      ]
                    });
                    setShowGranularityModal(true);
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
                >
                  {language === 'en' ? 'Shift Schedule' : 'Horario de Turnos'}
                </button>
                <button 
                  onClick={() => {
                    setGranularityData({
                      title: language === 'en' ? 'Performance Report Summary' : 'Resumen del Reporte de Desempeño',
                      description: 'Aggregated warehouse throughput KPIs.',
                      items: [
                        { label: 'Productivity', value: '94%', status: 'Success' },
                        { label: 'Accuracy', value: '99.8%', status: 'Success' },
                        { label: 'Safety Incidents', value: '0', status: 'Success' }
                      ]
                    });
                    setShowGranularityModal(true);
                  }}
                  className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/90 transition-all active:scale-95"
                >
                  {language === 'en' ? 'Performance Reports' : 'Reportes de Desempeño'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="glass p-6 rounded-3xl">
                  <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-porteo-orange" />
                    {language === 'en' ? 'Real-time Productivity' : 'Productividad en Tiempo Real'}
                  </h4>
                  <div className="space-y-6">
                    {lmsMetrics.map((metric, i) => (
                      <div 
                        key={i} 
                        className="space-y-2 cursor-pointer group/metric"
                        onClick={() => {
                          setGranularityData({
                            title: `${metric.name} Productivity Detail`,
                            description: `Performance metrics for ${metric.name} department today.`,
                            items: [
                              { label: 'Current Rate', value: `${metric.current} ${metric.unit}`, status: metric.current >= metric.target ? 'Success' : 'Warning', detailData: {
                                  title: `${metric.name} Individual Metrics`,
                                  description: 'Top individual performer metrics.',
                                  items: [
                                    { label: 'Top Performer', value: 'John D.', status: 'Success' },
                                    { label: 'Avg Accuracy', value: '99.2%', status: 'Success' }
                                  ]
                                }},
                              { label: 'Peak Rate', value: `${metric.target + 15} ${metric.unit}`, status: 'Active' },
                              { label: 'Active Personnel', value: '12 operators', status: 'Active' }
                            ],
                            cta: {
                                label: `Incentivize ${metric.name} Team`,
                                action: () => {
                                    setBonusPool(prev => prev + 25);
                                    toast.success(`Performance bonus broadcasted to ${metric.name} floor`);
                                }
                            }
                          });
                          setShowGranularityModal(true);
                        }}
                      >
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60 font-bold uppercase tracking-wider group-hover/metric:text-porteo-orange transition-colors">{metric.name}</span>
                          <span className="text-white font-mono">{metric.current} / {metric.target} {metric.unit}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={false}
                            animate={{ width: `${Math.min(100, (metric.current / metric.target) * 100)}%` }}
                            className={`h-full transition-all duration-1000 ${metric.current >= metric.target ? 'bg-emerald-500' : 'bg-porteo-orange'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => {
                        setGranularityData({
                            title: language === 'en' ? 'Labor Forecast Details' : 'Detalles de Pronóstico Laboral',
                            description: 'Hourly staffing requirements projection.',
                            items: [
                                { label: 'Peak Hour', value: '14:00', status: 'Alert' },
                                { label: 'Required Staff', value: '92', status: 'Active' },
                                { label: 'Gap Analysis', value: '-8 units', status: 'Warning' }
                            ],
                            cta: {
                                label: language === 'en' ? 'Schedule Extra Shift' : 'Programar Turno Extra',
                                action: () => toast.success('Overtime shift scheduled for 14:00')
                            }
                        });
                        setShowGranularityModal(true);
                    }}
                    className="p-6 bg-white/5 border border-white/10 rounded-3xl cursor-pointer hover:border-porteo-orange/30 transition-all"
                  >
                    <h4 className="text-sm font-bold text-white mb-4">{language === 'en' ? 'Labor Forecasting' : 'Pronóstico de Mano de Obra'}</h4>
                    <p className="text-xs text-white/40 mb-4">{language === 'en' ? 'Predicted headcount needed for next 24 hours' : 'Personal necesario previsto para las próximas 24 horas'}</p>
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 80, 45, 30, 55, 90, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-porteo-blue/40 rounded-t-md hover:bg-porteo-blue transition-all" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] text-white/20 font-bold uppercase tracking-widest">
                      <span>00:00</span>
                      <span>12:00</span>
                      <span>23:59</span>
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <h4 className="text-sm font-bold text-white mb-4">{language === 'en' ? 'Incentive Tracking' : 'Seguimiento de Incentivos'}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">Bonus Pool Accrued</span>
                        <motion.span 
                          key={bonusPool}
                          initial={{ scale: 1.2, color: '#10b981' }}
                          animate={{ scale: 1, color: '#10b981' }}
                          className="text-sm font-bold"
                        >
                          ${bonusPool.toLocaleString()}.00
                        </motion.span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">Top Performer Bonus</span>
                        <span className="text-sm font-bold text-white">$150.00</span>
                      </div>
                      <button 
                        onClick={() => {
                          setGranularityData({
                            title: language === 'en' ? 'Incentive Rules' : 'Reglas de Incentivos',
                            description: 'How performance bonuses are calculated.',
                            items: [
                              { label: '>100% Productivity', value: '$2.00/hr', status: 'Success' },
                              { label: 'Zero Errors/Wk', value: '$50.00', status: 'Success' },
                              { label: 'Perfect Attendance', value: '$100.00', status: 'Success' }
                            ]
                          });
                          setShowGranularityModal(true);
                        }}
                        className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white mt-2 hover:bg-white/10 transition-all active:scale-95"
                      >
                        {language === 'en' ? 'View Incentive Rules' : 'Ver Reglas de Incentivos'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl">
                <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {language === 'en' ? 'Top Performers' : 'Mejores Desempeños'}
                </h4>
                <div className="space-y-4">
                  {[
                    { name: 'Marco Antonio', role: 'Picker', score: 98, avatar: 'MA' },
                    { name: 'Elena Gomez', role: 'Packer', score: 95, avatar: 'EG' },
                    { name: 'Roberto Diaz', role: 'Forklift', score: 92, avatar: 'RD' },
                    { name: 'Sofia Luna', role: 'Picker', score: 91, avatar: 'SL' },
                    { name: 'Juan Perez', role: 'Receiving', score: 89, avatar: 'JP' },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-porteo-orange/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-porteo-orange/20 flex items-center justify-center text-[10px] font-bold text-porteo-orange">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-white/40">{user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-500">{user.score}%</p>
                        <p className="text-[8px] text-white/20 uppercase font-bold">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setGranularityData({
                      title: language === 'en' ? 'Global Leaderboard' : 'Tabla de Posiciones Global',
                      description: 'Top performers across all facilities.',
                      items: [
                        { label: 'Marco Antonio', value: '98%', status: 'Success' },
                        { label: 'Elena Gomez', value: '95%', status: 'Active' },
                        { label: 'Roberto Diaz', value: '92%', status: 'Active' },
                        { label: 'Sofia Luna', value: '91%', status: 'Active' },
                        { label: 'Juan Perez', value: '89%', status: 'Active' },
                        { label: 'Your Rank', value: '#14', status: 'Warning' }
                      ]
                    });
                    setShowGranularityModal(true);
                  }}
                  className="w-full py-3 bg-porteo-orange/10 border border-porteo-orange/20 text-porteo-orange rounded-xl text-xs font-bold mt-6 hover:bg-porteo-orange hover:text-white transition-all active:scale-95"
                >
                  {language === 'en' ? 'Open Leaderboard' : 'Abrir Tabla de Posiciones'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rma' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold">{language === 'en' ? 'Returns Management (RMA)' : 'Gestión de Devoluciones (RMA)'}</h3>
                  <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Streamline reverse logistics and restocking' : 'Agilice la logística inversa y el reabastecimiento'}</p>
                </div>
                {lastSyncTime && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">ERP Sync: {lastSyncTime}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <select 
                  value={rmaFilter}
                  onChange={(e) => setRmaFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white rounded-xl text-xs px-3 py-2 outline-none focus:border-porteo-orange transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="received">Received</option>
                  <option value="pending">Pending</option>
                  <option value="inspected">Inspected</option>
                </select>
                <button 
                  onClick={() => setShowAutomationModal({ type: 'new-rma', title: language === 'en' ? 'Create New RMA' : 'Crear Nuevo RMA' })}
                  className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'en' ? 'New RMA' : 'Nuevo RMA'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">RMA ID</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer' : 'Cliente'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Reason' : 'Motivo'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Status' : 'Estado'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Date' : 'Fecha'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRmas.map((rma) => (
                    <tr 
                      key={rma.id} 
                      onClick={() => {
                        setGranularityData({
                          title: `RMA ${rma.id}`,
                          description: `Detailed report for ${rma.customer}`,
                          items: [
                            { label: 'Reason', value: rma.reason, status: 'Active', detailData: {
                                title: 'Dispute Context',
                                description: 'Reason for return documented by partner.',
                                items: [
                                    { label: 'Category', value: 'Damaged', status: 'Warning' },
                                    { label: 'Evidence', value: '3 Photos', status: 'Success' }
                                ]
                            }},
                            { label: 'Warehouse Action', value: 'Restock', status: 'Success' },
                            { label: 'Carrier', value: 'Porteo Express', status: 'Active' }
                          ],
                          cta: {
                            label: language === 'en' ? 'Approve for Restocking' : 'Aprobar para Reabastecimiento',
                            action: () => {
                                setRmaList(prev => prev.map(r => r.id === rma.id ? { ...r, status: 'restocked' } : r));
                                toast.success(`RMA ${rma.id} Approved`);
                                setLastSyncTime(new Date().toLocaleTimeString());
                            }
                          }
                        });
                        setShowGranularityModal(true);
                      }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-4 text-sm font-mono text-white/60">{rma.id}</td>
                      <td className="py-4 px-4 text-sm font-bold text-white">{rma.customer}</td>
                      <td className="py-4 px-4 text-sm text-white/60">{rma.reason}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          rma.status === 'restocked' ? 'bg-emerald-500/20 text-emerald-500' :
                          rma.status === 'inspected' ? 'bg-porteo-orange/20 text-porteo-orange' :
                          'bg-white/10 text-white/40'
                        }`}>
                          {rma.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-white/40">{rma.date}</td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setGranularityData({
                              title: `RMA Audit: ${rma.id}`,
                              description: 'Full status transition history.',
                              items: [
                                { label: 'Received', value: rma.date, status: 'Success', detailData: {
                                    title: 'Original Submission',
                                    description: 'Initial customer intake data.',
                                    items: [
                                        { label: 'Intake Channel', value: 'Partner Portal', status: 'Success' },
                                        { label: 'Ticket ID', value: 'TIC-1293', status: 'Active' }
                                    ]
                                }},
                                { label: 'Status', value: rma.status.toUpperCase(), status: 'Active' },
                                { label: 'Inspector ID', value: 'USR-882', status: 'Active' }
                              ],
                              cta: { 
                                label: 'Finalize Auditor Report', 
                                action: () => {
                                    toast.success(`Audit trail for ${rma.id} pushed to ERP`);
                                    setLastSyncTime(new Date().toLocaleTimeString());
                                }
                              }
                            });
                            setShowGranularityModal(true);
                          }}
                          className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors active:scale-90"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center text-white">
              <h3 className="text-xl font-bold">{language === 'en' ? 'Automation Health & Predictive Maintenance' : 'Salud de Automatización y Mant. Predictivo'}</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => toast.success(language === 'en' ? 'All 1,240 sensors online' : '1,240 sensores en línea')}
                  className="px-4 py-2 bg-porteo-blue/10 border border-porteo-blue/30 rounded-xl text-[10px] font-bold text-porteo-blue flex items-center gap-2 hover:bg-porteo-blue/20 transition-all active:scale-95"
                >
                  <Activity className="w-3 h-3" />
                  {language === 'en' ? 'Sensors Online' : 'Sensores en Línea'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {maintenanceEquipment.map((eq, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setShowAutomationModal({
                      type: 'maintenance-detail',
                      title: eq.name,
                      data: {
                        ...eq,
                        mlConfidence: '99.2%',
                        estimatedFailureRate: '0.04% / month',
                        aiAdvice: eq.details
                      }
                    });
                  }}
                  className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 text-left hover:border-porteo-orange/40 hover:bg-white/10 transition-all active:scale-95 group"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white group-hover:text-porteo-orange transition-colors">{eq.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      eq.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-500' : 
                      eq.status === 'Warning' ? 'bg-rose-500/20 text-rose-500' : 'bg-porteo-orange/20 text-porteo-orange'
                    }`}>
                      {eq.status}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-white">{eq.health}%</span>
                    <span className="text-[10px] text-white/40">{language === 'en' ? 'Health Score' : 'Puntaje de Salud'}</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className={`h-full ${eq.health > 90 ? 'bg-emerald-500' : eq.health > 80 ? 'bg-porteo-orange' : 'bg-rose-500'}`} style={{ width: `${eq.health}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{language === 'en' ? 'Next Service' : 'Próximo Servicio'}: {eq.nextService}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </button>
              ))}
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
              <h4 className="text-lg font-bold text-white">{language === 'en' ? 'AI Failure Prediction' : 'Predicción de Fallas por IA'}</h4>
              <div className="space-y-4">
                {maintAlerts.map((maintAlert, i) => (
                  <div key={i} className={`p-4 bg-white/5 rounded-2xl flex items-center justify-between border-l-4 ${maintAlert.probability > 50 ? 'border-rose-500' : 'border-emerald-500'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${maintAlert.probability > 50 ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                        {maintAlert.probability > 50 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{maintAlert.component}</p>
                        <p className="text-xs text-white/40">{language === 'en' ? 'Probability' : 'Probabilidad'}: {maintAlert.probability}% • {language === 'en' ? 'Est. Failure' : 'Falla Est.'}: {maintAlert.timeToFailure}</p>
                      </div>
                    </div>
                    {maintAlert.probability > 0 && (
                      <button 
                        onClick={() => {
                          toast.promise(new Promise(res => setTimeout(res, 1500)), {
                            loading: language === 'en' ? 'Intervening component...' : 'Interviniendo componente...',
                            success: language === 'en' ? 'Component healed' : 'Componente restaurado'
                          });
                          setTimeout(() => {
                            setMaintAlerts(prev => prev.map(a => a.component === maintAlert.component ? { ...a, probability: 0, timeToFailure: '365d' } : a));
                            if (maintAlert.component.includes('Bearing #442')) {
                              setMaintenanceEquipment(prev => prev.map(eq => eq.name === 'AS/RS Crane 04' ? { ...eq, health: 100, status: 'Optimal' } : eq));
                            }
                          }, 1500);
                        }}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition-all active:scale-95"
                      >
                        {language === 'en' ? 'Execute Repair' : 'Ejecutar Reparación'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sustainability' && (
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-bold">{language === 'en' ? 'Sustainability Dashboard' : 'Panel de Sostenibilidad'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Track and reduce your environmental footprint' : 'Rastree y reduzca su huella ambiental'}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500">ISO 14001 Certified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => {
                  setGranularityData({
                    title: language === 'en' ? 'Carbon Footprint Breakdown' : 'Desglose de Huella de Carbono',
                    description: 'Detailed emission report for Q1 2026.',
                    items: [
                      { label: 'Warehouse Ops', value: '4.2t (34%)', status: 'Warning', detailData: {
                          title: 'Warehouse Emissions',
                          description: 'Scope 1 & 2 emissions breakdown.',
                          items: [
                            { label: 'Cold Storage', value: '2.1t', status: 'Alert' },
                            { label: 'Lighting', value: '1.1t', status: 'Success' },
                            { label: 'Material Handling', value: '1.0t', status: 'Active' }
                          ],
                          cta: { label: 'Sync to Carbon Registry', action: () => toast.success('Emissions data synced to Carbon Registry') }
                        }},
                      { label: 'Transport', value: '6.8t (55%)', status: 'Alert', detailData: {
                          title: 'Internal Transport Carbon',
                          description: 'Fleet-based emissions.',
                          items: [
                            { label: 'Last Mile', value: '4.2t', status: 'Alert' },
                            { label: 'Line Haul', value: '2.6t', status: 'Active' }
                          ]
                        }},
                      { label: 'Packaging', value: '1.4t (11%)', status: 'Success' }
                    ]
                  });
                  setShowGranularityModal(true);
                }}
                className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 text-left hover:border-emerald-500/40 hover:bg-white/10 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{language === 'en' ? 'Carbon Footprint' : 'Huella de Carbono'}</h4>
                  <p className="text-3xl font-bold text-white mt-2">12.4 <span className="text-sm text-white/40 font-normal">tons CO2e</span></p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3" /> 8% {language === 'en' ? 'vs last month' : 'vs mes anterior'}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => {
                  setGranularityData({
                    title: language === 'en' ? 'Energy Efficiency Insights' : 'Insights de Eficiencia Energética',
                    description: 'Grid vs Renewable energy consumption.',
                    items: [
                      { label: 'Solar Contrib.', value: '35%', status: 'Success', detailData: {
                          title: 'Renewable Source Audit',
                          description: 'On-site generation metrics.',
                          items: [
                            { label: 'Panel Efficiency', value: '92%', status: 'Success' },
                            { label: 'Stored Energy', value: '450kWh', status: 'Active' }
                          ]
                        }},
                      { label: 'LED Upgrade', value: '+12%', status: 'Success' },
                      { label: 'HVAC Optim.', value: '+8%', status: 'Success' }
                    ]
                  });
                  setShowGranularityModal(true);
                }}
                className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 text-left hover:border-porteo-orange/40 hover:bg-white/10 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 bg-porteo-orange/20 text-porteo-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{language === 'en' ? 'Energy Efficiency' : 'Eficiencia Energética'}</h4>
                  <p className="text-3xl font-bold text-white mt-2">84.2 <span className="text-sm text-white/40 font-normal">kWh/m²</span></p>
                  <p className="text-xs text-porteo-orange mt-1 flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3" /> 5% {language === 'en' ? 'increase' : 'incremento'}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => {
                  setGranularityData({
                    title: language === 'en' ? 'Route Optimization Details' : 'Detalles de Optimización de Rutas',
                    description: 'Network-wide efficiency gains.',
                    items: [
                      { label: 'Miles Saved', value: '14,200km', status: 'Success', detailData: {
                          title: 'Distance Metric Audit',
                          description: 'Verification of route efficiency.',
                          items: [
                              { label: 'Route Diversity', value: 'High', status: 'Success' },
                              { label: 'Empty Mile %', value: '4%', status: 'Success' }
                          ]
                      }},
                      { label: 'Fuel Saved', value: '$2,450', status: 'Success' },
                      { label: 'AI Active', value: '100%', status: 'Active' }
                    ],
                    cta: {
                        label: 'Re-Calculate Daily Logistics',
                        action: () => {
                            toast.info('Neural re-calculation ongoing...');
                            setLastSyncTime(new Date().toLocaleTimeString());
                        }
                    }
                  });
                  setShowGranularityModal(true);
                }}
                className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 text-left hover:border-blue-500/40 hover:bg-white/10 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{language === 'en' ? 'Route Optimization' : 'Optimización de Rutas'}</h4>
                  <p className="text-3xl font-bold text-white mt-2">94%</p>
                  <p className="text-xs text-white/40 mt-1">{language === 'en' ? 'Empty mile reduction' : 'Reducción de millas vacías'}</p>
                </div>
              </button>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-white">{language === 'en' ? 'Sustainability Goals 2026' : 'Objetivos de Sostenibilidad 2026'}</h4>
                <div className="flex items-center gap-4">
                  {lastSyncTime && <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Last ERP Sync: {lastSyncTime}</span>}
                  <button 
                    onClick={() => {
                        setGranularityData({
                          title: language === 'en' ? 'Sustainability Projections' : 'Proyecciones de Sostenibilidad',
                          description: 'AI modeling of environmental goals through Dec 2026.',
                          items: [
                            { label: 'CO2 Reduction Target', value: '25%', status: 'Active' },
                            { label: 'Energy Self-Suffic.', value: '45%', status: 'Active' },
                            { label: 'Waste Diversion', value: '98%', status: 'Success' }
                          ],
                          cta: { 
                            label: 'Force ERP Sustainability Re-Sync', 
                            action: () => {
                                toast.success('Environmental metrics re-indexed in ERP');
                                setLastSyncTime(new Date().toLocaleTimeString());
                            } 
                          }
                        });
                        setShowGranularityModal(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                  >
                    <BarChart3 className="w-5 h-5 text-white/20 hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { label: language === 'en' ? 'Zero Waste to Landfill' : 'Cero Residuos a Vertedero', progress: 75, color: 'bg-emerald-500', action: language === 'en' ? 'Remaining 25%: Implementing advanced composting and plastic recycling partnerships.' : '25% restante: Implementando asociaciones avanzadas de compostaje y reciclaje de plásticos.' },
                  { label: language === 'en' ? 'Renewable Energy Transition' : 'Transición a Energía Renovable', progress: 60, color: 'bg-blue-500', action: language === 'en' ? 'Remaining 40%: Phase 2 solar panel installation scheduled for Q3 2026.' : '40% restante: Instalación de paneles solares Fase 2 programada para el tercer trimestre de 2026.' },
                  { label: language === 'en' ? 'Eco-friendly Packaging' : 'Embalaje Ecológico', progress: 90, color: 'bg-porteo-orange', action: language === 'en' ? 'Remaining 10%: Transitioning final 50 SKUs to biodegradable mailers.' : '10% restante: Transicionando los últimos 50 SKUs a sobres biodegradables.' },
                ].map((goal, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setGranularityData({
                        title: goal.label,
                        description: language === 'en' ? 'Milestones and blockers for this sustainability goal.' : 'Hitos y bloqueos para este objetivo de sostenibilidad.',
                        items: [
                          { label: 'Current Progress', value: `${goal.progress}%`, status: 'Active' },
                          { label: 'Est. Completion', value: 'Q4 2026', status: 'Active' },
                          { label: 'Action Required', value: 'High', status: 'Warning' }
                        ]
                      });
                      setShowGranularityModal(true);
                    }}
                    className="w-full space-y-2 text-left group"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60 group-hover:text-white transition-colors">{goal.label}</span>
                      <span className="text-white font-bold">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        className={`h-full ${goal.color}`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      
      {/* Master Modals for Advanced Logistics */}
      <AnimatePresence>
        {showGranularityModal && granularityData && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass max-w-2xl w-full rounded-[48px] border border-white/20 p-12 text-white"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-bold">{granularityData.title}</h3>
                  <p className="text-white/40 mt-2 text-sm">{granularityData.description}</p>
                </div>
                <button 
                  onClick={() => setShowGranularityModal(false)}
                  className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all transform hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {granularityData.items?.map((item: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => {
                        if (item.detailData) {
                            setGranularityData(item.detailData);
                        } else {
                            toast.promise(new Promise(res => setTimeout(res, 1000)), {
                              loading: language === 'en' ? `Fetching ${item.label} audit...` : `Obteniendo auditoría de ${item.label}...`,
                              success: language === 'en' ? `${item.label} data verified with ERP` : `Datos de ${item.label} verificados con ERP`,
                              error: 'Sync error'
                            });
                        }
                    }}
                    className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors group"
                  >
                    <div>
                      <p className="text-[10px] uppercase font-black text-white/40 mb-1 group-hover:text-porteo-orange transition-colors">{item.label}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'Success' ? 'bg-emerald-500/20 text-emerald-400' : 
                      item.status === 'Alert' ? 'bg-rose-500/20 text-rose-500' : 'bg-porteo-orange/20 text-porteo-orange'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  if (granularityData.cta?.action) {
                    setIsSyncing(true);
                    setTimeout(() => {
                        granularityData.cta.action();
                        setIsSyncing(false);
                        setShowGranularityModal(false);
                    }, 2000);
                  } else {
                    setIsSyncing(true);
                    setTimeout(() => {
                        toast.success('Detailed report syncing to ERP...');
                        setIsSyncing(false);
                        setShowGranularityModal(false);
                    }, 1500);
                  }
                }}
                disabled={isSyncing}
                className="mt-12 w-full py-5 bg-porteo-orange rounded-3xl font-bold flex items-center justify-center gap-3 shadow-2xl shadow-porteo-orange/30 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <Plus className="w-5 h-5" />
                )}
                {isSyncing ? (language === 'en' ? 'Synchronizing ERP...' : 'Sincronizando ERP...') : (granularityData.cta?.label || (language === 'en' ? 'Trigger Operational Action' : 'Activar Acción Operativa'))}
              </button>
            </motion.div>
          </div>
        )}

        {showAutomationModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="glass max-w-2xl w-full rounded-[48px] border border-white/20 p-12 text-white"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-porteo-orange/20 text-porteo-orange rounded-2xl">
                    <Terminal className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{showAutomationModal.title}</h3>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest mt-1">Advanced Control Interface</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAutomationModal(null)}
                  className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all transform hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {showAutomationModal.type === 'remote' && (
                <div className="space-y-8">
                  <div className="aspect-video bg-black rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent pointer-events-none" 
                    />
                    <p className="text-emerald-500 font-mono text-sm">VIDEO FEED: ONLINE • 4K STREAM</p>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Capture</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {['FWD', 'REV', 'LEFT', 'RIGHT'].map(dir => (
                      <button 
                        key={dir}
                        className="py-6 bg-white/5 border border-white/10 rounded-2xl font-black text-xs hover:bg-porteo-orange hover:text-white transition-all active:scale-95"
                        onClick={() => toast.info(`${language === 'en' ? 'Command sent' : 'Comando enviado'}: ${dir}`)}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showAutomationModal.type === 'fleet-config' && (
                <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                  {showAutomationModal.data.map((robot: any) => (
                    <div 
                      key={robot.id} 
                      onClick={() => {
                        setShowAutomationModal({
                          type: 'diagnostic',
                          title: `${language === 'en' ? 'Diagnostics' : 'Diagnóstico'} - ${robot.name}`,
                          data: robot
                        });
                      }}
                      className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between group hover:border-porteo-orange/40 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-porteo-orange transition-colors font-bold">
                          {robot.id.split('-')[1]}
                        </div>
                        <div>
                          <p className="font-bold">{robot.name}</p>
                          <p className="text-[10px] text-white/40">{language === 'en' ? 'Battery' : 'Batería'}: {robot.battery}% • {robot.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => toast.success(`Calibrating ${robot.name}...`)}
                            className="px-3 py-1.5 bg-porteo-orange/10 text-porteo-orange text-[10px] font-bold rounded-lg hover:bg-porteo-orange hover:text-white transition-all">RE-CALIBRATE</button>
                        <button 
                            onClick={() => toast.info(`Viewing logs for ${robot.id}`)}
                            className="px-3 py-1.5 bg-white/5 text-white/40 text-[10px] font-bold rounded-lg hover:text-white transition-all">LOGS</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAutomationModal.type === 'wave-config' && (
                <div className="space-y-6">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-4">
                        <div className="flex justify-between items-center text-xs text-white/40 font-bold uppercase tracking-widest">
                            <span>Wave ID</span>
                            <span className="text-white">{showAutomationModal.data.id}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-white/40 font-bold uppercase tracking-widest">
                            <span>Orders</span>
                            <span className="text-white">{showAutomationModal.data.orders}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-white/40 font-bold uppercase tracking-widest">
                            <span>Priority</span>
                            <span className="text-rose-500 uppercase">{showAutomationModal.data.priority}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all">Export Wave Log</button>
                        <button className="py-4 bg-rose-500/20 text-rose-500 rounded-2xl text-xs font-bold hover:bg-rose-500 hover:text-white transition-all">Abort Wave</button>
                    </div>
                    <button 
                        onClick={() => {
                            toast.success('Wave settings updated');
                            setShowAutomationModal(null);
                        }}
                        className="w-full py-5 bg-porteo-orange rounded-3xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        Save Configuration
                    </button>
                </div>
              )}

              {showAutomationModal.type === 'new-rma' && (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Customer Name</label>
                            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-porteo-orange outline-none transition-all" placeholder="Enter customer name..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Order Reference</label>
                                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-porteo-orange outline-none transition-all" placeholder="ORD-XXXX" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Reason</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-porteo-orange outline-none transition-all appearance-none">
                                    <option>Damaged</option>
                                    <option>Defective</option>
                                    <option>Wrong Item</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            const newRma: RMA = {
                                id: `RMA-${Math.floor(Math.random()*900)+100}`,
                                customer: 'New Porteo Client',
                                reason: 'Defective',
                                status: 'pending',
                                date: new Date().toISOString().split('T')[0]
                            };
                            setRmaList(prev => [newRma, ...prev]);
                            toast.success('RMA Created Successfully');
                            setShowAutomationModal(null);
                        }}
                        className="w-full py-5 bg-porteo-orange rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-porteo-orange/20 active:scale-95 transition-all"
                    >
                        Create RMA Request
                    </button>
                </div>
              )}

              {showAutomationModal.type === 'insight' && (
                <div className="space-y-8">
                  <div className={`p-8 border rounded-[32px] flex items-center gap-8 ${showAutomationModal.data.type === 'congestion' ? 'bg-porteo-orange/10 border-porteo-orange/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${showAutomationModal.data.type === 'congestion' ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      {showAutomationModal.data.type === 'congestion' ? <AlertTriangle className="w-10 h-10" /> : <Brain className="w-10 h-10" />}
                    </div>
                    <div>
                      <p className={`text-2xl font-black italic ${showAutomationModal.data.type === 'congestion' ? 'text-porteo-orange' : 'text-emerald-500'}`}>
                        {showAutomationModal.data.type === 'congestion' ? 'Severe Congestion Detected' : `${showAutomationModal.data.gain} Effective Gain`}
                      </p>
                      <p className="text-white/70 mt-1 font-medium leading-relaxed">{showAutomationModal.data.detail}</p>
                    </div>
                  </div>

                  {isRunningSimulation ? (
                    <div className="p-10 border border-white/10 bg-white/5 rounded-[40px] flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 mb-6 relative">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset="50" className="text-porteo-orange animate-[dash_2s_ease-in-out_infinite]" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Activity className="w-8 h-8 text-white animate-pulse" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-white mb-2">{language === 'en' ? 'Running AI Logistics Simulation...' : 'Corriendo Simulación Logística de IA...'}</p>
                      <p className="text-sm text-white/40 max-w-sm">{language === 'en' ? 'Testing proposed changes against current warehouse flow dynamics to predict results.' : 'Probando cambios propuestos contra la dinámica actual del almacén para predecir resultados.'}</p>
                    </div>
                  ) : simulationResults && simulationResults.id === showAutomationModal.data.id ? (
                    <div className="grid grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] text-center">
                        <p className="text-[10px] text-white/40 font-black uppercase mb-1 tracking-widest">
                          {showAutomationModal.data.type === 'congestion' ? 'Space Recovered' : 'Travel Reduction'}
                        </p>
                        <p className="text-2xl font-black text-emerald-500">
                          {showAutomationModal.data.type === 'congestion' ? '12%' : simulationResults.travelSaved}
                        </p>
                      </div>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] text-center">
                        <p className="text-[10px] text-white/40 font-black uppercase mb-1 tracking-widest">
                          {showAutomationModal.data.type === 'congestion' ? 'Flow Efficiency' : 'Bottleneck Prob.'}
                        </p>
                        <p className="text-2xl font-black text-emerald-500">
                          {showAutomationModal.data.type === 'congestion' ? '+18%' : '-22%'}
                        </p>
                      </div>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] text-center">
                        <p className="text-[10px] text-white/40 font-black uppercase mb-1 tracking-widest">WMS Conflict</p>
                        <p className="text-2xl font-black text-emerald-500">None</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-4 tracking-widest">Current Status</p>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${showAutomationModal.data.status === 'applied' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <p className="text-xl font-bold text-white uppercase">{showAutomationModal.data.status}</p>
                        </div>
                      </div>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-4 tracking-widest">Historical Reliability</p>
                        <p className="text-xl font-bold text-white">99.4%</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      disabled={isRunningSimulation || (simulationResults && simulationResults.id === showAutomationModal.data.id)}
                      onClick={() => {
                        setIsRunningSimulation(true);
                        setTimeout(() => {
                          setIsRunningSimulation(false);
                          const result = {
                             id: showAutomationModal.data.id,
                             travelSaved: showAutomationModal.data.travelSaved || '1.8km/day'
                          };
                          setSimulationResults(result);
                          setInsights(prev => prev.map(ins => ins.id === showAutomationModal.data.id ? { ...ins, status: 'simulated' } : ins));
                          toast.success('Simulation Complete: Verified 100% path safety.');
                        }, 2500);
                      }}
                      className={`py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all active:scale-95 border ${
                        isRunningSimulation ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {language === 'en' ? 'Run Simulation' : 'Correr Simulación'}
                    </button>
                    <button 
                      disabled={isRunningSimulation || showAutomationModal.data.status === 'applied'}
                      onClick={() => {
                        toast.promise(
                            new Promise((resolve) => setTimeout(resolve, 1500)),
                            {
                                loading: 'Communicating with WMS Layer...',
                                success: () => {
                                  setInsights(prev => prev.map(ins => ins.id === showAutomationModal.data.id ? { ...ins, status: 'applied' } : ins));
                                  setLastSyncTime(new Date().toLocaleTimeString());
                                  setHeatmapData(prev => prev.map(v => v > 0.8 ? v - 0.15 : v)); // Reactive change in heatmap
                                  setShowAutomationModal(null);
                                  return 'WMS Updated: Slotting patterns normalized.';
                                },
                                error: 'WMS Handshake Failed.'
                            }
                        );
                      }}
                      className={`py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl transform active:scale-95 transition-all ${
                        showAutomationModal.data.status === 'applied' 
                          ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 cursor-not-allowed' 
                          : 'bg-porteo-orange text-white shadow-porteo-orange/20 cursor-pointer hover:bg-porteo-orange/90'
                      }`}
                    >
                      {showAutomationModal.data.status === 'applied' 
                        ? (language === 'en' ? 'Applied' : 'Aplicado') 
                        : (language === 'en' ? 'Commit Changes' : 'Confirmar Cambios')}
                    </button>
                  </div>
                </div>
              )}

              {showAutomationModal.type === 'maintenance-detail' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                      <p className="text-[10px] text-white/40 uppercase font-black mb-1">ML Confidence</p>
                      <p className="text-2xl font-black text-emerald-500">{showAutomationModal.data.mlConfidence}</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                      <p className="text-[10px] text-white/40 uppercase font-black mb-1">Fail Probability</p>
                      <p className="text-2xl font-black text-rose-500">{showAutomationModal.data.estimatedFailureRate}</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                      <p className="text-[10px] text-white/40 uppercase font-black mb-1">Est. Repair Cost</p>
                      <p className="text-2xl font-black text-white">$450</p>
                    </div>
                  </div>
                  <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[32px] flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white uppercase text-xs tracking-widest mb-1">Predictive AI Advice</h5>
                      <p className="text-white/70 italic text-sm leading-relaxed">{showAutomationModal.data.aiAdvice}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        toast.success('Maintenance ticket created in ERP');
                        setShowAutomationModal(null);
                    }}
                    className="w-full py-5 bg-porteo-orange rounded-3xl font-bold shadow-xl shadow-porteo-orange/20 transform active:scale-95 transition-all"
                  >
                    {language === 'en' ? 'Initialize Maintenance Ticket' : 'Iniciar Ticket de Mantenimiento'}
                  </button>
                </div>
              )}

              {showAutomationModal.type === 'diagnostic' && (
                <div className="space-y-8">
                   <div className="space-y-4">
                    {[
                      { l: 'CPU Load', v: showAutomationModal.data.status === 'error' ? 98 : 42, s: showAutomationModal.data.status === 'error' ? 'Alert' : 'Success' },
                      { l: 'Optical Sensors', v: 100, s: 'Success' },
                      { l: 'Motor Torque', v: 88, s: 'Active' },
                      { l: 'Lidar Stream', v: 95, s: 'Success' },
                    ].map((diag, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                        <span className="text-xs font-bold text-white/60">{diag.l}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono">{diag.v}%</span>
                          <div className={`w-3 h-3 rounded-full ${diag.s === 'Success' ? 'bg-emerald-500' : 'bg-porteo-orange'}`} />
                        </div>
                      </div>
                    ))}
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <button 
                        onClick={() => {
                            toast.promise(new Promise(res => setTimeout(res, 2000)), {
                                loading: 'Gathering logs...',
                                success: 'Logs exported to central database'
                            });
                        }} 
                        className="py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all"
                     >
                        Export Logs
                     </button>
                     <button 
                        onClick={() => {
                            toast.success('Emergency Reset Sequenced');
                            setRobots(prev => prev.map(r => r.id === showAutomationModal.data.id ? { ...r, status: 'online', battery: 100, task: undefined } : r));
                            setShowAutomationModal(null);
                        }} 
                        className="py-4 bg-rose-500 text-white rounded-2xl text-xs font-bold hover:bg-rose-600 transition-all"
                     >
                        Emergency Reset
                     </button>
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
