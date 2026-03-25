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
  Ship,
  FileText,
  ShieldCheck,
  Download,
  Plus,
  Briefcase
} from 'lucide-react';
import { getAIInsight, getOperationalAdvice, getPredictiveDiscrepancy } from '../services/geminiService';

interface WarehouseOperationsProps {
  lang: 'en' | 'es';
  market: 'USA' | 'MEXICO';
  inventoryItems: InventoryItem[];
  addNotification: (message: string, type: 'market' | 'operational' | 'alert' | 'success' | 'info') => void;
}

export const WarehouseOperations = ({ lang, market, inventoryItems, addNotification }: WarehouseOperationsProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'receiving' | 'picking' | 'packing' | 'counts' | 'omnichannel'>('receiving');
  
  const language = lang; // Alias for backward compatibility
  const [loading, setLoading] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showCartaPortePreview, setShowCartaPortePreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
          { id: 'omnichannel', label: language === 'en' ? 'Omnichannel' : 'Omnicanal', icon: <Layers className="w-4 h-4" /> },
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
                <button 
                  onClick={() => {
                    setIsGenerating(true);
                    setTimeout(() => {
                      setIsGenerating(false);
                      setShowCartaPortePreview(true);
                    }, 1500);
                  }}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-porteo-blue/10 border border-porteo-blue/30 rounded-xl text-xs font-bold text-porteo-blue flex items-center gap-2 hover:bg-porteo-blue/20 transition-all disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {language === 'en' ? 'Generate BOL v3.0' : 'Generar Carta Porte v3.0'}
                </button>
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

        {activeSubTab === 'omnichannel' && (
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Omnichannel Fulfillment' : 'Surtido Omnicanal'}</h3>
                <p className="text-xs text-white/40 mt-1">
                  {language === 'en' 
                    ? `Managing inventory across ${market === 'USA' ? 'Amazon, Shopify, and Walmart' : 'Mercado Libre, Amazon, and Shopify'}` 
                    : `Gestionando inventario en ${market === 'USA' ? 'Amazon, Shopify y Walmart' : 'Mercado Libre, Amazon y Shopify'}`}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setLoading('sync');
                    setTimeout(() => {
                      setLoading(null);
                      addNotification(language === 'en' ? 'All channels synced successfully!' : '¡Todos los canales sincronizados con éxito!', 'success');
                    }, 2000);
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  {loading === 'sync' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {language === 'en' ? 'Sync All' : 'Sincronizar Todo'}
                </button>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-bold text-emerald-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  {language === 'en' ? 'Live Sync' : 'Sincronización en Vivo'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { 
                  channel: market === 'USA' ? 'Amazon FBA/FBM' : 'Mercado Libre Full', 
                  orders: 145, 
                  status: 'Healthy', 
                  icon: <Package className="text-orange-400" />,
                  insight: language === 'en' ? 'Stock level optimal for next 48h' : 'Nivel de stock óptimo para las próximas 48h'
                },
                { 
                  channel: 'Shopify Store', 
                  orders: 89, 
                  status: 'Healthy', 
                  icon: <Box className="text-green-400" />,
                  insight: language === 'en' ? 'High conversion on new arrivals' : 'Alta conversión en nuevas llegadas'
                },
                { 
                  channel: market === 'USA' ? 'Walmart.com' : 'Amazon.com.mx', 
                  orders: 56, 
                  status: 'Attention', 
                  icon: <Truck className="text-blue-400" />,
                  insight: language === 'en' ? 'Potential stockout in 3 days' : 'Posible falta de stock en 3 días'
                },
                { 
                  channel: 'B2B Wholesale', 
                  orders: 12, 
                  status: 'Healthy', 
                  icon: <Briefcase className="text-purple-400" />,
                  insight: language === 'en' ? 'Large order pending approval' : 'Pedido grande pendiente de aprobación'
                },
              ].map((channel, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:border-white/20 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-all">
                      {channel.icon}
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      channel.status === 'Healthy' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                    }`}>
                      {channel.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{channel.channel}</h4>
                    <p className="text-xs text-white/40">{channel.orders} {language === 'en' ? 'Pending Orders' : 'Pedidos Pendientes'}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <BrainCircuit className="w-3 h-3 text-porteo-orange" />
                      <span className="text-[10px] font-bold text-porteo-orange uppercase tracking-widest">AI Insight</span>
                    </div>
                    <p className="text-[10px] text-white/60 italic">"{channel.insight}"</p>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-porteo-orange h-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
                  </div>
                  <button className="w-full py-2 text-xs font-bold text-white/60 hover:text-white transition-colors">
                    {language === 'en' ? 'Manage Channel' : 'Gestionar Canal'}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/20 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-porteo-blue rounded-2xl text-white">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold">{language === 'en' ? 'AI Inventory Balancing' : 'Balanceo de Inventario por IA'}</h4>
                  <p className="text-xs text-white/60">{language === 'en' ? 'Predictive stock allocation across all active sales channels.' : 'Asignación predictiva de stock en todos los canales de venta activos.'}</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  setLoading('optimization');
                  const insight = await getAIInsight('inventory-balancing', language);
                  setAiInsight(insight);
                  setLoading(null);
                  setActiveModal('ai-insight');
                }}
                className="px-6 py-3 bg-porteo-blue text-white rounded-xl font-bold text-xs hover:bg-porteo-blue/80 transition-all flex items-center gap-2"
              >
                {loading === 'optimization' ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                {language === 'en' ? 'Run Optimization' : 'Ejecutar Optimización'}
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'counts' && (
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Cyclic Count Management' : 'Gestión de Conteos Cíclicos'}</h3>
                <p className="text-sm text-white/40 mt-1">
                  {language === 'en' 
                    ? 'Maintain 99.9% inventory accuracy with AI-driven task assignment.' 
                    : 'Mantenga una precisión de inventario del 99.9% con asignación de tareas impulsada por IA.'}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction('start-count')}
                  disabled={loading === 'start-count'}
                  className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold text-xs hover:bg-porteo-orange/80 transition-all flex items-center gap-2"
                >
                  {loading === 'start-count' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {language === 'en' ? 'New Count Session' : 'Nueva Sesión de Conteo'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">{language === 'en' ? 'Active Sessions' : 'Sesiones Activas'}</h4>
                    <span className="text-[10px] font-bold text-white/40">3 {language === 'en' ? 'Sessions' : 'Sesiones'}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {[
                      { id: 'CNT-001', zone: 'Zone A - High Velocity', progress: 85, items: 120, status: 'In Progress' },
                      { id: 'CNT-002', zone: 'Zone C - Electronics', progress: 45, items: 50, status: 'In Progress' },
                      { id: 'CNT-003', zone: 'Zone B - Bulk Storage', progress: 100, items: 200, status: 'Completed' },
                    ].map((session) => (
                      <div key={session.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${session.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-porteo-orange/10 text-porteo-orange'}`}>
                            <RefreshCw className={`w-5 h-5 ${session.status === 'In Progress' ? 'animate-spin-slow' : ''}`} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{session.zone}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{session.id} • {session.items} {language === 'en' ? 'Items' : 'Artículos'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="w-32">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-white/40">{language === 'en' ? 'Progress' : 'Progreso'}</span>
                              <span className="text-white font-bold">{session.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="bg-porteo-orange h-full transition-all duration-1000" style={{ width: `${session.progress}%` }} />
                            </div>
                          </div>
                          <button className="p-2 text-white/20 hover:text-white transition-colors">
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/20 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-porteo-blue rounded-2xl text-white">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{language === 'en' ? 'Predictive Discrepancy Analysis' : 'Análisis Predictivo de Discrepancias'}</h4>
                      <p className="text-xs text-white/60">{language === 'en' ? 'AI identifies potential errors before they impact fulfillment.' : 'La IA identifica errores potenciales antes de que afecten el surtido.'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      setLoading('discrepancy');
                      const insight = await getPredictiveDiscrepancy(inventoryItems, language);
                      setAiInsight(insight);
                      setLoading(null);
                      setActiveModal('ai-insight');
                    }}
                    className="px-6 py-3 bg-porteo-blue text-white rounded-xl font-bold text-xs hover:bg-porteo-blue/80 transition-all flex items-center gap-2"
                  >
                    {loading === 'discrepancy' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    {language === 'en' ? 'Analyze Now' : 'Analizar Ahora'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-3xl p-6 space-y-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">{language === 'en' ? 'Accuracy Stats' : 'Estadísticas de Precisión'}</h4>
                  <div className="space-y-4">
                    {[
                      { label: language === 'en' ? 'Inventory Accuracy' : 'Precisión de Inventario', value: '99.85%', trend: '+0.12%' },
                      { label: language === 'en' ? 'Discrepancy Rate' : 'Tasa de Discrepancia', value: '0.15%', trend: '-0.05%' },
                      { label: language === 'en' ? 'Count Velocity' : 'Velocidad de Conteo', value: '450 SKU/h', trend: '+12%' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{stat.label}</p>
                        <div className="flex justify-between items-end">
                          <span className="text-xl font-bold text-white">{stat.value}</span>
                          <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-3xl p-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">{language === 'en' ? 'Recent Discrepancies' : 'Discrepancias Recientes'}</h4>
                  <div className="space-y-4">
                    {[
                      { sku: 'SKU-882', expected: 45, actual: 44, reason: 'Damaged' },
                      { sku: 'SKU-129', expected: 12, actual: 15, reason: 'Misplaced' },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-white">{d.sku}</p>
                          <p className="text-[10px] text-white/40">{d.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-rose-500">{d.actual - d.expected}</p>
                          <p className="text-[10px] text-white/40">{d.expected} → {d.actual}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
                    {language === 'en' ? 'Full Discrepancy Report' : 'Reporte Completo de Discrepancias'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Carta Porte Preview Modal */}
      <AnimatePresence>
        {showCartaPortePreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white text-slate-900 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-porteo-blue text-white rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">
                      {language === 'en' ? 'Bill of Lading v3.0' : 'Complemento Carta Porte v3.0'}
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">SAT Compliance • CFDI 4.0</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const content = "Carta Porte v3.0 Content Simulation";
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `CartaPorte_v3_0_${Date.now()}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    }}
                    className="p-2 bg-porteo-blue text-white rounded-xl hover:bg-porteo-blue/80 transition-all flex items-center gap-2 px-4 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'en' ? 'Download PDF' : 'Descargar PDF'}
                  </button>
                  <button onClick={() => setShowCartaPortePreview(false)} className="p-2 text-slate-400 hover:text-slate-900">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 bg-slate-100/50">
                <div className="bg-white shadow-xl border border-slate-200 p-12 max-w-3xl mx-auto min-h-[1000px] font-mono text-[10px] space-y-8">
                  {/* Document Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-black tracking-tighter">PORTEO LOGISTICS S.A. DE C.V.</h1>
                      <p>RFC: PLO123456789</p>
                      <p>Regimen Fiscal: 601 - General de Ley Personas Morales</p>
                      <p>Domicilio: Av. de la Industria 456, Monterrey, NL, CP 64000</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="bg-slate-900 text-white px-4 py-2 inline-block font-bold text-sm mb-2">FACTURA / CFDI DE TRASLADO</div>
                      <p className="font-bold">Folio: CP-2024-0001</p>
                      <p>Fecha: {new Date().toLocaleString()}</p>
                      <p>Lugar de Expedición: 64000</p>
                    </div>
                  </div>

                  {/* Carta Porte Section */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
                    <h2 className="font-bold text-xs mb-2 border-b border-slate-300 pb-1 uppercase">Complemento Carta Porte 3.0</h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-slate-500">TranspInternac:</p>
                        <p className="font-bold">No</p>
                      </div>
                      <div>
                        <p className="text-slate-500">TotalDistRec:</p>
                        <p className="font-bold">450.00 km</p>
                      </div>
                      <div>
                        <p className="text-slate-500">PesoBrutoTotal:</p>
                        <p className="font-bold">12,450.00 kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h3 className="font-bold border-b border-slate-900 pb-1">UBICACIÓN: ORIGEN</h3>
                      <p className="font-bold">IDUbicacion: OR000001</p>
                      <p>RFC Remitente: PLO123456789</p>
                      <p>Nombre: Porteo Logistics Monterrey</p>
                      <p>Fecha Salida: {new Date().toLocaleDateString()} 08:00:00</p>
                      <p>Dirección: Av. de la Industria 456, Monterrey, NL, CP 64000</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold border-b border-slate-900 pb-1">UBICACIÓN: DESTINO</h3>
                      <p className="font-bold">IDUbicacion: DE000001</p>
                      <p>RFC Destinatario: CLI987654321</p>
                      <p>Nombre: Cliente Industrial CDMX</p>
                      <p>Fecha Llegada: {new Date().toLocaleDateString()} 18:00:00</p>
                      <p>Dirección: Calzada de Tlalpan 1234, CDMX, CP 03000</p>
                    </div>
                  </div>

                  {/* Mercancias */}
                  <div className="space-y-2">
                    <h3 className="font-bold border-b border-slate-900 pb-1">MERCANCÍAS</h3>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-900">
                          <th className="p-1">BienesTransp</th>
                          <th className="p-1">Descripción</th>
                          <th className="p-1 text-right">Cantidad</th>
                          <th className="p-1">ClaveUnidad</th>
                          <th className="p-1 text-right">Peso (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-1">25171000</td>
                          <td className="p-1">Refacciones Automotrices - Frenos</td>
                          <td className="p-1 text-right">120.00</td>
                          <td className="p-1">H87</td>
                          <td className="p-1 text-right">2,400.00</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-1">26121000</td>
                          <td className="p-1">Motores de Arranque</td>
                          <td className="p-1 text-right">45.00</td>
                          <td className="p-1">H87</td>
                          <td className="p-1 text-right">1,800.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Autotransporte */}
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-4">
                    <div>
                      <h3 className="font-bold text-xs mb-2 border-b border-slate-300 pb-1 uppercase">Autotransporte Federal</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-slate-500">PermSCT:</p>
                          <p className="font-bold">TPAF01</p>
                        </div>
                        <div>
                          <p className="text-slate-500">NumPermisoSCT:</p>
                          <p className="font-bold">1234567890</p>
                        </div>
                        <div>
                          <p className="text-slate-500">ConfigVehicular:</p>
                          <p className="font-bold">T3S2</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500">PlacaVM:</p>
                        <p className="font-bold">ABC-1234</p>
                      </div>
                      <div>
                        <p className="text-slate-500">AnioModeloVM:</p>
                        <p className="font-bold">2022</p>
                      </div>
                    </div>
                  </div>

                  {/* QR and Digital Seal */}
                  <div className="flex gap-8 pt-8 border-t border-slate-200">
                    <div className="w-32 h-32 bg-slate-200 flex items-center justify-center text-[8px] text-center p-4">
                      [QR CODE SIMULATION]
                    </div>
                    <div className="flex-1 space-y-2 text-[7px] break-all">
                      <p className="font-bold">Sello Digital del CFDI:</p>
                      <p className="text-slate-500">MIIEpAIBAAKCAQEA7V+X8...[TRUNCATED].../9z8=</p>
                      <p className="font-bold">Sello del SAT:</p>
                      <p className="text-slate-500">MIIBCgKCAQEAy1g...[TRUNCATED].../123=</p>
                      <p className="font-bold">Cadena Original del Complemento de Certificación Digital del SAT:</p>
                      <p className="text-slate-500">||1.1|12345678-1234-1234-1234-123456789012|{new Date().toISOString()}|...</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                            <button 
                              onClick={() => setShowLabel(false)}
                              className="w-full py-2 bg-black text-white rounded-lg text-[10px] font-bold uppercase hover:bg-black/80 transition-all"
                            >
                              {language === 'en' ? 'Close Label' : 'Cerrar Etiqueta'}
                            </button>
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
                            <p className="text-sm text-white/40">
                              {language === 'en' ? 'Dock' : 'Muelle'}: {selectedTask.dock} • {language === 'en' ? 'Expected' : 'Esperado'}: {selectedTask.items} units
                            </p>
                          </div>
                          <div className="space-y-4">
                            <p className="text-sm text-white/60 font-bold uppercase tracking-widest">
                              {language === 'en' ? 'Step 1: Verify Seal Number' : 'Paso 1: Verificar Número de Sello'}
                            </p>
                            <input 
                              type="text" 
                              placeholder={language === 'en' ? "Enter Seal #" : "Ingrese # de Sello"}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-porteo-orange" 
                            />
                            <button 
                              onClick={() => setReceivingStep(2)}
                              className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                            >
                              {language === 'en' ? 'Next Step' : 'Siguiente Paso'}
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
                            <p className="text-sm text-white/60 font-bold uppercase tracking-widest">
                              {language === 'en' ? 'Step 2: Damage Inspection' : 'Paso 2: Inspección de Daños'}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <button className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white hover:border-emerald-500/50 transition-all">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                <span className="text-xs font-bold">{language === 'en' ? 'No Damage' : 'Sin Daños'}</span>
                              </button>
                              <button className="p-6 bg-white/5 border border-white/10 rounded-2xl text-white hover:border-rose-500/50 transition-all">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                                <span className="text-xs font-bold">{language === 'en' ? 'Report Damage' : 'Reportar Daño'}</span>
                              </button>
                            </div>
                            <button 
                              onClick={() => setReceivingStep(3)}
                              className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                            >
                              {language === 'en' ? 'Next Step' : 'Siguiente Paso'}
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
                            <h5 className="text-xl font-bold text-white">
                              {language === 'en' ? 'Inspection Complete' : 'Inspección Completada'}
                            </h5>
                            <p className="text-white/40">
                              {language === 'en' ? 'All units verified and ready for put-away.' : 'Todas las unidades verificadas y listas para ubicación.'}
                            </p>
                            <button 
                              onClick={() => setActiveModal(null)}
                              className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                            >
                              {language === 'en' ? 'Finish & Close' : 'Finalizar y Cerrar'}
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
                        <h5 className="text-white font-bold text-lg">
                          {language === 'en' ? 'AI Slotting Optimization' : 'Optimización de Slotting por IA'}
                        </h5>
                        <p className="text-xs text-white/40 uppercase tracking-widest">
                          {language === 'en' ? 'Engine Version 4.2 • Real-time Analysis' : 'Versión de Motor 4.2 • Análisis en Tiempo Real'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase mb-2">
                          {language === 'en' ? 'Efficiency Gain' : 'Ganancia de Eficiencia'}
                        </p>
                        <p className="text-2xl font-bold text-emerald-500">+18.4%</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase mb-2">
                          {language === 'en' ? 'Travel Reduction' : 'Reducción de Viaje'}
                        </p>
                        <p className="text-2xl font-bold text-porteo-blue">-420m / shift</p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <h6 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-porteo-orange" />
                        {language === 'en' ? 'Strategic Recommendations' : 'Recomendaciones Estratégicas'}
                      </h6>
                      <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {aiInsight}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => { setActiveModal(null); setAiInsight(null); }}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors"
                      >
                        {language === 'en' ? 'Dismiss' : 'Descartar'}
                      </button>
                      <button 
                        onClick={() => {
                          addNotification(language === 'en' ? 'Slotting changes applied' : 'Cambios de slotting aplicados', 'success');
                          setActiveModal(null);
                        }}
                        className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-colors"
                      >
                        {language === 'en' ? 'Apply Changes' : 'Aplicar Cambios'}
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

                {activeModal === 'ai-insight' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-porteo-blue/10 rounded-2xl border border-porteo-blue/20">
                      <BrainCircuit className="w-8 h-8 text-porteo-blue" />
                      <div>
                        <h5 className="text-white font-bold">{language === 'en' ? 'AI Strategic Insight' : 'Perspectiva Estratégica de IA'}</h5>
                        <p className="text-xs text-white/40">{language === 'en' ? 'Advanced Analytics Analysis' : 'Análisis de Analítica Avanzada'}</p>
                      </div>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {aiInsight || (language === 'en' ? "Analyzing data patterns..." : "Analizando patrones de datos...")}
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveModal(null)}
                      className="w-full py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/80 transition-all"
                    >
                      {language === 'en' ? 'Acknowledge' : 'Entendido'}
                    </button>
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
