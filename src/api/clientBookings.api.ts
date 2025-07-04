import { baseApi } from './baseApi';

// Типы для клиентских бронирований
export interface ClientBookingRequest {
  client: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
  };
  car: {
    license_plate: string;
    car_brand?: string;
    car_model?: string;
    year?: number;
  };
  booking: {
    service_point_id: number;
    booking_date: string;
    start_time: string;
    notes?: string;
  };
  services?: Array<{
    service_id: number;
    quantity?: number;
    price?: number;
  }>;
}

export interface ClientBookingResponse {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: {
    id: number;
    name: string;
    display_name: string;
  };
  service_point: {
    id: number;
    name: string;
    address: string;
    phone: string;
  };
  client: {
    name: string;
    phone: string;
    email: string;
  };
  car_info: {
    license_plate: string;
    brand: string;
    model: string;
    type: string;
  };
  services: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityCheckRequest {
  service_point_id: number;
  date: string;
  time: string;
  duration_minutes?: number;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  service_point_id: number;
  date: string;
  time: string;
  duration_minutes: number;
  reason?: string;
  total_posts: number;
  occupied_posts: number;
  available_posts: number;
}

// API для клиентских бронирований
export const clientBookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Создание клиентского бронирования
    createClientBooking: builder.mutation<ClientBookingResponse, ClientBookingRequest>({
      query: (bookingData) => ({
        url: '/client_bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),

    // Проверка доступности времени для бронирования
    checkBookingAvailability: builder.mutation<AvailabilityCheckResponse, AvailabilityCheckRequest>({
      query: (params) => ({
        url: '/client_bookings/check_availability_for_booking',
        method: 'POST',
        body: params,
      }),
    }),

    // Получение информации о клиентском бронировании
    getClientBooking: builder.query<ClientBookingResponse, string>({
      query: (id) => ({
        url: `/client_bookings/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),

    // Обновление клиентского бронирования
    updateClientBooking: builder.mutation<ClientBookingResponse, { 
      id: string; 
      booking: {
        booking_date?: string;
        start_time?: string;
        notes?: string;
      };
    }>({
      query: ({ id, booking }) => ({
        url: `/client_bookings/${id}`,
        method: 'PUT',
        body: { booking },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id },
      ],
    }),

    // Отмена клиентского бронирования
    cancelClientBooking: builder.mutation<ClientBookingResponse, {
      id: string;
      cancellation_reason_id?: number;
      cancellation_comment?: string;
    }>({
      query: ({ id, ...params }) => ({
        url: `/client_bookings/${id}`,
        method: 'DELETE',
        body: params,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id },
      ],
    }),

    // Перенос клиентского бронирования
    rescheduleClientBooking: builder.mutation<ClientBookingResponse, {
      id: string;
      new_date: string;
      new_time: string;
    }>({
      query: ({ id, ...params }) => ({
        url: `/client_bookings/${id}/reschedule`,
        method: 'POST',
        body: params,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id },
      ],
    }),
  }),
});

// Экспортируем хуки
export const {
  useCreateClientBookingMutation,
  useCheckBookingAvailabilityMutation,
  useGetClientBookingQuery,
  useUpdateClientBookingMutation,
  useCancelClientBookingMutation,
  useRescheduleClientBookingMutation,
} = clientBookingsApi;
