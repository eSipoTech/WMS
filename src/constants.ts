import { Warehouse, InventoryItem, TPLProcess, Notification } from './types';

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Porteo Laredo',
    location: 'Laredo, TX',
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
  { id: '1', sku: 'SKU-001', name: 'Electronic Components', quantity: 1200, unit: 'units', location: 'Rack 0-0', palletId: 'PAL-990', customer: 'TechCorp' },
  { id: '2', sku: 'SKU-002', name: 'Organic Coffee Beans', quantity: 45, unit: 'pallets', location: 'Rack 1-1', palletId: 'PAL-451', customer: 'GreenFoods', expiryDate: '2026-12-01' },
  { id: '3', sku: 'SKU-003', name: 'Industrial Lubricants', quantity: 300, unit: 'drums', location: 'Rack 2-2', palletId: 'PAL-102', customer: 'AutoParts' },
  { id: '4', sku: 'SKU-004', name: 'Solar Panels', quantity: 150, unit: 'units', location: 'Rack 0-1', palletId: 'PAL-772', customer: 'EcoEnergy' },
  { id: '5', sku: 'SKU-005', name: 'Medical Supplies', quantity: 500, unit: 'boxes', location: 'Rack 3-3', palletId: 'PAL-331', customer: 'HealthPlus' },
];

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
    ]
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
    ]
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
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

export const PORTEO_COLORS = {
  primary: '#004A99', // Porteo Blue (Estimated)
  secondary: '#F27D26', // Porteo Orange
  accent: '#00AEEF',
  dark: '#1A1A1A',
  light: '#F5F5F5'
};
