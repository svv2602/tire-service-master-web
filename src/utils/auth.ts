import { User } from '../types/models';
import { cookieAuth } from './cookies';

/**
 * Утилиты аутентификации для cookie-based системы
 * Все токены теперь хранятся в HttpOnly куки
 */

// Интерфейс для хранения данных аутентификации
export interface AuthData {
  token: string;
  user: User;
}

// Функции для работы с токеном (deprecated - токены в HttpOnly куки)
export const getToken = (): string | null => {
  console.warn('getToken deprecated: токены теперь в HttpOnly куки, используйте Redux состояние');
  return null;
};

export const setToken = (token: string): void => {
  console.warn('setToken deprecated: токены управляются сервером через HttpOnly куки');
};

export const removeToken = (): void => {
  console.warn('removeToken deprecated: используйте logout через API');
};

// Функции для работы с данными пользователя (обновлены для поддержки куки)
export const getUser = (): User | null => {
  console.warn('getUser deprecated: используйте Redux состояние для получения данных пользователя');
  return null;
};

export const setUser = (user: User): void => {
  console.warn('setUser deprecated: данные пользователя управляются через Redux и HttpOnly куки');
};

export const removeUser = (): void => {
  console.warn('removeUser deprecated: используйте logout action в Redux');
};

// Проверки аутентификации (обновлены для cookie-based системы)
export const isAuthenticated = (): boolean => {
  console.warn('isAuthenticated deprecated: используйте Redux селектор для проверки аутентификации');
  // Синхронная проверка наличия refresh cookie
  return document.cookie.includes('refresh_token=');
};

// Получение данных аутентификации (deprecated)
export const getAuthData = (): AuthData | null => {
  console.warn('getAuthData deprecated: используйте Redux состояние');
  return null;
};

// Сохранение данных аутентификации (deprecated)
export const setAuthData = (data: AuthData): void => {
  console.warn('setAuthData deprecated: аутентификация управляется через Redux и HttpOnly куки');
};

// Очистка всех данных аутентификации
export const clearAuth = (): void => {
  console.warn('clearAuth deprecated: используйте logout action в Redux');
  cookieAuth.clearSession();
};

/**
 * Утилиты для cookie-based аутентификации
 */
export const authCookieUtils = {
  // Проверка наличия refresh токена в куки (синхронная)
  hasRefreshToken: () => document.cookie.includes('refresh_token='),
  
  // Очистка сессии
  clearSession: () => cookieAuth.clearSession(),
  
  // Проверка возможности использования куки
  canUseCookies: () => {
    try {
      // Простая проверка - пытаемся установить и прочитать тестовое куки
      document.cookie = 'test=1; path=/';
      const canRead = document.cookie.includes('test=1');
      // Удаляем тестовое куки
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      return canRead;
    } catch {
      return false;
    }
  }
};

// Legacy функции для обратной совместимости с компонентами, которые еще не обновлены
export const legacyAuthUtils = {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  getAuthData,
  setAuthData,
  clearAuth
};

export default authCookieUtils;