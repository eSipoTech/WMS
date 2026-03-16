import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  Box as BoxIcon, 
  BarChart3, 
  Users, 
  Truck, 
  Thermometer, 
  Settings, 
  Globe, 
  Search, 
  Bell, 
  ChevronRight,
  ChevronDown,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
  Map as MapIcon,
  MapPin,
  Warehouse as WarehouseIcon,
  DollarSign,
  Cpu,
  Zap,
  Info,
  X,
  Layout,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Download,
  Upload,
  Activity,
  ArrowRight,
  FileText,
  ExternalLink,
  Move,
  RefreshCw,
  Clock,
  Globe2,
  LogOut,
  Bot,
  Database,
  BrainCircuit,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import * as XLSX from 'xlsx';
import { Warehouse3D } from './components/Warehouse3D';
import { AIAssistant } from './components/AIAssistant';
import { TPLWorkflow } from './components/TPLWorkflow';
import { IntelligenceAgents } from './components/IntelligenceAgents';
import { CommercialManagement } from './components/CommercialManagement';
import { WarehouseOperations } from './components/WarehouseOperations';
import { NotificationCenter } from './components/NotificationCenter';
import { StrategicResearch } from './components/StrategicResearch';
import { PatioManagement } from './components/PatioManagement';
import { AssemblyLine } from './components/AssemblyLine';
import { Analytics } from './components/Analytics';
import { Financials } from './components/Financials';
import { translations, Market, Language, Warehouse, InventoryItem, TPLProcess, WMSNotification, Contract } from './types';
import { MOCK_WAREHOUSES, MOCK_INVENTORY, MOCK_TPL_PROCESSES, PORTEO_COLORS, MOCK_NOTIFICATIONS } from './constants';
import { getMarketResearch } from './services/geminiService';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import ReactMarkdown from 'react-markdown';

const FINANCIAL_DATA = [
  { name: 'Jan', cost: 4000, revenue: 6400, profit: 2400, pallets: 1200 },
  { name: 'Feb', cost: 3000, revenue: 5398, profit: 2398, pallets: 1150 },
  { name: 'Mar', cost: 2000, revenue: 9800, profit: 7800, pallets: 1400 },
  { name: 'Apr', cost: 2780, revenue: 3908, profit: 1128, pallets: 1250 },
  { name: 'May', cost: 1890, revenue: 4800, profit: 2910, pallets: 1300 },
  { name: 'Jun', cost: 2390, revenue: 3800, profit: 1410, pallets: 1350 },
  { name: 'Jul', cost: 3490, revenue: 4300, profit: 810, pallets: 1280 },
];

const PIE_DATA = [
  { name: 'Storage', value: 400 },
  { name: 'Labor', value: 300 },
  { name: 'Utilities', value: 100 },
  { name: 'Last Mile', value: 200 },
];

const COLORS = ['#004A99', '#F27D26', '#00AEEF', '#1A1A1A'];

