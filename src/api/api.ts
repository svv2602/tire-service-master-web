import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';
import { checkApiAvailability } from './baseQuery';
import { handleLogout, refreshTokens } from '../services/authService';

// Константы
const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;
const REFRESH_TOKEN_KEY = 'tvoya_shina_refresh_token';
const API_URL = `${config.API_URL}${config.API_PREFIX}`;

// Создаем экземпляр axios с базовыми настройками
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: false
});

// Request interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEY);

  if (token && config.headers) {
    // Remove any existing auth header to avoid duplicates
    delete config.headers.Authorization;
    delete config.headers.authorization;

    // Add token with correct Bearer format
    const formattedToken = token.replace(/^Bearer\s+/i, '').trim();
    config.headers.Authorization = `Bearer ${formattedToken}`;
    
    // Отладочное логирование
    console.log('🔐 Отправка запроса с токеном:', {
      url: config.url,
      token: formattedToken.substring(0, 10) + '...',
      headers: config.headers
    });
  }

  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Обновляем токены если они пришли в ответе при логине
    if (response.config.url?.includes('/auth/login') && response.data.tokens) {
      const { access, refresh } = response.data.tokens;
      localStorage.setItem(STORAGE_KEY, access);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Если это не 401 или запрос уже повторялся, возвращаем ошибку
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Не пытаемся обновить токен при ошибке логина
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }
    
    // Если это запрос на обновление токена, выходим из системы
    if (originalRequest.url === '/auth/refresh') {
      handleLogout(require('../store/store').store.dispatch);
      return Promise.reject(error);
    }
    
    try {
      originalRequest._retry = true;
      
      // Получаем refresh token из localStorage
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('Отсутствует refresh token');
      }
      
      // Используем refreshTokens из authService
      const { access_token } = await refreshTokens(apiClient, refreshToken);
      
      // Обновляем токен в localStorage и заголовках
      localStorage.setItem(STORAGE_KEY, access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
      
      // Повторяем оригинальный запрос
      return apiClient(originalRequest);
    } catch (refreshError) {
      handleLogout(require('../store/store').store.dispatch);
      return Promise.reject(refreshError);
    }
  }
);

// Инициализируем API и проверяем его доступность
(async () => {
  try {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      console.error(`API недоступен по адресу: ${API_URL}`);
    }
  } catch (error) {
    console.error(`Ошибка при проверке API: ${error}`);
  }
})();

// Экспортируем по умолчанию для обратной совместимости
export default apiClient;