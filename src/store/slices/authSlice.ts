import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersApi } from '../../api/api';
import { User } from '../../types';

const STORAGE_KEY = 'tvoya_shina_token';

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
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY), // Берем состояние из localStorage при инициализации
  loading: false,
  error: null,
};

// Асинхронные экшены
export const login = createAsyncThunk(
  'auth/login',
  async (loginData: any, { rejectWithValue }) => {
    try {
      console.log('Login thunk - received data:', loginData);
      // Если используются прямой API вызов, то loginData уже содержит данные ответа
      if (loginData.auth_token) {
        console.log('Login thunk - using provided token data');
        localStorage.setItem(STORAGE_KEY, loginData.auth_token);
        return loginData;
      }
      
      // Если используется обычный вызов через Redux, вызываем API
      const { email, password } = loginData;
      console.log('Login thunk - calling API with email:', email);
      
      const response = await usersApi.login({ email, password });
      console.log('Login thunk - API response:', response.data);
      
      if (response.data && response.data.auth_token) {
        localStorage.setItem(STORAGE_KEY, response.data.auth_token);
        console.log('Token saved to localStorage:', response.data.auth_token);
        return response.data;
      } else {
        console.error('Login thunk - Invalid response format, no auth_token found');
        return rejectWithValue('Неверный формат ответа от сервера');
      }
    } catch (error: any) {
      console.error('Login thunk - Error:', error);
      return rejectWithValue(error.response?.data?.error || 'Ошибка авторизации');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem(STORAGE_KEY);
    // Не делаем запрос к API для логаута, так как это JWT и токен валидируется на сервере
    return true;
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Проверка наличия токена в localStorage
      const token = localStorage.getItem(STORAGE_KEY);
      if (!token) {
        console.log('No token found in localStorage');
        return rejectWithValue('Не авторизован');
      }
      
      console.log('getCurrentUser thunk - token exists, getting user data');
      const response = await usersApi.getCurrentUser();
      console.log('getCurrentUser thunk - API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('getCurrentUser thunk - Error:', error);
      // При ошибке авторизации удаляем токен
      if (error.response && error.response.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
      }
      return rejectWithValue(error.response?.data?.error || 'Ошибка получения данных пользователя');
    }
  }
);

// Редьюсер
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
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
        state.isAuthenticated = true;
        // Пользовательские данные получаем отдельным запросом
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload as string : 'Ошибка авторизации';
        state.isAuthenticated = false;
      })
      
      // Обработка logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
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
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload as string : 'Ошибка получения данных пользователя';
        // Если произошла ошибка при получении пользователя, 
        // считаем что пользователь не авторизован
        state.isAuthenticated = false;
        state.token = null;
      });
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer; 