import React from 'react';
import { motion } from 'motion/react';
import { 
  Truck, 
  ParkingCircle, 
  Warehouse, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { PatioSlot } from '../types';
import { MOCK_PATIO } from '../constants';

interface PatioManagementProps {
  lang: 'en' | 'es';
  searchQuery?: string;
  trucks?: any[];
}

export const PatioManagement: React.FC<PatioManagementProps> = ({ lang, searchQuery = '', trucks = [] }) => {
  const t = {
    title: lang === 'en' ? 'Patio & Yard Management' : 'Gestión de Patio y Patio',
    parking: lang === 'en' ? 'Parking Slots' : 'Cajones de Estacionamiento',
    docks: lang === 'en' ? 'Loading Docks' : 'Muelles de Carga',
    staging: lang === 'en' ? 'Staging Areas' : 'Áreas de Staging',
    status: lang === 'en' ? 'Status' : 'Estatus'
  };

  const getStatusColor = (status: PatioSlot['status']) => {
    switch (status) {
      case 'empty': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'occupied': return 'bg-porteo-orange/10 text-porteo-orange border-porteo-orange/20';
      case 'reserved': return 'bg-porteo-blue/10 text-porteo-blue border-porteo-blue/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  // Merge mock patio with real trucks if they have dock assignments
  const patioWithTrucks = MOCK_PATIO.map(slot => {
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

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{t.title}</h2>
          <p className="text-white/40 mt-1">{lang === 'en' ? 'Real-time visibility of yard assets and staging zones' : 'Visibilidad en tiempo real de activos en patio y zonas de staging'}</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-white/60">{lang === 'en' ? 'Available' : 'Disponible'}: 12</span>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-porteo-orange" />
            <span className="text-sm text-white/60">{lang === 'en' ? 'Occupied' : 'Ocupado'}: 8</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Parking Area */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <ParkingCircle className="w-5 h-5 text-porteo-orange" />
            {t.parking}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {filteredPatio.filter(s => s.type === 'parking').map((slot) => (
              <motion.div 
                key={slot.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-3xl border transition-all ${getStatusColor(slot.status)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest">{slot.label}</span>
                  {slot.status === 'occupied' && <Truck className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold opacity-60">{slot.status}</p>
                  {slot.truckId && <p className="text-xs font-bold">{slot.truckId}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dock Area */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-porteo-orange" />
            {t.docks}
          </h3>
          <div className="space-y-4">
            {filteredPatio.filter(s => s.type === 'dock').map((slot) => (
              <div 
                key={slot.id}
                className={`p-6 rounded-[32px] border flex items-center justify-between transition-all ${getStatusColor(slot.status)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <span className="text-sm font-bold">{slot.label}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{slot.truckId || (lang === 'en' ? 'Available' : 'Disponible')}</p>
                    <p className="text-[10px] opacity-60 uppercase font-bold">{slot.status}</p>
                  </div>
                </div>
                {slot.status === 'occupied' && (
                  <div className="flex items-center gap-2 text-[10px] font-bold bg-white/5 px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    45m
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Staging Area */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <MapPin className="w-5 h-5 text-porteo-orange" />
            {t.staging}
          </h3>
          <div className="space-y-4">
            {filteredPatio.filter(s => s.type === 'staging').map((slot) => (
              <div 
                key={slot.id}
                className={`p-6 rounded-[32px] border flex flex-col gap-4 transition-all ${getStatusColor(slot.status)}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">{slot.label}</span>
                  <span className="text-[10px] font-bold uppercase">{slot.status}</span>
                </div>
                {slot.status === 'occupied' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="opacity-60">Shipment #9921</span>
                      <span className="font-bold">85% Complete</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-porteo-orange h-full w-[85%]" />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs opacity-60 italic">{lang === 'en' ? 'Ready for next shipment' : 'Listo para siguiente embarque'}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
