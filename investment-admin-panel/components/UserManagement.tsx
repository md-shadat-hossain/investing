import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
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
  AlertCircle,
  DollarSign,
  Minus,
  X
} from 'lucide-react';
import {
  useGetAllUsersQuery,
  useToggleBlockUserMutation,
  useAddBalanceMutation,
  useDeductBalanceMutation,
} from '../store/api/userApi';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  balance?: number;
  joinedDate?: string;
  plan?: string;
  phone?: string;
  country?: string;
}

export const UserManagement: React.FC = () => {
  // RTK Query hooks
  const { data: usersResponse, isLoading, error } = useGetAllUsersQuery({});
  const [toggleBlockUser] = useToggleBlockUserMutation();
  const [addBalanceMutation] = useAddBalanceMutation();
  const [deductBalanceMutation] = useDeductBalanceMutation();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [isDeductBalanceModalOpen, setIsDeductBalanceModalOpen] = useState(false);
  const [balanceUser, setBalanceUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', balance: '' });
  const [errors, setErrors] = useState({ name: '', email: '', balance: '' });

  // Extract users from response (paginated data uses 'results')
  const usersData = usersResponse?.data?.attributes || {};
  const rawUsers = usersData.results || [];
  const pagination = {
    page: usersData.page || 1,
    limit: usersData.limit || 10,
    totalPages: usersData.totalPages || 1,
    totalResults: usersData.totalResults || 0,
  };

  // Map API data to component format
  const IMAGE_BASE_URL = 'http://10.10.11.87:8080';
  const users = rawUsers.map((user: any) => ({
    ...user,
    name: user.fullName || `${user.firstName} ${user.lastName}`,
    avatar: user.image ? `${IMAGE_BASE_URL}${user.image}` : `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`,
    joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    status: user.isBlocked ? 'blocked' : 'active',
    balance: user.walletBalance || 0,
    plan: user.currentPlan || 'None',
  }));

  // Validation Logic
  const validate = (field: string, value: string) => {
    let error = '';
    if (field === 'name') {
      if (!value.trim()) error = 'Full name is required.';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters.';
    }
    if (field === 'email') {
      if (!value.trim()) error = 'Email address is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address.';
    }
    if (field === 'balance') {
      if (!value) error = 'Initial balance is required.';
      else if (Number(value) < 0) error = 'Balance cannot be negative.';
    }
    return error;
  };

  const handleInputChange = (field: 'name' | 'email' | 'balance', value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
    const error = validate(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Add User Handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final Validation check
    const nameError = validate('name', newUser.name);
    const emailError = validate('email', newUser.email);
    const balanceError = validate('balance', newUser.balance);

    if (nameError || emailError || balanceError) {
      setErrors({ name: nameError, email: emailError, balance: balanceError });
      return;
    }

    const user: User = {
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      balance: parseFloat(newUser.balance) || 0,
      avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      plan: 'None'
    };
    setUsers([user, ...users]);
    setIsAddModalOpen(false);
    setNewUser({ name: '', email: '', balance: '' });
    setErrors({ name: '', email: '', balance: '' });
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const openAddBalanceModal = (user: User) => {
    setBalanceUser(user);
    setBalanceAmount('');
    setBalanceReason('');
    setIsAddBalanceModalOpen(true);
  };

  const openDeductBalanceModal = (user: User) => {
    setBalanceUser(user);
    setBalanceAmount('');
    setBalanceReason('');
    setIsDeductBalanceModalOpen(true);
  };

  const handleAddBalance = async () => {
    if (!balanceUser || !balanceAmount || parseFloat(balanceAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await addBalanceMutation({
        userId: balanceUser.id,
        amount: parseFloat(balanceAmount),
        note: balanceReason
      }).unwrap();

      alert(`Successfully added $${balanceAmount} to ${balanceUser.name}'s balance`);
      setIsAddBalanceModalOpen(false);
      setBalanceUser(null);
      setBalanceAmount('');
      setBalanceReason('');
    } catch (error: any) {
      console.error('Failed to add balance:', error);
      alert(error?.data?.message || 'Failed to add balance');
    }
  };

  const handleDeductBalance = async () => {
    if (!balanceUser || !balanceAmount || parseFloat(balanceAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if ((balanceUser.balance || 0) < parseFloat(balanceAmount)) {
      alert('Insufficient balance');
      return;
    }

    try {
      await deductBalanceMutation({
        userId: balanceUser.id,
        amount: parseFloat(balanceAmount),
        note: balanceReason
      }).unwrap();

      alert(`Successfully deducted $${balanceAmount} from ${balanceUser.name}'s balance`);
      setIsDeductBalanceModalOpen(false);
      setBalanceUser(null);
      setBalanceAmount('');
      setBalanceReason('');
    } catch (error: any) {
      console.error('Failed to deduct balance:', error);
      alert(error?.data?.message || 'Failed to deduct balance');
    }
  };

  // --- List View ---
  const UserListView = () => {
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
          <p className="text-slate-500 text-sm">Manage user access and details.</p>
        </div>
        <button
          onClick={() => {
            setNewUser({ name: '', email: '', balance: '' });
            setErrors({ name: '', email: '', balance: '' });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2.5 rounded-lg hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/20 font-medium text-sm"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
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
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => handleUserClick(user)}
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
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {user.plan || 'None'}
                  </td>
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
      </div>
    </>
    );
  };

  // --- Detailed View ---
  const UserDetailView = ({ user }: { user: User }) => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={handleBackToList}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-navy-900"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-display font-bold text-navy-900">User Profile</h2>
          <p className="text-slate-500 text-sm">Viewing details for <span className="font-semibold text-navy-900">{user.name}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Profile & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Plan Card */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 rounded-full blur-[50px] opacity-20 pointer-events-none"></div>
             
             <div className="flex flex-col items-center text-center mb-6 z-10 relative">
               <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white/10 shadow-md mb-3" />
               <h3 className="text-lg font-bold">{user.name}</h3>
               <p className="text-sm text-slate-300">{user.email}</p>
               <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                 {user.status}
               </span>
             </div>

             <div className="border-t border-white/10 pt-4 z-10 relative">
               <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Current Plan</p>
               <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                 <div className="p-2 bg-gold-500 rounded-md text-navy-900">
                   <Shield size={20} />
                 </div>
                 <div>
                   <p className="font-bold text-gold-400">{user.plan || 'No Plan'}</p>
                   <p className="text-xs text-slate-300">Active since {user.joinedDate}</p>
                 </div>
               </div>
             </div>
          </div>

          {/* Actions Menu */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-semibold text-navy-900 text-sm uppercase tracking-wide">Quick Actions</h4>
            </div>
            <div className="flex flex-col p-2">
              <button
                onClick={() => openAddBalanceModal(user)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-left"
              >
                <DollarSign size={18} /> Add Balance
              </button>
              <button
                onClick={() => openDeductBalanceModal(user)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
              >
                <Minus size={18} /> Deduct Balance
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-navy-900 rounded-lg transition-colors text-left">
                <Mail size={18} className="text-slate-400" /> Send Email
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-navy-900 rounded-lg transition-colors text-left">
                <Key size={18} className="text-slate-400" /> Reset Password
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-navy-900 rounded-lg transition-colors text-left">
                <CreditCard size={18} className="text-slate-400" /> View Transactions
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left">
                <Ban size={18} /> Suspend User
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Form */}
        <div className="lg:col-span-3">
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-navy-900 text-lg">Edit Profile Details</h3>
               <button className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors shadow-sm">
                 <Save size={16} /> Save Changes
               </button>
             </div>
             
             <div className="p-8">
               <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 {/* Personal Info */}
                 <div className="md:col-span-2">
                   <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Information</h4>
                 </div>

                 <div className="group">
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon size={18} /></span>
                     <input 
                       type="text" 
                       defaultValue={user.name} 
                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                     />
                   </div>
                 </div>

                 <div className="group">
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18} /></span>
                     <input 
                       type="email" 
                       defaultValue={user.email} 
                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                     />
                   </div>
                 </div>

                 <div className="group">
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={18} /></span>
                     <input 
                       type="tel" 
                       defaultValue={user.phone || ''} 
                       placeholder="+1 (555) 000-0000"
                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                     />
                   </div>
                 </div>

                 <div className="group">
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><MapPin size={18} /></span>
                     <input 
                       type="text" 
                       defaultValue={user.country || ''} 
                       placeholder="Select Country"
                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                     />
                   </div>
                 </div>

                 {/* Financial Info */}
                 <div className="md:col-span-2 mt-4">
                   <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Financial Status</h4>
                 </div>

                 <div className="group">
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Balance ($)</label>
                   <input 
                     type="number" 
                     defaultValue={user.balance} 
                     className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 font-mono font-medium focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm"
                   />
                 </div>

                 <div className="group">
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Joined Date</label>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Calendar size={18} /></span>
                     <input 
                       type="text" 
                       disabled
                       defaultValue={user.joinedDate} 
                       className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed shadow-inner"
                     />
                   </div>
                 </div>
               </form>
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {selectedUser ? <UserDetailView user={selectedUser} /> : <UserListView />}

      {/* Add Balance Modal */}
      {isAddBalanceModalOpen && balanceUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-navy-900 text-lg">Add Balance</h3>
              <button onClick={() => setIsAddBalanceModalOpen(false)} className="text-slate-400 hover:text-navy-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">User</label>
                <input
                  type="text"
                  disabled
                  value={balanceUser.name}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="100.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (Optional)</label>
                <textarea
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                  placeholder="Bonus, promotion, etc."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBalanceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBalance}
                  className="flex-1 py-2.5 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 shadow-lg shadow-navy-900/20 transition-colors"
                >
                  Add Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deduct Balance Modal */}
      {isDeductBalanceModalOpen && balanceUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-navy-900 text-lg">Deduct Balance</h3>
              <button onClick={() => setIsDeductBalanceModalOpen(false)} className="text-slate-400 hover:text-navy-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">User</label>
                <input
                  type="text"
                  disabled
                  value={balanceUser.name}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Balance</label>
                <input
                  type="text"
                  disabled
                  value={`$${balanceUser.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount to Deduct ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={balanceUser.balance || 0}
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="50.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (Optional)</label>
                <textarea
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                  placeholder="Penalty, correction, etc."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeductBalanceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeductBalance}
                  className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-colors"
                >
                  Deduct Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-navy-900 text-lg">Add New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-navy-900 transition-colors">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white focus:ring-2 outline-none transition-all shadow-sm
                    ${errors.name ? 'border-rose-500 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 focus:ring-gold-500/20 focus:border-gold-500'}
                  `}
                  value={newUser.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="e.g. John Wick"
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white focus:ring-2 outline-none transition-all shadow-sm
                    ${errors.email ? 'border-rose-500 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 focus:ring-gold-500/20 focus:border-gold-500'}
                  `}
                  value={newUser.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Balance ($)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white focus:ring-2 outline-none transition-all shadow-sm
                    ${errors.balance ? 'border-rose-500 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 focus:ring-gold-500/20 focus:border-gold-500'}
                  `}
                  value={newUser.balance}
                  onChange={e => handleInputChange('balance', e.target.value)}
                  placeholder="0.00"
                />
                {errors.balance && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.balance}
                  </p>
                )}
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  className={`flex-1 py-2.5 rounded-lg text-white font-medium shadow-lg transition-colors
                    ${(errors.name || errors.email || errors.balance) 
                      ? 'bg-navy-800/70 cursor-not-allowed' 
                      : 'bg-navy-900 hover:bg-navy-800 shadow-navy-900/20'}
                  `}
                  disabled={!!(errors.name || errors.email || errors.balance)}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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