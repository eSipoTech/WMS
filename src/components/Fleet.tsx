import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Fuel, 
  DollarSign, 
  Activity, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Navigation,
  TrendingUp,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: string;
  costPerKm: number;
}

interface FleetProps {
  activeTab?: string;
}

export const Fleet: React.FC<FleetProps> = ({ activeTab }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'routes' | 'costs'>('tracking');

  useEffect(() => {
    if (activeTab === 'fleet-tracking') setActiveSubTab('tracking');
    if (activeTab === 'fleet-routes') setActiveSubTab('routes');
    if (activeTab === 'fleet-costs') setActiveSubTab('costs');
  }, [activeTab]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/fleet/status');
      if (response.ok) setVehicles(await response.json());
    } catch (error) {
      toast.error('Failed to fetch fleet data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const statusColors: Record<string, string> = {
    'AVAILABLE': 'bg-emerald-400/10 text-emerald-400',
    'ON_ROUTE': 'bg-porteo-blue/10 text-porteo-blue',
    'MAINTENANCE': 'bg-porteo-orange/10 text-porteo-orange',
    'OFFLINE': 'bg-white/5 text-white/40'
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Fleet Management</h1>
          <p className="text-white/60 mt-2">Real-time Vehicle Tracking & KPIs</p>
        </div>
        <button className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20">
          <Plus className="w-5 h-5" />
          Register Unit
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
        {[
          { id: 'tracking', label: 'Live Tracking', icon: MapPin },
          { id: 'routes', label: 'Route Optimization', icon: Navigation },
          { id: 'costs', label: 'Cost Analysis', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeSubTab === tab.id 
                ? 'bg-white/10 text-white shadow-inner' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeSubTab === tab.id ? 'text-porteo-blue' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Units', value: '42', icon: Truck, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10' },
          { label: 'Avg. Cost/Km', value: '$1.35', icon: DollarSign, color: 'text-porteo-orange', bg: 'bg-porteo-orange/10' },
          { label: 'Fuel Efficiency', value: '8.2 km/L', icon: Fuel, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Route Compliance', value: '98.4%', icon: Navigation, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-emerald-400 text-xs font-bold">+1.2%</span>
            </div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Active Fleet</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 glass rounded-lg text-white/40 border border-white/10 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Plate / Model</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Cost/Km</th>
                  <th className="px-6 py-4">Last Location</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold">
                          <Truck className="w-5 h-5 text-porteo-blue" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{vehicle.plate}</p>
                          <p className="text-xs text-white/40 font-mono">{vehicle.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[vehicle.status] || 'bg-white/5 text-white/40'}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-white font-bold">${vehicle.costPerKm}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-white/60">
                        <MapPin className="w-4 h-4 text-porteo-orange" />
                        <span className="text-sm">MX-CDMX Hub</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button className="p-2 text-white/40 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Route Efficiency</h3>
          <div className="space-y-6">
            {[
              { label: 'Fuel Consumption', value: 85, color: 'bg-emerald-400' },
              { label: 'On-Time Delivery', value: 92, color: 'bg-porteo-blue' },
              { label: 'Maintenance Score', value: 78, color: 'bg-porteo-orange' },
              { label: 'Driver Rating', value: 95, color: 'bg-purple-400' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white/60">{item.label}</span>
                  <span className="text-white">{item.value}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${item.color}`} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-porteo-blue/10 rounded-2xl border border-porteo-blue/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-porteo-blue/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-porteo-blue" />
              </div>
              <h4 className="text-sm font-bold text-white">AI Optimization</h4>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              AI suggests rerouting 4 units to avoid traffic in CDMX North Zone. Estimated fuel savings: 12%.
            </p>
            <button className="mt-4 w-full py-2 bg-porteo-blue text-white text-xs font-bold rounded-lg hover:bg-porteo-blue/90 transition-all">
              Apply Optimization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
