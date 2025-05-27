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
      providesTags: (result: Booking[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
              'Booking',
            ]
          : ['Booking'],
    }),

    getBookingsByClient: builder.query<Booking[], string>({
      query: (clientId: string) => `bookings?client_id=${clientId}`,
      providesTags: (result: Booking[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
              'Booking',
            ]
          : ['Booking'],
    }),
    
    getBookingById: builder.query<Booking, string>({
      query: (id) => ({
        url: `bookings/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),
    
    createBooking: builder.mutation<Booking, BookingFormData>({
      query: (booking) => ({
        url: 'bookings',
        method: 'POST',
        body: booking,
      }),
      invalidatesTags: ['Booking'],
    }),
    
    updateBooking: builder.mutation<Booking, { id: string; booking: Partial<BookingFormData> }>({
      query: ({ id, booking }) => ({
        url: `bookings/${id}`,
        method: 'PUT',
        body: booking,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
    }),

    updateBookingStatus: builder.mutation<Booking, { id: string; status: BookingStatus }>({
      query: ({ id, status }: { id: string; status: BookingStatus }) => ({
        url: `bookings/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
    }),
    
    deleteBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
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