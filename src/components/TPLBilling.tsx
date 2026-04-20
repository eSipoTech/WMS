import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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
  Cell
} from 'recharts';
import { 
  Receipt, 
  Calculator, 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Package, 
  Truck,
  Settings,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface BillingRule {
  id: string;
  customer: string;
  type: 'storage' | 'handling' | 'vas' | 'surcharge';
  rate: number;
  unit: 'pallet/day' | 'm2/month' | 'order' | 'item' | 'load';
  description: string;
}

interface Invoice {
  id: string;
  customer: string;
  period: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: { desc: string; qty: number; rate: number; total: number }[];
}

const billingRules: BillingRule[] = [
  { id: 'BR-001', customer: 'Amazon Retail', type: 'storage', rate: 0.85, unit: 'pallet/day', description: 'Standard ambient storage' },
  { id: 'BR-002', customer: 'Amazon Retail', type: 'handling', rate: 4.50, unit: 'pallet/day', description: 'Inbound pallet handling' },
  { id: 'BR-003', customer: 'Best Buy', type: 'vas', rate: 1.20, unit: 'item', description: 'Labeling and kitting' },
  { id: 'BR-004', customer: 'Global Parts', type: 'storage', rate: 12.00, unit: 'm2/month', description: 'Dedicated floor space' },
];

const invoices: Invoice[] = [
  { 
    id: 'INV-2026-001', 
    customer: 'Amazon Retail', 
    period: 'March 2026', 
    amount: 12450.80, 
    status: 'sent',
    items: [
      { desc: 'Storage (12,000 pallet-days)', qty: 12000, rate: 0.85, total: 10200 },
      { desc: 'Inbound Handling', qty: 450, rate: 4.50, total: 2025 },
      { desc: 'Outbound Handling', qty: 50, rate: 4.50, total: 225.80 },
    ]
  },
  { 
    id: 'INV-2026-002', 
    customer: 'Best Buy', 
    period: 'March 2026', 
    amount: 4200.00, 
    status: 'draft',
    items: [
      { desc: 'Storage', qty: 3000, rate: 1.00, total: 3000 },
      { desc: 'VAS - Labeling', qty: 1000, rate: 1.20, total: 1200 },
    ]
  },
  { 
    id: 'INV-2026-003', 
    customer: 'Global Parts', 
    period: 'February 2026', 
    amount: 8900.00, 
    status: 'paid',
    items: [
      { desc: 'Monthly Floor Space', qty: 1, rate: 8900, total: 8900 },
    ]
  },
];

export const TPLBilling = ({ 
  lang, 
  market,
  warehouse, 
  addNotification 
}: { 
  lang: 'en' | 'es',
  market: 'USA' | 'MEXICO',
  warehouse: any,
  addNotification?: (msg: string, type?: 'market' | 'operational' | 'alert' | 'success' | 'info') => void
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'rates' | 'calculator' | 'contracts' | 'disputes'>('invoices');
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(invoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [rulesList, setRulesList] = useState<BillingRule[]>(billingRules);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedRule, setSelectedRule] = useState<BillingRule | null>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [contractsList, setContractsList] = useState<any[]>([
    { 
      customer: 'Amazon Retail', 
      type: 'Strategic Partner', 
      sla: 99.8, 
      status: 'Active', 
      expiry: '2027-12-31',
      paymentTerms: 'Net 30',
      liability: '$5M General / $1M Inventory',
      storageRate: '$0.85/pallet'
    },
    { 
      customer: 'Best Buy', 
      type: 'Standard 3PL', 
      sla: 98.5, 
      status: 'Review Needed', 
      expiry: '2026-06-30',
      paymentTerms: 'Net 15',
      liability: '$2M General / $500k Inventory',
      storageRate: '$1.00/pallet'
    },
  ]);
  const [showCctvModal, setShowCctvModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showReviewContractModal, setShowReviewContractModal] = useState(false);
  const [contractDraft, setContractDraft] = useState<any>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSlaReportModal, setShowSlaReportModal] = useState(false);
  const [showDisputeHistoryModal, setShowDisputeHistoryModal] = useState(false);
  const [showActivityDetailsModal, setShowActivityDetailsModal] = useState(false);
  const [showRevenueBreakdownModal, setShowRevenueBreakdownModal] = useState(false);
  const [showSummaryDetailModal, setShowSummaryDetailModal] = useState(false);
  const [summaryDetail, setSummaryDetail] = useState<{ title: string, description: string, data: any[] } | null>(null);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<number>(0);

  const language = lang;
  const currency = market === 'USA' ? 'USD' : 'MXN';
  const taxLabel = market === 'USA' ? 'Tax' : 'IVA';
  const taxRate = market === 'USA' ? 0.08 : 0.16;

  const filteredInvoices = useMemo(() => {
    return invoiceList.filter(inv => {
      const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.period.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchesCustomer = customerFilter === 'all' || inv.customer === customerFilter;
      const matchesPeriod = periodFilter === 'all' || inv.period === periodFilter;
      const matchesAmount = inv.amount >= minAmount;
      return matchesSearch && matchesStatus && matchesCustomer && matchesPeriod && matchesAmount;
    });
  }, [invoiceList, searchTerm, statusFilter, customerFilter, periodFilter, minAmount]);

  const tabs = [
    { id: 'invoices', label: language === 'en' ? 'Invoices' : 'Facturas', icon: <FileText className="w-4 h-4" /> },
    { id: 'rates', label: language === 'en' ? 'Rate Cards' : 'Tarifarios', icon: <Receipt className="w-4 h-4" /> },
    { id: 'calculator', label: language === 'en' ? 'Billing Engine' : 'Motor de Cobro', icon: <Calculator className="w-4 h-4" /> },
    { id: 'contracts', label: language === 'en' ? 'Contracts & SLAs' : 'Contratos y SLAs', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'disputes', label: language === 'en' ? 'Disputes' : 'Disputas', icon: <AlertCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all ${
              activeTab === tab.id 
                ? 'bg-porteo-orange text-white shadow-lg shadow-porteo-orange/20' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span className="text-sm font-bold">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 glass rounded-[32px] overflow-hidden flex flex-col">
        {activeTab === 'contracts' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Contract Management & SLAs' : 'Gestión de Contratos y SLAs'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Monitor service level agreements and contract compliance' : 'Monitoree los acuerdos de nivel de servicio y el cumplimiento de contratos'}</p>
              </div>
              <button 
                onClick={() => setShowNewContractModal(true)}
                className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {language === 'en' ? 'New Contract' : 'Nuevo Contrato'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contractsList.map((contract, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 hover:border-porteo-orange/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-porteo-blue/20 text-porteo-blue rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{contract.customer}</h4>
                        <p className="text-xs text-white/40">{contract.type}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      contract.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {contract.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <button 
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowSlaReportModal(true);
                      }}
                      className="text-left hover:bg-white/5 p-2 rounded-xl transition-colors active:scale-95"
                    >
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'SLA Compliance' : 'Cumplimiento SLA'}</p>
                      <p className={`text-xl font-bold ${contract.sla >= 99 ? 'text-emerald-500' : 'text-amber-500'}`}>{contract.sla}%</p>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowTermsModal(true);
                      }}
                      className="text-left hover:bg-white/5 p-2 rounded-xl transition-colors active:scale-95"
                    >
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Expiry Date' : 'Fecha de Expiración'}</p>
                      <p className="text-sm font-bold text-white">{contract.expiry}</p>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowTermsModal(true);
                      }}
                      className="flex-1 py-2 bg-white/5 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'View Terms' : 'Ver Términos'}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowSlaReportModal(true);
                      }}
                      className="flex-1 py-2 bg-white/5 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'SLA Report' : 'Reporte SLA'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Billing Dispute Management' : 'Gestión de Disputas de Facturación'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Resolve billing discrepancies and manage credit notes' : 'Resuelva discrepancias de facturación y gestione notas de crédito'}</p>
              </div>
              <button 
                onClick={() => setShowDisputeHistoryModal(true)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
              >
                {language === 'en' ? 'Dispute History' : 'Historial de Disputas'}
              </button>
            </div>

            <div className="space-y-4">
              {[
                { id: 'DIS-001', customer: 'Global Parts', amount: 450.00, reason: 'Incorrect storage volume', status: 'open', date: '2026-03-20' },
                { id: 'DIS-002', customer: 'Amazon Retail', amount: 120.50, reason: 'Duplicate handling fee', status: 'resolved', date: '2026-03-18' },
              ].map((dispute) => (
                <div key={dispute.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group hover:border-red-500/30 transition-all">
                  <div className="flex gap-6 items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      dispute.status === 'open' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">{dispute.customer}</h4>
                        <span className="text-[10px] font-mono text-white/40">{dispute.id}</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">{dispute.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{currency} ${dispute.amount.toFixed(2)}</p>
                      <p className="text-[10px] text-white/40">{dispute.date}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      dispute.status === 'open' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {dispute.status}
                    </div>
                    <button 
                      onClick={() => {
                        setSummaryDetail({
                          title: `${dispute.id} - ${language === 'en' ? 'Dispute Audit' : 'Auditoría de Disputa'}`,
                          description: language === 'en' ? `Full audit trail for dispute filed by ${dispute.customer}.` : `Rastro de auditoría completo para la disputa presentada por ${dispute.customer}.`,
                          data: [
                            { label: language === 'en' ? 'Reason' : 'Motivo', value: dispute.reason, status: 'Claimed' },
                            { label: language === 'en' ? 'Amount' : 'Monto', value: `${currency} $${dispute.amount}`, status: 'Disputed' },
                            { label: language === 'en' ? 'Status' : 'Estado', value: dispute.status.toUpperCase(), status: 'Current' },
                            { label: language === 'en' ? 'Date' : 'Fecha', value: dispute.date, status: 'Filed' },
                          ]
                        });
                        setShowSummaryDetailModal(true);
                      }}
                      className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors active:scale-90"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? '3PL Invoicing' : 'Facturación 3PL'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Manage multi-client billing cycles and payments' : 'Gestione ciclos de facturación y pagos multi-cliente'}</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input 
                    type="text"
                    placeholder={language === 'en' ? 'Search invoices...' : 'Buscar facturas...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-porteo-orange transition-all w-64"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select 
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-porteo-orange transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">{language === 'en' ? 'All Customers' : 'Todos los Clientes'}</option>
                    {Array.from(new Set(invoiceList.map(i => i.customer))).map(customer => (
                      <option key={customer} value={customer}>{customer}</option>
                    ))}
                  </select>
                </div>
                <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
                  {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        statusFilter === status 
                          ? 'bg-porteo-orange text-white' 
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select 
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-porteo-orange transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">{language === 'en' ? 'All Periods' : 'Todos los Periodos'}</option>
                    {Array.from(new Set(invoiceList.map(i => i.period))).map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <span className="text-xs text-white/40 mr-2 font-bold">{language === 'en' ? 'Min Amount:' : 'Monto Mín:'}</span>
                  <input 
                    type="number"
                    value={minAmount || ''}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    placeholder="0"
                    className="bg-transparent text-xs text-white outline-none w-16"
                  />
                </div>
                <button 
                  onClick={() => {
                    const headers = "Invoice ID,Customer,Period,Amount,Status\n";
                    const rows = invoiceList.map(inv => `${inv.id},${inv.customer},${inv.period},${inv.amount},${inv.status}`).join("\n");
                    const blob = new Blob([headers + rows], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.style.display = 'none';
                    a.download = `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }, 100);
                    addNotification?.(language === 'en' ? 'Invoice data exported successfully.' : 'Datos de facturas exportados con éxito.', 'success');
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  {language === 'en' ? 'Export All' : 'Exportar Todo'}
                </button>
                <button 
                  onClick={() => {
                    const newInv: Invoice = {
                      id: `INV-2026-${String(invoiceList.length + 1).padStart(3, '0')}`,
                      customer: 'New Partner',
                      period: 'April 2026',
                      amount: 5000.00,
                      status: 'draft',
                      items: [{ desc: 'Monthly Service Fee', qty: 1, rate: 5000, total: 5000 }]
                    };
                    setInvoiceList([newInv, ...invoiceList]);
                    addNotification?.(language === 'en' ? 'Monthly billing cycle processed. New draft generated.' : 'Ciclo de facturación mensual procesado. Nuevo borrador generado.', 'success');
                  }}
                  className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'en' ? 'Generate Monthly' : 'Generar Mensual'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => {
                  setStatusFilter('all');
                  setPeriodFilter('all');
                  setCustomerFilter('all');
                  setMinAmount(0);
                  setSummaryDetail({
                    title: language === 'en' ? 'Total Receivables Detail' : 'Detalle de Total por Cobrar',
                    description: language === 'en' ? 'Breakdown of all outstanding payments by customer' : 'Desglose de todos los pagos pendientes por cliente',
                    data: [
                      { label: 'Amazon Retail', value: '$28,450.00', status: language === 'en' ? 'Pending' : 'Pendiente' },
                      { label: 'Best Buy', value: '$12,380.50', status: language === 'en' ? 'Partial' : 'Parcial' },
                      { label: 'Global Parts', value: '$4,400.00', status: language === 'en' ? 'Pending' : 'Pendiente' },
                    ]
                  });
                  setShowSummaryDetailModal(true);
                }}
                className={`p-6 bg-white/5 border rounded-3xl overflow-hidden text-left transition-all active:scale-95 ${
                  statusFilter === 'all' && periodFilter === 'all' ? 'border-porteo-orange/50 shadow-lg shadow-porteo-orange/10' : 'border-white/10'
                }`}
              >
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Total Receivables' : 'Total por Cobrar'}</p>
                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-white truncate">{currency} $45,230.50</p>
                <div className="flex items-center gap-2 mt-2 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold">{language === 'en' ? '+12% vs last month' : '+12% vs mes anterior'}</span>
                </div>
              </button>
              <button 
                onClick={() => {
                  setStatusFilter('overdue');
                  setSummaryDetail({
                    title: language === 'en' ? 'Overdue Invoices Detail' : 'Detalle de Facturas Vencidas',
                    description: language === 'en' ? 'List of invoices past their due date' : 'Lista de facturas que han pasado su fecha de vencimiento',
                    data: [
                      { label: 'INV-2026-005', value: '$1,200.00', status: language === 'en' ? '15 Days Overdue' : '15 Días Vencida' },
                      { label: 'INV-2026-008', value: '$1,200.00', status: language === 'en' ? '8 Days Overdue' : '8 Días Vencida' },
                    ]
                  });
                  setShowSummaryDetailModal(true);
                }}
                className={`p-6 bg-white/5 border rounded-3xl text-left transition-all active:scale-95 ${
                  statusFilter === 'overdue' ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-white/10'
                }`}
              >
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Overdue Invoices' : 'Facturas Vencidas'}</p>
                <p className="text-3xl font-bold text-red-500">2</p>
                <p className="text-xs text-white/40 mt-2">{currency} $2,400.00 total</p>
              </button>
              <button 
                onClick={() => {
                  setSummaryDetail({
                    title: language === 'en' ? 'Avg. Payment Days Detail' : 'Detalle de Días Prom. Pago',
                    description: language === 'en' ? 'Historical average of days to receive payment' : 'Promedio histórico de días para recibir el pago',
                    data: [
                      { label: 'Q1 2026', value: '18 Days', status: language === 'en' ? 'Improving' : 'Mejorando' },
                      { label: 'Q4 2025', value: '20 Days', status: language === 'en' ? 'Stable' : 'Estable' },
                      { label: 'Q3 2025', value: '22 Days', status: language === 'en' ? 'Delayed' : 'Retrasado' },
                    ]
                  });
                  setShowSummaryDetailModal(true);
                }}
                className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left hover:border-porteo-blue/30 transition-all active:scale-95"
              >
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Avg. Payment Days' : 'Días Prom. Pago'}</p>
                <p className="text-3xl font-bold text-white">18</p>
                <p className="text-xs text-emerald-500 mt-2">{language === 'en' ? 'Improved by 2 days' : 'Mejorado por 2 días'}</p>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Invoice ID</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer' : 'Cliente'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Period' : 'Periodo'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Amount' : 'Monto'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Status' : 'Estado'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      onClick={() => setSelectedInvoice(inv)}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-4 text-sm font-mono text-white/60">{inv.id}</td>
                      <td className="py-4 px-4 text-sm font-bold text-white">{inv.customer}</td>
                      <td className="py-4 px-4 text-sm text-white/60">{inv.period}</td>
                      <td className="py-4 px-4 text-sm font-bold text-white">{currency} ${inv.amount.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-500' :
                          inv.status === 'sent' ? 'bg-blue-500/20 text-blue-500' :
                          inv.status === 'overdue' ? 'bg-red-500/20 text-red-500' :
                          'bg-white/10 text-white/40'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const headers = "Description,Quantity,Rate,Total\n";
                            const rows = inv.items.map(item => `${item.desc},${item.qty},${item.rate},${item.total}`).join("\n");
                             const blob = new Blob([headers + rows], { type: 'text/csv' });
                             const url = window.URL.createObjectURL(blob);
                             const a = document.createElement('a');
                             a.href = url;
                             a.style.display = 'none';
                             a.download = `${inv.id}_Details.csv`;
                             document.body.appendChild(a);
                             a.click();
                             setTimeout(() => {
                               document.body.removeChild(a);
                               window.URL.revokeObjectURL(url);
                             }, 100);
                             addNotification?.(language === 'en' ? `Downloading ${inv.id}...` : `Descargando ${inv.id}...`, 'info');
                          }}
                          className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-white/20 text-sm">
                        {language === 'en' ? 'No invoices found matching your search.' : 'No se encontraron facturas que coincidan con su búsqueda.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rates' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Customer Rate Cards' : 'Tarifarios de Clientes'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Define specific billing rules for each 3PL partner' : 'Defina reglas de cobro específicas para cada socio 3PL'}</p>
              </div>
              <button 
                onClick={() => setShowAddRuleModal(true)}
                className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {language === 'en' ? 'Add Rule' : 'Agregar Regla'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rulesList.map((rule) => (
                <div key={rule.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:border-porteo-orange/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white">{rule.customer}</h4>
                      <p className="text-xs text-white/40 uppercase tracking-widest font-bold">{rule.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-porteo-orange">{currency} ${rule.rate.toFixed(2)}</p>
                      <p className="text-[10px] text-white/40 uppercase font-bold">per {rule.unit}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/60">{rule.description}</p>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setSelectedRule(rule);
                        setShowEditRuleModal(true);
                      }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'Edit Rule' : 'Editar Regla'}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRule(rule);
                        setShowHistoryModal(true);
                      }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'View History' : 'Ver Historial'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar h-full pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Real-time Billing Engine' : 'Motor de Cobro en Tiempo Real'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Automated activity-based costing and fee calculation' : 'Cálculo automatizado de costos y tarifas basado en la actividad'}</p>
              </div>
              <button 
                disabled={isSyncing}
                onClick={() => {
                  setIsSyncing(true);
                  setSyncProgress(0);
                  const interval = setInterval(() => {
                    setSyncProgress(prev => {
                      if (prev >= 100) {
                        clearInterval(interval);
                        setIsSyncing(false);
                        toast.success(language === 'en' ? 'Billing synchronization complete' : 'Sincronización de cobro completada');
                        return 100;
                      }
                      return prev + 10;
                    });
                  }, 200);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-porteo-orange/10 border border-porteo-orange/20 rounded-xl hover:bg-porteo-orange/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Clock className={`w-4 h-4 text-porteo-orange ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-xs font-bold text-porteo-orange">
                  {isSyncing ? `${syncProgress}%` : (language === 'en' ? 'Sync Now' : 'Sincronizar Ahora')}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-6">
                {isSyncing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-6 bg-porteo-orange/10 border border-porteo-orange/20 rounded-[32px] overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-porteo-orange animate-spin" />
                        <span className="text-sm font-bold text-white">{language === 'en' ? 'Synchronizing with AS/400...' : 'Sincronizando con AS/400...'}</span>
                      </div>
                      <span className="text-sm font-bold text-porteo-orange">{syncProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-porteo-orange"
                        animate={{ width: `${syncProgress}%` }}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-porteo-orange" />
                    {language === 'en' ? 'Live Activity Tracking' : 'Rastreo de Actividad en Vivo'}
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: language === 'en' ? 'Storage (Pallet-Days)' : 'Almacenaje (Pallet-Días)', value: '142,450', icon: <Package className="w-4 h-4" /> },
                      { label: language === 'en' ? 'Inbound Pallets' : 'Pallets Entrantes', value: '1,240', icon: <ArrowRight className="w-4 h-4" /> },
                      { label: language === 'en' ? 'Outbound Orders' : 'Pedidos Salientes', value: '3,890', icon: <Truck className="w-4 h-4" /> },
                      { label: language === 'en' ? 'VAS Operations' : 'Operaciones VAS', value: '12,400', icon: <Settings className="w-4 h-4" /> },
                    ].map((stat, i) => (
                      <button 
                        key={i} 
                        onClick={() => setShowActivityDetailsModal(true)}
                        className="w-full flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-porteo-orange/30 transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-white/40">{stat.icon}</div>
                          <span className="text-sm text-white/60">{stat.label}</span>
                        </div>
                        <span className="text-lg font-bold text-white">{stat.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-porteo-orange/10 border border-porteo-orange/30 rounded-[32px] space-y-6">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-porteo-orange" />
                    {language === 'en' ? 'Accrued Revenue (MTD)' : 'Ingresos Acumulados (MTD)'}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{language === 'en' ? 'Current Month' : 'Mes Actual'}</p>
                        <p className="text-4xl font-bold text-white">{currency} $128,450.00</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-emerald-500 font-bold">+18% vs target</p>
                      </div>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-porteo-orange"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button 
                        onClick={() => {
                          setSummaryDetail({
                            title: language === 'en' ? 'Storage Revenue Detail' : 'Detalle de Ingresos por Almacenaje',
                            description: language === 'en' ? 'Granular view of storage charges by warehouse section' : 'Vista granular de cargos por almacenaje por sección de almacén',
                            data: [
                              { label: 'Ambient Storage', value: '$45,200', status: 'Active' },
                              { label: 'Cold Storage', value: '$28,000', status: 'Active' },
                              { label: 'Hazardous Materials', value: '$11,000', status: 'Active' },
                            ]
                          });
                          setShowSummaryDetailModal(true);
                        }}
                        className="p-4 bg-white/5 rounded-2xl text-left hover:border-porteo-orange/30 border border-transparent transition-all active:scale-95"
                      >
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Storage Rev' : 'Ingresos Almac.'}</p>
                        <p className="text-xl font-bold text-white">{currency} $84,200</p>
                      </button>
                      <button 
                        onClick={() => {
                          setSummaryDetail({
                            title: language === 'en' ? 'Handling Revenue Detail' : 'Detalle de Ingresos por Maniobra',
                            description: language === 'en' ? 'Granular view of inbound and outbound handling fees' : 'Vista granular de tarifas de maniobra de entrada y salida',
                            data: [
                              { label: 'Inbound Pallets', value: '$22,150', status: 'Active' },
                              { label: 'Outbound Orders', value: '$18,100', status: 'Active' },
                              { label: 'Cross-docking', value: '$4,000', status: 'Active' },
                            ]
                          });
                          setShowSummaryDetailModal(true);
                        }}
                        className="p-4 bg-white/5 rounded-2xl text-left hover:border-porteo-orange/30 border border-transparent transition-all active:scale-95"
                      >
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Handling Rev' : 'Ingresos Maniobra'}</p>
                        <p className="text-xl font-bold text-white">{currency} $44,250</p>
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowRevenueBreakdownModal(true)}
                      className="w-full py-3 bg-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      {language === 'en' ? 'View Revenue Breakdown' : 'Ver Desglose de Ingresos'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddRuleModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Add Billing Rule' : 'Agregar Regla de Cobro'}</h4>
                <button onClick={() => setShowAddRuleModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form 
                className="p-8 space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newRule: BillingRule = {
                    id: `BR-${Math.floor(Math.random() * 1000)}`,
                    customer: formData.get('customer') as string,
                    type: formData.get('type') as any,
                    rate: Number(formData.get('rate')),
                    unit: formData.get('unit') as any,
                    description: formData.get('description') as string,
                  };
                  setRulesList([...rulesList, newRule]);
                  setShowAddRuleModal(false);
                  toast.success(language === 'en' ? 'Rule added successfully' : 'Regla agregada con éxito');
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer' : 'Cliente'}</label>
                    <input name="customer" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Type' : 'Tipo'}</label>
                      <select name="type" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange">
                        <option value="storage">Storage</option>
                        <option value="handling">Handling</option>
                        <option value="vas">VAS</option>
                        <option value="surcharge">Surcharge</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Rate' : 'Tarifa'}</label>
                      <input name="rate" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Unit' : 'Unidad'}</label>
                    <select name="unit" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange">
                      <option value="pallet/day">Pallet/Day</option>
                      <option value="m2/month">m2/Month</option>
                      <option value="order">Order</option>
                      <option value="item">Item</option>
                      <option value="load">Load</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Description' : 'Descripción'}</label>
                    <textarea name="description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange resize-none" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20">
                  {language === 'en' ? 'Save Rule' : 'Guardar Regla'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showEditRuleModal && selectedRule && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Edit Billing Rule' : 'Editar Regla de Cobro'}</h4>
                <button onClick={() => setShowEditRuleModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form 
                className="p-8 space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedRule: BillingRule = {
                    ...selectedRule,
                    customer: formData.get('customer') as string,
                    type: formData.get('type') as any,
                    rate: Number(formData.get('rate')),
                    unit: formData.get('unit') as any,
                    description: formData.get('description') as string,
                  };
                  setRulesList(rulesList.map(r => r.id === selectedRule.id ? updatedRule : r));
                  setShowEditRuleModal(false);
                  toast.success(language === 'en' ? 'Rule updated successfully' : 'Regla actualizada con éxito');
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer' : 'Cliente'}</label>
                    <input name="customer" defaultValue={selectedRule.customer} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Type' : 'Tipo'}</label>
                      <select name="type" defaultValue={selectedRule.type} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange">
                        <option value="storage">Storage</option>
                        <option value="handling">Handling</option>
                        <option value="vas">VAS</option>
                        <option value="surcharge">Surcharge</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Rate' : 'Tarifa'}</label>
                      <input name="rate" type="number" step="0.01" defaultValue={selectedRule.rate} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Unit' : 'Unidad'}</label>
                    <select name="unit" defaultValue={selectedRule.unit} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange">
                      <option value="pallet/day">Pallet/Day</option>
                      <option value="m2/month">m2/Month</option>
                      <option value="order">Order</option>
                      <option value="item">Item</option>
                      <option value="load">Load</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Description' : 'Descripción'}</label>
                    <textarea name="description" rows={3} defaultValue={selectedRule.description} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange resize-none" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20">
                  {language === 'en' ? 'Update Rule' : 'Actualizar Regla'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showHistoryModal && selectedRule && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Rule History' : 'Historial de Regla'}</h4>
                <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {[
                  { date: '2026-03-15', action: 'Rate updated', user: 'Admin', details: `Changed from $${(selectedRule.rate * 0.9).toFixed(2)} to $${selectedRule.rate.toFixed(2)}` },
                  { date: '2026-01-10', action: 'Rule created', user: 'System', details: 'Initial setup' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-porteo-orange mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">{item.action}</p>
                      <p className="text-xs text-white/40">{item.date} • {item.user}</p>
                      <p className="text-xs text-white/60 mt-1">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {showNewContractModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'New Contract Wizard' : 'Asistente de Nuevo Contrato'}</h4>
                <button onClick={() => setShowNewContractModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-12 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-porteo-orange/30 transition-all cursor-pointer group relative">
                  <input 
                    type="file" 
                    accept=".pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        toast.loading(language === 'en' ? `AI extracting terms from ${file.name}...` : `IA extrayendo términos de ${file.name}...`);
                        setTimeout(() => {
                          toast.dismiss();
                          setContractDraft({
                            customer: file.name.split('.')[0].replace(/_/g, ' '),
                            type: 'Standard 3PL',
                            sla: 99.0,
                            status: 'Draft',
                            expiry: '2027-12-31'
                          });
                          setShowNewContractModal(false);
                          setShowReviewContractModal(true);
                        }, 2000);
                      }
                    }}
                  />
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-porteo-orange/10 transition-all">
                    <Download className="w-8 h-8 text-white/20 group-hover:text-porteo-orange rotate-180" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{language === 'en' ? 'Upload Contract PDF' : 'Subir PDF del Contrato'}</p>
                    <p className="text-xs text-white/40 mt-1">{language === 'en' ? 'AI will extract terms and SLAs automatically' : 'La IA extraerá términos y SLAs automáticamente'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    toast.success(language === 'en' ? 'Contract draft created' : 'Borrador de contrato creado');
                    setShowNewContractModal(false);
                  }}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all"
                >
                  {language === 'en' ? 'Continue to Manual Entry' : 'Continuar a Entrada Manual'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showReviewContractModal && contractDraft && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Review Extracted Data' : 'Revisar Datos Extraídos'}</h4>
                <button onClick={() => setShowReviewContractModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer Name' : 'Nombre del Cliente'}</label>
                    <input 
                      value={contractDraft.customer}
                      onChange={(e) => setContractDraft({...contractDraft, customer: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'SLA Target (%)' : 'Objetivo SLA (%)'}</label>
                      <input 
                        type="number"
                        value={contractDraft.sla}
                        onChange={(e) => setContractDraft({...contractDraft, sla: Number(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Expiry Date' : 'Fecha de Expiración'}</label>
                      <input 
                        type="date"
                        value={contractDraft.expiry}
                        onChange={(e) => setContractDraft({...contractDraft, expiry: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" 
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newContract = {
                      ...contractDraft,
                      paymentTerms: 'Net 30',
                      liability: '$1M General',
                      storageRate: '$0.90/pallet'
                    };
                    setContractsList([newContract, ...contractsList]);
                    toast.success(language === 'en' ? 'Contract saved successfully' : 'Contrato guardado con éxito');
                    setShowReviewContractModal(false);
                  }}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                >
                  {language === 'en' ? 'Confirm & Save' : 'Confirmar y Guardar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showTermsModal && selectedContract && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Contract Terms' : 'Términos del Contrato'}</h4>
                <button onClick={() => setShowTermsModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-porteo-orange uppercase tracking-widest">1. Service Level Agreements</h5>
                  <p className="text-sm text-white/60 leading-relaxed">
                    The provider guarantees an uptime of {selectedContract.sla}% for all critical warehouse operations. 
                    Failure to meet this standard for three consecutive months triggers a 5% credit on the monthly management fee.
                  </p>
                </div>
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-porteo-orange uppercase tracking-widest">2. Payment Terms</h5>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Invoices are issued on the 1st of each month for the previous month's activity. 
                    {selectedContract.paymentTerms} payment terms apply. Late payments incur a 1.5% monthly interest charge.
                  </p>
                </div>
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-porteo-orange uppercase tracking-widest">3. Liability & Insurance</h5>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Provider maintains a {selectedContract.liability} insurance policy.
                  </p>
                </div>
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-porteo-orange uppercase tracking-widest">4. Commercial Rates</h5>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Standard storage rate is fixed at {selectedContract.storageRate}.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showSlaReportModal && selectedContract && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'SLA Performance Report' : 'Reporte de Desempeño SLA'}</h4>
                <button onClick={() => setShowSlaReportModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Uptime</p>
                    <p className="text-2xl font-bold text-emerald-500">{selectedContract.sla}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Pick Accuracy</p>
                    <p className="text-2xl font-bold text-white">99.9%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">On-Time Ship</p>
                    <p className="text-2xl font-bold text-white">98.2%</p>
                  </div>
                </div>
                <div className="h-48 bg-white/5 rounded-[32px] border border-white/10 flex items-end justify-around p-6">
                  {[65, 80, 95, 85, 90, 99, 95].map((h, i) => (
                    <motion.button 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      onClick={() => {
                        toast.info(language === 'en' ? `Day ${i+1} Compliance: ${h}%` : `Cumplimiento Día ${i+1}: ${h}%`);
                      }}
                      className="w-8 bg-porteo-orange/40 rounded-t-lg hover:bg-porteo-orange transition-all active:scale-95"
                    />
                  ))}
                </div>
                <button 
                  onClick={() => {
                    const headers = "Metric,Value\nUptime,99.8%\nPick Accuracy,99.9%\nOn-Time Ship,98.2%\n";
                    const blob = new Blob([headers], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.style.display = 'none';
                    a.download = `SLA_Report_${selectedContract.customer.replace(/\s+/g, '_')}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }, 100);
                    toast.success(language === 'en' ? 'SLA Report downloaded' : 'Reporte SLA descargado');
                  }}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {language === 'en' ? 'Download Full Report' : 'Descargar Reporte Completo'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDisputeHistoryModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Dispute Resolution History' : 'Historial de Resolución de Disputas'}</h4>
                <button onClick={() => setShowDisputeHistoryModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {[
                  { id: 'DIS-002', customer: 'Amazon Retail', status: 'Resolved', date: '2026-03-18', outcome: 'Credit Note Issued', reason: 'Duplicate handling fee' },
                  { id: 'DIS-003', customer: 'Best Buy', status: 'Rejected', date: '2026-02-10', outcome: 'Valid Charge Confirmed', reason: 'Storage volume matched physical audit' },
                  { id: 'DIS-004', customer: 'Global Parts', status: 'Resolved', date: '2026-01-25', outcome: 'Refund Processed', reason: 'Incorrect storage rate applied' },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setSummaryDetail({
                        title: `${item.id} - ${language === 'en' ? 'Dispute Details' : 'Detalles de Disputa'}`,
                        description: language === 'en' ? `Full resolution details for ${item.customer}.` : `Detalles completos de resolución para ${item.customer}.`,
                        data: [
                          { label: 'Reason', value: item.reason, status: 'Audit' },
                          { label: 'Outcome', value: item.outcome, status: item.status },
                          { label: 'Date', value: item.date, status: 'Final' },
                        ]
                      });
                      setShowSummaryDetailModal(true);
                    }}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:border-porteo-orange/30 transition-all active:scale-95 text-left"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{item.customer}</p>
                      <p className="text-xs text-white/40">{item.id} • {item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${item.status === 'Resolved' ? 'text-emerald-500' : 'text-red-500'}`}>{item.status}</p>
                      <p className="text-[10px] text-white/60">{item.outcome}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {showActivityDetailsModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Detailed Activity Log' : 'Registro de Actividad Detallado'}</h4>
                <button onClick={() => setShowActivityDetailsModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {[
                  { time: '11:45 AM', activity: 'Inbound Pallet Received', customer: 'Amazon Retail', qty: '24 Pallets' },
                  { time: '11:30 AM', activity: 'Order Picked & Packed', customer: 'Best Buy', qty: '142 Items' },
                  { time: '11:15 AM', activity: 'Storage Cycle Count', customer: 'Global Parts', qty: 'Section A-12' },
                  { time: '11:00 AM', activity: 'Labeling VAS', customer: 'Amazon Retail', qty: '500 Units' },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setSelectedActivityDetail({
                        ...item,
                        details: language === 'en' 
                          ? `Full audit trail shows this operation was completed by Operator #${42 + i * 3} using Handheld #${10 + i}. All items verified against packing list.` 
                          : `El rastro de auditoría completo muestra que esta operación fue completada por el Operador #${42 + i * 3} usando el Handheld #${10 + i}. Todos los artículos verificados contra la lista de empaque.`
                      });
                    }}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:border-porteo-orange/30 transition-all active:scale-95 text-left"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-porteo-orange/10 rounded-xl flex items-center justify-center text-porteo-orange text-xs font-bold">
                        {item.time.split(' ')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.activity}</p>
                        <p className="text-xs text-white/40">{item.customer}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-porteo-orange">{item.qty}</p>
                  </button>
                ))}
              </div>
              {selectedActivityDetail && (
                <div className="p-8 border-t border-white/10 bg-porteo-orange/5">
                  <h5 className="text-sm font-bold text-white mb-2">{language === 'en' ? 'Activity Deep Dive' : 'Análisis Profundo de Actividad'}</h5>
                  <p className="text-xs text-white/60 leading-relaxed">{selectedActivityDetail.details}</p>
                  <div className="flex gap-4 mt-4">
                    <button 
                      onClick={() => {
                        setShowCctvModal(true);
                        addNotification?.(language === 'en' ? 'CCTV access logged for security audit.' : 'Acceso a CCTV registrado para auditoría de seguridad.', 'info');
                      }}
                      className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'View CCTV' : 'Ver CCTV'}
                    </button>
                    <button 
                      onClick={() => {
                        const blob = new Blob(['Mock Proof Content'], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.style.display = 'none';
                        a.download = `Proof_${selectedActivityDetail.activity.replace(/\s+/g, '_')}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => {
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                        }, 100);
                        toast.success(language === 'en' ? 'Proof of activity downloaded' : 'Prueba de actividad descargada');
                      }}
                      className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'Download Proof' : 'Descargar Prueba'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {showRevenueBreakdownModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Revenue Breakdown' : 'Desglose de Ingresos'}</h4>
                <button onClick={() => setShowRevenueBreakdownModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-white/40 uppercase tracking-widest">By Customer</h5>
                    <div className="space-y-3">
                      {[
                        { name: 'Amazon Retail', value: 65, color: 'bg-porteo-orange', detail: '$83,492.50' },
                        { name: 'Best Buy', value: 20, color: 'bg-porteo-blue', detail: '$25,690.00' },
                        { name: 'Global Parts', value: 15, color: 'bg-emerald-500', detail: '$19,267.50' },
                      ].map((item, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            setSummaryDetail({
                              title: `${item.name} - ${language === 'en' ? 'Revenue Detail' : 'Detalle de Ingresos'}`,
                              description: language === 'en' ? `Detailed breakdown of revenue generated by ${item.name} this month.` : `Desglose detallado de los ingresos generados por ${item.name} este mes.`,
                              data: [
                                { label: 'Storage Fees', value: '$42,000', status: 'Invoiced' },
                                { label: 'Handling Fees', value: '$35,000', status: 'Invoiced' },
                                { label: 'VAS Services', value: '$6,492.50', status: 'Pending' },
                              ]
                            });
                            setShowSummaryDetailModal(true);
                          }}
                          className="w-full space-y-1 text-left group"
                        >
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                            <span className="text-white font-bold">{item.value}% <span className="text-white/20 font-normal ml-2">{item.detail}</span></span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} group-hover:brightness-125 transition-all`} style={{ width: `${item.value}%` }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-white/40 uppercase tracking-widest">By Service Type</h5>
                    <div className="space-y-3">
                      {[
                        { name: 'Storage', value: 55, color: 'bg-porteo-orange', detail: '$70,647.50' },
                        { name: 'Handling', value: 30, color: 'bg-porteo-blue', detail: '$38,535.00' },
                        { name: 'VAS', value: 15, color: 'bg-emerald-500', detail: '$19,267.50' },
                      ].map((item, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            setSummaryDetail({
                              title: `${item.name} - ${language === 'en' ? 'Service Detail' : 'Detalle de Servicio'}`,
                              description: language === 'en' ? `Granular view of ${item.name} revenue across all customers.` : `Vista granular de los ingresos de ${item.name} en todos los clientes.`,
                              data: [
                                { label: 'Amazon Retail', value: '$45,000', status: 'Active' },
                                { label: 'Best Buy', value: '$15,000', status: 'Active' },
                                { label: 'Global Parts', value: '$10,647.50', status: 'Active' },
                              ]
                            });
                            setShowSummaryDetailModal(true);
                          }}
                          className="w-full space-y-1 text-left group"
                        >
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                            <span className="text-white font-bold">{item.value}% <span className="text-white/20 font-normal ml-2">{item.detail}</span></span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} group-hover:brightness-125 transition-all`} style={{ width: `${item.value}%` }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] min-h-[300px]">
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="text-sm font-bold text-white">Monthly Trend</h5>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-porteo-orange" />
                        <span className="text-[10px] text-white/40 uppercase font-bold">Revenue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-porteo-blue" />
                        <span className="text-[10px] text-white/40 uppercase font-bold">Forecast</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: 'Jan', revenue: 30000, forecast: 28000 },
                        { month: 'Feb', revenue: 45000, forecast: 40000 },
                        { month: 'Mar', revenue: 35000, forecast: 38000 },
                        { month: 'Apr', revenue: 60000, forecast: 55000 },
                        { month: 'May', revenue: 55000, forecast: 58000 },
                        { month: 'Jun', revenue: 80000, forecast: 75000 },
                        { month: 'Jul', revenue: 75000, forecast: 70000 },
                        { month: 'Aug', revenue: 90000, forecast: 85000 },
                        { month: 'Sep', revenue: 85000, forecast: 88000 },
                        { month: 'Oct', revenue: 100000, forecast: 95000 }
                      ]}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        />
                        <YAxis 
                          hide 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#F27D26" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                        <Area type="monotone" dataKey="forecast" stroke="#3b82f6" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showSummaryDetailModal && summaryDetail && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{summaryDetail.title}</h4>
                <button onClick={() => {
                  setShowSummaryDetailModal(false);
                  setSelectedActivityDetail(null);
                }} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                <p className="text-sm text-white/60">{summaryDetail.description}</p>
                <div className="space-y-3">
                  {summaryDetail.data.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <button 
                        onClick={() => {
                          setSelectedActivityDetail({
                            activity: item.label,
                            customer: summaryDetail.title.split(' - ')[0],
                            time: 'N/A',
                            qty: item.value,
                            details: language === 'en' 
                              ? `Detailed audit for ${item.label}. This revenue was calculated based on ${item.value} worth of activity recorded between the 1st and 15th of the month. All calculations verified against contract terms.` 
                              : `Auditoría detallada para ${item.label}. Este ingreso se calculó en base a ${item.value} de actividad registrada entre el 1 y el 15 del mes. Todos los cálculos verificados contra los términos del contrato.`
                          });
                        }}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:border-porteo-orange/30 transition-all active:scale-95 text-left"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{item.label}</p>
                          <p className="text-[10px] text-white/40 uppercase font-bold">{item.status}</p>
                        </div>
                        <p className="text-lg font-bold text-porteo-orange">{item.value}</p>
                      </button>
                    </div>
                  ))}
                </div>
                
                {selectedActivityDetail && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-porteo-orange/5 border border-porteo-orange/20 rounded-2xl space-y-3"
                  >
                    <h5 className="text-xs font-bold text-porteo-orange uppercase tracking-widest">{language === 'en' ? 'Granular Analysis' : 'Análisis Granular'}</h5>
                    <p className="text-xs text-white/70 leading-relaxed">{selectedActivityDetail.details}</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          const headers = "Timestamp,Customer,Operation,Quantity,Status\n";
                          const rows = `${new Date().toLocaleString()},${selectedActivityDetail.customer},${selectedActivityDetail.activity},${selectedActivityDetail.qty},Porteo-Verified\n`;
                          const blob = new Blob([headers + rows], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.style.display = 'none';
                          a.download = `Logs_${selectedActivityDetail.activity.replace(/\s+/g, '_')}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          setTimeout(() => {
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          }, 100);
                          toast.success(language === 'en' ? 'Detailed logs exported' : 'Registros detallados exportados');
                        }}
                        className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-all"
                      >
                        {language === 'en' ? 'Export Logs' : 'Exportar Registros'}
                      </button>
                    </div>
                  </motion.div>
                )}

                <button 
                  onClick={() => {
                    const headers = "Label,Value,Status\n";
                    const rows = summaryDetail.data.map(d => `${d.label},${d.value},${d.status}`).join("\n");
                    const blob = new Blob([headers + rows], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.style.display = 'none';
                    a.download = `${summaryDetail.title.replace(/\s+/g, '_')}_Report.csv`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }, 100);
                    toast.success(language === 'en' ? 'Detailed report downloaded' : 'Reporte detallado descargado');
                    setShowSummaryDetailModal(false);
                    setSelectedActivityDetail(null);
                  }}
                  className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {language === 'en' ? 'Download Detailed Report' : 'Descargar Reporte Detallado'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedInvoice(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedInvoice.customer}</h3>
                    <p className="text-white/40 font-mono text-sm">{selectedInvoice.id} • {selectedInvoice.period}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Plus className="w-6 h-6 text-white rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5">
                          <th className="pb-2">Description</th>
                          <th className="pb-2 text-right">Qty</th>
                          <th className="pb-2 text-right">Rate</th>
                          <th className="pb-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedInvoice.items.map((item, i) => (
                          <tr key={i} className="text-sm">
                            <td className="py-3 text-white/80">{item.desc}</td>
                            <td className="py-3 text-right text-white">{item.qty.toLocaleString()}</td>
                            <td className="py-3 text-right text-white">{currency} ${item.rate.toFixed(2)}</td>
                            <td className="py-3 text-right font-bold text-white">{currency} ${item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-4">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Subtotal</span>
                        <span className="text-white font-bold">{currency} ${selectedInvoice.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">{taxLabel} ({taxRate * 100}%)</span>
                        <span className="text-white font-bold">{currency} ${(selectedInvoice.amount * taxRate).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg pt-2 border-t border-white/10">
                        <span className="text-white font-bold">Total</span>
                        <span className="text-porteo-orange font-bold">{currency} ${(selectedInvoice.amount * (1 + taxRate)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => {
                      setIsSyncing(true);
                      toast.loading(language === 'en' ? 'Generating PDF...' : 'Generando PDF...');
                      setTimeout(() => {
                        setIsSyncing(false);
                        const blob = new Blob(['Mock PDF Content for ' + selectedInvoice.id], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `Invoice_${selectedInvoice.id}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        toast.dismiss();
                        toast.success(language === 'en' ? 'Invoice PDF downloaded successfully.' : 'PDF de factura descargado con éxito.');
                        setSelectedInvoice(null);
                      }, 1500);
                    }}
                    className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                    disabled={isSyncing}
                  >
                    {isSyncing ? (language === 'en' ? 'Processing...' : 'Procesando...') : (language === 'en' ? 'Print PDF' : 'Imprimir PDF')}
                  </button>
                  <button 
                    onClick={() => {
                      setIsSyncing(true);
                      toast.loading(language === 'en' ? 'Connecting to Customer Portal...' : 'Conectando al Portal del Cliente...');
                      setTimeout(() => {
                        toast.loading(language === 'en' ? 'Authenticating Porteo Mailer...' : 'Autenticando Porteo Mailer...');
                        setTimeout(() => {
                          setIsSyncing(false);
                          toast.dismiss();
                          const customerEmail = `billing@${selectedInvoice.customer.toLowerCase().replace(/\s+/g, '')}.com`;
                          addNotification?.(language === 'en' ? `Invoice ${selectedInvoice.id} sent to ${selectedInvoice.customer} (${customerEmail})` : `Factura ${selectedInvoice.id} enviada a ${selectedInvoice.customer} (${customerEmail})`, 'success');
                          toast.success(language === 'en' ? `Sent successfully to ${customerEmail}` : `Enviado con éxito a ${customerEmail}`);
                          setSelectedInvoice(null);
                        }, 2000);
                      }, 1500);
                    }}
                    className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all disabled:opacity-50"
                    disabled={isSyncing}
                  >
                    {isSyncing ? (language === 'en' ? 'Sending...' : 'Enviando...') : (language === 'en' ? 'Send to Customer' : 'Enviar al Cliente')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {showCctvModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Live CCTV Feed - Dock Area' : 'Transmisión CCTV en Vivo - Área de Andenes'}</h4>
                </div>
                <button onClick={() => setShowCctvModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
                </div>
                <div className="text-center space-y-4">
                  <ShieldCheck className="w-16 h-16 text-white/10 mx-auto" />
                  <p className="text-white/40 font-mono text-xs tracking-widest uppercase">
                    {language === 'en' ? 'Encrypted Stream • Channel 04 • Dock 12' : 'Transmisión Encriptada • Canal 04 • Andén 12'}
                  </p>
                </div>
                <div className="absolute bottom-8 left-8 flex gap-4">
                  <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-mono text-white">
                    REC 00:42:15
                  </div>
                  <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-mono text-white">
                    ISO 800
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] flex justify-between items-center">
                <p className="text-xs text-white/40 italic">
                  {language === 'en' ? 'Authorized personnel only. Access is being recorded.' : 'Solo personal autorizado. El acceso está siendo grabado.'}
                </p>
                <button 
                  onClick={() => setShowCctvModal(false)}
                  className="px-6 py-2 bg-white/5 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all"
                >
                  {language === 'en' ? 'Close Feed' : 'Cerrar Transmisión'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
