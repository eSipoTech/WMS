import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, FileText, TrendingUp, Users, Search, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck, Calendar, AlertCircle, ExternalLink, Plus, Upload } from 'lucide-react';
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
  const language = lang; // Alias for backward compatibility
  const currency = market === 'USA' ? 'USD' : 'MXN';
  const [activeSubTab, setActiveSubTab] = useState<'pricing' | 'rebates' | 'contracts'>(defaultSubTab);
  const [contractSearch, setContractSearch] = useState('');

  // Update activeSubTab if defaultSubTab changes (e.g. from sidebar navigation)
  React.useEffect(() => {
    setActiveSubTab(defaultSubTab);
  }, [defaultSubTab]);

  const filteredContracts = MOCK_CONTRACTS.filter(c => 
    c.partyName.toLowerCase().includes(contractSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(contractSearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex gap-4">
        {[
          { id: 'pricing', label: language === 'en' ? 'Customer Pricing' : 'Precios por Cliente', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'rebates', label: language === 'en' ? 'Supplier Rebates' : 'Rebates de Proveedores', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'contracts', label: language === 'en' ? 'Contract Management' : 'Gestión de Contratos', icon: <FileText className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all ${
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
        {activeSubTab === 'pricing' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Customer Specific Pricing' : 'Precios Específicos por Cliente'}</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text"
                    placeholder={language === 'en' ? 'Search customer or SKU...' : 'Buscar cliente o SKU...'}
                    className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-porteo-orange/50"
                  />
                </div>
                <button 
                  onClick={() => alert(language === 'en' ? 'Filter options:\n- By Customer\n- By SKU Category\n- By Discount Range\n- By Contract Status' : 'Opciones de filtro:\n- Por Cliente\n- Por Categoría de SKU\n- Por Rango de Descuento\n- Por Estado de Contrato')}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Customer' : 'Cliente'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">SKU</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Base Price' : 'Precio Base'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Contract Price' : 'Precio Contrato'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Savings' : 'Ahorro'}</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Contract ID' : 'ID Contrato'}</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PRICING.map((p, i) => (
                    <tr 
                      key={i} 
                      onClick={() => onViewPricing?.(p)}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 text-sm font-bold text-white group-hover:text-porteo-orange transition-colors">{p.customerId}</td>
                      <td className="py-4 px-4 text-sm text-white/60">{p.sku}</td>
                      <td className="py-4 px-4 text-sm text-white/60">{currency} ${p.basePrice.toFixed(2)}</td>
                      <td className="py-4 px-4 text-sm font-bold text-porteo-orange">{currency} ${p.discountedPrice.toFixed(2)}</td>
                      <td className="py-4 px-4 text-sm text-emerald-500">-{((1 - p.discountedPrice/p.basePrice) * 100).toFixed(0)}%</td>
                      <td className="py-4 px-4 text-xs font-mono text-white/40">{p.contractId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'rebates' && (
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar h-full">
            <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Supplier Rebate Tracking' : 'Seguimiento de Rebates de Proveedores'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_REBATES.map((r, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white">{r.supplierId}</h4>
                      <p className="text-xs text-white/40 uppercase tracking-widest">{language === 'en' ? 'Volume Rebate Program' : 'Programa de Rebate por Volumen'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'achieved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-porteo-orange/20 text-porteo-orange'
                    }`}>
                      {r.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">{language === 'en' ? 'Progress to Target' : 'Progreso hacia la Meta'}</span>
                      <span className="text-white font-bold">{currency} ${r.currentVolume.toLocaleString()} / {currency} ${r.targetVolume.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((r.currentVolume / r.targetVolume) * 100, 100)}%` }}
                        className={`h-full ${r.status === 'achieved' ? 'bg-emerald-500' : 'bg-porteo-orange'}`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-white">{r.supplierName}</h4>
                      <p className="text-[10px] text-white/40 uppercase">{language === 'en' ? 'Rebate' : 'Rebate'}</p>
                      <p className="text-xl font-bold text-white">{r.rebatePercentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase">{language === 'en' ? 'Est. Credit' : 'Crédito Est.'}</p>
                      <p className="text-xl font-bold text-emerald-500">{currency} ${(r.currentVolume * (r.rebatePercentage / 100)).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => onViewRebate?.(r)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      {language === 'en' ? 'View Details' : 'Ver Detalles'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'contracts' && (
          <div className="p-8 space-y-6 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Contract Lifecycle Management' : 'Gestión del Ciclo de Vida de Contratos'}</h3>
                <p className="text-sm text-white/40 mt-1">{language === 'en' ? 'Monitor and manage active agreements' : 'Monitorear y gestionar acuerdos activos'}</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text"
                    value={contractSearch}
                    onChange={(e) => setContractSearch(e.target.value)}
                    placeholder={language === 'en' ? 'Search contracts...' : 'Buscar contratos...'}
                    className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-porteo-orange/50"
                  />
                </div>
                <div className="relative">
                  <input
                    type="file"
                    id="contract-upload-main"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        alert(`Uploading ${file.name}...`);
                      }
                    }}
                  />
                  <button 
                    onClick={() => document.getElementById('contract-upload-main')?.click()} 
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {language === 'en' ? 'Upload' : 'Subir'}
                  </button>
                </div>
                <button 
                  onClick={onNewContract}
                  className="px-4 py-2 bg-porteo-orange text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-porteo-orange/90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'en' ? 'New Contract' : 'Nuevo Contrato'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                {filteredContracts.map((contract) => (
                  <motion.div 
                    layout
                    key={contract.id}
                    onClick={() => onViewContract?.(contract)}
                    className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:border-porteo-orange/30 transition-all group cursor-pointer"
                  >
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:text-porteo-orange transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest ${
                      contract.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                      contract.status === 'pending_renewal' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {contract.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white truncate">{contract.partyName}</h4>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{contract.type} contract</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Start Date' : 'Fecha Inicio'}</p>
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Calendar className="w-3 h-3 text-white/20" />
                        {contract.startDate}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'End Date' : 'Fecha Fin'}</p>
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Calendar className="w-3 h-3 text-white/20" />
                        {contract.endDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">{language === 'en' ? 'Contract Value' : 'Valor Contrato'}</p>
                      <p className="text-sm font-bold text-white">{contract.value ? `${contract.currency} ${contract.value.toLocaleString()}` : 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewContract?.(contract);
                        }}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-colors"
                      >
                        {language === 'en' ? 'Manage' : 'Gestionar'}
                      </button>
                    </div>
                  </div>

                  {contract.status === 'pending_renewal' && (
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <p className="text-[10px] text-amber-500 font-bold">
                        {language === 'en' ? 'Renewal required within 30 days' : 'Renovación requerida en 30 días'}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};
