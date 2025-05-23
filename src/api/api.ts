import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { User, UserCredentials } from '../types';

// Константа для ключа хранилища
import config from '../config';

const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;

// Flag for ongoing refresh
let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 1;

// Store for queued requests
let refreshQueue: ((token: string | null, error?: any) => void)[] = [];

// Process queued requests
const processQueue = (token: string | null, error?: any) => {
  refreshQueue.forEach((callback) => {
    callback(token, error);
  });
  refreshQueue = [];
};

// Request interceptor
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEY);

  if (token && config.headers) {
    // Remove any existing auth header to avoid duplicates
    delete config.headers.Authorization;
    delete config.headers.authorization;

    // Add token with correct Bearer format
    const formattedToken = token.replace(/^Bearer\s+/i, '').trim();
    config.headers.Authorization = `Bearer ${formattedToken}`;
    
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - Auth header:', config.headers.Authorization);
  }

  return config;
};

// Response interceptor
const responseInterceptor = (response: AxiosResponse) => {
  if (response.config.url !== '/api/v1/health') {
    console.log('Response interceptor - Successful request:', response.config.url);

    // Update token if provided in auth response
    if (
      (response.config.url?.includes('/authenticate') || response.config.url?.includes('/auth/login'))
      && response.data.auth_token
    ) {
      const token = response.data.auth_token;
      localStorage.setItem(STORAGE_KEY, token);
      console.log('Response interceptor - New token saved');
    }
  }
  return response;
};

// Error interceptor
const responseErrorInterceptor = async (error: any) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    const isAuthRequest = originalRequest.url?.includes('/authenticate') || originalRequest.url?.includes('/auth/login');

    if (!isAuthRequest && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
      if (isRefreshing) {
        // Wait for the ongoing refresh
        try {
          const token = await new Promise<string>((resolve, reject) => {
            refreshQueue.push((newToken, error) => {
              if (error) reject(error);
              else if (newToken) resolve(newToken);
              else reject(new Error('Failed to refresh token'));
            });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      // Start refresh
      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      try {
        const email = localStorage.getItem('userEmail');
        const password = localStorage.getItem('userPassword');

        if (!email || !password) {
          throw new Error('No stored credentials');
        }

        const response = await apiClient.post('/api/v1/authenticate', {
          email,
          password
        });

        const newToken = response.data.auth_token;
        if (!newToken) {
          throw new Error('No token in refresh response');
        }

        // Update stored token
        localStorage.setItem(STORAGE_KEY, newToken);

        // Update axios default headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(newToken);

        console.log('Token refresh successful');
        isRefreshing = false;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear auth data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        delete apiClient.defaults.headers.common['Authorization'];

        // Process queue with error
        processQueue(null, refreshError);
        isRefreshing = false;
        refreshAttempts = 0;

        // Redirect to login if not already there
        const currentPath = window.location.pathname + window.location.search;
        if (!currentPath.includes('/login')) {
          localStorage.setItem('returnPath', currentPath);
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }
  }

  return Promise.reject(error);
};

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: false
});

// Настройка интерцепторов
apiClient.interceptors.request.use(requestInterceptor);
apiClient.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// Функция для проверки доступности API
const checkApiAvailability = async (url: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${url}/api/v1/health`, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000
    });
    console.log(`API доступен по адресу ${url}, статус: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`API недоступен по адресу ${url}`);
    return false;
  }
};

// Инициализируем API и проверяем его доступность
(async () => {
  const apiUrl = 'http://localhost:8000';

  try {
    const isAvailable = await checkApiAvailability(apiUrl);
    if (isAvailable) {
      console.log(`Используется API: ${apiUrl}`);
      apiClient.defaults.baseURL = apiUrl;
    } else {
      console.error(`API недоступен по адресу: ${apiUrl}`);
    }
  } catch (error) {
    console.error(`Ошибка при проверке API: ${error}`);
  }
})().catch(error => {
  console.error('Ошибка инициализации API:', error);
});

