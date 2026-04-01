import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  Users, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Zap,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', inbound: 40, outbound: 24, fleet: 12 },
  { name: 'Tue', inbound: 30, outbound: 13, fleet: 15 },
  { name: 'Wed', inbound: 20, outbound: 98, fleet: 18 },
  { name: 'Thu', inbound: 27, outbound: 39, fleet: 20 },
  { name: 'Fri', inbound: 18, outbound: 48, fleet: 22 },
  { name: 'Sat', inbound: 23, outbound: 38, fleet: 25 },
  { name: 'Sun', inbound: 34, outbound: 43, fleet: 28 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Enterprise Dashboard</h1>
          <p className="text-white/60 mt-2">Real-time Logistics & Business Intelligence</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 px-4 py-2 bg-porteo-blue text-white rounded-xl shadow-lg shadow-porteo-blue/20">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-bold">Global View</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 text-white/40 hover:text-white/60 transition-colors">
            <span className="text-sm font-bold">MX-CDMX</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 text-white/40 hover:text-white/60 transition-colors">
            <span className="text-sm font-bold">USA-TX</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Inventory', value: '1,240', icon: Package, color: 'text-porteo-blue', bg: 'bg-porteo-blue/10', trend: '+12%' },
          { label: 'Active Fleet', value: '42', icon: Truck, color: 'text-porteo-orange', bg: 'bg-porteo-orange/10', trend: '+5%' },
          { label: 'B2B Leads', value: '18', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+24%' },
          { label: 'AI Efficiency', value: '98.2%', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+1.5%' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-emerald-400 text-xs font-bold">{stat.trend}</span>
            </div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Logistics Performance</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-porteo-blue" />
                <span className="text-xs text-white/60 font-bold">Inbound</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-porteo-orange" />
                <span className="text-xs text-white/60 font-bold">Outbound</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="outbound" stroke="#FF6600" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8">System Alerts</h3>
          <div className="space-y-6 flex-1">
            {[
              { type: 'CRITICAL', msg: 'Low stock on SKU-V8 in USA-TX', time: '2m ago', icon: AlertCircle, color: 'text-porteo-orange' },
              { type: 'INFO', msg: 'Sync with AS/400 completed', time: '15m ago', icon: CheckCircle2, color: 'text-emerald-400' },
              { type: 'WARNING', msg: 'Fleet Unit MX-123 delayed', time: '1h ago', icon: Clock, color: 'text-amber-400' },
              { type: 'AI', msg: 'New optimization route suggested', time: '2h ago', icon: Zap, color: 'text-porteo-blue' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                <div className={`p-2 rounded-lg bg-white/5 ${alert.color}`}>
                  <alert.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${alert.color}`}>{alert.type}</span>
                    <span className="text-[10px] text-white/20 font-bold">{alert.time}</span>
                  </div>
                  <p className="text-sm text-white/80 font-medium truncate">{alert.msg}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};
