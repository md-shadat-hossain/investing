'use client'

import React from 'react';
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';
import { Transaction } from '@/types';

// Simple Sparkline Component
const Sparkline = ({ data, color = "white" }: { data: number[], color?: string }) => {
  const width = 100;
  const height = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 -4 ${width} ${height + 8}`} className="overflow-visible">
       <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        className="opacity-90"
      />
    </svg>
  );
};

const DashboardHome = () => {
  const transactions: Transaction[] = [
    { id: 'TXN-99381', type: 'Deposit', amount: 2500, date: 'Oct 24, 2023', status: 'Completed' },
    { id: 'TXN-99382', type: 'Investment', amount: 1000, date: 'Oct 22, 2023', status: 'Completed' },
    { id: 'TXN-99383', type: 'Profit', amount: 45, date: 'Oct 21, 2023', status: 'Completed' },
    { id: 'TXN-99384', type: 'Withdraw', amount: 200, date: 'Oct 20, 2023', status: 'Pending' },
    { id: 'TXN-99385', type: 'Profit', amount: 45, date: 'Oct 19, 2023', status: 'Completed' },
  ];

  // Mock data for the last 7 days
  const balanceTrend = [11800, 11950, 11900, 12100, 12250, 12300, 12450];

  return (
    <div className="space-y-8">
      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={64} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-200 font-medium mb-1">Available Balance</p>
            <h3 className="text-3xl font-bold mb-4">$12,450.00</h3>
            <div className="flex justify-between items-end">
              <div className="flex items-center text-xs bg-indigo-500/30 px-2 py-1 rounded-md backdrop-blur-sm">
                <TrendingUp size={12} className="mr-1" />
                +2.5% this week
              </div>
              <div className="w-24 h-8">
                <Sparkline data={balanceTrend} />
              </div>
            </div>
          </div>
        </div>

        {/* Total Deposit */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ArrowDownLeft size={64} className="text-green-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Total Deposit</p>
          <h3 className="text-3xl font-bold mb-4 text-green-400">$25,000.00</h3>
          <div className="h-1 w-full bg-slate-700 rounded-full mt-2">
            <div className="h-1 bg-green-500 rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Total Withdraw */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <ArrowUpRight size={64} className="text-red-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Total Withdraw</p>
          <h3 className="text-3xl font-bold mb-4 text-red-400">$4,200.00</h3>
          <div className="h-1 w-full bg-slate-700 rounded-full mt-2">
            <div className="h-1 bg-red-500 rounded-full w-1/4"></div>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-gradient-to-br from-gold-500 to-amber-600 rounded-2xl p-6 text-slate-950 shadow-xl shadow-gold-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <DollarSign size={64} />
          </div>
          <p className="text-slate-900/70 font-bold mb-1">Total Profit</p>
          <h3 className="text-3xl font-extrabold mb-4">$3,650.00</h3>
          <div className="flex items-center text-xs bg-black/10 w-fit px-2 py-1 rounded-md font-bold">
            All time earnings
          </div>
        </div>
      </div>

      {/* Row 2: Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/deposit" className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white p-6 rounded-2xl shadow-lg shadow-green-500/10 transition-all transform hover:-translate-y-1">
          <div className="bg-white/20 p-3 rounded-full">
            <ArrowDownLeft size={28} />
          </div>
          <div className="text-left">
            <span className="block text-2xl font-bold">Deposit Now</span>
            <span className="text-green-100 text-sm">Add funds securely</span>
          </div>
        </Link>

        <Link href="/dashboard/withdraw" className="flex items-center justify-center space-x-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white p-6 rounded-2xl shadow-lg shadow-red-500/10 transition-all transform hover:-translate-y-1">
          <div className="bg-white/20 p-3 rounded-full">
            <ArrowUpRight size={28} />
          </div>
          <div className="text-left">
            <span className="block text-2xl font-bold">Withdraw</span>
            <span className="text-red-100 text-sm">Request payouts instantly</span>
          </div>
        </Link>
      </div>

      {/* Row 3: Recent Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <Link href="/dashboard/transactions" className="text-gold-500 text-sm hover:underline font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">{tx.id}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center font-medium ${
                      tx.type === 'Deposit' ? 'text-green-400' :
                      tx.type === 'Withdraw' ? 'text-red-400' :
                      tx.type === 'Profit' ? 'text-gold-500' : 'text-blue-400'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{tx.date}</td>
                  <td className={`px-6 py-4 font-bold ${
                     tx.type === 'Withdraw' ? 'text-red-400' : 'text-white'
                  }`}>
                    {tx.type === 'Withdraw' ? '-' : '+'}${tx.amount.toLocaleString()}
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
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
