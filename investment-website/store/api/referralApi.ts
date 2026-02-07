import { baseApi } from './baseApi';

interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  level: number;
  commissionEarned: number;
  status: 'active' | 'inactive';
  referredUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isEmailVerified: boolean;
    totalInvested?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissionEarned: number;
  monthlyCommission: number;
  weeklyCommission: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
}

interface ValidateReferralCodeResponse {
  isValid: boolean;
  referrer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  level: number;
  totalInvested: number;
  commissionGenerated: number;
  joinedAt: string;
  isActive: boolean;
}

interface CommissionBreakdown {
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  totalCommission: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
}

interface CommissionRate {
  level: number;
  rate: number;
  description: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    attributes: T;
  };
}

export const referralApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get My Referrals
    getMyReferrals: builder.query<ApiResponse<Referral[]>, void>({
      query: () => '/referrals/my',
      providesTags: ['Referrals'],
    }),

    // Get Referral Stats
    getReferralStats: builder.query<ApiResponse<ReferralStats>, void>({
      query: () => '/referrals/stats',
      providesTags: ['Referrals'],
    }),

    // Validate Referral Code
    validateReferralCode: builder.query<ApiResponse<ValidateReferralCodeResponse>, string>({
      query: (code) => `/referrals/validate/${code}`,
    }),

    // Get Team Network
    getTeamNetwork: builder.query<ApiResponse<TeamMember[]>, void>({
      query: () => '/referrals/team-network',
      providesTags: ['Referrals'],
    }),

    // Get Commission Breakdown
    getCommissionBreakdown: builder.query<ApiResponse<CommissionBreakdown>, void>({
      query: () => '/referrals/commission-breakdown',
      providesTags: ['Referrals'],
    }),

    // Get Commission Rates
    getCommissionRates: builder.query<ApiResponse<CommissionRate[]>, void>({
      query: () => '/referrals/commission-rates',
      providesTags: ['Referrals'],
    }),
  }),
});

export const {
  useGetMyReferralsQuery,
  useGetReferralStatsQuery,
  useValidateReferralCodeQuery,
  useLazyValidateReferralCodeQuery,
  useGetTeamNetworkQuery,
  useGetCommissionBreakdownQuery,
  useGetCommissionRatesQuery,
} = referralApi;
