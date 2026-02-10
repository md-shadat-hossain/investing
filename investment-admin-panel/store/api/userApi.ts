import { baseApi } from './baseApi';

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
}

interface UploadProfileImageResponse {
  code: number;
  message: string;
  data: {
    profileImage: string;
  };
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user profile
    getMyProfile: builder.query<any, void>({
      query: () => '/users/self/in',
      providesTags: ['Auth'],
    }),

    // Get all users (admin)
    getAllUsers: builder.query<any, { page?: number; limit?: number; role?: string }>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['Users'],
    }),

    // Get user by ID (admin)
    getUserById: builder.query<any, string>({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: ['Users'],
    }),

    // Block/Unblock user (admin)
    toggleBlockUser: builder.mutation<any, { userId: string; reason?: string }>({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}/block`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Users'],
    }),

    // Update KYC status (admin)
    updateKycStatus: builder.mutation<any, { userId: string; status: string }>({
      query: ({ userId, status }) => ({
        url: `/admin/users/${userId}/kyc`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['Users'],
    }),

    // Add balance (admin)
    addBalance: builder.mutation<any, { userId: string; amount: number; reason?: string }>({
      query: ({ userId, amount, reason }) => ({
        url: `/admin/users/${userId}/add-balance`,
        method: 'POST',
        body: { amount, reason },
      }),
      invalidatesTags: ['Users', 'Wallet'],
    }),

    // Deduct balance (admin)
    deductBalance: builder.mutation<any, { userId: string; amount: number; reason?: string }>({
      query: ({ userId, amount, reason }) => ({
        url: `/admin/users/${userId}/deduct-balance`,
        method: 'POST',
        body: { amount, reason },
      }),
      invalidatesTags: ['Users', 'Wallet'],
    }),

    // Delete user (admin)
    deleteUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Admin update user profile
    adminUpdateUser: builder.mutation<any, { userId: string; firstName?: string; lastName?: string; email?: string; phoneNumber?: string; callingCode?: string; address?: string }>({
      query: ({ userId, ...body }) => ({
        url: `/admin/users/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Users'],
    }),

    // Admin reset user password
    adminResetPassword: builder.mutation<any, { userId: string; newPassword: string }>({
      query: ({ userId, newPassword }) => ({
        url: `/admin/users/${userId}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
    }),

    // Update profile (with optional image)
    updateProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/users/self/update',
        method: 'PATCH',
        body: formData,
        // Don't set Content-Type header for FormData
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Upload profile image (standalone)
    uploadProfileImage: builder.mutation<UploadProfileImageResponse, FormData>({
      query: (formData) => ({
        url: '/users/self/update',
        method: 'PATCH',
        body: formData,
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Delete profile image (by sending update without image)
    deleteProfileImage: builder.mutation<any, void>({
      query: () => {
        const formData = new FormData();
        formData.append('removeImage', 'true');
        return {
          url: '/users/self/update',
          method: 'PATCH',
          body: formData,
          prepareHeaders: (headers: Headers) => {
            headers.delete('Content-Type');
            return headers;
          },
        };
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useToggleBlockUserMutation,
  useUpdateKycStatusMutation,
  useAddBalanceMutation,
  useDeductBalanceMutation,
  useDeleteUserMutation,
  useAdminUpdateUserMutation,
  useAdminResetPasswordMutation,
} = userApi;
