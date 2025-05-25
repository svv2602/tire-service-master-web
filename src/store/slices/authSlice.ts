import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/api';
import apiClient from '../../api/api';
import { User } from '../../types';

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

// Интерфейс для состояния авторизации
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean; // Флаг для отслеживания инициализации
}

// Начальное состояние с восстановлением данных из localStorage
const storedToken = localStorage.getItem(STORAGE_KEY);
const storedUser = getStoredUser();

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedToken && storedUser),
  loading: false,
  error: null,
  isInitialized: !!storedToken, // Если есть токен, считаем инициализированным
};

// Асинхронные экшены
export const login = createAsyncThunk(
  'auth/login',
  async (loginData: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Login thunk - calling API with email:', loginData.email);
      
      const response = await authApi.login(loginData);
      console.log('Login thunk - API response:', response);

      if (!response) {
        throw new Error('Empty response from server');
      }

      // Extract token and ensure proper format
      const token = response.auth_token || response.token;
      if (!token) {
        throw new Error('No token in response');
      }

      // Format token and save it
      const formattedToken = token.replace(/^Bearer\s+/i, '').trim();
      localStorage.setItem(STORAGE_KEY, formattedToken);
      console.log('Token saved to localStorage:', formattedToken);

      // Update axios defaults
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${formattedToken}`;
      
      if (!response.user) {
        throw new Error('No user data in response');
      }

      return {
        auth_token: formattedToken,
        token: formattedToken,
        user: response.user,
        message: 'Login successful'
      };
    } catch (error: any) {
      console.error('Login thunk - Error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Login failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Clear stored credentials
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPassword');
      return true;
    } catch (error: any) {
      console.error('Logout error:', error);
      return rejectWithValue('Ошибка при выходе из системы');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(STORAGE_KEY);
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error: any) {
      console.error('getCurrentUser error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
      }
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Ошибка получения данных пользователя'
      );
    }
  }
);

// Редьюсер
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      localStorage.setItem(STORAGE_KEY, token);
      setStoredUser(user);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
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
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
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

export const { setCredentials, clearAuth, setInitialized } = authSlice.actions;
export default authSlice.reducer;