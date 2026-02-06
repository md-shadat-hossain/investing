'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Percent, Clock, Play, Pause, CheckCircle, Activity } from 'lucide-react'

interface Investment {
  id: string
  planName: string
  planType: string
  amount: number
  roi: number
  duration: number
  durationType: 'days' | 'hours' | 'weeks' | 'months'
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'paused'
  totalProfit: number
  paidProfit: number
  remainingProfit: number
  dailyProfit: number
  progress: number
  lastProfitDate?: string
  nextProfitDate?: string
}

interface ProfitDistribution {
  id: string
  amount: number
  date: string
  status: 'paid' | 'pending'
}

export default function InvestmentDetail() {
  const params = useParams()
  const router = useRouter()
  const investmentId = params.id as string

  // TODO: Replace with actual API call - GET /api/v1/investments/:investmentId
  const [investment] = useState<Investment>({
    id: investmentId,
    planName: 'Premier Plan',
    planType: 'premium',
    amount: 5000,
    roi: 180,
    duration: 14,
    durationType: 'days',
    startDate: '2024-02-01T10:00:00Z',
    endDate: '2024-02-15T10:00:00Z',
    status: 'active',
    totalProfit: 9000,
    paidProfit: 3214.29,
    remainingProfit: 5785.71,
    dailyProfit: 642.86,
    progress: 35.7,
    lastProfitDate: '2024-02-05T10:00:00Z',
    nextProfitDate: '2024-02-06T10:00:00Z',
  })

  // TODO: Replace with actual API call - GET /api/v1/profits/investment/:investmentId/history
  const [profitHistory] = useState<ProfitDistribution[]>([
    { id: '1', amount: 642.86, date: '2024-02-05T10:00:00Z', status: 'paid' },
    { id: '2', amount: 642.86, date: '2024-02-04T10:00:00Z', status: 'paid' },
    { id: '3', amount: 642.86, date: '2024-02-03T10:00:00Z', status: 'paid' },
    { id: '4', amount: 642.86, date: '2024-02-02T10:00:00Z', status: 'paid' },
    { id: '5', amount: 642.85, date: '2024-02-01T10:00:00Z', status: 'paid' },
  ])

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

  const getRemainingTime = () => {
    const end = new Date(investment.endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const getStatusColor = (status: Investment['status']) => {
    const colors = {
      active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      completed: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      paused: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    }
    return colors[status]
  }

  const getStatusIcon = (status: Investment['status']) => {
    const icons = {
      active: <Activity className="text-emerald-500" size={20} />,
      completed: <CheckCircle className="text-blue-500" size={20} />,
      paused: <Pause className="text-amber-500" size={20} />,
    }
    return icons[status]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-slate-400" size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{investment.planName}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(investment.status)}`}>
              {investment.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm">Investment ID: #{investment.id}</p>
        </div>
        <Link
          href={`/dashboard/profits/investment/${investmentId}`}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-colors"
        >
          View Profit History
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Investment Amount</p>
            <DollarSign className="text-gold-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${investment.amount.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Principal amount</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">ROI</p>
            <Percent className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-emerald-400">{investment.roi}%</p>
          <p className="text-xs text-slate-400 mt-2">Return rate</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Profit</p>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${investment.totalProfit.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">Expected earnings</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Daily Profit</p>
            <Calendar className="text-rose-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${investment.dailyProfit.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">Per day earning</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Investment Progress</h3>
            <p className="text-slate-400 text-sm mt-1">
              {formatDate(investment.startDate)} - {formatDate(investment.endDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gold-500">{investment.progress.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold-500 to-amber-600 transition-all duration-500"
            style={{ width: `${investment.progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Time Remaining</p>
            <div className="flex items-center gap-2">
              <Clock className="text-gold-500" size={16} />
              <p className="text-white font-semibold">{getRemainingTime()}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Next Profit</p>
            <div className="flex items-center gap-2">
              <Calendar className="text-emerald-500" size={16} />
              <p className="text-white font-semibold text-sm">{investment.nextProfitDate ? formatDate(investment.nextProfitDate) : 'N/A'}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs mb-1">Status</p>
            <div className="flex items-center gap-2">
              {getStatusIcon(investment.status)}
              <p className="text-white font-semibold capitalize">{investment.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Profit Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Total Expected Profit</p>
                <p className="text-2xl font-bold text-white mt-1">${investment.totalProfit.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-500" size={24} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div>
                <p className="text-emerald-400 text-sm">Profit Received</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">${investment.paidProfit.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-500" size={24} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Remaining Profit</p>
                <p className="text-2xl font-bold text-white mt-1">${investment.remainingProfit.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gold-500/10 rounded-lg flex items-center justify-center">
                <Clock className="text-gold-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Investment Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Plan Type</span>
              <span className="text-white font-medium capitalize">{investment.planType}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Duration</span>
              <span className="text-white font-medium">{investment.duration} {investment.durationType}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Start Date</span>
              <span className="text-white font-medium">{formatDate(investment.startDate)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">End Date</span>
              <span className="text-white font-medium">{formatDate(investment.endDate)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Last Profit</span>
              <span className="text-white font-medium">
                {investment.lastProfitDate ? formatDate(investment.lastProfitDate) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-400 text-sm">Total Return</span>
              <span className="text-emerald-400 font-bold text-lg">
                ${(investment.amount + investment.totalProfit).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Profit History */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Recent Profit Distributions</h3>
            <p className="text-slate-400 text-sm mt-1">Last 5 profit payments</p>
          </div>
          <Link
            href={`/dashboard/profits/investment/${investmentId}`}
            className="text-gold-500 hover:text-gold-400 text-sm font-medium flex items-center gap-1"
          >
            View All
            <ArrowLeft className="rotate-180" size={16} />
          </Link>
        </div>
        <div className="divide-y divide-slate-800">
          {profitHistory.map((profit) => (
            <div key={profit.id} className="p-6 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-emerald-500" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">${profit.amount.toFixed(2)}</p>
                    <p className="text-slate-400 text-sm">{formatDateTime(profit.date)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profit.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {profit.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
