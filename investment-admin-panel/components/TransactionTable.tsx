import React, { useState } from 'react';
import { Transaction } from '../types';
import { Check, X, FileText, ExternalLink } from 'lucide-react';
import { MaskedData } from './ui/MaskedData';

interface TransactionTableProps {
  title: string;
  transactions: Transaction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  title, 
  transactions, 
  onApprove, 
  onReject 
}) => {
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-display font-semibold text-lg text-navy-900">{title}</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {transactions.length} items
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-medium">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method / Account</th>
              <th className="px-6 py-4">TxID</th>
              <th className="px-6 py-4 text-center">Proof</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No pending transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={tx.user.avatar} 
                        alt={tx.user.name} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-sm font-medium text-navy-900">{tx.user.name}</div>
                        <div className="text-xs text-slate-500">{tx.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-navy-900">
                    <span className={tx.type === 'deposit' ? 'text-emerald-500' : 'text-rose-600'}>
                      {tx.type === 'deposit' ? '+' : '-'}
                    </span>
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-navy-900">{tx.method}</div>
                    {tx.accountNumber && (
                      <MaskedData data={tx.accountNumber} className="text-xs text-slate-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    <MaskedData data={tx.transactionId} visibleCount={6} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {tx.proofUrl ? (
                      <button 
                        onClick={() => setSelectedProof(tx.proofUrl || null)}
                        className="p-2 text-slate-400 hover:text-navy-900 transition-colors"
                        title="View Proof"
                      >
                        <FileText size={18} />
                      </button>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onApprove(tx.id)}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100 hover:shadow-md"
                        title="Approve"
                      >
                        <Check size={20} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => onReject(tx.id)}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100 hover:shadow-md"
                        title="Reject"
                      >
                        <X size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Image Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-navy-900">Transaction Proof</h3>
              <button onClick={() => setSelectedProof(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 bg-slate-100 flex justify-center">
               <img src={selectedProof} alt="Proof" className="max-w-full rounded shadow-sm object-contain" />
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
               <a 
                 href={selectedProof} 
                 target="_blank" 
                 rel="noreferrer" 
                 className="flex items-center gap-2 text-sm text-navy-900 hover:underline"
               >
                 <ExternalLink size={14} /> Open Original
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};