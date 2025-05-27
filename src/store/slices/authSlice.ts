import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/api';
import { User } from '../../types/user';

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
  token: localStorage.getItem(STORAGE_KEY),
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY) && !!getStoredUser(),
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
      localStorage.setItem(STORAGE_KEY, token);
      setStoredUser(user);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
      localStorage.removeItem(STORAGE_KEY);
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
        // Сохраняем данные пользователя в localStorage
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
        // Не изменяем isAuthenticated и token здесь - они должны устанавливаться через setCredentials
        state.error = null;
        // Сохраняем обновленные данные пользователя
        setStoredUser(action.payload);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.isInitialized = true;
        // Очищаем данные при ошибке
        localStorage.removeItem(STORAGE_KEY);
        setStoredUser(null);
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
      localStorage.setItem(STORAGE_KEY, response.data.auth_token);
      
      // Приведение возвращаемого пользователя к типу User
      const user: User = {
        id: response.data.user.id.toString(),
        email: response.data.user.email,
        first_name: response.data.user.first_name || '',
        last_name: response.data.user.last_name || '',
        role: response.data.user.role,
        is_active: response.data.user.is_active || true,
        email_verified: response.data.user.email_verified || false,
        phone_verified: response.data.user.phone_verified || false
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
      localStorage.removeItem(STORAGE_KEY);
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
      const response = await apiClient.get('/api/v1/users/me');
      
      // Приведение возвращаемого пользователя к типу User
      const user: User = {
        id: response.data.id.toString(),
        email: response.data.email,
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        role: response.data.role,
        is_active: response.data.is_active || true,
        email_verified: response.data.email_verified || false,
        phone_verified: response.data.phone_verified || false,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      };
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения данных пользователя');
    }
  }
);

// Экспортируем actions и reducer
export const { setCredentials, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;