import React, { useState, useEffect } from 'react';
import {
  Search,
  Trash2,
  ChevronLeft,
  Shield,
  Key,
  Ban,
  Mail,
  Save,
  CreditCard,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Minus,
  X,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useToggleBlockUserMutation,
  useAddBalanceMutation,
  useDeductBalanceMutation,
  useDeleteUserMutation,
  useAdminUpdateUserMutation,
  useAdminResetPasswordMutation,
} from '../store/api/userApi';
import { useGetAllTransactionsQuery } from '../store/api/transactionApi';
import { Toast, ToastType } from './ui/Toast';

const IMAGE_BASE_URL = 'http://10.10.11.87:8080';

// Extract error message from RTK Query error (handles all error shapes)
const getErrorMessage = (err: any, fallback: string): string => {
  // Server returned an error response: { status: number, data: { message: "..." } }
  if (err?.data?.message) return err.data.message;
  // Validation errors from Joi
  if (err?.data?.error) return err.data.error;
  // Network / fetch errors
  if (err?.error) return err.error;
  // Generic message property
  if (err?.message) return err.message;
  // Status text
  if (err?.status) return `Request failed with status ${err.status}`;
  return fallback;
};

// ============================================================
// Reusable Modal component (defined outside to keep stable identity)
// ============================================================
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-navy-900 text-lg">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-navy-900 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// Helper Icon for the form
const UserIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ============================================================
// UserListView — standalone component (stable identity, no remount)
// ============================================================
interface UserListViewProps {
  onUserClick: (userId: string) => void;
}

