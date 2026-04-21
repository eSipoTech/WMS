import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, FileText, TrendingUp, Users, Search, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck, Calendar, AlertCircle, ExternalLink, Plus, Upload, X, RefreshCw, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_PRICING, MOCK_REBATES, MOCK_CONTRACTS } from '../constants';
import { Contract } from '../types';

interface CommercialManagementProps {
  lang: 'en' | 'es';
  market: 'USA' | 'MEXICO';
  onViewContract?: (contract: Contract) => void;
  onNewContract?: () => void;
  onViewPricing?: (pricing: any) => void;
  onViewRebate?: (rebate: any) => void;
  defaultSubTab?: 'pricing' | 'rebates' | 'contracts';
}

export const CommercialManagement = ({ 
  lang, 
  market,
  onViewContract, 
  onNewContract, 
  onViewPricing, 
  onViewRebate,
  defaultSubTab = 'pricing'
}: CommercialManagementProps) => {
  const language = lang;
  const currency = market === 'USA' ? 'USD' : 'MXN';
  const [activeSubTab, setActiveSubTab] = useState<'pricing' | 'rebates' | 'contracts'>(defaultSubTab);
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [pricing, setPricing] = useState<any[]>(MOCK_PRICING);
  const [contractSearch, setContractSearch] = useState('');
  const [pricingSearch, setPricingSearch] = useState('');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'high-savings' | 'low-savings'>('all');
  const [selectedPricing, setSelectedPricing] = useState<any>(null);
  const [selectedRebate, setSelectedRebate] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showRebateModal, setShowRebateModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showEditContractModal, setShowEditContractModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  React.useEffect(() => {
    setActiveSubTab(defaultSubTab);
  }, [defaultSubTab]);

  const filteredContracts = contracts.filter(c => 
    c.partyName.toLowerCase().includes(contractSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(contractSearch.toLowerCase())
  );

  const filteredPricing = pricing.filter(p => {
    const matchesSearch = p.customerId.toLowerCase().includes(pricingSearch.toLowerCase()) ||
                         p.sku.toLowerCase().includes(pricingSearch.toLowerCase());
    const savings = (1 - p.discountedPrice/p.basePrice) * 100;
    if (pricingFilter === 'high-savings') return matchesSearch && savings >= 15;
    if (pricingFilter === 'low-savings') return matchesSearch && savings < 15;
    return matchesSearch;
  });

  const handleViewPricing = (pricing: any) => {
    setSelectedPricing(pricing);
    setIsEditingPricing(false);
    setShowPricingModal(true);
    onViewPricing?.(pricing);
  };

  const handleDownloadContract = (id: string) => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          const content = `%PDF-1.4\n%Contract ${id}\n1 0 obj\n<< /Title (Contract ${id}) /Author (Porteo) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
          const blob = new Blob([content], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `contract_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          resolve(true);
        }, 1500);
      }),
      {
        loading: language === 'en' ? 'Preparing contract PDF...' : 'Preparando PDF del contrato...',
        success: language === 'en' ? `Contract ${id} downloaded successfully` : `Contrato ${id} descargado con éxito`,
        error: 'Error downloading contract',
      }
    );
  };

  const handleExportRebates = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          // Simulate real download
          const content = "Supplier,ID,Volume,Target,Percentage,Credit\n" + 
            MOCK_REBATES.map(r => `${r.supplierName},${r.supplierId},${r.currentVolume},${r.targetVolume},${r.rebatePercentage},${r.currentVolume * (r.rebatePercentage/100)}`).join("\n");
          const blob = new Blob([content], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `rebate_report_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          resolve(true);
        }, 2000);
      }),
      {
        loading: language === 'en' ? 'Generating rebate report...' : 'Generando reporte de rebates...',
        success: language === 'en' ? 'Rebate report downloaded successfully' : 'Reporte de rebates descargado con éxito',
        error: 'Error exporting report',
      }
    );
  };

  const handleViewRebate = (rebate: any) => {
    setSelectedRebate(rebate);
    setShowRebateModal(true);
    onViewRebate?.(rebate);
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractModal(true);
    onViewContract?.(contract);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'pricing', label: language === 'en' ? 'Customer Pricing' : 'Precios por Cliente', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'rebates', label: language === 'en' ? 'Supplier Rebates' : 'Rebates de Proveedores', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'contracts', label: language === 'en' ? 'Contract Management' : 'Gestión de Contratos', icon: <FileText className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all whitespace-nowrap ${
              activeSubTab === tab.id 
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
        <AnimatePresence mode="wait">
          {activeSubTab === 'pricing' && (
            <motion.div 
              key="pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Customer Specific Pricing' : 'Precios Específicos por Cliente'}</h3>
                <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="text"
                      value={pricingSearch}
                      onChange={(e) => setPricingSearch(e.target.value)}
                      placeholder={language === 'en' ? 'Search customer or SKU...' : 'Buscar cliente o SKU...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-porteo-orange/50 transition-all focus:ring-1 focus:ring-porteo-orange/20"
                    />
                  </div>
                  <select 
                    value={pricingFilter}
                    onChange={(e) => setPricingFilter(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-porteo-orange/50 transition-all cursor-pointer hover:bg-white/10"
                  >
                    <option value="all">{language === 'en' ? 'All Savings' : 'Todos los Ahorros'}</option>
                    <option value="high-savings">{language === 'en' ? 'High Savings (>15%)' : 'Ahorro Alto (>15%)'}</option>
                    <option value="low-savings">{language === 'en' ? 'Low Savings (<15%)' : 'Ahorro Bajo (<15%)'}</option>
                  </select>
                  <button 
                    onClick={() => {
                      toast.info(language === 'en' ? 'Opening Pricing Configuration Wizard...' : 'Abriendo asistente de configuración de precios...');
                    }}
                    className="px-4 py-2.5 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'en' ? 'New Pricing Rule' : 'Nueva Regla de Precios'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer' : 'Cliente'}</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">SKU</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Base Price' : 'Precio Base'}</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Contract Price' : 'Precio Contrato'}</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Savings' : 'Ahorro'}</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">{language === 'en' ? 'Actions' : 'Acciones'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPricing.map((p, i) => (
                      <tr 
                        key={i} 
                        onClick={() => handleViewPricing(p)}
                        className="hover:bg-white/5 transition-all group cursor-pointer border-l-2 border-transparent hover:border-porteo-orange"
                      >
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-porteo-orange transition-colors">{p.customerId}</span>
                            <span className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">Identity Verified</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-white/60 font-mono">{p.sku}</td>
                        <td className="py-4 px-6 text-sm text-white/40 line-through">{currency} ${p.basePrice.toLocaleString()}</td>
                        <td className="py-4 px-6 text-sm font-bold text-porteo-orange">{currency} ${p.discountedPrice.toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold">
                              -{((1 - p.discountedPrice/p.basePrice) * 100).toFixed(0)}%
                            </span>
                            {((1 - p.discountedPrice/p.basePrice) * 100) > 15 && (
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPricing(p);
                              }}
                              className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-white group-hover:bg-porteo-orange/20 transition-all border border-white/5"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingPricing(true);
                                setSelectedPricing(p);
                                setShowPricingModal(true);
                              }}
                              className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-porteo-blue group-hover:bg-porteo-blue/20 transition-all border border-white/5"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'rebates' && (
            <motion.div 
              key="rebates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full"
            >
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Supplier Rebate Tracking' : 'Seguimiento de Rebates de Proveedores'}</h3>
                <button 
                  onClick={handleExportRebates}
                  className="px-4 py-2.5 bg-porteo-blue/10 border border-porteo-blue/20 rounded-xl text-xs font-bold text-porteo-blue hover:bg-porteo-blue/20 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 rotate-180" />
                  {language === 'en' ? 'Export Report' : 'Exportar Reporte'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_REBATES.map((r, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6 hover:border-white/20 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 className="text-lg font-bold text-white truncate">{r.supplierName}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{r.supplierId}</p>
                      </div>
                      <div className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        r.status === 'achieved' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'bg-porteo-orange/20 text-porteo-orange border border-porteo-orange/20'
                      }`}>
                        {r.status}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-white/40">{language === 'en' ? 'Progress to Target' : 'Progreso hacia la Meta'}</span>
                        <span className="text-white">{currency} ${r.currentVolume.toLocaleString()} / {currency} ${r.targetVolume.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((r.currentVolume / r.targetVolume) * 100, 100)}%` }}
                          className={`h-full rounded-full ${r.status === 'achieved' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-porteo-orange shadow-[0_0_10px_rgba(242,125,38,0.3)]'}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{language === 'en' ? 'Rebate Rate' : 'Tasa de Rebate'}</p>
                        <p className="text-2xl font-bold text-white">{r.rebatePercentage}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{language === 'en' ? 'Est. Credit' : 'Crédito Est.'}</p>
                        <p className="text-2xl font-bold text-emerald-500">{currency} ${(r.currentVolume * (r.rebatePercentage / 100)).toLocaleString()}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleViewRebate(r)}
                      className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {language === 'en' ? 'View Details' : 'Ver Detalles'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSubTab === 'contracts' && (
            <motion.div 
              key="contracts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-6 flex flex-col h-full overflow-hidden"
            >
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Contract Lifecycle Management' : 'Gestión del Ciclo de Vida de Contratos'}</h3>
                  <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Monitor and manage active agreements' : 'Monitorear y gestionar acuerdos activos'}</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                  <div className="relative flex-1 xl:flex-none min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="text"
                      value={contractSearch}
                      onChange={(e) => setContractSearch(e.target.value)}
                      placeholder={language === 'en' ? 'Search contracts...' : 'Buscar contratos...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-porteo-orange/50 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => document.getElementById('contract-upload-main')?.click()} 
                      className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      {language === 'en' ? 'Upload' : 'Subir'}
                    </button>
                    <input
                      type="file"
                      id="contract-upload-main"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          setShowNewContractModal(true);
                          toast.success(language === 'en' ? `File ${file.name} uploaded. Please complete details.` : `Archivo ${file.name} subido. Por favor complete los detalles.`);
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        setUploadedFile(null);
                        setShowNewContractModal(true);
                      }}
                      className="px-4 py-2.5 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                    >
                      <Plus className="w-4 h-4" />
                      {language === 'en' ? 'New Contract' : 'Nuevo Contrato'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                  {filteredContracts.map((contract) => (
                    <motion.div 
                      layout
                      key={contract.id}
                      onClick={() => handleViewContract(contract)}
                      className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-5 hover:border-porteo-orange/30 transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-porteo-orange group-hover:bg-porteo-orange/10 transition-all">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border ${
                          contract.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          contract.status === 'pending_renewal' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-white/10 text-white/40 border-white/10'
                        }`}>
                          {contract.status.replace('_', ' ')}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-white truncate group-hover:text-porteo-orange transition-colors">{contract.partyName}</h4>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">{contract.type} contract • {contract.id}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1.5 tracking-widest">{language === 'en' ? 'Start Date' : 'Fecha Inicio'}</p>
                          <div className="flex items-center gap-2 text-xs text-white font-medium">
                            <Calendar className="w-3.5 h-3.5 text-porteo-blue" />
                            {contract.startDate}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1.5 tracking-widest">{language === 'en' ? 'End Date' : 'Fecha Fin'}</p>
                          <div className="flex items-center gap-2 text-xs text-white font-medium">
                            <Calendar className="w-3.5 h-3.5 text-porteo-orange" />
                            {contract.endDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1 tracking-widest">{language === 'en' ? 'Value' : 'Valor'}</p>
                          <p className="text-sm font-bold text-white">{contract.value ? `${contract.currency} ${contract.value.toLocaleString()}` : 'N/A'}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewContract(contract);
                          }}
                          className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-porteo-orange hover:text-white hover:border-porteo-orange transition-all"
                        >
                          {language === 'en' ? 'Manage' : 'Gestionar'}
                        </button>
                      </div>

                      {contract.status === 'pending_renewal' && (
                        <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          <p className="text-[10px] text-amber-500 font-bold leading-tight">
                            {language === 'en' ? 'Renewal required within 30 days' : 'Renovación requerida en 30 días'}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPricingModal && selectedPricing && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setShowPricingModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowPricingModal(false)}
                    className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all sm:hidden"
                  >
                    <ArrowDownLeft className="w-5 h-5 rotate-45" />
                  </button>
                  <div>
                    <h4 className="text-xl font-bold text-white">{selectedPricing.customerId}</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">Pricing Details • {selectedPricing.sku}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPricingModal(false)} 
                  className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                {isEditingPricing ? (
                  <form 
                    id="pricing-edit-form"
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const updatedPricing = {
                        ...selectedPricing,
                        basePrice: Number(formData.get('basePrice')),
                        discountedPrice: Number(formData.get('discountedPrice'))
                      };
                      setPricing(pricing.map(p => (p.customerId === selectedPricing.customerId && p.sku === selectedPricing.sku) ? updatedPricing : p));
                      setSelectedPricing(updatedPricing);
                      setIsEditingPricing(false);
                      toast.success('Pricing updated successfully');
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Base Price</label>
                        <input name="basePrice" type="number" defaultValue={selectedPricing.basePrice} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Contract Price</label>
                        <input name="discountedPrice" type="number" defaultValue={selectedPricing.discountedPrice} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Notes</label>
                      <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange resize-none" placeholder="Add pricing notes..." />
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Base Price</p>
                        <p className="text-xl font-bold text-white/40 line-through">{currency} ${selectedPricing.basePrice.toLocaleString()}</p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Contract Price</p>
                        <p className="text-xl font-bold text-porteo-orange">{currency} ${selectedPricing.discountedPrice.toLocaleString()}</p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Savings</p>
                        <p className="text-xl font-bold text-emerald-500">{((1 - selectedPricing.discountedPrice/selectedPricing.basePrice) * 100).toFixed(0)}%</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-porteo-blue" />
                        Accionarial & Compliance
                      </h5>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">Shareholding Structure</span>
                          <span className="text-sm font-bold text-white">Private Equity (85%) / Founders (15%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">Compliance Status</span>
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold uppercase">Verified</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">Last Audit Date</span>
                          <span className="text-sm font-bold text-white">2024-02-15</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-4 shrink-0">
                  <button 
                    onClick={() => handleDownloadContract(selectedPricing.contractId)}
                    className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {language === 'en' ? 'Download Contract' : 'Descargar Contrato'}
                  </button>
                  <button 
                    type={isEditingPricing ? "submit" : "button"}
                    form={isEditingPricing ? "pricing-edit-form" : undefined}
                    onClick={() => {
                      if (!isEditingPricing) {
                        setIsEditingPricing(true);
                      }
                    }}
                    className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                  >
                    {isEditingPricing ? (language === 'en' ? 'Save Changes' : 'Guardar Cambios') : (language === 'en' ? 'Edit Pricing' : 'Editar Precios')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showRebateModal && selectedRebate && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setShowRebateModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowRebateModal(false)}
                    className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all sm:hidden"
                  >
                    <ArrowDownLeft className="w-5 h-5 rotate-45" />
                  </button>
                  <div>
                    <h4 className="text-xl font-bold text-white">{selectedRebate.supplierName}</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">Rebate Program • {selectedRebate.supplierId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRebateModal(false)} 
                  className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-white/40">Volume Progress</span>
                    <span className="text-white">{currency} ${selectedRebate.currentVolume.toLocaleString()} / {currency} ${selectedRebate.targetVolume.toLocaleString()}</span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((selectedRebate.currentVolume / selectedRebate.targetVolume) * 100, 100)}%` }}
                      className={`h-full rounded-full ${selectedRebate.status === 'achieved' ? 'bg-emerald-500' : 'bg-porteo-orange'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Rebate Percentage</p>
                    <p className="text-3xl font-bold text-white">{selectedRebate.rebatePercentage}%</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Accrued Credit</p>
                    <p className="text-3xl font-bold text-emerald-500">{currency} ${(selectedRebate.currentVolume * (selectedRebate.rebatePercentage / 100)).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-white uppercase tracking-widest">Program Milestones</h5>
                  <div className="space-y-3">
                    {[
                      { label: 'Tier 1 (500k)', status: 'completed', date: '2024-01-20' },
                      { label: 'Tier 2 (800k)', status: 'completed', date: '2024-03-15' },
                      { label: 'Tier 3 (1M)', status: selectedRebate.status === 'achieved' ? 'completed' : 'pending', date: selectedRebate.status === 'achieved' ? '2024-04-10' : 'Expected May' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${m.status === 'completed' ? 'bg-emerald-500' : 'bg-white/20'}`} />
                          <span className="text-sm text-white/80 font-medium">{m.label}</span>
                        </div>
                        <span className="text-xs text-white/40">{m.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    toast.success('Rebate credit claim initiated');
                    setShowRebateModal(false);
                  }}
                  className="w-full py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20"
                >
                  Claim Rebate Credit
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showContractModal && selectedContract && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setShowContractModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowContractModal(false)}
                    className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all sm:hidden"
                  >
                    <ArrowDownLeft className="w-5 h-5 rotate-45" />
                  </button>
                  <div>
                    <h4 className="text-xl font-bold text-white">{selectedContract.partyName}</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">Contract Management • {selectedContract.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowContractModal(false)} 
                  className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedContract.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <p className="text-lg font-bold text-white uppercase tracking-widest">{selectedContract.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Contract Value</p>
                    <p className="text-lg font-bold text-white">{selectedContract.currency} {selectedContract.value?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Validity Period</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-white/80">
                          <Calendar className="w-4 h-4 text-porteo-blue" />
                          <span>Start: {selectedContract.startDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/80">
                          <Calendar className="w-4 h-4 text-porteo-orange" />
                          <span>End: {selectedContract.endDate}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-widest">Auto-Renewal</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${selectedContract.autoRenew ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-white/40'}`}>
                        <RefreshCw className={`w-4 h-4 ${selectedContract.autoRenew ? 'animate-spin-slow' : ''}`} />
                        <span className="text-xs font-bold uppercase">{selectedContract.autoRenew ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedContract.status === 'pending_renewal' && (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-500">Action Required: Renewal Pending</p>
                      <p className="text-xs text-amber-500/80 mt-1">This contract expires in less than 30 days. Please initiate the renewal process to avoid service interruption.</p>
                      <button 
                        onClick={() => {
                          toast.success('Renewal process initiated');
                          setShowContractModal(false);
                          setShowEditContractModal(true);
                        }}
                        className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all"
                      >
                        Initiate Renewal
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 shrink-0">
                  <button 
                    onClick={() => setShowPdfModal(true)}
                    className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {language === 'en' ? 'View PDF' : 'Ver PDF'}
                  </button>
                  <button 
                    onClick={() => {
                      setShowContractModal(false);
                      setShowEditContractModal(true);
                    }}
                    className="flex-1 py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20"
                  >
                    {language === 'en' ? 'Edit Contract' : 'Editar Contrato'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showNewContractModal && (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setShowNewContractModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Register New Contract' : 'Registrar Nuevo Contrato'}</h4>
                <button onClick={() => setShowNewContractModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form 
                className="p-8 space-y-6 overflow-y-auto custom-scrollbar"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newContract: Contract = {
                    id: `CON-${Math.floor(Math.random() * 10000)}`,
                    partyName: formData.get('partyName') as string,
                    type: formData.get('type') as any,
                    status: 'active',
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                    value: Number(formData.get('value')),
                    currency: currency as any,
                    autoRenew: formData.get('autoRenew') === 'on'
                  };
                  setContracts([newContract, ...contracts]);
                  setShowNewContractModal(false);
                  toast.success(language === 'en' ? 'Contract registered successfully' : 'Contrato registrado con éxito');
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer / Supplier Name' : 'Nombre Cliente / Proveedor'}</label>
                    <input name="partyName" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" defaultValue={uploadedFile ? uploadedFile.name.split('.')[0] : ''} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Contract Type' : 'Tipo de Contrato'}</label>
                      <select name="type" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange">
                        <option value="customer">Customer</option>
                        <option value="supplier">Supplier</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Value' : 'Valor'}</label>
                      <input name="value" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Start Date' : 'Fecha Inicio'}</label>
                      <input name="startDate" type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'End Date' : 'Fecha Fin'}</label>
                      <input name="endDate" type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input name="autoRenew" type="checkbox" className="w-5 h-5 rounded border-white/10 bg-white/5 text-porteo-orange focus:ring-porteo-orange" />
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">{language === 'en' ? 'Enable Auto-Renewal' : 'Habilitar Auto-Renovación'}</span>
                  </label>
                </div>
                <button type="submit" className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20">
                  {language === 'en' ? 'Save Contract' : 'Guardar Contrato'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showEditContractModal && selectedContract && (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setShowEditContractModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/[0.02]">
                <h4 className="text-xl font-bold text-white">{language === 'en' ? 'Edit Contract' : 'Editar Contrato'}</h4>
                <button onClick={() => setShowEditContractModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form 
                className="p-8 space-y-6 overflow-y-auto custom-scrollbar"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedContract: Contract = {
                    ...selectedContract,
                    partyName: formData.get('partyName') as string,
                    type: formData.get('type') as any,
                    startDate: formData.get('startDate') as string,
                    endDate: formData.get('endDate') as string,
                    value: Number(formData.get('value')),
                    autoRenew: formData.get('autoRenew') === 'on',
                    status: 'active' // Reset status if renewed
                  };
                  setContracts(contracts.map(c => c.id === selectedContract.id ? updatedContract : c));
                  setShowEditContractModal(false);
                  toast.success(language === 'en' ? 'Contract updated successfully' : 'Contrato actualizado con éxito');
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer / Supplier Name' : 'Nombre Cliente / Proveedor'}</label>
                    <input name="partyName" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" defaultValue={selectedContract.partyName} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Contract Type' : 'Tipo de Contrato'}</label>
                      <select name="type" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" defaultValue={selectedContract.type}>
                        <option value="customer">Customer</option>
                        <option value="supplier">Supplier</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Value' : 'Valor'}</label>
                      <input name="value" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" defaultValue={selectedContract.value} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Start Date' : 'Fecha Inicio'}</label>
                      <input name="startDate" type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" defaultValue={selectedContract.startDate} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'End Date' : 'Fecha Fin'}</label>
                      <input name="endDate" type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-porteo-orange" defaultValue={selectedContract.endDate} />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input name="autoRenew" type="checkbox" className="w-5 h-5 rounded border-white/10 bg-white/5 text-porteo-orange focus:ring-porteo-orange" defaultChecked={selectedContract.autoRenew} />
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">{language === 'en' ? 'Enable Auto-Renewal' : 'Habilitar Auto-Renovación'}</span>
                  </label>
                </div>
                <button type="submit" className="w-full py-4 bg-porteo-orange text-white rounded-2xl font-bold hover:bg-porteo-orange/90 transition-all shadow-lg shadow-porteo-orange/20">
                  {language === 'en' ? 'Update Contract' : 'Actualizar Contrato'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showPdfModal && selectedContract && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl"
            onClick={() => setShowPdfModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-porteo-blue" />
                  <span className="text-sm font-bold text-gray-700">{selectedContract.partyName}_Contract_{selectedContract.id}.pdf</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
                    <Upload className="w-4 h-4 rotate-180" />
                  </button>
                  <button onClick={() => setShowPdfModal(false)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-500 p-8 flex justify-center custom-scrollbar">
                <div className="bg-white w-full max-w-[800px] min-h-[1100px] shadow-xl p-16 space-y-8 text-gray-800 font-serif">
                  <div className="text-center space-y-2 border-b-2 border-gray-100 pb-8">
                    <h1 className="text-3xl font-bold uppercase tracking-widest">{language === 'en' ? 'Service Agreement' : 'Contrato de Servicios'}</h1>
                    <p className="text-sm text-gray-500">Contract ID: {selectedContract.id}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-12 text-sm">
                    <div className="space-y-4">
                      <h3 className="font-bold uppercase border-b border-gray-100 pb-2">{language === 'en' ? 'Between' : 'Entre'}</h3>
                      <p className="font-bold">PORTEO LOGISTICS S.A.</p>
                      <p className="text-gray-600">Av. de la Industria 450<br/>Ciudad de México, CP 01210</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold uppercase border-b border-gray-100 pb-2">{language === 'en' ? 'And' : 'Y'}</h3>
                      <p className="font-bold">{selectedContract.partyName.toUpperCase()}</p>
                      <p className="text-gray-600">Registered Office Address<br/>Tax ID: {selectedContract.id.replace('CON', 'TAX')}</p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8">
                    <div className="space-y-2">
                      <h3 className="font-bold uppercase text-xs tracking-widest">1. {language === 'en' ? 'Scope of Services' : 'Alcance de los Servicios'}</h3>
                      <p className="text-sm leading-relaxed text-justify">
                        {language === 'en' 
                          ? `This agreement outlines the commercial terms for logistics and distribution services provided by Porteo to ${selectedContract.partyName}. The services include warehousing, last-mile delivery, and inventory management as specified in Annex A.`
                          : `Este acuerdo establece los términos comerciales para los servicios de logística y distribución proporcionados por Porteo a ${selectedContract.partyName}. Los servicios incluyen almacenamiento, entrega de última milla y gestión de inventario según lo especificado en el Anexo A.`}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold uppercase text-xs tracking-widest">2. {language === 'en' ? 'Financial Terms' : 'Términos Financieros'}</h3>
                      <p className="text-sm leading-relaxed text-justify">
                        {language === 'en'
                          ? `The total estimated value of this contract is ${selectedContract.currency} ${selectedContract.value?.toLocaleString()}. Payments shall be made within 30 days of invoice issuance. All prices are subject to annual adjustment based on CPI.`
                          : `El valor total estimado de este contrato es ${selectedContract.currency} ${selectedContract.value?.toLocaleString()}. Los pagos se realizarán dentro de los 30 días posteriores a la emisión de la factura. Todos los precios están sujetos a ajuste anual basado en el IPC.`}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold uppercase text-xs tracking-widest">3. {language === 'en' ? 'Term and Termination' : 'Vigencia y Terminación'}</h3>
                      <p className="text-sm leading-relaxed text-justify">
                        {language === 'en'
                          ? `This contract is valid from ${selectedContract.startDate} to ${selectedContract.endDate}. ${selectedContract.autoRenew ? 'This agreement will automatically renew for successive one-year periods unless terminated with 60 days notice.' : 'This agreement does not automatically renew.'}`
                          : `Este contrato es válido desde el ${selectedContract.startDate} hasta el ${selectedContract.endDate}. ${selectedContract.autoRenew ? 'Este acuerdo se renovará automáticamente por períodos sucesivos de un año a menos que se rescinda con 60 días de antelación.' : 'Este acuerdo no se renueva automáticamente.'}`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-24 grid grid-cols-2 gap-24">
                    <div className="border-t border-gray-300 pt-4 text-center">
                      <p className="text-[10px] uppercase font-bold">{language === 'en' ? 'Authorized Signature' : 'Firma Autorizada'}</p>
                      <p className="text-xs text-gray-400 mt-8">Porteo Logistics Representative</p>
                    </div>
                    <div className="border-t border-gray-300 pt-4 text-center">
                      <p className="text-[10px] uppercase font-bold">{language === 'en' ? 'Authorized Signature' : 'Firma Autorizada'}</p>
                      <p className="text-xs text-gray-400 mt-8">{selectedContract.partyName} Representative</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
