import { baseApi } from './baseApi';

interface Wallet {
  id: string;
  userId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalInvested: number;
  totalProfit: number;
  pendingWithdrawals: number;
  createdAt: string;
  updatedAt: string;
}

interface WalletStats {
  balance: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalInvested: number;
  totalProfit: number;
  referralEarnings: number;
  balanceTrend: Array<{
    date: string;
    balance: number;
  }>;
  incomeExpense: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  transactionDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  incomeBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    attributes: T;
  };
}

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Wallet
    getWallet: builder.query<ApiResponse<Wallet>, void>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),

    // Get Wallet Stats
    getWalletStats: builder.query<ApiResponse<WalletStats>, { timeRange?: string }>({
      query: (params) => ({
        url: '/wallet/stats',
        params,
      }),
      providesTags: ['Wallet'],
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetWalletStatsQuery,
} = walletApi;
