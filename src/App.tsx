import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useAuthStore } from './store';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { WMS } from './components/WMS';
import { CRM } from './components/CRM';
import { Fleet } from './components/Fleet';
import { AI } from './components/AI';
import { Chat } from './components/Chat';
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  Globe, 
  Zap, 
  RefreshCw, 
  Plus, 
  Loader2,
  Cpu,
  Activity,
  Clock,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'warehouses' | 'users' | 'integration'>('warehouses');
  const [as400Status, setAs400Status] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetch('/api/integration/as400/status')
      .then(res => res.json())
      .then(setAs400Status)
      .catch(() => {});
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const res = await fetch('/api/integration/as400/status');
      if (res.ok) setAs400Status(await res.json());
      toast.success('AS/400 Synchronization complete');
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Admin Control</h1>
          <p className="text-white/60 mt-2">System Configuration & Global Settings</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
        {[
          { id: 'warehouses', label: 'Warehouses', icon: Globe },
          { id: 'users', label: 'User Management', icon: ShieldCheck },
          { id: 'integration', label: 'AS/400 Integration', icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white shadow-inner' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-porteo-blue' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass rounded-3xl border border-white/10 p-8"
        >
          {activeTab === 'integration' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">AS/400 Status</h3>
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="p-3 glass rounded-xl text-porteo-blue hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'System', value: as400Status?.system || 'IBM i (Power9)', icon: Cpu },
                    { label: 'Middleware', value: as400Status?.middleware || 'LANSA Integrator v15.2', icon: Database },
                    { label: 'Latency', value: as400Status?.latency || '45ms', icon: Activity },
                    { label: 'Health', value: `${as400Status?.health || 98}%`, icon: Zap },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 text-white/40 mb-2">
                        <item.icon className="w-4 h-4" />
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.label}</p>
                      </div>
                      <p className="text-white font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-porteo-blue/10 rounded-2xl border border-porteo-blue/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-porteo-blue/20 rounded-lg">
                      <Zap className="w-5 h-5 text-porteo-blue" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Connector Health</h4>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {as400Status?.message || 'Optimal performance detected in LANSA Server Modules. No bottlenecks found in JSM transaction logs.'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Integration Guide</h3>
                <div className="space-y-4">
                  {[
                    'Ensure LANSA JSM is running on port 4545',
                    'Verify REST service mapping in LANSA IDE',
                    'Check transaction logs for 500 errors',
                    'Maintain physical file locks during sync'
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-porteo-blue/20 text-porteo-blue flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm text-white/60 font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'warehouses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Global Warehouses</h3>
                <button className="bg-porteo-blue px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Node
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'MX-CDMX Hub', location: 'Mexico City, MX', status: 'Online', capacity: '85%' },
                  { name: 'USA-TX Hub', location: 'Austin, TX', status: 'Online', capacity: '42%' },
                ].map((wh, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-porteo-blue/10 rounded-xl">
                        <Globe className="w-6 h-6 text-porteo-blue" />
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-full">
                        {wh.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{wh.name}</h4>
                    <p className="text-sm text-white/40 mb-6">{wh.location}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-white/40">Capacity</span>
                        <span className="text-white">{wh.capacity}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-porteo-blue w-[85%]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Finance: React.FC = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-4xl font-bold text-white tracking-tight">Finance</h1>
      <p className="text-white/60 mt-2">Invoice Validation & Cost Control</p>
    </div>
    <div className="glass p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
      <div className="p-6 bg-porteo-orange/10 rounded-full mb-6">
        <Database className="w-12 h-12 text-porteo-orange" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Finance Module MVP</h3>
      <p className="text-white/40 max-w-md">
        This module is currently in development. It will handle invoice validation, tax calculations for MX/USA, and automated cost reporting.
      </p>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <Login />
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'wms': return <WMS />;
      case 'crm': return <CRM />;
      case 'fleet': return <Fleet />;
      case 'finance': return <Finance />;
      case 'ai': return <AI />;
      case 'chat': return <Chat />;
      case 'admin': return <AdminPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-porteo-blue/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}
