import { baseApi } from './baseApi';

interface ReferralUser {
  id: string;
  fullName: string;
  email: string;
  referralCode?: string;
}

interface Referral {
  id: string;
  referrer: ReferralUser;
  referred: ReferralUser;
  referralCode: string;
  level: number;
  commissionRate: number;
  totalEarnings: number;
  status: 'pending' | 'active' | 'inactive';
  firstDepositAmount: number;
  firstDepositDate: string | null;
  createdAt: string;
}

interface PaginatedResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      results: Referral[];
      page: number;
      limit: number;
      totalPages: number;
      totalResults: number;
    };
  };
}

interface CommissionRate {
  level: number;
  commissionRate: number;
  description: string;
}

interface CommissionRatesResponse {
  code: number;
  message: string;
  data: {
    attributes: CommissionRate[];
  };
}

interface GetAllReferralsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  status?: string;
  referrer?: string;
  referred?: string;
}

export const referralApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin: Get all referrals with filters and pagination
    getAllReferrals: builder.query<PaginatedResponse, GetAllReferralsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', String(params.page));
        if (params.limit) queryParams.set('limit', String(params.limit));
        if (params.sortBy) queryParams.set('sortBy', params.sortBy);
        if (params.status && params.status !== 'all') queryParams.set('status', params.status);
        if (params.referrer) queryParams.set('referrer', params.referrer);
        if (params.referred) queryParams.set('referred', params.referred);
        return `/referrals/admin/all?${queryParams.toString()}`;
      },
      providesTags: ['Referrals'],
    }),

    // Public: Get commission rates
    getCommissionRates: builder.query<CommissionRatesResponse, void>({
      query: () => '/referrals/commission-rates',
    }),
  }),
});

export const {
  useGetAllReferralsQuery,
  useGetCommissionRatesQuery,
} = referralApi;
