import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  ClipboardList,
  Calendar,
  Layers,
  Map as MapIcon,
  MapPin,
  Warehouse as WarehouseIcon,
  DollarSign,
  TrendingUp,
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
  AlertTriangle,
  Wrench,
  ParkingCircle,
  AlertCircle,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Mail,
  MoreVertical,
  Trash2,
  Edit,
  ChevronLeft,
  Building2,
  Phone
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
import { AdvancedLogistics } from './components/AdvancedLogistics';
import { TPLBilling } from './components/TPLBilling';
import { translations, Market, Language, Warehouse, InventoryItem, TPLProcess, WMSNotification, Contract, PatioSlot, Activity as ActivityType, User, UserRole, Client, MasterLocation } from './types';
import { MOCK_WAREHOUSES, MOCK_INVENTORY, MOCK_TPL_PROCESSES, PORTEO_COLORS, MOCK_NOTIFICATIONS, MOCK_INVENTORY_USA, MOCK_TRUCKS_USA, MOCK_TPL_PROCESSES_USA, MOCK_INVENTORY_MEXICO, MOCK_TRUCKS_MEXICO, MOCK_TPL_PROCESSES_MEXICO, MOCK_PATIO } from './constants';
import { getMarketResearch } from './services/geminiService';
import { ErrorBoundary } from './components/ErrorBoundary';

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

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@porteo.com', role: 'admin', status: 'active', lastLogin: '2026-03-30T10:00:00Z', avatar: 'https://picsum.photos/seed/admin/100/100' },
  { id: 'u2', name: 'Warehouse Manager', email: 'manager@porteo.com', role: 'manager', status: 'active', lastLogin: '2026-03-30T09:30:00Z', avatar: 'https://picsum.photos/seed/manager/100/100' },
  { id: 'u3', name: 'Operator One', email: 'op1@porteo.com', role: 'operator', status: 'active', lastLogin: '2026-03-29T15:45:00Z', avatar: 'https://picsum.photos/seed/op1/100/100' },
  { id: 'u4', name: 'Viewer User', email: 'viewer@porteo.com', role: 'viewer', status: 'inactive', lastLogin: '2026-03-20T11:20:00Z', avatar: 'https://picsum.photos/seed/viewer/100/100' },
];

const MOCK_CLIENTS: Client[] = [
  { id: 'c-001', name: 'AutoParts Global', email: 'billing@autoparts.com', phone: '+1 555-0123', address: '123 Logistics Way, Detroit, MI', billingCycle: 'monthly', status: 'active' },
  { id: 'c-002', name: 'TechSupply Inc', email: 'finance@techsupply.io', phone: '+1 555-0456', address: '456 Innovation Dr, Austin, TX', billingCycle: 'quarterly', status: 'active' },
  { id: 'c-003', name: 'EcoRetail', email: 'accounts@ecoretail.com', phone: '+1 555-0789', address: '789 Green St, Portland, OR', billingCycle: 'monthly', status: 'inactive' },
];

const MOCK_LOCATIONS: MasterLocation[] = [
  { id: 'loc-001', warehouseId: 'wh-001', zone: 'A', aisle: '01', rack: '01', level: '1', position: 'A', type: 'picking', status: 'occupied' },
  { id: 'loc-002', warehouseId: 'wh-001', zone: 'A', aisle: '01', rack: '01', level: '1', position: 'B', type: 'picking', status: 'available' },
  { id: 'loc-003', warehouseId: 'wh-001', zone: 'B', aisle: '05', rack: '12', level: '4', position: 'C', type: 'bulk', status: 'reserved' },
];

