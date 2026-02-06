import React, { useState } from 'react';
import { PaymentGateway } from '../types';
import { MOCK_GATEWAYS } from '../constants';
import { Edit2, Power, ShieldCheck, Copy, Check, Plus, X, Upload } from 'lucide-react';

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
  const [gateways, setGateways] = useState<PaymentGateway[]>(MOCK_GATEWAYS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleEditClick = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setEditValue(gateway.accountDetails);
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGateway) {
      setGateways(gateways.map(g =>
        g.id === selectedGateway.id ? { ...g, accountDetails: editValue } : g
      ));
      setIsEditModalOpen(false);
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
      // TODO: Call API to create gateway
      // const response = await fetch('/api/v1/gateways', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(formData)
      // });

      // Mock implementation
      const newGateway: PaymentGateway = {
        id: `g${Date.now()}`,
        name: formData.name,
        type: formData.type,
        currency: formData.currency,
        accountDetails: formData.type === 'bank'
          ? formData.bankDetails?.accountNumber || ''
          : formData.walletAddress || '',
        status: formData.isActive ? 'active' : 'maintenance',
        logo: formData.icon || 'https://via.placeholder.com/100'
      };

      setGateways([...gateways, newGateway]);
      alert('Gateway created successfully!');
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      alert('Failed to create gateway');
    }
  };

  const toggleStatus = (id: string) => {
    setGateways(gateways.map(g =>
      g.id === id ? { ...g, status: g.status === 'active' ? 'maintenance' : 'active' } : g
    ));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        {gateways.map((gateway) => (
          <div key={gateway.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group">
            {/* Header */}
            <div className="bg-navy-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center p-1.5 backdrop-blur-sm">
                   <img src={gateway.logo} alt={gateway.name} className="w-full h-full object-contain" />
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-sm">{gateway.name}</h3>
                   <span className="text-slate-400 text-xs uppercase">{gateway.type} • {gateway.currency}</span>
                 </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${gateway.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
            </div>

            {/* Body */}
            <div className="p-6">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Receiving Account / Address
              </label>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-2 mb-6 group-hover:border-gold-500/30 transition-colors">
                <code className="text-sm font-mono text-navy-900 break-all line-clamp-2">
                  {gateway.accountDetails}
                </code>
                <button
                  onClick={() => copyToClipboard(gateway.accountDetails, gateway.id)}
                  className="p-1.5 text-slate-400 hover:text-navy-900 transition-colors rounded-md hover:bg-slate-200"
                  title="Copy"
                >
                  {copiedId === gateway.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEditClick(gateway)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Edit2 size={16} /> Update Info
                </button>
                <button
                  onClick={() => toggleStatus(gateway.id)}
                  className={`flex items-center justify-center p-2.5 rounded-lg border transition-colors
                    ${gateway.status === 'active'
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}
                  `}
                  title={gateway.status === 'active' ? "Disable Gateway" : "Enable Gateway"}
                >
                  <Power size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
             <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="text-navy-900" size={20} />
                 <h3 className="font-bold text-navy-900">Update {selectedGateway.name}</h3>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-navy-900">
                 <X size={20} />
               </button>
             </div>

             <form onSubmit={handleSave} className="p-6">
               <div className="mb-6">
                 <label className="block text-sm font-medium text-slate-700 mb-2">
                   New {selectedGateway.type === 'crypto' ? 'Wallet Address' : 'Account Details'}
                 </label>
                 <textarea
                   required
                   rows={3}
                   className="w-full px-4 py-3 rounded-lg border border-slate-200 text-navy-900 bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all shadow-sm font-mono text-sm"
                   value={editValue}
                   onChange={(e) => setEditValue(e.target.value)}
                 />
                 <p className="text-xs text-slate-500 mt-2">
                   This change will be reflected immediately on the user deposit screen. Please verify carefully.
                 </p>
               </div>

               <div className="flex gap-3 justify-end">
                 <button
                   type="button"
                   onClick={() => setIsEditModalOpen(false)}
                   className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-5 py-2.5 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 shadow-lg shadow-navy-900/20 transition-colors"
                 >
                   Save Changes
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
