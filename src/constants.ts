import { 
  Warehouse, 
  InventoryItem, 
  TPLProcess, 
  WMSNotification, 
  PatioSlot,
  CustomerPricing,
  SupplierRebate,
  SalesChannel,
  BinLocation
} from './types';

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Porteo Laredo',
    location: 'Laredo, TX',
    market: 'USA',
    capacity: 50000,
    currentOccupancy: 42000,
    temperature: 18,
    status: 'optimal',
    layout: {
      racks: { rows: 5, cols: 8 },
      docks: 4,
      zones: [
        { name: 'Zone A', color: '#F27D26', racks: ['0-0', '0-1', '1-0', '1-1'] },
        { name: 'Zone B', color: '#004A99', racks: ['2-0', '2-1', '3-0', '3-1'] }
      ]
    }
  },
  {
    id: 'wh-2',
    name: 'Porteo Monterrey',
    location: 'Monterrey, NL',
    market: 'MEXICO',
    capacity: 75000,
    currentOccupancy: 68000,
    temperature: 22,
    status: 'warning',
    layout: {
      racks: { rows: 4, cols: 10 },
      docks: 6,
      zones: [
        { name: 'Cold Storage', color: '#00AEEF', racks: ['0-0', '0-1', '0-2'] }
      ]
    }
  },
  {
    id: 'wh-3',
    name: 'Porteo Mexico City',
    location: 'CDMX, MX',
    market: 'MEXICO',
    capacity: 100000,
    currentOccupancy: 95000,
    temperature: 20,
    status: 'critical',
    layout: {
      racks: { rows: 6, cols: 12 },
      docks: 8,
      zones: []
    }
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { 
    id: '1', 
    sku: 'SKU-001', 
    name: 'Electronic Components', 
    quantity: 1200, 
    unit: 'units', 
    location: 'Rack 0-0', 
    palletId: 'PAL-990', 
    customer: 'TechCorp' 
  },
  { 
    id: '2', 
    sku: 'SKU-002', 
    name: 'Organic Coffee Beans', 
    quantity: 45, 
    unit: 'pallets', 
    location: 'Rack 1-1', 
    palletId: 'PAL-451', 
    customer: 'GreenFoods', 
    expiryDate: '2026-12-01' 
  },
  { 
    id: '3', 
    sku: 'SKU-003', 
    name: 'Brake Pads - Front', 
    quantity: 300, 
    unit: 'sets', 
    location: 'Rack 2-2', 
    palletId: 'PAL-102', 
    customer: 'AutoParts',
    brand: 'Brembo',
    oemNumber: 'BR-9921-X',
    compatibility: ['Honda Civic 2022', 'Toyota Corolla 2021'],
    category: 'Brakes'
  },
  { 
    id: '4', 
    sku: 'SKU-004', 
    name: 'Alternator Assembly', 
    quantity: 150, 
    unit: 'units', 
    location: 'Rack 0-1', 
    palletId: 'PAL-772', 
    customer: 'EcoEnergy',
    brand: 'Denso',
    oemNumber: 'DN-441-A',
    compatibility: ['Ford F-150 2020'],
    category: 'Electrical',
    isKit: true,
    components: [
      { sku: 'SKU-004-A', quantity: 1 },
      { sku: 'SKU-004-B', quantity: 4 }
    ]
  },
  { 
    id: '5', 
    sku: 'SKU-005', 
    name: 'Medical Supplies', 
    quantity: 500, 
    unit: 'boxes', 
    location: 'Rack 3-3', 
    palletId: 'PAL-331', 
    customer: 'HealthPlus' 
  },
  ...Array.from({ length: 995 }).map((_, i) => ({
    id: `inv-${i + 6}`,
    sku: `SKU-${String(i + 6).padStart(4, '0')}`,
    name: `Industrial Part ${i + 6}`,
    quantity: Math.floor(Math.random() * 5000) + 100,
    unit: i % 3 === 0 ? 'pallets' : 'units',
    location: `Rack ${Math.floor(Math.random() * 5)}-${Math.floor(Math.random() * 8)}`,
    palletId: `PAL-${Math.floor(Math.random() * 9000) + 1000}`,
    customer: ['TechCorp', 'GreenFoods', 'AutoParts', 'EcoEnergy', 'Walmart', 'Amazon'][i % 6]
  }))
];