export default function App() {
  const [market, setMarket] = useState<Market>('USA');
  const [activeTab, setActiveTab] = useState('control-tower');
  const [commercialSubTab, setCommercialSubTab] = useState<'pricing' | 'rebates' | 'contracts'>('pricing');
  const [previousTab, setPreviousTab] = useState('control-tower');
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
  const [patioSlots, setPatioSlots] = useState<PatioSlot[]>(MOCK_PATIO);
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  
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
            oemNumber: String(getVal('oemNumber') || ''),
            market: market
          };
        });
        
        // Save to backend
        for (const item of newInventory) {
          await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        }
        
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
            idling: Math.random() > 0.5,
            warehouseId: selectedWarehouse?.id || 'wh-001'
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
  const [marketInsight, setMarketInsight] = useState<{headlines: string[], content: string[]} | null>(null);
  const [selectedInsightIndex, setSelectedInsightIndex] = useState<number | null>(null);
  const [mexicoIntelLang, setMexicoIntelLang] = useState<'en' | 'es'>('es');
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [adminSubTab, setAdminSubTab] = useState<'layout' | 'master-data' | 'users' | 'integration'>('users');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'operator',
    status: 'active'
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [masterLocations, setMasterLocations] = useState<MasterLocation[]>(MOCK_LOCATIONS);
  const [isSkuModalOpen, setIsSkuModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSkuFormOpen, setIsSkuFormOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [skuSearchQuery, setSkuSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  const [editingSku, setEditingSku] = useState<InventoryItem | null>(null);
  const [newSku, setNewSku] = useState<Partial<InventoryItem>>({
    sku: '',
    name: '',
    category: 'Other',
    velocity: 'Medium',
    quantity: 0,
    unit: 'pcs'
  });

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    billingCycle: 'monthly'
  });

  const [editingLocation, setEditingLocation] = useState<MasterLocation | null>(null);
  const [newMasterLocation, setNewMasterLocation] = useState<Partial<MasterLocation>>({
    zone: '',
    aisle: '',
    rack: '',
    level: '',
    position: '',
    type: 'picking',
    status: 'available'
  });
  const [optimizationLogs, setOptimizationLogs] = useState<{id: string, msg: string, time: string}[]>([]);
  
  const addNotification = useCallback((msg: string, type: 'market' | 'operational' | 'alert' | 'success' | 'info' = 'operational') => {
    const newNotif: WMSNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: { en: 'System Update', es: 'Actualización del Sistema' },
      description: { en: msg, es: msg },
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const lang: Language = market === 'USA' ? 'en' : 'es';
  const t = translations[lang];

  const getLocalizedStatus = (status: string) => {
    if (lang === 'en') return status.replace(/-/g, ' ');
    const statusMap: Record<string, string> = {
      'collection': 'Recolección',
      'in-transit-to-wh': 'En Tránsito al Almacén',
      'unloading': 'Descarga',
      'classifying': 'Clasificación',
      'storage': 'Almacenamiento',
      'picking': 'Surtido',
      'cross-dock': 'Cruce de Andén',
      'loading': 'Carga',
      'delivery': 'Entrega',
      'customer-facility': 'Instalación del Cliente',
      'returning': 'Retorno',
      'documentation': 'Documentación',
      'in-yard': 'En Patio',
      'waiting': 'Esperando'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getLocalizedTruckType = (type: string) => {
    if (lang === 'en') return type;
    const typeMap: Record<string, string> = {
      'Full Truck': 'Caja Completa',
      'Thorton': 'Thorton',
      '3.5 Van': 'Camioneta 3.5'
    };
    return typeMap[type] || type;
  };

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [as400Status, setAs400Status] = useState<{ 
    status: string; 
    lastSync: string; 
    system: string; 
    middleware: string; 
    connector: string;
    architecture: string;
    latency: string;
    health: number;
    message: string;
  } | null>(null);
  const [isSyncingAS400, setIsSyncingAS400] = useState(false);
  const [isAuditingSystem, setIsAuditingSystem] = useState(false);

  const fetchInventory = useCallback(async () => {
    setIsInventoryLoading(true);
    try {
      const response = await fetch(`/api/inventory?market=${market}`);
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      // Fallback to mock data on error
      setInventoryItems(market === 'USA' ? MOCK_INVENTORY_USA : MOCK_INVENTORY_MEXICO);
    } finally {
      setIsInventoryLoading(false);
    }
  }, [market]);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/activity?market=${market}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [market]);

  const fetchAS400Status = useCallback(async () => {
    try {
      const response = await fetch('/api/integration/as400/status');
      if (response.ok) {
        const data = await response.json();
        setAs400Status(data);
      }
    } catch (error) {
      console.error('Error fetching AS/400 status:', error);
    }
  }, []);

  const runSystemAudit = async () => {
    setIsAuditingSystem(true);
    addNotification(lang === 'en' ? 'System audit initiated...' : 'Auditoría del sistema iniciada...', 'info');
    try {
      const response = await fetch('/api/system/audit', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        addNotification(lang === 'en' ? data.message : 'Auditoría completa. Todos los protocolos cumplen.', 'success');
      }
    } catch (error) {
      console.error('Error during system audit:', error);
      addNotification(lang === 'en' ? 'System audit failed.' : 'Error en la auditoría del sistema.', 'alert');
    } finally {
      setIsAuditingSystem(false);
    }
  };

  const syncAS400 = async () => {
    setIsSyncingAS400(true);
    try {
      const response = await fetch('/api/integration/as400/sync', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        addNotification(lang === 'en' ? data.message : 'Sincronización con AS/400 exitosa.', 'success');
        fetchInventory();
        fetchAS400Status();
      }
    } catch (error) {
      console.error('Error syncing AS/400:', error);
      addNotification(lang === 'en' ? 'Failed to sync with AS/400.' : 'Error al sincronizar con AS/400.', 'alert');
    } finally {
      setIsSyncingAS400(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchActivities();
    fetchAS400Status();
    // Live sync every 30 seconds
    const interval = setInterval(() => {
      fetchInventory();
      fetchActivities();
      fetchAS400Status();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchInventory, fetchActivities, fetchAS400Status]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [inventoryLocationFilter, setInventoryLocationFilter] = useState('all');
  const [inventoryPage, setInventoryPage] = useState(1);
  const itemsPerPage = 25;
  const [tplProcesses, setTplProcesses] = useState<TPLProcess[]>(MOCK_TPL_PROCESSES);
  const [selectedTplShipment, setSelectedTplShipment] = useState<TPLProcess | null>(null);
  const [selectedTplWarehouseId, setSelectedTplWarehouseId] = useState('wh-1');
  const [trucks, setTrucks] = useState([
    { id: 'TRK-001', carrier: 'Swift', type: 'Full Truck', driver: 'John Doe', status: 'In Yard', dock: 'Dock 4', eta: '08:00', idling: true, warehouseId: 'wh-1' },
    { id: 'TRK-002', carrier: 'Schneider', type: 'Thorton', driver: 'Jane Smith', status: 'Unloading', dock: 'Dock 2', eta: '09:15', idling: false, warehouseId: 'wh-1' },
    { id: 'TRK-003', carrier: 'Werner', type: '3.5 Van', driver: 'Bob Wilson', status: 'Waiting', dock: '-', eta: '10:30', idling: true, warehouseId: 'wh-1' },
    { id: 'TRK-004', carrier: 'Swift', type: 'Full Truck', driver: 'Alice Brown', status: 'Waiting', dock: '-', eta: '11:00', idling: true, warehouseId: 'wh-1' },
    { id: 'TRK-005', carrier: 'DHL', type: '3.5 Van', driver: 'Carlos Ruiz', status: 'In Yard', dock: 'Dock 1', eta: '07:30', idling: false, warehouseId: 'wh-2' },
    { id: 'TRK-006', carrier: 'FedEx', type: 'Thorton', driver: 'Maria Garcia', status: 'Waiting', dock: '-', eta: '08:45', idling: true, warehouseId: 'wh-2' },
    { id: 'TRK-007', carrier: 'Estafeta', type: 'Full Truck', driver: 'Luis Hernandez', status: 'Unloading', dock: 'Dock 3', eta: '09:00', idling: false, warehouseId: 'wh-2' },
  ]);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(w => w.market === market);
  }, [warehouses, market]);

  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => 
      (t.warehouseId === selectedTplWarehouseId) &&
      (t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [trucks, searchQuery, selectedTplWarehouseId]);

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
    { id: 'TASK-01', task: lang === 'en' ? 'Reassign Dock 2 to TRK-902' : 'Reasignar Muelle 2 a TRK-902', priority: 'High', impact: '+15% Speed', desc: lang === 'en' ? 'Dock 2 is currently underutilized while Dock 4 has a queue.' : 'El Muelle 2 está subutilizado mientras que el Muelle 4 tiene fila.' },
    { id: 'TASK-02', task: lang === 'en' ? 'Relocate SKU-004 to Zone A' : 'Reubicar SKU-004 a Zona A', priority: 'Medium', impact: '-10% Travel', desc: lang === 'en' ? 'SKU-004 has high picking frequency.' : 'SKU-004 tiene alta frecuencia de surtido.' },
    { id: 'TASK-03', task: lang === 'en' ? 'Adjust Night Shift Staffing' : 'Ajustar Personal de Turno Nocturno', priority: 'High', impact: '+8% Productivity', desc: lang === 'en' ? 'Projected volume for tonight is 20% higher.' : 'El volumen proyectado para esta noche es 20% mayor.' },
    { id: 'TASK-04', task: lang === 'en' ? 'Update Slotting for Seasonal Items' : 'Actualizar Slotting para Artículos Estacionales', priority: 'Low', impact: '+5% Space', desc: lang === 'en' ? 'Seasonal items are currently taking up prime locations.' : 'Los artículos estacionales ocupan actualmente ubicaciones prime.' }
  ]);
  // Update AI Tasks dynamically based on data
  useEffect(() => {
    if (selectedWarehouse) {
      const occupancy = (selectedWarehouse.currentOccupancy / selectedWarehouse.capacity) * 100;
      const lowStockItems = inventoryItems.filter(i => i.quantity < 50);
      const delayedTrucks = trucks.filter(t => t.status === 'delayed');
      
      const newTasks = [];
      
      if (occupancy > 85) {
        newTasks.push({ 
          id: 'TASK-01', 
          task: lang === 'en' ? 'Critical Space Optimization' : 'Optimización Crítica de Espacio', 
          priority: 'High', 
          impact: '+12% Capacity', 
          desc: lang === 'en' ? `Warehouse is at ${occupancy.toFixed(1)}% capacity. AI recommends immediate consolidation of partial pallets in Zone B.` : `El almacén está al ${occupancy.toFixed(1)}% de capacidad. La IA recomienda la consolidación inmediata de pallets parciales en la Zona B.` 
        });
      }
      
      if (lowStockItems.length > 0) {
        newTasks.push({
          id: 'TASK-02',
          task: lang === 'en' ? `Restock ${lowStockItems.length} Low Items` : `Reabastecer ${lowStockItems.length} Artículos Bajos`,
          priority: 'Medium',
          impact: 'Avoid OOS',
          desc: lang === 'en' ? `Detected ${lowStockItems.length} items with stock below safety threshold. Recommend generating replenishment orders for ${lowStockItems.map(i => i.sku).join(', ')}.` : `Se detectaron ${lowStockItems.length} artículos con stock por debajo del umbral de seguridad. Se recomienda generar órdenes de reabastecimiento para ${lowStockItems.map(i => i.sku).join(', ')}.`
        });
      }

      if (delayedTrucks.length > 0) {
        newTasks.push({
          id: 'TASK-03',
          task: lang === 'en' ? 'Reschedule Delayed Inbounds' : 'Reprogramar Entradas Retrasadas',
          priority: 'High',
          impact: 'Dock Flow',
          desc: lang === 'en' ? `${delayedTrucks.length} trucks are delayed. AI suggests opening Dock 6 for overflow to prevent yard congestion.` : `${delayedTrucks.length} camiones están retrasados. La IA sugiere abrir el Muelle 6 para el desbordamiento y evitar congestión en el patio.`
        });
      }

      const highVelocityMisplaced = inventoryItems.filter(i => i.velocity === 'High' && !i.location.startsWith('A'));
      if (highVelocityMisplaced.length > 0) {
        newTasks.push({
          id: 'TASK-04',
          task: lang === 'en' ? 'Optimize High-Velocity Slotting' : 'Optimizar Slotting de Alta Velocidad',
          priority: 'Medium',
          impact: '-15% Pick Time',
          desc: lang === 'en' ? `${highVelocityMisplaced.length} high-velocity items are stored in slow zones. Relocating them to Zone A will optimize picking routes.` : `${highVelocityMisplaced.length} artículos de alta velocidad están en zonas lentas. Reubicarlos a la Zona A optimizará las rutas de surtido.`
        });
      }

      // Add some static but realistic tasks if list is short
      if (newTasks.length < 4) {
        newTasks.push({ id: 'TASK-05', task: lang === 'en' ? 'Optimize Forklift Routes' : 'Optimizar Rutas de Montacargas', priority: 'Medium', impact: '-12% Energy', desc: lang === 'en' ? 'Forklift traffic in Zone B is congested. AI suggests a one-way traffic flow.' : 'El tráfico de montacargas en la Zona B está congestionado. La IA sugiere un flujo de tráfico de una sola vía.' });
        newTasks.push({ id: 'TASK-06', task: lang === 'en' ? 'Consolidate Partial Pallets' : 'Consolidar Pallets Parciales', priority: 'Low', impact: '+18% Capacity', desc: lang === 'en' ? 'Multiple partial pallets are scattered. Consolidating them will free up rack positions.' : 'Múltiples pallets parciales están dispersos. Consolidarlos liberará posiciones de rack.' });
      }

      setAiTasks(newTasks);
    }
  }, [selectedWarehouse, inventoryItems.length, trucks.length, lang]);
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

  // Dynamic Risk Score Calculation
  const riskScore = useMemo(() => {
    let score = 95; // Start high (good)
    if (selectedWarehouse) {
      const occupancy = (selectedWarehouse.currentOccupancy / selectedWarehouse.capacity) * 100;
      if (occupancy > 90) score -= 15;
      else if (occupancy > 80) score -= 5;
    }
    const lowStock = inventoryItems.filter(i => i.quantity < 50).length;
    score -= Math.min(lowStock * 2, 20);
    
    const delayedTrucks = trucks.filter(t => t.status === 'delayed').length;
    score -= Math.min(delayedTrucks * 5, 20);
    
    return Math.max(score, 40);
  }, [selectedWarehouse, inventoryItems, trucks]);

  // Dynamic Risks based on real data
  const dynamicRisks = useMemo(() => {
    const risks = [];
    if (selectedWarehouse && (selectedWarehouse.currentOccupancy / selectedWarehouse.capacity) > 0.9) {
      risks.push({ id: 'RSK-101', title: lang === 'en' ? 'Critical Capacity Warning' : 'Advertencia de Capacidad Crítica', severity: 'High', area: 'Warehouse Floor', time: 'Just now' });
    }
    const lowStock = inventoryItems.filter(i => i.quantity < 50);
    if (lowStock.length > 5) {
      risks.push({ id: 'RSK-102', title: lang === 'en' ? 'Stockout Risk Detected' : 'Riesgo de Desabastecimiento Detectado', severity: 'Medium', area: 'Inventory Control', time: '12m ago' });
    }
    const delayedTrucks = trucks.filter(t => t.status === 'delayed');
    if (delayedTrucks.length > 0) {
      risks.push({ id: 'RSK-103', title: lang === 'en' ? 'Inbound/Outbound Delay' : 'Retraso de Entrada/Salida', severity: 'High', area: 'Docking Area', time: '24m ago' });
    }
    
    // Fallback if no risks
    if (risks.length === 0) {
      risks.push({ id: 'RSK-000', title: lang === 'en' ? 'System Integrity Check' : 'Verificación de Integridad del Sistema', severity: 'Low', area: 'Core Systems', time: '1h ago' });
    }
    
    return risks;
  }, [selectedWarehouse, inventoryItems, trucks, lang]);

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<any | null>(null);
  const [selectedRebate, setSelectedRebate] = useState<any | null>(null);
  const [selectedRackDetails, setSelectedRackDetails] = useState<any>(null);
  const [external3DAction, setExternal3DAction] = useState<{ type: 'audit' | 'relocate', rackId: string, timestamp: number } | null>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRegisteredOrders, setShowRegisteredOrders] = useState(false);
  const [laborAdvice, setLaborAdvice] = useState<string>('');
  const [isLaborAdviceLoading, setIsLaborAdviceLoading] = useState(false);
  const [slottingAdvice, setSlottingAdvice] = useState<string>('');
  const [slottingSuggestions, setSlottingSuggestions] = useState<{sku: string, current: string, suggested: string, reason: string}[]>([]);
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
  const predictiveData = useMemo(() => {
    // Calculate rotation based on inventory velocity and recent processes
    const categories = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Body', 'Other'];
    return categories.map(cat => {
      const items = inventoryItems.filter(i => i.category === cat);
      const highVelocityCount = items.filter(i => i.velocity === 'High').length;
      const totalCount = items.length || 1;
      const rotation = (highVelocityCount / totalCount * 25 + Math.random() * 5).toFixed(1);
      const trendValue = (Math.random() * 10 - 5).toFixed(1);
      return {
        category: cat,
        rotation: `${rotation}x`,
        trend: `${parseFloat(trendValue) > 0 ? '+' : ''}${trendValue}%`,
        health: parseFloat(rotation) > 20 ? 'Critical' : parseFloat(rotation) > 10 ? 'Optimal' : 'Slow',
        details: lang === 'en' 
          ? `Based on ${items.length} SKUs. ${highVelocityCount} are high-velocity.` 
          : `Basado en ${items.length} SKUs. ${highVelocityCount} son de alta velocidad.`
      };
    });
  }, [inventoryItems, lang]);

  const projectedRotation = useMemo(() => {
    return [
      { name: 'W1', value: 400 + Math.random() * 100 },
      { name: 'W2', value: 300 + Math.random() * 100 },
      { name: 'W3', value: 600 + Math.random() * 100 },
      { name: 'W4', value: 800 + Math.random() * 100 }
    ];
  }, [inventoryItems.length]);
  const [selectedHub, setSelectedHub] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isProtocolVerified, setIsProtocolVerified] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [isMovingPallet, setIsMovingPallet] = useState(false);

  const handleMovePallet = async () => {
    if (!selectedInventoryItem || !newLocation) return;
    
    setIsMovingPallet(true);
    try {
      const response = await fetch(`/api/inventory/${selectedInventoryItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: newLocation })
      });
      
      if (response.ok) {
        setInventoryItems(prev => prev.map(item => 
          item.id === selectedInventoryItem.id ? { ...item, location: newLocation } : item
        ));
        addNotification(lang === 'en' 
          ? `Pallet ${selectedInventoryItem.palletId} moved to ${newLocation}` 
          : `Pallet ${selectedInventoryItem.palletId} movido a ${newLocation}`, 'success');
      } else {
        throw new Error('Failed to update location');
      }
    } catch (error) {
      console.error('Error moving pallet:', error);
      addNotification(lang === 'en' ? 'Error moving pallet.' : 'Error al mover el pallet.', 'alert');
    } finally {
      setIsMovingPallet(false);
      setActiveModal(null);
      setNewLocation('');
    }
  };

  const handleAddUser = (user: Partial<User>) => {
    const id = `u${Date.now()}`;
    const newUserFull: User = {
      id,
      name: user.name || 'New User',
      email: user.email || '',
      role: user.role || 'operator',
      status: user.status || 'active',
      lastLogin: new Date().toISOString(),
      avatar: `https://picsum.photos/seed/${id}/100/100`
    };
    setUsers(prev => [...prev, newUserFull]);
    setIsUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'operator', status: 'active' });
    addNotification(lang === 'en' ? 'User added successfully' : 'Usuario agregado con éxito', 'success');
  };

  const handleEditUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    setIsUserModalOpen(false);
    setEditingUser(null);
    addNotification(lang === 'en' ? 'User updated successfully' : 'Usuario actualizado con éxito', 'success');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    addNotification(lang === 'en' ? 'User deleted successfully' : 'Usuario eliminado con éxito', 'success');
  };

  // SKU CRUD
  const handleAddSku = (sku: Partial<InventoryItem>) => {
    const id = `sku${Date.now()}`;
    const newSkuObj: InventoryItem = {
      id,
      sku: sku.sku || '',
      name: sku.name || '',
      category: sku.category as any || 'Other',
      velocity: sku.velocity as any || 'Medium',
      quantity: sku.quantity || 0,
      unit: sku.unit || 'pcs',
      location: 'Unassigned',
      palletId: `PAL-${Math.floor(Math.random() * 10000)}`,
      customer: 'General'
    };
    setInventoryItems(prev => [newSkuObj, ...prev]);
    setIsSkuModalOpen(false);
    setNewSku({ sku: '', name: '', category: 'Other', velocity: 'Medium', quantity: 0, unit: 'pcs' });
    addNotification(lang === 'en' ? 'SKU created successfully.' : 'SKU creado exitosamente.', 'success');
  };

  const handleEditSku = (sku: InventoryItem) => {
    setInventoryItems(prev => prev.map(s => s.id === sku.id ? sku : s));
    setIsSkuModalOpen(false);
    setIsSkuFormOpen(false);
    setEditingSku(null);
    addNotification(lang === 'en' ? 'SKU updated successfully.' : 'SKU actualizado exitosamente.', 'success');
  };

  // Client CRUD
  const handleAddClient = (client: Partial<Client>) => {
    const id = `cli${Date.now()}`;
    const newClientObj: Client = {
      id,
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      status: client.status || 'active',
      billingCycle: client.billingCycle || 'monthly'
    };
    setClients(prev => [newClientObj, ...prev]);
    setIsClientModalOpen(false);
    setIsClientFormOpen(false);
    setNewClient({ name: '', email: '', phone: '', address: '', status: 'active', billingCycle: 'monthly' });
    addNotification(lang === 'en' ? 'Client created successfully.' : 'Cliente creado exitosamente.', 'success');
  };

  const handleEditClient = (client: Client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
    setIsClientModalOpen(false);
    setIsClientFormOpen(false);
    setEditingClient(null);
    addNotification(lang === 'en' ? 'Client updated successfully.' : 'Cliente actualizado exitosamente.', 'success');
  };

  // Location CRUD
  const handleAddLocation = (loc: Partial<MasterLocation>) => {
    const id = `loc${Date.now()}`;
    const newLocObj: MasterLocation = {
      id,
      warehouseId: 'WH-001',
      zone: loc.zone || 'A',
      aisle: loc.aisle || '01',
      rack: loc.rack || '01',
      level: loc.level || '1',
      position: loc.position || '1',
      type: loc.type as any || 'picking',
      status: loc.status as any || 'available'
    };
    setMasterLocations(prev => [newLocObj, ...prev]);
    setIsLocationModalOpen(false);
    setIsLocationFormOpen(false);
    setNewMasterLocation({ zone: '', aisle: '', rack: '', level: '', position: '', type: 'picking', status: 'available' });
    addNotification(lang === 'en' ? 'Location created successfully.' : 'Ubicación creada exitosamente.', 'success');
  };

  const handleEditLocation = (loc: MasterLocation) => {
    setMasterLocations(prev => prev.map(l => l.id === loc.id ? loc : l));
    setIsLocationModalOpen(false);
    setIsLocationFormOpen(false);
    setEditingLocation(null);
    addNotification(lang === 'en' ? 'Location updated successfully.' : 'Ubicación actualizada exitosamente.', 'success');
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
  const [showNextSteps, setShowNextSteps] = useState(true);
  const [nextSteps, setNextSteps] = useState([
    { 
      id: 1, 
      title: lang === 'en' ? 'Confirm Truck Arrival' : 'Confirmar Llegada de Camión', 
      description: lang === 'en' ? 'Verify ETA and dock availability for incoming shipments.' : 'Verificar ETA y disponibilidad de muelle para envíos entrantes.', 
      completed: false, 
      icon: <Truck className="w-4 h-4" />,
      targetTab: 'patio'
    },
    { 
      id: 2, 
      title: lang === 'en' ? 'Verify Warehouse Space' : 'Verificar Espacio en Almacén', 
      description: lang === 'en' ? 'Ensure enough capacity for the new inventory.' : 'Asegurar capacidad suficiente para el nuevo inventario.', 
      completed: false, 
      icon: <Layers className="w-4 h-4" />,
      targetTab: 'map3d'
    },
    { 
      id: 3, 
      title: lang === 'en' ? 'Upload Master Data' : 'Cargar Datos Maestros', 
      description: lang === 'en' ? 'Import missing SKU and order information via Interoperability Hub.' : 'Importar información faltante de SKU y pedidos vía Hub de Interoperabilidad.', 
      completed: false, 
      icon: <Database className="w-4 h-4" />,
      targetModal: 'interop-hub'
    },
    { 
      id: 4, 
      title: lang === 'en' ? 'Confirm Arrival Date' : 'Confirmar Fecha de Llegada', 
      description: lang === 'en' ? 'Set the expected timestamp for the inbound operation.' : 'Establecer la fecha y hora esperada para la operación de entrada.', 
      completed: false, 
      icon: <Calendar className="w-4 h-4" />,
      targetModal: 'inbound'
    },
  ]);

  // Keep nextSteps localized
  useEffect(() => {
    setNextSteps(prev => prev.map(step => {
      const original = [
        { id: 1, titleEn: 'Confirm Truck Arrival', titleEs: 'Confirmar Llegada de Camión', descEn: 'Verify ETA and dock availability for incoming shipments.', descEs: 'Verificar ETA y disponibilidad de muelle para envíos entrantes.' },
        { id: 2, titleEn: 'Verify Warehouse Space', titleEs: 'Verificar Espacio en Almacén', descEn: 'Ensure enough capacity for the new inventory.', descEs: 'Asegurar capacidad suficiente para el nuevo inventario.' },
        { id: 3, titleEn: 'Upload Master Data', titleEs: 'Cargar Datos Maestros', descEn: 'Import missing SKU and order information via Interoperability Hub.', descEs: 'Importar información faltante de SKU y pedidos vía Hub de Interoperabilidad.' },
        { id: 4, titleEn: 'Confirm Arrival Date', titleEs: 'Confirmar Fecha de Llegada', descEn: 'Set the expected timestamp for the inbound operation.', descEs: 'Establecer la fecha y hora esperada para la operación de entrada.' },
      ].find(o => o.id === step.id);
      
      if (original) {
        return {
          ...step,
          title: lang === 'en' ? original.titleEn : original.titleEs,
          description: lang === 'en' ? original.descEn : original.descEs
        };
      }
      return step;
    }));
  }, [lang]);

  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [showPricingHistory, setShowPricingHistory] = useState(false);
  const [pricingHistory, setPricingHistory] = useState([
    { date: '2026-01-15', price: 12.50, reason: 'Annual adjustment' },
    { date: '2025-11-20', price: 11.90, reason: 'Promotion' },
    { date: '2025-06-01', price: 12.20, reason: 'Initial contract' }
  ]);

  // Dynamic Alerts for Control Tower - REMOVED HARDCODED ALERTS
  
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
          
          // Generate real suggestions based on inventory
          const suggestions = inventoryItems
            .filter(i => i.velocity === 'High' && !i.location.startsWith('A'))
            .map(i => ({
              sku: i.sku,
              current: i.location,
              suggested: `A-01-${Math.floor(Math.random() * 20) + 1}`,
              reason: lang === 'en' ? 'High velocity SKU in slow zone' : 'SKU de alta velocidad en zona lenta'
            }));
          setSlottingSuggestions(suggestions);
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

  // Real-time alerts monitor - Improved to be more dynamic and data-driven
  useEffect(() => {
    const fetchAlerts = () => {
      const operationalData = {
        activeShipments: tplProcesses.length,
        warehouseOccupancy: selectedWarehouse?.currentOccupancy || 0,
        totalItems: inventoryItems.length,
        lowStockCount: inventoryItems.filter(i => i.quantity < 50).length,
        activeTrucks: trucks.filter(t => t.status === 'in-transit' || t.status === 'loading').length,
        systemHealth: 'optimal',
        timestamp: new Date().toISOString()
      };
      
      import('./services/geminiService').then(m => {
        m.getRealTimeAlerts(operationalData, lang).then(alertsText => {
          // Clean up the response to get clean bullet points or lines
          const alerts = alertsText
            .split('\n')
            .map(a => a.replace(/^[*-]\s*/, '').trim())
            .filter(a => a.length > 0)
            .slice(0, 3);
          
          if (alerts.length > 0) {
            setRealTimeAlerts(alerts);
          }
        });
      });
    };

    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 20000); // Every 20 seconds
    return () => clearInterval(interval);
  }, [lang, tplProcesses.length, selectedWarehouse, inventoryItems.length, trucks.length]);

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

  const handleTabChange = (tab: string) => {
    setPreviousTab(activeTab);
    
    // Handle commercial sub-tabs from sidebar (if any remain) or main commercial tab
    if (['pricing', 'rebates', 'contracts'].includes(tab)) {
      setCommercialSubTab(tab as any);
      setActiveTab('commercial');
    } else if (tab === 'commercial') {
      setActiveTab('commercial');
    } else {
      setActiveTab(tab);
    }
  };

  // Market-specific data switching
  useEffect(() => {
    if (market === 'USA') {
      setInventoryItems(MOCK_INVENTORY_USA);
      setTrucks(MOCK_TRUCKS_USA);
      setTplProcesses(MOCK_TPL_PROCESSES_USA);
    } else {
      setInventoryItems(MOCK_INVENTORY_MEXICO);
      setTrucks(MOCK_TRUCKS_MEXICO);
      setTplProcesses(MOCK_TPL_PROCESSES_MEXICO);
    }
  }, [market]);

  useEffect(() => {
    if (activeTab === 'control-tower') {
      setIsMarketLoading(true);
      const intelLang = market === 'MEXICO' ? mexicoIntelLang : 'en';
      getMarketResearch(market, intelLang).then(insight => {
        try {
          const parsed = typeof insight === 'string' ? JSON.parse(insight) : insight;
          setMarketInsight(parsed);
        } catch (e) {
          console.error("Error parsing market insight", e);
          setMarketInsight({ headlines: ['Market Analysis'], content: [insight] });
        }
        setIsMarketLoading(false);
        setSelectedInsightIndex(0);
      });
    }
  }, [activeTab, market, mexicoIntelLang]);

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
        { id: 'advanced-logistics', icon: <Zap className="w-4 h-4" />, label: lang === 'en' ? 'Advanced Ops' : 'Operaciones Avanzadas' },
        { id: 'tpl-billing', icon: <DollarSign className="w-4 h-4" />, label: lang === 'en' ? '3PL Billing' : 'Facturación 3PL' },
      ]
    },
    {
      id: 'commercial',
      label: lang === 'en' ? 'Commercial' : 'Comercial',
      icon: <DollarSign className="w-5 h-5" />,
      items: [
        { id: 'commercial', icon: <DollarSign className="w-4 h-4" />, label: lang === 'en' ? 'Management Console' : 'Consola de Gestión' },
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
                        onClick={() => handleTabChange(item.id)}
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
                        <button 
                          onClick={() => {
                            handleTabChange('admin');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                        >
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
        <div className="flex-1 overflow-y-auto p-8">
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
                    {/* Next Steps Guidance */}
                    {showNextSteps && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-6 bg-porteo-orange/10 border border-porteo-orange/20 rounded-[32px] overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-porteo-orange rounded-xl text-white">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">
                                {lang === 'en' ? 'Next Steps Guidance' : 'Guía de Próximos Pasos'}
                              </h3>
                              <p className="text-xs text-white/40 uppercase tracking-widest">
                                {lang === 'en' ? 'Operational Readiness' : 'Preparación Operativa'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {nextSteps.every(s => s.completed) && (
                              <button 
                                onClick={() => setNextSteps(prev => prev.map(s => ({ ...s, completed: false })))}
                                className="text-xs font-bold text-porteo-orange uppercase hover:underline"
                              >
                                {lang === 'en' ? 'Reset Checklist' : 'Reiniciar Lista'}
                              </button>
                            )}
                            <button 
                              onClick={() => setShowNextSteps(false)}
                              className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {nextSteps.every(s => s.completed) ? (
                            <div className="col-span-full p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center">
                              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                              <h4 className="text-xl font-bold text-white mb-2">
                                {lang === 'en' ? 'All tasks complete!' : '¡Todas las tareas completadas!'}
                              </h4>
                              <p className="text-sm text-white/40">
                                {lang === 'en' ? 'Your warehouse is ready for full operation. You can now monitor real-time metrics and AI insights.' : 'Su almacén está listo para la operación completa. Ahora puede monitorear métricas en tiempo real e insights de IA.'}
                              </p>
                            </div>
                          ) : (
                            nextSteps.map((step) => (
                              <div 
                                key={step.id}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                                  step.completed 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 opacity-60' 
                                    : 'bg-white/5 border-white/10 hover:border-porteo-orange/30'
                                }`}
                                onClick={() => {
                                  if (step.targetTab) {
                                    handleTabChange(step.targetTab);
                                  } else if (step.targetModal) {
                                    setActiveModal(step.targetModal as any);
                                  }
                                  setNextSteps(prev => prev.map(s => s.id === step.id ? { ...s, completed: true } : s));
                                  addNotification(lang === 'en' ? `Navigating to ${step.title}` : `Navegando a ${step.title}`, 'info');
                                }}
                              >
                                <div className="flex gap-3">
                                  <div className={`p-2 rounded-lg h-fit transition-colors ${step.completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 group-hover:bg-porteo-orange group-hover:text-white'}`}>
                                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h4 className={`text-sm font-bold ${step.completed ? 'text-emerald-500 line-through' : 'text-white'}`}>
                                        {step.title}
                                      </h4>
                                      {!step.completed && <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-porteo-orange transition-all" />}
                                    </div>
                                    <p className="text-[10px] text-white/40 leading-relaxed mt-1">
                                      {step.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                    {/* AI Control Tower Insights */}
                    <div className="glass p-6 rounded-3xl border-l-4 border-porteo-orange">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-porteo-orange/20 rounded-lg text-porteo-orange">
                            <Cpu className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            {lang === 'en' ? 'AI Control Tower' : 'Torre de Control IA'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
                            {lang === 'en' ? 'ML Active' : 'ML Activo'}
                          </span>
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

                    {/* Live Activity Feed */}
                    <div className="glass p-6 rounded-3xl border-l-4 border-porteo-orange mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-porteo-orange/20 rounded-lg text-porteo-orange">
                            <Activity className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                            {lang === 'en' ? 'Live Activity Feed' : 'Feed de Actividad en Vivo'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-porteo-orange/10 rounded-full border border-porteo-orange/20">
                          <div className="w-1.5 h-1.5 bg-porteo-orange rounded-full animate-pulse" />
                          <span className="text-[10px] font-bold text-porteo-orange uppercase tracking-widest">
                            {lang === 'en' ? 'Live' : 'En Vivo'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {activities.length > 0 ? (
                          activities.map((activity) => (
                            <div key={activity.id} className="group p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all duration-300">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                  activity.type === 'receiving' ? 'bg-emerald-500/20 text-emerald-400' :
                                  activity.type === 'picking' ? 'bg-blue-500/20 text-blue-400' :
                                  activity.type === 'shipping' ? 'bg-porteo-orange/20 text-porteo-orange' :
                                  activity.type === 'audit' ? 'bg-purple-500/20 text-purple-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {activity.type}
                                </span>
                                <span className="text-[10px] text-white/30 font-mono">
                                  {new Date(activity.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-white/70 leading-relaxed group-hover:text-white transition-colors">
                                {activity.description}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-white/20 gap-3">
                            <Clock className="w-8 h-8 opacity-20" />
                            <p className="text-xs italic">
                              {lang === 'en' ? 'Monitoring operations...' : 'Monitoreando operaciones...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Market Intelligence */}
                    <div className="glass p-6 rounded-3xl border-l-4 border-porteo-blue mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-porteo-blue/20 rounded-lg text-porteo-blue">
                            <Globe2 className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            {market === 'MEXICO' ? (lang === 'en' ? 'Mexico Market Intelligence' : 'Inteligencia de Mercado México') : 'USA Market Intelligence'}
                          </h3>
                        </div>
                        {market === 'MEXICO' && (
                          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button 
                              onClick={() => setMexicoIntelLang('es')}
                              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mexicoIntelLang === 'es' ? 'bg-porteo-blue text-white' : 'text-white/40 hover:text-white'}`}
                            >
                              ESP
                            </button>
                            <button 
                              onClick={() => setMexicoIntelLang('en')}
                              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mexicoIntelLang === 'en' ? 'bg-porteo-blue text-white' : 'text-white/40 hover:text-white'}`}
                            >
                              ENG
                            </button>
                          </div>
                        )}
                      </div>

                      {isMarketLoading ? (
                        <div className="p-8 flex flex-col items-center justify-center gap-4">
                          <RefreshCw className="w-8 h-8 text-porteo-blue animate-spin" />
                          <p className="text-sm text-white/40 italic animate-pulse">
                            {lang === 'en' ? `Analyzing ${market} trade corridors...` : `Analizando corredores comerciales de ${market}...`}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            {marketInsight?.headlines.map((headline, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedInsightIndex(idx)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                                  selectedInsightIndex === idx 
                                    ? 'bg-porteo-blue/20 border-porteo-blue text-white' 
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                                }`}
                              >
                                <span className="text-sm font-bold">{headline}</span>
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedInsightIndex === idx ? 'translate-x-1 text-porteo-blue' : 'text-white/20 group-hover:text-white/40'}`} />
                              </button>
                            ))}
                          </div>
                          <div className="p-5 bg-black/20 rounded-2xl border border-white/5 min-h-[200px]">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={selectedInsightIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-sm text-white/80 leading-relaxed"
                              >
                                {selectedInsightIndex !== null && marketInsight?.content[selectedInsightIndex] ? (
                                  <ReactMarkdown>{marketInsight.content[selectedInsightIndex]}</ReactMarkdown>
                                ) : (
                                  <p className="text-white/40 italic">{lang === 'en' ? 'Select a topic to view details.' : 'Seleccione un tema para ver detalles.'}</p>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recent Activity / Registered Orders */}
                    <div className={`glass p-8 rounded-3xl border-t-4 ${market === 'MEXICO' ? 'border-emerald-500 shadow-lg shadow-emerald-500/5' : 'border-porteo-orange'}`}>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <Activity className={`w-6 h-6 ${market === 'MEXICO' ? 'text-emerald-500' : 'text-porteo-orange'}`} />
                          <h3 className="text-xl font-bold text-white">
                            {lang === 'en' ? 'Recent Operations' : 'Operaciones Recientes'}
                            {market === 'MEXICO' && <span className="ml-3 text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full uppercase tracking-widest">Mexico Priority</span>}
                          </h3>
                        </div>
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
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">{getLocalizedTruckType(process.truckType)} • {process.origin} → {process.destination}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${process.status === 'collection' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-porteo-blue/10 text-porteo-blue'}`}>
                                {getLocalizedStatus(process.status)}
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
                            <p className="text-[10px] font-bold text-porteo-orange uppercase truncate">{t.cargoVisibility}</p>
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Real-time tracking' : 'Seguimiento en tiempo real'}</p>
                          </button>
                          <button onClick={() => setActiveModal('slotting-ai')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-porteo-orange/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-porteo-orange uppercase">Slotting AI</p>
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Storage optimization' : 'Optimización de almacenamiento'}</p>
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
                          <button onClick={() => setActiveModal('interop-hub')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-porteo-blue/50 text-left transition-all overflow-hidden">
                            <p className="text-[10px] font-bold text-porteo-blue uppercase truncate">{t.interoperabilityHub}</p>
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'System integration' : 'Integración de sistemas'}</p>
                          </button>
                          <button onClick={() => setActiveTab('tpl')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-porteo-blue/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-porteo-blue uppercase">{lang === 'en' ? '3PL Workflow' : 'Flujo 3PL'}</p>
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Digital flow' : 'Flujo digital'}</p>
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
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Operational risk' : 'Riesgo operativo'}</p>
                          </button>
                          <button onClick={() => setActiveModal('secure-docs')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-rose-500/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-rose-500 uppercase">{t.secureDocs}</p>
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Encrypted vault' : 'Bóveda encriptada'}</p>
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
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Rotation analysis' : 'Análisis de rotación'}</p>
                          </button>
                          <button onClick={() => setActiveModal('port-city-sync')} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/50 text-left transition-all">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase">{t.portCitySync}</p>
                            <p className="text-[10px] text-white/40">{lang === 'en' ? 'Route optimization' : 'Optimización de rutas'}</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* System Health Legend (Interactive Stats) */}
                    <div className="glass p-6 rounded-3xl">
                      <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest opacity-40">
                        {lang === 'en' ? 'System Health' : 'Salud del Sistema'}
                      </h4>
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
                            <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest">
                              {lang === 'en' ? '3 Active Market Hubs' : '3 Hubs de Mercado Activos'}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </button>
                        <button 
                          onClick={() => setActiveModal('efficiency-report')}
                          className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest">
                              {lang === 'en' ? '10% Efficiency Gain' : '10% de Ganancia en Eficiencia'}
                            </span>
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
                              onClick={() => setActiveModal('carta-porte')}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-blue/50 transition-all cursor-pointer"
                            >
                              <p className="text-[10px] font-bold text-porteo-blue uppercase mb-1">{t.cartaPorte}</p>
                              <p className="text-xs text-white/70">{lang === 'en' ? 'CFDI Bill of Lading.' : 'CFDI de Traslado.'}</p>
                            </div>
                            <div 
                              onClick={() => setActiveModal('immex-control')}
                              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-porteo-blue/50 transition-all cursor-pointer"
                            >
                              <p className="text-[10px] font-bold text-porteo-blue uppercase mb-1">{t.immex}</p>
                              <p className="text-xs text-white/70">{lang === 'en' ? 'Anexo 24 Control.' : 'Control de Anexo 24.'}</p>
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
                                      <div className="flex items-center gap-2">
                                        <span className={`text-white font-bold group-hover:text-porteo-orange transition-all ${isInventoryCompact ? 'text-sm' : 'text-base'}`}>{item.name}</span>
                                        {item.isKit && (
                                          <span className="px-1.5 py-0.5 bg-porteo-orange/20 border border-porteo-orange/30 rounded text-[8px] font-black text-porteo-orange uppercase tracking-tighter">
                                            KIT
                                          </span>
                                        )}
                                      </div>
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
                                  <div className="flex items-center justify-end gap-2">
                                    {item.isKit && (
                                      <button 
                                        onClick={() => handleTabChange('assembly')}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-porteo-orange/20 border border-porteo-orange/30 rounded-lg hover:bg-porteo-orange/30 transition-all text-porteo-orange text-[10px] font-bold uppercase"
                                      >
                                        <Wrench className="w-3 h-3" />
                                        {lang === 'en' ? 'Assemble' : 'Ensamblar'}
                                      </button>
                                    )}
                                    <button className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                      <ChevronRight className="w-4 h-4 text-white/40" />
                                    </button>
                                  </div>
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

            {activeTab === 'map3d' && (
              <motion.div 
                key="map3d"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col space-y-4"
              >
                {selectedWarehouse ? (
                  <>
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
                          onClick={() => handleTabChange('admin')}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          {lang === 'en' ? 'Layout Editor' : 'Editor de Diseño'}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      <Warehouse3D 
                        lang={lang}
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
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <WarehouseIcon className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'en' ? 'No Warehouse Selected' : 'Ningún Almacén Seleccionado'}
                    </h3>
                    <p className="text-white/40 max-w-md mb-8">
                      {lang === 'en' 
                        ? 'Please select a warehouse from the header or add a new one in the Admin panel to view the 3D layout.' 
                        : 'Por favor, seleccione un almacén del encabezado o agregue uno nuevo en el panel de Administración para ver el plano 3D.'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Go to Admin' : 'Ir a Administración'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tpl' && (
              <motion.div 
                key="tpl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                {selectedWarehouse ? (
                  <TPLWorkflow 
                    lang={lang} 
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
                    selectedWarehouseId={selectedTplWarehouseId}
                    onWarehouseChange={setSelectedTplWarehouseId}
                    warehouses={filteredWarehouses}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <WarehouseIcon className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'en' ? 'No Warehouse Selected' : 'Ningún Almacén Seleccionado'}
                    </h3>
                    <p className="text-white/40 max-w-md mb-8">
                      {lang === 'en' 
                        ? 'Please select a warehouse from the header or add a new one in the Admin panel to view TPL workflows.' 
                        : 'Por favor, seleccione un almacén del encabezado o agregue uno nuevo en el panel de Administración para ver los flujos de TPL.'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Go to Admin' : 'Ir a Administración'}
                    </button>
                  </div>
                )}
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
                <IntelligenceAgents lang={lang} />
              </motion.div>
            )}

            {activeTab === 'operations' && (
              <motion.div 
                key="operations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                {selectedWarehouse ? (
                  <WarehouseOperations 
                    lang={lang} 
                    market={market}
                    inventoryItems={inventoryItems}
                    addNotification={addNotification}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <WarehouseIcon className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'en' ? 'No Warehouse Selected' : 'Ningún Almacén Seleccionado'}
                    </h3>
                    <p className="text-white/40 max-w-md mb-8">
                      {lang === 'en' 
                        ? 'Please select a warehouse from the header or add a new one in the Admin panel to view warehouse operations.' 
                        : 'Por favor, seleccione un almacén del encabezado o agregue uno nuevo en el panel de Administración para ver las operaciones de almacén.'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Go to Admin' : 'Ir a Administración'}
                    </button>
                  </div>
                )}
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
                  lang={lang} 
                  market={market}
                  defaultSubTab={commercialSubTab}
                  onViewContract={(contract) => {
                    setSelectedContract(contract);
                    setActiveModal('contract-detail');
                  }}
                  onNewContract={() => setActiveModal('new-contract')}
                  onViewPricing={(pricing) => {
                    setSelectedPricing(pricing);
                    setActiveModal('pricing-detail');
                  }}
                  onViewRebate={(rebate) => {
                    setSelectedRebate(rebate);
                    setActiveModal('rebate-detail');
                  }}
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

            {activeTab === 'patio' && (
              <motion.div 
                key="patio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {selectedWarehouse ? (
                  <PatioManagement 
                    lang={lang} 
                    searchQuery={searchQuery} 
                    trucks={trucks} 
                    patioSlots={patioSlots}
                    onAddSlot={(type) => {
                      const newId = `new-${Date.now()}`;
                      const prefix = type === 'parking' ? 'P' : type === 'dock' ? 'D' : 'S';
                      const count = patioSlots.filter(s => s.type === type).length + 1;
                      const newSlot: PatioSlot = {
                        id: newId,
                        label: `${prefix}-${count.toString().padStart(2, '0')}`,
                        status: 'empty',
                        type
                      };
                      setPatioSlots(prev => [...prev, newSlot]);
                      addNotification(lang === 'en' ? `New ${type} slot added: ${newSlot.label}` : `Nuevo espacio de ${type} agregado: ${newSlot.label}`, 'success');
                    }}
                    onSlotClick={(slot) => {
                      if (slot.truckId) {
                        const truck = trucks.find(t => t.id === slot.truckId);
                        if (truck) {
                          setSelectedSubItem({ ...truck, slotLabel: slot.label, slotType: slot.type });
                          setActiveModal('dock-detail');
                        } else {
                          // Fallback if truck not found in trucks list
                          setSelectedSubItem({ 
                            id: slot.truckId, 
                            status: slot.status === 'occupied' ? 'Occupied' : 'Available',
                            truck: slot.truckId,
                            slotLabel: slot.label,
                            slotType: slot.type,
                            carrier: 'Unknown Carrier',
                            driver: 'Unknown Driver'
                          });
                          setActiveModal('dock-detail');
                        }
                      } else {
                        // Empty slot
                        setSelectedSubItem({
                          id: slot.label,
                          status: 'Available',
                          slotLabel: slot.label,
                          slotType: slot.type,
                          carrier: '-',
                          driver: '-'
                        });
                        setActiveModal('dock-detail');
                      }
                    }}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <Truck className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'en' ? 'No Warehouse Selected' : 'Ningún Almacén Seleccionado'}
                    </h3>
                    <p className="text-white/40 max-w-md mb-8">
                      {lang === 'en' 
                        ? 'Please select a warehouse from the header or add a new one in the Admin panel to view patio management.' 
                        : 'Por favor, seleccione un almacén del encabezado o agregue uno nuevo en el panel de Administración para ver la gestión de patio.'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Go to Admin' : 'Ir a Administración'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'assembly' && (
              <motion.div 
                key="assembly"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {selectedWarehouse ? (
                  <AssemblyLine 
                    lang={lang} 
                    inventoryItems={inventoryItems}
                    setInventoryItems={setInventoryItems}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <Layers className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'en' ? 'No Warehouse Selected' : 'Ningún Almacén Seleccionado'}
                    </h3>
                    <p className="text-white/40 max-w-md mb-8">
                      {lang === 'en' 
                        ? 'Please select a warehouse from the header or add a new one in the Admin panel to view assembly lines.' 
                        : 'Por favor, seleccione un almacén del encabezado o agregue uno nuevo en el panel de Administración para ver las líneas de ensamblaje.'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Go to Admin' : 'Ir a Administración'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'advanced-logistics' && (
              <motion.div 
                key="advanced-logistics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                {selectedWarehouse ? (
                  <AdvancedLogistics 
                    lang={lang} 
                    warehouse={selectedWarehouse} 
                    addNotification={addNotification} 
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <Zap className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'en' ? 'No Warehouse Selected' : 'Ningún Almacén Seleccionado'}
                    </h3>
                    <p className="text-white/40 max-w-md mb-8">
                      {lang === 'en' 
                        ? 'Please select a warehouse to view advanced logistics operations.' 
                        : 'Por favor, seleccione un almacén para ver las operaciones logísticas avanzadas.'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Go to Admin' : 'Ir a Administración'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tpl-billing' && (
              <motion.div 
                key="tpl-billing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                {selectedWarehouse ? (
                  <TPLBilling 
                    lang={lang} 
                    market={market}
                    warehouse={selectedWarehouse} 
                    addNotification={addNotification} 
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <DollarSign className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'en' ? 'No Warehouse Selected' : 'Ningún Almacén Seleccionado'}
                    </h3>
                    <p className="text-white/40 max-w-md mb-8">
                      {lang === 'en' 
                        ? 'Please select a warehouse to view 3PL billing management.' 
                        : 'Por favor, seleccione un almacén para ver la gestión de facturación 3PL.'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Go to Admin' : 'Ir a Administración'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'research' && (
              <motion.div 
                key="research"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {selectedWarehouse ? (
                  <StrategicResearch lang={lang} market={market} setActiveTab={setActiveTab} addNotification={addNotification} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 h-full">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <BrainCircuit className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {lang === 'en' ? 'No Warehouse Selected' : 'Ningún Almacén Seleccionado'}
                    </h3>
                    <p className="text-white/40 max-w-md mb-8">
                      {lang === 'en' 
                        ? 'Please select a warehouse from the header or add a new one in the Admin panel to view strategic research.' 
                        : 'Por favor, seleccione un almacén del encabezado o agregue uno nuevo en el panel de Administración para ver la investigación estratégica.'}
                    </p>
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="px-6 py-3 bg-porteo-orange text-white rounded-xl font-bold hover:bg-porteo-orange/90 transition-all"
                    >
                      {lang === 'en' ? 'Go to Admin' : 'Ir a Administración'}
                    </button>
                  </div>
                )}
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setActiveTab(previousTab)}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:text-porteo-orange hover:border-porteo-orange/50 transition-all"
                      title={lang === 'en' ? 'Back' : 'Volver'}
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{lang === 'en' ? 'System Administration' : 'Administración del Sistema'}</h2>
                      <p className="text-white/40">{lang === 'en' ? 'Manage warehouse network, users, and system integrations.' : 'Gestione la red de almacenes, usuarios e integraciones del sistema.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                    {[
                      { id: 'layout', label: lang === 'en' ? 'Warehouses' : 'Almacenes', icon: WarehouseIcon },
                      { id: 'users', label: lang === 'en' ? 'Users' : 'Usuarios', icon: Users },
                      { id: 'integration', label: lang === 'en' ? 'Integration' : 'Integración', icon: Cpu },
                      { id: 'master-data', label: lang === 'en' ? 'System Data' : 'Datos del Sistema', icon: Database }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setAdminSubTab(tab.id as any)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${adminSubTab === tab.id ? 'bg-porteo-orange text-white shadow-lg shadow-porteo-orange/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'sync', label: lang === 'en' ? 'Sync AS/400' : 'Sincronizar AS/400', icon: RefreshCw, action: syncAS400, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10' },
                    { id: 'user', label: lang === 'en' ? 'New User' : 'Nuevo Usuario', icon: UserPlus, action: () => { setEditingUser(null); setNewUser({ name: '', email: '', role: 'operator', status: 'active' }); setIsUserModalOpen(true); }, color: 'text-porteo-orange', bg: 'bg-porteo-orange/10' },
                    { id: 'import', label: lang === 'en' ? 'Import Data' : 'Importar Datos', icon: Upload, action: () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.xlsx,.xls,.csv'; input.onchange = (e: any) => { const file = e.target.files[0]; if (file) handleGlobalDataImport(file); }; input.click(); }, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { id: 'audit', label: lang === 'en' ? 'System Audit' : 'Auditoría', icon: ShieldAlert, action: runSystemAudit, color: 'text-amber-500', bg: 'bg-amber-500/10' }
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={action.action}
                      disabled={isSyncingAS400 || isAuditingSystem}
                      className="glass p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-4 group text-left disabled:opacity-50"
                    >
                      <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                        {action.id === 'sync' && isSyncingAS400 ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
                         action.id === 'audit' && isAuditingSystem ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : 
                         <action.icon className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-bold text-white leading-tight">{action.label}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {adminSubTab === 'layout' && (
                    <motion.div 
                      key="warehouses"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                      <div className="lg:col-span-2 space-y-6">
                        <div className="glass p-8 rounded-[32px] space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                              <WarehouseIcon className="w-5 h-5 text-porteo-orange" />
                              {lang === 'en' ? 'Warehouse Network' : 'Red de Almacenes'}
                            </h3>
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
                              className="px-4 py-2 bg-porteo-orange/20 border border-porteo-orange/30 text-porteo-orange rounded-xl text-sm font-bold hover:bg-porteo-orange/30 transition-all flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              {lang === 'en' ? 'Add Warehouse' : 'Agregar Almacén'}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {warehouses.map(wh => (
                              <div 
                                key={wh.id}
                                onClick={() => setEditingWarehouse(wh)}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer group ${editingWarehouse?.id === wh.id ? 'bg-porteo-orange/10 border-porteo-orange' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className={`p-3 rounded-xl ${editingWarehouse?.id === wh.id ? 'bg-porteo-orange text-white' : 'bg-white/5 text-white/40 group-hover:text-white'}`}>
                                    <WarehouseIcon className="w-5 h-5" />
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${wh.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                    {lang === 'en' ? wh.status : (wh.status === 'optimal' ? 'óptimo' : 'alerta')}
                                  </span>
                                </div>
                                <h4 className="text-white font-bold">{wh.name}</h4>
                                <p className="text-white/40 text-xs mt-1">{wh.location} • {wh.market}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {editingWarehouse && (
                          <div className="glass p-8 rounded-[32px] space-y-6">
                            <h4 className="text-white font-bold flex items-center gap-2">
                              <Settings className="w-4 h-4 text-porteo-orange" />
                              {lang === 'en' ? `Editing: ${editingWarehouse.name}` : `Editando: ${editingWarehouse.name}`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <h5 className="text-white/60 text-sm font-bold uppercase tracking-widest">{lang === 'en' ? 'Dimensions & Capacity' : 'Dimensiones y Capacidad'}</h5>
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
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="glass p-8 rounded-[32px] space-y-6">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Download className="w-5 h-5 text-porteo-blue" />
                            {lang === 'en' ? 'System Tools' : 'Herramientas'}
                          </h3>
                          <div className="space-y-3">
                            <button 
                              onClick={() => {
                                setWarehouses(MOCK_WAREHOUSES);
                                setInventoryItems(MOCK_INVENTORY);
                                addNotification(lang === 'en' ? 'Sample data loaded successfully!' : '¡Datos de muestra cargados con éxito!', 'operational');
                              }}
                              className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-between hover:bg-white/10 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <Database className="w-5 h-5 text-white/40 group-hover:text-porteo-orange transition-all" />
                                {lang === 'en' ? 'Load Sample Data' : 'Cargar Muestra'}
                              </div>
                              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
                            </button>
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
                              className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-between hover:bg-white/10 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <Upload className="w-5 h-5 text-white/40 group-hover:text-porteo-blue transition-all" />
                                {lang === 'en' ? 'Global Data Import' : 'Importar Datos Globales'}
                              </div>
                              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
                            </button>
                          </div>
                        </div>

                        <div className="glass p-8 rounded-[32px] space-y-6">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            {lang === 'en' ? 'System Health' : 'Salud del Sistema'}
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-white/40">{lang === 'en' ? 'API Latency' : 'Latencia API'}</span>
                              <span className="text-sm font-mono text-emerald-500">24ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-white/40">{lang === 'en' ? 'Database Load' : 'Carga de Base de Datos'}</span>
                              <span className="text-sm font-mono text-emerald-500">12%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-white/40">{lang === 'en' ? 'Active Sessions' : 'Sesiones Activas'}</span>
                              <span className="text-sm font-mono text-white">42</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {adminSubTab === 'users' && (
                    <motion.div 
                      key="users"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                          { label: lang === 'en' ? 'Total Users' : 'Total Usuarios', value: users.length, icon: Users, color: 'text-porteo-blue' },
                          { label: lang === 'en' ? 'Admins' : 'Administradores', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-porteo-orange' },
                          { label: lang === 'en' ? 'Active' : 'Activos', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-emerald-500' },
                          { label: lang === 'en' ? 'Inactive' : 'Inactivos', value: users.filter(u => u.status === 'inactive').length, icon: UserX, color: 'text-rose-500' }
                        ].map((stat, i) => (
                          <div key={i} className="glass p-6 rounded-3xl border border-white/10">
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                              </div>
                            </div>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="glass p-8 rounded-[32px] space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Users className="w-5 h-5 text-porteo-orange" />
                            {lang === 'en' ? 'User Management' : 'Gestión de Usuarios'}
                          </h3>
                          <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                              <input 
                                type="text"
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                placeholder={lang === 'en' ? 'Search users...' : 'Buscar usuarios...'}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:border-porteo-orange/50 transition-all"
                              />
                            </div>
                            <button 
                              onClick={() => {
                                setEditingUser(null);
                                setNewUser({ name: '', email: '', role: 'operator', status: 'active' });
                                setIsUserModalOpen(true);
                              }}
                              className="px-6 py-2.5 bg-porteo-orange text-white rounded-xl font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                            >
                              <UserPlus className="w-4 h-4" />
                              {lang === 'en' ? 'New User' : 'Nuevo Usuario'}
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'User' : 'Usuario'}</th>
                                <th className="text-left py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Role' : 'Rol'}</th>
                                <th className="text-left py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Status' : 'Estado'}</th>
                                <th className="text-left py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Last Login' : 'Último Acceso'}</th>
                                <th className="text-right py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Actions' : 'Acciones'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {users
                                .filter(u => 
                                  u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                                  u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                  u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
                                )
                                .map(user => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl border border-white/10" />
                                      <div>
                                        <p className="text-sm font-bold text-white">{user.name}</p>
                                        <p className="text-[10px] text-white/40">{user.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                      user.role === 'admin' ? 'bg-porteo-orange/20 text-porteo-orange' :
                                      user.role === 'manager' ? 'bg-porteo-blue/20 text-porteo-blue' :
                                      'bg-white/10 text-white/60'
                                    }`}>
                                      {user.role}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-white/20'}`} />
                                      <span className={`text-xs ${user.status === 'active' ? 'text-emerald-500' : 'text-white/40'}`}>
                                        {lang === 'en' ? user.status : (user.status === 'active' ? 'activo' : 'inactivo')}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <p className="text-xs text-white/40 font-mono">{new Date(user.lastLogin).toLocaleString()}</p>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                      <button 
                                        onClick={() => {
                                          setEditingUser(user);
                                          setIsUserModalOpen(true);
                                        }}
                                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-white hover:border-white/20 transition-all"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500/40 hover:text-rose-500 hover:border-rose-500/50 transition-all"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass p-8 rounded-[32px] space-y-6">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Shield className="w-5 h-5 text-porteo-blue" />
                            {lang === 'en' ? 'Access Level Definitions' : 'Definiciones de Niveles de Acceso'}
                          </h3>
                          <div className="space-y-4">
                            {[
                              { role: 'Admin', desc: lang === 'en' ? 'Full system access, user management, and global configuration.' : 'Acceso total al sistema, gestión de usuarios y configuración global.' },
                              { role: 'Manager', desc: lang === 'en' ? 'Warehouse-specific management, reporting, and operational control.' : 'Gestión específica de almacén, informes y control operativo.' },
                              { role: 'Operator', desc: lang === 'en' ? 'Inventory movements, picking, packing, and shipping tasks.' : 'Movimientos de inventario, surtido, empaque y tareas de envío.' },
                              { role: 'Viewer', desc: lang === 'en' ? 'Read-only access to dashboards and inventory reports.' : 'Acceso de solo lectura a tableros e informes de inventario.' }
                            ].map((level, i) => (
                              <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm font-bold text-white mb-1">{level.role}</p>
                                <p className="text-xs text-white/40 leading-relaxed">{level.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="glass p-8 rounded-[32px] space-y-6">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Activity className="w-5 h-5 text-porteo-orange" />
                            {lang === 'en' ? 'Security Logs' : 'Registros de Seguridad'}
                          </h3>
                          <div className="space-y-4">
                            {[
                              { user: 'Admin User', action: 'Modified System Config', time: '10m ago' },
                              { user: 'Warehouse Manager', action: 'Created New User', time: '1h ago' },
                              { user: 'Operator One', action: 'Failed Login Attempt', time: '3h ago' },
                              { user: 'Admin User', action: 'Exported Global Data', time: '5h ago' }
                            ].map((log, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white">{log.user}</p>
                                    <p className="text-[10px] text-white/40">{log.action}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] text-white/20 font-mono">{log.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {adminSubTab === 'integration' && (
                    <motion.div 
                      key="integration"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      <div className="glass p-8 rounded-[32px] border-l-4 border-porteo-blue">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="p-4 bg-porteo-blue/20 rounded-2xl text-porteo-blue">
                              <Cpu className="w-8 h-8" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                                {lang === 'en' ? 'AS/400 & LANSA Integration' : 'Integración AS/400 y LANSA'}
                              </h3>
                              <p className="text-sm text-white/40 mt-1">
                                {lang === 'en' 
                                  ? 'Real-time synchronization with IBM i physical files via LANSA Server Modules.' 
                                  : 'Sincronización en tiempo real con archivos físicos de IBM i a través de módulos de servidor LANSA.'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            {as400Status && (
                              <div className={`flex-1 md:flex-none px-4 py-3 rounded-xl border flex items-center justify-center gap-2 ${
                                as400Status.status === 'online' 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${as400Status.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                <span className="text-xs font-bold uppercase tracking-widest">
                                  {as400Status.status === 'online' ? (lang === 'en' ? 'Connected' : 'Conectado') : (lang === 'en' ? 'Disconnected' : 'Desconectado')}
                                </span>
                              </div>
                            )}
                            <button 
                              onClick={syncAS400}
                              disabled={isSyncingAS400}
                              className="flex-1 md:flex-none px-8 py-3 bg-porteo-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20 disabled:opacity-50"
                            >
                              {isSyncingAS400 ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                              {lang === 'en' ? (isSyncingAS400 ? 'Syncing...' : 'Sync Now') : (isSyncingAS400 ? 'Sincronizando...' : 'Sincronizar Ahora')}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">System Architecture</p>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Host System:</span>
                                <span className="text-white font-mono">{as400Status?.system || 'IBM i (AS/400)'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Middleware:</span>
                                <span className="text-white font-mono">{as400Status?.middleware || 'LANSA Integrator'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Connector:</span>
                                <span className="text-white font-mono">{as400Status?.connector || 'JSM REST'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Architecture:</span>
                                <span className="text-white font-mono">{as400Status?.architecture || '64-bit'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Latency:</span>
                                <span className="text-white font-mono text-emerald-400">{as400Status?.latency || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">Last Sync Intelligence</p>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Last Sync:</span>
                                <span className="text-white font-mono">{as400Status ? new Date(as400Status.lastSync).toLocaleTimeString() : 'N/A'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Data Source:</span>
                                <span className="text-white font-mono">Physical Files</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Sync Mode:</span>
                                <span className="text-white font-mono">Bidirectional</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Status:</span>
                                <span className={`text-white font-mono ${as400Status?.status === 'online' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {as400Status?.status === 'online' ? 'Success' : 'Failed'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">Connector Health</p>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${as400Status?.health && as400Status.health > 90 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                  style={{ width: `${as400Status?.health || 0}%` }}
                                />
                              </div>
                              <span className={`text-sm font-bold ${as400Status?.health && as400Status.health > 90 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {as400Status?.health || 0}%
                              </span>
                            </div>
                            <div className={`p-3 rounded-xl border ${as400Status?.health && as400Status.health > 90 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                              <p className={`text-[10px] italic leading-relaxed ${as400Status?.health && as400Status.health > 90 ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                                {as400Status?.message || (lang === 'en' ? 'System status unknown.' : 'Estado del sistema desconocido.')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 p-8 bg-white/5 rounded-[32px] border border-white/10 space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-porteo-orange/20 rounded-lg text-porteo-orange">
                              <FileText className="w-5 h-5" />
                            </div>
                            <h4 className="text-xl font-bold text-white uppercase tracking-tight">
                              {lang === 'en' ? 'Integration Read Me & Guide' : 'Guía y Read Me de Integración'}
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h5 className="text-sm font-bold text-porteo-blue uppercase tracking-widest">{lang === 'en' ? 'AS/400 (IBM i) & LANSA Basics' : 'Conceptos Básicos de AS/400 (IBM i) y LANSA'}</h5>
                              <div className="prose prose-invert prose-sm max-w-none text-white/60 leading-relaxed space-y-4">
                                <p>
                                  {lang === 'en' 
                                    ? 'The AS/400 (now IBM i) is a robust mid-range server platform. LANSA is a low-code development environment that runs natively on IBM i, allowing for rapid modernization of legacy systems.'
                                    : 'El AS/400 (ahora IBM i) es una plataforma de servidor de rango medio robusta. LANSA es un entorno de desarrollo de bajo código que se ejecuta de forma nativa en IBM i, lo que permite una rápida modernización de los sistemas heredados.'}
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li><strong>DB2 for i:</strong> {lang === 'en' ? 'The integrated relational database.' : 'La base de datos relacional integrada.'}</li>
                                  <li><strong>Physical Files (PF):</strong> {lang === 'en' ? 'Equivalent to SQL tables.' : 'Equivalente a tablas SQL.'}</li>
                                  <li><strong>Logical Files (LF):</strong> {lang === 'en' ? 'Equivalent to SQL views or indexes.' : 'Equivalente a vistas o índices SQL.'}</li>
                                  <li><strong>LANSA Server Modules:</strong> {lang === 'en' ? 'Expose IBM i data as RESTful APIs.' : 'Exponen los datos de IBM i como APIs RESTful.'}</li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h5 className="text-sm font-bold text-porteo-orange uppercase tracking-widest">{lang === 'en' ? 'Developer Installation Guide' : 'Guía de Instalación para Desarrolladores'}</h5>
                              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-xs text-white/80 space-y-4 overflow-x-auto">
                                <div>
                                  <p className="text-porteo-blue mb-1"># 1. Clone & Install Dependencies</p>
                                  <p>git clone https://github.com/porteo/wms-next-gen.git</p>
                                  <p>npm install</p>
                                </div>
                                <div>
                                  <p className="text-porteo-blue mb-1"># 2. Configure Environment</p>
                                  <p>cp .env.example .env</p>
                                  <p># Set AS400_HOST, LANSA_API_KEY, etc.</p>
                                </div>
                                <div>
                                  <p className="text-porteo-blue mb-1"># 3. Run Development Server</p>
                                  <p>npm run dev</p>
                                </div>
                                <div>
                                  <p className="text-porteo-blue mb-1"># 4. Deployment to Production</p>
                                  <p>npm run build</p>
                                  <p>docker build -t porteo-wms .</p>
                                  <p># Deploy to Cloud Run or On-Premise</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-porteo-blue/10 rounded-2xl border border-porteo-blue/20">
                            <h5 className="text-sm font-bold text-porteo-blue mb-2">{lang === 'en' ? 'Integration Strategy' : 'Estrategia de Integración'}</h5>
                            <p className="text-xs text-white/60 leading-relaxed">
                              {lang === 'en' 
                                ? 'To integrate with AS/400 via LANSA, we use the LANSA Integrator (JSM) to handle JSON/REST communication. This platform connects to the LANSA Server Modules which act as the bridge to the DB2 physical files. All transactions are logged for audit compliance.'
                                : 'Para integrar con AS/400 a través de LANSA, utilizamos LANSA Integrator (JSM) para manejar la comunicación JSON/REST. Esta plataforma se conecta a los módulos de servidor LANSA que actúan como puente hacia los archivos físicos de DB2. Todas las transacciones se registran para el cumplimiento de auditoría.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {adminSubTab === 'master-data' && (
                    <motion.div 
                      key="master-data"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      <div className="glass p-8 rounded-[32px] space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <Database className="w-5 h-5 text-porteo-orange" />
                          {lang === 'en' ? 'System Data & Tools' : 'Datos del Sistema y Herramientas'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-porteo-blue/20 rounded-lg text-porteo-blue">
                                <Package className="w-5 h-5" />
                              </div>
                              <h4 className="text-white font-bold">{lang === 'en' ? 'SKU Master' : 'Maestro de SKU'}</h4>
                            </div>
                            <p className="text-xs text-white/40">{lang === 'en' ? 'Manage product definitions, categories, and attributes.' : 'Gestione definiciones de productos, categorías y atributos.'}</p>
                            <button 
                              onClick={() => setIsSkuModalOpen(true)}
                              className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all"
                            >
                              {lang === 'en' ? 'Open SKU Manager' : 'Abrir Gestor de SKU'}
                            </button>
                          </div>

                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-porteo-orange/20 rounded-lg text-porteo-orange">
                                <Users className="w-5 h-5" />
                              </div>
                              <h4 className="text-white font-bold">{lang === 'en' ? 'Client Master' : 'Maestro de Clientes'}</h4>
                            </div>
                            <p className="text-xs text-white/40">{lang === 'en' ? 'Manage 3PL client profiles and billing preferences.' : 'Gestione perfiles de clientes 3PL y preferencias de facturación.'}</p>
                            <button 
                              onClick={() => setIsClientModalOpen(true)}
                              className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all"
                            >
                              {lang === 'en' ? 'Open Client Manager' : 'Abrir Gestor de Clientes'}
                            </button>
                          </div>

                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <h4 className="text-white font-bold">{lang === 'en' ? 'Location Master' : 'Maestro de Ubicaciones'}</h4>
                            </div>
                            <p className="text-xs text-white/40">{lang === 'en' ? 'Manage bins, slots, and storage zones across network.' : 'Gestione bins, slots y zonas de almacenamiento en la red.'}</p>
                            <button 
                              onClick={() => setIsLocationModalOpen(true)}
                              className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all"
                            >
                              {lang === 'en' ? 'Open Location Manager' : 'Abrir Gestor de Ubicaciones'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                     activeModal === 'pricing-detail' ? (lang === 'en' ? 'Pricing Details' : 'Detalles de Precios') :
                     activeModal === 'rebate-detail' ? (lang === 'en' ? 'Rebate Details' : 'Detalles de Rebate') :
                     activeModal === 'carta-porte' ? (lang === 'en' ? 'Bill of Lading' : 'Carta Porte') :
                     activeModal === 'immex-control' ? (lang === 'en' ? 'IMMEX Control' : 'Control IMMEX') :
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
                        <span className="text-white/60">
                          {lang === 'en' ? 'Current Stock' : 'Stock Actual'}
                        </span>
                        <span className="text-white font-bold">{selectedInventoryItem.quantity} {selectedInventoryItem.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">
                          {lang === 'en' ? 'Location' : 'Ubicación'}
                        </span>
                        <span className="text-white font-bold">{selectedInventoryItem.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">
                          {lang === 'en' ? 'Pallet ID' : 'ID de Pallet'}
                        </span>
                        <span className="text-white font-bold">{selectedInventoryItem.palletId}</span>
                      </div>
                    </div>
                    
                    {/* AI Recommendation in Detail */}
                    <div className="p-4 bg-porteo-blue/10 border border-porteo-blue/30 rounded-2xl flex gap-3">
                      <div className="p-2 bg-porteo-blue/20 rounded-lg h-fit">
                        <Cpu className="w-4 h-4 text-porteo-blue" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-porteo-blue uppercase tracking-widest mb-1">
                          {lang === 'en' ? 'AI Recommendation' : 'Recomendación de IA'}
                        </p>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {lang === 'en' 
                            ? "This SKU has high turnover. Consider moving it to Zone A (near Dock 2) to reduce picking time by 15%."
                            : "Este SKU tiene alta rotación. Considere moverlo a la Zona A (cerca del Muelle 2) para reducir el tiempo de surtido en un 15%."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setActiveModal('edit-item')}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10"
                      >
                        {lang === 'en' ? 'Edit Item' : 'Editar Artículo'}
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
                {activeModal === 'edit-item' && selectedInventoryItem && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-white">
                        {lang === 'en' ? 'Edit Item' : 'Editar Artículo'}
                      </h3>
                      <button onClick={() => setActiveModal('inventory-detail')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-white/40" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'Quantity' : 'Cantidad'}</label>
                          <input 
                            type="number" 
                            value={selectedInventoryItem.quantity}
                            onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, quantity: parseInt(e.target.value)})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:border-porteo-orange/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'Unit' : 'Unidad'}</label>
                          <input 
                            type="text" 
                            value={selectedInventoryItem.unit}
                            onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, unit: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:border-porteo-orange/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'Location' : 'Ubicación'}</label>
                        <input 
                          type="text" 
                          value={selectedInventoryItem.location}
                          onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, location: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:border-porteo-orange/50 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{lang === 'en' ? 'Pallet ID' : 'ID de Pallet'}</label>
                        <input 
                          type="text" 
                          value={selectedInventoryItem.palletId}
                          onChange={(e) => setSelectedInventoryItem({...selectedInventoryItem, palletId: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:border-porteo-orange/50 outline-none transition-all"
                        />
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
                        onClick={() => {
                          setInventoryItems(prev => prev.map(item => 
                            item.id === selectedInventoryItem.id ? selectedInventoryItem : item
                          ));
                          addNotification(lang === 'en' ? 'Item updated successfully' : 'Artículo actualizado con éxito', 'success');
                          setActiveModal('inventory-detail');
                        }}
                        className="flex-1 py-3 bg-porteo-orange text-white rounded-xl font-bold"
                      >
                        {lang === 'en' ? 'Save Changes' : 'Guardar Cambios'}
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
                          idling: false,
                          warehouseId: selectedWarehouse?.id || 'wh-001'
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
                      <div className="p-3 bg-porteo-orange/20 rounded-2xl text-porteo-orange">
                        <Cpu className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Slotting AI</h3>
                        <p className="text-sm text-white/60">{lang === 'en' ? 'Automated SKU placement' : 'Ubicación automatizada de SKU'}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'AI Analysis' : 'Análisis IA'}</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Data</span>
                        </div>
                      </div>
                      
                      {isSlottingLoading ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <RefreshCw className="w-8 h-8 text-porteo-orange animate-spin" />
                          <p className="text-sm text-white/40 italic">{lang === 'en' ? 'Analyzing inventory velocity...' : 'Analizando velocidad de inventario...'}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                            <p className="text-sm text-white/80 leading-relaxed italic">
                              {slottingAdvice || (lang === 'en' 
                                ? "AI suggests relocating high-velocity SKUs to Zone A to reduce picking travel time." 
                                : "IA sugiere reubicar SKUs de alta velocidad a la Zona A para reducir el tiempo de viaje.")}
                            </p>
                          </div>

                          {slottingSuggestions.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-bold text-white/40 uppercase">{lang === 'en' ? 'Proposed Relocations' : 'Reubicaciones Propuestas'}</h5>
                              <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {slottingSuggestions.map((s, i) => (
                                  <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div>
                                      <p className="text-xs font-bold text-white">{s.sku}</p>
                                      <p className="text-[10px] text-white/40">{s.reason}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40">{s.current}</span>
                                      <ArrowRight className="w-3 h-3 text-porteo-orange" />
                                      <span className="text-[10px] text-emerald-500 font-bold">{s.suggested}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-white/40 uppercase">{lang === 'en' ? 'Efficiency Gain' : 'Ganancia de Eficiencia'}</span>
                              <span className="text-[10px] text-emerald-500 font-bold">+15%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                className="h-full bg-porteo-orange" 
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="button"
                      disabled={isProcessing || slottingSuggestions.length === 0}
                      onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => {
                          // Actually apply the slotting strategy
                          setInventoryItems(prev => prev.map(item => {
                            const suggestion = slottingSuggestions.find(s => s.sku === item.sku);
                            if (suggestion) {
                              return { ...item, location: suggestion.suggested };
                            }
                            return item;
                          }));
                          
                          addNotification(
                            lang === 'en' 
                              ? `Successfully relocated ${slottingSuggestions.length} SKUs to optimal zones.` 
                              : `Se reubicaron con éxito ${slottingSuggestions.length} SKUs a zonas óptimas.`,
                            'success'
                          );
                          
                          setIsProcessing(false);
                          setActiveModal(null);
                        }, 2000);
                      }}
                      className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-all disabled:opacity-50 shadow-lg shadow-porteo-orange/20 flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          {lang === 'en' ? 'Applying Strategy...' : 'Aplicando Estrategia...'}
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          {lang === 'en' ? 'Apply Slotting Strategy' : 'Aplicar Estrategia de Slotting'}
                        </>
                      )}
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
                            <p className="text-sm text-white/80">{lang === 'en' ? 'Operational risk overview and asset protection status.' : 'Resumen de riesgo operativo y estado de protección de activos.'}</p>
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${riskScore < 70 ? 'text-rose-500' : riskScore < 85 ? 'text-porteo-orange' : 'text-emerald-500'}`}>{riskScore}/100</p>
                              <p className="text-[10px] text-white/40 uppercase font-bold">{lang === 'en' ? 'Risk Score' : 'Puntaje de Riesgo'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {dynamicRisks.map((risk, i) => (
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
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
                            <BarChart3 className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{lang === 'en' ? 'Predictive Analytics' : 'Analítica Predictiva'}</h3>
                            <p className="text-sm text-white/60">{lang === 'en' ? 'Cargo rotation & storage optimization' : 'Rotación de carga y optimización'}</p>
                          </div>
                        </div>
                        
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Projected Cargo Rotation' : 'Rotación de Carga Proyectada'}</h4>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">ML Model v4.2</span>
                          </div>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={projectedRotation}>
                                <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#ffffff40', fontSize: 10}} />
                                <YAxis hide />
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
                            className="py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            <Layers className="w-4 h-4" />
                            {lang === 'en' ? 'Rotation Details' : 'Detalles de Rotación'}
                          </button>
                          <button 
                            onClick={() => exportReport('Rotation Analysis', { categories: predictiveData })}
                            className="py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {lang === 'en' ? 'Export Report' : 'Exportar Reporte'}
                          </button>
                        </div>
                      </>
                    )}
                    {modalLevel === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setModalLevel(1)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ArrowRight className="w-5 h-5 text-white/40 rotate-180" />
                          </button>
                          <h4 className="text-lg font-bold text-white">{lang === 'en' ? 'Rotation by Category' : 'Rotación por Categoría'}</h4>
                        </div>
                        
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {predictiveData.map((cat, i) => (
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
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${parseFloat(cat.trend) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  Trend: {cat.trend}
                                </p>
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
                      </div>
                    )}
                    {modalLevel === 3 && selectedCategory && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setModalLevel(2)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ArrowRight className="w-5 h-5 text-white/40 rotate-180" />
                          </button>
                          <h4 className="text-lg font-bold text-white">{selectedCategory.category} {lang === 'en' ? 'Insights' : 'Insights'}</h4>
                        </div>

                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                          <div className="flex items-center gap-3 text-emerald-500">
                            <Zap className="w-5 h-5" />
                            <p className="text-sm font-bold uppercase tracking-widest">{lang === 'en' ? 'AI Recommendation' : 'Recomendación IA'}</p>
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed">
                            {selectedCategory.details}
                          </p>
                          <div className="pt-4 border-t border-white/5">
                            <div className="flex justify-between text-[10px] text-white/40 uppercase mb-2">
                              <span>{lang === 'en' ? 'Confidence Level' : 'Nivel de Confianza'}</span>
                              <span>94%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[94%]" />
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => {
                            addNotification(lang === 'en' ? `Applied optimization strategy for ${selectedCategory.category}` : `Estrategia aplicada para ${selectedCategory.category}`, 'success');
                            setActiveModal(null);
                          }}
                          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all"
                        >
                          {lang === 'en' ? 'Apply Category Strategy' : 'Aplicar Estrategia de Categoría'}
                        </button>
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
                          <div className="p-4 bg-porteo-orange/5 rounded-2xl border border-porteo-orange/10 flex items-center gap-3">
                            <Zap className="w-5 h-5 text-porteo-orange" />
                            <p className="text-xs text-white/80 font-bold uppercase tracking-widest">Expected Impact: {selectedTask.impact}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setModalLevel(1)}
                            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
                          >
                            {lang === 'en' ? 'Cancel' : 'Cancelar'}
                          </button>
                          <button 
                            onClick={() => {
                              setIsProcessing(true);
                              setTimeout(() => {
                                // Real effect based on task
                                if (selectedTask.id === 'TASK-02') {
                                  // Restock low items
                                  setInventoryItems(prev => prev.map(item => 
                                    item.quantity < 50 ? { ...item, quantity: item.quantity + 200 } : item
                                  ));
                                } else if (selectedTask.id === 'TASK-01') {
                                  // Consolidate space
                                  setWarehouses(prev => prev.map(w => 
                                    w.id === selectedWarehouse?.id ? { ...w, currentOccupancy: w.currentOccupancy - 5 } : w
                                  ));
                                }
                                
                                setAiTasks(prev => prev.filter(t => t.id !== selectedTask.id));
                                addNotification(lang === 'en' ? `Task "${selectedTask.task}" executed successfully.` : `Tarea "${selectedTask.task}" ejecutada con éxito.`, 'success');
                                setIsProcessing(false);
                                setActiveModal(null);
                              }, 1500);
                            }}
                            className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/80 transition-all shadow-lg shadow-porteo-orange/20 flex items-center justify-center gap-2"
                          >
                            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {lang === 'en' ? 'Approve & Execute' : 'Aprobar y Ejecutar'}
                          </button>
                        </div>
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
                    <div className={`p-6 rounded-3xl border flex items-center justify-between ${selectedSubItem.status === 'Occupied' || selectedSubItem.status === 'Unloading' || selectedSubItem.status === 'In Yard' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${selectedSubItem.status === 'Occupied' || selectedSubItem.status === 'Unloading' || selectedSubItem.status === 'In Yard' ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                          {selectedSubItem.slotType === 'parking' ? (
                            <ParkingCircle className={`w-8 h-8 ${selectedSubItem.status === 'Occupied' ? 'text-rose-500' : 'text-emerald-500'}`} />
                          ) : selectedSubItem.slotType === 'staging' ? (
                            <MapPin className={`w-8 h-8 ${selectedSubItem.status === 'Occupied' ? 'text-rose-500' : 'text-emerald-500'}`} />
                          ) : (
                            <Truck className={`w-8 h-8 ${selectedSubItem.status === 'Occupied' || selectedSubItem.status === 'Unloading' || selectedSubItem.status === 'In Yard' ? 'text-rose-500' : 'text-emerald-500'}`} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {selectedSubItem.slotType === 'parking' ? (lang === 'en' ? `Parking ${selectedSubItem.id}` : `Cajón ${selectedSubItem.id}`) :
                             selectedSubItem.slotType === 'staging' ? (lang === 'en' ? `Staging ${selectedSubItem.id}` : `Staging ${selectedSubItem.id}`) :
                             (lang === 'en' ? `Dock ${selectedSubItem.id}` : `Muelle ${selectedSubItem.id}`)}
                          </h3>
                          <p className={`text-sm font-bold ${selectedSubItem.status === 'Occupied' || selectedSubItem.status === 'Unloading' || selectedSubItem.status === 'In Yard' ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {lang === 'en' ? selectedSubItem.status : (
                              selectedSubItem.status === 'Occupied' ? 'Ocupado' :
                              selectedSubItem.status === 'Unloading' ? 'Descargando' :
                              selectedSubItem.status === 'In Yard' ? 'En Patio' :
                              selectedSubItem.status === 'Waiting' ? 'Esperando' : 'Disponible'
                            )}
                          </p>
                        </div>
                      </div>
                      {(selectedSubItem.status === 'Occupied' || selectedSubItem.status === 'Unloading' || selectedSubItem.status === 'In Yard') && (
                        <div className="text-right">
                          <p className="text-[10px] text-white/40 uppercase font-bold">{lang === 'en' ? 'Current Unit' : 'Unidad Actual'}</p>
                          <p className="text-lg font-bold text-white">{selectedSubItem.truck || selectedSubItem.id}</p>
                        </div>
                      )}
                    </div>

                    {(selectedSubItem.status === 'Occupied' || selectedSubItem.status === 'Unloading' || selectedSubItem.status === 'In Yard') ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">{lang === 'en' ? 'Carrier' : 'Transportista'}</p>
                            <p className="text-sm font-bold text-white">{selectedSubItem.carrier}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">{lang === 'en' ? 'Driver' : 'Chofer'}</p>
                            <p className="text-sm font-bold text-white">{selectedSubItem.driver}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <h4 className="text-xs font-bold text-white/40 uppercase mb-3 tracking-widest">
                            {selectedSubItem.slotType === 'dock' ? (lang === 'en' ? 'Dock Actions' : 'Acciones de Muelle') :
                             selectedSubItem.slotType === 'parking' ? (lang === 'en' ? 'Parking Actions' : 'Acciones de Cajón') :
                             (lang === 'en' ? 'Staging Actions' : 'Acciones de Staging')}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedSubItem.slotType === 'dock' ? (
                              <>
                                <button 
                                  onClick={() => {
                                    const truckId = selectedSubItem.truck || selectedSubItem.id;
                                    const updatedTrucks = trucks.map(t => t.id === truckId ? { ...t, status: 'Unloading' } : t);
                                    setTrucks(updatedTrucks);
                                    setPatioSlots(prev => prev.map(s => s.label === selectedSubItem.slotLabel ? { ...s, status: 'occupied' } : s));
                                    addNotification(lang === 'en' ? 'Unloading process started.' : 'Proceso de descarga iniciado.', 'success');
                                    setActiveModal(null);
                                  }}
                                  className="py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                                >
                                  {lang === 'en' ? 'Start Unloading' : 'Iniciar Descarga'}
                                </button>
                                <button 
                                  onClick={() => {
                                    const truckId = selectedSubItem.truck || selectedSubItem.id;
                                    const updatedTrucks = trucks.map(t => t.id === truckId ? { ...t, status: 'Waiting', dock: '-' } : t);
                                    setTrucks(updatedTrucks);
                                    setPatioSlots(prev => prev.map(s => s.label === selectedSubItem.slotLabel ? { ...s, status: 'empty', truckId: undefined } : s));
                                    addNotification(lang === 'en' ? 'Truck moved back to yard.' : 'Camión movido de vuelta al patio.', 'operational');
                                    setActiveModal(null);
                                  }}
                                  className="py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                                >
                                  {lang === 'en' ? 'Release Dock' : 'Liberar Muelle'}
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    addNotification(lang === 'en' ? 'Movement request registered.' : 'Solicitud de movimiento registrada.', 'operational');
                                    setActiveModal(null);
                                  }}
                                  className="py-3 bg-porteo-blue text-white rounded-xl text-xs font-bold hover:bg-porteo-blue/80 transition-all"
                                >
                                  {lang === 'en' ? 'Request Move' : 'Solicitar Movimiento'}
                                </button>
                                <button 
                                  onClick={() => setActiveModal(null)}
                                  className="py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                                >
                                  {lang === 'en' ? 'View History' : 'Ver Historial'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 bg-white/5 rounded-3xl border border-white/10 border-dashed flex flex-col items-center justify-center text-center">
                        <Zap className="w-12 h-12 text-white/10 mb-4" />
                        <p className="text-white/40 text-sm">
                          {selectedSubItem.slotType === 'dock' ? (lang === 'en' ? 'Dock is currently available for assignment.' : 'El muelle está actualmente disponible para asignación.') :
                           selectedSubItem.slotType === 'parking' ? (lang === 'en' ? 'Parking slot is available.' : 'El cajón de estacionamiento está disponible.') :
                           (lang === 'en' ? 'Staging area is clear.' : 'El área de staging está despejada.')}
                        </p>
                        <button 
                          onClick={() => {
                            if (selectedSubItem.slotType === 'dock') {
                              setTruckStatusFilter('Waiting');
                              addNotification(lang === 'en' ? 'Please select a waiting truck from the list to assign.' : 'Por favor seleccione un camión en espera de la lista para asignar.', 'alert');
                              setActiveModal(null);
                            } else {
                              setPatioSlots(prev => prev.map(s => s.label === selectedSubItem.slotLabel ? { ...s, status: 'reserved' } : s));
                              addNotification(lang === 'en' ? 'Assignment mode activated. Space reserved.' : 'Modo de asignación activado. Espacio reservado.', 'success');
                              setActiveModal(null);
                            }
                          }}
                          className="mt-6 px-6 py-3 bg-porteo-orange text-white rounded-xl text-xs font-bold hover:bg-porteo-orange/80 transition-all"
                        >
                          {selectedSubItem.slotType === 'dock' ? (lang === 'en' ? 'Assign Truck' : 'Asignar Camión') : (lang === 'en' ? 'Reserve Slot' : 'Reservar Espacio')}
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
                      <button 
                        onClick={() => {
                          if (selectedContract.documentUrl) {
                            window.open(selectedContract.documentUrl, '_blank');
                          } else {
                            alert(lang === 'en' ? `Viewing full document for ${selectedContract.partyName}...` : `Viendo documento completo para ${selectedContract.partyName}...`);
                          }
                        }}
                        className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <FileText className="w-5 h-5" />
                        {lang === 'en' ? 'View Full Document' : 'Ver Documento Completo'}
                      </button>
                      <button 
                        onClick={() => alert(lang === 'en' ? `Entering edit mode for contract ${selectedContract.id}...` : `Entrando en modo de edición para el contrato ${selectedContract.id}...`)}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95"
                      >
                        {lang === 'en' ? 'Edit Contract' : 'Editar Contrato'}
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
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Upload Document</label>
                      <label className="w-full border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-porteo-orange/30 transition-all cursor-pointer group">
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              addNotification(lang === 'en' ? `Document ${e.target.files[0].name} uploaded successfully.` : `Documento ${e.target.files[0].name} subido con éxito.`, 'success');
                            }
                          }}
                        />
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover:text-porteo-orange transition-colors">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">{lang === 'en' ? 'Click or drag to upload' : 'Haz clic o arrastra para subir'}</p>
                          <p className="text-xs text-white/40 mt-1">PDF, DOCX, JPG (Max 10MB)</p>
                        </div>
                      </label>
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

                {activeModal === 'pricing-detail' && selectedPricing && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-xs text-white/40 uppercase font-bold">{lang === 'en' ? 'Customer' : 'Cliente'}</p>
                        <p className="text-xl font-bold text-white">{selectedPricing.customerId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40 uppercase font-bold">{lang === 'en' ? 'Contract ID' : 'ID de Contrato'}</p>
                        <p className="font-mono text-porteo-orange">{selectedPricing.contractId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'SKU' : 'SKU'}</p>
                        <p className="text-lg font-bold text-white">{selectedPricing.sku}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Discount' : 'Descuento'}</p>
                        <p className="text-lg font-bold text-emerald-500">-{((1 - selectedPricing.discountedPrice/selectedPricing.basePrice) * 100).toFixed(0)}%</p>
                      </div>
                    </div>

                    <div className="p-6 bg-porteo-orange/10 rounded-2xl border border-porteo-orange/20">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white/60">{lang === 'en' ? 'Base Price' : 'Precio Base'}</span>
                        <span className="text-white line-through">${selectedPricing.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-lg font-bold text-white">{lang === 'en' ? 'Contract Price' : 'Precio de Contrato'}</span>
                        {isEditingPricing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xl">$</span>
                            <input 
                              type="number" 
                              defaultValue={selectedPricing.discountedPrice}
                              className="w-24 bg-white/10 border border-porteo-orange/50 rounded-lg px-2 py-1 text-white text-xl font-bold outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-porteo-orange">${selectedPricing.discountedPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {showPricingHistory && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 overflow-hidden"
                      >
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Price History' : 'Historial de Precios'}</h4>
                        <div className="space-y-2">
                          {pricingHistory.map((h, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">${h.price.toFixed(2)}</span>
                                <span className="text-[10px] text-white/40">{h.reason}</span>
                              </div>
                              <span className="text-[10px] text-white/40 font-mono">{h.date}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          if (isEditingPricing) {
                            addNotification(lang === 'en' ? 'Pricing updated successfully' : 'Precio actualizado con éxito', 'success');
                            setIsEditingPricing(false);
                          } else {
                            setIsEditingPricing(true);
                            setShowPricingHistory(false);
                          }
                        }}
                        className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
                          isEditingPricing 
                            ? 'bg-porteo-orange text-white' 
                            : 'bg-porteo-orange/20 border border-porteo-orange/30 text-porteo-orange hover:bg-porteo-orange/30'
                        }`}
                      >
                        {isEditingPricing 
                          ? (lang === 'en' ? 'Save Changes' : 'Guardar Cambios') 
                          : (lang === 'en' ? 'Edit Pricing' : 'Editar Precios')}
                      </button>
                      <button 
                        onClick={() => {
                          setShowPricingHistory(!showPricingHistory);
                          setIsEditingPricing(false);
                        }}
                        className={`flex-1 py-3 border font-bold rounded-xl transition-colors ${
                          showPricingHistory
                            ? 'bg-white/20 border-white/40 text-white'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        {showPricingHistory 
                          ? (lang === 'en' ? 'Hide History' : 'Ocultar Historial') 
                          : (lang === 'en' ? 'View History' : 'Ver Historial')}
                      </button>
                    </div>
                  </div>
                )}

                {activeModal === 'rebate-detail' && selectedRebate && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-xs text-white/40 uppercase font-bold">{lang === 'en' ? 'Supplier' : 'Proveedor'}</p>
                        <p className="text-xl font-bold text-white">{selectedRebate.supplierName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40 uppercase font-bold">{lang === 'en' ? 'Rebate %' : '% de Rebate'}</p>
                        <p className="text-xl font-bold text-emerald-500">{selectedRebate.rebatePercentage}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Target' : 'Meta'}</p>
                        <p className="text-lg font-bold text-white">${selectedRebate.targetVolume.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Current' : 'Actual'}</p>
                        <p className="text-lg font-bold text-white">${selectedRebate.currentVolume.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Progress' : 'Progreso'}</p>
                        <p className="text-lg font-bold text-porteo-orange">
                          {((selectedRebate.currentVolume / selectedRebate.targetVolume) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                      <p className="text-sm text-white/60 mb-1">{lang === 'en' ? 'Estimated Accrued Credit' : 'Crédito Acumulado Estimado'}</p>
                      <p className="text-4xl font-bold text-emerald-500">
                        ${(selectedRebate.currentVolume * (selectedRebate.rebatePercentage / 100)).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-porteo-orange transition-all duration-1000"
                          style={{ width: `${Math.min(100, (selectedRebate.currentVolume / selectedRebate.targetVolume) * 100)}%` }}
                        />
                      </div>
                      <p className="text-center text-xs text-white/40">
                        {lang === 'en' 
                          ? `Remaining to target: $${(selectedRebate.targetVolume - selectedRebate.currentVolume).toLocaleString()}`
                          : `Restante para la meta: $${(selectedRebate.targetVolume - selectedRebate.currentVolume).toLocaleString()}`}
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        exportReport(`Rebate-Report-${selectedRebate.supplierName}`, selectedRebate);
                      }}
                      className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {lang === 'en' ? 'Download Rebate Report' : 'Descargar Reporte de Rebates'}
                    </button>
                  </div>
                )}

                {activeModal === 'carta-porte' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-xl font-bold text-white">{lang === 'en' ? 'Generate Carta Porte' : 'Generar Carta Porte'}</h4>
                          <p className="text-sm text-white/40">{lang === 'en' ? 'CFDI 4.0 Compliance with Complemento Carta Porte v3.0' : 'Cumplimiento CFDI 4.0 con Complemento Carta Porte v3.0'}</p>
                        </div>
                        <div className="p-3 bg-porteo-orange/20 rounded-2xl text-porteo-orange">
                          <FileText className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Folio Number' : 'Número de Folio'}</p>
                          <p className="text-lg font-bold text-white">CP-2024-0042</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Status' : 'Estatus'}</p>
                          <span className="px-2 py-0.5 bg-porteo-orange/20 text-porteo-orange rounded text-[10px] font-bold uppercase">
                            {lang === 'en' ? 'Draft' : 'Borrador'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <button 
                          onClick={() => addNotification(lang === 'en' ? 'Generating and Stamping CFDI...' : 'Generando y Timbrando CFDI...', 'operational')}
                          className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          {lang === 'en' ? 'Generate & Stamp CFDI' : 'Generar y Timbrar CFDI'}
                        </button>
                        <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                          {lang === 'en' ? 'Preview PDF' : 'Vista Previa PDF'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === 'immex-control' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Temporary' : 'Temporal'}</p>
                        <p className="text-2xl font-bold text-white">1,240</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'Expired' : 'Vencido'}</p>
                        <p className="text-2xl font-bold text-rose-500">12</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{lang === 'en' ? 'To Expire' : 'Por Vencer'}</p>
                        <p className="text-2xl font-bold text-porteo-orange">45</p>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <h4 className="text-lg font-bold text-white mb-4">{lang === 'en' ? 'Anexo 24 Compliance' : 'Cumplimiento Anexo 24'}</h4>
                      <div className="space-y-3">
                        <button className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-porteo-blue/20 rounded-lg text-porteo-blue">
                              <Download className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-white/80">{lang === 'en' ? 'Download Pedimento Details' : 'Descargar Detalle de Pedimentos'}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-porteo-blue transition-all" />
                        </button>
                        <button className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-porteo-orange/20 rounded-lg text-porteo-orange">
                              <RefreshCw className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-white/80">{lang === 'en' ? 'Sync with SAT Portal' : 'Sincronizar con Portal SAT'}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-porteo-orange transition-all" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {editingUser ? (lang === 'en' ? 'Edit User' : 'Editar Usuario') : (lang === 'en' ? 'Create New User' : 'Crear Nuevo Usuario')}
                    </h3>
                    <p className="text-white/40">
                      {lang === 'en' ? 'Define access levels and user credentials.' : 'Defina niveles de acceso y credenciales de usuario.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsUserModalOpen(false)}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Full Name' : 'Nombre Completo'}</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                          type="text"
                          value={editingUser ? editingUser.name : newUser.name}
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, name: e.target.value}) : setNewUser({...newUser, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Email Address' : 'Correo Electrónico'}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                          type="email"
                          value={editingUser ? editingUser.email : newUser.email}
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="john@porteo.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'System Role' : 'Rol del Sistema'}</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <select 
                          value={editingUser ? editingUser.role : newUser.role}
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, role: e.target.value as UserRole}) : setNewUser({...newUser, role: e.target.value as UserRole})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-porteo-orange/50 transition-all appearance-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="operator">Operator</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Account Status' : 'Estado de la Cuenta'}</label>
                      <div className="flex gap-4">
                        {['active', 'inactive'].map((status) => (
                          <button
                            key={status}
                            onClick={() => editingUser ? setEditingUser({...editingUser, status: status as any}) : setNewUser({...newUser, status: status as any})}
                            className={`flex-1 py-4 rounded-2xl border font-bold text-sm transition-all ${
                              (editingUser ? editingUser.status : newUser.status) === status 
                                ? 'bg-porteo-orange/20 border-porteo-orange text-porteo-orange' 
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {lang === 'en' ? status.charAt(0).toUpperCase() + status.slice(1) : (status === 'active' ? 'Activo' : 'Inactivo')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button 
                      onClick={() => setIsUserModalOpen(false)}
                      className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                      {lang === 'en' ? 'Cancel' : 'Cancelar'}
                    </button>
                    <button 
                      onClick={() => editingUser ? handleEditUser(editingUser) : handleAddUser(newUser)}
                      className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                    >
                      {editingUser ? (lang === 'en' ? 'Save Changes' : 'Guardar Cambios') : (lang === 'en' ? 'Create User' : 'Crear Usuario')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SKU Master Modal */}
      <AnimatePresence>
        {isSkuModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsSkuModalOpen(false); setIsSkuFormOpen(false); setEditingSku(null); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
                    {isSkuFormOpen 
                      ? (editingSku ? (lang === 'en' ? 'Edit SKU' : 'Editar SKU') : (lang === 'en' ? 'Add New SKU' : 'Agregar Nuevo SKU'))
                      : (lang === 'en' ? 'SKU Master Management' : 'Gestión Maestra de SKU')}
                  </h2>
                  <p className="text-white/40 text-sm mt-1">
                    {isSkuFormOpen 
                      ? (lang === 'en' ? 'Define product specifications and attributes.' : 'Defina especificaciones y atributos del producto.')
                      : (lang === 'en' ? 'Centralized product definition and attribute control.' : 'Definición centralizada de productos y control de atributos.')}
                  </p>
                </div>
                <button 
                  onClick={() => { 
                    if (isSkuFormOpen) { setIsSkuFormOpen(false); setEditingSku(null); }
                    else setIsSkuModalOpen(false); 
                  }} 
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                >
                  {isSkuFormOpen ? <ChevronLeft className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                {isSkuFormOpen ? (
                  <div className="space-y-8 max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">SKU Code</label>
                        <input 
                          type="text"
                          value={editingSku ? editingSku.sku : newSku.sku}
                          onChange={(e) => editingSku ? setEditingSku({...editingSku, sku: e.target.value}) : setNewSku({...newSku, sku: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="PROD-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Product Name' : 'Nombre del Producto'}</label>
                        <input 
                          type="text"
                          value={editingSku ? editingSku.name : newSku.name}
                          onChange={(e) => editingSku ? setEditingSku({...editingSku, name: e.target.value}) : setNewSku({...newSku, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="Premium Widget"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Category' : 'Categoría'}</label>
                        <select 
                          value={editingSku ? editingSku.category : newSku.category}
                          onChange={(e) => editingSku ? setEditingSku({...editingSku, category: e.target.value as any}) : setNewSku({...newSku, category: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all appearance-none"
                        >
                          <option value="Engine">Engine</option>
                          <option value="Brakes">Brakes</option>
                          <option value="Suspension">Suspension</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Body">Body</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Velocity' : 'Velocidad'}</label>
                        <select 
                          value={editingSku ? editingSku.velocity : newSku.velocity}
                          onChange={(e) => editingSku ? setEditingSku({...editingSku, velocity: e.target.value as any}) : setNewSku({...newSku, velocity: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all appearance-none"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                      <button 
                        onClick={() => { setIsSkuFormOpen(false); setEditingSku(null); }}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                      >
                        {lang === 'en' ? 'Cancel' : 'Cancelar'}
                      </button>
                      <button 
                        onClick={() => editingSku ? handleEditSku(editingSku) : handleAddSku(newSku)}
                        className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                      >
                        {editingSku ? (lang === 'en' ? 'Save Changes' : 'Guardar Cambios') : (lang === 'en' ? 'Create SKU' : 'Crear SKU')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                          type="text"
                          value={skuSearchQuery}
                          onChange={(e) => setSkuSearchQuery(e.target.value)}
                          placeholder={lang === 'en' ? 'Search by SKU or Name...' : 'Buscar por SKU o Nombre...'}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-porteo-orange/50 transition-all"
                        />
                      </div>
                      <button 
                        onClick={() => setIsSkuFormOpen(true)}
                        className="px-8 py-4 bg-porteo-orange text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                      >
                        <Plus className="w-5 h-5" />
                        {lang === 'en' ? 'Add SKU' : 'Agregar SKU'}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">SKU</th>
                            <th className="text-left py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Product Name' : 'Nombre del Producto'}</th>
                            <th className="text-left py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Category' : 'Categoría'}</th>
                            <th className="text-left py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Velocity' : 'Velocidad'}</th>
                            <th className="text-right py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'en' ? 'Actions' : 'Acciones'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryItems
                            .filter(item => item.sku.toLowerCase().includes(skuSearchQuery.toLowerCase()) || item.name.toLowerCase().includes(skuSearchQuery.toLowerCase()))
                            .map(item => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                              <td className="py-4 px-6 font-mono text-xs text-porteo-blue">{item.sku}</td>
                              <td className="py-4 px-6 text-sm text-white font-bold">{item.name}</td>
                              <td className="py-4 px-6">
                                <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-white/60 uppercase font-bold border border-white/10">{item.category || 'N/A'}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                  item.velocity === 'High' ? 'bg-emerald-500/20 text-emerald-500' :
                                  item.velocity === 'Medium' ? 'bg-amber-500/20 text-amber-500' :
                                  'bg-white/10 text-white/40'
                                }`}>
                                  {item.velocity || 'Low'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button 
                                  onClick={() => { setEditingSku(item); setIsSkuFormOpen(true); }}
                                  className="p-2 text-white/20 hover:text-white transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Client Master Modal */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsClientModalOpen(false); setIsClientFormOpen(false); setEditingClient(null); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
                    {isClientFormOpen 
                      ? (editingClient ? (lang === 'en' ? 'Edit Client' : 'Editar Cliente') : (lang === 'en' ? 'Add New Client' : 'Agregar Nuevo Cliente'))
                      : (lang === 'en' ? 'Client Master Management' : 'Gestión Maestra de Clientes')}
                  </h2>
                  <p className="text-white/40 text-sm mt-1">
                    {isClientFormOpen 
                      ? (lang === 'en' ? 'Configure client profile and billing details.' : 'Configure el perfil del cliente y detalles de facturación.')
                      : (lang === 'en' ? 'Manage 3PL client relationships and billing configurations.' : 'Gestione relaciones con clientes 3PL y configuraciones de facturación.')}
                  </p>
                </div>
                <button 
                  onClick={() => { 
                    if (isClientFormOpen) { setIsClientFormOpen(false); setEditingClient(null); }
                    else setIsClientModalOpen(false); 
                  }} 
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                >
                  {isClientFormOpen ? <ChevronLeft className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                {isClientFormOpen ? (
                  <div className="space-y-8 max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Client Name' : 'Nombre del Cliente'}</label>
                        <input 
                          type="text"
                          value={editingClient ? editingClient.name : newClient.name}
                          onChange={(e) => editingClient ? setEditingClient({...editingClient, name: e.target.value}) : setNewClient({...newClient, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="Global Logistics Inc."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Email Address' : 'Correo Electrónico'}</label>
                        <input 
                          type="email"
                          value={editingClient ? editingClient.email : newClient.email}
                          onChange={(e) => editingClient ? setEditingClient({...editingClient, email: e.target.value}) : setNewClient({...newClient, email: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="contact@global.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Phone Number' : 'Número de Teléfono'}</label>
                        <input 
                          type="text"
                          value={editingClient ? editingClient.phone : newClient.phone}
                          onChange={(e) => editingClient ? setEditingClient({...editingClient, phone: e.target.value}) : setNewClient({...newClient, phone: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="+1 555-0123"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Billing Cycle' : 'Ciclo de Facturación'}</label>
                        <select 
                          value={editingClient ? editingClient.billingCycle : newClient.billingCycle}
                          onChange={(e) => editingClient ? setEditingClient({...editingClient, billingCycle: e.target.value as any}) : setNewClient({...newClient, billingCycle: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all appearance-none"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="bi-weekly">Bi-Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Physical Address' : 'Dirección Física'}</label>
                      <textarea 
                        value={editingClient ? editingClient.address : newClient.address}
                        onChange={(e) => editingClient ? setEditingClient({...editingClient, address: e.target.value}) : setNewClient({...newClient, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all min-h-[100px]"
                        placeholder="123 Logistics Way, Suite 100..."
                      />
                    </div>

                    <div className="pt-8 flex gap-4">
                      <button 
                        onClick={() => { setIsClientFormOpen(false); setEditingClient(null); }}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                      >
                        {lang === 'en' ? 'Cancel' : 'Cancelar'}
                      </button>
                      <button 
                        onClick={() => editingClient ? handleEditClient(editingClient) : handleAddClient(newClient)}
                        className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                      >
                        {editingClient ? (lang === 'en' ? 'Save Changes' : 'Guardar Cambios') : (lang === 'en' ? 'Create Client' : 'Crear Cliente')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                          type="text"
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          placeholder={lang === 'en' ? 'Search by Client Name or Email...' : 'Buscar por Nombre de Cliente o Correo...'}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-porteo-orange/50 transition-all"
                        />
                      </div>
                      <button 
                        onClick={() => setIsClientFormOpen(true)}
                        className="px-8 py-4 bg-porteo-orange text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                      >
                        <Plus className="w-5 h-5" />
                        {lang === 'en' ? 'Add Client' : 'Agregar Cliente'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {clients
                        .filter(c => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) || c.email.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                        .map(client => (
                        <div key={client.id} className="glass p-8 rounded-[32px] border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-porteo-orange/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-porteo-orange/10 transition-all" />
                          
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-porteo-orange border border-white/10 group-hover:bg-porteo-orange group-hover:text-white transition-all shadow-xl">
                                <Building2 className="w-8 h-8" />
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-white">{client.name}</h4>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">{client.id}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase border ${
                              client.status === 'active' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            }`}>
                              {client.status}
                            </span>
                          </div>
                          
                          <div className="space-y-3 mb-8 relative z-10">
                            <div className="flex items-center gap-3 text-sm text-white/60">
                              <div className="p-1.5 bg-white/5 rounded-lg">
                                <Mail className="w-4 h-4" />
                              </div>
                              {client.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/60">
                              <div className="p-1.5 bg-white/5 rounded-lg">
                                <Phone className="w-4 h-4" />
                              </div>
                              {client.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/60">
                              <div className="p-1.5 bg-white/5 rounded-lg">
                                <MapPin className="w-4 h-4" />
                              </div>
                              {client.address}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-6 border-t border-white/5 relative z-10">
                            <div>
                              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{lang === 'en' ? 'Billing Cycle' : 'Ciclo de Facturación'}</p>
                              <p className="text-white font-bold text-sm capitalize">{client.billingCycle}</p>
                            </div>
                            <button 
                              onClick={() => { setEditingClient(client); setIsClientFormOpen(true); }}
                              className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                            >
                              {lang === 'en' ? 'Edit Profile' : 'Editar Perfil'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Location Master Modal */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsLocationModalOpen(false); setIsLocationFormOpen(false); setEditingLocation(null); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
                    {isLocationFormOpen 
                      ? (editingLocation ? (lang === 'en' ? 'Edit Location' : 'Editar Ubicación') : (lang === 'en' ? 'Add New Location' : 'Agregar Nueva Ubicación'))
                      : (lang === 'en' ? 'Location Master Management' : 'Gestión Maestra de Ubicaciones')}
                  </h2>
                  <p className="text-white/40 text-sm mt-1">
                    {isLocationFormOpen 
                      ? (lang === 'en' ? 'Define storage coordinates and slot types.' : 'Defina coordenadas de almacenamiento y tipos de slot.')
                      : (lang === 'en' ? 'Define and monitor storage slots across the network.' : 'Defina y monitoree slots de almacenamiento en la red.')}
                  </p>
                </div>
                <button 
                  onClick={() => { 
                    if (isLocationFormOpen) { setIsLocationFormOpen(false); setEditingLocation(null); }
                    else setIsLocationModalOpen(false); 
                  }} 
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                >
                  {isLocationFormOpen ? <ChevronLeft className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                {isLocationFormOpen ? (
                  <div className="space-y-8 max-w-2xl mx-auto">
                    <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Zone' : 'Zona'}</label>
                        <input 
                          type="text"
                          value={editingLocation ? editingLocation.zone : newMasterLocation.zone}
                          onChange={(e) => editingLocation ? setEditingLocation({...editingLocation, zone: e.target.value}) : setNewMasterLocation({...newMasterLocation, zone: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="A"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Aisle' : 'Pasillo'}</label>
                        <input 
                          type="text"
                          value={editingLocation ? editingLocation.aisle : newMasterLocation.aisle}
                          onChange={(e) => editingLocation ? setEditingLocation({...editingLocation, aisle: e.target.value}) : setNewMasterLocation({...newMasterLocation, aisle: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="01"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">Rack</label>
                        <input 
                          type="text"
                          value={editingLocation ? editingLocation.rack : newMasterLocation.rack}
                          onChange={(e) => editingLocation ? setEditingLocation({...editingLocation, rack: e.target.value}) : setNewMasterLocation({...newMasterLocation, rack: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all"
                          placeholder="01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Location Type' : 'Tipo de Ubicación'}</label>
                        <select 
                          value={editingLocation ? editingLocation.type : newMasterLocation.type}
                          onChange={(e) => editingLocation ? setEditingLocation({...editingLocation, type: e.target.value as any}) : setNewMasterLocation({...newMasterLocation, type: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all appearance-none"
                        >
                          <option value="picking">Picking</option>
                          <option value="bulk">Bulk</option>
                          <option value="staging">Staging</option>
                          <option value="returns">Returns</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest ml-4">{lang === 'en' ? 'Status' : 'Estado'}</label>
                        <select 
                          value={editingLocation ? editingLocation.status : newMasterLocation.status}
                          onChange={(e) => editingLocation ? setEditingLocation({...editingLocation, status: e.target.value as any}) : setNewMasterLocation({...newMasterLocation, status: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-porteo-orange/50 transition-all appearance-none"
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                      <button 
                        onClick={() => { setIsLocationFormOpen(false); setEditingLocation(null); }}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                      >
                        {lang === 'en' ? 'Cancel' : 'Cancelar'}
                      </button>
                      <button 
                        onClick={() => editingLocation ? handleEditLocation(editingLocation) : handleAddLocation(newMasterLocation)}
                        className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                      >
                        {editingLocation ? (lang === 'en' ? 'Save Changes' : 'Guardar Cambios') : (lang === 'en' ? 'Create Location' : 'Crear Ubicación')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                          type="text"
                          value={locationSearchQuery}
                          onChange={(e) => setLocationSearchQuery(e.target.value)}
                          placeholder={lang === 'en' ? 'Search by Zone, Aisle, or Rack...' : 'Buscar por Zona, Pasillo o Rack...'}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-porteo-orange/50 transition-all"
                        />
                      </div>
                      <button 
                        onClick={() => setIsLocationFormOpen(true)}
                        className="px-8 py-4 bg-porteo-orange text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                      >
                        <Plus className="w-5 h-5" />
                        {lang === 'en' ? 'Add Location' : 'Agregar Ubicación'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {masterLocations
                        .filter(l => l.zone.includes(locationSearchQuery) || l.aisle.includes(locationSearchQuery) || l.rack.includes(locationSearchQuery))
                        .map(loc => (
                        <div key={loc.id} className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all text-center space-y-4 group relative">
                          <button 
                            onClick={() => { setEditingLocation(loc); setIsLocationFormOpen(true); }}
                            className="absolute top-2 right-2 p-2 text-white/0 group-hover:text-white/40 hover:text-white transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                            loc.status === 'available' ? 'bg-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' :
                            loc.status === 'occupied' ? 'bg-porteo-orange/20 text-porteo-orange group-hover:bg-porteo-orange group-hover:text-white' :
                            'bg-amber-500/20 text-amber-500 group-hover:bg-amber-500 group-hover:text-white'
                          }`}>
                            <MapPin className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white">{loc.zone}-{loc.aisle}-{loc.rack}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">{loc.type}</p>
                          </div>
                          <div className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full inline-block border ${
                            loc.status === 'available' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                            loc.status === 'occupied' ? 'bg-porteo-orange/10 border-porteo-orange/20 text-porteo-orange' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          }`}>
                            {loc.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
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
        lang={lang} 
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

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[500] glass px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl min-w-[320px]"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              toast.type === 'alert' ? 'bg-rose-500/20 text-rose-500' :
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
              'bg-porteo-orange/20 text-porteo-orange'
            }`}>
              {toast.type === 'alert' ? <AlertCircle className="w-5 h-5" /> :
               toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
               <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{toast.message}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                {lang === 'en' ? 'System Notification' : 'Notificación del Sistema'}
              </p>
            </div>
            <button onClick={() => setToast(null)} className="text-white/20 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistants Floating Interface - Refactored to avoid blocking UI */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {isAiHubOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="pointer-events-auto flex flex-col items-end gap-3 mb-2"
            >
              <AIAssistant role="Control Tower" lang={lang} context={`Current Warehouse: ${selectedWarehouse?.name || 'None'}, Occupancy: ${selectedWarehouse?.currentOccupancy || 0}/${selectedWarehouse?.capacity || 0}, Status: ${selectedWarehouse?.status || 'N/A'}`} />
              <AIAssistant role="Warehouse Director" lang={lang} context={`Warehouse: ${selectedWarehouse?.name || 'None'}, Layout: ${selectedWarehouse?.layout?.racks?.rows || 0}x${selectedWarehouse?.layout?.racks?.cols || 0}, Inventory: ${inventoryItems.length} items`} onFileUpload={(file) => {
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
              <AIAssistant role="Supply Chain Director" lang={lang} context={`Network: USA & Mexico, Total Warehouses: 3, Market Focus: ${market}`} />
              <AIAssistant role="COO Assistant" lang={lang} context={`Financials: Revenue trending up, Cost per pallet: $4.20, Labor efficiency: 91%`} />
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
