import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Terminal, Cpu, TrendingUp, ShieldAlert, Warehouse, DollarSign, Search, MessageSquare, Briefcase, Scale, Leaf } from 'lucide-react';
import { getAIAssistance } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { AI_AGENTS } from '../constants';

interface IntelligenceAgentsProps {
  lang: 'en' | 'es';
}

export const IntelligenceAgents = ({ lang }: IntelligenceAgentsProps) => {
  const language = lang; // Alias for backward compatibility
  const [selectedAgent, setSelectedAgent] = useState<typeof AI_AGENTS[number]>(AI_AGENTS[0]);
  const [messages, setMessages] = useState<Record<string, { role: 'user' | 'ai', text: string }[]>>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentMessages = messages[selectedAgent.id] || [];

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    
    setMessages(prev => ({
      ...prev,
      [selectedAgent.id]: [...(prev[selectedAgent.id] || []), { role: 'user', text: userMsg }]
    }));
    
    setIsLoading(true);

    try {
      const context = `Role: ${selectedAgent.role}. Intelligence Hub Context.`;
      const response = await getAIAssistance(selectedAgent.role as any, context, userMsg, language);
      
      setMessages(prev => ({
        ...prev,
        [selectedAgent.id]: [...(prev[selectedAgent.id] || []), { role: 'ai', text: response || 'Error' }]
      }));
    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [selectedAgent.id]: [...(prev[selectedAgent.id] || []), { role: 'ai', text: 'Sorry, I encountered an error.' }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch(iconName) {
      case 'Terminal': return <Terminal className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Warehouse': return <Warehouse className={className} />;
      case 'DollarSign': return <DollarSign className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Scale': return <Scale className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      default: return <Bot className={className} />;
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Agents Sidebar */}
      <div className="w-80 glass rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">
            {language === 'en' ? 'Intelligence Hub' : 'Centro de Inteligencia'}
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder={language === 'en' ? 'Search agents...' : 'Buscar agentes...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-porteo-orange/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {AI_AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${
                selectedAgent.id === agent.id 
                  ? 'bg-porteo-blue border-porteo-blue shadow-lg shadow-porteo-blue/20' 
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-2 rounded-xl bg-${agent.color}/20 text-${agent.color}`}>
                {getIcon(agent.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{agent.role}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">AI Expert</p>
              </div>
              {messages[agent.id] && (
                <div className="w-2 h-2 bg-porteo-orange rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-${selectedAgent.color}/20 text-${selectedAgent.color} rounded-2xl`}>
              {getIcon(selectedAgent.icon, "w-6 h-6")}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{selectedAgent.role}</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest">Active Session • Porteo AI v4.0</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white/5 text-white/40 hover:text-white rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className={`p-6 bg-${selectedAgent.color}/10 rounded-full mb-6`}>
                {getIcon(selectedAgent.icon, "w-12 h-12 text-" + selectedAgent.color)}
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                {language === 'en' ? `Consult with ${selectedAgent.role}` : `Consultar con ${selectedAgent.role}`}
              </h4>
              <p className="text-white/40 text-sm leading-relaxed">
                {language === 'en' 
                  ? `Ask me about logistics optimization, financial analysis, or operational strategy. I'm here to provide data-driven insights.`
                  : `Pregúntame sobre optimización logística, análisis financiero o estrategia operativa. Estoy aquí para proporcionar información basada en datos.`}
              </p>
            </div>
          ) : (
            currentMessages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-4 rounded-3xl ${
                  m.role === 'user' 
                    ? 'bg-porteo-blue text-white' 
                    : 'bg-white/5 text-white/80 border border-white/10'
                }`}>
                  <div className="prose prose-invert prose-sm">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="relative flex items-center gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'en' ? `Message ${selectedAgent.role}...` : `Mensaje para ${selectedAgent.role}...`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-white text-sm focus:outline-none focus:border-porteo-orange/50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-porteo-orange text-white rounded-xl hover:bg-porteo-orange/80 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
