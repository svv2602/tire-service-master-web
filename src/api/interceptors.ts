import axios, { InternalAxiosRequestConfig } from 'axios';

/**
 * Интерцепторы для cookie-based аутентификации
 * Токены теперь управляются через Redux состояние и HttpOnly куки
 */

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

// Интерцептор для добавления токена из Redux состояния
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // Получаем токен из Redux состояния, а не из localStorage
  const store = require('../store/store').store;
  const token = store.getState()?.auth?.accessToken;
  
  console.log('Перехватчик запросов - URL:', config.url);
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Перехватчик запросов - Токен добавлен из Redux');
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
    
    const isAuthRequest = originalRequest.url.includes('/auth/');
    
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

      try {
        // Попытка обновить токен через API (refresh токен в HttpOnly куки)
        const response = await axios.post('/api/v1/auth/refresh', {}, {
          withCredentials: true // Важно для отправки HttpOnly куки
        });

        const { tokens: { access: newToken } } = response.data;
        
        // Обновляем токен в Redux состоянии
        const store = require('../store/store').store;
        store.dispatch({ type: 'auth/updateAccessToken', payload: newToken });
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        onTokenRefreshed(newToken);
        isRefreshing = false;
        
        return axios(originalRequest);
      } catch (refreshError) {
        console.log('Ошибка обновления токена, выполняем выход');
        // Выходим из системы через Redux
        const store = require('../store/store').store;
        store.dispatch({ type: 'auth/logout' });
        isRefreshing = false;
        handleUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    if (isAuthRequest) {
      handleUnauthorized();
    }
  }
  
  return Promise.reject(error);
};

// Вспомогательная функция для обработки неавторизованного доступа
function handleUnauthorized() {
  const currentPath = window.location.pathname + window.location.search;
  
  if (!currentPath.includes('/login')) {
    // Сохраняем путь возврата только для админских страниц
    if (currentPath.startsWith('/admin') || currentPath.startsWith('/dashboard') || 
        currentPath.startsWith('/partners') || currentPath.startsWith('/service-points') ||
        currentPath.startsWith('/clients') || currentPath.startsWith('/bookings') ||
        currentPath.startsWith('/reviews') || currentPath.startsWith('/users') ||
        currentPath.startsWith('/settings') || currentPath.startsWith('/profile')) {
      sessionStorage.setItem('returnPath', currentPath);
    }
    window.history.pushState({}, '', '/login');
    // Вызываем событие изменения пути для обновления React Router
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
