'use client'

import React from 'react';
import { TrendingUp, AlertCircle, PlayCircle, Loader2, Clock } from 'lucide-react';
import { useGetActiveInvestmentsQuery } from '@/store/api/investmentApi';
import Link from 'next/link';

const MyPlans = () => {
  const { data: investmentsResponse, isLoading, error } = useGetActiveInvestmentsQuery();
  const activePlans = investmentsResponse?.data?.attributes || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysElapsed = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-gold-500 mx-auto mb-4" size={48} />
          <p className="text-slate-400">Loading your investments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="text-rose-400 font-medium">Failed to load investments</p>
          <p className="text-slate-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">My Active Plans</h2>
        <p className="text-slate-400 text-sm">Monitor the progress of your active investments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activePlans.length > 0 ? (
          activePlans.map((investment) => {
             const daysElapsed = calculateDaysElapsed(investment.startDate);
             const duration = calculateDuration(investment.startDate, investment.endDate);
             const progress = calculateProgress(investment.startDate, investment.endDate);
             const currentProfit = investment.earnedProfit;

             return (
              <div key={investment.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-gold-500 to-amber-600 p-2.5 rounded-lg text-slate-950">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{investment.plan.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{investment.transactionId}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border ${
                    investment.status === 'active' && !investment.isPaused
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : investment.isPaused
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {investment.status === 'active' && !investment.isPaused ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Running</span>
                      </>
                    ) : investment.isPaused ? (
                      <>
                        <Clock size={12} />
                        <span>Paused</span>
                      </>
                    ) : (
                      <span>{investment.status}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Invested Amount</p>
                    <p className="text-lg font-bold text-white">${investment.amount.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Expected Return</p>
                    <p className="text-lg font-bold text-gold-500">${(investment.amount + investment.expectedProfit).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Current Profit</p>
                    <p className="text-lg font-bold text-green-400">+${currentProfit.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Daily Profit</p>
                    <p className="text-lg font-bold text-blue-400">${investment.dailyProfitAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ROI: {investment.plan.roi}% {investment.plan.roiType}</span>
                    <span className="text-slate-400">Duration: {investment.plan.duration} {investment.plan.durationType}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center">
                      <PlayCircle size={12} className="mr-1" />
                      Started: {formatDate(investment.startDate)}
                    </span>
                    <span className="text-gold-500 font-medium">Ends: {formatDate(investment.endDate)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-gold-500 font-medium">{investment.totalProfitDistributions} distributions</span>
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

                {investment.lastProfitDate && (
                  <div className="mt-4 text-xs text-slate-500">
                    Last profit: {formatDate(investment.lastProfitDate)}
                  </div>
                )}
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
             <Link href="/dashboard/plans/invest" className="inline-block bg-gold-500 text-slate-950 px-6 py-2 rounded-lg font-bold hover:bg-gold-600 transition-colors">
               Start Investing
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlans;
