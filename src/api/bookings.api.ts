import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Booking, ApiResponse, BookingFilter } from '../types/models';
import { BookingFormData, BookingStatus } from '../types/booking';

export interface BookingsQueryParams {
  query?: string;
  status?: BookingStatus;
  service_point_id?: number;
  page?: number;
  per_page?: number;
}

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<ApiResponse<Booking>, BookingFilter>({
      query: (params) => ({
        url: 'bookings',
        method: 'GET',
        params,
      }),
      providesTags: ['Booking'],
    }),

    getBookingsByServicePoint: builder.query<Booking[], string>({
      query: (servicePointId: string) => `bookings?service_point_id=${servicePointId}`,
      providesTags: (result: Booking[] | undefined) => {
        if (result && Array.isArray(result)) {
          return [
            ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
            { type: 'Booking' as const, id: 'LIST' },
          ];
        }
        return [{ type: 'Booking' as const, id: 'LIST' }];
      },
    }),

    getBookingsByClient: builder.query<Booking[], string>({
      query: (clientId: string) => `bookings?client_id=${clientId}`,
      providesTags: (result: Booking[] | undefined) => {
        if (result && Array.isArray(result)) {
          return [
            ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
            { type: 'Booking' as const, id: 'LIST' },
          ];
        }
        return [{ type: 'Booking' as const, id: 'LIST' }];
      },
    }),
    
    getBookingById: builder.query<Booking, string>({
      query: (id) => ({
        url: `bookings/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Booking' as const, id }],
    }),
    
    createBooking: builder.mutation<Booking, BookingFormData>({
      query: (booking) => ({
        url: 'bookings',
        method: 'POST',
        body: booking,
      }),
      invalidatesTags: [{ type: 'Booking' as const, id: 'LIST' }],
    }),
    
    updateBooking: builder.mutation<Booking, { id: string; booking: Partial<BookingFormData> }>({
      query: ({ id, booking }) => ({
        url: `bookings/${id}`,
        method: 'PUT',
        body: booking,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking' as const, id: 'LIST' },
        { type: 'Booking' as const, id },
      ],
    }),

    updateBookingStatus: builder.mutation<Booking, { id: string; status: BookingStatus }>({
      query: ({ id, status }: { id: string; status: BookingStatus }) => ({
        url: `bookings/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking' as const, id: 'LIST' },
        { type: 'Booking' as const, id },
      ],
    }),
    
    deleteBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Booking' as const, id: 'LIST' }],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetBookingsQuery,
  useGetBookingsByServicePointQuery,
  useGetBookingsByClientQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
} = bookingsApi; 