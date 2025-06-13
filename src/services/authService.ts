import { Dispatch } from '@reduxjs/toolkit';
import { logout } from '../store/slices/authSlice';

// Функция для обработки выхода из системы
export const handleLogout = (dispatch: Dispatch) => {
  dispatch(logout());
};

// Функция для обновления токена
export const refreshTokens = async (apiClient: any, refreshToken: string) => {
  const response = await apiClient.post('/api/v1/auth/refresh', null, {
    headers: {
      'Refresh-Token': refreshToken
    }
  });
  return response.data;
}; 