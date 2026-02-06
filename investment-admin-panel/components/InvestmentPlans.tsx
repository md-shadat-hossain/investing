import React, { useState } from 'react';
import { InvestmentPlan } from '../types';
import { MOCK_PLANS } from '../constants';
import { Plus, TrendingUp, Clock, DollarSign, CheckCircle, Edit, Trash2, Star, X } from 'lucide-react';

interface PlanFormData {
  name: string;
  description: string;
  minDeposit: number;
  maxDeposit: number;
  roi: number;
  roiType: 'daily' | 'weekly' | 'monthly' | 'total';
  duration: number;
  durationType: 'hours' | 'days' | 'weeks' | 'months';
  referralBonus: number;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
}

export const InvestmentPlans: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>(MOCK_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [featureInput, setFeatureInput] = useState('');

  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    minDeposit: 0,
    maxDeposit: 0,
    roi: 0,
    roiType: 'daily',
    duration: 0,
    durationType: 'days',
    referralBonus: 0,
    isPopular: false,
    isActive: true,
    features: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minDeposit: 0,
      maxDeposit: 0,
      roi: 0,
      roiType: 'daily',
      duration: 0,
      durationType: 'days',
      referralBonus: 0,
      isPopular: false,
      isActive: true,
      features: []
    });
    setFeatureInput('');
    setEditingPlan(null);
  };

  const handleOpenModal = (plan?: InvestmentPlan) => {
    if (plan) {
      // Edit mode
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: '', // Add when available in types
        minDeposit: plan.minDeposit,
        maxDeposit: plan.maxDeposit,
        roi: plan.roi,
        roiType: 'daily', // Add when available
        duration: plan.duration,
        durationType: 'days',
        referralBonus: 0,
        isPopular: false,
        isActive: plan.status === 'active',
        features: []
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.minDeposit >= formData.maxDeposit) {
      alert('Max deposit must be greater than min deposit');
      return;
    }

    if (formData.roi <= 0) {
      alert('ROI must be greater than 0');
      return;
    }

    if (formData.duration <= 0) {
      alert('Duration must be greater than 0');
      return;
    }

    try {
      // TODO: Call API to create/update plan
      // const endpoint = editingPlan
      //   ? `/api/v1/plans/${editingPlan.id}`
      //   : '/api/v1/plans';
      //
      // const method = editingPlan ? 'PATCH' : 'POST';
      //
      // const response = await fetch(endpoint, {
      //   method,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(formData)
      // });

      // Mock implementation
      if (editingPlan) {
        // Update existing plan
        setPlans(plans.map(p =>
          p.id === editingPlan.id
            ? { ...p, ...formData, status: formData.isActive ? 'active' : 'inactive' }
            : p
        ));
        alert('Plan updated successfully!');
      } else {
        // Create new plan
        const newPlan: InvestmentPlan = {
          id: `p${Date.now()}`,
          name: formData.name,
          roi: formData.roi,
          duration: formData.duration,
          minDeposit: formData.minDeposit,
          maxDeposit: formData.maxDeposit,
          status: formData.isActive ? 'active' : 'inactive'
        };
        setPlans([...plans, newPlan]);
        alert('Plan created successfully!');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert('Failed to save plan');
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      // TODO: Call API to delete plan
      setPlans(plans.filter(p => p.id !== planId));
      alert('Plan deleted successfully');
    }
  };

  const handleToggleStatus = (plan: InvestmentPlan) => {
    // TODO: Call API to toggle plan status
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    setPlans(plans.map(p =>
      p.id === plan.id ? { ...p, status: newStatus } : p
    ));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-navy-900">Investment Plans</h2>
          <p className="text-slate-500 text-sm">Configure investment opportunities for users.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gold-500 text-white px-5 py-2.5 rounded-lg hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20 font-medium"
        >
          <Plus size={18} /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
            <div className={`h-1 w-full ${plan.status === 'active' ? 'bg-gold-500' : 'bg-slate-300'}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-navy-900">{plan.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  plan.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {plan.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-900">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">ROI</p>
                    <p className="text-lg font-bold text-navy-900">{plan.roi}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Duration</p>
                    <p className="text-sm font-semibold text-slate-700">{plan.duration} Days</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                   <div>
                     <p className="text-xs text-slate-400">Min Deposit</p>
                     <p className="font-mono text-sm font-medium text-slate-700">${plan.minDeposit.toLocaleString()}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-slate-400">Max Deposit</p>
                     <p className="font-mono text-sm font-medium text-slate-700">${plan.maxDeposit.toLocaleString()}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => handleToggleStatus(plan)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  plan.status === 'active'
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {plan.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(plan)}
                  className="p-2 text-navy-900 hover:bg-navy-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
               <h3 className="font-bold text-navy-900 text-lg">
                 {editingPlan ? 'Edit Investment Plan' : 'Create New Investment Plan'}
               </h3>
               <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-1 hover:bg-slate-200 rounded">
                 <X size={20} />
               </button>
             </div>

             <form onSubmit={handleSubmit} className="p-6 space-y-6">
               {/* Basic Information */}
               <div className="space-y-4">
                 <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                   <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">1</div>
                   Basic Information
                 </h4>

                 <div>
                   <label className="text-sm font-medium text-slate-700 block mb-2">Plan Name *</label>
                   <input
                     type="text"
                     required
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                     placeholder="e.g. Diamond Elite, Gold Plan, Starter Package"
                   />
                 </div>

                 <div>
                   <label className="text-sm font-medium text-slate-700 block mb-2">Description *</label>
                   <textarea
                     required
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                     rows={3}
                     className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                     placeholder="Describe the plan benefits and target audience..."
                   />
                 </div>
               </div>

               {/* ROI Configuration */}
               <div className="space-y-4">
                 <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                   <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">2</div>
                   Return on Investment (ROI)
                 </h4>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">ROI Percentage * (%)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.roi}
                        onChange={e => setFormData({...formData, roi: parseFloat(e.target.value)})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="5.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">ROI Type *</label>
                      <select
                        required
                        value={formData.roiType}
                        onChange={e => setFormData({...formData, roiType: e.target.value as any})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="total">Total (One-time)</option>
                      </select>
                    </div>
                 </div>
               </div>

               {/* Duration */}
               <div className="space-y-4">
                 <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                   <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">3</div>
                   Investment Duration
                 </h4>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Duration *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.duration}
                        onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Duration Type *</label>
                      <select
                        required
                        value={formData.durationType}
                        onChange={e => setFormData({...formData, durationType: e.target.value as any})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                 </div>
               </div>

               {/* Deposit Limits */}
               <div className="space-y-4">
                 <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                   <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">4</div>
                   Deposit Limits
                 </h4>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Minimum Deposit * ($)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.minDeposit}
                        onChange={e => setFormData({...formData, minDeposit: parseFloat(e.target.value)})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Maximum Deposit * ($)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.maxDeposit}
                        onChange={e => setFormData({...formData, maxDeposit: parseFloat(e.target.value)})}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="50000"
                      />
                    </div>
                 </div>
               </div>

               {/* Referral Bonus */}
               <div className="space-y-4">
                 <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                   <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">5</div>
                   Referral Program
                 </h4>

                 <div>
                   <label className="text-sm font-medium text-slate-700 block mb-2">Referral Bonus * (%)</label>
                   <input
                     type="number"
                     required
                     step="0.1"
                     min="0"
                     max="100"
                     value={formData.referralBonus}
                     onChange={e => setFormData({...formData, referralBonus: parseFloat(e.target.value)})}
                     className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                     placeholder="10"
                   />
                   <p className="text-xs text-slate-500 mt-1">Percentage of investment amount given as referral bonus</p>
                 </div>
               </div>

               {/* Features */}
               <div className="space-y-4">
                 <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                   <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">6</div>
                   Plan Features
                 </h4>

                 <div>
                   <label className="text-sm font-medium text-slate-700 block mb-2">Add Features</label>
                   <div className="flex gap-2">
                     <input
                       type="text"
                       value={featureInput}
                       onChange={e => setFeatureInput(e.target.value)}
                       onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                       className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                       placeholder="e.g. 24/7 Support, Instant Withdrawals"
                     />
                     <button
                       type="button"
                       onClick={handleAddFeature}
                       className="px-4 py-2.5 bg-navy-900 text-white rounded-lg hover:bg-navy-800 text-sm font-medium"
                     >
                       Add
                     </button>
                   </div>

                   {formData.features.length > 0 && (
                     <div className="mt-3 space-y-2">
                       {formData.features.map((feature, index) => (
                         <div key={index} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                           <CheckCircle size={16} className="text-emerald-600" />
                           <span className="flex-1 text-sm text-slate-700">{feature}</span>
                           <button
                             type="button"
                             onClick={() => handleRemoveFeature(index)}
                             className="p-1 hover:bg-rose-100 rounded text-rose-600"
                           >
                             <X size={14} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>

               {/* Settings */}
               <div className="space-y-4">
                 <h4 className="font-semibold text-navy-900 flex items-center gap-2">
                   <div className="w-6 h-6 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs">7</div>
                   Plan Settings
                 </h4>

                 <div className="space-y-3">
                   <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                     <input
                       type="checkbox"
                       checked={formData.isPopular}
                       onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                       className="w-4 h-4 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
                     />
                     <div className="flex-1">
                       <div className="flex items-center gap-2">
                         <Star size={16} className="text-gold-500" />
                         <span className="text-sm font-medium text-slate-700">Mark as Popular</span>
                       </div>
                       <p className="text-xs text-slate-500 mt-0.5">Highlight this plan with a "Popular" badge</p>
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
                       <div className="flex items-center gap-2">
                         <CheckCircle size={16} className="text-emerald-600" />
                         <span className="text-sm font-medium text-slate-700">Active Status</span>
                       </div>
                       <p className="text-xs text-slate-500 mt-0.5">Users can see and invest in this plan</p>
                     </div>
                   </label>
                 </div>
               </div>

               {/* Summary */}
               <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
                 <h5 className="font-semibold text-navy-900 text-sm mb-3">Plan Summary</h5>
                 <div className="grid grid-cols-2 gap-3 text-xs">
                   <div>
                     <span className="text-slate-600">ROI:</span>
                     <span className="font-semibold text-navy-900 ml-2">{formData.roi}% {formData.roiType}</span>
                   </div>
                   <div>
                     <span className="text-slate-600">Duration:</span>
                     <span className="font-semibold text-navy-900 ml-2">{formData.duration} {formData.durationType}</span>
                   </div>
                   <div>
                     <span className="text-slate-600">Min-Max:</span>
                     <span className="font-semibold text-navy-900 ml-2">${formData.minDeposit} - ${formData.maxDeposit}</span>
                   </div>
                   <div>
                     <span className="text-slate-600">Referral:</span>
                     <span className="font-semibold text-navy-900 ml-2">{formData.referralBonus}%</span>
                   </div>
                 </div>
               </div>

               {/* Actions */}
               <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
                  >
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
