import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Terminal, Cpu, TrendingUp, ShieldAlert, Paperclip, Warehouse, Sparkles } from 'lucide-react';
import { getAIAssistance, getOperationalAdvice, getPredictiveDiscrepancy } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  role: 'Control Tower' | 'Supply Chain Director' | 'COO Assistant' | 'Assembly Expert' | 'Warehouse Director';
  lang: 'en' | 'es';
  context: string;
  onFileUpload?: (file: File) => void;
}

export const AIAssistant = ({ role, lang, context, onFileUpload }: AIAssistantProps) => {
  const language = lang; // Alias for backward compatibility
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ label: string, type: 'bottleneck' | 'inventory' }[]>([]);

  const handleSend = async (overrideInput?: string) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim()) return;
    
    const userMsg = messageToSend;
    if (!overrideInput) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    setSuggestions([]); // Clear suggestions on send

    try {
      const response = await getAIAssistance(role, userMsg, context, language);
      setMessages(prev => [...prev, { role: 'ai', text: response || 'Error' }]);
      
      // Check for new suggestions after AI response
      if (role === 'Assembly Expert') {
        const fullHistory = [...messages, { role: 'user', text: userMsg }, { role: 'ai', text: response }].map(m => m.text).join(' ').toLowerCase();
        const newSuggestions: { label: string, type: 'bottleneck' | 'inventory' }[] = [];
        
        if (fullHistory.includes('bottleneck') || fullHistory.includes('cuello de botella') || fullHistory.includes('efficiency') || fullHistory.includes('slow')) {
          newSuggestions.push({ 
            label: language === 'en' ? 'Optimize Assembly Flow' : 'Optimizar Flujo de Ensamblaje',
            type: 'bottleneck'
          });
        }
        
        if (fullHistory.includes('low inventory') || fullHistory.includes('bajo inventario') || fullHistory.includes('stock') || fullHistory.includes('discrepancy') || fullHistory.includes('missing')) {
          newSuggestions.push({ 
            label: language === 'en' ? 'Run Inventory Audit' : 'Ejecutar Auditoría de Inventario',
            type: 'inventory'
          });
        }
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (type: 'bottleneck' | 'inventory') => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      let response = '';
      if (type === 'bottleneck') {
        response = await getOperationalAdvice('Assembly Line', context) || '';
      } else {
        response = await getPredictiveDiscrepancy(context, language) || '';
      }
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error executing suggestion.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls,.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file && onFileUpload) {
        onFileUpload(file);
        setMessages(prev => [...prev, { 
          role: 'user', 
          text: language === 'en' ? `Uploaded file: ${file.name}` : `Archivo cargado: ${file.name}` 
        }]);
        
        // Simulate AI response to file upload
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: language === 'en' 
              ? `I've received **${file.name}**. I'm analyzing the data to optimize your warehouse layout and inventory. One moment...` 
              : `He recibido **${file.name}**. Estoy analizando los datos para optimizar el diseño de su almacén e inventario. Un momento...` 
          }]);
        }, 1000);
      }
    };
    input.click();
  };

  const getIcon = () => {
    switch(role) {
      case 'Control Tower': return <Terminal className="w-5 h-5" />;
      case 'Supply Chain Director': return <TrendingUp className="w-5 h-5" />;
      case 'COO Assistant': return <ShieldAlert className="w-5 h-5" />;
      case 'Assembly Expert': return <Cpu className="w-5 h-5" />;
      case 'Warehouse Director': return <Warehouse className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-96 h-[500px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-bottom border-white/10 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-porteo-orange/20 rounded-lg text-porteo-orange">
                  {getIcon()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{role}</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">AI Agent v4.0</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <Bot className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">
                    {language === 'en' ? `Hello, I am your ${role}. How can I help you today?` : `Hola, soy tu ${role}. ¿Cómo puedo ayudarte hoy?`}
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-porteo-blue text-white' : 'bg-white/5 text-white/80 border border-white/10'}`}>
                    <div className="prose prose-invert prose-sm">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestions.map((s, i) => (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={i}
                      onClick={() => handleSuggestionClick(s.type)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-porteo-orange/10 border border-porteo-orange/30 rounded-full text-[10px] font-bold text-porteo-orange hover:bg-porteo-orange/20 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="relative flex items-center gap-2">
                <button
                  onClick={handleFileClick}
                  className="p-2 bg-white/5 text-white/40 hover:text-white rounded-xl border border-white/10 transition-colors"
                  title={language === 'en' ? "Upload data for AI analysis" : "Cargar datos para análisis de IA"}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={language === 'en' ? "Type a message..." : "Escribe un mensaje..."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-12 text-white text-sm focus:outline-none focus:border-porteo-orange/50 transition-colors"
                  />
                  <button
                    onClick={() => handleSend()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-porteo-orange text-white rounded-lg hover:bg-porteo-orange/80 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-porteo-blue text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl border border-white/10"
            >
              {role}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-porteo-blue text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95 border border-white/20 ai-assistant-button"
        >
          <Bot className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
