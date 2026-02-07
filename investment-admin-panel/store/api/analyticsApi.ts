import { baseApi } from './baseApi';

export interface DashboardStats {
  totalUsers: number;
  activeInvestments: number;
  totalInvested: number;
  totalProfitDistributed: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalDeposits: number;
  totalWithdrawals: number;
  recentTransactions?: any[];
  recentUsers?: any[];
  monthlyRevenue?: {
    month: string;
    amount: number;
  }[];
  investmentsByPlan?: {
    planName: string;
    count: number;
    amount: number;
  }[];
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard statistics (admin)
    getDashboardStats: builder.query<any, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Analytics'],
    }),

    // Get recent activities (admin)
    getRecentActivities: builder.query<any, { limit?: number }>({
      query: (params) => ({
        url: '/admin/activities',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRecentActivitiesQuery,
} = analyticsApi;
