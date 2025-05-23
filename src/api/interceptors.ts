import axios, { InternalAxiosRequestConfig } from 'axios';
import config from '../config';

const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Функция для добавления обработчиков ожидающих обновления токена
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// Функция для вызова всех обработчиков с новым токеном
function onTokenRefreshed(token: string) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

// Интерцептор для добавления токена
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEY);
  console.log('Перехватчик запросов - URL:', config.url);
  
  if (token && config.headers) {
    try {
      // Пробуем распарсить токен как JSON
      const tokenData = JSON.parse(token);
      const actualToken = tokenData.auth_token || tokenData.token || token;
      config.headers.Authorization = `Bearer ${actualToken}`;
    } catch {
      // Если не получилось распарсить как JSON, используем как есть
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Перехватчик запросов - Токен добавлен');
  }
  return config;
};

// Интерцептор для обработки ошибок запроса
export const requestErrorInterceptor = (error: any) => {
  console.error('Перехватчик запросов - Ошибка:', error);
  return Promise.reject(error);
};

// Интерцептор для обработки успешных ответов
export const responseInterceptor = (response: any) => {
  if (response.config.url !== '/api/v1/health') {
    console.log('Перехватчик ответов - Успешный запрос:', response.config.url);
    
    const newToken = response.headers['authorization'] || response.headers['Authorization'];
    if (newToken) {
      const token = newToken.replace('Bearer ', '');
      localStorage.setItem(STORAGE_KEY, token);
      console.log('Токен обновлен из ответа сервера');
    }
  }
  return response;
};

// Интерцептор для обработки ошибок ответа
export const responseErrorInterceptor = async (error: any) => {
  console.error('Перехватчик ответов - Ошибка:', {
    url: error.config?.url,
    status: error.response?.status,
    message: error.response?.data?.message || error.message
  });

  const originalRequest = error.config;

  if (error.response?.status === 401) {
    console.log('Обнаружена ошибка авторизации (401):', error.config?.url);
    
    const isAuthRequest = originalRequest.url.includes('/auth/') || originalRequest.url.includes('/authenticate');
    
    if (!isAuthRequest && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          return new Promise(resolve => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axios(originalRequest));
            });
          });
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Получаем сохраненные учетные данные
      const email = localStorage.getItem('userEmail');
      const password = localStorage.getItem('userPassword');

      if (!email || !password) {
        // Если учетные данные отсутствуют, пользователь должен войти снова
        localStorage.removeItem(STORAGE_KEY);
        handleUnauthorized();
        return Promise.reject(error);
      }

      try {
        // Используем основной эндпойнт аутентификации
        const response = await axios.post('/api/v1/authenticate', {
          email,
          password
        });

        const { auth_token: newToken } = response.data;
        
        localStorage.setItem(STORAGE_KEY, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        onTokenRefreshed(newToken);
        isRefreshing = false;
        
        return axios(originalRequest);
      } catch (refreshError) {
        console.log('Ошибка обновления токена, выполняем выход');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        isRefreshing = false;
        handleUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    if (isAuthRequest) {
      localStorage.removeItem(STORAGE_KEY);
      handleUnauthorized();
    }
  }
  
  return Promise.reject(error);
};

// Вспомогательная функция для обработки неавторизованного доступа
function handleUnauthorized() {
  const currentPath = window.location.pathname + window.location.search;
  
  if (!currentPath.includes('/login')) {
    localStorage.setItem('returnPath', currentPath);
    window.history.pushState({}, '', '/login');
    // Вызываем событие изменения пути для обновления React Router
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
