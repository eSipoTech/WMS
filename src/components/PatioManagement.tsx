import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  ParkingCircle, 
  Warehouse, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  MapPin,
  Plus,
  X,
  Search,
  ChevronRight,
  Activity,
  Maximize2
} from 'lucide-react';
import { PatioSlot } from '../types';
import { MOCK_PATIO } from '../constants';

interface PatioManagementProps {
  lang: 'en' | 'es';
  searchQuery?: string;
  trucks?: any[];
  patioSlots: PatioSlot[];
  onSlotClick?: (slot: PatioSlot) => void;
  onAddSlot?: (type: 'parking' | 'dock' | 'staging') => void;
}

export const PatioManagement: React.FC<PatioManagementProps> = ({ lang, searchQuery = '', trucks = [], patioSlots, onSlotClick, onAddSlot }) => {
  const [selectedStatus, setSelectedStatus] = useState<'empty' | 'occupied' | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [modalSearch, setModalSearch] = useState('');
  const [modalTypeFilter, setModalTypeFilter] = useState<'all' | 'parking' | 'dock' | 'staging'>('all');

  const t = {
    title: lang === 'en' ? 'Patio & Yard Management' : 'Gestión de Patio y Patio',
    parking: lang === 'en' ? 'Parking Slots' : 'Cajones de Estacionamiento',
    docks: lang === 'en' ? 'Loading Docks' : 'Muelles de Carga',
    staging: lang === 'en' ? 'Staging Areas' : 'Áreas de Staging',
    status: lang === 'en' ? 'Status' : 'Estado',
    empty: lang === 'en' ? 'Empty' : 'Vacío',
    occupied: lang === 'en' ? 'Occupied' : 'Ocupado',
    reserved: lang === 'en' ? 'Reserved' : 'Reservado',
    shipment: lang === 'en' ? 'Shipment' : 'Embarque',
    complete: lang === 'en' ? 'Complete' : 'Completado',
    add: lang === 'en' ? 'Add' : 'Agregar',
    available: lang === 'en' ? 'Available' : 'Disponible',
    details: lang === 'en' ? 'View Details' : 'Ver Detalles',
    close: lang === 'en' ? 'Close' : 'Cerrar',
    type: lang === 'en' ? 'Type' : 'Tipo',
    label: lang === 'en' ? 'Label' : 'Etiqueta',
    truck: lang === 'en' ? 'Truck ID' : 'ID de Camión',
    gridView: lang === 'en' ? 'Grid View' : 'Vista de Cuadrícula',
    mapView: lang === 'en' ? 'Yard Map' : 'Mapa de Patio',
    searchPlaceholder: lang === 'en' ? 'Search slots...' : 'Buscar espacios...',
    allTypes: lang === 'en' ? 'All Types' : 'Todos los tipos',
    driver: lang === 'en' ? 'Driver' : 'Chofer',
    carrier: lang === 'en' ? 'Carrier' : 'Transportista',
    elapsed: lang === 'en' ? 'Elapsed' : 'Transcurrido'
  };

  const getStatusColor = (status: PatioSlot['status']) => {
    switch (status) {
      case 'empty': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20';
      case 'occupied': return 'bg-porteo-orange/10 text-porteo-orange border-porteo-orange/20 hover:bg-porteo-orange/20';
      case 'reserved': return 'bg-porteo-blue/10 text-porteo-blue border-porteo-blue/20 hover:bg-porteo-blue/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  // Merge patioSlots with real trucks if they have dock assignments
  const patioWithTrucks = patioSlots.map(slot => {
    const truckAtSlot = trucks.find(t => t.dock === slot.label || t.id === slot.truckId);
    if (truckAtSlot) {
      return {
        ...slot,
        status: 'occupied' as const,
        truckId: truckAtSlot.id
      };
    }
    return slot;
  });

  const filteredPatio = patioWithTrucks.filter(slot => 
    slot.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (slot.truckId && slot.truckId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const modalFilteredSlots = patioWithTrucks
    .filter(s => s.status === selectedStatus)
    .filter(s => modalTypeFilter === 'all' || s.type === modalTypeFilter)
    .filter(s => 
      s.label.toLowerCase().includes(modalSearch.toLowerCase()) ||
      (s.truckId && s.truckId.toLowerCase().includes(modalSearch.toLowerCase()))
    );

  const YardMap = () => {
    const rows = 4;
    const cols = 8;
    
    return (
      <div className="glass p-8 rounded-[32px] border border-white/10 overflow-x-auto">
        <div className="min-w-[800px] relative">
          {/* Docks Area (Top) */}
          <div className="flex gap-4 mb-12 justify-center">
            {patioWithTrucks.filter(s => s.type === 'dock').map(slot => (
              <motion.div
                key={slot.id}
                whileHover={{ scale: 1.1, y: -5 }}
                onClick={() => onSlotClick?.(slot)}
                className={`w-16 h-20 rounded-t-xl border-x border-t flex flex-col items-center justify-center cursor-pointer transition-all ${getStatusColor(slot.status)}`}
              >
                <span className="text-[10px] font-bold mb-1">{slot.label}</span>
                {slot.status === 'occupied' ? <Truck className="w-6 h-6" /> : <Warehouse className="w-6 h-6 opacity-20" />}
              </motion.div>
            ))}
          </div>

          {/* Yard / Parking Area */}
          <div className="grid grid-cols-8 gap-4 mb-12">
            {patioWithTrucks.filter(s => s.type === 'parking').map(slot => (
              <motion.div
                key={slot.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => onSlotClick?.(slot)}
                className={`aspect-[3/4] rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all ${getStatusColor(slot.status)}`}
              >
                <span className="text-[8px] font-bold mb-1">{slot.label}</span>
                {slot.status === 'occupied' && <Truck className="w-4 h-4 rotate-90" />}
              </motion.div>
            ))}
          </div>

          {/* Staging Area (Bottom) */}
          <div className="flex gap-8 justify-center">
            {patioWithTrucks.filter(s => s.type === 'staging').map(slot => (
              <motion.div
                key={slot.id}
                whileHover={{ scale: 1.05, y: 5 }}
                onClick={() => onSlotClick?.(slot)}
                className={`w-32 h-16 rounded-xl border flex items-center justify-center gap-3 cursor-pointer transition-all ${getStatusColor(slot.status)}`}
              >
                <MapPin className="w-4 h-4 opacity-40" />
                <span className="text-xs font-bold">{slot.label}</span>
                {slot.status === 'occupied' && <div className="w-2 h-2 rounded-full bg-porteo-orange animate-ping" />}
              </motion.div>
            ))}
          </div>

          {/* Road Markings */}
          <div className="absolute top-1/2 left-0 right-0 h-8 border-y border-white/5 border-dashed pointer-events-none -translate-y-1/2 opacity-20" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{t.title}</h2>
            <p className="text-white/40 mt-1">{lang === 'en' ? 'Real-time visibility of yard assets and staging zones' : 'Visibilidad en tiempo real de activos en patio y zonas de staging'}</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-porteo-orange text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              {t.gridView}
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-porteo-orange text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              {t.mapView}
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedStatus('empty')}
            className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <div className="text-left">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">{t.available}</span>
              <span className="text-lg font-bold text-white leading-none">{patioWithTrucks.filter(s => s.status === 'empty').length}</span>
            </div>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedStatus('occupied')}
            className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all"
          >
            <div className="w-3 h-3 rounded-full bg-porteo-orange shadow-[0_0_10px_rgba(242,125,38,0.5)]" />
            <div className="text-left">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">{t.occupied}</span>
              <span className="text-lg font-bold text-white leading-none">{patioWithTrucks.filter(s => s.status === 'occupied').length}</span>
            </div>
          </motion.button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <YardMap />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Parking Area */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <ParkingCircle className="w-5 h-5 text-porteo-orange" />
              <span className="font-serif italic text-sm opacity-60 uppercase tracking-tighter">{t.parking}</span>
            </h3>
            <button 
              onClick={() => onAddSlot?.('parking')}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-porteo-orange transition-all flex items-center gap-1 text-[10px] font-bold uppercase border border-white/5"
            >
              <Plus className="w-3 h-3" />
              {t.add}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filteredPatio.filter(s => s.type === 'parking').map((slot) => (
              <motion.div 
                key={slot.id}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => onSlotClick?.(slot)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${getStatusColor(slot.status)}`}
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-[10px] font-mono font-bold opacity-60 tracking-widest">{slot.label}</span>
                  {slot.status === 'occupied' && <Truck className="w-4 h-4 animate-pulse" />}
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-[9px] uppercase font-bold tracking-widest opacity-40">{t[slot.status as keyof typeof t] || slot.status}</p>
                  {slot.truckId && <p className="text-xs font-mono font-bold text-white">{slot.truckId}</p>}
                </div>
                {/* Visual grid pattern for technical feel */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dock Area */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <Warehouse className="w-5 h-5 text-porteo-orange" />
              <span className="font-serif italic text-sm opacity-60 uppercase tracking-tighter">{t.docks}</span>
            </h3>
            <button 
              onClick={() => onAddSlot?.('dock')}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-porteo-orange transition-all flex items-center gap-1 text-[10px] font-bold uppercase border border-white/5"
            >
              <Plus className="w-3 h-3" />
              {t.add}
            </button>
          </div>
          <div className="space-y-4">
            {filteredPatio.filter(s => s.type === 'dock').map((slot) => (
              <motion.div 
                key={slot.id}
                whileHover={{ x: 4 }}
                onClick={() => onSlotClick?.(slot)}
                className={`p-6 rounded-2xl border flex items-center justify-between transition-all cursor-pointer relative overflow-hidden ${getStatusColor(slot.status)}`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="text-sm font-mono font-bold">{slot.label}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{slot.truckId || (lang === 'en' ? 'Available' : 'Disponible')}</p>
                    <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest">{t[slot.status as keyof typeof t] || slot.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  {slot.status === 'occupied' && (
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <Clock className="w-3 h-3" />
                      45m
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Staging Area */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <MapPin className="w-5 h-5 text-porteo-orange" />
              <span className="font-serif italic text-sm opacity-60 uppercase tracking-tighter">{t.staging}</span>
            </h3>
            <button 
              onClick={() => onAddSlot?.('staging')}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-porteo-orange transition-all flex items-center gap-1 text-[10px] font-bold uppercase border border-white/5"
            >
              <Plus className="w-3 h-3" />
              {t.add}
            </button>
          </div>
          <div className="space-y-4">
            {filteredPatio.filter(s => s.type === 'staging').map((slot) => (
              <motion.div 
                key={slot.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSlotClick?.(slot)}
                className={`p-6 rounded-2xl border flex flex-col gap-4 transition-all cursor-pointer relative overflow-hidden ${getStatusColor(slot.status)}`}
              >
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-sm font-mono font-bold">{slot.label}</span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 opacity-40" />
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{t[slot.status as keyof typeof t] || slot.status}</span>
                  </div>
                </div>
                {slot.status === 'occupied' ? (
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="opacity-40">{t.shipment} #9921</span>
                      <span className="text-white">85% {t.complete}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="bg-porteo-orange h-full shadow-[0_0_8px_rgba(242,125,38,0.4)]" 
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] opacity-40 italic font-serif relative z-10">{lang === 'en' ? 'Ready for next shipment' : 'Listo para siguiente embarque'}</p>
                )}
                <div className="absolute bottom-0 right-0 p-2 opacity-10">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Details Modal for Available/Occupied */}
      <AnimatePresence>
        {selectedStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${selectedStatus === 'empty' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-porteo-orange shadow-[0_0_10px_rgba(242,125,38,0.5)]'}`} />
                  <h3 className="text-xl font-bold text-white">
                    {selectedStatus === 'empty' ? t.available : t.occupied} {lang === 'en' ? 'Slots' : 'Espacios'}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-mono text-white/40 border border-white/10">
                    {modalFilteredSlots.length} {lang === 'en' ? 'Items' : 'Elementos'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedStatus(null);
                    setModalSearch('');
                    setModalTypeFilter('all');
                  }}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Filters */}
              <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-porteo-orange transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'parking', 'dock', 'staging'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setModalTypeFilter(type)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        modalTypeFilter === type 
                          ? 'bg-porteo-orange border-porteo-orange text-white' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      {type === 'all' ? t.allTypes : t[type as keyof typeof t] || type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modalFilteredSlots.map((slot) => {
                    const truckInfo = trucks.find(tk => tk.id === slot.truckId);
                    
                    return (
                      <motion.div 
                        key={slot.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                          setSelectedStatus(null);
                          setModalSearch('');
                          setModalTypeFilter('all');
                          onSlotClick?.(slot);
                        }}
                        className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                              <span className="text-xs font-mono font-bold text-white/60">{slot.label}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{slot.truckId || (lang === 'en' ? 'Available Slot' : 'Espacio Disponible')}</p>
                              <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{t[slot.type as keyof typeof t] || slot.type}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/100 transition-all" />
                        </div>

                        {slot.status === 'occupied' && (
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest mb-1">{t.carrier}</p>
                              <p className="text-xs font-bold text-white/80">{truckInfo?.carrier || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest mb-1">{t.driver}</p>
                              <p className="text-xs font-bold text-white/80">{truckInfo?.driver || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest mb-1">{t.elapsed}</p>
                              <div className="flex items-center gap-2 text-porteo-orange font-mono text-[10px] font-bold">
                                <Clock className="w-3 h-3" />
                                45m
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest mb-1">ETA</p>
                              <p className="text-xs font-bold text-white/80">{truckInfo?.eta || '--:--'}</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {modalFilteredSlots.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-serif italic">{lang === 'en' ? 'No matching slots found' : 'No se encontraron espacios coincidentes'}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                <button 
                  onClick={() => {
                    setSelectedStatus(null);
                    setModalSearch('');
                    setModalTypeFilter('all');
                  }}
                  className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/10"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
