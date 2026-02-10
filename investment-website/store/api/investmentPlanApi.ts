import { baseApi } from './baseApi';

export interface InvestmentPlan {
  id: string;
  name: string;
  description?: string;
  minDeposit: number;
  maxDeposit: number;
  roi: number;
  roiType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'total';
  duration: number;
  durationType: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  referralBonus: number;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
  totalInvestors: number;
  totalInvested: number;
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

export const investmentPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Plans
    getAllPlans: builder.query<ApiResponse<InvestmentPlan[]>, void>({
      query: () => '/plans',
      providesTags: ['InvestmentPlans'],
    }),

    // Get Active Plans
    getActivePlans: builder.query<ApiResponse<InvestmentPlan[]>, void>({
      query: () => '/plans/active',
      providesTags: ['InvestmentPlans'],
    }),

    // Get Plan By ID
    getPlanById: builder.query<ApiResponse<InvestmentPlan>, string>({
      query: (id) => `/plans/${id}`,
      providesTags: (result, error, id) => [{ type: 'InvestmentPlans', id }],
    }),
  }),
});

export const {
  useGetAllPlansQuery,
  useGetActivePlansQuery,
  useGetPlanByIdQuery,
} = investmentPlanApi;
