import { baseApi } from './baseApi';

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
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
  totalInvestors?: number;
  totalInvested?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  minDeposit: number;
  maxDeposit: number;
  roi: number;
  roiType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'total';
  duration: number;
  durationType: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  referralBonus: number;
  isPopular?: boolean;
  isActive?: boolean;
  features: string[];
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

export const investmentPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all investment plans (admin)
    getAllPlans: builder.query<any, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/plans',
        params,
      }),
      providesTags: ['InvestmentPlans'],
    }),

    // Get active plans
    getActivePlans: builder.query<any, void>({
      query: () => '/plans/active',
      providesTags: ['InvestmentPlans'],
    }),

    // Get plan by ID
    getPlanById: builder.query<any, string>({
      query: (planId) => `/plans/${planId}`,
      providesTags: ['InvestmentPlans'],
    }),

    // Create plan (admin)
    createPlan: builder.mutation<any, CreatePlanRequest>({
      query: (body) => ({
        url: '/plans',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InvestmentPlans'],
    }),

    // Update plan (admin)
    updatePlan: builder.mutation<any, { planId: string; data: UpdatePlanRequest }>({
      query: ({ planId, data }) => ({
        url: `/plans/${planId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['InvestmentPlans'],
    }),

    // Delete plan (admin)
    deletePlan: builder.mutation<any, string>({
      query: (planId) => ({
        url: `/plans/${planId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['InvestmentPlans'],
    }),
  }),
});

export const {
  useGetAllPlansQuery,
  useGetActivePlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = investmentPlanApi;
