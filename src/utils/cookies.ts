/**
 * Утилиты для работы с куки
 * Используется для аутентификации через HttpOnly cookies
 */

export interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Получить значение куки по имени
 * Примечание: HttpOnly куки не доступны через JavaScript
 */
export const getCookie = (name: string): string | null => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении куки:', error);
    return null;
  }
};

/**
 * Установить куки
 * Примечание: Это только для обычных куки, HttpOnly устанавливается сервером
 */
export const setCookie = (
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void => {
  try {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      if (typeof options.expires === 'number') {
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
      } else {
        cookieString += `; expires=${options.expires.toUTCString()}`;
      }
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  } catch (error) {
    console.error('Ошибка при установке куки:', error);
  }
};

/**
 * Удалить куки
 */
export const deleteCookie = (name: string, path?: string): void => {
  try {
    let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    if (path) {
      cookieString += `; path=${path}`;
    }
    
    document.cookie = cookieString;
  } catch (error) {
    console.error('Ошибка при удалении куки:', error);
  }
};

/**
 * Проверить, доступны ли куки в браузере
 */
export const areCookiesEnabled = (): boolean => {
  try {
    // Попытка установить тестовый куки
    const testName = '__test_cookies_enabled__';
    setCookie(testName, 'test');
    const isEnabled = getCookie(testName) === 'test';
    deleteCookie(testName);
    return isEnabled;
  } catch (error) {
    console.error('Ошибка при проверке поддержки куки:', error);
    return false;
  }
};

/**
 * Получить все доступные куки как объект
 */
export const getAllCookies = (): Record<string, string> => {
  try {
    const cookies: Record<string, string> = {};
    
    if (document.cookie) {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      });
    }
    
    return cookies;
  } catch (error) {
    console.error('Ошибка при получении всех куки:', error);
    return {};
  }
};

/**
 * Очистить все куки (только доступные через JavaScript)
 */
export const clearAllCookies = (): void => {
  try {
    const cookies = getAllCookies();
    Object.keys(cookies).forEach(name => {
      deleteCookie(name);
      // Также пытаемся удалить с path='/'
      deleteCookie(name, '/');
    });
  } catch (error) {
    console.error('Ошибка при очистке всех куки:', error);
  }
};

/**
 * Утилита для работы с аутентификацией через куки
 */
export const cookieAuth = {
  /**
   * Проверить наличие refresh токена (HttpOnly куки недоступны для чтения)
   * Это приблизительная проверка через отправку запроса
   */
  hasRefreshToken: async (): Promise<boolean> => {
    try {
      // Отправляем запрос на эндпоинт, который требует refresh токен
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.status !== 401;
    } catch {
      return false;
    }
  },

  /**
   * Очистить сессию (отправить запрос на logout)
   */
  clearSession: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
};

// Константы для имен куки аутентификации
export const AUTH_COOKIES = {
  REFRESH_TOKEN: 'refresh_token', // HttpOnly, недоступен из JS
} as const;
