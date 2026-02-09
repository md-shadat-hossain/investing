import React, { useState } from 'react';
import { Bell, Send, Users, User, History, CheckCircle, Trash2, Eye, Loader2, AlertCircle, X, Check, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useSendToUserMutation,
  useBroadcastMutation,
} from '../store/api/notificationApi';

export const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'send' | 'broadcast'>('history');
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    content: '',
    type: 'system',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [sendForm, setSendForm] = useState({
    userId: '',
    title: '',
    content: '',
    type: 'system',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyFilter, setHistoryFilter] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

  const LIMIT = 15;

  // API hooks
  const { data: unreadData } = useGetUnreadCountQuery();
  const { data: notificationsData, isLoading: isLoadingHistory, isFetching: isFetchingHistory } = useGetMyNotificationsQuery({
    limit: LIMIT,
    skip: historyPage * LIMIT,
    ...(historyFilter ? { status: historyFilter } : {}),
  });

  const [broadcast, { isLoading: isBroadcasting }] = useBroadcastMutation();
  const [sendToUser, { isLoading: isSending }] = useSendToUserMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [deleteAllNotifications, { isLoading: isDeletingAll }] = useDeleteAllNotificationsMutation();

  const unreadCount = unreadData?.data?.attributes?.count ?? 0;
  const notifications = notificationsData?.data?.attributes ?? [];
  const totalNotifications = Array.isArray(notifications) ? notifications.length : 0;

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.content) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const result: any = await broadcast({
        title: broadcastForm.title,
        content: broadcastForm.content,
        type: broadcastForm.type,
        priority: broadcastForm.priority,
      }).unwrap();

      const count = result?.data?.attributes?.count ?? 0;
      showToast(`Broadcast sent successfully to ${count} users!`, 'success');
      setBroadcastForm({ title: '', content: '', type: 'system', priority: 'medium' });
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to send broadcast', 'error');
    }
  };

  const handleSendToUser = async () => {
    if (!sendForm.userId || !sendForm.title || !sendForm.content) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await sendToUser({
        userId: sendForm.userId,
        title: sendForm.title,
        content: sendForm.content,
        type: sendForm.type,
        priority: sendForm.priority,
      }).unwrap();

      showToast('Notification sent successfully!', 'success');
      setSendForm({ userId: '', title: '', content: '', type: 'system', priority: 'medium' });
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to send notification', 'error');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to mark as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      showToast('All notifications marked as read', 'success');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      showToast('Notification deleted', 'success');
      setDeleteConfirm(null);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete notification', 'error');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications().unwrap();
      showToast('All notifications deleted', 'success');
      setDeleteAllConfirm(false);
      setHistoryPage(0);
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to delete all notifications', 'error');
    }
  };

  const templates = [
    {
      name: 'Welcome Message',
      title: 'Welcome to Investment Platform!',
      content: 'Thank you for joining us. Start investing today and earn great returns!',
      type: 'bonus',
      priority: 'medium' as const
    },
    {
      name: 'Maintenance Notice',
      title: 'Scheduled Maintenance',
      content: 'Our platform will undergo scheduled maintenance. Please plan accordingly.',
      type: 'system',
      priority: 'high' as const
    },
    {
      name: 'Security Alert',
      title: 'Security Update Required',
      content: 'Please update your security settings for better account protection.',
      type: 'security',
      priority: 'high' as const
    },
    {
      name: 'New Investment Plan',
      title: 'New Investment Opportunity!',
      content: 'A new investment plan is now available with attractive returns. Check it out!',
      type: 'investment',
      priority: 'medium' as const
    }
  ];

  const useTemplate = (template: typeof templates[0]) => {
    if (activeTab === 'broadcast') {
      setBroadcastForm({
        title: template.title,
        content: template.content,
        type: template.type,
        priority: template.priority
      });
    } else if (activeTab === 'send') {
      setSendForm({
        ...sendForm,
        title: template.title,
        content: template.content,
        type: template.type,
        priority: template.priority
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      system: 'bg-blue-100 text-blue-700',
      transaction: 'bg-emerald-100 text-emerald-700',
      investment: 'bg-purple-100 text-purple-700',
      security: 'bg-rose-100 text-rose-700',
      profit: 'bg-amber-100 text-amber-700',
      referral: 'bg-cyan-100 text-cyan-700',
      bonus: 'bg-indigo-100 text-indigo-700',
      support: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      system: 'bg-blue-50',
      transaction: 'bg-emerald-50',
      investment: 'bg-purple-50',
      security: 'bg-rose-50',
      profit: 'bg-amber-50',
      referral: 'bg-cyan-50',
      bonus: 'bg-indigo-50',
      support: 'bg-orange-50',
    };
    return icons[type] || 'bg-slate-50';
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-rose-100 text-rose-600',
    };
    return colors[priority] || 'bg-slate-100 text-slate-600';
  };

  const formatDate = (dateStr: string) => {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <Bell size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-900">Notification Center</h1>
        <p className="text-slate-500 text-sm mt-1">Send broadcasts, notifications to users, and manage your inbox</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Unread Notifications</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{unreadCount}</h3>
              <p className="text-xs text-slate-500 mt-2">In your inbox</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Mail className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Inbox</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{totalNotifications}</h3>
              <p className="text-xs text-slate-500 mt-2">Notifications loaded</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Bell className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Quick Actions</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll || unreadCount === 0}
                  className="px-3 py-1.5 text-xs font-medium bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isMarkingAll ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Mark All Read
                </button>
                <button
                  onClick={() => setDeleteAllConfirm(true)}
                  disabled={isDeletingAll || totalNotifications === 0}
                  className="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Clear All
                </button>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <CheckCircle className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Quick Templates</h3>
          <div className="space-y-3">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => useTemplate(template)}
                className="w-full text-left p-4 border border-slate-200 rounded-lg hover:border-navy-900 hover:bg-navy-50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeIcon(template.type)} group-hover:bg-navy-900 transition-colors`}>
                    <Bell className={`text-slate-600 group-hover:text-white`} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-navy-900">{template.name}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{template.content}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTypeColor(template.type)}`}>{template.type}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getPriorityBadge(template.priority)}`}>{template.priority}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
          {/* Tabs */}
          <div className="border-b border-slate-100 px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <History size={18} />
                My Inbox
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'send'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <User size={18} />
                Send to User
              </button>
              <button
                onClick={() => setActiveTab('broadcast')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'broadcast'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <Users size={18} />
                Broadcast to All
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Broadcast Tab */}
            {activeTab === 'broadcast' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                    <select
                      value={broadcastForm.type}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                    >
                      <option value="system">System</option>
                      <option value="transaction">Transaction</option>
                      <option value="investment">Investment</option>
                      <option value="security">Security</option>
                      <option value="bonus">Bonus</option>
                      <option value="profit">Profit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                    <select
                      value={broadcastForm.priority}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="Enter notification title"
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{broadcastForm.title.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    value={broadcastForm.content}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                    placeholder="Enter notification message"
                    rows={5}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{broadcastForm.content.length}/500</p>
                </div>

                {/* Preview */}
                {(broadcastForm.title || broadcastForm.content) && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-2 font-medium">Preview:</div>
                    <div className="p-4 rounded-lg bg-white border-l-4 border-navy-900 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-navy-900">{broadcastForm.title || 'Title'}</div>
                          <div className="text-sm text-slate-600 mt-1">{broadcastForm.content || 'Message'}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getTypeColor(broadcastForm.type)}`}>{broadcastForm.type}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPriorityBadge(broadcastForm.priority)}`}>{broadcastForm.priority}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBroadcast}
                  disabled={isBroadcasting || !broadcastForm.title || !broadcastForm.content}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 font-medium"
                >
                  {isBroadcasting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending to all users...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Broadcast to All Users
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Send to User Tab */}
            {activeTab === 'send' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">User ID</label>
                  <input
                    type="text"
                    value={sendForm.userId}
                    onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                    placeholder="Enter user ID (e.g., 64a7b2c3d4e5f6a7b8c9d0e1)"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                    <select
                      value={sendForm.type}
                      onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                    >
                      <option value="system">System</option>
                      <option value="transaction">Transaction</option>
                      <option value="investment">Investment</option>
                      <option value="security">Security</option>
                      <option value="bonus">Bonus</option>
                      <option value="profit">Profit</option>
                      <option value="referral">Referral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                    <select
                      value={sendForm.priority}
                      onChange={(e) => setSendForm({ ...sendForm, priority: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={sendForm.title}
                    onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                    placeholder="Enter notification title"
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{sendForm.title.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    value={sendForm.content}
                    onChange={(e) => setSendForm({ ...sendForm, content: e.target.value })}
                    placeholder="Enter notification message"
                    rows={5}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{sendForm.content.length}/500</p>
                </div>

                <button
                  onClick={handleSendToUser}
                  disabled={isSending || !sendForm.userId || !sendForm.title || !sendForm.content}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 font-medium"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send to User
                    </>
                  )}
                </button>
              </div>
            )}

            {/* History / Inbox Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* Filter Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => { setHistoryFilter(''); setHistoryPage(0); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        historyFilter === '' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => { setHistoryFilter('unread'); setHistoryPage(0); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        historyFilter === 'unread' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Unread
                    </button>
                    <button
                      onClick={() => { setHistoryFilter('read'); setHistoryPage(0); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        historyFilter === 'read' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Read
                    </button>
                  </div>
                  {isFetchingHistory && <Loader2 size={16} className="animate-spin text-slate-400" />}
                </div>

                {/* Notification List */}
                {isLoadingHistory ? (
                  <div className="text-center py-16">
                    <Loader2 size={36} className="mx-auto mb-3 animate-spin text-navy-900" />
                    <p className="text-slate-500 text-sm">Loading notifications...</p>
                  </div>
                ) : totalNotifications === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <Bell size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No notifications found</p>
                    <p className="text-sm mt-1">
                      {historyFilter ? `No ${historyFilter} notifications` : 'Your inbox is empty'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification: any) => (
                      <div
                        key={notification.id || notification._id}
                        className={`p-4 border rounded-lg transition-all group ${
                          notification.status === 'unread'
                            ? 'border-navy-200 bg-navy-50/30 hover:bg-navy-50/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status dot */}
                          <div className="pt-1.5 flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${
                              notification.status === 'unread' ? 'bg-navy-900' : 'bg-slate-300'
                            }`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-semibold ${
                                  notification.status === 'unread' ? 'text-navy-900' : 'text-slate-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">{notification.content}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getTypeColor(notification.type || 'system')}`}>
                                  {notification.type || 'system'}
                                </span>
                                {notification.priority && notification.priority !== 'medium' && (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPriorityBadge(notification.priority)}`}>
                                    {notification.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-400">{formatDate(notification.createdAt)}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {notification.status === 'unread' && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id || notification._id)}
                                    className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors"
                                    title="Mark as read"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                                {deleteConfirm === (notification.id || notification._id) ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDelete(notification.id || notification._id)}
                                      disabled={isDeleting}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md text-xs font-medium"
                                    >
                                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(notification.id || notification._id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalNotifications > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Page {historyPage + 1} • Showing {totalNotifications} items
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                        disabled={historyPage === 0}
                        className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setHistoryPage(p => p + 1)}
                        disabled={totalNotifications < LIMIT}
                        className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {deleteAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="p-3 bg-rose-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-rose-600" size={24} />
              </div>
              <h3 className="font-semibold text-navy-900 text-lg mb-2">Delete All Notifications</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete all your notifications? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteAllConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeletingAll}
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeletingAll ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {isDeletingAll ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