// API для работы с аутентификацией
export const authApi = {
  login: async (credentials: UserCredentials): Promise<AxiosResponse> => {
    console.log('Отправка запроса авторизации:', { email: credentials.email, password: '***' });
    return apiClient.post('/api/v1/authenticate', credentials);
  },
  register: async (userData: any): Promise<AxiosResponse> => {
    console.log('Отправка запроса на регистрацию пользователя');
    return apiClient.post('/api/v1/clients/register', userData);
  },
  resetPassword: async (email: string): Promise<AxiosResponse> => {
    console.log('Отправка запроса на сброс пароля');
    return apiClient.post('/api/v1/password_resets', { email });
  },
  getCurrentUser: async (): Promise<AxiosResponse> => {
    console.log('Получение данных текущего пользователя');
    return apiClient.get('/api/v1/users/me');
  }
};

// API для работы с пользователями
export const usersApi = {
  getAll: async (params?: any): Promise<AxiosResponse<User[]>> => {
    console.log('Получение списка пользователей');
    return apiClient.get('/api/v1/users', { params });
  },
  getById: async (id: number): Promise<AxiosResponse<User>> => {
    console.log(`Получение данных пользователя с ID: ${id}`);
    return apiClient.get(`/api/v1/users/${id}`);
  },
  create: async (data: Partial<User>): Promise<AxiosResponse<User>> => {
    console.log('Создание нового пользователя');
    return apiClient.post('/api/v1/users', data);
  },
  update: async (id: number, data: Partial<User>): Promise<AxiosResponse<User>> => {
    console.log(`Обновление данных пользователя ${id}`);
    return apiClient.put(`/api/v1/users/${id}`, data);
  },
  delete: async (id: number): Promise<AxiosResponse> => {
    console.log(`Удаление пользователя ${id}`);
    return apiClient.delete(`/api/v1/users/${id}`);
  },
  changeRole: async (id: number, role: string): Promise<AxiosResponse<User>> => {
    console.log(`Изменение роли пользователя ${id} на ${role}`);
    return apiClient.put(`/api/v1/users/${id}/change_role`, { role });
  },
  changeStatus: async (id: number, isActive: boolean): Promise<AxiosResponse<User>> => {
    console.log(`Изменение статуса пользователя ${id} на ${isActive ? 'активный' : 'неактивный'}`);
    return apiClient.put(`/api/v1/users/${id}/change_status`, { is_active: isActive });
  }
};

// Import and re-export APIs
export { bookingsApi } from './bookings';
export { carBrandsApi } from './carBrands';
export { carModelsApi } from './carModels';
export { citiesApi } from './cities';
export { regionsApi } from './regions';

// API для работы с партнерами
export const partnersApi = {
  getAll: async (params?: any): Promise<AxiosResponse> => {
    console.log('Получение списка партнеров');
    return apiClient.get('/api/v1/partners', { params });
  },
  getById: async (id: number): Promise<AxiosResponse> => {
    console.log(`Получение партнера ${id}`);
    return apiClient.get(`/api/v1/partners/${id}`);
  },
  create: async (data: any): Promise<AxiosResponse> => {
    console.log('Создание нового партнера');
    return apiClient.post('/api/v1/partners', data);
  },
  update: async (id: number, data: any): Promise<AxiosResponse> => {
    console.log(`Обновление партнера ${id}`);
    return apiClient.put(`/api/v1/partners/${id}`, data);
  },
  delete: async (id: number): Promise<AxiosResponse> => {
    console.log(`Удаление партнера ${id}`);
    return apiClient.delete(`/api/v1/partners/${id}`);
  },
  toggleActive: async (id: number, active?: boolean): Promise<AxiosResponse> => {
    console.log(`Изменение статуса активности партнера ${id}`);
    return apiClient.patch(`/api/v1/partners/${id}/toggle_active`, { active });
  }
};

