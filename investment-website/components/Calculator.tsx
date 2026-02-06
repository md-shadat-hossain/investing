'use client'

import React, { useState } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';

const Calculator = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [days, setDays] = useState<number>(30);
  const roiPerDay = 1.5; // Example 1.5% daily

  const totalReturn = Math.floor(amount + (amount * (roiPerDay / 100) * days));
  const profit = totalReturn - amount;

  return (
    <section id="calculator" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <CalcIcon className="text-gold-500 w-8 h-8" />
            <h2 className="text-3xl font-serif font-bold text-white">Profit Calculator</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Amount Slider */}
              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-slate-400 font-medium">Investment Amount</label>
                  <span className="text-gold-500 font-bold text-xl">${amount}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="50000"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                  <span>$50</span>
                  <span>$50,000</span>
                </div>
              </div>

              {/* Days Slider */}
              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-slate-400 font-medium">Duration (Days)</label>
                  <span className="text-gold-500 font-bold text-xl">{days} Days</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="365"
                  step="1"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                  <span>7 Days</span>
                  <span>365 Days</span>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-center space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Return</p>
                <p className="text-4xl font-bold text-white">${totalReturn.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Net Profit</p>
                <p className="text-3xl font-bold text-green-500">+${profit.toLocaleString()}</p>
              </div>
              <p className="text-sm text-slate-500 italic border-t border-slate-800 pt-4">
                &quot;If I invest <span className="text-white">${amount}</span>, I will earn <span className="text-gold-500">${totalReturn}</span> in <span className="text-white">{days}</span> days.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
