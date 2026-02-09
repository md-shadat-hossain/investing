import React, { useState } from 'react';
import { Users, TrendingUp, DollarSign, Share2, Download, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetAllReferralsQuery, useGetCommissionRatesQuery } from '../store/api/referralApi';

export const ReferralManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'commissions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // API calls
  const { data: referralData, isLoading, error } = useGetAllReferralsQuery({
    page,
    limit,
    sortBy: 'createdAt:desc',
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: ratesData } = useGetCommissionRatesQuery();

  const referrals = referralData?.data?.attributes?.results || [];
  const totalResults = referralData?.data?.attributes?.totalResults || 0;
  const totalPages = referralData?.data?.attributes?.totalPages || 1;
  const currentPage = referralData?.data?.attributes?.page || 1;

  const commissionRates = ratesData?.data?.attributes || [];

  // Compute stats from loaded data
  const totalReferrals = totalResults;
  const activeReferrals = referrals.filter((r: any) => r.status === 'active').length;
  const totalCommissions = referrals.reduce((sum: number, r: any) => sum + (r.totalEarnings || 0), 0);

  // Find top referrer from current page data
  const referrerMap: Record<string, { name: string; count: number; earnings: number }> = {};
  referrals.forEach((r: any) => {
    const referrerId = r.referrer?.id || r.referrer?._id;
    const name = r.referrer?.fullName || r.referrer?.email || 'Unknown';
    if (referrerId) {
      if (!referrerMap[referrerId]) {
        referrerMap[referrerId] = { name, count: 0, earnings: 0 };
      }
      referrerMap[referrerId].count++;
      referrerMap[referrerId].earnings += r.totalEarnings || 0;
    }
  });
  const topReferrer = Object.values(referrerMap).sort((a, b) => b.count - a.count)[0] || null;

  // Client-side filtering for search and level
  const filteredReferrals = referrals.filter((ref: any) => {
    const matchesSearch = !searchTerm ||
      (ref.referrer?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.referred?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.referrer?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.referred?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === 'all' || ref.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const levelColors = ['emerald', 'blue', 'indigo', 'purple', 'pink', 'rose', 'orange'];

  const handleExport = () => {
    const csvRows = [
      ['Referrer', 'Email', 'Referred User', 'Email', 'Level', 'Commission Rate', 'Total Earnings', 'First Deposit', 'Status', 'Date'].join(','),
      ...filteredReferrals.map((r: any) =>
        [
          r.referrer?.fullName || '',
          r.referrer?.email || '',
          r.referred?.fullName || '',
          r.referred?.email || '',
          r.level,
          `${r.commissionRate}%`,
          `$${(r.totalEarnings || 0).toFixed(2)}`,
          r.firstDepositAmount ? `$${r.firstDepositAmount}` : '-',
          r.status,
          new Date(r.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referrals-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-navy-600" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
        <p className="text-rose-600 font-medium">Failed to load referral data</p>
        <p className="text-slate-500 text-sm mt-1">{(error as any)?.data?.message || 'Please try again later'}</p>
      </div>
    );
  }

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
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{totalReferrals}</h3>
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
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{activeReferrals}</h3>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> {totalReferrals > 0 ? Math.round((activeReferrals / totalReferrals) * 100) : 0}% active rate
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
                ${totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-slate-500 mt-2">From current page</p>
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
              <h3 className="text-lg font-bold text-navy-900 mt-1 truncate">{topReferrer?.name || '-'}</h3>
              <p className="text-xs text-slate-500 mt-2">
                {topReferrer ? `${topReferrer.count} refs · $${topReferrer.earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'No data yet'}
              </p>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {commissionRates.length > 0 ? (
            commissionRates.map((item: any, idx: number) => {
              const color = levelColors[idx] || 'slate';
              return (
                <div
                  key={item.level}
                  className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 text-center`}
                >
                  <div className={`text-${color}-900 text-sm font-medium mb-1`}>Level {item.level}</div>
                  <div className={`text-${color}-700 text-2xl font-bold`}>{item.commissionRate}%</div>
                  <div className={`text-${color}-600 text-xs mt-1`}>Commission</div>
                </div>
              );
            })
          ) : (
            [
              { level: 1, rate: 8 }, { level: 2, rate: 4 }, { level: 3, rate: 3 },
              { level: 4, rate: 2 }, { level: 5, rate: 1 }, { level: 6, rate: 1 }, { level: 7, rate: 1 },
            ].map((item, idx) => {
              const color = levelColors[idx];
              return (
                <div
                  key={item.level}
                  className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 text-center`}
                >
                  <div className={`text-${color}-900 text-sm font-medium mb-1`}>Level {item.level}</div>
                  <div className={`text-${color}-700 text-2xl font-bold`}>{item.rate}%</div>
                  <div className={`text-${color}-600 text-xs mt-1`}>Commission</div>
                </div>
              );
            })
          )}
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

        {activeTab === 'overview' && (
          <>
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
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Table */}
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
                    filteredReferrals.map((referral: any) => (
                      <tr key={referral.id || referral._id} className="hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-sm text-navy-900">{referral.referrer?.fullName || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{referral.referrer?.email || ''}</div>
                            <div className="text-xs text-blue-600 font-mono mt-1">{referral.referralCode || referral.referrer?.referralCode || ''}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-sm text-navy-900">{referral.referred?.fullName || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{referral.referred?.email || ''}</div>
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
                            ${(referral.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {referral.firstDepositAmount ? (
                            <>
                              <div className="text-sm text-navy-900">${referral.firstDepositAmount.toLocaleString()}</div>
                              <div className="text-xs text-slate-500">
                                {referral.firstDepositDate ? new Date(referral.firstDepositDate).toLocaleDateString() : '-'}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">No deposit yet</span>
                          )}
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
                Showing {filteredReferrals.length} of {totalResults} referrals (Page {currentPage} of {totalPages})
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'referrals' && (
          <div className="p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Referrals by Level</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                const levelRefs = referrals.filter((r: any) => r.level === level);
                const levelActive = levelRefs.filter((r: any) => r.status === 'active').length;
                const levelEarnings = levelRefs.reduce((sum: number, r: any) => sum + (r.totalEarnings || 0), 0);
                const rate = commissionRates.find((c: any) => c.level === level);
                const color = levelColors[level - 1] || 'slate';

                return (
                  <div key={level} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-${color}-900 font-bold text-lg`}>Level {level}</span>
                      <span className={`bg-${color}-200 text-${color}-800 px-2 py-0.5 rounded-full text-xs font-bold`}>
                        {rate?.commissionRate ?? [8, 4, 3, 2, 1, 1, 1][level - 1]}%
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={`text-${color}-700`}>Total</span>
                        <span className={`text-${color}-900 font-semibold`}>{levelRefs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-${color}-700`}>Active</span>
                        <span className={`text-${color}-900 font-semibold`}>{levelActive}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-${color}-700`}>Earnings</span>
                        <span className={`text-${color}-900 font-semibold`}>
                          ${levelEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Commission Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Level</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Commission Rate</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total Members</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Active</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Pending</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                    const levelRefs = referrals.filter((r: any) => r.level === level);
                    const activeCount = levelRefs.filter((r: any) => r.status === 'active').length;
                    const pendingCount = levelRefs.filter((r: any) => r.status === 'pending').length;
                    const earnings = levelRefs.reduce((sum: number, r: any) => sum + (r.totalEarnings || 0), 0);
                    const rate = commissionRates.find((c: any) => c.level === level);

                    return (
                      <tr key={level} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Level {level}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-emerald-600">
                            {rate?.commissionRate ?? [8, 4, 3, 2, 1, 1, 1][level - 1]}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-navy-900">{levelRefs.length}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-emerald-600">{activeCount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-amber-600">{pendingCount}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-mono font-bold text-navy-900">
                            ${earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="py-3 px-4 font-bold text-sm text-navy-900">Total</td>
                    <td className="py-3 px-4 font-bold text-sm text-emerald-600">20%</td>
                    <td className="py-3 px-4 font-bold text-sm text-navy-900">{referrals.length}</td>
                    <td className="py-3 px-4 font-bold text-sm text-emerald-600">
                      {referrals.filter((r: any) => r.status === 'active').length}
                    </td>
                    <td className="py-3 px-4 font-bold text-sm text-amber-600">
                      {referrals.filter((r: any) => r.status === 'pending').length}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sm font-mono text-navy-900">
                      ${totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
