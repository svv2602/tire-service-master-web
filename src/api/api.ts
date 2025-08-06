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
  
  // Отладочное логирование только в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 ApiClient запрос:', {
      url: config.url,
      hasAccessToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'отсутствует',
      withCredentials: config.withCredentials
    });
  }

  return config;
});

// Response interceptor - обработка ошибок авторизации
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // 🚫 ОТКЛЮЧЕНО: Interceptor для 401 ошибок отключен, так как RTK Query в baseApi.ts уже обрабатывает это
    // Это предотвращает зацикливание множественных попыток refresh токена
    
    if (error.response?.status === 401) {
      console.log('⚠️ 401 ошибка в apiClient interceptor - пропускаем, так как RTK Query обрабатывает это:', error.config?.url);
      
      // Для auth запросов все еще обрабатываем выход из системы
      if (error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/refresh')) {
        console.log('❌ Критическая ошибка аутентификации, выходим из системы');
        handleLogout(require('../store/store').store.dispatch);
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