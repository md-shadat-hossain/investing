'use client'

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useLogoutMutation } from '../store/api/authApi';
import { clearAuth } from '../store/slices/authSlice';
import { Toast, ToastType } from './Toast';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  History,
  Users,
  Ticket,
  Settings,
  LogOut,
  Bell,
  Menu,
  ChevronDown,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuItem } from '@/types';
import NotificationsDropdown, { Notification } from './NotificationsDropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const user = useSelector((state: RootState) => state.auth.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Mock Notification Data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'transaction',
      status: 'success',
      title: 'Deposit Confirmed',
      message: 'Your deposit of $2,500.00 via Bitcoin has been successfully credited to your wallet.',
      time: '2 min ago',
      read: false
    },
    {
      id: '2',
      type: 'system',
      status: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Oct 28th from 02:00 AM to 04:00 AM UTC. Trading will be paused.',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'promotion',
      status: 'warning',
      title: 'New Plan Available',
      message: 'Check out our new "Elite Plus" plan with enhanced ROI rates for a limited time.',
      time: '5 hours ago',
      read: true
    },
    {
      id: '4',
      type: 'security',
      status: 'success',
      title: 'Password Updated',
      message: 'Your account password was successfully changed from a new device (Chrome, Windows).',
      time: '1 day ago',
      read: true
    }
  ]);

  const pathname = usePathname();

  // Initialize expanded state based on current path to keep menus open
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Wallet': pathname.includes('/deposit') || pathname.includes('/wallet'),
    'Withdraw': pathname.includes('/withdraw'),
    'Plans': pathname.includes('/plans'),
    'Referral': pathname.includes('/referrals'),
    'Support': pathname.includes('/support')
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
      dispatch(clearAuth());

      setToast({
        message: 'Logged out successfully. See you soon!',
        type: 'success'
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      // Even if logout fails, clear local auth
      dispatch(clearAuth());
      setToast({
        message: 'Logged out successfully.',
        type: 'success'
      });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Wallet',
      icon: ArrowDownLeft,
      subItems: [
        { label: 'Deposit', path: '/dashboard/deposit' },
        { label: 'Wallet Stats', path: '/dashboard/wallet/stats' }
      ]
    },
    {
      label: 'Withdraw',
      icon: ArrowUpRight,
      subItems: [
        { label: 'Request', path: '/dashboard/withdraw' },
        { label: 'History', path: '/dashboard/withdraw/history' }
      ]
    },
    {
      label: 'Plans',
      icon: PieChart,
      subItems: [
        { label: 'Invest', path: '/dashboard/plans/invest' },
        { label: 'My Plans', path: '/dashboard/plans/my-plans' },
        { label: 'Investment History', path: '/dashboard/plans/history' }
      ]
    },
    { label: 'Transactions', icon: History, path: '/dashboard/transactions' },
    { label: 'Profit History', icon: TrendingUp, path: '/dashboard/profits/history' },
    {
      label: 'Referral',
      icon: Users,
      subItems: [
        { label: 'Overview', path: '/dashboard/referrals' },
        { label: '7-Level Network', path: '/dashboard/referrals/network' }
      ]
    },
    {
      label: 'Support',
      icon: Ticket,
      subItems: [
        { label: 'Create Ticket', path: '/dashboard/support' },
        { label: 'My Tickets', path: '/dashboard/support/tickets' }
      ]
    },
    { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-100 transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-500/10 p-2 rounded-full text-red-500">
                <LogOut size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Sign Out</h3>
            </div>
            <p className="text-slate-400 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg shadow-red-600/20"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <span className="text-xl font-serif font-bold tracking-wide">
              Wealth<span className="text-gold-500">Flow</span>
            </span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        item.subItems.some(sub => isActive(sub.path)) ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {expandedMenus[item.label] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {expandedMenus[item.label] && (
                      <div className="ml-10 mt-1 space-y-1 border-l border-slate-700 pl-2">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.path || '#'}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              isActive(sub.path) ? 'text-gold-500 font-medium' : 'text-slate-500 hover:text-gold-400'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path || '#'}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* User Profile Snippet in Sidebar Bottom */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-white hidden sm:block">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Balance Display */}
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Balance</span>
              <span className="text-xl font-bold text-green-400">$12,450.00</span>
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors outline-none"
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                    aria-hidden="true"
                  ></div>
                  <NotificationsDropdown
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkAllRead={handleMarkAllRead}
                  />
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
              {user?.image ? (
                <img
                  src={`http://10.10.11.87:8080${user.image}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gold-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 border-2 border-gold-500 text-white flex items-center justify-center font-bold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500">Verified Investor</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
