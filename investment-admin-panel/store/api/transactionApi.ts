import { baseApi } from './baseApi';

export interface Transaction {
  id: string;
  user: any;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  paymentGateway: any;
  txHash?: string;
  proofImage?: string;
  notes?: string;
  adminNotes?: string;
  processedBy?: any;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all transactions (admin)
    getAllTransactions: builder.query<any, {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
    }>({
      query: (params) => ({
        url: '/transactions/admin/all',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // Get pending transactions (admin)
    getPendingTransactions: builder.query<any, { type?: string }>({
      query: (params) => ({
        url: '/transactions/admin/pending',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // Get transaction by ID (admin)
    getTransactionById: builder.query<any, string>({
      query: (transactionId) => `/transactions/${transactionId}`,
      providesTags: ['Transactions'],
    }),

    // Get transaction stats (admin)
    getTransactionStats: builder.query<any, void>({
      query: () => '/transactions/stats',
      providesTags: ['Transactions'],
    }),

    // Approve transaction (admin)
    approveTransaction: builder.mutation<any, { transactionId: string; adminNote?: string }>({
      query: ({ transactionId, adminNote }) => ({
        url: `/transactions/admin/${transactionId}/approve`,
        method: 'POST',
        body: { adminNote },
      }),
      invalidatesTags: ['Transactions', 'Wallet', 'Analytics'],
    }),

    // Reject transaction (admin)
    rejectTransaction: builder.mutation<any, { transactionId: string; adminNote?: string; reason?: string }>({
      query: ({ transactionId, adminNote, reason }) => ({
        url: `/transactions/admin/${transactionId}/reject`,
        method: 'POST',
        body: { adminNote, reason },
      }),
      invalidatesTags: ['Transactions', 'Analytics'],
    }),
  }),
});

export const {
  useGetAllTransactionsQuery,
  useGetPendingTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionStatsQuery,
  useApproveTransactionMutation,
  useRejectTransactionMutation,
} = transactionApi;
