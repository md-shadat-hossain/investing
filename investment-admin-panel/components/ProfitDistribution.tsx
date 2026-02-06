import React, { useState, useEffect } from 'react';
import { Play, Pause, TrendingUp, DollarSign, Clock, Filter, Calendar, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

interface Investment {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  plan: {
    name: string;
    roi: number;
  };
  amount: number;
  expectedProfit: number;
  earnedProfit: number;
  status: 'active' | 'completed' | 'paused';
  nextProfitDate: string;
  isPaused: boolean;
}

interface ProfitDistribution {
  _id: string;
  investment: string;
  user: string;
  amount: number;
  type: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'failed';
  distributedAt: string;
  createdAt: string;
}

interface Adjustment {
  _id: string;
  investment: string;
  amount: number;
  type: 'add' | 'deduct';
  reason: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const ProfitDistribution: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'distributions' | 'adjustments'>('overview');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [distributions, setDistributions] = useState<ProfitDistribution[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // TODO: Replace with actual API calls
    setInvestments([
      {
        _id: '1',
        user: { _id: 'u1', fullName: 'John Doe', email: 'john@example.com' },
        plan: { name: 'Diamond Legacy', roi: 25 },
        amount: 10000,
        expectedProfit: 2500,
        earnedProfit: 1250,
        status: 'active',
        nextProfitDate: new Date(Date.now() + 86400000).toISOString(),
        isPaused: false
      }
    ]);
  }, []);

  const handleRunDistribution = async () => {
    setLoading(true);
    try {
      // TODO: Call API - POST /api/v1/profits/admin/run-distribution
      // const response = await fetch('/api/v1/profits/admin/run-distribution', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      alert('Profit distribution started! This will run in the background.');
    } catch (error) {
      alert('Failed to run distribution');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async (investmentId: string, isPaused: boolean) => {
    try {
      const endpoint = isPaused ? 'resume' : 'pause';
      // TODO: Call API - POST /api/v1/profits/admin/investment/:id/pause or resume
      alert(`Investment ${isPaused ? 'resumed' : 'paused'} successfully`);
    } catch (error) {
      alert('Failed to update investment status');
    }
  };

  const handleCreateAdjustment = async (data: any) => {
    try {
      // TODO: Call API - POST /api/v1/profits/admin/adjustments
      alert('Adjustment created successfully');
      setShowAdjustmentModal(false);
    } catch (error) {
      alert('Failed to create adjustment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-900">Profit Distribution Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage profit distributions, adjustments, and investment controls</p>
        </div>
        <button
          onClick={handleRunDistribution}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
        >
          <Play size={18} />
          {loading ? 'Running...' : 'Run Distribution Now'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Distributed</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">$45,280</h3>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> +12% this month
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Investments</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">127</h3>
              <p className="text-xs text-slate-500 mt-2">Earning profits</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Next Distribution</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">2h 45m</h3>
              <p className="text-xs text-slate-500 mt-2">Automated run</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Paused Investments</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">3</h3>
              <p className="text-xs text-rose-600 mt-2">Require attention</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <Pause className="text-rose-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="border-b border-slate-100 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-slate-500 hover:text-navy-900'
              }`}
            >
              Active Investments
            </button>
            <button
              onClick={() => setActiveTab('distributions')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'distributions'
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-slate-500 hover:text-navy-900'
              }`}
            >
              Distribution History
            </button>
            <button
              onClick={() => setActiveTab('adjustments')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'adjustments'
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-slate-500 hover:text-navy-900'
              }`}
            >
              Profit Adjustments
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-navy-900">Active Investments</h3>
                <button
                  onClick={() => setShowAdjustmentModal(true)}
                  className="text-sm bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition-colors"
                >
                  Create Adjustment
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Investment</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Progress</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Next Profit</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {investments.map((investment) => (
                      <tr key={investment._id} className="hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-sm text-navy-900">{investment.user.fullName}</div>
                            <div className="text-xs text-slate-500">{investment.user.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm font-medium text-navy-900">{investment.plan.name}</div>
                            <div className="text-xs text-slate-500">{investment.plan.roi}% ROI</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-mono font-medium text-navy-900">
                            ${investment.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="font-medium">${investment.earnedProfit.toLocaleString()}</span>
                              <span className="text-slate-400">/</span>
                              <span>${investment.expectedProfit.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${(investment.earnedProfit / investment.expectedProfit) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs text-slate-600">
                            {new Date(investment.nextProfitDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {investment.isPaused ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                              <Pause size={12} /> Paused
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <CheckCircle size={12} /> Active
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePauseResume(investment._id, investment.isPaused)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                investment.isPaused
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {investment.isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvestment(investment);
                                setShowDistributeModal(true);
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-navy-50 text-navy-700 hover:bg-navy-100 transition-colors"
                            >
                              Distribute
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'distributions' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-navy-900 mb-4">Distribution History</h3>
              <div className="text-center py-12 text-slate-400">
                <Clock size={48} className="mx-auto mb-3 opacity-20" />
                <p>No distribution history yet</p>
                <p className="text-sm mt-1">Distribution records will appear here</p>
              </div>
            </div>
          )}

          {activeTab === 'adjustments' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-navy-900 mb-4">Profit Adjustments</h3>
              <div className="text-center py-12 text-slate-400">
                <AlertCircle size={48} className="mx-auto mb-3 opacity-20" />
                <p>No adjustments created yet</p>
                <p className="text-sm mt-1">Adjustments allow you to manually add or deduct profits</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-navy-900">Create Profit Adjustment</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Investment ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="Enter investment ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent">
                  <option value="add">Add Profit</option>
                  <option value="deduct">Deduct Profit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter reason for adjustment"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateAdjustment({})}
                className="flex-1 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
              >
                Create Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Distribution Modal */}
      {showDistributeModal && selectedInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-navy-900">Manual Profit Distribution</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">User:</span>
                  <span className="font-medium text-navy-900">{selectedInvestment.user.fullName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Plan:</span>
                  <span className="font-medium text-navy-900">{selectedInvestment.plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Investment:</span>
                  <span className="font-medium text-navy-900">${selectedInvestment.amount.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profit Amount</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Note (Optional)</label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  rows={2}
                  placeholder="Add a note about this distribution"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setShowDistributeModal(false);
                  setSelectedInvestment(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle distribution
                  setShowDistributeModal(false);
                  setSelectedInvestment(null);
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Distribute Profit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
