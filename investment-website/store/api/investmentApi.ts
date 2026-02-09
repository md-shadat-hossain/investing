import { baseApi } from './baseApi';
import type { InvestmentPlan } from './investmentPlanApi';

interface CreateInvestmentRequest {
  planId: string;
  amount: number;
}

export interface Investment {
  id: string;
  user: string;
  plan: InvestmentPlan;
  amount: number;
  expectedProfit: number;
  earnedProfit: number;
  roi: number;
  startDate: string;
  endDate: string;
  nextProfitDate?: string;
  lastProfitDate?: string;
  totalProfitDistributions: number;
  dailyProfitAmount: number;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  isPaused: boolean;
  autoReinvest: boolean;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentStats {
  totalInvestments: number;
  activeInvestments: number;
  completedInvestments: number;
  totalInvested: number;
  totalExpectedProfit: number;
  totalEarnedProfit: number;
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
    getMyInvestments: builder.query<ApiResponse<Investment[]>, { status?: string }>({
      query: (params) => ({
        url: '/investments/my',
        params,
      }),
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
