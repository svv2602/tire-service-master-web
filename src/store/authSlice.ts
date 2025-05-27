import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../types/models';

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
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка авторизации');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.auth_token);
    return data;
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${state.auth.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Ошибка получения данных пользователя');
    }
    
    const data = await response.json();
    return data;
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
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
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
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка получения данных пользователя';
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export const authReducer = authSlice.reducer; 