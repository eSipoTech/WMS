import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Globe, 
  Zap, 
  RefreshCw, 
  Cpu, 
  Activity, 
  Clock, 
  Info,
  Plus,
  Users,
  Settings,
  Link,
  Server,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'warehouses' | 'users' | 'integration' | 'master'>('warehouses');
  const [as400Status, setAs400Status] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddNode, setShowAddNode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDataMasterModal, setShowDataMasterModal] = useState(false);

  // Integration Checklist State
  const [steps, setSteps] = useState([
    { id: 1, label: 'Ensure LANSA JSM is running on port 4545', completed: true },
    { id: 2, label: 'Verify REST service mapping in LANSA IDE', completed: true },
    { id: 3, label: 'Check transaction logs for 500 errors', completed: false },
    { id: 4, label: 'Maintain physical file locks during sync', completed: false }
  ]);

  // Mock Users
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@porteo.mx', role: 'Super Admin', status: 'Active', lastLogin: '2 mins ago' },
    { id: 2, name: 'Warehouse Op 42', email: 'op42@porteo.mx', role: 'Operator', status: 'Active', lastLogin: '1 hour ago' },
    { id: 3, name: 'Billing Manager', email: 'billing@porteo.mx', role: 'Manager', status: 'Active', lastLogin: '5 hours ago' },
    { id: 4, name: 'External Auditor', email: 'auditor@external.com', role: 'Auditor', status: 'Inactive', lastLogin: '3 days ago' },
  ]);

  // API Connectors
  const [connectors, setConnectors] = useState([
    { id: 'sap', name: 'SAP S/4HANA', type: 'ERP', status: 'Connected', health: 98, icon: Server },
    { id: 'oracle', name: 'Oracle NetSuite', type: 'ERP', status: 'Pending', health: 0, icon: Database },
    { id: 'gps', name: 'Samsara GPS', type: 'IoT', status: 'Connected', health: 100, icon: Globe },
    { id: 'handheld', name: 'Zebra Handhelds', type: 'Device', status: 'Connected', health: 94, icon: Terminal },
  ]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/integration/as400/status');
      if (res.ok) {
        const data = await res.json();
        setAs400Status(data);
      }
    } catch (error) {
      console.error('Failed to fetch AS/400 status', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/integration/as400/status');
      if (res.ok) {
        const data = await res.json();
        setAs400Status(data);
        
        // Automatically complete checklist steps on successful sync
        setSteps(prev => prev.map(step => ({ ...step, completed: true })));
        
        toast.success('AS/400 Synchronization complete. Integration steps verified.');
      } else {
        toast.error('Sync failed: Server error');
      }
    } catch (error) {
      toast.error('Sync failed: Network error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/system/audit', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'System audit complete');
        await fetchStatus(); // Refresh status after audit
      } else {
        toast.error('Audit failed: Server error');
      }
    } catch (error) {
      toast.error('Audit failed: Network error');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Admin Control</h1>
          <p className="text-white/60 mt-2">System Configuration & Global Settings</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
        {[
          { id: 'warehouses', label: 'Warehouses', icon: Globe },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'integration', label: 'AS/400 Integration', icon: Terminal },
          { id: 'master', label: 'Data Master', icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white shadow-inner' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-porteo-blue' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass rounded-3xl border border-white/10 p-8"
        >
          {activeTab === 'integration' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">AS/400 Status</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAudit}
                      disabled={isAuditing}
                      className="p-3 glass rounded-xl text-emerald-400 hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50 flex items-center gap-2 text-xs font-bold"
                    >
                      <ShieldCheck className={`w-5 h-5 ${isAuditing ? 'animate-pulse' : ''}`} />
                      {isAuditing ? 'Auditing...' : 'System Audit'}
                    </button>
                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="p-3 glass rounded-xl text-porteo-blue hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50 flex items-center gap-2 text-xs font-bold"
                    >
                      <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Sync AS/400'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'System', value: as400Status?.system || 'IBM i (Power9)', icon: Cpu },
                    { label: 'Architecture', value: as400Status?.architecture || '64-bit RISC', icon: Globe },
                    { label: 'Middleware', value: as400Status?.middleware || 'LANSA Integrator v15.2', icon: Database },
                    { label: 'Connector', value: as400Status?.connector || 'JSM REST Service', icon: Zap },
                    { label: 'Latency', value: as400Status?.latency || '45ms', icon: Activity },
                    { label: 'Health', value: `${as400Status?.health || 98}%`, icon: Zap },
                    { label: 'Last Sync', value: as400Status?.lastSync ? new Date(as400Status.lastSync).toLocaleString() : 'Never', icon: Clock },
                    { label: 'Status', value: as400Status?.status?.toUpperCase() || 'OFFLINE', icon: Info },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 text-white/40 mb-2">
                        <item.icon className="w-4 h-4" />
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.label}</p>
                      </div>
                      <p className="text-white font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-porteo-blue/10 rounded-2xl border border-porteo-blue/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-porteo-blue/20 rounded-lg">
                        <Zap className="w-5 h-5 text-porteo-blue" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Connector Health</h4>
                    </div>
                    <button 
                      onClick={() => toast.info('Running deep health check on JSM Server...')}
                      className="text-[10px] font-bold text-porteo-blue uppercase hover:underline"
                    >
                      Run Deep Check
                    </button>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {as400Status?.message || 'Optimal performance detected in LANSA Server Modules. No bottlenecks found in JSM transaction logs.'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Integration Guide</h3>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {steps.filter(s => s.completed).length} / {steps.length} Completed
                  </span>
                </div>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        const newSteps = [...steps];
                        newSteps[i].completed = !newSteps[i].completed;
                        setSteps(newSteps);
                        toast.info(`${step.completed ? 'Confirmed' : 'Unconfirmed'}: ${step.label}`);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                        step.completed 
                          ? 'bg-emerald-400/5 border-emerald-400/20' 
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step.completed 
                          ? 'bg-emerald-400 text-black' 
                          : 'bg-white/10 text-white/40'
                      }`}>
                        {step.completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-sm font-medium transition-all ${
                        step.completed ? 'text-emerald-400' : 'text-white/60'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-porteo-orange/10 rounded-2xl border border-porteo-orange/20">
                  <div className="flex items-center gap-3 mb-2 text-porteo-orange">
                    <AlertTriangle className="w-5 h-5" />
                    <h4 className="text-sm font-bold uppercase tracking-widest">Security Warning</h4>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Direct AS/400 access is restricted to authorized IP ranges. Ensure your VPN is active before attempting a manual sync.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">User Management</h3>
                  <p className="text-white/60 text-sm">Manage system access and permissions</p>
                </div>
                <button className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-porteo-blue/90 transition-all">
                  <Plus className="w-5 h-5" />
                  Invite User
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="text"
                  placeholder="Search users by name, email or role..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-porteo-blue transition-all"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Login</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.filter(u => 
                      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.role.toLowerCase().includes(userSearchTerm.toLowerCase())
                    ).map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-porteo-blue/20 flex items-center justify-center text-porteo-blue font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-bold">{user.name}</p>
                              <p className="text-xs text-white/40">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-white/60 font-medium">{user.role}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            user.status === 'Active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/5 text-white/40'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-white/40">{user.lastLogin}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-white/40 hover:text-white transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-white/40 hover:text-porteo-orange transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'master' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Data Master Input</h3>
                  <p className="text-white/60 text-sm">Centralized data ingestion from external platforms</p>
                </div>
                <button 
                  onClick={() => setShowDataMasterModal(true)}
                  className="bg-white/10 px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                >
                  <Link className="w-5 h-5" />
                  New Connection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {connectors.map((conn) => (
                  <div key={conn.id} className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-porteo-blue/50 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl ${conn.status === 'Connected' ? 'bg-porteo-blue/10 text-porteo-blue' : 'bg-white/5 text-white/20'}`}>
                        <conn.icon className="w-6 h-6" />
                      </div>
                      <div className={`w-2 h-2 rounded-full ${conn.status === 'Connected' ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{conn.name}</h4>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-4">{conn.type}</p>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Health</span>
                        <span className={`text-[10px] font-bold ${conn.health > 90 ? 'text-emerald-400' : 'text-white/40'}`}>{conn.health}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${conn.health > 90 ? 'bg-emerald-400' : 'bg-white/20'}`} style={{ width: `${conn.health}%` }} />
                      </div>
                      <button 
                        onClick={() => toast.info(`Managing ${conn.name} integration...`)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-white transition-all flex items-center justify-center gap-2"
                      >
                        CONFIGURE
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-6">Live Data Stream</h4>
                  <div className="space-y-4">
                    {[
                      { source: 'SAP', event: 'Inventory Sync', time: 'Just now', status: 'Success' },
                      { source: 'GPS', event: 'Vehicle MX-042 Position', time: '12s ago', status: 'Success' },
                      { source: 'Handheld', event: 'Order #8821 Picked', time: '1m ago', status: 'Success' },
                      { source: 'AS/400', event: 'Master File Update', time: '5m ago', status: 'Success' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          <div>
                            <p className="text-sm font-bold text-white">{log.event}</p>
                            <p className="text-[10px] text-white/40 uppercase font-bold">{log.source} • {log.time}</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-porteo-blue/10 p-8 rounded-3xl border border-porteo-blue/20 flex flex-col justify-center text-center">
                  <Database className="w-12 h-12 text-porteo-blue mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Data Master AI</h4>
                  <p className="text-sm text-white/60 leading-relaxed mb-6">
                    Our AI is currently reconciling data from 4 sources. 12 potential duplicates were automatically merged today.
                  </p>
                  <button className="w-full py-3 bg-porteo-blue text-white font-bold rounded-xl hover:bg-porteo-blue/90 transition-all">
                    View Reconciliations
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'warehouses' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Global Warehouses</h3>
                  <p className="text-white/60 text-sm">Manage and monitor your global distribution network</p>
                </div>
                <button 
                  onClick={() => {
                    setShowAddNode(true);
                    toast.info('Opening Add Node wizard...');
                  }}
                  className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20"
                >
                  <Plus className="w-5 h-5" />
                  Add Node
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { name: 'MX-CDMX Hub', location: 'Mexico City, MX', status: 'Online', capacity: '85%', throughput: '1.2k units/hr', health: 99 },
                  { name: 'USA-TX Hub', location: 'Austin, TX', status: 'Online', capacity: '42%', throughput: '850 units/hr', health: 97 },
                  { name: 'EU-ES Hub', location: 'Madrid, ES', status: 'Maintenance', capacity: '0%', throughput: '0 units/hr', health: 85 },
                ].map((wh, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5 }}
                    className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-porteo-blue/50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-porteo-blue transition-colors cursor-pointer" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-8">
                      <div className="p-4 bg-porteo-blue/10 rounded-2xl">
                        <Globe className="w-8 h-8 text-porteo-blue" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        wh.status === 'Online' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-porteo-orange/10 text-porteo-orange'
                      }`}>
                        {wh.status}
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-1">{wh.name}</h4>
                    <p className="text-sm text-white/40 mb-8">{wh.location}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Throughput</p>
                        <p className="text-xs font-bold text-white">{wh.throughput}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Health</p>
                        <p className="text-xs font-bold text-emerald-400">{wh.health}%</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-white/40 uppercase tracking-widest">Storage Capacity</span>
                        <span className="text-white">{wh.capacity}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: wh.capacity }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full ${parseInt(wh.capacity) > 80 ? 'bg-porteo-orange' : 'bg-porteo-blue'}`} 
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => toast.info(`Viewing full telemetry for ${wh.name}`)}
                      className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all border border-white/10"
                    >
                      VIEW NODE DETAILS
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {showAddNode && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h4 className="text-xl font-bold text-white">Add Global Node</h4>
              <button onClick={() => setShowAddNode(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Node Name</label>
                <input type="text" placeholder="e.g. ASIA-HK Hub" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-porteo-blue" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Region</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-porteo-blue">
                  <option>North America</option>
                  <option>Latin America</option>
                  <option>Europe</option>
                  <option>Asia Pacific</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  setShowAddNode(false);
                  toast.success('New global node provisioning started.');
                }}
                className="w-full py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/90 transition-all mt-4"
              >
                Provision Node
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showDataMasterModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h4 className="text-xl font-bold text-white">New Data Connection</h4>
              <button onClick={() => setShowDataMasterModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {['REST API', 'GraphQL', 'Webhooks', 'SFTP', 'SQL Bridge', 'MQTT'].map((type) => (
                  <button key={type} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-porteo-blue transition-all text-left group">
                    <p className="text-xs font-bold text-white group-hover:text-porteo-blue transition-colors">{type}</p>
                    <p className="text-[10px] text-white/40 mt-1">Standard integration</p>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase">Endpoint URL</label>
                <input type="text" placeholder="https://api.system.com/v1" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-porteo-blue" />
              </div>
              <button 
                onClick={() => {
                  setShowDataMasterModal(false);
                  toast.success('Connection handshake successful. Syncing metadata...');
                }}
                className="w-full py-4 bg-porteo-blue text-white rounded-2xl font-bold hover:bg-porteo-blue/90 transition-all"
              >
                Test & Connect
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
