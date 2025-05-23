import apiClient from './api';

// Типы для бронирований
export interface Booking {
  id: number;
  client_id: number;
  service_point_id: number;
  car_id?: number;
  car_type_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status_id: number;
  payment_status_id?: number;
  cancellation_reason_id?: number;
  cancellation_comment?: string;
  total_price?: number;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingService {
  id: number;
  booking_id: number;
  service_id: number;
  price: number;
  quantity: number;
}

export interface BookingFilters {
  status_id?: number | number[];
  client_id?: number;
  service_point_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// API для работы с бронированиями
export const bookingsApi = {
  getAll: async (params?: BookingFilters): Promise<any> => {
    console.log('Получение списка бронирований');
    return apiClient.get('/api/v1/bookings', { params });
  },

  getClientBookings: async (clientId: number, params?: BookingFilters): Promise<any> => {
    console.log(`Получение бронирований клиента ${clientId}`);
    return apiClient.get(`/api/v1/clients/${clientId}/bookings`, { params });
  },

  getServicePointBookings: async (servicePointId: number, params?: BookingFilters): Promise<any> => {
    console.log(`Получение бронирований сервисной точки ${servicePointId}`);
    return apiClient.get(`/api/v1/service_points/${servicePointId}/bookings`, { params });
  },

  getById: async (clientId: number, bookingId: number): Promise<any> => {
    console.log(`Получение бронирования ${bookingId}`);
    return apiClient.get(`/api/v1/clients/${clientId}/bookings/${bookingId}`);
  },

  create: async (clientId: number, data: { booking: Partial<Booking>, services: Partial<BookingService>[] }): Promise<any> => {
    console.log('Создание нового бронирования');
    return apiClient.post(`/api/v1/clients/${clientId}/bookings`, data);
  },

  update: async (clientId: number, bookingId: number, data: { booking: Partial<Booking>, services?: Partial<BookingService>[] }): Promise<any> => {
    console.log(`Обновление бронирования ${bookingId}`);
    return apiClient.put(`/api/v1/clients/${clientId}/bookings/${bookingId}`, data);
  },

  updateStatus: async (bookingId: number, statusId: number, comment?: string): Promise<any> => {
    console.log(`Обновление статуса бронирования ${bookingId}`);
    return apiClient.put(`/api/v1/bookings/${bookingId}/status`, { status_id: statusId, comment });
  },

  cancel: async (bookingId: number, data?: { cancellation_reason_id?: number, comment?: string }): Promise<any> => {
    console.log(`Отмена бронирования ${bookingId}`);
    return apiClient.post(`/api/v1/bookings/${bookingId}/cancel`, data);
  },

  confirm: async (bookingId: number): Promise<any> => {
    console.log(`Подтверждение бронирования ${bookingId}`);
    return apiClient.post(`/api/v1/bookings/${bookingId}/confirm`);
  },

  complete: async (bookingId: number): Promise<any> => {
    console.log(`Завершение бронирования ${bookingId}`);
    return apiClient.post(`/api/v1/bookings/${bookingId}/complete`);
  },

  noShow: async (bookingId: number): Promise<any> => {
    console.log(`Отметка неявки для бронирования ${bookingId}`);
    return apiClient.post(`/api/v1/bookings/${bookingId}/no_show`);
  },

  getAvailableSlots: async (servicePointId: number, date: string): Promise<any> => {
    console.log(`Получение доступных слотов для точки ${servicePointId} на ${date}`);
    return apiClient.get(`/api/v1/service_points/${servicePointId}/available_slots`, {
      params: { date }
    });
  }
};

export default bookingsApi; 