import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  X,
  Phone,
  Mail,
  Building2,
  ExternalLink,
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Lead {
  id: string;
  company: string;
  contact: string;
  status: 'NEW' | 'CONTACTED' | 'PROPOSAL' | 'CLOSED';
  pipeline: string;
  email?: string;
  phone?: string;
  value?: number;
  lastActivity?: string;
  notes?: string;
}

interface CRMProps {
  lang?: 'en' | 'es';
  market?: 'USA' | 'MEXICO';
}

export const CRM: React.FC<CRMProps> = ({ lang = 'en', market = 'USA' }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'asc' | 'desc' } | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/crm/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      toast.error('Failed to fetch CRM leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSort = (key: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.company.toLowerCase().includes(term) || 
        l.contact.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(l => l.status === statusFilter);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [leads, searchTerm, statusFilter, sortConfig]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message from popup:', event.data);
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const count = event.data.extractedCount || 0;
        toast.success(`LinkedIn synchronized! Extracted ${count} new leads.`);
        setIsSyncing(false);
        fetchLeads();
      }
      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        toast.error(`LinkedIn Sync failed: ${event.data.error}`);
        setIsSyncing(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLinkedInSync = async () => {
    // Open window IMMEDIATELY to avoid popup blockers
    const authWindow = window.open('about:blank', 'linkedin_oauth', 'width=600,height=700');
    
    if (!authWindow) {
      toast.error('Popup blocked! Please allow popups for this site in your browser settings.');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/auth/linkedin/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      authWindow.location.href = url;
    } catch (error) {
      authWindow.close();
      toast.error('Failed to initiate LinkedIn sync');
      setIsSyncing(false);
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (!phone) {
      toast.error('No phone number available');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    toast.success(`Opening WhatsApp chat with ${phone}...`);
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleEditClick = () => {
    if (selectedLead) {
      setEditForm(selectedLead);
      setIsEditing(true);
    }
  };

  const handleSaveLead = async () => {
    if (!selectedLead || !editForm) return;
    
    try {
      const response = await fetch(`/api/crm/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast.success('Lead updated successfully');
        setIsEditing(false);
        setSelectedLead({ ...selectedLead, ...editForm } as Lead);
        fetchLeads();
      } else {
        throw new Error('Failed to update lead');
      }
    } catch (error) {
      toast.error('Error updating lead');
    }
  };

  const handleAddLead = () => {
    setEditForm({
      company: '',
      contact: '',
      status: 'NEW',
      pipeline: 'SALES',
      email: '',
      phone: '',
      value: 0,
      notes: ''
    });
    setIsAdding(true);
  };

  const handleSaveNewLead = async () => {
    if (!editForm.company || !editForm.contact) {
      toast.error('Company and Contact are required');
      return;
    }
    
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast.success('Lead added successfully');
        setIsAdding(false);
        fetchLeads();
      } else {
        throw new Error('Failed to add lead');
      }
    } catch (error) {
      toast.error('Error adding lead');
    }
  };

  const statusColors: Record<string, string> = {
    'NEW': 'bg-porteo-blue/10 text-porteo-blue border-porteo-blue/20',
    'CONTACTED': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    'PROPOSAL': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    'CLOSED': 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
  };

  const stats = [
    { label: 'Total Leads', value: leads.length.toString(), icon: Users, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10', filter: 'ALL' },
    { label: 'Active Pipeline', value: `$${(leads.reduce((acc, l) => acc + (l.value || 0), 0) / 1000).toFixed(0)}k`, icon: Target, color: 'text-porteo-orange', bg: 'bg-porteo-orange/10', filter: 'PROPOSAL' },
    { label: 'Closed Deals', value: leads.filter(l => l.status === 'CLOSED').length.toString(), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', filter: 'CLOSED' },
    { label: 'New Leads', value: leads.filter(l => l.status === 'NEW').length.toString(), icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10', filter: 'NEW' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">CRM B2B</h1>
          <p className="text-white/60 mt-2">Sales Pipeline & Lead Management</p>
        </div>
        <button 
          onClick={handleAddLead}
          className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20"
        >
          <Plus className="w-5 h-5" />
          Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setStatusFilter(stat.filter);
              toast.info(`Filtering by ${stat.label}`);
            }}
            className={`glass p-6 rounded-3xl border border-white/10 text-left transition-all ${statusFilter === stat.filter ? 'ring-2 ring-porteo-blue border-transparent' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-emerald-400 text-xs font-bold">+2.4%</span>
            </div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest truncate">{stat.label}</p>
            <h3 className="text-xl xl:text-2xl font-bold text-white mt-1 truncate">{stat.value}</h3>
          </motion.button>
        ))}
      </div>

      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads, companies..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-white/40" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-porteo-blue/50"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="CLOSED">Closed</option>
              </select>
              {statusFilter !== 'ALL' && (
                <button 
                  onClick={() => setStatusFilter('ALL')}
                  className="text-xs text-porteo-blue hover:underline font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLinkedInSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 glass rounded-xl text-white/60 hover:text-white border border-white/10 transition-all disabled:opacity-50"
            >
              <Linkedin className={`w-4 h-4 text-porteo-blue ${isSyncing ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">LinkedIn Sync</span>
            </button>
            <button 
              onClick={() => handleWhatsApp('+52 55 1234 5678')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 glass rounded-xl text-white/60 hover:text-white border border-white/10 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('company')}>
                  <div className="flex items-center gap-2">
                    Company
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('contact')}>
                  <div className="flex items-center gap-2">
                    Contact
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Pipeline</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/40">Loading leads...</td>
                </tr>
              ) : filteredAndSortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/40">No leads found matching your criteria.</td>
                </tr>
              ) : (
                filteredAndSortedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-porteo-blue/20 flex items-center justify-center text-porteo-blue font-bold border border-porteo-blue/20">
                          {lead.company[0]}
                        </div>
                        <span className="text-white font-bold group-hover:text-porteo-blue transition-colors">{lead.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-white/60 font-medium">{lead.contact}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${statusColors[lead.status] || 'bg-white/5 text-white/40 border-white/10'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-white/60 font-medium">{lead.pipeline}</td>
                    <td className="px-6 py-5 text-white/40 text-sm">{lead.lastActivity}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleWhatsApp(lead.phone); }}
                          className="p-2 text-white/40 hover:text-emerald-400 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toast.info('More options...'); }}
                          className="p-2 text-white/40 hover:text-white transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Details / Add Lead Modal */}
      <AnimatePresence>
        {(selectedLead || isAdding) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setSelectedLead(null);
                setIsAdding(false);
                setIsEditing(false);
              }}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-porteo-blue/20 flex items-center justify-center text-porteo-blue text-2xl font-bold border border-porteo-blue/20">
                      {(isAdding ? editForm.company?.[0] : selectedLead?.company?.[0]) || 'L'}
                    </div>
                    <div className="flex-1">
                      {isEditing || isAdding ? (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-porteo-blue uppercase tracking-widest">Company Name</label>
                          <input 
                            type="text"
                            value={editForm.company || ''}
                            onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-porteo-blue focus:border-transparent transition-all"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <h3 className="text-3xl font-bold text-white">{selectedLead?.company}</h3>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${statusColors[isAdding ? editForm.status || 'NEW' : selectedLead?.status || 'NEW']}`}>
                          {isAdding ? editForm.status : selectedLead?.status}
                        </span>
                        <span className="text-white/40 text-sm">• {isAdding ? editForm.pipeline : selectedLead?.pipeline}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedLead(null);
                      setIsAdding(false);
                      setIsEditing(false);
                    }}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white/40 hover:text-white" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Contact Person</label>
                      {isEditing || isAdding ? (
                        <input 
                          type="text"
                          value={editForm.contact || ''}
                          onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-3 text-white">
                          <Users className="w-4 h-4 text-porteo-blue" />
                          <span className="font-medium">{selectedLead?.contact}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Email Address</label>
                      {isEditing || isAdding ? (
                        <input 
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-3 text-white">
                          <Mail className="w-4 h-4 text-porteo-blue" />
                          <span className="font-medium">{selectedLead?.email}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Phone Number</label>
                      {isEditing || isAdding ? (
                        <input 
                          type="text"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-3 text-white">
                          <Phone className="w-4 h-4 text-porteo-blue" />
                          <span className="font-medium">{selectedLead?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Deal Value</label>
                      {isEditing || isAdding ? (
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                          <input 
                            type="number"
                            value={editForm.value || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              setEditForm({ ...editForm, value: isNaN(val) ? 0 : val });
                            }}
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue focus:border-transparent transition-all"
                          />
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-porteo-orange">
                          ${selectedLead?.value?.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Status</label>
                      {isEditing || isAdding ? (
                        <select 
                          value={editForm.status || ''}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Lead['status'] })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue focus:border-transparent transition-all"
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="PROPOSAL">Proposal</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-3 text-white/60">
                          <Calendar className="w-4 h-4" />
                          <span>{selectedLead?.lastActivity}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Notes</label>
                      {isEditing || isAdding ? (
                        <textarea 
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          rows={3}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue focus:border-transparent transition-all resize-none"
                        />
                      ) : (
                        <p className="text-sm text-white/60 leading-relaxed">
                          {selectedLead?.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  {isEditing || isAdding ? (
                    <>
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setIsAdding(false);
                        }}
                        className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={isAdding ? handleSaveNewLead : handleSaveLead}
                        className="flex-1 py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/90 transition-all"
                      >
                        {isAdding ? 'Create Lead' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleWhatsApp(selectedLead?.phone)}
                        className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp Chat
                      </button>
                      <button 
                        onClick={handleEditClick}
                        className="flex-1 py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/90 transition-all"
                      >
                        Edit Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
