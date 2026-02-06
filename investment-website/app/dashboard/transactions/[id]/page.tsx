'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, CreditCard, Hash, Calendar, FileText, User, Eye } from 'lucide-react'
import Image from 'next/image'

interface Transaction {
  id: string
  transactionId: string
  type: 'deposit' | 'withdrawal' | 'profit' | 'referral_commission'
  amount: number
  fee: number
  netAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'
  paymentMethod: string
  paymentGateway: string
  walletAddress?: string
  txHash?: string
  proofImage?: string
  createdAt: string
  updatedAt: string
  approvedAt?: string
  rejectedAt?: string
  adminNote?: string
  rejectionReason?: string
  statusHistory: Array<{
    status: string
    timestamp: string
    note?: string
  }>
}

export default function TransactionDetail() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.id as string

  const [showProofImage, setShowProofImage] = useState(false)

  // TODO: Replace with actual API call - GET /api/v1/transactions/:transactionId
  const [transaction] = useState<Transaction>({
    id: transactionId,
    transactionId: 'TXN-2024-001234',
    type: 'deposit',
    amount: 500,
    fee: 0,
    netAmount: 500,
    status: 'approved',
    paymentMethod: 'Bitcoin',
    paymentGateway: 'BTC Wallet',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    txHash: '0x7d8f3a4e9c2b1f5e8d7c6b5a4e3d2c1b9a8f7e6d5c4b3a2f1e0d9c8b7a6',
    proofImage: '/uploads/proof-123.jpg',
    createdAt: '2024-02-05T10:30:00Z',
    updatedAt: '2024-02-05T11:45:00Z',
    approvedAt: '2024-02-05T11:45:00Z',
    adminNote: 'Payment verified and confirmed on blockchain. Transaction processed successfully.',
    statusHistory: [
      {
        status: 'approved',
        timestamp: '2024-02-05T11:45:00Z',
        note: 'Payment verified and approved by admin',
      },
      {
        status: 'pending',
        timestamp: '2024-02-05T10:30:00Z',
        note: 'Transaction submitted for review',
      },
    ],
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: Transaction['status']) => {
    const icons = {
      pending: <Clock className="text-amber-500" size={24} />,
      approved: <CheckCircle className="text-emerald-500" size={24} />,
      rejected: <XCircle className="text-rose-500" size={24} />,
      completed: <CheckCircle className="text-blue-500" size={24} />,
      failed: <AlertCircle className="text-rose-500" size={24} />,
    }
    return icons[status]
  }

  const getStatusColor = (status: Transaction['status']) => {
    const colors = {
      pending: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      approved: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      rejected: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
      completed: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      failed: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    }
    return colors[status]
  }

  const getTypeColor = (type: Transaction['type']) => {
    const colors = {
      deposit: 'text-emerald-500 bg-emerald-500/10',
      withdrawal: 'text-rose-500 bg-rose-500/10',
      profit: 'text-blue-500 bg-blue-500/10',
      referral_commission: 'text-gold-500 bg-gold-500/10',
    }
    return colors[type]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-slate-400" size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">Transaction Details</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm">ID: {transaction.transactionId}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-6 border ${
        transaction.status === 'approved' || transaction.status === 'completed'
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : transaction.status === 'rejected' || transaction.status === 'failed'
          ? 'bg-rose-500/5 border-rose-500/30'
          : 'bg-amber-500/5 border-amber-500/30'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            transaction.status === 'approved' || transaction.status === 'completed'
              ? 'bg-emerald-500/10'
              : transaction.status === 'rejected' || transaction.status === 'failed'
              ? 'bg-rose-500/10'
              : 'bg-amber-500/10'
          }`}>
            {getStatusIcon(transaction.status)}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">
              {transaction.status === 'approved' && 'Transaction Approved'}
              {transaction.status === 'completed' && 'Transaction Completed'}
              {transaction.status === 'rejected' && 'Transaction Rejected'}
              {transaction.status === 'failed' && 'Transaction Failed'}
              {transaction.status === 'pending' && 'Transaction Pending Review'}
            </h3>
            <p className="text-slate-300 text-sm">
              {transaction.status === 'approved' && transaction.adminNote}
              {transaction.status === 'rejected' && transaction.rejectionReason}
              {transaction.status === 'pending' && 'Your transaction is being reviewed by our team. This usually takes 15-30 minutes.'}
              {transaction.status === 'failed' && 'The transaction failed to process. Please contact support.'}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Amount</p>
            <DollarSign className="text-gold-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${transaction.amount.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2 capitalize">{transaction.type} amount</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Fee</p>
            <CreditCard className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">${transaction.fee.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">Transaction fee</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Net Amount</p>
            <CheckCircle className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-emerald-400">${transaction.netAmount.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">After fees</p>
        </div>
      </div>

      {/* Transaction Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Transaction Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <Hash className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs mb-1">Transaction ID</p>
                <p className="text-white font-mono text-sm break-all">{transaction.transactionId}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <FileText className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Type</p>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(transaction.type)}`}>
                  {transaction.type.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <CreditCard className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Payment Method</p>
                <p className="text-white text-sm">{transaction.paymentMethod}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <User className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Payment Gateway</p>
                <p className="text-white text-sm">{transaction.paymentGateway}</p>
              </div>
            </div>

            {transaction.walletAddress && (
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Hash className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs mb-1">Wallet Address</p>
                  <p className="text-white font-mono text-sm break-all">{transaction.walletAddress}</p>
                </div>
              </div>
            )}

            {transaction.txHash && (
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Hash className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs mb-1">Transaction Hash</p>
                  <p className="text-white font-mono text-xs break-all">{transaction.txHash}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <Calendar className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Created At</p>
                <p className="text-white text-sm">{formatDate(transaction.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <Calendar className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Last Updated</p>
                <p className="text-white text-sm">{formatDate(transaction.updatedAt)}</p>
              </div>
            </div>

            {transaction.approvedAt && (
              <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/30 rounded-lg">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-emerald-400 text-xs mb-1">Approved At</p>
                  <p className="text-white text-sm">{formatDate(transaction.approvedAt)}</p>
                </div>
              </div>
            )}

            {transaction.rejectedAt && (
              <div className="flex items-start gap-3 p-3 bg-rose-500/5 border border-rose-500/30 rounded-lg">
                <XCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-rose-400 text-xs mb-1">Rejected At</p>
                  <p className="text-white text-sm">{formatDate(transaction.rejectedAt)}</p>
                </div>
              </div>
            )}

            {transaction.proofImage && (
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Eye className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Payment Proof</p>
                  <button
                    onClick={() => setShowProofImage(true)}
                    className="text-gold-500 hover:text-gold-400 text-sm font-medium flex items-center gap-1"
                  >
                    View Screenshot
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status History */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Status History</h3>
        <div className="space-y-4">
          {transaction.statusHistory.map((history, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  history.status === 'approved' || history.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : history.status === 'rejected' || history.status === 'failed'
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {history.status === 'approved' ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                {index < transaction.statusHistory.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-700 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium capitalize">{history.status}</span>
                  <span className="text-slate-500 text-xs">{formatDate(history.timestamp)}</span>
                </div>
                {history.note && <p className="text-slate-400 text-sm">{history.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof Image Modal */}
      {showProofImage && transaction.proofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" onClick={() => setShowProofImage(false)}>
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Payment Proof</h3>
              <button onClick={() => setShowProofImage(false)} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              <img
                src={transaction.proofImage}
                alt="Payment Proof"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
