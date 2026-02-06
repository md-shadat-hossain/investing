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
      providesTags: ['Auth', 'User'],
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
      invalidatesTags: ['Auth', 'User'],
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
      invalidatesTags: ['Auth', 'User'],
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
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
} = userApi;
