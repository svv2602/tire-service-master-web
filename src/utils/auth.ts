import { User } from '../types/models';

// Ключи для хранения данных в localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Интерфейс для хранения данных аутентификации
export interface AuthData {
  token: string;
  user: User;
}

// Функции для работы с токеном
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Ошибка при сохранении токена:', error);
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Ошибка при удалении токена:', error);
  }
};

// Функции для работы с данными пользователя
export const getUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      throw new Error('Некорректные данные пользователя в localStorage');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Некорректные данные пользователя в localStorage') {
      throw error;
    }
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
};

export const setUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Ошибка при сохранении пользователя:', error);
  }
};

export const removeUser = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
  }
};

// Функция для проверки аутентификации
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getUser();
  return token !== null && user !== null;
};

// Функция для сохранения данных аутентификации
export const setAuthData = (data: AuthData): void => {
  setToken(data.token);
  setUser(data.user);
};

// Функция для очистки данных аутентификации
export const clearAuthData = (): void => {
  removeToken();
  removeUser();
};

// Функция для обновления данных пользователя
export const updateUser = (userData: Partial<User>): void => {
  const currentUser = getUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...userData };
    setUser(updatedUser);
  }
};

// Функция для проверки роли пользователя
export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user !== null && user.role === role;
};

// Функция для проверки активности пользователя
export const isUserActive = (): boolean => {
  const user = getUser();
  return user !== null && user.is_active;
}; 