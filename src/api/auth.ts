import { AxiosResponse } from 'axios';
import apiClient from './api';
import { ApiResponse } from '../types/api';
import { User } from '../types/models';
import { LoginRequest, RegisterRequest } from '../types/api-requests';
import { TokenResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    try {
      console.log('Отправка запроса на логин:', credentials.email);
      
      // Исправляем структуру данных согласно бэкенду
      const authData = {
        auth: {
          email: credentials.email,
          password: credentials.password
        }
      };
      
      // Исправляем эндпоинт - добавляем /api/v1
      const response = await apiClient.post<TokenResponse>('/api/v1/auth/login', authData);
      console.log('Получен ответ от API:', response);
      console.log('Данные ответа:', response.data);
      
      if (!response.data) {
        throw new Error('Пустой ответ от сервера');
      }
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при выполнении запроса login:', error);
      throw error;
    }
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/api/v1/clients/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Исправляем эндпоинт - добавляем /api/v1
      await apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    // Исправляем эндпоинт - добавляем /api/v1
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/users/me');
    return response.data;
  }
}; 