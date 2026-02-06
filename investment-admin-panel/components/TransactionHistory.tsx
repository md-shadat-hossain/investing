import React, { useState, useMemo } from 'react';
import { Transaction, TransactionStatus } from '../types';
import { MaskedData } from './ui/MaskedData';
import { Search, Filter, Calendar, ChevronDown, X, Check } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-rose-100 text-rose-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        tx.transactionId.toLowerCase().includes(searchLower) ||
        tx.user.email.toLowerCase().includes(searchLower) ||
        tx.user.name.toLowerCase().includes(searchLower) ||
        tx.method.toLowerCase().includes(searchLower);

      // Status
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

      // Date Range
      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && new Date(tx.date) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(tx.date) <= end;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, statusFilter, dateRange]);

  const activeFiltersCount = (statusFilter !== 'all' ? 1 : 0) + (dateRange.start || dateRange.end ? 1 : 0);

  return (
    <div className="min-h-[500px]">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-navy-900">Transaction History</h2>
          <p className="text-slate-500 text-sm">Comprehensive log of all system financial movements.</p>
        </div>
        {(activeFiltersCount > 0 || searchTerm) && (
          <button 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateRange({ start: '', end: '' });
            }}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
          >
            <X size={14} /> Clear All Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-visible">
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
           <div className="relative w-full md:max-w-xs">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search TxID, User, Method..." 
               className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all bg-white" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto relative">
             {/* Status Filter */}
             <div className="relative">
               <button 
                 onClick={() => { setIsStatusOpen(!isStatusOpen); setIsDateOpen(false); }}
                 className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors whitespace-nowrap
                   ${statusFilter !== 'all' ? 'bg-navy-50 border-navy-200 text-navy-900 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                 `}
               >
                 <Filter size={16} className={statusFilter !== 'all' ? 'text-navy-900' : 'text-slate-400'} /> 
                 <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                 <ChevronDown size={14} className="text-slate-400" />
               </button>

               {isStatusOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)}></div>
                   <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-lg border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                     <div className="p-1">
                       {['all', 'approved', 'pending', 'rejected'].map((status) => (
                         <button
                           key={status}
                           onClick={() => { setStatusFilter(status as any); setIsStatusOpen(false); }}
                           className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between
                             ${statusFilter === status ? 'bg-navy-50 text-navy-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}
                           `}
                         >
                           <span className="capitalize">{status === 'all' ? 'All Transactions' : status}</span>
                           {statusFilter === status && <Check size={14} className="text-gold-500" />}
                         </button>
                       ))}
                     </div>
                   </div>
                 </>
               )}
             </div>

             {/* Date Filter */}
             <div className="relative">
               <button 
                 onClick={() => { setIsDateOpen(!isDateOpen); setIsStatusOpen(false); }}
                 className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors whitespace-nowrap
                   ${(dateRange.start || dateRange.end) ? 'bg-navy-50 border-navy-200 text-navy-900 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                 `}
               >
                 <Calendar size={16} className={(dateRange.start || dateRange.end) ? 'text-navy-900' : 'text-slate-400'} /> 
                 {(dateRange.start || dateRange.end) ? 'Date Applied' : 'Date Range'}
                 <ChevronDown size={14} className="text-slate-400" />
               </button>

               {isDateOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)}></div>
                   <div className="absolute top-full right-0 mt-2 w-72 bg-white shadow-xl rounded-lg border border-slate-100 z-20 p-4 animate-in fade-in zoom-in-95 duration-100">
                     <div className="space-y-3">
                       <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                         <input 
                           type="date" 
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                           value={dateRange.start}
                           onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                         <input 
                           type="date" 
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                           value={dateRange.end}
                           onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                         />
                       </div>
                       <div className="pt-2 border-t border-slate-100 flex justify-end">
                         <button 
                           onClick={() => { setDateRange({ start: '', end: '' }); setIsDateOpen(false); }}
                           className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1"
                         >
                           Reset Date
                         </button>
                         <button 
                           onClick={() => setIsDateOpen(false)}
                           className="ml-2 bg-navy-900 text-white text-xs px-3 py-1.5 rounded-md hover:bg-navy-800"
                         >
                           Apply
                         </button>
                       </div>
                     </div>
                   </div>
                 </>
               )}
             </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="opacity-20" />
                      <p>No transactions match your filters.</p>
                      <button 
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDateRange({start: '', end: ''}); }}
                        className="text-gold-600 text-sm hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-navy-900">{tx.method}</span>
                        <MaskedData data={tx.transactionId} className="text-xs text-slate-500 font-mono mt-0.5" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm text-navy-900 font-medium">{tx.user.name}</div>
                       <div className="text-xs text-slate-500">{tx.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`font-mono font-medium ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'deposit' ? '+' : '-'} ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Summary */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
           <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
           <div className="flex gap-1">
             <button className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50" disabled>&lt;</button>
             <button className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50" disabled>&gt;</button>
           </div>
        </div>
      </div>
    </div>
  );
};