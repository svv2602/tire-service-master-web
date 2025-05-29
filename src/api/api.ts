import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';
import { checkApiAvailability } from './baseQuery';

// Константы
const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;
const API_URL = config.API_URL;

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
  }

  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Обновляем токен если он пришел в ответе
    if (
      (response.config.url?.includes('/auth/login'))
      && response.data.auth_token
    ) {
      localStorage.setItem(STORAGE_KEY, response.data.auth_token);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // При 401 ошибке очищаем токен и перенаправляем на логин
      localStorage.removeItem(STORAGE_KEY);
      
      // Сохраняем текущий путь для редиректа после логина
      const currentPath = window.location.pathname + window.location.search;
      if (!currentPath.includes('/login')) {
        localStorage.setItem('returnPath', currentPath);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
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