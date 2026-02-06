import { baseApi } from './baseApi';

interface LoginRequest {
  email: string;
  password: string;
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

interface LogoutRequest {
  refreshToken: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
          localStorage.setItem('accessToken', tokens.access.token);
          localStorage.setItem('refreshToken', tokens.refresh.token);
          localStorage.setItem('user', JSON.stringify(user));
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // Change Password
    changePassword: builder.mutation<any, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    // Get Current User Profile
    getProfile: builder.query<any, void>({
      query: () => '/users/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
} = authApi;
