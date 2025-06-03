/**
 * Утилита для мониторинга и диагностики состояния аутентификации
 */

import config from '../config';

export interface AuthDiagnostic {
  localStorage: {
    hasToken: boolean;
    hasUser: boolean;
    hasRefreshToken: boolean;
    tokenPreview?: string;
    userEmail?: string;
  };
  isConsistent: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Проверяет состояние аутентификации в localStorage
 */
export const checkAuthState = (): AuthDiagnostic => {
  const token = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
  const userStr = localStorage.getItem('tvoya_shina_user');
  const refreshToken = localStorage.getItem('tvoya_shina_refresh_token');
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Ошибка парсинга данных пользователя:', e);
  }

  const hasToken = !!token;
  const hasUser = !!user;
  const hasRefreshToken = !!refreshToken;

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Выявляем проблемы
  if (hasToken && !hasUser) {
    issues.push('Есть токен, но нет данных пользователя');
    recommendations.push('Получить данные пользователя с сервера или очистить токен');
  }

  if (hasUser && !hasToken) {
    issues.push('Есть данные пользователя, но нет токена');
    recommendations.push('Получить новый токен или очистить данные пользователя');
  }

  const isConsistent = (hasToken && hasUser) || (!hasToken && !hasUser);

  return {
    localStorage: {
      hasToken,
      hasUser,
      hasRefreshToken,
      tokenPreview: token ? token.substring(0, 30) + '...' : undefined,
      userEmail: user?.email,
    },
    isConsistent,
    issues,
    recommendations,
  };
};

/**
 * Очищает все данные аутентификации
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem('tvoya_shina_user');
  localStorage.removeItem('tvoya_shina_refresh_token');
  console.log('AuthMonitor: Все данные аутентификации очищены');
};

/**
 * Восстанавливает токен из localStorage в Redux состояние
 */
export const getStoredAuthData = () => {
  const token = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
  const userStr = localStorage.getItem('tvoya_shina_user');
  const refreshToken = localStorage.getItem('tvoya_shina_refresh_token');
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Ошибка парсинга данных пользователя:', e);
    return null;
  }

  return token && user ? { token, user, refreshToken } : null;
};

/**
 * Валидирует структуру данных пользователя
 */
export const validateUserData = (user: any): boolean => {
  if (!user || typeof user !== 'object') return false;
  
  const requiredFields = ['id', 'email', 'role'];
  return requiredFields.every(field => field in user);
};

/**
 * Логирует диагностическую информацию в консоль
 */
export const logAuthDiagnostic = (): void => {
  const diagnostic = checkAuthState();
  
  console.group('🔐 Диагностика аутентификации');
  console.log('localStorage:', diagnostic.localStorage);
  console.log('Состояние консистентно:', diagnostic.isConsistent);
  
  if (diagnostic.issues.length > 0) {
    console.warn('Проблемы:', diagnostic.issues);
    console.log('Рекомендации:', diagnostic.recommendations);
  } else {
    console.log('✅ Проблем не обнаружено');
  }
  
  console.groupEnd();
}; 