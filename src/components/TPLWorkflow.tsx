import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, MapPin, Clock, CheckCircle2, Circle, AlertCircle, ArrowRight, Package, ClipboardCheck, CornerUpLeft, FileText, Search, Filter, Upload, X, Calendar, Cpu, ShieldCheck, RefreshCw, Download } from 'lucide-react';
import { TPLProcess, Language } from '../types';
import { MOCK_TPL_PROCESSES } from '../constants';

interface TPLWorkflowProps {
  language: Language;
  shipments?: TPLProcess[];
  onUpdateStatus?: (shipment: TPLProcess) => void;
  onViewDocuments?: (shipment: TPLProcess) => void;
  onBulkImport?: (data: any[]) => void;
  addNotification: (message: string, type?: 'operational' | 'alert' | 'success' | 'info') => void;
}

export const TPLWorkflow = ({ language, shipments = MOCK_TPL_PROCESSES, onUpdateStatus, onViewDocuments, onBulkImport, addNotification }: TPLWorkflowProps) => {
  const workflowSteps = [
    { id: 'collection', icon: <Truck className="w-4 h-4" />, label: { en: 'Collection', es: 'Recolección' } },
    { id: 'in-transit-to-wh', icon: <MapPin className="w-4 h-4" />, label: { en: 'Arrival', es: 'Llegada' } },
    { id: 'unloading', icon: <ArrowRight className="w-4 h-4" />, label: { en: 'Unloading', es: 'Descarga' } },
    { id: 'classifying', icon: <Package className="w-4 h-4" />, label: { en: 'Classification', es: 'Clasificación' } },
    { id: 'storage', icon: <ClipboardCheck className="w-4 h-4" />, label: { en: 'Storage', es: 'Almacén' } },
    { id: 'picking', icon: <Package className="w-4 h-4" />, label: { en: 'Picking', es: 'Surtido' } },
    { id: 'cross-dock', icon: <RefreshCw className="w-4 h-4" />, label: { en: 'Cross-Dock', es: 'Cruce Andén' } },
    { id: 'loading', icon: <Truck className="w-4 h-4" />, label: { en: 'Loading', es: 'Carga' } },
    { id: 'delivery', icon: <MapPin className="w-4 h-4" />, label: { en: 'Delivery', es: 'Entrega' } },
    { id: 'customer-facility', icon: <CheckCircle2 className="w-4 h-4" />, label: { en: 'Customer Status', es: 'Estatus Cliente' } },
    { id: 'returning', icon: <CornerUpLeft className="w-4 h-4" />, label: { en: 'Return', es: 'Retorno' } },
    { id: 'documentation', icon: <FileText className="w-4 h-4" />, label: { en: 'Documentation', es: 'Documentación' } },
  ];

  const [selectedProcess, setSelectedProcess] = useState<TPLProcess | null>(shipments[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [filterTruckType, setFilterTruckType] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCartaPortePreview, setShowCartaPortePreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStepIdx = useMemo(() => {
    if (!selectedProcess) return -1;
    return workflowSteps.findIndex(s => s.id === selectedProcess.status);
  }, [selectedProcess]);

  const completeCurrentStep = () => {
    if (!selectedProcess || currentStepIdx === -1 || currentStepIdx >= workflowSteps.length - 1) return;
    
    const nextStep = workflowSteps[currentStepIdx + 1];
    const updatedProcess: TPLProcess = {
      ...selectedProcess,
      status: nextStep.id as TPLProcess['status'],
      steps: [
        ...selectedProcess.steps.map(s => s.status === 'in-progress' ? { ...s, status: 'completed' as const, timestamp: new Date().toLocaleTimeString() } : s),
        {
          id: `s-${Date.now()}`,
          label: nextStep.label,
          status: 'in-progress',
          timestamp: new Date().toLocaleTimeString(),
          details: language === 'en' ? `System automatically moved to ${nextStep.label.en}` : `El sistema se movió automáticamente a ${nextStep.label.es}`
        }
      ]
    };
    
    setSelectedProcess(updatedProcess);
    onUpdateStatus?.(updatedProcess);
  };

  // Sync selectedProcess when shipments change
  useEffect(() => {
    if (selectedProcess) {
      const updated = shipments.find(s => s.id === selectedProcess.id);
      if (updated) {
        setSelectedProcess(updated);
      }
    } else if (shipments.length > 0) {
      setSelectedProcess(shipments[0]);
    }
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    return shipments.filter(p => {
      const matchesSearch = 
        p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.truckId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesCustomer = filterCustomer === 'all' || p.customer === filterCustomer;
      const matchesTruckType = filterTruckType === 'all' || p.truckType === filterTruckType;
      
      return matchesSearch && matchesStatus && matchesCustomer && matchesTruckType;
    });
  }, [shipments, searchQuery, filterStatus, filterCustomer, filterTruckType]);

  const customers = useMemo(() => Array.from(new Set(shipments.map(s => s.customer))), [shipments]);
  const truckTypes = useMemo(() => Array.from(new Set(shipments.map(s => s.truckType))), [shipments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in-progress': return (
        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-porteo-orange opacity-20" />
          <div className="absolute w-2 h-2 bg-porteo-orange rounded-full animate-pulse" />
        </div>
      );
      case 'rejected': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'pending': return <Circle className="w-5 h-5 text-white/10" />;
      default: return <Circle className="w-5 h-5 text-white/20" />;
    }
  };

  const jumpToStep = (stepId: string) => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (!step || !selectedProcess) return;

    const updatedProcess: TPLProcess = {
      ...selectedProcess,
      status: stepId as TPLProcess['status'],
      steps: [
        ...selectedProcess.steps.filter(s => {
          const sIdx = workflowSteps.findIndex(ws => ws.id === s.id);
          const targetIdx = workflowSteps.findIndex(ws => ws.id === stepId);
          return sIdx < targetIdx;
        }).map(s => ({ ...s, status: 'completed' as const })),
        {
          id: `s-${Date.now()}`,
          label: step.label,
          status: 'in-progress',
          timestamp: new Date().toLocaleTimeString(),
          details: language === 'en' ? `Manual jump to ${step.label.en}` : `Salto manual a ${step.label.es}`
        }
      ]
    };
    onUpdateStatus?.(updatedProcess);
    setSelectedProcess(updatedProcess);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
      {/* Active Shipments List */}
      <div className="lg:col-span-1 glass rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">
              {language === 'en' ? 'Active Shipments' : 'Envíos Activos'}
            </h3>
            <button 
              onClick={() => setShowImportModal(true)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-porteo-orange transition-all"
              title={language === 'en' ? 'Bulk Import' : 'Importación Masiva'}
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder={language === 'en' ? 'Search shipments...' : 'Buscar envíos...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-porteo-orange/50 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'collection', 'in-transit-to-wh', 'unloading', 'classifying', 'storage', 'picking', 'loading', 'delivery', 'documentation'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap transition-all ${filterStatus === status ? 'bg-porteo-orange text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
              >
                {status.replace(/-/g, ' ')}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <select 
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white/60 focus:outline-none focus:border-porteo-orange/50"
            >
              <option value="all">{language === 'en' ? 'All Customers' : 'Todos los Clientes'}</option>
              {customers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={filterTruckType}
              onChange={(e) => setFilterTruckType(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white/60 focus:outline-none focus:border-porteo-orange/50"
            >
              <option value="all">{language === 'en' ? 'All Trucks' : 'Todos los Camiones'}</option>
              {truckTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {filteredShipments.length > 0 ? filteredShipments.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProcess(p)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${selectedProcess?.id === p.id ? 'bg-porteo-blue border-porteo-blue shadow-lg shadow-porteo-blue/20' : 'bg-white/5 border border-white/10 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-porteo-orange font-bold">{p.truckId}</span>
                <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded uppercase font-bold text-white/60">{p.truckType}</span>
              </div>
              <p className="text-sm font-bold text-white truncate">{p.customer}</p>
              <p className="text-[10px] text-white/40 mt-1">{p.origin} → {p.destination}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${p.status === 'documentation' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-porteo-orange/20 text-porteo-orange'}`}>
                  {p.status}
                </span>
                <span className="text-[8px] text-white/20">{p.id}</span>
              </div>
            </button>
          )) : (
            <div className="py-10 text-center text-white/20">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No shipments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Detail */}
      <div className="lg:col-span-3 space-y-8">
        {selectedProcess ? (
          <>
            <div className="glass p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedProcess.customer}</h2>
                  <p className="text-white/40 text-sm mt-1">ID: {selectedProcess.id} • {selectedProcess.truckId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-widest">{language === 'en' ? 'Current Status' : 'Estatus Actual'}</p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span className="px-3 py-1 bg-porteo-orange/20 text-porteo-orange rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {selectedProcess.status.replace(/-/g, ' ')}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {language === 'en' ? 'Step' : 'Paso'} {currentStepIdx + 1} / {workflowSteps.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Workflow Tracker */}
              <div className="relative overflow-x-auto pb-4 scrollbar-hide">
                <div className="min-w-[800px] relative">
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-white/10 z-0" />
                  <div className="flex justify-between relative z-10">
                    {workflowSteps.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = step.id === selectedProcess.status;
                      
                      return (
                        <div 
                          key={step.id} 
                          className="flex flex-col items-center gap-2 cursor-pointer group px-2"
                          onClick={() => jumpToStep(step.id)}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-porteo-orange text-white ring-4 ring-porteo-orange/20' : 'bg-slate-800 text-white/20'}`}>
                            {step.icon}
                          </div>
                          <p className={`text-[9px] font-bold uppercase tracking-tight text-center w-16 leading-tight ${isCurrent ? 'text-porteo-orange' : 'text-white/40'}`}>
                            {step.label[language]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-6">{language === 'en' ? 'Process Log' : 'Bitácora de Proceso'}</h3>
                <div className="space-y-6">
                  {workflowSteps.map((step, idx) => {
                    const stepInHistory = selectedProcess.steps.find(s => s.label.en === step.label.en || s.label.es === step.label.es);
                    const isCurrent = selectedProcess.status === step.id;
                    const isCompleted = workflowSteps.findIndex(s => s.id === selectedProcess.status) > idx;
                    const status = isCompleted ? 'completed' : isCurrent ? 'in-progress' : 'pending';

                    return (
                      <button 
                        key={step.id} 
                        onClick={() => jumpToStep(step.id)}
                        className={`flex gap-4 w-full text-left p-3 rounded-2xl transition-all border ${isCurrent ? 'bg-porteo-orange/10 border-porteo-orange/30' : 'hover:bg-white/5 border-transparent'}`}
                      >
                        <div className="mt-1">{getStatusIcon(status)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`text-sm font-bold ${isCurrent ? 'text-porteo-orange' : isCompleted ? 'text-white' : 'text-white/20'}`}>
                                {step.label[language]}
                              </p>
                              <p className="text-[10px] text-white/40 mt-0.5">
                                {stepInHistory?.timestamp || (status === 'pending' ? (language === 'en' ? 'Pending' : 'Pendiente') : (language === 'en' ? 'Active' : 'Activo'))}
                              </p>
                            </div>
                            {isCurrent && (
                              <div className="px-3 py-1 bg-porteo-orange text-white rounded-lg text-[10px] font-bold">
                                {language === 'en' ? 'Active' : 'Activo'}
                              </div>
                            )}
                          </div>
                          {stepInHistory?.details && <p className="text-[10px] text-white/60 mt-2 p-2 bg-white/5 rounded-lg border border-white/5">{stepInHistory.details}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="glass p-6 rounded-3xl flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-6">{language === 'en' ? 'Shipment Details' : 'Detalles del Envío'}</h3>
                  <div className="space-y-4">
                    {selectedProcess.status === 'documentation' ? (
                      <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/30 rounded-3xl text-center space-y-4">
                        <div className="w-16 h-16 bg-porteo-blue/20 rounded-full flex items-center justify-center mx-auto text-porteo-blue">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{language === 'en' ? 'Final Documentation' : 'Documentación Final'}</h4>
                          <p className="text-[10px] text-white/40 mt-1">{language === 'en' ? 'Upload signed BOL, photos of cargo, and delivery proof.' : 'Subir BOL firmado, fotos de carga y prueba de entrega.'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => onViewDocuments?.(selectedProcess)}
                            className="p-3 bg-porteo-blue text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-2"
                          >
                            <FileText className="w-3 h-3" />
                            {language === 'en' ? 'Upload Files' : 'Subir Archivos'}
                          </button>
                          <button 
                            onClick={() => {
                              addNotification(language === 'en' ? 'Opening Camera...' : 'Abriendo Cámara...', 'operational');
                            }}
                            className="p-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {language === 'en' ? 'Take Photo' : 'Tomar Foto'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-xs text-white/40">{language === 'en' ? 'Vehicle Type' : 'Tipo de Vehículo'}</span>
                          <span className="text-xs font-bold text-white">{selectedProcess.truckType}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-xs text-white/40">{language === 'en' ? 'Appointment' : 'Cita'}</span>
                          <span className="text-xs font-bold text-white">{selectedProcess.appointmentTime || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-xs text-white/40">{language === 'en' ? 'Origin' : 'Origen'}</span>
                          <span className="text-xs font-bold text-white">{selectedProcess.origin}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-xs text-white/40">{language === 'en' ? 'Destination' : 'Destino'}</span>
                          <span className="text-xs font-bold text-white">{selectedProcess.destination}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button 
                      onClick={completeCurrentStep}
                      disabled={currentStepIdx >= workflowSteps.length - 1}
                      className="flex-1 p-3 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/80 transition-all disabled:opacity-50"
                    >
                      {language === 'en' ? 'Complete Current Step' : 'Completar Paso Actual'}
                    </button>
                    <button 
                      onClick={() => onUpdateStatus?.(selectedProcess)}
                      className="flex-1 p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                    >
                      {language === 'en' ? 'Update Status' : 'Actualizar Estatus'}
                    </button>
                    <button 
                      onClick={() => onViewDocuments?.(selectedProcess)}
                      className="flex-1 p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                    >
                      {language === 'en' ? 'View Documents' : 'Ver Documentos'}
                    </button>
                  </div>
                </div>

                {/* Compliance Section */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">
                        {language === 'en' ? 'US Compliance' : 'Mexican Compliance'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {language === 'en' ? 'DOT/FMCSA' : 'CFDI 4.0'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => {
                          setIsGenerating(false);
                          setShowCartaPortePreview(true);
                        }, 1500);
                      }}
                      disabled={isGenerating}
                      className="w-full p-3 bg-porteo-blue/10 border border-porteo-blue/30 text-porteo-blue rounded-xl text-[10px] font-bold hover:bg-porteo-blue/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                      {language === 'en' ? 'Generate BOL v3.0' : 'Generar Carta Porte v3.0'}
                    </button>
                    <button 
                      onClick={() => {
                        addNotification(language === 'en' ? 'Opening Compliance Audit...' : 'Abriendo Auditoría de Cumplimiento...', 'operational');
                      }}
                      className="w-full p-3 bg-white/5 border border-white/10 text-white/60 rounded-xl text-[10px] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {language === 'en' ? 'Compliance Audit' : 'Auditoría de Cumplimiento'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <Truck className="w-20 h-20 mb-4" />
            <p className="text-xl font-bold">Select a shipment to view workflow</p>
          </div>
        )}
      </div>

      {/* Carta Porte Preview Modal */}
      <AnimatePresence>
        {showCartaPortePreview && selectedProcess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCartaPortePreview(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] p-10 shadow-2xl text-slate-900 font-sans overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowCartaPortePreview(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-porteo-blue rounded-xl flex items-center justify-center">
                        <FileText className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {language === 'en' ? 'Bill of Lading v3.0' : 'Complemento Carta Porte v3.0'}
                        </h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                          {language === 'en' ? 'Electronic BOL' : 'CFDI de Traslado'} • UUID: 550e8400-e29b-41d4-a716-446655440000
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mb-2">
                        {language === 'en' ? 'SUCCESSFULLY SIGNED' : 'TIMBRADO EXITOSO'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {language === 'en' ? 'Date' : 'Fecha'}: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mb-8">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          {language === 'en' ? 'Issuer' : 'Emisor'}
                        </p>
                        <p className="text-sm font-bold">PORTEO LOGISTICS S.A. DE C.V.</p>
                        <p className="text-xs text-slate-500">
                          {language === 'en' ? 'Tax ID' : 'RFC'}: PLO123456789
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          {language === 'en' ? 'Origin Location' : 'Ubicación Origen'}
                        </p>
                        <p className="text-sm font-bold">{selectedProcess.origin}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          {language === 'en' ? 'Receiver' : 'Receptor'}
                        </p>
                        <p className="text-sm font-bold">{selectedProcess.customer}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          {language === 'en' ? 'Destination Location' : 'Ubicación Destino'}
                        </p>
                        <p className="text-sm font-bold">{selectedProcess.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      {language === 'en' ? 'Goods Details' : 'Detalle de Mercancías'}
                    </p>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-slate-400 border-b border-slate-200">
                          <th className="pb-2">{language === 'en' ? 'Product Code' : 'Clave SAT'}</th>
                          <th className="pb-2">{language === 'en' ? 'Description' : 'Descripción'}</th>
                          <th className="pb-2">{language === 'en' ? 'Quantity' : 'Cantidad'}</th>
                          <th className="pb-2 text-right">{language === 'en' ? 'Weight (kg)' : 'Peso (kg)'}</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b border-slate-100">
                          <td className="py-3 font-mono">25171500</td>
                          <td className="py-3 font-bold">Autopartes y Accesorios</td>
                          <td className="py-3">1.00 H87</td>
                          <td className="py-3 text-right font-bold">1,250.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-porteo-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-porteo-blue/20">
                      <Download className="w-4 h-4" />
                      {language === 'en' ? 'Download PDF' : 'Descargar PDF'}
                    </button>
                    <button className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      {language === 'en' ? 'View XML' : 'Ver XML'}
                    </button>
                  </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowImportModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Bulk Import Shipments</h3>
                <button onClick={() => setShowImportModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-porteo-orange/50 transition-all cursor-pointer group">
                  <div className="p-4 bg-porteo-orange/10 rounded-full text-porteo-orange group-hover:scale-110 transition-all">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Drop your files here</p>
                    <p className="text-xs text-white/40 mt-1">Supports Excel (.xlsx), CSV, PDF, JSON</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="bulk-file" 
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        addNotification(`Processing ${files.length} files... AI is extracting shipment data.`, 'operational');
                        // Simulate data extraction
                        const newShipments = Array.from({ length: 5 }).map((_, i) => ({
                          id: `IMP-${Math.floor(Math.random() * 10000)}`,
                          customer: `Imported Customer ${i + 1}`,
                          truckId: `TRK-${Math.floor(Math.random() * 1000)}`,
                          truckType: 'Full Truck' as const,
                          origin: 'Laredo, TX',
                          destination: 'Monterrey, NL',
                          status: 'collection' as const,
                          steps: [
                            { id: 's1', label: { en: 'Collection', es: 'Recolección' }, status: 'in-progress' as const, timestamp: new Date().toLocaleTimeString() }
                          ]
                        }));
                        onBulkImport?.(newShipments);
                        setShowImportModal(false);
                      }
                    }}
                  />
                  <label htmlFor="bulk-file" className="px-6 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold cursor-pointer">
                    Browse Files
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-porteo-blue" />
                      <span className="text-[10px] font-bold text-white uppercase">Template</span>
                    </div>
                    <p className="text-[10px] text-white/40 mb-3">Download our standard import template.</p>
                    <button className="text-[10px] font-bold text-porteo-blue hover:underline">Download Template</button>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-porteo-orange" />
                      <span className="text-[10px] font-bold text-white uppercase">AI Mapping</span>
                    </div>
                    <p className="text-[10px] text-white/40 mb-3">AI automatically maps your custom columns.</p>
                    <span className="text-[10px] font-bold text-emerald-500">Enabled</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
