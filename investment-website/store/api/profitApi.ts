import { baseApi } from './baseApi';

interface Profit {
  id: string;
  userId: string;
  investmentId: string;
  amount: number;
  rate: number;
  distributedAt: string;
  investment?: {
    id: string;
    amount: number;
    plan?: {
      id: string;
      name: string;
      returns: number;
    };
  };
  createdAt: string;
}

interface ProfitSummary {
  totalProfit: number;
  monthlyProfit: number;
  weeklyProfit: number;
  todayProfit: number;
  profitCount: number;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    attributes: T;
  };
}

export const profitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get My Profit History
    getMyProfitHistory: builder.query<ApiResponse<Profit[]>, void>({
      query: () => '/profits/my-history',
      providesTags: ['Profits'],
    }),

    // Get Investment Profit History
    getInvestmentProfitHistory: builder.query<ApiResponse<Profit[]>, string>({
      query: (id) => `/profits/investment/${id}/history`,
      providesTags: (result, error, id) => [{ type: 'Profits', id }],
    }),
  }),
});

export const {
  useGetMyProfitHistoryQuery,
  useGetInvestmentProfitHistoryQuery,
} = profitApi;
