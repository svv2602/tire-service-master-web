/**
 * Утилиты для работы с API
 */
import config from '../config';
import { ApiResponse } from '../types/models';

/**
 * Выполняет запрос к API с автоматическим добавлением токена авторизации
 * @param url URL-адрес запроса
 * @param options Опции запроса fetch
 * @returns Promise с результатом запроса
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Получаем токен из localStorage
  const token = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
  
  // Создаем заголовки запроса
  const headers = new Headers(options.headers || {});
  
  // Добавляем заголовок авторизации, если токен существует
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Добавляем заголовок Content-Type, если он не установлен
  if (!headers.has('Content-Type') && !options.body?.toString().includes('FormData')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Преобразуем относительный URL в абсолютный, если он начинается с /
  const fullUrl = url.startsWith('/') ? `${config.API_URL}${url}` : url;
  
  // Выполняем запрос с обновленными заголовками
  return fetch(fullUrl, {
    ...options,
    headers
  });
};

/**
 * Обрабатывает ошибки запросов к API
 * @param response Ответ от API
 * @returns Promise с данными или ошибкой
 */
export const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = `Ошибка ${response.status}: ${response.statusText || 'Неизвестная ошибка'}`;
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        console.error('Ошибка при парсинге JSON ответа:', e);
      }
    }

    // Для 401 ошибки, очищаем токен и перезагружаем страницу
    if (response.status === 401) {
      localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
      window.location.href = '/login';
      return null;
    }

    throw new Error(errorMessage);
  }
  
  // Если статус 204 или нет контента
  if (response.status === 204 || !contentType) {
    return null;
  }
  
  // Для JSON ответов
  if (isJson) {
    return response.json();
  }
  
  // Для других типов контента
  return response.text();
};

/**
 * Выполняет запрос к API с авторизацией и обработкой ошибок
 * @param url URL-адрес запроса
 * @param options Опции запроса fetch
 * @returns Promise с данными ответа
 */
export const fetchApi = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetchWithAuth(url, options);
    return handleApiResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Общий трансформер для ответов API с пагинацией
export const transformPaginatedResponse = <T>(response: any): ApiResponse<T> => {
  // Проверяем, есть ли данные в ответе
  if (!response) {
    return {
      data: [],
      message: 'Нет данных',
      status: 404
    };
  }

  // Если данные пришли в старом формате (массивом)
  if (Array.isArray(response)) {
    return {
      data: response,
      status: 200
    };
  }

  // Если данные пришли в новом формате с пагинацией
  if (response.data) {
    return {
      data: Array.isArray(response.data) ? response.data : [response.data],
      pagination: response.pagination ? {
        current_page: response.pagination.current_page || 1,
        total_pages: response.pagination.total_pages || 1,
        total_count: response.pagination.total_count || response.data.length,
        per_page: response.pagination.per_page || response.data.length
      } : undefined,
      message: response.message,
      status: response.status || 200
    };
  }

  // Если структура ответа неизвестна, пытаемся извлечь данные
  return {
    data: [response],
    status: 200
  };
}; 