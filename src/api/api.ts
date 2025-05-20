import axios, { InternalAxiosRequestConfig } from 'axios';

// Константа для ключа хранилища
const STORAGE_KEY = 'tvoya_shina_token';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 seconds timeout - reduced from 15s
  withCredentials: false // Важно для работы CORS
});

// Функция для проверки доступности API
const checkApiAvailability = async (url: string): Promise<boolean> => {
  try {
    const result = await fetch(`${url}/api/v1/health`, { 
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      referrerPolicy: 'no-referrer',
    });
    return true;
  } catch (error) {
    console.log(`API endpoint ${url} not available`);
    return false;
  }
};

// Проверка доступности API и установка правильного URL
(async () => {
  const possibleUrls = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://192.168.9.109:8000'
  ];
  
  for (const url of possibleUrls) {
    if (await checkApiAvailability(url)) {
      console.log(`Using API endpoint: ${url}`);
      apiClient.defaults.baseURL = url;
      break;
    }
  }
})();

// Интерцептор для добавления токена к каждому запросу
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEY);
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - Token:', token ? 'Present (not showing full token)' : 'Not found');
    console.log('Request interceptor - Headers:', config.headers);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor - Added Authorization header');
    } else {
      console.log('Request interceptor - No token available or headers missing');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor - Error:', error);
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Response interceptor - Error:', error);
    if (error.response && error.response.status === 401) {
      // Если сервер вернул 401, значит токен неверный или просрочен
      console.log('Response interceptor - Unauthorized (401), clearing token');
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API для работы с пользователями и аутентификацией
export const authApi = {
  login: (email: string, password: string) => {
    console.log('authApi.login - Sending login request with:', { email, password: '***' });
    // Отправляем параметры напрямую в корень, без вложенности
    return apiClient.post('/api/v1/auth/login', { email, password });
  },
  register: (userData: any) => {
    return apiClient.post('/api/v1/clients/register', userData);
  },
  resetPassword: (email: string) => {
    return apiClient.post('/api/v1/password_resets', { email });
  },
  getCurrentUser: () => {
    return apiClient.get('/api/v1/users/me');
  },
};

// API для работы с партнерами
export const partnersApi = {
  getAll: (params?: any) => {
    return apiClient.get('/api/v1/partners', { params });
  },
  getById: (id: number) => {
    return apiClient.get(`/api/v1/partners/${id}`);
  },
  create: (data: any) => {
    return apiClient.post('/api/v1/partners', data);
  },
  update: (id: number, data: any) => {
    return apiClient.put(`/api/v1/partners/${id}`, data);
  },
  delete: (id: number) => {
    return apiClient.delete(`/api/v1/partners/${id}`);
  },
};

// API для работы с сервисными точками
export const servicePointsApi = {
  getAll: (params?: any) => {
    return apiClient.get('/api/v1/service_points', { params });
  },
  getById: (id: number) => {
    return apiClient.get(`/api/v1/service_points/${id}`);
  },
  create: (partnerId: number, data: any) => {
    return apiClient.post(`/api/v1/partners/${partnerId}/service_points`, data);
  },
  update: (partnerId: number, id: number, data: any) => {
    return apiClient.put(`/api/v1/partners/${partnerId}/service_points/${id}`, data);
  },
  delete: (partnerId: number, id: number) => {
    return apiClient.delete(`/api/v1/partners/${partnerId}/service_points/${id}`);
  },
  findNearby: (latitude: number, longitude: number, distance: number) => {
    return apiClient.get('/api/v1/service_points/nearby', {
      params: { latitude, longitude, distance },
    });
  },
  getPhotos: (id: number) => {
    return apiClient.get(`/api/v1/service_points/${id}/photos`);
  },
  uploadPhoto: (id: number, photoData: FormData) => {
    return apiClient.post(`/api/v1/service_points/${id}/photos`, photoData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePhoto: (servicePointId: number, photoId: number) => {
    return apiClient.delete(`/api/v1/service_points/${servicePointId}/photos/${photoId}`);
  },
};

// API для работы с клиентами
export const clientsApi = {
  getAll: (params?: any) => {
    return apiClient.get('/api/v1/clients', { params });
  },
  getById: (id: number) => {
    return apiClient.get(`/api/v1/clients/${id}`);
  },
  update: (id: number, data: any) => {
    return apiClient.put(`/api/v1/clients/${id}`, data);
  },
  delete: (id: number) => {
    return apiClient.delete(`/api/v1/clients/${id}`);
  },
  getCars: (clientId: number) => {
    return apiClient.get(`/api/v1/clients/${clientId}/cars`);
  },
  getCarById: (clientId: number, carId: number) => {
    return apiClient.get(`/api/v1/clients/${clientId}/cars/${carId}`);
  },
  addCar: (clientId: number, carData: any) => {
    return apiClient.post(`/api/v1/clients/${clientId}/cars`, carData);
  },
  updateCar: (clientId: number, carId: number, carData: any) => {
    return apiClient.put(`/api/v1/clients/${clientId}/cars/${carId}`, carData);
  },
  deleteCar: (clientId: number, carId: number) => {
    return apiClient.delete(`/api/v1/clients/${clientId}/cars/${carId}`);
  },
};

// API для работы с бронированиями
export const bookingsApi = {
  getClientBookings: (clientId: number, params?: any) => {
    return apiClient.get(`/api/v1/clients/${clientId}/bookings`, { params });
  },
  getServicePointBookings: (servicePointId: number, params?: any) => {
    return apiClient.get(`/api/v1/service_points/${servicePointId}/bookings`, { params });
  },
  getById: (clientId: number, bookingId: number) => {
    return apiClient.get(`/api/v1/clients/${clientId}/bookings/${bookingId}`);
  },
  create: (clientId: number, bookingData: any) => {
    return apiClient.post(`/api/v1/clients/${clientId}/bookings`, bookingData);
  },
  update: (clientId: number, bookingId: number, bookingData: any) => {
    return apiClient.put(`/api/v1/clients/${clientId}/bookings/${bookingId}`, bookingData);
  },
  cancel: (bookingId: number) => {
    return apiClient.post(`/api/v1/bookings/${bookingId}/cancel`);
  },
  confirm: (bookingId: number) => {
    return apiClient.post(`/api/v1/bookings/${bookingId}/confirm`);
  },
  complete: (bookingId: number) => {
    return apiClient.post(`/api/v1/bookings/${bookingId}/complete`);
  },
  noShow: (bookingId: number) => {
    return apiClient.post(`/api/v1/bookings/${bookingId}/no_show`);
  },
};

// API для работы со справочниками
export const referencesApi = {
  getRegions: () => {
    return apiClient.get('/api/v1/regions');
  },
  getCities: (params?: any) => {
    return apiClient.get('/api/v1/cities', { params });
  },
  getCarBrands: () => {
    return apiClient.get('/api/v1/car_brands');
  },
  getCarModels: (params?: any) => {
    return apiClient.get('/api/v1/car_models', { params });
  },
  getTireTypes: () => {
    return apiClient.get('/api/v1/tire_types');
  },
  getServiceCategories: () => {
    return apiClient.get('/api/v1/service_categories');
  },
  getServices: (params?: any) => {
    return apiClient.get('/api/v1/services', { params });
  },
  getBookingStatuses: () => {
    return apiClient.get('/api/v1/booking_statuses');
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

// По умолчанию экспортируем apiClient
export default apiClient; 