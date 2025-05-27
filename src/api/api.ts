import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';

// Константа для ключа хранилища
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
      (response.config.url?.includes('/auth/login') || response.config.url?.includes('/api/v1/auth/login'))
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
    const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/api/v1/auth/login');

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

        // Исправляем структуру данных для refresh запроса
        const response = await apiClient.post('/api/v1/auth/login', {
          auth: {
            email,
            password
          }
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

// Экспортируем API клиент
export { apiClient };
export default apiClient;