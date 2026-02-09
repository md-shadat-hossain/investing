import { baseApi } from './baseApi';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  image?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface UnreadCount {
  count: number;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    attributes: T;
  };
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get My Notifications
    getMyNotifications: builder.query<ApiResponse<Notification[]>, void>({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),

    // Get Unread Count
    getUnreadCount: builder.query<ApiResponse<UnreadCount>, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),

    // Mark As Read
    markAsRead: builder.mutation<ApiResponse<Notification>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Mark All As Read
    markAllAsRead: builder.mutation<ApiResponse<{ count: number }>, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Delete Notification
    deleteNotification: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Delete All Notifications
    deleteAll: builder.mutation<ApiResponse<{ count: number }>, void>({
      query: () => ({
        url: '/notifications',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllMutation,
} = notificationApi;
