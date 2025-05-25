import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/api';
import apiClient from '../../api/api';
import { User } from '../../types';

import config from '../../config';

const STORAGE_KEY = config.AUTH_TOKEN_STORAGE_KEY;

// Интерфейс для состояния авторизации
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEY) || null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY),
  loading: false,
  error: null,
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
      localStorage.setItem(STORAGE_KEY, token);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(STORAGE_KEY);
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Обработка logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
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
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
      });
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;