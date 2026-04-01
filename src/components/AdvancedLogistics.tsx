import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  ArrowDownLeft
} from 'lucide-react';

interface Wave {
  id: string;
  name: string;
  status: 'planning' | 'releasing' | 'executing' | 'completed';
  orders: number;
  items: number;
  priority: 'low' | 'medium' | 'high';
  progress: number;
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

  const language = lang; // Alias for backward compatibility within the component

  const waves: Wave[] = [
    { id: 'W-001', name: 'Morning Retail Wave', status: 'executing', orders: 45, items: 120, priority: 'high', progress: 65 },
    { id: 'W-002', name: 'E-commerce Priority', status: 'releasing', orders: 120, items: 340, priority: 'high', progress: 15 },
    { id: 'W-003', name: 'Wholesale Batch', status: 'planning', orders: 12, items: 850, priority: 'medium', progress: 0 },
    { id: 'W-004', name: 'International Shipping', status: 'completed', orders: 28, items: 145, priority: 'medium', progress: 100 },
  ];

  const robots: Robot[] = [
    { id: 'R-101', name: 'Titan-1', type: 'AMR', status: 'busy', battery: 78, task: 'Moving Pallet to Dock 4' },
    { id: 'R-102', name: 'Swift-A', type: 'AMR', status: 'online', battery: 92 },
    { id: 'R-103', name: 'Sorter-X', type: 'Sorter', status: 'online', battery: 100 },
    { id: 'R-104', name: 'Arm-01', type: 'Arm', status: 'error', battery: 45, task: 'Pick Failure at Bin A12' },
    { id: 'R-105', name: 'Volt-2', type: 'AGV', status: 'charging', battery: 12 },
  ];

