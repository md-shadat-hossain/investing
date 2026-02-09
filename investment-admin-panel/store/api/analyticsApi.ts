import { baseApi } from './baseApi';

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

    // Get all transactions for analytics (admin)
    getAllTransactionsForAnalytics: builder.query<any, { limit?: number; sortBy?: string }>({
      query: (params) => ({
        url: '/transactions/admin/all',
        params: { limit: params?.limit || 100, sortBy: params?.sortBy || 'createdAt:desc' },
      }),
      providesTags: ['Transactions'],
    }),

    // Get all investments for analytics (admin)
    getAllInvestmentsForAnalytics: builder.query<any, { limit?: number; sortBy?: string }>({
      query: (params) => ({
        url: '/investments/admin/all',
        params: { limit: params?.limit || 100, sortBy: params?.sortBy || 'createdAt:desc' },
      }),
      providesTags: ['Investments'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRecentActivitiesQuery,
  useGetAllTransactionsForAnalyticsQuery,
  useGetAllInvestmentsForAnalyticsQuery,
} = analyticsApi;
