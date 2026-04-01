import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore, useChatStore } from '../store';
import { 
  MessageSquare, 
  Send, 
  User, 
  Users, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('receive_message', (msg) => {
      addMessage(msg);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const msg = {
      content: input,
      senderName: user.name,
      senderId: user.id,
      createdAt: new Date().toISOString(),
    };

    socketRef.current?.emit('send_message', msg);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-8">
      <div className="w-80 glass rounded-3xl border border-white/10 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue/50"
            />
          </div>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
            <button className="flex-1 py-2 bg-white/10 text-white text-xs font-bold rounded-lg shadow-inner">Direct</button>
            <button className="flex-1 py-2 text-white/40 text-xs font-bold rounded-lg hover:text-white/60">Groups</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {[
            { name: 'General Logistics', msg: 'New shipment arrived...', time: '2m', active: true },
            { name: 'Admin Alerts', msg: 'System audit complete', time: '15m' },
            { name: 'Warehouse MX-1', msg: 'Picking wave 45 released', time: '1h' },
            { name: 'Fleet Support', msg: 'Unit MX-123 on route', time: '2h' },
          ].map((chat, i) => (
            <button 
              key={i} 
              className={`w-full p-4 rounded-2xl flex gap-4 items-center transition-all ${
                chat.active ? 'bg-porteo-blue text-white shadow-lg shadow-porteo-blue/20' : 'hover:bg-white/5 text-white/60'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                chat.active ? 'bg-white/20' : 'bg-white/5'
              }`}>
                {chat.name[0]}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold truncate">{chat.name}</span>
                  <span className="text-[10px] opacity-60">{chat.time}</span>
                </div>
                <p className="text-xs truncate opacity-60">{chat.msg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 glass rounded-3xl border border-white/10 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-porteo-blue/20 flex items-center justify-center text-porteo-blue font-bold text-xl">
              G
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">General Logistics</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">12 Members Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 glass rounded-xl text-white/40 hover:text-white border border-white/10"><Users className="w-5 h-5" /></button>
            <button className="p-3 glass rounded-xl text-white/40 hover:text-white border border-white/10"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.senderName === user?.name;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    isMe ? 'bg-porteo-orange/20 text-porteo-orange' : 'bg-porteo-blue/20 text-porteo-blue'
                  }`}>
                    {msg.senderName[0]}
                  </div>
                  <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-xs font-bold text-white/40">{msg.senderName}</span>
                      <span className="text-[10px] text-white/20">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isMe 
                        ? 'bg-porteo-blue text-white rounded-tr-none shadow-lg shadow-porteo-blue/20' 
                        : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="p-6 bg-white/5 border-t border-white/5 flex items-center gap-4">
          <button type="button" className="p-3 text-white/40 hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue/50 transition-all"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button 
            type="submit"
            className="p-4 bg-porteo-blue text-white rounded-2xl hover:bg-porteo-blue/90 transition-all shadow-lg shadow-porteo-blue/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
