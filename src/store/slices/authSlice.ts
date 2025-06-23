import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/api';
import { User } from '../../types/user';
import { AuthState, LoginResponse } from '../../types/auth';
import { UserRole } from '../../types';
import axios from 'axios';
import config from '../../config';

/**
 * authSlice для cookie-based аутентификации
 * Пользователи и токены управляются через Redux состояние и localStorage
 * Refresh токены хранятся в HttpOnly куки на сервере
 */

// Начальное состояние (проверяем localStorage при инициализации)
const initialState: AuthState = {
  accessToken: localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY), // Проверяем localStorage при инициализации
  refreshToken: null, // Refresh токен в HttpOnly cookies
  user: null, // Пользователь будет получен из API при инициализации
  isAuthenticated: !!localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY), // Считаем аутентифицированным если есть токен
  loading: false,
  error: null,
  isInitialized: false,
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
      action: PayloadAction<{ accessToken: string; user: User }>
    ) => {
      const { accessToken, user } = action.payload;
      state.accessToken = accessToken;
      state.user = user;
      state.isAuthenticated = true;
      state.isInitialized = true;
      
      // Сохраняем токен в localStorage для сохранения сессии при обновлении страницы
      localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, accessToken);
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
      
      // Очищаем токен из localStorage при выходе
      localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      // При обновлении access токена пользователь остается аутентифицированным
      if (state.user) {
        state.isAuthenticated = true;
      }
      
      // Сохраняем обновленный токен в localStorage
      localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, action.payload);
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
        state.accessToken = action.payload.tokens.access;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
        
        // Сохраняем токен в localStorage для сохранения сессии при обновлении страницы
        localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, action.payload.tokens.access);
        
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
        
        // Очищаем localStorage при выходе
        localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
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
          
          // Сохраняем обновленный токен в localStorage для сохранения сессии
          localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, newToken);
          
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
          
          // Сохраняем токен в localStorage
          localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, action.payload.tokens.access);
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
export const login = createAsyncThunk<LoginResponse, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }) => {
    try {
      console.log('Sending login request:', { email, password: '***' });
      console.log('DEBUG: Using direct axios call with cookies support');
      
      // Используем чистый axios для авторизации с поддержкой куки
      const API_URL = `${config.API_URL}${config.API_PREFIX}`;
      console.log('DEBUG: API_URL =', API_URL);
      
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/login`, 
        { auth: { login: email, password } }, // Исправляем формат для API
        { 
          withCredentials: true, // Важно для HttpOnly куки
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('Login response:', JSON.stringify(response.data, null, 2));
      
      const { tokens, user } = response.data;
      
      return {
        tokens,
        user: {
          ...user,
          role: user.role ? mapRoleToEnum(user.role) : UserRole.ADMIN
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
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
    return;
  } catch (error) {
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
      
      // Возвращаем данные пользователя с правильной ролью
      const user = {
        ...userData,
        role: userData.role ? mapRoleToEnum(userData.role) : UserRole.ADMIN
      };
      
      // Если в ответе есть токены (например, после refresh), возвращаем их тоже
      if (response.data.tokens) {
        return {
          user,
          tokens: response.data.tokens
        };
      }
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Не удалось получить данные пользователя');
    }
  }
);

export const { setCredentials, logout, setInitialized, updateAccessToken } = authSlice.actions;

// Селектор для получения текущего пользователя
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
