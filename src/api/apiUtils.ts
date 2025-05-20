/**
 * Утилиты для работы с API
 */
import config from '../config';

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
  if (!response.ok) {
    // Пробуем получить JSON с ошибкой
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Ошибка запроса к API');
    } catch (e) {
      // Если не удалось распарсить JSON, используем статус и текст ошибки
      throw new Error(`Ошибка ${response.status}: ${response.statusText || 'Неизвестная ошибка'}`);
    }
  }
  
  // Если статус ответа 204 (No Content), возвращаем null
  if (response.status === 204) {
    return null;
  }
  
  // В противном случае возвращаем данные в формате JSON
  return response.json();
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