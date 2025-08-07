import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/api';
import { User } from '../../types/user';
import { AuthState, LoginResponse } from '../../types/auth';
import { UserRole } from '../../types';
import axios from 'axios';
import config from '../../config';
import { clearAllCacheData } from '../../api/baseApi';

/**
 * authSlice для cookie-based аутентификации
 * Пользователи и токены управляются только через Redux состояние
 * Refresh токены хранятся в HttpOnly куки на сервере
 */

// Начальное состояние (с восстановлением токена из localStorage)
const initialState: AuthState = {
  accessToken: localStorage.getItem('auth_token'), // Восстанавливаем токен из localStorage
  refreshToken: null, // Refresh токен в HttpOnly cookies
  user: null, // Пользователь будет получен из API при инициализации
  isAuthenticated: false, // Будет определено при инициализации через API
  loading: false,
  error: null,
  isInitialized: false,
  hasLoggedOut: localStorage.getItem('hasLoggedOut') === 'true', // Читаем из localStorage
};

// Функция для преобразования строки роли в enum UserRole
const mapRoleToEnum = (role: string): UserRole => {
  const roleMap: { [key: string]: UserRole } = {
    'client': UserRole.CLIENT,
    'partner': UserRole.PARTNER,
    'manager': UserRole.MANAGER,
    'admin': UserRole.ADMIN,
    'operator': UserRole.OPERATOR
  };
  const mapped = roleMap[role.toLowerCase()] || UserRole.CLIENT;
  console.log('mapRoleToEnum:', role, '=>', mapped);
  return mapped;
};

// Создаем slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string | null; user: User }>
    ) => {
      const { accessToken, user } = action.payload;
      state.accessToken = accessToken;
      state.user = user;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.hasLoggedOut = false; // Сбрасываем флаг выхода при входе
      localStorage.removeItem('hasLoggedOut'); // Удаляем из localStorage
      
      // Сохраняем токен в localStorage
      if (accessToken) {
        localStorage.setItem('auth_token', accessToken);
        console.log('🔐 Токен сохранен в localStorage');
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
      state.hasLoggedOut = true; // Устанавливаем флаг явного выхода
      localStorage.setItem('hasLoggedOut', 'true'); // Сохраняем в localStorage
      localStorage.removeItem('auth_token'); // Удаляем токен из localStorage
      console.log('🗑️ Токен удален из localStorage');
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    clearLogoutFlag: (state) => {
      state.hasLoggedOut = false; // Новый action для сброса флага
      localStorage.removeItem('hasLoggedOut'); // Удаляем из localStorage
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      // При обновлении access токена пользователь остается аутентифицированным
      if (state.user) {
        state.isAuthenticated = true;
      }
      // Сохраняем обновленный токен в localStorage
      localStorage.setItem('auth_token', action.payload);
      console.log('🔄 Обновленный токен сохранен в localStorage');
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка login
      .addCase(login.pending, (state) => {
        console.log('Auth: login.pending - setting loading to true');
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        console.log('Auth: login.fulfilled - login successful', action.payload);
        state.loading = false;
        // Безопасно обрабатываем отсутствие tokens
        state.accessToken = action.payload.tokens?.access || null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
        state.hasLoggedOut = false; // Сбрасываем флаг выхода при входе
        localStorage.removeItem('hasLoggedOut'); // Удаляем из localStorage
        
        // Сохраняем токен в localStorage
        if (state.accessToken) {
          localStorage.setItem('auth_token', state.accessToken);
          console.log('🔐 Токен сохранен в localStorage при login');
        }
        
        console.log('Auth: login.fulfilled - state updated:', {
          isAuthenticated: state.isAuthenticated,
          hasToken: !!state.accessToken,
          hasUser: !!state.user
        });
      })
      .addCase(login.rejected, (state, action) => {
        console.log('Auth: login.rejected - login failed');
        state.loading = false;
        state.error = action.error.message || 'Ошибка при авторизации';
        state.isAuthenticated = false;
        state.isInitialized = true;
      })
      
      // Обработка logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = true;
        state.hasLoggedOut = true; // Устанавливаем флаг явного выхода
        localStorage.setItem('hasLoggedOut', 'true'); // Сохраняем в localStorage
        localStorage.removeItem('auth_token'); // Удаляем токен из localStorage
        console.log('🗑️ Токен удален из localStorage при logout');
      })
      
      // Обработка refreshAuthTokens
      .addCase(refreshAuthTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshAuthTokens.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Обновляем access токен
        if (action.payload.access_token || action.payload.tokens?.access) {
          const newToken = action.payload.access_token || action.payload.tokens.access;
          state.accessToken = newToken;
          localStorage.setItem('auth_token', newToken);
          console.log('AuthSlice: Access токен обновлен и сохранен в localStorage');
        }
      })
      .addCase(refreshAuthTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('AuthSlice: Ошибка обновления токена');
      })
      
      // Обработка getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload; // Поддерживаем оба формата ответа
        state.error = null;
        state.isAuthenticated = true; // Если получили пользователя, значит аутентифицированы
        state.isInitialized = true; // Устанавливаем флаг инициализации
        
        // Если в ответе есть новый access токен, сохраняем его
        if (action.payload.tokens?.access) {
          state.accessToken = action.payload.tokens.access;
          localStorage.setItem('auth_token', action.payload.tokens.access);
          console.log('🔐 Токен сохранен в localStorage при getCurrentUser');
        }
        
        console.log('User role after getCurrentUser:', state.user?.role);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.isInitialized = true;
      });
  },
});

