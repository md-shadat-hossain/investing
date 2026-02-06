'use client'

import React from 'react';
import { TrendingUp, AlertCircle, PlayCircle } from 'lucide-react';

const MyPlans = () => {
  const activePlans = [
    {
      id: 'INV-8821',
      planName: 'Premier',
      invested: 1000,
      roi: 180,
      totalReturn: 1800,
      startDate: '2023-10-22',
      endDate: '2023-11-05',
      duration: 14,
      daysElapsed: 2,
      status: 'Active'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">My Active Plans</h2>
        <p className="text-slate-400 text-sm">Monitor the progress of your active investments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activePlans.length > 0 ? (
          activePlans.map((plan) => {
             const progress = (plan.daysElapsed / plan.duration) * 100;
             const currentProfit = ((plan.totalReturn - plan.invested) / plan.duration) * plan.daysElapsed;

             return (
              <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-gold-500 to-amber-600 p-2.5 rounded-lg text-slate-950">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.planName} Plan</h3>
                      <p className="text-xs text-slate-400 font-mono">{plan.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Running</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Invested Amount</p>
                    <p className="text-lg font-bold text-white">${plan.invested.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Expected Return</p>
                    <p className="text-lg font-bold text-gold-500">${plan.totalReturn.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Current Profit</p>
                    <p className="text-lg font-bold text-green-400">+${currentProfit.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Ends On</p>
                    <p className="text-lg font-bold text-slate-200">{new Date(plan.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400 flex items-center">
                      <PlayCircle size={12} className="mr-1" />
                      Started: {new Date(plan.startDate).toLocaleDateString()}
                    </span>
                    <span className="text-gold-500 font-medium">{plan.daysElapsed}/{plan.duration} Days</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gold-500 to-amber-600 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right mt-1">
                     <span className="text-xs text-slate-500">{progress.toFixed(0)}% Completed</span>
                  </div>
                </div>
              </div>
             );
          })
        ) : (
          <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
             <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                <AlertCircle size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No Active Plans</h3>
             <p className="text-slate-400 mb-6">You don't have any active investments at the moment.</p>
             <button className="bg-gold-500 text-slate-950 px-6 py-2 rounded-lg font-bold hover:bg-gold-600 transition-colors">
               Start Investing
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlans;