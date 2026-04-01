import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  LayoutGrid,
  List,
  Scan,
  Printer,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  qty: number;
  bin: string;
  warehouse: string;
}

interface Order {
  id: string;
  type: 'INBOUND' | 'OUTBOUND';
  status: string;
  items: { sku: string; qty: number }[];
}

export const WMS: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'receiving' | 'picking' | 'shipping'>('inventory');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invRes, orderRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/orders') // This might fail if not implemented, but we have mock in server.ts
      ]);
      if (invRes.ok) setInventory(await invRes.json());
      // For orders, we'll use mock if API fails
      if (orderRes.ok) setOrders(await orderRes.json());
      else setOrders([
        { id: 'ORD-001', type: 'INBOUND', status: 'PENDING', items: [{ sku: 'SKU-001', qty: 50 }] },
        { id: 'ORD-002', type: 'OUTBOUND', status: 'PICKING', items: [{ sku: 'SKU-002', qty: 5 }] }
      ]);
    } catch (error) {
      toast.error('Failed to fetch WMS data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReceive = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const response = await fetch('/api/wms/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, items: order?.items }),
      });
      if (response.ok) {
        toast.success('Order received and inventory updated');
        fetchData();
      }
    } catch (error) {
      toast.error('Receiving failed');
    }
  };

  const handlePick = async (orderId: string) => {
    try {
      const response = await fetch('/api/wms/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (response.ok) {
        toast.success('Order picked and ready for shipping');
        fetchData();
      }
    } catch (error) {
      toast.error('Picking failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">WMS Core</h1>
          <p className="text-white/60 mt-2">Warehouse Management & Logistics Flow</p>
        </div>
        <div className="flex gap-4">
          <button className="glass px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10">
            <Scan className="w-5 h-5 text-porteo-blue" />
            Scan Barcode
          </button>
          <button className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20">
            <Plus className="w-5 h-5" />
            New Order
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
        {[
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'receiving', label: 'Receiving', icon: ArrowDownLeft },
          { id: 'picking', label: 'Picking', icon: ArrowUpRight },
          { id: 'shipping', label: 'Shipping', icon: Clock },
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'inventory' && (
            <div className="glass rounded-3xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Search SKU, Name or Bin..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue/50"
                    />
                  </div>
                  <button className="p-3 glass rounded-xl text-white/60 hover:text-white border border-white/10">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 glass rounded-lg text-porteo-blue border border-white/10"><LayoutGrid className="w-5 h-5" /></button>
                  <button className="p-2 glass rounded-lg text-white/40 border border-white/10"><List className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">SKU / Product</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Location (Bin)</th>
                      <th className="px-6 py-4">Warehouse</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-porteo-blue/10 flex items-center justify-center text-porteo-blue font-bold">
                              {item.sku[0]}
                            </div>
                            <div>
                              <p className="text-white font-bold">{item.name}</p>
                              <p className="text-xs text-white/40 font-mono">{item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-lg font-bold ${item.qty < 20 ? 'text-porteo-orange' : 'text-white'}`}>
                            {item.qty}
                          </span>
                          <span className="text-xs text-white/40 ml-2">units</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-white font-mono text-sm">
                            {item.bin}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-white/60 font-medium">{item.warehouse}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.qty > 0 ? 'bg-emerald-400' : 'bg-porteo-orange'}`} />
                            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                              {item.qty > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
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
          )}

          {activeSubTab === 'receiving' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.filter(o => o.type === 'INBOUND').map((order) => (
                <div key={order.id} className="glass p-6 rounded-3xl border border-white/10 hover:border-porteo-blue/50 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-emerald-400/10 rounded-2xl">
                      <ArrowDownLeft className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'PENDING' ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-400/10 text-emerald-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{order.id}</h3>
                  <p className="text-sm text-white/40 mb-6">Inbound Shipment • Supplier A</p>
                  
                  <div className="space-y-3 mb-8">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-sm text-white/60 font-mono">{item.sku}</span>
                        <span className="text-sm font-bold text-white">{item.qty} units</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleReceive(order.id)}
                    disabled={order.status === 'COMPLETED'}
                    className="w-full py-4 bg-white/5 hover:bg-emerald-400 hover:text-white rounded-2xl text-white/60 font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-white/10 disabled:opacity-50"
                  >
                    {order.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : <Scan className="w-5 h-5" />}
                    {order.status === 'COMPLETED' ? 'Received' : 'Process Receiving'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSubTab === 'picking' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.filter(o => o.type === 'OUTBOUND').map((order) => (
                <div key={order.id} className="glass p-6 rounded-3xl border border-white/10 hover:border-porteo-orange/50 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-porteo-orange/10 rounded-2xl">
                      <ArrowUpRight className="w-6 h-6 text-porteo-orange" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'PICKING' ? 'bg-amber-400/10 text-amber-400' : 'bg-porteo-blue/10 text-porteo-blue'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{order.id}</h3>
                  <p className="text-sm text-white/40 mb-6">Outbound Order • Customer X</p>
                  
                  <div className="space-y-3 mb-8">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-sm text-white/60 font-mono">{item.sku}</span>
                        <span className="text-sm font-bold text-white">{item.qty} units</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handlePick(order.id)}
                    disabled={order.status === 'SHIPPING'}
                    className="w-full py-4 bg-white/5 hover:bg-porteo-orange hover:text-white rounded-2xl text-white/60 font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-white/10 disabled:opacity-50"
                  >
                    {order.status === 'SHIPPING' ? <CheckCircle2 className="w-5 h-5" /> : <Scan className="w-5 h-5" />}
                    {order.status === 'SHIPPING' ? 'Picked' : 'Start Picking'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
