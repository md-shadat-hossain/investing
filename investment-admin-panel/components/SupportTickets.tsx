import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Clock, CheckCircle, X, Send, AlertCircle, Search, ChevronDown, Check, ArrowLeft, Star } from 'lucide-react';
import { useGetAllTicketsQuery, useGetTicketStatsQuery, useGetTicketByIdQuery, useUpdateTicketStatusMutation, useAssignTicketMutation, useAddReplyMutation } from '../store/api/ticketApi';
import { Toast, ToastType } from './ui/Toast';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.10.11.87:8080';
const IMAGE_BASE = API_BASE_URL.replace('/api/v1', '');

export const SupportTickets: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API hooks
  const queryParams: any = { page, limit: 50 };
  if (statusFilter !== 'all') queryParams.status = statusFilter;
  if (priorityFilter !== 'all') queryParams.priority = priorityFilter;

  const { data: ticketsData, isLoading: ticketsLoading } = useGetAllTicketsQuery(queryParams);
  const { data: statsData } = useGetTicketStatsQuery();
  const { data: ticketDetailData, isLoading: detailLoading } = useGetTicketByIdQuery(selectedTicketId || '', { skip: !selectedTicketId });
  const [updateTicketStatus] = useUpdateTicketStatusMutation();
  const [assignTicket] = useAssignTicketMutation();
  const [addReply, { isLoading: replying }] = useAddReplyMutation();

  const tickets = ticketsData?.data?.attributes?.results || [];
  const totalResults = ticketsData?.data?.attributes?.totalResults || 0;
  const selectedTicket = ticketDetailData?.data?.attributes || null;

  const rawStats = statsData?.data?.attributes || {};
  const byStatus = rawStats.byStatus || {};
  const stats = {
    total: (byStatus.open || 0) + (byStatus.in_progress || 0) + (byStatus.waiting_reply || 0) + (byStatus.resolved || 0) + (byStatus.closed || 0),
    open: (byStatus.open || 0) + (byStatus.waiting_reply || 0),
    inProgress: byStatus.in_progress || 0,
    resolved: (byStatus.resolved || 0) + (byStatus.closed || 0),
    avgRating: rawStats.averageRating || 0,
  };

  // Scroll to bottom of messages when ticket changes
  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket]);

  // Filter tickets by search (client-side on current page)
  const filteredTickets = tickets.filter((ticket: any) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      ticket.subject?.toLowerCase().includes(s) ||
      ticket.ticketId?.toLowerCase().includes(s) ||
      ticket.user?.fullName?.toLowerCase().includes(s) ||
      ticket.user?.email?.toLowerCase().includes(s)
    );
  });

  const handleReply = async () => {
    if (!selectedTicketId || !replyMessage.trim()) return;
    try {
      await addReply({ ticketId: selectedTicketId, message: replyMessage.trim() }).unwrap();
      setReplyMessage('');
      setToast({ message: 'Reply sent successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error?.data?.message || 'Failed to send reply', type: 'error' });
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicketStatus({ ticketId, status: newStatus }).unwrap();
      setToast({ message: `Ticket status updated to ${newStatus.replace('_', ' ')}`, type: 'success' });
    } catch (error: any) {
      setToast({ message: error?.data?.message || 'Failed to update status', type: 'error' });
    }
  };

  const handleAssignToMe = async (ticketId: string) => {
    if (!currentUser?.id) return;
    try {
      await assignTicket({ ticketId, adminId: currentUser.id }).unwrap();
      setToast({ message: 'Ticket assigned to you', type: 'success' });
    } catch (error: any) {
      setToast({ message: error?.data?.message || 'Failed to assign ticket', type: 'error' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-rose-700 bg-rose-100';
      case 'high': return 'text-rose-700 bg-rose-100';
      case 'normal': return 'text-amber-700 bg-amber-100';
      case 'low': return 'text-blue-700 bg-blue-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-700 bg-blue-100';
      case 'in_progress': return 'text-amber-700 bg-amber-100';
      case 'waiting_reply': return 'text-purple-700 bg-purple-100';
      case 'resolved': return 'text-emerald-700 bg-emerald-100';
      case 'closed': return 'text-slate-700 bg-slate-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
              {stats.open > 0 && (
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Needs attention
                </p>
              )}
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
              {stats.avgRating > 0 && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <Star size={12} /> Avg Rating: {stats.avgRating.toFixed(1)}/5
                </p>
              )}
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
        <div className={`bg-white rounded-xl shadow-sm border border-slate-100 ${selectedTicketId ? 'hidden lg:block' : ''} lg:col-span-1`}>
          <div className="p-4 border-b border-slate-100">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_reply">Waiting Reply</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-white"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {ticketsLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-400">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                <p>No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket: any) => (
                <div
                  key={ticket.id || ticket._id}
                  onClick={() => setSelectedTicketId(ticket.id || ticket._id)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedTicketId === (ticket.id || ticket._id) ? 'bg-navy-50 border-l-4 border-l-navy-900' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {ticket.user?.image ? (
                      <img
                        src={`${IMAGE_BASE}${ticket.user.image}`}
                        alt={ticket.user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(ticket.user?.fullName?.[0] || ticket.user?.email?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                          {formatStatus(ticket.status)}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-navy-900 truncate">{ticket.subject}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500 truncate">{ticket.user?.fullName || ticket.user?.email}</p>
                        <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{timeAgo(ticket.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination footer */}
          {totalResults > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500 text-center">
              Showing {filteredTickets.length} of {totalResults} tickets
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div className={`lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 ${!selectedTicketId ? '' : ''}`}>
          {!selectedTicketId ? (
            <div className="flex items-center justify-center h-full min-h-[500px] text-slate-400">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">Select a ticket to view details</p>
                <p className="text-sm mt-1">Click on a ticket from the list</p>
              </div>
            </div>
          ) : detailLoading ? (
            <div className="flex items-center justify-center h-full min-h-[500px]">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-400">Loading ticket...</p>
              </div>
            </div>
          ) : !selectedTicket ? (
            <div className="flex items-center justify-center h-full min-h-[500px] text-slate-400">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-3 opacity-20" />
                <p>Ticket not found</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full max-h-[calc(100vh-280px)]">
              {/* Ticket Header */}
              <div className="p-5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {/* Mobile back button */}
                    <button
                      onClick={() => setSelectedTicketId(null)}
                      className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors mt-0.5"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    {selectedTicket.user?.image ? (
                      <img
                        src={`${IMAGE_BASE}${selectedTicket.user.image}`}
                        alt={selectedTicket.user.fullName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(selectedTicket.user?.fullName?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-navy-900 leading-tight">{selectedTicket.subject}</h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {selectedTicket.user?.fullName} &middot; {selectedTicket.user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>#{selectedTicket.ticketId}</span>
                        <span>&middot;</span>
                        <span>{formatDate(selectedTicket.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tags & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${getStatusColor(selectedTicket.status)}`}>
                    {formatStatus(selectedTicket.status)}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority} priority
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600 capitalize">
                    {selectedTicket.category}
                  </span>

                  {selectedTicket.assignedTo && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-navy-50 text-navy-700">
                      Assigned: {selectedTicket.assignedTo.fullName || selectedTicket.assignedTo.email}
                    </span>
                  )}

                  {selectedTicket.rating && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gold-50 text-gold-700 flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {selectedTicket.rating}/5
                    </span>
                  )}

                  <div className="flex gap-2 ml-auto">
                    {!selectedTicket.assignedTo && (
                      <button
                        onClick={() => handleAssignToMe(selectedTicket.id || selectedTicket._id)}
                        className="px-3 py-1.5 text-xs font-medium bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
                      >
                        Assign to Me
                      </button>
                    )}
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id || selectedTicket._id, e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_reply">Waiting Reply</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Original message + all replies from messages array */}
                {(selectedTicket.messages || []).map((msg: any, idx: number) => {
                  const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'superAdmin';
                  const senderName = msg.sender?.fullName || msg.sender?.email || (isAdmin ? 'Admin' : 'User');
                  const senderImage = msg.sender?.image;

                  return (
                    <div key={msg._id || msg.id || idx} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                      {senderImage ? (
                        <img
                          src={`${IMAGE_BASE}${senderImage}`}
                          alt={senderName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          isAdmin ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {senderName[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className={`max-w-[75%] ${isAdmin ? 'text-right' : ''}`}>
                        <div className={`rounded-xl px-4 py-3 ${
                          isAdmin ? 'bg-navy-900 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-1.5 text-xs text-slate-400 ${isAdmin ? 'justify-end' : ''}`}>
                          <span className="font-medium">{senderName}</span>
                          {isAdmin && <span className="bg-navy-100 text-navy-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">ADMIN</span>}
                          <span>&middot;</span>
                          <span>{timeAgo(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <div className="p-4 border-t border-slate-100 flex-shrink-0">
                  <div className="flex gap-3">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 resize-none text-sm outline-none"
                    />
                    <button
                      onClick={handleReply}
                      disabled={replying || !replyMessage.trim()}
                      className="self-end flex items-center gap-2 bg-navy-900 text-white px-5 py-2.5 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex-shrink-0"
                    >
                      {replying ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Press Enter to send, Shift+Enter for new line</p>
                </div>
              )}

              {/* Closed ticket notice */}
              {selectedTicket.status === 'closed' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center flex-shrink-0">
                  <p className="text-sm text-slate-500">This ticket is closed. Change status to reopen it.</p>
                  {selectedTicket.feedback && (
                    <p className="text-xs text-slate-400 mt-1">User Feedback: "{selectedTicket.feedback}"</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