// Создаем асинхронные thunks
export const login = createAsyncThunk<LoginResponse, { login: string; password: string }>(
  'auth/login',
  async ({ login, password }, { dispatch }) => {
    try {
      const requestData = { auth: { login, password } };
      console.log('DEBUG: Login request data:', JSON.stringify(requestData, null, 2));
      console.log('DEBUG: Using direct axios call with cookies support');
      
      // Используем чистый axios для авторизации с поддержкой куки
      const API_URL = `${config.API_URL}${config.API_PREFIX}`;
      console.log('DEBUG: API_URL =', API_URL);
      
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/login`, 
        requestData,
        { 
          withCredentials: true, // Важно для HttpOnly куки
          headers: { 'Content-Type': 'application/json' }
        }
      );
   
      console.log('Login response:', JSON.stringify(response.data, null, 2));
      
      const { tokens, user } = response.data;
      
      // Объединяем данные пользователя с данными роли (partner, operator, client)
      const enhancedUser = {
        ...user,
        role: user.role ? mapRoleToEnum(user.role) : UserRole.ADMIN,
        // Добавляем данные партнера, если они есть
        partner: response.data.partner || user.partner,
        // Добавляем данные оператора, если они есть  
        operator: response.data.operator || user.operator,
        // Добавляем данные клиента, если они есть
        client: response.data.client || user.client
      };
      
      console.log('Login: Расширенные данные пользователя:', {
        email: enhancedUser.email,
        role: enhancedUser.role,
        partner: enhancedUser.partner,
        operator: enhancedUser.operator,
        client: enhancedUser.client
      });
      
      // ✅ Очищаем кэш RTK Query при входе чтобы убрать данные предыдущего пользователя
      clearAllCacheData(dispatch);
      
      return {
        tokens,
        user: enhancedUser
      };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  try {
    console.log('DEBUG: Sending logout request with cookies support');
    const API_URL = `${config.API_URL}${config.API_PREFIX}`;
    
    // Используем чистый axios для выхода с поддержкой куки
    await axios.post(
      `${API_URL}/auth/logout`,
      {},
      { 
        withCredentials: true, // Важно для HttpOnly куки
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('DEBUG: Logout successful');
    
    // ✅ Очищаем кэш RTK Query после успешного выхода
    clearAllCacheData(dispatch);
    
    return;
  } catch (error: any) {
    // Игнорируем ошибки 401 - пользователь уже не авторизован
    if (error.response?.status === 401) {
      console.log('DEBUG: User already logged out (401), proceeding with local logout');
      // Все равно очищаем кэш даже при ошибке 401
      clearAllCacheData(dispatch);
      return;
    }
    console.error('Logout error:', error);
    return;
  }
});

export const refreshAuthTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { rejectWithValue }) => {
    try {
      console.log('DEBUG: Обновляем токены через refresh endpoint');
      const API_URL = `${config.API_URL}${config.API_PREFIX}`;
      
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { 
          withCredentials: true, // Важно для HttpOnly куки
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Не удалось обновить токены');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data.user || response.data;
      
      // Объединяем данные пользователя с данными роли (partner, operator, client)
      const enhancedUser = {
        ...userData,
        role: userData.role ? mapRoleToEnum(userData.role) : UserRole.ADMIN,
        // Добавляем данные партнера, если они есть
        partner: response.data.partner || userData.partner,
        // Добавляем данные оператора, если они есть
        operator: response.data.operator || userData.operator,
        // Добавляем данные клиента, если они есть
        client: response.data.client || userData.client
      };
      
      console.log('getCurrentUser: Расширенные данные пользователя:', {
        email: enhancedUser.email,
        role: enhancedUser.role,
        partner: enhancedUser.partner,
        operator: enhancedUser.operator,
        client: enhancedUser.client
      });
      
      // Если в ответе есть токены (например, после refresh), возвращаем их тоже
      if (response.data.tokens) {
        return {
          user: enhancedUser,
          tokens: response.data.tokens
        };
      }
      
      return enhancedUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Не удалось получить данные пользователя');
    }
  }
);

export const { setCredentials, logout, setInitialized, updateAccessToken, clearLogoutFlag } = authSlice.actions;

// Селектор для получения текущего пользователя
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
