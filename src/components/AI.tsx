import React, { useState } from 'react';
import { 
  Cpu, 
  Brain, 
  Activity, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Terminal,
  Code,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const AI: React.FC = () => {
  const [activeModel, setActiveModel] = useState('LOGISTICS_AGENT_V1');

  const models = [
    { id: 'LOGISTICS_AGENT_V1', name: 'Logistics Agent v1', status: 'ACTIVE', accuracy: '94.2%', latency: '120ms', type: 'Decision Engine' },
    { id: 'DEMAND_PRED_V2', name: 'Demand Predictor v2', status: 'TRAINING', accuracy: '89.5%', latency: '450ms', type: 'Forecasting' },
    { id: 'ROUTE_OPT_V3', name: 'Route Optimizer v3', status: 'ACTIVE', accuracy: '97.8%', latency: '85ms', type: 'Optimization' },
  ];

  const logs = [
    { id: '1', agent: 'LOGISTICS_AGENT_V1', decision: 'Rerouted ORD-001 to Warehouse B', context: 'Traffic congestion detected', feedback: 5, time: '2 mins ago' },
    { id: '2', agent: 'ROUTE_OPT_V3', decision: 'Optimized Route for Unit MX-123', context: 'Fuel savings: 12%', feedback: 4, time: '15 mins ago' },
    { id: '3', agent: 'LOGISTICS_AGENT_V1', decision: 'Flagged SKU-002 for low stock', context: 'Demand spike predicted', feedback: 5, time: '1 hour ago' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">AI Platform</h1>
          <p className="text-white/60 mt-2">Agent Decision Logging & Model Evaluation</p>
        </div>
        <div className="flex gap-4">
          <button className="glass px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10">
            <Terminal className="w-5 h-5 text-porteo-blue" />
            AI Console
          </button>
          <button className="bg-porteo-blue px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20">
            <Zap className="w-5 h-5" />
            Deploy Model
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Active Models</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 glass rounded-lg text-white/40 border border-white/10 hover:text-white transition-colors">
                  <Database className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Model Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Accuracy</th>
                    <th className="px-6 py-4">Latency</th>
                    <th className="px-6 py-4">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {models.map((model) => (
                    <tr key={model.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-porteo-blue/10 flex items-center justify-center text-porteo-blue font-bold">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-bold">{model.name}</p>
                            <p className="text-xs text-white/40 font-mono">{model.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          model.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                        }`}>
                          {model.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-white font-bold">{model.accuracy}</td>
                      <td className="px-6 py-5 text-white/60 font-medium">{model.latency}</td>
                      <td className="px-6 py-5 text-white/40 text-sm">{model.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Decision Logs</h3>
            </div>
            <div className="p-6 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-porteo-blue/10 flex items-center justify-center text-porteo-blue font-bold shrink-0">
                    <Code className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-bold">{log.decision}</h4>
                      <span className="text-xs text-white/40 font-mono">{log.time}</span>
                    </div>
                    <p className="text-sm text-white/60">{log.context}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className={`w-3 h-3 rounded-full ${star <= log.feedback ? 'bg-emerald-400' : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Agent: {log.agent}</span>
                    </div>
                  </div>
                  <button className="p-2 text-white/40 hover:text-white transition-colors self-start">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'CPU Usage', value: 42, color: 'bg-porteo-blue' },
                { label: 'Memory Load', value: 65, color: 'bg-porteo-orange' },
                { label: 'API Latency', value: 12, color: 'bg-emerald-400' },
                { label: 'Error Rate', value: 0.2, color: 'bg-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${item.color}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-porteo-blue/5 to-transparent">
            <div className="p-4 bg-porteo-blue/20 rounded-2xl w-fit mb-6">
              <Zap className="w-8 h-8 text-porteo-blue" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Auto-Scaling Active</h3>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              AI Platform has detected a demand spike in MX-CDMX. Automatically provisioned 2 additional worker nodes.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              System Stabilized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
