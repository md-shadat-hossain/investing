import { baseApi } from './baseApi';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get admin's own notifications
    getMyNotifications: builder.query<any, {
      limit?: number;
      skip?: number;
      status?: string;
    }>({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notifications'],
    }),

    // Get unread count
    getUnreadCount: builder.query<any, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<any, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Mark all as read
    markAllAsRead: builder.mutation<any, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Delete notification
    deleteNotification: builder.mutation<any, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Delete all notifications
    deleteAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: '/notifications',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Admin: Send to specific user
    sendToUser: builder.mutation<any, {
      userId: string;
      title: string;
      content: string;
      type?: string;
      priority?: string;
    }>({
      query: (body) => ({
        url: '/notifications/admin/send',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Admin: Broadcast to all users
    broadcast: builder.mutation<any, {
      title: string;
      content: string;
      type?: string;
      priority?: string;
    }>({
      query: (body) => ({
        url: '/notifications/admin/broadcast',
        method: 'POST',
        body,
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
  useDeleteAllNotificationsMutation,
  useSendToUserMutation,
  useBroadcastMutation,
} = notificationApi;
