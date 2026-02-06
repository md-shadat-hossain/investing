'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Star, Clock, CheckCircle, User, Shield, Paperclip } from 'lucide-react'

interface Message {
  id: string
  sender: 'user' | 'admin'
  senderName: string
  message: string
  createdAt: string
  attachments?: string[]
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high'
  category: string
  createdAt: string
  messages: Message[]
  rating?: number
}

export default function TicketDetail() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [replyMessage, setReplyMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingFeedback, setRatingFeedback] = useState('')

  // TODO: Replace with actual API call
  const [ticket, setTicket] = useState<Ticket>({
    id: ticketId,
    ticketNumber: 'TKT-2024-001',
    subject: 'Unable to withdraw funds',
    status: 'in-progress',
    priority: 'high',
    category: 'Withdrawal',
    createdAt: '2024-02-01T10:30:00Z',
    messages: [
      {
        id: '1',
        sender: 'user',
        senderName: 'You',
        message: 'Hi, I\'m having trouble withdrawing my funds. When I try to submit a withdrawal request, I get an error message saying "Insufficient balance" even though I have $500 in my account. Can you please help?',
        createdAt: '2024-02-01T10:30:00Z',
      },
      {
        id: '2',
        sender: 'admin',
        senderName: 'Support Team',
        message: 'Hello! Thank you for contacting us. I\'ve reviewed your account and I can see the issue. Your account has $500 total balance, but $450 is currently locked in an active investment plan. You have $50 available for withdrawal. Would you like to proceed with withdrawing the available amount?',
        createdAt: '2024-02-01T14:20:00Z',
      },
      {
        id: '3',
        sender: 'user',
        senderName: 'You',
        message: 'Oh I see! I didn\'t realize that. Can I cancel my investment to get the full amount back?',
        createdAt: '2024-02-01T15:45:00Z',
      },
      {
        id: '4',
        sender: 'admin',
        senderName: 'Support Team',
        message: 'Unfortunately, active investments cannot be cancelled mid-term. However, your investment will complete in 3 days and the funds will be automatically added to your available balance. You can then withdraw the full amount plus the profit earned. Is there anything else I can help you with?',
        createdAt: '2024-02-02T09:10:00Z',
      },
    ],
  })

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) return

    setIsSending(true)

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/v1/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      })

      if (response.ok) {
        const newMessage: Message = {
          id: `${ticket.messages.length + 1}`,
          sender: 'user',
          senderName: 'You',
          message: replyMessage,
          createdAt: new Date().toISOString(),
        }
        setTicket(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage],
        }))
        setReplyMessage('')
      }
    } catch (err) {
      alert('Failed to send reply. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleRateTicket = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/v1/tickets/${ticketId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          rating,
          feedback: ratingFeedback,
        }),
      })

      if (response.ok) {
        setTicket(prev => ({ ...prev, rating }))
        setShowRatingForm(false)
        alert('Thank you for your feedback!')
      }
    } catch (err) {
      alert('Failed to submit rating. Please try again.')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: Ticket['status']) => {
    const colors = {
      open: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      'in-progress': 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      resolved: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      closed: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
    }
    return colors[status]
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    const colors = {
      low: 'text-slate-400 bg-slate-500/10',
      normal: 'text-blue-400 bg-blue-500/10',
      high: 'text-rose-400 bg-rose-500/10',
    }
    return colors[priority]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/support/tickets"
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-slate-400" size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('-', ' ')}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority} priority
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            #{ticket.ticketNumber} • {ticket.category} • Created {formatTime(ticket.createdAt)}
          </p>
        </div>
      </div>

      {/* Ticket Info Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Status</p>
            <div className="flex items-center gap-2">
              {ticket.status === 'resolved' ? (
                <CheckCircle className="text-emerald-500" size={16} />
              ) : (
                <Clock className="text-amber-500" size={16} />
              )}
              <p className="text-white font-medium capitalize">{ticket.status.replace('-', ' ')}</p>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Priority</p>
            <p className="text-white font-medium capitalize">{ticket.priority}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Category</p>
            <p className="text-white font-medium">{ticket.category}</p>
          </div>
        </div>

        {ticket.status === 'resolved' && !ticket.rating && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-medium mb-1">Rate your support experience</h3>
                <p className="text-slate-400 text-sm">Help us improve our service by rating this ticket</p>
              </div>
              <button
                onClick={() => setShowRatingForm(true)}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-colors"
              >
                Rate Ticket
              </button>
            </div>
          </div>
        )}

        {ticket.rating && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-slate-400 text-sm mb-2">Your Rating</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={star <= ticket.rating! ? 'text-gold-500 fill-gold-500' : 'text-slate-600'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white font-semibold">Conversation</h2>
        </div>
        <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.sender === 'user'
                  ? 'bg-gold-500/10 text-gold-500'
                  : 'bg-blue-500/10 text-blue-500'
              }`}>
                {message.sender === 'user' ? <User size={20} /> : <Shield size={20} />}
              </div>
              <div className={`flex-1 max-w-2xl ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${message.sender === 'user' ? 'text-gold-500' : 'text-blue-500'}`}>
                    {message.senderName}
                  </span>
                  <span className="text-xs text-slate-500">{formatTime(message.createdAt)}</span>
                </div>
                <div className={`p-4 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-gold-500/10 border border-gold-500/30'
                    : 'bg-slate-800/50 border border-slate-700'
                }`}>
                  <p className="text-slate-200 text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <form onSubmit={handleSendReply}>
            <label className="block text-white font-medium mb-3">Reply to Ticket</label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 resize-none"
              placeholder="Type your message here..."
              disabled={isSending}
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-slate-500 text-sm">
                Average response time: 2-4 hours
              </p>
              <button
                type="submit"
                disabled={isSending || !replyMessage.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-amber-600 text-white px-6 py-2.5 rounded-lg hover:from-gold-600 hover:to-amber-700 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Send size={18} />
                {isSending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold text-white mb-2">Rate Your Experience</h3>
            <p className="text-slate-400 text-sm mb-6">How satisfied were you with the support provided?</p>

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={star <= rating ? 'text-gold-500 fill-gold-500' : 'text-slate-600'}
                  />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Additional Feedback (Optional)
              </label>
              <textarea
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none"
                placeholder="Tell us more about your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingForm(false)}
                className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRateTicket}
                className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-white rounded-lg hover:from-gold-600 hover:to-amber-700 transition-all shadow-lg shadow-gold-500/20 font-medium"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
