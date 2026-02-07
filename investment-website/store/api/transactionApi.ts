import { baseApi } from './baseApi';

interface CreateWithdrawalRequest {
  amount: number;
  paymentGatewayId?: string;
  paymentMethod?: string;
  walletAddress?: string;
  bankDetails?: {
    accountNumber?: string;
    accountName?: string;
    routingNumber?: string;
    swiftCode?: string;
  };
}

export interface Transaction {
  id: string;
  user?: any;
  type: 'deposit' | 'withdraw' | 'investment' | 'profit' | 'referral' | 'bonus';
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  paymentMethod?: string;
  paymentGateway?: any;
  walletAddress?: string;
  txHash?: string;
  proofImage?: string;
  transactionId?: string;
  notes?: string;
  adminNotes?: string;
  processedBy?: any;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    attributes: T;
  };
}

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Deposit
    createDeposit: builder.mutation<ApiResponse<Transaction>, FormData>({
      query: (formData) => ({
        url: '/transactions/deposit',
        method: 'POST',
        body: formData,
        prepareHeaders: (headers: Headers) => {
          // Remove Content-Type header to let browser set it with boundary for FormData
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ['Transactions', 'Wallet'],
    }),

    // Create Withdrawal
    createWithdrawal: builder.mutation<ApiResponse<Transaction>, CreateWithdrawalRequest>({
      query: (body) => ({
        url: '/transactions/withdraw',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Transactions', 'Wallet'],
    }),

    // Get My Transactions
    getMyTransactions: builder.query<ApiResponse<{ results: Transaction[]; totalPages?: number; page?: number; limit?: number; totalResults?: number }>, { page?: number; limit?: number; type?: string; status?: string; search?: string }>({
      query: (params) => ({
        url: '/transactions/my',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // Get Transaction By ID
    getTransactionById: builder.query<ApiResponse<Transaction>, string>({
      query: (id) => `/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transactions', id }],
    }),
  }),
});

export const {
  useCreateDepositMutation,
  useCreateWithdrawalMutation,
  useGetMyTransactionsQuery,
  useGetTransactionByIdQuery,
} = transactionApi;
