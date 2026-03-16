import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryItem } from '../types';
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
  inventoryItems: InventoryItem[];
}

export const WarehouseOperations = ({ language, inventoryItems }: WarehouseOperationsProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'receiving' | 'picking' | 'packing' | 'counts'>('receiving');
  const [loading, setLoading] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [receivingStep, setReceivingStep] = useState(1);
  const [showLabel, setShowLabel] = useState(false);

  // Derive some dynamic tasks from inventory if it exists
  const dynamicTasks = useMemo(() => {
    if (!inventoryItems || inventoryItems.length === 0) {
      return {
        receiving: [
          { id: 'REC-001', supplier: 'GlobalParts', items: 12, status: 'in-progress', dock: 'D-01' },
          { id: 'REC-002', supplier: 'EcoSource', items: 45, status: 'pending', dock: 'D-02' },
          { id: 'REC-003', supplier: 'TechCorp', items: 8, status: 'completed', dock: 'D-03' },
        ],
        picking: [
          { id: 'PICK-991', customer: 'Walmart', items: 24, priority: 'High', zone: 'Zone A', status: 'ready' },
          { id: 'PICK-992', customer: 'Amazon', items: 156, priority: 'Medium', zone: 'Zone B', status: 'in-progress' },
        ],
        packing: [
          { id: 'PACK-501', order: 'ORD-8821', carrier: 'FedEx', status: 'packing', items: 4 },
        ]
      };
    }

    // Group items by customer for picking tasks
    const customerGroups: Record<string, InventoryItem[]> = {};
    inventoryItems.forEach(item => {
      if (!customerGroups[item.customer]) customerGroups[item.customer] = [];
      customerGroups[item.customer].push(item);
    });

    const pickingTasks = Object.entries(customerGroups).slice(0, 8).map(([customer, items], i) => ({
      id: `PICK-${1000 + i}`,
      customer: customer,
      items: items.reduce((acc, curr) => acc + curr.quantity, 0),
      priority: i % 3 === 0 ? 'High' : (i % 3 === 1 ? 'Medium' : 'Low'),
      zone: items[0].location.split('-')[0] || 'Zone A',
      status: i % 2 === 0 ? 'ready' : 'in-progress'
    }));

    const packingTasks = Object.entries(customerGroups).slice(8, 12).map(([customer, items], i) => ({
      id: `PACK-${2000 + i}`,
      order: `ORD-${3000 + i}`,
      carrier: i % 2 === 0 ? 'FedEx' : 'DHL',
      status: i % 3 === 0 ? 'packing' : 'ready',
      items: items.length
    }));

    return {
      receiving: [
        { id: 'REC-001', supplier: 'GlobalParts', items: 12, status: 'in-progress', dock: 'D-01' },
        { id: 'REC-002', supplier: 'EcoSource', items: 45, status: 'pending', dock: 'D-02' },
      ],
      picking: pickingTasks,
      packing: packingTasks
    };
  }, [inventoryItems]);

  const [tasks, setTasks] = useState(dynamicTasks);

  useEffect(() => {
    setTasks(dynamicTasks);
  }, [dynamicTasks]);

  const [discrepancies, setDiscrepancies] = useState([
    { sku: 'SKU-001', expected: 1200, actual: 1198, diff: -2, reason: 'Damaged', status: 'pending' },
    { sku: 'SKU-009', expected: 45, actual: 46, diff: +1, reason: 'Miscount', status: 'pending' },
  ]);

  // Update discrepancies based on inventory if needed
  useEffect(() => {
    if (inventoryItems.length > 0) {
      // Simulate some discrepancies for the first few items
      const newDiscrepancies = inventoryItems.slice(0, 3).map((item, i) => ({
        sku: item.sku,
        expected: item.quantity,
        actual: Math.max(0, item.quantity + (i % 2 === 0 ? -1 : 1)),
        diff: i % 2 === 0 ? -1 : 1,
        reason: i % 2 === 0 ? 'Damaged' : 'Miscount',
        status: 'pending'
      }));
      setDiscrepancies(newDiscrepancies);
    }
  }, [inventoryItems]);

  const handleAction = async (action: string, data?: any) => {
    setLoading(action);
    
    if (action === 'scan') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActiveModal('scan-result');
    } else if (action === 'start-receiving') {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSelectedTask(data);
      setReceivingStep(1);
      setActiveModal('receiving-flow');
    } else if (action === 'optimize-slotting') {
      const insight = await getAIInsight("Provide a structured slotting optimization plan for a high-velocity electronics warehouse. Include specific zone reassignments and velocity-based placement advice.");
      setAiInsight(insight);
      setActiveModal('slotting-optimization');
    } else if (action === 'release-wave') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTasks(prev => ({
        ...prev,
        picking: prev.picking.map(t => ({ ...t, status: 'in-progress' }))
      }));
      setActiveModal('wave-released');
    } else if (action === 'start-count') {
      const insight = await getPredictiveDiscrepancy({ warehouse: 'Porteo Laredo', lastAudit: '2026-02-15' });
      setAiInsight(insight);
      setActiveModal('ai-audit');
    } else if (action === 'view-discrepancies') {
      setActiveModal('discrepancy-report');
    } else if (action === 'confirm-putaway') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActiveModal(null);
    } else if (action === 'print-label') {
      setShowLabel(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowLabel(false);
    } else if (action === 'fix-discrepancy') {
      setDiscrepancies(prev => prev.map(d => d.sku === data.sku ? { ...d, status: 'resolved' } : d));
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
              {tasks.receiving.map((task) => (
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
                    disabled={loading === 'start-receiving'}
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
              {tasks.picking.map((task) => (
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
              {tasks.packing.map((task) => (
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
                    <button 
                      onClick={() => { setSelectedTask(task); setActiveModal('task-details'); }}
                      className="text-xs font-bold text-porteo-orange hover:underline"
                    >
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
                    <AnimatePresence mode="wait">
                      {showLabel ? (
                        <motion.div 
                          key="label"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="p-8 bg-white text-black rounded-xl shadow-inner border-2 border-dashed border-black/20"
                        >
                          <div className="space-y-4 font-mono">
                            <div className="border-b-2 border-black pb-2 flex justify-between">
                              <span className="font-bold">PORTEO WMS</span>
                              <span>2026-03-11</span>
                            </div>
                            <div className="text-left space-y-1">
                              <p className="text-[10px]">SKU: SKU-004-A</p>
                              <p className="text-lg font-bold">ALTERNATOR ASSY</p>
                              <p className="text-[10px]">LOC: STAGING-01</p>
                            </div>
                            <div className="h-12 bg-black w-full flex items-center justify-center text-white text-[8px]">
                              |||| ||| || ||||| ||| |||| ||
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="scan" className="space-y-6">
                          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10" />
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-xl font-bold text-white">SKU-004-A Detected</h5>
                            <p className="text-white/40">Alternator Assembly Component • Location: Staging-01</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleAction('confirm-putaway')}
                              className="py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                            >
                              {loading === 'confirm-putaway' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Put-away'}
                            </button>
                            <button 
                              onClick={() => handleAction('print-label')}
                              className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors"
                            >
                              {loading === 'print-label' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Print Label'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeModal === 'receiving-flow' && selectedTask && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-8">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            receivingStep >= s ? 'bg-porteo-orange text-white' : 'bg-white/5 text-white/40'
                          }`}>
                            {s}
                          </div>
                          {s < 3 && <div className={`w-12 h-0.5 ${receivingStep > s ? 'bg-porteo-orange' : 'bg-white/5'}`} />}
                        </div>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {receivingStep === 1 && (
                        <motion.div 
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <h5 className="text-white font-bold">{selectedTask.supplier} - {selectedTask.id}</h5>
                            <p className="text-sm text-white/40">Dock: {selectedTask.dock} • Expected: {selectedTask.items} units</p>
                          </div>
                          <div className="space-y-4">
                            <p className="text-sm text-white/60 font-bold uppercase tracking-widest">Step 1: Verify Seal Number</p>
                            <input type="text" placeholder="Enter Seal #" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-porteo-orange" />
                            <button 
                              onClick={() => setReceivingStep(2)}
                              className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                            >
                              Next Step
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {receivingStep === 2 && (
                        <motion.div 
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="space-y-4">
                            <p className="text-sm text-white/60 font-bold uppercase tracking-widest">Step 2: Damage Inspection</p>
                            <div className="grid grid-cols-2 gap-4">
                              <button className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white hover:border-emerald-500/50 transition-all">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                <span className="text-xs font-bold">No Damage</span>
                              </button>
                              <button className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white hover:border-rose-500/50 transition-all">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                                <span className="text-xs font-bold">Report Damage</span>
                              </button>
                            </div>
                            <button 
                              onClick={() => setReceivingStep(3)}
                              className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                            >
                              Next Step
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {receivingStep === 3 && (
                        <motion.div 
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                              <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h5 className="text-xl font-bold text-white">Inspection Complete</h5>
                            <p className="text-white/40">All units verified and ready for put-away.</p>
                            <button 
                              onClick={() => setActiveModal(null)}
                              className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                            >
                              Finish & Close
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeModal === 'slotting-optimization' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-6 bg-porteo-orange/10 rounded-3xl border border-porteo-orange/20">
                      <div className="p-3 bg-porteo-orange rounded-2xl text-white">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold text-lg">AI Slotting Optimization</h5>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Engine Version 4.2 • Real-time Analysis</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase mb-2">Efficiency Gain</p>
                        <p className="text-2xl font-bold text-emerald-500">+18.4%</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase mb-2">Travel Reduction</p>
                        <p className="text-2xl font-bold text-porteo-blue">-420m / shift</p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <h6 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-porteo-orange" />
                        Strategic Recommendations
                      </h6>
                      <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {aiInsight}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button 
                        className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                )}

                {activeModal === 'task-details' && selectedTask && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-2xl font-bold text-white">{selectedTask.id}</h5>
                        <p className="text-white/40">{selectedTask.customer || selectedTask.order}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        selectedTask.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-500' : 
                        selectedTask.status === 'ready' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-porteo-orange/20 text-porteo-orange'
                      }`}>
                        {selectedTask.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase">Items</p>
                        <p className="text-lg font-bold text-white">{selectedTask.items}</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase">Zone</p>
                        <p className="text-lg font-bold text-white">{selectedTask.zone || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase">Carrier</p>
                        <p className="text-lg font-bold text-white">{selectedTask.carrier || 'TBD'}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">SKU List</p>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">
                              {i}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">SKU-00{i}-X</p>
                              <p className="text-[10px] text-white/40">Bin: A-0{i}-12</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-white">x{Math.floor(Math.random() * 5) + 1}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold"
                      >
                        Close
                      </button>
                      <button className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold">
                        {activeSubTab === 'picking' ? 'Start Picking' : 'Start Packing'}
                      </button>
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
                      <div className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {aiInsight || "Analyzing inventory patterns..."}
                      </div>
                    </div>
                    <button className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold">Download Audit Schedule</button>
                  </div>
                )}

                {activeModal === 'discrepancy-report' && (
                  <div className="space-y-4">
                    {discrepancies.map((d, i) => (
                      <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            d.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                          }`}>
                            {d.status === 'resolved' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">{d.sku}</p>
                            <p className="text-xs text-white/40">Reason: {d.reason} • Exp: {d.expected} / Act: {d.actual}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-bold text-lg ${d.diff < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{d.diff > 0 ? '+' : ''}{d.diff}</p>
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{d.status}</span>
                          </div>
                          {d.status === 'pending' && (
                            <button 
                              onClick={() => handleAction('fix-discrepancy', d)}
                              className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/80 transition-colors"
                            >
                              Fix Discrepancy
                            </button>
                          )}
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
