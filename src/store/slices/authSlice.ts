import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/api';
import { User } from '../../types/user';
import authService from '../../services/authService';

import config from '../../config';

const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;
const USER_STORAGE_KEY = 'tvoya_shina_user';

// Функции для работы с localStorage
const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Ошибка при чтении данных пользователя из localStorage:', error);
    return null;
  }
};

const setStoredUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Ошибка при сохранении данных пользователя в localStorage:', error);
  }
};

// Типы
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean; // Флаг для отслеживания инициализации
}

// Начальное состояние
const initialState: AuthState = {
  token: authService.getToken(),
  user: getStoredUser(),
  isAuthenticated: authService.isAuthenticated() && !!getStoredUser(),
  loading: false,
  error: null,
  isInitialized: false, // Всегда начинаем с false, инициализация происходит в AuthInitializer
};

// Устанавливаем заголовок Authorization если есть токен при инициализации
const storedToken = localStorage.getItem(STORAGE_KEY);
if (storedToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// Создаем slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.isInitialized = true;
      authService.setToken(token);
      setStoredUser(user);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
      authService.setToken(null);
      setStoredUser(null);
      // Очищаем также заголовок Authorization
      delete apiClient.defaults.headers.common['Authorization'];
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.auth_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
        authService.setToken(action.payload.auth_token);
        setStoredUser(action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })
      
      // Обработка logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = true;
        authService.setToken(null);
        setStoredUser(null);
        // Очищаем заголовок Authorization
        delete apiClient.defaults.headers.common['Authorization'];
      })
      
      // Обработка getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        setStoredUser(action.payload);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.isInitialized = true;
        authService.setToken(null);
        setStoredUser(null);
        // Очищаем данные при ошибке
        localStorage.removeItem(STORAGE_KEY);
        delete apiClient.defaults.headers.common['Authorization'];
      });
  },
});

// Создаем асинхронные thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/v1/auth/login', { auth: { email, password }});
      
      // Приведение возвращаемого пользователя к типу User
      const user: User = {
        id: response.data.user.id.toString(),
        email: response.data.user.email,
        phone: response.data.user.phone || '',
        first_name: response.data.user.first_name || '',
        last_name: response.data.user.last_name || '',
        role: response.data.user.role,
        is_active: response.data.user.is_active,
        email_verified: response.data.user.email_verified,
        phone_verified: response.data.user.phone_verified,
        created_at: response.data.user.created_at || new Date().toISOString(),
        updated_at: response.data.user.updated_at || new Date().toISOString()
      };
      
      return {
        auth_token: response.data.auth_token,
        user
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка авторизации');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/api/v1/auth/logout');
      return {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка выхода');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/v1/users/current');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения данных пользователя');
    }
  }
);

// Экспортируем actions и reducer
export const { setCredentials, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;