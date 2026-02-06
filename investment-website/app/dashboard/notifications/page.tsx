'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, Filter, DollarSign, AlertTriangle, Gift, Shield, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'transaction' | 'system' | 'promotion' | 'security'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationCenter() {
  const [filter, setFilter] = useState<'all' | 'transaction' | 'system' | 'promotion' | 'security'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // TODO: Replace with actual API call
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'transaction',
      title: 'Deposit Approved',
      message: 'Your deposit of $500 has been approved and added to your wallet.',
      read: false,
      createdAt: '2024-02-05T10:30:00Z',
    },
    {
      id: '2',
      type: 'security',
      title: 'Login from New Device',
      message: 'We detected a login from a new device in New York, USA.',
      read: false,
      createdAt: '2024-02-05T08:15:00Z',
    },
    {
      id: '3',
      type: 'transaction',
      title: 'Investment Profit Received',
      message: 'You received $45 profit from your Premier Plan investment.',
      read: true,
      createdAt: '2024-02-04T16:00:00Z',
    },
    {
      id: '4',
      type: 'promotion',
      title: 'New Investment Plan Available',
      message: 'Check out our new Elite Plan with 250% ROI in 30 days!',
      read: true,
      createdAt: '2024-02-04T12:00:00Z',
    },
    {
      id: '5',
      type: 'system',
      title: 'Scheduled Maintenance',
      message: 'Our system will undergo maintenance on Feb 10, 2024 from 2-4 AM UTC.',
      read: true,
      createdAt: '2024-02-03T09:00:00Z',
    },
  ])

  const getIcon = (type: Notification['type']) => {
    const icons = {
      transaction: <DollarSign className="text-emerald-500" size={20} />,
      system: <AlertTriangle className="text-blue-500" size={20} />,
      promotion: <Gift className="text-gold-500" size={20} />,
      security: <Shield className="text-rose-500" size={20} />,
    }
    return icons[type]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(
    n => filter === 'all' || n.type === filter
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    // TODO: Replace with actual API call
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = async () => {
    // TODO: Replace with actual API call
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDelete = async (id: string) => {
    // TODO: Replace with actual API call
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return
    // TODO: Replace with actual API call
    setNotifications([])
  }

  const stats = {
    all: notifications.length,
    unread: unreadCount,
    transaction: notifications.filter(n => n.type === 'transaction').length,
    system: notifications.filter(n => n.type === 'system').length,
    promotion: notifications.filter(n => n.type === 'promotion').length,
    security: notifications.filter(n => n.type === 'security').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              <CheckCheck size={18} />
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/30"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">All</p>
          <p className="text-2xl font-bold text-white">{stats.all}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Unread</p>
          <p className="text-2xl font-bold text-gold-500">{stats.unread}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Transactions</p>
          <p className="text-2xl font-bold text-emerald-500">{stats.transaction}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">System</p>
          <p className="text-2xl font-bold text-blue-500">{stats.system}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Promotions</p>
          <p className="text-2xl font-bold text-gold-500">{stats.promotion}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Security</p>
          <p className="text-2xl font-bold text-rose-500">{stats.security}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'transaction', 'system', 'promotion', 'security'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
              filter === type
                ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20'
                : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400">No notifications</p>
            <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-slate-800/30 transition-colors group ${
                  !notification.read ? 'bg-slate-800/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-gold-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{notification.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 capitalize px-2 py-1 bg-slate-800/50 rounded">
                        {notification.type}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Check size={14} />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
