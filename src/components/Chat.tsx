import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore, useChatStore } from '../store';
import { 
  Send, 
  Users, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile,
  ShieldCheck,
  Circle,
  Hash,
  AtSign,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [selectedChat, setSelectedChat] = useState({ id: 'general', name: 'General Logistics', type: 'group' });
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chats = [
    { id: 'general', name: 'General Logistics', msg: 'New shipment arrived at Dock 4...', time: '2m', type: 'group', online: 12 },
    { id: 'alerts', name: 'Admin Alerts', msg: 'System neural scan complete', time: '15m', type: 'group', online: 4 },
    { id: 'warehouse-mx', name: 'Warehouse MX-Hub', msg: 'Picking wave 45 released', time: '1h', type: 'group', online: 8 },
    { id: 'transport-lead', name: 'Marco (Transport Lead)', msg: 'Ready for cross-docking?', time: '2h', type: 'direct', online: true },
    { id: 'billing-ops', name: 'Elena (Billing)', msg: 'CFDI invoices updated', time: '4h', type: 'direct', online: false },
  ];

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
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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

    // If socket fails, we still add locally for "instant" feel in case of server lag
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', msg);
    } else {
      addMessage({ ...msg, id: `local-${Date.now()}` });
    }
    
    setInput('');
  };

  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar */}
      <div className="w-80 glass rounded-3xl border border-white/10 flex flex-col overflow-hidden bg-black/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
            <div className="w-8 h-8 rounded-lg bg-porteo-blue/10 flex items-center justify-center text-porteo-blue">
              <Users className="w-4 h-4" />
            </div>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-porteo-blue/50 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
            <button className="flex-1 py-2 bg-porteo-blue/20 text-porteo-blue text-[10px] font-bold uppercase tracking-widest rounded-xl">All</button>
            <button className="flex-1 py-2 text-white/40 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:text-white/60">Groups</button>
            <button className="flex-1 py-2 text-white/40 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:text-white/60">Direct</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 custom-scrollbar">
          {filteredChats.map((chat) => (
            <button 
              key={chat.id} 
              onClick={() => setSelectedChat(chat as any)}
              className={`w-full p-4 rounded-2xl flex gap-4 items-center transition-all group ${
                selectedChat.id === chat.id 
                  ? 'bg-porteo-blue text-white shadow-xl shadow-porteo-blue/20' 
                  : 'hover:bg-white/5 text-white/60 border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                  selectedChat.id === chat.id ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  {chat.type === 'group' ? <Hash className="w-5 h-5" /> : chat.name[0]}
                </div>
                {chat.type === 'direct' && (
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${chat.online ? 'bg-emerald-500' : 'bg-white/20'}`} />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold truncate text-sm ${selectedChat.id === chat.id ? 'text-white' : 'text-white/80'}`}>
                    {chat.name}
                  </span>
                  <span className="text-[10px] opacity-40 font-medium">{chat.time}</span>
                </div>
                <p className={`text-xs truncate opacity-40 ${selectedChat.id === chat.id ? 'opacity-80' : ''}`}>
                  {chat.msg}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 glass rounded-3xl border border-white/10 flex flex-col overflow-hidden bg-black/40">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-porteo-blue to-porteo-blue/40 flex items-center justify-center text-white shadow-lg shadow-porteo-blue/20">
              {selectedChat.type === 'group' ? <Hash className="w-7 h-7" /> : <AtSign className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{selectedChat.name}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedChat.type === 'group' || (selectedChat as any).online ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">
                  {selectedChat.type === 'group' ? `${(selectedChat as any).online} Members Online` : (selectedChat as any).online ? 'Online' : 'Offline'}
                </span>
                <span className="text-white/10 mx-2">|</span>
                <span className="text-[10px] text-porteo-blue font-bold uppercase tracking-widest leading-none">Secure Neural Link active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 glass rounded-2xl text-white/40 hover:text-white border border-white/10 hover:bg-white/5 transition-all"><Phone className="w-5 h-5" /></button>
            <button className="p-3 glass rounded-2xl text-white/40 hover:text-white border border-white/10 hover:bg-white/5 transition-all"><Video className="w-5 h-5" /></button>
            <button className="p-3 glass rounded-2xl text-white/40 hover:text-white border border-white/10 hover:bg-white/5 transition-all"><Info className="w-5 h-5" /></button>
            <button className="p-3 glass rounded-2xl text-white/40 hover:text-white border border-white/10 hover:bg-white/5 transition-all"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.senderName === user?.name;
              const showAvatar = i === 0 || messages[i-1].senderName !== msg.senderName;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-opacity ${
                    !showAvatar ? 'opacity-0' : 'opacity-100'
                  } ${
                    isMe ? 'bg-gradient-to-br from-porteo-orange to-porteo-orange/40 text-white' : 'bg-gradient-to-br from-porteo-blue to-porteo-blue/40 text-white'
                  }`}>
                    {msg.senderName[0]}
                  </div>
                  <div className={`max-w-[65%] space-y-1.5 ${isMe ? 'items-end flex flex-col' : ''}`}>
                    {showAvatar && (
                      <div className={`flex items-center gap-2 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[11px] font-bold text-white/40">{msg.senderName}</span>
                        <span className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <div className={`p-4 px-6 rounded-3xl text-[13px] leading-relaxed relative ${
                      isMe 
                        ? 'bg-porteo-blue text-white rounded-tr-none shadow-[0_10px_30px_rgba(59,130,246,0.2)]' 
                        : 'bg-white/5 text-white/80 rounded-tl-none border border-white/10 backdrop-blur-sm'
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

        <div className="p-8 bg-black/40 border-t border-white/5">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-4">
            <button type="button" className="p-4 bg-white/5 text-white/40 hover:text-white rounded-2xl transition-all border border-white/10 hover:bg-white/10"><Paperclip className="w-5 h-5" /></button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message in ${selectedChat.name}...`} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-porteo-blue/50 transition-all placeholder:text-white/10"
              />
              <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-5 bg-porteo-blue text-white rounded-2xl hover:bg-porteo-blue/90 transition-all shadow-xl shadow-porteo-blue/30 disabled:opacity-30 disabled:grayscale"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
