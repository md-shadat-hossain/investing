'use client'

import React from 'react';
import { Check, Info, TrendingUp } from 'lucide-react';

const InvestPlans = () => {
  const plans = [
    {
      id: 1,
      name: 'Starter',
      roi: 120,
      duration: 7,
      min: 50,
      max: 499,
      features: ['24/7 Support', 'Instant Withdrawals', 'Basic Analytics'],
      isPopular: false
    },
    {
      id: 2,
      name: 'Premier',
      roi: 180,
      duration: 14,
      min: 500,
      max: 4999,
      features: ['Dedicated Manager', 'Compound Interest', 'Advanced Analytics', 'Capital Insurance'],
      isPopular: true
    },
    {
      id: 3,
      name: 'Elite',
      roi: 250,
      duration: 30,
      min: 5000,
      max: 50000,
      features: ['VIP Lounge Access', 'Zero Fees', 'Tax Reports', 'Private Discord'],
      isPopular: false
    }
  ];

  const calculateReturns = (min: number, roi: number, duration: number) => {
    const totalReturn = min * (roi / 100);
    const profit = totalReturn - min;
    const daily = profit / duration;
    return { totalReturn, profit, daily };
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Invest & Earn</h2>
          <p className="text-slate-400 text-sm">Select a plan to start growing your portfolio today.</p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-gold-500 bg-gold-500/10 px-4 py-2 rounded-lg">
          <TrendingUp size={20} />
          <span className="font-bold">Current APY up to 250%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const { totalReturn, profit, daily } = calculateReturns(plan.min, plan.roi, plan.duration);

          return (
            <div 
              key={plan.id}
              className={`relative bg-slate-900 rounded-2xl p-6 border flex flex-col h-full transition-all duration-300 ${
                plan.isPopular 
                  ? 'border-gold-500 shadow-xl shadow-gold-500/10' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-gold-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Recommended
                </div>
              )}

              <h3 className={`text-xl font-bold mb-4 ${plan.isPopular ? 'text-white' : 'text-slate-300'}`}>{plan.name} Plan</h3>
              
              <div className="mb-6 text-center bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                 <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Total Return</span>
                 <span className="text-4xl font-bold text-gold-500">{plan.roi}%</span>
                 <span className="block text-slate-500 text-xs mt-1">after {plan.duration} days</span>
              </div>

              {/* Breakdown */}
              <div className="mb-6 bg-slate-800/30 rounded-lg p-4 border border-slate-800/50">
                 <div className="flex items-center space-x-2 mb-3">
                    <Info size={16} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-200">Profit Calculator</span>
                 </div>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min. Invest</span>
                      <span className="text-white font-medium">${plan.min}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Profit ({plan.duration} days)</span>
                      <span className="text-green-400 font-medium">+${profit.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between border-t border-slate-700/50 pt-2 mt-2">
                      <span className="text-slate-300">Total Return</span>
                      <span className="text-gold-500 font-bold">${totalReturn.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center text-sm text-slate-400">
                    <Check className="w-4 h-4 text-green-500 mr-3 shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                 <div className="text-xs text-center text-slate-500 mb-3">
                    Deposit Range: ${plan.min} - ${plan.max.toLocaleString()}
                 </div>
                 <button className={`w-full py-3.5 rounded-lg font-bold transition-all ${
                   plan.isPopular
                     ? 'bg-gold-500 hover:bg-gold-600 text-slate-950 shadow-lg shadow-gold-500/20'
                     : 'bg-slate-800 hover:bg-slate-700 text-white'
                 }`}>
                   Choose This Plan
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvestPlans;