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
  // Получение списка всех бронирований с фильтрацией и пагинацией
  getAll: (filters?: BookingFilters) => {
    return apiClient.get('/api/v1/bookings', { params: filters });
  },

  // Получение бронирования по ID
  getById: (id: number) => {
    return apiClient.get(`/api/v1/bookings/${id}`);
  },

  // Создание нового бронирования
  create: (bookingData: Partial<Booking>, services: Partial<BookingService>[]) => {
    return apiClient.post('/api/v1/bookings', { booking: bookingData, services });
  },

  // Обновление существующего бронирования
  update: (id: number, bookingData: Partial<Booking>, services?: Partial<BookingService>[]) => {
    return apiClient.put(`/api/v1/bookings/${id}`, { booking: bookingData, services });
  },

  // Удаление бронирования
  delete: (id: number) => {
    return apiClient.delete(`/api/v1/bookings/${id}`);
  },

  // Изменение статуса бронирования
  updateStatus: (id: number, statusId: number, comment?: string) => {
    return apiClient.put(`/api/v1/bookings/${id}/status`, { status_id: statusId, comment });
  },

  // Отмена бронирования
  cancel: (id: number, cancellationReasonId: number, comment?: string) => {
    return apiClient.post(`/api/v1/bookings/${id}/cancel`, {
      cancellation_reason_id: cancellationReasonId,
      comment
    });
  },

  // Подтверждение бронирования
  confirm: (id: number) => {
    return apiClient.post(`/api/v1/bookings/${id}/confirm`);
  },

  // Завершение бронирования
  complete: (id: number) => {
    return apiClient.post(`/api/v1/bookings/${id}/complete`);
  },

  // Отметка о неявке клиента
  noShow: (id: number) => {
    return apiClient.post(`/api/v1/bookings/${id}/no_show`);
  },

  // Получение доступных слотов для бронирования
  getAvailableSlots: (servicePointId: number, date: string) => {
    return apiClient.get(`/api/v1/service_points/${servicePointId}/available_slots`, {
      params: { date }
    });
  },

  // Получение бронирований клиента
  getClientBookings: (clientId: number, filters?: BookingFilters) => {
    return apiClient.get(`/api/v1/clients/${clientId}/bookings`, { params: filters });
  },

  // Получение бронирований сервисной точки
  getServicePointBookings: (servicePointId: number, filters?: BookingFilters) => {
    return apiClient.get(`/api/v1/service_points/${servicePointId}/bookings`, { params: filters });
  }
};

export default bookingsApi; 