// API для работы с сервисными точками
export const servicePointsApi = {
  getAll: async (params?: any): Promise<AxiosResponse> => {
    console.log('Получение списка сервисных точек');
    return apiClient.get('/api/v1/service_points', { params });
  },
  getById: async (id: number): Promise<AxiosResponse> => {
    console.log(`Получение сервисной точки ${id}`);
    return apiClient.get(`/api/v1/service_points/${id}`);
  },
  create: async (partnerId: number, data: any): Promise<AxiosResponse> => {
    console.log(`Создание новой сервисной точки для партнера ${partnerId}`);
    return apiClient.post(`/api/v1/partners/${partnerId}/service_points`, data);
  },
  update: async (partnerId: number, id: number, data: any): Promise<AxiosResponse> => {
    console.log(`Обновление сервисной точки ${id}`);
    return apiClient.put(`/api/v1/partners/${partnerId}/service_points/${id}`, data);
  },
  delete: async (partnerId: number, id: number): Promise<AxiosResponse> => {
    console.log(`Удаление сервисной точки ${id}`);
    return apiClient.delete(`/api/v1/partners/${partnerId}/service_points/${id}`);
  },
  findNearby: async (latitude: number, longitude: number, distance: number): Promise<AxiosResponse> => {
    console.log(`Поиск ближайших сервисных точек`);
    return apiClient.get('/api/v1/service_points/nearby', {
      params: { latitude, longitude, distance }
    });
  },
  getPhotos: async (id: number): Promise<AxiosResponse> => {
    console.log(`Получение фотографий сервисной точки ${id}`);
    return apiClient.get(`/api/v1/service_points/${id}/photos`);
  },
  uploadPhoto: async (id: number, photoData: FormData): Promise<AxiosResponse> => {
    console.log(`Загрузка фотографии для сервисной точки ${id}`);
    return apiClient.post(`/api/v1/service_points/${id}/photos`, photoData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deletePhoto: async (servicePointId: number, photoId: number): Promise<AxiosResponse> => {
    console.log(`Удаление фотографии ${photoId} сервисной точки ${servicePointId}`);
    return apiClient.delete(`/api/v1/service_points/${servicePointId}/photos/${photoId}`);
  }
};

// API для работы с клиентами
export const clientsApi = {
  getAll: async (params?: any): Promise<AxiosResponse> => {
    console.log('Получение списка клиентов');
    return apiClient.get('/api/v1/clients', { params });
  },
  getById: async (id: number): Promise<AxiosResponse> => {
    console.log(`Получение клиента ${id}`);
    return apiClient.get(`/api/v1/clients/${id}`);
  },
  create: async (data: any): Promise<AxiosResponse> => {
    console.log('Создание нового клиента');
    return apiClient.post('/api/v1/clients', data);
  },
  update: async (id: number, data: any): Promise<AxiosResponse> => {
    console.log(`Обновление клиента ${id}`);
    return apiClient.put(`/api/v1/clients/${id}`, data);
  },
  delete: async (id: number): Promise<AxiosResponse> => {
    console.log(`Удаление клиента ${id}`);
    return apiClient.delete(`/api/v1/clients/${id}`);
  }
};

// API для работы со справочниками
export const referencesApi = {
  getCarTypes: async (): Promise<AxiosResponse> => {
    console.log('Получение списка типов автомобилей');
    return apiClient.get('/api/v1/car_types');
  },
  getTireTypes: async (): Promise<AxiosResponse> => {
    console.log('Получение списка типов шин');
    return apiClient.get('/api/v1/tire_types');
  },
  getServiceCategories: async (): Promise<AxiosResponse> => {
    console.log('Получение категорий услуг');
    return apiClient.get('/api/v1/service_categories');
  },
  getServices: async (params?: any): Promise<AxiosResponse> => {
    console.log('Получение списка услуг');
    return apiClient.get('/api/v1/services', { params });
  },
  getServiceById: async (id: number): Promise<AxiosResponse> => {
    console.log(`Получение услуги с ID: ${id}`);
    return apiClient.get(`/api/v1/services/${id}`);
  },
  getBookingStatuses: async (): Promise<AxiosResponse> => {
    console.log('Получение статусов бронирования');
    return apiClient.get('/api/v1/booking_statuses');
  },
  getPaymentStatuses: async (): Promise<AxiosResponse> => {
    console.log('Получение статусов оплаты');
    return apiClient.get('/api/v1/payment_statuses');
  },
  getCancellationReasons: async (): Promise<AxiosResponse> => {
    console.log('Получение причин отмены');
    return apiClient.get('/api/v1/cancellation_reasons');
  },
  getAmenities: async (): Promise<AxiosResponse> => {
    console.log('Получение списка удобств');
    return apiClient.get('/api/v1/amenities');
  }
};

export default apiClient;