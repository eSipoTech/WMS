import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  Box,
  Truck as PatioIcon,
  Factory,
  RefreshCw,
  ClipboardList,
  X,
  RefreshCw as RefreshIcon,
  Navigation,
  ShieldCheck,
  Cpu,
  Zap,
  ArrowRight,
  TrendingUp,
  Warehouse as WarehouseIcon,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Warehouse3D } from './Warehouse3D';
import { WarehouseOperations } from './WarehouseOperations';
import { PatioManagement } from './PatioManagement';
import { AssemblyLine } from './AssemblyLine';
import { ThreePLWorkflow } from './ThreePLWorkflow';
import { InventoryItem, PatioSlot, TPLProcess, Warehouse } from '../types';

interface WMSProps {
  activeTab?: string;
  lang: 'en' | 'es';
  market: 'USA' | 'MEXICO';
  inventoryItems: InventoryItem[];
  setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  patioSlots: PatioSlot[];
  addNotification: (message: string, type?: 'market' | 'operational' | 'alert' | 'success' | 'info') => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onWarehouseChange: (id: string) => void;
}

export const WMS: React.FC<WMSProps> = ({ 
  activeTab, 
  lang, 
  market, 
  inventoryItems, 
  setInventoryItems,
  patioSlots,
  addNotification,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange
}) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'receiving' | 'picking' | 'shipping' | '3d' | 'ops' | 'patio' | 'assembly' | 'tpl'>('inventory');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [selectedRackDetails, setSelectedRackDetails] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'wms-inventory') setActiveSubTab('inventory');
    if (activeTab === 'wms-3d') setActiveSubTab('3d');
    if (activeTab === 'wms-ops') setActiveSubTab('ops');
    if (activeTab === 'wms-patio') setActiveSubTab('patio');
    if (activeTab === 'wms-assembly') setActiveSubTab('assembly');
    if (activeTab === 'wms-tpl') setActiveSubTab('tpl');
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invRes, orderRes] = await Promise.all([
        fetch(`/api/inventory?market=${market}`),
        fetch('/api/orders')
      ]);
      if (invRes.ok) setInventory(await invRes.json());
      else {
        // Fallback to mock if API fails
        setInventory(market === 'MEXICO' ? [
          { id: '1', sku: 'SKU-001', name: 'Industrial Pallet', qty: 150, bin: 'P-01', warehouse: 'MX-CDMX Hub', market: 'MEXICO' },
          { id: '2', sku: 'SKU-002', name: 'Forklift Battery', qty: 0, bin: 'B-05', warehouse: 'MX-CDMX Hub', market: 'MEXICO' }
        ] : [
          { id: '3', sku: 'SKU-003', name: 'Safety Harness', qty: 85, bin: 'S-12', warehouse: 'USA-TX Hub', market: 'USA' },
          { id: '4', sku: 'SKU-004', name: 'Conveyor Belt', qty: 5, bin: 'C-02', warehouse: 'USA-TX Hub', market: 'USA' }
        ]);
      }
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
  }, [market]);

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

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedItems.size === filteredInventory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredInventory.map(i => i.id)));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">WMS Platform</h1>
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

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10 overflow-x-auto max-w-full">
        {[
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'ops', label: 'Warehouse Ops', icon: ClipboardList },
          { id: '3d', label: '3D View', icon: Box },
          { id: 'patio', label: 'Patio Mgmt', icon: PatioIcon },
          { id: 'assembly', label: 'Assembly', icon: Factory },
          { id: 'tpl', label: '3PL Workflow', icon: RefreshCw },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
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
                      placeholder={lang === 'es' ? "Buscar SKU, Nombre o Bin..." : "Search SKU, Name or Bin..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue/50 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 glass rounded-xl transition-all border border-white/10 ${showFilters ? 'bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                  <button 
                    disabled={selectedItems.size === 0}
                    onClick={() => {
                      toast.success(lang === 'es' ? `${selectedItems.size} artículos procesados` : `${selectedItems.size} items processed`);
                      setSelectedItems(new Set());
                    }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedItems.size > 0 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600' 
                        : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === 'es' ? 'Listo' : 'Done'} {selectedItems.size > 0 ? `(${selectedItems.size})` : ''}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 glass rounded-lg text-porteo-blue border border-white/10"><LayoutGrid className="w-5 h-5" /></button>
                  <button className="p-2 glass rounded-lg text-white/40 border border-white/10"><List className="w-5 h-5" /></button>
                </div>
              </div>
              
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-6 py-4 border-b border-white/5 bg-white/5 grid grid-cols-3 gap-4"
                >
                  <select className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                    <option value="">{lang === 'es' ? 'Todos los Almacenes' : 'All Warehouses'}</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <select className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                    <option value="">{lang === 'es' ? 'Todos los Estatus' : 'All Status'}</option>
                    <option value="in-stock">{lang === 'es' ? 'En Stock' : 'In Stock'}</option>
                    <option value="out-of-stock">{lang === 'es' ? 'Sin Stock' : 'Out of Stock'}</option>
                  </select>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="bg-porteo-blue/20 text-porteo-blue py-2 rounded-lg text-xs font-bold"
                  >
                    {lang === 'es' ? 'Aplicar Filtros' : 'Apply Filters'}
                  </button>
                </motion.div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest font-bold">
                      <th className="px-6 py-4 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.size === filteredInventory.length && filteredInventory.length > 0}
                          onChange={toggleAllSelection}
                          className="rounded border-white/20 bg-white/5 text-porteo-blue focus:ring-porteo-blue"
                        />
                      </th>
                      <th className="px-6 py-4">{lang === 'es' ? 'SKU / Producto' : 'SKU / Product'}</th>
                      <th className="px-6 py-4">{lang === 'es' ? 'Cantidad' : 'Quantity'}</th>
                      <th className="px-6 py-4">{lang === 'es' ? 'Ubicación (Bin)' : 'Location (Bin)'}</th>
                      <th className="px-6 py-4">{lang === 'es' ? 'Almacén' : 'Warehouse'}</th>
                      <th className="px-6 py-4">{lang === 'es' ? 'Estatus' : 'Status'}</th>
                      <th className="px-6 py-4">{lang === 'es' ? 'Acciones' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredInventory.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-white/5 transition-colors group cursor-pointer ${selectedItems.has(item.id) ? 'bg-porteo-blue/5' : ''}`}
                        onClick={() => setSelectedInventoryItem(item)}
                      >
                        <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center w-full h-full">
                            <input 
                              type="checkbox" 
                              checked={selectedItems.has(item.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleItemSelection(item.id);
                              }}
                              className="w-5 h-5 rounded border-white/20 bg-white/5 text-porteo-blue focus:ring-porteo-blue cursor-pointer"
                            />
                          </div>
                        </td>
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
                              {item.qty > 0 ? (lang === 'es' ? 'En Stock' : 'In Stock') : (lang === 'es' ? 'Sin Stock' : 'Out of Stock')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                toast.info(lang === 'es' ? `Auditando ${item.sku}` : `Auditing ${item.sku}`);
                              }}
                              className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white hover:bg-porteo-blue/20 transition-all"
                              title={lang === 'es' ? 'Auditar' : 'Audit'}
                            >
                              <ClipboardList className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                toast.info(lang === 'es' ? `Relocalizando ${item.sku}` : `Relocating ${item.sku}`);
                              }}
                              className={`p-2 bg-white/5 rounded-lg text-white/40 hover:text-white hover:bg-porteo-orange/20 transition-all ${item.qty === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={lang === 'es' ? 'Relocalizar' : 'Relocate'}
                              disabled={item.qty === 0}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-white/40 hover:text-white transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
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

          {activeSubTab === 'ops' && (
            <WarehouseOperations 
              lang={lang} 
              market={market} 
              inventoryItems={inventoryItems} 
              addNotification={addNotification} 
            />
          )}

          {activeSubTab === 'patio' && (
            <PatioManagement 
              lang={lang} 
              patioSlots={patioSlots} 
            />
          )}

          {activeSubTab === 'assembly' && (
            <AssemblyLine 
              lang={lang} 
              inventoryItems={inventoryItems} 
              setInventoryItems={setInventoryItems} 
            />
          )}

          {activeSubTab === 'tpl' && (
            <ThreePLWorkflow 
              lang={lang} 
              addNotification={addNotification} 
              selectedWarehouseId={selectedWarehouseId}
              onWarehouseChange={onWarehouseChange}
              warehouses={warehouses}
              onUpdateStatus={(shipment) => {
                addNotification(lang === 'es' ? `Estatus de envío ${shipment.id} actualizado` : `Shipment ${shipment.id} status updated`, 'success');
              }}
              onViewDocuments={(shipment) => {
                addNotification(lang === 'es' ? `Abriendo documentos para ${shipment.id}` : `Opening documents for ${shipment.id}`, 'info');
              }}
            />
          )}

          {activeSubTab === '3d' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Interactive Warehouse Layout</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Telemetry</span>
                </div>
              </div>
              <Warehouse3D 
                lang={lang} 
                onViewDetails={(details) => setSelectedRackDetails(details)}
                addNotification={(msg, type) => {
                  if (type === 'success') toast.success(msg);
                  else if (type === 'alert') toast.error(msg);
                  else toast.info(msg);
                }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Inventory Item Details Modal */}
      <AnimatePresence>
        {selectedInventoryItem && (
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
                  {lang === 'es' ? 'Detalles del Artículo' : 'Item Details'}
                </h4>
                <button onClick={() => setSelectedInventoryItem(null)} className="p-2 text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-porteo-blue/10 flex items-center justify-center text-porteo-blue text-3xl font-bold">
                    {selectedInventoryItem.sku[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedInventoryItem.name}</h3>
                    <p className="text-white/40 font-mono">{selectedInventoryItem.sku}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Cantidad' : 'Quantity'}</p>
                    <p className="text-xl font-bold text-white">{selectedInventoryItem.qty}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Ubicación' : 'Location'}</p>
                    <p className="text-xl font-bold text-white">{selectedInventoryItem.bin}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Almacén' : 'Warehouse'}</p>
                    <p className="text-xl font-bold text-white">{selectedInventoryItem.warehouse}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Estatus' : 'Status'}</p>
                    <p className={`text-xl font-bold ${selectedInventoryItem.qty > 0 ? 'text-emerald-400' : 'text-porteo-orange'}`}>
                      {selectedInventoryItem.qty > 0 ? (lang === 'es' ? 'En Stock' : 'In Stock') : (lang === 'es' ? 'Sin Stock' : 'Out of Stock')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-white uppercase tracking-widest">{lang === 'es' ? 'Historial de Movimientos' : 'Movement History'}</h5>
                  <div className="space-y-2">
                    {[
                      { date: '2026-03-10', type: 'INBOUND', qty: '+50', user: 'Admin' },
                      { date: '2026-03-08', type: 'PICKING', qty: '-5', user: 'Picker_01' },
                      { date: '2026-03-05', type: 'RELOCATE', qty: '0', user: 'System' },
                    ].map((m, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-white/40">{m.date}</span>
                          <span className={`font-bold ${m.type === 'INBOUND' ? 'text-emerald-500' : m.type === 'PICKING' ? 'text-porteo-orange' : 'text-white/60'}`}>{m.type}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-white">{m.qty}</span>
                          <span className="text-white/20">{m.user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  {selectedInventoryItem.qty === 0 && (
                    <button 
                      onClick={() => {
                        toast.info(lang === 'es' ? 'Orden de reabastecimiento generada' : 'Restock order generated');
                        setSelectedInventoryItem(null);
                      }}
                      className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      {lang === 'es' ? 'Reabastecer' : 'Restock'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      toast.success(lang === 'es' ? 'Etiqueta enviada a impresión' : 'Label sent to printer');
                    }}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    {lang === 'es' ? 'Imprimir Etiqueta' : 'Print Label'}
                  </button>
                  <button 
                    onClick={() => {
                      toast.info(lang === 'es' ? 'Iniciando auditoría...' : 'Starting audit...');
                      setSelectedInventoryItem(null);
                    }}
                    className="flex-1 py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/80 transition-all"
                  >
                    {lang === 'es' ? 'Auditar Artículo' : 'Audit Item'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rack Details Modal (from 3D View) */}
      <AnimatePresence>
        {selectedRackDetails && (
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
                  {lang === 'es' ? `Detalles del Rack ${selectedRackDetails.id}` : `Rack ${selectedRackDetails.id} Details`}
                </h4>
                <button onClick={() => setSelectedRackDetails(null)} className="p-2 text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Ocupación' : 'Occupancy'}</p>
                    <p className="text-xl font-bold text-white">85%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Capacidad' : 'Capacity'}</p>
                    <p className="text-xl font-bold text-white">20 {lang === 'es' ? 'Pallets' : 'Pallets'}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'es' ? 'Zona' : 'Zone'}</p>
                    <p className="text-xl font-bold text-porteo-orange">Picking</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-white uppercase tracking-widest">{lang === 'es' ? 'Contenido del Rack' : 'Rack Content'}</h5>
                  <div className="space-y-2">
                    {inventory.slice(0, 3).map((item, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-porteo-blue/10 flex items-center justify-center text-porteo-blue font-bold">
                            {item.sku[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{item.name}</p>
                            <p className="text-[10px] text-white/40 font-mono">{item.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{item.qty} units</p>
                          <p className="text-[10px] text-white/40">Bin: {item.bin}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      toast.info(lang === 'es' ? 'Iniciando auditoría de rack...' : 'Starting rack audit...');
                      setSelectedRackDetails(null);
                    }}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                  >
                    {lang === 'es' ? 'Auditar Rack' : 'Audit Rack'}
                  </button>
                  <button 
                    onClick={() => {
                      toast.info(lang === 'es' ? 'Optimizando ubicación...' : 'Optimizing location...');
                      setSelectedRackDetails(null);
                    }}
                    className="flex-1 py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/80 transition-all"
                  >
                    {lang === 'es' ? 'Optimizar' : 'Optimize'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
