import { 
  Warehouse, 
  InventoryItem, 
  TPLProcess, 
  WMSNotification, 
  PatioSlot,
  CustomerPricing,
  SupplierRebate,
  SalesChannel,
  BinLocation,
  Contract
} from './types';

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'Porteo Hub North',
    location: 'Monterrey, NL',
    market: 'MEXICO',
    capacity: 150000,
    currentOccupancy: 65,
    temperature: 18,
    status: 'optimal',
    layout: { racks: { rows: 8, cols: 12 }, docks: 6, zones: [{ name: 'Zone A', color: 'blue', racks: ['A1', 'A2'] }, { name: 'Zone B', color: 'green', racks: ['B1', 'B2'] }, { name: 'Cold Storage', color: 'cyan', racks: ['C1'] }] }
  },
  {
    id: 'wh-002',
    name: 'Porteo Logistics Center',
    location: 'Laredo, TX',
    market: 'USA',
    capacity: 250000,
    currentOccupancy: 42,
    temperature: 22,
    status: 'optimal',
    layout: { racks: { rows: 12, cols: 20 }, docks: 12, zones: [{ name: 'General', color: 'gray', racks: ['G1'] }, { name: 'Hazardous', color: 'red', racks: ['H1'] }, { name: 'High Value', color: 'gold', racks: ['HV1'] }] }
  }
];

export const MOCK_INVENTORY_USA: InventoryItem[] = [
  {
    id: 'inv-usa-001',
    sku: 'ENG-V8-USA',
    name: 'V8 Engine Block (US Spec)',
    quantity: 120,
    unit: 'units',
    location: 'A-01-01',
    palletId: 'PAL-USA-1001',
    customer: 'AutoCorp Global',
    brand: 'PowerTech',
    category: 'Engine',
    velocity: 'High',
    compatibility: ['Ford F-150', 'Chevy Silverado']
  },
  {
    id: 'inv-usa-002',
    sku: 'TRN-6SPD-USA',
    name: '6-Speed Transmission',
    quantity: 85,
    unit: 'units',
    location: 'B-02-05',
    palletId: 'PAL-USA-2001',
    customer: 'TruckMasters US',
    brand: 'GearShift',
    category: 'Other',
    velocity: 'Medium',
    compatibility: ['RAM 1500']
  }
];

export const MOCK_INVENTORY_MEXICO: InventoryItem[] = [
  {
    id: 'inv-mex-001',
    sku: 'BRK-CER-MEX',
    name: 'Ceramic Brake Pads (MX Spec)',
    quantity: 2500,
    unit: 'sets',
    location: 'M-04-12',
    palletId: 'PAL-MEX-2045',
    customer: 'SpeedyParts MX',
    brand: 'StopSafe',
    category: 'Brakes',
    velocity: 'High',
    compatibility: ['Toyota Camry', 'Honda Accord']
  },
  {
    id: 'inv-mex-002',
    sku: 'OIL-SYN-MEX',
    name: 'Synthetic Oil 5W-30',
    quantity: 500,
    unit: 'liters',
    location: 'L-01-10',
    palletId: 'PAL-MEX-3001',
    customer: 'Lubricantes del Norte',
    brand: 'UltraOil',
    category: 'Other',
    velocity: 'Low',
    compatibility: ['All Vehicles']
  }
];

export const MOCK_TRUCKS_USA = [
  { id: 'TRK-USA-001', carrier: 'Swift US', type: 'Full Truck', driver: 'John Smith', status: 'In Yard', dock: 'Dock 4', eta: '08:00', idling: true, warehouseId: 'wh-002' },
  { id: 'TRK-USA-002', carrier: 'Schneider US', type: 'Thorton', driver: 'Jane Doe', status: 'Unloading', dock: 'Dock 2', eta: '09:15', idling: false, warehouseId: 'wh-002' },
  { id: 'TRK-USA-003', carrier: 'Werner US', type: '3.5 Van', driver: 'Bob Wilson', status: 'Waiting', dock: '-', eta: '10:30', idling: true, warehouseId: 'wh-002' },
];

