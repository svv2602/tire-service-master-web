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

// Отладочная информация только при первой загрузке
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !(window as any).configLogged) {
  console.log('🔧 API Configuration:', {
    API_URL,
    hostname: window.location.hostname,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL
  });
  (window as any).configLogged = true;
}

// Экспортируем конфигурацию
export const config = {
  API_URL,
  API_PREFIX,
  AUTH_TOKEN_STORAGE_KEY: 'tvoya_shina_token',
};

export default config; 