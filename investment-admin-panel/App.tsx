import React, { useState, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store/store';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { TransactionTable } from './components/TransactionTable';
import { TransactionHistory } from './components/TransactionHistory';
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
import { MOCK_TRANSACTIONS, CHART_DATA } from './constants';
import { Transaction } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, FileText, Users } from 'lucide-react';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// --- Dashboard Component ---
const Dashboard = ({ 
  stats, 
  recentTransactions, 
  onApprove, 
  onReject,
  onGenerateReport,
  onManageRoles,
  onEmergencyStop,
  isSystemPaused
}: { 
  stats: any, 
  recentTransactions: Transaction[],
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onGenerateReport: () => void,
  onManageRoles: () => void,
  onEmergencyStop: () => void,
  isSystemPaused: boolean
}) => {
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Balance" 
          value="$168,331.09" 
          change="+4.5%" 
          icon={DollarSign} 
          trend="up"
          color="navy"
        />
        <StatsCard 
          title="Pending Deposits" 
          value={stats.pendingDeposits.toString()} 
          change="Action Req." 
          icon={TrendingUp} 
          trend="neutral"
          color="emerald"
          badge={true}
        />
        <StatsCard 
          title="Pending Withdrawals" 
          value={stats.pendingWithdrawals.toString()} 
          change="Action Req." 
          icon={TrendingDown} 
          trend="down"
          color="rose"
          badge={true}
        />
        <StatsCard 
          title="Daily Volume" 
          value="$7,784.00" 
          change="+12% vs yest" 
          icon={Activity} 
          trend="up"
          color="gold"
        />
      </div>

      {/* Chart & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-semibold text-lg text-navy-900">Market Overview & Cashflow</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1 outline-none focus:ring-1 focus:ring-gold-500">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="income" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="outflow" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorOutflow)" />
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
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <TransactionTable 
        title="Recent Pending Requests" 
        transactions={recentTransactions} 
        onApprove={onApprove} 
        onReject={onReject} 
      />
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
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isSystemPaused, setIsSystemPaused] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const navigate = useNavigate();

  // Computed Stats
  const stats = useMemo(() => {
    return {
      pendingDeposits: transactions.filter(t => t.status === 'pending' && t.type === 'deposit').length,
      pendingWithdrawals: transactions.filter(t => t.status === 'pending' && t.type === 'withdrawal').length,
    };
  }, [transactions]);

  // Handlers
  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, status: action } : t
    ));

    const tx = transactions.find(t => t.id === id);
    const actionText = action === 'approved' ? 'Approved' : 'Rejected';
    setToast({
      message: `${tx?.type === 'deposit' ? 'Deposit' : 'Withdrawal'} #${id} ${actionText} Successfully`,
      type: action === 'approved' ? 'success' : 'error'
    });
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

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const depositTransactions = transactions.filter(t => t.status === 'pending' && t.type === 'deposit');
  const withdrawalTransactions = transactions.filter(t => t.status === 'pending' && t.type === 'withdrawal');

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
              stats={stats}
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

        <Route path="/history" element={<ProtectedRoute><TransactionHistory transactions={transactions} /></ProtectedRoute>} />

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