export const MOCK_TRUCKS_MEXICO = [
  { id: 'TRK-MEX-001', carrier: 'Transportes MX', type: 'Full Truck', driver: 'Juan Perez', status: 'In Yard', dock: 'Dock 1', eta: '07:00', idling: false, warehouseId: 'wh-001' },
  { id: 'TRK-MEX-002', carrier: 'Logística Norte', type: 'Thorton', driver: 'Maria Garcia', status: 'Unloading', dock: 'Dock 3', eta: '08:30', idling: true, warehouseId: 'wh-001' },
  { id: 'TRK-MEX-003', carrier: 'Fletes Rápidos', type: '3.5 Van', driver: 'Carlos Ruiz', status: 'Waiting', dock: '-', eta: '09:45', idling: false, warehouseId: 'wh-001' },
];

export const MOCK_TPL_PROCESSES_USA: TPLProcess[] = [
  {
    id: 'TPL-USA-101',
    customer: 'AutoCorp Global',
    truckId: 'TRK-USA-552',
    truckType: 'Full Truck',
    origin: 'Detroit, MI',
    destination: 'Laredo, TX',
    status: 'in-transit-to-wh',
    appointmentTime: '14:30',
    steps: [
      { id: 's1', label: { en: 'Collection', es: 'Recolección' }, status: 'completed', timestamp: '08:00 AM' },
      { id: 's2', label: { en: 'In Transit', es: 'En Tránsito' }, status: 'in-progress', timestamp: '10:30 AM' }
    ]
  }
];

export const MOCK_TPL_PROCESSES_MEXICO: TPLProcess[] = [
  {
    id: 'TPL-MEX-201',
    customer: 'SpeedyParts MX',
    truckId: 'TRK-MEX-221',
    truckType: 'Thorton',
    origin: 'Mexico City, MX',
    destination: 'Monterrey, NL',
    status: 'unloading',
    appointmentTime: '11:00',
    steps: [
      { id: 's1', label: { en: 'Collection', es: 'Recolección' }, status: 'completed', timestamp: 'Yesterday' },
      { id: 's2', label: { en: 'Arrival', es: 'Llegada' }, status: 'completed', timestamp: '09:00 AM' },
      { id: 's3', label: { en: 'Unloading', es: 'Descarga' }, status: 'in-progress', timestamp: '10:45 AM' }
    ]
  }
];

export const MOCK_INVENTORY: InventoryItem[] = MOCK_INVENTORY_MEXICO;

export const MOCK_PRICING: CustomerPricing[] = [
  { id: 'p-001', customerId: 'AutoCorp Global', sku: 'ENG-V8-500', basePrice: 15000, discountedPrice: 13500, contractId: 'CTR-2024-001', currency: 'USD' },
  { id: 'p-002', customerId: 'SpeedyParts MX', sku: 'BRK-CER-02', basePrice: 450, discountedPrice: 380, contractId: 'CTR-2024-045', currency: 'MXN' }
];

export const MOCK_REBATES: SupplierRebate[] = [
  { id: 'r-001', supplierId: 'SUP-001', supplierName: 'PowerTech Logistics', targetVolume: 1000000, rebatePercentage: 5, currentVolume: 850000, status: 'active' },
  { id: 'r-002', supplierId: 'SUP-002', supplierName: 'StopSafe Brakes', targetVolume: 500000, rebatePercentage: 3, currentVolume: 520000, status: 'achieved' }
];

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'CTR-2024-001',
    partyName: 'AutoCorp Global',
    type: 'customer',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    status: 'active',
    value: 2500000,
    currency: 'USD',
    autoRenew: true
  },
  {
    id: 'CTR-2024-045',
    partyName: 'SpeedyParts MX',
    type: 'customer',
    startDate: '2024-03-15',
    endDate: '2025-03-14',
    status: 'pending_renewal',
    value: 850000,
    currency: 'MXN',
    autoRenew: false
  },
  {
    id: 'SUP-2024-012',
    partyName: 'PowerTech Logistics',
    type: 'supplier',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    value: 1200000,
    currency: 'USD',
    autoRenew: true
  },
  {
    id: 'SRV-2024-009',
    partyName: 'CleanFacility Services',
    type: 'service',
    startDate: '2024-06-01',
    endDate: '2025-05-31',
    status: 'active',
    value: 45000,
    currency: 'USD',
    autoRenew: true
  }
];

