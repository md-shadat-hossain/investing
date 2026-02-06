import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`
      fixed top-5 right-5 z-50 flex items-center p-4 mb-4 rounded-lg shadow-lg border-l-4
      animate-in slide-in-from-right fade-in duration-300
      ${type === 'success' ? 'bg-white border-emerald-500 text-slate-800' : 'bg-white border-rose-600 text-slate-800'}
    `}>
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {type === 'success' ? (
          <CheckCircle className="w-6 h-6 text-emerald-500" />
        ) : (
          <XCircle className="w-6 h-6 text-rose-600" />
        )}
      </div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-slate-100 inline-flex items-center justify-center h-8 w-8 text-slate-500"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};