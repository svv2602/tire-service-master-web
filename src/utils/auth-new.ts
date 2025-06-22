import { User } from '../types/models';
import { cookieAuth } from './cookies';

/**
 * Утилиты аутентификации для cookie-based системы
 * Все токены теперь хранятся в HttpOnly куки
 */

// Интерфейс для хранения данных аутентификации (deprecated)
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

// Функции для работы с данными пользователя (только в памяти через Redux)
export const getUser = (): User | null => {
  console.warn('getUser deprecated: данные пользователя управляются через Redux состояние');
  return null;
};

export const setUser = (user: User): void => {
  console.warn('setUser deprecated: данные пользователя управляются через Redux состояние');
};

export const removeUser = (): void => {
  console.warn('removeUser deprecated: используйте logout через API');
};

// Функция для проверки аутентификации (deprecated)
export const isAuthenticated = (): boolean => {
  console.warn('isAuthenticated deprecated: используйте Redux состояние auth.isAuthenticated');
  return false;
};

// Функция для сохранения данных аутентификации (deprecated)
export const setAuthData = (data: AuthData): void => {
  console.warn('setAuthData deprecated: данные управляются через API и Redux');
};

// Функция для очистки данных аутентификации
export const clearAuthData = (): void => {
  // Очищаем сессию через API
  cookieAuth.clearSession().catch(error => {
    console.error('Ошибка при очистке сессии:', error);
  });
};

// Функция для проверки роли пользователя (deprecated)
export const hasRole = (role: string): boolean => {
  console.warn('hasRole deprecated: используйте Redux состояние и селекторы');
  return false;
};

// Функция для проверки активности пользователя (deprecated)
export const isUserActive = (): boolean => {
  console.warn('isUserActive deprecated: используйте Redux состояние');
  return false;
};

// Функция для инициализации аутентификации (deprecated)
export const initializeAuth = () => {
  console.warn('initializeAuth deprecated: используйте AuthInitializer компонент');
  return { accessToken: null, user: null, source: 'none' as const };
};

// Новые функции для cookie-based аутентификации
export const authCookieUtils = {
  /**
   * Проверить наличие refresh токена
   */
  hasRefreshToken: cookieAuth.hasRefreshToken,

  /**
   * Очистить сессию
   */
  clearSession: cookieAuth.clearSession,

  /**
   * Проверить, работают ли куки в браузере
   */
  checkCookieSupport: () => {
    try {
      document.cookie = 'test=1';
      const supported = document.cookie.includes('test=1');
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      return supported;
    } catch {
      return false;
    }
  }
};
