import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, MapPin, Clock, CheckCircle2, Circle, AlertCircle, ArrowRight, Package, ClipboardCheck, CornerUpLeft, FileText, Search, Filter, Upload, X, Calendar, Cpu } from 'lucide-react';
import { TPLProcess, Language } from '../types';
import { MOCK_TPL_PROCESSES } from '../constants';

interface TPLWorkflowProps {
  language: Language;
  shipments?: TPLProcess[];
  onUpdateStatus?: (shipment: TPLProcess) => void;
  onViewDocuments?: (shipment: TPLProcess) => void;
  onBulkImport?: (data: any[]) => void;
}

export const TPLWorkflow = ({ language, shipments = MOCK_TPL_PROCESSES, onUpdateStatus, onViewDocuments, onBulkImport }: TPLWorkflowProps) => {
  const [selectedProcess, setSelectedProcess] = useState<TPLProcess | null>(shipments[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState(false);

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
      
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchQuery, filterStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in-progress': return <div className="w-5 h-5 rounded-full border-2 border-porteo-orange border-t-transparent animate-spin" />;
      case 'rejected': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <Circle className="w-5 h-5 text-white/20" />;
    }
  };

  const workflowSteps = [
    { id: 'collection', icon: <Truck />, label: { en: 'Collection', es: 'Recolección' } },
    { id: 'in-transit-to-wh', icon: <MapPin />, label: { en: 'Arrival', es: 'Llegada' } },
    { id: 'unloading', icon: <ArrowRight />, label: { en: 'Unloading', es: 'Descarga' } },
    { id: 'classifying', icon: <Package />, label: { en: 'Classification', es: 'Clasificación' } },
    { id: 'storage', icon: <ClipboardCheck />, label: { en: 'Storage/Picking', es: 'Almacén/Surtido' } },
    { id: 'loading', icon: <Truck />, label: { en: 'Loading', es: 'Carga' } },
    { id: 'delivery', icon: <MapPin />, label: { en: 'Delivery', es: 'Entrega' } },
    { id: 'customer-facility', icon: <CheckCircle2 />, label: { en: 'Customer Status', es: 'Estatus Cliente' } },
    { id: 'returning', icon: <CornerUpLeft />, label: { en: 'Return', es: 'Retorno' } },
    { id: 'documentation', icon: <FileText />, label: { en: 'Documentation', es: 'Documentación' } },
  ];

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
            {['all', 'collection', 'in-transit', 'arrived', 'unloading', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap transition-all ${filterStatus === status ? 'bg-porteo-orange text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  <p className="text-lg font-bold text-porteo-orange uppercase mt-1">{selectedProcess.status.replace(/-/g, ' ')}</p>
                </div>
              </div>

              {/* Visual Workflow Tracker */}
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
                <div className="flex justify-between relative z-10">
                  {workflowSteps.map((step, idx) => {
                    const currentStepIdx = workflowSteps.findIndex(s => s.id === selectedProcess.status);
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = step.id === selectedProcess.status;
                    
                    return (
                      <div 
                        key={step.id} 
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                        onClick={() => {
                          const updatedProcess = {
                            ...selectedProcess,
                            status: step.id as TPLProcess['status'],
                            steps: [
                              ...selectedProcess.steps,
                              { 
                                id: `s-${Date.now()}`, 
                                label: step.label, 
                                status: 'completed', 
                                timestamp: new Date().toLocaleTimeString(),
                                details: language === 'en' ? `Manual status update to ${step.label.en}` : `Actualización manual de estatus a ${step.label.es}`
                              }
                            ]
                          };
                          onUpdateStatus?.(updatedProcess as TPLProcess);
                          setSelectedProcess(updatedProcess as TPLProcess);
                        }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-porteo-orange text-white ring-4 ring-porteo-orange/20' : 'bg-slate-800 text-white/20'}`}>
                          {step.icon}
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-tighter text-center max-w-[60px] ${isCurrent ? 'text-porteo-orange' : 'text-white/40'}`}>
                          {step.label[language]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-6 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-6">{language === 'en' ? 'Process Log' : 'Bitácora de Proceso'}</h3>
                <div className="space-y-6">
                  {selectedProcess.steps.map((step) => (
                    <button 
                      key={step.id} 
                      onClick={() => alert(language === 'en' ? `Step Detail: ${step.label.en}\nStatus: ${step.status}\nTime: ${step.timestamp}\nDetails: ${step.details || 'No additional details'}` : `Detalle del Paso: ${step.label.es}\nEstatus: ${step.status}\nHora: ${step.timestamp}\nDetalles: ${step.details || 'Sin detalles adicionales'}`)}
                      className="flex gap-4 w-full text-left hover:bg-white/5 p-2 rounded-xl transition-all group"
                    >
                      <div className="mt-1">{getStatusIcon(step.status)}</div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-porteo-orange transition-colors">{step.label[language]}</p>
                        <p className="text-xs text-white/40 mt-0.5">{step.timestamp || (step.status === 'pending' ? 'Pending' : 'In Progress')}</p>
                        {step.details && <p className="text-xs text-white/60 mt-2 p-2 bg-white/5 rounded-lg border border-white/5">{step.details}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass p-6 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-6">{language === 'en' ? 'Shipment Details' : 'Detalles del Envío'}</h3>
                <div className="space-y-4">
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
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => onUpdateStatus?.(selectedProcess)}
                    className="p-3 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/80 transition-all"
                  >
                    {language === 'en' ? 'Update Status' : 'Actualizar Estatus'}
                  </button>
                  <button 
                    onClick={() => onViewDocuments?.(selectedProcess)}
                    className="p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    {language === 'en' ? 'View Documents' : 'Ver Documentos'}
                  </button>
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
                        alert(`Processing ${files.length} files... AI is extracting shipment data.`);
                        // Simulate data extraction
                        const newShipments = Array.from({ length: 5 }).map((_, i) => ({
                          id: `IMP-${Math.floor(Math.random() * 10000)}`,
                          customer: `Imported Customer ${i + 1}`,
                          truckId: `TRK-${Math.floor(Math.random() * 1000)}`,
                          truckType: 'Full Truck',
                          origin: 'Laredo, TX',
                          destination: 'Monterrey, NL',
                          status: 'collection',
                          steps: []
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
