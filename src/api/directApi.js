// Прямые вызовы API для использования в приложении
// Этот файл предоставляет функции, которые напрямую взаимодействуют с API без RTK Query

import config from '../config';

// Получение токена из localStorage
const getAuthToken = () => {
  return localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
};

// Базовая функция для выполнения запросов к API
export const fetchAPI = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const baseURL = `${config.API_URL}${config.API_PREFIX}`;
  const url = `${baseURL}/${endpoint}`.replace(/\/+/g, '/');
  
  const headers = {
    'Accept': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      // Пытаемся получить детали ошибки
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const errorData = isJson ? await response.json() : await response.text();
      
      throw {
        status: response.status,
        data: errorData,
        message: `Error ${response.status}: ${response.statusText}`
      };
    }
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    return isJson ? await response.json() : await response.text();
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
};

// Функция для удаления услуги
export const deleteService = async (categoryId, serviceId) => {
  if (!categoryId || !serviceId) {
    throw new Error('Category ID and Service ID are required');
  }
  
  return fetchAPI(`service_categories/${categoryId}/services/${serviceId}`, {
    method: 'DELETE'
  });
};

// Функция для получения списка услуг по категории
export const getServicesByCategory = async (categoryId, params = {}) => {
  if (!categoryId) {
    throw new Error('Category ID is required');
  }
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return fetchAPI(`service_categories/${categoryId}/services${query}`);
};

// Другие функции API могут быть добавлены здесь
