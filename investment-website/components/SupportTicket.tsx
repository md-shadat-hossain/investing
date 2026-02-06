'use client'

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle2, Wallet, HelpCircle } from 'lucide-react';

const SupportTicket = () => {
  // Simulating local balance for this component to demonstrate the deduction
  const [balance, setBalance] = useState(12450.00);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TICKET_COST = 1.00;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      if (balance < TICKET_COST) {
        setErrorMsg('Insufficient balance to open a support ticket. Please deposit funds.');
        setIsSubmitting(false);
        return;
      }

      // Deduct balance
      setBalance(prev => prev - TICKET_COST);
      setSuccessMsg(`Ticket #${Math.floor(Math.random() * 90000) + 10000} created successfully! $${TICKET_COST.toFixed(2)} has been deducted from your balance.`);
      
      // Reset form
      setSubject('');
      setMessage('');
      setPriority('Normal');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Support Center</h2>
          <p className="text-slate-400 text-sm">Get expert assistance from our dedicated team.</p>
        </div>
        
        {/* Balance Display for Context */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
          <div className="bg-gold-500/10 p-2 rounded-full text-gold-500">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Your Balance</p>
            <p className="text-white font-mono font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Ticket Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
             {/* Fee Badge */}
            <div className="absolute top-0 right-0 bg-gold-500 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">
              Fee: ${TICKET_COST.toFixed(2)} / Ticket
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
              {successMsg && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg flex items-start">
                  <CheckCircle2 size={20} className="mr-3 mt-0.5 shrink-0" />
                  <p className="text-sm">{successMsg}</p>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-start">
                  <AlertCircle size={20} className="mr-3 mt-0.5 shrink-0" />
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority Level</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Low', 'Normal', 'High'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                        priority === level
                          ? 'bg-gold-500 text-slate-950 border-gold-500'
                          : 'bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Brief summary of your issue"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message Description</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="Please describe your issue in detail..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors placeholder-slate-600 resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-4 flex items-center">
                  <AlertCircle size={14} className="mr-1.5" />
                  By submitting this ticket, you agree to the deduction of ${TICKET_COST.toFixed(2)} from your main wallet balance.
                </p>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 rounded-lg font-bold shadow-lg shadow-gold-500/20 transform hover:-translate-y-1 transition-all flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Processing...' : `Open Ticket ($${TICKET_COST.toFixed(2)})`}
                  {!isSubmitting && <Send size={18} className="ml-2" />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Info & FAQs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 text-white font-bold mb-4">
               <HelpCircle size={20} className="text-gold-500" />
               <h3>Quick Help</h3>
            </div>
            <div className="space-y-4">
               <div className="text-sm">
                 <p className="text-slate-300 font-medium mb-1">What is the response time?</p>
                 <p className="text-slate-500">Premium members receive responses within 2 hours. Standard response time is 24 hours.</p>
               </div>
               <div className="border-t border-slate-800"></div>
               <div className="text-sm">
                 <p className="text-slate-300 font-medium mb-1">Why is there a fee?</p>
                 <p className="text-slate-500">The small fee ensures our support team can focus on high-priority requests and provide quality service.</p>
               </div>
               <div className="border-t border-slate-800"></div>
               <div className="text-sm">
                 <p className="text-slate-300 font-medium mb-1">Are refunds available?</p>
                 <p className="text-slate-500">If the issue is found to be a platform error, the ticket fee will be refunded to your wallet.</p>
               </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-white font-bold mb-2">Live Chat</h4>
               <p className="text-sm text-indigo-200 mb-4">Need urgent help? Connect with an agent instantly.</p>
               <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                 Start Chat
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;