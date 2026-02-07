import { baseApi } from './baseApi';

interface CreateTicketRequest {
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  message: string;
}

interface AddReplyRequest {
  message: string;
}

interface RateTicketRequest {
  rating: number;
  feedback?: string;
}

interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isAdminReply: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  createdAt: string;
}

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  rating?: number;
  feedback?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  replies?: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    attributes: T;
  };
}

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Ticket
    createTicket: builder.mutation<ApiResponse<Ticket>, CreateTicketRequest>({
      query: (body) => ({
        url: '/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tickets'],
    }),

    // Get My Tickets
    getMyTickets: builder.query<ApiResponse<Ticket[]>, void>({
      query: () => '/tickets/my',
      providesTags: ['Tickets'],
    }),

    // Get Ticket By ID
    getTicketById: builder.query<ApiResponse<Ticket>, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tickets', id }],
    }),

    // Add Reply
    addReply: builder.mutation<ApiResponse<TicketReply>, { id: string; body: AddReplyRequest }>({
      query: ({ id, body }) => ({
        url: `/tickets/${id}/reply`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tickets', id }, 'Tickets'],
    }),

    // Rate Ticket
    rateTicket: builder.mutation<ApiResponse<Ticket>, { id: string; body: RateTicketRequest }>({
      query: ({ id, body }) => ({
        url: `/tickets/${id}/rate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tickets', id }, 'Tickets'],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useAddReplyMutation,
  useRateTicketMutation,
} = ticketApi;
