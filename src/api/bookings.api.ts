import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Booking, BookingFormData, BookingFilter, BookingStatus } from '../types/booking';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getBookings: build.query<Booking[], BookingFilter>({
      query: (filter: BookingFilter) => ({
        url: 'bookings',
        params: filter,
      }),
      providesTags: (result: Booking[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Bookings' as const, id })),
              'Bookings',
            ]
          : ['Bookings'],
    }),

    getBookingsByServicePoint: build.query<Booking[], string>({
      query: (servicePointId: string) => `bookings?servicePointId=${servicePointId}`,
      providesTags: (result: Booking[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Bookings' as const, id })),
              'Bookings',
            ]
          : ['Bookings'],
    }),

    getBookingsByClient: build.query<Booking[], string>({
      query: (clientId: string) => `bookings?clientId=${clientId}`,
      providesTags: (result: Booking[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Bookings' as const, id })),
              'Bookings',
            ]
          : ['Bookings'],
    }),
    
    getBookingById: build.query<Booking, string>({
      query: (id: string) => `bookings/${id}`,
      providesTags: (_result: Booking | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Bookings' as const, id }
      ],
    }),
    
    createBooking: build.mutation<Booking, BookingFormData>({
      query: (data: BookingFormData) => ({
        url: 'bookings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bookings'],
    }),
    
    updateBooking: build.mutation<Booking, { id: string; data: Partial<BookingFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<BookingFormData> }) => ({
        url: `bookings/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: Booking | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Bookings' as const, id },
        'Bookings',
      ],
    }),

    updateBookingStatus: build.mutation<Booking, { id: string; status: BookingStatus }>({
      query: ({ id, status }: { id: string; status: BookingStatus }) => ({
        url: `bookings/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result: Booking | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Bookings' as const, id },
        'Bookings',
      ],
    }),
    
    deleteBooking: build.mutation<void, string>({
      query: (id: string) => ({
        url: `bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookings'],
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