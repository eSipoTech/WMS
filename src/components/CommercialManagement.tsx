import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, FileText, TrendingUp, Users, Search, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { MOCK_PRICING, MOCK_REBATES } from '../constants';

interface CommercialManagementProps {
  language: 'en' | 'es';
}

export const CommercialManagement = ({ language }: CommercialManagementProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'pricing' | 'rebates' | 'contracts'>('pricing');

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
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
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
                <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white">
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
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-sm font-bold text-white">{p.customerId}</td>
                      <td className="py-4 px-4 text-sm text-white/60">{p.sku}</td>
                      <td className="py-4 px-4 text-sm text-white/60">${p.basePrice.toFixed(2)}</td>
                      <td className="py-4 px-4 text-sm font-bold text-porteo-orange">${p.discountedPrice.toFixed(2)}</td>
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
          <div className="p-8 space-y-6">
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
                      <span className="text-white/40">{language === 'en' ? 'Progress to Threshold' : 'Progreso hacia el Límite'}</span>
                      <span className="text-white font-bold">${r.currentVolume.toLocaleString()} / ${r.threshold.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((r.currentVolume / r.threshold) * 100, 100)}%` }}
                        className={`h-full ${r.status === 'achieved' ? 'bg-emerald-500' : 'bg-porteo-orange'}`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase">{language === 'en' ? 'Rebate' : 'Rebate'}</p>
                      <p className="text-xl font-bold text-white">{r.rebatePercentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase">{language === 'en' ? 'Est. Credit' : 'Crédito Est.'}</p>
                      <p className="text-xl font-bold text-emerald-500">${(r.currentVolume * (r.rebatePercentage / 100)).toLocaleString()}</p>
                    </div>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors">
                      {language === 'en' ? 'View Details' : 'Ver Detalles'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'contracts' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">{language === 'en' ? 'Contract Lifecycle Management' : 'Gestión del Ciclo de Vida de Contratos'}</h3>
            <p className="text-white/40 max-w-md">
              {language === 'en' 
                ? 'Centralized repository for all customer and supplier contracts. Automated renewal alerts and compliance tracking.' 
                : 'Repositorio centralizado para todos los contratos de clientes y proveedores. Alertas de renovación automatizadas y seguimiento de cumplimiento.'}
            </p>
            <button className="px-6 py-3 bg-porteo-orange text-white rounded-2xl font-bold shadow-lg shadow-porteo-orange/20">
              {language === 'en' ? 'Open Contract Repository' : 'Abrir Repositorio de Contratos'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
