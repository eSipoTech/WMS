import React from 'react';
import { useAuthStore } from '../store';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Cpu, 
  DollarSign, 
  ChevronRight,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wms', label: 'WMS (Logistics)', icon: Package },
    { id: 'crm', label: 'CRM (B2B)', icon: Users },
    { id: 'fleet', label: 'Fleet Mgmt', icon: Truck },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'ai', label: 'AI Platform', icon: Cpu },
    { id: 'chat', label: 'Internal Chat', icon: MessageSquare },
    { id: 'admin', label: 'Admin Panel', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => !item.roles || item.roles.includes(user?.role || ''));

  return (
    <div className="w-72 h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="p-3 bg-porteo-blue/20 rounded-xl">
          <ShieldCheck className="w-8 h-8 text-porteo-blue" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Porteo</h2>
          <p className="text-xs text-white/40 uppercase tracking-widest">Core MVP</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                isActive 
                  ? 'bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-porteo-blue group-hover:scale-110 transition-transform'}`} />
                <span className="font-semibold">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-porteo-blue to-porteo-orange p-[1px]">
            <div className="w-full h-full rounded-[11px] bg-[#0a0a0a] flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.[0]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-white/40 hover:text-porteo-orange transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-2 py-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white/60">Node: MX-CDMX</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase">Online</span>
        </div>
      </div>
    </div>
  );
};
