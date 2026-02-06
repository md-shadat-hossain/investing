import React, { useState } from 'react';
import { Bell, Send, Users, User, History, CheckCircle } from 'lucide-react';

interface NotificationHistory {
  _id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipientType: 'all' | 'specific';
  recipientCount: number;
  sentAt: string;
}

export const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'send' | 'history'>('broadcast');
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  const [sendForm, setSendForm] = useState({
    userId: '',
    title: '',
    content: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([
    {
      _id: '1',
      title: 'System Maintenance Notice',
      content: 'Platform will undergo scheduled maintenance on Sunday',
      type: 'warning',
      recipientType: 'all',
      recipientCount: 1842,
      sentAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  const handleBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.content) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API - POST /api/v1/notifications/admin/broadcast
      alert('Broadcast sent successfully to all users!');
      setBroadcastForm({ title: '', content: '', type: 'info' });
    } catch (error) {
      alert('Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToUser = async () => {
    if (!sendForm.userId || !sendForm.title || !sendForm.content) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API - POST /api/v1/notifications/admin/send
      alert('Notification sent successfully!');
      setSendForm({ userId: '', title: '', content: '', type: 'info' });
    } catch (error) {
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      name: 'Welcome Message',
      title: 'Welcome to Investment Platform!',
      content: 'Thank you for joining us. Start investing today and earn great returns!',
      type: 'success' as const
    },
    {
      name: 'Maintenance Notice',
      title: 'Scheduled Maintenance',
      content: 'Our platform will undergo scheduled maintenance. Please plan accordingly.',
      type: 'warning' as const
    },
    {
      name: 'Security Alert',
      title: 'Security Update Required',
      content: 'Please update your security settings for better account protection.',
      type: 'error' as const
    }
  ];

  const useTemplate = (template: typeof templates[0]) => {
    if (activeTab === 'broadcast') {
      setBroadcastForm({
        title: template.title,
        content: template.content,
        type: template.type
      });
    } else {
      setSendForm({
        ...sendForm,
        title: template.title,
        content: template.content,
        type: template.type
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-900">Notification Center</h1>
        <p className="text-slate-500 text-sm mt-1">Send broadcasts and notifications to users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Sent</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">3,842</h3>
              <p className="text-xs text-slate-500 mt-2">All time</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Bell className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">This Month</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">487</h3>
              <p className="text-xs text-emerald-600 mt-2">+12% from last month</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Avg. Read Rate</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">78%</h3>
              <p className="text-xs text-slate-500 mt-2">User engagement</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="text-purple-600" size={24} />
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
                  <div className={`p-2 rounded-lg bg-${template.type === 'success' ? 'emerald' : template.type === 'warning' ? 'amber' : template.type === 'error' ? 'rose' : 'blue'}-100 group-hover:bg-navy-900 transition-colors`}>
                    <Bell className={`text-${template.type === 'success' ? 'emerald' : template.type === 'warning' ? 'amber' : template.type === 'error' ? 'rose' : 'blue'}-600 group-hover:text-white`} size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-navy-900">{template.name}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{template.content}</div>
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
                onClick={() => setActiveTab('history')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-500 hover:text-navy-900'
                }`}
              >
                <History size={18} />
                History
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'broadcast' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notification Type</label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="Enter notification title"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    value={broadcastForm.content}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                    placeholder="Enter notification message"
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Preview */}
                {(broadcastForm.title || broadcastForm.content) && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-2">Preview:</div>
                    <div className={`p-4 rounded-lg bg-white border-l-4 ${
                      broadcastForm.type === 'success' ? 'border-emerald-500' :
                      broadcastForm.type === 'warning' ? 'border-amber-500' :
                      broadcastForm.type === 'error' ? 'border-rose-500' :
                      'border-blue-500'
                    }`}>
                      <div className="font-semibold text-navy-900">{broadcastForm.title || 'Title'}</div>
                      <div className="text-sm text-slate-600 mt-1">{broadcastForm.content || 'Message'}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBroadcast}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 font-medium"
                >
                  <Send size={18} />
                  {loading ? 'Sending...' : 'Broadcast to All Users'}
                </button>
              </div>
            )}

            {activeTab === 'send' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">User ID</label>
                  <input
                    type="text"
                    value={sendForm.userId}
                    onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                    placeholder="Enter user ID or email"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notification Type</label>
                  <select
                    value={sendForm.type}
                    onChange={(e) => setSendForm({ ...sendForm, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={sendForm.title}
                    onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                    placeholder="Enter notification title"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    value={sendForm.content}
                    onChange={(e) => setSendForm({ ...sendForm, content: e.target.value })}
                    placeholder="Enter notification message"
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleSendToUser}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 font-medium"
                >
                  <Send size={18} />
                  {loading ? 'Sending...' : 'Send to User'}
                </button>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Bell size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No notification history yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item._id} className="p-4 border border-slate-200 rounded-lg hover:border-navy-900 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-navy-900">{item.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{item.content}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                          item.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                          item.type === 'error' ? 'bg-rose-100 text-rose-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                        <span>Sent to: {item.recipientType === 'all' ? `All users (${item.recipientCount})` : '1 user'}</span>
                        <span>•</span>
                        <span>{new Date(item.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
