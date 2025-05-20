import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, UserRole } from '../../types';
import { usersApi, authApi } from '../../api';

// Константа для ключа хранилища
const STORAGE_KEY = 'tvoya_shina_token';

// Начальное состояние
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEY),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY),
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
        return loginData;
      }
      
      // Если используется обычный вызов через Redux, вызываем API
      const { email, password } = loginData;
      const response = await usersApi.login({ email, password });
      localStorage.setItem(STORAGE_KEY, response.data.auth_token);
      return response.data;
    } catch (error: any) {
      console.error('Login thunk - error:', error);
      return rejectWithValue(error.response?.data?.error || 'Неверный email или пароль');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('getCurrentUser - token from localStorage:', localStorage.getItem(STORAGE_KEY));
      console.log('getCurrentUser - making API request to /users/me');
      const response = await authApi.getCurrentUser();
      console.log('getCurrentUser - success response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('getCurrentUser - error details:', error);
      if (error.response) {
        console.error('getCurrentUser - error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('getCurrentUser - no response received:', error.request);
      } else {
        console.error('getCurrentUser - error message:', error.message);
      }
      return rejectWithValue(error.response?.data?.error || 'Ошибка получения пользователя');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось выйти из системы');
    }
  }
);

// Редьюсер
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ auth_token: string; user: User }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.auth_token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        // Получаем данные пользователя
        const userData = action.payload;
        
        // Если email admin@example.com, устанавливаем недостающие данные
        if (userData && userData.email === 'admin@example.com') {
          userData.first_name = userData.first_name || 'Тест';
          userData.last_name = userData.last_name || 'Адмін';
          userData.phone = userData.phone || '+380 67 111 00 00';
          
          // Преобразование ролей больше не требуется, так как 
          // значения в enum UserRole теперь соответствуют API
        }
        
        state.user = userData;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработка logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 