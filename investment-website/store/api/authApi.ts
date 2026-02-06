import { baseApi } from './baseApi';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface VerifyEmailRequest {
  email: string;
  code: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  password: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface DeleteAccountRequest {
  password: string;
}

interface LogoutRequest {
  refreshToken: string;
}

interface AuthResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        isEmailVerified: boolean;
        walletBalance?: number;
        referralCode?: string;
      };
      tokens: {
        access: {
          token: string;
          expires: string;
        };
        refresh: {
          token: string;
          expires: string;
        };
      };
    };
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register
    register: builder.mutation<any, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Verify Email
    verifyEmail: builder.mutation<AuthResponse, VerifyEmailRequest>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
      transformResponse: (response: AuthResponse) => {
        // Store tokens and user info after successful verification
        if (response.code === 200 && response.data) {
          const { tokens, user } = response.data.attributes;
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', tokens.access.token);
            localStorage.setItem('refreshToken', tokens.refresh.token);
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: AuthResponse) => {
        // Store tokens and user info
        if (response.code === 200 && response.data) {
          const { tokens, user } = response.data.attributes;
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', tokens.access.token);
            localStorage.setItem('refreshToken', tokens.refresh.token);
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // Logout
    logout: builder.mutation<any, LogoutRequest>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        // Clear tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // Forgot Password
    forgotPassword: builder.mutation<any, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation<any, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    // Change Password
    changePassword: builder.mutation<any, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    // Delete Account
    deleteAccount: builder.mutation<any, DeleteAccountRequest>({
      query: (body) => ({
        url: '/auth/delete-me',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        // Clear tokens after account deletion
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // Get Current User Profile
    getProfile: builder.query<any, void>({
      query: () => '/users/me',
      providesTags: ['Auth', 'User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetProfileQuery,
} = authApi;