  const rmas: RMA[] = [
    { id: 'RMA-901', customer: 'Amazon Retail', reason: 'Damaged in transit', status: 'received', date: '2026-03-22' },
    { id: 'RMA-902', customer: 'Best Buy', reason: 'Wrong item shipped', status: 'pending', date: '2026-03-23' },
    { id: 'RMA-903', customer: 'Direct Consumer', reason: 'Defective unit', status: 'inspected', date: '2026-03-21' },
  ];

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
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Dynamic Wave Planning' : 'Planificación Dinámica de Oleadas'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Optimize order fulfillment through intelligent batching' : 'Optimice el cumplimiento de pedidos mediante lotes inteligentes'}</p>
              </div>
              <button 
                onClick={() => {
                  const msg = language === 'en' ? 'AI is analyzing pending orders to create optimal picking waves.' : 'La IA está analizando pedidos pendientes para crear oleadas de picking óptimas.';
                  addNotification?.(msg, 'success');
                  alert(language === 'en' ? 'Auto-generating optimal waves based on current backlog and carrier cut-off times...' : 'Auto-generando oleadas óptimas basadas en el backlog actual y horarios de corte de transportistas...');
                }}
                className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
              >
                <Zap className="w-4 h-4" />
                {language === 'en' ? 'Auto-Generate Waves' : 'Auto-Generar Oleadas'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Active Waves' : 'Oleadas Activas'}</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Avg. Pick Rate' : 'Tasa de Picking Prom.'}</p>
                <p className="text-2xl font-bold text-emerald-500">145 <span className="text-xs text-white/40 font-normal">u/hr</span></p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Labor Utilization' : 'Uso de Mano de Obra'}</p>
                <p className="text-2xl font-bold text-white">92%</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Task Interleaving' : 'Entrelazado de Tareas'}</p>
                <p className="text-2xl font-bold text-porteo-orange">Active</p>
              </div>
            </div>

            <div className="space-y-4">
              {waves.map((wave) => (
                <div key={wave.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-porteo-orange/30 transition-all group">
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
                          <h4 className="text-lg font-bold text-white">{wave.name}</h4>
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Status' : 'Estado'}</p>
                        <p className="text-sm font-bold text-white uppercase">{wave.status.replace('_', ' ')}</p>
                      </div>
                      <div className="flex gap-2">
                        {wave.status === 'planning' && (
                          <button 
                            onClick={() => {
                              const msg = language === 'en' ? `Wave ${wave.id} has been sent to the floor for execution.` : `La oleada ${wave.id} ha sido enviada al piso para su ejecución.`;
                              alert(language === 'en' ? `Releasing wave ${wave.id}...` : `Liberando oleada ${wave.id}...`);
                              addNotification?.(msg, 'info');
                            }}
                            className="p-2 bg-white/5 rounded-xl text-white/60 hover:text-white hover:bg-porteo-orange transition-all active:scale-90"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {wave.status === 'executing' && (
                          <button 
                            onClick={() => {
                              const msg = language === 'en' ? `Execution of wave ${wave.id} has been suspended.` : `La ejecución de la oleada ${wave.id} ha sido suspendida.`;
                              alert(language === 'en' ? `Pausing wave ${wave.id}...` : `Pausando oleada ${wave.id}...`);
                              addNotification?.(msg, 'alert');
                            }}
                            className="p-2 bg-white/5 rounded-xl text-white/60 hover:text-white hover:bg-red-500 transition-all active:scale-90"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            const msg = language === 'en' ? `Modifying picking parameters for ${wave.id}.` : `Modificando parámetros de picking para ${wave.id}.`;
                            alert(language === 'en' ? `Opening settings for ${wave.id}` : `Abriendo configuración para ${wave.id}`);
                            addNotification?.(msg, 'info');
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Robotics & Automation Hub' : 'Centro de Robótica y Automatización'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Monitor and orchestrate automated systems in real-time' : 'Monitoree y orqueste sistemas automatizados en tiempo real'}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const msg = language === 'en' ? 'Accessing robot profiles and operational parameters.' : 'Accediendo a perfiles de robots y parámetros operativos.';
                    alert(language === 'en' ? 'Opening Fleet Configuration...' : 'Abriendo Configuración de Flota...');
                    addNotification?.(msg, 'info');
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
                >
                  {language === 'en' ? 'Fleet Config' : 'Config. Flota'}
                </button>
                <button 
                  onClick={() => {
                    const msg = language === 'en' ? 'All automation controllers are now in sync.' : 'Todos los controladores de automatización están ahora sincronizados.';
                    alert(language === 'en' ? 'Synchronizing all systems...' : 'Sincronizando todos los sistemas...');
                    addNotification?.(msg, 'success');
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
                        const msg = language === 'en' ? `Running diagnostics for ${robot.name}...` : `Ejecutando diagnóstico para ${robot.name}...`;
                        alert(msg);
                        addNotification?.(msg, 'info');
                      }}
                      className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'Diagnostics' : 'Diagnóstico'}
                    </button>
                    <button 
                      onClick={() => {
                        const msg = language === 'en' ? `Taking remote control of ${robot.name}...` : `Tomando control remoto de ${robot.name}...`;
                        alert(msg);
                        addNotification?.(msg, 'info');
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'AI Slotting Optimization' : 'Optimización de Slotting por IA'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Maximize picking efficiency by placing high-velocity items in optimal locations' : 'Maximice la eficiencia del picking colocando artículos de alta velocidad en ubicaciones óptimas'}</p>
              </div>
              <button 
                onClick={() => {
                  const msg = language === 'en' ? 'AI is recalculating optimal item placement based on recent velocity data.' : 'La IA está recalculando la ubicación óptima de los artículos basándose en datos recientes de velocidad.';
                  addNotification?.(msg, 'info');
                  alert(language === 'en' ? 'Running AI Slotting Analysis...' : 'Ejecutando Análisis de Slotting por IA...');
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
                  {Array.from({ length: 50 }).map((_, i) => {
                    const velocity = Math.random();
                    return (
                      <div 
                        onClick={() => alert(language === 'en' ? `Zone ${i+1} Velocity Details:\n- Current Throughput: ${Math.round(velocity * 100)}%\n- Recommended Action: ${velocity > 0.8 ? 'High congestion - consider load balancing.' : velocity < 0.2 ? 'Underutilized - consider re-slotting slower items here.' : 'Optimal performance.'}` : `Detalles de Velocidad de Zona ${i+1}:\n- Rendimiento Actual: ${Math.round(velocity * 100)}%\n- Acción Recomendada: ${velocity > 0.8 ? 'Alta congestión - considere equilibrar la carga.' : velocity < 0.2 ? 'Subutilizada - considere re-ubicar artículos más lentos aquí.' : 'Rendimiento óptimo.'}`)}
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
                  <h4 className="text-sm font-bold text-white mb-4">{language === 'en' ? 'Optimization Insights' : 'Insights de Optimización'}</h4>
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl group cursor-pointer hover:bg-emerald-500/20 transition-all">
                      <p className="text-xs font-bold text-emerald-500 mb-1">Potential Gain: 14%</p>
                      <p className="text-[10px] text-white/60">Moving SKU-882 to Zone A will reduce travel time by 2.4km/day.</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const msg = language === 'en' ? 'SKU-882 has been re-slotted to Zone A.' : 'SKU-882 ha sido re-ubicado en la Zona A.';
                          alert(language === 'en' ? 'Applying optimization for SKU-882...' : 'Aplicando optimización para SKU-882...');
                          addNotification?.(msg, 'success');
                        }}
                        className="mt-2 text-[8px] font-bold text-emerald-500 uppercase tracking-widest hover:underline"
                      >
                        {language === 'en' ? 'Apply Optimization' : 'Aplicar Optimización'}
                      </button>
                    </div>
                    <div className="p-3 bg-porteo-orange/10 border border-porteo-orange/20 rounded-xl group cursor-pointer hover:bg-porteo-orange/20 transition-all">
                      <p className="text-xs font-bold text-porteo-orange mb-1">Congestion Alert</p>
                      <p className="text-[10px] text-white/60">Zone B4 is currently over-saturated. Recommend splitting high-volume items.</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(language === 'en' ? 'Viewing congestion details for Zone B4...' : 'Viendo detalles de congestión para Zona B4...');
                          addNotification?.(language === 'en' ? 'Analyzing traffic patterns in Zone B4.' : 'Analizando patrones de tráfico en la Zona B4.', 'info');
                        }}
                        className="mt-2 text-[8px] font-bold text-porteo-orange uppercase tracking-widest hover:underline"
                      >
                        {language === 'en' ? 'View Details' : 'Ver Detalles'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <h4 className="text-sm font-bold text-white mb-2">{language === 'en' ? 'Space Utilization' : 'Uso de Espacio'}</h4>
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Labor Management (LMS)' : 'Gestión de Mano de Obra (LMS)'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Track performance, manage shifts, and gamify warehouse operations' : 'Rastree el desempeño, gestione turnos y gamifique las operaciones del almacén'}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const msg = language === 'en' ? 'Current shift: Morning A. 42 associates active.' : 'Turno actual: Mañana A. 42 asociados activos.';
                    addNotification?.(msg, 'info');
                    alert(language === 'en' ? 'Shift Schedule Details:\n- Current Shift: Morning A (06:00 - 14:00)\n- Active Personnel: 42\n- On Break: 4\n- Next Shift Start: 14:00' : 'Detalles del Horario de Turnos:\n- Turno Actual: Mañana A (06:00 - 14:00)\n- Personal Activo: 42\n- En Descanso: 4\n- Inicio del Próximo Turno: 14:00');
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
                >
                  {language === 'en' ? 'Shift Schedule' : 'Horario de Turnos'}
                </button>
                <button 
                  onClick={() => {
                    const msg = language === 'en' ? 'Daily productivity report is ready for review.' : 'El reporte de productividad diaria está listo para revisión.';
                    addNotification?.(msg, 'success');
                    alert(language === 'en' ? 'Performance Report Summary:\n- Overall Productivity: 94%\n- Accuracy Rate: 99.8%\n- Safety Incidents: 0\n- Top Department: Picking' : 'Resumen del Reporte de Desempeño:\n- Productividad General: 94%\n- Tasa de Precisión: 99.8%\n- Incidentes de Seguridad: 0\n- Mejor Departamento: Picking');
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
                    {[
                      { name: 'Picking', current: 145, target: 160, unit: 'u/hr' },
                      { name: 'Packing', current: 42, target: 40, unit: 'o/hr' },
                      { name: 'Receiving', current: 12, target: 10, unit: 'p/hr' },
                    ].map((metric, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60 font-bold uppercase tracking-wider">{metric.name}</span>
                          <span className="text-white font-mono">{metric.current} / {metric.target} {metric.unit}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(metric.current / metric.target) * 100}%` }}
                            className={`h-full ${metric.current >= metric.target ? 'bg-emerald-500' : 'bg-porteo-orange'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
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
                        <span className="text-sm font-bold text-emerald-500">$4,250.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">Top Performer Bonus</span>
                        <span className="text-sm font-bold text-white">$150.00</span>
                      </div>
                      <button 
                        onClick={() => alert(language === 'en' ? 'Incentive Rules:\n- >100% Productivity: $2.00/hr bonus\n- Zero errors/week: $50.00 bonus\n- Perfect attendance/month: $100.00 bonus' : 'Reglas de Incentivos:\n- >100% Productividad: Bono de $2.00/hr\n- Cero errores/semana: Bono de $50.00\n- Asistencia perfecta/mes: Bono de $100.00')}
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
                    const msg = language === 'en' ? 'Viewing real-time performance rankings across the network.' : 'Viendo clasificaciones de desempeño en tiempo real en toda la red.';
                    alert(language === 'en' ? 'Global Leaderboard:\n1. Marco Antonio (98%)\n2. Elena Gomez (95%)\n3. Roberto Diaz (92%)\n...\nYour Rank: #14 (84%)' : 'Tabla de Posiciones Global:\n1. Marco Antonio (98%)\n2. Elena Gomez (95%)\n3. Roberto Diaz (92%)\n...\nTu Rango: #14 (84%)');
                    addNotification?.(msg, 'info');
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Returns Management (RMA)' : 'Gestión de Devoluciones (RMA)'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Streamline reverse logistics and restocking' : 'Agilice la logística inversa y el reabastecimiento'}</p>
              </div>
              <button 
                onClick={() => {
                  const msg = language === 'en' ? 'Please complete the return details to submit.' : 'Por favor complete los detalles de la devolución para enviar.';
                  addNotification?.(msg, 'info');
                  alert(language === 'en' ? 'New RMA Request Form:\n- Step 1: Customer Info\n- Step 2: Item Selection\n- Step 3: Reason for Return\n- Step 4: Photo Upload' : 'Formulario de Nueva Solicitud de RMA:\n- Paso 1: Información del Cliente\n- Paso 2: Selección de Artículos\n- Paso 3: Motivo de la Devolución\n- Paso 4: Carga de Fotos');
                }}
                className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {language === 'en' ? 'New RMA' : 'Nuevo RMA'}
              </button>
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
                  {rmas.map((rma) => (
                    <tr key={rma.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
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
                          onClick={() => {
                            const msg = language === 'en' ? `Viewing full audit trail and status history for ${rma.id}.` : `Viendo rastro de auditoría completo e historial de estado para ${rma.id}.`;
                            alert(language === 'en' ? `RMA Details for ${rma.id}:\n- Customer: ${rma.customer}\n- Reason: ${rma.reason}\n- Status: ${rma.status.toUpperCase()}\n- Date: ${rma.date}\n- Tracking: TRK-${rma.id.split('-')[1]}` : `Detalles de RMA para ${rma.id}:\n- Cliente: ${rma.customer}\n- Motivo: ${rma.reason}\n- Estado: ${rma.status.toUpperCase()}\n- Fecha: ${rma.date}\n- Seguimiento: TRK-${rma.id.split('-')[1]}`);
                            addNotification?.(msg, 'info');
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
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Automation Health & Predictive Maintenance' : 'Salud de Automatización y Mant. Predictivo'}</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => alert(language === 'en' ? 'All 1,240 sensors are currently online and transmitting telemetry data.' : 'Los 1,240 sensores están actualmente en línea y transmitiendo datos de telemetría.')}
                  className="px-4 py-2 bg-porteo-blue/10 border border-porteo-blue/30 rounded-xl text-[10px] font-bold text-porteo-blue flex items-center gap-2 hover:bg-porteo-blue/20 transition-all active:scale-95"
                >
                  <Activity className="w-3 h-3" />
                  {language === 'en' ? 'Sensors Online' : 'Sensores en Línea'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Conveyor System A', health: 94, nextService: '12 days', status: 'Optimal', details: language === 'en' ? '6% reduction due to slight vibration in motor bearings. Recommended action: Lubricate bearings within 12 days.' : 'Reducción del 6% debido a una ligera vibración en los rodamientos del motor. Acción recomendada: Lubricar rodamientos en 12 días.' },
                { name: 'AS/RS Crane 04', health: 78, nextService: '2 days', status: 'Warning', details: language === 'en' ? '22% warning: Hydraulic pressure fluctuation detected. Critical action: Inspect seals and fluid levels immediately.' : 'Advertencia del 22%: Se detectó fluctuación de presión hidráulica. Acción crítica: Inspeccionar sellos y niveles de fluido de inmediato.' },
                { name: 'Sortation Hub', health: 98, nextService: '45 days', status: 'Optimal', details: language === 'en' ? '2% variance: Normal wear on sorter belts. No immediate action required.' : 'Varianza del 2%: Desgaste normal en las correas del clasificador. No se requiere acción inmediata.' },
                { name: 'AGV Fleet', health: 82, nextService: '5 days', status: 'Good', details: language === 'en' ? '18% reduction: Battery degradation in 2 units and wheel alignment needed on 1 unit.' : 'Reducción del 18%: Degradación de batería en 2 unidades y alineación de ruedas necesaria en 1 unidad.' },
              ].map((eq, i) => (
                <button 
                  key={i} 
                  onClick={() => alert(`${eq.name}\n\n${eq.details}`)}
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
                {[
                  { component: 'Bearing #442 (AS/RS 04)', probability: 82, timeToFailure: '48h', severity: 'High' },
                  { component: 'Motor M-12 (Conveyor A)', probability: 15, timeToFailure: '14d', severity: 'Low' },
                ].map((maintAlert, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border-l-4 border-rose-500">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-rose-500/20 text-rose-500 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{maintAlert.component}</p>
                        <p className="text-xs text-white/40">{language === 'en' ? 'Probability' : 'Probabilidad'}: {maintAlert.probability}% • {language === 'en' ? 'Est. Failure' : 'Falla Est.'}: {maintAlert.timeToFailure}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(language === 'en' ? `Scheduling repair for ${maintAlert.component}...` : `Programando reparación para ${maintAlert.component}...`)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'Schedule Repair' : 'Programar Reparación'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sustainability' && (
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Sustainability Dashboard' : 'Panel de Sostenibilidad'}</h3>
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
                  alert(language === 'en' ? 'Carbon Footprint Breakdown:\n- Warehouse Operations: 4.2t (34%)\n- Transport & Logistics: 6.8t (55%)\n- Packaging Materials: 1.4t (11%)\n\nRecommended Action: Switch to electric forklifts in Zone B to reduce warehouse emissions by 0.5t/month.' : 'Desglose de Huella de Carbono:\n- Operaciones de Almacén: 4.2t (34%)\n- Transporte y Logística: 6.8t (55%)\n- Materiales de Embalaje: 1.4t (11%)\n\nAcción Recomendada: Cambiar a montacargas eléctricos en la Zona B para reducir las emisiones del almacén en 0.5t/mes.');
                  addNotification?.(language === 'en' ? 'Detailed emission report generated for Q1 2026.' : 'Reporte detallado de emisiones generado para el primer trimestre de 2026.', 'info');
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
                  alert(language === 'en' ? 'Energy Efficiency Insights:\n- Solar contribution: 35% (Peak: 12:00 PM)\n- LED lighting upgrade: +12% efficiency\n- HVAC optimization: +8% efficiency\n\nCall to Action: Schedule solar panel cleaning to regain 5% efficiency loss due to dust.' : 'Insights de Eficiencia Energética:\n- Contribución solar: 35% (Pico: 12:00 PM)\n- Mejora de iluminación LED: +12% eficiencia\n- Optimización de HVAC: +8% eficiencia\n\nLlamada a la Acción: Programar limpieza de paneles solares para recuperar el 5% de pérdida de eficiencia por polvo.');
                  addNotification?.(language === 'en' ? 'Real-time energy consumption patterns analyzed.' : 'Patrones de consumo de energía en tiempo real analizados.', 'info');
                }}
                className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 text-left hover:border-porteo-orange/40 hover:bg-white/10 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 bg-porteo-orange/20 text-porteo-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{language === 'en' ? 'Energy Efficiency' : 'Eficiencia Energética'}</h4>
                  <p className="text-3xl font-bold text-white mt-2">84.2 <span className="text-sm text-white/40 font-normal">kWh/m²</span></p>
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3" /> 12% {language === 'en' ? 'reduction' : 'reducción'}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => {
                  alert(language === 'en' ? 'Route Optimization Details:\n- AI-driven dynamic routing active\n- Empty mile reduction: 14,200km saved this month\n- Fuel savings: $2,450.00\n\nCall to Action: Review "Empty Mile" report to identify further backhaul opportunities.' : 'Detalles de Optimización de Rutas:\n- Enrutamiento dinámico impulsado por IA activo\n- Reducción de millas vacías: 14,200km ahorrados este mes\n- Ahorro de combustible: $2,450.00\n\nLlamada a la Acción: Revisar reporte de "Millas Vacías" para identificar más oportunidades de retorno de carga.');
                  addNotification?.(language === 'en' ? 'Logistics network efficiency is at an all-time high.' : 'La eficiencia de la red logística está en un máximo histórico.', 'info');
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
                <button 
                  onClick={() => {
                    alert(language === 'en' ? 'Opening detailed sustainability projection chart...' : 'Abriendo gráfico detallado de proyección de sostenibilidad...');
                    addNotification?.(language === 'en' ? 'Projecting environmental impact through 2026.' : 'Proyectando impacto ambiental hasta 2026.', 'info');
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                >
                  <BarChart3 className="w-5 h-5 text-white/20 hover:text-white transition-colors" />
                </button>
              </div>
              <div className="space-y-6">
                {[
                  { label: language === 'en' ? 'Zero Waste to Landfill' : 'Cero Residuos a Vertedero', progress: 75, color: 'bg-emerald-500', action: language === 'en' ? 'Remaining 25%: Implementing advanced composting and plastic recycling partnerships.' : '25% restante: Implementando asociaciones avanzadas de compostaje y reciclaje de plásticos.' },
                  { label: language === 'en' ? 'Renewable Energy Transition' : 'Transición a Energía Renovable', progress: 60, color: 'bg-blue-500', action: language === 'en' ? 'Remaining 40%: Phase 2 solar panel installation scheduled for Q3 2026.' : '40% restante: Instalación de paneles solares Fase 2 programada para el tercer trimestre de 2026.' },
                  { label: language === 'en' ? 'Eco-friendly Packaging' : 'Embalaje Ecológico', progress: 90, color: 'bg-porteo-orange', action: language === 'en' ? 'Remaining 10%: Transitioning final 50 SKUs to biodegradable mailers.' : '10% restante: Transicionando los últimos 50 SKUs a sobres biodegradables.' },
                ].map((goal, i) => (
                  <button 
                    key={i} 
                    onClick={() => alert(`${goal.label}\n\n${goal.action}`)}
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
  );
};
