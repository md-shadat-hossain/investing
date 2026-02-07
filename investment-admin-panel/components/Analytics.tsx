import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Download, Calendar, X } from 'lucide-react';
import { useGetDashboardStatsQuery } from '../store/api/analyticsApi';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // RTK Query hooks
  const { data: statsResponse, isLoading, error } = useGetDashboardStatsQuery();

  // Extract stats from response
  const dashboardData = statsResponse?.data?.attributes || {};

  // Mock data for charts (to be replaced with real data when available)
  const revenueData = dashboardData.monthlyRevenue || [
    { name: 'Jan', revenue: 45000, deposits: 65000, withdrawals: 20000 },
    { name: 'Feb', revenue: 52000, deposits: 72000, withdrawals: 20000 },
    { name: 'Mar', revenue: 48000, deposits: 68000, withdrawals: 20000 },
    { name: 'Apr', revenue: 61000, deposits: 81000, withdrawals: 20000 },
    { name: 'May', revenue: 55000, deposits: 75000, withdrawals: 20000 },
    { name: 'Jun', revenue: 67000, deposits: 87000, withdrawals: 20000 },
  ];

  const userGrowthData = [
    { name: 'Week 1', users: 120, active: 85 },
    { name: 'Week 2', users: 145, active: 105 },
    { name: 'Week 3', users: 168, active: 125 },
    { name: 'Week 4', users: 195, active: 148 },
  ];

  const investmentDistribution = dashboardData.investmentsByPlan?.map((plan: any) => ({
    name: plan.planName,
    value: plan.count,
    color: plan.color || '#0F172A'
  })) || [
    { name: 'Starter Gold', value: 25, color: '#F59E0B' },
    { name: 'Premium Platinum', value: 35, color: '#8B5CF6' },
    { name: 'Diamond Legacy', value: 40, color: '#0F172A' },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers?.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Invested',
      value: `$${dashboardData.totalInvested?.toLocaleString() || '0'}`,
      change: '+15.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Pending Deposits',
      value: dashboardData.pendingDeposits?.toLocaleString() || '0',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald'
    },
    {
      title: 'Pending Withdrawals',
      value: dashboardData.pendingWithdrawals?.toLocaleString() || '0',
      change: '-2.4%',
      trend: 'down',
      icon: Activity,
      color: 'amber'
    }
  ];

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-rose-600" size={32} />
          </div>
          <p className="text-rose-600 font-medium">Failed to load analytics</p>
          <p className="text-slate-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-900">Analytics & Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive platform performance metrics and insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center gap-2 bg-navy-900 text-white px-6 py-2 rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-navy-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-navy-900">Revenue Overview</h3>
            <p className="text-sm text-slate-500 mt-1">Monthly revenue, deposits, and withdrawals</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" tickFormatter={(val) => `$${val / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="deposits" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorDeposits)" name="Deposits" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-navy-900 mb-6">User Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="users" fill="#0F172A" name="Total Users" radius={[8, 8, 0, 0]} />
                <Bar dataKey="active" fill="#10B981" name="Active Users" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-navy-900 mb-6">Investment Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {investmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-navy-900 mb-6">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Conversion Rate</span>
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-navy-900">23.8%</div>
            <div className="text-xs text-emerald-600 mt-1">+3.2% from last month</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Avg. Deposit Value</span>
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-navy-900">$3,245</div>
            <div className="text-xs text-blue-600 mt-1">Stable</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">User Retention</span>
              <Users className="text-purple-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-navy-900">87.5%</div>
            <div className="text-xs text-emerald-600 mt-1">+1.8% from last month</div>
          </div>
        </div>
      </div>
    </div>
  );
};
