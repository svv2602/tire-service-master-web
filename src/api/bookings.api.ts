import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Booking, ApiResponse, BookingFilter } from '../types/models';
import { BookingFormData, BookingStatus } from '../types/booking';
import { transformPaginatedResponse } from './apiUtils';

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
      transformResponse: (response: any) => transformPaginatedResponse<Booking>(response),
      providesTags: [{ type: 'Booking', id: 'LIST' }],
    }),

    getBookingsByServicePoint: builder.query<ApiResponse<Booking>, string>({
      query: (servicePointId: string) => ({
        url: 'bookings',
        method: 'GET',
        params: { service_point_id: servicePointId }
      }),
      transformResponse: (response: any) => transformPaginatedResponse<Booking>(response),
      providesTags: [{ type: 'Booking', id: 'LIST' }],
    }),

    getBookingsByClient: builder.query<ApiResponse<Booking>, string>({
      query: (clientId: string) => ({
        url: 'bookings',
        method: 'GET',
        params: { client_id: clientId }
      }),
      transformResponse: (response: any) => transformPaginatedResponse<Booking>(response),
      providesTags: [{ type: 'Booking', id: 'LIST' }],
    }),
    
    getBookingById: builder.query<Booking, string>({
      query: (id) => ({
        url: `bookings/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const transformed = transformPaginatedResponse<Booking>(response);
        return transformed.data[0];
      },
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),
    
    createBooking: builder.mutation<Booking, any>({
      query: (booking) => ({
        url: 'bookings',
        method: 'POST',
        body: booking,
      }),
      transformResponse: (response: any) => {
        const transformed = transformPaginatedResponse<Booking>(response);
        return transformed.data[0];
      },
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),
    
    updateBooking: builder.mutation<Booking, { id: string; booking: Partial<BookingFormData> }>({
      query: ({ id, booking }) => ({
        url: `bookings/${id}`,
        method: 'PUT',
        body: booking,
      }),
      transformResponse: (response: any) => {
        const transformed = transformPaginatedResponse<Booking>(response);
        return transformed.data[0];
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id },
      ],
    }),

    updateBookingStatus: builder.mutation<Booking, { id: string; status_id: number }>({
      query: ({ id, status_id }) => ({
        url: `bookings/${id}/status`,
        method: 'PATCH',
        body: { status_id },
      }),
      transformResponse: (response: any) => {
        const transformed = transformPaginatedResponse<Booking>(response);
        return transformed.data[0];
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id },
      ],
    }),
    
    deleteBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id },
      ],
    }),
    
    cancelBooking: builder.mutation<Booking, string>({
      query: (id) => ({
        url: `bookings/${id}/cancel`,
        method: 'PATCH',
      }),
      transformResponse: (response: any) => {
        const transformed = transformPaginatedResponse<Booking>(response);
        return transformed.data[0];
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id },
      ],
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
  useCancelBookingMutation,
} = bookingsApi; 