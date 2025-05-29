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
    'Accept': 'application/json',
  },
  timeout: 10000,
  withCredentials: false
});

// Request interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEY);

  if (token && config.headers) {
    // Очищаем существующие заголовки авторизации
    delete config.headers.Authorization;
    delete config.headers.authorization;

    // Добавляем токен в правильном формате
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Обновляем токен если он пришел в ответе
    if (response.data?.auth_token) {
      const newToken = response.data.auth_token;
      localStorage.setItem(STORAGE_KEY, newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // При 401 ошибке очищаем токен
      localStorage.removeItem(STORAGE_KEY);
      
      // Проверяем, не находимся ли мы уже на странице логина
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        // Сохраняем текущий путь для редиректа после логина
        const currentPath = window.location.pathname + window.location.search;
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