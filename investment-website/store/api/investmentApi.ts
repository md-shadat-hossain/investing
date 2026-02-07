import { baseApi } from './baseApi';

interface CreateInvestmentRequest {
  planId: string;
  amount: number;
}

interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currentValue: number;
  profitEarned: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  maturityDate: string;
  plan?: {
    id: string;
    name: string;
    minInvestment: number;
    maxInvestment: number;
    duration: number;
    returns: number;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface InvestmentStats {
  totalInvestments: number;
  activeInvestments: number;
  totalInvested: number;
  totalProfit: number;
  currentValue: number;
  completedInvestments: number;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    attributes: T;
  };
}

export const investmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Investment
    createInvestment: builder.mutation<ApiResponse<Investment>, CreateInvestmentRequest>({
      query: (body) => ({
        url: '/investments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Investments', 'Wallet'],
    }),

    // Get My Investments
    getMyInvestments: builder.query<ApiResponse<Investment[]>, void>({
      query: () => '/investments/my',
      providesTags: ['Investments'],
    }),

    // Get Active Investments
    getActiveInvestments: builder.query<ApiResponse<Investment[]>, void>({
      query: () => '/investments/active',
      providesTags: ['Investments'],
    }),

    // Get Investment By ID
    getInvestmentById: builder.query<ApiResponse<Investment>, string>({
      query: (id) => `/investments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Investments', id }],
    }),

    // Get Investment Stats
    getInvestmentStats: builder.query<ApiResponse<InvestmentStats>, void>({
      query: () => '/investments/stats',
      providesTags: ['Investments'],
    }),
  }),
});

export const {
  useCreateInvestmentMutation,
  useGetMyInvestmentsQuery,
  useGetActiveInvestmentsQuery,
  useGetInvestmentByIdQuery,
  useGetInvestmentStatsQuery,
} = investmentApi;
