import { baseApi } from './baseApi';

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'crypto' | 'bank' | 'payment_processor';
  currency: string;
  symbol?: string;
  walletAddress?: string;
  qrCode?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
  };
  isActive: boolean;
  icon?: string;
  minDeposit?: number;
  maxDeposit?: number;
  minWithdraw?: number;
  maxWithdraw?: number;
  depositFee?: number;
  depositFeeType?: 'fixed' | 'percentage';
  withdrawFee?: number;
  withdrawFeeType?: 'fixed' | 'percentage';
  isDepositEnabled?: boolean;
  isWithdrawEnabled?: boolean;
  processingTime?: string;
  instructions?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    attributes: T;
  };
}

export const paymentGatewayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Active Payment Gateways (Public)
    getActiveGateways: builder.query<ApiResponse<PaymentGateway[]>, { purpose?: string }>({
      query: (params) => ({
        url: '/gateways/active',
        params,
      }),
      providesTags: ['PaymentGateways'],
    }),

    // Get Gateway by ID
    getGatewayById: builder.query<ApiResponse<PaymentGateway>, string>({
      query: (gatewayId) => `/gateways/${gatewayId}`,
      providesTags: ['PaymentGateways'],
    }),
  }),
});

export const {
  useGetActiveGatewaysQuery,
  useGetGatewayByIdQuery,
} = paymentGatewayApi;
