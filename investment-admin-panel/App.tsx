import React, { useState, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store/store';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { TransactionTable } from './components/TransactionTable';
import { TransactionHistory } from './components/TransactionHistory';
import { TransactionDetail } from './components/TransactionDetail';
import { UserManagement } from './components/UserManagement';
import { InvestmentPlans } from './components/InvestmentPlans';
import { PaymentGateways } from './components/PaymentGateways';
import { SettingsPanelNew as SettingsPanel } from './components/SettingsPanelNew';
import { ProfitDistribution } from './components/ProfitDistribution';
import { ReferralManagement } from './components/ReferralManagement';
import { SupportTickets } from './components/SupportTickets';
import { Analytics } from './components/Analytics';
import { Notifications } from './components/Notifications';
import { Toast, ToastType } from './components/ui/Toast';
import { Transaction } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, FileText, Users, Briefcase, TicketCheck, Loader2 } from 'lucide-react';
import {
  useGetPendingTransactionsQuery,
  useGetAllTransactionsQuery,
  useApproveTransactionMutation,
  useRejectTransactionMutation
} from './store/api/transactionApi';
import { useGetDashboardStatsQuery, useGetRecentActivitiesQuery } from './store/api/analyticsApi';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// --- Dashboard Component ---
const Dashboard = ({
  recentTransactions,
  onApprove,
  onReject,
  onGenerateReport,
  onManageRoles,
  onEmergencyStop,
  isSystemPaused
}: {
  recentTransactions: Transaction[],
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onGenerateReport: () => void,
  onManageRoles: () => void,
  onEmergencyStop: () => void,
  isSystemPaused: boolean
}) => {
  // Fetch dashboard stats and recent activities
  const { data: dashboardResponse, isLoading: dashboardLoading } = useGetDashboardStatsQuery();
  const { data: activitiesResponse } = useGetRecentActivitiesQuery({ limit: 50 });

  const dashboard = dashboardResponse?.data?.attributes || {};
  const activities = activitiesResponse?.data?.attributes || {};
  const activityTransactions: any[] = activities.recentTransactions || [];
  const recentUsers: any[] = activities.recentUsers || [];
  const recentTickets: any[] = activities.recentTickets || [];

  // Build cashflow chart from recent completed transactions (group by day)
  const chartData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // Initialize last 7 days
    const dayMap: Record<string, { name: string; income: number; outflow: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = { name: dayNames[d.getDay()], income: 0, outflow: 0 };
    }

    // Fill with real data
    activityTransactions.forEach((tx: any) => {
      if (tx.status !== 'completed') return;
      const txDate = new Date(tx.createdAt);
      const key = txDate.toISOString().split('T')[0];
      if (dayMap[key]) {
        if (tx.type === 'deposit') {
          dayMap[key].income += tx.amount || 0;
        } else if (tx.type === 'withdraw') {
          dayMap[key].outflow += tx.amount || 0;
        }
      }
    });

    return Object.values(dayMap);
  }, [activityTransactions]);

  // Compute stats
  const totalDeposits = dashboard.transactions?.totalDeposits || 0;
  const totalWithdrawals = dashboard.transactions?.totalWithdrawals || 0;
  const netBalance = totalDeposits - totalWithdrawals;
  const pendingDeposits = dashboard.transactions?.pendingDeposits || 0;
  const pendingWithdrawals = dashboard.transactions?.pendingWithdrawals || 0;
  const totalUsers = dashboard.users?.total || 0;
  const activeUsers = dashboard.users?.active || 0;
  const activeInvestments = dashboard.investments?.active || 0;
  const totalInvestmentsCount = dashboard.investments?.total || 0;
  const openTickets = dashboard.support?.openTickets || 0;

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-navy-900" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* System Status Banner */}
      {isSystemPaused && (
        <div className="bg-rose-600 text-white px-6 py-4 rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertTriangle className="animate-pulse" size={24} />
            <div>
              <h3 className="font-bold">SYSTEM PAUSED</h3>
              <p className="text-sm text-rose-100">All deposits and withdrawals are currently suspended.</p>
            </div>
          </div>
          <button onClick={onEmergencyStop} className="bg-white text-rose-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors">
            Resume Operations
          </button>
        </div>
      )}

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Net Balance"
          value={`$${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`$${totalDeposits.toLocaleString()} deposits`}
          icon={DollarSign}
          trend="up"
          color="navy"
        />
        <StatsCard
          title="Pending Deposits"
          value={pendingDeposits.toString()}
          change="Action Req."
          icon={TrendingUp}
          trend="neutral"
          color="emerald"
          badge={pendingDeposits > 0}
        />
        <StatsCard
          title="Pending Withdrawals"
          value={pendingWithdrawals.toString()}
          change="Action Req."
          icon={TrendingDown}
          trend="neutral"
          color="rose"
          badge={pendingWithdrawals > 0}
        />
        <StatsCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          change={`${activeUsers} verified`}
          icon={Users}
          trend="up"
          color="gold"
        />
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Deposits"
          value={`$${totalDeposits.toLocaleString()}`}
          change="All time"
          icon={TrendingUp}
          trend="up"
          color="emerald"
        />
        <StatsCard
          title="Total Withdrawals"
          value={`$${totalWithdrawals.toLocaleString()}`}
          change="All time"
          icon={TrendingDown}
          trend="down"
          color="rose"
        />
        <StatsCard
          title="Active Investments"
          value={activeInvestments.toLocaleString()}
          change={`${totalInvestmentsCount} total`}
          icon={Briefcase}
          trend="up"
          color="navy"
        />
        <StatsCard
          title="Open Tickets"
          value={openTickets.toLocaleString()}
          change="Needs attention"
          icon={TicketCheck}
          trend="neutral"
          color="gold"
          badge={openTickets > 0}
        />
      </div>

      {/* Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-semibold text-lg text-navy-900">Cashflow (Last 7 Days)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Deposits" />
                <Area type="monotone" dataKey="outflow" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorOutflow)" name="Withdrawals" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Side Panel */}
        <div className="bg-navy-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-600 rounded-full blur-[50px] opacity-20 pointer-events-none"></div>

          <h3 className="font-display font-semibold text-lg mb-6 relative z-10">Admin Quick Actions</h3>
          <div className="space-y-4 relative z-10">
            <button
              onClick={onGenerateReport}
              className="w-full bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
            >
              <FileText size={18} /> Generate Weekly Report
            </button>
            <button
              onClick={onManageRoles}
              className="w-full bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Users size={18} /> Manage User Roles
            </button>
             <button
               onClick={onEmergencyStop}
               className={`w-full transition-all py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-lg
                 ${isSystemPaused
                   ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
                   : 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-900/50'
                 }`}
             >
              <AlertTriangle size={18} /> {isSystemPaused ? 'Resume System' : 'Emergency Stop System'}
            </button>

            {/* Platform summary */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Users</span>
                <span className="font-semibold">{totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Active Investments</span>
                <span className="font-semibold">{activeInvestments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Open Tickets</span>
                <span className="font-semibold">{openTickets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Net Revenue</span>
                <span className={`font-semibold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${netBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pending Transactions */}
      <TransactionTable
        title="Recent Pending Requests"
        transactions={recentTransactions}
        onApprove={onApprove}
        onReject={onReject}
      />

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-display font-semibold text-navy-900">Recent Registrations</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No recent users</div>
            ) : (
              recentUsers.slice(0, 8).map((user: any, idx: number) => (
                <div key={user.id || user._id || idx} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
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
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-display font-semibold text-navy-900">Recent Support Tickets</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {recentTickets.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No recent tickets</div>
            ) : (
              recentTickets.slice(0, 8).map((ticket: any, idx: number) => (
                <div key={ticket.id || ticket._id || idx} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      ticket.status === 'open' ? 'bg-emerald-500' :
                      ticket.status === 'in_progress' || ticket.status === 'waiting_reply' ? 'bg-amber-500' :
                      'bg-slate-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-navy-900 truncate max-w-[200px]">{ticket.subject || 'No Subject'}</p>
                      <p className="text-xs text-slate-500">{ticket.user?.fullName || ticket.user?.email || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'waiting_reply' ? 'bg-amber-100 text-amber-700' :
                      ticket.status === 'resolved' ? 'bg-slate-100 text-slate-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {(ticket.status || '').replace('_', ' ')}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, change, icon: Icon, trend, color, badge }: any) => {
  const colorClasses = {
    navy: 'text-navy-900 bg-navy-900/5',
    emerald: 'text-emerald-500 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50',
    gold: 'text-gold-600 bg-gold-50'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-navy-900 tracking-tight">{value}</h3>
        <p className={`text-xs mt-2 font-medium flex items-center gap-1
          ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-500'}
        `}>
          {change}
        </p>
      </div>
      <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} relative`}>
        <Icon size={24} />
        {badge && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        )}
      </div>
    </div>
  );
};

// --- App Wrapper for Router logic ---
const AppContent = () => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isSystemPaused, setIsSystemPaused] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const navigate = useNavigate();

  // Fetch data from API
  const { data: pendingData } = useGetPendingTransactionsQuery({});
  const { data: allTransactionsData } = useGetAllTransactionsQuery({ page: 1, limit: 100 });
  const [approveTransaction] = useApproveTransactionMutation();
  const [rejectTransaction] = useRejectTransactionMutation();

  // Extract transactions from API response
  const pendingTransactions = pendingData?.data?.attributes || [];
  const allTransactions = allTransactionsData?.data?.attributes?.results || [];

  // Handlers
  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      if (action === 'approved') {
        await approveTransaction({ transactionId: id }).unwrap();
      } else {
        await rejectTransaction({ transactionId: id }).unwrap();
      }

      const actionText = action === 'approved' ? 'Approved' : 'Rejected';
      setToast({
        message: `Transaction ${actionText} Successfully`,
        type: action === 'approved' ? 'success' : 'error'
      });
    } catch (error: any) {
      setToast({
        message: error?.data?.message || `Failed to ${action} transaction`,
        type: 'error'
      });
    }
  };

  const handleGenerateReport = () => {
    setToast({ message: "Generating Weekly Report...", type: 'success' });
    setTimeout(() => {
       setToast({ message: "Report downloaded successfully.", type: 'success' });
    }, 2000);
  };

  const handleManageRoles = () => {
    navigate('/users');
    setToast({ message: "Redirecting to User Role Management...", type: 'success' });
  };

  const handleEmergencyToggle = () => {
    setShowStopModal(false);
    setIsSystemPaused(!isSystemPaused);
    setToast({ 
      message: isSystemPaused ? "System Operations Resumed." : "EMERGENCY STOP ACTIVATED.", 
      type: isSystemPaused ? 'success' : 'error' 
    });
  };

  const depositTransactions = pendingTransactions.filter((t: any) => t.type === 'deposit');
  const withdrawalTransactions = pendingTransactions.filter((t: any) => t.type === 'withdraw');

  return (
    <Layout>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Emergency Stop Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-center p-6">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-2">
              {isSystemPaused ? "Resume Operations?" : "EMERGENCY STOP"}
            </h3>
            <p className="text-slate-600 mb-6 text-sm">
              {isSystemPaused 
                ? "Are you sure you want to lift the emergency suspension? Users will be able to deposit and withdraw again immediately." 
                : "This will immediately SUSPEND all deposits and withdrawals on the platform. This action should only be taken in case of a security breach or critical error."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowStopModal(false)}
                className="flex-1 py-3 rounded-lg border border-slate-200 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleEmergencyToggle}
                className={`flex-1 py-3 rounded-lg text-white font-bold transition-colors shadow-lg
                  ${isSystemPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                {isSystemPaused ? "Yes, Resume" : "CONFIRM STOP"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard
              recentTransactions={pendingTransactions.slice(0, 5)}
              onApprove={(id) => handleAction(id, 'approved')}
              onReject={(id) => handleAction(id, 'rejected')}
              onGenerateReport={handleGenerateReport}
              onManageRoles={handleManageRoles}
              onEmergencyStop={() => setShowStopModal(true)}
              isSystemPaused={isSystemPaused}
            />
          </ProtectedRoute>
        } />

        <Route path="/deposits" element={
          <ProtectedRoute>
            <div>
              <h2 className="text-2xl font-display font-bold text-navy-900 mb-6">Pending Deposits</h2>
              <TransactionTable
                title="Deposit Requests"
                transactions={depositTransactions}
                onApprove={(id) => handleAction(id, 'approved')}
                onReject={(id) => handleAction(id, 'rejected')}
              />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/withdrawals" element={
          <ProtectedRoute>
            <div>
              <h2 className="text-2xl font-display font-bold text-navy-900 mb-6">Pending Withdrawals</h2>
              <TransactionTable
                title="Withdrawal Requests"
                transactions={withdrawalTransactions}
                onApprove={(id) => handleAction(id, 'approved')}
                onReject={(id) => handleAction(id, 'rejected')}
              />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

        <Route path="/plans" element={<ProtectedRoute><InvestmentPlans /></ProtectedRoute>} />

        <Route path="/gateways" element={<ProtectedRoute><PaymentGateways /></ProtectedRoute>} />

        <Route path="/history" element={<ProtectedRoute><TransactionHistory transactions={allTransactions} /></ProtectedRoute>} />
        <Route path="/history/:transactionId" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />

        {/* New Routes */}
        <Route path="/profits" element={<ProtectedRoute><ProfitDistribution /></ProtectedRoute>} />

        <Route path="/referrals" element={<ProtectedRoute><ReferralManagement /></ProtectedRoute>} />

        <Route path="/tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />

        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        <Route path="/settings" element={<ProtectedRoute><SettingsPanel /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}