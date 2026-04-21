import React, { useState } from 'react';
import { 
  Cpu, 
  Brain, 
  Activity, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Search, 
  Filter,
  Users,
  MoreHorizontal,
  CheckCircle2, 
  AlertCircle,
  Plus,
  Terminal,
  Code,
  Database,
  X,
  RefreshCw,
  RotateCcw,
  Server,
  Cloud,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AIProps {
  lang?: 'en' | 'es';
}

export const AI: React.FC<AIProps> = ({ lang = 'en' }) => {
  const [activeModel, setActiveModel] = useState<any | null>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [showAutoScaling, setShowAutoScaling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [overrideActive, setOverrideActive] = useState(false);
  const [consoleCommand, setConsoleCommand] = useState('');
  const [systemHealth, setSystemHealth] = useState([
    { id: 'cpu', label: lang === 'en' ? 'CPU Usage' : 'Uso de CPU', value: 42, color: 'bg-porteo-blue' },
    { id: 'memory', label: lang === 'en' ? 'Memory Load' : 'Carga de Memoria', value: 65, color: 'bg-porteo-orange' },
    { id: 'latency', label: lang === 'en' ? 'API Latency' : 'Latencia API', value: 12, color: 'bg-emerald-400' },
    { id: 'error', label: lang === 'en' ? 'Error Rate' : 'Tasa de Error', value: 0.2, color: 'bg-emerald-400 text-[10px]' },
  ]);
  const [consoleLines, setConsoleLines] = useState<string[]>([
    '[09:12:45] SYNC: Neural G-Core v5.0 synchronized with Porteo ecosystem.',
    '[09:12:50] MONITOR: Latency optimized to 95ms (Turbo Mode active).',
    '[09:13:02] ALERT: Predictive scale-up initiated for Bajío corridor (+14%).',
    '[09:13:05] ACTION: Routing deep-learning priorities to PREDICT_CORE_V5.'
  ]);
  const [selectedCandidate, setSelectedCandidate] = useState('PREDICT_CORE_V5');

  const [models, setModels] = useState([
    { id: 'LOGISTICS_AGENT_V5', name: 'Logistics Agent v5 (Neural)', status: 'ACTIVE', accuracy: '98.2%', latency: '95ms', type: 'Decision Engine', description: 'Advanced Neural G-Core v5.0 managing dock prioritization and warehouse slotting.' },
    { id: 'DEMAND_PRED_V5', name: 'Demand Predictor v5 (Deep)', status: 'ACTIVE', accuracy: '96.5%', latency: '240ms', type: 'Forecasting', description: 'Next-gen predictive model analyzing global seasonal trends and nearshoring behavior.' },
    { id: 'ROUTE_OPT_V5', name: 'Route Optimizer v5 (Turbo)', status: 'ACTIVE', accuracy: '99.1%', latency: '45ms', type: 'Optimization', description: 'Hyper-optimized routing engine for multi-modal fleet coordination and fuel reduction.' },
  ]);

  const [logs, setLogs] = useState([
    { id: '1', agent: 'LOGISTICS_AGENT_V1', decision: 'Rerouted ORD-001 to Warehouse B', context: 'Traffic congestion detected in Mexico-Puebla highway. Estimated 45min delay avoided.', feedback: 5, time: '2 mins ago', status: 'VERIFIED' },
    { id: '2', agent: 'ROUTE_OPT_V3', decision: 'Optimized Route for Unit MX-123', context: 'Fuel savings: 12%. Rerouted through bypass to avoid city construction.', feedback: 4, time: '15 mins ago', status: 'VERIFIED' },
    { id: '3', agent: 'LOGISTICS_AGENT_V1', decision: 'Flagged SKU-002 for low stock', context: 'Demand spike predicted for upcoming holiday season. Lead time buffer increased.', feedback: 5, time: '1 hour ago', status: 'VERIFIED' },
  ]);

  const t = {
    en: {
      console: 'AI Console',
      deploy: 'Deploy Model',
      activeModels: 'Active Models',
      decisionLogs: 'Decision Logs',
      systemHealth: 'System Health',
      autoScaling: 'Auto-Scaling Active',
      status: 'Status',
      accuracy: 'Accuracy',
      latency: 'Latency',
      type: 'Type',
      close: 'Close',
      deploying: 'Generating neural paths...',
      deployed: 'Model successfully integrated into WMS.',
      logs: 'Neural logs extracted.',
      executing: 'Executing command...',
      commandRun: 'Command processed by neural core.',
      contactAdmin: 'Contact System Administrator',
      emergencyStop: 'Emergency AI Override',
      calibrate: 'Force Calibration',
      report: 'Report Anomaly',
      retrain: 'Trigger Retraining',
      rollback: 'Rollback to v-1'
    },
    es: {
      console: 'Consola IA',
      deploy: 'Desplegar Modelo',
      activeModels: 'Modelos Activos',
      decisionLogs: 'Registros de Decisión',
      systemHealth: 'Salud del Sistema',
      autoScaling: 'Escalado Automático Activo',
      status: 'Estado',
      accuracy: 'Precisión',
      latency: 'Latencia',
      type: 'Tipo',
      close: 'Cerrar',
      deploying: 'Generando rutas neuronales...',
      deployed: 'Modelo integrado exitosamente en el WMS.',
      logs: 'Registros neuronales extraídos.',
      executing: 'Ejecutando comando...',
      commandRun: 'Comando procesado por el núcleo neural.',
      contactAdmin: 'Contactar Administrador',
      emergencyStop: 'Anulación de IA de Emergencia',
      calibrate: 'Forzar Calibración',
      report: 'Reportar Anomalía',
      retrain: 'Activar Reentrenamiento',
      rollback: 'Revertir a v-1'
    }
  }[lang];

  const addConsoleLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setConsoleLines(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleRetrain = (id: string) => {
    toast.loading(t.retrain + "...");
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: 'RE-TRAINING' } : m));
    addConsoleLog(`RE-TRAINING: Initiated neural weight update for ${id}.`);
    setTimeout(() => {
      setModels(prev => prev.map(m => m.id === id ? { ...m, status: 'TRAINING' } : m));
      toast.success(lang === 'en' ? 'Retraining queued and active.' : 'Reentrenamiento en cola y activo.');
    }, 2000);
  };

  const handleRollback = (id: string) => {
    toast.loading(t.rollback + "...");
    addConsoleLog(`ROLLBACK: Reverting neural cluster ${id} to stable v-1 snapshot.`);
    setTimeout(() => {
      setModels(prev => prev.map(m => m.id === id ? { ...m, name: m.name + " (STABLE)", accuracy: '91.2%', status: 'ACTIVE' } : m));
      toast.success(lang === 'en' ? 'Rollback completed. System restored.' : 'Reversión completada. Sistema restaurado.');
    }, 2000);
  };

  const handleAnomaly = (logId: string) => {
    toast.info(t.report + "...");
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'FLAGGED' } : l));
    addConsoleLog(`ANOMALY: Entry ${logId} flagged for expert forensic review.`);
    setTimeout(() => {
      setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'FLAGGED' } : l));
      toast.success(lang === 'en' ? 'Anomaly report registered in decision history.' : 'Reporte de anomalía registrado en el historial.');
    }, 1500);
  };

  const handleManualOverride = (logId: string) => {
    setOverrideActive(true);
    toast.error(t.emergencyStop + "...");
    addConsoleLog(`EMERGENCY: Manual override active. Neural decision ${logId} nullified.`);
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'NULLIFIED' } : l));
    setTimeout(() => {
      toast.error(lang === 'en' ? 'Emergency Protocol: System in manual mode.' : 'Protocolo de Emergencia: Sistema en modo manual.');
    }, 2000);
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    toast.promise(
      new Promise(r => setTimeout(r, 2500)),
      {
        loading: t.deploying,
        success: () => {
          setIsDeploying(false);
          setShowDeployModal(false);
          const newModel = {
            id: selectedCandidate,
            name: selectedCandidate.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
            status: 'ACTIVE',
            accuracy: '96.5%',
            latency: '145ms',
            type: selectedCandidate.includes('PREDICT') ? 'Forecasting' : 'Optimization',
            description: `Newly deployed neural cluster for ${selectedCandidate.toLowerCase()} optimizations.`
          };
          setModels([newModel, ...models]);
          addConsoleLog(`DEPLOY: Model ${selectedCandidate} integrated successfully.`);
          return t.deployed;
        }
      }
    );
  };

  const handleForceCalibration = () => {
    setIsCalibrating(true);
    addConsoleLog("SYSTEM: Global neural calibration cycle initiated.");
    toast.promise(
      new Promise(r => setTimeout(r, 3000)),
      {
        loading: lang === 'en' ? 'Recalibrating sensor array...' : 'Recalibrando matriz de sensores...',
        success: () => {
          setIsCalibrating(false);
          setSystemHealth(prev => prev.map(h => ({ ...h, value: Math.max(10, h.value - 15) })));
          addConsoleLog("SYSTEM: Calibration successful. Latency and load reduced by 15%.");
          return lang === 'en' ? 'System calibrated and optimized.' : 'Sistema calibrado y optimizado.';
        }
      }
    );
  };

  const handleAutoScalingAction = () => {
    addConsoleLog("AUTOSCALE: Demand spike stabilization complete. 2 nodes integrated.");
    setSystemHealth(prev => prev.map(h => h.id === 'cpu' ? { ...h, value: 35 } : h));
    setShowAutoScaling(false);
    toast.success(lang === 'en' ? 'Scalability validated.' : 'Escalabilidad validada.');
  };

  const handleRunCommand = () => {
    if (!consoleCommand.trim()) return;
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const newLines = [...consoleLines, `[${time}] > ${consoleCommand}`, `[${time}] EXECUTING: ${t.commandRun}`];
    setConsoleLines(newLines);
    setConsoleCommand('');
    toast.success(t.commandRun);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">AI Platform</h1>
          <p className="text-white/60 mt-2">Agent Decision Logging & Model Evaluation</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowConsole(true)}
            className="glass px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10"
          >
            <Terminal className="w-5 h-5 text-porteo-blue" />
            {t.console}
          </button>
          <button 
            onClick={() => setShowDeployModal(true)}
            className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20"
          >
            <Zap className="w-5 h-5" />
            {t.deploy}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {overrideActive && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="p-4 bg-red-600/20 border border-red-600/40 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-xs">
                  <AlertCircle className="w-5 h-5" />
                  {lang === 'en' ? 'Emergency Manual Override Active' : 'Anulación Manual de Emergencia Activa'}
                </div>
                <button 
                  onClick={() => {
                    setOverrideActive(false);
                    addConsoleLog("SYSTEM: Emergency override deactivated. Neural control resumed.");
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase group overflow-hidden relative"
                >
                  <span className="relative z-10">{lang === 'en' ? 'Resume AI Control' : 'Reanudar Control IA'}</span>
                </button>
              </motion.div>
            )}
            
            <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t.activeModels}</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toast.info(t.logs)}
                  className="p-2 glass rounded-lg text-white/40 border border-white/10 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">{lang === 'en' ? 'Model Name' : 'Nombre del Modelo'}</th>
                    <th className="px-6 py-4">{t.status}</th>
                    <th className="px-6 py-4">{t.accuracy}</th>
                    <th className="px-6 py-4">{t.latency}</th>
                    <th className="px-6 py-4">{t.type}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {models.map((model) => (
                    <tr 
                      key={model.id} 
                      onClick={() => setActiveModel(model)}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-porteo-blue/10 flex items-center justify-center text-porteo-blue font-bold group-hover:scale-110 transition-transform">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-bold">{model.name}</p>
                            <p className="text-xs text-white/40 font-mono">{model.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          model.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400' : 
                          model.status === 'RE-TRAINING' ? 'bg-porteo-blue/10 text-porteo-blue animate-pulse' :
                          'bg-amber-400/10 text-amber-400'
                        }`}>
                          {model.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-white font-bold">{model.accuracy}</td>
                      <td className="px-6 py-5 text-white/60 font-medium">{model.latency}</td>
                      <td className="px-6 py-5 text-white/40 text-sm">{model.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t.decisionLogs}</h3>
            </div>
            <div className="p-6 space-y-6">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  onClick={() => setSelectedLog(log)}
                  className="flex gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-porteo-blue/50 hover:bg-white/10 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-porteo-blue/10 flex items-center justify-center text-porteo-blue font-bold shrink-0">
                    <Code className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">{log.decision}</h4>
                        {log.status === 'FLAGGED' && (
                          <span className="px-2 py-0.5 bg-porteo-orange/20 text-porteo-orange text-[8px] font-bold rounded-full uppercase tracking-widest border border-porteo-orange/40">Anomaly</span>
                        )}
                        {log.status === 'NULLIFIED' && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-bold rounded-full uppercase tracking-widest border border-red-500/40 text-xs">Overridden</span>
                        )}
                      </div>
                      <span className="text-xs text-white/40 font-mono">{log.time}</span>
                    </div>
                    <p className="text-sm text-white/60 line-clamp-1">{log.context}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className={`w-3 h-3 rounded-full ${star <= log.feedback ? 'bg-emerald-400' : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Agent: {log.agent}</span>
                    </div>
                  </div>
                  <div className="p-2 text-white/40 group-hover:text-porteo-blue transition-colors self-start">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div 
            onClick={() => setShowSystemHealth(true)}
            className="glass p-8 rounded-3xl border border-white/10 hover:border-porteo-blue/50 group transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white">{t.systemHealth}</h3>
              <Activity className="w-5 h-5 text-porteo-blue group-hover:animate-pulse" />
            </div>
            <div className="space-y-6">
              {systemHealth.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-white">{item.value}{typeof item.value === 'number' && item.value < 1 ? '' : '%'}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${item.color} ${isCalibrating ? 'animate-pulse opacity-50' : ''}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div 
            onClick={() => setShowAutoScaling(true)}
            className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-porteo-blue/5 to-transparent hover:border-porteo-orange transition-all cursor-pointer group"
          >
            <div className="p-4 bg-porteo-blue/20 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-porteo-blue" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.autoScaling}</h3>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              AI Platform has detected a demand spike in MX-CDMX. Automatically provisioned 2 additional worker nodes.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              System Stabilized
            </div>
          </div>
        </div>
      </div>

      {/* Modals Implementation */}

      {/* AI Console Modal */}
      <AnimatePresence>
        {showConsole && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowConsole(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden flex flex-col h-[600px]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-porteo-blue" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t.console}</h3>
                </div>
                <button onClick={() => setShowConsole(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="flex-1 bg-black/50 rounded-2xl p-6 font-mono text-sm text-emerald-400 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  <p className="text-white/40 uppercase tracking-widest text-[10px] mb-4">Neural Connection Established v4.2.0</p>
                  {consoleLines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                  <p className="text-porteo-blue mt-4">{'>'} Initiating cross-border model validation...</p>
                  <p className="animate-pulse">{'>'} Waiting for command...</p>
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <input 
                  type="text" 
                  value={consoleCommand}
                  onChange={(e) => setConsoleCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
                  placeholder="Neural Command..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-blue transition-all"
                />
                <button 
                  onClick={handleRunCommand}
                  className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold hover:bg-porteo-blue/80 transition-colors"
                >
                  {lang === 'en' ? 'Run' : 'Ejecutar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deploy Model Modal */}
      <AnimatePresence>
        {showDeployModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowDeployModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{t.deploy}</h3>
                <p className="text-white/40 text-sm mt-2">{lang === 'en' ? 'Push a new neural candidate to production.' : 'Despliega un nuevo candidato neural a producción.'}</p>
              </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'Select Candidate' : 'Seleccionar Candidato'}</label>
                    <select 
                      value={selectedCandidate}
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option className="bg-slate-900" value="PREDICT_CORE_V5">PREDICT_CORE_V5 (Neural)</option>
                      <option className="bg-slate-900" value="OPTIM_WAREHOUSE_V5">OPTIM_WAREHOUSE_V5 (Core)</option>
                      <option className="bg-slate-900" value="TRANSPO_LOG_V1">TRANSPO_LOG_V1 (Expert)</option>
                    </select>
                  </div>
                  <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/20 rounded-2xl">
                    <p className="text-sm text-white/80 font-medium mb-1">{lang === 'en' ? 'Confidence Score' : 'Puntaje de Confianza'}</p>
                    <p className="text-2xl font-bold text-porteo-blue">{selectedCandidate.includes('NEURAL') ? '99.1%' : '98.4%'}</p>
                  </div>
                </div>
              <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full mt-8 py-4 bg-porteo-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {isDeploying ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {t.deploy}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Model Detail Modal */}
      <AnimatePresence>
        {activeModel && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setActiveModel(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-[20px] bg-porteo-blue/10 flex items-center justify-center text-porteo-blue">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{activeModel.name}</h3>
                  <p className="text-porteo-blue font-mono text-sm">{activeModel.id}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-8">{activeModel.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{t.accuracy}</p>
                  <p className="text-xl font-bold text-emerald-400">{activeModel.accuracy}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{t.latency}</p>
                  <p className="text-xl font-bold text-porteo-orange">{activeModel.latency}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={() => handleRetrain(activeModel.id)}
                  className="py-3 px-4 bg-porteo-blue/20 border border-porteo-blue/40 text-porteo-blue rounded-xl font-bold text-sm hover:bg-porteo-blue/30 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.retrain}
                </button>
                <button 
                  onClick={() => handleRollback(activeModel.id)}
                  className="py-3 px-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.rollback}
                </button>
              </div>
              <button 
                onClick={() => setActiveModel(null)}
                className="w-full mt-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold"
              >
                {t.close}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decision Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setSelectedLog(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-[20px] bg-porteo-blue/10 flex items-center justify-center text-porteo-blue font-bold">
                  <Code className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">{lang === 'en' ? 'Decision Analysis' : 'Análisis de Decisión'}</h3>
                  <p className="text-white/40 text-xs">{selectedLog.time}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-emerald-400 uppercase font-bold mb-1 tracking-widest">Decision</p>
                  <p className="text-lg text-white font-bold">{selectedLog.decision}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1 tracking-widest">Reasoning Context</p>
                  <p className="text-sm text-white/60 leading-relaxed">{selectedLog.context}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1 tracking-widest">Confidence Score</p>
                    <p className="text-lg font-bold text-porteo-blue">{(selectedLog.feedback * 20).toFixed(1)}%</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => {
                    handleAnomaly(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="flex-1 py-3 px-4 bg-porteo-orange/20 border border-porteo-orange/40 text-porteo-orange rounded-xl font-bold text-sm hover:bg-porteo-orange/30 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {t.report}
                </button>
                <button 
                  onClick={() => {
                    handleManualOverride(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="flex-1 py-3 px-4 bg-red-600/10 border border-red-600/20 text-red-600 rounded-xl font-bold text-sm hover:bg-red-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {t.emergencyStop}
                </button>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="w-full mt-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold"
              >
                {t.close}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Health Modal */}
      <AnimatePresence>
        {showSystemHealth && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowSystemHealth(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4 text-porteo-blue">
                  <Server className="w-8 h-8" />
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{t.systemHealth} Deep-Dive</h3>
                </div>
                <button onClick={() => setShowSystemHealth(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: lang === 'en' ? 'Cluster Availability' : 'Disponibilidad del Clúster', val: '99.99%', icon: Cloud, col: 'text-emerald-400' },
                  { label: lang === 'en' ? 'Neural Memory Pool' : 'Pool de Memoria Neural', val: '1.2 TB', icon: Database, col: 'text-porteo-blue' },
                  { label: lang === 'en' ? 'Active Worker Nodes' : 'Nodos de Trabajo Activos', val: '24/24', icon: Cpu, col: 'text-porteo-orange' },
                  { label: lang === 'en' ? 'Inference Queue' : 'Cola de Inferencia', val: '8ms', icon: Clock, col: 'text-purple-400' },
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-white/5 ${stat.col}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{stat.label}</p>
                      <p className="text-xl font-bold text-white">{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-emerald-400/5 border border-emerald-400/10 rounded-3xl">
                <p className="text-sm text-emerald-400/80 leading-relaxed font-medium">
                  {lang === 'en' ? 'System is operating at nominal levels. All neural models are responding within defined SLIs.' : 'El sistema opera en niveles nominales. Todos los modelos neuronales responden dentro de los SLI definidos.'}
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={handleForceCalibration}
                  disabled={isCalibrating}
                  className="flex-1 py-4 bg-porteo-blue text-white rounded-2xl font-bold text-sm hover:bg-porteo-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isCalibrating ? 'animate-spin' : ''}`} />
                  {t.calibrate}
                </button>
                <button 
                   onClick={() => {
                    toast.promise(
                      new Promise(r => setTimeout(r, 1500)),
                      {
                        loading: lang === 'en' ? 'Connecting to Admin...' : 'Conectando con el Administrador...',
                        success: lang === 'en' ? 'Ticket #882 created. Admin will contact you.' : 'Ticket #882 creado. El admin le contactará.'
                      }
                    );
                    setShowSystemHealth(false);
                  }}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  {t.contactAdmin}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto-Scaling Modal */}
      <AnimatePresence>
        {showAutoScaling && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowAutoScaling(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="p-5 bg-porteo-orange/20 rounded-2xl w-fit mb-6">
                <ShieldCheck className="w-10 h-10 text-porteo-orange" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">{lang === 'en' ? 'Neural Auto-Scaling Detail' : 'Detalle de Auto-Escalado Neural'}</h3>
              <div className="space-y-4 text-white/60 text-sm leading-relaxed">
                <p>{lang === 'en' ? 'Target: MX-CDMX-CLUSTER' : 'Objetivo: MX-CDMX-CLUSTER'}</p>
                <p>{lang === 'en' ? 'Trigger: Average Inference Latency > 200ms' : 'Disparador: Latencia de Inferencia Promedio > 200ms'}</p>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-emerald-400 font-bold mb-1">Status: COMPLETED</p>
                  <p className="text-xs">Successfully added node-neu-89 and node-neu-90. System balanced.</p>
                </div>
              </div>
              <button 
                onClick={handleAutoScalingAction}
                className="w-full mt-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-porteo-orange hover:border-porteo-orange transition-all"
              >
                {lang === 'en' ? 'Validate & Stabilize' : 'Validar y Estabilizar'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
