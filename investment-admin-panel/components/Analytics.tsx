import React, { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Download, Briefcase, TicketCheck, X, Loader2 } from 'lucide-react';
import {
  useGetDashboardStatsQuery,
  useGetRecentActivitiesQuery,
  useGetAllTransactionsForAnalyticsQuery,
  useGetAllInvestmentsForAnalyticsQuery,
} from '../store/api/analyticsApi';

const PIE_COLORS = ['#0F172A', '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899'];

export const Analytics: React.FC = () => {
  // API hooks
  const { data: statsResponse, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery();
  const { data: activitiesResponse, isLoading: activitiesLoading } = useGetRecentActivitiesQuery({ limit: 50 });
  const { data: transactionsResponse } = useGetAllTransactionsForAnalyticsQuery({ limit: 100 });
  const { data: investmentsResponse } = useGetAllInvestmentsForAnalyticsQuery({ limit: 100 });

  // Extract data
  const dashboard = statsResponse?.data?.attributes || {};
  const activities = activitiesResponse?.data?.attributes || {};
  const recentTransactions: any[] = activities.recentTransactions || [];
  const recentUsers: any[] = activities.recentUsers || [];
  const recentTickets: any[] = activities.recentTickets || [];

  const allTransactions: any[] = transactionsResponse?.data?.attributes?.results || [];
  const allInvestments: any[] = investmentsResponse?.data?.attributes?.results || [];

  // Build revenue chart data from real transactions (group by month)
  const revenueData = useMemo(() => {
    const monthMap: Record<string, { name: string; deposits: number; withdrawals: number; revenue: number }> = {};

    allTransactions.forEach((tx: any) => {
      if (tx.status !== 'completed') return;
      const date = new Date(tx.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { name: monthKey, deposits: 0, withdrawals: 0, revenue: 0 };
      }

      if (tx.type === 'deposit') {
        monthMap[monthKey].deposits += tx.amount || 0;
      } else if (tx.type === 'withdraw') {
        monthMap[monthKey].withdrawals += tx.amount || 0;
      }
    });

    // Calculate revenue (deposits - withdrawals)
    Object.values(monthMap).forEach(m => {
      m.revenue = m.deposits - m.withdrawals;
    });

    // Sort by date
    const sorted = Object.values(monthMap).sort((a, b) => {
      const da = new Date(a.name);
      const db = new Date(b.name);
      return da.getTime() - db.getTime();
    });

    return sorted.length > 0 ? sorted : [{ name: 'No data', deposits: 0, withdrawals: 0, revenue: 0 }];
  }, [allTransactions]);

  // Build user growth data from recent users (group by week)
  const userGrowthData = useMemo(() => {
    if (recentUsers.length === 0) return [];

    const now = new Date();
    const weeks: Record<string, { total: number; label: string }> = {};

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      const label = i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i + 1} Weeks Ago`;
      weeks[label] = { total: 0, label };

      recentUsers.forEach((user: any) => {
        const created = new Date(user.createdAt);
        if (created >= weekStart && created < weekEnd) {
          weeks[label].total++;
        }
      });
    }

    return Object.values(weeks).map(w => ({ name: w.label, users: w.total }));
  }, [recentUsers]);

  // Build investment distribution from real investments (group by plan)
  const investmentDistribution = useMemo(() => {
    const planMap: Record<string, { name: string; value: number; amount: number }> = {};

    allInvestments.forEach((inv: any) => {
      const planName = inv.plan?.name || 'Unknown Plan';
      if (!planMap[planName]) {
        planMap[planName] = { name: planName, value: 0, amount: 0 };
      }
      planMap[planName].value++;
      planMap[planName].amount += inv.amount || 0;
    });

    const sorted = Object.values(planMap).sort((a, b) => b.value - a.value);
    return sorted.length > 0 ? sorted : [{ name: 'No data', value: 1, amount: 0 }];
  }, [allInvestments]);

  // Compute KPIs from real data
  const kpis = useMemo(() => {
    const totalUsers = dashboard.users?.total || 0;
    const activeUsers = dashboard.users?.active || 0;
    const totalDepositsAmount = dashboard.transactions?.totalDeposits || 0;
    const totalWithdrawalsAmount = dashboard.transactions?.totalWithdrawals || 0;
    const totalInvestmentsCount = dashboard.investments?.total || 0;
    const activeInvestments = dashboard.investments?.active || 0;

    // Active rate
    const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0';

    // Net revenue
    const netRevenue = totalDepositsAmount - totalWithdrawalsAmount;

    // Investment active rate
    const investmentActiveRate = totalInvestmentsCount > 0
      ? ((activeInvestments / totalInvestmentsCount) * 100).toFixed(1)
      : '0';

    // Avg deposit from recent transactions
    const completedDeposits = allTransactions.filter((tx: any) => tx.type === 'deposit' && tx.status === 'completed');
    const avgDeposit = completedDeposits.length > 0
      ? completedDeposits.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) / completedDeposits.length
      : 0;

    return { activeRate, netRevenue, investmentActiveRate, avgDeposit };
  }, [dashboard, allTransactions]);

  // Stats cards
  const stats = [
    {
      title: 'Total Users',
      value: (dashboard.users?.total || 0).toLocaleString(),
      subtitle: `${dashboard.users?.active || 0} verified`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Deposits',
      value: `$${(dashboard.transactions?.totalDeposits || 0).toLocaleString()}`,
      subtitle: `${dashboard.transactions?.pendingDeposits || 0} pending`,
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: 'Total Withdrawals',
      value: `$${(dashboard.transactions?.totalWithdrawals || 0).toLocaleString()}`,
      subtitle: `${dashboard.transactions?.pendingWithdrawals || 0} pending`,
      icon: TrendingDown,
      color: 'rose',
    },
    {
      title: 'Active Investments',
      value: (dashboard.investments?.active || 0).toLocaleString(),
      subtitle: `${dashboard.investments?.total || 0} total`,
      icon: Briefcase,
      color: 'purple',
    },
  ];

  // Export handler
  const handleExport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      stats: {
        users: dashboard.users,
        transactions: dashboard.transactions,
        investments: dashboard.investments,
        support: dashboard.support,
      },
      kpis,
      revenueData,
      investmentDistribution,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (statsLoading && activitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-navy-900 mx-auto mb-4" />
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-rose-600" size={32} />
          </div>
          <p className="text-rose-600 font-medium">Failed to load analytics</p>
          <p className="text-slate-500 text-sm mt-2">{(statsError as any)?.data?.message || 'Please try again later'}</p>
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
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-navy-900 text-white px-6 py-2 rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-navy-900 mt-1">{stat.value}</h3>
                <p className="text-xs text-slate-500 mt-2">{stat.subtitle}</p>
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
            <p className="text-sm text-slate-500 mt-1">Deposits and withdrawals over time</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Net Revenue</p>
            <p className={`text-lg font-bold ${kpis.netRevenue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ${kpis.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Legend />
              <Area type="monotone" dataKey="deposits" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorDeposits)" name="Deposits" />
              <Area type="monotone" dataKey="withdrawals" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorWithdrawals)" name="Withdrawals" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-navy-900 mb-6">User Growth (Recent)</h3>
          <div className="h-72">
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                  />
                  <Bar dataKey="users" fill="#0F172A" name="New Users" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No user data available</div>
            )}
          </div>
        </div>

        {/* Investment Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-navy-900 mb-6">Investment Distribution by Plan</h3>
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
                  {investmentDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any, props: any) => [
                  `${value} investments ($${props.payload.amount?.toLocaleString() || 0})`,
                  props.payload.name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-navy-900 mb-6">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">User Active Rate</span>
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-navy-900">{kpis.activeRate}%</div>
            <div className="text-xs text-slate-500 mt-1">
              {dashboard.users?.active || 0} of {dashboard.users?.total || 0} users verified
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Avg. Deposit</span>
              <DollarSign className="text-emerald-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-navy-900">
              ${kpis.avgDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">Per completed deposit</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Investment Active Rate</span>
              <Activity className="text-purple-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-navy-900">{kpis.investmentActiveRate}%</div>
            <div className="text-xs text-slate-500 mt-1">
              {dashboard.investments?.active || 0} of {dashboard.investments?.total || 0} active
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Open Tickets</span>
              <TicketCheck className="text-amber-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-navy-900">{dashboard.support?.openTickets || 0}</div>
            <div className="text-xs text-slate-500 mt-1">Requiring attention</div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-navy-900">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No recent transactions</div>
            ) : (
              recentTransactions.slice(0, 10).map((tx: any, idx: number) => (
                <div key={tx.id || tx._id || idx} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-emerald-100' :
                      tx.type === 'withdraw' ? 'bg-rose-100' :
                      tx.type === 'profit' ? 'bg-blue-100' :
                      'bg-amber-100'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <TrendingUp size={14} className="text-emerald-600" />
                      ) : tx.type === 'withdraw' ? (
                        <TrendingDown size={14} className="text-rose-600" />
                      ) : (
                        <DollarSign size={14} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{tx.user?.fullName || tx.user?.email || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 capitalize">{tx.type} - {tx.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === 'deposit' || tx.type === 'profit' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'}${(tx.amount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-navy-900">Recent Registrations</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No recent users</div>
            ) : (
              recentUsers.slice(0, 10).map((user: any, idx: number) => (
                <div key={user.id || user._id || idx} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-xs font-bold">
                      {(user.fullName || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{user.fullName || 'No Name'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
