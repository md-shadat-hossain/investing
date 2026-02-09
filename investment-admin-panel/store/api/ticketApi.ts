import { baseApi } from './baseApi';

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tickets (admin)
    getAllTickets: builder.query<any, {
      page?: number;
      limit?: number;
      status?: string;
      priority?: string;
      category?: string;
    }>({
      query: (params) => ({
        url: '/tickets/admin/all',
        params,
      }),
      providesTags: ['Tickets'],
    }),

    // Get ticket stats (admin)
    getTicketStats: builder.query<any, void>({
      query: () => '/tickets/admin/stats',
      providesTags: ['Tickets'],
    }),

    // Get ticket by ID
    getTicketById: builder.query<any, string>({
      query: (ticketId) => `/tickets/${ticketId}`,
      providesTags: ['Tickets'],
    }),

    // Update ticket status (admin)
    updateTicketStatus: builder.mutation<any, { ticketId: string; status: string }>({
      query: ({ ticketId, status }) => ({
        url: `/tickets/admin/${ticketId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Tickets'],
    }),

    // Assign ticket to admin
    assignTicket: builder.mutation<any, { ticketId: string; adminId: string }>({
      query: ({ ticketId, adminId }) => ({
        url: `/tickets/admin/${ticketId}/assign`,
        method: 'POST',
        body: { adminId },
      }),
      invalidatesTags: ['Tickets'],
    }),

    // Add reply to ticket
    addReply: builder.mutation<any, { ticketId: string; message: string }>({
      query: ({ ticketId, message }) => ({
        url: `/tickets/${ticketId}/reply`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['Tickets'],
    }),
  }),
});

export const {
  useGetAllTicketsQuery,
  useGetTicketStatsQuery,
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useAddReplyMutation,
} = ticketApi;
