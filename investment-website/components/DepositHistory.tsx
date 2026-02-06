'use client'

import React from 'react';
import { ArrowDownLeft, Search, Filter } from 'lucide-react';

const DepositHistory = () => {
  const deposits = [
    { id: 'DEP-93821', date: 'Oct 24, 2023, 10:42 AM', method: 'Bitcoin', amount: 2500, status: 'Completed', txHash: '8x92...321a' },
    { id: 'DEP-93820', date: 'Oct 20, 2023, 08:15 PM', method: 'USDT (TRC20)', amount: 500, status: 'Completed', txHash: 'Tj92...992x' },
    { id: 'DEP-93819', date: 'Oct 15, 2023, 02:30 PM', method: 'Bank Transfer', amount: 10000, status: 'Pending', txHash: '-' },
    { id: 'DEP-93818', date: 'Oct 10, 2023, 09:00 AM', method: 'Ethereum', amount: 1200, status: 'Rejected', txHash: '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Deposit History</h2>
          <p className="text-slate-400 text-sm">Track all your funding transactions</p>
        </div>
        <div className="flex space-x-2">
           <div className="relative">
             <input type="text" placeholder="Search ID..." className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold-500" />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
           </div>
           <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white">
             <Filter size={20} />
           </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Gateway</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {deposits.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">
                    <div className="flex items-center">
                      <div className="bg-green-500/10 p-1.5 rounded-full mr-3 text-green-500">
                        <ArrowDownLeft size={14} />
                      </div>
                      {tx.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{tx.method}</td>
                  <td className="px-6 py-4 text-slate-400">{tx.date}</td>
                  <td className="px-6 py-4 font-bold text-white">
                    +${tx.amount.toLocaleString()}
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
                  <td className="px-6 py-4 text-right">
                    <button className="text-gold-500 hover:text-gold-400 text-xs font-medium border border-gold-500/20 px-3 py-1 rounded hover:bg-gold-500/10 transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Mock */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-500">
          <span>Showing 4 of 24 transactions</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositHistory;