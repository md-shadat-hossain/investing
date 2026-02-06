'use client'

import React, { useState } from 'react';
import { Wallet, AlertCircle, ArrowUpRight } from 'lucide-react';

const WithdrawRequest = () => {
  const [method, setMethod] = useState('btc');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  
  const balance = 12450.00; // Mock balance

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
        <span className="text-slate-400 text-sm">Request a secure payout to your wallet</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-xl">
            
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-lg p-6 mb-8 flex items-center justify-between text-white shadow-lg">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Available for Withdrawal</p>
                <h3 className="text-3xl font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet size={32} />
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Withdraw Method</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                >
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="usdt">Tether (USDT TRC20)</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Withdraw Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => setAmount(balance.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-gold-500 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    MAX
                  </button>
                </div>
                {parseFloat(amount) > balance && (
                   <p className="text-red-500 text-xs mt-2 flex items-center">
                     <AlertCircle size={12} className="mr-1" />
                     Insufficient balance
                   </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {method === 'bank' ? 'Bank Account Details' : 'Wallet Address'}
                </label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={method === 'bank' ? 'Account Number / Routing / Swift' : 'e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors font-mono"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="button"
                  className="w-full bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-bold py-4 px-4 rounded-lg shadow-lg shadow-gold-500/20 transform hover:-translate-y-1 transition-all flex items-center justify-center"
                >
                  Submit Request
                  <ArrowUpRight size={18} className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h4 className="text-white font-bold mb-4">Important Information</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Withdrawals are processed within 24 hours.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Minimum withdrawal amount is $10.00.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Ensure your wallet address is correct. We are not responsible for funds sent to wrong addresses.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                A 2% fee applies to bank transfers. Crypto withdrawals are free.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawRequest;