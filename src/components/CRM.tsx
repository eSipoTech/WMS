import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MessageCircle, 
  Linkedin, 
  Plus, 
  MoreHorizontal, 
  ChevronRight,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Lead {
  id: string;
  company: string;
  contact: string;
  status: string;
  pipeline: string;
}

interface CRMProps {
  lang?: 'en' | 'es';
  market?: 'USA' | 'MEXICO';
}

export const CRM: React.FC<CRMProps> = ({ lang = 'en', market = 'USA' }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/crm/leads');
      if (response.ok) setLeads(await response.json());
    } catch (error) {
      toast.error('Failed to fetch CRM leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const statusColors: Record<string, string> = {
    'NEW': 'bg-porteo-blue/10 text-porteo-blue',
    'CONTACTED': 'bg-amber-400/10 text-amber-400',
    'PROPOSAL': 'bg-purple-400/10 text-purple-400',
    'CLOSED': 'bg-emerald-400/10 text-emerald-400'
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">CRM B2B</h1>
          <p className="text-white/60 mt-2">Sales Pipeline & Lead Management</p>
        </div>
        <button className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20">
          <Plus className="w-5 h-5" />
          Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Leads', value: '124', icon: Users, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10' },
          { label: 'Active Pipeline', value: '$250k', icon: Target, color: 'text-porteo-orange', bg: 'bg-porteo-orange/10' },
          { label: 'Conversion Rate', value: '18.5%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Avg. Cycle', value: '14 days', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-emerald-400 text-xs font-bold">+2.4%</span>
            </div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" 
                placeholder="Search leads, companies..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white/60 hover:text-white border border-white/10">
              <Linkedin className="w-4 h-4 text-porteo-blue" />
              LinkedIn Sync
            </button>
            <button className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white/60 hover:text-white border border-white/10">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              WhatsApp
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Pipeline</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold">
                        {lead.company[0]}
                      </div>
                      <span className="text-white font-bold">{lead.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-white/60 font-medium">{lead.contact}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[lead.status] || 'bg-white/5 text-white/40'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-white/60 font-medium">{lead.pipeline}</td>
                  <td className="px-6 py-5 text-white/40 text-sm">2 hours ago</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-white/40 hover:text-porteo-blue transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-white/40 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
