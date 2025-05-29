/**
 * Конфигурация приложения
 */

// API URL по умолчанию
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// Экспортируем конфигурацию
export const config = {
  API_URL,
  API_PREFIX,
  AUTH_TOKEN_STORAGE_KEY: 'tvoya_shina_token',
};

export default config; 