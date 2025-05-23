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
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Функции для работы с данными пользователя
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Функция для проверки аутентификации
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUser();
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
    setUser({ ...currentUser, ...userData });
  }
};

// Функция для проверки роли пользователя
export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user ? user.role === role : false;
};

// Функция для проверки активности пользователя
export const isUserActive = (): boolean => {
  const user = getUser();
  return user ? user.is_active : false;
}; 