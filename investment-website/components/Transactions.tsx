'use client'

import React, { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign } from 'lucide-react';

const Transactions = () => {
  const [filter, setFilter] = useState('All');

  const transactions = [
    { id: 'TXN-99381', type: 'Deposit', method: 'Bitcoin', amount: 2500, date: 'Oct 24, 2023', status: 'Completed' },
    { id: 'TXN-99382', type: 'Investment', method: 'Premier Plan', amount: 1000, date: 'Oct 22, 2023', status: 'Completed' },
    { id: 'TXN-99383', type: 'Profit', method: 'ROI', amount: 45, date: 'Oct 21, 2023', status: 'Completed' },
    { id: 'TXN-99384', type: 'Withdraw', method: 'Bank Transfer', amount: 200, date: 'Oct 20, 2023', status: 'Pending' },
    { id: 'TXN-99385', type: 'Profit', method: 'ROI', amount: 45, date: 'Oct 19, 2023', status: 'Completed' },
    { id: 'TXN-99386', type: 'Deposit', method: 'USDT', amount: 5000, date: 'Oct 15, 2023', status: 'Completed' },
    { id: 'TXN-99387', type: 'Withdraw', method: 'Ethereum', amount: 1200, date: 'Oct 12, 2023', status: 'Rejected' },
    { id: 'TXN-99388', type: 'Investment', method: 'Starter Plan', amount: 500, date: 'Oct 10, 2023', status: 'Completed' },
  ];

  const filteredTransactions = filter === 'All' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Deposit': return <ArrowDownLeft size={14} className="text-green-500" />;
      case 'Withdraw': return <ArrowUpRight size={14} className="text-red-500" />;
      case 'Investment': return <TrendingUp size={14} className="text-blue-500" />;
      case 'Profit': return <DollarSign size={14} className="text-gold-500" />;
      default: return <DollarSign size={14} className="text-slate-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'Deposit': return 'bg-green-500/10';
      case 'Withdraw': return 'bg-red-500/10';
      case 'Investment': return 'bg-blue-500/10';
      case 'Profit': return 'bg-gold-500/10';
      default: return 'bg-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">All Transactions</h2>
          <p className="text-slate-400 text-sm">View and manage your complete financial history.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <div className="relative">
             <input type="text" placeholder="Search ID..." className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold-500" />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
           </div>
           
           <div className="flex space-x-2">
             {['All', 'Deposit', 'Withdraw', 'Investment', 'Profit'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                    filter === type 
                    ? 'bg-gold-500 text-slate-900 border-gold-500' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {type}
                </button>
             ))}
           </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Details/Method</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">
                    <div className="flex items-center">
                      <div className={`${getIconBg(tx.type)} p-1.5 rounded-full mr-3`}>
                        {getIcon(tx.type)}
                      </div>
                      {tx.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{tx.type}</td>
                  <td className="px-6 py-4 text-slate-400">{tx.method}</td>
                  <td className="px-6 py-4 text-slate-400">{tx.date}</td>
                  <td className={`px-6 py-4 font-bold ${
                     tx.type === 'Withdraw' ? 'text-red-400' : 
                     tx.type === 'Investment' ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {tx.type === 'Withdraw' || tx.type === 'Investment' ? '-' : '+'}${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tx.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                      tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No transactions found for this filter.
            </div>
          )}
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-500">
          <span>Showing {filteredTransactions.length} records</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;