const UserListView: React.FC<UserListViewProps> = ({ onUserClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: usersResponse, isLoading, error } = useGetAllUsersQuery({ page: currentPage, limit: 10 });

  const usersData = usersResponse?.data?.attributes || {};
  const rawUsers = usersData.results || [];
  const pagination = {
    page: usersData.page || 1,
    totalPages: usersData.totalPages || 1,
    totalResults: usersData.totalResults || 0,
  };

  const users = rawUsers.map((user: any) => ({
    ...user,
    id: user._id || user.id,
    name: user.fullName || `${user.firstName} ${user.lastName}`,
    avatar: user.image ? `${IMAGE_BASE_URL}${user.image}` : `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`,
    joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    status: user.isBlocked ? 'blocked' : 'active',
    balance: user.walletBalance || 0,
    plan: user.currentPlan || 'None',
  }));

  const filteredUsers = users.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-rose-600" size={32} />
          </div>
          <p className="text-rose-600 font-medium">Failed to load users</p>
          <p className="text-slate-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-navy-900">User Management</h2>
          <p className="text-slate-500 text-sm">Manage user access and details. {pagination.totalResults} users total.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user: any) => (
                <tr
                  key={user.id}
                  onClick={() => onUserClick(user.id)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="text-sm font-semibold text-navy-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.joinedDate}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{user.plan || 'None'}</td>
                  <td className="px-6 py-4 font-mono text-sm text-navy-900 font-medium">
                    ${user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}
                    `}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-gold-600 hover:text-gold-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ============================================================
// UserDetailView — standalone component (stable identity, no remount)
// ============================================================
interface UserDetailViewProps {
  userId: string;
  onBack: () => void;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId, onBack }) => {
  // RTK Query
  const { data: userDetailsResponse, isLoading: detailsLoading, refetch } = useGetUserByIdQuery(userId);
  const { data: txResponse, isLoading: txLoading } = useGetAllTransactionsQuery({ user: userId, limit: 20 });

  // Mutations
  const [toggleBlockUser] = useToggleBlockUserMutation();
  const [addBalanceMutation] = useAddBalanceMutation();
  const [deductBalanceMutation] = useDeductBalanceMutation();
  const [deleteUserMutation] = useDeleteUserMutation();
  const [adminUpdateUser] = useAdminUpdateUserMutation();
  const [adminResetPassword] = useAdminResetPasswordMutation();

  // All modal & form state lives HERE (no parent re-render on typing)
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [isDeductBalanceModalOpen, setIsDeductBalanceModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);

  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  // Derived data
  const details = userDetailsResponse?.data?.attributes;
  const userData = details?.user;
  const walletData = details?.wallet;
  const recentTransactions = details?.recentTransactions || [];
  const investments = details?.investments || [];

  // Edit profile form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [formDirty, setFormDirty] = useState(false);

  // Initialize form when user data loads
  useEffect(() => {
    if (userData) {
      setEditForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
      });
      setFormDirty(false);
    }
  }, [userData]);

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setFormDirty(true);
  };

  // ---- Action handlers ----
  const handleSaveProfile = async () => {
    setActionLoading(true);
    try {
      await adminUpdateUser({ userId, ...editForm }).unwrap();
      showToast('Profile updated successfully', 'success');
      setFormDirty(false);
      refetch();
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Failed to update profile'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendToggle = async () => {
    setActionLoading(true);
    try {
      await toggleBlockUser({ userId, reason: suspendReason }).unwrap();
      showToast(
        userData?.isBlocked ? 'User unsuspended successfully' : 'User suspended successfully',
        'success'
      );
      setIsSuspendModalOpen(false);
      setSuspendReason('');
      refetch();
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Failed to update user status'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      showToast('Password must contain both letters and numbers', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await adminResetPassword({ userId, newPassword }).unwrap();
      showToast('Password reset successfully', 'success');
      setIsResetPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Failed to reset password'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBalance = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await addBalanceMutation({ userId, amount: parseFloat(balanceAmount), reason: balanceReason }).unwrap();
      showToast(`Successfully added $${balanceAmount} to balance`, 'success');
      setIsAddBalanceModalOpen(false);
      setBalanceAmount('');
      setBalanceReason('');
      refetch();
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Failed to add balance'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeductBalance = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await deductBalanceMutation({ userId, amount: parseFloat(balanceAmount), reason: balanceReason }).unwrap();
      showToast(`Successfully deducted $${balanceAmount} from balance`, 'success');
      setIsDeductBalanceModalOpen(false);
      setBalanceAmount('');
      setBalanceReason('');
      refetch();
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Failed to deduct balance'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setActionLoading(true);
    try {
      await deleteUserMutation(userId).unwrap();
      showToast('User deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      onBack();
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Failed to delete user'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Render ----
  if (detailsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <X className="text-rose-600 mx-auto mb-4" size={32} />
          <p className="text-rose-600 font-medium">User not found</p>
          <button onClick={onBack} className="mt-4 text-sm text-navy-900 underline">Back to list</button>
        </div>
      </div>
    );
  }

  const userName = userData.fullName || `${userData.firstName} ${userData.lastName}`;
  const userAvatar = userData.image
    ? `${IMAGE_BASE_URL}${userData.image}`
    : `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random`;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-navy-900"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-display font-bold text-navy-900">User Profile</h2>
          <p className="text-slate-500 text-sm">Viewing details for <span className="font-semibold text-navy-900">{userName}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 rounded-full blur-[50px] opacity-20 pointer-events-none"></div>
            <div className="flex flex-col items-center text-center mb-6 z-10 relative">
              <img src={userAvatar} alt={userName} className="w-20 h-20 rounded-full border-4 border-white/10 shadow-md mb-3" />
              <h3 className="text-lg font-bold">{userName}</h3>
              <p className="text-sm text-slate-300">{userData.email}</p>
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                userData.isBlocked ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {userData.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </div>

            <div className="border-t border-white/10 pt-4 z-10 relative">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Member Since</p>
              <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 bg-gold-500 rounded-md text-navy-900">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-bold text-gold-400">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-300">Join date</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Balance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-semibold text-navy-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <Wallet size={16} /> Account Balance
              </h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Total Balance</p>
                <p className="text-2xl font-bold text-emerald-700 font-mono">
                  ${walletData?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ArrowDownRight size={12} className="text-blue-500" />
                    <p className="text-[10px] text-blue-600 font-semibold uppercase">Deposits</p>
                  </div>
                  <p className="text-sm font-bold text-blue-700 font-mono">
                    ${walletData?.totalDeposit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ArrowUpRight size={12} className="text-orange-500" />
                    <p className="text-[10px] text-orange-600 font-semibold uppercase">Withdrawals</p>
                  </div>
                  <p className="text-sm font-bold text-orange-700 font-mono">
                    ${walletData?.totalWithdraw?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center col-span-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp size={12} className="text-purple-500" />
                    <p className="text-[10px] text-purple-600 font-semibold uppercase">Total Profit</p>
                  </div>
                  <p className="text-sm font-bold text-purple-700 font-mono">
                    ${walletData?.totalProfit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-semibold text-navy-900 text-sm uppercase tracking-wide">Quick Actions</h4>
            </div>
            <div className="flex flex-col p-2">
              <button
                onClick={() => { setBalanceAmount(''); setBalanceReason(''); setIsAddBalanceModalOpen(true); }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-left"
              >
                <DollarSign size={18} /> Add Balance
              </button>
              <button
                onClick={() => { setBalanceAmount(''); setBalanceReason(''); setIsDeductBalanceModalOpen(true); }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
              >
                <Minus size={18} /> Deduct Balance
              </button>
              <button
                onClick={() => { setNewPassword(''); setConfirmPassword(''); setShowPassword(false); setIsResetPasswordModalOpen(true); }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-navy-900 rounded-lg transition-colors text-left"
              >
                <Key size={18} className="text-slate-400" /> Reset Password
              </button>
              <button
                onClick={() => setIsTransactionsModalOpen(true)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-navy-900 rounded-lg transition-colors text-left"
              >
                <CreditCard size={18} className="text-slate-400" /> View Transactions
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button
                onClick={() => { setSuspendReason(''); setIsSuspendModalOpen(true); }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${
                  userData.isBlocked
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Ban size={18} /> {userData.isBlocked ? 'Unsuspend User' : 'Suspend User'}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
              >
                <Trash2 size={18} /> Delete User
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Edit Profile Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-navy-900 text-lg">Edit Profile Details</h3>
              <button
                onClick={handleSaveProfile}
                disabled={!formDirty || actionLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                  formDirty
                    ? 'bg-navy-900 text-white hover:bg-navy-800'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Personal Info */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Information</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon size={18} /></span>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon size={18} /></span>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18} /></span>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={18} /></span>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><MapPin size={18} /></span>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Enter address"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Account Info */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Account Information</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">KYC Status</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Shield size={18} /></span>
                    <input
                      type="text"
                      disabled
                      value={userData.kycStatus || 'pending'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed shadow-inner capitalize"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Joined Date</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Calendar size={18} /></span>
                    <input
                      type="text"
                      disabled
                      value={userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Preview */}
          {recentTransactions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-6">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-navy-900 text-lg">Recent Transactions</h3>
                <button
                  onClick={() => setIsTransactionsModalOpen(true)}
                  className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTransactions.slice(0, 5).map((tx: any) => (
                      <tr key={tx._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 text-sm font-medium capitalize ${
                            tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'bonus'
                              ? 'text-emerald-600' : 'text-orange-600'
                          }`}>
                            {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'bonus'
                              ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono text-sm font-medium text-navy-900">
                          ${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            tx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            tx.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            tx.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Investments Preview */}
          {investments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-6">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-navy-900 text-lg">Investments</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="px-6 py-3">Plan</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {investments.map((inv: any) => (
                      <tr key={inv._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 text-sm font-medium text-navy-900">{inv.plan?.name || 'N/A'}</td>
                        <td className="px-6 py-3 font-mono text-sm font-medium text-navy-900">
                          ${inv.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            inv.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            inv.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-500">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Add Balance Modal */}
      {isAddBalanceModalOpen && (
        <Modal title="Add Balance" onClose={() => setIsAddBalanceModalOpen(false)}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">User</label>
              <input type="text" disabled value={userName} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount ($)</label>
              <input type="number" min="0" step="0.01" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none" placeholder="100.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (Optional)</label>
              <textarea value={balanceReason} onChange={(e) => setBalanceReason(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none outline-none" placeholder="Bonus, promotion, etc." />
            </div>
            <div className="pt-4 flex gap-3">
              <button onClick={() => setIsAddBalanceModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleAddBalance} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 shadow-lg shadow-navy-900/20 transition-colors flex items-center justify-center gap-2">
                {actionLoading && <Loader2 size={16} className="animate-spin" />} Add Balance
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deduct Balance Modal */}
      {isDeductBalanceModalOpen && (
        <Modal title="Deduct Balance" onClose={() => setIsDeductBalanceModalOpen(false)}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">User</label>
              <input type="text" disabled value={userName} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Balance</label>
              <input type="text" disabled
                value={`$${walletData?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount to Deduct ($)</label>
              <input type="number" min="0" step="0.01" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none" placeholder="50.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (Optional)</label>
              <textarea value={balanceReason} onChange={(e) => setBalanceReason(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none outline-none" placeholder="Penalty, correction, etc." />
            </div>
            <div className="pt-4 flex gap-3">
              <button onClick={() => setIsDeductBalanceModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleDeductBalance} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-colors flex items-center justify-center gap-2">
                {actionLoading && <Loader2 size={16} className="animate-spin" />} Deduct Balance
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {isResetPasswordModalOpen && (
        <Modal title="Reset User Password" onClose={() => setIsResetPasswordModalOpen(false)}>
          <div className="space-y-5">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              This will force-reset the user's password. The user will be notified.
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none"
                  placeholder="Min 8 chars, letters + numbers"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword && newPassword.length < 8 && (
                <p className="text-xs text-rose-500 mt-1">Must be at least 8 characters</p>
              )}
              {newPassword && newPassword.length >= 8 && !/^(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword) && (
                <p className="text-xs text-rose-500 mt-1">Must contain both letters and numbers</p>
              )}
              {newPassword && newPassword.length >= 8 && /^(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword) && (
                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle size={12} /> Password strength: Good</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none"
                placeholder="Confirm new password"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <div className="pt-4 flex gap-3">
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleResetPassword} disabled={actionLoading || !newPassword || newPassword !== confirmPassword}
                className="flex-1 py-2.5 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 shadow-lg shadow-navy-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {actionLoading && <Loader2 size={16} className="animate-spin" />} Reset Password
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend/Unsuspend Modal */}
      {isSuspendModalOpen && (
        <Modal title={userData.isBlocked ? 'Unsuspend User' : 'Suspend User'} onClose={() => setIsSuspendModalOpen(false)}>
          <div className="space-y-5">
            {userData.isBlocked ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                This will unsuspend <strong>{userName}</strong>'s account, restoring full access.
              </div>
            ) : (
              <>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
                  This will suspend <strong>{userName}</strong>'s account. They will not be able to access the platform.
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for suspension</label>
                  <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none outline-none"
                    placeholder="Violation of terms, suspicious activity, etc." />
                </div>
              </>
            )}
            <div className="pt-4 flex gap-3">
              <button onClick={() => setIsSuspendModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleSuspendToggle} disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-lg text-white font-medium shadow-lg transition-colors flex items-center justify-center gap-2 ${
                  userData.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}>
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                {userData.isBlocked ? 'Unsuspend User' : 'Suspend User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && (
        <Modal title="Delete User" onClose={() => setIsDeleteModalOpen(false)}>
          <div className="space-y-5">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
              <strong>Warning:</strong> This will permanently delete <strong>{userName}</strong>'s account. This action cannot be undone.
            </div>
            <p className="text-sm text-slate-600">
              All user data including wallet balance, transactions, and investments will be marked as deleted.
            </p>
            <div className="pt-4 flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleDeleteUser} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-colors flex items-center justify-center gap-2">
                {actionLoading && <Loader2 size={16} className="animate-spin" />} Delete User
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Transactions Modal */}
      {isTransactionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-navy-900 text-lg">Transactions - {userName}</h3>
              <button onClick={() => setIsTransactionsModalOpen(false)} className="text-slate-400 hover:text-navy-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-auto flex-1">
              {txLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-medium sticky top-0">
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">TX Hash</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const allTx = txResponse?.data?.attributes?.results || recentTransactions || [];
                      if (allTx.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No transactions found</td>
                          </tr>
                        );
                      }
                      return allTx.map((tx: any) => (
                        <tr key={tx._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center gap-1 text-sm font-medium capitalize ${
                              tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'bonus'
                                ? 'text-emerald-600' : 'text-orange-600'
                            }`}>
                              {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'bonus'
                                ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-mono text-sm font-medium text-navy-900">
                            ${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              tx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              tx.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              tx.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-500 font-mono truncate max-w-[120px]">
                            {tx.txHash || '-'}
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-500">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// ============================================================
// Main UserManagement — thin wrapper that switches between views
// ============================================================
export const UserManagement: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div>
      {selectedUserId ? (
        <UserDetailView userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
      ) : (
        <UserListView onUserClick={(id) => setSelectedUserId(id)} />
      )}
    </div>
  );
};
