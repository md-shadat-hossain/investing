'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function WalletStats() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // TODO: Replace with actual API call - GET /api/v1/wallet/stats
  const stats = {
    currentBalance: 12450.00,
    totalDeposits: 25000.00,
    totalWithdrawals: 8500.00,
    totalInvested: 15000.00,
    totalProfit: 3450.00,
    thisMonthIncome: 2850.00,
    thisMonthExpense: 1200.00,
    lastMonthIncome: 2100.00,
    lastMonthExpense: 950.00,
  }

  const balanceTrend = [
    { date: 'Jan 29', balance: 10500 },
    { date: 'Jan 30', balance: 10850 },
    { date: 'Jan 31', balance: 11200 },
    { date: 'Feb 1', balance: 11650 },
    { date: 'Feb 2', balance: 11900 },
    { date: 'Feb 3', balance: 12200 },
    { date: 'Feb 4', balance: 12350 },
    { date: 'Feb 5', balance: 12450 },
  ]

  const incomeExpense = [
    { month: 'Oct', income: 1800, expense: 850 },
    { month: 'Nov', income: 2200, expense: 900 },
    { month: 'Dec', income: 2100, expense: 950 },
    { month: 'Jan', income: 2850, expense: 1200 },
  ]

  const transactionTypes = [
    { name: 'Deposits', value: 45, color: '#10B981' },
    { name: 'Withdrawals', value: 20, color: '#EF4444' },
    { name: 'Profits', value: 25, color: '#3B82F6' },
    { name: 'Commissions', value: 10, color: '#F59E0B' },
  ]

  const monthlyBreakdown = [
    { category: 'Deposits', amount: 5000, percentage: 50 },
    { category: 'Profit Earned', amount: 2850, percentage: 28.5 },
    { category: 'Referral Commissions', amount: 1150, percentage: 11.5 },
    { category: 'Bonuses', amount: 1000, percentage: 10 },
  ]

  const incomeChange = ((stats.thisMonthIncome - stats.lastMonthIncome) / stats.lastMonthIncome * 100).toFixed(1)
  const expenseChange = ((stats.thisMonthExpense - stats.lastMonthExpense) / stats.lastMonthExpense * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Statistics</h1>
          <p className="text-slate-400 text-sm mt-1">Complete financial analytics and insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Current Balance</p>
            <Wallet className="text-gold-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${stats.currentBalance.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">Available funds</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Deposits</p>
            <ArrowDownLeft className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${stats.totalDeposits.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">All-time deposits</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Withdrawals</p>
            <ArrowUpRight className="text-rose-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${stats.totalWithdrawals.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">All-time withdrawals</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Profit</p>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${stats.totalProfit.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">Lifetime earnings</p>
        </div>
      </div>

      {/* Balance Trend Chart */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Balance Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceTrend}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px' }} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#F59E0B"
                strokeWidth={3}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income vs Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Income vs Expense</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Transaction Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transactionTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {transactionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">This Month Performance</h3>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-emerald-400 text-sm">Total Income</p>
                <TrendingUp className="text-emerald-500" size={18} />
              </div>
              <p className="text-2xl font-bold text-white">${stats.thisMonthIncome.toLocaleString()}</p>
              <p className="text-xs text-emerald-400 mt-1">
                +{incomeChange}% vs last month
              </p>
            </div>

            <div className="p-4 bg-rose-500/5 border border-rose-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-rose-400 text-sm">Total Expense</p>
                <TrendingDown className="text-rose-500" size={18} />
              </div>
              <p className="text-2xl font-bold text-white">${stats.thisMonthExpense.toLocaleString()}</p>
              <p className="text-xs text-rose-400 mt-1">
                +{expenseChange}% vs last month
              </p>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-400 text-sm">Net Flow</p>
                <DollarSign className="text-blue-500" size={18} />
              </div>
              <p className="text-2xl font-bold text-white">
                ${(stats.thisMonthIncome - stats.thisMonthExpense).toLocaleString()}
              </p>
              <p className="text-xs text-blue-400 mt-1">
                Income - Expense
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Income Breakdown</h3>
          <div className="space-y-3">
            {monthlyBreakdown.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">{item.category}</span>
                  <span className="text-white font-semibold">${item.amount.toLocaleString()}</span>
                </div>
                <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold-500 to-amber-600 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.percentage}% of total income</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-r from-gold-500/10 to-amber-600/10 border border-gold-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Calendar className="text-gold-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-white font-semibold mb-2">Financial Health Score</h3>
            <p className="text-slate-300 text-sm mb-4">
              Your wallet is in great shape! You're maintaining a positive income-to-expense ratio and growing your balance consistently.
            </p>
            <div className="flex gap-4">
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <p className="text-xs text-slate-400">Balance Growth</p>
                <p className="text-emerald-400 font-bold">+18.6%</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <p className="text-xs text-slate-400">Income/Expense Ratio</p>
                <p className="text-blue-400 font-bold">2.38x</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <p className="text-xs text-slate-400">Health Score</p>
                <p className="text-gold-500 font-bold">8.5/10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
