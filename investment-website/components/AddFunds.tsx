'use client'

import React, { useState, useRef } from 'react';
import { Bitcoin, CreditCard, ArrowRight, CheckCircle2, Upload, Copy, AlertCircle, ArrowLeft, Loader2, X } from 'lucide-react';

const AddFunds = () => {
  const [step, setStep] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');

  // Step 2 Verification States
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gateways = [
    {
      id: 'btc',
      name: 'Bitcoin (BTC)',
      icon: <Bitcoin size={24} />,
      min: 50,
      max: 100000,
      charge: 0,
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
    },
    {
      id: 'usdt',
      name: 'Tether (USDT TRC20)',
      icon: <span className="font-bold text-lg">₮</span>,
      min: 10,
      max: 50000,
      charge: 1,
      address: 'TVJ5dW6F56...8j2'
    },
    {
      id: 'eth',
      name: 'Ethereum (ETH)',
      icon: <span className="font-bold text-lg">Ξ</span>,
      min: 100,
      max: 100000,
      charge: 0.5,
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <CreditCard size={24} />,
      min: 500,
      max: 1000000,
      charge: 0,
      address: 'Chase Bank\nAccount: 987654321\nRouting: 123456789\nSwift: CHASUS33'
    },
  ];

  const handleGatewaySelect = (id: string) => {
    setSelectedGateway(id);
  };

  const getGateway = (id: string | null) => gateways.find(g => g.id === id);
  const selectedGatewayData = getGateway(selectedGateway);

  const calculateTotal = () => {
    if (!amount || !selectedGatewayData) return 0;
    const val = parseFloat(amount);
    return val + (val * (selectedGatewayData.charge / 100));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setScreenshot(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 2000);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedGateway(null);
    setAmount('');
    setTransactionId('');
    setScreenshot(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-900 rounded-2xl border border-slate-800 text-center px-4">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Deposit Submitted!</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Your payment proof has been submitted successfully. Our team will verify your transaction shortly.
        </p>
        <button
          onClick={resetForm}
          className="bg-gold-500 hover:bg-gold-600 text-slate-950 px-8 py-3 rounded-lg font-bold transition-colors"
        >
          Make Another Deposit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Add Funds</h2>
          <span className="text-slate-400 text-sm">
            {step === 1 ? 'Select a payment method to proceed' : 'Complete your payment'}
          </span>
        </div>
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="text-slate-400 hover:text-white flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">

          {step === 1 ? (
            /* STEP 1: Gateway & Amount Selection */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gateways.map((gateway) => (
                  <button
                    key={gateway.id}
                    onClick={() => handleGatewaySelect(gateway.id)}
                    className={`relative p-6 rounded-xl border flex flex-col items-start transition-all duration-200 ${
                      selectedGateway === gateway.id
                        ? 'bg-slate-800 border-gold-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {selectedGateway === gateway.id && (
                      <div className="absolute top-3 right-3 text-gold-500">
                        <CheckCircle2 size={20} />
                      </div>
                    )}
                    <div className={`p-3 rounded-lg mb-4 ${selectedGateway === gateway.id ? 'bg-gold-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                      {gateway.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg">{gateway.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Min: ${gateway.min} • Max: ${gateway.max.toLocaleString()}</p>
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <label className="block text-sm font-medium text-slate-300 mb-2">Enter Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-4 py-4 text-white text-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                  />
                </div>
                {selectedGateway && (
                   <p className="text-xs text-slate-500 mt-2 text-right">
                     Transaction limit: ${selectedGatewayData?.min} - ${selectedGatewayData?.max.toLocaleString()}
                   </p>
                )}
              </div>
            </>
          ) : (
            /* STEP 2: Payment Details & Verification */
            <div className="space-y-6">
              {/* Payment Details Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 mr-3">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Payment Instructions</h3>
                    <p className="text-sm text-slate-400">
                      Please send exactly <span className="text-gold-500 font-bold">${calculateTotal().toFixed(2)}</span> to the address below.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 relative group">
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">
                    {selectedGateway === 'bank' ? 'Bank Details' : 'Wallet Address'}
                  </p>
                  <pre className="text-white font-mono text-sm whitespace-pre-wrap break-all">
                    {selectedGatewayData?.address}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedGatewayData?.address || '')}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-white">Confirm Payment</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Transaction ID / Hash</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter the transaction ID from your payment provider"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Upload Screenshot</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                      screenshot ? 'border-gold-500/50 bg-gold-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-950'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />

                    {screenshot ? (
                      <div className="flex items-center justify-center space-x-2 text-gold-500">
                        <CheckCircle2 size={24} />
                        <span className="font-medium truncate max-w-xs">{screenshot.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setScreenshot(null);
                          }}
                          className="p-1 hover:bg-slate-800 rounded-full"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !transactionId || !screenshot}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center transition-all ${
                    isSubmitting || !transactionId || !screenshot
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gold-500 hover:bg-gold-600 text-slate-950 shadow-lg shadow-gold-500/20 transform hover:-translate-y-1'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 sticky top-6">
            <h3 className="text-xl font-bold text-white mb-6">Payment Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-white font-medium">{selectedGatewayData?.name || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-medium">${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Charge</span>
                <span className="text-red-400 font-medium">
                  {selectedGateway && amount
                    ? `+$${(parseFloat(amount) * (selectedGatewayData!.charge / 100)).toFixed(2)}`
                    : '$0.00'}
                </span>
              </div>
              <div className="border-t border-slate-700 my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Payable Total</span>
                <span className="text-gold-500">
                   ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {step === 1 && (
              <>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedGateway || !amount}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center transition-all ${
                    selectedGateway && amount
                      ? 'bg-gold-500 hover:bg-gold-600 text-slate-950 shadow-lg shadow-gold-500/20 transform hover:-translate-y-1'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Payment
                  <ArrowRight size={18} className="ml-2" />
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  Secure 256-bit encrypted transaction
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFunds;
