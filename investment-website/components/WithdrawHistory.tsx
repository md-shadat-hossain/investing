'use client'

import React, { useState } from 'react';
import { ArrowUpRight, Search, Loader2 } from 'lucide-react';
import { useGetMyTransactionsQuery } from '@/store/api/transactionApi';
import type { Transaction } from '@/store/api/transactionApi';
import Link from 'next/link';

const WithdrawHistory = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  // Fetch withdrawals from API
  const { data: transactionsResponse, isLoading, error } = useGetMyTransactionsQuery({
    page,
    limit,
    type: 'withdraw',
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const transactionsData = transactionsResponse?.data?.attributes || {};
  const withdrawals: Transaction[] = transactionsData.results || [];
  const totalPages = transactionsData.totalPages || 1;
  const totalResults = transactionsData.totalResults || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '-';
    if (address.length > 12) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Withdrawal History</h2>
          <p className="text-slate-400 text-sm">View your payout records and status</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'rejected', label: 'Rejected' },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setStatusFilter(status.value);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  statusFilter === status.value
                    ? 'bg-gold-500 text-slate-900 border-gold-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gold-500" size={32} />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-rose-500 font-medium">Failed to load withdrawal history</p>
            <p className="text-slate-500 text-sm mt-2">Please try again later</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Transaction ID</th>
                    <th className="px-6 py-4 font-medium">Method</th>
                    <th className="px-6 py-4 font-medium">Account/Address</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                  {withdrawals.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">
                        <Link href={`/dashboard/transactions/${tx.id}`} className="flex items-center hover:text-gold-500 transition-colors">
                          <div className="bg-red-500/10 p-1.5 rounded-full mr-3 text-red-500">
                            <ArrowUpRight size={14} />
                          </div>
                          {tx.transactionId || tx.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {tx.paymentGateway?.name || tx.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {tx.walletAddress ? truncateAddress(tx.walletAddress) : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(tx.createdAt)}</td>
                      <td className="px-6 py-4 font-bold text-red-400">
                        -${tx.netAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tx.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          tx.status === 'pending' || tx.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {formatStatus(tx.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {withdrawals.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No withdrawal records found.
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-500">
              <span>
                Showing {withdrawals.length} of {totalResults} records
                {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WithdrawHistory;