export default function App() {
  const [market, setMarket] = useState<Market>('USA');
  const [activeTab, setActiveTab] = useState('control-tower');
  const [isAiHubOpen, setIsAiHubOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(warehouses[0] || null);

  // Ensure selected warehouse matches market
  useEffect(() => {
    const marketWarehouses = warehouses.filter(w => w.market === market);
    if (marketWarehouses.length > 0) {
      if (!selectedWarehouse || selectedWarehouse.market !== market) {
        setSelectedWarehouse(marketWarehouses[0]);
      }
    } else {
      setSelectedWarehouse(null);
    }
  }, [market, warehouses, selectedWarehouse?.market]);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<WMSNotification[]>(MOCK_NOTIFICATIONS);
  
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    fileName: string;
    sheets: { name: string; data: any[] }[];
    activeSheetIndex: number;
  } | null>(null);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});
  const [importTargetType, setImportTargetType] = useState<'inventory' | 'warehouse' | 'truck'>('inventory');
  const [importConfidence, setImportConfidence] = useState(0);

  const handleGlobalDataImport = (file: File) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets = workbook.SheetNames.map(name => {
          const sheet = workbook.Sheets[name];
          // Try to find the actual header row if there's metadata at the top
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          
          if (jsonData.length === 0) return { name, data: [] };

          // Find the first row that looks like a header (has multiple non-empty cells)
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
            const row = jsonData[i];
            const filledCells = row.filter(cell => cell !== null && cell !== undefined && cell !== '').length;
            if (filledCells > 2) {
              headerRowIndex = i;
              break;
            }
          }

          // Re-parse with the detected header row
          const finalData = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex });
          return { name, data: finalData };
        }).filter(s => s.data && s.data.length > 0);

        if (sheets.length === 0) {
          addNotification(lang === 'en' ? 'No valid data found in file.' : 'No se encontraron datos válidos en el archivo.', 'alert');
          setIsImporting(false);
          return;
        }

        setImportPreview({
          fileName: file.name,
          sheets,
          activeSheetIndex: 0
        });
        
        // Auto-detect type based on sheet names or content
        const firstSheet = sheets[0];
        const firstRow = firstSheet.data[0] || {};
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());
        
        // Smarter detection
        const isInventory = keys.some(k => k.includes('sku') || k.includes('part') || k.includes('item') || k.includes('inventario') || k.includes('qty') || k.includes('cant'));
        const isWarehouse = keys.some(k => k.includes('warehouse') || k.includes('almacen') || k.includes('plant') || k.includes('ubicacion') || k.includes('capacity'));
        const isTruck = keys.some(k => k.includes('truck') || k.includes('driver') || k.includes('plate') || k.includes('carrier') || k.includes('camion') || k.includes('chofer') || k.includes('placa'));

        if (isTruck) {
          setImportTargetType('truck');
        } else if (isWarehouse) {
          setImportTargetType('warehouse');
        } else {
          setImportTargetType('inventory'); // Default to inventory
        }

        setActiveModal('import-mapping');
      } catch (err) {
        console.error('Error reading file:', err);
        addNotification(lang === 'en' ? 'Error reading file.' : 'Error al leer el archivo.', 'alert');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Optimized Auto-mapping logic
  useEffect(() => {
    if (importPreview) {
      const activeSheet = importPreview?.sheets?.[importPreview?.activeSheetIndex || 0];
      const firstRow = activeSheet?.data?.[0] || {};
      const columns = Object.keys(firstRow);
      const newMapping: Record<string, string> = {};
      
      const targetFields = importTargetType === 'inventory' 
        ? ['sku', 'name', 'quantity', 'unit', 'location', 'palletId', 'customer', 'brand', 'category', 'oemNumber']
        : importTargetType === 'warehouse'
        ? ['name', 'location', 'market', 'capacity']
        : ['id', 'carrier', 'type', 'driver', 'status', 'dock', 'eta'];
        
      const fieldKeywords: Record<string, string[]> = {
        sku: ['sku', 'code', 'codigo', 'part', 'parte', 'id', 'referencia', 'ref', 'item code'],
        name: ['name', 'nombre', 'description', 'descripcion', 'item', 'product', 'articulo', 'producto', 'desc'],
        quantity: ['quantity', 'cantidad', 'stock', 'qty', 'amount', 'unidades', 'piezas', 'count'],
        unit: ['unit', 'unidad', 'uom', 'medida', 'um'],
        location: ['location', 'ubicacion', 'bin', 'slot', 'posicion', 'pasillo', 'rack'],
        palletId: ['pallet', 'tarima', 'lpn', 'license', 'huella', 'contenedor', 'pallet id'],
        customer: ['customer', 'cliente', 'owner', 'client', 'propietario', 'business'],
        brand: ['brand', 'marca', 'manufacturer', 'fabricante'],
        category: ['category', 'categoria', 'family', 'familia', 'group', 'grupo'],
        oemNumber: ['oem', 'original', 'num_oem', 'oem number'],
        market: ['market', 'mercado', 'country', 'pais', 'region', 'location'],
        capacity: ['capacity', 'capacidad', 'size', 'volumen', 'm2', 'sqm', 'max'],
        id: ['id', 'truck id', 'unit id', 'economico', 'numero'],
        carrier: ['carrier', 'transportista', 'linea', 'empresa', 'company'],
        type: ['type', 'tipo', 'vehicle', 'vehiculo', 'size'],
        driver: ['driver', 'chofer', 'conductor', 'operator', 'operador'],
        status: ['status', 'estado', 'estatus', 'condition'],
        dock: ['dock', 'muelle', 'andén', 'gate', 'puerta'],
        eta: ['eta', 'arrival', 'llegada', 'time', 'hora']
      };

      let matchedCount = 0;
      targetFields.forEach(field => {
        const keywords = fieldKeywords[field] || [field];
        // Try exact match first
        let match = columns.find(col => keywords.some(kw => col.toLowerCase() === kw.toLowerCase()));
        
        // Then try partial match
        if (!match) {
          match = columns.find(col => keywords.some(kw => col.toLowerCase().includes(kw.toLowerCase())));
        }

        if (match) {
          newMapping[field] = match;
          matchedCount++;
        }
      });

      setImportMapping(newMapping);
      setImportConfidence(Math.round((matchedCount / targetFields.length) * 100));
    }
  }, [importPreview?.activeSheetIndex, importTargetType]);

  const executeMappedImport = async () => {
    if (!importPreview) return;
    
    setIsProcessing(true);
    // Small delay to show loading state and let UI update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const activeSheet = importPreview?.sheets?.[importPreview?.activeSheetIndex || 0];
      const data = activeSheet?.data || [];
      
      if (importTargetType === 'inventory') {
        const newInventory: InventoryItem[] = data.map((row: any, idx) => {
          const getVal = (field: string) => {
            const col = importMapping[field];
            return col ? row[col] : undefined;
          };

          return {
            id: `inv-mapped-${Date.now()}-${idx}`,
            sku: String(getVal('sku') || `SKU-${idx}`),
            name: String(getVal('name') || `Item ${idx}`),
            quantity: parseFloat(String(getVal('quantity'))) || 0,
            unit: String(getVal('unit') || 'units'),
            location: String(getVal('location') || 'Unassigned'),
            palletId: String(getVal('palletId') || `PAL-${idx}`),
            customer: String(getVal('customer') || 'Unknown'),
            brand: String(getVal('brand') || ''),
            category: (String(getVal('category') || 'Other') as 'Engine' | 'Brakes' | 'Suspension' | 'Electrical' | 'Body' | 'Other'),
            oemNumber: String(getVal('oemNumber') || '')
          };
        });
        
        setInventoryItems(prev => [...prev, ...newInventory]);
        addNotification(lang === 'en' ? `Imported ${newInventory.length} items.` : `Importados ${newInventory.length} artículos.`, 'success');
        
        // If no warehouse is selected, try to select the first one or create a default one
        if (!selectedWarehouse) {
          if (warehouses.length > 0) {
            setSelectedWarehouse(warehouses[0]);
          } else {
            // Create a default warehouse if none exists to allow viewing inventory
            const defaultWH: Warehouse = {
              id: 'wh-default',
              name: 'Default Warehouse',
              location: 'Main Facility',
              market: market,
              capacity: 100000,
              currentOccupancy: 0,
              temperature: 20,
              status: 'optimal',
              layout: { racks: { rows: 5, cols: 8 }, docks: 4, zones: [] }
            };
            setWarehouses([defaultWH]);
            setSelectedWarehouse(defaultWH);
            addNotification(lang === 'en' ? 'Created default warehouse for imported inventory.' : 'Se creó un almacén predeterminado para el inventario importado.', 'info');
          }
        }
      } else if (importTargetType === 'warehouse') {
        const newWarehouses: Warehouse[] = data.map((row: any, idx) => {
          const getVal = (field: string) => {
            const col = importMapping[field];
            return col ? row[col] : undefined;
          };

          return {
            id: `wh-mapped-${Date.now()}-${idx}`,
            name: String(getVal('name') || `Warehouse ${idx}`),
            location: String(getVal('location') || 'Unknown'),
            market: (String(getVal('market') || '').toUpperCase().includes('MEX') ? 'MEXICO' : 'USA') as Market,
            capacity: parseInt(String(getVal('capacity'))) || 50000,
            currentOccupancy: 0,
            temperature: 20,
            status: 'optimal',
            layout: {
              racks: { rows: 5, cols: 8 },
              docks: 4,
              zones: []
            }
          };
        });
        
        setWarehouses(prev => {
          const updated = [...prev, ...newWarehouses];
          if (!selectedWarehouse && updated.length > 0) {
            setSelectedWarehouse(updated[0]);
          }
          return updated;
        });
        addNotification(lang === 'en' ? `Imported ${newWarehouses.length} warehouses.` : `Importados ${newWarehouses.length} almacenes.`, 'success');
      } else if (importTargetType === 'truck') {
        const newTrucks = data.map((row: any, idx) => {
          const getVal = (field: string) => {
            const col = importMapping[field];
            return col ? row[col] : undefined;
          };

          return {
            id: String(getVal('id') || `TRK-IMP-${idx}`),
            carrier: String(getVal('carrier') || 'Unknown'),
            type: String(getVal('type') || 'Full Truck'),
            driver: String(getVal('driver') || 'Unknown'),
            status: String(getVal('status') || 'Waiting'),
            dock: String(getVal('dock') || '-'),
            eta: String(getVal('eta') || '00:00'),
            idling: Math.random() > 0.5
          };
        });
        
        setTrucks(prev => [...prev, ...newTrucks]);
        addNotification(lang === 'en' ? `Imported ${newTrucks.length} trucks.` : `Importados ${newTrucks.length} camiones.`, 'success');
      }
      
      setActiveModal('import-success');
      setImportPreview(null);
      setImportMapping({});
    } catch (error) {
      console.error('Import error:', error);
      addNotification(lang === 'en' ? 'Error during import execution.' : 'Error durante la ejecución de la importación.', 'alert');
    } finally {
      setIsProcessing(false);
    }
  };

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [drillDownStat, setDrillDownStat] = useState<string | null>(null);
  const [drillDownView, setDrillDownView] = useState<'current' | 'average' | 'peak' | 'trend'>('trend');
  const [financialFilter, setFinancialFilter] = useState('revenue');
  const [financialSubFilter, setFinancialSubFilter] = useState({
    warehouse: 'all',
    customer: 'all',
    type: 'sqm2'
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'layout' | 'master-data'>('layout');
  const [optimizationLogs, setOptimizationLogs] = useState<{id: string, msg: string, time: string}[]>([]);
  const [marketInsights, setMarketInsights] = useState<string>('');
  
  const addNotification = (msg: string, type: 'market' | 'operational' | 'alert' | 'success' | 'info' = 'operational') => {
    const newNotif: WMSNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: { en: 'System Update', es: 'Actualización del Sistema' },
      description: { en: msg, es: msg },
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const lang: Language = market === 'USA' ? 'en' : 'es';
  const t = translations[lang];

  // Operational State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [inventoryLocationFilter, setInventoryLocationFilter] = useState('all');
  const [inventoryPage, setInventoryPage] = useState(1);
  const itemsPerPage = 25;
  const [tplProcesses, setTplProcesses] = useState<TPLProcess[]>(MOCK_TPL_PROCESSES);
  const [selectedTplShipment, setSelectedTplShipment] = useState<TPLProcess | null>(null);
  const [trucks, setTrucks] = useState([
    { id: 'TRK-001', carrier: 'Swift', type: 'Full Truck', driver: 'John Doe', status: 'In Yard', dock: 'Dock 4', eta: '08:00', idling: true },
    { id: 'TRK-002', carrier: 'Schneider', type: 'Thorton', driver: 'Jane Smith', status: 'Unloading', dock: 'Dock 2', eta: '09:15', idling: false },
    { id: 'TRK-003', carrier: 'Werner', type: '3.5 Van', driver: 'Bob Wilson', status: 'Waiting', dock: '-', eta: '10:30', idling: true },
    { id: 'TRK-004', carrier: 'Swift', type: 'Full Truck', driver: 'Alice Brown', status: 'Waiting', dock: '-', eta: '11:00', idling: true },
  ]);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(w => w.market === market);
  }, [warehouses, market]);

  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trucks, searchQuery]);

  // Computed Analytics Data
  const totalPallets = useMemo(() => {
    return inventoryItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [inventoryItems]);

  const totalCapacity = useMemo(() => {
    return warehouses.reduce((acc, wh) => acc + wh.capacity, 0);
  }, [warehouses]);

  const occupancyPercentage = useMemo(() => {
    if (totalCapacity === 0) return 0;
    return Math.round((totalPallets / totalCapacity) * 100);
  }, [totalPallets, totalCapacity]);

  const activeTrucksCount = trucks.length;

  const dynamicFinancialData = useMemo(() => {
    // In a real app, this would be derived from actual transactions
    // For now, we'll use the base data but maybe scale it slightly based on inventory
    const scale = 1 + (inventoryItems.length / 100);
    return FINANCIAL_DATA.map(d => ({
      ...d,
      revenue: Math.round(d.revenue * scale),
      cost: Math.round(d.cost * scale),
      profit: Math.round((d.revenue - d.cost) * scale)
    }));
  }, [inventoryItems]);

  const dynamicPieData = useMemo(() => {
    // Derive from inventory categories
    const categories: Record<string, number> = {};
    inventoryItems.forEach(item => {
      const cat = item.category || 'Other';
      categories[cat] = (categories[cat] || 0) + item.quantity;
    });
    
    const data = Object.entries(categories).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : PIE_DATA;
  }, [inventoryItems]);

  const dynamicCostData = useMemo(() => {
    // Scale base PIE_DATA by inventory volume
    const scale = 1 + (inventoryItems.length / 100);
    return PIE_DATA.map(d => ({
      ...d,
      value: Math.round(d.value * scale)
    }));
  }, [inventoryItems]);

  const [carriers, setCarriers] = useState([
    { name: 'Swift', score: 98, trend: '+2%', status: 'On Time', phone: '+1-555-0101' },
    { name: 'Schneider', score: 94, trend: '-1%', status: 'On Time', phone: '+1-555-0102' },
    { name: 'Werner', score: 89, trend: '+5%', status: 'Late', phone: '+1-555-0103' },
  ]);

  const [gateEntryForm, setGateEntryForm] = useState({
    truckId: '',
    driverName: '',
    carrier: 'swift',
    loadType: 'ftl',
    appointmentTime: '',
    gateAssignment: 'g1'
  });

  // New Modal States
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [aiTasks, setAiTasks] = useState([
    { id: 'TASK-01', task: 'Reassign Dock 2 to TRK-902', priority: 'High', impact: '+15% Speed', desc: 'Dock 2 is currently underutilized while Dock 4 has a queue. Reassigning TRK-902 will balance the load.' },
    { id: 'TASK-02', task: 'Relocate SKU-004 to Zone A', priority: 'Medium', impact: '-10% Travel', desc: 'SKU-004 has high picking frequency. Moving it closer to the packing station will reduce travel time.' },
    { id: 'TASK-03', task: 'Adjust Night Shift Staffing', priority: 'High', impact: '+8% Productivity', desc: 'Projected volume for tonight is 20% higher. Adding 2 temporary staff members is recommended.' },
    { id: 'TASK-04', task: 'Update Slotting for Seasonal Items', priority: 'Low', impact: '+5% Space', desc: 'Seasonal items are currently taking up prime locations. Relocating them to upper racks will free up floor space.' },
    { id: 'TASK-05', task: 'Optimize Forklift Routes', priority: 'Medium', impact: '-12% Energy', desc: 'Forklift traffic in Zone B is congested. AI suggests a one-way traffic flow to improve safety and speed.' },
    { id: 'TASK-06', task: 'Consolidate Partial Pallets', priority: 'Low', impact: '+18% Capacity', desc: 'Multiple partial pallets of SKU-992 are scattered. Consolidating them will free up 4 rack positions.' },
    { id: 'TASK-07', task: 'Pre-stage High Priority Shipments', priority: 'High', impact: '-20m Lead Time', desc: 'Upcoming shipments for Customer X are high priority. Pre-staging them in Zone S will expedite loading.' }
  ]);
  // Update AI Tasks dynamically based on data
  useEffect(() => {
    if (selectedWarehouse) {
      const occupancy = (selectedWarehouse.currentOccupancy / selectedWarehouse.capacity) * 100;
      const newTasks = [...aiTasks];
      
      if (occupancy > 90) {
        newTasks[0] = { 
          id: 'TASK-01', 
          task: lang === 'en' ? 'Critical Space Optimization' : 'Optimización Crítica de Espacio', 
          priority: 'High', 
          impact: '+12% Capacity', 
          desc: lang === 'en' ? `Warehouse is at ${occupancy.toFixed(1)}% capacity. AI recommends immediate consolidation of partial pallets in Zone B.` : `El almacén está al ${occupancy.toFixed(1)}% de capacidad. La IA recomienda la consolidación inmediata de pallets parciales en la Zona B.` 
        };
      }
      
      const lowStockItems = inventoryItems.filter(i => i.quantity < 50);
      if (lowStockItems.length > 0) {
        newTasks[1] = {
          id: 'TASK-02',
          task: lang === 'en' ? `Restock ${lowStockItems.length} Low Items` : `Reabastecer ${lowStockItems.length} Artículos Bajos`,
          priority: 'Medium',
          impact: 'Avoid OOS',
          desc: lang === 'en' ? `Detected ${lowStockItems.length} items with stock below safety threshold. Recommend generating replenishment orders.` : `Se detectaron ${lowStockItems.length} artículos con stock por debajo del umbral de seguridad. Se recomienda generar órdenes de reabastecimiento.`
        };
      }

      setAiTasks(newTasks);
    }
  }, [selectedWarehouse, inventoryItems.length, lang]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [cfoQuery, setCfoQuery] = useState('');
  const [cfoChat, setCfoChat] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [ecommerceIntegrations, setEcommerceIntegrations] = useState([
    { name: 'Amazon FBA', status: 'connected' },
    { name: 'Shopify', status: 'connected' },
    { name: 'Walmart Marketplace', status: 'connected' },
    { name: 'FedEx API', status: 'connected' }
  ]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [isSyncingSystems, setIsSyncingSystems] = useState(false);
  const [isInventoryCompact, setIsInventoryCompact] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedRackDetails, setSelectedRackDetails] = useState<any>(null);
  const [external3DAction, setExternal3DAction] = useState<{ type: 'audit' | 'relocate', rackId: string, timestamp: number } | null>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRegisteredOrders, setShowRegisteredOrders] = useState(false);
  const [laborAdvice, setLaborAdvice] = useState<string>('');
  const [isLaborAdviceLoading, setIsLaborAdviceLoading] = useState(false);
  const [slottingAdvice, setSlottingAdvice] = useState<string>('');
  const [isSlottingLoading, setIsSlottingLoading] = useState(false);
  const [complianceAudit, setComplianceAudit] = useState<string>('');
  const [isComplianceLoading, setIsComplianceLoading] = useState(false);
  const [cargoPrediction, setCargoPrediction] = useState<string>('');
  const [isCargoLoading, setIsCargoLoading] = useState(false);
  const [realTimeAlerts, setRealTimeAlerts] = useState<string[]>([]);
  const [isAlertsLoading, setIsAlertsLoading] = useState(false);
  const [selectedSubItem, setSelectedSubItem] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [modalLevel, setModalLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gpsDevices, setGpsDevices] = useState([
    { id: 'GPS-001', model: 'Geotab GO9', status: 'active', location: 'Laredo, TX', signal: 'Strong' },
    { id: 'GPS-002', model: 'Samsara VG54', status: 'active', location: 'Monterrey, NL', signal: 'Excellent' },
    { id: 'GPS-003', model: 'CalAmp LMU-3030', status: 'standby', location: 'Houston, TX', signal: 'Fair' }
  ]);
  const [cctvStreams, setCctvStreams] = useState([
    { id: 'CAM-01', area: 'Main Gate', status: 'online', protocol: 'RTSP/AES-256' },
    { id: 'CAM-02', area: 'Loading Dock A', status: 'online', protocol: 'RTSP/AES-256' },
    { id: 'CAM-03', area: 'High Value Zone', status: 'online', protocol: 'RTSP/AES-256' }
  ]);
  const [dataPackets, setDataPackets] = useState([
    { id: 'PKT-001', type: 'Inventory Sync', size: '124KB', time: 'Just now' },
    { id: 'PKT-002', type: 'Order Update', size: '45KB', time: '12s ago' },
    { id: 'PKT-003', type: 'Master Data', size: '2.1MB', time: '45s ago' }
  ]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedHub, setSelectedHub] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isProtocolVerified, setIsProtocolVerified] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [isMovingPallet, setIsMovingPallet] = useState(false);

  const handleMovePallet = () => {
    if (!selectedInventoryItem || !newLocation) return;
    
    setIsMovingPallet(true);
    setTimeout(() => {
      setInventoryItems(prev => prev.map(item => 
        item.id === selectedInventoryItem.id ? { ...item, location: newLocation } : item
      ));
      addNotification(lang === 'en' 
        ? `Pallet ${selectedInventoryItem.palletId} moved to ${newLocation}` 
        : `Pallet ${selectedInventoryItem.palletId} movido a ${newLocation}`, 'success');
      setIsMovingPallet(false);
      setActiveModal(null);
      setNewLocation('');
    }, 1500);
  };
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterCustomer, setOrderFilterCustomer] = useState('all');
  const [orderFilterWarehouse, setOrderFilterWarehouse] = useState('all');
  const [truckSearchQuery, setTruckSearchQuery] = useState('');
  const [truckStatusFilter, setTruckStatusFilter] = useState('all');
  const [selectedCarrier, setSelectedCarrier] = useState<any>(null);
  const [activeGateTab, setActiveGateTab] = useState<'internal' | 'third-party'>('third-party');

  // Dynamic Alerts for Control Tower
  useEffect(() => {
    const alerts = [
      lang === 'en' ? "Dock 4: Unloading delay detected (15m)" : "Muelle 4: Retraso de descarga detectado (15m)",
      lang === 'en' ? "Zone B: Temperature variance in Cold Storage (+0.5°C)" : "Zona B: Variación de temperatura en Almacén Frío (+0.5°C)",
      lang === 'en' ? "System: SAP ERP sync completed successfully" : "Sistema: Sincronización SAP ERP completada con éxito",
      lang === 'en' ? "Security: Unauthorized gate entry attempt blocked" : "Seguridad: Intento de entrada no autorizada bloqueado",
      lang === 'en' ? "AI: Slotting optimization recommended for Zone A" : "IA: Optimización de slotting recomendada para Zona A"
    ];
    
    setRealTimeAlerts([alerts[0], alerts[1]]);
    
    const interval = setInterval(() => {
      setRealTimeAlerts(prev => {
        const nextAlert = alerts[Math.floor(Math.random() * alerts.length)];
        if (prev.includes(nextAlert)) return prev;
        return [nextAlert, ...prev].slice(0, 3);
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, [lang]);

  const exportReport = (title: string, data: any) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addNotification(lang === 'en' ? 'Report exported successfully!' : '¡Reporte exportado con éxito!', 'operational');
  };

  useEffect(() => {
    if (activeModal === 'labor-optimization') {
      setIsLaborAdviceLoading(true);
      const shiftData = [
        { name: 'Morning', value: 94 },
        { name: 'Afternoon', value: 88 },
        { name: 'Night', value: 76 }
      ];
      import('./services/geminiService').then(m => {
        m.getLaborAdvice(shiftData, lang).then(advice => {
          setLaborAdvice(advice);
          setIsLaborAdviceLoading(false);
        });
      });
    }
    if (activeModal === 'slotting-ai') {
      setIsSlottingLoading(true);
      import('./services/geminiService').then(m => {
        m.getSlottingAdvice(inventoryItems, lang).then(advice => {
          setSlottingAdvice(advice);
          setIsSlottingLoading(false);
        });
      });
    }
    if (activeModal === 'cargo-visibility' && modalLevel === 2 && selectedSubItem) {
      setIsCargoLoading(true);
      const history = [
        { id: 'TRK-801', route: 'Laredo-Monterrey', time: '4.5h', status: 'delivered' },
        { id: 'TRK-802', route: 'Laredo-Monterrey', time: '5.2h', status: 'delayed' }
      ];
      import('./services/geminiService').then(m => {
        m.getCargoPrediction(selectedSubItem, history, lang).then(prediction => {
          setCargoPrediction(prediction);
          setIsCargoLoading(false);
        });
      });
    }
  }, [activeModal, lang, inventoryItems, modalLevel, selectedSubItem]);

  // Real-time alerts monitor
  useEffect(() => {
    const interval = setInterval(() => {
      const operationalData = {
        activeShipments: tplProcesses.length,
        warehouseOccupancy: selectedWarehouse?.currentOccupancy || 0,
        systemHealth: 'optimal'
      };
      import('./services/geminiService').then(m => {
        m.getRealTimeAlerts(operationalData, lang).then(alertsText => {
          const alerts = alertsText.split('\n').filter(a => a.trim().length > 0);
          setRealTimeAlerts(alerts);
        });
      });
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [lang, tplProcesses, selectedWarehouse]);

  // Dynamic Data Packets Simulation
  useEffect(() => {
    if (activeModal === 'interop-hub' && modalLevel === 2) {
      const interval = setInterval(() => {
        const types = ['Inventory Sync', 'Order Update', 'Master Data', 'Telemetry', 'Handshake', 'ACK'];
        const newPacket = {
          id: `PKT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          type: types[Math.floor(Math.random() * types.length)],
          size: `${(Math.random() * 5).toFixed(1)}MB`,
          time: 'Just now'
        };
        setDataPackets(prev => [newPacket, ...prev.slice(0, 4)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeModal, modalLevel]);

  useEffect(() => {
    if (activeTab === 'admin') {
      setEditingWarehouse(selectedWarehouse);
    }
  }, [activeTab, selectedWarehouse]);

  const [newWarehouseData, setNewWarehouseData] = useState<Partial<Warehouse>>({
    name: '',
    location: '',
    capacity: 50000,
    layout: {
      racks: { rows: 5, cols: 8 },
      docks: 4,
      zones: []
    }
  });

  useEffect(() => {
    getMarketResearch().then(setMarketInsights);
  }, []);

  const toggleMarket = () => {
    setMarket(prev => prev === 'USA' ? 'MEXICO' : 'USA');
  };

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['warehouse']);

  const menuCategories = [
    {
      id: 'warehouse',
      label: lang === 'en' ? 'Warehouse' : 'Almacén',
      icon: <WarehouseIcon className="w-5 h-5" />,
      items: [
        { id: 'operations', icon: <BoxIcon className="w-4 h-4" />, label: t.operations },
        { id: 'inventory', icon: <Package className="w-4 h-4" />, label: t.inventory },
        { id: 'map3d', icon: <MapIcon className="w-4 h-4" />, label: t.map3d },
      ]
    },
    {
      id: 'logistics',
      label: lang === 'en' ? 'Logistics' : 'Logística',
      icon: <Truck className="w-5 h-5" />,
      items: [
        { id: 'patio', icon: <Truck className="w-4 h-4" />, label: t.truckManagement },
        { id: 'tpl', icon: <Activity className="w-4 h-4" />, label: t.tpl },
        { id: 'assembly', icon: <Cpu className="w-4 h-4" />, label: t.assemblyLine },
      ]
    },
    {
      id: 'commercial',
      label: lang === 'en' ? 'Commercial' : 'Comercial',
      icon: <DollarSign className="w-5 h-5" />,
      items: [
        { id: 'commercial', icon: <DollarSign className="w-4 h-4" />, label: t.commercial },
        { id: 'research', icon: <Globe2 className="w-4 h-4" />, label: t.strategicResearch },
      ]
    },
    {
      id: 'intelligence',
      label: lang === 'en' ? 'Intelligence' : 'Inteligencia',
      icon: <Bot className="w-5 h-5" />,
      items: [
        { id: 'control-tower', icon: <Cpu className="w-4 h-4" />, label: t.controlTower },
        { id: 'analytics', icon: <BarChart3 className="w-4 h-4" />, label: t.analytics },
        { id: 'intelligence-agents', icon: <Bot className="w-4 h-4" />, label: t.intelligenceAgents },
      ]
    },
    {
      id: 'admin',
      label: lang === 'en' ? 'Administration' : 'Administración',
      icon: <Settings className="w-5 h-5" />,
      items: [
        { id: 'financials', icon: <DollarSign className="w-4 h-4" />, label: t.financials },
        { id: 'personnel', icon: <Users className="w-4 h-4" />, label: t.personnel },
        { id: 'admin', icon: <Settings className="w-4 h-4" />, label: lang === 'en' ? 'System Admin' : 'Admin del Sistema' },
      ]
    }
  ];

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const stats = [
    { id: 'pallets', label: lang === 'en' ? 'Total Pallets' : 'Total de Pallets', value: '12,450', trend: '+12%', icon: <BoxIcon /> },
    { id: 'occupancy', label: lang === 'en' ? 'Occupancy' : 'Ocupación', value: '84%', trend: '+2%', icon: <Layers /> },
    { id: 'trucks', label: lang === 'en' ? 'Active Trucks' : 'Camiones Activos', value: '24', trend: '-5%', icon: <Truck /> },
    { id: 'temp', label: lang === 'en' ? 'Avg Temp' : 'Temp Promedio', value: '18°C', trend: 'Stable', icon: <Thermometer /> },
  ];

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = 
        item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.customer.toLowerCase().includes(inventorySearch.toLowerCase());
      
      const matchesCategory = inventoryCategoryFilter === 'all' || item.category === inventoryCategoryFilter;
      const matchesLocation = inventoryLocationFilter === 'all' || item.location === inventoryLocationFilter;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [inventorySearch, inventoryCategoryFilter, inventoryLocationFilter, inventoryItems]);

  const paginatedInventory = useMemo(() => {
    const start = (inventoryPage - 1) * itemsPerPage;
    return filteredInventory.slice(start, start + itemsPerPage);
  }, [filteredInventory, inventoryPage]);

  const totalInventoryPages = Math.ceil(filteredInventory.length / itemsPerPage);

  useEffect(() => {
    setInventoryPage(1);
  }, [inventorySearch, inventoryCategoryFilter, inventoryLocationFilter]);

  return (
    <div className="flex h-screen bg-[#050505] font-sans selection:bg-porteo-orange/30 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-[#0A0A0A] z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-porteo-orange rounded-xl flex items-center justify-center shadow-lg shadow-porteo-orange/20">
            <WarehouseIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight text-lg">Porteo <span className="text-porteo-orange">WMS</span></h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono">Enterprise v2026</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto scrollbar-hide">
          {menuCategories.map((category) => (
            <div key={category.id} className="space-y-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-3 px-4 py-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest"
              >
                {category.icon}
                <span>{category.label}</span>
                <ChevronDown className={`ml-auto w-3 h-3 transition-transform ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence initial={false}>
                {expandedCategories.includes(category.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1"
                  >
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                          activeTab === item.id 
                          ? 'bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20' 
                          : 'text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className={`${activeTab === item.id ? 'text-white' : 'text-white/40 group-hover:text-porteo-orange'} transition-colors`}>
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {activeTab === item.id && (
                          <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={toggleMarket}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-porteo-orange/50 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-porteo-orange" />
              <span className="text-xs font-medium text-white/70">{market}</span>
            </div>
            <span className="text-[10px] text-white/40 group-hover:text-white">{t.marketToggle}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-porteo-orange/50 transition-all">
              <Search className="w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder={lang === 'en' ? "Search SKU, Pallet, Truck..." : "Buscar SKU, Pallet, Camión..."}
                className="bg-transparent border-none focus:ring-0 text-sm text-white w-64 placeholder:text-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <WarehouseIcon className="w-4 h-4 text-porteo-orange" />
              <select 
                className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
                value={selectedWarehouse?.id || ''}
                onChange={(e) => {
                  const wh = warehouses.find(w => w.id === e.target.value);
                  if (wh) setSelectedWarehouse(wh);
                }}
              >
                {filteredWarehouses.length > 0 ? (
                  filteredWarehouses.map(wh => (
                    <option key={wh.id} value={wh.id} className="bg-slate-900">{wh.name}</option>
                  ))
                ) : (
                  <option value="" className="bg-slate-900">{lang === 'en' ? 'No Warehouses' : 'Sin Almacenes'}</option>
                )}
              </select>
            </div>
            
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 text-white/60 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-porteo-orange rounded-full border-2 border-[#050505]" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10 relative">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">Alex Camacho</p>
                <p className="text-[10px] text-white/40 uppercase tracking-tighter">Director of Logistics</p>
              </div>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-porteo-blue to-porteo-orange p-[1px] hover:scale-105 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Alex`} alt="Avatar" referrerPolicy="no-referrer" />
                </div>
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <p className="text-sm font-bold text-white">Alex Camacho</p>
                        <p className="text-[10px] text-white/40">acamacho@pilotplus.club</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                          <Users className="w-4 h-4" />
                          {lang === 'en' ? 'Profile' : 'Perfil'}
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                          <Settings className="w-4 h-4" />
                          {lang === 'en' ? 'Settings' : 'Configuración'}
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                          <Activity className="w-4 h-4" />
                          {lang === 'en' ? 'Activity Log' : 'Registro de Actividad'}
                        </button>
                        <div className="h-px bg-white/5 my-2" />
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-500 hover:bg-rose-500/10 transition-colors">
                          <LogOut className="w-4 h-4" />
                          {lang === 'en' ? 'Sign Out' : 'Cerrar Sesión'}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {!selectedWarehouse && activeTab !== 'admin' && activeTab !== 'intelligence-agents' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <WarehouseIcon className="w-12 h-12 text-white/20" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{lang === 'en' ? 'No Data Available' : 'No hay datos disponibles'}</h3>
                <p className="text-white/40 mt-2 max-w-md">
                  {lang === 'en' 
                    ? 'The system is currently empty. Please import your warehouse and inventory data to begin.' 
                    : 'El sistema está actualmente vacío. Por favor importe sus datos de almacén e inventario para comenzar.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.xlsx,.xls,.csv';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) handleGlobalDataImport(file);
                    };
                    input.click();
                  }}
                  disabled={isImporting}
                  className="px-8 py-4 bg-porteo-orange text-white rounded-2xl font-bold shadow-xl shadow-porteo-orange/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {lang === 'en' ? (isImporting ? 'Importing...' : 'Import Data Now') : (isImporting ? 'Importando...' : 'Importar Datos Ahora')}
                </button>
                
                <button 
                  onClick={() => {
                    setWarehouses(MOCK_WAREHOUSES);
                    setInventoryItems(MOCK_INVENTORY);
                    setSelectedWarehouse(MOCK_WAREHOUSES[0]);
                    setMarket(MOCK_WAREHOUSES[0].market);
                    addNotification(lang === 'en' ? 'Sample data loaded successfully!' : '¡Datos de muestra cargados con éxito!', 'operational');
                  }}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                  {lang === 'en' ? 'Load Sample Data' : 'Cargar Datos de Muestra'}
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'control-tower' && selectedWarehouse && (
              <motion.div 
                key="control-tower"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                      {lang === 'en' ? 'Control Tower' : 'Torre de Control'}
                    </h2>
                    <p className="text-white/40 mt-1">
                      {selectedWarehouse.name} • {selectedWarehouse.location}
                    </p>
                  </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setActiveModal('inbound')}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {lang === 'en' ? 'Inbound' : 'Entrada'}
                      </button>
                      <button 
                        onClick={() => setActiveModal('outbound')}
                        className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-sm font-bold hover:bg-porteo-orange/90 transition-colors shadow-lg shadow-porteo-orange/20 flex items-center gap-2"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        {lang === 'en' ? 'Outbound' : 'Salida'}
                      </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* AI Control Tower Insights */}
                    <div className="glass p-6 rounded-3xl border-l-4 border-porteo-orange">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-porteo-orange/20 rounded-lg text-porteo-orange">
                            <Cpu className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-white">AI Control Tower</h3>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">ML Active</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {realTimeAlerts.length > 0 ? (
                          realTimeAlerts.map((alert, i) => (
                            <div key={i} className="p-4 bg-porteo-orange/5 rounded-2xl border border-porteo-orange/10 animate-in fade-in slide-in-from-bottom-2">
                              <p className="text-sm text-white/80 leading-relaxed">
                                {alert}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-porteo-orange/5 rounded-2xl border border-porteo-orange/10">
                            <p className="text-sm text-white/80 leading-relaxed">
                              {lang === 'en' 
                                ? "Optimization alert: Dock 4 is currently underutilized. Redirecting incoming shipment #TRK-902 to balance load." 
                                : "Alerta de optimización: El muelle 4 está subutilizado. Redirigiendo el envío entrante #TRK-902 para equilibrar la carga."}
                            </p>
                          </div>
                        )}
                        <button 
                          onClick={() => {
                            setIsOptimizing(true);
                            const newLog = {
                              id: Math.random().toString(36).substr(2, 9),
                              msg: lang === 'en' ? 'AI Optimization: Optimized slotting in Zone A' : 'Optimización IA: Slotting optimizado en Zona A',
                              time: new Date().toLocaleTimeString()
                            };
                            setTimeout(() => {
                              setIsOptimizing(false);
                              setOptimizationLogs(prev => [newLog, ...prev]);
                              addNotification(lang === 'en' ? 'Warehouse optimization complete! 12% efficiency gain projected.' : '¡Optimización de almacén completa! Se proyecta un 12% de ganancia en eficiencia.', 'operational');
                            }, 2000);
                          }}
                          disabled={isOptimizing}
                          className="w-full py-3 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isOptimizing ? (
                            <Activity className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                          {lang === 'en' ? (isOptimizing ? 'Optimizing...' : 'Optimize Now') : (isOptimizing ? 'Optimizando...' : 'Optimizar Ahora')}
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity / Registered Orders */}
                    <div className="glass p-8 rounded-3xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <Activity className="w-6 h-6 text-porteo-orange" />
                          {lang === 'en' ? 'Recent Operations' : 'Operaciones Recientes'}
                        </h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowRegisteredOrders(true)}
                            className="text-xs font-bold text-porteo-orange hover:underline uppercase tracking-widest"
                          >
                            {lang === 'en' ? 'View All Orders' : 'Ver Todas las Órdenes'}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {tplProcesses.slice(0, 3).map((process, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              setSelectedTplShipment(process);
                              setActiveModal('update-status');
                            }}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-orange/50 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg transition-colors ${process.status === 'collection' ? 'bg-porteo-orange/20 text-porteo-orange group-hover:bg-porteo-orange group-hover:text-white' : 'bg-porteo-blue/20 text-porteo-blue group-hover:bg-porteo-blue group-hover:text-white'}`}>
                                <Truck className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-porteo-orange transition-colors">{process.truckId} - {process.customer}</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">{process.truckType} • {process.origin} → {process.destination}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${process.status === 'collection' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-porteo-blue/10 text-porteo-blue'}`}>
                                {process.status}
                              </span>
                              <p className="text-[10px] text-white/40 mt-1">{new Date().toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Intelligent Inventory & Cargo Management */}
                      <div className="glass p-6 rounded-3xl border-l-4 border-porteo-orange">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-porteo-orange" />
                          {lang === 'en' ? 'Intelligent Inventory' : 'Gestión Inteligente'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setActiveModal('cargo-visibility')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-porteo-orange/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-porteo-orange uppercase">{t.cargoVisibility}</p>
                            <p className="text-[10px] text-white/40">Real-time tracking</p>
                          </button>
                          <button onClick={() => setActiveModal('slotting-ai')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-porteo-orange/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-porteo-orange uppercase">Slotting AI</p>
                            <p className="text-[10px] text-white/40">Storage optimization</p>
                          </button>
                        </div>
                      </div>

                      {/* Interoperability & Data Flow */}
                      <div className="glass p-6 rounded-3xl border-l-4 border-porteo-blue">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-porteo-blue" />
                          {lang === 'en' ? 'Data Interoperability' : 'Interoperabilidad'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setActiveModal('interop-hub')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-porteo-blue/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-porteo-blue uppercase">{t.interoperabilityHub}</p>
                            <p className="text-[10px] text-white/40">System integration</p>
                          </button>
                          <button onClick={() => setActiveTab('tpl')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-porteo-blue/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-porteo-blue uppercase">3PL Workflow</p>
                            <p className="text-[10px] text-white/40">Digital flow</p>
                          </button>
                        </div>
                      </div>

                      {/* Port & Logistics Security */}
                      <div className="glass p-6 rounded-3xl border-l-4 border-rose-500">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-rose-500" />
                          {lang === 'en' ? 'Logistics Security' : 'Seguridad Logística'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setActiveModal('risk-assessment')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-rose-500/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-rose-500 uppercase">{t.riskAssessment}</p>
                            <p className="text-[10px] text-white/40">Operational risk</p>
                          </button>
                          <button onClick={() => setActiveModal('secure-docs')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-rose-500/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-rose-500 uppercase">{t.secureDocs}</p>
                            <p className="text-[10px] text-white/40">Encrypted vault</p>
                          </button>
                        </div>
                      </div>

                      {/* Planning & Predictive Analytics */}
                      <div className="glass p-6 rounded-3xl border-l-4 border-emerald-500">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-emerald-500" />
                          {lang === 'en' ? 'Predictive Planning' : 'Planificación'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setActiveModal('predictive-analytics')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase">{t.predictiveAnalytics}</p>
                            <p className="text-[10px] text-white/40">Rotation analysis</p>
                          </button>
                          <button onClick={() => setActiveModal('port-city-sync')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase">{t.portCitySync}</p>
                            <p className="text-[10px] text-white/40">Route optimization</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* System Health Legend (Interactive Stats) */}
                    <div className="glass p-6 rounded-3xl">
                      <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest opacity-40">System Health</h4>
                      <div className="space-y-4">
                        <button 
                          onClick={() => setActiveModal('ai-tasks')}
                          className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-porteo-orange rounded-full animate-pulse" />
                            <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest">{aiTasks.length} {lang === 'en' ? 'Pending AI Tasks' : 'Tareas IA Pendientes'}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </button>
                        <button 
                          onClick={() => setActiveModal('market-hubs')}
                          className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-porteo-blue rounded-full" />
                            <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest">3 Active Market Hubs</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </button>
                        <button 
                          onClick={() => setActiveModal('efficiency-report')}
                          className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest">10% Efficiency Gain</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </button>
                      </div>
                    </div>

                    {/* Market Specific Features Section */}
                    <div className="glass p-6 rounded-3xl border-t-4 border-porteo-blue">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <Globe className="w-5 h-5 text-porteo-blue" />
                        {market === 'USA' ? 'US Operations' : 'Operaciones MX'}
                      </h3>
                      <div className="space-y-4">
                        {market === 'USA' ? (
                          <>
                            <div 
                              onClick={() => setActiveModal('labor-optimization')}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-blue/50 transition-all cursor-pointer"
                            >
                              <p className="text-[10px] font-bold text-porteo-blue uppercase mb-1">{t.laborOptimization}</p>
                              <p className="text-xs text-white/70">LMS tracking & benchmarks.</p>
                            </div>
                            <div 
                              onClick={() => setActiveModal('ecommerce-integration')}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-blue/50 transition-all cursor-pointer"
                            >
                              <p className="text-[10px] font-bold text-porteo-blue uppercase mb-1">{t.ecommerceIntegration}</p>
                              <p className="text-xs text-white/70">Carrier API links.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div 
                              onClick={() => addNotification(lang === 'en' ? 'Opening Carta Porte Generator...' : 'Abriendo Generador de Carta Porte...', 'operational')}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-blue/50 transition-all cursor-pointer"
                            >
                              <p className="text-[10px] font-bold text-porteo-blue uppercase mb-1">{t.cartaPorte}</p>
                              <p className="text-xs text-white/70">CFDI Carta Porte.</p>
                            </div>
                            <div 
                              onClick={() => addNotification(lang === 'en' ? 'Opening IMMEX Control Panel...' : 'Abriendo Panel de Control IMMEX...', 'operational')}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-blue/50 transition-all cursor-pointer"
                            >
                              <p className="text-[10px] font-bold text-porteo-blue uppercase mb-1">{t.immex}</p>
                              <p className="text-xs text-white/70">Anexo 24 Control.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && selectedWarehouse && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Analytics 
                  lang={lang}
                  financialData={dynamicFinancialData}
                  pieData={dynamicPieData}
                  colors={COLORS}
                  statsOverride={{
                    pallets: totalPallets.toLocaleString(),
                    occupancy: `${occupancyPercentage}%`,
                    trucks: activeTrucksCount.toString()
                  }}
                  exportReport={exportReport}
                  addNotification={addNotification}
                />
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {!selectedWarehouse ? (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <Package className="w-10 h-10 text-white/20" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{lang === 'en' ? 'Select a Warehouse' : 'Seleccione un Almacén'}</h3>
                      <p className="text-white/40 mt-2 max-w-sm">
                        {lang === 'en' 
                          ? 'Please select a warehouse from the dashboard or create a new one to manage inventory.' 
                          : 'Por favor seleccione un almacén del tablero o cree uno nuevo para gestionar el inventario.'}
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('control-tower')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:scale-105 transition-all"
                    >
                      {lang === 'en' ? 'Go to Dashboard' : 'Ir al Tablero'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{t.inventory}</h2>
                        <p className="text-white/40 text-sm mt-1">{selectedWarehouse.name} • {filteredInventory.length} {lang === 'en' ? 'Items Found' : 'Items Encontrados'}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => setIsInventoryCompact(!isInventoryCompact)}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Layout className="w-4 h-4" />
                          {isInventoryCompact ? (lang === 'en' ? 'Standard View' : 'Vista Estándar') : (lang === 'en' ? 'Compact View' : 'Vista Compacta')}
                        </button>
                        <button 
                          onClick={() => setActiveModal('add-inventory')}
                          className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-sm font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {lang === 'en' ? 'Add Item' : 'Agregar Item'}
                        </button>
                        <button 
                          onClick={() => setActiveModal('import-inventory')}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {lang === 'en' ? 'Import' : 'Importar'}
                        </button>
                        <button 
                          onClick={() => {
                            if (filteredInventory.length === 0) {
                              addNotification(lang === 'en' ? 'No data to export' : 'No hay datos para exportar', 'alert');
                              return;
                            }
                            const headers = ['SKU', 'Name', 'Quantity', 'Unit', 'Location', 'Pallet ID', 'Customer'];
                            const csvContent = [
                              headers.join(','),
                              ...filteredInventory.map(item => [
                                `"${item.sku}"`,
                                `"${item.name}"`,
                                item.quantity,
                                `"${item.unit}"`,
                                `"${item.location}"`,
                                `"${item.palletId}"`,
                                `"${item.customer}"`
                              ].join(','))
                            ].join('\n');
                            
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.setAttribute('href', url);
                            link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            addNotification(lang === 'en' ? 'Inventory exported successfully!' : '¡Inventario exportado con éxito!', 'operational');
                          }}
                          className="px-4 py-2 bg-porteo-blue text-white rounded-xl text-sm font-bold hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {lang === 'en' ? 'Export CSV' : 'Exportar CSV'}
                        </button>
                      </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input 
                          type="text"
                          placeholder={lang === 'en' ? "Search by SKU, Name, or Customer..." : "Buscar por SKU, Nombre o Cliente..."}
                          value={inventorySearch}
                          onChange={(e) => setInventorySearch(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:border-porteo-orange/50 outline-none transition-all"
                        />
                      </div>
                      <div className="relative">
                        <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <select 
                          value={inventoryCategoryFilter}
                          onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:border-porteo-orange/50 outline-none appearance-none transition-all"
                        >
                          <option value="all">{lang === 'en' ? 'All Categories' : 'Todas las Categorías'}</option>
                          {Array.from(new Set(inventoryItems.map(i => i.category).filter(Boolean))).map(cat => (
                            <option key={cat as string} value={cat as string}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <select 
                          value={inventoryLocationFilter}
                          onChange={(e) => setInventoryLocationFilter(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:border-porteo-orange/50 outline-none appearance-none transition-all"
                        >
                          <option value="all">{lang === 'en' ? 'All Locations' : 'Todas las Ubicaciones'}</option>
                          {Array.from(new Set(inventoryItems.map(i => i.location).filter(Boolean))).map(loc => (
                            <option key={loc as string} value={loc as string}>{loc}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={`glass rounded-[32px] overflow-hidden border border-white/10 shadow-2xl ${isInventoryCompact ? 'max-h-[600px] flex flex-col' : ''}`}>
                      <div className="overflow-x-auto overflow-y-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse relative">
                          <thead className="sticky top-0 z-10 bg-slate-900 shadow-sm">
                            <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                              <th className="px-8 py-5 font-bold">{lang === 'en' ? 'Product Info' : 'Información del Producto'}</th>
                              <th className="px-8 py-5 font-bold">{lang === 'en' ? 'Details' : 'Detalles'}</th>
                              <th className="px-8 py-5 font-bold">{lang === 'en' ? 'Stock' : 'Existencias'}</th>
                              <th className="px-8 py-5 font-bold">{lang === 'en' ? 'Location' : 'Ubicación'}</th>
                              <th className="px-8 py-5 font-bold">{lang === 'en' ? 'Status' : 'Estado'}</th>
                              <th className="px-8 py-5 font-bold text-right">{lang === 'en' ? 'Actions' : 'Acciones'}</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {paginatedInventory.length > 0 ? paginatedInventory.map((item, i) => (
                              <tr 
                                key={item.id || i} 
                                onClick={() => {
                                  setSelectedInventoryItem(item);
                                  setActiveModal('inventory-detail');
                                }}
                                className={`border-b border-white/5 hover:bg-white/[0.02] transition-all cursor-pointer group ${isInventoryCompact ? 'py-2' : 'py-6'}`}
                              >
                                <td className={`px-8 ${isInventoryCompact ? 'py-3' : 'py-6'}`}>
                                  <div className="flex items-center gap-4">
                                    <div className={`${isInventoryCompact ? 'w-8 h-8' : 'w-12 h-12'} bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-porteo-orange/30 transition-all`}>
                                      <Package className={`${isInventoryCompact ? 'w-4 h-4' : 'w-6 h-6'} text-white/20 group-hover:text-porteo-orange/50 transition-all`} />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`text-white font-bold group-hover:text-porteo-orange transition-all ${isInventoryCompact ? 'text-sm' : 'text-base'}`}>{item.name}</span>
                                      <span className="text-[10px] font-mono text-white/40">{item.sku}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className={`px-8 ${isInventoryCompact ? 'py-3' : 'py-6'}`}>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-white/70 font-medium">{item.brand || '-'}</span>
                                    <span className="text-[10px] text-porteo-orange/60 font-black uppercase tracking-tighter">{item.category || '-'}</span>
                                  </div>
                                </td>
                                <td className={`px-8 ${isInventoryCompact ? 'py-3' : 'py-6'}`}>
                                  <div className="flex flex-col">
                                    <span className={`text-white font-bold ${isInventoryCompact ? 'text-base' : 'text-lg'}`}>{item.quantity}</span>
                                    <span className="text-[10px] text-white/30 uppercase font-bold">{item.unit}</span>
                                  </div>
                                </td>
                                <td className={`px-8 ${isInventoryCompact ? 'py-3' : 'py-6'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-porteo-blue/10 rounded-lg">
                                      <MapPin className="w-3 h-3 text-porteo-blue" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-white font-bold">{item.location}</span>
                                      <span className="text-[10px] text-white/30 uppercase">Pallet: {item.palletId}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className={`px-8 ${isInventoryCompact ? 'py-3' : 'py-6'}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active</span>
                                  </div>
                                </td>
                                <td className={`px-8 ${isInventoryCompact ? 'py-3' : 'py-6'} text-right`}>
                                  <button className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                    <ChevronRight className="w-4 h-4 text-white/40" />
                                  </button>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={6} className="px-8 py-20 text-center">
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                      <Search className="w-8 h-8 text-white/10" />
                                    </div>
                                    <p className="text-white/40 font-medium">{lang === 'en' ? 'No items match your search' : 'No hay artículos que coincidan con su búsqueda'}</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
                        <div className="text-xs text-white/40">
                          {lang === 'en' 
                            ? `Showing ${Math.min(filteredInventory.length, (inventoryPage - 1) * itemsPerPage + 1)} to ${Math.min(filteredInventory.length, inventoryPage * itemsPerPage)} of ${filteredInventory.length} items`
                            : `Mostrando ${Math.min(filteredInventory.length, (inventoryPage - 1) * itemsPerPage + 1)} a ${Math.min(filteredInventory.length, inventoryPage * itemsPerPage)} de ${filteredInventory.length} artículos`}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            disabled={inventoryPage === 1}
                            onClick={() => setInventoryPage(prev => Math.max(1, prev - 1))}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
                          >
                            {lang === 'en' ? 'Previous' : 'Anterior'}
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalInventoryPages) }, (_, i) => {
                              let pageNum = i + 1;
                              if (totalInventoryPages > 5 && inventoryPage > 3) {
                                pageNum = inventoryPage - 2 + i;
                                if (pageNum > totalInventoryPages) pageNum = totalInventoryPages - (4 - i);
                              }
                              if (pageNum <= 0) return null;
                              if (pageNum > totalInventoryPages) return null;
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setInventoryPage(pageNum)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                    inventoryPage === pageNum 
                                      ? 'bg-porteo-orange text-white' 
                                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button 
                            disabled={inventoryPage === totalInventoryPages}
                            onClick={() => setInventoryPage(prev => Math.min(totalInventoryPages, prev + 1))}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
                          >
                            {lang === 'en' ? 'Next' : 'Siguiente'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'map3d' && selectedWarehouse && (
              <motion.div 
                key="map3d"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{t.map3d}</h2>
                    <p className="text-white/40">{selectedWarehouse.name} • {selectedWarehouse.location}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setNewWarehouseData({
                          name: '',
                          location: '',
                          capacity: 50000,
                          layout: {
                            racks: { rows: 5, cols: 8 },
                            docks: 4,
                            zones: []
                          }
                        });
                        setActiveModal('create-warehouse');
                      }}
                      className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-sm font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {lang === 'en' ? 'New Warehouse' : 'Nuevo Almacén'}
                    </button>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      {lang === 'en' ? 'Layout Editor' : 'Editor de Diseño'}
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <Warehouse3D 
                    warehouse={selectedWarehouse}
                    externalAction={external3DAction}
                    onViewDetails={(details) => {
                      setSelectedRackDetails(details);
                      setActiveModal('rack-detail');
                    }}
                    onAuditRack={(id) => {
                      addNotification(lang === 'en' ? `Auditing Rack ${id}...` : `Auditando Rack ${id}...`, 'operational');
                    }}
                    onRelocateItems={(id) => {
                      addNotification(lang === 'en' ? `Initiating relocation for Rack ${id}...` : `Iniciando reubicación para Rack ${id}...`, 'operational');
                    }}
                    addNotification={addNotification}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'tpl' && selectedWarehouse && (
              <motion.div 
                key="tpl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <TPLWorkflow 
                  language={lang} 
                  shipments={tplProcesses}
                  onUpdateStatus={(shipment) => {
                    setTplProcesses(prev => prev.map(p => p.id === shipment.id ? shipment : p));
                    addNotification(lang === 'en' ? `Shipment ${shipment.truckId} status updated to ${shipment.status}` : `Estatus de envío ${shipment.truckId} actualizado a ${shipment.status}`, 'operational');
                  }}
                  onViewDocuments={(shipment) => {
                    setSelectedTplShipment(shipment);
                    setActiveModal('view-documents');
                  }}
                  onBulkImport={(newShipments) => {
                    setTplProcesses(prev => [...newShipments, ...prev]);
                    addNotification(lang === 'en' ? `Successfully imported ${newShipments.length} shipments!` : `¡Se importaron con éxito ${newShipments.length} envíos!`, 'operational');
                  }}
                  addNotification={addNotification}
                />
              </motion.div>
            )}

            {activeTab === 'intelligence-agents' && (
              <motion.div 
                key="intelligence-agents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <IntelligenceAgents language={lang} />
              </motion.div>
            )}

            {activeTab === 'operations' && selectedWarehouse && (
              <motion.div 
                key="operations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <WarehouseOperations language={lang} inventoryItems={inventoryItems} />
              </motion.div>
            )}

            {activeTab === 'commercial' && selectedWarehouse && (
              <motion.div 
                key="commercial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <CommercialManagement 
                  language={lang} 
                  onViewContract={(contract) => {
                    setSelectedContract(contract);
                    setActiveModal('contract-detail');
                  }}
                  onNewContract={() => setActiveModal('new-contract')}
                />
              </motion.div>
            )}

            {activeTab === 'financials' && selectedWarehouse && (
              <motion.div 
                key="financials"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Financials 
                  lang={lang} 
                  financialData={dynamicFinancialData} 
                  pieData={dynamicCostData} 
                  colors={COLORS} 
                  addNotification={addNotification}
                />
              </motion.div>
            )}

            {activeTab === 'personnel' && selectedWarehouse && (
              <motion.div 
                key="personnel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white tracking-tight">{t.personnel}</h2>
                  <button 
                    onClick={() => setActiveModal('add-personnel')}
                    className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-sm font-bold hover:bg-porteo-orange/90 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'en' ? 'Add Personnel' : 'Agregar Personal'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'Shift A', count: 42, performance: 94, lead: 'John Doe' },
                      { name: 'Shift B', count: 38, performance: 88, lead: 'Jane Smith' },
                      { name: 'Shift C', count: 25, performance: 91, lead: 'Carlos Ruiz' },
                      { name: 'Shift D (Night)', count: 18, performance: 85, lead: 'Mike Ross' },
                    ].map((shift, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSelectedRackDetails({ id: shift.name, ...shift }); // Reusing state for simplicity
                          setActiveModal('shift-detail');
                        }}
                        className="glass p-6 rounded-3xl cursor-pointer hover:border-porteo-orange/30 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-white/5 rounded-2xl text-porteo-orange">
                            <Users className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{shift.performance}% Efficiency</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{shift.name}</h3>
                        <p className="text-sm text-white/40 mt-1">Lead: {shift.lead}</p>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-sm text-white/60">{shift.count} active personnel</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModal('manage-personnel');
                            }}
                            className="text-porteo-orange text-xs font-bold hover:underline"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* HR AI Assistant Panel */}
                  <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border-l-4 border-porteo-blue">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-porteo-blue/20 rounded-lg text-porteo-blue">
                          <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{t.hrAssistant}</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-porteo-blue/5 rounded-2xl border border-porteo-blue/10">
                          <p className="text-xs font-bold text-porteo-blue uppercase tracking-widest mb-2">Optimization Insight</p>
                          <p className="text-sm text-white/80 leading-relaxed">
                            {lang === 'en' 
                              ? "Shift B is showing a 12% drop in picking speed during the last 2 hours. Recommend a 15-minute rotation or additional support from Shift C."
                              : "El Turno B muestra una caída del 12% en la velocidad de surtido en las últimas 2 horas. Se recomienda una rotación de 15 minutos o apoyo adicional del Turno C."}
                          </p>
                        </div>
                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">{t.costSavings}</p>
                          <p className="text-sm text-white/80 leading-relaxed">
                            {lang === 'en' 
                              ? "AI-driven scheduling has reduced overtime costs by $2,400 this week."
                              : "La programación impulsada por IA ha reducido los costos de horas extras en $2,400 esta semana."}
                          </p>
                        </div>
                        <button 
                          onClick={() => addNotification(lang === 'en' ? 'Generating Labor Optimization Plan...' : 'Generando Plan de Optimización Laboral...', 'operational')}
                          className="w-full py-3 bg-porteo-blue text-white rounded-xl text-xs font-bold hover:bg-porteo-blue/80 transition-all"
                        >
                          {lang === 'en' ? 'Generate Optimization Plan' : 'Generar Plan de Optimización'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'patio' && selectedWarehouse && (
              <motion.div 
                key="patio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{t.truckManagement}</h2>
                    <p className="text-white/40 text-sm mt-1">Register and manage third-party carriers and yard operations</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <input 
                        type="file" 
                        id="truck-upload" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            setIsProcessing(true);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                                const workbook = XLSX.read(data, { type: 'array' });
                                const sheetName = workbook.SheetNames[0];
                                const sheet = workbook.Sheets[sheetName];
                                const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
                                
                                const newTrucks = jsonData.map((row, idx) => ({
                                  id: row.id || row.ID || `TRK-IMP-${idx}`,
                                  carrier: row.carrier || row.Carrier || row.Carrier_Name || 'Unknown',
                                  type: row.type || row.Type || 'Full Truck',
                                  driver: row.driver || row.Driver || 'Unknown',
                                  status: 'Waiting',
                                  dock: '-',
                                  eta: row.eta || row.ETA || 'TBD',
                                  idling: false
                                }));

                                setTrucks(prev => [...newTrucks, ...prev]);
                                addNotification(lang === 'en' ? `Successfully processed ${file.name}. ${newTrucks.length} trucks added.` : `Procesado con éxito ${file.name}. ${newTrucks.length} camiones añadidos.`, 'operational');
                              } catch (err) {
                                console.error('Error parsing truck data:', err);
                                addNotification(lang === 'en' ? 'Error parsing file.' : 'Error al analizar el archivo.', 'alert');
                              } finally {
                                setIsProcessing(false);
                              }
                            };
                            reader.readAsArrayBuffer(file);
                          }
                        }} 
                        accept=".xlsx,.xls,.csv"
                      />
                      <label 
                        htmlFor="truck-upload"
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        {lang === 'en' ? 'Upload Fleet Data' : 'Subir Datos de Flota'}
                      </label>
                    </div>
                    <button 
                      onClick={() => setActiveModal('gate-entry')}
                      className="px-4 py-2 bg-porteo-orange rounded-xl text-sm font-bold text-white hover:bg-porteo-orange/90 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {lang === 'en' ? 'Register New Truck' : 'Registrar Nuevo Camión'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Active Trucks List */}
                    <div className="glass p-8 rounded-3xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Active Units in Yard</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setTruckStatusFilter(truckStatusFilter === 'Unloading' ? 'all' : 'Unloading')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase transition-all ${truckStatusFilter === 'Unloading' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                          >
                            {trucks.filter(t => t.status === 'Unloading').length} Unloading
                          </button>
                          <button 
                            onClick={() => setTruckStatusFilter(truckStatusFilter === 'Waiting' ? 'all' : 'Waiting')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase transition-all ${truckStatusFilter === 'Waiting' ? 'bg-porteo-orange text-white' : 'bg-porteo-orange/10 text-porteo-orange hover:bg-porteo-orange/20'}`}
                          >
                            {trucks.filter(t => t.status === 'Waiting').length} Waiting
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-6 flex gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input 
                            type="text" 
                            placeholder={lang === 'en' ? "Filter by Truck ID, Carrier..." : "Filtrar por ID, Transportista..."}
                            value={truckSearchQuery}
                            onChange={(e) => setTruckSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-porteo-orange/50 outline-none transition-all"
                          />
                        </div>
                        <select 
                          value={truckStatusFilter}
                          onChange={(e) => setTruckStatusFilter(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none"
                        >
                          <option value="all">All Status</option>
                          <option value="In Yard">In Yard</option>
                          <option value="Unloading">Unloading</option>
                          <option value="Waiting">Waiting</option>
                        </select>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left border-b border-white/10">
                              <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Truck ID</th>
                              <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Carrier</th>
                              <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Type</th>
                              <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                              <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Dock</th>
                              <th className="pb-4 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {trucks
                              .filter(t => {
                                const effectiveSearch = truckSearchQuery || searchQuery;
                                const matchesSearch = t.id.toLowerCase().includes(effectiveSearch.toLowerCase()) || t.carrier.toLowerCase().includes(effectiveSearch.toLowerCase());
                                const matchesStatus = truckStatusFilter === 'all' || t.status === truckStatusFilter;
                                return matchesSearch && matchesStatus;
                              })
                              .map((truck, i) => (
                              <tr key={i} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg">
                                      <Truck className="w-4 h-4 text-porteo-orange" />
                                    </div>
                                    <span className="text-sm font-bold text-white">{truck.id}</span>
                                  </div>
                                </td>
                                <td className="py-4 text-sm text-white/60">{truck.carrier}</td>
                                <td className="py-4 text-sm text-white/60">{truck.type}</td>
                                <td className="py-4">
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                    truck.status === 'Unloading' ? 'bg-emerald-500/10 text-emerald-500' : 
                                    truck.status === 'In Yard' ? 'bg-porteo-blue/10 text-porteo-blue' : 
                                    'bg-porteo-orange/10 text-porteo-orange'
                                  }`}>
                                    {truck.status}
                                  </span>
                                </td>
                                <td className="py-4 text-sm font-mono text-white/40">{truck.dock}</td>
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => addNotification(lang === 'en' ? `Opening GPS Telemetry for ${truck.id}...` : `Abriendo Telemetría GPS para ${truck.id}...`, 'operational')}
                                      className="p-2 hover:bg-porteo-blue/20 rounded-lg transition-colors text-porteo-blue"
                                      title="GPS Telemetry"
                                    >
                                      <Activity className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setSelectedSubItem({ id: truck.id, ...truck, status: truck.status, truck: truck.id });
                                        setActiveModal('dock-detail'); // Reuse dock-detail for truck settings/info
                                      }}
                                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40"
                                      title="Settings"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Yard Map / Visualization */}
                    <div className="glass p-8 rounded-3xl relative overflow-hidden group">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <MapIcon className="w-5 h-5 text-porteo-orange" />
                          <h4 className="text-white font-bold">Interactive Yard Map</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-white/40 uppercase font-bold">Live GPS Feed Active</span>
                        </div>
                      </div>
                      
                      <div className="relative h-64 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                        {/* Simulated Grid/Map */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        
                        {/* Docks Area */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-white/5 border-b border-white/10 flex justify-around items-center px-4">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="w-6 h-8 border-x border-white/10 flex items-end justify-center pb-1">
                              <span className="text-[6px] text-white/20">D{i+1}</span>
                            </div>
                          ))}
                        </div>

                        {/* Units on Map */}
                        {filteredTrucks.map((truck, i) => {
                          const isAtDock = truck.dock !== '-';
                          const dockNum = isAtDock ? parseInt(truck.dock.replace('Dock ', '')) : 0;
                          
                          // Position logic
                          let x, y;
                          if (isAtDock) {
                            // Position at the dock
                            x = (dockNum - 1) * 10 + 5; // Percentage
                            y = 15; // Percentage
                          } else {
                            // Position in the yard (randomized for visual variety)
                            x = 20 + (i * 15) % 60;
                            y = 50 + (i * 10) % 30;
                          }

                          return (
                            <motion.div 
                              key={truck.id}
                              initial={{ x: `${x}%`, y: `${y}%` }}
                              animate={truck.status === 'Waiting' ? { 
                                x: [`${x}%`, `${x+2}%`, `${x}%`],
                                y: [`${y}%`, `${y+1}%`, `${y}%`]
                              } : { x: `${x}%`, y: `${y}%` }}
                              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                              className={`absolute w-4 h-6 rounded shadow-lg flex items-center justify-center transition-all ${truck.status === 'Unloading' ? 'bg-emerald-500 shadow-emerald-500/50' : truck.status === 'Waiting' ? 'bg-porteo-orange shadow-porteo-orange/50' : 'bg-porteo-blue shadow-porteo-blue/50'}`}
                              style={{ left: 0, top: 0 }}
                            >
                              <Truck className="w-2 h-2 text-white" />
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-[6px] px-1 rounded border border-white/10 text-white z-10">{truck.id}</div>
                            </motion.div>
                          );
                        })}

                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                          <button onClick={() => addNotification('Recalibrating GPS Sensors...', 'operational')} className="p-2 bg-slate-900/80 border border-white/10 rounded-xl hover:bg-slate-800 transition-all">
                            <RefreshCw className="w-3 h-3 text-white/40" />
                          </button>
                          <button onClick={() => addNotification('Switching to Satellite View...', 'operational')} className="p-2 bg-slate-900/80 border border-white/10 rounded-xl hover:bg-slate-800 transition-all">
                            <Globe2 className="w-3 h-3 text-white/40" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-porteo-blue/10 border border-porteo-blue/30 rounded-xl flex items-center gap-3">
                        <Zap className="w-4 h-4 text-porteo-blue" />
                        <p className="text-[10px] text-white/60">
                          {lang === 'en' 
                            ? `AI: ${trucks.filter(t => t.idling).length} units are currently idling in the yard for >20 mins. Recommend immediate dock assignment.`
                            : `IA: ${trucks.filter(t => t.idling).length} unidades están inactivas en el patio por >20 min. Se recomienda asignación inmediata de muelle.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Dock Status Mini-Grid */}
                    <div className="glass p-6 rounded-3xl">
                      <h3 className="text-lg font-bold text-white mb-6">Dock Occupancy</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 9 }).map((_, i) => {
                          const dockLabel = `Dock ${i + 1}`;
                          const occupyingTruck = trucks.find(t => t.dock === dockLabel);
                          const isOccupied = !!occupyingTruck;
                          return (
                            <button 
                              key={i} 
                              onClick={() => {
                                setSelectedSubItem({ 
                                  id: `D-${i+1}`, 
                                  status: isOccupied ? 'Occupied' : 'Available', 
                                  truck: occupyingTruck ? occupyingTruck.id : null,
                                  carrier: occupyingTruck ? occupyingTruck.carrier : null,
                                  driver: occupyingTruck ? occupyingTruck.driver : null
                                });
                                setActiveModal('dock-detail');
                              }}
                              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all hover:scale-105 ${isOccupied ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}
                            >
                              <span className="text-[8px] font-bold uppercase">D-{i + 1}</span>
                              <Truck className={`w-4 h-4 ${isOccupied ? 'animate-pulse' : ''}`} />
                            </button>
                          );
                        })}
                      </div>
                      <button 
                        onClick={() => {
                          setIsProcessing(true);
                          setTimeout(() => {
                            setIsProcessing(false);
                            // Real logic: assign waiting trucks to available docks
                            const updatedTrucks = [...trucks];
                            const waitingTrucks = updatedTrucks.filter(t => t.status === 'Waiting');
                            const occupiedDocks = updatedTrucks.filter(t => t.dock !== '-').map(t => t.dock);
                            
                            let dockIndex = 1;
                            waitingTrucks.forEach(truck => {
                              while (occupiedDocks.includes(`Dock ${dockIndex}`) && dockIndex <= 10) {
                                dockIndex++;
                              }
                              if (dockIndex <= 10) {
                                truck.dock = `Dock ${dockIndex}`;
                                truck.status = 'In Yard';
                                occupiedDocks.push(`Dock ${dockIndex}`);
                              }
                            });
                            setTrucks(updatedTrucks);
                            addNotification(lang === 'en' ? 'Dock allocation optimized based on priority and ETA.' : 'Asignación de muelles optimizada basada en prioridad y ETA.', 'operational');
                          }, 2000);
                        }}
                        className="w-full mt-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-porteo-orange" />}
                        {isProcessing ? (lang === 'en' ? 'Optimizing...' : 'Optimizando...') : (lang === 'en' ? 'Optimize Dock Allocation' : 'Optimizar Asignación de Muelles')}
                      </button>
                    </div>

                    {/* Third Party Carrier Stats */}
                    <div className="glass p-6 rounded-3xl">
                      <h3 className="text-lg font-bold text-white mb-6">Carrier Performance</h3>
                      <div className="space-y-4">
                        {carriers.map((carrier, i) => (
                          <div key={i} className="group p-3 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-orange/30 transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-bold text-white">{carrier.name}</p>
                                <p className="text-[10px] text-white/40">On-time delivery</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-emerald-500">{carrier.score}%</p>
                                <p className="text-[10px] text-white/40">{carrier.trend}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${carrier.status === 'Late' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                {carrier.status}
                              </span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => addNotification(lang === 'en' ? `Calling ${carrier.name} Dispatch at ${carrier.phone}...` : `Llamando a Despacho de ${carrier.name} al ${carrier.phone}...`, 'operational')}
                                  className="p-1.5 bg-porteo-orange/10 text-porteo-orange rounded-lg hover:bg-porteo-orange transition-all hover:text-white"
                                >
                                  <Activity className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedCarrier(carrier);
                                    addNotification(lang === 'en' ? `Opening full performance report for ${carrier.name}` : `Abriendo reporte de desempeño completo para ${carrier.name}`, 'operational');
                                  }}
                                  className="p-1.5 bg-white/5 text-white/40 rounded-lg hover:bg-white/10 transition-all hover:text-white"
                                >
                                  <FileText className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'patio' && (
              <motion.div 
                key="patio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PatioManagement lang={lang} searchQuery={searchQuery} trucks={trucks} />
              </motion.div>
            )}

            {activeTab === 'assembly' && selectedWarehouse && (
              <motion.div 
                key="assembly"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AssemblyLine lang={lang} />
              </motion.div>
            )}

            {activeTab === 'research' && selectedWarehouse && (
              <motion.div 
                key="research"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <StrategicResearch lang={lang} setActiveTab={setActiveTab} addNotification={addNotification} />
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{lang === 'en' ? 'System Administration' : 'Administración del Sistema'}</h2>
                    <p className="text-white/40">{lang === 'en' ? 'Manage warehouse network, import data, and configure system settings.' : 'Gestione la red de almacenes, importe datos y configure los ajustes del sistema.'}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls,.csv';
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) handleGlobalDataImport(file);
                        };
                        input.click();
                      }}
                      disabled={isImporting}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20 disabled:opacity-50"
                    >
                      {isImporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      {lang === 'en' ? (isImporting ? 'Importing...' : 'Global Data Import') : (isImporting ? 'Importando...' : 'Importar Datos Globales')}
                    </button>
                    <button 
                      onClick={() => {
                        setWarehouses(MOCK_WAREHOUSES);
                        setInventoryItems(MOCK_INVENTORY);
                        addNotification(lang === 'en' ? 'Sample data loaded successfully!' : '¡Datos de muestra cargados con éxito!', 'operational');
                      }}
                      className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <Database className="w-5 h-5" />
                      {lang === 'en' ? 'Load Sample Data' : 'Cargar Muestra'}
                    </button>
                    <button 
                      onClick={() => {
                        setNewWarehouseData({
                          name: '',
                          location: '',
                          capacity: 50000,
                          market: market,
                          layout: {
                            racks: { rows: 5, cols: 8 },
                            docks: 4,
                            zones: []
                          }
                        });
                        setActiveModal('create-warehouse');
                      }}
                      className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      {lang === 'en' ? 'Add Warehouse' : 'Agregar Almacén'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-[32px] space-y-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <WarehouseIcon className="w-5 h-5 text-porteo-orange" />
                        {lang === 'en' ? 'Warehouse Network' : 'Red de Almacenes'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {warehouses.map(wh => (
                          <div 
                            key={wh.id}
                            onClick={() => {
                              setEditingWarehouse(wh);
                              setAdminSubTab('layout');
                            }}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer group ${editingWarehouse?.id === wh.id ? 'bg-porteo-orange/10 border-porteo-orange' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-xl ${editingWarehouse?.id === wh.id ? 'bg-porteo-orange text-white' : 'bg-white/5 text-white/40 group-hover:text-white'}`}>
                                <WarehouseIcon className="w-5 h-5" />
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${wh.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                {wh.status}
                              </span>
                            </div>
                            <h4 className="text-white font-bold">{wh.name}</h4>
                            <p className="text-white/40 text-xs mt-1">{wh.location} • {wh.market}</p>
                          </div>
                        ))}
                        {warehouses.length === 0 && (
                          <div className="col-span-full py-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                              <Database className="w-8 h-8 text-white/10" />
                            </div>
                            <p className="text-white/20 italic">{lang === 'en' ? 'No warehouses found. Import data to begin.' : 'No se encontraron almacenes. Importe datos para comenzar.'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingWarehouse && (
                      <div className="glass p-8 rounded-[32px] space-y-6">
                        <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
                          <button 
                            onClick={() => setAdminSubTab('layout')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminSubTab === 'layout' ? 'bg-porteo-blue text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                          >
                            {lang === 'en' ? 'Layout Editor' : 'Editor de Diseño'}
                          </button>
                          <button 
                            onClick={() => setAdminSubTab('master-data')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminSubTab === 'master-data' ? 'bg-porteo-blue text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                          >
                            {lang === 'en' ? 'Master Data' : 'Datos Maestros'}
                          </button>
                        </div>

                        {adminSubTab === 'layout' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <h4 className="text-white font-bold flex items-center gap-2">
                                <Move className="w-4 h-4 text-porteo-orange" />
                                {lang === 'en' ? 'Dimensions & Capacity' : 'Dimensiones y Capacidad'}
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'Rack Rows' : 'Filas de Racks'}</label>
                                  <input 
                                    type="number" 
                                    value={editingWarehouse.layout?.racks.rows || 0}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setWarehouses(prev => prev.map(w => w.id === editingWarehouse.id ? { ...w, layout: { ...w.layout, racks: { ...w.layout.racks, rows: val } } } : w));
                                      setEditingWarehouse(prev => prev ? { ...prev, layout: { ...prev.layout, racks: { ...prev.layout.racks, rows: val } } } : null);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-porteo-orange/50 transition-all"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'Rack Columns' : 'Columnas de Racks'}</label>
                                  <input 
                                    type="number" 
                                    value={editingWarehouse.layout?.racks.cols || 0}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setWarehouses(prev => prev.map(w => w.id === editingWarehouse.id ? { ...w, layout: { ...w.layout, racks: { ...w.layout.racks, cols: val } } } : w));
                                      setEditingWarehouse(prev => prev ? { ...prev, layout: { ...prev.layout, racks: { ...prev.layout.racks, cols: val } } } : null);
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-porteo-orange/50 transition-all"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                              <div className="w-16 h-16 bg-porteo-orange/20 rounded-full flex items-center justify-center">
                                <Layers className="w-8 h-8 text-porteo-orange" />
                              </div>
                              <div>
                                <p className="text-white font-bold">{(editingWarehouse.layout?.racks.rows || 0) * (editingWarehouse.layout?.racks.cols || 0)} Total Racks</p>
                                <p className="text-white/40 text-xs">{lang === 'en' ? 'Estimated storage positions: ' : 'Posiciones estimadas: '}{((editingWarehouse.layout?.racks.rows || 0) * (editingWarehouse.layout?.racks.cols || 0) * 5).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-white/40 italic text-sm">{lang === 'en' ? 'Master data management for ' : 'Gestión de datos maestros para '}{editingWarehouse.name}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all text-left">
                                <p className="font-bold text-sm">SKU Registry</p>
                                <p className="text-[10px] text-white/40">Manage product master data</p>
                              </button>
                              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all text-left">
                                <p className="font-bold text-sm">Customer List</p>
                                <p className="text-[10px] text-white/40">Manage 3PL clients</p>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="glass p-8 rounded-[32px] space-y-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Download className="w-5 h-5 text-porteo-blue" />
                        {lang === 'en' ? 'Quick Actions' : 'Acciones Rápidas'}
                      </h3>
                      <div className="space-y-3">
                        <button 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.xlsx,.xls,.csv';
                            input.onchange = (e: any) => {
                              const file = e.target.files[0];
                              if (file) handleGlobalDataImport(file);
                            };
                            input.click();
                          }}
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group"
                        >
                          <div className="w-10 h-10 bg-porteo-orange/20 rounded-xl flex items-center justify-center group-hover:bg-porteo-orange transition-colors">
                            <Upload className="w-5 h-5 text-porteo-orange group-hover:text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-sm">{lang === 'en' ? 'Import Global Data' : 'Importar Datos Globales'}</p>
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Upload Excel file' : 'Subir archivo Excel'}</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => {
                            const headers = ['Sheet: Warehouses (name, location, market, capacity)', 'Sheet: Inventory (sku, name, quantity, unit, location, palletId, customer)'];
                            const blob = new Blob([headers.join('\n')], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = 'import-template-guide.txt';
                            link.click();
                          }}
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group"
                        >
                          <div className="w-10 h-10 bg-porteo-blue/20 rounded-xl flex items-center justify-center group-hover:bg-porteo-blue transition-colors">
                            <FileText className="w-5 h-5 text-porteo-blue group-hover:text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold text-sm">{lang === 'en' ? 'Download Template' : 'Descargar Plantilla'}</p>
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Excel structure guide' : 'Guía de estructura Excel'}</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Drill Down Modal */}
      <AnimatePresence>
        {drillDownStat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrillDownStat(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                    {stats.find(s => s.id === drillDownStat)?.label} {lang === 'en' ? 'Details' : 'Detalles'}
                  </h2>
                  <p className="text-white/40 text-sm mt-1">
                    {lang === 'en' ? `Granular analysis for ${selectedWarehouse?.name || 'Warehouse'}` : `Análisis granular para ${selectedWarehouse?.name || 'Almacén'}`}
                  </p>
                </div>
                <button onClick={() => setDrillDownStat(null)} className="p-2 text-white/40 hover:text-white transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => setDrillDownView('current')}
                    className={`p-6 rounded-3xl border transition-all text-left ${drillDownView === 'current' ? 'bg-porteo-orange/10 border-porteo-orange' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Current</p>
                    <p className="text-3xl font-bold text-porteo-orange">12,450</p>
                    {drillDownView === 'current' && <p className="text-[10px] text-porteo-orange mt-2 font-bold uppercase tracking-widest">Active View</p>}
                  </button>
                  <button 
                    onClick={() => setDrillDownView('average')}
                    className={`p-6 rounded-3xl border transition-all text-left ${drillDownView === 'average' ? 'bg-porteo-blue/10 border-porteo-blue' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Average</p>
                    <p className="text-3xl font-bold text-white">11,200</p>
                    {drillDownView === 'average' && <p className="text-[10px] text-porteo-blue mt-2 font-bold uppercase tracking-widest">Active View</p>}
                  </button>
                  <button 
                    onClick={() => setDrillDownView('peak')}
                    className={`p-6 rounded-3xl border transition-all text-left ${drillDownView === 'peak' ? 'bg-porteo-blue/10 border-porteo-blue' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Peak</p>
                    <p className="text-3xl font-bold text-porteo-blue">14,800</p>
                    {drillDownView === 'peak' && <p className="text-[10px] text-porteo-blue mt-2 font-bold uppercase tracking-widest">Active View</p>}
                  </button>
                </div>

                {drillDownView === 'trend' ? (
                  <div 
                    onClick={() => addNotification(lang === 'en' ? 'Interacting with Historical Trend Graph' : 'Interactuando con Gráfica de Tendencia Histórica', 'operational')}
                    className="glass p-8 rounded-3xl cursor-pointer hover:border-white/20 transition-all"
                  >
                    <h3 className="text-lg font-bold text-white mb-6">{lang === 'en' ? 'Historical Trend' : 'Tendencia Histórica'}</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={FINANCIAL_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                          <Tooltip />
                          <Area type="monotone" dataKey="cost" stroke="#004A99" fill="#004A9920" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="glass p-8 rounded-3xl space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        {drillDownView === 'current' ? 'Live Inventory Distribution' : 
                         drillDownView === 'average' ? 'Monthly Average Breakdown' : 'Peak Period Analysis'}
                      </h3>
                      <button 
                        onClick={() => setDrillDownView('trend')}
                        className="text-xs font-bold text-porteo-orange hover:underline uppercase tracking-widest"
                      >
                        Back to Trend
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        {[
                          { id: 'zone-a', label: 'Zone A (High Rot)', value: 4500, color: 'bg-porteo-orange', details: 'Fast-moving consumer goods, high frequency picking.' },
                          { id: 'zone-b', label: 'Zone B (Medium)', value: 3200, color: 'bg-porteo-blue', details: 'Standard rotation items, optimized for reach.' },
                          { id: 'zone-c', label: 'Zone C (Bulk)', value: 2800, color: 'bg-porteo-blue/50', details: 'Large items, pallet-only storage.' },
                          { id: 'cross-dock', label: 'Cross-Dock', value: 1950, color: 'bg-emerald-500', details: 'Immediate dispatch, zero-day storage.' },
                        ].map((item, i) => (
                          <div 
                            key={i} 
                            className={`space-y-2 p-3 rounded-xl transition-all cursor-pointer ${selectedZone?.id === item.id ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                            onClick={() => setSelectedZone(item)}
                          >
                            <div className="flex justify-between text-xs">
                              <span className="text-white/60 font-bold">{item.label}</span>
                              <span className="text-white font-bold">{item.value.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.color}`} 
                                style={{ width: `${(item.value / 12450) * 100}%` }}
                              />
                            </div>
                            {selectedZone?.id === item.id && (
                              <motion.p 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-[10px] text-white/40 mt-2 italic"
                              >
                                {item.details}
                              </motion.p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
                        {selectedZone ? (
                          <div className="space-y-4 w-full">
                            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${selectedZone.color}`}>
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-white font-bold">{selectedZone.label} Breakdown</h4>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="bg-white/5 p-2 rounded-lg">
                                <p className="text-white/40 uppercase">Occupancy</p>
                                <p className="text-white font-bold">88%</p>
                              </div>
                              <div className="bg-white/5 p-2 rounded-lg">
                                <p className="text-white/40 uppercase">SKUs</p>
                                <p className="text-white font-bold">1,240</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setActiveTab('inventory');
                                setSearchQuery(selectedZone.label.split(' ')[0]); // Search by Zone A, Zone B, etc.
                                setDrillDownStat(null);
                                setSelectedZone(null);
                              }}
                              className="w-full py-2 bg-porteo-orange text-white rounded-xl text-[10px] font-bold hover:bg-porteo-orange/80 transition-all"
                            >
                              View Zone Inventory
                            </button>
                          </div>
                        ) : (
                          <>
                            <Activity className="w-12 h-12 text-porteo-orange mb-4" />
                            <p className="text-sm text-white/80 font-medium">
                              {drillDownView === 'current' 
                                ? "Select a zone to see granular distribution and SKU breakdown." 
                                : "Predictive modeling suggests a 15% increase in volume next quarter."}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => {
                    setIsDownloading(true);
                    setTimeout(() => {
                      setIsDownloading(false);
                      const content = "Porteo WMS - Full Warehouse Report\nGenerated: " + new Date().toLocaleString() + "\nWarehouse: " + (selectedWarehouse?.name || 'None') + "\nStatus: Operational\nEfficiency: 94%";
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `Report_${(selectedWarehouse?.name || 'Warehouse').replace(/\s+/g, '_')}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      addNotification(lang === 'en' ? 'Report downloaded successfully!' : '¡Reporte descargado con éxito!', 'operational');
                    }, 1500);
                  }}
                  disabled={isDownloading}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Activity className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {lang === 'en' ? (isDownloading ? 'Generating...' : 'Download Full Report') : (isDownloading ? 'Generando...' : 'Descargar Reporte Completo')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registered Orders Modal */}
      <AnimatePresence>
        {showRegisteredOrders && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisteredOrders(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-white/10 flex flex-col gap-6 bg-white/5">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                      {lang === 'en' ? 'Registered Orders' : 'Órdenes Registradas'}
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                      {lang === 'en' ? 'Complete history of inbound and outbound operations' : 'Historial completo de operaciones de entrada y salida'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        setActiveModal('inbound');
                        setShowRegisteredOrders(false);
                      }}
                      className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-porteo-orange/80 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {lang === 'en' ? 'New Inbound' : 'Nueva Entrada'}
                    </button>
                    <button 
                      onClick={() => {
                        setActiveModal('outbound');
                        setShowRegisteredOrders(false);
                      }}
                      className="px-4 py-2 bg-porteo-blue text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-porteo-blue/80 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {lang === 'en' ? 'New Outbound' : 'Nueva Salida'}
                    </button>
                    <button onClick={() => setShowRegisteredOrders(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                      <X className="w-8 h-8" />
                    </button>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="text" 
                      placeholder={lang === 'en' ? "Search Truck ID / Customer..." : "Buscar ID Camión / Cliente..."}
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-porteo-orange/50 outline-none transition-all"
                    />
                  </div>
                  <select 
                    value={orderFilterCustomer}
                    onChange={(e) => setOrderFilterCustomer(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white outline-none"
                  >
                    <option value="all">{lang === 'en' ? 'All Customers' : 'Todos los Clientes'}</option>
                    {Array.from(new Set(tplProcesses.map(p => p.customer))).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select 
                    value={orderFilterWarehouse}
                    onChange={(e) => setOrderFilterWarehouse(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white outline-none"
                  >
                    <option value="all">{lang === 'en' ? 'All Warehouses' : 'Todos los Almacenes'}</option>
                    {Array.from(new Set(tplProcesses.map(p => p.destination))).map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 px-4 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white/40 uppercase font-bold">
                    <Filter className="w-3 h-3" />
                    {tplProcesses.filter(p => {
                      const effectiveSearch = orderSearchQuery || searchQuery;
                      const matchesSearch = p.truckId.toLowerCase().includes(effectiveSearch.toLowerCase()) || 
                                          p.customer.toLowerCase().includes(effectiveSearch.toLowerCase());
                      const matchesCustomer = orderFilterCustomer === 'all' || p.customer === orderFilterCustomer;
                      const matchesWarehouse = orderFilterWarehouse === 'all' || p.destination === orderFilterWarehouse;
                      return matchesSearch && matchesCustomer && matchesWarehouse;
                    }).length} {lang === 'en' ? 'Orders Found' : 'Órdenes Encontradas'}
                  </div>
                </div>
              </div>
              <div className="p-8 overflow-y-auto flex-1 space-y-4">
                {tplProcesses.filter(p => {
                  const effectiveSearch = orderSearchQuery || searchQuery;
                  const matchesSearch = p.truckId.toLowerCase().includes(effectiveSearch.toLowerCase()) || 
                                      p.customer.toLowerCase().includes(effectiveSearch.toLowerCase());
                  const matchesCustomer = orderFilterCustomer === 'all' || p.customer === orderFilterCustomer;
                  const matchesWarehouse = orderFilterWarehouse === 'all' || p.destination === orderFilterWarehouse;
                  return matchesSearch && matchesCustomer && matchesWarehouse;
                }).map((process, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-porteo-orange/30 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${process.status === 'collection' || process.status === 'unloading' ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-porteo-blue/20 text-porteo-blue'}`}>
                        <Truck className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-white">{process.truckId}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${process.status === 'collection' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-porteo-blue/10 text-porteo-blue'}`}>
                            {process.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mt-1">{process.customer} • {process.truckType}</p>
                        <p className="text-xs text-white/40 mt-1">{process.origin} → {process.destination}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{new Date(process.steps[0].timestamp).toLocaleDateString()}</p>
                      <p className="text-xs text-white/40">{new Date(process.steps[0].timestamp).toLocaleTimeString()}</p>
                      <button 
                        onClick={() => {
                          setSelectedTplShipment(process);
                          setActiveModal('update-status');
                          setShowRegisteredOrders(false);
                        }}
                        className="mt-3 text-xs font-bold text-porteo-orange hover:underline uppercase tracking-widest"
                      >
                        Manage Order
                      </button>
                    </div>
                  </div>
                ))}
                {tplProcesses.length === 0 && (
                  <div className="text-center py-20">
                    <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 italic">No orders registered yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveModal(null);
                setModalLevel(1);
                setSelectedSubItem(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#121212] to-[#080808] border border-white/10 rounded-[40px] shadow-[0_0_80px_rgba(242,125,38,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  {modalLevel > 1 && (
                    <button 
                      onClick={() => {
                        setModalLevel(prev => prev - 1);
                        setSelectedSubItem(null);
                      }}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                    >
                      <ArrowDownLeft className="w-5 h-5 rotate-45" />
                    </button>
                  )}
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                      <div className="w-2 h-8 bg-porteo-orange rounded-full" />
                    {activeModal === 'inbound' ? (lang === 'en' ? 'Inbound Registration' : 'Registro de Entrada') :
                     activeModal === 'outbound' ? (lang === 'en' ? 'Outbound Scheduling' : 'Programación de Salida') :
                     activeModal === 'add-inventory' ? (lang === 'en' ? 'Add Item' : 'Agregar Item') :
                     activeModal === 'import-inventory' ? (lang === 'en' ? 'Import Inventory' : 'Importar Inventario') :
                     activeModal === 'inventory-detail' ? (lang === 'en' ? 'Item Details' : 'Detalles del Item') :
                     activeModal === 'gate-entry' ? (lang === 'en' ? 'Gate Entry' : 'Entrada de Puerta') :
                     activeModal === 'dock-detail' ? (lang === 'en' ? 'Dock Details' : 'Detalles del Muelle') :
                     activeModal === 'rack-detail' ? (lang === 'en' ? 'Rack Details' : 'Detalles del Rack') :
                     activeModal === 'update-status' ? (lang === 'en' ? 'Update Status' : 'Actualizar Estatus') :
                     activeModal === 'view-documents' ? (lang === 'en' ? 'Document List' : 'Lista de Documentos') :
                     activeModal === 'add-personnel' ? (lang === 'en' ? 'Add Personnel' : 'Agregar Personal') :
                     activeModal === 'manage-personnel' ? (lang === 'en' ? 'Personnel Management' : 'Gestión de Personal') :
                     activeModal === 'shift-detail' ? (lang === 'en' ? 'Shift Details' : 'Detalles del Turno') :
                     activeModal === 'labor-optimization' ? (lang === 'en' ? 'Labor Optimization' : 'Optimización Laboral') :
                     activeModal === 'slotting-ai' ? (lang === 'en' ? 'Slotting AI' : 'IA de Slotting') :
                     activeModal === 'ecommerce-integration' ? (lang === 'en' ? 'E-commerce Integration' : 'Integración E-commerce') :
                     activeModal === 'financial-details' ? (lang === 'en' ? 'Financial Analysis' : 'Análisis Financiero') :
                     activeModal === 'cargo-visibility' ? (lang === 'en' ? 'Cargo Visibility' : 'Visibilidad de Carga') :
                     activeModal === 'interop-hub' ? (lang === 'en' ? 'Interoperability Hub' : 'Hub de Interoperabilidad') :
                     activeModal === 'risk-assessment' ? (lang === 'en' ? 'Risk Assessment' : 'Evaluación de Riesgos') :
                     activeModal === 'secure-docs' ? (lang === 'en' ? 'Secure Documents' : 'Documentos Seguros') :
                     activeModal === 'predictive-analytics' ? (lang === 'en' ? 'Predictive Analytics' : 'Analítica Predictiva') :
                     activeModal === 'port-city-sync' ? (lang === 'en' ? 'Port-City Sync' : 'Sincronización Puerto-Ciudad') :
                     activeModal === 'ai-tasks' ? (lang === 'en' ? 'Pending AI Tasks' : 'Tareas IA Pendientes') :
                     activeModal === 'market-hubs' ? (lang === 'en' ? 'Active Market Hubs' : 'Hubs de Mercado Activos') :
                     activeModal === 'efficiency-report' ? (lang === 'en' ? 'Efficiency Report' : 'Reporte de Eficiencia') :
                     activeModal === 'import-success' ? (lang === 'en' ? 'Import Successful' : 'Importación Exitosa') :
                     activeModal === 'import-mapping' ? (lang === 'en' ? 'Data Mapping & Preview' : 'Mapeo y Vista Previa de Datos') :
                     activeModal === 'contract-detail' ? (lang === 'en' ? 'Contract Details' : 'Detalles del Contrato') :
                     activeModal === 'new-contract' ? (lang === 'en' ? 'New Contract' : 'Nuevo Contrato') :
                     activeModal?.replace(/-/g, ' ') || ''}
                </h2>
              </div>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setModalLevel(1);
                  setSelectedSubItem(null);
                }} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
                {activeModal === 'import-success' && (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {lang === 'en' ? 'Integration Complete' : 'Integración Completada'}
                    </h3>
                    <p className="text-white/60 mb-8">
                      {lang === 'en' 
                        ? `We've successfully integrated your data into the system. You can now manage your inventory and warehouse operations.`
                        : `Hemos integrado con éxito sus datos en el sistema. Ahora puede gestionar su inventario y las operaciones de almacén.`}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => {
                          setActiveModal(null);
                          setActiveTab('inventory');
                        }}
                        className="py-4 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all flex items-center justify-center gap-2"
                      >
                        <Layers className="w-5 h-5" />
                        {lang === 'en' ? 'Inventory' : 'Inventario'}
                      </button>
                      <button 
                        onClick={() => {
                          setActiveModal(null);
                          setActiveTab('warehouse');
                        }}
                        className="py-4 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10"
                      >
                        <Truck className="w-5 h-5" />
                        {lang === 'en' ? 'Warehouse' : 'Almacén'}
                      </button>
                    </div>
                  </div>
                )}

                {activeModal === 'import-mapping' && importPreview && (
                  <ErrorBoundary fallback={
                    <div className="p-12 text-center space-y-4">
                      <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                      <h3 className="text-xl font-bold text-white">Import Preview Error</h3>
                      <p className="text-white/60">There was an error rendering the data preview. The file format might be unsupported.</p>
                      <button 
                        onClick={() => { setActiveModal(null); setImportPreview(null); }}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold"
                      >
                        Close
                      </button>
                    </div>
                  }>
                    {(() => {
                      const activeSheet = importPreview?.sheets?.[importPreview?.activeSheetIndex || 0];
                      const previewData = activeSheet?.data?.slice(0, 5) || [];
                      const columns = activeSheet?.data?.[0] ? Object.keys(activeSheet.data[0]) : [];

                      return (
                        <>
                          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                          <div className="flex items-center justify-between p-4 bg-porteo-orange/10 border border-porteo-orange/20 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-porteo-orange/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-porteo-orange" />
                              </div>
                              <div>
                                <p className="text-white font-bold">{importPreview.fileName}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-white/40 text-xs">{activeSheet?.data?.length || 0} rows found</p>
                                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                                  <p className={`text-xs font-bold ${importConfidence > 80 ? 'text-emerald-400' : importConfidence > 50 ? 'text-porteo-orange' : 'text-rose-400'}`}>
                                    {importConfidence}% Match Confidence
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setImportTargetType('inventory')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${importTargetType === 'inventory' ? 'bg-porteo-orange text-white shadow-lg shadow-porteo-orange/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                              >
                                <Package className="w-3 h-3" />
                                Inventory
                              </button>
                              <button 
                                onClick={() => setImportTargetType('warehouse')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${importTargetType === 'warehouse' ? 'bg-porteo-orange text-white shadow-lg shadow-porteo-orange/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                              >
                                <WarehouseIcon className="w-3 h-3" />
                                Warehouse
                              </button>
                              <button 
                                onClick={() => setImportTargetType('truck')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${importTargetType === 'truck' ? 'bg-porteo-orange text-white shadow-lg shadow-porteo-orange/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                              >
                                <Truck className="w-3 h-3" />
                                {lang === 'en' ? 'Trucks' : 'Camiones'}
                              </button>
                            </div>
                          </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-porteo-blue/20 rounded-lg flex items-center justify-center">
                          <BrainCircuit className="w-4 h-4 text-porteo-blue" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">AI Detection</p>
                          <p className="text-white text-sm font-bold">
                            {importTargetType === 'inventory' ? (lang === 'en' ? 'Inventory & Stock' : 'Inventario y Stock') :
                             importTargetType === 'warehouse' ? (lang === 'en' ? 'Warehouse Network' : 'Red de Almacenes') :
                             (lang === 'en' ? 'Logistics & Trucks' : 'Logística y Camiones')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Confidence</p>
                        <p className={`text-sm font-bold ${importConfidence > 80 ? 'text-emerald-400' : 'text-porteo-orange'}`}>{importConfidence}%</p>
                      </div>
                    </div>

                    {importPreview.sheets.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Select Sheet</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {importPreview.sheets.map((sheet, idx) => (
                            <button
                              key={sheet.name}
                              onClick={() => {
                                setImportPreview(prev => prev ? { ...prev, activeSheetIndex: idx } : null);
                                setImportMapping({});
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${importPreview.activeSheetIndex === idx ? 'bg-white/20 border-white/20 text-white' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'}`}
                            >
                              {sheet.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-bold flex items-center gap-2">
                          <Layers className="w-4 h-4 text-porteo-orange" />
                          Smart Column Mapping
                        </h4>
                        <button 
                          onClick={() => setImportMapping({})}
                          className="text-[10px] font-bold text-white/40 hover:text-rose-400 uppercase tracking-widest transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(importTargetType === 'inventory' 
                          ? ['sku', 'name', 'quantity', 'unit', 'location', 'palletId', 'customer', 'brand', 'category', 'oemNumber']
                          : importTargetType === 'warehouse'
                          ? ['name', 'location', 'market', 'capacity']
                          : ['id', 'carrier', 'type', 'driver', 'status', 'dock', 'eta']
                        ).map(field => {
                          const isMatched = !!importMapping[field];
                          return (
                            <div key={field} className={`p-4 rounded-2xl border transition-all ${isMatched ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider flex items-center gap-1">
                                  {field === 'sku' ? (lang === 'en' ? 'SKU / Part #' : 'SKU / Parte') :
                                   field === 'name' ? (lang === 'en' ? 'Description' : 'Descripción') :
                                   field === 'quantity' ? (lang === 'en' ? 'Quantity' : 'Cantidad') :
                                   field === 'unit' ? (lang === 'en' ? 'Unit' : 'Unidad') :
                                   field === 'location' ? (lang === 'en' ? 'Location' : 'Ubicación') :
                                   field === 'customer' ? (lang === 'en' ? 'Customer' : 'Cliente') :
                                   field === 'carrier' ? (lang === 'en' ? 'Carrier' : 'Transportista') :
                                   field === 'driver' ? (lang === 'en' ? 'Driver' : 'Chofer') :
                                   field}
                                  {(field === 'sku' || field === 'name' || field === 'id' || field === 'carrier') ? <span className="text-rose-400">*</span> : null}
                                </label>
                                {isMatched && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                    <ShieldCheck className="w-3 h-3" />
                                    Auto-Detected
                                  </span>
                                )}
                              </div>
                              <select 
                                value={importMapping[field] || ''}
                                onChange={(e) => setImportMapping(prev => ({ ...prev, [field]: e.target.value }))}
                                className={`w-full bg-black/20 border rounded-xl p-3 text-white text-sm outline-none transition-all ${isMatched ? 'border-emerald-500/30' : 'border-white/10 focus:border-porteo-orange'}`}
                              >
                                <option value="">Select Column...</option>
                                {columns.map(col => (
                                  <option key={col} value={col}>{col}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <Search className="w-4 h-4 text-porteo-orange" />
                        Live Data Preview
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-white/5 text-white/40">
                            <tr>
                              {columns.map(col => (
                                <th key={col} className="p-3 font-bold whitespace-nowrap">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="text-white/60">
                            {previewData.map((row: any, i: number) => (
                              <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                {columns.map((col, j) => (
                                  <td key={j} className="p-3 truncate max-w-[150px]">{row[col]?.toString() || '-'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    </div>
                    <div className="p-8 border-t border-white/10 bg-white/5 backdrop-blur-md flex gap-4 sticky bottom-0 z-10">
                      <button 
                        onClick={() => {
                          setActiveModal(null);
                          setImportPreview(null);
                        }}
                        className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={executeMappedImport}
                        disabled={((!importMapping['sku'] && importTargetType === 'inventory') || !importMapping['name'])}
                        className={`flex-[2] py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                          ((!importMapping['sku'] && importTargetType === 'inventory') || !importMapping['name'])
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-porteo-orange text-white shadow-porteo-orange/20 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        {importConfidence === 100 ? 'Quick Import' : 'Complete Import'}
                      </button>
                    </div>
                  </>
                );
              })()}
            </ErrorBoundary>
          )}

                {activeModal === 'inbound' && (
                  <div className="space-y-4">
                    <p className="text-white/60">Register new inbound shipment for {selectedWarehouse?.name || 'Warehouse'}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Truck ID" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                      <input type="text" placeholder="Carrier" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                    </div>
                    <button 
                      onClick={() => {
                        const newOrder: TPLProcess = {
                          id: `tpl-${Date.now()}`,
                          truckId: 'TRK-NEW',
                          truckType: 'Full Truck',
                          customer: 'New Customer',
                          origin: 'External Factory',
                          destination: selectedWarehouse?.name || 'Warehouse',
                          status: 'collection',
                          steps: [
                            { id: 's1', label: { en: 'Collection', es: 'Recolección' }, status: 'in-progress', timestamp: new Date().toISOString() }
                          ]
                        };
                        setTplProcesses(prev => [newOrder, ...prev]);
                        addNotification(lang === 'en' ? 'Inbound order created! You can track it in the "Registered Orders" list on the dashboard.' : '¡Orden de entrada creada! Puede rastrearla en la lista de "Órdenes Registradas" en el dashboard.', 'operational');
                        setShowRegisteredOrders(true);
                        setActiveModal(null);
                      }}
                      className="w-full py-3 bg-porteo-orange text-white rounded-xl font-bold"
                    >
                      {lang === 'en' ? 'Create Inbound Order' : 'Crear Orden de Entrada'}
                    </button>
                  </div>
                )}
                {activeModal === 'outbound' && (
                  <div className="space-y-4">
                    <p className="text-white/60">Schedule outbound delivery from {selectedWarehouse?.name || 'Warehouse'}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Order #" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                      <input type="text" placeholder="Destination" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                    </div>
                    <button 
                      onClick={() => {
                        const newOrder: TPLProcess = {
                          id: `tpl-${Date.now()}`,
                          truckId: 'TRK-OUT',
                          truckType: 'Thorton',
                          customer: 'New Customer',
                          origin: selectedWarehouse?.name || 'Warehouse',
                          destination: 'Customer Site',
                          status: 'picking',
                          steps: [
                            { id: 's1', label: { en: 'Picking', es: 'Surtido' }, status: 'in-progress', timestamp: new Date().toISOString() }
                          ]
                        };
                        setTplProcesses(prev => [newOrder, ...prev]);
                        addNotification(lang === 'en' ? 'Outbound delivery scheduled! You can track it in the "Registered Orders" list on the dashboard.' : '¡Entrega de salida programada! Puede rastrearla en la lista de "Órdenes Registradas" en el dashboard.', 'operational');
                        setShowRegisteredOrders(true);
                        setActiveModal(null);
                      }}
                      className="w-full py-3 bg-porteo-blue text-white rounded-xl font-bold"
                    >
                      {lang === 'en' ? 'Schedule Outbound' : 'Programar Salida'}
                    </button>
                  </div>
                )}
                {activeModal === 'add-inventory' && (
                  <div className="space-y-4">
                    <p className="text-white/60">Add new SKU to inventory</p>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="SKU" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                      <input type="text" placeholder="Product Name" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                      <input type="number" placeholder="Quantity" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                      <div className="relative">
                        <input type="text" placeholder="Location" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white w-full" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                          <Zap className="w-3 h-3" />
                          AI Rec: A-12-04
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        addNotification(lang === 'en' ? 'Item saved to inventory!' : '¡Item guardado en el inventario!', 'operational');
                        setActiveModal(null);
                      }}
                      className="w-full py-3 bg-porteo-orange text-white rounded-xl font-bold"
                    >
                      Save Item
                    </button>
                  </div>
                )}
                {activeModal === 'import-inventory' && (
                  <div className="space-y-6">
                    <label className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-porteo-orange/50 transition-all cursor-pointer">
                      <input type="file" className="hidden" onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleGlobalDataImport(e.target.files[0]);
                          setActiveModal(null);
                        }
                      }} accept=".xlsx,.xls,.csv" />
                      <Download className="w-12 h-12 text-white/20" />
                      <p className="text-white/60 text-center">Click or drag and drop your CSV, Excel, or Sheets file here<br/><span className="text-xs opacity-50">Max file size: 10MB</span></p>
                    </label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          const csvContent = "SKU,Name,Quantity,Unit,Location,PalletId,Customer\nSKU001,Sample Item,100,units,A-01-01,P-001,Sample Customer";
                          const blob = new Blob([csvContent], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = "inventory_template.csv";
                          a.click();
                        }}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                      >
                        Download Template
                      </button>
                    </div>
                  </div>
                )}
                {activeModal === 'inventory-detail' && selectedInventoryItem && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest">SKU</p>
                        <p className="text-xl font-bold text-porteo-orange">{selectedInventoryItem.sku}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Customer</p>
                        <p className="text-xl font-bold text-white">{selectedInventoryItem.customer}</p>
                      </div>
                    </div>

                    {selectedInventoryItem.brand && (
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Brand' : 'Marca'}</p>
                          <p className="text-lg font-bold text-white">{selectedInventoryItem.brand}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Category' : 'Categoría'}</p>
                          <p className="text-lg font-bold text-white">{selectedInventoryItem.category}</p>
                        </div>
                      </div>
                    )}

                    {selectedInventoryItem.compatibility && (
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                        <p className="text-xs text-white/40 uppercase tracking-widest font-bold">{lang === 'en' ? 'Vehicle Compatibility' : 'Compatibilidad Vehicular'}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedInventoryItem.compatibility.map((model, i) => (
                            <span key={i} className="px-3 py-1 bg-porteo-orange/10 text-porteo-orange text-[10px] font-bold rounded-full border border-porteo-orange/20">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Current Stock</span>
                        <span className="text-white font-bold">{selectedInventoryItem.quantity} {selectedInventoryItem.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Location</span>
                        <span className="text-white font-bold">{selectedInventoryItem.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Pallet ID</span>
                        <span className="text-white font-bold">{selectedInventoryItem.palletId}</span>
                      </div>
                    </div>
                    
                    {/* AI Recommendation in Detail */}
                    <div className="p-4 bg-porteo-blue/10 border border-porteo-blue/30 rounded-2xl flex gap-3">
                      <div className="p-2 bg-porteo-blue/20 rounded-lg h-fit">
                        <Cpu className="w-4 h-4 text-porteo-blue" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-porteo-blue uppercase tracking-widest mb-1">AI Recommendation</p>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {lang === 'en' 
                            ? "This SKU has high turnover. Consider moving it to Zone A (near Dock 2) to reduce picking time by 15%."
                            : "Este SKU tiene alta rotación. Considere moverlo a la Zona A (cerca del Muelle 2) para reducir el tiempo de surtido en un 15%."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => addNotification(lang === 'en' ? 'Opening Edit Mode...' : 'Abriendo Modo Edición...', 'operational')}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                      >
                        Edit Item
                      </button>
                      <button 
                        onClick={() => setActiveModal('move-pallet')}
                        className="flex-1 py-3 bg-porteo-orange text-white rounded-xl font-bold"
                      >
                        Move Pallet
                      </button>
                    </div>
                  </div>
                )}
                {activeModal === 'move-pallet' && selectedInventoryItem && (
                  <div className="space-y-6">
                    <div className="p-6 bg-porteo-orange/10 border border-porteo-orange/30 rounded-3xl">
                      <h4 className="text-lg font-bold text-white mb-2">{lang === 'en' ? 'Relocate Pallet' : 'Reubicar Pallet'}</h4>
                      <p className="text-sm text-white/60">
                        {lang === 'en' 
                          ? `Moving ${selectedInventoryItem.sku} from ${selectedInventoryItem.location}` 
                          : `Moviendo ${selectedInventoryItem.sku} desde ${selectedInventoryItem.location}`}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'New Target Location' : 'Nueva Ubicación Destino'}</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-porteo-orange" />
                        <input 
                          type="text" 
                          placeholder="e.g. B-04-12" 
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-porteo-orange/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-3">{lang === 'en' ? 'Suggested Locations (AI)' : 'Ubicaciones Sugeridas (IA)'}</p>
                      <div className="flex flex-wrap gap-2">
                        {['A-02-05', 'A-01-12', 'B-03-01'].map(loc => (
                          <button 
                            key={loc}
                            onClick={() => setNewLocation(loc)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${newLocation === loc ? 'bg-porteo-orange border-porteo-orange text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setActiveModal('inventory-detail')}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                      >
                        {lang === 'en' ? 'Cancel' : 'Cancelar'}
                      </button>
                      <button 
                        disabled={!newLocation || isMovingPallet}
                        onClick={handleMovePallet}
                        className="flex-1 py-3 bg-porteo-orange text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isMovingPallet ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                            {lang === 'en' ? 'Moving...' : 'Moviendo...'}
                          </>
                        ) : (
                          lang === 'en' ? 'Confirm Move' : 'Confirmar Movimiento'
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {activeModal === 'gate-entry' && (
                  <div className="space-y-6">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                      <button 
                        onClick={() => setActiveGateTab('third-party')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeGateTab === 'third-party' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
                      >
                        {lang === 'en' ? 'Third Party Provider' : 'Proveedor Externo'}
                      </button>
                      <button 
                        onClick={() => setActiveGateTab('internal')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeGateTab === 'internal' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
                      >
                        {lang === 'en' ? 'Internal Fleet' : 'Flota Interna'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold">Truck ID / Plate</label>
                        <input 
                          type="text" 
                          placeholder="e.g. TRK-992" 
                          value={gateEntryForm.truckId}
                          onChange={(e) => setGateEntryForm({...gateEntryForm, truckId: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-porteo-orange/50 outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold">Driver Name</label>
                        <input 
                          type="text" 
                          placeholder="Full Name" 
                          value={gateEntryForm.driverName}
                          onChange={(e) => setGateEntryForm({...gateEntryForm, driverName: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-porteo-orange/50 outline-none" 
                        />
                      </div>
                      {activeGateTab === 'third-party' && (
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 uppercase font-bold">Carrier (TMS Sync)</label>
                          <select 
                            value={gateEntryForm.carrier}
                            onChange={(e) => setGateEntryForm({...gateEntryForm, carrier: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-porteo-orange/50 outline-none"
                          >
                            <option value="swift">Swift Transportation</option>
                            <option value="schneider">Schneider National</option>
                            <option value="werner">Werner Enterprises</option>
                            <option value="mercury">MercuryGate Partner</option>
                          </select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold">Load Type</label>
                        <select 
                          value={gateEntryForm.loadType}
                          onChange={(e) => setGateEntryForm({...gateEntryForm, loadType: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-porteo-orange/50 outline-none"
                        >
                          <option value="ftl">Full Truckload (FTL)</option>
                          <option value="ltl">Less Than Truckload (LTL)</option>
                          <option value="container">Intermodal Container</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold">Appointment Time</label>
                        <input 
                          type="time" 
                          value={gateEntryForm.appointmentTime}
                          onChange={(e) => setGateEntryForm({...gateEntryForm, appointmentTime: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-porteo-orange/50 outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold">Gate Assignment</label>
                        <select 
                          value={gateEntryForm.gateAssignment}
                          onChange={(e) => setGateEntryForm({...gateEntryForm, gateAssignment: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-porteo-orange/50 outline-none"
                        >
                          <option value="g1">Gate 1 (North)</option>
                          <option value="g2">Gate 2 (South)</option>
                          <option value="g3">Express Gate</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 bg-porteo-blue/10 border border-porteo-blue/30 rounded-2xl flex gap-3">
                      <Info className="w-5 h-5 text-porteo-blue shrink-0" />
                      <p className="text-[10px] text-white/60 leading-relaxed">
                        {lang === 'en' 
                          ? "TMS Integration Active: Data will be synchronized with Blue Yonder and MercuryGate systems upon registration." 
                          : "Integración TMS Activa: Los datos se sincronizarán con los sistemas Blue Yonder y MercuryGate al registrarse."}
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        if (!gateEntryForm.truckId || !gateEntryForm.driverName) {
                          addNotification(lang === 'en' ? 'Please fill in required fields.' : 'Por favor llene los campos requeridos.', 'alert');
                          return;
                        }
                        const newTruck = {
                          id: gateEntryForm.truckId,
                          carrier: gateEntryForm.carrier.charAt(0).toUpperCase() + gateEntryForm.carrier.slice(1),
                          type: gateEntryForm.loadType === 'ftl' ? 'Full Truck' : gateEntryForm.loadType === 'ltl' ? 'Thorton' : 'Container',
                          driver: gateEntryForm.driverName,
                          status: 'Waiting',
                          dock: '-',
                          eta: gateEntryForm.appointmentTime || 'N/A',
                          idling: false
                        };
                        setTrucks([newTruck, ...trucks]);
                        addNotification(lang === 'en' ? 'Truck registered and synchronized with TMS.' : 'Camión registrado y sincronizado con TMS.', 'operational');
                        setActiveModal(null);
                        setGateEntryForm({
                          truckId: '',
                          driverName: '',
                          carrier: 'swift',
                          loadType: 'ftl',
                          appointmentTime: '',
                          gateAssignment: 'g1'
                        });
                      }}
                      className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-all shadow-lg shadow-porteo-orange/20"
                    >
                      {lang === 'en' ? 'Register & Sync' : 'Registrar y Sincronizar'}
                    </button>
                  </div>
                )}
                {activeModal === 'shift-detail' && selectedRackDetails && (
                  <div className="space-y-6">
                    <div className="p-6 bg-porteo-orange/10 border border-porteo-orange/30 rounded-3xl flex items-center gap-4">
                      <div className="p-3 bg-porteo-orange/20 rounded-2xl">
                        <Users className="w-8 h-8 text-porteo-orange" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedRackDetails.name}</h3>
                        <p className="text-sm text-white/60">Lead: {selectedRackDetails.lead}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Personnel Count</p>
                        <p className="text-2xl font-bold text-white">{selectedRackDetails.count}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Performance</p>
                        <p className="text-2xl font-bold text-emerald-500">{selectedRackDetails.performance}%</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <h4 className="text-xs font-bold text-white/40 uppercase mb-3 tracking-widest">Active Tasks</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Picking Orders</span>
                          <span className="text-white font-bold">12</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Loading Units</span>
                          <span className="text-white font-bold">4</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveModal(null)}
                      className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-all"
                    >
                      {lang === 'en' ? 'Close Details' : 'Cerrar Detalles'}
                    </button>
                  </div>
                )}
                {activeModal === 'labor-optimization' && (
                  <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 scrollbar-hide">
                    <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/30 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-porteo-blue/20 rounded-2xl">
                          <Users className="w-8 h-8 text-porteo-blue" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Labor Optimization</h3>
                          <p className="text-sm text-white/60">AI-Driven Workforce Management</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveModal(null);
                          setModalLevel(1);
                        }}
                        className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    {modalLevel === 1 && (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <button 
                            onClick={() => setModalLevel(2)}
                            className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left hover:border-porteo-blue/50 transition-all group"
                          >
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold group-hover:text-porteo-blue transition-colors">Active Staff</p>
                            <p className="text-2xl font-bold text-white">124</p>
                            <p className="text-[8px] text-porteo-blue font-bold mt-1 uppercase tracking-widest">View Roster →</p>
                          </button>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Efficiency</p>
                            <p className="text-2xl font-bold text-emerald-500">92%</p>
                            <p className="text-[8px] text-rose-500 font-bold mt-1 uppercase tracking-widest">-8% Loss Analysis</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Utilization</p>
                            <p className="text-2xl font-bold text-porteo-blue">88%</p>
                            <p className="text-[8px] text-porteo-orange font-bold mt-1 uppercase tracking-widest">12% Idle Time</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-porteo-blue/30 transition-all group cursor-pointer" onClick={() => setModalLevel(10)}>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-porteo-blue transition-colors">Efficiency Loss Breakdown</h4>
                              <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-porteo-blue transition-colors" />
                            </div>
                            <div className="space-y-3">
                              {[
                                { reason: 'Travel Time', value: '4.2%', color: 'bg-porteo-orange' },
                                { reason: 'Equipment Wait', value: '2.1%', color: 'bg-rose-500' },
                                { reason: 'Admin/Paperwork', value: '1.7%', color: 'bg-porteo-blue' }
                              ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-white/60">{item.reason}</span>
                                    <span className="text-white font-bold">{item.value}</span>
                                  </div>
                                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-porteo-orange/30 transition-all group cursor-pointer" onClick={() => setModalLevel(11)}>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-porteo-orange transition-colors">Utilization Gap</h4>
                              <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-porteo-orange transition-colors" />
                            </div>
                            <div className="space-y-3">
                              {[
                                { reason: 'Unassigned Time', value: '6.5%', color: 'bg-porteo-blue' },
                                { reason: 'Shift Changeover', value: '3.5%', color: 'bg-emerald-500' },
                                { reason: 'Training/Safety', value: '2.0%', color: 'bg-porteo-orange' }
                              ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-white/60">{item.reason}</span>
                                    <span className="text-white font-bold">{item.value}</span>
                                  </div>
                                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                          <h4 className="text-xs font-bold text-white/40 uppercase mb-4 tracking-widest">Productivity by Shift</h4>
                          <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { name: 'Morning', value: 94 },
                                { name: 'Afternoon', value: 88 },
                                { name: 'Night', value: 76 }
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                  itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                  { [0, 1, 2].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#f59e0b'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="p-4 bg-porteo-orange/10 border border-porteo-orange/30 rounded-2xl flex gap-3 min-h-[80px] group relative cursor-pointer" onClick={() => setModalLevel(12)}>
                          <Zap className="w-5 h-5 text-porteo-orange shrink-0" />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[10px] font-bold text-porteo-orange uppercase">AI Live Insight</p>
                              <button 
                                onClick={() => {
                                  setIsLaborAdviceLoading(true);
                                  setTimeout(() => setIsLaborAdviceLoading(false), 1500);
                                }}
                                className="p-1 hover:bg-porteo-orange/20 rounded-md transition-all"
                                title="Refresh Insight"
                              >
                                <RefreshCw className={`w-3 h-3 text-porteo-orange ${isLaborAdviceLoading ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                            {isLaborAdviceLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-porteo-orange border-t-transparent animate-spin rounded-full" />
                                <p className="text-xs text-white/40 italic">AI is analyzing real-time data...</p>
                              </div>
                            ) : (
                              <p className="text-xs text-white/80 leading-relaxed font-medium">
                                {laborAdvice || (lang === 'en' 
                                  ? "AI Insight: Night shift productivity is 12% below average. Recommending 2 additional supervisors for the next 48 hours to stabilize throughput."
                                  : "Insight IA: La productividad del turno nocturno está un 12% por debajo del promedio. Se recomiendan 2 supervisores adicionales para las próximas 48 horas.")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <button 
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                          >
                            {lang === 'en' ? 'Back to Dashboard' : 'Volver al Dashboard'}
                          </button>
                          <button 
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                              setIsProcessing(true);
                              setTimeout(() => {
                                setIsProcessing(false);
                                addNotification(lang === 'en' ? 'Shift allocation optimized. Resources redistributed to Night Shift.' : 'Asignación de turnos optimizada. Recursos redistribuidos al Turno Nocturno.', 'operational');
                              }, 2000);
                            }}
                            className="flex-[2] py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-all disabled:opacity-50 shadow-lg shadow-porteo-orange/20"
                          >
                            {isProcessing ? (lang === 'en' ? 'Optimizing...' : 'Optimizando...') : (lang === 'en' ? 'Optimize Shift Allocation' : 'Optimizar Asignación de Turnos')}
                          </button>
                        </div>
                      </>
                    )}

                    {modalLevel === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-bold text-white">Active Staff Roster</h4>
                          <button onClick={() => setModalLevel(1)} className="text-xs text-porteo-blue hover:underline font-bold uppercase tracking-widest">Back</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'STF-001', name: 'Carlos Rodriguez', pos: 'Forklift Operator', shift: 'Morning', perf: '98%', status: 'Active', attendance: '100%', hours: '168h', bio: 'Expert in heavy machinery with 5+ years experience.' },
                            { id: 'STF-002', name: 'Elena Gomez', pos: 'Inventory Specialist', shift: 'Morning', perf: '95%', status: 'Active', attendance: '98%', hours: '160h', bio: 'Specializes in cycle counting and inventory reconciliation.' },
                            { id: 'STF-003', name: 'Marco Antonio', pos: 'Dock Supervisor', shift: 'Morning', perf: '92%', status: 'On Break', attendance: '95%', hours: '155h', bio: 'Managing dock operations and scheduling.' },
                            { id: 'STF-004', name: 'Sofia Ruiz', pos: 'Picker/Packer', shift: 'Afternoon', perf: '89%', status: 'Active', attendance: '92%', hours: '140h', bio: 'High-speed picking specialist.' },
                            { id: 'STF-005', name: 'David Luna', pos: 'Security Lead', shift: 'Night', perf: '99%', status: 'Active', attendance: '100%', hours: '172h', bio: 'Overseeing facility security and access control.' }
                          ].map((staff, i) => (
                            <button 
                              key={i} 
                              onClick={() => {
                                setSelectedStaff(staff);
                                setModalLevel(3);
                              }}
                              className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center hover:bg-white/10 hover:border-porteo-blue/30 transition-all text-left group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-porteo-blue/20 rounded-full flex items-center justify-center text-porteo-blue font-bold group-hover:bg-porteo-blue group-hover:text-white transition-all">
                                  {staff.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{staff.name}</p>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{staff.pos} • {staff.shift}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-emerald-500">{staff.perf} Perf.</p>
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${staff.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-porteo-orange/20 text-porteo-orange'}`}>
                                  {staff.status}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {modalLevel === 3 && selectedStaff && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-porteo-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {selectedStaff.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-white">{selectedStaff.name}</h4>
                              <p className="text-xs text-white/40 uppercase tracking-widest">{selectedStaff.pos}</p>
                            </div>
                          </div>
                          <button onClick={() => setModalLevel(2)} className="text-xs text-porteo-blue hover:underline font-bold uppercase tracking-widest">Back to List</button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Attendance</p>
                            <p className="text-xl font-bold text-white">{selectedStaff.attendance}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Work Hours</p>
                            <p className="text-xl font-bold text-white">{selectedStaff.hours}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Performance</p>
                            <p className="text-xl font-bold text-emerald-500">{selectedStaff.perf}</p>
                          </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                          <h5 className="text-xs font-bold text-white/40 uppercase mb-2 tracking-widest">Employee Bio & Notes</h5>
                          <p className="text-sm text-white/70 leading-relaxed italic">
                            "{selectedStaff.bio}"
                          </p>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-xs font-bold text-white/40 uppercase tracking-widest">Administrative Actions</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => addNotification(lang === 'en' ? `Re-assignment process started for ${selectedStaff.name}` : `Proceso de reasignación iniciado para ${selectedStaff.name}`, 'operational')}
                              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4 text-porteo-blue" />
                              {lang === 'en' ? 'Re-assign' : 'Reasignar'}
                            </button>
                            <button 
                              onClick={() => addNotification(lang === 'en' ? `Shift switch request sent for ${selectedStaff.name}` : `Solicitud de cambio de turno enviada para ${selectedStaff.name}`, 'operational')}
                              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                              <Clock className="w-4 h-4 text-porteo-orange" />
                              {lang === 'en' ? 'Switch Shift' : 'Cambiar Turno'}
                            </button>
                            <button 
                              onClick={() => addNotification(lang === 'en' ? `Move request registered for ${selectedStaff.name}` : `Solicitud de movimiento registrada para ${selectedStaff.name}`, 'operational')}
                              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                              <Move className="w-4 h-4 text-emerald-500" />
                              {lang === 'en' ? 'Make a Move' : 'Hacer Movimiento'}
                            </button>
                            <button 
                              onClick={() => addNotification(lang === 'en' ? `Full profile report generated for ${selectedStaff.name}` : `Reporte de perfil completo generado para ${selectedStaff.name}`, 'operational')}
                              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-white/40" />
                              {lang === 'en' ? 'Full Profile' : 'Perfil Completo'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {modalLevel === 10 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <h4 className="text-xl font-bold text-white mb-2">Efficiency Loss Root Cause</h4>
                          <p className="text-sm text-white/60">Detailed breakdown of the 8% efficiency loss detected in the morning shift.</p>
                        </div>
                        <div className="space-y-4">
                          {[
                            { reason: 'Travel Time (Excessive distance between picks)', value: '4.2%', impact: 'High', color: 'text-porteo-orange' },
                            { reason: 'Equipment Wait (Forklift availability)', value: '2.1%', impact: 'Medium', color: 'text-rose-500' },
                            { reason: 'Admin/Paperwork (Manual entry delays)', value: '1.7%', impact: 'Low', color: 'text-porteo-blue' }
                          ].map((item, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-white">{item.reason}</p>
                                <p className={`text-[10px] font-bold uppercase ${item.color}`}>{item.impact} Impact</p>
                              </div>
                              <span className="text-lg font-bold text-white">{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => setModalLevel(1)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                        >
                          Back
                        </button>
                      </div>
                    )}

                    {modalLevel === 11 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <h4 className="text-xl font-bold text-white mb-2">Utilization Gap Optimization</h4>
                          <p className="text-sm text-white/60">Identifying opportunities to close the 12% idle time gap.</p>
                        </div>
                        <div className="space-y-4">
                          {[
                            { reason: 'Unassigned Time (Between tasks)', value: '6.5%', action: 'Auto-assign next task' },
                            { reason: 'Shift Changeover (Overlap delays)', value: '3.5%', action: 'Staggered shift starts' },
                            { reason: 'Training/Safety (On-the-job)', value: '2.0%', action: 'Digital training modules' }
                          ].map((item, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-white">{item.reason}</p>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase">Action: {item.action}</p>
                              </div>
                              <span className="text-lg font-bold text-white">{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => setModalLevel(1)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                        >
                          Back
                        </button>
                      </div>
                    )}

                    {modalLevel === 12 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-porteo-orange/10 border border-porteo-orange/30 rounded-3xl">
                          <h4 className="text-xl font-bold text-white mb-2">AI Optimization Plan</h4>
                          <p className="text-sm text-white/60">Automated strategy to recover 5% of efficiency loss.</p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-porteo-orange rounded-full" />
                            <p className="text-sm text-white/80">Re-slotting high-velocity items to Zone A.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-porteo-orange rounded-full" />
                            <p className="text-sm text-white/80">Dynamic task interleaving for forklift operators.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-porteo-orange rounded-full" />
                            <p className="text-sm text-white/80">Real-time congestion alerts for picking aisles.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            addNotification(lang === 'en' ? 'Labor Optimization Plan Applied' : 'Plan de Optimización Laboral Aplicado', 'operational');
                            setModalLevel(1);
                          }}
                          className="w-full py-4 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/80 transition-all"
                        >
                          APPLY PLAN
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'slotting-ai' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-porteo-orange/10 border border-porteo-orange/30 rounded-3xl flex items-center gap-4">
                      <Cpu className="w-10 h-10 text-porteo-orange" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Slotting AI</h3>
                        <p className="text-sm text-white/60">Automated SKU placement</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                      {isSlottingLoading ? (
                        <div className="flex items-center gap-3 py-4">
                          <div className="w-4 h-4 border-2 border-porteo-orange border-t-transparent animate-spin rounded-full" />
                          <p className="text-xs text-white/40 italic">SR Warehouse Director is analyzing inventory velocity...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-white/80 leading-relaxed font-medium">
                            {slottingAdvice || (lang === 'en' 
                              ? "AI suggests relocating 12 high-velocity SKUs to Zone A to reduce picking travel time by 15%." 
                              : "IA sugiere reubicar 12 SKUs de alta velocidad a la Zona A para reducir el tiempo de viaje de surtido en un 15%.")}
                          </p>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-porteo-orange w-3/4" />
                          </div>
                          <p className="text-[10px] text-white/40 uppercase">75% Optimization Score</p>
                        </div>
                      )}
                    </div>
                    <button 
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => {
                          console.log('Slotting strategy applied');
                          setIsProcessing(false);
                          setActiveModal(null);
                        }, 2000);
                      }}
                      className="w-full py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/80 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (lang === 'en' ? 'Applying Strategy...' : 'Aplicando Estrategia...') : (lang === 'en' ? 'Apply Slotting Strategy' : 'Aplicar Estrategia de Slotting')}
                    </button>
                  </div>
                )}
                {activeModal === 'cargo-visibility' && (
                  <div className="space-y-6">
                    {modalLevel === 1 && (
                      <>
                        <div className="p-6 bg-porteo-orange/10 border border-porteo-orange/30 rounded-3xl">
                          <p className="text-sm text-white/80">Real-time dynamic visibility of all cargo in transit and storage.</p>
                        </div>
                        <div className="space-y-4">
                          {[
                            { id: 'TRK-902', type: 'Shipment', status: 'Unloading', location: 'Dock 4' },
                            { id: 'CON-441', type: 'Container', status: 'In Transit', location: 'Pacific Ocean' },
                            { id: 'PAL-112', type: 'Pallet', status: 'In Storage', location: 'Rack A-04' }
                          ].map((item, i) => (
                            <div 
                              key={i} 
                              onClick={() => {
                                setSelectedSubItem(item);
                                setModalLevel(2);
                              }}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center hover:border-porteo-orange/50 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-porteo-orange/20 rounded-lg text-porteo-orange">
                                  <Package className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-white font-bold group-hover:text-porteo-orange transition-colors">{item.type} #{item.id}</p>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Status: {item.status}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-porteo-orange font-bold">GPS ACTIVE</p>
                                <ChevronRight className="w-4 h-4 text-white/20 inline-block ml-2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {modalLevel === 2 && selectedSubItem && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-white">{selectedSubItem?.type} #{selectedSubItem?.id}</h4>
                              <p className="text-sm text-white/40">Current Location: {selectedSubItem?.location}</p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                              On Schedule
                            </span>
                          </div>
                          
                          {/* Level 3: Telemetry Data */}
                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Temperature</p>
                              <p className="text-lg font-bold text-white">4.2°C</p>
                            </div>
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Humidity</p>
                              <p className="text-lg font-bold text-white">45%</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-porteo-blue/10 border border-porteo-blue/30 rounded-2xl flex gap-3">
                          {isCargoLoading ? (
                            <div className="flex items-center gap-3 py-2">
                              <div className="w-4 h-4 border-2 border-porteo-blue border-t-transparent animate-spin rounded-full" />
                              <p className="text-xs text-white/40 italic">Predictive ML model is analyzing historical patterns...</p>
                            </div>
                          ) : (
                            <>
                              <Info className="w-5 h-5 text-porteo-blue shrink-0" />
                              <p className="text-xs text-white/80 leading-relaxed">
                                {cargoPrediction || (lang === 'en' 
                                  ? "AI Prediction: Estimated arrival at destination in 4h 12m. No delays expected based on current traffic and weather patterns." 
                                  : "Predicción IA: Llegada estimada al destino en 4h 12m. No se esperan retrasos basados en el tráfico y clima actual.")}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button"
                            onClick={() => setModalLevel(3)}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                          >
                            View Full History
                          </button>
                          <button 
                            type="button"
                            onClick={() => setShowLiveMap(true)}
                            className="flex-1 py-3 bg-porteo-orange text-white rounded-xl font-bold"
                          >
                            Live Map
                          </button>
                        </div>

                        {showLiveMap && (
                          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8">
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                              onClick={() => setShowLiveMap(false)}
                            />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative w-full max-w-4xl aspect-video bg-[#0A0A0A] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
                            >
                              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                                <div className="px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                  <span className="text-xs font-bold text-white uppercase tracking-widest">Live Tracking Active</span>
                                </div>
                                <div className="px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full">
                                  <span className="text-[10px] text-white/60 uppercase font-bold">Vessel: {selectedSubItem?.id || 'TRK-902'}</span>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => setShowLiveMap(false)}
                                className="absolute top-6 right-6 z-10 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"
                              >
                                <X className="w-6 h-6" />
                              </button>

                              {/* Simulated Map Background */}
                              <div className="absolute inset-0 opacity-20">
                                <svg width="100%" height="100%" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M100 100C150 80 200 120 250 110C300 100 350 60 400 70C450 80 500 130 550 120C600 110 650 70 700 80" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                                  <path d="M50 300C120 280 180 320 250 310C320 300 380 250 450 260C520 270 580 330 650 320C720 310 780 260 850 270" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                                  <circle cx="200" cy="150" r="2" fill="white" />
                                  <circle cx="450" cy="280" r="2" fill="white" />
                                  <circle cx="600" cy="100" r="2" fill="white" />
                                </svg>
                              </div>

                              {/* Animated Route */}
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
                                <motion.path 
                                  d="M150 350 Q 300 300, 450 200 T 700 100" 
                                  stroke="#F27D26" 
                                  strokeWidth="3" 
                                  fill="none"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.circle 
                                  r="6" 
                                  fill="#F27D26"
                                  initial={{ offset: 0 }}
                                  animate={{ offset: 1 }}
                                >
                                  <animateMotion dur="5s" repeatCount="indefinite" path="M150 350 Q 300 300, 450 200 T 700 100" />
                                </motion.circle>
                                <circle cx="150" cy="350" r="4" fill="#3b82f6" />
                                <circle cx="700" cy="100" r="4" fill="#10b981" />
                                <text x="140" y="375" fill="white" fontSize="10" className="font-bold">ORIGIN</text>
                                <text x="680" y="125" fill="white" fontSize="10" className="font-bold">DESTINATION</text>
                              </svg>

                              <div className="absolute bottom-8 left-8 right-8 grid grid-cols-4 gap-4">
                                {[
                                  { label: 'Speed', value: '18.4 knots' },
                                  { label: 'Heading', value: '284° NW' },
                                  { label: 'ETA', value: '4h 12m' },
                                  { label: 'Location', value: '1023 W Little York Rd' },
                                  { label: 'Distance', value: '4 blocks away' },
                                  { label: 'Status', value: 'On Time' },
                                  { label: 'Signal', value: 'AES-256 Encrypted' },
                                  { label: 'Device', value: 'Geotab GO9' }
                                ].map((stat, i) => (
                                  <div key={i} className="p-4 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl">
                                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{stat.label}</p>
                                    <p className="text-sm font-bold text-white">{stat.value}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    )}
                    {modalLevel === 3 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-lg font-bold text-white">Event History</h4>
                        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                          {[
                            { time: '08:45 AM', event: 'Departed Port of Long Beach', status: 'completed' },
                            { time: '10:12 AM', event: 'Customs Clearance Approved', status: 'completed' },
                            { time: '01:30 PM', event: 'Entered Highway 405', status: 'completed' },
                            { time: '03:45 PM', event: 'Arrived at Distribution Center', status: 'pending' }
                          ].map((step, i) => (
                            <div key={i} className="relative pl-10">
                              <div className={`absolute left-3 top-1.5 w-2 h-2 rounded-full ${step.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                              <p className="text-xs font-bold text-white">{step.event}</p>
                              <p className="text-[10px] text-white/40">{step.time}</p>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => setModalLevel(2)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                        >
                          Back to Summary
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'interop-hub' && (
                  <div className="space-y-6">
                    {modalLevel === 1 && (
                      <>
                        <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/30 rounded-3xl">
                          <p className="text-sm text-white/80">Integration hub for ERP, TMS, and Port Authority systems.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: 'SAP ERP', status: 'Connected', uptime: '99.9%', latency: '45ms' },
                            { name: 'Oracle TMS', status: 'Connected', uptime: '99.8%', latency: '120ms' },
                            { name: 'Port Authority', status: 'Connected', uptime: '100%', latency: '210ms' },
                            { name: 'Customs API', status: 'Connected', uptime: '99.5%', latency: '85ms' }
                          ].map((sys, i) => (
                            <div 
                              key={i} 
                              onClick={() => {
                                setSelectedSubItem(sys);
                                setModalLevel(2);
                              }}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-2 hover:border-porteo-blue/50 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white group-hover:text-porteo-blue transition-colors">{sys.name}</span>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest">{sys.status}</span>
                                <ChevronRight className="w-3 h-3 text-white/20" />
                              </div>
                            </div>
                          ))}
                        </div>
                        <button 
                          disabled={isSyncingSystems}
                          onClick={() => {
                            setIsSyncingSystems(true);
                            setTimeout(() => {
                              setIsSyncingSystems(false);
                              addNotification(lang === 'en' ? 'All systems synchronized successfully.' : 'Todos los sistemas sincronizados con éxito.', 'operational');
                            }, 2000);
                          }}
                          className="w-full py-3 bg-porteo-blue text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSyncingSystems ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                              {lang === 'en' ? 'Syncing...' : 'Sincronizando...'}
                            </>
                          ) : (
                            lang === 'en' ? 'Sync All Systems' : 'Sincronizar Sistemas'
                          )}
                        </button>
                        <button 
                          onClick={() => {
                            const name = prompt(lang === 'en' ? 'Enter System Name (e.g. NetSuite, Microsoft Dynamics):' : 'Ingrese nombre del sistema (ej. NetSuite, Microsoft Dynamics):');
                            if (name) {
                              addNotification(lang === 'en' ? `Initializing connection with ${name}...` : `Inicializando conexión con ${name}...`, 'operational');
                              setTimeout(() => {
                                addNotification(lang === 'en' ? `Connection with ${name} established.` : `Conexión con ${name} establecida.`, 'operational');
                              }, 1500);
                            }
                          }}
                          className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                        >
                          {lang === 'en' ? '+ Connect New System (Custom API)' : '+ Conectar Nuevo Sistema (API Personalizada)'}
                        </button>
                      </>
                    )}
                    {modalLevel === 2 && selectedSubItem && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <h4 className="text-xl font-bold text-white mb-2">{selectedSubItem?.name} Connection</h4>
                          <p className="text-sm text-white/40">Endpoint: https://api.porteo.com/v4/sync/{(selectedSubItem?.name?.toLowerCase() || '').replace(' ', '-')}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Uptime</p>
                              <p className="text-lg font-bold text-emerald-500">{selectedSubItem?.uptime}</p>
                            </div>
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Latency</p>
                              <p className="text-lg font-bold text-white">{selectedSubItem?.latency}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-xs font-bold text-white/40 uppercase tracking-widest">Recent Data Packets</h5>
                          {dataPackets.map((pkt, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={pkt.id} 
                              className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center"
                            >
                              <div>
                                <p className="text-xs font-bold text-white">{pkt.type}</p>
                                <p className="text-[10px] text-white/40">{pkt.id}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-white/60">{pkt.size}</p>
                                <p className="text-[10px] text-white/40">{pkt.time}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="flex gap-4">
                          <button 
                            onClick={() => setModalLevel(3)}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                          >
                            View Logs
                          </button>
                          <button 
                            onClick={() => {
                              const endpoint = prompt(lang === 'en' ? 'Enter new API endpoint:' : 'Ingrese nuevo endpoint de API:', `https://api.porteo.com/v4/sync/${(selectedSubItem?.name?.toLowerCase() || '').replace(' ', '-')}`);
                              if (endpoint) {
                                addNotification(lang === 'en' ? 'Configuration updated.' : 'Configuración actualizada.', 'operational');
                              }
                            }}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                          >
                            Edit Config
                          </button>
                          <button 
                            disabled={isProcessing}
                            onClick={() => {
                              setIsProcessing(true);
                              setTimeout(() => {
                                setIsProcessing(false);
                                addNotification(lang === 'en' ? 'Connection re-authenticated successfully.' : 'Conexión re-autenticada con éxito.', 'operational');
                              }, 1500);
                            }}
                            className="flex-1 py-3 bg-porteo-blue text-white rounded-xl font-bold disabled:opacity-50"
                          >
                            {isProcessing ? (lang === 'en' ? 'Connecting...' : 'Conectando...') : 'Reconnect'}
                          </button>
                        </div>
                      </div>
                    )}
                    {modalLevel === 3 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-lg font-bold text-white">System Logs</h4>
                        <div className="p-4 bg-black rounded-2xl border border-white/10 font-mono text-[10px] text-emerald-500/80 overflow-y-auto h-60 scrollbar-hide">
                          <p>[2026-03-03 09:45:12] INFO: Initializing handshake with {selectedSubItem?.name}...</p>
                          <p>[2026-03-03 09:45:13] SUCCESS: Handshake complete. Protocol: TLS 1.3</p>
                          <p>[2026-03-03 09:45:15] INFO: Fetching delta updates for SKU_MASTER...</p>
                          <p>[2026-03-03 09:45:18] SUCCESS: 142 records updated.</p>
                          <p>[2026-03-03 09:46:01] INFO: Heartbeat signal received.</p>
                          <p>[2026-03-03 09:47:01] INFO: Heartbeat signal received.</p>
                          <p>[2026-03-03 09:48:01] INFO: Heartbeat signal received.</p>
                          <p className="animate-pulse">_</p>
                        </div>
                        <button 
                          onClick={() => setModalLevel(2)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                        >
                          Back to Connection
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'risk-assessment' && (
                  <div className="space-y-6">
                    {modalLevel === 1 && (
                      <>
                        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-3xl">
                          <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-white/80">Operational risk overview and asset protection status.</p>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-rose-500">84/100</p>
                              <p className="text-[10px] text-white/40 uppercase font-bold">Risk Score</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {[
                            { id: 'RSK-101', title: 'Unauthorized Access Attempt', severity: 'High', area: 'Main Gate', time: '14m ago' },
                            { id: 'RSK-102', title: 'Temperature Variance', severity: 'Medium', area: 'Cold Storage B', time: '1h ago' },
                            { id: 'RSK-103', title: 'Unscheduled Truck Arrival', severity: 'Low', area: 'Dock 7', time: '3h ago' }
                          ].map((risk, i) => (
                            <div 
                              key={i} 
                              onClick={() => {
                                setSelectedSubItem(risk);
                                setModalLevel(2);
                              }}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center hover:border-rose-500/50 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${risk.severity === 'High' ? 'bg-rose-500/20 text-rose-500' : 'bg-porteo-orange/20 text-porteo-orange'}`}>
                                  <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white group-hover:text-rose-500 transition-colors">{risk.title}</p>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{risk.area} • {risk.time}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-white/20" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {modalLevel === 2 && selectedSubItem && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-white">{selectedSubItem?.title}</h4>
                              <p className="text-sm text-white/40">Incident ID: {selectedSubItem?.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${selectedSubItem?.severity === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-porteo-orange/10 text-porteo-orange border-porteo-orange/20'}`}>
                              {selectedSubItem?.severity} Priority
                            </span>
                          </div>
                          <p className="text-sm text-white/70 leading-relaxed">
                            AI Analysis: Detected unusual activity pattern at {selectedSubItem?.area}. Security protocols suggest immediate verification of credentials and physical inspection.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setModalLevel(3)}
                            className="py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                          >
                            View CCTV Feed
                          </button>
                          <button 
                            disabled={isProcessing}
                            onClick={() => {
                              setIsProcessing(true);
                              setTimeout(() => {
                                addNotification(lang === 'en' 
                                  ? `Security team dispatched to ${selectedSubItem?.area}.` 
                                  : `Equipo de seguridad enviado a ${selectedSubItem?.area}.`, 'operational');
                                addNotification(lang === 'en'
                                  ? `Communication Channels Active: Radio, Push, Email.`
                                  : `Canales de Comunicación Activos: Radio, Push, Correo.`, 'operational');
                                setIsProcessing(false);
                                setModalLevel(1);
                              }, 2000);
                            }}
                            className="py-3 bg-rose-500 text-white rounded-xl font-bold disabled:opacity-50"
                          >
                            {isProcessing ? (lang === 'en' ? 'Dispatching...' : 'Enviando...') : (lang === 'en' ? 'Dispatch Team' : 'Enviar Equipo')}
                          </button>
                        </div>
                      </div>
                    )}
                    {modalLevel === 3 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-lg font-bold text-white">Live CCTV Feed: {selectedSubItem?.area}</h4>
                        <div className="aspect-video bg-black rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                          <img 
                            src={`https://picsum.photos/seed/${selectedSubItem?.id}/800/450?grayscale`} 
                            alt="CCTV Feed" 
                            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                          <div className="absolute top-4 left-4 flex items-center gap-2 px-2 py-1 bg-rose-500/80 rounded text-[8px] font-bold text-white uppercase tracking-widest z-10">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            Live • {selectedSubItem?.area}
                          </div>
                          <div className="absolute bottom-4 left-4 text-[8px] font-mono text-white/60 z-10">
                            REC: {new Date().toISOString()} | AES-256 ENCRYPTED
                          </div>
                          <div className="text-white/20 text-center relative z-10">
                            <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p className="text-xs font-mono">STREAM_ID: {selectedSubItem?.id}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setModalLevel(2)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                        >
                          Back to Incident
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'secure-docs' && (
                  <div className="space-y-6">
                    {modalLevel === 1 && (
                      <>
                        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-3xl">
                          <p className="text-sm text-white/80">Encrypted vault for sensitive documentation exchange.</p>
                          <div className="mt-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">AES-256 Protocol Active</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setIsProcessing(true);
                            import('./utils/security').then(m => {
                              if (m.SecurityUtils.verifyProtocol()) {
                                setTimeout(() => {
                                  setIsProtocolVerified(true);
                                  setIsProcessing(false);
                                }, 1000);
                              }
                            });
                          }}
                          className={`w-full py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            isProtocolVerified 
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {isProcessing ? (
                            <div className="w-3 h-3 border-2 border-white/40 border-t-white animate-spin rounded-full" />
                          ) : isProtocolVerified ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : null}
                          {isProtocolVerified 
                            ? (lang === 'en' ? 'Security Protocol Verified' : 'Protocolo de Seguridad Verificado')
                            : (lang === 'en' ? 'Verify Security Protocol' : 'Verificar Protocolo de Seguridad')}
                        </button>
                        <div className="space-y-3">
                          {[
                            { name: 'Customs_Declaration_V2.pdf', type: 'Legal', size: '1.2MB', date: '2026-03-01' },
                            { name: 'Hazardous_Material_Cert.pdf', type: 'Safety', size: '450KB', date: '2026-02-28' },
                            { name: 'Insurance_Policy_2026.pdf', type: 'Financial', size: '3.1MB', date: '2026-02-15' }
                          ].map((doc, i) => (
                            <div 
                              key={i} 
                              onClick={() => {
                                setSelectedSubItem(doc);
                                setModalLevel(2);
                              }}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center hover:border-rose-500/50 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white group-hover:text-rose-500 transition-colors">{doc.name}</p>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{doc.type} • {doc.size}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-white/20" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {modalLevel === 2 && selectedSubItem && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <h4 className="text-xl font-bold text-white mb-2">{selectedSubItem?.name}</h4>
                          <p className="text-sm text-white/40">Uploaded on {selectedSubItem?.date}</p>
                          
                          <div className="mt-6 space-y-4">
                            <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                              <span className="text-xs text-white/60">Encryption Standard</span>
                              <span className="text-xs text-emerald-500 font-mono">AES-256-GCM</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                              <span className="text-xs text-white/60">Digital Signature</span>
                              <span className="text-xs text-emerald-500 font-mono">VERIFIED</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => {
                              setIsDownloading(true);
                              setTimeout(() => {
                                const element = document.createElement("a");
                                const file = new Blob(["Mock encrypted content for " + selectedSubItem?.name], {type: 'text/plain'});
                                element.href = URL.createObjectURL(file);
                                element.download = selectedSubItem?.name || "document.pdf";
                                document.body.appendChild(element);
                                element.click();
                                setIsDownloading(false);
                                addNotification(lang === 'en' ? 'Encrypted file downloaded successfully.' : 'Archivo cifrado descargado con éxito.', 'operational');
                              }, 1500);
                            }}
                            disabled={isDownloading}
                            className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isDownloading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                {lang === 'en' ? 'Downloading...' : 'Descargando...'}
                              </>
                            ) : (
                              lang === 'en' ? 'Download' : 'Descargar'
                            )}
                          </button>
                          <button 
                            onClick={() => setModalLevel(3)}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                          >
                            Audit Trail
                          </button>
                        </div>
                      </div>
                    )}
                    {modalLevel === 3 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-lg font-bold text-white">Document Audit Trail</h4>
                        <div className="space-y-4">
                          {[
                            { user: 'Admin', action: 'Uploaded Document', time: '2026-03-01 10:00 AM' },
                            { user: 'Customs Agent', action: 'Viewed Document', time: '2026-03-01 02:30 PM' },
                            { user: 'System', action: 'Verified Signature', time: '2026-03-01 02:31 PM' }
                          ].map((log, i) => (
                            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10">
                              <p className="text-xs font-bold text-white">{log.action}</p>
                              <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-white/40">By {log.user}</span>
                                <span className="text-[10px] text-white/40">{log.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setModalLevel(2)}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                          >
                            Back
                          </button>
                          <button 
                            onClick={() => {
                              addNotification(lang === 'en' ? 'Exporting audit trail to CSV...' : 'Exportando historial de auditoría a CSV...', 'operational');
                              setTimeout(() => {
                                addNotification(lang === 'en' ? 'Audit trail exported successfully.' : 'Historial de auditoría exportado con éxito.', 'operational');
                              }, 1000);
                            }}
                            className="flex-1 py-3 bg-porteo-orange text-white rounded-xl font-bold"
                          >
                            Export Log
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'predictive-analytics' && (
                  <div className="space-y-6">
                    {modalLevel === 1 && (
                      <>
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
                          <p className="text-sm text-white/80">Predictive analysis for cargo rotation and storage optimization.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <h4 className="text-xs font-bold text-white/40 uppercase mb-4">Projected Cargo Rotation</h4>
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={[
                                { name: 'W1', value: 400 },
                                { name: 'W2', value: 300 },
                                { name: 'W3', value: 600 },
                                { name: 'W4', value: 800 }
                              ]}>
                                <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorValue)" strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setModalLevel(2)}
                            className="py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                          >
                            Rotation Details
                          </button>
                          <button 
                            onClick={() => exportReport('Rotation Analysis', { categories: [
                              { category: 'Electronics', rotation: '12.4x', trend: '+2.1%', health: 'Optimal' },
                              { category: 'Apparel', rotation: '8.2x', trend: '-0.5%', health: 'Slow' },
                              { category: 'Perishables', rotation: '24.1x', trend: '+5.4%', health: 'Critical' }
                            ]})}
                            className="py-3 bg-emerald-500 text-white rounded-xl font-bold"
                          >
                            Export Report
                          </button>
                        </div>
                      </>
                    )}
                    {modalLevel === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-lg font-bold text-white">Rotation by Category</h4>
                        <div className="space-y-4">
                          {[
                            { category: 'Electronics', rotation: '12.4x', trend: '+2.1%', health: 'Optimal', details: 'High demand in US market, low stock in Mexico.' },
                            { category: 'Apparel', rotation: '8.2x', trend: '-0.5%', health: 'Slow', details: 'Seasonal transition, high inventory in Zone B.' },
                            { category: 'Perishables', rotation: '24.1x', trend: '+5.4%', health: 'Critical', details: 'Fast rotation required, priority unloading active.' }
                          ].map((cat, i) => (
                            <button 
                              key={i} 
                              onClick={() => {
                                setSelectedCategory(cat);
                                setModalLevel(3);
                              }}
                              className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center hover:border-porteo-orange/50 transition-all group"
                            >
                              <div className="text-left">
                                <p className="text-sm font-bold text-white group-hover:text-porteo-orange transition-colors">{cat.category}</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">Trend: {cat.trend}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-white">{cat.rotation}</p>
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${cat.health === 'Optimal' ? 'bg-emerald-500/20 text-emerald-500' : cat.health === 'Slow' ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-rose-500/20 text-rose-500'}`}>
                                  {cat.health}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setModalLevel(1)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                        >
                          Back to Overview
                        </button>
                      </div>
                    )}
                    {modalLevel === 3 && selectedCategory && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <h4 className="text-xl font-bold text-white mb-2">{selectedCategory.category} Analysis</h4>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {selectedCategory.details}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Stock Level</p>
                            <p className="text-lg font-bold text-white">4,200 units</p>
                          </div>
                          <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Avg. Stay</p>
                            <p className="text-lg font-bold text-white">3.2 days</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            disabled={isProcessing}
                            onClick={() => {
                              setIsRebalancing(true);
                              setTimeout(() => {
                                setIsRebalancing(false);
                                addNotification(lang === 'en' ? `Stock rebalancing strategy applied for ${selectedCategory.category}. 120 pallets scheduled for relocation.` : `Estrategia de rebalanceo de stock aplicada para ${selectedCategory.category}. 120 pallets programados para reubicación.`, 'operational');
                                setModalLevel(1);
                              }, 3000);
                            }}
                            className="flex-1 py-3 bg-porteo-orange text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isProcessing ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                {lang === 'en' ? 'Processing...' : 'Procesando...'}
                              </>
                            ) : (
                              lang === 'en' ? 'Rebalance' : 'Rebalancear'
                            )}
                          </button>
                          <button 
                            onClick={() => setModalLevel(2)}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'port-city-sync' && (
                  <div className="space-y-6">
                    {modalLevel === 1 && (
                      <>
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
                          <p className="text-sm text-white/80">Synchronization of port operations with city traffic and logistics routes.</p>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1">Optimal Departure Window</p>
                            <p className="text-lg font-bold text-white">10:30 PM - 04:00 AM</p>
                            <p className="text-[10px] text-emerald-500">Low traffic congestion projected</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => setModalLevel(2)}
                              className="py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                            >
                              Route Map
                            </button>
                            <button 
                              disabled={isProcessing}
                              onClick={() => {
                                setIsProcessing(true);
                                setTimeout(() => {
                                  setIsProcessing(false);
                                  addNotification(lang === 'en' ? 'All logistics routes synchronized with city traffic data. 3 routes updated.' : 'Todas las rutas logísticas sincronizadas con datos de tráfico de la ciudad. 3 rutas actualizadas.', 'operational');
                                }, 2000);
                              }}
                              className="py-3 bg-emerald-500 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {isProcessing ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                  {lang === 'en' ? 'Syncing...' : 'Sincronizando...'}
                                </>
                              ) : (
                                lang === 'en' ? 'Sync Now' : 'Sincronizar Ahora'
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {modalLevel === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h4 className="text-lg font-bold text-white">Active Route Optimization</h4>
                        <div className="aspect-video bg-[#0A0A0A] rounded-2xl border border-white/10 relative overflow-hidden">
                          {/* Simulated Map with better visuals */}
                          <div className="absolute inset-0 opacity-40">
                            <svg width="100%" height="100%" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0 50H800M0 150H800M0 250H800M0 350H800" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
                              <path d="M100 0V450M300 0V450M500 0V450M700 0V450" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
                              <path d="M50 50L150 150L300 100L500 200L700 150" stroke="#F27D26" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="4 4" />
                              <circle cx="50" cy="50" r="4" fill="#F27D26" fillOpacity="0.5" />
                              <circle cx="700" cy="150" r="4" fill="#10b981" fillOpacity="0.5" />
                            </svg>
                          </div>
                          
                          {/* Animated Route */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
                            <motion.path 
                              d="M100 400 Q 400 350, 700 50" 
                              stroke="#F27D26" 
                              strokeWidth="3" 
                              fill="none"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.circle r="6" fill="#F27D26">
                              <animateMotion dur="4s" repeatCount="indefinite" path="M100 400 Q 400 350, 700 50" />
                            </motion.circle>
                          </svg>

                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Optimal Flow</span>
                            </div>
                          </div>
                          
                          <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/80 backdrop-blur-md rounded-xl border border-white/10">
                            <p className="text-[10px] text-white/60 uppercase font-bold">Current Route: Port {"->"} Hub A</p>
                            <p className="text-xs text-emerald-500 font-bold">Traffic: Light (8m delay avoided)</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                            <span className="text-xs text-white/60">Fuel Efficiency</span>
                            <span className="text-xs text-emerald-500 font-bold">+12%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                            <span className="text-xs text-white/60">CO2 Reduction</span>
                            <span className="text-xs text-emerald-500 font-bold">0.8 Tons</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setModalLevel(1)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold"
                        >
                          Back to Overview
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'ai-tasks' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-porteo-orange/10 border border-porteo-orange/30 rounded-3xl">
                      <h3 className="text-xl font-bold text-white mb-2">{aiTasks.length} Pending AI Tasks</h3>
                      <p className="text-sm text-white/60">Automated optimizations requiring supervisor approval.</p>
                    </div>
                    {modalLevel === 1 && (
                      <div className="space-y-3">
                        {aiTasks.map((task, i) => (
                          <button 
                            key={task.id} 
                            onClick={() => {
                              setSelectedTask(task);
                              setModalLevel(2);
                            }}
                            className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center group hover:border-porteo-orange/50 transition-all text-left"
                          >
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-porteo-orange transition-colors">{task.task}</p>
                              <div className="flex gap-2 mt-1">
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${task.priority === 'High' ? 'bg-rose-500/20 text-rose-500' : 'bg-porteo-orange/20 text-porteo-orange'}`}>
                                  {task.priority}
                                </span>
                                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">
                                  {task.impact}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-porteo-orange transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}

                    {modalLevel === 2 && selectedTask && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-bold text-white">{selectedTask.task}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${selectedTask.priority === 'High' ? 'bg-rose-500/20 text-rose-500' : 'bg-porteo-orange/20 text-porteo-orange'}`}>
                              {selectedTask.priority} Priority
                            </span>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed mb-6">
                            {selectedTask.desc}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Projected Impact</p>
                              <p className="text-lg font-bold text-emerald-500">{selectedTask.impact}</p>
                            </div>
                            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Task ID</p>
                              <p className="text-lg font-bold text-white">{selectedTask.id}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => {
                              addNotification(lang === 'en' ? `Task ${selectedTask.id} Approved: ${selectedTask.task}` : `Tarea ${selectedTask.id} Aprobada: ${selectedTask.task}`, 'operational');
                              setAiTasks(prev => prev.filter(t => t.id !== selectedTask.id));
                              setModalLevel(1);
                              setSelectedTask(null);
                            }}
                            className="py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/80 transition-all"
                          >
                            APPROVE
                          </button>
                          <button 
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) {
                                addNotification('Task rejected and archived.', 'operational');
                                setModalLevel(1);
                              }
                            }}
                            className="py-3 bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-xl font-bold hover:bg-rose-500/30 transition-all"
                          >
                            REJECT
                          </button>
                          <button 
                            onClick={() => {
                              addNotification('Task sent for secondary supervisor approval.', 'operational');
                              setModalLevel(1);
                            }}
                            className="py-3 bg-porteo-blue/20 border border-porteo-blue/30 text-porteo-blue rounded-xl font-bold hover:bg-porteo-blue/30 transition-all"
                          >
                            ESCALATE
                          </button>
                          <button 
                            onClick={() => {
                              const newVal = prompt('Edit task parameters:', selectedTask.task);
                              if (newVal) {
                                addNotification('Task parameters updated. Re-calculating impact...', 'operational');
                              }
                            }}
                            className="py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                          >
                            EDIT
                          </button>
                        </div>
                        <button 
                          onClick={() => setModalLevel(1)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 font-bold uppercase text-[10px] tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'market-hubs' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/30 rounded-3xl">
                      <h3 className="text-xl font-bold text-white mb-2">3 Active Market Hubs</h3>
                      <p className="text-sm text-white/60">Current distribution network status across USA & Mexico.</p>
                    </div>
                    {modalLevel === 1 && (
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { name: 'Laredo Gateway', status: 'Operational', load: '92%', region: 'TX, USA', routes: 12, alerts: 0 },
                          { name: 'Monterrey Hub', status: 'Operational', load: '84%', region: 'NL, MX', routes: 8, alerts: 0 },
                          { name: 'Mexico City Terminal', status: 'Warning', load: '98%', region: 'CDMX, MX', routes: 24, alerts: 2 }
                        ].map((hub, i) => (
                          <button 
                            key={i} 
                            onClick={() => {
                              setSelectedHub(hub);
                              setModalLevel(2);
                            }}
                            className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center hover:border-porteo-blue/50 transition-all text-left group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${hub.status === 'Warning' ? 'bg-porteo-orange animate-pulse' : 'bg-emerald-500'}`} />
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-porteo-blue transition-colors">{hub.name}</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">{hub.region}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-white">{hub.load} Capacity</p>
                              <span className="text-[10px] text-porteo-blue font-bold uppercase mt-1 group-hover:underline">Manage Hub →</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {modalLevel === 2 && selectedHub && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-white">{selectedHub.name}</h4>
                              <p className="text-sm text-white/40">{selectedHub.region}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${selectedHub.status === 'Warning' ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-emerald-500/20 text-emerald-500'}`}>
                              {selectedHub.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Current Load</p>
                              <p className="text-lg font-bold text-white">{selectedHub.load}</p>
                            </div>
                            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Active Routes</p>
                              <p className="text-lg font-bold text-white">{selectedHub.routes}</p>
                            </div>
                            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Pending Alerts</p>
                              <p className={`text-lg font-bold ${selectedHub.alerts > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{selectedHub.alerts}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-xs font-bold text-white/40 uppercase tracking-widest">Hub Actions</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => addNotification('Optimizing hub distribution...', 'operational')} className="p-3 bg-porteo-blue text-white rounded-xl text-xs font-bold hover:bg-porteo-blue/80 transition-all">Optimize Distribution</button>
                            <button onClick={() => addNotification('Requesting maintenance scan...', 'operational')} className="p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Facility Scan</button>
                            <button onClick={() => addNotification('Opening real-time traffic sync...', 'operational')} className="p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Traffic Sync</button>
                            <button onClick={() => addNotification('Exporting hub performance report...', 'operational')} className="p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Export Report</button>
                          </div>
                        </div>

                        <button 
                          onClick={() => setModalLevel(1)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 font-bold uppercase text-[10px] tracking-widest"
                        >
                          Back to Hub List
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'efficiency-report' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
                      <h3 className="text-xl font-bold text-white mb-2">10% Efficiency Gain</h3>
                      <p className="text-sm text-white/60">Realized improvements since AI implementation (Last 30 days).</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Time Saved</p>
                        <p className="text-2xl font-bold text-emerald-500">142h</p>
                        <p className="text-[10px] text-white/20">Monthly total</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Cost Reduction</p>
                        <p className="text-2xl font-bold text-emerald-500">$12.4k</p>
                        <p className="text-[10px] text-white/20">Operational spend</p>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <h4 className="text-xs font-bold text-white/40 uppercase mb-4 tracking-widest">Efficiency Loss Analysis (8% Gap)</h4>
                      <div className="space-y-4">
                        {[
                          { reason: 'Congestion at Docks', impact: '3.2%', desc: 'Peak hour bottlenecks in Dock 4/5.' },
                          { reason: 'Inventory Discrepancies', impact: '2.8%', desc: 'Mismatches requiring manual audits.' },
                          { reason: 'System Latency', impact: '2.0%', desc: 'Legacy ERP sync delays.' }
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                            <div>
                              <p className="text-xs font-bold text-white">{item.reason}</p>
                              <p className="text-[10px] text-white/40">{item.desc}</p>
                            </div>
                            <span className="text-xs font-bold text-rose-500">-{item.impact}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <h4 className="text-xs font-bold text-white/40 uppercase mb-4">Efficiency Trend</h4>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { name: 'Day 1', value: 2 },
                            { name: 'Day 10', value: 5 },
                            { name: 'Day 20', value: 8 },
                            { name: 'Day 30', value: 10 }
                          ]}>
                            <defs>
                              <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px' }}
                              itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorEff)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        disabled={isProcessing}
                        onClick={() => {
                          setIsProcessing(true);
                          setTimeout(() => {
                            setIsProcessing(false);
                            addNotification('Deep optimization scan completed. 4 new bottlenecks identified.', 'operational');
                          }, 3000);
                        }}
                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : 'Run Optimization Scan'}
                      </button>
                      <button 
                        onClick={() => exportReport('Efficiency Report', { gain: '10%', timeSaved: '142h', costSaved: '$12.4k' })}
                        className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                      >
                        Export Report
                      </button>
                    </div>
                  </div>
                )}
                {activeModal === 'ecommerce-integration' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/30 rounded-3xl flex items-center gap-4">
                      <Globe className="w-10 h-10 text-porteo-blue" />
                      <div>
                        <h3 className="text-xl font-bold text-white">E-commerce Integration</h3>
                        <p className="text-sm text-white/60">Multi-channel sync status</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {ecommerceIntegrations.map((channel, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-white font-medium">{channel.name}</span>
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded-full uppercase">{channel.status}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 relative group">
                        <button 
                          onClick={() => {
                            const options = ['Magento', 'WooCommerce', 'BigCommerce', 'PrestaShop', 'Square', 'Etsy'];
                            const name = options[Math.floor(Math.random() * options.length)];
                            if (!ecommerceIntegrations.find(i => i.name === name)) {
                              setEcommerceIntegrations([...ecommerceIntegrations, { name, status: 'connected' }]);
                              addNotification(lang === 'en' ? `Integration with ${name} established successfully.` : `Integración con ${name} establecida con éxito.`, 'operational');
                            } else {
                              addNotification(lang === 'en' ? `${name} is already integrated.` : `${name} ya está integrado.`, 'operational');
                            }
                          }}
                          className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {lang === 'en' ? 'Add Integration' : 'Agregar Integración'}
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all text-[10px] text-white/60">
                          {lang === 'en' ? 'Click to auto-detect and connect new marketplace channels.' : 'Haz clic para detectar y conectar nuevos canales de marketplace.'}
                        </div>
                      </div>
                      <button 
                        type="button"
                        disabled={isProcessing}
                        onClick={() => {
                          setIsProcessing(true);
                          setTimeout(() => {
                            setIsProcessing(false);
                            addNotification(lang === 'en' ? 'All e-commerce channels synchronized successfully.' : 'Todos los canales de e-commerce sincronizados con éxito.', 'operational');
                          }, 2000);
                        }}
                        className="flex-1 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                        {isProcessing ? (lang === 'en' ? 'Syncing...' : 'Sincronizando...') : (lang === 'en' ? 'Sync All Channels' : 'Sincronizar Canales')}
                      </button>
                    </div>
                  </div>
                )}
                {activeModal === 'financial-details' && (
                  <div className="space-y-8">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold">{t.warehouse}</label>
                        <select 
                          value={financialSubFilter.warehouse}
                          onChange={(e) => setFinancialSubFilter(prev => ({ ...prev, warehouse: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                        >
                          <option value="all" className="bg-slate-900">{t.allWarehouses}</option>
                          {warehouses.map(wh => (
                            <option key={wh.id} value={wh.id} className="bg-slate-900">{wh.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold">{t.customer}</label>
                        <select 
                          value={financialSubFilter.customer}
                          onChange={(e) => setFinancialSubFilter(prev => ({ ...prev, customer: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                        >
                          <option value="all" className="bg-slate-900">{t.allCustomers}</option>
                          <option value="techcorp" className="bg-slate-900">TechCorp</option>
                          <option value="greenfoods" className="bg-slate-900">GreenFoods</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold">{t.filterBy}</label>
                        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                          <button 
                            onClick={() => setFinancialSubFilter(prev => ({ ...prev, type: 'sqm2' }))}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${financialSubFilter.type === 'sqm2' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
                          >
                            {t.sqm2}
                          </button>
                          <button 
                            onClick={() => setFinancialSubFilter(prev => ({ ...prev, type: 'sku' }))}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${financialSubFilter.type === 'sku' ? 'bg-porteo-orange text-white' : 'text-white/40 hover:text-white'}`}
                          >
                            SKU
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CFO AI Panel */}
                    <div className="p-6 bg-porteo-blue/10 border border-porteo-blue/30 rounded-[32px] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Cpu className="w-24 h-24 text-porteo-blue" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-porteo-blue/20 rounded-xl">
                            <Cpu className="w-5 h-5 text-porteo-blue" />
                          </div>
                          <h4 className="text-lg font-bold text-white">{t.cfoAssistant}</h4>
                        </div>
                        
                        <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                          <p className="text-sm text-white/80 leading-relaxed">
                            {lang === 'en' 
                              ? `Based on current filters (${financialSubFilter.warehouse}, ${financialSubFilter.customer}), your cost per ${financialSubFilter.type} is trending 4.2% lower than last month.`
                              : `Basado en los filtros actuales (${financialSubFilter.warehouse}, ${financialSubFilter.customer}), su costo por ${financialSubFilter.type} tiene una tendencia 4.2% menor que el mes pasado.`}
                          </p>
                          {cfoChat.map((msg, i) => (
                            <div key={i} className={`p-3 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-white/10 ml-8 text-white' : 'bg-porteo-blue/20 mr-8 text-porteo-blue-light'}`}>
                              {msg.content}
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 mb-6">
                          <input 
                            type="text" 
                            placeholder={lang === 'en' ? "Ask CFO AI..." : "Preguntar a IA CFO..."}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-porteo-blue/50"
                            value={cfoQuery}
                            onChange={(e) => setCfoQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && cfoQuery) {
                                setCfoChat(prev => [...prev, { role: 'user', content: cfoQuery }]);
                                setCfoQuery('');
                                setTimeout(() => {
                                  setCfoChat(prev => [...prev, { role: 'ai', content: lang === 'en' ? 'Analyzing financial data for your request...' : 'Analizando datos financieros para su solicitud...' }]);
                                }, 1000);
                              }
                            }}
                          />
                        </div>

                        <div className="flex gap-3">
                          <button 
                            onClick={() => addNotification(lang === 'en' ? 'Generating 12-month financial forecast...' : 'Generando pronóstico financiero de 12 meses...', 'operational')}
                            className="px-6 py-2 bg-porteo-blue text-white rounded-full text-xs font-bold hover:bg-porteo-blue/80 transition-all"
                          >
                            {lang === 'en' ? 'Generate Forecast' : 'Generar Pronóstico'}
                          </button>
                          <button 
                            onClick={() => {
                              addNotification(lang === 'en' ? 'Exporting financial data to CSV...' : 'Exportando datos financieros a CSV...', 'operational');
                              const link = document.createElement('a');
                              link.href = '#';
                              link.download = 'financial_data.csv';
                              link.click();
                            }}
                            className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-full text-xs font-bold hover:bg-white/10 transition-all"
                          >
                            {lang === 'en' ? 'Export CSV' : 'Exportar CSV'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Data Table */}
                    <div className="glass rounded-3xl overflow-hidden border border-white/10">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5">
                            <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/10">Entity</th>
                            <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/10">Revenue</th>
                            <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/10">Cost</th>
                            <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/10">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'Warehouse A', rev: '$124k', cost: '$82k', margin: '34%' },
                            { name: 'Warehouse B', rev: '$98k', cost: '$64k', margin: '35%' },
                            { name: 'Warehouse C', rev: '$156k', cost: '$102k', margin: '34%' },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="p-4 text-sm text-white font-medium">{row.name}</td>
                              <td className="p-4 text-sm text-white">{row.rev}</td>
                              <td className="p-4 text-sm text-white/60">{row.cost}</td>
                              <td className="p-4 text-sm text-emerald-500 font-bold">{row.margin}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {activeModal === 'create-warehouse' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-porteo-orange/10 border border-porteo-orange/30 rounded-3xl">
                      <h3 className="text-xl font-bold text-white">{lang === 'en' ? 'Create New Warehouse' : 'Crear Nuevo Almacén'}</h3>
                      <p className="text-sm text-white/60">{lang === 'en' ? 'Initialize a new facility model' : 'Inicializar un nuevo modelo de instalación'}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase font-bold">Warehouse Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Porteo Queretaro" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-porteo-orange/50 outline-none"
                          value={newWarehouseData.name}
                          onChange={(e) => setNewWarehouseData({ ...newWarehouseData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase font-bold">Location</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Queretaro, MX" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-porteo-orange/50 outline-none"
                          value={newWarehouseData.location}
                          onChange={(e) => setNewWarehouseData({ ...newWarehouseData, location: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 uppercase font-bold">Rack Rows</label>
                          <input 
                            type="number" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-porteo-orange/50 outline-none"
                            value={newWarehouseData.layout?.racks.rows}
                            onChange={(e) => setNewWarehouseData({ 
                              ...newWarehouseData, 
                              layout: { ...newWarehouseData.layout!, racks: { ...newWarehouseData.layout!.racks, rows: parseInt(e.target.value) || 0 } } 
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 uppercase font-bold">Rack Columns</label>
                          <input 
                            type="number" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-porteo-orange/50 outline-none"
                            value={newWarehouseData.layout?.racks.cols}
                            onChange={(e) => setNewWarehouseData({ 
                              ...newWarehouseData, 
                              layout: { ...newWarehouseData.layout!, racks: { ...newWarehouseData.layout!.racks, cols: parseInt(e.target.value) || 0 } } 
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.csv,.xlsx,.xls,.json';
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            setIsProcessing(true);
                            addNotification(lang === 'en' ? `AI is analyzing ${file.name} to optimize initial layout...` : `IA está analizando ${file.name} para optimizar el diseño inicial...`, 'operational');
                            setTimeout(() => {
                              setNewWarehouseData({
                                ...newWarehouseData,
                                layout: {
                                  racks: { rows: 10, cols: 15 },
                                  docks: 8,
                                  zones: [
                                    { name: 'AI Optimized Zone A', color: '#F27D26', racks: ['0-0', '1-1'] }
                                  ]
                                }
                              });
                              setIsProcessing(false);
                              addNotification(lang === 'en' ? 'Layout optimized by AI from file data!' : '¡Diseño optimizado por IA desde los datos del archivo!', 'operational');
                            }, 2000);
                          }
                        };
                        input.click();
                      }}
                      className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 mb-2"
                    >
                      <Upload className="w-4 h-4" />
                      {lang === 'en' ? 'Upload Layout/Inventory Data' : 'Cargar Datos de Diseño/Inventario'}
                    </button>
                    <button 
                      onClick={() => {
                        if (!newWarehouseData.name || !newWarehouseData.location) {
                          addNotification(lang === 'en' ? 'Please fill in all fields' : 'Por favor complete todos los campos', 'alert');
                          return;
                        }
                        const newWh: Warehouse = {
                          id: `wh-${warehouses.length + 1}`,
                          name: newWarehouseData.name!,
                          location: newWarehouseData.location!,
                          market: market,
                          capacity: 50000,
                          currentOccupancy: 0,
                          temperature: 20,
                          status: 'optimal',
                          layout: newWarehouseData.layout as any
                        };
                        const updatedWarehouses = [...warehouses, newWh];
                        setWarehouses(updatedWarehouses);
                        setSelectedWarehouse(newWh);
                        setActiveModal(null);
                        addNotification(lang === 'en' ? `Warehouse ${newWh.name} initialized successfully!` : `¡Almacén ${newWh.name} inicializado con éxito!`, 'operational');
                      } }
                      className="w-full py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Initialize Warehouse' : 'Inicializar Almacén'}
                    </button>
                  </div>
                )}
                {activeModal === 'dock-detail' && selectedSubItem && (
                  <div className="space-y-6">
                    <div className={`p-6 rounded-3xl border flex items-center justify-between ${selectedSubItem.status === 'Occupied' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${selectedSubItem.status === 'Occupied' ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                          <Truck className={`w-8 h-8 ${selectedSubItem.status === 'Occupied' ? 'text-rose-500' : 'text-emerald-500'}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedSubItem.id}</h3>
                          <p className={`text-sm font-bold ${selectedSubItem.status === 'Occupied' ? 'text-rose-500' : 'text-emerald-500'}`}>{selectedSubItem.status}</p>
                        </div>
                      </div>
                      {selectedSubItem.status === 'Occupied' && (
                        <div className="text-right">
                          <p className="text-[10px] text-white/40 uppercase font-bold">Current Unit</p>
                          <p className="text-lg font-bold text-white">{selectedSubItem.truck}</p>
                        </div>
                      )}
                    </div>

                    {selectedSubItem.status === 'Occupied' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Carrier</p>
                            <p className="text-sm font-bold text-white">{selectedSubItem.carrier}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">Driver</p>
                            <p className="text-sm font-bold text-white">{selectedSubItem.driver}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <h4 className="text-xs font-bold text-white/40 uppercase mb-3 tracking-widest">Dock Actions</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => {
                                const updatedTrucks = trucks.map(t => t.id === selectedSubItem.truck ? { ...t, status: 'Unloading' } : t);
                                setTrucks(updatedTrucks);
                                addNotification(lang === 'en' ? 'Unloading process started.' : 'Proceso de descarga iniciado.', 'operational');
                                setActiveModal(null);
                              }}
                              className="py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                            >
                              Start Unloading
                            </button>
                            <button 
                              onClick={() => {
                                const updatedTrucks = trucks.map(t => t.id === selectedSubItem.truck ? { ...t, status: 'Waiting', dock: '-' } : t);
                                setTrucks(updatedTrucks);
                                addNotification(lang === 'en' ? 'Truck moved back to yard.' : 'Camión movido de vuelta al patio.', 'operational');
                                setActiveModal(null);
                              }}
                              className="py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                            >
                              Release Dock
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 bg-white/5 rounded-3xl border border-white/10 border-dashed flex flex-col items-center justify-center text-center">
                        <Zap className="w-12 h-12 text-white/10 mb-4" />
                        <p className="text-white/40 text-sm">Dock is currently available for assignment.</p>
                        <button 
                          onClick={() => {
                            setActiveModal(null);
                            setTruckStatusFilter('Waiting');
                            addNotification(lang === 'en' ? 'Please select a waiting truck from the list to assign.' : 'Por favor seleccione un camión en espera de la lista para asignar.', 'alert');
                          }}
                          className="mt-6 px-6 py-3 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/80 transition-all"
                        >
                          Assign Waiting Truck
                        </button>
                      </div>
                    )}

                    <button 
                      onClick={() => setActiveModal(null)}
                      className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                      {lang === 'en' ? 'Close' : 'Cerrar'}
                    </button>
                  </div>
                )}
                {activeModal === 'rack-detail' && selectedRackDetails && (
                  <div className="space-y-6 relative z-[150]">
                    <div className="p-6 bg-porteo-blue/20 border border-porteo-blue/30 rounded-3xl">
                      <h3 className="text-xl font-bold text-white">Rack {selectedRackDetails.id} Details</h3>
                      <p className="text-sm text-porteo-blue">Zone A • High Density Storage</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                        <span className="text-white/60">Occupancy</span>
                        <span className="text-white font-bold">85%</span>
                      </div>
                      <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                        <span className="text-white/60">Total Pallets</span>
                        <span className="text-white font-bold">12 / 14</span>
                      </div>
                      <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                        <span className="text-white/60">Last Activity</span>
                        <span className="text-white font-bold">Picking - 2h ago</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          const id = selectedRackDetails.id;
                          setExternal3DAction({ type: 'audit', rackId: id, timestamp: Date.now() });
                          setActiveModal(null);
                          
                          const itemsInRack = inventoryItems.filter(item => item.location.includes(id));
                          const summary = itemsInRack.length > 0 
                            ? (lang === 'en' 
                                ? `Audit Complete for Rack ${id}. Found ${itemsInRack.length} items: ${itemsInRack.map(i => i.sku).join(', ')}.` 
                                : `Auditoría Completa para Rack ${id}. Encontrados ${itemsInRack.length} items: ${itemsInRack.map(i => i.sku).join(', ')}.`)
                            : (lang === 'en' ? `Audit Complete for Rack ${id}. No items found in this location.` : `Auditoría Completa para Rack ${id}. No se encontraron items en esta ubicación.`);
                          
                          setTimeout(() => {
                            addNotification(summary, 'operational');
                          }, 3000);
                        }}
                        className="py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 cursor-pointer relative z-[160]"
                      >
                        Audit Rack
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          const id = selectedRackDetails.id;
                          setExternal3DAction({ type: 'relocate', rackId: id, timestamp: Date.now() });
                          setActiveModal(null);

                          const itemsToMove = inventoryItems.filter(item => item.location.includes(id));
                          if (itemsToMove.length > 0) {
                            setInventoryItems(prev => prev.map(item => {
                              if (item.location.includes(id)) {
                                return { ...item, location: 'ZONE-A-04-B' };
                              }
                              return item;
                            }));
                            setTimeout(() => {
                              addNotification(lang === 'en' 
                                ? `Relocation Successful! ${itemsToMove.length} items from Rack ${id} moved to ZONE-A-04-B for optimization.` 
                                : `¡Reubicación Exitosa! ${itemsToMove.length} items del Rack ${id} movidos a ZONE-A-04-B para optimización.`, 'operational');
                            }, 4000);
                          } else {
                            addNotification(lang === 'en' ? `No items found in Rack ${id} to relocate.` : `No se encontraron items en el Rack ${id} para reubicar.`, 'alert');
                          }
                        }}
                        className="py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 cursor-pointer relative z-[160]"
                      >
                        Relocate Items
                      </button>
                    </div>
                  </div>
                )}
                {activeModal === 'update-status' && selectedTplShipment && (
                  <div className="space-y-4">
                    <p className="text-white/60">{lang === 'en' ? `Updating status for ${selectedTplShipment.id}` : `Actualizando estatus para ${selectedTplShipment.id}`}</p>
                    <select 
                      id="status-select"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                      defaultValue={selectedTplShipment.status}
                    >
                      <option value="collection" className="bg-slate-900">Collection</option>
                      <option value="in-transit" className="bg-slate-900">In Transit</option>
                      <option value="arrived" className="bg-slate-900">Arrived</option>
                      <option value="unloading" className="bg-slate-900">Unloading</option>
                      <option value="completed" className="bg-slate-900">Completed</option>
                    </select>
                    <button 
                      onClick={() => {
                        const select = document.getElementById('status-select') as HTMLSelectElement;
                        const newStatus = select.value as TPLProcess['status'];
                        
                        setTplProcesses(prev => prev.map(p => 
                          p.id === selectedTplShipment.id 
                            ? { 
                                ...p, 
                                status: newStatus,
                                steps: [
                                  ...p.steps,
                                  { 
                                    id: `s-${Date.now()}`, 
                                    label: { en: `Status updated to ${newStatus}`, es: `Estatus actualizado a ${newStatus}` }, 
                                    status: 'completed', 
                                    timestamp: new Date().toISOString() 
                                  }
                                ]
                              } 
                            : p
                        ));
                        
                        addNotification(lang === 'en' ? 'Status updated successfully!' : '¡Estatus actualizado con éxito!', 'operational');
                        setActiveModal(null);
                      }}
                      className="w-full py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/80 transition-all"
                    >
                      Update Status
                    </button>
                  </div>
                )}
                {activeModal === 'view-documents' && selectedTplShipment && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-white/60">{lang === 'en' ? `Documents for ${selectedTplShipment.id}` : `Documentos para ${selectedTplShipment.id}`}</p>
                      <button 
                        disabled={isComplianceLoading}
                        onClick={() => {
                          setIsComplianceLoading(true);
                          import('./services/geminiService').then(m => {
                            m.getComplianceAudit(selectedTplShipment, lang).then(audit => {
                              setComplianceAudit(audit);
                              setIsComplianceLoading(false);
                            });
                          });
                        }}
                        className="text-[10px] font-bold text-porteo-blue bg-porteo-blue/10 px-3 py-1.5 rounded-full hover:bg-porteo-blue/20 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isComplianceLoading ? <Activity className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
                        AI Audit
                      </button>
                    </div>

                    {complianceAudit && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-porteo-blue/10 border border-porteo-blue/30 rounded-2xl"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-4 h-4 text-porteo-blue" />
                          <p className="text-[10px] font-bold text-porteo-blue uppercase tracking-widest">SR Compliance Expert Findings</p>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed italic">
                          {complianceAudit}
                        </p>
                      </motion.div>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                      {(selectedTplShipment.documents || ['Packing List.pdf', 'Bill of Lading.pdf', 'Customs Invoice.pdf', 'Proof of Delivery.jpg']).map((doc, i) => (
                        <div 
                          key={i} 
                          onClick={() => {
                            addNotification(lang === 'en' ? `Downloading ${doc}...` : `Descargando ${doc}...`, 'operational');
                          }}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-orange/50 cursor-pointer group transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-porteo-orange" />
                            <span className="text-sm text-white group-hover:text-porteo-orange transition-colors">{doc}</span>
                          </div>
                          <Download className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <label className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 cursor-pointer transition-all">
                        <Upload className="w-4 h-4" />
                        {lang === 'en' ? 'Upload Missing Document' : 'Subir Documento Faltante'}
                        <input type="file" className="hidden" onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const fileName = e.target.files[0].name;
                            const updatedShipment = {
                              ...selectedTplShipment,
                              documents: [...(selectedTplShipment.documents || []), fileName]
                            };
                            setSelectedTplShipment(updatedShipment);
                            setTplProcesses(prev => prev.map(p => p.id === updatedShipment.id ? updatedShipment : p));
                            addNotification(lang === 'en' ? `Document ${fileName} uploaded successfully.` : `Documento ${fileName} subido con éxito.`, 'operational');
                          }
                        }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.xls,.csv" />
                      </label>
                    </div>
                  </div>
                )}
                {activeModal === 'add-personnel' && (
                  <div className="space-y-4">
                    <p className="text-white/60">Register new employee</p>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                      <input type="text" placeholder="Employee ID" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                      <select className="bg-white/5 border border-white/10 rounded-xl p-3 text-white">
                        <option className="bg-slate-900">Picker</option>
                        <option className="bg-slate-900">Loader</option>
                        <option className="bg-slate-900">Supervisor</option>
                      </select>
                      <select className="bg-white/5 border border-white/10 rounded-xl p-3 text-white">
                        <option className="bg-slate-900">Shift A</option>
                        <option className="bg-slate-900">Shift B</option>
                        <option className="bg-slate-900">Shift C</option>
                      </select>
                    </div>
                    <button className="w-full py-3 bg-porteo-orange text-white rounded-xl font-bold">Add Employee</button>
                  </div>
                )}
                {activeModal === 'manage-personnel' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-porteo-blue/20 border border-porteo-blue/30 rounded-3xl">
                      <h3 className="text-xl font-bold text-white">Shift Management</h3>
                      <p className="text-sm text-porteo-blue">Optimizing labor allocation</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                        <span className="text-white/60">Active Workers</span>
                        <span className="text-white font-bold">42</span>
                      </div>
                      <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                        <span className="text-white/60">Target Efficiency</span>
                        <span className="text-white font-bold">95%</span>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-porteo-orange text-white rounded-xl font-bold">Reassign Resources</button>
                  </div>
                )}

                {activeModal === 'contract-detail' && selectedContract && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{selectedContract.partyName}</h3>
                        <p className="text-sm text-white/40 uppercase tracking-widest font-bold">{selectedContract.type} Contract • {selectedContract.id}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${
                        selectedContract.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' :
                        selectedContract.status === 'pending_renewal' ? 'bg-amber-500/20 text-amber-500' :
                        'bg-white/10 text-white/40'
                      }`}>
                        {selectedContract.status.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="glass p-6 rounded-3xl">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-2">Contract Value</p>
                        <p className="text-2xl font-bold text-white">{selectedContract.currency} {selectedContract.value?.toLocaleString()}</p>
                      </div>
                      <div className="glass p-6 rounded-3xl">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-2">Start Date</p>
                        <p className="text-xl font-bold text-white">{selectedContract.startDate}</p>
                      </div>
                      <div className="glass p-6 rounded-3xl">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-2">End Date</p>
                        <p className="text-xl font-bold text-white">{selectedContract.endDate}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-white">Contract Metadata</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-sm text-white/40">Auto-Renewal</span>
                          <span className="text-sm font-bold text-white">{selectedContract.autoRenew ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-sm text-white/40">Payment Terms</span>
                          <span className="text-sm font-bold text-white">Net 30</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5" />
                        View Full Document
                      </button>
                      <button className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                        Edit Contract
                      </button>
                    </div>
                  </div>
                )}

                {activeModal === 'new-contract' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Party Name</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-porteo-orange/50" placeholder="e.g. Global Logistics Inc" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Contract Type</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-porteo-orange/50">
                          <option value="customer">Customer</option>
                          <option value="supplier">Supplier</option>
                          <option value="service">Service Provider</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Start Date</label>
                        <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-porteo-orange/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">End Date</label>
                        <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-porteo-orange/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Contract Value</label>
                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-porteo-orange/50" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Currency</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-porteo-orange/50">
                          <option value="USD">USD</option>
                          <option value="MXN">MXN</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-porteo-orange focus:ring-porteo-orange" />
                      <label className="text-sm text-white/60">Enable Auto-Renewal</label>
                    </div>

                    <div className="pt-6 flex gap-4">
                      <button 
                        onClick={() => {
                          addNotification('Contract created successfully', 'success');
                          setActiveModal(null);
                        }}
                        className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all"
                      >
                        Create Contract
                      </button>
                      <button 
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isImporting || isProcessing) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-24 h-24 bg-porteo-orange/20 rounded-full flex items-center justify-center mb-8 border border-porteo-orange/30">
              <RefreshCw className="w-12 h-12 text-porteo-orange animate-spin" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              {isImporting 
                ? (lang === 'en' ? 'Importing Global Data' : 'Importando Datos Globales')
                : (lang === 'en' ? 'Processing Data' : 'Procesando Datos')}
            </h3>
            <p className="text-white/60 max-w-md text-lg">
              {isImporting
                ? (lang === 'en' 
                  ? 'AI is parsing your Excel file and building the warehouse network architecture.' 
                  : 'La IA está analizando su archivo Excel y construyendo la arquitectura de la red de almacenes.')
                : (lang === 'en'
                  ? 'Optimizing and integrating your data into the WMS ecosystem.'
                  : 'Optimizando e integrando sus datos en el ecosistema WMS.')}
            </p>
            <div className="mt-12 w-80 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: isImporting ? 5 : 2, ease: "easeInOut" }}
                className="bg-porteo-orange h-full shadow-[0_0_20px_rgba(242,125,38,0.5)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRebalancing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-24 h-24 bg-porteo-orange/20 rounded-3xl flex items-center justify-center mb-8">
              <RefreshCw className="w-12 h-12 text-porteo-orange animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {lang === 'en' ? 'Inventory Rebalancing' : 'Rebalanceo de Inventario'}
            </h3>
            <p className="text-white/40 max-w-md">
              {lang === 'en' 
                ? 'AI is optimizing stock distribution across your network to reduce lead times.' 
                : 'La IA está optimizando la distribución de stock en su red para reducir los tiempos de entrega.'}
            </p>
            <div className="mt-8 w-64 bg-white/5 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
                className="bg-porteo-orange h-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        language={lang} 
        notifications={notifications}
        onAction={(action) => {
          if (action.includes('Strategy')) {
            setIsRebalancing(true);
            setTimeout(() => {
              setIsRebalancing(false);
              addNotification(lang === 'en' ? 'Inventory Rebalanced: 5% of stock rerouted for efficiency.' : 'Inventario Rebalanceado: 5% del stock redirigido por eficiencia.', 'operational');
              setInventoryItems(prev => prev.map(item => ({
                ...item,
                quantity: Math.floor(item.quantity * 0.95) // Simulate rerouting 5%
              })));
            }, 3000);
          } else if (action.includes('Dock')) {
            addNotification(lang === 'en' ? 'Dock 4 Congestion Resolved: TRK-003 moved to Dock 5.' : 'Congestión en Muelle 4 Resuelta: TRK-003 movido al Muelle 5.', 'operational');
            setTrucks(prev => prev.map(t => t.id === 'TRK-003' ? { ...t, status: 'Unloading', dock: 'Dock 5' } : t));
          } else {
            addNotification(lang === 'en' ? `Action executed: ${action}` : `Acción ejecutada: ${action}`, 'operational');
          }
          setIsNotificationsOpen(false);
        }}
        addNotification={addNotification}
      />

      {/* AI Assistants Floating Interface - Refactored to avoid blocking UI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {isAiHubOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="pointer-events-auto flex flex-col items-end gap-3 mb-2"
            >
              <AIAssistant role="Control Tower" language={lang} context={`Current Warehouse: ${selectedWarehouse?.name || 'None'}, Occupancy: ${selectedWarehouse?.currentOccupancy || 0}/${selectedWarehouse?.capacity || 0}, Status: ${selectedWarehouse?.status || 'N/A'}`} />
              <AIAssistant role="Warehouse Director" language={lang} context={`Warehouse: ${selectedWarehouse?.name || 'None'}, Layout: ${selectedWarehouse?.layout?.racks?.rows || 0}x${selectedWarehouse?.layout?.racks?.cols || 0}, Inventory: ${inventoryItems.length} items`} onFileUpload={(file) => {
                if (selectedWarehouse) {
                  setIsProcessing(true);
                  addNotification(lang === 'en' ? `AI Director is analyzing ${file.name}...` : `El Director de IA está analizando ${file.name}...`, 'operational');
                  setTimeout(() => {
                    const rows = Math.floor(Math.random() * 4) + 8;
                    const cols = Math.floor(Math.random() * 6) + 12;
                    const updatedWh = {
                      ...selectedWarehouse,
                      layout: {
                        ...selectedWarehouse.layout,
                        racks: { rows, cols }
                      }
                    };
                    setSelectedWarehouse(updatedWh);
                    setWarehouses(prev => prev.map(w => w.id === updatedWh.id ? updatedWh : w));
                    setIsProcessing(false);
                    addNotification(lang === 'en' ? `AI Director optimized layout based on ${file.name}!` : `¡El Director de IA optimizó el diseño basado en ${file.name}!`, 'operational');
                  }, 3000);
                }
              }} />
              <AIAssistant role="Supply Chain Director" language={lang} context={`Network: USA & Mexico, Total Warehouses: 3, Market Focus: ${market}`} />
              <AIAssistant role="COO Assistant" language={lang} context={`Financials: Revenue trending up, Cost per pallet: $4.20, Labor efficiency: 91%`} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsAiHubOpen(!isAiHubOpen)}
          className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 border border-white/20 ${
            isAiHubOpen ? 'bg-porteo-orange text-white' : 'bg-porteo-blue text-white'
          }`}
        >
          {isAiHubOpen ? <X className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
        </button>
      </div>
    </div>
  );
}
