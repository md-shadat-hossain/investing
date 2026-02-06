'use client'

import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, DollarSign, TrendingUp, Shield, Mail } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'transaction' | 'security' | 'system' | 'promotion' | 'support';
  status: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ notifications, onClose, onMarkAllRead }) => {
  
  const getIcon = (type: string, status: string) => {
    if (type === 'transaction') return <DollarSign size={18} />;
    if (type === 'security') return <Shield size={18} />;
    if (type === 'promotion') return <TrendingUp size={18} />;
    if (type === 'support') return <Mail size={18} />;
    if (status === 'success') return <CheckCircle2 size={18} />;
    if (status === 'error') return <AlertCircle size={18} />;
    return <Info size={18} />;
  };

  const getColors = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning': return 'bg-gold-500/10 text-gold-500 border-gold-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-full right-0 mt-4 w-[90vw] sm:w-96 z-50 px-4 sm:px-0 max-w-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md">
          <div>
             <h3 className="font-bold text-white">Notifications</h3>
             <p className="text-xs text-slate-400">
               {unreadCount > 0 ? `${unreadCount} unread messages` : 'No new notifications'}
             </p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button 
                onClick={onMarkAllRead}
                className="text-xs text-gold-500 hover:text-gold-400 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="opacity-50" />
              </div>
              <p className="font-medium text-slate-300">All caught up!</p>
              <p className="text-sm">You have no notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 hover:bg-slate-800/50 transition-colors flex gap-4 ${!notif.read ? 'bg-slate-800/30' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getColors(notif.status)}`}>
                    {getIcon(notif.type, notif.status)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm font-bold truncate pr-2 ${!notif.read ? 'text-white' : 'text-slate-400'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap ml-1 shrink-0">{notif.time}</span>
                    </div>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${!notif.read ? 'text-slate-300' : 'text-slate-500'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="shrink-0 pt-2">
                      <div className="w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 text-center">
           <button className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
             View Notification History
           </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsDropdown;