import axios, { InternalAxiosRequestConfig } from 'axios';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к каждому запросу
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Если сервер вернул 401, значит токен неверный или просрочен
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API для работы с пользователями и аутентификацией
export const authApi = {
  login: (email: string, password: string) => {
    return apiClient.post('/authenticate', { email, password });
  },
  register: (userData: any) => {
    return apiClient.post('/clients/register', userData);
  },
  resetPassword: (email: string) => {
    return apiClient.post('/password_resets', { email });
  },
  getCurrentUser: () => {
    return apiClient.get('/users/me');
  },
};

// API для работы с партнерами
export const partnersApi = {
  getAll: (params?: any) => {
    return apiClient.get('/partners', { params });
  },
  getById: (id: number) => {
    return apiClient.get(`/partners/${id}`);
  },
  create: (data: any) => {
    return apiClient.post('/partners', data);
  },
  update: (id: number, data: any) => {
    return apiClient.put(`/partners/${id}`, data);
  },
  delete: (id: number) => {
    return apiClient.delete(`/partners/${id}`);
  },
};

// API для работы с сервисными точками
export const servicePointsApi = {
  getAll: (params?: any) => {
    return apiClient.get('/service_points', { params });
  },
  getById: (id: number) => {
    return apiClient.get(`/service_points/${id}`);
  },
  create: (partnerId: number, data: any) => {
    return apiClient.post(`/partners/${partnerId}/service_points`, data);
  },
  update: (partnerId: number, id: number, data: any) => {
    return apiClient.put(`/partners/${partnerId}/service_points/${id}`, data);
  },
  delete: (partnerId: number, id: number) => {
    return apiClient.delete(`/partners/${partnerId}/service_points/${id}`);
  },
  findNearby: (latitude: number, longitude: number, distance: number) => {
    return apiClient.get('/service_points/nearby', {
      params: { latitude, longitude, distance },
    });
  },
  getPhotos: (id: number) => {
    return apiClient.get(`/service_points/${id}/photos`);
  },
  uploadPhoto: (id: number, photoData: FormData) => {
    return apiClient.post(`/service_points/${id}/photos`, photoData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePhoto: (servicePointId: number, photoId: number) => {
    return apiClient.delete(`/service_points/${servicePointId}/photos/${photoId}`);
  },
};

// API для работы с клиентами
export const clientsApi = {
  getAll: (params?: any) => {
    return apiClient.get('/clients', { params });
  },
  getById: (id: number) => {
    return apiClient.get(`/clients/${id}`);
  },
  update: (id: number, data: any) => {
    return apiClient.put(`/clients/${id}`, data);
  },
  delete: (id: number) => {
    return apiClient.delete(`/clients/${id}`);
  },
  getCars: (clientId: number) => {
    return apiClient.get(`/clients/${clientId}/cars`);
  },
  getCarById: (clientId: number, carId: number) => {
    return apiClient.get(`/clients/${clientId}/cars/${carId}`);
  },
  addCar: (clientId: number, carData: any) => {
    return apiClient.post(`/clients/${clientId}/cars`, carData);
  },
  updateCar: (clientId: number, carId: number, carData: any) => {
    return apiClient.put(`/clients/${clientId}/cars/${carId}`, carData);
  },
  deleteCar: (clientId: number, carId: number) => {
    return apiClient.delete(`/clients/${clientId}/cars/${carId}`);
  },
};

// API для работы с бронированиями
export const bookingsApi = {
  getClientBookings: (clientId: number, params?: any) => {
    return apiClient.get(`/clients/${clientId}/bookings`, { params });
  },
  getServicePointBookings: (servicePointId: number, params?: any) => {
    return apiClient.get(`/service_points/${servicePointId}/bookings`, { params });
  },
  getById: (clientId: number, bookingId: number) => {
    return apiClient.get(`/clients/${clientId}/bookings/${bookingId}`);
  },
  create: (clientId: number, bookingData: any) => {
    return apiClient.post(`/clients/${clientId}/bookings`, bookingData);
  },
  update: (clientId: number, bookingId: number, bookingData: any) => {
    return apiClient.put(`/clients/${clientId}/bookings/${bookingId}`, bookingData);
  },
  cancel: (bookingId: number) => {
    return apiClient.post(`/bookings/${bookingId}/cancel`);
  },
  confirm: (bookingId: number) => {
    return apiClient.post(`/bookings/${bookingId}/confirm`);
  },
  complete: (bookingId: number) => {
    return apiClient.post(`/bookings/${bookingId}/complete`);
  },
  noShow: (bookingId: number) => {
    return apiClient.post(`/bookings/${bookingId}/no_show`);
  },
};

// API для работы со справочниками
export const referencesApi = {
  getRegions: () => {
    return apiClient.get('/regions');
  },
  getCities: (params?: any) => {
    return apiClient.get('/cities', { params });
  },
  getCarBrands: () => {
    return apiClient.get('/car_brands');
  },
  getCarModels: (params?: any) => {
    return apiClient.get('/car_models', { params });
  },
  getTireTypes: () => {
    return apiClient.get('/tire_types');
  },
  getServiceCategories: () => {
    return apiClient.get('/service_categories');
  },
  getServices: (params?: any) => {
    return apiClient.get('/services', { params });
  },
  getBookingStatuses: () => {
    return apiClient.get('/booking_statuses');
  },
  getPaymentStatuses: () => {
    return apiClient.get('/payment_statuses');
  },
  getCancellationReasons: () => {
    return apiClient.get('/cancellation_reasons');
  },
  getAmenities: () => {
    return apiClient.get('/amenities');
  },
  getCarTypes: () => {
    return apiClient.get('/car_types');
  },
};

export default apiClient; 