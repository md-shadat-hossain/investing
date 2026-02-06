import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, X, Send, User, AlertCircle, Filter, Search } from 'lucide-react';

interface Ticket {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    image?: string;
  };
  subject: string;
  message: string;
  category: 'general' | 'deposit' | 'withdrawal' | 'investment' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: {
    _id: string;
    fullName: string;
  };
  rating?: number;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

interface Reply {
  _id: string;
  message: string;
  sender: {
    _id: string;
    fullName: string;
    role: 'user' | 'admin';
  };
  createdAt: string;
}

export const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // TODO: Replace with actual API calls
    setTickets([
      {
        _id: '1',
        user: {
          _id: 'u1',
          fullName: 'John Doe',
          email: 'john@example.com',
          image: 'https://picsum.photos/id/1005/100/100'
        },
        subject: 'Cannot withdraw funds',
        message: 'I am trying to withdraw $500 but the system shows an error. Please help.',
        category: 'withdrawal',
        priority: 'high',
        status: 'open',
        replies: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        _id: '2',
        user: {
          _id: 'u2',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          image: 'https://picsum.photos/id/1011/100/100'
        },
        subject: 'How to verify my account?',
        message: 'What documents do I need to submit for KYC verification?',
        category: 'general',
        priority: 'medium',
        status: 'in-progress',
        assignedTo: {
          _id: 'a1',
          fullName: 'Admin User'
        },
        replies: [
          {
            _id: 'r1',
            message: 'You need to submit a government-issued ID and proof of address.',
            sender: {
              _id: 'a1',
              fullName: 'Admin User',
              role: 'admin'
            },
            createdAt: new Date(Date.now() - 1800000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]);
  }, []);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setLoading(true);
    try {
      // TODO: Call API - POST /api/v1/tickets/:ticketId/reply
      alert('Reply sent successfully');
      setReplyMessage('');
    } catch (error) {
      alert('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      // TODO: Call API - PATCH /api/v1/tickets/admin/:ticketId/status
      alert(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update ticket status');
    }
  };

  const handleAssignTicket = async (ticketId: string, adminId: string) => {
    try {
      // TODO: Call API - POST /api/v1/tickets/admin/:ticketId/assign
      alert('Ticket assigned successfully');
    } catch (error) {
      alert('Failed to assign ticket');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-700 bg-rose-100';
      case 'medium': return 'text-amber-700 bg-amber-100';
      case 'low': return 'text-blue-700 bg-blue-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-700 bg-blue-100';
      case 'in-progress': return 'text-amber-700 bg-amber-100';
      case 'resolved': return 'text-emerald-700 bg-emerald-100';
      case 'closed': return 'text-slate-700 bg-slate-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-900">Support Tickets</h1>
        <p className="text-slate-500 text-sm mt-1">Manage and respond to user support tickets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Tickets</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-navy-50 rounded-xl">
              <MessageSquare className="text-navy-900" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Open</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{stats.open}</h3>
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> Needs attention
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">In Progress</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{stats.inProgress}</h3>
              <p className="text-xs text-slate-500 mt-2">Being handled</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <MessageSquare className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Resolved</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{stats.resolved}</h3>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle size={12} /> Completed
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-4 border-b border-slate-100">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                <p>No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedTicket?._id === ticket._id ? 'bg-navy-50 border-l-4 border-navy-900' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={ticket.user.image || '/uploads/users/user.png'}
                      alt={ticket.user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-navy-900 truncate">{ticket.subject}</h4>
                      <p className="text-xs text-slate-500 mt-1">{ticket.user.fullName}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
          {!selectedTicket ? (
            <div className="flex items-center justify-center h-full min-h-[400px] text-slate-400">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 opacity-20" />
                <p>Select a ticket to view details</p>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedTicket.user.image || '/uploads/users/user.png'}
                      alt={selectedTicket.user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-navy-900">{selectedTicket.subject}</h2>
                      <p className="text-sm text-slate-600 mt-1">
                        {selectedTicket.user.fullName} • {selectedTicket.user.email}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Created {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority} priority
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-slate-100 text-slate-700">
                    {selectedTicket.category}
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
                {/* Original Message */}
                <div className="flex gap-4">
                  <img
                    src={selectedTicket.user.image || '/uploads/users/user.png'}
                    alt={selectedTicket.user.fullName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm text-navy-900">{selectedTicket.user.fullName}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(selectedTicket.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{selectedTicket.message}</p>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {selectedTicket.replies.map((reply) => (
                  <div key={reply._id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {reply.sender.role === 'admin' ? 'A' : 'U'}
                    </div>
                    <div className="flex-1">
                      <div className={`rounded-lg p-4 ${reply.sender.role === 'admin' ? 'bg-navy-50' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm text-navy-900">{reply.sender.fullName}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                          {reply.sender.role === 'admin' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-navy-900 text-white">Admin</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700">{reply.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="p-6 border-t border-slate-100">
                <div className="space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none text-sm"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleReply}
                      disabled={loading || !replyMessage.trim()}
                      className="flex items-center gap-2 bg-navy-900 text-white px-6 py-2 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <Send size={16} />
                      {loading ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
