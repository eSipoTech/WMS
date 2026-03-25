export interface Warehouse {
  id: string;
  name: string;
  location: string;
  market: Market;
  capacity: number;
  currentOccupancy: number;
  temperature: number;
  status: 'optimal' | 'warning' | 'critical';
  layout?: {
    racks: { rows: number; cols: number };
    docks: number;
    zones: { name: string; color: string; racks: string[] }[];
  };
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  location: string;
  palletId: string;
  customer: string;
  expiryDate?: string;
  // Automotive specific
  brand?: string;
  oemNumber?: string;
  compatibility?: string[]; // Vehicle models
  category?: 'Engine' | 'Brakes' | 'Suspension' | 'Electrical' | 'Body' | 'Other';
  velocity?: 'High' | 'Medium' | 'Low';
  isKit?: boolean;
  components?: { sku: string; quantity: number }[];
}

export interface FinancialMetric {
  label: string;
  value: number;
  unit: string;
  trend: number;
}

export type Market = 'USA' | 'MEXICO';
export type Language = 'en' | 'es';

export interface TPLStep {
  id: string;
  label: { en: string; es: string };
  status: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'partially-rejected';
  timestamp?: string;
  details?: string;
}

export interface TPLProcess {
  id: string;
  truckId: string;
  truckType: 'Full Truck' | 'Thorton' | '3.5 Van';
  customer: string;
  origin: string;
  destination: string;
  appointmentTime?: string;
  date?: string;
  customerRef?: string;
  status: 'collection' | 'in-transit-to-wh' | 'unloading' | 'classifying' | 'storage' | 'picking' | 'cross-dock' | 'loading' | 'delivery' | 'customer-facility' | 'returning' | 'documentation';
  steps: TPLStep[];
  documents?: string[];
}

export interface WMSNotification {
  id: string;
  type: 'market' | 'operational' | 'alert' | 'success' | 'info';
  title: { en: string; es: string };
  description: { en: string; es: string };
  actionLabel?: { en: string; es: string };
  timestamp: string;
  read: boolean;
}

export interface BinLocation {
  id: string;
  zone: 'picking' | 'bulk' | 'staging' | 'returns';
  aisle: string;
  rack: string;
  level: string;
  position: string;
  capacity: number;
  currentVolume: number;
  sku?: string;
}

export interface CustomerPricing {
  id: string;
  customerId: string;
  sku: string;
  basePrice: number;
  discountedPrice: number;
  contractId: string;
  currency: string;
}

export interface SupplierRebate {
  id: string;
  supplierId: string;
  supplierName: string;
  targetVolume: number;
  rebatePercentage: number;
  currentVolume: number;
  status: 'active' | 'achieved' | 'pending';
}

export interface Contract {
  id: string;
  partyName: string;
  type: 'customer' | 'supplier' | 'service';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'draft';
  value?: number;
  currency: string;
  autoRenew: boolean;
  documentUrl?: string;
}

export interface SalesChannel {
  id: string;
  name: string;
  type: 'ecommerce' | 'retail' | 'wholesale';
  status: 'online' | 'offline';
}

export interface CartaPorte {
  id: string;
  folio: string;
  rfcEmisor: string;
  rfcReceptor: string;
  totalDistancia: number;
  vehiculo: {
    placa: string;
    modelo: string;
    permisoSCT: string;
  };
  mercancias: {
    claveProdServ: string;
    descripcion: string;
    cantidad: number;
    pesoKg: number;
  }[];
  status: 'draft' | 'stamped' | 'cancelled';
}

export interface PatioSlot {
  id: string;
  label: string;
  status: 'empty' | 'occupied' | 'reserved';
  truckId?: string;
  type: 'parking' | 'dock' | 'staging';
}