export const MOCK_PRICING: CustomerPricing[] = [
  { customerId: 'TechCorp', sku: 'SKU-001', basePrice: 15.50, discountedPrice: 12.40, contractId: 'CON-2026-001' },
  { customerId: 'AutoParts', sku: 'SKU-003', basePrice: 85.00, discountedPrice: 72.25, contractId: 'CON-2026-002' }
];

export const MOCK_REBATES: SupplierRebate[] = [
  { supplierId: 'GlobalParts', threshold: 100000, rebatePercentage: 5, currentVolume: 85000, status: 'active' },
  { supplierId: 'EcoSource', threshold: 50000, rebatePercentage: 3, currentVolume: 52000, status: 'achieved' }
];

export const MOCK_CHANNELS: SalesChannel[] = [
  { id: 'ch-1', name: 'Amazon Storefront', type: 'ecommerce', status: 'online' },
  { id: 'ch-2', name: 'Retail Network - MX', type: 'retail', status: 'online' },
  { id: 'ch-3', name: 'Wholesale B2B', type: 'wholesale', status: 'online' }
];

export const MOCK_BINS: BinLocation[] = Array.from({ length: 200 }).map((_, i) => ({
  id: `BIN-${String(i + 1).padStart(4, '0')}`,
  zone: (['picking', 'bulk', 'staging', 'returns'][i % 4]) as any,
  aisle: String(Math.floor(i / 40) + 1).padStart(2, '0'),
  rack: String(Math.floor((i % 40) / 8) + 1).padStart(2, '0'),
  level: String((i % 8) + 1),
  position: String((i % 4) + 1),
  capacity: 100,
  currentVolume: Math.floor(Math.random() * 100),
  sku: i % 5 === 0 ? `SKU-00${(i % 5) + 1}` : undefined
}));

export const MOCK_TPL_PROCESSES: TPLProcess[] = [
  {
    id: 'tpl-1',
    truckId: 'TRK-2026-A',
    truckType: 'Full Truck',
    customer: 'TechCorp',
    origin: 'Factory Austin, TX',
    destination: 'Porteo Laredo',
    appointmentTime: '2026-03-01 10:00',
    status: 'unloading',
    steps: [
      { id: 's1', label: { en: 'Collection', es: 'Recolección' }, status: 'completed', timestamp: '2026-03-01 06:00' },
      { id: 's2', label: { en: 'In Transit to WH', es: 'En Tránsito a Almacén' }, status: 'completed', timestamp: '2026-03-01 08:30' },
      { id: 's3', label: { en: 'Unloading', es: 'Descarga' }, status: 'in-progress', timestamp: '2026-03-01 09:45' },
      { id: 's4', label: { en: 'Classification', es: 'Clasificación' }, status: 'pending' },
    ],
    documents: ['Packing List.pdf', 'Bill of Lading.pdf']
  },
  {
    id: 'tpl-2',
    truckId: 'TRK-2026-B',
    truckType: 'Thorton',
    customer: 'AutoParts',
    origin: 'Porteo Monterrey',
    destination: 'Customer Facility - Queretaro',
    appointmentTime: '2026-03-01 14:00',
    status: 'delivery',
    steps: [
      { id: 's1', label: { en: 'Picking', es: 'Surtido' }, status: 'completed' },
      { id: 's2', label: { en: 'Loading', es: 'Carga' }, status: 'completed' },
      { id: 's3', label: { en: 'Delivery', es: 'Entrega' }, status: 'in-progress' },
      { id: 's4', label: { en: 'Customer Status', es: 'Estatus Cliente' }, status: 'pending' },
    ],
    documents: ['Customs Invoice.pdf', 'Proof of Delivery.jpg']
  },
  // Generate 48 more shipments for testing scalability
  ...Array.from({ length: 48 }).map((_, i) => ({
    id: `tpl-${i + 3}`,
    truckId: `TRK-2026-${String.fromCharCode(67 + (i % 24))}${i}`,
    truckType: (i % 2 === 0 ? 'Full Truck' : 'Thorton') as 'Full Truck' | 'Thorton' | '3.5 Van',
    customer: ['Walmart', 'Amazon', 'Tesla', 'Ford', 'Samsung'][i % 5],
    origin: 'Laredo, TX',
    destination: 'Monterrey, NL',
    appointmentTime: `2026-03-${String(Math.floor(i / 5) + 2).padStart(2, '0')} 10:00`,
    status: (['collection', 'in-transit-to-wh', 'unloading', 'storage', 'picking', 'loading', 'delivery'][i % 7]) as any,
    steps: [
      { id: 's1', label: { en: 'Collection', es: 'Recolección' }, status: 'completed' as const, timestamp: '2026-03-01 08:00' }
    ],
    documents: []
  }))
];

