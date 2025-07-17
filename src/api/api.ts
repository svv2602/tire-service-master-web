import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';
import { checkApiAvailability } from './baseQuery';
import { handleLogout, refreshTokens } from '../services/authService';

// Константы
const API_URL = `${config.API_URL}${config.API_PREFIX}`;

// Создаем экземпляр axios с базовыми настройками
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true // Включаем поддержку куки для refresh токена
});

// Request interceptor - добавляем access токен из Redux state
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Получаем access токен из Redux state
  const store = require('../store/store').store;
  const token = store.getState()?.auth?.accessToken;
  
  if (token && config.headers) {
    // Добавляем access токен в заголовок Authorization
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Минимальное логирование только для критических запросов
  if (process.env.NODE_ENV === 'development' && config.url?.includes('/auth/')) {
    console.log('🔐 Auth запрос:', config.url, !!token ? 'с токеном' : 'без токена');
  }

  return config;
});

// Response interceptor - обработка ошибок авторизации
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
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
      
      // Используем refreshTokens из authService (refresh токен передается через cookies)
      const { access_token } = await refreshTokens(apiClient);
      
      // Обновляем access токен в Redux state и повторяем запрос
      const store = require('../store/store').store;
      store.dispatch({ type: 'auth/updateAccessToken', payload: access_token });
      
      // Добавляем новый токен в заголовок повторного запроса
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