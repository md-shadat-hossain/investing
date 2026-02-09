import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  FileText,
  Shield,
  Wallet,
  Building2,
  Hash,
  Image,
  X,
} from 'lucide-react';
import { useGetTransactionByIdQuery, useApproveTransactionMutation, useRejectTransactionMutation } from '../store/api/transactionApi';
import { Toast, ToastType } from './ui/Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.10.11.87:8080';

export const TransactionDetail: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetTransactionByIdQuery(transactionId || '');
  const [approveTransaction, { isLoading: approving }] = useApproveTransactionMutation();
  const [rejectTransaction, { isLoading: rejecting }] = useRejectTransactionMutation();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const tx = data?.data?.attributes;

  const handleApprove = async () => {
    try {
      await approveTransaction({ transactionId: tx.id || tx._id, adminNote: adminNote || undefined }).unwrap();
      setToast({ message: 'Transaction Approved Successfully', type: 'success' });
      setAdminNote('');
    } catch (err: any) {
      setToast({ message: err?.data?.message || 'Failed to approve transaction', type: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setToast({ message: 'Please provide a reason for rejection', type: 'error' });
      return;
    }
    try {
      await rejectTransaction({ transactionId: tx.id || tx._id, reason: rejectReason }).unwrap();
      setToast({ message: 'Transaction Rejected', type: 'error' });
      setRejectModal(false);
      setRejectReason('');
    } catch (err: any) {
      setToast({ message: err?.data?.message || 'Failed to reject transaction', type: 'error' });
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setToast({ message: 'Copied to clipboard', type: 'success' });
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setToast({ message: 'Copied to clipboard', type: 'success' });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-500' };
      case 'rejected':
      case 'cancelled':
        return { label: status === 'cancelled' ? 'Cancelled' : 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle, iconColor: 'text-rose-500' };
      case 'processing':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, iconColor: 'text-blue-500' };
      default:
        return { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertCircle, iconColor: 'text-amber-500' };
    }
  };

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; color: string; sign: string }> = {
      deposit: { label: 'Deposit', color: 'text-emerald-600', sign: '+' },
      withdraw: { label: 'Withdrawal', color: 'text-rose-600', sign: '-' },
      investment: { label: 'Investment', color: 'text-blue-600', sign: '-' },
      profit: { label: 'Profit', color: 'text-emerald-600', sign: '+' },
      referral: { label: 'Referral Commission', color: 'text-purple-600', sign: '+' },
      bonus: { label: 'Bonus', color: 'text-gold-600', sign: '+' },
      fee: { label: 'Fee', color: 'text-slate-600', sign: '-' },
    };
    return configs[type] || { label: type, color: 'text-slate-600', sign: '' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle size={48} className="text-rose-400" />
        <h3 className="text-lg font-semibold text-navy-900">Transaction Not Found</h3>
        <p className="text-slate-500 text-sm">The transaction you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/history')} className="text-gold-600 hover:text-gold-700 font-medium text-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Transaction History
        </button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(tx.status);
  const typeConfig = getTypeConfig(tx.type);
  const StatusIcon = statusConfig.icon;
  const proofImageUrl = tx.proofImage ? `${API_BASE_URL}/${tx.proofImage}` : null;

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/history')} className="flex items-center gap-2 text-slate-500 hover:text-navy-900 transition-colors text-sm mb-4">
          <ArrowLeft size={18} /> Back to Transaction History
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-navy-900">Transaction Details</h2>
            <p className="text-slate-500 text-sm mt-1">Complete information for this transaction.</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wider ${statusConfig.color}`}>
            <StatusIcon size={18} />
            {statusConfig.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info - Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Transaction Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300 font-medium">Transaction Amount</p>
                  <p className={`text-3xl font-bold mt-1 ${tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral' || tx.type === 'bonus' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {typeConfig.sign}${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium capitalize">
                    {typeConfig.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Amount Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">Gross Amount</p>
                  <p className="text-lg font-bold text-navy-900 mt-1">${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">Fee</p>
                  <p className="text-lg font-bold text-rose-600 mt-1">${tx.fee?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">Net Amount</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">${tx.netAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Transaction Info Grid */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <InfoRow icon={Hash} label="Transaction ID" value={tx.transactionId} copyable onCopy={copyToClipboard} />
                <InfoRow icon={CreditCard} label="Payment Method" value={tx.paymentMethod} capitalize />
                {tx.paymentGateway && (
                  <InfoRow icon={Building2} label="Payment Gateway" value={tx.paymentGateway.name || '-'} />
                )}
                {tx.walletAddress && (
                  <InfoRow icon={Wallet} label="Wallet Address" value={tx.walletAddress} copyable onCopy={copyToClipboard} />
                )}
                {tx.txHash && (
                  <InfoRow icon={ExternalLink} label="Tx Hash / Reference" value={tx.txHash} copyable onCopy={copyToClipboard} />
                )}
                {tx.description && (
                  <InfoRow icon={FileText} label="Description" value={tx.description} />
                )}
              </div>
            </div>
          </div>

          {/* Bank Details (if withdrawal with bank) */}
          {tx.bankDetails && (tx.bankDetails.bankName || tx.bankDetails.accountNumber) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-slate-400" /> Bank Details
              </h3>
              <div className="space-y-3">
                {tx.bankDetails.bankName && <InfoRow label="Bank Name" value={tx.bankDetails.bankName} />}
                {tx.bankDetails.accountName && <InfoRow label="Account Name" value={tx.bankDetails.accountName} />}
                {tx.bankDetails.accountNumber && <InfoRow label="Account Number" value={tx.bankDetails.accountNumber} copyable onCopy={copyToClipboard} />}
                {tx.bankDetails.routingNumber && <InfoRow label="Routing Number" value={tx.bankDetails.routingNumber} />}
                {tx.bankDetails.swiftCode && <InfoRow label="SWIFT Code" value={tx.bankDetails.swiftCode} />}
              </div>
            </div>
          )}

          {/* Proof Image */}
          {proofImageUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Image size={16} className="text-slate-400" /> Payment Proof
              </h3>
              <div
                className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200 max-h-72 flex items-center justify-center bg-slate-50"
                onClick={() => setShowProofModal(true)}
              >
                <img
                  src={proofImageUrl}
                  alt="Payment proof"
                  className="max-h-72 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect fill="%23f1f5f9" width="200" height="150"/><text fill="%2394a3b8" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Image not available</text></svg>'; }}
                />
                <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium text-sm bg-navy-900/70 px-4 py-2 rounded-lg">
                    Click to view full size
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Actions (if pending) */}
          {tx.status === 'pending' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={16} className="text-slate-400" /> Admin Actions
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Admin Note (optional)</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add a note for this action..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {approving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    Approve Transaction
                  </button>
                  <button
                    onClick={() => setRejectModal(true)}
                    disabled={rejecting}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={18} /> Reject Transaction
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} className="text-slate-400" /> User Information
            </h3>
            {tx.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {tx.user.image ? (
                    <img src={`${API_BASE_URL}${tx.user.image}`} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-lg">
                      {(tx.user.firstName?.[0] || tx.user.email?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-navy-900">{tx.user.fullName || `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim() || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{tx.user.email}</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  {tx.user.phoneNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Phone</span>
                      <span className="text-navy-900 font-medium">{tx.user.callingCode || ''}{tx.user.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">User ID</span>
                    <span className="text-navy-900 font-mono text-xs">{(tx.user.id || tx.user._id || '').slice(-8)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Verified</span>
                    <span className={`font-medium ${tx.user.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {tx.user.isEmailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/users')}
                  className="w-full text-center text-sm text-gold-600 hover:text-gold-700 font-medium py-2 border border-gold-200 rounded-lg hover:bg-gold-50 transition-colors"
                >
                  View Full Profile
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-400">User information not available</p>
            )}
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Timeline
            </h3>
            <div className="space-y-4">
              <TimelineItem
                label="Created"
                date={formatDate(tx.createdAt)}
                active
              />
              {tx.updatedAt && tx.updatedAt !== tx.createdAt && (
                <TimelineItem
                  label="Last Updated"
                  date={formatDate(tx.updatedAt)}
                  active
                />
              )}
              {tx.processedAt && (
                <TimelineItem
                  label={tx.status === 'completed' ? 'Approved' : tx.status === 'rejected' ? 'Rejected' : 'Processed'}
                  date={formatDate(tx.processedAt)}
                  active
                  highlight={tx.status === 'completed' ? 'emerald' : 'rose'}
                />
              )}
            </div>
          </div>

          {/* Admin Processing Info */}
          {(tx.processedBy || tx.adminNote) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={16} className="text-slate-400" /> Admin Info
              </h3>
              <div className="space-y-3">
                {tx.processedBy && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Processed By</p>
                    <p className="text-sm font-medium text-navy-900">
                      {tx.processedBy.fullName || `${tx.processedBy.firstName || ''} ${tx.processedBy.lastName || ''}`.trim() || tx.processedBy.email || 'Admin'}
                    </p>
                  </div>
                )}
                {tx.adminNote && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Admin Note</p>
                    <p className="text-sm text-navy-900 bg-slate-50 rounded-lg p-3 border border-slate-100">{tx.adminNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Gateway Info */}
          {tx.paymentGateway && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-slate-400" /> Gateway Info
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Name</span>
                  <span className="text-navy-900 font-medium">{tx.paymentGateway.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Type</span>
                  <span className="text-navy-900 font-medium capitalize">{tx.paymentGateway.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Currency</span>
                  <span className="text-navy-900 font-medium">{tx.paymentGateway.currency} {tx.paymentGateway.symbol || ''}</span>
                </div>
                {tx.paymentGateway.processingTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Processing</span>
                    <span className="text-navy-900 font-medium">{tx.paymentGateway.processingTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proof Image Modal */}
      {showProofModal && proofImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm p-4" onClick={() => setShowProofModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-slate-50 transition-colors z-10"
            >
              <X size={20} className="text-navy-900" />
            </button>
            <img
              src={proofImageUrl}
              alt="Payment proof"
              className="w-full max-h-[85vh] object-contain rounded-xl bg-white shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <XCircle className="text-rose-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">Reject Transaction</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for rejection *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this transaction is being rejected..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(false); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {rejecting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Components ---

const InfoRow: React.FC<{
  icon?: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
  capitalize?: boolean;
  onCopy?: (text: string) => void;
}> = ({ icon: Icon, label, value, copyable, capitalize, onCopy }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2 text-sm text-slate-500">
      {Icon && <Icon size={15} className="text-slate-400" />}
      <span>{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium text-navy-900 font-mono ${capitalize ? 'capitalize' : ''}`}>
        {value || '-'}
      </span>
      {copyable && value && (
        <button onClick={() => onCopy?.(value)} className="text-slate-400 hover:text-navy-900 transition-colors">
          <Copy size={14} />
        </button>
      )}
    </div>
  </div>
);

const TimelineItem: React.FC<{
  label: string;
  date: string;
  active?: boolean;
  highlight?: 'emerald' | 'rose';
}> = ({ label, date, active, highlight }) => {
  const dotColor = highlight === 'emerald' ? 'bg-emerald-500' : highlight === 'rose' ? 'bg-rose-500' : active ? 'bg-navy-900' : 'bg-slate-300';
  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center mt-1.5">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
        <div className="w-px h-full bg-slate-200 min-h-[16px]"></div>
      </div>
      <div className="pb-2">
        <p className="text-sm font-medium text-navy-900">{label}</p>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
    </div>
  );
};
