'use client'

import { useState } from 'react'
import { Users, TrendingUp, DollarSign, X, ChevronRight, Award, Calendar, Activity } from 'lucide-react'

interface ReferralUser {
  id: string
  name: string
  email: string
  avatar?: string
  joinDate: string
  status: 'active' | 'inactive'
  totalInvested: number
  totalEarned: number
  commissionEarned: number
  directReferrals: number
}

interface LevelData {
  level: number
  commission: number
  count: number
  totalCommission: number
  users: ReferralUser[]
}

export default function ReferralNetwork() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // TODO: Replace with actual API call to GET /api/v1/referrals/team-network
  const [networkData] = useState<LevelData[]>([
    {
      level: 1,
      commission: 8,
      count: 12,
      totalCommission: 456.80,
      users: [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@email.com',
          joinDate: '2024-01-15',
          status: 'active',
          totalInvested: 5000,
          totalEarned: 850,
          commissionEarned: 68,
          directReferrals: 3,
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          joinDate: '2024-01-20',
          status: 'active',
          totalInvested: 3500,
          totalEarned: 420,
          commissionEarned: 33.60,
          directReferrals: 5,
        },
        {
          id: '3',
          name: 'Michael Brown',
          email: 'michael.b@email.com',
          joinDate: '2024-02-01',
          status: 'inactive',
          totalInvested: 2000,
          totalEarned: 180,
          commissionEarned: 14.40,
          directReferrals: 1,
        },
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@email.com',
          joinDate: '2024-01-25',
          status: 'active',
          totalInvested: 4200,
          totalEarned: 680,
          commissionEarned: 54.40,
          directReferrals: 4,
        },
        {
          id: '5',
          name: 'David Wilson',
          email: 'david.w@email.com',
          joinDate: '2024-01-10',
          status: 'active',
          totalInvested: 6000,
          totalEarned: 1200,
          commissionEarned: 96,
          directReferrals: 6,
        },
        // More users...
      ],
    },
    {
      level: 2,
      commission: 4,
      count: 35,
      totalCommission: 284.50,
      users: [
        {
          id: '11',
          name: 'Robert Taylor',
          email: 'robert.t@email.com',
          joinDate: '2024-01-22',
          status: 'active',
          totalInvested: 3000,
          totalEarned: 450,
          commissionEarned: 18,
          directReferrals: 2,
        },
        {
          id: '12',
          name: 'Jennifer Martinez',
          email: 'jennifer.m@email.com',
          joinDate: '2024-01-28',
          status: 'active',
          totalInvested: 2500,
          totalEarned: 380,
          commissionEarned: 15.20,
          directReferrals: 3,
        },
        // More users...
      ],
    },
    {
      level: 3,
      commission: 3,
      count: 58,
      totalCommission: 186.30,
      users: [
        {
          id: '21',
          name: 'James Anderson',
          email: 'james.a@email.com',
          joinDate: '2024-02-05',
          status: 'active',
          totalInvested: 1800,
          totalEarned: 280,
          commissionEarned: 8.40,
          directReferrals: 1,
        },
        // More users...
      ],
    },
    {
      level: 4,
      commission: 2,
      count: 82,
      totalCommission: 124.80,
      users: [],
    },
    {
      level: 5,
      commission: 1,
      count: 125,
      totalCommission: 68.50,
      users: [],
    },
    {
      level: 6,
      commission: 1,
      count: 198,
      totalCommission: 42.30,
      users: [],
    },
    {
      level: 7,
      commission: 1,
      count: 276,
      totalCommission: 28.90,
      users: [],
    },
  ])

  // TODO: Replace with actual API call to GET /api/v1/referrals/stats
  const totalStats = {
    totalReferrals: networkData.reduce((sum, level) => sum + level.count, 0),
    totalCommission: networkData.reduce((sum, level) => sum + level.totalCommission, 0),
    activeReferrals: 456,
    thisMonthCommission: 234.50,
  }

  const getLevelColor = (level: number) => {
    const colors = [
      'from-gold-500 to-amber-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-orange-500 to-yellow-600',
      'from-slate-500 to-slate-600',
    ]
    return colors[level - 1]
  }

  const getLevelBorderColor = (level: number) => {
    const colors = [
      'border-gold-500/30',
      'border-emerald-500/30',
      'border-blue-500/30',
      'border-purple-500/30',
      'border-rose-500/30',
      'border-orange-500/30',
      'border-slate-500/30',
    ]
    return colors[level - 1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getFilteredUsers = (users: ReferralUser[]) => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }

  const selectedLevelData = selectedLevel !== null ? networkData.find(l => l.level === selectedLevel) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">7-Level Referral Network</h1>
        <p className="text-slate-400 text-sm mt-1">View your complete referral structure and commission earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Referrals</p>
            <Users className="text-gold-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{totalStats.totalReferrals}</p>
          <p className="text-xs text-emerald-400 mt-2">Across all 7 levels</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Commission</p>
            <DollarSign className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${totalStats.totalCommission.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">All-time earnings</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Active Referrals</p>
            <Activity className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{totalStats.activeReferrals}</p>
          <p className="text-xs text-slate-400 mt-2">{((totalStats.activeReferrals / totalStats.totalReferrals) * 100).toFixed(1)}% active rate</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">This Month</p>
            <TrendingUp className="text-rose-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${totalStats.thisMonthCommission.toFixed(2)}</p>
          <p className="text-xs text-emerald-400 mt-2">+12.5% vs last month</p>
        </div>
      </div>

      {/* Commission Structure Info */}
      <div className="bg-gradient-to-r from-gold-500/10 to-amber-600/10 border border-gold-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Award className="text-gold-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-white font-semibold mb-2">7-Level Commission Structure</h3>
            <p className="text-slate-300 text-sm mb-3">
              Earn commissions from 7 levels deep in your network. The more people you refer, the more you earn!
            </p>
            <div className="flex flex-wrap gap-2">
              {networkData.map((level) => (
                <span key={level.level} className="text-xs bg-slate-900/50 border border-slate-700 px-3 py-1 rounded-full text-slate-300">
                  Level {level.level}: <span className="text-gold-500 font-bold">{level.commission}%</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Network Breakdown by Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {networkData.map((level) => (
            <button
              key={level.level}
              onClick={() => setSelectedLevel(level.level)}
              className={`bg-slate-900/50 border ${getLevelBorderColor(level.level)} rounded-xl p-6 text-left hover:bg-slate-800/50 transition-all group relative overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getLevelColor(level.level)} opacity-5 group-hover:opacity-10 transition-opacity`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getLevelColor(level.level)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    L{level.level}
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-gold-500 transition-colors" size={20} />
                </div>

                <h3 className="text-white font-semibold mb-1">Level {level.level}</h3>
                <p className="text-slate-400 text-sm mb-4">{level.commission}% Commission</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Referrals</span>
                    <span className="text-sm font-bold text-white">{level.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Earned</span>
                    <span className="text-sm font-bold text-emerald-400">${level.totalCommission.toFixed(2)}</span>
                  </div>
                </div>

                {level.count > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <span className="text-xs text-gold-500 font-medium flex items-center gap-1">
                      Click to view {level.count} users
                      <ChevronRight size={14} />
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Level Detail Modal */}
      {selectedLevel !== null && selectedLevelData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getLevelColor(selectedLevel)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    L{selectedLevel}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Level {selectedLevel} Referrals</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {selectedLevelData.count} users • {selectedLevelData.commission}% commission rate
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLevel(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>

              {/* Level Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-xs mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-white">{selectedLevelData.count}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-xs mb-1">Commission Rate</p>
                  <p className="text-2xl font-bold text-gold-500">{selectedLevelData.commission}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-xs mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-emerald-400">${selectedLevelData.totalCommission.toFixed(2)}</p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-3 mt-6">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedLevelData.users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto text-slate-600 mb-4" size={48} />
                  <p className="text-slate-400">No user data available for this level yet</p>
                  <p className="text-slate-500 text-sm mt-1">Users will appear here as they join</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredUsers(selectedLevelData.users).map((user) => (
                    <div
                      key={user.id}
                      className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{user.name}</h4>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Joined</p>
                          <p className="text-sm text-slate-300">{formatDate(user.joinDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Invested</p>
                          <p className="text-sm text-white font-medium">${user.totalInvested.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Total Earned</p>
                          <p className="text-sm text-emerald-400 font-medium">${user.totalEarned.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Your Commission</p>
                          <p className="text-sm text-gold-500 font-bold">${user.commissionEarned.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Referrals</p>
                          <p className="text-sm text-slate-300">{user.directReferrals} users</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {getFilteredUsers(selectedLevelData.users).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No users match your filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">
                  Showing {getFilteredUsers(selectedLevelData.users).length} of {selectedLevelData.users.length} users
                </p>
                <button
                  onClick={() => setSelectedLevel(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
