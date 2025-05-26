import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { Booking, BookingStatus, PaymentStatus } from '../types/models';

// Интерфейс для ответа API с пагинацией
interface BookingsResponse {
  data: Booking[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

// Параметры запроса бронирований
interface BookingsQueryParams {
  client_id?: number;
  service_point_id?: number;
  partner_id?: number;
  status_id?: number;
  payment_status_id?: number;
  date_from?: string;
  date_to?: string;
  query?: string;
  page?: number;
  per_page?: number;
}

// Данные формы бронирования
export interface BookingFormData {
  client_id: number;
  service_point_id: number;
  car_id?: number;
  car_type_id: number;
  slot_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  services: Array<{
    service_id: number;
    quantity: number;
    price: number;
  }>;
  notes?: string;
}

// Данные для обновления бронирования
export interface BookingUpdateData {
  status_id?: number;
  payment_status_id?: number;
  cancellation_reason_id?: number;
  cancellation_comment?: string;
  notes?: string;
  total_price?: number;
  payment_method?: string;
}

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery,
  tagTypes: ['Bookings', 'BookingStatuses', 'PaymentStatuses'],
  endpoints: (builder) => ({
    getBookings: builder.query<BookingsResponse, BookingsQueryParams | void>({
      query: (params) => {
        const queryParams = params || {};
        return {
          url: 'bookings',
          params: {
            client_id: queryParams.client_id,
            service_point_id: queryParams.service_point_id,
            partner_id: queryParams.partner_id,
            status_id: queryParams.status_id,
            payment_status_id: queryParams.payment_status_id,
            date_from: queryParams.date_from,
            date_to: queryParams.date_to,
            query: queryParams.query,
            page: queryParams.page || 1,
            per_page: queryParams.per_page || 25,
          },
        };
      },
      providesTags: ['Bookings'],
    }),
    getBooking: builder.query<Booking, number>({
      query: (id) => `bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Bookings', id }],
    }),
    createBooking: builder.mutation<Booking, BookingFormData>({
      query: (data) => ({
        url: 'bookings',
        method: 'POST',
        body: { booking: data },
      }),
      invalidatesTags: ['Bookings'],
    }),
    updateBooking: builder.mutation<Booking, { id: number; data: BookingUpdateData }>({
      query: ({ id, data }) => ({
        url: `bookings/${id}`,
        method: 'PATCH',
        body: { booking: data },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Bookings', id }],
    }),
    cancelBooking: builder.mutation<Booking, { id: number; reason_id?: number; comment?: string }>({
      query: ({ id, reason_id, comment }) => ({
        url: `bookings/${id}/cancel`,
        method: 'PATCH',
        body: {
          cancellation_reason_id: reason_id,
          cancellation_comment: comment,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Bookings', id }],
    }),
    confirmBooking: builder.mutation<Booking, number>({
      query: (id) => ({
        url: `bookings/${id}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Bookings', id }],
    }),
    completeBooking: builder.mutation<Booking, number>({
      query: (id) => ({
        url: `bookings/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Bookings', id }],
    }),
    updatePaymentStatus: builder.mutation<Booking, { id: number; payment_status_id: number; payment_method?: string }>({
      query: ({ id, payment_status_id, payment_method }) => ({
        url: `bookings/${id}/payment`,
        method: 'PATCH',
        body: {
          payment_status_id,
          payment_method,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Bookings', id }],
    }),
    getBookingStatuses: builder.query<BookingStatus[], void>({
      query: () => 'booking_statuses',
      providesTags: ['BookingStatuses'],
    }),
    getPaymentStatuses: builder.query<PaymentStatus[], void>({
      query: () => 'payment_statuses',
      providesTags: ['PaymentStatuses'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useCompleteBookingMutation,
  useUpdatePaymentStatusMutation,
  useGetBookingStatusesQuery,
  useGetPaymentStatusesQuery,
} = bookingsApi; 