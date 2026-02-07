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

export interface CreateGatewayRequest {
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
  isActive?: boolean;
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
}

export interface UpdateGatewayRequest extends Partial<CreateGatewayRequest> {}

export const paymentGatewayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all payment gateways (admin)
    getAllGateways: builder.query<any, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/gateways',
        params,
      }),
      providesTags: ['PaymentGateways'],
    }),

    // Get active gateways
    getActiveGateways: builder.query<any, void>({
      query: () => '/gateways/active',
      providesTags: ['PaymentGateways'],
    }),

    // Get gateway by ID
    getGatewayById: builder.query<any, string>({
      query: (gatewayId) => `/gateways/${gatewayId}`,
      providesTags: ['PaymentGateways'],
    }),

    // Get gateways by type
    getGatewaysByType: builder.query<any, string>({
      query: (type) => `/gateways/type/${type}`,
      providesTags: ['PaymentGateways'],
    }),

    // Create gateway (admin)
    createGateway: builder.mutation<any, CreateGatewayRequest>({
      query: (body) => ({
        url: '/gateways',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PaymentGateways'],
    }),

    // Update gateway (admin)
    updateGateway: builder.mutation<any, { gatewayId: string; data: UpdateGatewayRequest }>({
      query: ({ gatewayId, data }) => ({
        url: `/gateways/${gatewayId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PaymentGateways'],
    }),

    // Delete gateway (admin)
    deleteGateway: builder.mutation<any, string>({
      query: (gatewayId) => ({
        url: `/gateways/${gatewayId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentGateways'],
    }),

    // Toggle gateway status (admin)
    toggleGatewayStatus: builder.mutation<any, string>({
      query: (gatewayId) => ({
        url: `/gateways/${gatewayId}/toggle`,
        method: 'POST',
      }),
      invalidatesTags: ['PaymentGateways'],
    }),
  }),
});

export const {
  useGetAllGatewaysQuery,
  useGetActiveGatewaysQuery,
  useGetGatewayByIdQuery,
  useGetGatewaysByTypeQuery,
  useCreateGatewayMutation,
  useUpdateGatewayMutation,
  useDeleteGatewayMutation,
  useToggleGatewayStatusMutation,
} = paymentGatewayApi;
