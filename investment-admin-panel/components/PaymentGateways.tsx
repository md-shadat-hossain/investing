import React, { useState } from 'react';
import { Edit2, Power, ShieldCheck, Copy, Check, Plus, X, Upload, Trash2 } from 'lucide-react';
import {
  useGetAllGatewaysQuery,
  useCreateGatewayMutation,
  useUpdateGatewayMutation,
  useDeleteGatewayMutation,
  useToggleGatewayStatusMutation,
  PaymentGateway as APIGateway,
} from '../store/api/paymentGatewayApi';

interface GatewayFormData {
  name: string;
  type: 'crypto' | 'bank' | 'payment_processor';
  currency: string;
  symbol: string;

  // Crypto & Payment Processor fields
  walletAddress?: string;
  qrCode?: string;

  // Bank fields
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    routingNumber: string;
    swiftCode: string;
    iban: string;
  };

  // Deposit settings
  minDeposit: number;
  maxDeposit: number;
  depositFee: number;
  depositFeeType: 'fixed' | 'percentage';
  isDepositEnabled: boolean;

  // Withdraw settings
  minWithdraw: number;
  maxWithdraw: number;
  withdrawFee: number;
  withdrawFeeType: 'fixed' | 'percentage';
  isWithdrawEnabled: boolean;

  // Additional info
  processingTime: string;
  instructions: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export const PaymentGateways: React.FC = () => {
  // RTK Query hooks
  const { data: gatewaysResponse, isLoading, error } = useGetAllGatewaysQuery({});
  const [createGateway] = useCreateGatewayMutation();
  const [updateGateway] = useUpdateGatewayMutation();
  const [deleteGateway] = useDeleteGatewayMutation();
  const [toggleGatewayStatus] = useToggleGatewayStatusMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<GatewayFormData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract gateways from paginated response
  const gatewaysData = gatewaysResponse?.data?.attributes || {};
  const rawGateways = gatewaysData.results || [];

  // Map gateways with default icon fallback
  const DEFAULT_ICON = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoGIMUfqQeIIIMcLgeUe0sewQg8EUD8B_jZA&s';
  const gateways = rawGateways.map((gateway: any) => ({
    ...gateway,
    logo: gateway.icon || DEFAULT_ICON,
  }));

  const [formData, setFormData] = useState<GatewayFormData>({
    name: '',
    type: 'crypto',
    currency: '',
    symbol: '',
    walletAddress: '',
    qrCode: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      accountName: '',
      routingNumber: '',
      swiftCode: '',
      iban: ''
    },
    minDeposit: 0,
    maxDeposit: 0,
    depositFee: 0,
    depositFeeType: 'fixed',
    isDepositEnabled: true,
    minWithdraw: 0,
    maxWithdraw: 0,
    withdrawFee: 0,
    withdrawFeeType: 'fixed',
    isWithdrawEnabled: true,
    processingTime: '',
    instructions: '',
    icon: '',
    isActive: true,
    sortOrder: gateways.length + 1
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'crypto',
      currency: '',
      symbol: '',
      walletAddress: '',
      qrCode: '',
      bankDetails: {
        bankName: '',
        accountNumber: '',
        accountName: '',
        routingNumber: '',
        swiftCode: '',
        iban: ''
      },
      minDeposit: 0,
      maxDeposit: 0,
      depositFee: 0,
      depositFeeType: 'fixed',
      isDepositEnabled: true,
      minWithdraw: 0,
      maxWithdraw: 0,
      withdrawFee: 0,
      withdrawFeeType: 'fixed',
      isWithdrawEnabled: true,
      processingTime: '',
      instructions: '',
      icon: '',
      isActive: true,
      sortOrder: gateways.length + 1
    });
  };

  const handleEditClick = (gateway: any) => {
    setSelectedGateway(gateway);
    // Populate edit form with current gateway data
    setEditFormData({
      name: gateway.name || '',
      type: gateway.type || 'crypto',
      currency: gateway.currency || '',
      symbol: gateway.symbol || '',
      walletAddress: gateway.walletAddress || '',
      qrCode: gateway.qrCode || '',
      bankDetails: gateway.bankDetails || {
        bankName: '',
        accountNumber: '',
        accountName: '',
        routingNumber: '',
        swiftCode: '',
        iban: ''
      },
      minDeposit: gateway.minDeposit || 0,
      maxDeposit: gateway.maxDeposit || 0,
      depositFee: gateway.depositFee || 0,
      depositFeeType: gateway.depositFeeType || 'fixed',
      isDepositEnabled: gateway.isDepositEnabled !== undefined ? gateway.isDepositEnabled : true,
      minWithdraw: gateway.minWithdraw || 0,
      maxWithdraw: gateway.maxWithdraw || 0,
      withdrawFee: gateway.withdrawFee || 0,
      withdrawFeeType: gateway.withdrawFeeType || 'fixed',
      isWithdrawEnabled: gateway.isWithdrawEnabled !== undefined ? gateway.isWithdrawEnabled : true,
      processingTime: gateway.processingTime || '',
      instructions: gateway.instructions || '',
      icon: gateway.icon || '',
      isActive: gateway.isActive !== undefined ? gateway.isActive : true,
      sortOrder: gateway.sortOrder || 0
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGateway && editFormData) {
      // Validation
      if (editFormData.minDeposit >= editFormData.maxDeposit) {
        alert('Max deposit must be greater than min deposit');
        return;
      }

      if (editFormData.minWithdraw >= editFormData.maxWithdraw) {
        alert('Max withdraw must be greater than min withdraw');
        return;
      }

      if (editFormData.type === 'crypto' && !editFormData.walletAddress) {
        alert('Wallet address is required for crypto gateways');
        return;
      }

      if (editFormData.type === 'bank' && !editFormData.bankDetails?.accountNumber) {
        alert('Bank details are required for bank gateways');
        return;
      }

      try {
        // Prepare update payload
        const updateData: any = {
          name: editFormData.name,
          type: editFormData.type,
          currency: editFormData.currency,
          symbol: editFormData.symbol,
          isActive: editFormData.isActive,
          minDeposit: editFormData.minDeposit,
          maxDeposit: editFormData.maxDeposit,
          minWithdraw: editFormData.minWithdraw,
          maxWithdraw: editFormData.maxWithdraw,
          depositFee: editFormData.depositFee,
          depositFeeType: editFormData.depositFeeType,
          withdrawFee: editFormData.withdrawFee,
          withdrawFeeType: editFormData.withdrawFeeType,
          isDepositEnabled: editFormData.isDepositEnabled,
          isWithdrawEnabled: editFormData.isWithdrawEnabled,
          processingTime: editFormData.processingTime,
          instructions: editFormData.instructions,
          icon: editFormData.icon,
          sortOrder: editFormData.sortOrder,
        };

        // Add type-specific fields
        if (editFormData.type === 'bank') {
          updateData.bankDetails = editFormData.bankDetails;
        } else {
          updateData.walletAddress = editFormData.walletAddress;
          updateData.qrCode = editFormData.qrCode;
        }

        await updateGateway({
          gatewayId: selectedGateway.id,
          data: updateData
        }).unwrap();

        alert('Gateway updated successfully!');
        setIsEditModalOpen(false);
        setEditFormData(null);
      } catch (error: any) {
        console.error('Failed to update gateway:', error);
        alert(error?.data?.message || 'Failed to update gateway');
      }
    }
  };

  const handleSubmitGateway = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.minDeposit >= formData.maxDeposit) {
      alert('Max deposit must be greater than min deposit');
      return;
    }

    if (formData.minWithdraw >= formData.maxWithdraw) {
      alert('Max withdraw must be greater than min withdraw');
      return;
    }

    if (formData.type === 'crypto' && !formData.walletAddress) {
      alert('Wallet address is required for crypto gateways');
      return;
    }

    if (formData.type === 'bank' && !formData.bankDetails?.accountNumber) {
      alert('Bank details are required for bank gateways');
      return;
    }

    try {
      // Prepare payload based on gateway type
      const payload: any = {
        name: formData.name,
        type: formData.type,
        currency: formData.currency,
        symbol: formData.symbol,
        isActive: formData.isActive,
        minDeposit: formData.minDeposit,
        maxDeposit: formData.maxDeposit,
        minWithdraw: formData.minWithdraw,
        maxWithdraw: formData.maxWithdraw,
        depositFee: formData.depositFee,
        depositFeeType: formData.depositFeeType,
        withdrawFee: formData.withdrawFee,
        withdrawFeeType: formData.withdrawFeeType,
        isDepositEnabled: formData.isDepositEnabled,
        isWithdrawEnabled: formData.isWithdrawEnabled,
        processingTime: formData.processingTime,
        instructions: formData.instructions,
        icon: formData.icon,
        sortOrder: formData.sortOrder,
      };

      // Add type-specific fields
      if (formData.type === 'bank') {
        payload.bankDetails = formData.bankDetails;
      } else {
        payload.walletAddress = formData.walletAddress;
        payload.qrCode = formData.qrCode;
      }

      await createGateway(payload).unwrap();
      alert('Gateway created successfully!');
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to create gateway:', error);
      alert(error?.data?.message || 'Failed to create gateway');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await toggleGatewayStatus(id).unwrap();
    } catch (error: any) {
      console.error('Failed to toggle gateway status:', error);
      alert(error?.data?.message || 'Failed to toggle gateway status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteGateway(id).unwrap();
      alert('Gateway deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete gateway:', error);
      alert(error?.data?.message || 'Failed to delete gateway');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
      }
      document.body.removeChild(textArea);
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment gateways...</p>
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
          <p className="text-rose-600 font-medium">Failed to load payment gateways</p>
          <p className="text-slate-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-navy-900">Payment Gateways</h2>
          <p className="text-slate-500 text-sm">Manage deposit methods and update receiving accounts.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2.5 rounded-lg hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/20 font-medium"
        >
          <Plus size={18} /> Add Gateway
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateways.map((gateway: any) => {
          // Get account details display based on gateway type
          let accountDetailsDisplay = '';
          if (gateway.type === 'bank' && gateway.bankDetails) {
            accountDetailsDisplay = JSON.stringify(gateway.bankDetails, null, 2);
          } else if (gateway.walletAddress) {
            accountDetailsDisplay = gateway.walletAddress;
          } else {
            accountDetailsDisplay = 'No account details';
          }

          return (
          <div key={gateway.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group">
            {/* Header */}
            <div className="bg-navy-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center p-1.5 backdrop-blur-sm">
                   <img src={gateway.logo || 'https://via.placeholder.com/100'} alt={gateway.name} className="w-full h-full object-contain" />
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-sm">{gateway.name}</h3>
                   <span className="text-slate-400 text-xs uppercase">{gateway.type}</span>
                 </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${gateway.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
            </div>

            {/* Body */}
            <div className="p-6">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Receiving Account / Address
              </label>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-2 mb-6 group-hover:border-gold-500/30 transition-colors">
                <code className="text-sm font-mono text-navy-900 break-all line-clamp-2">
                  {accountDetailsDisplay}
                </code>
                <button
                  onClick={() => copyToClipboard(accountDetailsDisplay, gateway.id)}
                  className="p-1.5 text-slate-400 hover:text-navy-900 transition-colors rounded-md hover:bg-slate-200"
                  title="Copy"
                >
                  {copiedId === gateway.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(gateway)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Edit2 size={16} /> Update
                </button>
                <button
                  onClick={() => toggleStatus(gateway.id)}
                  className={`flex items-center justify-center p-2.5 rounded-lg border transition-colors
                    ${gateway.isActive
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}
                  `}
                  title={gateway.isActive ? "Disable Gateway" : "Enable Gateway"}
                >
                  <Power size={18} />
                </button>
                <button
                  onClick={() => handleDelete(gateway.id, gateway.name)}
                  className="flex items-center justify-center p-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Gateway"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedGateway && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Edit2 className="text-navy-900" size={20} />
                <h3 className="font-bold text-navy-900 text-lg">Edit {selectedGateway.name}</h3>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setEditFormData(null); }} className="p-1 hover:bg-slate-200 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Step 1: Gateway Type & Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">1</div>
                  Gateway Type & Basic Information
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Gateway Type *</label>
                    <select
                      required
                      value={editFormData.type}
                      onChange={e => setEditFormData({...editFormData, type: e.target.value as any})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    >
                      <option value="crypto">Crypto</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="payment_processor">Payment Processor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Gateway Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="e.g. Bitcoin, PayPal, Chase Bank"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Currency Code *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.currency}
                      onChange={e => setEditFormData({...editFormData, currency: e.target.value.toUpperCase()})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="BTC, USD, EUR"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Currency Symbol *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.symbol}
                      onChange={e => setEditFormData({...editFormData, symbol: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="₿, $, €"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Icon URL *</label>
                  <input
                    type="url"
                    required
                    value={editFormData.icon}
                    onChange={e => setEditFormData({...editFormData, icon: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
              </div>

              {/* Step 2: Account Details (Dynamic based on type) */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">2</div>
                  Account/Wallet Details
                </h4>

                {(editFormData.type === 'crypto' || editFormData.type === 'payment_processor') && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">
                        {editFormData.type === 'crypto' ? 'Wallet Address' : 'Account Email/ID'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.walletAddress}
                        onChange={e => setEditFormData({...editFormData, walletAddress: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder={editFormData.type === 'crypto' ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' : 'email@example.com'}
                      />
                    </div>

                    {editFormData.type === 'crypto' && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">QR Code URL (Optional)</label>
                        <input
                          type="url"
                          value={editFormData.qrCode}
                          onChange={e => setEditFormData({...editFormData, qrCode: e.target.value})}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                          placeholder="https://example.com/qr-code.jpg"
                        />
                      </div>
                    )}
                  </>
                )}

                {editFormData.type === 'bank' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.bankDetails?.bankName}
                        onChange={e => setEditFormData({...editFormData, bankDetails: {...editFormData.bankDetails!, bankName: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="Chase Bank"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Account Name *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.bankDetails?.accountName}
                        onChange={e => setEditFormData({...editFormData, bankDetails: {...editFormData.bankDetails!, accountName: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="Company Name LLC"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Account Number *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.bankDetails?.accountNumber}
                        onChange={e => setEditFormData({...editFormData, bankDetails: {...editFormData.bankDetails!, accountNumber: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="123456789012"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Routing Number</label>
                      <input
                        type="text"
                        value={editFormData.bankDetails?.routingNumber}
                        onChange={e => setEditFormData({...editFormData, bankDetails: {...editFormData.bankDetails!, routingNumber: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="021000021"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">SWIFT Code</label>
                      <input
                        type="text"
                        value={editFormData.bankDetails?.swiftCode}
                        onChange={e => setEditFormData({...editFormData, bankDetails: {...editFormData.bankDetails!, swiftCode: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="CHASUS33"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">IBAN</label>
                      <input
                        type="text"
                        value={editFormData.bankDetails?.iban}
                        onChange={e => setEditFormData({...editFormData, bankDetails: {...editFormData.bankDetails!, iban: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="US12345678901234567890"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Deposit Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">3</div>
                  Deposit Settings
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Min Deposit *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editFormData.minDeposit}
                      onChange={e => setEditFormData({...editFormData, minDeposit: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Max Deposit *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editFormData.maxDeposit}
                      onChange={e => setEditFormData({...editFormData, maxDeposit: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Deposit Fee *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editFormData.depositFee}
                      onChange={e => setEditFormData({...editFormData, depositFee: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="2.9"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Fee Type *</label>
                    <select
                      required
                      value={editFormData.depositFeeType}
                      onChange={e => setEditFormData({...editFormData, depositFeeType: e.target.value as any})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    >
                      <option value="fixed">Fixed ($)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4: Withdraw Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">4</div>
                  Withdrawal Settings
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Min Withdraw *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editFormData.minWithdraw}
                      onChange={e => setEditFormData({...editFormData, minWithdraw: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Max Withdraw *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editFormData.maxWithdraw}
                      onChange={e => setEditFormData({...editFormData, maxWithdraw: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Withdraw Fee *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editFormData.withdrawFee}
                      onChange={e => setEditFormData({...editFormData, withdrawFee: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Fee Type *</label>
                    <select
                      required
                      value={editFormData.withdrawFeeType}
                      onChange={e => setEditFormData({...editFormData, withdrawFeeType: e.target.value as any})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    >
                      <option value="fixed">Fixed ($)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 5: Additional Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">5</div>
                  Additional Information
                </h4>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Processing Time *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.processingTime}
                    onChange={e => setEditFormData({...editFormData, processingTime: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="e.g. 10-30 minutes, 1-3 business days, Instant"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Instructions for Users *</label>
                  <textarea
                    required
                    rows={3}
                    value={editFormData.instructions}
                    onChange={e => setEditFormData({...editFormData, instructions: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                    placeholder="Provide clear instructions for users on how to use this gateway..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Sort Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.sortOrder}
                    onChange={e => setEditFormData({...editFormData, sortOrder: parseInt(e.target.value)})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
                </div>
              </div>

              {/* Step 6: Activation Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">6</div>
                  Activation Settings
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={editFormData.isDepositEnabled}
                      onChange={e => setEditFormData({...editFormData, isDepositEnabled: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">Enable Deposits</span>
                      <p className="text-xs text-slate-500 mt-0.5">Allow users to deposit using this gateway</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={editFormData.isWithdrawEnabled}
                      onChange={e => setEditFormData({...editFormData, isWithdrawEnabled: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">Enable Withdrawals</span>
                      <p className="text-xs text-slate-500 mt-0.5">Allow users to withdraw using this gateway</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={e => setEditFormData({...editFormData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">Gateway Active</span>
                      <p className="text-xs text-slate-500 mt-0.5">Make this gateway visible to users</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditFormData(null); }}
                  className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
                >
                  Update Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Gateway Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between z-10">
              <h3 className="font-bold text-navy-900 text-lg">Add New Payment Gateway</h3>
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="p-1 hover:bg-slate-200 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitGateway} className="p-6 space-y-6">
              {/* Step 1: Gateway Type & Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">1</div>
                  Gateway Type & Basic Information
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Gateway Type *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    >
                      <option value="crypto">Crypto</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="payment_processor">Payment Processor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Gateway Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="e.g. Bitcoin, PayPal, Chase Bank"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Currency Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.currency}
                      onChange={e => setFormData({...formData, currency: e.target.value.toUpperCase()})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="BTC, USD, EUR"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Currency Symbol *</label>
                    <input
                      type="text"
                      required
                      value={formData.symbol}
                      onChange={e => setFormData({...formData, symbol: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="₿, $, €"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Icon URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.icon}
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
              </div>

              {/* Step 2: Account Details (Dynamic based on type) */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">2</div>
                  Account/Wallet Details
                </h4>

                {(formData.type === 'crypto' || formData.type === 'payment_processor') && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">
                        {formData.type === 'crypto' ? 'Wallet Address' : 'Account Email/ID'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.walletAddress}
                        onChange={e => setFormData({...formData, walletAddress: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder={formData.type === 'crypto' ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' : 'email@example.com'}
                      />
                    </div>

                    {formData.type === 'crypto' && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">QR Code URL (Optional)</label>
                        <input
                          type="url"
                          value={formData.qrCode}
                          onChange={e => setFormData({...formData, qrCode: e.target.value})}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                          placeholder="https://example.com/qr-code.jpg"
                        />
                      </div>
                    )}
                  </>
                )}

                {formData.type === 'bank' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.bankDetails?.bankName}
                        onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails!, bankName: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="Chase Bank"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Account Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.bankDetails?.accountName}
                        onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails!, accountName: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="Company Name LLC"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Account Number *</label>
                      <input
                        type="text"
                        required
                        value={formData.bankDetails?.accountNumber}
                        onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails!, accountNumber: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="123456789012"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Routing Number</label>
                      <input
                        type="text"
                        value={formData.bankDetails?.routingNumber}
                        onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails!, routingNumber: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="021000021"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">SWIFT Code</label>
                      <input
                        type="text"
                        value={formData.bankDetails?.swiftCode}
                        onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails!, swiftCode: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="CHASUS33"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">IBAN</label>
                      <input
                        type="text"
                        value={formData.bankDetails?.iban}
                        onChange={e => setFormData({...formData, bankDetails: {...formData.bankDetails!, iban: e.target.value}})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="US12345678901234567890"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Deposit Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">3</div>
                  Deposit Settings
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Min Deposit *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.minDeposit}
                      onChange={e => setFormData({...formData, minDeposit: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Max Deposit *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.maxDeposit}
                      onChange={e => setFormData({...formData, maxDeposit: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Deposit Fee *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.depositFee}
                      onChange={e => setFormData({...formData, depositFee: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="2.9"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Fee Type *</label>
                    <select
                      required
                      value={formData.depositFeeType}
                      onChange={e => setFormData({...formData, depositFeeType: e.target.value as any})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    >
                      <option value="fixed">Fixed ($)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4: Withdraw Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">4</div>
                  Withdrawal Settings
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Min Withdraw *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.minWithdraw}
                      onChange={e => setFormData({...formData, minWithdraw: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Max Withdraw *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.maxWithdraw}
                      onChange={e => setFormData({...formData, maxWithdraw: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Withdraw Fee *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.withdrawFee}
                      onChange={e => setFormData({...formData, withdrawFee: parseFloat(e.target.value)})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Fee Type *</label>
                    <select
                      required
                      value={formData.withdrawFeeType}
                      onChange={e => setFormData({...formData, withdrawFeeType: e.target.value as any})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    >
                      <option value="fixed">Fixed ($)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 5: Additional Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">5</div>
                  Additional Information
                </h4>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Processing Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.processingTime}
                    onChange={e => setFormData({...formData, processingTime: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="e.g. 10-30 minutes, 1-3 business days, Instant"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Instructions for Users *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.instructions}
                    onChange={e => setFormData({...formData, instructions: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                    placeholder="Provide clear instructions for users on how to use this gateway..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Sort Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sortOrder}
                    onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
                </div>
              </div>

              {/* Step 6: Activation Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">6</div>
                  Activation Settings
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.isDepositEnabled}
                      onChange={e => setFormData({...formData, isDepositEnabled: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">Enable Deposits</span>
                      <p className="text-xs text-slate-500 mt-0.5">Allow users to deposit using this gateway</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.isWithdrawEnabled}
                      onChange={e => setFormData({...formData, isWithdrawEnabled: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">Enable Withdrawals</span>
                      <p className="text-xs text-slate-500 mt-0.5">Allow users to withdraw using this gateway</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-700">Gateway Active</span>
                      <p className="text-xs text-slate-500 mt-0.5">Make this gateway visible to users</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
                <h5 className="font-semibold text-navy-900 text-sm mb-3">Gateway Summary</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-600">Type:</span>
                    <span className="font-semibold text-navy-900 ml-2 capitalize">{formData.type.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Currency:</span>
                    <span className="font-semibold text-navy-900 ml-2">{formData.currency || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Deposit:</span>
                    <span className="font-semibold text-navy-900 ml-2">${formData.minDeposit} - ${formData.maxDeposit}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Withdraw:</span>
                    <span className="font-semibold text-navy-900 ml-2">${formData.minWithdraw} - ${formData.maxWithdraw}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
                >
                  Create Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
