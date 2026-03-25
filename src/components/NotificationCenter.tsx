import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Info, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { WMSNotification, Language } from '../types';
import { MOCK_NOTIFICATIONS } from '../constants';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  notifications: WMSNotification[];
  onAction?: (action: string) => void;
  addNotification: (message: string, type?: 'operational' | 'alert' | 'success' | 'info') => void;
}

export const NotificationCenter = ({ isOpen, onClose, lang, notifications, onAction, addNotification }: NotificationCenterProps) => {
  const language = lang; // Alias for backward compatibility
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-[#0A0A0A] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-porteo-orange" />
                <h2 className="text-lg font-bold text-white">
                  {language === 'en' ? 'Notification Center' : 'Centro de Notificaciones'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/20 space-y-4">
                  <Bell className="w-12 h-12" />
                  <p className="text-sm font-medium">
                    {language === 'en' ? 'No new notifications' : 'Sin notificaciones nuevas'}
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-5 rounded-2xl border transition-all ${n.read ? 'bg-white/5 border-white/10' : 'bg-porteo-blue/10 border-porteo-blue/30 ring-1 ring-porteo-blue/20'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg ${n.type === 'market' ? 'bg-porteo-blue/20 text-porteo-blue' : 'bg-porteo-orange/20 text-porteo-orange'}`}>
                        {n.type === 'market' ? <Zap className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{n.timestamp}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{n.title[language]}</h3>
                    <p className="text-xs text-white/60 leading-relaxed mb-4">{n.description[language]}</p>
                    {n.actionLabel && (
                      <button 
                        onClick={() => {
                          if (onAction) {
                            onAction(n.actionLabel?.en || '');
                          } else {
                            addNotification(language === 'en' ? `Action triggered: ${n.actionLabel?.en}` : `Acción activada: ${n.actionLabel?.es}`, 'info');
                          }
                        }}
                        className="w-full py-2 bg-porteo-orange text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-porteo-orange/80 transition-all flex items-center justify-center gap-2"
                      >
                        {n.actionLabel[language]}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20">
              <button className="w-full py-3 text-sm font-bold text-white/40 hover:text-white transition-colors">
                {language === 'en' ? 'Mark all as read' : 'Marcar todo como leído'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
