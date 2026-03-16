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

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    sku: 'ENG-V8-500',
    name: 'V8 Engine Block',
    quantity: 45,
    unit: 'units',
    location: 'A-01-01',
    palletId: 'PAL-1001',
    customer: 'AutoCorp Global',
    brand: 'PowerTech',
    category: 'Engine',
    compatibility: ['Ford F-150', 'Chevy Silverado']
  },
  {
    id: 'inv-002',
    sku: 'BRK-CER-02',
    name: 'Ceramic Brake Pads',
    quantity: 1200,
    unit: 'sets',
    location: 'B-04-12',
    palletId: 'PAL-2045',
    customer: 'SpeedyParts MX',
    brand: 'StopSafe',
    category: 'Brakes',
    compatibility: ['Toyota Camry', 'Honda Accord']
  },
  {
    id: 'inv-003',
    sku: 'KIT-SRV-01',
    name: 'Full Service Kit',
    quantity: 50,
    unit: 'Kits',
    location: 'K-01-01',
    palletId: 'PAL-5001',
    customer: 'AutoCorp Global',
    brand: 'Porteo',
    category: 'Other',
    isKit: true,
    components: [
      { sku: 'ENG-V8-500', quantity: 1 },
      { sku: 'BRK-CER-02', quantity: 4 }
    ]
  }
];

export const MOCK_PRICING: CustomerPricing[] = [
  { id: 'p-001', customerId: 'AutoCorp Global', sku: 'ENG-V8-500', basePrice: 15000, discountedPrice: 13500, contractId: 'CTR-2024-001', currency: 'USD' },
  { id: 'p-002', customerId: 'SpeedyParts MX', sku: 'BRK-CER-02', basePrice: 450, discountedPrice: 380, contractId: 'CTR-2024-045', currency: 'MXN' }
];

export const MOCK_REBATES: SupplierRebate[] = [
  { id: 'r-001', supplierId: 'PowerTech', threshold: 1000000, rebatePercentage: 5, currentVolume: 850000, status: 'active' },
  { id: 'r-002', supplierId: 'StopSafe', threshold: 500000, rebatePercentage: 3, currentVolume: 520000, status: 'achieved' }
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

export const MOCK_TPL_PROCESSES: TPLProcess[] = [
  {
    id: 'TPL-9001',
    customer: 'AutoCorp Global',
    truckId: 'TRK-552',
    truckType: 'Full Truck',
    origin: 'Detroit, MI',
    destination: 'Monterrey, NL',
    status: 'in-transit-to-wh',
    appointmentTime: '14:30',
    steps: [
      { id: 's1', label: { en: 'Collection', es: 'Recolección' }, status: 'completed', timestamp: '08:00 AM' },
      { id: 's2', label: { en: 'In Transit', es: 'En Tránsito' }, status: 'in-progress', timestamp: '10:30 AM' }
    ]
  },
  {
    id: 'TPL-9002',
    customer: 'SpeedyParts MX',
    truckId: 'TRK-221',
    truckType: 'Thorton',
    origin: 'Mexico City, MX',
    destination: 'Laredo, TX',
    status: 'unloading',
    appointmentTime: '11:00',
    steps: [
      { id: 's1', label: { en: 'Collection', es: 'Recolección' }, status: 'completed', timestamp: 'Yesterday' },
      { id: 's2', label: { en: 'Arrival', es: 'Llegada' }, status: 'completed', timestamp: '09:00 AM' },
      { id: 's3', label: { en: 'Unloading', es: 'Descarga' }, status: 'in-progress', timestamp: '10:45 AM' }
    ]
  }
];

export const AI_AGENTS = [
  { id: 'control-tower', role: 'Control Tower', icon: 'Terminal', color: 'porteo-blue' },
  { id: 'warehouse-director', role: 'Warehouse Director', icon: 'Warehouse', color: 'porteo-orange' },
  { id: 'supply-chain-director', role: 'Supply Chain Director', icon: 'TrendingUp', color: 'emerald-500' },
  { id: 'coo-assistant', role: 'COO Assistant', icon: 'ShieldAlert', color: 'rose-500' },
  { id: 'assembly-expert', role: 'Assembly Expert', icon: 'Cpu', color: 'indigo-500' },
  { id: 'cfo', role: 'CFO', icon: 'DollarSign', color: 'amber-500' }
] as const;

export const MOCK_NOTIFICATIONS: WMSNotification[] = [];

export const MOCK_PATIO: PatioSlot[] = [];

export const PORTEO_COLORS = {
  primary: '#004A99', // Porteo Blue (Estimated)
  secondary: '#F27D26', // Porteo Orange
  accent: '#00AEEF',
  dark: '#1A1A1A',
  light: '#F5F5F5'
};
