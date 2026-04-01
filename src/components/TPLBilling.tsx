import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  BarChart3
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

  const language = lang;
  const currency = market === 'USA' ? 'USD' : 'MXN';
  const taxLabel = market === 'USA' ? 'Tax' : 'IVA';
  const taxRate = market === 'USA' ? 0.08 : 0.16;

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
                onClick={() => {
                  alert(language === 'en' ? 'Opening new contract creation wizard...' : 'Abriendo asistente de creación de nuevo contrato...');
                  addNotification?.(language === 'en' ? 'Drafting tool initialized. Please upload the contract PDF.' : 'Herramienta de borrador inicializada. Por favor suba el PDF del contrato.', 'info');
                }}
                className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {language === 'en' ? 'New Contract' : 'Nuevo Contrato'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { customer: 'Amazon Retail', type: 'Strategic Partner', sla: 99.8, status: 'Active', expiry: '2027-12-31' },
                { customer: 'Best Buy', type: 'Standard 3PL', sla: 98.5, status: 'Review Needed', expiry: '2026-06-30' },
              ].map((contract, i) => (
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
                        alert(language === 'en' ? `Viewing SLA compliance details for ${contract.customer}...` : `Viendo detalles de cumplimiento SLA para ${contract.customer}...`);
                        addNotification?.(language === 'en' ? `Current uptime for ${contract.customer}: ${contract.sla}%` : `Tiempo de actividad actual para ${contract.customer}: ${contract.sla}%`, 'info');
                      }}
                      className="text-left hover:bg-white/5 p-2 rounded-xl transition-colors active:scale-95"
                    >
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'SLA Compliance' : 'Cumplimiento SLA'}</p>
                      <p className={`text-xl font-bold ${contract.sla >= 99 ? 'text-emerald-500' : 'text-amber-500'}`}>{contract.sla}%</p>
                    </button>
                    <button 
                      onClick={() => {
                        alert(language === 'en' ? `Checking contract renewal options for ${contract.customer}...` : `Verificando opciones de renovación de contrato para ${contract.customer}...`);
                        addNotification?.(language === 'en' ? `Contract with ${contract.customer} expires in ${contract.expiry}.` : `El contrato con ${contract.customer} expira el ${contract.expiry}.`, 'alert');
                      }}
                      className="text-left hover:bg-white/5 p-2 rounded-xl transition-colors active:scale-95"
                    >
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Expiry Date' : 'Fecha de Expiración'}</p>
                      <p className="text-sm font-bold text-white">{contract.expiry}</p>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert(language === 'en' ? `Viewing terms for ${contract.customer}...` : `Viendo términos para ${contract.customer}...`)}
                      className="flex-1 py-2 bg-white/5 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'View Terms' : 'Ver Términos'}
                    </button>
                    <button 
                      onClick={() => {
                        alert(language === 'en' ? `Generating SLA report for ${contract.customer}...` : `Generando reporte SLA para ${contract.customer}...`);
                        addNotification?.(language === 'en' ? `SLA report for ${contract.customer} has been generated.` : `Se ha generado el reporte SLA para ${contract.customer}.`, 'success');
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
                onClick={() => {
                  alert(language === 'en' ? 'Opening full dispute resolution history...' : 'Abriendo historial completo de resolución de disputas...');
                  addNotification?.(language === 'en' ? 'Loading historical dispute data for all clients.' : 'Cargando datos históricos de disputas para todos los clientes.', 'info');
                }}
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
                        alert(language === 'en' ? `Dispute Details for ${dispute.id}:\n- Customer: ${dispute.customer}\n- Reason: ${dispute.reason}\n- Amount: ${currency} $${dispute.amount}\n- Status: ${dispute.status.toUpperCase()}` : `Detalles de Disputa para ${dispute.id}:\n- Cliente: ${dispute.customer}\n- Motivo: ${dispute.reason}\n- Monto: ${currency} $${dispute.amount}\n- Estado: ${dispute.status.toUpperCase()}`);
                        addNotification?.(language === 'en' ? `Viewing full audit trail for ${dispute.id}.` : `Viendo rastro de auditoría completo para ${dispute.id}.`, 'info');
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
                <button 
                  onClick={() => {
                    alert(language === 'en' ? 'Exporting all invoices to CSV/Excel...' : 'Exportando todas las facturas a CSV/Excel...');
                    addNotification?.(language === 'en' ? 'Your invoice data is being prepared for download.' : 'Sus datos de facturas se están preparando para la descarga.', 'info');
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  {language === 'en' ? 'Export All' : 'Exportar Todo'}
                </button>
                <button 
                  onClick={() => {
                    alert(language === 'en' ? 'Generating monthly invoices for all active customers...' : 'Generando facturas mensuales para todos los clientes activos...');
                    addNotification?.(language === 'en' ? 'Monthly billing cycle processed successfully.' : 'Ciclo de facturación mensual procesado con éxito.', 'success');
                  }}
                  className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'en' ? 'Generate Monthly' : 'Generar Mensual'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Total Receivables' : 'Total por Cobrar'}</p>
                <p className="text-3xl font-bold text-white">{currency} $45,230.50</p>
                <div className="flex items-center gap-2 mt-2 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold">+12% vs last month</span>
                </div>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Overdue Invoices' : 'Facturas Vencidas'}</p>
                <p className="text-3xl font-bold text-red-500">2</p>
                <p className="text-xs text-white/40 mt-2">{currency} $2,400.00 total</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{language === 'en' ? 'Avg. Payment Days' : 'Días Prom. Pago'}</p>
                <p className="text-3xl font-bold text-white">18</p>
                <p className="text-xs text-emerald-500 mt-2">Improved by 2 days</p>
              </div>
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
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
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
                        <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
                onClick={() => {
                  alert(language === 'en' ? 'Opening rate card editor...' : 'Abriendo editor de tarifarios...');
                  addNotification?.(language === 'en' ? 'Please select a customer and define the unit rate.' : 'Por favor seleccione un cliente y defina la tarifa unitaria.', 'info');
                }}
                className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {language === 'en' ? 'Add Rule' : 'Agregar Regla'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {billingRules.map((rule) => (
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
                        alert(language === 'en' ? `Editing rule ${rule.id} for ${rule.customer}...` : `Editando regla ${rule.id} para ${rule.customer}...`);
                        addNotification?.(language === 'en' ? `Modifying ${rule.type} rate for ${rule.customer}.` : `Modificando tarifa de ${rule.type} para ${rule.customer}.`, 'info');
                      }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      {language === 'en' ? 'Edit Rule' : 'Editar Regla'}
                    </button>
                    <button 
                      onClick={() => {
                        alert(language === 'en' ? `Viewing historical changes for rule ${rule.id}...` : `Viendo cambios históricos para la regla ${rule.id}...`);
                        addNotification?.(language === 'en' ? 'Loading audit logs for this billing rule.' : 'Cargando registros de auditoría para esta regla de cobro.', 'info');
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
                onClick={() => {
                  alert(language === 'en' ? 'Triggering manual billing synchronization...' : 'Iniciando sincronización manual de cobro...');
                  addNotification?.(language === 'en' ? 'Fetching latest activity logs from WMS...' : 'Obteniendo últimos registros de actividad del WMS...', 'info');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-porteo-orange/10 border border-porteo-orange/20 rounded-xl hover:bg-porteo-orange/20 transition-all active:scale-95"
              >
                <Clock className="w-4 h-4 text-porteo-orange" />
                <span className="text-xs font-bold text-porteo-orange">Next Sync: 12:00 PM</span>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-6">
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
                        onClick={() => alert(language === 'en' ? `Viewing detailed activity for ${stat.label}...` : `Viendo actividad detallada para ${stat.label}...`)}
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
                      <div className="p-4 bg-white/5 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Storage Rev' : 'Ingresos Almac.'}</p>
                        <p className="text-xl font-bold text-white">{currency} $84,200</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Handling Rev' : 'Ingresos Maniobra'}</p>
                        <p className="text-xl font-bold text-white">{currency} $44,250</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        alert(language === 'en' ? 'Opening detailed revenue breakdown by customer and activity type...' : 'Abriendo desglose detallado de ingresos por cliente y tipo de actividad...');
                        addNotification?.(language === 'en' ? 'Generating multi-dimensional revenue report.' : 'Generando reporte de ingresos multidimensional.', 'info');
                      }}
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
    </div>
  );
};
