import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../types/models';
import config from '../config';
import { apiClient } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY),
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.post(`${config.API_PREFIX}/auth/login`, {
        email: credentials.email,
        password: credentials.password
      });
      
      const { auth_token, user } = response.data;
      localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, auth_token);
      return { auth_token, user };
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Ошибка авторизации');
      }
      throw error;
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    try {
      const response = await apiClient.get(`${config.API_PREFIX}/users/me`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Ошибка получения данных пользователя');
      }
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      
      localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem('tvoya_shina_user');
      localStorage.removeItem('tvoya_shina_refresh_token');
      
      delete apiClient.defaults.headers.common['Authorization'];
      
      console.log('AuthSlice: Выход выполнен, все данные очищены');
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка авторизации';
        state.isInitialized = true;
      })
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
        
        // Сохраняем данные пользователя в localStorage для синхронизации
        localStorage.setItem('tvoya_shina_user', JSON.stringify(action.payload));
        console.log('AuthSlice: Данные пользователя сохранены в localStorage');
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка получения данных пользователя';
        state.isAuthenticated = false;
        state.token = null;
        state.isInitialized = true;
        localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
      });
  },
});

export const { logout, clearError, setInitialized } = authSlice.actions;
export const authReducer = authSlice.reducer;
export default authSlice.reducer; 