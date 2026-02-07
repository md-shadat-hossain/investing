'use client'

import React, { useState } from 'react';
import { Wallet, AlertCircle, ArrowUpRight, CheckCircle, Loader2 } from 'lucide-react';
import { useGetActiveGatewaysQuery } from '@/store/api/paymentGatewayApi';
import { useGetWalletQuery } from '@/store/api/walletApi';
import { useCreateWithdrawalMutation } from '@/store/api/transactionApi';

const WithdrawRequest = () => {
  const [selectedGateway, setSelectedGateway] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch wallet data
  const { data: walletResponse, isLoading: walletLoading } = useGetWalletQuery();
  const wallet = walletResponse?.data?.attributes;
  const balance = wallet?.balance || 0;

  // Fetch active gateways for withdrawal
  const { data: gatewaysResponse, isLoading: gatewaysLoading } = useGetActiveGatewaysQuery({ purpose: 'withdraw' });
  const gateways = gatewaysResponse?.data?.attributes || [];

  // Create withdrawal mutation
  const [createWithdrawal, { isLoading: submitting }] = useCreateWithdrawalMutation();

  const selectedGatewayData = gateways.find((g: any) => g.id === selectedGateway);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedGateway) {
      setError('Please select a withdrawal method');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > balance) {
      setError('Insufficient balance');
      return;
    }

    if (selectedGatewayData?.type === 'crypto' && !walletAddress) {
      setError('Please enter your wallet address');
      return;
    }

    if (selectedGatewayData?.type === 'bank' && (!accountNumber || !accountName)) {
      setError('Please enter your bank account details');
      return;
    }

    try {
      const withdrawalData: any = {
        amount: parseFloat(amount),
        paymentGatewayId: selectedGateway,
      };

      if (selectedGatewayData?.type === 'crypto') {
        withdrawalData.walletAddress = walletAddress;
      } else if (selectedGatewayData?.type === 'bank') {
        withdrawalData.bankDetails = {
          accountNumber,
          accountName,
        };
      }

      await createWithdrawal(withdrawalData).unwrap();

      setSuccess(true);
      setAmount('');
      setWalletAddress('');
      setAccountNumber('');
      setAccountName('');
      setSelectedGateway('');

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to submit withdrawal request. Please try again.');
    }
  };

  if (walletLoading || gatewaysLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-gold-500 mx-auto mb-4" size={32} />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
        <span className="text-slate-400 text-sm">Request a secure payout to your wallet</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-xl">
            
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-lg p-6 mb-8 flex items-center justify-between text-white shadow-lg">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Available for Withdrawal</p>
                <h3 className="text-3xl font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet size={32} />
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-emerald-400 font-medium">Withdrawal Request Submitted!</p>
                  <p className="text-emerald-300/80 text-sm mt-1">Your withdrawal request has been submitted successfully and is pending approval.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-rose-400 font-medium">Error</p>
                  <p className="text-rose-300/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Withdraw Method</label>
                <select
                  value={selectedGateway}
                  onChange={(e) => {
                    setSelectedGateway(e.target.value);
                    setWalletAddress('');
                    setAccountNumber('');
                    setAccountName('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                  required
                >
                  <option value="">Select withdrawal method</option>
                  {gateways.map((gateway: any) => (
                    <option key={gateway.id} value={gateway.id}>
                      {gateway.name} ({gateway.currency})
                      {gateway.withdrawFee > 0 && ` - Fee: ${gateway.withdrawFeeType === 'percentage' ? gateway.withdrawFee + '%' : '$' + gateway.withdrawFee}`}
                    </option>
                  ))}
                </select>
                {selectedGatewayData && (
                  <p className="text-xs text-slate-400 mt-2">
                    Min: ${selectedGatewayData.minWithdraw} | Max: ${selectedGatewayData.maxWithdraw}
                    {selectedGatewayData.processingTime && ` | Processing: ${selectedGatewayData.processingTime}`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Withdraw Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-20 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(balance.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-gold-500 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    MAX
                  </button>
                </div>
                {parseFloat(amount) > balance && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    Insufficient balance
                  </p>
                )}
                {selectedGatewayData && parseFloat(amount) > 0 && (
                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                    {selectedGatewayData.withdrawFee > 0 && (
                      <p>
                        Fee: ${selectedGatewayData.withdrawFeeType === 'percentage'
                          ? ((parseFloat(amount) * selectedGatewayData.withdrawFee) / 100).toFixed(2)
                          : selectedGatewayData.withdrawFee.toFixed(2)}
                      </p>
                    )}
                    <p className="text-white font-medium">
                      You will receive: ${(parseFloat(amount) - (selectedGatewayData.withdrawFeeType === 'percentage'
                        ? (parseFloat(amount) * selectedGatewayData.withdrawFee) / 100
                        : selectedGatewayData.withdrawFee || 0)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Crypto Wallet Address */}
              {selectedGatewayData?.type === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {selectedGatewayData.currency} Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-amber-400 mt-2 flex items-start gap-1">
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    Double-check your wallet address. Funds sent to wrong addresses cannot be recovered.
                  </p>
                </div>
              )}

              {/* Bank Account Details */}
              {selectedGatewayData?.type === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter your account number"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Account Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Enter account holder name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                      required
                    />
                  </div>
                  {selectedGatewayData.bankDetails && (
                    <div className="bg-blue-500/5 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-400 text-xs font-medium mb-2">Bank Details</p>
                      <div className="text-xs text-slate-300 space-y-1">
                        {selectedGatewayData.bankDetails.bankName && <p>Bank: {selectedGatewayData.bankDetails.bankName}</p>}
                        {selectedGatewayData.bankDetails.accountNumber && <p>Account: {selectedGatewayData.bankDetails.accountNumber}</p>}
                        {selectedGatewayData.bankDetails.swiftCode && <p>SWIFT: {selectedGatewayData.bankDetails.swiftCode}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              {selectedGatewayData?.instructions && (
                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-300 text-xs whitespace-pre-wrap">{selectedGatewayData.instructions}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || !selectedGateway || !amount || parseFloat(amount) > balance}
                  className="w-full bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-bold py-4 px-4 rounded-lg shadow-lg shadow-gold-500/20 transform hover:-translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowUpRight size={18} className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h4 className="text-white font-bold mb-4">Important Information</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Withdrawals are processed within 24 hours.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Minimum withdrawal amount is $10.00.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Ensure your wallet address is correct. We are not responsible for funds sent to wrong addresses.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                A 2% fee applies to bank transfers. Crypto withdrawals are free.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawRequest;