import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useLogoutMutation } from '../store/api/authApi';
import { clearAuth } from '../store/slices/authSlice';
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '../store/api/notificationApi';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  ShieldCheck,
  Users,
  History,
  Briefcase,
  CreditCard,
  TrendingUp,
  UserPlus,
  MessageSquare,
  BarChart3,
  Send,
  Loader2,
  Eye,
  Check,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarLink = ({ to, icon: Icon, label, badge }: { to: string, icon: any, label: string, badge?: number }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
        ${isActive 
          ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-500 border-l-4 border-gold-500' 
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
        <span className="font-medium">{label}</span>
      </div>
      {badge ? (
        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-rose-600/20">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();

  // Check authentication state
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Notification API hooks
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds for new notifications
  });
  const { data: notificationsData, isLoading: isLoadingNotifications } = useGetMyNotificationsQuery(
    { limit: 10, skip: 0 },
    { skip: !isNotificationsOpen }
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation();

  const unreadNotifications = unreadData?.data?.attributes?.count ?? 0;
  const headerNotifications = notificationsData?.data?.attributes ?? [];

  const getNotificationDotColor = (type: string) => {
    const colors: Record<string, string> = {
      transaction: 'bg-emerald-500',
      security: 'bg-rose-500',
      investment: 'bg-purple-500',
      profit: 'bg-amber-500',
      referral: 'bg-cyan-500',
      bonus: 'bg-indigo-500',
      support: 'bg-orange-500',
      system: 'bg-blue-500',
    };
    return colors[type] || 'bg-blue-500';
  };

  const formatNotificationTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (err) {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      // silently fail
    }
  };

  const handleSignOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
      dispatch(clearAuth());
      navigate('/login');
    } catch (error) {
      // Even if logout fails, clear local auth
      dispatch(clearAuth());
      navigate('/login');
    }
    setIsSignOutModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-navy-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${!isAuthenticated ? 'blur-sm pointer-events-none select-none' : ''}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">Boltz<span className="text-gold-500">Admin</span></h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Control Room</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
            
            <div className="pt-6 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</p>
            </div>
            <SidebarLink to="/users" icon={Users} label="User Management" />
            <SidebarLink to="/gateways" icon={CreditCard} label="Payment Gateways" />
            <SidebarLink to="/plans" icon={Briefcase} label="Investment Plans" />

            <div className="pt-6 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactions</p>
            </div>
            <SidebarLink to="/deposits" icon={ArrowDownLeft} label="Deposits" />
            <SidebarLink to="/withdrawals" icon={ArrowUpRight} label="Withdrawals" />
            <SidebarLink to="/history" icon={History} label="Transaction History" />

            <div className="pt-6 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operations</p>
            </div>
            <SidebarLink to="/profits" icon={TrendingUp} label="Profit Distribution" />
            <SidebarLink to="/referrals" icon={UserPlus} label="Referral Management" />
            <SidebarLink to="/tickets" icon={MessageSquare} label="Support Tickets" />

            <div className="pt-6 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">System</p>
            </div>
            <SidebarLink to="/analytics" icon={BarChart3} label="Analytics & Reports" />
            <SidebarLink to="/notifications" icon={Send} label="Notifications" />
            <SidebarLink to="/settings" icon={Settings} label="Settings" />
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button 
              onClick={() => setIsSignOutModalOpen(true)}
              className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg w-full transition-colors"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className={`h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 ${!isAuthenticated ? 'blur-sm pointer-events-none select-none' : ''}`}>
          <button 
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 w-96 focus-within:ring-2 focus-within:ring-gold-500/50 transition-shadow">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 transition-colors ${isNotificationsOpen ? 'text-navy-900 bg-slate-100 rounded-full' : 'text-slate-400 hover:text-navy-900'}`}
              >
                <Bell size={22} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-600 rounded-full border border-white"></span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-4 w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-navy-900">Notifications</h3>
                        {unreadNotifications > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadNotifications}
                          </span>
                        )}
                      </div>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          disabled={isMarkingAllRead}
                          className="text-xs text-gold-600 font-medium cursor-pointer hover:underline disabled:opacity-50 flex items-center gap-1"
                        >
                          {isMarkingAllRead ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[380px] overflow-y-auto">
                      {isLoadingNotifications ? (
                        <div className="p-8 text-center">
                          <Loader2 size={24} className="mx-auto animate-spin text-slate-400 mb-2" />
                          <p className="text-xs text-slate-400">Loading...</p>
                        </div>
                      ) : Array.isArray(headerNotifications) && headerNotifications.length > 0 ? (
                        headerNotifications.map((note: any) => (
                          <div
                            key={note.id || note._id}
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group ${
                              note.status === 'unread' ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationDotColor(note.type)}`}></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-medium ${note.status === 'unread' ? 'text-navy-900' : 'text-slate-600'}`}>
                                    {note.title}
                                  </p>
                                  {note.status === 'unread' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleMarkNotificationRead(note.id || note._id); }}
                                      className="p-1 text-slate-300 hover:text-navy-900 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                      title="Mark as read"
                                    >
                                      <Eye size={12} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.content}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] text-slate-400">{formatNotificationTime(note.createdAt)}</span>
                                  {note.priority === 'high' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 font-medium">High</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-xs text-slate-400">No notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-center border-t border-slate-100">
                      <button
                        onClick={() => { setIsNotificationsOpen(false); navigate('/notifications'); }}
                        className="text-xs font-medium text-navy-900 hover:text-gold-600 p-2 w-full"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-navy-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
              </div>
              {user?.image ? (
                <img
                  src={`http://10.10.11.87:8080${user.image}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-gold-500/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-md">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 overflow-y-auto flex-1">
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
              <LogOut size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Sign Out?</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to end your session securely?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsSignOutModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSignOut}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};