export const AI_AGENTS = [
  { id: 'control-tower', role: 'Control Tower', icon: 'Terminal', color: 'porteo-blue' },
  { id: 'warehouse-director', role: 'Warehouse Director', icon: 'Warehouse', color: 'porteo-orange' },
  { id: 'supply-chain-director', role: 'Supply Chain Director', icon: 'TrendingUp', color: 'emerald-500' },
  { id: 'coo-assistant', role: 'COO Assistant', icon: 'ShieldAlert', color: 'rose-500' },
  { id: 'assembly-expert', role: 'Assembly Expert', icon: 'Cpu', color: 'indigo-500' },
  { id: 'cfo', role: 'CFO', icon: 'DollarSign', color: 'amber-500' }
] as const;

export const MOCK_NOTIFICATIONS: WMSNotification[] = [
  {
    id: 'n1',
    type: 'market',
    title: { en: 'New WMS Trend: Autonomous Drones', es: 'Nueva Tendencia WMS: Drones Autónomos' },
    description: { en: 'Research shows 30% efficiency gain in inventory counting using drones.', es: 'Investigaciones muestran un 30% de ganancia en eficiencia en conteo de inventario usando drones.' },
    actionLabel: { en: 'Apply Strategy', es: 'Aplicar Estrategia' },
    timestamp: '2026-03-01 08:00',
    read: false
  },
  {
    id: 'n2',
    type: 'operational',
    title: { en: 'Dock 4 Congestion', es: 'Congestión en Muelle 4' },
    description: { en: 'High volume of arrivals expected in 2 hours.', es: 'Se espera un alto volumen de llegadas en 2 horas.' },
    actionLabel: { en: 'Optimize Docks', es: 'Optimizar Muelles' },
    timestamp: '2026-03-01 09:15',
    read: false
  }
];

export const MOCK_PATIO: PatioSlot[] = [
  { id: 'p1', label: 'P-01', status: 'occupied', truckId: 'TRK-2026-A', type: 'parking' },
  { id: 'p2', label: 'P-02', status: 'empty', type: 'parking' },
  { id: 'p3', label: 'P-03', status: 'reserved', truckId: 'TRK-2026-C', type: 'parking' },
  { id: 'p4', label: 'D-01', status: 'occupied', truckId: 'TRK-2026-B', type: 'dock' },
  { id: 'p5', label: 'D-02', status: 'empty', type: 'dock' },
  { id: 'p6', label: 'S-01', status: 'occupied', type: 'staging' },
  { id: 'p7', label: 'S-02', status: 'empty', type: 'staging' },
];

export const PORTEO_COLORS = {
  primary: '#004A99', // Porteo Blue (Estimated)
  secondary: '#F27D26', // Porteo Orange
  accent: '#00AEEF',
  dark: '#1A1A1A',
  light: '#F5F5F5'
};
