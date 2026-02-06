'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, TrendingUp, Calendar, Filter, Download, Eye } from 'lucide-react'

interface ProfitDistribution {
  id: string
  investmentId: string
  investmentPlan: string
  amount: number
  date: string
  status: 'paid' | 'pending'
  type: 'daily' | 'monthly' | 'completion'
}

export default function ProfitHistory() {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('all')

  // TODO: Replace with actual API call - GET /api/v1/profits/my-history
  const [profitHistory] = useState<ProfitDistribution[]>([
    {
      id: '1',
      investmentId: 'INV-001',
      investmentPlan: 'Premier Plan',
      amount: 642.86,
      date: '2024-02-05T10:00:00Z',
      status: 'paid',
      type: 'daily',
    },
    {
      id: '2',
      investmentId: 'INV-001',
      investmentPlan: 'Premier Plan',
      amount: 642.86,
      date: '2024-02-04T10:00:00Z',
      status: 'paid',
      type: 'daily',
    },
    {
      id: '3',
      investmentId: 'INV-002',
      investmentPlan: 'Starter Plan',
      amount: 120.00,
      date: '2024-02-04T10:00:00Z',
      status: 'paid',
      type: 'daily',
    },
    {
      id: '4',
      investmentId: 'INV-001',
      investmentPlan: 'Premier Plan',
      amount: 642.86,
      date: '2024-02-03T10:00:00Z',
      status: 'paid',
      type: 'daily',
    },
    {
      id: '5',
      investmentId: 'INV-002',
      investmentPlan: 'Starter Plan',
      amount: 120.00,
      date: '2024-02-03T10:00:00Z',
      status: 'paid',
      type: 'daily',
    },
    {
      id: '6',
      investmentId: 'INV-003',
      investmentPlan: 'Elite Plan',
      amount: 1250.00,
      date: '2024-02-01T10:00:00Z',
      status: 'paid',
      type: 'completion',
    },
    {
      id: '7',
      investmentId: 'INV-001',
      investmentPlan: 'Premier Plan',
      amount: 642.86,
      date: '2024-02-06T10:00:00Z',
      status: 'pending',
      type: 'daily',
    },
  ])

  const stats = {
    totalProfit: profitHistory.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pendingProfit: profitHistory.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    thisMonthProfit: 3418.58,
    distributionCount: profitHistory.filter(p => p.status === 'paid').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeColor = (type: ProfitDistribution['type']) => {
    const colors = {
      daily: 'bg-blue-500/10 text-blue-400',
      monthly: 'bg-emerald-500/10 text-emerald-400',
      completion: 'bg-gold-500/10 text-gold-400',
    }
    return colors[type]
  }

  const filteredHistory = profitHistory.filter(profit => {
    const matchesStatus = filter === 'all' || profit.status === filter

    if (dateFilter === 'all') return matchesStatus

    const date = new Date(profit.date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (dateFilter === '7d') return matchesStatus && diffDays <= 7
    if (dateFilter === '30d') return matchesStatus && diffDays <= 30
    if (dateFilter === '90d') return matchesStatus && diffDays <= 90

    return matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Profit History</h1>
          <p className="text-slate-400 text-sm mt-1">View all your profit distributions</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Profit Earned</p>
            <DollarSign className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${stats.totalProfit.toFixed(2)}</p>
          <p className="text-xs text-emerald-400 mt-2">All-time earnings</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Pending Profit</p>
            <TrendingUp className="text-amber-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${stats.pendingProfit.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">To be distributed</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">This Month</p>
            <Calendar className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${stats.thisMonthProfit.toFixed(2)}</p>
          <p className="text-xs text-emerald-400 mt-2">+28% vs last month</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Distributions</p>
            <TrendingUp className="text-gold-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{stats.distributionCount}</p>
          <p className="text-xs text-slate-400 mt-2">Total payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === 'all'
                ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20'
                : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === 'paid'
                ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20'
                : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === 'pending'
                ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20'
                : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Pending
          </button>
        </div>

        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                dateFilter === period
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {period === 'all' ? 'All Time' : period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Profit History Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Date & Time</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Investment</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Type</th>
                <th className="text-right p-4 text-slate-400 text-sm font-medium">Amount</th>
                <th className="text-center p-4 text-slate-400 text-sm font-medium">Status</th>
                <th className="text-center p-4 text-slate-400 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <DollarSign className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-400">No profit distributions found</p>
                    <p className="text-slate-500 text-sm mt-1">Start investing to earn profits</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((profit) => (
                  <tr key={profit.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-white text-sm">{formatDateTime(profit.date)}</p>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/investments/${profit.investmentId}`}
                        className="text-gold-500 hover:text-gold-400 text-sm font-medium"
                      >
                        {profit.investmentPlan}
                      </Link>
                      <p className="text-slate-500 text-xs mt-0.5">ID: {profit.investmentId}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(profit.type)}`}>
                        {profit.type}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-white font-semibold">${profit.amount.toFixed(2)}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profit.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {profit.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/dashboard/profits/investment/${profit.investmentId}`}
                        className="text-gold-500 hover:text-gold-400 text-sm inline-flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredHistory.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              Showing {filteredHistory.length} of {profitHistory.length} distributions
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm">
                Previous
              </button>
              <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