export const MOCK_CHANNELS: SalesChannel[] = [
  { id: 'c-001', name: 'Direct B2B', type: 'wholesale', status: 'online' },
  { id: 'c-002', name: 'E-commerce Hub', type: 'ecommerce', status: 'online' }
];

export const MOCK_BINS: BinLocation[] = [
  { id: 'bin-001', zone: 'bulk', aisle: '01', rack: '01', level: '1', position: 'A', capacity: 100, currentVolume: 50 },
  { id: 'bin-002', zone: 'bulk', aisle: '01', rack: '01', level: '2', position: 'B', capacity: 100, currentVolume: 0 }
];

export const MOCK_TPL_PROCESSES: TPLProcess[] = MOCK_TPL_PROCESSES_MEXICO;

export const AI_AGENTS = [
  { id: 'control-tower', role: 'Control Tower', icon: 'Terminal', color: 'porteo-blue' },
  { id: 'warehouse-director', role: 'Warehouse Director', icon: 'Warehouse', color: 'porteo-orange' },
  { id: 'supply-chain-director', role: 'Supply Chain Director', icon: 'TrendingUp', color: 'emerald-500' },
  { id: 'coo-assistant', role: 'COO Assistant', icon: 'ShieldAlert', color: 'rose-500' },
  { id: 'assembly-expert', role: 'Assembly Expert', icon: 'Cpu', color: 'indigo-500' },
  { id: 'cfo', role: 'CFO', icon: 'DollarSign', color: 'amber-500' },
  { id: 'sales-director', role: 'Sales & BD Director', icon: 'Briefcase', color: 'cyan-500' },
  { id: 'vp-legal', role: 'VP of Legal', icon: 'Scale', color: 'slate-500' },
  { id: 'sustainability-specialist', role: 'Sustainability Specialist', icon: 'Leaf', color: 'emerald-400' },
  { id: 'automation-engineer', role: 'Automation Engineer', icon: 'Cpu', color: 'purple-500' }
] as const;

export const MOCK_NOTIFICATIONS: WMSNotification[] = [];

export const MOCK_PATIO: PatioSlot[] = [
  { id: 'p1', label: 'P-01', status: 'occupied', truckId: 'TRK-MEX-001', type: 'parking' },
  { id: 'p2', label: 'P-02', status: 'empty', type: 'parking' },
  { id: 'p3', label: 'P-03', status: 'reserved', type: 'parking' },
  { id: 'p4', label: 'P-04', status: 'empty', type: 'parking' },
  { id: 'd1', label: 'D-01', status: 'occupied', truckId: 'TRK-MEX-002', type: 'dock' },
  { id: 'd2', label: 'D-02', status: 'empty', type: 'dock' },
  { id: 'd3', label: 'D-03', status: 'occupied', truckId: 'TRK-USA-001', type: 'dock' },
  { id: 'd4', label: 'D-04', status: 'empty', type: 'dock' },
  { id: 's1', label: 'S-01', status: 'occupied', truckId: 'TRK-MEX-003', type: 'staging' },
  { id: 's2', label: 'S-02', status: 'empty', type: 'staging' },
];

export const PORTEO_COLORS = {
  primary: '#004A99', // Porteo Blue (Estimated)
  secondary: '#F27D26', // Porteo Orange
  accent: '#00AEEF',
  dark: '#1A1A1A',
  light: '#F5F5F5'
};
