import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  Cpu, 
  Settings, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  AlertCircle,
  Play,
  Pause,
  Plus,
  X,
  Activity,
  Zap,
  ShieldCheck,
  History,
  BarChart3,
  Bot,
  Wrench,
  Layers,
  RefreshCw,
  Mail,
  TrendingUp
} from 'lucide-react';
import { InventoryItem } from '../types';
import { MOCK_INVENTORY } from '../constants';
import { AIAssistant } from './AIAssistant';

interface AssemblyLineProps {
  lang: 'en' | 'es';
  inventoryItems: InventoryItem[];
  setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

interface ActiveLine {
  id: string;
  kit: string;
  progress: number;
  status: 'running' | 'paused' | 'completed';
  operator: string;
  efficiency: number;
  startTime: string;
}

interface AssemblyBot {
  id: string;
  name: string;
  type: 'Optimization' | 'Quality' | 'Safety';
  status: 'active' | 'idle';
}

export const AssemblyLine: React.FC<AssemblyLineProps> = ({ lang, inventoryItems, setInventoryItems }) => {
  const [activeLines, setActiveLines] = useState<ActiveLine[]>([
    { id: 'L-01', kit: 'Alternator Assembly', progress: 65, status: 'running', operator: 'Maria Garcia', efficiency: 94, startTime: '08:00 AM' },
    { id: 'L-02', kit: 'Brake Kit - Front', progress: 20, status: 'running', operator: 'John Smith', efficiency: 88, startTime: '09:30 AM' },
    { id: 'L-03', kit: 'Engine Gasket Set', progress: 0, status: 'paused', operator: 'Alex Wong', efficiency: 0, startTime: '10:15 AM' }
  ]);

  const kits = useMemo(() => inventoryItems.filter(item => item.isKit), [inventoryItems]);
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [selectedBot, setSelectedBot] = useState<AssemblyBot | null>(null);
  const [newBomComponents, setNewBomComponents] = useState<{ sku: string, quantity: number }[]>([{ sku: '', quantity: 1 }]);
  const [showSettingsModal, setShowSettingsModal] = useState<ActiveLine | null>(null);
  const [selectedAnalyticsDetail, setSelectedAnalyticsDetail] = useState<string | null>(null);

  const [bots, setBots] = useState<AssemblyBot[]>([
    { id: 'BOT-01', name: 'Line Optimizer Alpha', type: 'Optimization', status: 'active' },
    { id: 'BOT-02', name: 'QC Sentinel', type: 'Quality', status: 'active' }
  ]);

  const [showBotModal, setShowBotModal] = useState(false);
  const [showBomModal, setShowBomModal] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBomName, setNewBomName] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showAllKitsModal, setShowAllKitsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState<string | null>(null);
  const [selectedKit, setSelectedKit] = useState<InventoryItem | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [isStartingProduction, setIsStartingProduction] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number, message: string, type: 'success' | 'info' }[]>([]);

  const addNotification = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const t = {
    title: lang === 'en' ? 'Assembly & Kitting' : 'Ensamble y Kitting',
    activeLines: lang === 'en' ? 'Active Assembly Lines' : 'Líneas de Ensamble Activas',
    kits: lang === 'en' ? 'Available Kits' : 'Kits Disponibles',
    components: lang === 'en' ? 'Components' : 'Componentes',
    status: lang === 'en' ? 'Status' : 'Estatus',
    efficiency: lang === 'en' ? 'Efficiency' : 'Eficiencia',
    operator: lang === 'en' ? 'Operator' : 'Operador',
    createBot: lang === 'en' ? 'Create New Bot' : 'Crear Nuevo Bot',
    createBOM: lang === 'en' ? 'Create New BOM' : 'Crear Nueva BOM',
    startProduction: lang === 'en' ? 'Start Production' : 'Iniciar Producción',
    qualityControl: lang === 'en' ? 'Quality Control' : 'Control de Calidad',
    oee: lang === 'en' ? 'Overall Efficiency' : 'Eficiencia General',
    activeBots: lang === 'en' ? 'Active AI Bots' : 'Bots de IA Activos',
    uploadData: lang === 'en' ? 'Upload Production Data' : 'Subir Datos de Producción',
    downloadReport: lang === 'en' ? 'Download Full Report' : 'Descargar Reporte Completo',
    batchDetails: lang === 'en' ? 'Batch Details' : 'Detalles del Lote',
    downloadHistory: lang === 'en' ? 'Download History' : 'Descargar Historial',
    viewBOM: lang === 'en' ? 'View BOM' : 'Ver BOM'
  };

  // Progress Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLines(prev => prev.map(line => {
        if (line.status === 'running' && line.progress < 100) {
          const newProgress = Math.min(100, line.progress + Math.random() * 2);
          return { 
            ...line, 
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : 'running'
          };
        }
        return line;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleLineStatus = (id: string) => {
    setActiveLines(prev => prev.map(line => {
      if (line.id === id) {
        return { ...line, status: line.status === 'running' ? 'paused' : 'running' };
      }
      return line;
    }));
  };

  const handleStartProduction = (kit: InventoryItem) => {
    setIsStartingProduction(true);
    addNotification(lang === 'en' ? `Starting production for ${kit.name}...` : `Iniciando producción para ${kit.name}...`, 'info');
    setTimeout(() => {
      const newLine: ActiveLine = {
        id: `L-0${activeLines.length + 1}`,
        kit: kit.name,
        progress: 0,
        status: 'running',
        operator: 'AI System',
        efficiency: 100,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setActiveLines(prev => [newLine, ...prev]);
      setIsStartingProduction(false);
      setSelectedKit(null);
      addNotification(lang === 'en' ? `Production line ${newLine.id} is now active!` : `¡La línea de producción ${newLine.id} ya está activa!`, 'success');
    }, 1500);
  };

  const handleCreateBot = (name: string, type: any) => {
    const newBot: AssemblyBot = {
      id: `BOT-0${bots.length + 1}`,
      name,
      type,
      status: 'active'
    };
    setBots(prev => [...prev, newBot]);
    setShowBotModal(false);
    addNotification(lang === 'en' ? `AI Bot "${name}" deployed successfully!` : `¡Bot de IA "${name}" desplegado con éxito!`, 'success');
  };

  const handleCreateBOM = (name: string) => {
    const newKit: InventoryItem = {
      id: `KIT-${Date.now()}`,
      name,
      sku: `KIT-${Math.random().toString(36).substring(7).toUpperCase()}`,
      brand: 'Porteo Internal',
      quantity: 0,
      unit: 'Kit',
      location: 'Assembly-Zone-A',
      palletId: 'P-NEW',
      customer: 'Internal',
      isKit: true,
      components: newBomComponents.filter(c => c.sku)
    };
    setInventoryItems(prev => [newKit, ...prev]);
    setShowBomModal(false);
    setNewBomComponents([{ sku: '', quantity: 1 }]);
    addNotification(lang === 'en' ? `New BOM "${name}" created and added to library.` : `Nueva BOM "${name}" creada y añadida a la biblioteca.`, 'success');
  };

  const finishProduction = (lineId: string) => {
    const line = activeLines.find(l => l.id === lineId);
    if (!line) return;

    const kitToUpdate = inventoryItems.find(k => k.name === line.kit);
    if (kitToUpdate) {
      setInventoryItems(prev => prev.map(item => {
        if (item.id === kitToUpdate.id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        // Also deduct components if they exist
        if (kitToUpdate.components) {
          const component = kitToUpdate.components.find(c => c.sku === item.sku);
          if (component) {
            return { ...item, quantity: Math.max(0, item.quantity - component.quantity) };
          }
        }
        return item;
      }));
      addNotification(lang === 'en' ? `Production of ${line.kit} finished. Inventory updated.` : `Producción de ${line.kit} finalizada. Inventario actualizado.`, 'success');
    }
    
    setActiveLines(prev => prev.filter(l => l.id !== lineId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      addNotification(lang === 'en' ? `Processing ${file.name}...` : `Procesando ${file.name}...`, 'info');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
          
          if (jsonData.length > 0) {
            const newProductionData = jsonData.map((row, idx) => ({
              id: row.id || row.ID || idx + 1,
              date: row.date || row.Date || row.Fecha || new Date().toISOString().split('T')[0],
              line: row.line || row.Line || row.Linea || `L-0${(idx % 3) + 1}`,
              output: parseInt(row.output || row.Output || row.Produccion || 0),
              defects: parseInt(row.defects || row.Defects || row.Defectos || 0)
            }));
            
            setUploadedData(newProductionData);
            addNotification(lang === 'en' ? 'Production data synchronized successfully.' : 'Datos de producción sincronizados correctamente.', 'success');
          }
        } catch (err) {
          console.error('Error parsing production data:', err);
          addNotification(lang === 'en' ? 'Error parsing file.' : 'Error al analizar el archivo.', 'info');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDownloadReport = (type: string) => {
    addNotification(lang === 'en' ? `Generating ${type} report...` : `Generando reporte de ${type}...`, 'info');
    
    // Real download simulation
    setTimeout(() => {
      const content = `Report Type: ${type}\nGenerated: ${new Date().toLocaleString()}\nStatus: Success\nMetrics: Optimal\nData: ${Math.random().toString(36).substring(7)}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Porteo_${type}_Report_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addNotification(lang === 'en' ? 'Report downloaded successfully.' : 'Reporte descargado correctamente.', 'success');
    }, 1500);
  };

  const handleOrderMore = (component: any) => {
    addNotification(lang === 'en' ? `Order placed for ${component.sku}. Expected delivery: 2 days.` : `Pedido realizado para ${component.sku}. Entrega esperada: 2 días.`, 'success');
    setSelectedComponent(null);
  };

  const globalOEE = useMemo(() => {
    const runningLines = activeLines.filter(l => l.status === 'running');
    if (runningLines.length === 0) return 0;
    return Math.round(runningLines.reduce((acc, l) => acc + l.efficiency, 0) / runningLines.length);
  }, [activeLines]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{t.title}</h2>
          <p className="text-white/40 mt-1">{lang === 'en' ? 'Manage production BOMs and assembly workflows' : 'Gestionar BOMs de producción y flujos de ensamble'}</p>
        </div>
        <div className="flex gap-3">
          <label className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer">
            <Plus className="w-5 h-5 text-porteo-orange" />
            {t.uploadData}
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".xls,.xlsx,.csv,.pdf" />
          </label>
          <button 
            onClick={() => setShowBotModal(true)}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
          >
            <Cpu className="w-5 h-5 text-porteo-orange" />
            {t.createBot}
          </button>
          <button 
            onClick={() => setShowBomModal(true)}
            className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
          >
            <Plus className="w-5 h-5" />
            {t.createBOM}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => setShowStatsModal('oee')}
          className="glass p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-porteo-orange/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-4 h-4 text-porteo-orange" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t.oee}</span>
          </div>
          <p className="text-3xl font-bold text-white">{globalOEE}%</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
            <TrendingUp className="w-3 h-3" />
            {lang === 'en' ? 'Optimal Performance' : 'Rendimiento Óptimo'}
          </div>
        </div>
        <div 
          onClick={() => setShowStatsModal('active-lines')}
          className="glass p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Active Lines' : 'Líneas Activas'}</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeLines.filter(l => l.status === 'running').length}</p>
        </div>
        <div 
          onClick={() => setShowStatsModal('qc')}
          className="glass p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-porteo-blue/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-4 h-4 text-porteo-blue" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t.qualityControl}</span>
          </div>
          <p className="text-3xl font-bold text-white">99.8%</p>
        </div>
        <div 
          onClick={() => setShowStatsModal('bots')}
          className="glass p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-porteo-orange/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-4 h-4 text-porteo-orange" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t.activeBots}</span>
          </div>
          <p className="text-3xl font-bold text-white">{bots.length}</p>
        </div>
      </div>

      {/* AI Monitoring & Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-[40px] border border-porteo-blue/20 bg-porteo-blue/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-porteo-blue/20 rounded-2xl text-porteo-blue">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                {lang === 'en' ? 'AI Optimized Monitoring' : 'Monitoreo Optimizado por IA'}
              </h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {lang === 'en' 
                ? 'Our AI continuously monitors line efficiency and operator performance. If anomalies are detected, the system can automatically notify the supervisor or operator.' 
                : 'Nuestra IA monitorea continuamente la eficiencia de la línea y el rendimiento del operador. Si se detectan anomalías, el sistema puede notificar automáticamente al supervisor u operador.'}
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                addNotification(lang === 'en' ? 'Contacting operator via WhatsApp...' : 'Contactando al operador vía WhatsApp...', 'info');
              }}
              className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
            >
              <Zap className="w-4 h-4" />
              WhatsApp
            </button>
            <button 
              onClick={() => {
                addNotification(lang === 'en' ? 'Sending optimization report via Email...' : 'Enviando reporte de optimización vía Email...', 'info');
              }}
              className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold border border-white/10 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                {lang === 'en' ? 'Predictive Efficiency' : 'Eficiencia Predictiva'}
              </h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {lang === 'en' 
                ? 'Predictive models suggest a 12% increase in throughput by reallocating resources from Line 03 to Line 01 during the next shift.' 
                : 'Los modelos predictivos sugieren un aumento del 12% en el rendimiento al reasignar recursos de la Línea 03 a la Línea 01 durante el próximo turno.'}
            </p>
          </div>
          <button 
            onClick={() => addNotification(lang === 'en' ? 'Applying predictive optimization...' : 'Aplicando optimización predictiva...', 'success')}
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
          >
            {lang === 'en' ? 'Apply Optimization' : 'Aplicar Optimización'}
          </button>
        </div>
      </div>

      {/* Uploaded Data View */}
      {uploadedData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[40px] border border-porteo-blue/20 bg-porteo-blue/5"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-porteo-blue" />
              {lang === 'en' ? 'Imported Production Data' : 'Datos de Producción Importados'}
            </h3>
            <button onClick={() => setUploadedData(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Date</th>
                  <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Line</th>
                  <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Output Units</th>
                  <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Defects</th>
                  <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {uploadedData.map(row => (
                  <tr key={row.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 text-sm text-white">{row.date}</td>
                    <td className="py-4 text-sm text-white font-bold">{row.line}</td>
                    <td className="py-4 text-sm text-white">{row.output}</td>
                    <td className="py-4 text-sm text-emerald-500">{row.defects}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase">Synced</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Lines */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <Cpu className="w-5 h-5 text-porteo-orange" />
              {t.activeLines}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <History className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowAnalyticsModal(true)}
                className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {activeLines.map((line, i) => (
              <motion.div 
                layout
                key={line.id} 
                className={`glass p-8 rounded-[40px] border transition-all ${line.status === 'running' ? 'border-white/10' : 'border-white/5 opacity-80'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-lg font-bold ${line.status === 'running' ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-white/5 text-white/20'}`}>
                      {line.id}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{line.kit}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-white/40">{t.operator}: {line.operator}</p>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <p className="text-sm text-white/40">{line.startTime}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right space-y-2 flex-1 md:flex-none">
                      <div className="flex justify-between md:justify-end items-center gap-4">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.efficiency}: {line.efficiency}%</p>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">{Math.round(line.progress)}%</p>
                      </div>
                      <div className="w-full md:w-48 bg-white/5 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={false}
                          animate={{ width: `${line.progress}%` }}
                          className={`h-full ${line.status === 'running' ? 'bg-porteo-orange' : 'bg-white/20'}`} 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const kit = kits.find(k => k.name === line.kit);
                          if (kit) setSelectedKit(kit);
                        }}
                        className="p-4 bg-white/5 text-white/40 hover:text-white rounded-2xl transition-all"
                        title={t.viewBOM}
                      >
                        <Layers className="w-5 h-5" />
                      </button>
                      {line.progress >= 100 ? (
                        <button 
                          onClick={() => finishProduction(line.id)}
                          className="p-4 bg-emerald-500 text-white rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 px-6"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-widest">{lang === 'en' ? 'Finish' : 'Finalizar'}</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleLineStatus(line.id)}
                          className={`p-4 rounded-2xl transition-all ${line.status === 'running' ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-porteo-orange text-white shadow-lg shadow-porteo-orange/20'}`}
                        >
                          {line.status === 'running' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                      )}
                      <button 
                        onClick={() => setShowSettingsModal(line)}
                        className="p-4 bg-white/5 text-white/40 hover:text-white rounded-2xl transition-all"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar: Kits & Bots */}
        <div className="lg:col-span-1 space-y-8">
          {/* Kit Library */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Package className="w-5 h-5 text-porteo-orange" />
                {t.kits}
              </h3>
              <button 
                onClick={() => setShowAllKitsModal(true)}
                className="text-xs font-bold text-porteo-orange uppercase tracking-widest hover:underline"
              >
                {lang === 'en' ? 'View All' : 'Ver Todos'}
              </button>
            </div>
            <div className="space-y-4">
              {kits.map((kit) => (
                <div key={kit.id} className="glass p-6 rounded-[32px] border border-white/10 space-y-4 group hover:border-porteo-orange/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-porteo-orange font-bold uppercase tracking-widest mb-1">{kit.brand}</p>
                      <h4 className="text-sm font-bold text-white">{kit.name}</h4>
                      <p className="text-xs text-white/40 mt-1">SKU: {kit.sku}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedKit(kit)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold">{t.components}</p>
                    {kit.components?.slice(0, 3).map((comp, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedComponent(comp)}
                        className="flex justify-between items-center text-xs cursor-pointer hover:text-porteo-orange transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <Wrench className="w-3 h-3 text-white/20 group-hover:text-porteo-orange transition-colors" />
                          <span className="text-white/60 group-hover:text-white transition-colors">{comp.sku}</span>
                        </div>
                        <span className="font-bold text-white">x{comp.quantity}</span>
                      </div>
                    ))}
                    {kit.components && kit.components.length > 3 && (
                      <p className="text-[10px] text-white/20 italic">+{kit.components.length - 3} more components</p>
                    )}
                  </div>
                  <button 
                    onClick={() => handleStartProduction(kit)}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-porteo-orange hover:border-porteo-orange transition-all"
                  >
                    {t.startProduction}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active AI Bots */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Bot className="w-5 h-5 text-porteo-orange" />
                {t.activeBots}
              </h3>
              <button 
                onClick={() => setShowBotModal(true)}
                className="text-xs font-bold text-porteo-orange uppercase tracking-widest hover:underline"
              >
                {lang === 'en' ? 'Deploy New' : 'Desplegar Nuevo'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {bots.map((bot) => (
                <div 
                  key={bot.id} 
                  onClick={() => setSelectedBot(bot)}
                  className="glass p-6 rounded-3xl border border-white/10 flex items-center justify-between group hover:border-porteo-orange/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-porteo-orange/10 flex items-center justify-center text-porteo-orange">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{bot.name}</h4>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{bot.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{bot.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showBotModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBotModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{t.createBot}</h3>
                <button onClick={() => setShowBotModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Bot Name</label>
                  <input 
                    type="text" 
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="e.g. Optimizer X"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-porteo-orange/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Specialization</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Optimization', 'Quality', 'Safety'].map((type) => (
                      <button 
                        key={type}
                        onClick={() => handleCreateBot(newBotName || 'New AI Bot', type as any)}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-between"
                      >
                        {type}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleCreateBot(newBotName || 'New AI Bot', 'Optimization')}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20 mt-4"
                >
                  Confirm Deployment
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showBomModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBomModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{t.createBOM}</h3>
                <button onClick={() => setShowBomModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Kit Name</label>
                    <input 
                      type="text" 
                      value={newBomName}
                      onChange={(e) => setNewBomName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">SKU Prefix</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Components</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {newBomComponents.map((comp, idx) => (
                      <div key={idx} className="flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Component SKU" 
                          value={comp.sku}
                          onChange={(e) => {
                            const updated = [...newBomComponents];
                            updated[idx].sku = e.target.value;
                            setNewBomComponents(updated);
                          }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm" 
                        />
                        <input 
                          type="number" 
                          placeholder="Qty" 
                          value={comp.quantity}
                          onChange={(e) => {
                            const updated = [...newBomComponents];
                            updated[idx].quantity = parseInt(e.target.value) || 0;
                            setNewBomComponents(updated);
                          }}
                          className="w-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm" 
                        />
                        {newBomComponents.length > 1 && (
                          <button 
                            onClick={() => setNewBomComponents(prev => prev.filter((_, i) => i !== idx))}
                            className="p-4 text-white/20 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setNewBomComponents(prev => [...prev, { sku: '', quantity: 1 }])}
                    className="mt-4 text-porteo-orange text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add Component
                  </button>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowBomModal(false)} className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold">Cancel</button>
                  <button onClick={() => handleCreateBOM(newBomName || 'New BOM')} className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold">Save BOM</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedKit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedKit(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{selectedKit.name}</h3>
                  <p className="text-porteo-orange text-xs font-bold uppercase tracking-widest mt-1">{selectedKit.brand}</p>
                </div>
                <button onClick={() => setSelectedKit(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Stock Level</p>
                    <p className="text-xl font-bold text-white">{selectedKit.quantity} Units</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Production Time</p>
                    <p className="text-xl font-bold text-white">12m / unit</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest">{t.components}</h4>
                  <div className="space-y-2">
                    {selectedKit.components?.map((comp, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedComponent(comp)}
                        className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-porteo-orange/20 transition-colors">
                            <Wrench className="w-4 h-4 text-white/40 group-hover:text-porteo-orange transition-colors" />
                          </div>
                          <span className="text-sm text-white/80">{comp.sku}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-porteo-orange">x{comp.quantity}</span>
                          <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleStartProduction(selectedKit)}
                  disabled={isStartingProduction}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20 flex items-center justify-center gap-2"
                >
                  {isStartingProduction ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      {t.startProduction}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {selectedComponent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComponent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">{lang === 'en' ? 'Component Detail' : 'Detalle de Componente'}</h3>
                <button onClick={() => setSelectedComponent(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">SKU</p>
                  <p className="text-lg font-bold text-white">{selectedComponent.sku}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Available</p>
                    <p className="text-lg font-bold text-emerald-500">1,240</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Lead Time</p>
                    <p className="text-lg font-bold text-white">2 Days</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleOrderMore(selectedComponent)}
                  className="w-full py-3 bg-porteo-blue text-white rounded-xl font-bold text-sm hover:bg-porteo-blue/80 transition-all"
                >
                  {lang === 'en' ? 'Order More' : 'Pedir Más'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showHistoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{lang === 'en' ? 'Production History' : 'Historial de Producción'}</h3>
                  <p className="text-white/40 text-xs mt-1">Review and download past production data</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownloadReport('History')}
                    className="p-3 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all"
                    title={t.downloadHistory}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white" /></button>
                </div>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedBatch({ id: `BT-00${i}`, date: `March ${9-i}, 2026`, success: 100, units: 500, line: 'L-01', operator: 'Maria Garcia' })}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-all group"
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-porteo-orange transition-colors">Batch #BT-00{i}</p>
                      <p className="text-xs text-white/40">Completed on March {9-i}, 2026</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-emerald-500">100% Success</p>
                        <p className="text-xs text-white/40">500 Units</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {selectedBatch && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBatch(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t.batchDetails}</h3>
                <button onClick={() => setSelectedBatch(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white" /></button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Batch ID</p>
                    <p className="text-lg font-bold text-white">{selectedBatch.id}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Date</p>
                    <p className="text-lg font-bold text-white">{selectedBatch.date}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Operator</p>
                    <p className="text-lg font-bold text-white">{selectedBatch.operator}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Output</p>
                    <p className="text-lg font-bold text-emerald-500">{selectedBatch.units} Units</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownloadReport(`Batch_${selectedBatch.id}`)}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20"
                >
                  Download Batch Data
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showAnalyticsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAnalyticsModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{lang === 'en' ? 'Production Analytics' : 'Analítica de Producción'}</h3>
                <button onClick={() => setShowAnalyticsModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                  onClick={() => setSelectedAnalyticsDetail('efficiency')}
                  className="glass p-6 rounded-3xl border border-white/5 h-64 flex flex-col cursor-pointer hover:border-porteo-orange/30 transition-all group"
                >
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Efficiency Trend (Last 7 Days)</p>
                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-porteo-orange transition-all" />
                  </div>
                  <div className="flex-1 flex items-end gap-2 px-2">
                    {[85, 88, 92, 90, 94, 96, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-porteo-orange/20 rounded-t-lg relative group/bar">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          className="absolute bottom-0 left-0 right-0 bg-porteo-orange rounded-t-lg"
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                          {h}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 px-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <span key={d} className="text-[10px] text-white/20 font-bold">{d}</span>)}
                  </div>
                </div>
                <div 
                  onClick={() => setSelectedAnalyticsDetail('defects')}
                  className="glass p-6 rounded-3xl border border-white/5 h-64 flex flex-col cursor-pointer hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Defect Rate (By Line)</p>
                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    {['Line 01', 'Line 02', 'Line 03'].map((l, i) => (
                      <div key={l} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-white/60">{l}</span>
                          <span className="text-emerald-500">{[0.2, 0.5, 1.2][i]}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${[2, 5, 12][i]}%` }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => handleDownloadReport('Analytics')}
                  className="px-8 py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20 flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  {lang === 'en' ? 'Generate Detailed Analytics Report' : 'Generar Reporte de Analítica Detallado'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showAllKitsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAllKitsModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{lang === 'en' ? 'All Available Kits' : 'Todos los Kits Disponibles'}</h3>
                <button onClick={() => setShowAllKitsModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                {kits.map(kit => (
                  <div key={kit.id} className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                    <h4 className="text-lg font-bold text-white">{kit.name}</h4>
                    <p className="text-xs text-white/40">{kit.sku}</p>
                    <button onClick={() => { setSelectedKit(kit); setShowAllKitsModal(false); }} className="w-full py-3 bg-porteo-orange text-white rounded-xl font-bold text-xs">Configure</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {showStatsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStatsModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  {showStatsModal === 'oee' ? t.oee : 
                   showStatsModal === 'active-lines' ? (lang === 'en' ? 'Active Lines' : 'Líneas Activas') :
                   showStatsModal === 'qc' ? t.qualityControl : 
                   t.activeBots} Detail
                </h3>
                <button onClick={() => setShowStatsModal(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white" /></button>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-sm text-white/60 leading-relaxed">
                    {showStatsModal === 'oee' && (lang === 'en' ? "Overall Equipment Effectiveness is calculated based on availability, performance, and quality. Current target is 95%." : "La Efectividad General de los Equipos se calcula en función de la disponibilidad, el rendimiento y la calidad. El objetivo actual es del 95%.")}
                    {showStatsModal === 'active-lines' && (lang === 'en' ? "Current active production lines are operating at optimal capacity. No critical bottlenecks detected." : "Las líneas de producción activas actuales están operando a su capacidad óptima. No se detectan cuellos de botella críticos.")}
                    {showStatsModal === 'qc' && (lang === 'en' ? "Quality control metrics are derived from real-time sensor data and manual inspections. Defect rate is below 0.2%." : "Las métricas de control de calidad se derivan de datos de sensores en tiempo real e inspecciones manuales. La tasa de defectos es inferior al 0.2%.")}
                    {showStatsModal === 'bots' && (lang === 'en' ? "AI agents are monitoring production flows and optimizing resource allocation across all active lines." : "Los agentes de IA están monitoreando los flujos de producción y optimizando la asignación de recursos en todas las líneas activas.")}
                  </p>
                </div>
                <button 
                  onClick={() => handleDownloadReport(showStatsModal || 'Stats')}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20"
                >
                  {t.downloadReport}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedBot && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBot(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Bot Intelligence</h3>
                <button onClick={() => setSelectedBot(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white" /></button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-porteo-orange/10 flex items-center justify-center text-porteo-orange">
                    <Bot className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{selectedBot.name}</h4>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-widest">{selectedBot.type}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/60 leading-relaxed">
                    This bot is currently analyzing production patterns to identify potential efficiency gains. It has processed 1.2GB of telemetry data today.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold">Uptime</p>
                    <p className="text-sm font-bold text-white">99.9%</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold">Accuracy</p>
                    <p className="text-sm font-bold text-white">98.5%</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      addNotification(lang === 'en' ? 'Optimization sequence initiated.' : 'Secuencia de optimización iniciada.', 'info');
                      setSelectedBot(null);
                    }}
                    className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20"
                  >
                    Optimize Now
                  </button>
                  <button 
                    onClick={() => handleDownloadReport(`Bot_${selectedBot.id}_Logs`)}
                    className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedAnalyticsDetail && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAnalyticsDetail(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Granular Data: {selectedAnalyticsDetail}</h3>
                <button onClick={() => setSelectedAnalyticsDetail(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white" /></button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/60 leading-relaxed">
                    Detailed breakdown for {selectedAnalyticsDetail}. This includes per-shift performance, environmental factor correlation, and operator efficiency variance.
                  </p>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-xs text-white/60">Shift {i} Performance</span>
                      <span className="text-xs font-bold text-porteo-orange">{90 + i}%</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => handleDownloadReport(`Detailed_${selectedAnalyticsDetail}`)}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20"
                >
                  Download Granular Dataset
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSettingsModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettingsModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Line Settings: {showSettingsModal.id}</h3>
                <button onClick={() => setShowSettingsModal(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-white" /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Target Speed (units/hr)</label>
                    <input type="number" defaultValue="50" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Quality Threshold (%)</label>
                    <input type="number" defaultValue="98" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    addNotification(lang === 'en' ? 'Settings updated successfully.' : 'Configuración actualizada correctamente.', 'success');
                    setShowSettingsModal(null);
                  }}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-6 right-6 z-[300] space-y-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-2xl border pointer-events-auto flex items-center gap-3 min-w-[300px] ${
                n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-porteo-blue/10 border-porteo-blue/20 text-porteo-blue'
              }`}
            >
              {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              <p className="text-sm font-bold">{n.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Assistant Section - More Visible */}
      <div className="glass p-8 rounded-[40px] border border-porteo-orange/20 bg-porteo-orange/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-porteo-orange/20 flex items-center justify-center text-porteo-orange animate-pulse">
            <Bot className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{lang === 'en' ? 'Assembly Expert AI' : 'IA Experta en Ensamble'}</h3>
            <p className="text-white/60 max-w-md mt-2">
              {lang === 'en' 
                ? 'I can help you optimize your production lines, manage BOMs, and identify bottlenecks in real-time.' 
                : 'Puedo ayudarte a optimizar tus líneas de producción, gestionar BOMs e identificar cuellos de botella en tiempo real.'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            const assistantBtn = document.querySelector('.ai-assistant-button') as HTMLButtonElement;
            if (assistantBtn) assistantBtn.click();
          }}
          className="px-8 py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20 hover:scale-105 transition-all"
        >
          {lang === 'en' ? 'Consult Expert' : 'Consultar Experto'}
        </button>
      </div>

      {/* AI Assistant Floating Trigger */}
      <AIAssistant 
        role="Assembly Expert" 
        lang={lang} 
        context={`Current active lines: ${activeLines.length}. Global OEE: ${globalOEE}%. Active bots: ${bots.length}. Available kits: ${kits.length}.`} 
      />
    </div>
  );
};
