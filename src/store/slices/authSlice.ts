import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/api';
import { User } from '../../types/user';
import { AuthState, LoginResponse } from '../../types/auth';
import { UserRole } from '../../types';
import axios from 'axios';
import config from '../../config';

const USER_STORAGE_KEY = 'tvoya_shina_user';

// Функции для работы с localStorage только для пользователя
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

// Начальное состояние
const initialState: AuthState = {
  accessToken: null, // Токен теперь не хранится в localStorage
  refreshToken: null, // Refresh токен теперь не хранится в localStorage
  user: getStoredUser(),
  isAuthenticated: false, // Будет определяться при первом запросе к API
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
      setStoredUser(user);
      // При cookie-based аутентификации не устанавливаем Bearer токены в заголовки
      // Refresh токен автоматически передается через cookies
    },
          logout: (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = true;
        setStoredUser(null);
        // При cookie-based аутентификации не нужно очищать Bearer токены из заголовков
        // Refresh токен автоматически очищается через cookies на сервере
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
        state.accessToken = action.payload.tokens.access;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
        
        console.log('Auth: login.fulfilled - state updated:', {
          isAuthenticated: state.isAuthenticated,
          hasToken: !!state.accessToken,
          hasUser: !!state.user
        });
        
        setStoredUser(action.payload.user);
        
        // При cookie-based аутентификации не устанавливаем Bearer токены в заголовки
        // Refresh токен автоматически сохраняется через cookies на сервере
        console.log('Auth: login.fulfilled - используем cookie-based аутентификацию');
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
        setStoredUser(null);
        // При cookie-based аутентификации не нужно очищать Bearer токены из заголовков
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
        state.isAuthenticated = true; // Если получили пользователя, значит аутентифицированы
        setStoredUser(action.payload);
        console.log('User role after getCurrentUser:', action.payload.role);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.isInitialized = true;
        setStoredUser(null);
        // При cookie-based аутентификации не нужно очищать Bearer токены из заголовков
      });
  },
});

// Создаем асинхронные thunks
export const login = createAsyncThunk<LoginResponse, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }) => {
    try {
      console.log('Sending login request:', { email, password: '***' });
      console.log('DEBUG: Using direct axios call to avoid double-click issue');
      
      // Используем чистый axios без интерцепторов для авторизации
      // чтобы избежать проблемы с двойным нажатием
      const API_URL = `${config.API_URL}${config.API_PREFIX}`;
      console.log('DEBUG: API_URL =', API_URL);
      
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/login`, 
        { email, password },
        { 
          withCredentials: true,
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
    console.log('DEBUG: Sending logout request with direct axios call');
    const API_URL = `${config.API_URL}${config.API_PREFIX}`;
    
    // Используем чистый axios без интерцепторов для выхода
    // так же как и для входа, чтобы избежать проблем с cookies
    await axios.post(
      `${API_URL}/auth/logout`,
      {},
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('DEBUG: Logout successful, removing local storage items');
    localStorage.removeItem(USER_STORAGE_KEY);
    
    return;
  } catch (error) {
    console.error('Logout error:', error);
    // Даже если запрос не удался, очищаем локальное хранилище
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
});

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data.user;
      
      return {
        ...userData,
        role: userData.role ? mapRoleToEnum(userData.role) : UserRole.ADMIN
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Не удалось получить данные пользователя');
    }
  }
);

export const { setCredentials, logout, setInitialized, updateAccessToken } = authSlice.actions;

// Селектор для получения текущего пользователя
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;