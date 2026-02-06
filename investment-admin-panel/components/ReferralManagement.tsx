import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Share2, Download, Search, Filter } from 'lucide-react';
import { MaskedData } from './ui/MaskedData';

interface Referral {
  _id: string;
  referrer: {
    _id: string;
    fullName: string;
    email: string;
    referralCode: string;
  };
  referred: {
    _id: string;
    fullName: string;
    email: string;
  };
  level: number;
  commissionRate: number;
  totalEarnings: number;
  status: 'pending' | 'active' | 'inactive';
  firstDepositAmount: number;
  firstDepositDate: string;
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissionsEarned: number;
  topReferrer: {
    name: string;
    referralCount: number;
    totalEarnings: number;
  };
}

export const ReferralManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'commissions'>('overview');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    // TODO: Replace with actual API calls
    setStats({
      totalReferrals: 487,
      activeReferrals: 324,
      totalCommissionsEarned: 24580.50,
      topReferrer: {
        name: 'John Smith',
        referralCount: 45,
        totalEarnings: 3280.75
      }
    });

    setReferrals([
      {
        _id: '1',
        referrer: {
          _id: 'u1',
          fullName: 'John Smith',
          email: 'john@example.com',
          referralCode: 'JOHN2024'
        },
        referred: {
          _id: 'u2',
          fullName: 'Jane Doe',
          email: 'jane@example.com'
        },
        level: 1,
        commissionRate: 8,
        totalEarnings: 240.00,
        status: 'active',
        firstDepositAmount: 3000,
        firstDepositDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
      },
      {
        _id: '2',
        referrer: {
          _id: 'u1',
          fullName: 'John Smith',
          email: 'john@example.com',
          referralCode: 'JOHN2024'
        },
        referred: {
          _id: 'u3',
          fullName: 'Bob Johnson',
          email: 'bob@example.com'
        },
        level: 1,
        commissionRate: 8,
        totalEarnings: 400.00,
        status: 'active',
        firstDepositAmount: 5000,
        firstDepositDate: new Date(Date.now() - 15 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ]);
  }, []);

  const commissionRates = [
    { level: 1, rate: 8, color: 'emerald' },
    { level: 2, rate: 4, color: 'blue' },
    { level: 3, rate: 3, color: 'indigo' },
    { level: 4, rate: 2, color: 'purple' },
    { level: 5, rate: 1, color: 'pink' },
    { level: 6, rate: 1, color: 'rose' },
    { level: 7, rate: 1, color: 'orange' }
  ];

  const filteredReferrals = referrals.filter(ref => {
    const matchesSearch =
      ref.referrer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referred.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.referrer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === 'all' || ref.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Exporting referral data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-900">Referral Management</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage 7-level referral network and commissions</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors font-medium shadow-sm"
        >
          <Download size={18} />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Referrals</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{stats?.totalReferrals || 0}</h3>
              <p className="text-xs text-slate-500 mt-2">All time</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Referrals</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{stats?.activeReferrals || 0}</h3>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> {stats ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100) : 0}% active rate
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Commissions</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">
                ${stats?.totalCommissionsEarned.toLocaleString() || 0}
              </h3>
              <p className="text-xs text-slate-500 mt-2">All time earnings</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <DollarSign className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Top Referrer</p>
              <h3 className="text-lg font-bold text-navy-900 mt-1 truncate">{stats?.topReferrer.name}</h3>
              <p className="text-xs text-slate-500 mt-2">{stats?.topReferrer.referralCount} refs · ${stats?.topReferrer.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Share2 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-semibold text-lg text-navy-900 mb-4">7-Level Commission Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {commissionRates.map((item) => (
            <div
              key={item.level}
              className={`bg-${item.color}-50 border border-${item.color}-200 rounded-lg p-4 text-center`}
            >
              <div className={`text-${item.color}-900 text-sm font-medium mb-1`}>Level {item.level}</div>
              <div className={`text-${item.color}-700 text-2xl font-bold`}>{item.rate}%</div>
              <div className={`text-${item.color}-600 text-xs mt-1`}>Commission</div>
            </div>
          ))}
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
              All Referrals
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'referrals'
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-slate-500 hover:text-navy-900'
              }`}
            >
              By Level
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'commissions'
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-slate-500 hover:text-navy-900'
              }`}
            >
              Commission Breakdown
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by user, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-sm"
            >
              <option value="all">All Levels</option>
              {[1, 2, 3, 4, 5, 6, 7].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Referrer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Referred User</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Level</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Commission Rate</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Total Earnings</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">First Deposit</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No referrals found matching your filters
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((referral) => (
                  <tr key={referral._id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-sm text-navy-900">{referral.referrer.fullName}</div>
                        <div className="text-xs text-slate-500">{referral.referrer.email}</div>
                        <div className="text-xs text-blue-600 font-mono mt-1">{referral.referrer.referralCode}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-sm text-navy-900">{referral.referred.fullName}</div>
                        <div className="text-xs text-slate-500">{referral.referred.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Level {referral.level}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-emerald-600">{referral.commissionRate}%</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-mono font-medium text-navy-900">
                        ${referral.totalEarnings.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-navy-900">${referral.firstDepositAmount.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(referral.firstDepositDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {referral.status === 'active' ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      ) : referral.status === 'pending' ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-slate-100 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Showing {filteredReferrals.length} of {referrals.length} referrals
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
