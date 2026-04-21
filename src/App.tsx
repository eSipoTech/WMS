import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useAuthStore } from './store';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ControlTower } from './components/ControlTower';
import { WMS } from './components/WMS';
import { CRM } from './components/CRM';
import { Fleet } from './components/Fleet';
import { AI } from './components/AI';
import { Chat } from './components/Chat';
import { AdminPanel } from './components/AdminPanel';
import { WarehouseOperations } from './components/WarehouseOperations';
import { Warehouse3D } from './components/Warehouse3D';
import { PatioManagement } from './components/PatioManagement';
import { AssemblyLine } from './components/AssemblyLine';
import { ThreePLWorkflow } from './components/ThreePLWorkflow';
import { CommercialManagement } from './components/CommercialManagement';
import { TPLBilling } from './components/TPLBilling';
import { AdvancedLogistics } from './components/AdvancedLogistics';
import { NotificationCenter } from './components/NotificationCenter';
import { IntelligenceAgents } from './components/IntelligenceAgents';
import { StrategicResearch } from './components/StrategicResearch';
import { Financials } from './components/Financials';
import { Analytics } from './components/Analytics';
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
import { 
  MOCK_WAREHOUSES, 
  MOCK_INVENTORY_MEXICO, 
  MOCK_INVENTORY_USA,
  MOCK_PATIO, 
  MOCK_NOTIFICATIONS 
} from './constants';
import { 
  Warehouse, 
  InventoryItem, 
  PatioSlot, 
  WMSNotification 
} from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState<'en' | 'es'>('es');
  const [market, setMarket] = useState<'USA' | 'MEXICO'>('MEXICO');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(MOCK_INVENTORY_MEXICO);
  const [patioSlots, setPatioSlots] = useState<PatioSlot[]>(MOCK_PATIO);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(MOCK_WAREHOUSES[0].id);
  const [notifications, setNotifications] = useState<WMSNotification[]>(MOCK_NOTIFICATIONS);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  useEffect(() => {
    if (market === 'MEXICO') {
      setLang('es');
      setInventoryItems(MOCK_INVENTORY_MEXICO);
      const mexWh = MOCK_WAREHOUSES.find(w => w.market === 'MEXICO');
      if (mexWh) setSelectedWarehouseId(mexWh.id);
    } else {
      setLang('en');
      setInventoryItems(MOCK_INVENTORY_USA);
      const usaWh = MOCK_WAREHOUSES.find(w => w.market === 'USA');
      if (usaWh) setSelectedWarehouseId(usaWh.id);
    }
  }, [market]);

  const addNotification = (message: string, type: 'operational' | 'alert' | 'success' | 'info' = 'info') => {
    const newNotification: WMSNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title: { en: message, es: message },
      description: { en: message, es: message },
      type: type as any,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    toast[type === 'alert' ? 'error' : type === 'operational' ? 'info' : type](message, {
      description: message,
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success(lang === 'es' ? 'Notificaciones limpiadas' : 'Notifications cleared');
  };

  const exportReport = (title: string, data: any) => {
    try {
      let csvContent = "";
      if (Array.isArray(data)) {
        if (data.length > 0) {
          const keys = Object.keys(data[0]);
          csvContent = keys.join(',') + '\n' + data.map(row => 
            keys.map(key => JSON.stringify(row[key])).join(',')
          ).join('\n');
        } else {
          csvContent = "No data available";
        }
      } else {
        // Handle object with multiple datasets
        Object.entries(data).forEach(([key, value]) => {
          csvContent += `--- ${key.toUpperCase()} ---\n`;
          if (Array.isArray(value) && value.length > 0) {
            const keys = Object.keys(value[0]);
            csvContent += keys.join(',') + '\n' + value.map(row => 
              keys.map(k => JSON.stringify((row as any)[k])).join(',')
            ).join('\n') + '\n\n';
          } else {
            csvContent += JSON.stringify(value) + '\n\n';
          }
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      a.download = `${title.replace(/\s+/g, '_')}_Report.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      toast.success(lang === 'es' ? `${title} exportado correctamente` : `${title} exported successfully`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const setMarketAndLang = (m: 'USA' | 'MEXICO') => {
    setMarket(m);
    setLang(m === 'MEXICO' ? 'es' : 'en');
  };

  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <Login />
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab.startsWith('wms')) return (
      <WMS 
        activeTab={activeTab}
        lang={lang}
        market={market}
        inventoryItems={inventoryItems}
        setInventoryItems={setInventoryItems}
        patioSlots={patioSlots}
        setPatioSlots={setPatioSlots}
        addNotification={addNotification}
        warehouses={warehouses}
        selectedWarehouseId={selectedWarehouseId}
        onWarehouseChange={setSelectedWarehouseId}
      />
    );

    // Commercial Sub-tabs
    if (activeTab === 'crm') return <CRM lang={lang} market={market} />;
    if (activeTab === 'comm-mgmt') return <CommercialManagement lang={lang} market={market} />;
    if (activeTab === 'tpl-billing') return <TPLBilling lang={lang} market={market} warehouse={warehouses.find(w => w.id === selectedWarehouseId)} addNotification={addNotification} />;

    // Fleet Sub-tabs
    if (activeTab.startsWith('fleet')) return <Fleet activeTab={activeTab} lang={lang} />;
    if (activeTab === 'adv-logistics') return <AdvancedLogistics lang={lang} warehouse={warehouses.find(w => w.id === selectedWarehouseId)} addNotification={addNotification} />;

    // AI Sub-tabs
    if (activeTab === 'ai-platform') return <AI lang={lang} />;
    if (activeTab === 'intel-agents') return <IntelligenceAgents lang={lang} />;
    if (activeTab === 'strategic-res') return (
      <StrategicResearch 
        lang={lang} 
        market={market} 
        setActiveTab={setActiveTab} 
        addNotification={addNotification}
        inventoryItems={inventoryItems}
        warehouses={warehouses}
      />
    );

    if (activeTab === 'analytics') return (
      <Analytics 
        lang={lang} 
        financialData={[
          { name: 'Jan', revenue: 4000, cost: 2400, profit: 1600, pallets: 12000, occupancy: 80, trucks: 20, temp: 18, accuracy: 98, lines: 250 },
          { name: 'Feb', revenue: 3000, cost: 1398, profit: 1602, pallets: 12500, occupancy: 82, trucks: 22, temp: 18, accuracy: 97, lines: 265 },
          { name: 'Mar', revenue: 2000, cost: 9800, profit: -7800, pallets: 13000, occupancy: 85, trucks: 25, temp: 19, accuracy: 99, lines: 280 },
          { name: 'Apr', revenue: 2780, cost: 3908, profit: -1128, pallets: 12800, occupancy: 84, trucks: 24, temp: 18, accuracy: 98.5, lines: 275 },
          { name: 'May', revenue: 1890, cost: 4800, profit: -2910, pallets: 12400, occupancy: 83, trucks: 23, temp: 18, accuracy: 99.2, lines: 290 },
          { name: 'Jun', revenue: 2390, cost: 3800, profit: -1410, pallets: 12600, occupancy: 84, trucks: 24, temp: 18, accuracy: 98.8, lines: 285 },
        ]}
        pieData={[
          { name: 'Labor', value: 400 },
          { name: 'Storage', value: 300 },
          { name: 'Utilities', value: 300 },
          { name: 'Last Mile', value: 200 },
        ]}
        colors={['#F27D26', '#3b82f6', '#10b981', '#ef4444']}
        exportReport={exportReport}
        addNotification={addNotification}
      />
    );

    switch (activeTab) {
      case 'dashboard': return <Dashboard lang={lang} market={market} setMarket={setMarketAndLang} setActiveTab={setActiveTab} />;
      case 'control-tower': return <ControlTower setActiveTab={setActiveTab} market={market} lang={lang} />;
      case 'finance': return (
        <Financials 
          lang={lang} 
          financialData={[
            { name: 'Jan', revenue: 4000, cost: 2400, profit: 1600 },
            { name: 'Feb', revenue: 3000, cost: 1398, profit: 1602 },
            { name: 'Mar', revenue: 2000, cost: 9800, profit: -7800 },
            { name: 'Apr', revenue: 2780, cost: 3908, profit: -1128 },
            { name: 'May', revenue: 1890, cost: 4800, profit: -2910 },
            { name: 'Jun', revenue: 2390, cost: 3800, profit: -1410 },
          ]}
          pieData={[
            { name: 'Labor', value: 400 },
            { name: 'Storage', value: 300 },
            { name: 'Utilities', value: 300 },
            { name: 'Last Mile', value: 200 },
          ]}
          colors={['#F27D26', '#3b82f6', '#10b981', '#ef4444']}
          addNotification={(msg) => toast.info(msg)}
        />
      );
      case 'chat': return <Chat />;
      case 'admin': return <AdminPanel warehouses={warehouses} market={market} setMarket={setMarket} lang={lang} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-porteo-blue/30 relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} market={market} setMarket={setMarketAndLang} lang={lang} />
      
      {/* Notification Bell */}
      <div className="fixed top-8 right-8 z-50 flex items-center gap-4">
        <button 
          onClick={() => setIsNotificationCenterOpen(true)}
          className="relative p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
        >
          <Activity className="w-6 h-6 text-porteo-blue group-hover:scale-110 transition-transform" />
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-porteo-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#050505]">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
      </div>

      <NotificationCenter 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        lang={lang}
        notifications={notifications}
        onDismiss={dismissNotification}
        onClearAll={clearAllNotifications}
        addNotification={addNotification}
      />

      <main className="flex-1 p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' ? (
              <Dashboard 
                lang={lang} 
                market={market} 
                setMarket={setMarket} 
                setActiveTab={setActiveTab} 
              />
            ) : renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster position="top-right" theme="dark" richColors closeButton />
    </div>
  );
}
