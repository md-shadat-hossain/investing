import React, { useState } from 'react';
import { Save, Lock, User, FileText, Shield } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'legal'>('profile');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-navy-900">System Settings</h2>
        <p className="text-slate-500 text-sm">Manage profile, security, and legal documents.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-gold-500 text-navy-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <User size={18} /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'security' ? 'border-gold-500 text-navy-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Lock size={18} /> Security
          </button>
          <button 
            onClick={() => setActiveTab('legal')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'legal' ? 'border-gold-500 text-navy-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <FileText size={18} /> Policies & Terms
          </button>
        </div>

        <div className="p-6 lg:p-10">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-navy-900 text-white flex items-center justify-center text-3xl font-bold shadow-xl">A</div>
                <div>
                   <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Change Avatar</button>
                   <p className="text-xs text-slate-400 mt-2">Recommended: 200x200px</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                   <input type="text" defaultValue="Admin User" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                   <input type="email" defaultValue="admin@boltz.finance" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Role Description</label>
                   <textarea rows={3} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none text-sm" defaultValue="Super Administrator with full access to financial controls and user management."></textarea>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="flex items-center gap-2 bg-navy-900 text-white px-6 py-2.5 rounded-lg hover:bg-navy-800 transition-shadow shadow-md">
                   <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-lg mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm mb-6">
                 <Shield className="flex-shrink-0 mt-0.5" size={18} />
                 <p>For your security, you will be logged out after changing your password.</p>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                 <input type="password" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                 <input type="password" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                 <input type="password" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none" />
              </div>
              <div className="pt-4">
                <button className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-shadow shadow-md font-medium">
                   Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-navy-900">Privacy Policy</label>
                    <span className="text-xs text-slate-400">Last updated: Oct 24, 2023</span>
                  </div>
                  <textarea rows={6} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none text-sm leading-relaxed" 
                    defaultValue="At Boltz Finance, we value your privacy. This policy outlines how we collect, use, and protect your personal information..." />
               </div>
               
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-navy-900">Terms & Conditions</label>
                    <span className="text-xs text-slate-400">Last updated: Aug 12, 2023</span>
                  </div>
                  <textarea rows={6} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none text-sm leading-relaxed" 
                    defaultValue="By accessing or using the Boltz Finance platform, you agree to be bound by these terms. Usage of our services implies acceptance..." />
               </div>

               <div className="pt-4 flex justify-end border-t border-slate-100">
                <button className="flex items-center gap-2 bg-navy-900 text-white px-6 py-2.5 rounded-lg hover:bg-navy-800 transition-shadow shadow-md">
                   <Save size={18} /> Update Legal Documents
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};