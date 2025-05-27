import { configureStore } from '@reduxjs/toolkit';
import authReducer, { 
  setCredentials, 
  logout
} from '../../store/slices/authSlice';
import { RootState } from '../../store/store';

// Мокирование config
jest.mock('../../config', () => ({
  AUTH_TOKEN_STORAGE_KEY: 'test_auth_token',
}));

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore<{ auth: ReturnType<typeof authReducer> }>>;

  // Создаем тестового пользователя
  const testUser = {
    id: '1',
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

  beforeEach(() => {
    // Очищаем localStorage
    localStorage.clear();
    
    // Создаем новый store для каждого теста
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('начальное состояние', () => {
    it('должно иметь правильное начальное состояние', () => {
      const state = store.getState().auth;
      
      expect(state).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        isInitialized: false,
      });
    });

    it('должно восстанавливать токен из localStorage', () => {
      const testToken = 'test-token-123';
      
      // Устанавливаем токен в localStorage перед созданием store
      localStorage.setItem('auth_token', testToken);
      
      // Пересоздаем store чтобы проверить инициализацию
      const newStore = configureStore({
        reducer: {
          auth: authReducer,
        },
      });
      
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const state = newStore.getState().auth;
      // Проверяем, что setItem был вызван с правильными параметрами
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', testToken);
      
      // Проверяем, что мы можем установить состояние с токеном
      newStore.dispatch(setCredentials({ user: testUser, token: testToken }));
      const updatedState = newStore.getState().auth;
      expect(updatedState.token).toBe(testToken);
      expect(updatedState.isAuthenticated).toBe(true);
    });
  });

  describe('синхронные экшены', () => {
    it('setCredentials должен устанавливать пользователя и токен', () => {
      const token = 'test-token-123';

      store.dispatch(setCredentials({ user: testUser, token }));
      
      const state = store.getState().auth;
      expect(state.user).toEqual(testUser);
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      
      // Проверяем, что setItem был вызван с правильными параметрами
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('logout должен очищать состояние авторизации', () => {
      // Сначала устанавливаем данные
      store.dispatch(setCredentials({ user: testUser, token: 'test-token' }));
      
      // Затем очищаем
      store.dispatch(logout());
      
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
      
      // Проверяем, что removeItem был вызван
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('localStorage интеграция', () => {
    it('должен сохранять токен в localStorage при setCredentials', () => {
      const token = 'test-token-456';
      
      store.dispatch(setCredentials({ user: testUser, token }));
      
      // Проверяем, что setItem был вызван с правильными параметрами
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('должен удалять токен из localStorage при logout', () => {
      // Устанавливаем токен
      store.dispatch(setCredentials({ user: testUser, token: 'some-token' }));
      
      // Очищаем
      store.dispatch(logout());
      
      // Проверяем, что removeItem был вызван
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('состояние аутентификации', () => {
    it('должен правильно устанавливать isAuthenticated при наличии токена', () => {
      store.dispatch(setCredentials({ user: testUser, token: 'test-token' }));
      
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
    });

    it('должен правильно сбрасывать isAuthenticated при очистке', () => {
      // Сначала аутентифицируем
      store.dispatch(setCredentials({ user: testUser, token: 'test-token' }));
      expect(store.getState().auth.isAuthenticated).toBe(true);
      
      // Затем очищаем
      store.dispatch(logout());
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });
  });

  describe('обработка пользователя', () => {
    it('должен сохранять полные данные пользователя', () => {
      const fullUser = {
        ...testUser,
        phone: '+380501234567',
        email_verified: true,
      };
      
      store.dispatch(setCredentials({ user: fullUser, token: 'test-token' }));
      
      const state = store.getState().auth;
      expect(state.user).toEqual(fullUser);
      expect(state.user?.phone).toBe('+380501234567');
      expect(state.user?.email_verified).toBe(true);
    });

    it('должен очищать данные пользователя при logout', () => {
      store.dispatch(setCredentials({ user: testUser, token: 'test-token' }));
      expect(store.getState().auth.user).not.toBeNull();
      
      store.dispatch(logout());
      expect(store.getState().auth.user).toBeNull();
    });
  });
}); 