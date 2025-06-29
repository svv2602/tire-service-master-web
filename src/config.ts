/**
 * Конфигурация приложения
 */

// Функция для определения API URL в зависимости от окружения
const getApiUrl = (): string => {
  // Если задана переменная окружения, используем её
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Если мы в Docker (проверяем по hostname или других признаках)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Если hostname не localhost/127.0.0.1, вероятно мы в Docker или на удаленном сервере
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Используем тот же хост, что и фронтенд, но порт 8000
      return `http://${hostname}:8000`;
    }
  }
  
  // По умолчанию для локальной разработки
  return 'http://localhost:8000';
};

// API URL
const API_URL = getApiUrl();
const API_PREFIX = '/api/v1';

// Отладочная информация в режиме разработки
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    API_URL,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL
  });
}

// Экспортируем конфигурацию
export const config = {
  API_URL,
  API_PREFIX,
  AUTH_TOKEN_STORAGE_KEY: 'tvoya_shina_token',
};

export default config; 