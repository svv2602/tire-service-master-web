import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/api';
import { User } from '../../types/user';
import { AuthState, LoginResponse } from '../../types/auth';
import { UserRole } from '../../types';
import axios from 'axios';
import config from '../../config';

/**
 * authSlice для cookie-based аутентификации
 * Пользователи и токены управляются только через Redux состояние
 * Refresh токены хранятся в HttpOnly куки на сервере
 */

// Начальное состояние (без localStorage)
const initialState: AuthState = {
  accessToken: null, // Токен будет получен из API при инициализации
  refreshToken: null, // Refresh токен в HttpOnly cookies
  user: null, // Пользователь будет получен из API при инициализации
  isAuthenticated: false, // Будет определено при инициализации через API
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
      action: PayloadAction<{ accessToken: string | null; user: User }>
    ) => {
      const { accessToken, user } = action.payload;
      state.accessToken = accessToken;
      state.user = user;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
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
          console.log('AuthSlice: Access токен обновлен');
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
  async ({ login, password }) => {
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
      
      return {
        tokens,
        user: {
          ...user,
          role: user.role ? mapRoleToEnum(user.role) : UserRole.ADMIN
        }
      };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
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
