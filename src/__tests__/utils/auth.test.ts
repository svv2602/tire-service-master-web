import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  setAuthData,
  clearAuthData,
  updateUser,
  hasRole,
  isUserActive,
  AuthData
} from '../../utils/auth';
import { User } from '../../types/models';

describe('auth utils', () => {
  // Создаем тестового пользователя
  const testUser: User = {
    id: 1,
    email: 'test@example.com',
    first_name: 'Тест',
    last_name: 'Пользователь',
    role: 'client',
    is_active: true,
    email_verified: false,
    phone_verified: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const testToken = 'test-token-123';

  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
  });

  describe('работа с токеном', () => {
    it('getToken должен возвращать null если токен не установлен', () => {
      expect(getToken()).toBeNull();
    });

    it('setToken должен сохранять токен в localStorage', () => {
      setToken(testToken);
      expect(localStorage.getItem('auth_token')).toBe(testToken);
    });

    it('getToken должен возвращать сохраненный токен', () => {
      setToken(testToken);
      expect(getToken()).toBe(testToken);
    });

    it('removeToken должен удалять токен из localStorage', () => {
      setToken(testToken);
      expect(getToken()).toBe(testToken);
      
      removeToken();
      expect(getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('работа с пользователем', () => {
    it('getUser должен возвращать null если пользователь не установлен', () => {
      expect(getUser()).toBeNull();
    });

    it('setUser должен сохранять пользователя в localStorage', () => {
      setUser(testUser);
      const savedUser = localStorage.getItem('auth_user');
      expect(savedUser).toBe(JSON.stringify(testUser));
    });

    it('getUser должен возвращать сохраненного пользователя', () => {
      setUser(testUser);
      const retrievedUser = getUser();
      expect(retrievedUser).toEqual(testUser);
    });

    it('removeUser должен удалять пользователя из localStorage', () => {
      setUser(testUser);
      expect(getUser()).toEqual(testUser);
      
      removeUser();
      expect(getUser()).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('getUser должен обрабатывать некорректные JSON данные', () => {
      localStorage.setItem('auth_user', 'invalid-json');
      expect(() => getUser()).toThrow();
    });
  });

  describe('проверка аутентификации', () => {
    it('isAuthenticated должен возвращать false если нет токена и пользователя', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('isAuthenticated должен возвращать false если есть только токен', () => {
      setToken(testToken);
      expect(isAuthenticated()).toBe(false);
    });

    it('isAuthenticated должен возвращать false если есть только пользователь', () => {
      setUser(testUser);
      expect(isAuthenticated()).toBe(false);
    });

    it('isAuthenticated должен возвращать true если есть и токен и пользователь', () => {
      setToken(testToken);
      setUser(testUser);
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('работа с данными аутентификации', () => {
    it('setAuthData должен сохранять и токен и пользователя', () => {
      const authData: AuthData = {
        token: testToken,
        user: testUser,
      };

      setAuthData(authData);

      expect(getToken()).toBe(testToken);
      expect(getUser()).toEqual(testUser);
      expect(isAuthenticated()).toBe(true);
    });

    it('clearAuthData должен очищать и токен и пользователя', () => {
      setToken(testToken);
      setUser(testUser);
      expect(isAuthenticated()).toBe(true);

      clearAuthData();

      expect(getToken()).toBeNull();
      expect(getUser()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('обновление пользователя', () => {
    it('updateUser должен обновлять данные существующего пользователя', () => {
      setUser(testUser);

      const updates = {
        first_name: 'Новое Имя',
        email_verified: true,
      };

      updateUser(updates);

      const updatedUser = getUser();
      expect(updatedUser).toEqual({
        ...testUser,
        ...updates,
      });
    });

    it('updateUser не должен ничего делать если пользователь не установлен', () => {
      const updates = {
        first_name: 'Новое Имя',
      };

      updateUser(updates);

      expect(getUser()).toBeNull();
    });

    it('updateUser должен сохранять неизмененные поля', () => {
      setUser(testUser);

      updateUser({ first_name: 'Новое Имя' });

      const updatedUser = getUser();
      expect(updatedUser?.last_name).toBe(testUser.last_name);
      expect(updatedUser?.email).toBe(testUser.email);
      expect(updatedUser?.role).toBe(testUser.role);
    });
  });

  describe('проверка ролей', () => {
    it('hasRole должен возвращать false если пользователь не установлен', () => {
      expect(hasRole('client')).toBe(false);
      expect(hasRole('admin')).toBe(false);
    });

    it('hasRole должен возвращать true для правильной роли', () => {
      setUser(testUser);
      expect(hasRole('client')).toBe(true);
    });

    it('hasRole должен возвращать false для неправильной роли', () => {
      setUser(testUser);
      expect(hasRole('admin')).toBe(false);
      expect(hasRole('partner')).toBe(false);
    });

    it('hasRole должен быть чувствительным к регистру', () => {
      setUser(testUser);
      expect(hasRole('CLIENT')).toBe(false);
      expect(hasRole('Client')).toBe(false);
    });
  });

  describe('проверка активности пользователя', () => {
    it('isUserActive должен возвращать false если пользователь не установлен', () => {
      expect(isUserActive()).toBe(false);
    });

    it('isUserActive должен возвращать true для активного пользователя', () => {
      setUser(testUser);
      expect(isUserActive()).toBe(true);
    });

    it('isUserActive должен возвращать false для неактивного пользователя', () => {
      const inactiveUser = { ...testUser, is_active: false };
      setUser(inactiveUser);
      expect(isUserActive()).toBe(false);
    });
  });

  describe('интеграционные тесты', () => {
    it('полный цикл аутентификации должен работать корректно', () => {
      // Начальное состояние
      expect(isAuthenticated()).toBe(false);
      expect(hasRole('client')).toBe(false);
      expect(isUserActive()).toBe(false);

      // Аутентификация
      const authData: AuthData = {
        token: testToken,
        user: testUser,
      };
      setAuthData(authData);

      // Проверка состояния после аутентификации
      expect(isAuthenticated()).toBe(true);
      expect(hasRole('client')).toBe(true);
      expect(isUserActive()).toBe(true);

      // Обновление пользователя
      updateUser({ first_name: 'Обновленное Имя' });
      expect(getUser()?.first_name).toBe('Обновленное Имя');
      expect(isAuthenticated()).toBe(true); // Должен остаться аутентифицированным

      // Выход из системы
      clearAuthData();
      expect(isAuthenticated()).toBe(false);
      expect(hasRole('client')).toBe(false);
      expect(isUserActive()).toBe(false);
    });

    it('должен корректно обрабатывать смену пользователя', () => {
      // Первый пользователь
      setAuthData({ token: testToken, user: testUser });
      expect(hasRole('client')).toBe(true);

      // Второй пользователь с другой ролью
      const adminUser: User = {
        ...testUser,
        id: 2,
        email: 'admin@example.com',
        role: 'admin',
      };

      setAuthData({ token: 'new-token', user: adminUser });
      expect(hasRole('client')).toBe(false);
      expect(hasRole('admin')).toBe(true);
      expect(getToken()).toBe('new-token');
    });
  });
}); 