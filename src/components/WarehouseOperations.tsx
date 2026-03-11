import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Truck, 
  ClipboardCheck, 
  Scan, 
  Box, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Layers,
  RefreshCw,
  Loader2,
  BrainCircuit,
  X,
  Printer,
  Ship
} from 'lucide-react';
import { getAIInsight, getOperationalAdvice, getPredictiveDiscrepancy } from '../services/geminiService';

interface WarehouseOperationsProps {
  language: 'en' | 'es';
}

export const WarehouseOperations = ({ language }: WarehouseOperationsProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'receiving' | 'picking' | 'packing' | 'counts'>('receiving');
  const [loading, setLoading] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const receivingTasks = [
    { id: 'REC-001', supplier: 'GlobalParts', items: 12, status: 'in-progress', dock: 'D-01' },
    { id: 'REC-002', supplier: 'EcoSource', items: 45, status: 'pending', dock: 'D-02' },
    { id: 'REC-003', supplier: 'TechCorp', items: 8, status: 'completed', dock: 'D-03' },
  ];

  const pickingTasks = [
    { id: 'PICK-991', customer: 'Walmart', items: 24, priority: 'High', zone: 'Zone A', status: 'ready' },
    { id: 'PICK-992', customer: 'Amazon', items: 156, priority: 'Medium', zone: 'Zone B', status: 'in-progress' },
    { id: 'PICK-993', customer: 'Tesla', items: 5, priority: 'Urgent', zone: 'Zone A', status: 'pending' },
  ];

  const packingTasks = [
    { id: 'PACK-501', order: 'ORD-8821', carrier: 'FedEx', status: 'packing', items: 4 },
    { id: 'PACK-502', order: 'ORD-8822', carrier: 'DHL', status: 'ready', items: 12 },
    { id: 'PACK-503', order: 'ORD-8823', carrier: 'UPS', status: 'shipped', items: 2 },
  ];

  const handleAction = async (action: string, data?: any) => {
    setLoading(action);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (action === 'scan') {
      setActiveModal('scan-result');
    } else if (action === 'start-receiving') {
      setSelectedTask(data);
      setActiveModal('receiving-flow');
    } else if (action === 'optimize-slotting') {
      const insight = await getAIInsight("Provide a slotting optimization plan for a high-velocity electronics warehouse.");
      setAiInsight(insight);
    } else if (action === 'release-wave') {
      setActiveModal('wave-released');
    } else if (action === 'start-count') {
      const insight = await getPredictiveDiscrepancy({ warehouse: 'Porteo Laredo', lastAudit: '2026-02-15' });
      setAiInsight(insight);
      setActiveModal('ai-audit');
    } else if (action === 'view-discrepancies') {
      setActiveModal('discrepancy-report');
    }
    
    setLoading(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 relative">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'receiving', label: language === 'en' ? 'Receiving & Put-away' : 'Recepción y Ubicación', icon: <Truck className="w-4 h-4" /> },
          { id: 'picking', label: language === 'en' ? 'Picking & Slotting' : 'Surtido y Slotting', icon: <Package className="w-4 h-4" /> },
          { id: 'packing', label: language === 'en' ? 'Packing & Shipping' : 'Empaque y Envío', icon: <Box className="w-4 h-4" /> },
          { id: 'counts', label: language === 'en' ? 'Cyclic Counts' : 'Conteos Cíclicos', icon: <RefreshCw className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all whitespace-nowrap ${
              activeSubTab === tab.id 
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
        {activeSubTab === 'receiving' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Inbound Operations' : 'Operaciones de Entrada'}</h3>
              <button 
                onClick={() => handleAction('scan')}
                disabled={loading === 'scan'}
                className="px-4 py-2 bg-porteo-blue text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-blue/80 transition-colors disabled:opacity-50"
              >
                {loading === 'scan' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                {language === 'en' ? 'Scan Barcode' : 'Escanear Código'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {receivingTasks.map((task) => (
                <div key={task.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/40">{task.id}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 
                      task.status === 'in-progress' ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-white/10 text-white/40'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{task.supplier}</h4>
                    <p className="text-xs text-white/40">{task.items} {language === 'en' ? 'SKUs expected' : 'SKUs esperados'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Truck className="w-4 h-4" />
                    <span>{language === 'en' ? 'Dock' : 'Muelle'}: {task.dock}</span>
                  </div>
                  <button 
                    onClick={() => handleAction('start-receiving', task)}
                    disabled={loading === `start-receiving-${task.id}`}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {language === 'en' ? 'Start Receiving' : 'Iniciar Recepción'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'picking' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Picking Waves' : 'Olas de Surtido'}</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction('optimize-slotting')}
                  disabled={loading === 'optimize-slotting'}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  {loading === 'optimize-slotting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  {language === 'en' ? 'Optimize Slotting' : 'Optimizar Slotting'}
                </button>
                <button 
                  onClick={() => handleAction('release-wave')}
                  className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/80 transition-colors"
                >
                  {language === 'en' ? 'Release Wave' : 'Liberar Ola'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {pickingTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => { setSelectedTask(task); setActiveModal('task-details'); }}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-500' : 
                      task.priority === 'High' ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-porteo-blue/20 text-porteo-blue'
                    }`}>
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{task.id}</span>
                        <span className="text-[10px] text-white/40 px-1.5 py-0.5 border border-white/10 rounded">{task.priority}</span>
                      </div>
                      <p className="text-xs text-white/60">{task.customer} • {task.items} items • {task.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'en' ? 'Status' : 'Estatus'}</p>
                      <p className="text-xs font-bold text-white">{task.status}</p>
                    </div>
                    <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'packing' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Packing & Shipping' : 'Empaque y Envío'}</h3>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  {language === 'en' ? 'Print Labels' : 'Imprimir Etiquetas'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packingTasks.map((task) => (
                <div key={task.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-porteo-orange/10 rounded-2xl text-porteo-orange">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{task.order}</h4>
                      <p className="text-xs text-white/40">{task.carrier} • {task.items} items</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      task.status === 'shipped' ? 'bg-emerald-500/20 text-emerald-500' : 
                      task.status === 'ready' ? 'bg-porteo-blue/20 text-porteo-blue' : 'bg-porteo-orange/20 text-porteo-orange'
                    }`}>
                      {task.status}
                    </span>
                    <button className="text-xs font-bold text-porteo-orange hover:underline">
                      {language === 'en' ? 'Details' : 'Detalles'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'counts' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-porteo-blue/10 rounded-full flex items-center justify-center text-porteo-blue relative">
              <RefreshCw className="w-12 h-12" />
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-porteo-orange rounded-full flex items-center justify-center text-white shadow-lg">
                <BrainCircuit className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{language === 'en' ? 'Cyclic Count Management' : 'Gestión de Conteos Cíclicos'}</h3>
              <p className="text-white/40 max-w-lg mx-auto">
                {language === 'en' 
                  ? 'Maintain 99.9% inventory accuracy with automated cyclic counts. AI-driven task assignment based on SKU velocity and value.' 
                  : 'Mantenga una precisión de inventario del 99.9% con conteos cíclicos automatizados. Asignación de tareas impulsada por IA basada en la velocidad y el valor del SKU.'}
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleAction('start-count')}
                disabled={loading === 'start-count'}
                className="px-8 py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20 flex items-center gap-3 hover:bg-porteo-orange/80 transition-colors disabled:opacity-50"
              >
                {loading === 'start-count' ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                {language === 'en' ? 'Start New Count' : 'Iniciar Nuevo Conteo'}
              </button>
              <button 
                onClick={() => handleAction('view-discrepancies')}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors"
              >
                {language === 'en' ? 'View Discrepancies' : 'Ver Discrepancias'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h4 className="text-lg font-bold text-white uppercase tracking-widest">
                  {activeModal.replace('-', ' ')}
                </h4>
                <button onClick={() => { setActiveModal(null); setAiInsight(null); }} className="p-2 text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {activeModal === 'scan-result' && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-xl font-bold text-white">SKU-004-A Detected</h5>
                      <p className="text-white/40">Alternator Assembly Component • Location: Staging-01</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="py-4 bg-porteo-orange text-white rounded-2xl font-bold">Confirm Put-away</button>
                      <button className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold">Print Label</button>
                    </div>
                  </div>
                )}

                {activeModal === 'receiving-flow' && selectedTask && (
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <h5 className="text-white font-bold">{selectedTask.supplier} - {selectedTask.id}</h5>
                      <p className="text-sm text-white/40">Dock: {selectedTask.dock} • Expected: {selectedTask.items} units</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm text-white/60">Step 1: Verify Seal Number</p>
                      <input type="text" placeholder="Enter Seal #" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-porteo-orange" />
                      <button className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold">Next Step</button>
                    </div>
                  </div>
                )}

                {activeModal === 'ai-audit' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-porteo-orange/10 rounded-2xl border border-porteo-orange/20">
                      <BrainCircuit className="w-8 h-8 text-porteo-orange" />
                      <div>
                        <h5 className="text-white font-bold">AI Predictive Audit</h5>
                        <p className="text-xs text-white/40">Machine Learning Analysis Complete</p>
                      </div>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">
                        {aiInsight || "Analyzing inventory patterns..."}
                      </div>
                    </div>
                    <button className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold">Download Audit Schedule</button>
                  </div>
                )}

                {activeModal === 'discrepancy-report' && (
                  <div className="space-y-4">
                    {[
                      { sku: 'SKU-001', expected: 1200, actual: 1198, diff: -2, reason: 'Damaged' },
                      { sku: 'SKU-009', expected: 45, actual: 46, diff: +1, reason: 'Miscount' },
                    ].map((d, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white">{d.sku}</p>
                          <p className="text-xs text-white/40">Reason: {d.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${d.diff < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{d.diff > 0 ? '+' : ''}{d.diff}</p>
                          <p className="text-[10px] text-white/40">Exp: {d.expected} / Act: {d.actual}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeModal === 'wave-released' && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <Ship className="w-10 h-10" />
                    </div>
                    <h5 className="text-xl font-bold text-white">Wave Released Successfully</h5>
                    <p className="text-white/40">24 picking tasks assigned to 8 operators. Estimated completion: 45 mins.</p>
                    <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold">Back to Dashboard</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insight Toast */}
      <AnimatePresence>
        {aiInsight && !activeModal && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] w-96 bg-[#0A0A0A] border border-porteo-orange/30 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 bg-porteo-orange/10 border-b border-porteo-orange/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-porteo-orange" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">AI Operational Advice</span>
              </div>
              <button onClick={() => setAiInsight(null)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/80 leading-relaxed italic">
                "{aiInsight}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