export interface Translation {
  dashboard: string;
  controlTower: string;
  analytics: string;
  inventory: string;
  map3d: string;
  financials: string;
  personnel: string;
  patio: string;
  truckManagement: string;
  lastMile: string;
  tpl: string;
  intelligenceAgents: string;
  aiAssistants: string;
  marketToggle: string;
  commercial: string;
  operations: string;
  storage: string;
  crossDock: string;
  picking: string;
  packing: string;
  loading: string;
  unloading: string;
  maquila: string;
  tempControl: string;
  notifications: string;
  applyStrategy: string;
  optimizeDock: string;
  auditRack: string;
  relocateItems: string;
  recommendation: string;
  hrAssistant: string;
  cfoAssistant: string;
  costSavings: string;
  sqm2: string;
  customer: string;
  warehouse: string;
  filterBy: string;
  allWarehouses: string;
  allCustomers: string;
  // Market specific
  customsCompliance: string;
  securityProtocol: string;
  laborOptimization: string;
  ecommerceIntegration: string;
  cartaPorte: string;
  immex: string;
  interoperabilityHub: string;
  predictiveAnalytics: string;
  riskAssessment: string;
  portCitySync: string;
  secureDocs: string;
  cargoVisibility: string;
  strategicResearch: string;
  assemblyLine: string;
  inspectionPacking: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    dashboard: "Dashboard",
    controlTower: "Control Tower",
    analytics: "Analytics",
    inventory: "Inventory",
    map3d: "3D Layout",
    financials: "Financials",
    personnel: "Personnel",
    patio: "Patio Management",
    truckManagement: "Truck & Patio",
    lastMile: "Last Mile",
    tpl: "3PL Workflow",
    intelligenceAgents: "Intelligence Agents",
    aiAssistants: "AI Assistants",
    marketToggle: "Switch to Mexico (ES)",
    commercial: "Commercial",
    operations: "Warehouse Ops",
    storage: "Storage",
    crossDock: "Cross-Dock",
    picking: "Picking",
    packing: "Packing",
    loading: "Loading",
    unloading: "Unloading",
    maquila: "Maquila / VAS",
    tempControl: "Temp Control",
    notifications: "Notification Center",
    applyStrategy: "Apply Strategy",
    optimizeDock: "Optimize Dock",
    auditRack: "Audit Rack",
    relocateItems: "Relocate Items",
    recommendation: "AI Recommendation",
    hrAssistant: "HR/Operations AI",
    cfoAssistant: "CFO AI Assistant",
    costSavings: "Cost Savings Tracking",
    sqm2: "SQM2",
    customer: "Customer",
    warehouse: "Warehouse",
    filterBy: "Filter By",
    allWarehouses: "All Warehouses",
    allCustomers: "All Customers",
    customsCompliance: "Customs Compliance",
    securityProtocol: "Security Protocols",
    laborOptimization: "Labor Optimization",
    ecommerceIntegration: "E-commerce Integration",
    cartaPorte: "Bill of Lading",
    immex: "IMMEX Control",
    interoperabilityHub: "Interoperability Hub",
    predictiveAnalytics: "Predictive Analytics",
    riskAssessment: "Risk Assessment",
    portCitySync: "Port-City Sync",
    secureDocs: "Secure Documents",
    cargoVisibility: "Cargo Visibility",
    strategicResearch: "Strategic Research",
    assemblyLine: "Assembly & Kitting",
    inspectionPacking: "Inspection & Packing"
  },
  es: {
    dashboard: "Tablero",
    controlTower: "Torre de Control",
    analytics: "Analítica",
    inventory: "Inventario",
    map3d: "Plano 3D",
    financials: "Finanzas",
    personnel: "Personal",
    patio: "Gestión de Patio",
    truckManagement: "Camiones y Patio",
    lastMile: "Última Milla",
    tpl: "Flujo 3PL",
    intelligenceAgents: "Agentes de Inteligencia",
    aiAssistants: "Asistentes IA",
    marketToggle: "Cambiar a USA (EN)",
    commercial: "Comercial",
    operations: "Ops de Almacén",
    storage: "Almacenamiento",
    crossDock: "Cruce de Andén",
    picking: "Surtido",
    packing: "Empaque",
    loading: "Carga",
    unloading: "Descarga",
    maquila: "Maquila / VAS",
    tempControl: "Control Temp",
    notifications: "Centro de Notificaciones",
    applyStrategy: "Aplicar Estrategia",
    optimizeDock: "Optimizar Muelle",
    auditRack: "Auditar Rack",
    relocateItems: "Reubicar Items",
    recommendation: "Recomendación IA",
    hrAssistant: "IA de RRHH/Operaciones",
    cfoAssistant: "Asistente IA de CFO",
    costSavings: "Seguimiento de Ahorros",
    sqm2: "M2",
    customer: "Cliente",
    warehouse: "Almacén",
    filterBy: "Filtrar Por",
    allWarehouses: "Todos los Almacenes",
    allCustomers: "Todos los Clientes",
    customsCompliance: "Cumplimiento Aduanero",
    securityProtocol: "Protocolos de Seguridad",
    laborOptimization: "Optimización Laboral",
    ecommerceIntegration: "Integración E-commerce",
    cartaPorte: "Carta Porte",
    immex: "Control IMMEX",
    interoperabilityHub: "Hub Interoperabilidad",
    predictiveAnalytics: "Analítica Predictiva",
    riskAssessment: "Evaluación de Riesgos",
    portCitySync: "Sincronización Puerto-Ciudad",
    secureDocs: "Documentos Seguros",
    cargoVisibility: "Visibilidad de Carga",
    strategicResearch: "Investigación Estratégica",
    assemblyLine: "Ensamble y Kitting",
    inspectionPacking: "Inspección y Empaque"
  }
};
