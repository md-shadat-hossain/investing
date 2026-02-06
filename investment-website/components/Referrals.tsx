'use client'

import React, { useState } from 'react';
import { Users, DollarSign, Copy, Share2, CheckCheck, TrendingUp } from 'lucide-react';

const Referrals = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://wealthflow.com/register?ref=johndoe";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referrals = [
    { id: 1, user: 'Sarah Jenkins', date: 'Oct 24, 2023', status: 'Active', earnings: 125.50, tier: 'Level 1' },
    { id: 2, user: 'Mike Ross', date: 'Oct 22, 2023', status: 'Active', earnings: 45.00, tier: 'Level 1' },
    { id: 3, user: 'David Lewis', date: 'Oct 20, 2023', status: 'Inactive', earnings: 0.00, tier: 'Level 1' },
    { id: 4, user: 'Emma Watson', date: 'Oct 18, 2023', status: 'Active', earnings: 85.20, tier: 'Level 2' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Referral Program</h2>
          <p className="text-slate-400 text-sm">Invite friends and earn a commission on every deposit they make.</p>
        </div>
        <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/20 px-4 py-2 rounded-lg text-gold-500">
           <TrendingUp size={18} />
           <span className="font-bold text-sm">Top Earner this week: $1,250.00</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign size={64} className="text-gold-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Total Earnings</p>
          <h3 className="text-3xl font-bold text-white">$255.70</h3>
          <p className="text-xs text-green-500 mt-2 flex items-center bg-green-500/10 w-fit px-2 py-0.5 rounded">
             +12% from last month
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={64} className="text-blue-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Total Referrals</p>
          <h3 className="text-3xl font-bold text-white">14</h3>
          <p className="text-xs text-slate-500 mt-2">
             4 Active users currently investing
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Share2 size={64} className="text-purple-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1">Commission Rate</p>
          <h3 className="text-3xl font-bold text-white">5%</h3>
          <p className="text-xs text-slate-500 mt-2">
             Standard Level 1 Bonus
          </p>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 relative overflow-hidden">
         {/* Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
         
         <div className="relative z-10 text-center md:text-left md:flex items-center justify-between gap-8">
            <div className="mb-6 md:mb-0">
                <h3 className="text-xl font-bold text-white mb-2">Your Unique Referral Link</h3>
                <p className="text-slate-400 text-sm max-w-md">
                    Share this link with your network. You'll receive rewards instantly when they make their first deposit.
                </p>
            </div>
            <div className="flex-1 max-w-lg w-full">
                <div className="relative flex items-center shadow-lg">
                <input 
                    type="text" 
                    readOnly 
                    value={referralLink}
                    className="w-full bg-slate-950 border border-slate-600 rounded-lg py-3.5 pl-4 pr-32 text-slate-300 focus:outline-none focus:border-gold-500 transition-colors font-mono text-sm"
                />
                <button 
                    onClick={handleCopy}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold px-4 rounded-md transition-colors flex items-center shadow-md"
                >
                    {copied ? <CheckCheck size={16} className="mr-1.5" /> : <Copy size={16} className="mr-1.5" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
                </div>
            </div>
         </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Referred Users</h3>
          <button className="text-sm text-gold-500 hover:text-gold-400 font-medium">Download Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium">Date Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center mr-3 text-xs font-bold text-slate-400 shadow-sm">
                      {ref.user.charAt(0)}
                    </div>
                    {ref.user}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs uppercase font-bold tracking-wide">{ref.tier}</td>
                  <td className="px-6 py-4 text-slate-400">{ref.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit ${
                      ref.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700/50 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${ref.status === 'Active' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gold-500">
                    ${ref.earnings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {/* Pagination Mock */}
         <div className="p-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-500">
          <span>Showing 4 of 14 users</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;