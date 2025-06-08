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
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    phone: '+1234567890',
    first_name: 'Test',
    last_name: 'User',
    role: 'client',
    role_id: 1,
    is_active: true,
    email_verified: false,
    phone_verified: false,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const testToken = 'test-token-123';

  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    jest.clearAllMocks();
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
      localStorage.setItem('auth_token', testToken);
      expect(getToken()).toBe(testToken);
    });

    it('removeToken должен удалять токен из localStorage', () => {
      localStorage.setItem('auth_token', testToken);
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
      setUser(mockUser);
      const savedUser = localStorage.getItem('auth_user');
      expect(savedUser).toBe(JSON.stringify(mockUser));
    });

    it('getUser должен возвращать сохраненного пользователя', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      const retrievedUser = getUser();
      expect(retrievedUser).toEqual(mockUser);
    });

    it('removeUser должен удалять пользователя из localStorage', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      expect(getUser()).toEqual(mockUser);
      
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
      localStorage.setItem('auth_token', testToken);
      expect(isAuthenticated()).toBe(false);
    });

    it('isAuthenticated должен возвращать false если есть только пользователь', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      expect(isAuthenticated()).toBe(false);
    });

    it('isAuthenticated должен возвращать true если есть и токен и пользователь', () => {
      localStorage.setItem('auth_token', testToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('работа с данными аутентификации', () => {
    it('setAuthData должен сохранять и токен и пользователя', () => {
      const authData: AuthData = {
        token: testToken,
        user: mockUser,
      };

      setAuthData(authData);

      expect(localStorage.getItem('auth_token')).toBe(testToken);
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
      expect(isAuthenticated()).toBe(true);
    });

    it('clearAuthData должен очищать и токен и пользователя', () => {
      localStorage.setItem('auth_token', testToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      expect(isAuthenticated()).toBe(true);

      clearAuthData();

      expect(getToken()).toBeNull();
      expect(getUser()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('обновление пользователя', () => {
    it('updateUser должен обновлять данные существующего пользователя', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      const updates = {
        first_name: 'Новое Имя',
        email_verified: true,
      };

      updateUser(updates);

      const updatedUser = getUser();
      expect(updatedUser).toEqual({
        ...mockUser,
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
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      updateUser({ first_name: 'Новое Имя' });

      const updatedUser = getUser();
      expect(updatedUser?.last_name).toBe(mockUser.last_name);
      expect(updatedUser?.email).toBe(mockUser.email);
      expect(updatedUser?.role).toBe(mockUser.role);
    });
  });

  describe('проверка ролей', () => {
    it('hasRole должен возвращать false если пользователь не установлен', () => {
      expect(hasRole('client')).toBe(false);
      expect(hasRole('admin')).toBe(false);
    });

    it('hasRole должен возвращать true для правильной роли', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      expect(hasRole('client')).toBe(true);
    });

    it('hasRole должен возвращать false для неправильной роли', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      expect(hasRole('admin')).toBe(false);
    });

    it('hasRole должен работать с разными ролями', () => {
      const adminUser: User = {
        ...mockUser,
        id: '2',
        email: 'admin@example.com',
        role: 'admin',
        role_id: 2,
      };

      localStorage.setItem('auth_user', JSON.stringify(adminUser));
      expect(hasRole('admin')).toBe(true);
      expect(hasRole('client')).toBe(false);
    });
  });

  describe('проверка активности пользователя', () => {
    it('isUserActive должен возвращать false если пользователь не установлен', () => {
      expect(isUserActive()).toBe(false);
    });

    it('isUserActive должен возвращать true для активного пользователя', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      expect(isUserActive()).toBe(true);
    });

    it('isUserActive должен возвращать false для неактивного пользователя', () => {
      const inactiveUser: User = {
        ...mockUser,
        is_active: false,
      };
      localStorage.setItem('auth_user', JSON.stringify(inactiveUser));
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
        user: mockUser,
      };

      setAuthData(authData);

      // Проверка состояния после аутентификации
      expect(isAuthenticated()).toBe(true);
      expect(hasRole('client')).toBe(true);
      expect(isUserActive()).toBe(true);

      // Очистка данных
      clearAuthData();

      // Проверка состояния после очистки
      expect(isAuthenticated()).toBe(false);
      expect(hasRole('client')).toBe(false);
      expect(isUserActive()).toBe(false);
    });

    it('должен корректно обрабатывать смену пользователя', () => {
      // Первый пользователь
      setAuthData({ token: testToken, user: mockUser });
      expect(hasRole('client')).toBe(true);

      // Второй пользователь с другой ролью
      const adminUser: User = {
        ...mockUser,
        id: '2',
        email: 'admin@example.com',
        role: 'admin',
        role_id: 2,
      };

      setAuthData({ token: 'admin-token', user: adminUser });
      expect(hasRole('admin')).toBe(true);
      expect(hasRole('client')).toBe(false);
    });
  });
}); 